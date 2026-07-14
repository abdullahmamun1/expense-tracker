# Spec: Reports & Insights

## Overview

A historical, multi-month reporting layer on top of the ledger. Where the Dashboard's Overview tab
(step 07) only ever shows the current calendar month, Reports & Insights lets the user pick a date
range — a preset (3/6/12 months, year-to-date) or a custom from/to — and see income vs. expense
trends across that range, a category breakdown for the whole period, a few computed insights (top
expense category, average monthly expense, change vs. the prior period), and a CSV export of the
underlying transactions. Like the Overview tab, this is a pure read-only aggregation of existing
wallets/categories/transactions data — no new resource is introduced, and no create/edit/delete
actions live here. It ships as a new tab on the existing `/dashboard` page rather than a standalone
route, matching the tab-based consolidation already applied to Wallets, Categories, Transactions, and
Budgets.

## Depends on

- Step 01 (Login and Signup) — reports are private per-user data; every reports route requires an
  authenticated session (`req.session.userId`), and the tab only renders for a logged-in user.
- Step 04 (Categories) — the category breakdown groups transactions by category name/color/type
  (`EXPENSE` vs. `INCOME`), same as the dashboard breakdown.
- Step 05 (Transactions) — every figure (trend, breakdown, insights, CSV export) is derived from the
  transactions table, filtered to an arbitrary date range instead of a single calendar month.
- Step 07 (Dashboard) — Reports is added as a new tab inside `DashboardTabs`
  (`frontend/components/dashboard/dashboard-tabs.tsx`), reusing the tab-switching pattern and the
  `StatCard` component; it also reuses the "current calendar month" boundary math already established
  in `dashboard.service.ts` (`currentMonthRange`), generalized to arbitrary month buckets.

## Routes

Backend (Express, mounted at `/api/reports`, logged-in only):

- `GET /api/reports/summary?from=YYYY-MM-DD&to=YYYY-MM-DD` — returns range totals (income, expense,
  net), a month-by-month income/expense trend, a category breakdown for the whole range, and computed
  insights (top expense category, average monthly expense, percent change vs. the immediately
  preceding period of equal length). `from`/`to` are optional; omitting both defaults to the trailing
  6 full calendar months (5 months ago through the end of the current month) — logged-in
- `GET /api/reports/export?from=YYYY-MM-DD&to=YYYY-MM-DD` — streams a CSV of the current user's
  transactions in the same range (same default as `/summary`), one row per transaction — logged-in

Frontend: no new page route. Reports is a new tab (`reports`) on the existing `GET /dashboard` route,
alongside Overview/Wallets/Categories/Transactions/Budgets — still gated by `proxy.ts` like the rest
of `/dashboard`.

## Templates

- **Create:**
  - `frontend/components/reports/reports-panel.tsx` — client component, fetches
    `GET /api/reports/summary` for the active range on mount and on range change, renders filters +
    trend chart + category breakdown + insights + export button, following the fetch/loading/error
    pattern in `components/dashboard/dashboard-summary.tsx`
  - `frontend/components/reports/report-filters.tsx` — ShadcnUI preset buttons ("3M", "6M", "12M",
    "YTD") plus custom `from`/`to` date `Input` fields; calls back up to `reports-panel.tsx` with the
    selected range
  - `frontend/components/reports/trend-chart.tsx` — one row per month in range, each with a paired
    income/expense CSS bar (same proportional-width technique as
    `components/dashboard/category-breakdown.tsx`, scaled against the max monthly total in the range)
  - `frontend/components/reports/category-breakdown-range.tsx` — same expense/income grouped-bar
    layout as `components/dashboard/category-breakdown.tsx`, reusing the `CategoryBreakdownEntry`
    type, but titled for the selected range instead of "this month"
  - `frontend/components/reports/insights-summary.tsx` — stat row built from the existing `StatCard`
    (`components/dashboard/stat-card.tsx`): total income, total expense, net, top expense category,
    average monthly expense, and percent change vs. the prior period
  - `frontend/components/reports/export-button.tsx` — "Export CSV" button that fetches
    `GET /api/reports/export` for the active range with `credentials: "include"` and triggers a file
    download via a `Blob` + temporary `<a download>` (no new library)
- **Modify:**
  - `frontend/components/dashboard/dashboard-tabs.tsx` — add a sixth `{ key: "reports", label:
    "Reports", icon: BarChart3 }` entry to the `tabs` array and render `<ReportsPanel />` when active

## Files to change

- `frontend/components/dashboard/dashboard-tabs.tsx` — add the "Reports" tab entry and render branch
- `frontend/lib/api.ts` — add a `reportsApi` export with `summary(from?, to?)` (GET
  `/api/reports/summary`) and `exportCsv(from?, to?)` (GET `/api/reports/export`, returns the raw
  `Response` so the caller can read it as a blob), following the existing `apiFetch` pattern
- `backend/src/app.ts` — mount the new reports router at `/api/reports`

## Files to create

Backend (mirrors the existing `backend/src/modules/dashboard/` structure):

- `backend/src/modules/reports/reports.routes.ts`
- `backend/src/modules/reports/reports.controller.ts`
- `backend/src/modules/reports/reports.service.ts`
- `backend/src/modules/reports/reports.validators.ts` — zod schema for the `from`/`to` query params
  (optional ISO date strings; rejects `to` earlier than `from`)

