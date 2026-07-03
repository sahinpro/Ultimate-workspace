# Ultimate Workspace

AI-powered productivity workspace with Smart Routine Engine, prayer-aware scheduling, tasks, and encrypted vault.

## Stack

Next.js 15 · TypeScript · Tailwind · shadcn/ui · Framer Motion · Prisma · PostgreSQL · Auth.js · TanStack Query

## Setup

1. Copy `.env.example` to `.env.local` and fill in values
2. `npm install`
3. `npm run db:push` — apply schema to PostgreSQL
4. `npm run db:seed` — seed profession templates
5. `npm run dev`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run test` | Run unit tests |
| `npm run db:push` | Push Prisma schema |
| `npm run db:seed` | Seed templates |

## Documentation

See [`docs/`](docs/) for PRD, IA, ERD, API, and Routine Engine specs.

## Features

- **Smart Routine Engine** — prayer-aware weekly/daily scheduling with profession templates
- **Tasks** — CRUD with auto-schedule into routine blocks
- **Vault** — AES-256-GCM encrypted secrets
- **Routine Optimizer** — AI-powered schedule suggestions
- **Analytics** — focus time, prayer consistency, productivity score
# Ultimate-workspace
