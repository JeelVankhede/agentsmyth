---
slug: wp-r12-local-install-fixes
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-07-21
updated: 2026-07-21
manifest_ids: [R2, R3, RI1]
upstream:
  - workflow/artifacts/briefs/wp-r12-local-install-fixes-v1.md
  - workflow/artifacts/plans/wp-r12-local-install-fixes-v1.md
  - workflow/artifacts/tasks/wp-r12-local-install-fixes-v1-p1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: none
---

# WP-R12 — Local Install Fixes - Task (Phase 2: `check-release-readiness.mjs` Fixes)

## Active Phase

- Phase: Phase 2 - `check-release-readiness.mjs` fixes
- Manifest IDs: R2, R3, RI1
- Exit gate: `node src/workflow/validators/check-release-readiness.mjs` reports the correct `recommendation:` for every existing Ship artifact (human-spot-checked); `npm run violations:test` still correctly rejects `o-ship-with-open-p1`; a new synthetic positive fixture (Ship declaring "ship" against a Review with a resolved-and-marked P1) passes cleanly, with no Waivers entry needed.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Packaging path fix | complete | R1, RI2 |
| Phase 2 - `check-release-readiness.mjs` fixes | complete | R2, R3, RI1 |
| Phase 3 - 5-adapter global invocation command | pending | R4, RI2, RI3, RI4, RI5 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `wp-r12-local-install-fixes` | `bin/agentsmyth.mjs` staged (Phase 1); `site/`, WP-R11 leftover files untracked | Same as Phase 1's handoff state. |
| At handoff | `wp-r12-local-install-fixes` | `src/workflow/validators/check-release-readiness.mjs` modified, unstaged; Phase 1's `bin/agentsmyth.mjs` change now committed (`2466184` bundled it with the Think/Plan commit) | |

## Scope

- In scope: `src/workflow/validators/check-release-readiness.mjs` — `declaredRecommendation()` and the P0/P1 cross-check block only.
- Out of scope: any other function or check in this file (blockers check, missing-Ship-Status-section error — both already correct, untouched); any other validator file.

## Changed Files

- `src/workflow/validators/check-release-readiness.mjs` — `declaredRecommendation()` rewritten to parse the `- Recommendation: <value>` line first, falling back to the old whole-section scan only when that line is genuinely absent (pre-schema-convention artifacts); new `RESOLVED_MARKERS`/`severityResolvedInBoldFindings()` helper added; the P0/P1 cross-check now excludes a severity from "open" only when every matching bold-inline Finding for that severity carries a recognized resolved marker. — IDs: R2, R3, RI1

## Implementation Log

