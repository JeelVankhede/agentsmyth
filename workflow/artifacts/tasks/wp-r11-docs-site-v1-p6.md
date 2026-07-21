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
  - workflow/artifacts/tasks/wp-r11-docs-site-v1-p5.md
  - workflow/artifacts/reviews/wp-r11-docs-site-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# WP-R11 — Documentation Site (VitePress), Phase 6 (Forge Realism Pass) - Task

## Active Phase

- Phase: Phase 6 - Forge Realism Pass (Build `-p6`, post-Review correction, not in the original Plan phase breakdown — see Architecture Notes)
- Manifest IDs: R1, R8
- Exit gate: build passes; the new decorative markup (`ember-core`, `ember-bed`) is present on the home page and absent from content pages; the new animation names (`fire-flicker`, `fire-flicker-slow`, `spark-rise-drift-a`/`-b`, `hero-glow-flicker`, `mark-breathe`) and the steel-shine sweep are present in the compiled CSS; `prefers-reduced-motion` guard still present; no `outline` removal; `-p4`'s home-layout fix not regressed; `docs/`/stale-term checks stay clean.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Scaffold | complete | R2, R3, R4, R5, RI1, RI2, RI3, RI4 |
| Phase 2 - Content Migration | complete | R6, RI6 |
| Phase 3 - Polish and Deploy Wiring | complete | R1, R7, R8, RI5, RI7 |
| Phase 4 - Home Layout Fix (post-Review) | complete | R1, R8 |
| Phase 5 - Creative Pass (post-Review) | complete | R1, R8 |
| Phase 6 - Forge Realism Pass (post-Review) | complete | R1, R8 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `feat/wp-r11-docs-site` | Phases 1–5 and Review already staged; unrelated `.dc.html` files still untracked | Baseline. |
| At handoff | `feat/wp-r11-docs-site` | Modified `site/.vitepress/theme/Layout.vue` (2 new decorative spans) and `site/.vitepress/theme/style.css` (fire-flicker keyframes replace the flat pulse, cooling/drifting sparks replace the simple rise, steel-shine sweep added to buttons, metallic rim added to feature cards, charcoal grain added to body background, logo breathing glow added); no other files touched; unrelated files unchanged; `docs/` confirmed still untouched | |

## Scope

- In scope: `site/.vitepress/theme/Layout.vue`, `site/.vitepress/theme/style.css` only.
- Out of scope: everything else — no config, content, or deploy-workflow changes this phase.

## Changed Files

- `site/.vitepress/theme/Layout.vue` — added `ember-bed` (a low, wide charcoal-glow mass) and two more `spark` elements (6 total, up from 4), so the hero backdrop reads as a fire sitting in a charcoal bed rather than a single glowing dot. IDs: R8.
- `site/.vitepress/theme/style.css` — replaced the flat `ember-pulse`/`spark-rise` treatment with: (1) `fire-flicker`/`fire-flicker-slow`, irregular asymmetric-keyframe animations (9 uneven stops, not a symmetric sine pulse) driving a layered radial gradient that goes white-hot core → orange → ember → sooty red edge, composited with `mix-blend-mode: screen`; (2) `spark-rise-drift-a`/`-b`, which color-cool each spark from white-hot through orange and ember down to a spent charcoal-red as it rises, with horizontal drift so sparks don't travel in a perfectly straight line; (3) a steel-shine sweep (`::after` pseudo-element, skewed gradient, `left` transition) on every `VPButton`, simulating light glinting off a heated metal surface on hover; (4) a metallic rim (`::before` mask-composite border) on feature cards, cool steel highlight top-left fading to a warm ember catch bottom-right, visible on hover; (5) charcoal-grain texture in the dark-mode body background via two faint `repeating-radial-gradient` layers; (6) a `mark-breathe` glow on the nav logo so the mark reads as "still hot" at rest, not just on hover. IDs: R1, R8.

## Implementation Log

