import { z } from "zod";

export const modeSchema = z.enum(["recruiter", "candidate"]);

export const analyzeInputSchema = z.object({
  cv_text: z.string().min(1, "Please paste or upload a CV."),
  jd_text: z.string().min(1, "Please paste a job description."),
  mode: modeSchema,
});

export type AnalyzeInput = z.infer<typeof analyzeInputSchema>;
export type Mode = z.infer<typeof modeSchema>;
