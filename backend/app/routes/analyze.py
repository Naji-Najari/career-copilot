"""POST /v1/analyze — dual-mode CV + JD analyzer endpoint."""

from typing import Union

from fastapi import APIRouter, HTTPException, status
from langfuse import get_client, propagate_attributes

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
from app.utils.constants import VERSION
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/v1", tags=["analyze"])

AnalyzeResponse = Union[RecruiterFitResponse, RecruiterNoFitResponse, CandidateResponse]

# Single source of truth for the model surfaced in traces. Kept aligned with
# `app.utils.llm_utils.openai_mini` — every LLM node runs on this.
PRIMARY_MODEL = "openai/gpt-5.4-mini"


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    """Run the dual-mode career-copilot workflow against a CV + JD."""
    logger.info(
        "analyze start: mode=%s cv_chars=%d jd_chars=%d.",
        request.mode,
        len(request.cv_text),
        len(request.jd_text),
    )
    initial_state = {
        "cv_text": request.cv_text,
        "jd_text": request.jd_text,
        "mode": request.mode,
    }

    langfuse = get_client()
    with langfuse.start_as_current_observation(
        name=f"analyze.{request.mode}",
        as_type="agent",
        input={
            "mode": request.mode,
            "cv_text": request.cv_text,
            "jd_text": request.jd_text,
        },
    ) as span, propagate_attributes(
        trace_name=f"career-copilot.analyze.{request.mode}",
        tags=["analyze", request.mode],
        metadata={
            "mode": request.mode,
            "model": PRIMARY_MODEL,
            "version": VERSION,
            "cv_chars": str(len(request.cv_text)),
            "jd_chars": str(len(request.jd_text)),
        },
    ):
        try:
            state = await run_agent(root_agent, initial_state)
        except Exception as exc:  # noqa: BLE001 - surface any agent failure cleanly
            logger.exception("agent run failed")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"agent run failed: {exc}",
            ) from exc

        logger.info(
            "analyze done: mode=%s state_keys=%s",
            request.mode,
            sorted(state.keys()),
        )
        response = (
            _build_recruiter_response(state)
            if request.mode == "recruiter"
            else _build_candidate_response(state)
        )
        span.update(output=response.model_dump())
        return response


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
