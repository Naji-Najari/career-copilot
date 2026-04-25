"""Langfuse + OpenTelemetry tracing for ADK agent runs.

Wires Langfuse as the OTel backend and turns on
`openinference-instrumentation-google-adk` so every agent / sub-agent /
tool call inside the ADK Runner emits spans automatically — no decorators
needed in the graph code.

Disabled silently when the Langfuse keys are absent so the app keeps
running locally without observability.
"""

import os

from langfuse import Langfuse
from openinference.instrumentation.google_adk import GoogleADKInstrumentor

from app.utils.constants import ENV, VERSION
from app.utils.logger import get_logger

logger = get_logger(__name__)


def setup_observability() -> None:
    public_key = os.getenv("LANGFUSE_PUBLIC_KEY")
    secret_key = os.getenv("LANGFUSE_SECRET_KEY")

    if not public_key or not secret_key:
        logger.info("Langfuse keys not set — agent tracing disabled")
        return

    try:
        langfuse = Langfuse(
            public_key=public_key,
            secret_key=secret_key,
            base_url=os.getenv("LANGFUSE_BASE_URL", "https://cloud.langfuse.com"),
            environment=ENV,
            release=VERSION,
        )

        if not langfuse.auth_check():
            logger.warning("Langfuse auth failed — agent tracing disabled")
            return

        GoogleADKInstrumentor().instrument()
        logger.info("Langfuse + Google ADK OTel instrumentation enabled")

    except Exception as e:
        logger.warning("Langfuse unavailable — tracing disabled: %s", e)
