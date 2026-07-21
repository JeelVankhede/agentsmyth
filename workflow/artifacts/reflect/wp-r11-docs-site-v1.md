---
slug: wp-r11-docs-site
version: 1
artifact: reflect
status: done
created: 2026-07-21
updated: 2026-07-21
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, RI1, RI2, RI3, RI4, RI5, RI6, RI7]
upstream:
  - workflow/artifacts/briefs/wp-r11-docs-site-v1.md
  - workflow/artifacts/plans/wp-r11-docs-site-v1.md
  - workflow/artifacts/tasks/wp-r11-docs-site-v1-p1.md
  - workflow/artifacts/tasks/wp-r11-docs-site-v1-p2.md
  - workflow/artifacts/tasks/wp-r11-docs-site-v1-p3.md
  - workflow/artifacts/tasks/wp-r11-docs-site-v1-p4.md
  - workflow/artifacts/tasks/wp-r11-docs-site-v1-p5.md
  - workflow/artifacts/tasks/wp-r11-docs-site-v1-p6.md
  - workflow/artifacts/tasks/wp-r11-docs-site-v1-p7.md
  - workflow/artifacts/tasks/wp-r11-docs-site-v1-p8.md
  - workflow/artifacts/tasks/wp-r11-docs-site-v1-p9.md
  - workflow/artifacts/reviews/wp-r11-docs-site-v1.md
  - workflow/artifacts/verify/wp-r11-docs-site-v1.md
  - workflow/artifacts/ship/wp-r11-docs-site-v1.md
orchestration:
  phase: reflect
  status: done
  next_phase: done
  blockers: []
  user_checkpoint: none
---

# WP-R11 — Documentation Site (VitePress) - Reflect

## Inputs

