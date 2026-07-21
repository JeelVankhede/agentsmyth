---
slug: wp-r11-docs-site
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-07-21
updated: 2026-07-21
manifest_ids: [R1, R8]
upstream:
  - workflow/artifacts/briefs/wp-r11-docs-site-v1.md
  - workflow/artifacts/plans/wp-r11-docs-site-v1.md
  - workflow/artifacts/tasks/wp-r11-docs-site-v1-p6.md
  - workflow/artifacts/reviews/wp-r11-docs-site-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# WP-R11 — Documentation Site (VitePress), Phase 7 (Production Port + Content Motion) - Task

## Active Phase

- Phase: Phase 7 - Production Port + Content Motion (Build `-p7`, post-Review correction, not in the original Plan phase breakdown — see Architecture Notes)
- Manifest IDs: R1, R8
- Exit gate: build passes; the canvas particle system renders globally (home and content pages alike, not just the hero); the old CSS-only flame system is fully removed from the compiled output; the content reveal system (`reveal`/`reveal-in`, `IntersectionObserver`) is present in the compiled JS/CSS; production optimizations (`prefers-reduced-motion` gate, `visibilitychange` pause) are present in the compiled JS; no debug UI (fps/particle-count readout) ships; `-p4`'s sidebar fix and all prior accessibility/coupling checks still hold; `docs/`/stale-term checks stay clean.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Scaffold | complete | R2, R3, R4, R5, RI1, RI2, RI3, RI4 |
| Phase 2 - Content Migration | complete | R6, RI6 |
| Phase 3 - Polish and Deploy Wiring | complete | R1, R7, R8, RI5, RI7 |
| Phase 4 - Home Layout Fix (post-Review) | complete | R1, R8 |
| Phase 5 - Creative Pass (post-Review) | complete | R1, R8 |
| Phase 6 - Forge Realism Pass (post-Review) | complete | R1, R8 |
| Phase 7 - Production Port + Content Motion (post-Review) | complete | R1, R8 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `feat/wp-r11-docs-site` | Phases 1–6 and Review already staged; unrelated `.dc.html` files still untracked | Baseline. |
| At handoff | `feat/wp-r11-docs-site` | New `site/.vitepress/theme/ForgeBackground.vue`; rewrote `site/.vitepress/theme/Layout.vue` (global canvas mount via `layout-top` slot + content reveal watcher); removed the old CSS-only flame/spark rules from `site/.vitepress/theme/style.css` and added `.reveal`/`.reveal-in`; unrelated files unchanged; `docs/` confirmed still untouched | |

## Scope

- In scope: `site/.vitepress/theme/ForgeBackground.vue` (new), `site/.vitepress/theme/Layout.vue` (rewritten), `site/.vitepress/theme/style.css` (flame CSS removed, reveal CSS added, two now-unused custom properties removed).
- Out of scope: page content, config.ts, deploy workflow — none touched this phase.

## Changed Files

- `site/.vitepress/theme/ForgeBackground.vue` — new component: the finalized canvas particle simulation (from the artifact-preview iteration this session, approved by the user — bottom-anchored flame via random hotspots, plus an independent "ambient" ember population spawned at random positions across the full canvas), ported into the real theme with production-specific additions not present in the throwaway preview: (1) skips starting the simulation entirely when `prefers-reduced-motion: reduce`, rather than running a token version of it; (2) pauses the `requestAnimationFrame` loop via the Page Visibility API when the tab isn't visible; (3) scales both `maxParticles()` and `ambientTarget()` off viewport area with floors/ceilings, so a phone doesn't pay a desktop-sized per-frame cost; (4) proper `onUnmounted` cleanup (cancels the RAF loop, removes the resize and visibility listeners); (5) the debug particle-count/fps readout from the preview is not included — that was a diagnostic tool, not something to ship to users. IDs: R1, R8.
- `site/.vitepress/theme/Layout.vue` — rewritten: mounts `ForgeBackground` via VitePress's documented `layout-top` slot (renders once, globally, outside any single page's content — verified this is the correct slot for a site-wide decoration, not `home-hero-before`, which only renders on the home page and was the earlier phases' scope-limiting mistake); added a `reveal()` function that adds a `reveal`/`reveal-in` class pair to top-level content blocks via `IntersectionObserver`, re-run on every client-side route change via `watch(() => route.path, ..., { immediate: true })` + `nextTick` — necessary because VitePress swaps `.vp-doc`'s contents without a full page reload, so a plain load-time animation would only ever fire once. IDs: R1, R8.
- `site/.vitepress/theme/style.css` — removed the entire CSS-only flame/spark system (`.forge-glow`, `.ember-bed`, `.ember-core`, `.spark*`, and the `fire-flicker`/`fire-flicker-slow`/`spark-rise-drift-a`/`spark-rise-drift-b` keyframes), superseded by the canvas system; kept the independent hero-text entrance (`forge-fade-up`) and gradient-sweep/flicker (`forge-sweep`, `hero-glow-flicker`), which are unrelated to the flame backdrop; added `.reveal`/`.reveal-in` for the new content-motion system; removed `--forge-fire-hot`/`--forge-fire-white`/`--forge-fire-cool`, now dead code since fire color lives in `ForgeBackground.vue`'s own color-stop table, not CSS. IDs: R1, R8.

