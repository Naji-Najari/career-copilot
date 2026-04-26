<h1 align="center">Career Copilot</h1>

<p align="center">
  <strong>One CV. One JD. Outreach for recruiters. Interview prep for candidates.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-WIP-orange" alt="Status" />
  <img src="https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white" alt="Python 3.12" />
  <img src="https://img.shields.io/badge/Google_ADK-v2-4285F4?logo=google&logoColor=white" alt="Google ADK v2" />
  <img src="https://img.shields.io/badge/OpenAI-gpt--5.4--mini-412991?logo=openai&logoColor=white" alt="OpenAI gpt-5.4-mini" />
  <img src="https://img.shields.io/badge/Tavily-MCP-0B7285" alt="Tavily MCP" />
  <img src="https://img.shields.io/badge/Langfuse-tracing-0F172A" alt="Langfuse tracing" />
  <img src="https://img.shields.io/badge/uv-managed-DE5FE9?logo=astral&logoColor=white" alt="uv" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License MIT" />
</p>

<p align="center">
  <a href="#what-it-does">What it does</a> ·
  <a href="#graph">Graph</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#tech-stack">Tech stack</a> ·
  <a href="#setup">Setup</a> ·
  <a href="#running">Running</a>
</p>

---

Recruiters get a fit verdict and an outreach draft citing a real achievement from the CV. Candidates get live company research (Tavily MCP) and a tailored interview prep bundle. Built on Google ADK v2 as a multi-agent graph.

## What it does

**Recruiter mode** — evaluates candidate fit against the JD. On fit / borderline, drafts a personalized LinkedIn outreach message citing a specific achievement from the CV. On no-fit, explains the gaps clearly and suggests adjacent roles.

**Candidate mode** — company research via Tavily MCP (funding, culture, Glassdoor, agency-posting detection), strategic CV-positioning recommendations against the JD, and tailored probable-questions for the interview.

## Graph

```mermaid
flowchart LR
    IN(["CV + JD<br/>+ mode"]):::io

    IN --> CV[CV Parser]:::agent
    IN --> JD[JD Parser]:::agent
    CV --> MR(["Mode Router"]):::router
    JD --> MR

    MR -- recruiter --> FA[Fit Analyzer]:::agent
    FA --> VR(["Verdict Router"]):::router
    VR -- fit / borderline --> OW["Outreach Writer<br/><i>medium</i>"]:::agent
    VR -- no_fit --> GE[Gap Explainer]:::agent

    MR -- candidate --> CFORK((·)):::fork
    CFORK --> RA["Research Agent<br/><b style='color:#CA8A04'>+ Tavily MCP</b>"]:::agent
    CFORK --> CO[CV Optimizer]:::agent
    RA --> IP[Interview Prep]:::agent
    CO --> IP

    OW --> OUT1(["RecruiterFit"]):::io
    GE --> OUT2(["RecruiterNoFit"]):::io
    IP --> OUT3(["CandidateResp"]):::io

    classDef agent fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#0D47A1
    classDef router fill:#E8F5E9,stroke:#2E7D32,stroke-width:1.5px,color:#1B5E20
    classDef fork fill:#9E9E9E,stroke:#616161,stroke-width:1px,color:#9E9E9E
    classDef io fill:#F5F5F5,stroke:#616161,stroke-width:1px,color:#212121
```

CV and JD are parsed in parallel before the Mode Router splits the flow. In candidate mode, Research Agent (Tavily-grounded) and CV Optimizer run in parallel; Interview Prep then synthesizes both alongside the company intel. (Internal `JoinNode`s are omitted from the diagram for clarity — see `app/agent/agent.py`.)

## Architecture

Google ADK v2 graph-based `Workflow(edges=[...])`. Every LLM node has a typed Pydantic output schema — except the Research Agent, which uses tools (Tavily) and therefore cannot also enforce `output_schema` on gpt-5.4-mini; it returns a JSON string that the API handler validates with `CompanyIntelligence.model_validate_json`.

**Agents (LLM — OpenAI `gpt-5.4-mini` via LiteLlm)**
- **CV Parser** — `ParsedCV` (skills, years of experience, achievements, languages).
- **JD Parser** — `ParsedJD` (title, company, required/preferred skills, seniority, agency hints).
- **Fit Analyzer** — `FitVerdict` (fit / borderline / no_fit, confidence, summary, strengths, gaps).
- **Outreach Writer** — higher reasoning effort. `OutreachDraft` citing a specific CV achievement.
- **Gap Explainer** — `GapReport` (gaps, explanation, adjacent roles).
- **Research Agent** — Tavily via MCP. Emits `CompanyIntelligence` as a JSON string.
- **CV Optimizer** — `CVOptimizationBundle` (0–5 strategic positioning recommendations against the JD).
- **Interview Prep** — `InterviewPrepBundle` (probable questions tailored to the JD + company signals).

**Code nodes (no LLM)**
- `mode_router`, `verdict_router` — `FunctionNode`s that return `Event(route=...)`.
- `parse_join`, `candidate_join` — ADK `JoinNode`s synchronizing the parallel parsers and the candidate-branch fan-out.

## Tech stack

| Layer    | Stack                                                           |
| -------- | --------------------------------------------------------------- |
| Backend  | Python 3.12, FastAPI, Google ADK v2, uv                         |
| Models   | OpenAI `gpt-5.4-mini` via `LiteLlm` (low reasoning by default, medium for Outreach Writer) |
| Research | Tavily via MCP (`McpToolset` + remote HTTP endpoint)            |
| Frontend | Next.js 15 (App Router), React 19, Tailwind 4 + shadcn/ui, TanStack Query |
| Deploy   | Dockerfile for Cloud Run / HuggingFace Spaces                   |

## Setup

### Prerequisites

- Python 3.12 with [uv](https://docs.astral.sh/uv/)
- An [OpenAI API key](https://platform.openai.com/api-keys) for `gpt-5.4-mini`
- A [Tavily API key](https://tavily.com) for the candidate-mode research agent (MCP)

### Install

```bash
cd backend
uv sync
```

### Configure

```bash
cp backend/.env.example backend/.env   # fill in OPENAI_API_KEY and TAVILY_API_KEY
```

## Running

```bash
cd backend
uv run uvicorn app.main:app --reload --port 8080
```

API docs at http://localhost:8080/docs. Try `POST /v1/analyze` with `{"cv_text": "...", "jd_text": "...", "mode": "recruiter" | "candidate"}`.

## Tests

```bash
cd backend
uv run pytest tests/ -q
```

## License

[MIT](./LICENSE)
