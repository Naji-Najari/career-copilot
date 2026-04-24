"""Mode Router — dispatches on `ctx.state["mode"]`.

The `mode` parameter is bound from session state (FunctionNode default
binding). The returned route matches the labels declared in the workflow's
routing dict at `app.agent.agent`.
"""

from google.adk import Event
from google.adk.workflow import FunctionNode


def _mode_router(mode: str) -> Event:
    """Routes to RECRUITER or CANDIDATE based on the API-supplied mode."""
    route = "RECRUITER" if mode == "recruiter" else "CANDIDATE"
    return Event(route=route)


mode_router = FunctionNode(_mode_router, name="mode_router")
