# Spec: Profile

## Overview

A self-service account page: the logged-in user can view their account details (email, member
since), change their email, change their password, and delete their account. Until now the `User`
model is only ever read through `GET /api/auth/me` — this step adds the first write paths onto the
`User` row itself, completing the auth module with the account-management actions every user
eventually needs. It stays scoped to the `User` record; it does not touch wallets, categories,
transactions, or budgets except that deleting the account cascades all of them away, which the
schema already supports.

## Depends on

- Step 01 (Login and Signup) — profile management operates on the session established there
  (`req.session.userId`) and reuses its `User` model, password hashing (`bcrypt`), and session
  cookie (`etx.sid`); every profile route requires an authenticated session.

## Routes

Backend (Express, added to the existing `/api/auth` module):

- `PATCH /api/auth/me` — update the current user's `email` and/or `password` (changing the password
  requires the correct `currentPassword`) — logged-in
- `DELETE /api/auth/me` — permanently delete the current user's account (requires the correct
  `currentPassword`); destroys the session and cascades deletion of all owned wallets, categories,
  transactions, and budgets — logged-in

Frontend (Next.js App Router):

- `GET /profile` — account details, email form, password form, and a danger-zone delete-account
  form — logged-in (redirects to `/login` if no session cookie is present)

## Templates

- **Create:**
  - `frontend/app/profile/page.tsx` — profile page shell (Server Component), same pattern as
    `app/categories/page.tsx`
  - `frontend/components/profile/account-summary.tsx` — displays the current email and
    `createdAt` in the existing ledger itemized style, matching the read-only header block in
    `components/categories/category-list.tsx`
  - `frontend/components/profile/email-form.tsx` — ShadcnUI form to change email, `react-hook-form`
    + `zod`, matching the field layout of `components/categories/category-form.tsx`
  - `frontend/components/profile/password-form.tsx` — ShadcnUI form with `currentPassword`,
    `newPassword`, `confirmPassword` fields, same layout conventions as `email-form.tsx`
  - `frontend/components/profile/danger-zone.tsx` — delete-account form requiring the current
    password, `window.confirm` for a final confirmation (same destructive-action pattern as
    `handleDelete` in `components/categories/category-list.tsx`), redirects to `/` on success
- **Modify:**
  - `frontend/components/site-header.tsx` — add a "Profile" link to `authenticatedLinks`, alongside
    Dashboard/Wallets/Categories/Transactions/Budgets

## Files to change

- `frontend/components/site-header.tsx` — add the "Profile" link for authenticated users
- `frontend/lib/api.ts` — extend `authApi` with `updateProfile(data)` (PATCH `/api/auth/me`) and
  `deleteAccount(currentPassword)` (DELETE `/api/auth/me`)
- `frontend/proxy.ts` — add `/profile/:path*` to the `matcher` array alongside the existing
  protected routes
- `backend/src/modules/auth/auth.routes.ts` — add `PATCH /me` and `DELETE /me`, both behind
  `requireAuth`
- `backend/src/modules/auth/auth.controller.ts` — add `updateMe` and `deleteMe` handlers
- `backend/src/modules/auth/auth.service.ts` — add `updateUserEmail`, `updateUserPassword`, and
  `deleteUser` functions
- `backend/src/modules/auth/auth.validators.ts` — add `updateProfileSchema` (optional `email`,
  optional `newPassword` + required `currentPassword` when changing password) and
  `deleteAccountSchema` (`currentPassword`)

## Files to create

- `frontend/app/profile/page.tsx`
- `frontend/components/profile/account-summary.tsx`
- `frontend/components/profile/email-form.tsx`
- `frontend/components/profile/password-form.tsx`
- `frontend/components/profile/danger-zone.tsx`
- `frontend/lib/validation/profile.ts` — shared zod schemas (`emailFormSchema`,
  `passwordFormSchema`, `deleteAccountFormSchema`), mirrors `lib/validation/category.ts`

## New dependencies

No new dependencies — reuses `react-hook-form`, `@hookform/resolvers/zod`, and the existing
`button`/`input`/`label`/`card` shadcn primitives already in `components/ui/`.

## Rules for implementation

- If a feature needs API implementation, you can add it.
- All templates make ShadcnUi.
- `PATCH /api/auth/me` and `DELETE /api/auth/me` are protected by the existing `requireAuth`
  middleware (`backend/src/modules/auth/auth.middleware.ts`).
- Both routes always operate on `req.session.userId` — never accept a user id from the request body.
- Changing `email` checks the new address isn't already taken by another user (`409` if it is,
  matching the existing signup conflict behavior) before updating.
- Changing `password` requires `currentPassword` to verify against the stored hash via
  `bcrypt.compare` before hashing and saving the new password (`401` if it doesn't match); the new
  password is validated with the same `min(8)` rule as signup.
- Deleting the account requires `currentPassword` to verify against the stored hash (`401` if it
  doesn't match) before deleting the `User` row; the existing `onDelete: Cascade` relations on
  `Wallet`, `Category`, `Transaction`, and `Budget` handle removing the user's data, so no manual
  cleanup queries are needed.
- After a successful account deletion, destroy the session server-side (same
  `req.session.destroy` + `clearCookie` sequence as `logout`) before responding.
- On the frontend, a successful email or password change calls `refresh()` from
  `lib/auth-context.tsx` so the header's displayed email and auth state stay in sync; a successful
  account deletion clears auth state and redirects to `/`.
- Plaintext passwords are never logged; `PATCH`/`DELETE` responses never echo back `passwordHash` or
  any password field.
- Prisma is the only DB access layer — no raw SQL in the service functions.
- Frontend follows the existing "ledger" design system (Fraunces serif + IBM Plex Mono, cream paper
  palette, dashed-divider blocks, `rounded-none` inputs/buttons) — the danger zone uses the existing
  `destructive` token, no new colors.

## Definition of done

- [ ] `npm run dev` in both `frontend/` and `backend/` starts with no errors
- [ ] `PATCH /api/auth/me` without a session cookie returns `401`
- [ ] `PATCH /api/auth/me` with a new, unused `email` updates the account and returns the updated
      `id`/`email`
- [ ] `PATCH /api/auth/me` with an `email` already used by another account returns `409` and does
      not change the row
- [ ] `PATCH /api/auth/me` with `newPassword` and a correct `currentPassword` updates the password
      hash; logging in afterward with the new password succeeds and with the old password fails
- [ ] `PATCH /api/auth/me` with `newPassword` and an incorrect `currentPassword` returns `401` and
      leaves the password unchanged
- [ ] `DELETE /api/auth/me` without a session cookie returns `401`
- [ ] `DELETE /api/auth/me` with an incorrect `currentPassword` returns `401` and the account still
      exists
- [ ] `DELETE /api/auth/me` with the correct `currentPassword` deletes the `User` row, cascades
      deletion of that user's wallets, categories, transactions, and budgets, destroys the session,
      and a subsequent `GET /api/auth/me` with the same cookie returns `401`
- [ ] Visiting `/profile` while logged out redirects to `/login`
- [ ] Visiting `/profile` while logged in renders the current email and member-since date
- [ ] Submitting the email form with a new address updates the header's displayed email without a
      full page reload
- [ ] Submitting the password form with the wrong current password shows an inline error and does
      not change the password
- [ ] Submitting the password form with a correct current password and valid new password succeeds,
      and logging in again with the new password works
- [ ] Using the danger zone to delete the account (with confirmation and correct current password)
      logs the user out and redirects to `/`, and their previous session cookie no longer
      authenticates
- [ ] The header's "Profile" link is visible only when authenticated and navigates to `/profile`
