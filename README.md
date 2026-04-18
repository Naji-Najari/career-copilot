<h1 align="center">trend-writer</h1>

<p align="center">
  <strong>AI agent that drafts posts from real trending signal, not noise.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-WIP-orange" alt="Status" />
  <img src="https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white" alt="Python 3.12" />
  <img src="https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Google_ADK-v2-4285F4?logo=google&logoColor=white" alt="Google ADK v2" />
  <img src="https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/uv-managed-DE5FE9?logo=astral&logoColor=white" alt="uv" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License MIT" />
</p>

<p align="center">
  <a href="#what-it-does">What it does</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#tech-stack">Tech stack</a> ·
  <a href="#setup">Setup</a> ·
  <a href="#running">Running</a> ·
  <a href="#docs">Docs</a>
</p>

---

Pick a domain. The agent scans GitHub trending, Hacker News, and the public web in parallel, ranks the topics, lets you choose one, researches it deeper, then drafts content tailored to the platform you want (LinkedIn, Twitter thread, blog). Built on Google ADK v2 graph workflows with human-in-the-loop at every decision point.

## Who it is for

Technical builders who want to post consistently but hate the guesswork of "what should I even talk about". Instead of generic AI slop, the agent grounds every draft in live trending signal from sources you trust.

## What it does

```
Pick a domain  ->  scan trends (parallel)  ->  pick a topic  ->  deep research
              ->  pick platform(s)  ->  draft (single or cascade)
              ->  approve or refine  ->  done
```

Every arrow where the user has a choice is an explicit pause in the workflow, not a chat prompt the agent might skip.

## Architecture

Google ADK v2 graph workflow. Four human-in-the-loop checkpoints, three conditional routers, two parallel stages, one refinement loop.

```
                           START
                             │
                             ▼
              ┌────────────────────────────┐
              │ request_domain             │  HITL
              └──────────────┬─────────────┘
                             ▼
              ┌────────────────────────────┐
              │ scan_trends                │  ParallelAgent
              │   github + hn + web_buzz   │  filtered by domain
              └──────────────┬─────────────┘
                             ▼
              ┌────────────────────────────┐
              │ request_topic              │  HITL
              └──────────────┬─────────────┘
                             ▼
              ┌────────────────────────────┐
              │ research_topic             │  LlmAgent + Tavily
              └──────────────┬─────────────┘
                             ▼
              ┌────────────────────────────┐
              │ request_platform           │  HITL
              └──────────────┬─────────────┘
                             ▼
                    ┌─────────────────┐
                    │ platform_router │  Router
                    └────────┬────────┘
             ┌───────────┬───┴────┬─────────────┐
         LINKEDIN     TWITTER   BLOG          ALL
             │           │        │             │
             ▼           ▼        ▼             ▼
        linkedin_   twitter_   blog_      cascade_writers
         writer     writer    writer      ParallelAgent
             └───────────┴────────┴─────────────┘
                         ▼
              ┌────────────────────────────┐
              │ request_approval           │  HITL
              └──────────────┬─────────────┘
                             ▼
                    ┌──────────────────┐
                    │ approval_router  │  Router
                    └────────┬─────────┘
                      ┌──────┴──────┐
                   APPROVE        REFINE
                      │             │
                      ▼             └──> loops back to writer
                     END
```

## Tech stack

| Layer    | Stack                                                       |
| -------- | ----------------------------------------------------------- |
| Backend  | Python 3.12, FastAPI, Google ADK v2, Gemini 2.5 Pro, uv     |
| Tools    | MCP servers: GitHub (trending) + Tavily (web search)        |
| Frontend | Next.js 15, React 19, Tailwind v4, shadcn/ui                |
| Deploy   | Backend on Google Cloud Run, frontend on Render             |

## Status

Currently in active development. The pipeline is being built incrementally:

- [x] FastAPI backend boots with `/health`
- [x] First pass at trend scanner + post writer agents
- [ ] Full ADK graph with HITL checkpoints
- [ ] MCP integrations (GitHub + Tavily) wired in
- [ ] Frontend (Next.js) bootstrap
- [ ] Cloud Run + Render deploy

## Setup

### 1. Prerequisites

- Python 3.12 with [uv](https://docs.astral.sh/uv/)
- Node 22
- A [Google API key](https://aistudio.google.com) for Gemini
- A [Tavily API key](https://tavily.com) for web search
- A [GitHub personal access token](https://github.com/settings/tokens) for the GitHub MCP server

### 2. Install dependencies

Backend:

```bash
cd backend
uv sync
cd ..
```

Frontend:

```bash
cd frontend
npm install
cd ..
```

### 3. Configure environment

```bash
cp backend/.env.example backend/.env           # fill in your keys
cp frontend/.env.example frontend/.env.local
```

## Running

**Option 1.** One command, both servers:

```bash
./start.sh
```

**Option 2.** Manual, two terminals:

```bash
# Terminal 1
cd backend
uv run uvicorn app.main:app --reload --port 8080 --env-file .env
```

```bash
# Terminal 2
cd frontend
npm run dev
```

Then open http://localhost:3000.

## Docs

- [Backend README](./backend/README.md) — FastAPI app, ADK agents, run instructions
- [Frontend README](./frontend/README.md) — Next.js app, UI components

## Contributing

Issues and PRs welcome. For larger changes, open an issue first to discuss what you'd like to change.

## License

[MIT](./LICENSE)