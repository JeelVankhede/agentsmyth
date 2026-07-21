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
  - workflow/artifacts/tasks/wp-r11-docs-site-v1-p8.md
  - workflow/artifacts/verify/wp-r11-docs-site-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# WP-R11 — Documentation Site (VitePress), Phase 9 (First Real Browser Audit) - Task

## Active Phase

- Phase: Phase 9 - First Real Browser Audit (Build `-p9`, post-Test correction, not in the original Plan phase breakdown — see Architecture Notes)
- Manifest IDs: R1, R8
- Exit gate: both real defects found via Playwright are fixed and re-verified via fresh screenshots (not just grep); the audit's clean findings are recorded with their actual evidence, not assumed; `docs/`/stale-term/scope-fence checks stay clean.

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
| Phase 9 - First Real Browser Audit (post-Test) | complete | R1, R8 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `feat/wp-r11-docs-site` | Phases 1–8, Review, and Verify already staged; unrelated `.dc.html` files still untracked | Baseline. |
| At handoff | `feat/wp-r11-docs-site` | `site/.vitepress/theme/style.css` modified only; unrelated files unchanged; `docs/` confirmed still untouched | |

## Scope

- In scope: `site/.vitepress/theme/style.css` only.
- Out of scope: everything else. No new files this phase.
- Also in scope, but outside the repo: a throwaway Playwright audit script and screenshots written to the session scratchpad (`/private/tmp/.../scratchpad/`), not committed, not part of this repo.

## Why This Phase Exists

The user installed Playwright locally for manual testing and asked for one real content-and-UI audit of the site. This is the first point in this entire work package where any actual rendered output was inspected — every prior claim about visual correctness (Reviews' Findings #3 and the residual risk in Verify's Sign-Off) was explicitly caveated as "not measurable in this environment." That caveat turned out to matter: a real browser check found two genuine defects that no amount of `grep`-based verification could have caught, because both are about how CSS actually *renders*, not whether specific strings exist in a file.

## Changed Files

- `site/.vitepress/theme/style.css` — two fixes to the hero-title gradient:
  1. **The hero title was completely invisible on the home page.** Root cause: `-p7`'s "dead code" cleanup deleted the `--forge-fire-white` CSS custom property, believing it was only used by the CSS-only flame system being removed in that same phase — but it was *also* referenced by the (unrelated, still-in-use) hero-title gradient sweep. An undefined CSS variable with no fallback doesn't warn or degrade gracefully; it invalidates the entire declaration using it. Combined with `-webkit-text-fill-color: transparent` (required for the gradient-clipped-text effect), the result was a fully transparent title with no background showing through it — confirmed via a Playwright screenshot of literally blank space where "Forge, don't vibe." should be.
  2. **The first fix (a hardcoded literal near-white color) created a new, different bug in light mode.** Confirmed via screenshot: sampling the animation across its full cycle in light mode showed the text nearly disappearing mid-sweep, because a near-white highlight color has almost no contrast against this theme's near-white page background. Fixed properly with a theme-aware `--forge-hero-highlight` custom property — near-white in dark mode (legible against a dark page), the ember tone itself in light mode (always legible against paper, no separate near-white stop to go wrong). Re-verified across 12 sampled frames (6 per theme) — text stays legible throughout in both.
  IDs: R1, R8.

## Implementation Log

