# trend-writer

**AI agent that drafts posts from real trending signal, not noise.**

Pick a domain. The agent scans GitHub trending, Hacker News, and the public web in parallel, ranks the topics, lets you choose one, researches it deeper, then drafts content tailored to the platform you want (LinkedIn, Twitter thread, blog). Built on Google ADK v2 graph workflows with human-in-the-loop at every decision point.

[Backend README](./backend/README.md) · [Frontend README](./frontend/README.md)

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

**Backend** : Python 3.12, FastAPI, Google ADK v2, Gemini 2.5 Pro, MCP (GitHub + Tavily), uv.
**Frontend** : Next.js 15, React 19, Tailwind v4, shadcn/ui.
**Deploy** : Backend on Google Cloud Run, frontend on Render.

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

## License

[MIT](./LICENSE)