Frontend:

- `frontend/components/reports/reports-panel.tsx`
- `frontend/components/reports/report-filters.tsx`
- `frontend/components/reports/trend-chart.tsx`
- `frontend/components/reports/category-breakdown-range.tsx`
- `frontend/components/reports/insights-summary.tsx`
- `frontend/components/reports/export-button.tsx`
- `frontend/lib/validation/reports.ts` — shared `ReportsSummary`/`MonthlyTrendEntry` types returned by
  `reportsApi.summary()`, importing and reusing `CategoryBreakdownEntry` from
  `lib/validation/dashboard.ts` rather than redefining it

## New dependencies

No new dependencies — the monthly trend and range breakdown reuse the existing
`Prisma.Decimal` + calendar-month-bucket technique already in `dashboard.service.ts`, the bars are
plain CSS widths (no charting library), and CSV export is built with a manual string join plus a
`Blob` download (no CSV or file-saver library).

## Rules for implementation

- If a feature needs API implementation, you can add it.
- All templates make ShadcnUi.
- Both `/api/reports/summary` and `/api/reports/export` are protected by the existing `requireAuth`
  middleware and only ever read the requesting user's own wallets, categories, and transactions —
  never trust a client-supplied user id.
- `from`/`to` are inclusive calendar dates in `YYYY-MM-DD` form, validated in
  `reports.validators.ts`; if both are provided and `to` is before `from`, respond `422`. If neither
  is provided, default to the trailing 6 full calendar months (from the first day of the month 5
  months before the current month through the end of the current month), matching the "first day of
  month" boundary rule already used in `dashboard.service.ts` and `budget.service.ts`.
- The monthly trend buckets transactions by calendar month using the same
  `occurredAt >= start of month` / `< start of next month` technique as `currentMonthRange()` in
  `dashboard.service.ts`, generalized to iterate every month between `from` and `to`.
- The category breakdown groups the same way as the dashboard's (`EXPENSE` and `INCOME` shown as
  separate groups, never netted against each other), but aggregated over the whole selected range
  instead of a single month.
- `topExpenseCategory` is the `EXPENSE` category with the highest total in the range (`null` if there
  are no expense transactions in range). `averageMonthlyExpense` divides total range expense by the
  number of calendar months spanned by the range (minimum 1). The percent-change insight compares
  total expense in the selected range against the immediately preceding period of equal length in
  days; if the prior period has zero expense, report the value as unavailable (`null`) rather than
  dividing by zero.
- `GET /api/reports/export` sets `Content-Type: text/csv` and
  `Content-Disposition: attachment; filename="transactions-<from>-to-<to>.csv"`, with one row per
  transaction (`date, wallet, category, type, amount, note`) ordered by `occurredAt` ascending (oldest
  first, unlike the descending order used by `GET /api/transactions`, since a report reads naturally
  top-to-bottom by date).
- The Reports tab is read-only like the Overview tab: no create/edit/delete actions live here; all
  mutation still happens on the Wallets/Categories/Transactions/Budgets tabs.
- If the selected range has zero transactions, the tab must still render without erroring: `$0.00`
  stat cards, an empty-state message in place of the trend chart and category breakdown ("No
  transactions in this range."), and the export button disabled or a no-op, mirroring the empty
  states already used in `CategoryBreakdown`/`TransactionList`.
- Frontend follows the existing "ledger" design system (Fraunces serif + IBM Plex Mono, cream paper
  palette, dashed section dividers, `rounded-none` inputs/buttons) — no new colors beyond each
  category's own stored `color` and the existing `primary`/`destructive` tokens for income/expense.
- Report data for one user must never include another user's wallets, categories, or transactions.

## Definition of done

- [ ] `npm run dev` in both `frontend/` and `backend/` starts with no errors
- [ ] `GET /api/reports/summary` without a session cookie returns `401`
- [ ] `GET /api/reports/summary` with no `from`/`to` defaults to the trailing 6 full calendar months
      and its totals match a manual sum of that user's transactions in that window
- [ ] `GET /api/reports/summary?from=...&to=...` with a custom range returns totals, a trend, and a
      category breakdown scoped exactly to that window, excluding transactions outside it
- [ ] `GET /api/reports/summary?from=...&to=...` with `to` before `from` returns a `422` validation
      error
- [ ] `GET /api/reports/export` without a session cookie returns `401`
- [ ] `GET /api/reports/export` returns a `text/csv` response with a `Content-Disposition: attachment`
      header, containing exactly the transactions in the requested range, oldest first
- [ ] Visiting `/dashboard` while logged out still redirects to `/login`
- [ ] Clicking the "Reports" tab on `/dashboard` switches without a full page reload and shows the
      trend chart, category breakdown, and insight stat cards for the default 6-month range
- [ ] Selecting a preset range (3M/6M/12M/YTD) updates the trend chart, breakdown, and insights without
      navigation
- [ ] Applying a custom `from`/`to` range updates all three sections to match that window
- [ ] A range with zero transactions renders `$0.00` stats and the empty-state messages, with no
      console errors
- [ ] Clicking "Export CSV" downloads a file whose rows match exactly the transactions shown for the
      active range
- [ ] `topExpenseCategory` and `averageMonthlyExpense` in the response match a manual calculation
      against the same range's transactions
- [ ] Reports data for one user never includes another user's wallets, categories, or transactions
