# Spec: Dashboard

## Overview

A single at-a-glance summary screen that ties together the three resources built so far — wallets,
categories, and transactions — into one read-only view: total net worth across all wallets, this
month's income vs. expense, a spending-by-category breakdown for the current month, and the most
recent transactions. Nothing here is a new resource; it is a reporting layer computed from existing
data, giving the user a reason to open the app beyond logging a single transaction.

## Depends on

- Step 01 (Login and Signup) — the dashboard is a logged-in-only route; all data is scoped to
  `req.session.userId`.
- Step 03 (Accounts / Wallet) — net worth is the sum of every wallet's current balance, reusing the
  existing starting-balance + net-transaction-delta calculation.
- Step 04 (Categories) — the spending breakdown groups by category name/color/type (EXPENSE vs.
  INCOME).
- Step 05 (Transactions) — every figure on the dashboard (net worth, monthly totals, breakdown, recent
  activity) is derived from the transactions table; the "recent transactions" panel lists the same
  shape of data as the transactions page.

## Routes

Backend (Express, mounted at `/api/dashboard`, logged-in only):

- `GET /api/dashboard/summary` — returns the current user's net worth, this-calendar-month income and
  expense totals, this-month spending broken down by category, and the 5 most recent transactions —
  logged-in

Frontend:

- `GET /dashboard` — the dashboard page — logged-in only (gated by `proxy.ts` like `/wallets`,
  `/categories`, `/transactions`)

## Templates

- **Create:**
  - `frontend/app/dashboard/page.tsx` — page shell (header/footer + heading), same pattern as
    `app/wallets/page.tsx`
  - `frontend/components/dashboard/dashboard-summary.tsx` — client component that fetches
    `GET /api/dashboard/summary` on mount and renders the stat row, category breakdown, and recent
    transactions (loading/error/empty states matching `WalletList`/`TransactionList`)
  - `frontend/components/dashboard/stat-card.tsx` — small stat tile (label + dollar figure) used for
    "Net worth", "Income this month", "Expense this month"
  - `frontend/components/dashboard/category-breakdown.tsx` — this-month spending by category as a
    list of rows, each with a proportional CSS bar (width = category total / max category total),
    the category's stored `color`, and its dollar total — no charting library needed
  - `frontend/components/dashboard/recent-transactions.tsx` — read-only list of the 5 most recent
    transactions (date, wallet, category, note, signed amount), linking to `/transactions` for the
    full ledger; no edit/delete affordances here

- **Modify:**
  - `frontend/components/site-header.tsx` — add a "Dashboard" nav link next to "Wallets" /
    "Categories" / "Transactions" in the authenticated nav group
  - `frontend/components/auth/login-form.tsx` — change the post-login `router.push("/")` to
    `router.push("/dashboard")`
  - `frontend/components/auth/signup-form.tsx` — change the post-signup `router.push("/")` to
    `router.push("/dashboard")` (signup logs the user in immediately, same as login)

## Files to change

- `frontend/components/site-header.tsx` — add the "Dashboard" link for authenticated users
- `frontend/components/auth/login-form.tsx` — redirect to `/dashboard` instead of `/` after a
  successful login
- `frontend/components/auth/signup-form.tsx` — redirect to `/dashboard` instead of `/` after a
  successful signup
- `frontend/proxy.ts` — add `/dashboard/:path*` to the `matcher` array alongside the existing
  protected routes
- `frontend/lib/api.ts` — add a `dashboardApi` export with a `summary()` method following the same
  `apiFetch` pattern as `walletsApi`/`categoriesApi`/`transactionsApi`
- `backend/src/app.ts` — mount the new dashboard router at `/api/dashboard`

## Files to create

