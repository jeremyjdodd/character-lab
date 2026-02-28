# CLAUDE.md — Rovo Character Lab

This file provides guidance for AI assistants working in this repository.

## Project Overview

**Rovo Character Lab** is a full-stack web application for comparing AI prompt personalities side-by-side. Users define two personality prompts (A and B), run the same test prompt through both, and receive linguistic/behavioral analysis of the differences. It supports both OpenAI (GPT-5) and Anthropic (Claude Sonnet 4) models.

The actual project source lives inside the `RovoCharacterLab/` directory (extracted from `RovoCharacterLab.zip`).

---

## Repository Layout

```
character-lab/
├── RovoCharacterLab.zip          # Archived source (extract to RovoCharacterLab/)
└── RovoCharacterLab/             # Main project root
    ├── client/                   # React frontend (Vite)
    │   ├── index.html
    │   └── src/
    │       ├── App.tsx           # Root component, routing setup
    │       ├── main.tsx          # Entry point
    │       ├── index.css         # Global Tailwind styles
    │       ├── components/       # Feature + UI components
    │       │   ├── analysis-panel.tsx     # Tabbed results display
    │       │   ├── diff-viewer.tsx        # Side-by-side text diff
    │       │   ├── personality-controls.tsx # Trait sliders for Prompt B
    │       │   ├── prompt-panel.tsx       # Prompt input + response display
    │       │   ├── sidebar.tsx            # Model selector + run button
    │       │   └── ui/                    # shadcn/ui primitive components
    │       ├── hooks/
    │       │   ├── use-mobile.tsx
    │       │   └── use-toast.ts
    │       ├── lib/
    │       │   ├── diff-utils.ts          # Line/word diff algorithms
    │       │   ├── queryClient.ts         # TanStack Query + apiRequest helper
    │       │   └── utils.ts               # cn() classname helper
    │       └── pages/
    │           ├── comparison-lab.tsx     # Main page (all state lives here)
    │           └── not-found.tsx
    ├── server/
    │   ├── index.ts              # Express app bootstrap + middleware
    │   ├── routes.ts             # All API route definitions
    │   ├── storage.ts            # IStorage interface + MemStorage implementation
    │   ├── vite.ts               # Vite dev-server middleware integration
    │   └── services/
    │       ├── ai-service.ts     # Generates AI responses (OpenAI / Anthropic)
    │       └── analysis-service.ts # Compares responses via AI, returns structured JSON
    ├── shared/
    │   └── schema.ts             # Drizzle ORM tables + Zod schemas + shared types
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── postcss.config.js
    ├── drizzle.config.ts
    └── components.json           # shadcn/ui configuration
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| Routing | Wouter |
| Server state | TanStack Query (React Query) v5 |
| UI components | shadcn/ui (Radix UI + Tailwind CSS) |
| Backend | Express.js (ESM mode) + TypeScript |
| AI providers | Anthropic SDK (`claude-sonnet-4-20250514`), OpenAI SDK (`gpt-5`) |
| ORM | Drizzle ORM |
| Database | PostgreSQL via Neon serverless (optional; default is MemStorage) |
| Schema validation | Zod + drizzle-zod |
| Runtime (dev) | tsx |
| Production bundler | esbuild (server) + Vite (client) |

---

## Development Commands

All commands run from `RovoCharacterLab/`:

```bash
# Install dependencies
npm install

# Start development server (Express + Vite HMR on port 5000)
npm run dev

# Type-check (no emit)
npm run check

# Production build
npm run build

# Run production build
npm start

