---
slug: validator-false-positive-fixes
version: 1
artifact: review
status: ready-for-next-phase
created: 2026-07-27
updated: 2026-07-27
manifest_ids: [R1, R2, R3, RI1]
upstream:
  - workflow/artifacts/briefs/validator-false-positive-fixes-v1.md
  - workflow/artifacts/plans/validator-false-positive-fixes-v1.md
  - workflow/artifacts/tasks/validator-false-positive-fixes-v1.md
orchestration:
  phase: review
  status: ready-for-next-phase
  next_phase: test
  blockers: []
  user_checkpoint: none
---

# Validator false-positive fixes (OI-29, OI-37, OI-38) - Review

## Findings

none

## Severity Summary

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |

## Requirement Coverage

| Manifest ID | Evidence | Status | Notes |
|---|---|---|---|
| R1 | `git diff check-waivers.mjs` (negation regex gains `\brather than\b.{0,20}\bwaiv`); `test/fixtures/conformance/waiver-rather-than/`; `r14-rather-than` conformance check | covered | Root cause independently re-traced this pass: `f99c388`'s own commit message names the exact gap, and the fixture's text matches the real historical case word-for-word (confirmed via `git show f99c388~1:...`). |
| R3 | `git diff lifecycle-test/references/{output-schema.md,exemplar.md}`; `grep` for the stale 5-column header (zero hits); `r16-skipped-checks-columns` conformance check | covered | Build's own exit gate (repo-wide grep) found the `exemplar.md` instance beyond the Plan's Repo Impact Map — correctly caught and fixed, not silently absorbed. |
| R2 | `git diff check-scope-fence.mjs` (boundary lookahead gains optional `(?:-\s*)?`); `test/fixtures/conformance/scope-fence-bullet-boundary/`; `r15-scope-fence-bullet` conformance check; `check-scope-fence.mjs --dir workflow/artifacts` clean (0 issues, re-confirmed independently this pass) | covered | Highest-risk requirement, as flagged at Plan. The fix itself is a minimal, correctly-scoped regex change (verified: the added group is optional, so behavior for non-dash-prefixed labels is unchanged). See Residual Risk for the retroactive-correction judgment call. |
| RI1 | `test/run-conformance-tests.mjs` diff (3 new checks: r14, r15, r16); `npm run conformance:test` 15/15, re-run independently this pass | covered | All three requirements have a dedicated regression check, not just a one-time manual fixture run. |

## Architecture Notes

- role: Staff Reviewer
- decision: Reviewed the 5 retroactive historical-artifact corrections individually rather than accepting "validate is green" as sufficient evidence on its own — re-read each of the 5 diffs (`init-prepare-interop-v1.md`, `lifecycle-process-hardening-v1.md` ×2 phases, `wp-r11-docs-site-v1.md` ×2 phases, `wp-r9b-scaffold-init-resolution-v1.md`, `src-audit-remediation-v1.md`) against Build's stated reasoning in the task's own Implementation Log. Each holds up: two are genuine self-referencing-plan-edit gaps, one is a task-side basename duplication (correctly left the plan alone), two are Touches-shorthand notation Build correctly identified `check-scope-fence.mjs` can't parse (ellipsis, mid-string wildcard) and replaced with a directory-level token the existing glob matcher already supports.
- decision: Confirmed Build's own mid-Build pause (asking the user how to handle the 28-issue blast radius rather than deciding unilaterally) was the right call, not process theater — the alternative (silently waiving 28 real findings, or silently editing 5 historical artifacts without surfacing it) would both have been worse.
- constraint: Verified independently (not just re-reading Build's claim) that the regex changes are additive-only: `check-waivers.mjs`'s new alternative only *narrows* what gets flagged (an additional way to say "not a claim"), and `check-scope-fence.mjs`'s new optional group only *changes* behavior when a `- ` prefix is actually present immediately before the boundary label — re-ran both existing real-violation fixtures (`waivers-dir`/`table-claim`, `j-file-outside-scope`) this pass and confirmed neither regressed.
- constraint: `verification.yaml`'s `skipped_checks.required_fields` (6 fields, already included `manifest_ids`) was the ground truth Build correctly targeted for R3 — confirmed this file was not touched, only the stale documentation that undercounted it.
- downstream: Test should independently re-run the three suites one more time from a clean state (not reuse Build's cached results) before Ship. Ship should decide whether the 5 retroactive corrections warrant their own line in `CHANGELOG.md` (they're internal dev-workspace artifact corrections, not shipped-package behavior, so likely not — but worth an explicit call rather than a default).

## Verification Reviewed

| Item | Outcome | Notes |
|---|---|---|
| `npm run validate` | pass (independently re-run this pass) | Exit 0, full suite, not reused from Build's earlier run. |
| `npm run violations:test` | pass (21/21, independently re-run) | No regression to any of the 21 existing seeded violations. |
| `npm run conformance:test` | pass (15/15, independently re-run) | Includes the 3 new checks (r14, r15, r16) for this chain. |
| `node src/workflow/validators/check-scope-fence.mjs --dir workflow/artifacts` | pass (0 issues, independently re-run) | The specific check this chain's riskiest requirement (R2) modifies, re-run directly against the full real historical tree, not just fixtures. |
| Manual diff read of both validator source changes | both changes are minimal and additive-only | `check-waivers.mjs`: one new regex alternative. `check-scope-fence.mjs`: one new optional non-capturing group. Neither touches unrelated logic. |
| Manual diff read of all 5 retroactive-correction files | each independently justified, not a mechanical pattern applied blindly | See Architecture Notes. |

## Residual Risk

- **check-scope-fence.mjs's real invocation path was previously unverified in bulk.** Before this chain, nobody had run this validator against the full real `workflow/artifacts/` tree in one pass (its `npm run validate` wiring never surfaced a failure, because the OI-37 bug it fixes was itself masking the very violations it would have caught). This chain is the first time the validator has actually done its job against real historical content. Low risk going forward — RI1's new conformance check plus `npm run validate`'s existing wiring now exercise this continuously — but worth naming explicitly rather than treating "it's green now" as though it always was.
- **The 5 retroactive corrections touch already-shipped, already-merged historical artifacts.** This is unusual for this repo (historical artifacts are normally a frozen record) and was done under explicit, real-time user direction rather than by default. Every edit is annotated in-place with a dated explanation, so a future reader auditing `git blame` on those files won't mistake these for original chain content. Accepted as the right tradeoff given the alternative (a permanently red `npm run validate`, or 28 unexplained waivers).
- **No automated test previously existed for version-skew or scope-fence/waiver false-positive classes before this chain and the prior `fix/version-skew-field-absent` chain.** This is now three such classes with regression coverage (version-skew field-absent, plus this chain's three). Worth watching whether more turn up — each has come from real dogfooding, not speculative hardening, which is the right signal to keep responding to.

## Recommendation

pass
