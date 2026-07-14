# ExpenseTracker

> Every dollar, accounted for.

A full-stack personal finance ledger — wallets, categories, transactions, budgets, and reports,
built with a Next.js 16 + Express/Prisma stack and a deliberate paper-ledger design identity
instead of another generic finance-dashboard template.

## Table of Contents

- [About the Project](#about-the-project)
- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Contact](#contact)

## About the Project

ExpenseTracker started as a plain paper ledger and a bad habit of losing receipts. Most expense
trackers ask you to change how you spend — this one bets that the habit worth building is
visibility, not discipline: once you can actually see where the money goes, the rest tends to
follow on its own. So it's built around the oldest tool for the job, the ledger, rebuilt for a
browser instead of a notebook in a drawer.

It's also a hands-on practice project: every feature — from the Prisma schema to the final pixel
— was built end-to-end through a spec → plan → implement workflow paired with
[Claude Code](https://claude.com/claude-code), Anthropic's AI coding agent, as a real case study
in shipping a multi-week full-stack app with an AI collaborator rather than just autocomplete.

## Project Overview

ExpenseTracker is a monorepo with two independently-run halves — a Next.js frontend and an
Express/Prisma backend — talking over a session-cookie-authenticated REST API.

The user journey: sign up, add one or more wallets (cash, bank, credit card), set up income/expense
categories, and start logging transactions. From there the app helps out — auto-suggesting a
category from a transaction's note based on your own spending history, tracking monthly budgets
per category with live progress, and rolling everything up into a tab-based dashboard: an
at-a-glance Overview, plus Wallets, Categories, Transactions, Budgets, and Reports & Insights, all
inside one page with no reloads between them. A Profile tab handles account/email/password
management and account deletion.

## Key Features

What makes this project distinct, beyond the standard CRUD-and-auth checklist:

- **A real design identity, not a template dashboard** — a serif/monospace "paper ledger" aesthetic
  (dashed dividers, itemized rows, numbered sections) applied consistently across every screen,
  instead of a generic admin-panel look.
- **One unified workspace** — Wallets, Categories, Transactions, Budgets, and Reports all live as
  tabs inside a single `/dashboard` shell, so switching context never costs a page reload.
- **Auto-categorization from your own habits, not a third-party ML API** — transaction notes are
  matched against your own transaction history by keyword overlap to suggest a category, so the
  suggestions get better the more you use the app.
- **Budgets computed live, never cached** — a monthly limit per expense category, with "amount
  spent so far" always derived fresh from the ledger at read time, so it can never drift out of
  sync with your actual transactions.
- **Reports & Insights with historical range analysis** — pick a preset (3/6/12 months,
  year-to-date) or a custom date range and get a month-by-month income/expense trend, a category
  breakdown, computed insights (top expense category, average monthly spend, change vs. the prior
  period), and a one-click CSV export of the underlying transactions.
- **Auth done the boring, correct way** — Postgres-backed server-side sessions
  (`express-session` + `connect-pg-simple`), not a JWT sitting in `localStorage`, with every single
  query scoped to the authenticated user's own data.
- **Built collaboratively with an AI agent** — the entire feature set was designed and implemented
  through an explicit spec-and-plan workflow with Claude Code, making this repo's commit history a
  practical example of AI-paired full-stack development rather than a single AI-generated dump.

## Tech Stack

**Frontend** (`frontend/`)
- [Next.js 16](https://nextjs.org/) (App Router) + [React 19](https://react.dev/) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/) (CSS-first config) + [shadcn/ui](https://ui.shadcn.com/) on `@base-ui/react`
- `react-hook-form` + `zod` for form validation
- `Vitest` + `Testing Library` for component/integration tests

**Backend** (`backend/`)
- [Express](https://expressjs.com/) + TypeScript
- [Prisma ORM](https://www.prisma.io/) + PostgreSQL
- Session-cookie auth: `express-session` + `connect-pg-simple` + `bcrypt`
- `zod` for request validation
- `Vitest` + `Supertest` for API tests

## Installation

### Prerequisites

- Node.js
- A local PostgreSQL instance

### Backend

```bash
cd backend
cp .env.example .env   # fill in DATABASE_URL, SESSION_SECRET, FRONTEND_ORIGIN
npm install
npm run prisma:migrate
npm run dev             # http://localhost:4000
```

### Frontend

```bash
cd frontend
npm install
npm run dev              # http://localhost:3000
```

Set `NEXT_PUBLIC_API_URL` if the backend isn't running on the default `http://localhost:4000`.

### Running tests

```bash
cd backend && npm test    # Vitest + Supertest
cd frontend && npm test   # Vitest + Testing Library
```

See `CLAUDE.md` for detailed architecture notes on both halves.

## Contact

**Abdullah Mamun**

- Email: [hello.abdullahmamun1@gmail.com](mailto:hello.abdullahmamun1@gmail.com)
- GitHub: [github.com/abdullahmamun1](https://github.com/abdullahmamun1)
- Portfolio: [abdullah-mamun-portfolio.vercel.app](https://abdullah-mamun-portfolio.vercel.app/)
