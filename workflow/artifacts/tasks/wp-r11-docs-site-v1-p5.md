---
slug: wp-r11-docs-site
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-07-20
updated: 2026-07-20
manifest_ids: [R1, R8]
upstream:
  - workflow/artifacts/briefs/wp-r11-docs-site-v1.md
  - workflow/artifacts/plans/wp-r11-docs-site-v1.md
  - workflow/artifacts/tasks/wp-r11-docs-site-v1-p3.md
  - workflow/artifacts/tasks/wp-r11-docs-site-v1-p4.md
  - workflow/artifacts/reviews/wp-r11-docs-site-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# WP-R11 — Documentation Site (VitePress), Phase 5 (Creative Pass) - Task

## Active Phase

- Phase: Phase 5 - Creative Pass (Build `-p5`, post-Review correction, not in the original Plan phase breakdown — see Architecture Notes)
- Manifest IDs: R1, R8
- Exit gate: build passes; logo/favicon render in the built HTML; the hero-only decorative markup (ember glow + sparks) is present on the home page and absent from content pages; the new CSS animations (`forge-sweep`, `ember-pulse`, `spark-rise`, `forge-fade-up`) and their `prefers-reduced-motion` guard are present in the compiled CSS bundle; no `outline` removal introduced; `docs/`/stale-term checks stay clean.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Scaffold | complete | R2, R3, R4, R5, RI1, RI2, RI3, RI4 |
| Phase 2 - Content Migration | complete | R6, RI6 |
| Phase 3 - Polish and Deploy Wiring | complete | R1, R7, R8, RI5, RI7 |
| Phase 4 - Home Layout Fix (post-Review) | complete | R1, R8 |
| Phase 5 - Creative Pass (post-Review) | complete | R1, R8 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `feat/wp-r11-docs-site` | Phases 1–4 and Review already staged; unrelated `.dc.html` files still untracked | Baseline. |
| At handoff | `feat/wp-r11-docs-site` | New `site/public/logo.svg`, `site/public/favicon.svg`, `site/.vitepress/theme/Layout.vue`; modified `site/.vitepress/theme/index.ts`, `site/.vitepress/theme/style.css`, `site/.vitepress/config.ts`; unrelated files unchanged; `docs/` confirmed still untouched | |

