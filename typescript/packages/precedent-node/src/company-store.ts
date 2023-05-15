import { Company, ZCompanyModel } from "@hgraph/precedent-iso";
import { DatabasePool, DatabasePoolConnection, sql } from "slonik";

export interface CompanyStore {
  upsertMany(companies: Company[]): Promise<Company[]>;
}

const COMPANY_FIELDS = sql.fragment`company_id, processed_company_name as company_name, headcount`;

export class PsqlCompanyStore implements CompanyStore {
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
