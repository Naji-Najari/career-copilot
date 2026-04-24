"""POST /v1/analyze — dual-mode CV + JD analyzer endpoint."""

from typing import Union

from fastapi import APIRouter, HTTPException, status

from app.agent.agent import root_agent
from app.schemas import (
    AnalyzeRequest,
    CandidateResponse,
    CompanyIntelligence,
    FitVerdict,
    GapReport,
    InterviewPrepBundle,
    OutreachDraft,
    PrepBundle,
    RecruiterFitResponse,
    RecruiterNoFitResponse,
)
from app.utils.adk_runner import run_agent
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/v1", tags=["analyze"])

AnalyzeResponse = Union[RecruiterFitResponse, RecruiterNoFitResponse, CandidateResponse]


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    """Run the dual-mode career-copilot workflow against a CV + JD."""
    initial_state = {
        "cv_text": request.cv_text,
        "jd_text": request.jd_text,
        "mode": request.mode,
    }

    try:
        state = await run_agent(root_agent, initial_state)
    except Exception as exc:  # noqa: BLE001 - surface any agent failure cleanly
        logger.exception("agent run failed")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"agent run failed: {exc}",
        ) from exc

    if request.mode == "recruiter":
        return _build_recruiter_response(state)
    return _build_candidate_response(state)


def _build_recruiter_response(
    state: dict,
) -> RecruiterFitResponse | RecruiterNoFitResponse:
    verdict_payload = state.get("fit_verdict")
    if not verdict_payload:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Fit verdict missing from workflow state.",
        )
    verdict = FitVerdict.model_validate(verdict_payload)

    if state.get("outreach_draft"):
        return RecruiterFitResponse(
            verdict=verdict,
            outreach=OutreachDraft.model_validate(state["outreach_draft"]),
        )
    if state.get("gap_report"):
        return RecruiterNoFitResponse(
            verdict=verdict,
            gap=GapReport.model_validate(state["gap_report"]),
        )
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Neither OutreachDraft nor GapReport produced for recruiter run.",
    )


def _build_candidate_response(state: dict) -> CandidateResponse:
    missing = [k for k in ("company_intel", "interview_prep") if not state.get(k)]
    if missing:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Candidate workflow incomplete; missing state keys: {missing}",
        )
    try:
        company = CompanyIntelligence.model_validate_json(state["company_intel"])
    except Exception as exc:  # noqa: BLE001 - JSON from an unguarded LLM
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Research Agent returned invalid CompanyIntelligence JSON: {exc}",
        ) from exc
    return CandidateResponse(
        prep=PrepBundle(
            company=company,
            interview_prep=InterviewPrepBundle.model_validate(state["interview_prep"]),
        )
    )
