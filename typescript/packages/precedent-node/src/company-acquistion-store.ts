import { CompanyAcquisition, ZCompanyAcquisition } from "@hgraph/precedent-iso";
import { DatabasePool, DatabasePoolConnection, sql } from "slonik";

export interface CompanyAcquisitionStore {
  upsertMany(companies: CompanyAcquisition[]): Promise<CompanyAcquisition[]>;
}

const FIELDS = sql.fragment`parent_company_id, acquired_company_id, merged_into_parent_company`;

export class PsqlCompanyAcquistionStore implements CompanyAcquisitionStore {
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
      (acq) =>
        sql.fragment`(${acq.parentCompanyId}, ${acq.acquiredCompanyId},
                      ${acq.mergedIntoParentCompany})`
    );

    const result = await cnx.query(
      sql.type(ZCompanyAcquisition)`
INSERT INTO company_acquisition (${FIELDS})
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
