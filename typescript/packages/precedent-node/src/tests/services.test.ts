import {
  Company,
  CompanyAcquisition,
  PersonEmployment,
} from "@hgraph/precedent-iso";
import { sql } from "slonik";
import { beforeEach, describe, expect, it, test } from "vitest";

import { PsqlCompanyAcquistionStore } from "../company-acquistion-store";
import { PsqlCompanyStore } from "../company-store";
import { dataBasePool } from "../data-base-pool";
import { PsqlPersonEmploymentStore } from "../person-employment-store";
import { TEST_SETTINGS } from "./test-settings";

async function setup() {
  const pool = await dataBasePool(TEST_SETTINGS.sqlUri);
  const companyStore = new PsqlCompanyStore(pool);
  const companyAcquisitionStore = new PsqlCompanyAcquistionStore(pool);
  const personEmploymentStore = new PsqlPersonEmploymentStore(pool);

  return {
    pool,
    companyStore,
    companyAcquisitionStore,
    personEmploymentStore,
  };
}

beforeEach(async () => {
  const { pool } = await setup();

  await pool.query(sql.unsafe`TRUNCATE TABLE company CASCADE`);
});

it("CompanyStore#upsertmany works for the empty case", async () => {
  const { companyStore } = await setup();

  expect(await companyStore.upsertMany([])).toEqual([]);
});

test("CompanyStore#upsertMany works for a simple case", async () => {
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

it("CompanyAcquisitionStore#upsertmany works for the empty case", async () => {
  const { companyAcquisitionStore } = await setup();

  expect(await companyAcquisitionStore.upsertMany([])).toEqual([]);
});

test("CompanyStore#upsertMany works for a simple case", async () => {
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

it("PersonEmploymentStore#upsertmany works for the empty case", async () => {
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