1. **The ask**: the previous creative pass (`-p5`) added motion but the fire/steel metaphor itself was generic — a single pulsing dot and flat color swaps, not something that reads as combustion or polished metal. The user specifically named what was missing: charcoal, fire, and steel shine.
2. Replaced the single flat `ember-orb` with two layers — `ember-bed` (a low, blurred, wide charcoal-red mass suggesting embers banked in ash) and `ember-core` (the actual flame, a radial gradient running through four real fire colors — white-hot, hot orange, ember, sooty red — rather than one flat ember tone).
3. Rewrote the flicker animation with irregular, asymmetric keyframe percentages and opacity/scale values (`0%, 9%, 19%, 31%, 44%, 58%, 71%, 85%, 100%` with no repeating pattern) instead of the previous smooth `0%, 50%, 100%` sine pulse — real combustion doesn't breathe evenly, and a symmetric pulse reads as mechanical, not organic.
4. Rewrote spark motion to color-cool in flight (white-hot at birth → orange → ember → dark red as spent) using `background`/`box-shadow` keyframe interpolation, plus added horizontal drift (two mirrored keyframe sets, `-a` drifting right, `-b` drifting left) so sparks scatter rather than rising in a straight vertical line, and increased the count from 4 to 6.
5. Added a literal steel-shine effect: a skewed, blurred light-colored gradient band that sweeps across buttons on hover via a `left` transition, the standard technique for simulating a glint of light crossing a polished/heated metal surface — not present anywhere before this phase.
6. Added a metallic gradient rim to feature cards (cool highlight one corner, warm ember catch the opposite corner) using a masked gradient border, visible on hover — suggests a beveled steel edge catching ambient light.
7. Added charcoal-grain texture to the page background (two faint `repeating-radial-gradient` dot patterns) so the dark surface reads less like a flat color fill and more like a textured material.
8. Rebuilt and directly inspected the generated HTML/CSS — confirmed the new decorative elements and every new animation/effect name are present in the actual build output (not just in source), confirmed correct home-only scoping, and re-ran the standing regression checks from `-p4`/`-p5` (sidebar presence, no outline removal, `docs/` untouched, no stale terms) to make sure nothing broke.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R8 | `grep -c "ember-core\|ember-bed" site/.vitepress/dist/index.html` vs. `install.html` | `1` on home, `0` on a content page. |
| R8 | `grep -o 'class="spark spark-[0-9]"' dist/index.html` | 6 distinct spark classes present. |
| R1, R8 | `grep -o "fire-flicker\|fire-flicker-slow\|spark-rise-drift-a\|spark-rise-drift-b\|hero-glow-flicker\|mark-breathe" dist/assets/*.css` | All 6 present. |
| R1, R8 | `grep -c "forge-steel-shine\|skewX" dist/assets/*.css` | Present — steel-shine sweep compiled in. |
| R1 (carried) | `grep -c "VPSidebar" index.html` / `install.html` | `0` / `1` — `-p4`'s fix not regressed. |
| — (accessibility, carried) | `grep -n "outline" site/.vitepress/theme/style.css`; `grep -c "prefers-reduced-motion" dist/assets/*.css` | No outline removal; reduced-motion guard still present. |
| R6, RI6 (carried) | `grep -rn -- "--system\|the setup interview" site/` | No matches. |
| RI2 (carried) | `git diff --stat -- docs/` | No output. |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `npm run site:build` | `site/` | pass | `build complete in 1.25s`. |
| `grep -c "ember-core\|ember-bed"` on `index.html`/`install.html` | `dist/` | pass | 1 / 0 — scoped correctly. |
| `grep -o 'class="spark spark-[0-9]"' dist/index.html \| sort -u` | `dist/` | pass | 6 unique spark classes. |
| `grep -o` for all 6 new animation/effect names, `dist/assets/*.css` | `dist/` | pass | All present. |
| `grep -c "prefers-reduced-motion"` | `dist/assets/*.css` | pass | Guard intact. |
| `grep -n "outline"` | source | pass (no match) | No accessibility regression. |
| `grep -c "VPSidebar"` on `index.html`/`install.html` | `dist/` | pass | 0 / 1 — no regression on `-p4`. |
| `git diff --stat -- docs/`; `grep -rn -- "--system\|the setup interview" site/` | repo root / `site/` | pass (both empty) | No regressions. |

No planned check was skipped in this phase.

## Dispatch Log

none

## Architecture Notes

- role: Senior Engineer
- decision: Recorded as a new Build sub-phase (`-p6`), same reasoning as `-p4`/`-p5` — keeps each already-reviewed phase's record honest rather than rewriting history.
- decision: Used `mix-blend-mode: screen` for the fire-core layer so overlapping glow layers add light like real overlapping light sources do, rather than simply stacking semi-transparent flat circles (which reads as layered gray shapes, not glow).
- decision: Kept every new animation inside the existing `@media (prefers-reduced-motion: no-preference)` guard established in `-p5` — this phase adds more motion, so re-affirming the accessibility boundary matters more here, not less.
- constraint: The fire/charcoal color variables (`--forge-fire-hot`, `--forge-fire-white`, `--forge-fire-cool`, `--forge-steel-shine`) are defined in both `:root` (light) and `.dark`, so the effect renders in both themes; not independently visually re-verified in light mode this phase (no screenshot tool available — same standing limitation Review has already recorded).
- downstream: Review should re-check this delta specifically (2 files, both already-reviewed) and re-confirm no regression on the `-p4` sidebar fix and `-p5`'s accessibility/coupling checks, consistent with how it treated `-p5`.

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
| Phase 6 - Forge Realism Pass | complete | 2026-07-21 | User asked for a more realistic charcoal/fire/steel treatment; addressed and verified same session. |
