import { assertNever } from "@hgraph/precedent-iso";

import { CypherQuery,Query } from "./query";

export function toCypherQuery(queries: Query[]): CypherQuery {
  if (queries.length === 0) {
    return MATCH_ALL;
  }
  const predicates: string[] = [];

  let dummyVar = "A";
  function getDummyVar() {
    const v = dummyVar;
    dummyVar = `${dummyVar}A`;
    return v;
  }

  for (const query of queries) {
    switch (query.type) {
      case "person": {
        const predicate = () => {
          if (query.relationship === "ANY") {
            return `(Person{id: ${
              query.id
            }})<-[${getDummyVar()}]->(${getDummyVar()})`;
          }
          return `(Person{id: ${query.id}})<-[${getDummyVar()}:${
            query.relationship
          }]->(${getDummyVar()}: Company)`;
        };
        predicates.push(predicate());

        break;
      }
      case "company": {
        const predicate = () => {
          if (query.relationship === "ANY") {
            return `(Company{id: ${
              query.id
            }})<-[${getDummyVar()}]->(${getDummyVar()})`;
          }
          return `(Company{id: ${query.id}})<-[${getDummyVar()}:${
            query.relationship
          }]->(${getDummyVar()}: Company)`;
        };

        predicates.push(predicate());
        break;
      }
      default:
        assertNever(query);
    }
  }

  return CypherQuery.of(`MATCH ${predicates.join(",")} RETURN *`);
}

const MATCH_ALL = CypherQuery.of(
  `MATCH (n) OPTIONAL MATCH (n)-[r]-() RETURN n, r`
);
