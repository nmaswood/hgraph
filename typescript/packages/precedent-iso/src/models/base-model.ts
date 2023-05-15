import { z } from "zod";

export interface Company {
  companyId: number;
  companyName: string;
  headcount: number | undefined;
}

export interface CompanyAcquisition {
  parentCompanyId: number;
  acquiredCompanyId: number;
  mergedIntoParentCompany: boolean;
}

export interface PersonEmployment {
  companyId: number;
  personId: number;
  employmentTitle: string;
  status:
    | {
        type: "current_employee";
        startedAt: Date;
      }
    | {
        type: "left_company";
        startDate: Date;
        endDate: Date;
      };
}

export const ZCompanyModel = z
  .object({
    company_id: z.number(),
    company_name: z.string(),
    headcount: z.number().nullable(),
  })
  .transform(
    (v): Company => ({
      companyId: v.company_id,
      companyName: v.company_name,
      headcount: v.headcount ?? undefined,
    })
  );

export const ZCompanyAcquisition = z
  .object({
    parent_company_id: z.number(),
    acquired_company_id: z.number(),
    merged_into_parent_company: z.boolean(),
  })
  .transform(
    (v): CompanyAcquisition => ({
      parentCompanyId: v.parent_company_id,
      acquiredCompanyId: v.acquired_company_id,
      mergedIntoParentCompany: v.merged_into_parent_company,
    })
  );

export const ZPersonEmployment = z
  .object({
    company_id: z.number(),
    person_id: z.number(),
    employment_title: z.string(),
    start_date: z.date(),
    end_date: z.date().nullish(),
  })
  .transform(
    (v): PersonEmployment => ({
      companyId: v.company_id,
      personId: v.person_id,
      employmentTitle: v.employment_title,
      status:
        v.end_date == null
          ? { type: "current_employee", startedAt: v.start_date }
          : {
              type: "left_company",
              startDate: v.start_date,
              endDate: v.end_date,
            },
    })
  );
