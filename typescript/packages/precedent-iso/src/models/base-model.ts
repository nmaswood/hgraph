import { z } from "zod";

export const ZCompanyModel = z.object({
  company_id: z.string(),
  company_name: z.string(),
  headcount: z.number(),
});

export const ZCompanyAcquisition = z.object({
  parent_company_id: z.string(),
  acquired_company_id: z.string(),
  merged_into_parent_company: z.boolean(),
});

export const ZPersonEmployment = z.object({
  company_id: z.number(),
  person_id: z.number(),
  employment_title: z.string(),
  start_date: z.date(),
  end_date: z.date(),
});
