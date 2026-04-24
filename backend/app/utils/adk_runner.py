"""Generic ADK runner wrapper.

Wraps session creation and Runner execution so route handlers stay thin.
Any agent or workflow can be executed via `run_agent(agent, initial_state)`.
"""

from typing import Any
from uuid import uuid4

from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types as genai_types

from app.utils.constants import APP_NAME, USER_ID
from app.utils.logger import get_logger

logger = get_logger(__name__)


async def run_agent(
    agent: Any,
    initial_state: dict[str, Any],
    *,
    user_message: str = "go",
    session_id: str | None = None,
) -> dict[str, Any]:
    """Execute an ADK agent or Workflow and return the final session state.

    Args:
        agent: an ADK Agent, Workflow, or any runnable root.
        initial_state: state preloaded into the session before the run.
            Typically `{"cv_text": ..., "jd_text": ..., "mode": ...}` for
            career-copilot.
        user_message: placeholder user content. Graph nodes read from
            `session.state`, not the user message, so this is purely a
            required Runner input.
        session_id: optional session id; defaults to a fresh uuid4 hex.

    Returns:
        The session state dict after the run completes.
    """
    session_service = InMemorySessionService()
    sid = session_id or uuid4().hex
    session = await session_service.create_session(
        app_name=APP_NAME,
        user_id=USER_ID,
        session_id=sid,
        state=initial_state,
    )
    runner = Runner(
        app_name=APP_NAME,
        agent=agent,
        session_service=session_service,
    )
    message = genai_types.Content(
        role="user",
        parts=[genai_types.Part(text=user_message)],
    )

    logger.info("run start session=%s state_keys=%s", sid, list(initial_state))
    async for _event in runner.run_async(
        user_id=USER_ID,
        session_id=session.id,
        new_message=message,
    ):
        pass

    final = await session_service.get_session(
        app_name=APP_NAME,
        user_id=USER_ID,
        session_id=session.id,
    )
    state = dict((final.state if final else {}) or {})
    logger.info("run done session=%s state_keys=%s", sid, list(state))
    return state
