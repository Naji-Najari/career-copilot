import type { AnalyzeInput } from "@/lib/schemas";

// Browser hits Next.js route handlers in `app/api/*`; those forward to the
// real backend using the server-only `BACKEND_URL` env var. No CORS, no
// backend URL leaked to the client bundle.

// --- Response shape mirrors backend/app/schemas.py ---

export type Strength = { claim: string; rationale: string };
export type Gap = { missing: string; impact: string };

export type FitVerdict = {
  verdict: "fit" | "borderline" | "no_fit";
  confidence: number;
  summary: string;
  strengths: Strength[];
  gaps: Gap[];
};

export type OutreachDraft = {
  subject_line: string;
  body: string;
  referenced_achievement: string;
};

export type GapReport = {
  gaps: string[];
  explanation: string;
  adjacent_roles: string[];
};

export type CompanyIntelligence = {
  company_name: string;
  // Agency posting iff probable_real_employer is non-null.
  probable_real_employer: string | null;
  funding_stage: string | null;
  recent_news: string[];
  culture_signals: string[];
  sources: string[];
};

export type InterviewPrepBundle = {
  probable_questions: string[];
};

export type CVOptimization = {
  headline: string;
  rationale: string;
};

export type CVOptimizationBundle = {
  recommendations: CVOptimization[];
};

export type PrepBundle = {
  company: CompanyIntelligence;
  cv_optimizations: CVOptimizationBundle;
  interview_prep: InterviewPrepBundle;
};

export type RecruiterFitResponse = {
  mode: "recruiter";
  verdict: FitVerdict;
  outreach: OutreachDraft;
};

export type RecruiterNoFitResponse = {
  mode: "recruiter";
  verdict: FitVerdict;
  gap: GapReport;
};

export type CandidateResponse = {
  mode: "candidate";
  prep: PrepBundle;
};

export type AnalyzeResponse =
  | RecruiterFitResponse
  | RecruiterNoFitResponse
  | CandidateResponse;

export type ExtractPdfResponse = { text: string };

// --- Helpers ---

async function asJson<T>(res: Response): Promise<T> {
  const body = await res.text();
  if (!res.ok) {
    let detail = body;
    try {
      const parsed = JSON.parse(body);
      detail = parsed?.detail ?? body;
    } catch {
      /* body is not JSON; keep as-is */
    }
    throw new Error(
      typeof detail === "string"
        ? detail
        : `Request failed with status ${res.status}`,
    );
  }
  return JSON.parse(body) as T;
}

export async function fetchAnalyze(input: AnalyzeInput): Promise<AnalyzeResponse> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return asJson<AnalyzeResponse>(res);
}

export async function fetchExtractPdf(file: File): Promise<ExtractPdfResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/extract-pdf", {
    method: "POST",
    body: form,
  });
  return asJson<ExtractPdfResponse>(res);
}

export function isRecruiterFit(r: AnalyzeResponse): r is RecruiterFitResponse {
  return r.mode === "recruiter" && "outreach" in r;
}

export function isRecruiterNoFit(
  r: AnalyzeResponse,
): r is RecruiterNoFitResponse {
  return r.mode === "recruiter" && "gap" in r;
}

export function isCandidate(r: AnalyzeResponse): r is CandidateResponse {
  return r.mode === "candidate";
}
