import { ZNeoArguments } from "@hgraph/precedent-node";
import { z } from "zod";

const ZSettings = z.object({
  host: z.string(),
  port: z.number(),
  sql: z.object({
    uri: z.string(),
  }),
  neo: ZNeoArguments,
});

export const SETTINGS = ZSettings.parse({
  host: process.env["HOST"] ?? "0.0.0.0",
  port: Number(process.env["PORT"] ?? "8080"),
  sql: {
    uri: process.env["SQL_URI"] ?? "test",
  },
  neo: {
    uri: process.env["NEO4J_URI"],
    username: process.env["NEO4J_USERNAME"],
    password: process.env["NEO4J_PASSWORD"],
    database: process.env["NEO4J_DATABASE"],
  },
});
