# Project instructions

## Tech direction

The platform is migrating from the legacy Python-built static HTML prototypes (`build_*.py`) to a **Next.js + TypeScript monorepo** with a **shared MUI design system** and **MSW mocks** (seeded from `/data/*.json`). For any React/MUI build or prototype-to-React migration, invoke `/react-mui-dev`. Follow visible-copy rules in `TERMINOLOGY.md`.

The design system is **Material Design 3**, specified in `M3_DESIGN.md` (tokens, two-accent brand, component mapping, audit) — it is the source of truth for tokens and components and takes precedence over other design guidance.

To build a feature/screen end-to-end autonomously (UX → UI → dev → QA, iterating until a Definition of Done is provably met, then surfacing once for review), invoke `/auto-team <task>`.

## Design rules (always-on baseline)

Any UI change must respect these. For dedicated design tasks, invoke `/ux-designer` for the full mindset and process.

1. **Design system first** — reuse existing tokens (color, type, spacing, radius) and components before adding new ones. Match existing naming and scale if you must extend.
2. **Consistency** — new screens must match the spacing, radius, type, and color of existing ones.
3. **All interaction states** — every interactive element needs default, hover, focus-visible, active, disabled, loading, empty, and error states.
4. **Accessibility (WCAG AA)** — 4.5:1 text contrast, visible focus rings, semantic HTML, keyboard reachable, labeled inputs, `alt` on meaningful images. Color is never the only signal.
5. **Hierarchy via spacing and weight**, not color alone.
6. **Mobile-first & responsive** — nothing overflows or breaks at the smallest supported width.
7. **Reduce user effort** — sensible defaults, clear primary action, forgiving inputs.

Before shipping UI: run the pre-ship checklist in `.claude/skills/ux-designer/SKILL.md`.
