import { ZNeoArguments } from "@hgraph/precedent-node";
import { z } from "zod";

const ZJobType = z.enum(["base-import"]);

const ZSettings = z.object({
  sql: z.object({
    uri: z.string(),
  }),
  jobType: ZJobType,
  neo: ZNeoArguments,
});

export type Settings = z.infer<typeof ZSettings>;
export type JobType = z.infer<typeof ZJobType>;

export const SETTINGS = ZSettings.parse({
  sql: {
    uri: process.env["SQL_URI"] ?? "test",
  },
  jobType: process.env["JOB_TYPE"] ?? "base-import",
  neo: {
    uri: process.env["NEO4J_URI"],
    username: process.env["NEO4J_USERNAME"],
    password: process.env["NEO4J_PASSWORD"],
    database: process.env["NEO4J_DATABASE"],
  },
});
