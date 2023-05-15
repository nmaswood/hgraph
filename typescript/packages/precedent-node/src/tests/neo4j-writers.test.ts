import {
  Company,
  CompanyAcquisition,
  PersonEmployment,
} from "@hgraph/precedent-iso";
import { beforeEach, expect, test } from "vitest";

import { Neo4jCompanyAcquistionWriter } from "../company-acquistion-store";
import { Neo4jCompanyWriter } from "../company-writer";
import { getDriver } from "../neo4j";
import { Neo4jPersonEmploymentWriter } from "../person-employment-store";
import { TEST_SETTINGS } from "./test-settings";

async function setup() {
  const driver = getDriver(TEST_SETTINGS.neo);

  const companyWriter = new Neo4jCompanyWriter(driver);
  const companyAcquisitionWriter = new Neo4jCompanyAcquistionWriter(driver);
  const peWriter = new Neo4jPersonEmploymentWriter(driver);

  return {
    driver,
    companyWriter,
    companyAcquisitionWriter,
    peWriter,
  };
}

beforeEach(async () => {
  //const { driver } = await setup();
  //await driver.executeQuery("MATCH (n) DETACH DELETE n");
});

test("CompanyWriter#upsertMany works for a simple case", async () => {
  const { companyWriter } = await setup();
  const companies: Company[] = [
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
  ];

  for (let i = 0; i < 10; i++) {
    expect(await companyWriter.upsertMany(companies)).toEqual([
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
  }
});

test("CompanyAcquisition#upsertMany works for a simple case", async () => {
  const { companyWriter: neo4jCompanyWriter } = await setup();
  const companies: Company[] = [
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
  ];

  for (let i = 0; i < 10; i++) {
    expect(await neo4jCompanyWriter.upsertMany(companies)).toEqual([
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
  }
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

test("PersonEmploymentStore#upsertmany works for a simple case", async () => {
  const { peWriter } = await setup();

  const startDate = new Date("December 17, 1995");
  const endDate = new Date("December 17, 2020");
  const acqs: PersonEmployment[] = [
    {
      companyId: 1,
      personId: 2,
      employmentTitle: "SWE",
      status: {
        type: "current_employee",
        startDate,
      },
    },
    {
      companyId: 3,
      personId: 4,
      employmentTitle: "SWE",
      status: {
        type: "left_company",
        startDate,
        endDate,
      },
    },
  ];

  expect(await peWriter.upsertMany(acqs)).toEqual([
    {
      companyId: 1,
      personId: 2,
      employmentTitle: "SWE",
      status: {
        type: "current_employee",
        startDate,
      },
    },
    {
      companyId: 3,
      personId: 4,
      employmentTitle: "SWE",
      status: {
        type: "left_company",
        startDate,
        endDate,
      },
    },
  ]);
});
