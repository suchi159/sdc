---
name: react-mui-dev
description: Develop and migrate the SecureProctor/SDC platform to Next.js + Material UI (MUI) + TypeScript as a monorepo, replacing the legacy Python-built static HTML prototypes. Use for any React/MUI build, component extraction, or prototype-to-React migration on this project.
---

# React + MUI Development (SecureProctor / SDC)

Build the platform as a **Next.js + TypeScript monorepo** with a **shared MUI design system**, migrating away from the legacy Python string-templating pipeline (`build_*.py`) that inlined assets and injected a mock `fetch`. Data is served by **MSW (Mock Service Worker)** now and swaps to a real API later with zero component changes.

Pair this skill with `/ux-designer` for design quality and follow the copy rules in `TERMINOLOGY.md`. The design system is **Material Design 3** — `M3_DESIGN.md` is the source of truth for all tokens, color roles, shape, elevation, motion, and M3→MUI component mapping. Build `packages/theme` from it.

## Stack (decided)

- **Framework:** Next.js (App Router) + TypeScript
- **UI:** Material UI (MUI v6) — `@mui/material`, `@mui/icons-material`, Emotion
- **Monorepo:** pnpm workspaces + Turborepo
- **Mock data:** MSW, seeded from the existing `/data/*.json`
- **State/data fetching:** TanStack Query for server state; React context/`zustand` only for genuine client state

## Target monorepo layout

```
apps/
  candidate/       # was candidate.html / secure_exam.html  (port 3003/3001)
  org-admin/       # was admin_portal.html                  (port 3009)
  super-admin/     # was super_admin_3005.html              (port 3005)
  proctor-online/  # was online_proctor.html                (port 3002)
  proctor-inclass/ # was classroom-proctor.html / v3.html
  hub/             # was central_hub.html                   (port 8888)
packages/
  ui/              # shared MUI components (Button, Card, DataTable, StatusChip…)
  theme/           # MUI theme, design tokens, the blue-admin/gold-candidate accents
  api/             # typed API client + TypeScript models (Candidate, Voucher, Exam…)
  mocks/           # MSW handlers + seed data migrated from /data/*.json
  emails/          # React Email templates + shared branded layout (was automated_emails.html)
  notifications/   # in-app notification system: toast/snackbar + bell/notification center
```

Each legacy "port" becomes one app; shared look-and-feel lives in `packages/theme` + `packages/ui` so branding never drifts.

## Rules

1. **Theme, don't inline.** All color/spacing/type comes from the MUI theme in `packages/theme`. No hard-coded hex, no `style={{}}` for anything the theme covers. Use `sx` with theme tokens (`sx={{ p: 2, color: 'primary.main' }}`).
2. **Preserve the two-accent brand.** Admin surfaces use the blue accent; candidate surfaces use gold. Encode both in the theme (e.g. per-app theme or a `palette` variant) — never fork colors ad hoc.
3. **Type the data layer.** Every API shape is a TypeScript type in `packages/api`. Components consume typed models, never `any`.
4. **MSW mirrors the old mock.** Recreate the Python `fetch` override behavior as MSW handlers: same routes (`/api/candidates`, `/api/candidates/:id`, `/api/vouchers/:id/redeem`, etc.), seeded from `/data/*.json`. Swapping to a real backend = point the client at a real base URL and disable MSW.
5. **Copy follows TERMINOLOGY.md.** Use canonical terms (Candidate, Class, Exam, Voucher, Redeem, Alert→Flag→Incident…) in all visible text. Do not rename code identifiers to match.
6. **Reuse before creating.** Check `packages/ui` before building a component. Promote a component to `packages/ui` the moment a second app needs it.
7. **Accessibility & states** — inherit all rules from `/ux-designer` (all interaction states, AA contrast, keyboard nav). MUI gives you most of this for free; don't undo it (e.g. don't remove focus rings).
8. **Server vs client components** — default to Server Components; add `"use client"` only where you need interactivity, state, or browser APIs. MUI components in interactive trees are client components.

## Emails & notifications (every app + hub)

Two shared packages, one catalog per app. Both share the brand (blue admin / gold candidate) and copy from `TERMINOLOGY.md`. Both are triggered by the same domain events, so define each **event once** and let it fan out to an email and/or an in-app notification.

### `packages/emails` — transactional email

- Build templates with **React Email** (`@react-email/components`) — typed, previewable, rendered to inline-CSS HTML (email clients need inlined styles, mirroring what the old Python inliner did).
- One shared **branded layout** (logo, header/footer, accent per audience); each template composes it with typed props.
- MSW/API "sends" during dev by returning the rendered HTML to a preview route; swap to a real provider (Resend/SES/etc.) later with no template changes.
- Port the existing templates from `automated_emails.html` — catalog below.

### `packages/notifications` — in-app notifications

