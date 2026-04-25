"""Pydantic schemas for the career-copilot workflow and HTTP layer.

Conventions:
- Schemas are grouped by branch (shared / recruiter / candidate / api).
- Every schema that flows through `session.state` or across node boundaries
  lives here so the graph wiring stays decoupled from sub-agent packages.
"""

from typing import Literal

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Shared preprocessing output
# ---------------------------------------------------------------------------


class ParsedCV(BaseModel):
    """Structured projection of the raw CV text."""

    skills: list[str] = Field(default_factory=list)
    years_experience: int = Field(ge=0)
    key_achievements: list[str] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)
    raw_text: str


class ParsedJD(BaseModel):
    """Structured projection of the raw Job Description text."""

    job_title: str
    company_name: str | None = None
    required_skills: list[str] = Field(default_factory=list)
    preferred_skills: list[str] = Field(default_factory=list)
    seniority: str
    agency_hints: list[str] = Field(
        default_factory=list,
        description=(
            "Lexical cues suggesting a recruiting-agency posting "
            "(e.g. 'our client is looking for', 'on behalf of a leading...')."
        ),
    )
    raw_text: str


Mode = Literal["recruiter", "candidate"]


# ---------------------------------------------------------------------------
# Recruiter branch
# ---------------------------------------------------------------------------


Verdict = Literal["fit", "borderline", "no_fit"]


class Strength(BaseModel):
    """A single matched strength: one concrete CV signal + why it satisfies the JD."""

    claim: str = Field(description="Near-verbatim CV signal, one line.")
    rationale: str = Field(
        description="How this satisfies a specific JD requirement — 1-2 sentences."
    )


class Gap(BaseModel):
    """A single gap: what's missing + which JD requirement it puts at risk."""

    missing: str = Field(description="Short headline of what is missing, one line.")
    impact: str = Field(
        description="Which JD requirement is at risk, and how severely — 1-2 sentences."
    )


class FitVerdict(BaseModel):
    """Output of the Fit Analyzer."""

    verdict: Verdict
    confidence: int = Field(ge=1, le=10, description="Calibrated 1-10.")
    summary: str = Field(
        description="1-2 plain sentences naming the key driver(s) of the verdict."
    )
    strengths: list[Strength] = Field(default_factory=list, max_length=5)
    gaps: list[Gap] = Field(default_factory=list, max_length=5)


class OutreachDraft(BaseModel):
    """Output of the Outreach Writer (Gemini Pro).

    `subject_line` doubles as a LinkedIn InMail subject / email fallback /
    conversation opener; LinkedIn DMs themselves have no subject.
    """

    subject_line: str
    body: str
    referenced_achievement: str = Field(
        description="Verbatim CV achievement cited in the message body."
    )


class GapReport(BaseModel):
    """Output of the Gap Explainer."""

    gaps: list[str] = Field(min_length=1)
    explanation: str
    adjacent_roles: list[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Candidate branch
# ---------------------------------------------------------------------------


class CompanyIntelligence(BaseModel):
    """Output of the Company Parser (structured projection of research notes)."""

    company_name: str
    is_likely_agency_posting: bool
    probable_real_employer: str | None = None
    agency_evidence: list[str] = Field(default_factory=list)
    funding_stage: str | None = None
    recent_news: list[str] = Field(default_factory=list)
    culture_signals: list[str] = Field(default_factory=list)
    interview_process_hints: list[str] = Field(default_factory=list)
    sources: list[str] = Field(
        default_factory=list,
        description="URLs cited by the research agent.",
    )


class InterviewPrepBundle(BaseModel):
    """Output of the Interview Prep agent."""

    probable_questions: list[str] = Field(default_factory=list)
    talking_points: list[str] = Field(default_factory=list)
    reverse_questions: list[str] = Field(default_factory=list)


class PrepBundle(BaseModel):
    """Final candidate-mode payload (assembled by the API handler)."""

    company: CompanyIntelligence
    interview_prep: InterviewPrepBundle


# ---------------------------------------------------------------------------
# HTTP API envelopes
# ---------------------------------------------------------------------------


class AnalyzeRequest(BaseModel):
    """Input payload for POST /v1/analyze."""

    cv_text: str = Field(min_length=1)
    jd_text: str = Field(min_length=1)
    mode: Mode


class RecruiterFitResponse(BaseModel):
    """Recruiter-mode success payload when the verdict routes to Outreach."""

    mode: Literal["recruiter"] = "recruiter"
    verdict: FitVerdict
    outreach: OutreachDraft


class RecruiterNoFitResponse(BaseModel):
    """Recruiter-mode payload when the verdict routes to Gap."""

    mode: Literal["recruiter"] = "recruiter"
    verdict: FitVerdict
    gap: GapReport


class CandidateResponse(BaseModel):
    """Candidate-mode payload."""

    mode: Literal["candidate"] = "candidate"
    prep: PrepBundle


class ExtractPdfResponse(BaseModel):
    """Output of POST /v1/extract-pdf."""

    text: str