- In scope: `site/public/logo.svg` (new), `site/public/favicon.svg` (new), `site/.vitepress/theme/Layout.vue` (new), `site/.vitepress/theme/index.ts` (modified — registers the custom Layout), `site/.vitepress/theme/style.css` (substantially expanded), `site/.vitepress/config.ts` (adds `themeConfig.logo` and a favicon `head` entry).
- Out of scope: page content (`site/*.md`), the deploy workflow, nav/sidebar structure — none of these changed this phase.
- **Tooling note, not a scope decision:** `node src/workflow/validators/check-scope-fence.mjs` reported `ok` for this task's 6 changed files even before the plan was corrected (see below) — traced this rather than trusting it, since 3 of the 6 files (`site/public/logo.svg`, `site/public/favicon.svg`, `site/.vitepress/theme/Layout.vue`) were not actually declared in Phase 3's `Touches` line at the time. Root cause: `check-scope-fence.mjs`'s phase-boundary regex (`\n\s*\*{0,2}(?:Work|Exit gate|Why first)\*{0,2}:`) does not match this repo's own `- Work:`/`- **Exit gate:**` bullet style (the leading `- ` bullet dash isn't whitespace, so `\s*` never reaches "Work"/"Exit gate"), so for the plan's *last* declared phase specifically (no subsequent `### Phase N+1` heading to bound the block), the Touches capture runs unbounded to the literal end of the plan document — sweeping in every backtick-quoted token from Dependency Order, Risk Register, Architecture Notes, etc., including a bare `` `site/` `` mention in prose that then matches *any* path under `site/` as a false directory-prefix "covered" entry. This is a real validator bug, not a false alarm — confirmed by manually replicating the regex logic outside the tool. **Not fixed here**: `src/workflow/validators/` is explicitly out of scope for WP-R11 per the brief's Non-Goals ("Changing anything under `src/workflow/`... or any validator"). Instead: (1) the plan was corrected to explicitly declare the 3 files under Phase 3's Touches, regardless of the tool's (unreliable, in this case) verdict, so the plan stays an honest scope record; (2) this bug is flagged here for Reflect to log as a real follow-up candidate.

## Changed Files

- `site/public/logo.svg` — the anvil+spark brand mark, reused verbatim from `Agentsmyth Docs.dc.html`'s wordmark exploration (option "D · anvil + spark," marked as the recommended direction there). Previously the site had no logo at all. IDs: R8.
- `site/public/favicon.svg` — the same mark on a rounded dark-steel backdrop, sized for browser-tab legibility. IDs: R8.
- `site/.vitepress/theme/Layout.vue` — new custom theme layout, extends `DefaultTheme.Layout` and injects decorative markup into VitePress's own `#home-hero-before` slot (an ember-glow orb plus four rising spark particles), rendered only on the home page by VitePress's own slot mechanics — no manual page-type branching needed. Imports only `vitepress/theme`, preserving the zero-coupling boundary with `src/` confirmed in the earlier Review. IDs: R8.
- `site/.vitepress/theme/index.ts` — switched from re-exporting `DefaultTheme` directly to an extended theme object (`{ extends: DefaultTheme, Layout }`) so the custom `Layout.vue` is actually used. IDs: R8.
- `site/.vitepress/theme/style.css` — substantially expanded: an animated ember-to-amber gradient sweep across the hero headline; a pulsing ember-glow orb and four rising spark particles behind the hero; a staggered fade-up entrance for the hero's heading/tagline/actions; hover lift-and-glow on buttons and feature cards; a hover glow-tilt on the nav logo; ember-tinted borders on hovered code blocks; a subtle dark-mode-only ambient background texture; a steel-track/ember-thumb custom scrollbar. Every animation is wrapped in `@media (prefers-reduced-motion: no-preference)` so users who prefer reduced motion get the static (still-themed) version instead. IDs: R1, R8.
- `site/.vitepress/config.ts` — added `themeConfig.logo: '/logo.svg'` and a favicon `head` entry pointing at `/favicon.svg`. IDs: R8.

## Implementation Log

1. **The problem, stated directly by the user**: after the home-layout fix (`-p4`), the site was structurally correct but had "nothing creative about it" — a mechanical content port plus a CSS color-variable swap, no motion, no brand mark, no personality distinct from stock VitePress. This was accurate: Phase 3's theme work only ever touched `--vp-c-*` token values, never added a real component, animation, or the actual anvil+spark mark that the design mockups themselves treat as the brand identity.
2. Pulled the anvil+spark SVG path data directly from `Agentsmyth Docs.dc.html`'s own wordmark section (already used repeatedly throughout that file's mockups) rather than inventing a new mark — reuses an existing, already-chosen design decision instead of introducing a fourth option.
3. Built `Layout.vue` using VitePress's own documented slot API (`#home-hero-before`) rather than forking the entire default layout — keeps the change minimal and means the decorative markup automatically only appears on pages using `layout: home` (currently just `index.md`), with no manual "is this the home page" branching logic to get wrong.
4. Added the gradient-sweep headline, glow/spark hero backdrop, fade-up entrance, and hover interactions as pure CSS (`@keyframes` + transitions) — no new JS runtime behavior, no client-side framework beyond what VitePress/Vue already ships.
5. Wrapped every animation in a `prefers-reduced-motion: no-preference` media query — carrying forward the Plan's `ui-ux-designer` accessibility recommendation (motion needs a reduced-motion accommodation) into this new, motion-heavy work specifically, not just the parts of the theme that existed when that recommendation was first recorded.
6. Rebuilt and directly inspected the generated `site/.vitepress/dist/index.html`, `install.html`, and the compiled CSS bundle — confirmed the logo `<img>` tag, the favicon `<link>` tag, the `forge-glow`/`ember-orb`/`spark` markup (present once on the home page, zero times on a content page), all four new `@keyframes` names, and the `prefers-reduced-motion` guard are all actually present in the build output, not just in source.
7. Re-confirmed no regression: sidebar still absent on `index.html` (0 occurrences) and still present on `install.html` (1 occurrence) — the `-p4` fix is intact; no `outline` property was added anywhere in the new CSS (no accessibility regression); `docs/` diff and stale-term grep both still clean.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R8 | `grep -o '<link rel="icon"...' site/.vitepress/dist/index.html` | Favicon link present. |
| R8 | `grep -o '<img[^>]*logo[^>]*>' site/.vitepress/dist/index.html` | Logo image tag present, `src="/logo.svg"`. |
| R8 | `grep -c "forge-glow" site/.vitepress/dist/index.html` vs. `install.html` | `1` on home, `0` on a content page — scoped correctly. |
| R1, R8 | `grep -o "forge-sweep\|ember-pulse\|spark-rise\|forge-fade-up" dist/assets/*.css` | All four keyframe names present. |
| R1, R8 | `grep -o "prefers-reduced-motion: no-preference" dist/assets/*.css` | Present — motion is opt-out-safe. |
| R1 (carried) | `grep -c "VPSidebar" index.html` / `install.html` | `0` / `1` — `-p4`'s fix not regressed. |
| — (accessibility) | `grep -n "outline" site/.vitepress/theme/style.css` | No matches — no focus-outline removal introduced. |
| R6, RI6 (carried) | `grep -rn -- "--system\|the setup interview" site/` | No matches. |
| RI2 (carried) | `git diff --stat -- docs/` | No output. |
| — | `ls site/.vitepress/dist/*.svg` | `logo.svg`, `favicon.svg` both copied into the build output. |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `npm run site:build` | `site/` | pass | `build complete in 1.23s`. |
| `grep -o '<link rel="icon"...' dist/index.html` | `dist/` | pass | Favicon wired. |
| `grep -o '<img[^>]*logo[^>]*>' dist/index.html` | `dist/` | pass | `<img class="VPImage logo" src="/logo.svg" alt data-v-...>`. |
| `grep -c "forge-glow"/"ember-orb"/"spark spark-"` on `index.html`; same on `install.html` | `dist/` | pass | 1/1/1 on home, 0 on content page. |
| `grep -o` for the four `@keyframes` names, `dist/assets/*.css` | `dist/` | pass | All four present. |
| `grep -o "prefers-reduced-motion: no-preference"`, `dist/assets/*.css` | `dist/` | pass | Present. |
| `grep -c "VPSidebar"` on `index.html`/`install.html` | `dist/` | pass | 0 / 1 — no regression on `-p4`'s fix. |
| `grep -n "outline" site/.vitepress/theme/style.css` | source | pass (no match) | No accessibility regression. |
| `grep -rn -- "--system\|the setup interview" site/` | `site/` | pass (empty) | No stale terms reintroduced. |
| `git diff --stat -- docs/` | repo root | pass (empty) | `docs/` still untouched. |
| `ls site/.vitepress/dist/*.svg` | `dist/` | pass | Both SVGs copied to build output. |

