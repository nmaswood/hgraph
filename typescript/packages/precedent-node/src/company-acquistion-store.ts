import { CompanyAcquisition, ZCompanyAcquisition } from "@hgraph/precedent-iso";
import { Driver } from "neo4j-driver";
import { DatabasePool, DatabasePoolConnection, sql } from "slonik";

export class DualCompanyAcquisitionWriter implements CompanyAcquisitionWriter {
  constructor(
    private readonly primary: CompanyAcquisitionWriter,
    private readonly secondary: CompanyAcquisitionWriter
  ) {}

  async upsertMany(pes: CompanyAcquisition[]): Promise<CompanyAcquisition[]> {
    const fromAcid = await this.primary.upsertMany(pes);
    await this.secondary.upsertMany(fromAcid);
    return fromAcid;
  }
}

export interface CompanyAcquisitionWriter {
  upsertMany(companies: CompanyAcquisition[]): Promise<CompanyAcquisition[]>;
}

const FIELDS = sql.fragment`parent_company_id, acquired_company_id, merged_into_parent_company`;

export class PsqlCompanyAcquistionWriter implements CompanyAcquisitionWriter {
  constructor(private readonly pool: DatabasePool) {}

  async upsertMany(acqs: CompanyAcquisition[]): Promise<CompanyAcquisition[]> {
    if (acqs.length === 0) {
      return [];
    }
    return this.pool.connect(async (cnx) => this.#upsertMany(cnx, acqs));
  }

  async #upsertMany(
    cnx: DatabasePoolConnection,
    acqs: CompanyAcquisition[]
  ): Promise<CompanyAcquisition[]> {
    const companyValues = acqs.map(
      ({ parentCompanyId, acquiredCompanyId, mergedIntoParentCompany }) => {
        const integrityToken = [parentCompanyId, acquiredCompanyId]
          .sort()
          .join("-");

        return sql.fragment`(${parentCompanyId}, ${acquiredCompanyId},
                      ${mergedIntoParentCompany},
                      ${integrityToken}

                          )`;
      }
    );

    const result = await cnx.query(
      sql.type(ZCompanyAcquisition)`
INSERT INTO company_acquisition (
parent_company_id, acquired_company_id, merged_into_parent_company, company_ids_integrity_token
)
VALUES
${sql.join(companyValues, sql.fragment`, `)}
ON CONFLICT (parent_company_id, acquired_company_id) DO UPDATE
SET
merged_into_parent_company = EXCLUDED.merged_into_parent_company
RETURNING ${FIELDS}
`
    );

    return Array.from(result.rows).sort(
      (a, b) =>
        a.parentCompanyId - b.parentCompanyId ||
        a.acquiredCompanyId - b.acquiredCompanyId
    );
  }
}

export class Neo4jCompanyAcquistionWriter implements CompanyAcquisitionWriter {
  constructor(private readonly driver: Driver) {}

  async upsertMany(acqs: CompanyAcquisition[]): Promise<CompanyAcquisition[]> {
    if (acqs.length === 0) {
      return [];
    }

    const session = this.driver.session();

    try {
      await session.executeWrite(async (txc) => {
        for (const {
          parentCompanyId,
          acquiredCompanyId,
          mergedIntoParentCompany,
        } of acqs) {
          await txc.run(
            `MATCH (a:Company{id: $parentCompanyId}), (b:Company{id: $acquiredCompanyId}) MERGE (a)-[r:ACQUIRED]->(b)
            SET r.label = "ACQUIRED"

            `,
            {
              parentCompanyId,
              acquiredCompanyId,
            }
          );
          if (mergedIntoParentCompany) {
            await txc.run(
              `MATCH (a:Company{id: $parentCompanyId}), (b:Company{id: $acquiredCompanyId}) MERGE (b)-[r:MERGED_INTO]->(a)
            SET r.label = "MERGED_INTO"
              `,
              {
                parentCompanyId,
                acquiredCompanyId,
              }
            );
          }
        }
      });
    } finally {
      await session.close();
    }

    return acqs;
  }
}
