<h1 align="center">career-copilot</h1>

<p align="center">
  <strong>Paste a CV and a Job Description. Pick a mode. Get a real output in seconds.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-WIP-orange" alt="Status" />
  <img src="https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white" alt="Python 3.12" />
  <img src="https://img.shields.io/badge/Google_ADK-v2-4285F4?logo=google&logoColor=white" alt="Google ADK v2" />
  <img src="https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?logo=google&logoColor=white" alt="Gemini 2.5 Flash" />
  <img src="https://img.shields.io/badge/Streamlit-1.x-FF4B4B?logo=streamlit&logoColor=white" alt="Streamlit" />
  <img src="https://img.shields.io/badge/uv-managed-DE5FE9?logo=astral&logoColor=white" alt="uv" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License MIT" />
</p>

<p align="center">
  <a href="#what-it-does">What it does</a> ·
  <a href="#modes">Modes</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#tech-stack">Tech stack</a> ·
  <a href="#setup">Setup</a> ·
  <a href="#running">Running</a>
</p>

---

Dual-mode AI tool built on Google ADK v2. Paste a CV and a Job Description, pick **Recruiter** or **Candidate** mode, and get a structured, grounded output — not generic AI filler.

## What it does

**Recruiter mode** — evaluates candidate fit against the JD. On fit, drafts a personalized LinkedIn outreach message that references a specific achievement from the CV. On no-fit, explains the gaps clearly and suggests adjacent roles.

**Candidate mode** — full interview prep. Researches the company (funding, culture, Glassdoor), detects if the JD is from a recruiting agency hiding the real employer, predicts the interview process and likely questions, generates STAR stories from the CV, talking points, and smart reverse questions.

## Modes

```
CV + JD + mode
      |
  Preprocessor  (parse CV + JD into typed schemas)
      |
  Mode Router
     / \
recruiter  candidate
    |           |
Fit Analyzer   Research Agent  (Tavily: web search + extract)
    |               |
Verdict         STAR Writer + Interview Prep  (parallel)
   / \               \         /
fit  no-fit           Join
  |      |              |
Outreach  Gap        Synthesizer
Writer  Explainer
```

The `is_likely_agency_posting` flag from the Research Agent is displayed as a banner in the UI — the feature that makes the demo screenshot worth sharing.

## Architecture

Google ADK v2 graph-based workflow. Every LLM node has a typed Pydantic output schema. Code-only nodes (Mode Router, Verdict Router, Join, Synthesizer) are pure Python — no LLM where it adds no value.

**Agents (LLM)**
- Input Preprocessor — parses raw CV and JD text into `ParsedCV` + `ParsedJD` typed schemas. Runs once, shared by all downstream nodes.
- Fit Analyzer — outputs `FitVerdict` (fit / borderline / no_fit, confidence, matched evidence, gaps).
- Outreach Writer — Gemini 2.5 Pro. Personalized LinkedIn DM citing a specific CV achievement.
- Gap Explainer — human-readable gap breakdown + adjacent role suggestions.
- Research Agent — autonomous agent with Tavily tools (search + extract). Outputs `CompanyIntelligence` including `is_likely_agency_posting`.
- STAR Writer — 5-6 STAR+R stories from the CV, mapped to the JD.
- Interview Prep — probable questions, talking points, reverse questions.

**Code nodes (no LLM)**
- Mode Router, Verdict Router, Join (ADK JoinNode), Synthesizer

## Tech stack

| Layer    | Stack                                                            |
| -------- | ---------------------------------------------------------------- |
| Backend  | Python 3.12, FastAPI, Google ADK v2, uv                         |
| Models   | Gemini 2.5 Flash (most nodes), Gemini 2.5 Pro (Outreach Writer) |
| Research | Tavily (tavily_search + tavily_extract)                          |
| Frontend | Streamlit — single page, radio mode selector, progressive output |
| Deploy   | HuggingFace Spaces (public demo) + Dockerfile for Cloud Run      |

## Status

Active development, built incrementally.

- [x] Project structure + FastAPI backend boots
- [ ] Pydantic schemas (ParsedCV, ParsedJD, FitVerdict, CompanyIntelligence, PostDraft)
- [ ] Input Preprocessor agent
- [ ] Recruiter branch (Fit Analyzer, Outreach Writer, Gap Explainer)
- [ ] Candidate branch (Research Agent, STAR Writer, Interview Prep)
- [ ] ADK graph wiring (fan-out, JoinNode, routers)
- [ ] Streamlit frontend
- [ ] HuggingFace Spaces deploy

## Setup

### Prerequisites

- Python 3.12 with [uv](https://docs.astral.sh/uv/)
- A [Google API key](https://aistudio.google.com) for Gemini
- A [Tavily API key](https://tavily.com) for web search

### Install

```bash
cd backend
uv sync
```

### Configure

```bash
cp backend/.env.example backend/.env   # fill in GOOGLE_API_KEY and TAVILY_API_KEY
```

## Running

```bash
cd backend
uv run uvicorn app.main:app --reload --port 8080 --env-file .env
```

API docs at http://localhost:8080/docs.

## License

[MIT](./LICENSE)
