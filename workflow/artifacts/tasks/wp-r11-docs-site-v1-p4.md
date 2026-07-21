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
  - workflow/artifacts/reviews/wp-r11-docs-site-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# WP-R11 — Documentation Site (VitePress), Phase 4 (Home Layout Fix) - Task

## Active Phase

- Phase: Phase 4 - Home Layout Fix (Build `-p4`, post-Review correction, not in the original Plan phase breakdown — see Architecture Notes)
- Manifest IDs: R1, R8
- Exit gate: `site/.vitepress/dist/index.html` contains no `VPSidebar` markup and one `VPHome` marker; `site/.vitepress/dist/install.html` (a normal content page) still contains `VPSidebar`; hero and feature-grid text render correctly; the closing "What you actually lose" prose renders as real HTML (not raw text); `npm run site:build` exits 0; stale-term grep and `docs/`-diff checks stay clean.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Scaffold | complete | R2, R3, R4, R5, RI1, RI2, RI3, RI4 |
| Phase 2 - Content Migration | complete | R6, RI6 |
| Phase 3 - Polish and Deploy Wiring | complete | R1, R7, R8, RI5, RI7 |
| Phase 4 - Home Layout Fix (post-Review) | complete | R1, R8 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `feat/wp-r11-docs-site` | Phases 1–3 already staged, Review artifact already staged; unrelated `.dc.html` files still untracked | Baseline. |
| At handoff | `feat/wp-r11-docs-site` | `site/index.md` now `AM` (added-then-modified); no other file touched; unrelated files unchanged; `docs/` confirmed still untouched | Only `site/index.md` changed this phase. |

## Scope

- In scope: `site/index.md` only.
- Out of scope: every other file. This is a narrow, single-file correction, not a re-opening of Phase 3's broader theme work.

## Changed Files

- `site/index.md` — added `layout: home` frontmatter with VitePress's built-in `hero` (headline, tagline, two CTA actions) and `features` (the four feature-grid entries) fields, replacing the plain-content-page version that Phase 3 left in place. The closing "What you actually lose" prose is now wrapped in a styled `<div class="vp-doc">` block below the frontmatter, since VitePress's home layout does not auto-apply the standard prose-width/typography styling outside the hero/features blocks. IDs: R1, R8.

## Implementation Log

