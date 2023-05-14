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

  const healthRouter = new HealthRouter().init();

  app.use("/api/v1/health", healthRouter);

  app.use(errorLogger);
  app.use(errorResponder);
  app.use(invalidPathHandler);

  app.listen(SETTINGS.port, SETTINGS.host);
}

start();
