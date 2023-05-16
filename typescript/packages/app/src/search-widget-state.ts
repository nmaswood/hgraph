import { assertNever } from "@hgraph/precedent-iso";
import React from "react";

export type SearchWidgetState = CompanySearchWidget | PersonSearchWidget;

export type CompanySearchWidget = {
  type: "company";
  companyId: string | undefined;
  relationship: string | undefined;
};

export type PersonSearchWidget = {
  type: "person";
  personId: string | undefined;
  relationship: string | undefined;
};

export const useManageWidgets = () => {
  const [widgets, setWidgets] = React.useState<SearchWidgetState[]>([]);

  return {
    widgets,
    setCompanyState: (index: number, state: CompanySearchWidget) => {
      const copy = [...widgets];
      copy[index] = state;
      setWidgets(copy);
    },
    setPersonState: (index: number, state: PersonSearchWidget) => {
      const copy = [...widgets];
      copy[index] = state;
      setWidgets(copy);
    },
    addWidget: (type: "company" | "person") => {
      switch (type) {
        case "company": {
          setWidgets((prev) => [
            ...prev,
            {
              type: "company",
              companyId: undefined,
              relationship: undefined,
            },
          ]);
          break;
        }
        case "person":
          setWidgets((prev) => [
            ...prev,
            {
              type: "person",
              personId: undefined,
              relationship: undefined,
            },
          ]);
          break;
        default:
          assertNever(type);
      }
    },
    clearWidgests: () => setWidgets([]),
  };
};