# Push database schema (requires DATABASE_URL)
npm run db:push
```

The dev server serves both the API (`/api/*`) and the Vite-proxied frontend on the same port (default `5000`, overridden by `$PORT`).

---

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | Yes (for GPT-5) | OpenAI API access |
| `ANTHROPIC_API_KEY` | Yes (for Claude) | Anthropic API access |
| `DATABASE_URL` | Only for DB persistence | PostgreSQL connection string (Neon) |
| `PORT` | No | HTTP port (default `5000`) |

Without `DATABASE_URL`, the app uses **in-memory storage** (`MemStorage`) and data resets on restart.

---

## Architecture Patterns

### Frontend Data Flow

1. All application state lives in `comparison-lab.tsx` (the single page).
2. Server state is fetched/mutated via TanStack Query using the `apiRequest` helper from `lib/queryClient.ts`.
3. Query keys mirror the API URL structure: `["/api/prompt-tests", testId, "responses", "A", "latest"]`.
4. `staleTime: Infinity` — queries never auto-refetch; data is invalidated explicitly after mutations.

### API → Service → Storage Chain

```
POST /api/prompt-tests/:id/generate/:promptType
  └─> AIService.generateResponse()         (server/services/ai-service.ts)
        └─> OpenAI or Anthropic SDK call
  └─> storage.createPromptResponse()       (server/storage.ts)

POST /api/prompt-tests/:id/analyze
  └─> storage.getLatestPromptResponse() × 2
  └─> AnalysisService.analyzeResponses()   (server/services/analysis-service.ts)
        └─> AI call returns structured JSON
  └─> storage.createAnalysisResult()
```

### Storage Abstraction

`IStorage` (in `server/storage.ts`) defines the full data access interface. `MemStorage` is the default implementation using in-memory `Map`s. To swap in a database, implement `IStorage` against Drizzle and replace the `storage` export — no route changes needed.

### Personality Traits

Prompt B accepts four numeric traits (1–10):

| Trait | Low (1–5) | High (6–10) |
|---|---|---|
| `tone` | formal / professional | enthusiastic / engaging |
| `initiative` | responsive / direct | proactive / anticipates needs |
| `depth` | concise | comprehensive / detailed |
| `outputStyle` | structured / systematic | creative with analogies |

Traits are appended to the system prompt in `AIService.buildPersonalityPrompt()`.

---

## Key Conventions

### Path Aliases (TypeScript)

```ts
"@/*"       → ./client/src/*
"@shared/*" → ./shared/*
```

Use these aliases everywhere — never use relative paths to cross the `client/`, `server/`, or `shared/` boundary.

### Shared Types

All types shared between client and server live in `shared/schema.ts`. Import them with `@shared/schema`. Never duplicate type definitions across the boundary.

### Zod Validation

- All API request bodies are validated with Zod schemas derived from `drizzle-zod` (`createInsertSchema`).
- `insertPromptTestSchema`, `insertPromptResponseSchema`, `personalityTraitsSchema` are the primary validators in routes.
- If you add a new field to a table, update the Drizzle schema in `shared/schema.ts` first, then re-derive Zod types.

### API Error Responses

All errors follow this shape:
```json
{ "message": "Human-readable description", "error": "Details (dev only)" }
```
Return `400` for validation failures, `404` for missing resources, `500` for unexpected errors.

### AI Model Detection

Model type strings are detected by substring check in both service files:
- Contains `"gpt"` or `"openai"` → OpenAI SDK
- Contains `"claude"` or `"anthropic"` → Anthropic SDK

Do not change this logic without updating both `ai-service.ts` and `analysis-service.ts`.

### Analysis Response Format

`AnalysisService.analyzeResponses()` must always return an `AnalysisResult` with four top-level keys: `linguisticDifferences`, `personalityScores`, `readerImpact`, `sentimentAnalysis`. The OpenAI path uses `validateAndFillDefaults()` to guarantee this shape even when the model returns partial data; the Anthropic path trusts the model response directly — add similar validation if that proves unreliable.

### UI Components

- Use components from `client/src/components/ui/` (shadcn/ui). Do not install new UI libraries without discussion.
- The design system variant is **"New York"** (see `components.json`).
- Tailwind is version 3; utility classes follow the standard Tailwind v3 API.
- `cn()` from `lib/utils.ts` merges class names (wraps `clsx` + `tailwind-merge`).

### data-testid Attributes

Components and key buttons carry `data-testid` attributes (e.g., `"panel-prompt-a"`, `"button-save-test"`). Preserve these when refactoring — they are used for automated testing.

---

## Database Schema (Drizzle / PostgreSQL)

All tables use `gen_random_uuid()` for primary keys.

| Table | Key columns |
|---|---|
| `users` | `id`, `username`, `password` |
| `prompt_tests` | `id`, `name`, `userId`, `promptA`, `personalityA`, `promptB`, `personalityB`, `testPrompt`, `modelType` |
| `prompt_responses` | `id`, `testId`, `promptType` ("A"/"B"), `response`, `responseTime`, `personalityTraits` (JSON) |
| `analysis_results` | `id`, `testId`, `linguisticDifferences`, `personalityScores`, `readerImpact`, `sentimentAnalysis` (all JSON) |

Run `npm run db:push` (requires `DATABASE_URL`) to sync schema changes to the database.

---

## Build & Deployment

**Development:**
- `npm run dev` starts `tsx server/index.ts` which boots Express and attaches Vite middleware for HMR.
- Frontend root is `client/`, Vite proxies API calls to the same Express process.

**Production:**
```bash
npm run build
# → vite build  (client → dist/public/)
# → esbuild     (server → dist/index.js)
npm start
# → node dist/index.js  (serves static frontend + API)
```

**Replit-specific:** `vite.config.ts` conditionally loads `@replit/vite-plugin-cartographer` and `@replit/vite-plugin-dev-banner` only when `REPL_ID` is set. These are safe to ignore outside Replit.

---

## What Does Not Exist Yet

- Authentication (schema has `users` table but no login routes/session middleware)
- Persistent test history / list endpoints
- Test framework / automated tests (`tsconfig.json` excludes `**/*.test.ts`)
- CI/CD configuration
- Docker / containerization
- Rate limiting or API key validation middleware
