//- What companies are ***related*** to `Microsoft`?
//- What company ***acquired*** `Lynda`?
//- Are there any ***ex-LinkedIn employees*** at `Microsoft`?
//- Who is ***currently*** working at `Microsoft`?

export type CypherQuery = string & { __type: "CypherQuery" };

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CypherQuery {
  export const of = (s: string): CypherQuery => s as CypherQuery;
}
export type Query = PersonQuery | CompanyQuery;

export type CompanyQuery = {
  type: "company";
  id: number;
  relationship: "ANY" | "ACQUIRED" | "MERGED_INTO";
};

export type PersonQuery = {
  type: "person";
  id: number;
  relationship: "ANY" | "WORKED_AT" | "WORKS_AT";
};

//- What companies are ***related*** to `Microsoft`?
//- What company ***acquired*** `Lynda`?
//- Are there any ***ex-LinkedIn employees*** at `Microsoft`?
//- Who is ***currently*** working at `Microsoft`?
