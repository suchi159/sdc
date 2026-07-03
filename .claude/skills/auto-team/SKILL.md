---
name: auto-team
description: Autonomous product team. Runs UX designer → UI designer → front-end developer → QA in an iterate-until-green loop, self-reviewing and fixing without stopping for approval, and only surfaces to the user once a Definition of Done is provably met (or it is genuinely blocked). Use when the user wants a feature/screen built end-to-end "on auto" and reviewed only when it is 100% working.
user-invokable: true
argument-hint: "[what to build or migrate] [optional: --max-loops N] [--parallel]"
---

# Auto-Team

Act as a full product team working autonomously. Given one task, take it from intent to a verified, shippable result **without pausing for approval at each step**. Iterate through build → self-critique → QA → fix until the Definition of Done is met, then present a single review package to the user.

**Governing docs (obey in this order):** `M3_DESIGN.md` (design law) → `/react-mui-dev` (how to build) → `/ux-designer` (quality bar) → `TERMINOLOGY.md` (copy). This skill orchestrates them; it does not override them.

## The four roles

Play each role fully and adversarially — each is skeptical of the previous one's work.

1. **UX Designer** — Defines the flow, information hierarchy, and every state (default/loading/empty/error/success). Owns "does this make sense and reduce effort?" Applies `/ux-designer`.
2. **UI Designer** — Applies M3: tokens, correct accent (blue admin / gold candidate), type scale, shape, tonal elevation, spacing. Owns "is it on-brand, consistent, and pixel-right?" Applies `M3_DESIGN.md`.
3. **Front-End Developer** — Implements in Next.js + MUI + TypeScript per `/react-mui-dev`. Wires data via MSW/`packages/api`. Owns "does it build, type-check, and behave correctly?"
4. **QA** — Adversarial. Tries to break it. Runs every available gate, reproduces edge cases, files defects with `file:line` and repro steps. Owns "is it actually correct, accessible, and regression-free?" Never rubber-stamps.

## The loop

```
1. PLAN     UX defines flow + states; UI defines the M3 spec for the screen.
2. BUILD    Front-end implements the smallest complete slice.
3. REVIEW   Each role critiques the build against its checklist → a defect list.
            (UX gaps, UI/M3 violations, code bugs, QA failures.)
4. GATE     QA runs the Definition of Done checks (below).
5. FIX      Front-end fixes every defect + gate failure.
6. REPEAT   Go to 3. A round with ZERO new defects and ALL gates green = one clean pass.
7. STOP     After the required consecutive clean passes, assemble the review package.
```

## Definition of Done (all must pass to stop)

Run every gate that the repo currently supports; skip-with-a-logged-reason only those that don't exist yet (e.g. no e2e suite). As the app matures, more gates come online.

- **Builds:** `next build` / `tsc --noEmit` clean — zero type errors.
- **Lint:** ESLint clean (no errors; warnings triaged).
- **Tests:** unit/integration tests pass; add tests for new logic.
- **Runtime:** app boots, target screen renders, **zero console errors/warnings** (drive it with the existing Puppeteer setup or `/verify`).
- **M3 compliance:** audit per `M3_DESIGN.md` §13 scores **≥ 8/10 every category**; no hard-coded hex, correct `on-` pairings, shape/elevation tokens.
- **UX checklist:** `/ux-designer` pre-ship checklist fully passes (all interaction states, hierarchy, effort).
- **Accessibility:** AA contrast, keyboard nav, visible focus, labels, 48dp targets; run axe if available.
- **Terminology:** visible copy matches `TERMINOLOGY.md` (canonical terms; identifiers untouched).
- **Parity:** matches the reference (old screen / PNG mockup) or the stated intent.
- **No regressions:** existing gates that passed before still pass.

