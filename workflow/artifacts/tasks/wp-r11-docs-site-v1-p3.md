---
slug: wp-r11-docs-site
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-07-20
updated: 2026-07-20
manifest_ids: [R1, R7, R8, RI5, RI7]
upstream:
  - workflow/artifacts/briefs/wp-r11-docs-site-v1.md
  - workflow/artifacts/plans/wp-r11-docs-site-v1.md
  - workflow/artifacts/tasks/wp-r11-docs-site-v1-p1.md
  - workflow/artifacts/tasks/wp-r11-docs-site-v1-p2.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# WP-R11 — Documentation Site (VitePress), Phase 3 (Polish and Deploy Wiring) - Task

## Active Phase

- Phase: Phase 3 - Polish and Deploy Wiring (Build `-p3`)
- Manifest IDs: R1, R7, R8, RI5, RI7
- Exit gate: local `npm run site:dev`/build output matches the design mockups' dark theme (and light variant) per manual comparison against `Agentsmyth Docs.dc.html`; `site-deploy.yml` passes YAML syntax validation; `site-deploy` is not referenced by `ci.yml` (confirms separation); this task states the deploy workflow's not-yet-succeeded status plainly for Ship to carry forward, per RI7.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Scaffold | complete | R2, R3, R4, R5, RI1, RI2, RI3, RI4 |
| Phase 2 - Content Migration | complete | R6, RI6 |
| Phase 3 - Polish and Deploy Wiring | complete | R1, R7, R8, RI5, RI7 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `feat/wp-r11-docs-site` | Phases 1–2 changes already staged; unrelated `.dc.html` files still untracked | Baseline before this phase's edits. |
| At handoff | `feat/wp-r11-docs-site` | Adds `AM site/.vitepress/config.ts` (appearance/head), new `?? site/.vitepress/theme/` (`index.ts`, `style.css`), new `?? .github/workflows/site-deploy.yml`; unrelated `.dc.html` files unchanged; `docs/` confirmed untouched via `git diff --stat -- docs/` (empty output) | All Build phases for this slug now complete — ready for Review. |

## Scope

