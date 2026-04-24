"""Verdict Router — dispatches on `fit_verdict.verdict`.

`fit` and `borderline` both route to the Outreach Writer (the latter
with hedged tone handled inside the prompt). `no_fit` routes to the Gap
Explainer.
"""

from typing import Any

from google.adk import Event
from google.adk.workflow import FunctionNode


def _verdict_router(fit_verdict: dict[str, Any]) -> Event:
    """Route based on the fit verdict produced by the Fit Analyzer."""
    verdict = fit_verdict["verdict"]
    route = "OUTREACH" if verdict in ("fit", "borderline") else "GAP"
    return Event(route=route)


verdict_router = FunctionNode(_verdict_router, name="verdict_router")
