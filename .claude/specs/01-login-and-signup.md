# Spec: Login and Signup

## Overview

This is the foundational feature of the expense tracker: it stands up the first real backend
service and the first authenticated user flow. Today `backend/` is an empty scaffold (no
framework, no dependencies) and `frontend/` is the unmodified `create-next-app` starter. This
feature introduces an Express + TypeScript API backed by Postgres (via Prisma) with server-side,
cookie-based sessions, plus matching Next.js signup and login pages. Every later expense-tracking
feature (adding expenses, viewing reports, etc.) depends on users being able to create an account
and authenticate, so this must land first.

## Depends on

None — this is step 01, the first feature in the roadmap.

## Routes

Backend (Express, mounted under `/api/auth`, served separately from the Next.js app):

- `POST /api/auth/signup` — create a new account (email + password) — public
- `POST /api/auth/login` — authenticate and start a server-side session — public
- `POST /api/auth/logout` — destroy the current session — logged-in
- `GET /api/auth/me` — return the current session's user (id, email) — logged-in

Frontend (Next.js App Router):

- `GET /signup` — signup form page — public
- `GET /login` — login form page — public

## Templates

- **Create:**
  - `frontend/app/signup/page.tsx` — signup page
  - `frontend/app/login/page.tsx` — login page
  - `frontend/components/auth/signup-form.tsx` — ShadcnUI signup form
  - `frontend/components/auth/login-form.tsx` — ShadcnUI login form
  - `frontend/components/ui/button.tsx`, `input.tsx`, `label.tsx`, `card.tsx`, `form.tsx` — shadcn/ui primitives generated via `shadcn` CLI
- **Modify:**
  - `frontend/app/layout.tsx` — wrap app in an auth/session context provider so client components can read current-user state
  - `frontend/app/page.tsx` — show a logged-in/logged-out state and links to `/login` / `/signup`

## Files to change

- `backend/package.json` — add dependencies, `dev`/`build`/`start` scripts
- `backend/server.ts` — becomes the Express app entry point
- `frontend/package.json` — add shadcn/ui + form-handling dependencies
- `frontend/app/layout.tsx`
- `frontend/app/page.tsx`
- `frontend/components.json` — created by `shadcn init` if not present

## Files to create

Backend:

- `backend/tsconfig.json`
- `backend/src/app.ts` — Express app, middleware, route mounting
- `backend/src/routes/auth.routes.ts`
- `backend/src/controllers/auth.controller.ts` — signup/login/logout/me handlers
- `backend/src/lib/prisma.ts` — Prisma client singleton
- `backend/src/middleware/require-auth.ts` — session-guard middleware for logged-in routes
- `backend/prisma/schema.prisma` — `User` model (id, email, passwordHash, createdAt) and session table for `connect-pg-simple`
- `backend/.env.example` — `DATABASE_URL`, `SESSION_SECRET`, `PORT`, `FRONTEND_ORIGIN`

Frontend:

- `frontend/app/login/page.tsx`
- `frontend/app/signup/page.tsx`
- `frontend/components/auth/login-form.tsx`
- `frontend/components/auth/signup-form.tsx`
- `frontend/lib/auth-context.tsx` — client-side context that fetches `/api/auth/me` on load
- `frontend/lib/api.ts` — fetch helper that always sends `credentials: "include"` to the backend
- `frontend/middleware.ts` — redirect unauthenticated requests away from future logged-in-only routes (session cookie presence check only; actual validation happens server-side)
- `frontend/.env.local.example` — `NEXT_PUBLIC_API_URL`

## New dependencies

Backend (`backend/package.json`):

- `express`, `@prisma/client`, `express-session`, `connect-pg-simple`, `bcrypt`, `cors`, `dotenv`, `zod`
- Dev: `prisma`, `typescript`, `tsx`, `@types/express`, `@types/express-session`, `@types/connect-pg-simple`, `@types/bcrypt`, `@types/cors`, `@types/node`

Frontend (`frontend/package.json`):

- `zod`, `react-hook-form`, `@hookform/resolvers`
- shadcn/ui support deps pulled in by the `shadcn` CLI: `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, plus whichever `@radix-ui/*` packages the generated `button`/`input`/`label`/`card`/`form` components require

## Rules for implementation

- If a feature needs API implementation, you can add it.
- All templates make ShadcnUi.
- Backend and frontend stay separate services: Express listens on its own port (e.g. `4000`), Next.js stays on `3000`; the frontend calls the backend over HTTP with `credentials: "include"`.
- Sessions are server-side (`express-session` + `connect-pg-simple`), stored in Postgres, delivered via an `httpOnly`, `sameSite=lax` cookie — never store the session token in `localStorage` or a non-httpOnly cookie.
- Passwords are hashed with `bcrypt` before storage; plaintext passwords are never logged or persisted.
- `cors` on the backend must be configured with a specific `FRONTEND_ORIGIN` and `credentials: true` — no wildcard origins.
- Validate signup/login request bodies with `zod` on the backend; mirror the same validation rules in the frontend forms via `react-hook-form` + `@hookform/resolvers`.
- Prisma is the only DB access layer — no raw SQL in controllers.
- Secrets (`DATABASE_URL`, `SESSION_SECRET`) live in `.env` files that are gitignored; only `.env.example` files are committed.

## Definition of done

- [ ] `npm run dev` in `frontend/` starts the Next.js app on `http://localhost:3000` with no errors
- [ ] `npm run dev` in `backend/` starts the Express app on its configured port with no errors, connected to Postgres
- [ ] `POST /api/auth/signup` with a new email/password returns `201` and creates a `User` row (password stored hashed, not plaintext)
- [ ] `POST /api/auth/signup` with an already-registered email returns a `4xx` error and no duplicate row is created
- [ ] `POST /api/auth/login` with correct credentials returns `200` and a `Set-Cookie` session cookie
- [ ] `POST /api/auth/login` with an incorrect password returns `401`
- [ ] `GET /api/auth/me` with a valid session cookie returns the logged-in user's `id`/`email`
- [ ] `GET /api/auth/me` with no session cookie returns `401`
- [ ] `POST /api/auth/logout` destroys the session; a subsequent `GET /api/auth/me` with the same cookie returns `401`
- [ ] Visiting `/signup` and `/login` in the browser renders ShadcnUI-styled forms with client-side validation errors on bad input
- [ ] Submitting the signup form in the browser creates an account and transitions the UI to a logged-in state
- [ ] Submitting the login form in the browser authenticates and transitions the UI to a logged-in state
- [ ] Reloading the page while logged in keeps the user authenticated (session persists via the cookie)
