import { z } from "zod";

const ZJobType = z.enum(["base-import"]);

const ZSettings = z.object({
  sql: z.object({
    uri: z.string(),
  }),
  jobType: ZJobType,
});

export type Settings = z.infer<typeof ZSettings>;
export type JobType = z.infer<typeof ZJobType>;

export const SETTINGS = ZSettings.parse({
  sql: {
    uri: process.env["SQL_URI"] ?? "test",
  },
  jobType: process.env["JOB_TYPE"] ?? "base-import",
});
