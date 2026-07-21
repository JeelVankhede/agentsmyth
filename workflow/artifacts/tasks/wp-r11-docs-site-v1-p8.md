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
  - workflow/artifacts/tasks/wp-r11-docs-site-v1-p7.md
  - workflow/artifacts/reviews/wp-r11-docs-site-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# WP-R11 — Documentation Site (VitePress), Phase 8 (Real Performance Fix) - Task

## Active Phase

- Phase: Phase 8 - Real Performance Fix (Build `-p8`, post-Review correction, not in the original Plan phase breakdown — see Architecture Notes)
- Manifest IDs: R1, R8
- Exit gate: build passes; zero real `shadowBlur` calls remain (comment mentions are fine); `createRadialGradient` is called only at sprite-bake time (mount), not per-particle-per-frame; the sprite/`drawImage` technique is present in the compiled bundle; DPR cap confirmed lowered in source; `-p7`'s global-canvas fix and all prior regression checks (sidebar, accessibility, `src/` coupling, `docs/`, stale terms) still hold.

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
| Phase 8 - Real Performance Fix (post-Review) | complete | R1, R8 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `feat/wp-r11-docs-site` | Phases 1–7 and Review already staged; unrelated `.dc.html` files still untracked | Baseline. |
| At handoff | `feat/wp-r11-docs-site` | `site/.vitepress/theme/ForgeBackground.vue` rewritten (rendering internals only — spawn/physics logic unchanged); no other file touched; unrelated files unchanged; `docs/` confirmed still untouched | |

## Scope

- In scope: `site/.vitepress/theme/ForgeBackground.vue` only — specifically its rendering path. The particle spawn/physics model approved in the artifact-preview session is unchanged; only how each particle gets drawn to the canvas changed.
- Out of scope: everything else.

## Changed Files