- **R2 (substring-priority fix):** Initial implementation used a strict line-anchored regex only, with no fallback. Running it against every real Ship artifact on this branch (not just the fixture) surfaced a genuine regression: `system-level-install-v1.md` and `wp-r5-repo-shape-taxonomy-v1.md` predate the schema's `- Recommendation:` bullet convention and declare their recommendation in free prose ("Ready to ship...", "Ship. User confirmed..."). A strict-only regex broke both. Fixed by falling back to the old whole-section substring scan only when the canonical line is absent — these two files have no competing "hold" text elsewhere to misdetect, so the old heuristic is safe for them specifically; the new line-anchored path handles every schema-conformant artifact (all newer ones) correctly.
- **Real-world validation, not just fixture validation:** re-running the fixed `declaredRecommendation()` against all 15 real Ship artifacts on this branch found a *second*, previously-undetected instance of the exact bug this Phase fixes: `power-skills-wave2-v1.md` was being misdetected as `hold-with-waiver` by the old logic (from a "Verification recommendation: hold-with-waiver (superseded — see ...)" line), when its actual declared `- Recommendation:` is `**ship**`. This was not previously known or flagged — found only because Build tested against real artifacts instead of only the synthetic fixture, per this repo's own established "don't trust a fixture alone" lesson (OI-4).
- **R3 (resolved-finding recognition):** Designed narrowly after Plan's own discovery (see Plan's Inputs) that this repo has at least 3 real Findings-list formats in use, only one of which (`**P1, confirmed and fixed post-Test**` bold-inline) has real, shipped precedent for a resolved-marker convention (`(fixed)`, `confirmed and fixed`, found via `grep` survey of `wp-r9b-scaffold-init-resolution-v1.md`'s real shipped review). Implemented `severityResolvedInBoldFindings()` to match only that established position, requiring every matching bold span for a severity to carry the marker (handles a document with multiple findings at the same severity, some fixed and some not, correctly still blocking).
- Verified the design decision to key off the bold span's own text (not a body-wide "contains fix" search) against the real `o-ship-with-open-p1` violation fixture, which has a `### P1 — ...` heading (not bold-inline) and a "Fix recommendation: fixture only." field that a naive body-wide search would have false-matched on — confirmed the implementation does NOT match this fixture's format at all (zero bold-inline `**P1` spans exist in it), so it correctly falls through to the pre-existing (safe) blocking behavior.
- Built two new synthetic fixtures (not committed to the repo — scratch files under the session scratchpad, used for direct manual verification via `--dir`) to test both directions of R3's logic: a positive case (bold-inline P1 marked "confirmed and fixed post-Test") correctly passed without a waiver; the same fixture with the marker removed (`**P1, still open**`) correctly reverted to blocking with the expected error message naming the specific unresolved severity.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R2 | `node src/workflow/validators/check-release-readiness.mjs` against all 15 real Ship artifacts (13 tracked + 2 untracked WP-R11 leftovers) | every file's reported `recommendation:` matches its own actual `- Recommendation:` line, human-verified |
| R2 | `system-level-install-v1.md`, `wp-r5-repo-shape-taxonomy-v1.md` (pre-schema-convention prose declarations) | still correctly detected via fallback, no regression |
| R2 | `power-skills-wave2-v1.md` | now correctly detected as "ship" (previously misdetected as "hold-with-waiver" — a real, previously-unknown instance of the same bug, now also fixed) |
| R3 | `npm run violations:test` (includes `o-ship-with-open-p1`) | 21/21 pass, fixture `o` still correctly rejects |
| R3 | Synthetic positive fixture (resolved, marked P1) | `check-release-readiness: ok`, no fabricated waiver required |
| R3 | Synthetic negative fixture (same P1, marker removed) | `check-release-readiness: failed`, correct error naming `P1` specifically |
| RI1 | Full `npm run validate` | zero new failures beyond the 27 pre-existing, unrelated ones already documented in prior WPs |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `node src/workflow/validators/check-release-readiness.mjs` (first attempt, strict-only) | R2 | fail (2 issues) | Real regression on 2 pre-schema-convention files — caught before considering the phase done, not shipped broken. |
| Same command, after fallback fix | R2 | pass | All 15 files: correct `recommendation:` per file, human-verified against each file's own text. |
| `npm run violations:test` | R3, RI1 | pass | 21/21, including fixture `o` (open-P1 rejection) and `c2` (missing-recommendation rejection). |
| `node .../check-release-readiness.mjs --dir <scratch>` (positive synthetic fixture) | R3 | pass | `check-release-readiness: ok`. |
| `node .../check-release-readiness.mjs --dir <scratch>` (negative synthetic fixture) | R3 | fail (1 issue), as expected | Error correctly names `P1` as the unresolved severity. |
| `npm run validate` (full suite) | RI1 | pass | Zero new failures; the 27 pre-existing failures are all unrelated (`power-skills-wave4`, `system-level-install`, `wp-r5-repo-shape-taxonomy` frontmatter/schema issues predating this WP). |

## Dispatch Log

none

## Architecture Notes

- role: Senior Engineer
- decision: The fallback-to-old-behavior design for `declaredRecommendation()` was not the original plan — Plan's own design called for a strict line-anchored regex only. Build changed this after real-artifact testing (not the fixture) surfaced a genuine regression risk the Plan hadn't anticipated. Recorded here as the actual as-built design, differing from Plan's Work description in this one respect; Plan's own Verification Plan (re-run against every shipped Ship artifact) is exactly what caught this, validating that verification step's inclusion.
- decision: Finding the `power-skills-wave2-v1.md` misdetection was a genuine surprise, not something Plan anticipated — it's evidence that the R2 bug was live and silently wrong in at least 2 real, already-shipped artifacts (this one and wp-r11-docs-site-v1's, found earlier this session) before this fix, not a single isolated incident.
- constraint: Per the brief's own Constraints section, only `check-release-readiness.mjs`'s two named bugs were touched — no other check in the file was modified, even though `openP0P1Counts()`'s table-parsing logic sits right next to the new code.
- downstream: If a future artifact adopts a 4th Findings-list format, R3's resolved-finding recognition will not apply to it, and the existing block-and-require-review behavior takes over unchanged — this is safe-by-design, not a gap requiring urgent follow-up, per the brief's own stated risk-asymmetry reasoning (A3).

## Blockers

none

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Phase 1 - Packaging path fix | complete | 2026-07-21 | See `-p1` task artifact. |
| Phase 2 - `check-release-readiness.mjs` fixes | complete | 2026-07-21 | Both bugs fixed; verified against all real shipped Ship artifacts (found and fixed a second, previously-unknown instance of the R2 bug along the way), the existing violation fixture, and two new synthetic fixtures covering both directions of R3's logic. |
