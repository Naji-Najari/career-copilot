import type { AnalyzeInput } from "@/lib/schemas";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// --- Response shape mirrors backend/app/schemas.py ---

export type FitVerdict = {
  verdict: "fit" | "borderline" | "no_fit";
  confidence: number;
  matched_evidence: string[];
  gaps: string[];
  notes: string;
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
  is_likely_agency_posting: boolean;
  probable_real_employer: string | null;
  agency_evidence: string[];
  funding_stage: string | null;
  recent_news: string[];
  culture_signals: string[];
  interview_process_hints: string[];
  sources: string[];
};

export type InterviewPrepBundle = {
  probable_questions: string[];
  talking_points: string[];
  reverse_questions: string[];
};

export type PrepBundle = {
  company: CompanyIntelligence;
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
  const res = await fetch(`${BASE_URL}/v1/analyze`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return asJson<AnalyzeResponse>(res);
}

export async function fetchExtractPdf(file: File): Promise<ExtractPdfResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE_URL}/v1/extract-pdf`, {
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
