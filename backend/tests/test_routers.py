"""Unit tests for the pure-Python routers."""

import pytest

from app.agent.routers.mode_router import _mode_router
from app.agent.routers.verdict_router import _verdict_router
from app.schemas import FitVerdict


@pytest.mark.parametrize(
    "mode,expected",
    [
        ("recruiter", "RECRUITER"),
        ("candidate", "CANDIDATE"),
    ],
)
def test_mode_router_routes_by_mode(mode: str, expected: str) -> None:
    assert _mode_router(mode).actions.route == expected


@pytest.mark.parametrize(
    "verdict,expected",
    [
        ("fit", "OUTREACH"),
        ("borderline", "OUTREACH"),
        ("no_fit", "GAP"),
    ],
)
def test_verdict_router_routes_by_verdict(verdict: str, expected: str) -> None:
    fv = FitVerdict(
        verdict=verdict, confidence=5, summary="", strengths=[], gaps=[]
    ).model_dump()
    assert _verdict_router(fv).actions.route == expected
