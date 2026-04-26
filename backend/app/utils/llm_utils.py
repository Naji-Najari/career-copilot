"""LLM model instances for ADK agents.

Wrapped through ADK's `LiteLlm` adapter so the provider can be swapped
without touching agent code. All agents run on OpenAI `gpt-5.4-mini`;
`openai_mini_med` bumps reasoning effort for creative / high-quality output
(Outreach Writer).
"""

from google.adk.models.lite_llm import LiteLlm

from app.utils.constants import OPENAI_API_KEY

PRIMARY_MODEL = "openai/gpt-5.4-mini"

openai_mini = LiteLlm(
    model=PRIMARY_MODEL,
    api_key=OPENAI_API_KEY,
    reasoning_effort="low",
)

openai_mini_med = LiteLlm(
    model=PRIMARY_MODEL,
    api_key=OPENAI_API_KEY,
    reasoning_effort="medium",
)
