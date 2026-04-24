"""Root graph-based Workflow for career-copilot.

    START -> (cv_parser || jd_parser) -> parse_join -> mode_router -> {
        RECRUITER: Fit Analyzer -> Verdict Router -> {OUTREACH | GAP}
        CANDIDATE: Research -> Interview Prep
    }

CV and JD parsing run in parallel (independent extractions); `parse_join`
synchronizes before mode_router fires. Research Agent emits
CompanyIntelligence as a JSON string (ADK disallows `output_schema` + tools
on gpt-5.4-mini); the API handler parses it via `model_validate_json`.
"""

from google.adk import Workflow
from google.adk.workflow import JoinNode

from app.agent.routers.mode_router import mode_router
from app.agent.routers.verdict_router import verdict_router
from app.agent.sub_agents.cv_parser import cv_parser_agent
from app.agent.sub_agents.fit_analyzer import fit_analyzer_agent
from app.agent.sub_agents.gap_explainer import gap_explainer_agent
from app.agent.sub_agents.interview_prep import interview_prep_agent
from app.agent.sub_agents.jd_parser import jd_parser_agent
from app.agent.sub_agents.outreach_writer import outreach_writer_agent
from app.agent.sub_agents.research_agent import research_agent

parse_join = JoinNode(name="parse_join")

root_agent = Workflow(
    name="career_copilot",
    edges=[
        (
            "START",
            (cv_parser_agent, jd_parser_agent),
            parse_join,
            mode_router,
            {
                "RECRUITER": fit_analyzer_agent,
                "CANDIDATE": research_agent,
            },
        ),
        (
            fit_analyzer_agent,
            verdict_router,
            {
                "OUTREACH": outreach_writer_agent,
                "GAP": gap_explainer_agent,
            },
        ),
        (research_agent, interview_prep_agent),
    ],
)