1. Started the real VitePress **production preview** server (`vitepress preview`, not `dev` — serves the actual build output) on `localhost:4321`.
2. Wrote a Playwright script (Chromium) covering: home page hero visibility + computed style + a real screenshot of just the hero element; canvas presence and a sampled-pixel check that it's actually drawing non-transparent content; sidebar presence on home vs. a content page; a content page (`/install`) with scroll-triggered content-reveal count; a button hover to confirm no JS error; light-mode toggle; and console/page-error capture throughout.
3. **First finding**: hero screenshot showed a solid, obviously blank rectangle — no text at all, despite Playwright's DOM-level `isVisible()` reporting `true` (it only checks layout presence/dimensions, not whether the fill is actually painting anything perceptible — a real gap in what that particular check can catch, worth remembering for future audits). Computed style showed `color: transparent` and `-webkit-text-fill-color: transparent`, which is expected for the intended effect — the missing piece was that the *background gradient* meant to show through wasn't rendering at all, which computed-style inspection alone didn't immediately explain.
4. Traced the actual cause by cross-referencing every `var(--forge-*)` reference in `style.css` against every `var(--forge-*)` *definition* — found exactly one orphaned reference (`--forge-fire-white`, used once, defined nowhere), left behind by `-p7`'s cleanup. This is the same category of "I changed something without checking every place that referenced it" mistake as `-p7`'s scope-fence-Touches gap, just in CSS variables instead of a plan document.
5. Fixed with a literal color inline (to avoid immediately re-orphaning a variable), rebuilt, and re-screenshotted the hero element directly — this time the gradient sweep rendered exactly as designed ("Forge, don't vibe." with a visible white→amber→white sweep).
6. Took a full-page screenshot next and initially misread a bright, fairly dense orange glow overlapping the "What you actually lose" section as a possible second bug — **caught this before reporting it**: full-page screenshots composite multiple scroll positions, and `position: fixed` elements (the fire canvas) are a documented source of rendering artifacts in that mode, since a fixed element can appear to "repeat" at each stitched slice rather than staying pinned once. Took real, single-viewport (non-stitched) screenshots at scroll-top and scrolled-to-bottom instead to check whether this was genuine behavior or a screenshot-tooling artifact.
7. Confirmed via the real viewport screenshots that the fire's viewport-bottom anchoring is working exactly as designed (`position: fixed`, so it stays relative to the *viewport*, not the *page*) — but this does mean that on short pages (Home is only ~1337px tall against a 900px viewport), scrolling to the very bottom brings real content directly into the densest part of the fire's glow. This is real, reproducible behavior, not an artifact — flagged for the user's judgment in the session response, not silently changed, since it may be exactly the "fills the whole background" effect already approved through several rounds of the earlier Artifact-preview iteration.
8. Took real (non-full-page) screenshots of the `/install` content page next, both at the top and scrolled down, specifically to check whether the sidebar/TOC appeared correctly — the earlier full-page screenshot had made the sidebar/TOC look like they started partway down the page rather than at the top, which would have been a serious defect if real. Confirmed via `.VPSidebar`'s actual bounding box (`{x:0, y:0, width:272, height:900}` — correct) and the real viewport screenshots that this was, again, a full-page-screenshot `position: sticky` artifact, not a real bug: the sidebar and TOC are correctly pinned at the top in both scroll states, the active nav item and scroll-spy TOC highlighting both update correctly, and the corrected "Setup: the resolution pass" label renders as expected.
9. Sampled the light-mode hero across 5 points in its 7-second animation cycle as a deliberate check on the color choice from step 5 (not because anything specific was suspected — just because "I already got this exact kind of bug wrong once this session, check the other theme too" was the more careful thing to do) — found the second bug described above (near-invisible text mid-sweep against the light page background).
10. Fixed with a theme-aware CSS custom property instead of a second hardcoded literal, rebuilt, and re-sampled 12 frames across both themes (6 each) to confirm: dark mode still shows the original near-white highlight correctly; light mode now stays legible throughout the entire sweep, no low-contrast dip at any sampled point.
11. Confirmed zero console/page errors were captured across the whole audit session.
12. Confirmed the canvas element is genuinely drawing: sampling ~1-in-97 pixels of the canvas's alpha channel found several hundred non-transparent pixels, ruling out "the canvas element exists but renders nothing," a failure mode `grep`-based checks on the compiled bundle could never have caught.
13. Re-ran the standing repo-hygiene checks (stale terms, `docs/` diff, `check-scope-fence`) after the `style.css` changes — all still clean.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R1, R8 | Playwright screenshot of `.VPHero .text` on home, dark mode | Title visibly renders with the intended gradient sweep, not blank. |
| R1, R8 | Playwright screenshots of `.VPHero .text` sampled across 6 points in the animation cycle, light mode | Text stays legible at every sampled point — no near-invisible dip. |
| R1, R8 | Playwright screenshots of `.VPHero .text` sampled across 6 points, dark mode | Text stays legible at every sampled point (regression check after the light-mode fix). |
| R1 | Canvas alpha-channel pixel sample | Non-zero count of non-transparent pixels — canvas is actually drawing, not blank. |
| R1 | Console/page-error capture across the full audit session | Zero errors. |
| R1, R8 | Real (non-full-page) viewport screenshots of `/install` at scroll-top and scrolled-down | Sidebar and TOC both correctly pinned at the top in both states; active nav/TOC-scroll-spy highlighting correct. |
| — | `.VPSidebar` real `boundingBox()` at scroll=0 | `{x:0, y:0, width:272, height:900}` — confirms the full-page-screenshot sidebar artifact was not a real bug. |
| R6, RI6 (carried) | Stale-term grep | Empty. |
| RI2 (carried) | `git diff --stat -- docs/` | Empty. |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `npm run site:build` (×2, before and after the light-mode fix) | `site/` | pass | Both builds succeeded. |
| `npx vitepress preview site --port 4321` | `site/` | pass | Real production-build server, not dev mode. |
| Playwright audit script (Chromium, 1280×900) — first pass | localhost:4321 | fail | Hero screenshot showed blank space; root-caused to the orphaned `--forge-fire-white` variable. |
| Playwright audit script — after literal-color fix | localhost:4321 | pass (dark), fail (light, found via separate frame-sampling check) | Dark mode fixed; light mode broke for a different reason, caught before being reported as done. |
| Playwright audit script — after theme-aware-variable fix, 12 sampled frames | localhost:4321 | pass | Legible throughout, both themes. |
| Real (non-full-page) viewport screenshots of `/install` | localhost:4321 | pass | Sidebar/TOC correctly positioned; ruled out the full-page-screenshot artifact. |
| `grep -rn -- "--system\|the setup interview" site/`; `git diff --stat -- docs/` | repo root / `site/` | pass (both empty) | No regressions. |

