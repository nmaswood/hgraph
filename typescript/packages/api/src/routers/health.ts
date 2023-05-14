import express from "express";

export class HealthRouter {
  init() {
    const router = express.Router();

    router.get("/", async (_: express.Request, res: express.Response) => {
      res.json({ status: "OK" });
    });

    return router;
  }
}
