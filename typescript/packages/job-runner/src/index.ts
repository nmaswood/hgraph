import { assertNever } from "@hgraph/precedent-iso";
import {
  dataBasePool,
  PsqlCompanyAcquistionStore,
  PsqlCompanyStore,
  PsqlPersonEmploymentStore,
} from "@hgraph/precedent-node";
import * as dotenv from "dotenv";

dotenv.config();

import { LOGGER } from "./logger";
import { SETTINGS, Settings } from "./settings";

LOGGER.info("Starting job runner...");

async function start(settings: Settings) {
  switch (settings.jobType) {
    case "base-import": {
      const pool = await dataBasePool(settings.sql.uri);
      const companyStore = new PsqlCompanyStore(pool);
      const companyAcquisitionStore = new PsqlCompanyAcquistionStore(pool);
      const personEmployeeStore = new PsqlPersonEmploymentStore(pool);

      throw new Error("not implemented");
    }
    default:
      assertNever(settings.jobType);
  }

  //
}

start(SETTINGS);
