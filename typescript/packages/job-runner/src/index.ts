import { assertNever } from "@hgraph/precedent-iso";
import {
  dataBasePool,
  DualCompanyAcquisitionWriter,
  DualCompanyWriter,
  DualPersonEmploymentWriter,
  getDriver,
  Neo4jCompanyAcquistionWriter,
  Neo4jCompanyWriter,
  Neo4jPersonEmploymentWriter,
  PsqlCompanyAcquistionWriter,
  PsqlCompanyWriter,
  PsqlPersonEmploymentWriter,
} from "@hgraph/precedent-node";
import * as dotenv from "dotenv";

import * as D from "./data";

dotenv.config();

import { LOGGER } from "./logger";
import { SETTINGS, Settings } from "./settings";

LOGGER.info("Starting job runner...");

async function start(settings: Settings) {
  switch (settings.jobType) {
    case "base-import": {
      // dep injection
      const pool = await dataBasePool(settings.sql.uri);
      const driver = getDriver(settings.neo);
      const companyWriter = new DualCompanyWriter(
        new PsqlCompanyWriter(pool),
        new Neo4jCompanyWriter(driver)
      );

      const personEmployeeWriter = new DualPersonEmploymentWriter(
        new PsqlPersonEmploymentWriter(pool),
        new Neo4jPersonEmploymentWriter(driver)
      );

      const companyAcquisitionWriter = new DualCompanyAcquisitionWriter(
        new PsqlCompanyAcquistionWriter(pool),

        new Neo4jCompanyAcquistionWriter(driver)
      );

      LOGGER.info("Upserting companies");
      await companyWriter.upsertMany(D.COMPANY_DATA);
      LOGGER.info("Upserting acquisitions");
      await companyAcquisitionWriter.upsertMany(D.ACQ_DATA);
      LOGGER.info("Upserting employees");
      await personEmployeeWriter.upsertMany(D.PE_DATA);

      LOGGER.info("Upserting Finished");

      await driver.close();
      await pool.end();

      break;
    }
    default:
      assertNever(settings.jobType);
  }

  //
}

start(SETTINGS);
