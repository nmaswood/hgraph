import { z } from "zod";

const ZTestSettings = z.object({
  sqlUri: z.string(),
  neo: z.object({
    uri: z.string(),
    username: z.string(),
    password: z.string(),
    database: z.string(),
  }),
});

export const TEST_SETTINGS = ZTestSettings.parse({
  sqlUri: process.env["SQL_URI"],
  neo: {
    uri: process.env["NEO4J_URI"],
    username: process.env["NEO4J_USERNAME"],
    password: process.env["NEO4J_PASSWORD"],
    database: process.env["NEO4J_DATABASE"],
  },
});
