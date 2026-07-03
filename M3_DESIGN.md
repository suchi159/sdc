# M3 Design for Proctor

Material Design 3 (Material You) design system for the SecureProctor / SDC platform, adapted for our stack: **React + MUI (v6) + TypeScript** in the Next.js monorepo. Based on the [material-3-skill](https://github.com/hamen/material-3-skill) M3 spec, retargeted from Compose/`@material/web` to **MUI**, and bound to our brand, terminology, and app structure.

> This is the design law. `/react-mui-dev` implements it, `/ux-designer` polices quality, `TERMINOLOGY.md` owns the words. When they conflict on tokens or components, **this doc wins**.

---

## 1. Philosophy (for Proctor)

M3 rests on three ideas; here's what each means for us:

- **Personal → Brand-dual.** We do *not* use wallpaper-based dynamic color. Instead we run **two fixed seeds**: **blue for admin/staff surfaces**, **gold for candidate surfaces**. Each generates a full tonal scheme. One codebase, two branded schemes.
- **Adaptive → Six apps, all window sizes.** candidate, org-admin, super-admin, proctor-online, proctor-inclass, hub. Every screen adapts across M3 window size classes (nav bar on compact → nav rail on medium → nav drawer on expanded).
- **Expressive → Restrained.** This is a high-stakes exam-integrity product. Use tonal surfaces, rounded shape, and calm motion. Avoid playful shape-morphing/spring flourishes that undercut trust. Expressive tokens are opt-in per surface, never default.

**M3 vs the legacy prototype:** the old CSS leaned on shadows and hard-coded hex. M3 replaces both — **tonal surface color for depth**, **semantic tokens for every value**.

---

## 2. How M3 maps to our stack

M3 spec tokens live in the `md.sys` namespace. We express them **twice**, both generated from `packages/theme`:

1. **CSS custom properties** (`--md-sys-*`) on `:root` / a theme subtree — the source of truth, one set per accent.
2. **MUI theme** (`createTheme`) whose `palette`, `typography`, and `shape` **read from those same tokens**, so MUI components and hand-rolled CSS never drift.

```
packages/theme/
  tokens/
    ref.blue.css      # admin seed → full --md-ref-palette-* tonal palette
    ref.gold.css      # candidate seed → full tonal palette
    sys.light.css     # --md-sys-color-* (light) referencing ref palettes
    sys.dark.css      # --md-sys-color-* (dark)
    typescale.css     # --md-sys-typescale-*
    shape.css         # --md-sys-shape-corner-*
  createProctorTheme.ts   # MUI theme reading the CSS vars, param: 'admin' | 'candidate'
```

Rule: **components read semantic tokens only** (`primary`, `surface-container`, `--md-sys-shape-corner-medium`). They never touch a hex value or a `ref` palette tone directly.

---

## 3. Color system

### Two seeds, one role set

| | Admin surfaces (blue) | Candidate surfaces (gold) |
|---|---|---|
| Apps | org-admin, super-admin, proctor-online, proctor-inclass, hub | candidate |
| `primary` seed | brand blue | brand gold |
| Feel | authoritative, operational | warm, encouraging |

Each seed generates the **same semantic roles** — only the hues differ. Pick the scheme per app at theme creation (`createProctorTheme('admin' | 'candidate')`), never by overriding colors inside a component.

### Semantic color roles (`--md-sys-color-*`)

| Token | Purpose | MUI palette mapping |
|---|---|---|
| `primary` / `on-primary` | High-emphasis fills, key actions | `palette.primary.main` / `.contrastText` |
| `primary-container` / `on-primary-container` | Standout tonal fill (selected states, key cards) | `palette.primary` custom slots |
| `secondary` / `on-secondary` (+ container) | Lower-emphasis accents, tonal buttons | `palette.secondary.*` |
| `tertiary` / `on-tertiary` (+ container) | Contrasting accents (badges, highlights) | custom `palette.tertiary` |
| `error` / `on-error` (+ container) | Errors — **static, not reseeded** | `palette.error.*` |
| `surface` / `on-surface` | Default background + text | `palette.background.default`, `text.primary` |
| `on-surface-variant` | Lower-emphasis text/icons | `palette.text.secondary` |
| `surface-container-lowest…highest` (5 steps) | Layered containers (cards, nav, sheets) — **depth cue** | custom surface tokens |
| `surface-dim` / `surface-bright` | Brightness anchors across light/dark | custom |
| `outline` | Real boundaries (text-field border) | `palette.divider` (strong) |
| `outline-variant` | Dividers, decorative lines | `palette.divider` (default) |
| `inverse-surface` / `inverse-on-surface` / `inverse-primary` | Snackbars, contrast elements | custom |

### Integrity severity → color roles

Map the `TERMINOLOGY.md` hierarchy to roles so severity reads consistently everywhere (feeds, chips, notifications, emails):

| Concept | Role | Rationale |
|---|---|---|
| **Alert** (lowest) | `secondary` / `secondary-container` | Noticed, not alarming |
| **Flag** (mid) | `tertiary` / `tertiary-container` | Needs review, distinct from error |
| **Incident** (highest) | `error` / `error-container` | Action required |

Never signal severity with **color alone** — pair with an icon + text label (colorblind safety, and it survives high-contrast mode).

### Dark mode & contrast

- Ship **light and dark** `--md-sys-color-*` sets for both accents (`sys.light.css` / `sys.dark.css`). MUI switches via `colorSchemes` / `data-mui-color-scheme`.
- Depth in dark mode is still tonal surface steps, **not** heavier shadows.
- Target WCAG **AA**: 4.5:1 body text, 3:1 large text / UI borders. Only ever pair a role with its `on-` partner (`primary`+`on-primary`, `surface-container`+`on-surface`). Arbitrary pairings break contrast.

---

## 4. Typography

**Typeface: Roboto Flex** (M3 default — the "avoid Roboto" advice from generic design guidance does **not** apply here). Self-host in `packages/theme` (no external font CDN — matches the offline/standalone builds).

| Scale | Sizes | Use in Proctor |
|---|---|---|
| Display | L/M/S | Big numbers on dashboards (candidate counts, scores) |
| Headline | L/M/S | Page + section headers |
| Title | L/M/S | Card titles, dialog titles, table section heads |
| Body | L/M/S | Paragraphs, descriptions, table cells |
| Label | L/M/S | Buttons, chips, tabs, captions |

Tokens per style: `-font`, `-weight`, `-size`, `-line-height`, `-tracking`. Emphasized variants (`--md-sys-typescale-emphasized-*`) for moments that need weight (e.g. "Exam starting now"). Map all of these to `theme.typography` roles in MUI.

---

## 5. Shape

Use shape tokens, never raw `border-radius`.

| Token | Value | Proctor components |
|---|---|---|
| `extra-small` | 4dp | Chips, snackbars, severity tags |
| `small` | 8dp | Text fields, menus |
| `medium` | 12dp | Cards (candidate cards, voucher cards, incident cards) |
| `large` | 16dp | FAB, nav drawer, bottom sheets header |
| `extra-large` | 28dp | Dialogs (confirm redeem, launch exam), modal sheets |
| `full` | 9999px | Buttons, chips, badges, avatars |

Set `theme.shape` + component `styleOverrides` from these tokens so every MUI surface inherits them.

---

## 6. Elevation (tonal, not shadow)

Depth = **tonal surface color**, using the `surface-container-*` steps. Shadows only when content must separate from a busy background (e.g. a floating panel over live video in proctor apps).

| Level | Surface role | Proctor use |
|---|---|---|
| 0 | `surface` | Page background, resting content |
| 1 | `surface-container-low` | Cards at rest |
| 2 | `surface-container` | Nav rail/bar, app bar |
| 3 | `surface-container-high` | Menus, raised cards |
| 4–5 | `surface-container-highest` | Dialogs, sheets, FAB (hover/focus only) |

In MUI, prefer `Paper` with tonal `bgcolor` tokens over `elevation={n}` shadows; reserve real shadows for the busy-background exceptions.

---

## 7. Motion

Calm and functional. Spring/expressive motion is **not** a default here (and isn't in web MUI anyway) — use M3 easing + duration tokens.

| Easing | Duration | Use |
|---|---|---|
| Emphasized `cubic-bezier(0.2,0,0,1)` | 500ms | On-screen state changes |
| Emphasized decelerate `cubic-bezier(0.05,0.7,0.1,1)` | 400ms | Enter (dialogs, sheets, toasts) |
| Emphasized accelerate `cubic-bezier(0.3,0,0.8,0.15)` | 200ms | Exit |
| Standard `cubic-bezier(0.2,0,0,1)` | 300ms | Utility transitions |

Respect `prefers-reduced-motion` — drop to opacity-only. Never animate anything that delays the candidate starting or submitting an exam.

---

## 8. Component mapping (M3 → MUI)

Build with MUI components themed by our tokens. Do **not** add `@material/web` custom elements (they don't SSR in Next.js and clash with MUI).

| M3 component | MUI component | Proctor variant guidance |
|---|---|---|
| Filled / Tonal / Outlined / Text button | `Button` (`variant="contained"` / tonal via theme / `outlined` / `text`) | Primary action = filled; secondary = tonal/outlined |
| Icon button | `IconButton` | Toolbar & card actions |
| FAB / Extended FAB | `Fab` | Candidate "Start exam"; proctor "Raise flag" |
| Segmented / toggle button | `ToggleButtonGroup` | Filters (e.g. exam status) |
| Card (filled/outlined/elevated) | `Card` / `Paper` | Candidate cards, voucher cards, incident cards — outlined default |
| Chips (assist/filter/input/suggestion) | `Chip` | Severity tags (Alert/Flag/Incident), filters |
| Text field (filled/outlined) | `TextField` | Outlined default; labels required |
| Select / Menu | `Select`, `Menu` | — |
| Checkbox / Radio / Switch / Slider | `Checkbox` / `Radio` / `Switch` / `Slider` | — |
| Dialog | `Dialog` | Confirm redeem, launch exam, deactivate account |
| Bottom / Side sheet | `Drawer` (`anchor`) | Candidate detail, incident detail |
| Snackbar | `Snackbar` + `Alert` | Toast channel (see `packages/notifications`) |
| Badge | `Badge` | Notification-center bell count |
| Progress (linear/circular) | `LinearProgress` / `CircularProgress` | Exam upload, loading states |
| Top app bar (S/M/L/center) | `AppBar` + `Toolbar` | Per-app header |
| Navigation bar | `BottomNavigation` | Compact (mobile candidate) |
| Navigation rail | custom `Drawer variant="permanent"` / rail | Medium admin surfaces |
| Navigation drawer | `Drawer` | Expanded admin surfaces |
| Tabs (primary/secondary) | `Tabs` | Sub-sections within a page |
| List (1/2/3-line) | `List` / `ListItem` | Directories, feeds |
| Data table | `Table` / (or MUI X `DataGrid`) | Candidate Directory, Voucher Management, Financial Ledger |

---

## 9. Layout & navigation (per app)

Window size classes drive the navigation form factor:

| Width class | Range | Navigation | Content |
|---|---|---|---|
| Compact | <600 | `BottomNavigation` | Single pane |
| Medium | 600–839 | Navigation **rail** | Single/list pane |
| Expanded | 840–1199 | Navigation **rail or drawer** | List-detail (two-pane) |
| Large/XL | 1200+ | Navigation **drawer** | Multi-pane, **content max-width 840–1040px** (no endless lines) |

Per-app defaults:
- **candidate** — mobile-first; bottom nav on phone, simple top app bar. Gold accent. Minimal chrome during an exam (distraction-free, no nav during `secure_exam`).
- **org-admin / super-admin** — desktop-first; nav drawer, data-table-heavy, list-detail panes. Blue accent.
- **proctor-online / inclass** — operational console; nav rail + live monitoring panels; floating panels may use real shadow over video.
- **hub** — router/launcher; card grid of apps + a cross-app unread roll-up.

Avoid interactive content across a foldable hinge; constrain wide content; use canonical list-detail at 840+.

---

## 10. Notifications & emails (M3-aligned)

Tie the `packages/notifications` and `packages/emails` channels to M3 so both feel native:

- **Toasts** = M3 Snackbar (`Snackbar`+`Alert`), `inverse-surface`/`inverse-on-surface`, enter with emphasized-decelerate, `role="alert"`, pausable auto-dismiss.
- **Notification center** = bell `IconButton` + `Badge` (count) → `Menu`/`List` on `surface-container-high`. Group and color items by severity roles (§3).
- **Emails** (React Email) use the **same tokens** as inline CSS: the app's accent for headers/buttons, M3 type scale, shape-`medium` cards. Severity emails (Incident) use the `error` role; receipts/welcome use `primary`. One branded layout, accent injected per audience.

---

## 11. Accessibility (non-negotiable)

- AA contrast; only `on-` paired roles; severity never color-only.
- Every input labeled; visible focus ring (don't strip MUI's); full keyboard nav.
- Touch targets ≥ 48dp.
- Snackbars announced; notification center reachable and operable by keyboard.
- `prefers-reduced-motion` honored.
- Semantic HTML / ARIA via MUI defaults — don't override them away.

---

## 12. MUI theme skeleton

```ts
// packages/theme/createProctorTheme.ts
import { createTheme } from '@mui/material/styles';

const v = (name: string) => `var(--md-sys-color-${name})`;

export function createProctorTheme(accent: 'admin' | 'candidate') {
  // accent selects which ref palette CSS is loaded (blue vs gold);
  // sys tokens are the same role names, so the theme body is shared.
  return createTheme({
    cssVariables: { colorSchemeSelector: 'data-mui-color-scheme' },
    colorSchemes: { light: true, dark: true },
    palette: {
      primary:   { main: v('primary'),   contrastText: v('on-primary') },
      secondary: { main: v('secondary'), contrastText: v('on-secondary') },
      error:     { main: v('error'),     contrastText: v('on-error') },
      background:{ default: v('surface'), paper: v('surface-container-low') },
      divider: v('outline-variant'),
      text: { primary: v('on-surface'), secondary: v('on-surface-variant') },
      // tertiary + surface-container-* added as custom tokens
    },
    shape: { borderRadius: 12 }, // medium; per-component overrides use shape tokens
    typography: {
      fontFamily: '"Roboto Flex", system-ui, sans-serif',
      // map Display/Headline/Title/Body/Label → typescale tokens
    },
    components: {
      MuiButton: { styleOverrides: { root: { borderRadius: 9999 } } }, // full
      MuiCard:   { styleOverrides: { root: { borderRadius: 12 } } },   // medium
      MuiDialog: { styleOverrides: { paper: { borderRadius: 28 } } },  // extra-large
    },
  });
}
```

---

## 13. M3 compliance audit (adapted for MUI/React)

Run when asked to "audit M3 compliance." Score each 0–10; **pass ≥7, warn 4–6, fail ≤3**.

| Category | What to check (our stack) |
|---|---|
| Color tokens | `--md-sys-color-*` / theme palette used; no raw hex in components; correct `on-` pairing; both accents + dark mode present |
| Typography | `theme.typography` maps M3 type scale; Roboto Flex; correct roles |
| Shape | Shape tokens / `theme.shape` + overrides; no magic `border-radius` |
| Elevation | Tonal `surface-container-*`; shadows only for busy-background exceptions |
| Components | MUI components themed by tokens; no `@material/web`; no leftover MD2 |
| Layout | Window-size-class nav; max-width on large; list-detail at 840+ |
| Navigation | Correct form factor per width; no nav during secure exam |
| Motion | M3 easing/duration tokens; `prefers-reduced-motion` |
| Accessibility | AA contrast, focus rings intact, labels, 48dp targets, severity not color-only |
| Theming | Two accents from `packages/theme`; components read semantic tokens only |

Quick checks:
```bash
# raw hex in components (should be near-zero)
grep -rn '#[0-9a-fA-F]\{3,8\}' apps packages --include='*.tsx' --include='*.css'
# forbidden @material/web
grep -rn '@material/web' apps packages
# magic border-radius instead of tokens
grep -rn 'border-radius' apps packages --include='*.css' --include='*.tsx'
```

Report format: overall /100, per-category table with status, Critical (≤3) with `file:line` + fix, Warnings (4–6), Passing (7–10), then prioritized fixes.

---

## 14. Anti-patterns

- Hard-coded hex/rgb instead of `--md-sys-color-*` / theme tokens.
- Signaling integrity severity by color alone (no icon/label).
- Reseeding `error` per accent — error is **static**.
- Shadows as the default depth cue instead of tonal surfaces.
- Raw `border-radius` instead of shape tokens.
- `@material/web` custom elements (no SSR in Next.js; clashes with MUI).
- Forking accent colors inside a component instead of choosing the scheme at theme creation.
- `outline` used for dividers (use `outline-variant`).
- Phone-only layouts; stretching text to full width on large screens.
- Motion/animation that delays starting or submitting an exam.
