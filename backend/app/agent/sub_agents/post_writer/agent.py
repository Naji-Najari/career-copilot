"""PostWriter sub-agent.

Takes a TrendList as typed input (flowing from TrendScanner through the workflow
edge), picks the highest-score trend, drafts a LinkedIn-shaped post.
"""

from google.adk import Agent

from app.agent.sub_agents.trend_scanner.schemas import TrendList
from app.utils.llm_utils import lite_llm_openai_gpt_5_mini__post_writing

from . import prompt, schemas

post_writer_agent = Agent(
    model=lite_llm_openai_gpt_5_mini__post_writing,
    name="post_writer",
    description="Drafts a LinkedIn post from the scanner's trend list.",
    instruction=prompt.POST_WRITER_PROMPT,
    input_schema=TrendList,
    output_schema=schemas.PostDraft,
    output_key="post",
)
