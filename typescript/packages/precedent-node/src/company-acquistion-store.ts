import { CompanyAcquisition, ZCompanyAcquisition } from "@hgraph/precedent-iso";
import { DatabasePool, DatabasePoolConnection, sql } from "slonik";
import { Session } from "neo4j-driver";

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
  constructor(private readonly session: Session) {}

  async upsertMany(acqs: CompanyAcquisition[]): Promise<CompanyAcquisition[]> {
    if (acqs.length === 0) {
      return [];
    }
    await this.session.executeWrite(async (txc) => {
      for (const {
        parentCompanyId,
        acquiredCompanyId,
        mergedIntoParentCompany,
      } of acqs) {
        await txc.run(
          "MATCH (a:Company{id: $parentCompanyId}), (b:Company{id: $acquiredCompanyId}) CREATE (a)-[:ACQUIRED]->(b)",
          {
            parentCompanyId,
            acquiredCompanyId,
          }
        );
        if (mergedIntoParentCompany) {
          await txc.run(
            "MATCH (a:Company{id: $parentCompanyId}), (b:Company{id: $acquiredCompanyId}) CREATE (b)-[:MERGED_INTO]->(a)",
            {
              parentCompanyId,
              acquiredCompanyId,
            }
          );
        }
      }
    });

    return acqs;
  }
}