1. **The defect, reported directly by the user after running the site locally**: the home page rendered with the same 3-column shell (nav + sidebar + content + TOC) as every other page, whereas both design sources — `Agentsmyth Docs.dc.html` section 1c ("Home — hero page") and `Agentsmyth Docs Site.dc.html`'s own `isHome` state — show a distinct hero-only layout with no sidebar at all.
2. **Root cause**: Phase 3 ("Polish") only added CSS custom-property overrides (colors, fonts) via `site/.vitepress/theme/style.css`; it never actually changed `site/index.md`'s frontmatter to opt into VitePress's `layout: home`, which is the mechanism that removes the sidebar and switches to the hero/feature-grid template. This was flagged as a real possibility in Phase 1's own Architecture Notes ("Phase 3 can convert index.md into the fancy hero layout... deferred to Phase 3") but was not actually carried out when Phase 3 ran — a genuine miss, not a deliberate deferral that got lost in translation.
3. **Why Review didn't catch it**: Review's Finding #3 (P3) already named the closest thing to this exact gap — "R8's visual-match claim rests on token-level (not pixel-level) evidence... no browser screenshot or rendered visual diff... was possible in this session." Review inspected CSS/HTML *tokens* (colors, fonts, dark-mode default) and confirmed those were correct, but did not inspect page *layout/structure* (sidebar presence), which is exactly the kind of gap only an actual rendered view — which the user provided by running the site locally — would surface.
4. Rewrote `site/index.md`'s frontmatter to VitePress's home-layout schema, porting the hero headline/tagline and all four feature entries directly from the existing prose (no content was invented — same copy, restructured into the frontmatter shape the layout expects).
5. Wrapped the closing prose section in a styled `<div>` since VitePress's home layout renders arbitrary Markdown below the hero/features but without the standard doc-page's own max-width/padding — added inline styles matching the design mockup's own prose-column width (`max-width: 760px`, matching `Agentsmyth Docs.dc.html`'s corresponding section).
6. Rebuilt and directly inspected the generated `site/.vitepress/dist/index.html` and `dist/install.html` — confirmed `index.html` has zero `VPSidebar` occurrences and one `VPHome` marker; `install.html` (an ordinary content page, chosen as the control) still has its sidebar; hero text, feature titles, and the closing paragraph all render as expected HTML, not raw/broken markup.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R1, R8 | `grep -c "VPSidebar" site/.vitepress/dist/index.html` | `0` |
| R1, R8 | `grep -c "VPHome" site/.vitepress/dist/index.html` | `1` |
| R1, R8 | `grep -c "VPSidebar" site/.vitepress/dist/install.html` (control) | `1` — confirms the fix is scoped to the home page only, not a global sidebar regression. |
| R1, R8 | `npm run site:build` | Exit code 0. |
| R6, RI6 (carried) | `grep -rn -- "--system\|the setup interview" site/` | No matches. |
| RI2 (carried) | `git diff --stat -- docs/` | No output. |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `npm run site:build` | `site/` | pass | `build complete in 1.11s`. |
| `grep -c "VPSidebar" site/.vitepress/dist/index.html` | `dist/` | pass | `0` — sidebar gone from home page. |
| `grep -c "VPHome" site/.vitepress/dist/index.html` | `dist/` | pass | `1` — home layout applied. |
| `grep -c "VPSidebar" site/.vitepress/dist/install.html` | `dist/` | pass | `1` — content pages unaffected, confirming scoped fix. |
| `grep -o "Forge, don't vibe" site/.vitepress/dist/index.html` | `dist/` | pass | Hero text renders. |
| `grep -o "<p>It is not a framework...` | `dist/` | pass | Closing prose renders as real HTML, not raw markdown. |
| `grep -rn -- "--system\|the setup interview" site/` | `site/` | pass (empty) | No stale terms reintroduced. |
| `git diff --stat -- docs/` | repo root | pass (empty) | `docs/` still untouched. |

No planned check was skipped in this phase.

## Dispatch Log

none

## Architecture Notes

- role: Senior Engineer
- decision: This is recorded as a new Build sub-phase (`-p4`) rather than silently amending `-p3`'s already-reviewed task artifact. Reason: `-p3` is a closed, already-reviewed record — rewriting it after the fact would erase the honest history of what Phase 3 actually delivered and what Review actually found. A new phase, scoped to exactly this fix, keeps the chain truthful.
- decision: Used VitePress's built-in `hero`/`features` frontmatter fields rather than a custom Vue component. Reason: the default home layout's built-in fields already express everything the design mockup's hero needs (headline, tagline, two CTA buttons, four-item feature grid) — a custom component would be scope beyond what this fix requires.
- constraint: This is not a re-opening of Plan Phase 3's full scope — only `site/index.md` was touched, and only R1/R8 (already-declared IDs covering "design match") are cited, not a new manifest ID.
- assumption: The install-command copy-box treatment from the original design mockup (a clickable box with a "copied" state) is not reproduced here — VitePress's built-in hero has no equivalent slot without a custom component, and no manifest ID requires that specific interaction. Noted as a known, smaller gap versus the mockup, not silently matched.
- downstream: Review should specifically re-check this delta (a single file, narrow diff) rather than re-reviewing the whole chain from scratch. Test should include a real rendered check of the home page (not just `site:build` exit code) given this is exactly the class of defect that a build-success check alone does not catch.

## Blockers

none

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Phase 1 - Scaffold | complete | 2026-07-20 | See `-p1`. |
| Phase 2 - Content Migration | complete | 2026-07-20 | See `-p2`. |
| Phase 3 - Polish and Deploy Wiring | complete | 2026-07-20 | See `-p3`. |
| Phase 4 - Home Layout Fix | complete | 2026-07-20 | User-reported defect, fixed and verified same session. |