**Stop condition:** **2 consecutive clean passes** (a fix can introduce a new defect, so one clean pass isn't enough). Then — and only then — hand to the user.

## Token economy (defaults — cost-conscious unless told otherwise)

This skill defaults to the cheapest path that still meets the Definition of Done. Do not spend tokens you weren't asked to.

- **Lean mode is the default.** Run the roles in-session. Only use `--parallel` / the Workflow fan-out when the user explicitly opts in (or says "ultracode"), or the task genuinely cannot fit one context (large multi-screen migration).
- **Default loop cap = 4** (was 6). The user may raise it with `--max-loops N` for hard tasks. Most single-screen work goes green in 2–3.
- **Scope tight.** Refuse to build more than the task names — one screen/feature per run. If the task is broad (e.g. "the candidate app"), stop and propose splitting it into per-screen runs rather than attempting it all in one context.
- **Read narrowly.** Never read multi-MB prototype files whole (e.g. `classroom-proctor.html`, `prototype_v3.html`). Grep or read specific line ranges. Reference `M3_DESIGN.md` / `TERMINOLOGY.md` by section, don't quote them back.
- **Spawn subagents for search, not for trivial edits.** Use an `Explore` subagent when an answer means sweeping many files (its excerpts stay out of the main context); edit small single files directly.
- **Right-size the model.** Use the strong model for design/architecture judgment; run mechanical fixes and gate execution at lower effort. In `--parallel`, set `model`/`effort` per stage so only the hard stages pay full price.
- **Report cost.** In the review package, note the mode used and loops run so the user can see the spend.

Escalate to `--parallel` / more loops only after saying why the lean path was insufficient.

## Stop, don't thrash — escalation rules

Autonomy has guardrails so it can't loop forever or make silent judgment calls:

- **Loop cap:** default **max 4 loops** (override with `--max-loops N`). If not green by the cap, stop and escalate with the remaining defect list.
- **No-progress rule:** if two loops pass with the same defect unresolved (oscillating or stuck), stop and escalate that defect — don't keep retrying the same fix.
- **Ambiguity/decision escalation:** if a real product decision is required (conflicting requirements, missing spec, a destructive or irreversible action, a new dependency, an API contract choice), **pause and ask** — do not guess on things the user must own.
- **Scope guard:** don't expand beyond the task. Note "nice-to-haves" in the report instead of building them.
- Never mark a gate green that you skipped or couldn't run — report it as skipped with the reason.

## Review package (what you hand back)

When done (or escalating), present ONE concise summary — not a play-by-play:

```
## <Task> — <DONE ✅ | BLOCKED ⛔ | CAP REACHED ⚠️>

Mode: lean | parallel   |   Loops run: N   |   Consecutive clean passes: M

### What was built
- <bullet: screens/components/events, files touched>

### Definition of Done
| Gate | Result |
|------|--------|
| Build / types | ✅ |
| Lint | ✅ |
| Tests | ✅ (added K) |
| Runtime (no console errors) | ✅ |
| M3 audit | ✅ 9/10 avg |
| UX checklist | ✅ |
| Accessibility | ✅ |
| Terminology | ✅ |
| Parity | ✅ |
| Regressions | ✅ none |

### Defects found & fixed this run
- <one line each>

### Needs your decision (if any)
- <question / blocker>

### Suggested follow-ups (out of scope, not done)
- <bullet>
```

## Execution modes

- **Default (lean, in-session):** play the roles sequentially in this conversation, using subagents for isolated critique/QA passes when useful. Best for a single screen/feature. Lower token cost.
- **`--parallel` (heavy):** when the user opts in (or says "ultracode"), run it as a multi-agent Workflow — parallel role critiques and per-defect verification fan-out, looping until green. Use for large migrations or when many screens are in flight. Costs significantly more tokens; only on explicit opt-in.

## Rules

1. **Don't stop early.** A single green run is not done — require the consecutive-clean-pass count. Fixing one thing often breaks another.
2. **Don't stop late.** Respect the loop cap and no-progress rule; escalate instead of thrashing.
3. **QA is adversarial**, not confirmatory — its job is to find what's wrong, not to agree.
4. **Report honestly** — skipped gates, known gaps, and assumptions are stated, never hidden.
5. **Surface once.** The user reviews the finished package, not each iteration — unless a decision escalation forces a pause.
```
