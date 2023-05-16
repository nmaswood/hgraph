import { DatabasePool, DatabaseTransactionConnection, sql } from "slonik";
import { z } from "zod";

export interface Facets {
  companyIds: number[];
  personIds: number[];
}
export interface FacetService {
  getFacets(): Promise<Facets>;
}

export class PsqlFacetService implements FacetService {
  constructor(private readonly pool: DatabasePool) {}

  async getFacets(): Promise<Facets> {
    return this.pool.connect(async (cnx) =>
      cnx.transaction((trx) => this.#getFacets(trx))
    );
  }
  async #getFacets(trx: DatabaseTransactionConnection): Promise<Facets> {
    const companies = await trx.query(
      sql.type(
        ZRow
      )`SELECT distinct company_id as value from company WHERE company_id is NOT NULL`
    );

    const people = await trx.query(
      sql.type(
        ZRow
      )`SELECT distinct person_id as value from person_employment WHERE person_id is NOT NULL`
    );

    return {
      companyIds: companies.rows.map((r) => r.value).sort(),
      personIds: people.rows.map((r) => r.value).sort(),
    };
  }
}

const ZRow = z.object({
  value: z.number(),
});
