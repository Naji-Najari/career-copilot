"""Generic ADK runner wrapper.

Wraps session creation and Runner execution so route handlers stay thin.
Any agent or workflow can be executed via `run_agent(agent, user_text)`.
"""

from uuid import uuid4

from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types as genai_types

from app.utils.constants import APP_NAME, USER_ID
from app.utils.logger import get_logger

logger = get_logger(__name__)


async def run_agent(agent, user_text: str, session_id: str | None = None) -> dict:
    """Execute an ADK agent or workflow and return the final session state.

    Args:
        agent: an ADK Agent, Workflow, or any runnable root.
        user_text: the user message passed to the agent as a Content part.
        session_id: optional session id. Defaults to a fresh uuid4 hex.

    Returns:
        The session state dict after the run completes. Contains all keys
        populated by sub-agent `output_key` writes.
    """
    session_service = InMemorySessionService()
    sid = session_id or uuid4().hex
    session = await session_service.create_session(
        app_name=APP_NAME,
        user_id=USER_ID,
        session_id=sid,
    )
    runner = Runner(
        app_name=APP_NAME,
        agent=agent,
        session_service=session_service,
    )
    user_message = genai_types.Content(
        role="user",
        parts=[genai_types.Part(text=user_text)],
    )

    logger.info("run start session=%s input=%r", sid, user_text)
    async for _event in runner.run_async(
        user_id=USER_ID,
        session_id=session.id,
        new_message=user_message,
    ):
        pass

    final_session = await session_service.get_session(
        app_name=APP_NAME,
        user_id=USER_ID,
        session_id=session.id,
    )
    state = (final_session.state if final_session else {}) or {}
    logger.info("run done session=%s state_keys=%s", sid, list(state.keys()))
    return dict(state)
