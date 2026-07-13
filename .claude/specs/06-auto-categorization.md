# Spec: Auto Categorization

## Overview

A quality-of-life layer on top of transactions (step 05): as the user types a note while logging a
new transaction, the app suggests a category based on the notes and categories of their own past
transactions, so repeat entries ("Uber", "Starbucks", "Rent") stop requiring a manual category pick
every time. There is no ML model or external service involved — suggestion is a simple in-process
keyword-frequency match over the current user's transaction history, computed server-side and scoped
per-user like every other resource in this app. The suggestion is always advisory: the user can
accept it with one click or ignore it and pick a category manually, and it never fires until the
user has at least one categorized transaction with a note to learn from.

## Depends on

- Step 01 (Login and Signup) — suggestions are computed from the current session's own transaction
  history; the endpoint requires an authenticated session (`req.session.userId`).
- Step 04 (Categories) — suggestions resolve to an existing category owned by the current user.
- Step 05 (Transactions) — this feature has nothing to learn from until transactions with notes
  exist; it reads the current user's past `Transaction.note` + `categoryId` pairs and augments the
  existing transaction form. No schema changes to `Transaction` are needed.

## Routes

Backend (Express, mounted under `/api/transactions`, logged-in only):

- `GET /api/transactions/suggest-category?note=<text>` — given a free-text note, returns the best-
  matching categoryId (or `null` if no confident match) from the current user's own transaction
  history — logged-in

No new frontend routes — this augments the existing `/transactions` page and its create/edit form.

## Templates

- **Create:** none — no new pages or standalone components.
- **Modify:**
  - `frontend/components/transactions/transaction-form.tsx` — after the note field is edited
    (debounced ~400ms) and only while the category field has not been manually touched by the user
    in this form session, call the suggestion endpoint; if a categoryId comes back, show it as a
    dismissible inline chip ("Suggested: Groceries — Use") above the category select rather than
    silently overwriting the field. Clicking the chip sets the category select's value. Manually
    changing the category select at any point suppresses further auto-suggestions for that form
    session.

## Files to change

- `frontend/components/transactions/transaction-form.tsx` — add debounced note-watching, the
  suggestion fetch, and the suggestion chip UI described above
- `frontend/lib/api.ts` — add `transactionsApi.suggestCategory(note: string)` alongside the existing
  `transactionsApi` CRUD helpers
- `backend/src/modules/transactions/transaction.routes.ts` — add the `GET /suggest-category` route
  (registered before `GET /:id` so the literal path isn't swallowed by the `:id` param route)
- `backend/src/modules/transactions/transaction.controller.ts` — add the controller handler for the
  new route
- `backend/src/modules/transactions/transaction.service.ts` — add a `suggestCategory(userId, note)`
  function implementing the keyword-frequency match described in "Rules for implementation"
- `backend/src/modules/transactions/transaction.validators.ts` — add a zod query-param schema
  validating `note` as a required, non-empty string

## Files to create

No new files — every change lives inside the existing transactions module and its frontend
counterparts.

## New dependencies

No new dependencies — tokenization/matching is plain string/array logic (`split`, `Set`, a frequency
map), no NLP or ML package is pulled in.

## Rules for implementation

- If a feature needs API implementation, you can add it.
- All templates make ShadcnUi.
- `GET /api/transactions/suggest-category` is protected by the existing `requireAuth` middleware and
  only ever reads the requesting user's own transactions — never another user's.
- Matching algorithm (`suggestCategory` in `transaction.service.ts`):
  1. Load the current user's transactions that have a non-empty `note`, each joined to its
     `categoryId` (reuse the existing Prisma query pattern already scoped to `userId`).
  2. Tokenize each stored note and the incoming query note the same way: lowercase, split on
     non-alphanumeric characters, drop empty tokens and tokens under 3 characters.
  3. Build a per-category score by summing, for every token in the query note, the number of past
     transactions in each category whose tokenized note contains that token.
  4. Return the categoryId with the highest score. On a tie, or if no token overlap exists at all
     (top score is 0), return `null` — the frontend then shows no chip.
  5. Verify the returned categoryId still belongs to an existing category before returning it (a
     category may have been deleted since the transaction was recorded); if not found, return
     `null`.
- This is a heuristic convenience feature, not a data integrity concern — a wrong or missing
  suggestion is never an error state, only an empty/absent chip.
- The suggestion call must not block or delay submitting the form; it is a background fetch that
  only affects the optional chip.
- Frontend follows the existing "ledger" design system (Fraunces serif + IBM Plex Mono, cream paper
  palette) — the suggestion chip is a small ShadcnUI `Badge` or `Button` (ghost/outline variant)
  using existing theme tokens, no new colors.

## Definition of done

- [ ] `npm run dev` in both `frontend/` and `backend/` starts with no errors
- [ ] `GET /api/transactions/suggest-category?note=coffee` without a session cookie returns `401`
- [ ] With a logged-in user who has no past transactions, the endpoint returns `null` for any note
- [ ] After creating several transactions with notes like "Starbucks coffee" tagged under a
      "Dining" category, calling the endpoint with `note=coffee run` returns the "Dining" category's
      id
- [ ] The endpoint never returns a categoryId belonging to another user's transactions, even with a
      note that happens to match another user's data
- [ ] Typing a note in the transaction creation form that matches past spending shows the
      "Suggested: <category> — Use" chip within roughly half a second of the user pausing typing
- [ ] Clicking the suggestion chip sets the category select to the suggested category without
      submitting the form
- [ ] Manually selecting a different category after a suggestion appears dismisses/suppresses the
      chip for the rest of that form session
- [ ] Submitting the transaction still works normally whether or not a suggestion was shown or
      accepted
- [ ] No suggestion chip appears while editing an existing transaction's note unless the user clears
      the category first (the feature targets new-entry speed, not silently second-guessing an
      already-categorized transaction)
