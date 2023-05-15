import { PersonEmployment, ZPersonEmployment } from "@hgraph/precedent-iso";
import { DatabasePool, DatabasePoolConnection, sql } from "slonik";

export interface PersonEmploymentStore {
  upsertMany(pes: PersonEmployment[]): Promise<PersonEmployment[]>;
}

const FIELDS = sql.fragment`company_id, person_id, processed_employment_title  as employment_title, DATE(start_date) as start_date, DATE(end_date) as end_date`;

export class PsqlPersonEmploymentStore implements PersonEmploymentStore {
  constructor(private readonly pool: DatabasePool) {}

  async upsertMany(pes: PersonEmployment[]): Promise<PersonEmployment[]> {
    if (pes.length === 0) {
      return [];
    }
    return this.pool.connect(async (cnx) => this.#upsertMany(cnx, pes));
  }

  async #upsertMany(
    cnx: DatabasePoolConnection,
    pes: PersonEmployment[]
  ): Promise<PersonEmployment[]> {
    const companyValues = pes.map(
      (pe) =>
        sql.fragment`(${pe.personId}, ${pe.companyId},
                      ${pe.employmentTitle},
                      ${processTitle(pe.employmentTitle)},
                      
                      ${sql.date(pe.status.startDate)},
                      ${
                        pe.status.type === "left_company"
                          ? sql.date(pe.status.endDate)
                          : null
                      }
                     )`
    );

    const result = await cnx.query(
      sql.type(ZPersonEmployment)`
INSERT INTO person_employment(person_id, company_id, raw_employment_title,  processed_employment_title, start_date, end_date)
VALUES
${sql.join(companyValues, sql.fragment`, `)}
ON CONFLICT (person_id, company_id) DO UPDATE
SET
raw_employment_title = EXCLUDED.raw_employment_title,
processed_employment_title = EXCLUDED.processed_employment_title,
start_date = EXCLUDED.start_date,
end_date = EXCLUDED.end_date
RETURNING ${FIELDS}
`
    );

    return Array.from(result.rows).sort(
      (a, b) => a.companyId - b.companyId || a.personId - b.personId
    );
  }
}

function processTitle(name: string): string {
  return name.trim();
}
