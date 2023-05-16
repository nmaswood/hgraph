import { assertNever, isNotNull } from "@hgraph/precedent-iso";

import { Query } from "./query";
import { SearchWidgetState } from "./search-widget-state";

export function toQueries(states: SearchWidgetState[]): Query[] {
  return states
    .map((state): Query | undefined => {
      switch (state.type) {
        case "company": {
          if (!state.companyId) {
            return undefined;
          }
          return {
            type: "company",
            id: Number(state.companyId),
            relationship: state.relationship
              ? (state.relationship as any)
              : "ANY",
          };
        }
        case "person": {
          if (!state.personId) {
            return undefined;
          }
          return {
            type: "person",
            id: Number(state.personId),
            relationship: state.relationship
              ? (state.relationship as any)
              : "ANY",
          };
        }
        default:
          assertNever(state);
      }
    })
    .filter(isNotNull);
}
