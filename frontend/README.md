# career-copilot frontend

Next.js 15 + shadcn/ui single-page app. Left: analyze form (CV textarea or PDF upload, JD textarea, mode toggle). Right: agent response rendered per mode.

## Run

```bash
cp .env.local.example .env.local     # NEXT_PUBLIC_API_URL defaults to http://localhost:8080
npm install
npm run dev
```

Open http://localhost:3000. The backend must be running (see `../backend/README.md`).

## Stack

- Next.js 15 (App Router, React 19, TypeScript strict)
- Tailwind v4 (`@tailwindcss/postcss`, no JS config; tokens in `app/globals.css` via `@theme inline`)
- shadcn/ui — `new-york` variant, `neutral` base, CSS variables
- TanStack Query (single mutation per call)
- Zod (inline validation, native `<form>` + FormData pattern)
- Sonner (toasts)
- next-themes (system dark mode, no UI toggle)
- lucide-react (icons)

## Layout

```
app/
├── globals.css       Tailwind v4 + oklch tokens + @theme inline
├── layout.tsx        ThemeProvider + Providers + Toaster
├── providers.tsx     QueryClientProvider
└── page.tsx          Host of the split-view

components/
├── ui/               hand-written shadcn primitives (button, textarea, label,
│                     card, badge, alert, skeleton, toggle-group, sonner)
├── analyze-form.tsx  left panel (mode toggle, CV paste|PDF upload, JD textarea, submit)
└── analyze-response.tsx  right panel (idle | loading | error | success per mode)

lib/
├── utils.ts          cn()
├── schemas.ts        Zod form schema
└── api.ts            fetchAnalyze + fetchExtractPdf + TS types + type guards
```

## API contract (mirrored from backend)

- `POST /v1/analyze` — body `{cv_text, jd_text, mode}`; response is a discriminated union: `RecruiterFitResponse | RecruiterNoFitResponse | CandidateResponse`. See `lib/api.ts` for exact shapes and `isRecruiterFit` / `isRecruiterNoFit` / `isCandidate` guards.
- `POST /v1/extract-pdf` — multipart `file`; response `{text: string}`. Used when the user picks "Upload PDF" for the CV.

## Conventions (mirrored from `Clicklab-frontend`)

- Native `<form>` + Zod `safeParse` + inline field errors + Sonner toasts. NOT react-hook-form.
- `cn()` everywhere for conditional classes.
- Direct imports — no barrel `index.ts` exports.
- Lucide icons; no emoji in UI.
- Color-token-only styling: `bg-primary`, `text-muted-foreground`, etc. Never hex literals.
- Focus-visible ring pattern: `focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring`.

## Scripts

- `npm run dev` — dev server on port 3000
- `npm run build` — production bundle
- `npm run start` — serve the production bundle
- `npm run typecheck` — `tsc --noEmit`

## Known limits (v1)

- No i18n (English-only).
- No auth, no history, no saved analyses.
- No streaming — request is synchronous; loading skeleton while waiting (can be 3-15s in candidate mode).
- PDF extraction is server-side (`pypdf` in the backend); scanned/image-only PDFs return a 422.
