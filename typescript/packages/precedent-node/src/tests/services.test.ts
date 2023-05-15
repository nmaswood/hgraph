import { sql } from "slonik";
import { beforeEach, describe, test, expect, it } from "vitest";

import { dataBasePool } from "../data-base-pool";
import { TEST_SETTINGS } from "./test-settings";
import { PsqlCompanyStore } from "../company-store";
import { Company } from "@hgraph/precedent-iso";

async function setup() {
  const pool = await dataBasePool(TEST_SETTINGS.sqlUri);
  const companyStore = new PsqlCompanyStore(pool);

  return {
    pool,
    companyStore,
  };
}

beforeEach(async () => {
  const { pool } = await setup();

  await pool.query(sql.unsafe`TRUNCATE TABLE company CASCADE`);
});

it("upsert many works for the empty case", async () => {
  const { companyStore } = await setup();

  expect(await companyStore.upsertMany([])).toEqual([]);
});

test("upsertMany works for a simple case", async () => {
  const { companyStore } = await setup();
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

  expect(await companyStore.upsertMany(companies)).toEqual([
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
