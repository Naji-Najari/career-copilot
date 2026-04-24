"""Outreach Writer — drafts a personalized outreach message on fit/borderline."""

from google.adk import Agent

from app.agent.sub_agents.outreach_writer.prompt import OUTREACH_WRITER_INSTRUCTION
from app.schemas import OutreachDraft
from app.utils.llm_utils import openai_mini_med

outreach_writer_agent = Agent(
    name="outreach_writer",
    description="Writes a personalized outreach message citing a specific CV achievement.",
    model=openai_mini_med,
    instruction=OUTREACH_WRITER_INSTRUCTION,
    output_schema=OutreachDraft,
    output_key="outreach_draft",
)