No planned check was skipped in this phase.

## Dispatch Log

none

## Architecture Notes

- role: Senior Engineer
- decision: Recorded as a new Build sub-phase (`-p5`) rather than amending `-p3`'s or `-p4`'s already-reviewed task artifacts, for the same reason as `-p4` — those are closed records of what was actually delivered and reviewed at the time; rewriting them would erase honest history.
- decision: Used VitePress's `#home-hero-before` slot rather than a fully custom home page. Reason: the built-in hero/features layout already does the structural job correctly (confirmed in `-p4`); the gap was purely "no personality," which decorative slot content plus CSS motion closes without discarding a working, accessible structure.
- decision: Sourced the logo/favicon mark directly from the existing design mockup rather than designing a new one in this pass. Reason: `Agentsmyth Docs.dc.html` already explored four wordmark directions and marked one "pick" — reusing that decision is consistent with the design work already done, not a new creative decision needing its own justification.
- constraint: Every new animation respects `prefers-reduced-motion` — carrying forward the Plan's `ui-ux-designer` recommendation into new motion-heavy work, not just what existed when that recommendation was first recorded in Phase 3.
- assumption: The `#home-hero-before` slot's decorative content is `aria-hidden="true"` and purely visual (no information conveyed through it that isn't also in the text) — satisfies the accessibility principle that color/motion is never the sole signal, since nothing here is a signal at all, just atmosphere.
- downstream: Review should specifically re-check this delta (five new/changed files, still zero coupling to `src/`) and re-confirm the `-p4` sidebar fix wasn't disturbed. A full pixel-level visual comparison against the mockups remains not-yet-performed (carried residual risk from the existing Review) — this phase makes that comparison more meaningful to eventually do, not less needed.

## Blockers

none

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Phase 1 - Scaffold | complete | 2026-07-20 | See `-p1`. |
| Phase 2 - Content Migration | complete | 2026-07-20 | See `-p2`. |
| Phase 3 - Polish and Deploy Wiring | complete | 2026-07-20 | See `-p3`. |
| Phase 4 - Home Layout Fix | complete | 2026-07-20 | See `-p4`. |
| Phase 5 - Creative Pass | complete | 2026-07-20 | User-reported gap ("nothing creative"), addressed and verified same session. |