## Implementation Log

1. **Confirmed the correct VitePress slot for a site-wide decoration.** Prior phases used `#home-hero-before`, which VitePress only renders on pages using `layout: home` — that's why the ambient effect was previously confined to the home page even after the artifact-preview work established it should be site-wide. `layout-top` is VitePress's documented slot for content that wraps the entire layout regardless of page type; switched to it.
2. Ported the finalized (user-approved) particle simulation from the artifact preview into `ForgeBackground.vue` largely verbatim for the physics/rendering logic (same hotspot model, same fire-color cooling curve, same dual body/spark/ambient particle kinds, same source-over-vs-lighter compositing split that fixed the earlier wash-out bug), converting the plain-JS/canvas preview into a Vue 3 `<script setup>` component with proper lifecycle hooks.
3. Added the production-only concerns the preview never needed (a preview page a developer opens once doesn't need visibility-pause or aggressive mobile scaling; a real site users may leave open in a background tab does): `document.hidden` gating via `visibilitychange`, area-scaled particle caps, and full `onUnmounted` teardown.
4. Removed the debug `#fps` readout from the ported version — confirmed by inspecting the compiled JS bundle that no fps/particle-count string made it into the shipped output.
5. Built the content-reveal system as a second, independent piece of motion (not tied to the fire) — verified against actual VitePress build output (`site/.vitepress/dist/install.html`'s real DOM: `.vp-doc > div > h1/p/...`) before writing the selector, rather than guessing the nesting depth, to avoid a repeat of the blind-guessing pattern from the fire work.
6. Removed the old CSS-only flame/spark rules from `style.css` in full — verified via `grep` on the build output that none of the old class names or keyframes survive.
7. Rebuilt and independently inspected the compiled output: the canvas element renders on both `index.html` (home) and `install.html` (content page) — confirms it's now truly global; the old flame markup/keyframes are gone; `reveal-in` and `IntersectionObserver` are present in the compiled theme chunk; `prefers-reduced-motion` and `visibilitychange` are present (confirms the production gates compiled in, not just exist in source); no fps/particle-count string is present anywhere in the shipped JS; the `-p4` sidebar fix (0 on home, 1 on a content page) still holds; no `outline` removal introduced; `docs/` and stale-term checks both still clean; zero `src/` imports across all four theme files including the new one.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R1, R8 | `grep -c "forge-canvas" dist/index.html` and `dist/install.html` | `1` on both — global, not hero-only. |
| R1, R8 | `grep -c "ember-bed\|ember-core\|spark spark-\|fire-flicker"` on both pages | `0` — old system fully removed. |
| R1, R8 | `grep -l "reveal-in" dist/assets/chunks/*.js` | Match found. |
| R1, R8 | `grep -o "visibilitychange\|prefers-reduced-motion"` in the compiled theme chunk | Both present. |
| — | `grep -o "fps\|particles ·"` in the compiled theme chunk | No match — debug UI not shipped. |
| R1 (carried) | `grep -c "VPSidebar"` on `index.html` / `install.html` | `0` / `1` — `-p4` not regressed. |
| — (accessibility, carried) | `grep -n "outline"` across new/changed files | No match. |
| — (coupling, carried) | `grep -n "^import"` across all 4 theme files | Zero references to `src/`. |
| R6, RI6, RI2 (carried) | stale-term grep; `git diff --stat -- docs/` | Both empty. |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `npm run site:build` | `site/` | pass | `build complete in 1.15s`. |
| `grep -c "forge-canvas"` on `index.html`/`install.html` | `dist/` | pass | 1 / 1. |
| `grep -c` for old flame class names/keyframes on both pages | `dist/` | pass (0 matches) | Fully removed. |
| `grep -l "reveal-in"` / `grep -o "IntersectionObserver"` | `dist/assets/chunks/` | pass | Found in `theme.*.js`. |
| `grep -o "visibilitychange\|prefers-reduced-motion"` | `dist/assets/chunks/theme.*.js` | pass | Both present. |
| `grep -o "fps\|particles ·"` | `dist/assets/chunks/theme.*.js` | pass (no match) | Debug UI absent from shipped build. |
| `grep -c "VPSidebar"` on both pages | `dist/` | pass | 0 / 1. |
| `grep -n "outline"` | source | pass (no match) | |
| `grep -n "^import"` across 4 theme files | source | pass | No `src/` references. |
| `grep -rn -- "--system\|the setup interview" site/`; `git diff --stat -- docs/` | repo root / `site/` | pass (both empty) | |
| `ls -la dist/assets/chunks/theme.*.js`; `du -sh dist/` | `dist/` | informational | Theme chunk 57.3K, total site 1.4MB — reasonable for a 12-page docs site with an animated background; no ballooning observed. |

No planned check was skipped in this phase.

## Dispatch Log

none

## Architecture Notes

- role: Senior Engineer
- decision: Used `layout-top` instead of continuing to extend `home-hero-before`. Reason: the earlier phases' scope was accidentally narrower than intended (home-only) because `home-hero-before` is the wrong slot for a site-wide effect — this isn't a style preference, it's the actual VitePress mechanism for "renders everywhere" vs. "renders on the home layout only."
- decision: Content reveal targets are direct children of `.vp-doc > div` (verified against real build output), not a broad `.vp-doc *` selector. Reason: a broad selector would double-animate nested elements (e.g., a paragraph inside a callout matching both the callout's own reveal and its own independent reveal), which would look like stuttering rather than a clean single reveal per block.
- decision: Debug diagnostics (fps/particle-count) from the artifact-preview version are deliberately not carried into the shipped component, and this was verified by inspecting the compiled bundle, not just by reading the source and assuming it was left out correctly.
- constraint: Every animation added or ported this phase (fire, sparks, ambient embers, content reveal, hero entrance) already had a `prefers-reduced-motion` gate from earlier phases or was added with one this phase — carrying forward the Plan's `ui-ux-designer` recommendation into all new motion, not just what existed when that recommendation was first recorded.
- assumption: `layout-top` renders once per app mount (not once per page navigation) in VitePress's SPA routing model, so `ForgeBackground`'s `onMounted`/`onUnmounted` should fire only on true app mount/teardown, not on every internal page change — this matches observed behavior (a single canvas element in the compiled output, not page-scoped) but was not independently stress-tested against rapid client-side navigation in this session; if a future check finds the canvas remounting per-page (which would restart the whole particle simulation on every navigation, a poor experience), that's a real follow-up, not something this task claims to have ruled out.
- downstream: Review should confirm the `layout-top`-vs-`home-hero-before` distinction is actually correct (it's asserted here from documented VitePress behavior, not from a runtime SPA-navigation test). Ship must still address the two P2 findings already on record (real CI-run evidence, `npm audit` waiver) — this phase didn't touch either.

## Blockers

none

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Phase 1 - Scaffold | complete | 2026-07-20 | See `-p1`. |
| Phase 2 - Content Migration | complete | 2026-07-20 | See `-p2`. |
| Phase 3 - Polish and Deploy Wiring | complete | 2026-07-20 | See `-p3`. |
| Phase 4 - Home Layout Fix | complete | 2026-07-20 | See `-p4`. |
| Phase 5 - Creative Pass | complete | 2026-07-20 | See `-p5`. |
| Phase 6 - Forge Realism Pass | complete | 2026-07-21 | See `-p6`. |
| Phase 7 - Production Port + Content Motion | complete | 2026-07-21 | Ported the approved particle simulation into the real site as a global background with production optimizations; added independent content-reveal motion for docs pages. |
