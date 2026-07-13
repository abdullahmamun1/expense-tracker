# Spec: Transactions

## Overview

The third data-bearing feature and the payoff of the expense tracker: users log individual money
movements — each one an amount, a date, an optional note, tied to one of their wallets and one of
their categories. A transaction's direction (money in vs. money out) is not stored redundantly; it
is derived from the category's existing `type` (EXPENSE/INCOME), so the category picked determines
whether the amount adds to or subtracts from the wallet it's logged against. This is the step where
wallets (step 03) and categories (step 04) actually get used together for the first time, and where
the ledger UI starts showing a chronological list of real entries instead of empty-state setup
screens.

## Depends on

- Step 01 (Login and Signup) — transactions are private per-user data; every transaction route
  requires an authenticated session (`req.session.userId`), and the frontend page requires a
  logged-in user.
- Step 03 (Accounts Wallet) — every transaction must reference an existing wallet owned by the
  current user; the wallet picker in the transaction form is populated from `GET /api/wallets`.
- Step 04 (Categories) — every transaction must reference an existing category owned by the
  current user; the category's `type` determines whether the transaction is treated as income or
  an expense. The category picker in the transaction form is populated from `GET /api/categories`.

## Routes

Backend (Express, mounted under `/api/transactions`, all logged-in only):

- `POST /api/transactions` — create a transaction (walletId, categoryId, amount, occurredAt, note) — logged-in
- `GET /api/transactions` — list the current user's transactions, most recent first; supports
  optional `?walletId=`, `?categoryId=`, `?from=`, `?to=` query filters — logged-in
- `GET /api/transactions/:id` — get a single transaction owned by the current user — logged-in
- `PATCH /api/transactions/:id` — update a transaction's wallet/category/amount/date/note owned by
  the current user — logged-in
- `DELETE /api/transactions/:id` — delete a transaction owned by the current user — logged-in

Frontend (Next.js App Router):

- `GET /transactions` — transaction list + filters + create/edit/delete UI — logged-in (redirects
  to `/login` if no session cookie is present)

## Templates

- **Create:**
  - `frontend/app/transactions/page.tsx` — transactions page shell (Server Component)
  - `frontend/components/transactions/transaction-list.tsx` — client component, fetches and
    renders the current user's transactions with wallet/category filter dropdowns, handles empty
    state, matching `components/wallets/wallet-list.tsx`
  - `frontend/components/transactions/transaction-form.tsx` — ShadcnUI create/edit form (wallet
    select, category select, amount, date, note) with `react-hook-form` + `zod` validation,
    matching `components/wallets/wallet-form.tsx`; wallet and category options are loaded from
    `walletsApi.list()` and `categoriesApi.list()`
  - `frontend/components/transactions/transaction-card.tsx` — displays a single transaction in the
    existing ledger/itemized visual style (reuse the dashed-divider pattern from
    `components/wallets/wallet-card.tsx`), showing the wallet name, category name + color swatch,
    note, and date, with the amount rendered in `text-primary` (green) for income categories and
    `text-destructive` (red) for expense categories — both existing theme tokens, no new colors
- **Modify:**
  - `frontend/components/site-header.tsx` — add a "Transactions" nav link next to "Categories",
    shown only in the authenticated header state

## Files to change

- `frontend/components/site-header.tsx`
- `frontend/lib/api.ts` — add `transactionsApi` CRUD + filtered-list fetch helpers alongside
  `authApi`, `walletsApi`, `categoriesApi`
- `frontend/proxy.ts` — add `/transactions/:path*` to the `matcher` array so the same
  session-cookie guard used for `/wallets` and `/categories` also covers `/transactions`
- `backend/src/app.ts` — mount the new transactions router at `/api/transactions`
- `backend/src/modules/wallets/wallet.service.ts` — `deleteWallet` must reject (return a
  `hasTransactions` conflict instead of deleting) when the wallet has any transactions, so deleting
  a wallet can never orphan or silently destroy ledger history
- `backend/src/modules/categories/category.service.ts` — `deleteCategory` must reject the same way
  when the category has any transactions
- `backend/prisma/schema.prisma` — add a `Transaction` model (`id`, `userId` FK, `walletId` FK,
  `categoryId` FK, `amount`, `note`, `occurredAt`, `createdAt`), with relations added on `User`,
  `Wallet`, and `Category`

## Files to create

Backend (mirrors the existing `backend/src/modules/wallets/` structure):