- In scope: `site/.vitepress/theme/index.ts`, `site/.vitepress/theme/style.css`, `site/.vitepress/config.ts` (appearance + head additions only, nav/sidebar untouched from Phase 1), `.github/workflows/site-deploy.yml` (new).
- Out of scope (confirmed untouched): `docs/**`, `.github/workflows/ci.yml` (no changes this phase — Phase 1 already added the build-check step; the deploy workflow is deliberately a separate file, not an edit to `ci.yml`), any `site/*.md` body content (Phase 2's job, not touched again).

## Changed Files

- `site/.vitepress/theme/index.ts` — new custom theme, extends VitePress's `DefaultTheme` and imports `style.css`. Minimal by design: no custom Vue components were needed to express the token-level (color/font) changes the design mockups call for. IDs: R8.
- `site/.vitepress/theme/style.css` — ember/steel dark theme (default) plus a light variant, using VitePress's own `--vp-c-*` CSS custom properties under `:root` (light) and `.dark` (dark) selectors, sourced directly from `Agentsmyth Docs.dc.html`'s style-tile token values (`#EF9F27`/`#BA7517` brand, `#0B0C0E`/`#FBFBFA` page background, `#23262B`/`#E7E5E1` borders, Geist/Geist Mono fonts). Also adds inline-code ember tint and sidebar active-item ember indicator, matching the mockups' "Components" tile. IDs: R8.
- `site/.vitepress/config.ts` — added `appearance: 'dark'` (dark-mode-primary, per the design brief) and `head` entries for Google Fonts preconnect. Nav/sidebar structure from Phase 1 unchanged. IDs: R8.
- `.github/workflows/site-deploy.yml` — new, separate workflow: builds `site/` and deploys to GitHub Pages via the official `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages` actions; triggers on push to `main` for `site/**` (or the workflow file itself) plus manual `workflow_dispatch`. Explicitly named GitHub Pages per Q1's resolution (RI5). Not referenced anywhere in `ci.yml` and carries no required-check semantics of its own (RI7). IDs: R8, RI5, RI7.

## Implementation Log

1. Built the custom theme as a thin wrapper around VitePress's `DefaultTheme` plus a CSS override file — the design mockups (`Agentsmyth Docs.dc.html`) specify color tokens, typography, and a handful of component-level treatments (buttons, callouts, sidebar active state, code blocks), all of which map directly onto VitePress's existing CSS-variable theming system without needing custom Vue components.
2. Set `appearance: 'dark'` in `config.ts` — matches the design brief's "dark mode primary with a light variant" (users can still toggle; VitePress's built-in appearance switcher is unaffected by this default).
3. Rebuilt (`npm run site:build`) and inspected the actual build output directly: confirmed `<html>`'s inline dark-mode bootstrap script defaults to `"dark"` (`localStorage.getItem("vitepress-theme-appearance")||"dark"`), confirmed the built CSS bundle (`site/.vitepress/dist/assets/style.*.css`) contains both `ef9f27` (dark ember) and the Geist font-family declarations.
4. Built `.github/workflows/site-deploy.yml` as a workflow file separate from `ci.yml`, per the plan's RI7 architecture decision — verified separation with `grep -l "site-deploy" .github/workflows/ci.yml` (no match).
5. Validated the new workflow's YAML syntax with `npx --yes js-yaml .github/workflows/site-deploy.yml` (a real, on-registry tool used ephemerally via `npx`, not added to `package.json` — no runtime-dependency-invariant impact) — parsed cleanly into the expected structure (`on.push`, `on.workflow_dispatch`, `permissions`, `concurrency`, two jobs).
6. Confirmed no in-repo branch-protection configuration exists to cross-check `site-deploy.yml`'s required-check status against (that setting lives in GitHub's repo settings, not version-controlled) — noted as inspected to the extent possible in-repo, matching the plan's own verification-row caveat.
7. Did **not** attempt to run `site-deploy.yml` for real, and did not attempt to push, enable GitHub Pages, or flip repo visibility — all explicitly out of scope per the brief's Non-Goals and the plan's Determinism Rules (Build does not push, deploy, or mutate external/repo settings without an approved exception; none was granted for those specific actions).

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R8 | `npm run site:build` (post-theme) | Exit code 0. |
| R8 | Built CSS bundle contains `ef9f27` and `Geist` | Confirmed via `grep` on `site/.vitepress/dist/assets/*.css`. |
| R8 | Built HTML's dark-mode bootstrap script | Defaults to `"dark"` when no prior `localStorage` preference exists. |
| RI5 | `site-deploy.yml` names the provider explicitly | `actions/deploy-pages` (GitHub Pages) named directly, not abstracted. |
| RI7 | `grep -l "site-deploy" .github/workflows/ci.yml` | No match — separation confirmed. |
| R8, RI5, RI7 | `npx --yes js-yaml .github/workflows/site-deploy.yml` | Parses without error. |
| R7 | — | Already complete; see `workflow/artifacts/briefs/wp-r11-docs-site-v1.md`'s R7 acceptance note and this session's earlier edits to `Agentsmyth Docs Site.dc.html`/`Agentsmyth Docs.dc.html`. No further action this phase. |
| R1 | Cumulative — cross-cutting per the plan's Requirement Coverage table; satisfied by the sum of R2–R8's own evidence (`site/` builds, all 12 sections present, theme applied, deploy workflow wired) rather than its own changed file. | Not independently re-verifiable beyond R2–R8's own rows; no separate evidence exists or is expected. |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `npm run site:build` | `site/` | pass | Rebuilt cleanly after theme changes; `build complete in 1.32s`. |
| `grep -o '<html[^>]*>' site/.vitepress/dist/index.html` + inline bootstrap-script inspection | `site/.vitepress/dist/` | pass | Confirmed `appearance: 'dark'` propagated into `window.__VP_SITE_DATA__` and the dark-mode bootstrap script. |
| `grep -rl "ef9f27" site/.vitepress/dist/assets/*.css` / `grep -rl "Geist" ...` | `site/.vitepress/dist/` | pass | Both tokens present in the built CSS bundle. |
| `npx --yes js-yaml .github/workflows/site-deploy.yml` | repo root | pass | Valid YAML; ephemeral `npx` use, not a new project dependency. |
| `grep -l "site-deploy" .github/workflows/ci.yml` | repo root | pass (no match) | Confirms `ci.yml`/`site-deploy.yml` isolation. |
| `git diff --stat -- docs/` | repo root | pass (empty) | `docs/` untouched across all three Build phases. |

