import {
  Company,
  CompanyAcquisition,
  PersonEmployment,
} from "@hgraph/precedent-iso";
import { sql } from "slonik";
import { beforeEach, expect, test } from "vitest";

import { PsqlCompanyAcquistionWriter } from "../company-acquistion-store";
import { PsqlCompanyWriter } from "../company-writer";
import { dataBasePool } from "../data-base-pool";
import { PsqlPersonEmploymentStore } from "../person-employment-store";
import { TEST_SETTINGS } from "./test-settings";
import { createSession } from "../neo4j";

async function setup() {
  const pool = await dataBasePool(TEST_SETTINGS.sqlUri);
  const session = await createSession(TEST_SETTINGS.neo);
  const sqlCompanyWriter = new PsqlCompanyWriter(pool);
  const companyAcquisitionStore = new PsqlCompanyAcquistionWriter(pool);
  const personEmploymentStore = new PsqlPersonEmploymentStore(pool);

  return {
    pool,
    session,
    sqlCompanyWriter,
    companyAcquisitionStore,
    personEmploymentStore,
  };
}

beforeEach(async () => {
  const { pool, session } = await setup();

  await pool.query(sql.unsafe`TRUNCATE TABLE company CASCADE`);
  await session.executeWrite((trx) => {
    trx.run("MATCH (n) DETACH DELETE n");
  });
});

test("CompanyWriter#upsertmany works for the empty case", async () => {
  const { sqlCompanyWriter } = await setup();

  expect(await sqlCompanyWriter.upsertMany([])).toEqual([]);
});

test("CompanyWriter#upsertMany works for a simple case", async () => {
  const { sqlCompanyWriter } = await setup();
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

  expect(await sqlCompanyWriter.upsertMany(companies)).toEqual([
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

test("CompanyAcquisitionStore#upsertmany works for the empty case", async () => {
  const { companyAcquisitionStore } = await setup();

  expect(await companyAcquisitionStore.upsertMany([])).toEqual([]);
});

test("CompanyWriter#upsertMany works for a simple case", async () => {
  const { companyAcquisitionStore } = await setup();
  const acqs: CompanyAcquisition[] = [
    {
      acquiredCompanyId: 1,
      parentCompanyId: 2,
      mergedIntoParentCompany: true,
    },
    {
      acquiredCompanyId: 3,
      parentCompanyId: 4,
      mergedIntoParentCompany: false,
    },
  ];

  expect(await companyAcquisitionStore.upsertMany(acqs)).toEqual([
    {
      acquiredCompanyId: 1,
      parentCompanyId: 2,
      mergedIntoParentCompany: true,
    },
    {
      acquiredCompanyId: 3,
      parentCompanyId: 4,
      mergedIntoParentCompany: false,
    },
  ]);
});

test("CompanyWriter#upsertMany prevents basic cycles", async () => {
  const { companyAcquisitionStore } = await setup();
  const acqs: CompanyAcquisition[] = [
    {
      acquiredCompanyId: 1,
      parentCompanyId: 2,
      mergedIntoParentCompany: true,
    },
    {
      acquiredCompanyId: 2,
      parentCompanyId: 1,
      mergedIntoParentCompany: false,
    },
  ];

  await expect(companyAcquisitionStore.upsertMany(acqs)).rejects.toThrow();
});

test("PersonEmploymentStore#upsertmany works for the empty case", async () => {
  const { personEmploymentStore } = await setup();

  expect(await personEmploymentStore.upsertMany([])).toEqual([]);
});

test("PersonEmploymentStore#upsertmany works for a simple case", async () => {
  const { personEmploymentStore } = await setup();

  const startDate = new Date("December 17, 1995");
  const endDate = new Date("December 17, 2020");
  const acqs: PersonEmployment[] = [
    {
      companyId: 1,
      personId: 2,
      employmentTitle: "Doctor",
      status: {
        type: "current_employee",
        startDate,
      },
    },
    {
      companyId: 3,
      personId: 4,
      employmentTitle: "Doctor",
      status: {
        type: "left_company",
        startDate,
        endDate,
      },
    },
  ];

  expect(await personEmploymentStore.upsertMany(acqs)).toEqual([
    {
      companyId: 1,
      personId: 2,
      employmentTitle: "Doctor",
      status: {
        type: "current_employee",
        startDate,
      },
    },
    {
      companyId: 3,
      personId: 4,
      employmentTitle: "Doctor",
      status: {
        type: "left_company",
        startDate,
        endDate,
      },
    },
  ]);
});