- `site/.vitepress/theme/ForgeBackground.vue` — replaced per-particle, per-frame `shadowBlur` and `createRadialGradient` calls with a pre-rendered sprite cache: 6 small offscreen canvases (one per fire-color stop), baked once at mount, drawn per particle via `drawImage` (one of the cheapest canvas operations, versus a blur convolution or a fresh gradient object). Also: (1) batched drawing by composite mode — all `source-over` (body) particles in one pass, then one `globalCompositeOperation` switch, then all `lighter` (spark/ambient) particles, instead of toggling composite mode on every single particle; (2) lowered the canvas DPR cap from 2 to 1.5 (a decorative, heavily-blurred layer doesn't need full retina sharpness, and 1.5² vs 2² is roughly 44% fewer pixels to fill per draw); (3) added a self-correcting adaptive quality scale (`qualityScale`) driven by a smoothed rolling average of actual frame time — the particle budget eases down automatically if frames run slow and recovers when there's headroom, rather than relying on one static count tuned for an imagined "typical" device. IDs: R1, R8.

## Implementation Log

1. **Root-caused the lag report, not just re-tuned counts.** `shadowBlur` is a well-documented expensive operation (it's a real blur convolution over the shape's bounding area, recomputed on every call) and `createRadialGradient` allocates and computes a new gradient object every time it's called. The previous version called one or the other for every particle, every frame — with up to a few hundred particles at 60fps, that's tens of thousands of expensive operations per second. This is a well-established, structural performance problem with that rendering approach, not something more particle-count tuning would have fixed.
2. Replaced both with a sprite-cache technique: bake each fire-color stop's soft glow as a small offscreen canvas once, at component mount, then `drawImage` the appropriate pre-rendered bitmap per particle per frame. `drawImage` of an already-rasterized source is dramatically cheaper than either `shadowBlur` or `createRadialGradient`+fill — this is the standard technique real-time canvas particle systems use for exactly this reason.
3. Restructured the per-frame loop into three passes instead of one interleaved pass: (a) physics update + survival filtering, bucketing survivors by render kind; (b) draw all `body`-kind particles under `source-over`; (c) draw all `spark`/`ambient`-kind particles under `lighter`. Switching `globalCompositeOperation` has its own (smaller, but nonzero) cost — batching by mode means it's set twice per frame instead of once per particle.
4. Lowered the DPR cap and added the adaptive quality scale as defense-in-depth beyond the rendering-technique fix itself — since this session's own `check-scope-fence` validator bug (Finding #5) already demonstrated that trusting a single static assumption without a self-checking mechanism is a recurring risk in this codebase, applying that same lesson here: don't just pick numbers that seem safe, add a mechanism that corrects itself if they're wrong for a given device.
5. Rebuilt and directly inspected both the source and the compiled bundle: confirmed zero real `shadowBlur` calls remain (only a comment mentions the word); confirmed `createRadialGradient` appears only inside `makeSprite()`, called exactly 6 times at mount, never inside the per-frame `tick()` function; confirmed `drawImage` is present in the compiled theme chunk; confirmed the DPR cap change is in source; re-ran every standing regression check from `-p4` through `-p7` (global canvas presence, sidebar fix, no outline removal, zero `src/` imports, `docs/` untouched, no stale terms) and all still pass.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R1, R8 | `grep -n "shadowBlur" site/.vitepress/theme/ForgeBackground.vue` | Only the explanatory comment; no API call. |
| R1, R8 | `grep -c "createRadialGradient"` in source, plus manual read confirming it's inside `makeSprite()` only | 2 total occurrences (1 real call + 1 in the comment); zero inside `tick()`. |
| R1, R8 | `grep -o "drawImage"` in the compiled theme chunk | Present. |
| R1, R8 | `grep -n "devicePixelRatio"` in source | Cap is `1.5`, not `2`. |
| R1 (carried) | `grep -c "forge-canvas"` on `index.html`/`install.html` | `1` / `1` — `-p7`'s global fix intact. |
| R1 (carried) | `grep -c "VPSidebar"` on `index.html`/`install.html` | `0` / `1` — `-p4` not regressed. |
| — (carried) | `grep -n "outline"`; `grep -n "^import"`; stale-term grep; `git diff --stat -- docs/` | All clean, as in every prior phase. |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `npm run site:build` | `site/` | pass | `build complete in 1.20s`. |
| `grep -n "shadowBlur"` | source | pass | Comment only. |
| `grep -c "createRadialGradient"` + manual read | source | pass | 2 occurrences, both accounted for (1 real call in `makeSprite`, 1 in comment); confirmed absent from `tick()`. |
| `grep -o "drawImage\|makeSprite\|spriteFor"` | `dist/assets/chunks/*.js` | pass | `drawImage` present. |
| `grep -n "devicePixelRatio"` | source | pass | `1.5` cap confirmed. |
| `grep -c "forge-canvas"` on both page types | `dist/` | pass | 1 / 1. |
| `grep -c "VPSidebar"` on both page types | `dist/` | pass | 0 / 1. |
| `grep -n "outline"`; `grep -n "^import"` | source | pass | No outline removal; zero `src/` imports. |
| `git diff --stat -- docs/`; stale-term grep | repo root / `site/` | pass (both empty) | |

**What this task cannot verify**, stated plainly rather than implied as covered: actual measured frame rate or CPU/GPU usage in a real browser. This environment has no browser or profiling tool available. The fix is justified by well-established, widely-documented facts about relative canvas-operation cost (`drawImage` of a cached bitmap vs. `shadowBlur`/fresh gradients is a difference of orders of magnitude, not a marginal tweak), not by a before/after measurement — that distinction matters and is recorded as residual risk below, not glossed over.

## Dispatch Log

none

## Architecture Notes

- role: Senior Engineer
- decision: Sprite-cache + `drawImage` over `shadowBlur`/`createRadialGradient`. Rejected alternative: keep the gradient/shadow approach and simply reduce particle counts further. Reason: reducing counts treats the symptom (too much of an expensive operation) without fixing that the operation itself is expensive per-call — a device that still struggles at a lower count would need yet another reduction; fixing the per-particle cost itself is the actual, complete fix and preserves the density the user already approved.
- decision: Added adaptive quality scaling as a second, independent safety net beyond the rendering-technique fix. Reason: this session has already demonstrated (Finding #5, the `check-scope-fence` bug) that a static assumption which looks safe in review can still be wrong in practice; a self-correcting mechanism doesn't depend on me having guessed right about "safe" particle counts for every device this runs on.
- constraint: Only the rendering internals changed — the spawn/physics model (hotspot positions, particle lifetimes, velocity/turbulence behavior) is byte-identical to what the user approved in the artifact-preview session, so the visual result should be the same motion, just cheaper to produce. Color is now selected from 6 discrete pre-baked stops instead of continuously interpolated per particle — a real, acknowledged simplification, expected to be visually indistinguishable in motion but not literally identical output.
- assumption: `drawImage`-of-a-cached-bitmap being dramatically cheaper than `shadowBlur`/fresh-gradient-per-call is treated as settled, well-established fact about canvas rendering, not an assumption needing its own verification — this is documented, uncontroversial browser-engine behavior, not a claim specific to this code.
- downstream: Review should confirm this task's own honesty about its verification limit (no real browser/profiler available) is reflected accurately, not overstated as "fixed and measured." If the user reports it's still slow after this, the next step should be getting real profiling data (a screenshot of DevTools' Performance tab, or a description of which interaction lags) rather than a fourth round of theory-only fixes.

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
| Phase 7 - Production Port + Content Motion | complete | 2026-07-21 | See `-p7`. |
| Phase 8 - Real Performance Fix | complete | 2026-07-21 | User reported lag; root-caused to shadowBlur/gradient-per-frame and fixed with sprite caching + batched compositing + adaptive quality scale. |
