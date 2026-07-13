# Spec: About Us

## Overview

A simple, static public page that explains what ExpenseTracker is and why it exists. This is a
lightweight content feature with no backend, no forms, and no data model — it exists at this
stage of the roadmap to give the marketing shell a second real page (beyond the landing page)
before more complex, data-driven features (expenses, budgets, reports) are built. It reuses the
shared layout, header, and "ledger" design system established in step 01 rather than introducing
anything new.

## Depends on

Step 01 (Login and Signup) — only for the shared layout shell (`SiteHeader`, `AuthProvider`,
fonts/design tokens already wired into `app/layout.tsx`). There is no functional or auth
dependency: the About page itself is public and does not read or require session state.

## Routes

Frontend (Next.js App Router):

- `GET /about` — About Us page — public

No backend routes.

## Templates

- **Create:**
  - `frontend/app/about/page.tsx` — About Us page (Server Component; static content, no
    interactivity)
- **Modify:**
  - `frontend/components/site-header.tsx` — add an "About" nav link (visible in both the
    logged-in and logged-out header states) that routes to `/about`

## Files to change

- `frontend/components/site-header.tsx`

## Files to create

- `frontend/app/about/page.tsx`

## New dependencies

No new dependencies.

## Rules for implementation

- If a feature needs API implementation, you can add it.
- All templates make ShadcnUi.
- `app/about/page.tsx` must be a Server Component (no `"use client"`) — the page is static
  content with no interactivity, so it should not ship any client JS.
- Must follow the existing "ledger" design system from step 01 (Fraunces serif display font,
  IBM Plex Mono for labels/chrome, cream-paper/ink-green palette, dashed dividers, receipt/ledger
  motifs) — reuse existing tokens and the shadcn `Card` primitive rather than introducing new
  colors, fonts, or one-off styles.
- Reuse `SiteHeader` at the top of the page for navigation consistency with `/`, `/login`, and
  `/signup`.

## Definition of done

- [ ] `npm run dev` in `frontend/` starts with no errors
- [ ] Visiting `/about` in the browser renders the About Us page, styled consistently with the
      rest of the site (same fonts, colors, header)
- [ ] The header's "About" link is visible and navigates to `/about` from every existing page
      (`/`, `/login`, `/signup`)
- [ ] `/about` is reachable without being logged in (no session cookie required)
- [ ] `npm run lint` and `npx tsc --noEmit` both pass with no errors
- [ ] No console errors or warnings when loading `/about` in the browser
