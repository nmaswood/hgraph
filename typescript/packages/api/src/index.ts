import * as dotenv from "dotenv";

dotenv.config();
import "express-async-errors"; // eslint-disable-line

import cors from "cors";
import express from "express"; // eslint-disable-line

import { LOGGER } from "./logger";
import { errorLogger } from "./middleware/error-logger";
import { errorResponder } from "./middleware/error-responder";
import { invalidPathHandler } from "./middleware/invalid-path-handler";
import { SETTINGS } from "./settings";

import { HealthRouter } from "./routers/health";
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
import { DataRouter } from "./routers/data-router";

LOGGER.info("Server starting ...");

async function start() {
  const app = express();
  app.enable("trust proxy");

  app.use(
    express.json({
      verify: function (req, _, buf) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (req as any).rawBody = buf;
      },
    })
  );

  app.use(cors({ origin: "*" }));

  // dep injection

  const pool = await dataBasePool(SETTINGS.sql.uri);
  const driver = getDriver(SETTINGS.neo);
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

  const healthRouter = new HealthRouter().init();

  const dataRouter = new DataRouter(
    companyWriter,
    personEmployeeWriter,
    companyAcquisitionWriter
  ).init();

  app.use("/api/v1/health", healthRouter);

  app.use("/api/v1/data", dataRouter);

  app.use(errorLogger);
  app.use(errorResponder);
  app.use(invalidPathHandler);

  app.listen(SETTINGS.port, SETTINGS.host);
}

start();
