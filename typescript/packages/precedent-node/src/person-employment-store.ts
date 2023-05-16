import {
  assertNever,
  PersonEmployment,
  PersonEmploymentDate,
  ZPersonEmployment,
} from "@hgraph/precedent-iso";
import { Driver } from "neo4j-driver";
import { DatabasePool, DatabasePoolConnection, sql } from "slonik";

export class DualPersonEmploymentWriter implements PersonEmploymentWriter {
  constructor(
    private readonly primary: PersonEmploymentWriter,
    private readonly secondary: PersonEmploymentWriter
  ) {}

  async upsertMany(pes: PersonEmployment[]): Promise<PersonEmployment[]> {
    const fromAcid = await this.primary.upsertMany(pes);
    await this.secondary.upsertMany(fromAcid);
    return fromAcid;
  }
}

export interface PersonEmploymentWriter {
  upsertMany(pes: PersonEmployment[]): Promise<PersonEmployment[]>;
}

const FIELDS = sql.fragment`company_id, person_id, processed_employment_title  as employment_title, DATE(start_date) as start_date, DATE(end_date) as end_date`;

export class PsqlPersonEmploymentWriter implements PersonEmploymentWriter {
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
    const companyValues = pes.map((pe) => {
      const { startDate, endDate } = PersonEmploymentDate.fromStatus(pe.status);
      return sql.fragment`(${pe.personId}, ${pe.companyId},
                      ${pe.employmentTitle},
                      ${processTitle(pe.employmentTitle)},
                      ${startDate ? sql.date(startDate) : null},
                      ${endDate ? sql.date(endDate) : null}

                     )`;
    });

    const result = await cnx.query(
      sql.type(ZPersonEmployment)`
INSERT INTO person_employment(person_id, company_id, raw_employment_title,  processed_employment_title, start_date, end_date)
VALUES
${sql.join(companyValues, sql.fragment`, `)}
ON CONFLICT (person_id, company_id, start_date, end_date) DO UPDATE
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

export class Neo4jPersonEmploymentWriter implements PersonEmploymentWriter {
  constructor(private readonly driver: Driver) {}

  async upsertMany(pes: PersonEmployment[]): Promise<PersonEmployment[]> {
    if (pes.length === 0) {
      return [];
    }

    const session = this.driver.session();

    try {
      await session.executeWrite(async (txc) => {
        for (const { companyId, personId, employmentTitle, status } of pes) {
          await txc.run(
            `MERGE(:Person{id: $personId, employmentTitle: $employmentTitle})`,
            {
              personId,
              employmentTitle,
            }
          );
          await txc.run(`MERGE(:Company{id: $companyId})`, {
            companyId,
          });

          switch (status.type) {
            case "current_employee":
              await txc.run(
                `MATCH (a:Company{id: $companyId}), (b:Person{id: $personId}) MERGE (b)-[r:WORKS_AT]->(a)
                SET r.start_date = $startDate, r.label = "WORKS_AT"
                `,
                {
                  companyId,
                  personId,
                  startDate: status.startDate.toISOString(),
                }
              );
              break;

            case "left_company":
              await txc.run(
                `MATCH (a:Company{id: $companyId}), (b:Person{id: $personId}) MERGE (b)-[r:WORKED_AT]->(a)
                SET r.start_date = $startDate, r.end_date = $endDate, r.label = "WORKED_AT"
                `,
                {
                  companyId,
                  personId,
                  startDate: status.startDate.toISOString(),
                  endDate: status.endDate.toISOString(),
                }
              );

              break;
            case "unknown":
              await txc.run(
                `MATCH (a:Company{id: $companyId}), (b:Person{id: $personId}) MERGE (b)-[r:WORKS_AT]->(a)
                  SET r.label = "WORKED_AT"
                `,
                {
                  companyId,
                  personId,
                  employmentTitle,
                }
              );
              break;
            default:
              assertNever(status);
          }
        }
      });
    } finally {
      await session.close();
    }

    return pes;
  }
}