- `frontend/app/dashboard/page.tsx`
- `frontend/components/dashboard/dashboard-summary.tsx`
- `frontend/components/dashboard/stat-card.tsx`
- `frontend/components/dashboard/category-breakdown.tsx`
- `frontend/components/dashboard/recent-transactions.tsx`
- `frontend/lib/validation/dashboard.ts` — shared `DashboardSummary` type returned by
  `dashboardApi.summary()`, following the plain-type-export pattern in `lib/validation/wallet.ts`
- `backend/src/modules/dashboard/dashboard.routes.ts`
- `backend/src/modules/dashboard/dashboard.controller.ts`
- `backend/src/modules/dashboard/dashboard.service.ts`

## New dependencies

No new dependencies — net worth reuses the existing `Prisma.groupBy` + Decimal-math pattern already
in `wallet.service.ts`, the monthly/category aggregation is plain Prisma queries filtered by a
calendar-month date range, and the category breakdown bars are plain CSS widths (no charting
library).

## Rules for implementation

- If a feature needs API implementation, you can add it.
- All templates make ShadcnUi.
- `GET /api/dashboard/summary` is protected by the existing `requireAuth` middleware and only ever
  reads/aggregates the requesting user's own wallets, categories, and transactions.
- "This month" means the current calendar month in server local time: `occurredAt >= first day of
  current month at 00:00` and `< first day of next month`.
- Net worth calculation must reuse the existing starting-balance + net-transaction-delta logic
  already implemented in `wallet.service.ts` (`listWalletsWithBalance`) rather than re-deriving it —
  net worth is the sum of each wallet's `currentBalance`.
- Category breakdown only includes categories with at least one transaction in the current month; a
  category type of `EXPENSE` and `INCOME` are grouped and shown separately (do not net them against
  each other).
- Recent transactions panel returns exactly the 5 most recently `occurredAt`-ordered transactions
  (same ordering as the transactions list endpoint), each including its wallet and category like the
  existing `transaction.service.ts` `include` pattern.
- If the user has zero wallets, zero categories, or zero transactions, the dashboard must still render
  without erroring — show `$0.00` stats, an empty-state message in place of the category breakdown
  ("No spending recorded this month yet."), and an empty-state message in place of recent
  transactions ("No transactions yet.") — mirroring the empty states already used in
  `WalletList`/`TransactionList`.
- Frontend follows the existing "ledger" design system (Fraunces serif + IBM Plex Mono, cream paper
  palette, dashed section dividers, numbered line items) — stat cards and breakdown rows reuse
  existing theme tokens (`text-stamp`, `text-muted-foreground`, `border-dashed border-border`), no
  new colors beyond each category's own stored `color` value used for its bar.
- The dashboard is read-only: no create/edit/delete actions live on this page; all mutation still
  happens on `/wallets`, `/categories`, `/transactions`.

## Definition of done

- [ ] `npm run dev` in both `frontend/` and `backend/` starts with no errors
- [ ] `GET /api/dashboard/summary` without a session cookie returns `401`
- [ ] Visiting `/dashboard` while logged out redirects to `/login`
- [ ] A brand-new logged-in user with no wallets/categories/transactions sees `/dashboard` render
      with `$0.00` net worth and both empty-state messages, with no console errors
- [ ] After adding wallets and logging transactions across at least two categories in the current
      month, `/dashboard` shows the correct net worth (matching the sum of each wallet's balance on
      `/wallets`), correct this-month income/expense totals, and a category breakdown whose bar
      widths are proportional to each category's share of this month's total
- [ ] The recent-transactions panel shows exactly the 5 most recently dated transactions and matches
      the top entries on `/transactions` (most-recent-first)
- [ ] Transactions dated in a previous calendar month are excluded from the monthly income/expense
      totals and the category breakdown, but still count toward net worth
- [ ] The "Dashboard" link appears in the header nav only when logged in, and navigates to `/dashboard`
- [ ] Submitting the login form with valid credentials redirects to `/dashboard`, not `/`
- [ ] Submitting the signup form successfully redirects to `/dashboard`, not `/`
- [ ] Dashboard data for one user never includes another user's wallets, categories, or transactions
