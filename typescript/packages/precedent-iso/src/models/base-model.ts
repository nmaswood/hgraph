import { z } from "zod";
import { assertNever } from "../assert-never";

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
    | { type: "unknown" }
    | {
        type: "current_employee";
        startDate: Date;
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
    start_date: z.string().nullish(),
    end_date: z.string().nullish(),
  })
  .transform(
    (v): PersonEmployment => ({
      companyId: v.company_id,
      personId: v.person_id,
      employmentTitle: v.employment_title,
      status: PersonEmploymentDate.toStatus(v.start_date, v.end_date),
    })
  );

export class PersonEmploymentDate {
  static fromStatus(status: PersonEmployment["status"]): {
    startDate: Date | null;
    endDate: Date | null;
  } {
    switch (status.type) {
      case "unknown":
        return { startDate: null, endDate: null };
      case "current_employee":
        return { startDate: status.startDate, endDate: null };
      case "left_company":
        return { startDate: status.startDate, endDate: status.endDate };
      default:
        assertNever(status);
    }
  }

  static toStatus(
    startDate: string | null | undefined,
    endDate: string | null | undefined
  ): PersonEmployment["status"] {
    if (startDate && endDate) {
      return {
        type: "left_company",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      };
    } else if (startDate) {
      return {
        type: "current_employee",
        startDate: new Date(startDate),
      };
    } else if (endDate) {
      throw new Error("Invalid data");
    }
    return { type: "unknown" };
  }
}
