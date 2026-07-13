# ExpenseTracker

A full-stack expense tracking app: wallets, categories, and transactions, behind session-based auth.

## Structure

Monorepo with two independently-run halves (no shared root `package.json` or workspace tooling):

- `frontend/` — Next.js 16 (App Router), Tailwind CSS v4, shadcn/ui, `react-hook-form` + `zod`.
- `backend/` — Express + TypeScript + Prisma/PostgreSQL, session-cookie auth (`express-session` +
  `connect-pg-simple` + `bcrypt`).

See `CLAUDE.md` for detailed architecture notes on both halves.

## Features so far

- Signup / login / logout with server-side sessions
- Wallets — create, list, edit, delete
- Categories — create, list, edit, delete
- Transactions — create, list (filterable by wallet, category, date range), edit, delete
- About page

## Getting started

### Backend

```bash
cd backend
cp .env.example .env   # fill in DATABASE_URL, SESSION_SECRET, FRONTEND_ORIGIN
npm install
npm run prisma:migrate
npm run dev             # http://localhost:4000
```

Requires a local PostgreSQL instance reachable via `DATABASE_URL`.

### Frontend

```bash
cd frontend
npm install
npm run dev              # http://localhost:3000
```

Set `NEXT_PUBLIC_API_URL` if the backend isn't running on the default `http://localhost:4000`.

## Status

Early-stage / actively developed. No test runner configured yet in either package.