- **Toast/Snackbar** for transient feedback (MUI `Snackbar` + `Alert`), and a **notification center** (bell + badge, MUI `Badge`/`Menu`/`List`) for the persistent feed.
- A typed `NotificationEvent` model in `packages/api`; a `useNotifications()` hook + provider drives both surfaces.
- In dev, MSW pushes events (poll or mock stream) reproducing today's incident feed / alerts; later swap for real websockets/SSE.
- Respect the **Alert → Flag → Incident** severity hierarchy from `TERMINOLOGY.md` for styling and grouping.

### Event catalog per app

| App / hub | Emails | In-app notifications |
|---|---|---|
| **candidate** | Welcome, Voucher issued/redeemed/upgraded, Exam scheduled/reminder/unlocked/launch, Payment receipt, Certificate issued | Exam starting soon, Voucher redeemed, Result ready, Certificate available |
| **org-admin** | Voucher purchase receipt, Vouchers assigned, Candidate invited | Voucher low-balance, Candidate completed exam, Assignment accepted |
| **super-admin** | Payment received, Account status change | Integrity **Incident** raised, System/health alerts, New org onboarded |
| **proctor-online** | Class scheduling, Earnings/payment | New **Alert/Flag** to review, Class starting, Candidate joined |
| **proctor-inclass** | SDC Proctor ID / class scheduling | **Alert/Flag** raised in room, Class roster ready |
| **hub** | (routing only) | Cross-app roll-up of unread items per role |

### Rules (emails & notifications)

1. **One event, two channels.** Define a domain event once (`voucher.redeemed`, `exam.incident.raised`…); map it to an email template and/or a notification type. Never duplicate the trigger logic per channel.
2. **Brand + copy.** Emails and notifications use the app's accent and the canonical `TERMINOLOGY.md` wording (Voucher, Redeem, Alert→Flag→Incident…).
3. **Inline email CSS** — always render email HTML with inlined styles (React Email handles this). Never ship a `<link>`ed stylesheet in email.
4. **Typed payloads** — every template and notification takes a typed prop/event from `packages/api`; no `any`.
5. **Provider-swappable** — components/templates never call a provider directly; go through the `api` layer so MSW-now → real-backend-later needs no template edits.
6. **Accessibility** — toasts are `role="alert"`/polite as appropriate, auto-dismiss is pausable, and the notification center is keyboard-navigable.

## Migration process (per screen)

Migrate **one screen at a time**, keeping the old prototype runnable until the React version reaches parity.

1. **Pick a screen** and open its legacy `.html` / `.css` / `.js`. Note the layout, components, data it fetches, and states.
2. **Map data** — find the `/api/...` calls and the matching `/data/*.json`. Add/confirm the MSW handler and the TypeScript model in `packages/api`.
3. **Extract components** — break the page into MUI-based components. Reusable ones go to `packages/ui`; screen-specific ones stay in the app.
4. **Apply the theme** — replace CSS values with theme tokens. Match the existing spacing/type/radius (audit first).
5. **Wire data** — fetch via TanStack Query against MSW. Handle loading / empty / error states.
6. **Verify parity** — compare against the old screen (and the PNG mockups in the repo root). Run the `/ux-designer` pre-ship checklist.
7. **Retire the Python path** for that screen — once parity is confirmed, the corresponding `build_*.py` output and hand-written HTML are no longer the source of truth.

## Bootstrapping (first time only)

1. Scaffold pnpm workspace + Turborepo; add `packages/theme`, `packages/ui`, `packages/api`, `packages/mocks`.
2. Build `packages/theme` first — port design tokens (colors incl. both accents, type scale, spacing, radius) from the existing CSS into an MUI theme.
3. Set up MSW in `packages/mocks`, seeding handlers from `/data/*.json` to reproduce today's mock responses.
4. Scaffold the first app (recommend `candidate` — highest user impact, gold accent) and migrate its landing screen end-to-end as the reference implementation.
5. Repeat the migration process app-by-app.

## Per-screen migration checklist

- [ ] MSW handler + `/data` seed reproduce the old response
- [ ] TypeScript model in `packages/api`; no `any`
- [ ] Reusable pieces extracted to `packages/ui`
- [ ] All values from theme tokens; correct accent (blue admin / gold candidate)
- [ ] Loading / empty / error states handled
- [ ] Copy matches `TERMINOLOGY.md`
- [ ] Any domain event on this screen is wired to its email template and/or notification (see event catalog)
- [ ] `/ux-designer` pre-ship checklist passed
- [ ] Visual parity with old screen / mockup confirmed

## Anti-patterns

- Hard-coded colors or spacing instead of theme tokens
- One giant client component (`"use client"` at the page root) — push it to the leaves
- Duplicating a component across apps instead of promoting to `packages/ui`
- `fetch` scattered in components instead of the typed `packages/api` client + TanStack Query
- Forking the accent colors per app instead of theming them
- Porting a screen 1:1 including its accessibility gaps — fix them during migration
- Duplicating a trigger per channel instead of one event → email + notification
- Email templates with linked (non-inlined) CSS, or calling an email/notification provider directly from a component instead of through `packages/api`
