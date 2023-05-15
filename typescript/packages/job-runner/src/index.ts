import { assertNever } from "@hgraph/precedent-iso";
import * as dotenv from "dotenv";

dotenv.config();

import { LOGGER } from "./logger";
import { SETTINGS, Settings } from "./settings";

LOGGER.info("Starting job runner...");

async function start(settings: Settings) {
  switch (settings.jobType) {
    case "base-import":
      throw new Error("not implemented");
    default:
      assertNever(settings.jobType);
  }

  //
}

start(SETTINGS);