**Not run, recorded as risk (not a silent gap):** an actual GitHub Pages deployment. The repo is currently private and Pages is not enabled, so `site-deploy.yml` cannot succeed yet — this is expected, not a defect (see RI7 and the plan's Risk Register). Owner: user (the two remaining external actions — make the repo public, enable Pages with source "GitHub Actions" — belong to them, not to this Build phase). Ship must state this plainly rather than imply the site is live.

**Not run, recorded as risk:** a pixel-level visual comparison against `Agentsmyth Docs.dc.html` (no screenshot/browser-rendering tool was available in this session). Verified instead via direct inspection of the built CSS/HTML for the specific token values (colors, fonts, dark-default behavior) the design calls for — a weaker but still evidence-based substitute for an actual visual diff. Review/Ship should flag if a real visual QA pass is wanted before this ships publicly.

## Dispatch Log

none

## Architecture Notes

- role: Senior Engineer
- decision: Implemented the theme via VitePress's built-in `--vp-c-*` CSS custom-property system rather than authoring custom Vue components. Reason: every design element in scope for Phase 3 (colors, fonts, inline-code tint, sidebar active-indicator, callout colors) is expressible through the existing theme's variable surface; introducing custom components would add maintenance surface with no corresponding requirement.
- decision: `site-deploy.yml` uses `workflow_dispatch` in addition to the `push` trigger. Reason: lets the user manually fire a deploy attempt later (e.g., right after enabling Pages) without needing an unrelated `site/` commit to trigger it.
- constraint: RI7 (isolation from required checks) — verified structurally (no cross-reference in `ci.yml`, separate file) since this repo has no in-repo branch-protection config to check directly.
- assumption: The Google Fonts `@import` in `style.css` (matching the design mockups' own font-loading approach) is acceptable for a static docs site; if the user later wants to self-host fonts (avoiding a third-party network request), that is a follow-up, not a Phase 3 gap — not required by any current manifest ID.
- downstream: Review should confirm the theme changes don't reintroduce any accessibility gap (per Plan's `ui-ux-designer` recommendation — focus indicators, color-plus-text pairing) since this phase is the first to actually add CSS. Ship must draft the exact two-step runbook ("make repo public," "enable Pages, source: GitHub Actions") as the user-facing next action, and must not report the site as deployed.

## Blockers

none — the not-yet-succeeded deploy workflow and the absence of a pixel-level visual QA pass are both recorded as risks above with owners, not blockers preventing this phase's own exit gate.

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Phase 1 - Scaffold | complete | 2026-07-20 | See `workflow/artifacts/tasks/wp-r11-docs-site-v1-p1.md`. |
| Phase 2 - Content Migration | complete | 2026-07-20 | See `workflow/artifacts/tasks/wp-r11-docs-site-v1-p2.md`. |
| Phase 3 - Polish and Deploy Wiring | complete | 2026-07-20 | All exit-gate conditions verified with command evidence above. All Build phases for `wp-r11-docs-site-v1` are now complete; ready for Review. |
