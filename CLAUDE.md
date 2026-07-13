# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository structure

Single monorepo for "ExpenseTracker" with two independently-run halves — no shared root
`package.json` or workspace tooling ties them together, each has its own `node_modules` and is started
separately.

- `frontend/` — a Next.js 16 (App Router) app. Landing page plus `login`, `signup`, `wallets`,
  `categories`, `transactions`, and `about` routes under `app/`, built with shadcn/ui components
  (`components/`, `components.json`) and `react-hook-form` + `zod` for form validation
  (`lib/validation/`).
- `backend/` — an Express + TypeScript + Prisma/PostgreSQL API implementing the REST contract the
  frontend expects (see "Backend architecture notes" below). Session-based auth via `express-session`
  + `connect-pg-simple` + `bcrypt`.

## Commands

Frontend (run from `frontend/`):

```bash
npm run dev      # start the Next.js dev server (http://localhost:3000)
npm run build    # production build
npm run start    # run the production build
npm run lint     # eslint (flat config in eslint.config.mjs)
```

Backend (run from `backend/`, needs a local Postgres reachable via `DATABASE_URL` — see `.env.example`):

```bash
npm run dev              # tsx watch server.ts (http://localhost:4000 by default)
npm run build            # tsc -> dist/
npm run start            # node dist/server.js
npm run prisma:generate  # regenerate the Prisma client after schema changes
npm run prisma:migrate   # create/apply a dev migration
```

There is no test runner configured in either package yet.

## Important: this Next.js version is newer than your training data

`frontend/package.json` pins `next@16.2.10` and `react@19.2.4` — versions that post-date typical
training data and that introduce breaking API/convention changes vs. older Next.js knowledge. Per
`frontend/AGENTS.md`, **read the relevant guide under `frontend/node_modules/next/dist/docs/` before
writing or editing any frontend code**, and follow any deprecation notices found there rather than
relying on prior knowledge of Next.js conventions (e.g. routing, data fetching, config shape).

## Frontend architecture notes

- App Router structure lives under `frontend/app/` (`layout.tsx` is the root layout, `page.tsx` is the
  home/landing route). Feature routes: `login/`, `signup/`, `wallets/`, `categories/`, `transactions/`,
  `about/`.
- Path alias `@/*` resolves to the `frontend/` root (see `tsconfig.json`).
- Styling is Tailwind CSS v4 via `@tailwindcss/postcss` (config-free, CSS-first setup) — check
  `app/globals.css` for theme tokens rather than expecting a `tailwind.config.ts`.
- ESLint uses the flat-config format (`eslint.config.mjs`), composing `eslint-config-next`'s
  `core-web-vitals` and `typescript` rule sets.
- UI components are shadcn/ui (`style: base-nova`, per `components.json`) with Tailwind + CVA —
  generic primitives in `components/ui/`, feature components grouped by domain in `components/auth/`,
  `components/wallets/`, `components/categories/`, `components/transactions/`.
- `lib/api.ts` centralizes all backend calls (`authApi`, `walletsApi`, `categoriesApi`,
  `transactionsApi`) via a shared `apiFetch` helper that targets `NEXT_PUBLIC_API_URL` (defaults to
  `http://localhost:4000`) with `credentials: "include"`.
- `lib/auth-context.tsx` holds client-side auth state; `lib/validation/` holds the `zod` schemas used
  by `react-hook-form`.
- Route protection is `proxy.ts` at the frontend root (Next 16 renamed `middleware.ts` to `proxy.ts` —
  don't recreate a `middleware.ts`). It gates `/wallets`, `/categories`, and `/transactions` behind the
  `etx.sid` session cookie, redirecting to `/login` when absent.

## Backend architecture notes

- Entry point `backend/server.ts` just loads env and starts `src/app.ts`'s Express `app`. Route mounting
  lives in `src/app.ts`: `corsMiddleware` → `express.json()` → `sessionMiddleware` → routes → `errorHandler`.
- Feature modules under `src/modules/{auth,wallets,categories,transactions}/`, each with
  `*.routes.ts` / `*.controller.ts` / `*.service.ts` / `*.validators.ts` (zod). Mounted at
  `/api/auth`, `/api/wallets`, `/api/categories`, `/api/transactions` — matches `frontend/lib/api.ts`
  exactly.
- Auth is session-cookie based (cookie name `etx.sid`, set via `src/config/session.ts` using
  `connect-pg-simple` for a Postgres-backed session store), not bearer tokens. Passwords hashed with
  `bcrypt`.
- `src/config/env.ts` requires `DATABASE_URL`, `SESSION_SECRET`, `FRONTEND_ORIGIN` at startup (throws if
  missing) and defaults `PORT` to `4000`. Copy `.env.example` to `.env` for local dev — `.env` is
  gitignored, never commit it.
- Prisma schema at `prisma/schema.prisma`; migrations in `prisma/migrations/` (wallets, categories,
  transactions added incrementally — check migration history before assuming a field exists).
- `src/config/cors.ts` restricts CORS to `FRONTEND_ORIGIN` (the frontend's origin, not a wildcard) since
  cookies require `credentials: true` on both sides.