- `backend/src/modules/transactions/transaction.routes.ts`
- `backend/src/modules/transactions/transaction.controller.ts`
- `backend/src/modules/transactions/transaction.service.ts`
- `backend/src/modules/transactions/transaction.validators.ts`
- `backend/prisma/migrations/<timestamp>_add_transaction/` — generated by `prisma migrate dev`

Frontend:

- `frontend/app/transactions/page.tsx`
- `frontend/components/transactions/transaction-list.tsx`
- `frontend/components/transactions/transaction-form.tsx`
- `frontend/components/transactions/transaction-card.tsx`
- `frontend/lib/validation/transaction.ts` — shared zod schema, mirrors
  `lib/validation/wallet.ts` / `lib/validation/category.ts`

## New dependencies

No new dependencies — reuses the shadcn `select` component already added in step 03 for the
wallet/category pickers, and a plain HTML `<input type="date">` for the date field rather than
pulling in a date-picker package.

## Rules for implementation

- If a feature needs API implementation, you can add it.
- All templates make ShadcnUi.
- Every transaction route is protected by the existing `requireAuth` middleware
  (`backend/src/modules/auth/auth.middleware.ts`).
- Every transaction query must be scoped to `req.session.userId` — never trust a client-supplied
  user ID. Fetching, updating, or deleting a transaction that doesn't belong to the current
  session's user must return `404` (not `403`, to avoid confirming the transaction's existence to
  other users).
- On create and update, the referenced `walletId` and `categoryId` must each be independently
  verified as owned by `req.session.userId` (via `findOwnedWallet` / an equivalent owned-category
  lookup) before the transaction is written; if either lookup fails, return `404`.
- A transaction's income/expense direction is never stored on the `Transaction` row — it is always
  derived at read time from the joined category's `type`, so changing a category's type later
  correctly reclassifies all of its past transactions without a data migration.
- Backend follows the existing feature-module convention: all transaction files live together
  under `backend/src/modules/transactions/`, matching `backend/src/modules/wallets/`.
- Frontend follows the existing "ledger" design system (Fraunces serif + IBM Plex Mono, cream
  paper palette, dashed-divider itemized lists) — no new colors or fonts; use the existing
  `primary` (green) / `destructive` (red) tokens to distinguish income from expense amounts.
- Prisma is the only DB access layer; the `Transaction` model is added via `prisma migrate dev`,
  not a hand-written SQL migration.
- `amount` is stored as a fixed-point/decimal type in Postgres (`Decimal(12,2)`, matching
  `Wallet.startingBalance`), always a positive value — direction comes from the category, so
  negative amounts are rejected by validation on both the zod schema and the backend validator.
- `occurredAt` (the date the money actually moved) is a separate field from `createdAt` (when the
  row was inserted) — the form lets the user log a transaction for a past date.
- Deleting a wallet or category that has one or more transactions must fail with a `409` rather
  than cascading, so ledger history is never silently destroyed by an unrelated wallet/category
  cleanup.

## Definition of done

- [ ] `npm run dev` in both `frontend/` and `backend/` starts with no errors
- [ ] `POST /api/transactions` without a session cookie returns `401`
- [ ] `POST /api/transactions` with a valid session, an owned wallet, and an owned category
      creates a transaction and returns `201`
- [ ] `POST /api/transactions` referencing a wallet or category owned by a different user returns
      `404`
- [ ] `GET /api/transactions` returns only the logged-in user's transactions, ordered most-recent
      first, never another user's
- [ ] `GET /api/transactions?walletId=` and `?categoryId=` and `?from=`/`?to=` correctly narrow the
      returned list
- [ ] `PATCH /api/transactions/:id` updates a transaction owned by the current user; attempting to
      update a transaction owned by a different user returns `404`
- [ ] `DELETE /api/transactions/:id` removes a transaction owned by the current user; attempting
      to delete another user's transaction returns `404`
- [ ] `DELETE /api/wallets/:id` and `DELETE /api/categories/:id` return `409` when the
      wallet/category has existing transactions, and still succeed when it has none
- [ ] Visiting `/transactions` while logged out redirects to `/login`
- [ ] Visiting `/transactions` while logged in renders the transaction list, with a clear empty
      state when the user has no transactions yet
- [ ] Creating a transaction through the form adds it to the list without a full page reload,
      showing the correct wallet, category, note, date, and amount color (green for income, red
      for expense)
- [ ] Filtering the list by wallet and by category narrows the visible transactions accordingly
- [ ] Editing and deleting a transaction from the UI works and the change persists after reloading
      the page
- [ ] The header's "Transactions" link is visible only when authenticated and navigates to
      `/transactions`
