"""LLM model instances for ADK agents."""

from google.adk.models.lite_llm import LiteLlm

from app.utils.constants import OPENAI_API_KEY

# Trend scanner: fast + cheap, reasoning kept low for tool-heavy orchestration
lite_llm_openai_gpt_5_mini__trend_scan = LiteLlm(
    model="openai/gpt-5-mini",
    api_key=OPENAI_API_KEY,
    reasoning_effort="low",
)

# Post writer: slightly higher reasoning for creative output
lite_llm_openai_gpt_5_mini__post_writing = LiteLlm(
    model="openai/gpt-5-mini",
    api_key=OPENAI_API_KEY,
    reasoning_effort="medium",
)
