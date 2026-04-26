"""POST /v1/analyze — dual-mode CV + JD analyzer endpoint."""

import asyncio
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Request, status
from langfuse import get_client, propagate_attributes

from app.agent.agent import root_agent
from app.schemas import (
    AnalyzeRequest,
    CandidateResponse,
    CompanyIntelligence,
    CVOptimizationBundle,
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
from app.utils.llm_utils import PRIMARY_MODEL
from app.utils.logger import get_logger
from app.utils.rate_limit import limiter

logger = get_logger(__name__)

router = APIRouter(prefix="/v1", tags=["analyze"])

AnalyzeResponse = RecruiterFitResponse | RecruiterNoFitResponse | CandidateResponse
REQUEST_TIMEOUT_S = 300


def _fail(request_id: str, code: int, public_detail: str, log_msg: str) -> HTTPException:
    """Log internal context under request_id and return a sanitized HTTPException."""
    logger.error("%s [request_id=%s]", log_msg, request_id)
    return HTTPException(
        status_code=code,
        detail={"error": public_detail, "request_id": request_id},
    )


@router.post("/analyze", response_model=AnalyzeResponse)
@limiter.limit("5/minute")
async def analyze(request: Request, payload: AnalyzeRequest) -> AnalyzeResponse:
    """Run the dual-mode career-copilot workflow against a CV + JD."""
    request_id = uuid4().hex
    logger.info(
        "analyze start: request_id=%s mode=%s cv_chars=%d jd_chars=%d.",
        request_id,
        payload.mode,
        len(payload.cv_text),
        len(payload.jd_text),
    )
    initial_state = {
        "cv_text": payload.cv_text,
        "jd_text": payload.jd_text,
        "mode": payload.mode,
    }

    langfuse = get_client()
    # cv_text / jd_text are personal data (name, email, employment history)
    # and never leave the request — no consent surface to ship them to a
    # third-party processor.
    with langfuse.start_as_current_observation(
        name=f"analyze.{payload.mode}",
        as_type="agent",
        input={
            "mode": payload.mode,
            "request_id": request_id,
            "cv_chars": len(payload.cv_text),
            "jd_chars": len(payload.jd_text),
        },
    ) as span, propagate_attributes(
        trace_name=f"career-copilot.analyze.{payload.mode}",
        tags=["analyze", payload.mode],
        metadata={
            "mode": payload.mode,
            "model": PRIMARY_MODEL,
            "version": VERSION,
            "request_id": request_id,
            "cv_chars": str(len(payload.cv_text)),
            "jd_chars": str(len(payload.jd_text)),
        },
    ):
        try:
            async with asyncio.timeout(REQUEST_TIMEOUT_S):
                state = await run_agent(root_agent, initial_state)
        except TimeoutError as exc:
            raise _fail(
                request_id,
                status.HTTP_504_GATEWAY_TIMEOUT,
                "Agent run exceeded the time budget.",
                f"agent run timed out after {REQUEST_TIMEOUT_S}s",
            ) from exc
        except Exception as exc:  # noqa: BLE001 - surface any agent failure cleanly
            logger.exception("agent run failed [request_id=%s]", request_id)
            raise _fail(
                request_id,
                status.HTTP_502_BAD_GATEWAY,
                "Agent run failed.",
                "agent run failed",
            ) from exc

        logger.info(
            "analyze done: request_id=%s mode=%s state_keys=%s",
            request_id,
            payload.mode,
            sorted(state.keys()),
        )
        response = (
            _build_recruiter_response(state, request_id)
            if payload.mode == "recruiter"
            else _build_candidate_response(state, request_id)
        )
        span.update(output={"mode": payload.mode, "request_id": request_id})
        return response


def _build_recruiter_response(
    state: dict, request_id: str
) -> RecruiterFitResponse | RecruiterNoFitResponse:
    verdict_payload = state.get("fit_verdict")
    if not verdict_payload:
        raise _fail(
            request_id,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Recruiter workflow produced no verdict.",
            "fit_verdict missing from workflow state",
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
    raise _fail(
        request_id,
        status.HTTP_500_INTERNAL_SERVER_ERROR,
        "Recruiter workflow produced neither outreach nor gap.",
        "neither outreach_draft nor gap_report produced for recruiter run",
    )


def _build_candidate_response(state: dict, request_id: str) -> CandidateResponse:
    required = ("company_intel", "cv_optimizations", "interview_prep")
    missing = [k for k in required if not state.get(k)]
    if missing:
        raise _fail(
            request_id,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Candidate workflow incomplete.",
            f"candidate workflow missing state keys: {missing}",
        )
    try:
        company = CompanyIntelligence.model_validate_json(state["company_intel"])
    except Exception as exc:  # noqa: BLE001 - JSON from an unguarded LLM
        raise _fail(
            request_id,
            status.HTTP_502_BAD_GATEWAY,
            "Research agent produced an invalid response.",
            f"company_intel JSON validation failed: {exc}",
        ) from exc
    return CandidateResponse(
        prep=PrepBundle(
            company=company,
            cv_optimizations=CVOptimizationBundle.model_validate(
                state["cv_optimizations"]
            ),
            interview_prep=InterviewPrepBundle.model_validate(state["interview_prep"]),
        )
    )
