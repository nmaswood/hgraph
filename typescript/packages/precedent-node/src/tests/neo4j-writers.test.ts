import {
  Company,
  CompanyAcquisition,
  PersonEmployment,
} from "@hgraph/precedent-iso";
import { sql } from "slonik";
import { beforeEach, expect, test } from "vitest";

import { PsqlCompanyAcquistionWriter } from "../company-acquistion-store";
import { Neo4jCompanyWriter, PsqlCompanyWriter } from "../company-writer";
import { dataBasePool } from "../data-base-pool";
import { PsqlPersonEmploymentStore } from "../person-employment-store";
import { TEST_SETTINGS } from "./test-settings";
import { createSession } from "../neo4j";

async function setup() {
  const session = await createSession(TEST_SETTINGS.neo);

  const neo4jCompanyWrtier = new Neo4jCompanyWriter(session);

  return {
    session,
    neo4jCompanyWrtier,
  };
}

beforeEach(async () => {
  const { session } = await setup();

  await session.executeWrite((trx) => {
    trx.run("MATCH (n) DETACH DELETE n");
  });
});

test("CompanyWriter#upsertMany works for a simple case", async () => {
  const { neo4jCompanyWrtier } = await setup();
  const companies: Company[] = [
    {
      companyId: 1,
      companyName: "Company 1",
      headcount: 100,
    },
    {
      companyId: 2,
      companyName: "Company 2 ",
      headcount: undefined,
    },
  ];

  expect(await neo4jCompanyWrtier.upsertMany(companies)).toEqual([
    {
      companyId: 1,
      companyName: "Company 1",
      headcount: 100,
    },
    {
      companyId: 2,
      companyName: "Company 2",
      headcount: undefined,
    },
  ]);
});