**What this audit did not cover**, stated plainly: every page's content was not individually screenshotted (only home and `/install`); mobile/narrow-viewport rendering was not checked; only Chromium was used (Firefox/WebKit were available but not exercised); the fire-at-viewport-bottom intensity on short pages was observed and reported, not changed, since it may already be an approved design choice — see the session response for that specific judgment call, left to the user rather than decided here.

## Dispatch Log

none

## Architecture Notes

- role: Senior Engineer
- decision: Fixed the light-mode regression with a theme-aware custom property rather than a second hardcoded literal (which was the same mistake in miniature that caused the original bug: a value that only makes sense in one theme, applied without checking the other). Rejected alternative: keep `#fff8ec` and just accept the light-mode legibility dip as minor. Reason: the dip was severe enough in the screenshots (a whole word nearly disappearing) that "minor" would be a mischaracterization, not a judgment call.
- decision: Recorded as a new Build sub-phase (`-p9`), consistent with `-p4` through `-p8` — this keeps the already-signed-off Verify artifact's own record honest rather than quietly editing history.
- constraint: Both fixes are confined to `site/.vitepress/theme/style.css`; no other file needed to change to resolve either defect.
- assumption: The fire-at-bottom intensity on short pages (Home specifically) is *not* treated as a defect requiring a fix in this phase — it's real, reproducible, viewport-fixed-positioning-as-designed behavior, and it may be exactly what was approved across the earlier Artifact-preview iteration cycle ("whole background... fill... not just at the bottom"). Flagged for the user's explicit call rather than assumed either way.
- downstream: Review should independently re-verify both fixes (ideally via the same Playwright approach now that it's available, not by falling back to `grep` for something that is fundamentally a rendering question). Ship should note that this work package's evidence now includes real browser verification for the first time, which meaningfully changes the residual-risk picture Review and Verify both recorded before this phase — the "no browser/profiler available" caveat on the `-p8` performance fix and the pixel-comparison gap both remain true in the sense that a full pass still hasn't happened, but the tooling constraint that made them true has changed and should be re-assessed, not just carried forward verbatim.

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
| Phase 8 - Real Performance Fix | complete | 2026-07-21 | See `-p8`. |
| Phase 9 - First Real Browser Audit | complete | 2026-07-21 | User provided real browser testing capability (Playwright); found and fixed two genuine rendering defects no prior grep-based check could have caught. |
