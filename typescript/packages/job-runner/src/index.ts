import { assertNever } from "@hgraph/precedent-iso";
import {
  dataBasePool,
  PsqlCompanyAcquistionWriter,
  PsqlCompanyWriter,
  PsqlPersonEmploymentStore,
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
      const pool = await dataBasePool(settings.sql.uri);
      const companyStore = new PsqlCompanyWriter(pool);
      const companyAcquisitionStore = new PsqlCompanyAcquistionWriter(pool);
      const personEmployeeStore = new PsqlPersonEmploymentStore(pool);
      LOGGER.info("Upserting data");

      await companyStore.upsertMany(D.COMPANY_DATA);
      await companyAcquisitionStore.upsertMany(D.ACQ_DATA);
      await personEmployeeStore.upsertMany(D.PE_DATA);

      break;
    }
    default:
      assertNever(settings.jobType);
  }

  //
}

start(SETTINGS);
