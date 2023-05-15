import { PersonEmploymentDate } from "@hgraph/precedent-iso";
import {
  CompanyAcquisitionWriter,
  CompanyWriter,
  PersonEmploymentWriter,
} from "@hgraph/precedent-node";
import express from "express";
import { z } from "zod";

export class DataRouter {
  constructor(
    private readonly companyWriter: CompanyWriter,
    private readonly personEmploymentWriter: PersonEmploymentWriter,
    private readonly companyAcquisitionWriter: CompanyAcquisitionWriter
  ) {}
  init() {
    const router = express.Router();

    router.put(
      "/company",
      async (req: express.Request, res: express.Response) => {
        const body = IO.ZCompany.parse(req.body);

        const data = await this.companyWriter.upsertMany([body]);
        res.json({ data });
      }
    );

    router.put(
      "/company-acquisition",
      async (req: express.Request, res: express.Response) => {
        const body = IO.ZCompanyAcquisition.parse(req.body);

        const data = await this.companyAcquisitionWriter.upsertMany([body]);
        res.json({ data });
      }
    );

    router.put(
      "/person-employment",
      async (req: express.Request, res: express.Response) => {
        const body = IO.ZPersonEmployment.parse(req.body);
        const data = await this.personEmploymentWriter.upsertMany([body]);
        res.json({ data });
      }
    );

    return router;
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export class IO {
  static ZPersonEmployment = z
    .object({
      companyId: z.number().positive(),
      personId: z.number().positive(),
      employmentTitle: z.string().min(1).max(1024),
      startDate: z.string().nullish(),
      endDate: z.string().nullish(),
    })
    .transform((v) => ({
      ...v,
      status: PersonEmploymentDate.toStatus(v.startDate, v.endDate),
    }));

  static ZCompanyAcquisition = z.object({
    parentCompanyId: z.number().positive(),
    acquiredCompanyId: z.number().positive(),
    mergedIntoParentCompany: z.boolean(),
  });

  static ZCompany = z
    .object({
      companyId: z.number().positive(),
      companyName: z.string().min(1),
      headcount: z.number().nullable(),
    })
    .transform((v) => ({ ...v, headcount: v.headcount ?? undefined }));
}
