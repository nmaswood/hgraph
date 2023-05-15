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
import { PsqlPersonEmploymentWriter } from "../person-employment-store";
import { TEST_SETTINGS } from "./test-settings";

async function setup() {
  const pool = await dataBasePool(TEST_SETTINGS.sqlUri);
  const sqlCompanyWriter = new PsqlCompanyWriter(pool);
  const companyAcquisitionWriter = new PsqlCompanyAcquistionWriter(pool);
  const personEmploymentWriter = new PsqlPersonEmploymentWriter(pool);

  return {
    pool,
    sqlCompanyWriter,
    companyAcquisitionWriter,
    personEmploymentWriter,
  };
}

beforeEach(async () => {
  const { pool } = await setup();

  await pool.query(sql.unsafe`TRUNCATE TABLE company CASCADE`);
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

test("CompanyAcquisitionWriter#upsertmany works for the empty case", async () => {
  const { companyAcquisitionWriter } = await setup();

  expect(await companyAcquisitionWriter.upsertMany([])).toEqual([]);
});

test("CompanyAcquisition#upsertMany works for a simple case", async () => {
  const { companyAcquisitionWriter } = await setup();
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

  expect(await companyAcquisitionWriter.upsertMany(acqs)).toEqual([
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
  const { companyAcquisitionWriter } = await setup();
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

  await expect(companyAcquisitionWriter.upsertMany(acqs)).rejects.toThrow();
});

test("PersonEmploymentWriter#upsertmany works for the empty case", async () => {
  const { personEmploymentWriter } = await setup();

  expect(await personEmploymentWriter.upsertMany([])).toEqual([]);
});

test("PersonEmploymentWriter#upsertmany works for a simple case", async () => {
  const { personEmploymentWriter } = await setup();

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

  expect(await personEmploymentWriter.upsertMany(acqs)).toEqual([
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
