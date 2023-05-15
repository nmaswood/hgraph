import { Company, ZCompanyModel } from "@hgraph/precedent-iso";
import { Driver } from "neo4j-driver";
import { DatabasePool, DatabasePoolConnection, sql } from "slonik";

export class DualCompanyWriter implements CompanyWriter {
  constructor(
    private readonly primary: CompanyWriter,
    private readonly secondary: CompanyWriter
  ) {}

  async upsertMany(companies: Company[]): Promise<Company[]> {
    const fromAcid = await this.primary.upsertMany(companies);
    await this.secondary.upsertMany(fromAcid);
    return fromAcid;
  }
}

export interface CompanyWriter {
  upsertMany(companies: Company[]): Promise<Company[]>;
}

const COMPANY_FIELDS = sql.fragment`company_id, processed_company_name as company_name, headcount`;

export class PsqlCompanyWriter implements CompanyWriter {
  constructor(private readonly pool: DatabasePool) {}

  async upsertMany(companies: Company[]): Promise<Company[]> {
    if (companies.length === 0) {
      return [];
    }
    return this.pool.connect(async (cnx) => this.#upsertMany(cnx, companies));
  }

  async #upsertMany(
    cnx: DatabasePoolConnection,
    companies: Company[]
  ): Promise<Company[]> {
    const companyValues = companies.map(
      (company) =>
        sql.fragment`(${company.companyId}, ${company.companyName},
                      ${processCompanyName(company.companyName)},
                      ${company.headcount ?? null})`
    );

    const result = await cnx.query(
      sql.type(ZCompanyModel)`
INSERT INTO company (company_id, raw_company_name, processed_company_name,  headcount)
VALUES
${sql.join(companyValues, sql.fragment`, `)}
ON CONFLICT (company_id) DO UPDATE
SET
raw_company_name = EXCLUDED.raw_company_name,
processed_company_name = EXCLUDED.processed_company_name
RETURNING ${COMPANY_FIELDS}
`
    );

    return Array.from(result.rows).sort((a, b) => a.companyId - b.companyId);
  }
}

function processCompanyName(name: string): string {
  return name.trim();
}

export class Neo4jCompanyWriter implements CompanyWriter {
  constructor(private readonly driver: Driver) {}

  async upsertMany(companies: Company[]): Promise<Company[]> {
    if (companies.length === 0) {
      return [];
    }
    const session = this.driver.session();
    try {
      await session.executeWrite(async (txc) => {
        for (const { companyId, companyName, headcount } of companies) {
          if (headcount) {
            await txc.run(
              `MERGE(:Company{id: $companyId, name: $companyName, headcount: $headcount})`,
              { companyId, companyName, headcount }
            );
          } else {
            await txc.run(
              `MERGE(:Company{id: $companyId, name: $companyName })`,
              { companyId, companyName }
            );
          }
        }
      });
    } finally {
      await session.close();
    }

    return companies;
  }
}