- Ship recommendation: `ship`, `workflow/artifacts/ship/wp-r11-docs-site-v1.md`.
- Full upstream chain present: brief, plan, 9 Build sub-phase task artifacts, review, verify, ship.
- PR [#41](https://github.com/JeelVankhede/agentsmyth/pull/41) open against `main`, CI passing, not yet merged as of this Reflect.

## Outcome

- Released: not yet merged. PR #41 (`feat/wp-r11-docs-site` → `main`) is open with a passing CI run; merge is the user's own action, deliberately not performed by Ship or Reflect.
- Source-of-truth: not applicable — no external tracking configured (`workflow/config/source-of-truth.yaml`).
- Rollback: not triggered. Plan recorded in the ship artifact (pre-merge: close PR; post-merge: `git revert`, clean since nothing else builds on `site/` yet).
- All 15 active manifest IDs (R1–R8, RI1–RI7) shipped. One formal waiver (npm audit residual, R4) with full required fields and cited user approval evidence.
- Live GitHub Pages deployment is an explicit Blocked Handoff, not a defect: repo is currently private and Pages is not enabled — both user-owned, external actions, correctly disclosed rather than claimed.

## What Worked

- The isolated Artifact-preview sandbox (plain HTML/CSS/JS, no VitePress) let the fire/steel/particle creative direction get iterated and approved by the user across 6+ rounds *before* ever touching the real site theme — once this pattern started, iteration got fast and blind edits to the real site stopped. See `workflow/artifacts/tasks/wp-r11-docs-site-v1-p5.md`/`-p6.md`.
- Once the user supplied Playwright (`-p9`), it immediately surfaced two real, previously undetectable defects — a fully invisible hero title and a light-mode contrast regression from the first fix — that no earlier verification method in this chain (build success, `grep` on compiled output) was structurally capable of catching. This is the single clearest evidence in this WP that observation-based verification and inference-based verification are not substitutes for each other.
- Real single-viewport screenshots, used deliberately as a control against `fullPage: true` captures, correctly ruled out two suspected defects (a glow "bleeding" into content, a mispositioned sidebar) as screenshot-stitching artifacts rather than false-reporting them as bugs. `.VPSidebar`'s actual `boundingBox()` was checked, not assumed.
- Ship's two `AskUserQuestion` calls (push+PR vs. waive for CI evidence; waive vs. hold for `npm audit`) kept a generic "Proceed" instruction from being silently read as blanket authorization for two specific, named residual-risk decisions — each had its own explicit answer, recorded with approval evidence in the waiver record.
- The first CI failure was investigated as a real defect, reproduced locally with the exact command CI runs, before any workaround was written — this caught a genuine `check-waivers.mjs` false positive rather than assuming CI noise and retrying blind.

## What Did Not Work

- Several rounds of blind CSS/animation iteration happened against the *real* site before research-then-sandbox became the working pattern — the user had to say "Can't you even research before acting!" before that shift happened. The pattern that worked (research real technique → isolated preview → user approval → port to real site) should have been the starting approach, not something arrived at after visible frustration.
- The `-p8` performance fix was originally represented as resolved based on code-presence evidence only (confirming `shadowBlur` calls were removed via `grep`), not on any actual measurement or reasoning about total per-frame operation count — the user then reported real, reproducible lag. A claim that something is "optimized" needs either a measurement or an explicit statement that it is technique-justified-but-unmeasured, not a code-presence check alone.
- Four distinct, real validator gaps were found via genuine dogfooding across this one work package: `check-scope-fence`'s unbounded last-phase Touches-capture regex, `check-skipped-accounting`'s undocumented 6th required table column, `check-waivers`'s narrow negation heuristic (misses "rather than record a waiver" as a negation), and — found last, while closing out this very Reflect — `check-release-readiness.mjs`'s compounding bugs: a substring-priority `declaredRecommendation()` that can misdetect "ship" as "hold" from unrelated prose, masking its own real checks; and a P0/P1 cross-check with no way to recognize a "confirmed and fixed" finding, contradicting `lifecycle-ship/SKILL.md`'s own already-documented step 6a (resolved-fix vs. open-risk classification). None were fixed on this branch — `src/workflow/validators/` was out of this WP's declared scope — so all four had to be manually worked around or left as documented, known false positives. The `check-waivers` case is notable: it is the *third* occurrence of the same class of false positive already tracked as `OI-29` (open since `lifecycle-process-hardening-v1`), meaning a known, already-logged gap has now caused a real CI failure in production use, not just a hypothetical risk. Per explicit user direction, `check-release-readiness.mjs`'s fix is assigned to WP-R12 rather than built here, to keep this WP's branch scoped to what it actually declared.

## Surprises

- The `npm view @jeelvankhede/agentsmyth` lookup during Ship returned a 404 — the package is not on the public npm registry. This did not block anything in this WP (PR/CI evidence needed a GitHub Actions run, not a registry publish), but it is worth naming since Ship's "release readiness" framing implicitly assumes a publishable package exists; that assumption held loosely here only because `release.yaml` has no publish gate configured.

## Manifest Coverage Retrospective

| Manifest ID | Outcome | Evidence path | Notes |
|---|---|---|---|
| R1 | shipped | `workflow/artifacts/ship/wp-r11-docs-site-v1.md` — Requirement Coverage R1 row | Real CI run cited (run `29812351574`), not just local build success. |
| R2 | shipped | `workflow/artifacts/ship/wp-r11-docs-site-v1.md` — Requirement Coverage R2 row | |
| R3 | shipped | `workflow/artifacts/ship/wp-r11-docs-site-v1.md` — Requirement Coverage R3 row | |
| R4 | shipped | `workflow/artifacts/ship/wp-r11-docs-site-v1.md` — Requirement Coverage R4 row | `vitepress` devDependency-only; `npm audit` residual formally waived, see Risk And Rollback. |
| R5 | shipped | `workflow/artifacts/ship/wp-r11-docs-site-v1.md` — Requirement Coverage R5 row | Same real CI run as R1. |
| R6 | shipped | `workflow/artifacts/ship/wp-r11-docs-site-v1.md` — Requirement Coverage R6 row | |
| R7 | shipped | `workflow/artifacts/ship/wp-r11-docs-site-v1.md` — Requirement Coverage R7 row | Evidence-only per the brief. |
| R8 | shipped | `workflow/artifacts/ship/wp-r11-docs-site-v1.md` — Requirement Coverage R8 row | Includes the `-p9` invisible-title and light-mode-contrast fixes, independently re-verified by Review via a second Playwright session. |
| RI1 | shipped | `workflow/artifacts/ship/wp-r11-docs-site-v1.md` — Requirement Coverage RI1 row | |
| RI2 | shipped | `workflow/artifacts/ship/wp-r11-docs-site-v1.md` — Requirement Coverage RI2 row | |
| RI3 | shipped | `workflow/artifacts/ship/wp-r11-docs-site-v1.md` — Requirement Coverage RI3 row | |
| RI4 | shipped | `workflow/artifacts/ship/wp-r11-docs-site-v1.md` — Requirement Coverage RI4 row | |
| RI5 | shipped | `workflow/artifacts/ship/wp-r11-docs-site-v1.md` — Requirement Coverage RI5 row | Live deployment itself is Blocked Handoff, not part of this row's claim. |
| RI6 | shipped | `workflow/artifacts/ship/wp-r11-docs-site-v1.md` — Requirement Coverage RI6 row | |
| RI7 | shipped | `workflow/artifacts/ship/wp-r11-docs-site-v1.md` — Requirement Coverage RI7 row | Deploy workflow's not-yet-succeeded status stated plainly, not omitted. |

## Deferred

none — Q1 and Q2 were both resolved at Think; no manifest ID was deferred, blocked, or left uncovered through Ship.

## Source-of-Truth Outcome

not applicable — `workflow/config/source-of-truth.yaml` has `mode: optional`, `default_required: false`, `providers: []`.

## Learning Candidates

- **Candidate learning**: When a user asks for creative/visual work and reports that a direct edit "isn't creative" or "isn't realistic," the next step should be real-world research plus an isolated preview sandbox before any further edits to the real target file — not another guess-and-edit cycle against production code. Guessing first and researching only after explicit frustration is the slower path even when it eventually converges — source: `workflow/artifacts/tasks/wp-r11-docs-site-v1-p5.md` Architecture Notes — propose-only.
- **Candidate learning**: A performance-fix claim should not be marked resolved on code-presence evidence alone (e.g. "the expensive API call is gone") without either an actual measurement or an explicit, stated caveat that the fix is technique-justified-but-unmeasured. Silently treating code-presence as equivalent to "optimized" produced a false-positive fix that the user then had to catch in production — source: `workflow/artifacts/reviews/wp-r11-docs-site-v1.md` Finding #6 — propose-only.
- **Candidate learning**: `check-waivers.mjs`'s negation heuristic has now caused a real CI failure (not just a task-artifact false-positive) via the exact gap already tracked in `OI-29` — "rather than record a waiver" joins "no waiver"/"without a waiver"/"not ... waiver" as a real phrasing this heuristic needs to recognize. This is the third distinct occurrence of the same root cause; the fix (broadening the negation regex, or restructuring the check to require a positive claim pattern rather than negation-exclusion) should be prioritized accordingly — source: `OI-29`, this WP's `-p1` false positive — propose-only.

## Follow-Ups

| Action | Owner | Suggested Artifact Or Ticket | Status |
|---|---|---|---|
| Decide whether/when to merge PR #41 (`feat/wp-r11-docs-site` → `main`) | user | PR #41 | open |
| Make the repo public and enable GitHub Pages (source: GitHub Actions) so `site-deploy.yml` can actually run and RI5/R8's live-deployment clause closes | user | none — two-step external action, already documented in the ship artifact's Blocked Handoff | open |
| Revisit the waived `npm audit` finding (3 vulnerabilities, esbuild/vite via vitepress) after any future `vitepress` upgrade; drop the waiver once clean | user / repo maintainer | none — tracked via the waiver record in `workflow/artifacts/ship/wp-r11-docs-site-v1.md` | open |
| Confirm whether the fire/ember glow's bottom-of-page intensity on short pages (e.g. Home) is intended, or should be rebalanced | user | none — a quick visual-only follow-up, not a new brief | open |
| Fix `check-waivers.mjs`'s negation heuristic — now a confirmed 3-time-recurring false positive (`OI-29`), most recently causing a real CI failure in this WP | workflow owner | new brief scoped to `src/workflow/validators/` hardening, could bundle with the two items below | open |
| Fix `check-scope-fence.mjs`'s unbounded last-phase Touches-capture regex (whitespace-only `\s*` doesn't match this repo's `- ` bullet-dash convention before `Work:`/`Exit gate:` labels) | workflow owner | new brief scoped to `src/workflow/validators/` hardening | open |
| Fix `check-skipped-accounting.mjs` requiring an undocumented 6th "Manifest IDs" column not shown in `references/output-schema.md`'s own Starter Block template | workflow owner | new brief scoped to `src/workflow/validators/` hardening | open |
| Fix `check-release-readiness.mjs`'s two compounding bugs (substring-priority `declaredRecommendation()` misdetection; P0/P1 check with no resolved-fix-vs-open-risk distinction, despite `lifecycle-ship/SKILL.md` step 6a already documenting that distinction) | wp-r12 (explicit user assignment) | WP-R12 (`workflow/artifacts/open-items.yaml` OI-40) | open |
| Broaden real-browser QA coverage beyond `-p9`'s scope (Chromium only, one desktop viewport, home + `/install` only) — mobile viewport and cross-browser at minimum | whoever does the pre-launch pass | lightweight follow-up task, not a full brief | open |
| Update Notion WP-R11 database row (currently "🟡 Ready") to "✅ Done" with PR #41 link, once merged | user | Notion Work Packages database row `3a3972bdebbb811492eec875ae8853f1` | open |

## Raw Session Entry

See `workflow/learnings/sessions/2026-07-21-wp-r11-docs-site.md`.

## Architecture Notes

- role: Project Manager
- decision: Recording outcome as fully shipped-through-Ship even though PR #41 is not yet merged — Ship's own recommendation (`ship`) and this repo's lifecycle model treat merge as a user-owned action outside the lifecycle chain's authority, not a blocking condition for Reflect. Consistent with how prior WPs (R9a/b/c) recorded `Done` status only after the user's own merge decision, tracked as a follow-up here rather than assumed.
- decision: The three validator gaps found this WP are recorded as follow-ups with a suggested combined brief, not fixed here — consistent with `-p1` through `-p9`'s own repeated statement that `src/workflow/validators/` was out of this WP's Non-Goals. Bundling is a suggestion, not a requirement; the user may split them.
- constraint: `check-waivers`'s gap is not a new discovery — `OI-29` already tracked the same root cause from a prior chain (`lifecycle-process-hardening-v1`). This Reflect updates `OI-29` in place (see `workflow/artifacts/open-items.yaml`) to record the third occurrence and its real production impact (an actual CI failure, not just a task-artifact false positive), rather than opening a duplicate item.
- downstream: Any future work touching `src/workflow/validators/check-waivers.mjs`, `check-scope-fence.mjs`, or `check-skipped-accounting.mjs` should start from this Reflect's Follow-Ups and `OI-29`/the two new open items below, which already have concrete repro cases attached (this WP's own artifacts), rather than re-discovering the same gaps from scratch.

## Exit Gate

- [x] Manifest Coverage Retrospective has one row per active R and RI.
- [x] Every follow-up has a named owner and suggested artifact title.
- [x] Learning candidates tagged propose-only.
- [x] `orchestration.status: done`, `next_phase: done`.
