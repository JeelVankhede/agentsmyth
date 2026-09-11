---
slug: mandatory-lifecycle-pre-commit-hook
version: 1
artifact: review
status: done
created: 2026-07-21
updated: 2026-07-21
manifest_ids: [R1, R2, R3, R4, R5, RI1, RI2, RI3, RI4]
upstream:
  - workflow/artifacts/briefs/mandatory-lifecycle-pre-commit-hook-v1.md
  - workflow/artifacts/plans/mandatory-lifecycle-pre-commit-hook-v1.md
  - workflow/artifacts/tasks/mandatory-lifecycle-pre-commit-hook-v1.md
orchestration:
  phase: review
  status: done
  next_phase: test
  blockers: []
  user_checkpoint: none
---

# Mandatory Local Lifecycle Pre-Commit Hook - Review

## Findings

- P2 (fixed) — `bin/agentsmyth.mjs`'s `installPreCommitHook()` — an absolute `core.hooksPath` git config value was mishandled: `join(repoDir, configured)` does not treat an absolute second argument specially (unlike `path.resolve`), so a repo with `core.hooksPath` set to an absolute path would get a wrong, nested target path instead of the real one. Fix: added an `isAbsolute(configured)` check, using the configured path directly when absolute. Confirmed the far more common relative-hooksPath case (this repo's own real `.githooks` precedent) still resolves correctly after the fix, via a scratch-repo re-test.

## Severity Summary

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 1 |
| P3 | 0 |

## Requirement Coverage

| Manifest ID | Status | Notes |
|---|---|---|
| R1 | covered | Verified: fresh `init` installs a working, executable hook automatically; idempotent on re-run |
| R2 | covered | `npm run commit-coverage:test` — 7/7 fixture cases across safe/trivial/covered/uncovered/stub-only scenarios |
| R3 | covered | No `.github/workflows/*` file added anywhere in this task's diff; docs state the local-only scope explicitly |
| R4 | covered | No new bypass mechanism; `--no-verify` is git's own, untouched behavior |
| R5 | covered | Grep of the validator and hook template found no tool-name branching |
| RI1 | covered | `.githooks/pre-commit` diff is empty; new source lives at a separate path |
| RI2 | covered | Scratch-repo test: pre-existing custom hook content preserved, agentsmyth block appended |
| RI3 | covered | `installPreCommitHook` referenced only in the `init` path; zero references in `runPrepare()` |
| RI4 | covered | Non-git scratch directory: warning printed, `init` still completes successfully |

## Architecture Notes

- role: Reviewer
- decision: The one finding (P2, absolute-hooksPath handling) was fixed in place during this Review rather than deferred, since it was a small, isolated, low-risk one-line fix with an immediate re-verification available (scratch-repo re-test of both the fixed absolute case's logic path and the pre-existing relative case).
- constraint: Confirmed no runtime dependency was introduced by the fix (`isAbsolute` is a `node:path` built-in already imported elsewhere in the same ecosystem).
- tradeoff: None.
- downstream: No other validator or CLI path depends on `installPreCommitHook()`'s internals; the fix is self-contained.

## Verification Reviewed

- `npm run commit-coverage:test` (re-run post-fix) — 7/7 pass, exact output inspected.
- `npm run validate` (re-run post-fix) — full existing suite passes, no regression.
- `npm run violations:test` (re-run post-fix) — 21/21 violation fixtures still correctly detected.
- `node --check bin/agentsmyth.mjs` — syntax valid post-fix.
- Manual scratch-repo re-test of the relative-hooksPath case (this repo's own `.githooks` precedent) post-fix — hook still installs correctly at `.githooks/pre-commit`.
- All 5 Phase 3 exit-gate scenarios from the Task artifact (fresh install, idempotent re-run, custom-hook chaining, non-git warning, no-CI-file) were re-confirmed still valid after the fix (the fix only touches the hooksPath-resolution branch, not any of those code paths).

## Residual Risk

- The coverage rule (R2) is an intentionally narrow existence-of-a-real-task-artifact proxy, not full chain-status validation — carried forward from Plan's Risk Register as an accepted, documented scope boundary, not a new risk introduced by this Review.
- No live test was performed against an actual absolute `core.hooksPath` value in a real environment (only the fixed logic path was reasoned through and the relative case re-verified) — low residual risk given `isAbsolute()`'s well-defined semantics, but noted for completeness.

## Recommendation

pass
