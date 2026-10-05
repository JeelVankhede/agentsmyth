---
slug: deepen-setup-interview
version: 1
artifact: review
status: done
created: 2026-07-22
updated: 2026-07-22
manifest_ids: [R1, R2, R3, R4, R5, R6, RI1, RI2]
upstream:
  - workflow/artifacts/briefs/deepen-setup-interview-v1.md
  - workflow/artifacts/plans/deepen-setup-interview-v1.md
  - workflow/artifacts/tasks/deepen-setup-interview-v1.md
orchestration:
  phase: review
  status: done
  next_phase: test
  blockers: []
  user_checkpoint: none
---

# Deepen Setup Interview + Fold check-setup-complete into agentsmyth check - Review

## Findings

- P2 (fixed) — `bin/agentsmyth.mjs`'s `detectVerificationCommands()` — `npm init`'s own default
  `test` script stub (`echo "Error: no test specified" && exit 1"`) would have been detected as a
  real, resolved verification command for any fresh package.json with no actual test suite —
  worse than asking, since it would silently record a non-functional command as `required: true`.
  Fix: exclude any script whose body contains `"no test specified"`. Reproduced the exact
  scenario (a package.json with only that stub `test` script and a real `build` script) and
  confirmed the stub is now excluded while `build` is still correctly detected.
- P3 (fixed) — Plan/Task mismatch: `check-scope-fence.mjs` correctly flagged
  `src/workflow/validators/check-setup-complete.mjs` (Phase 1) and
  `test/run-init-prepare-interop-tests.mjs` (Phase 5) as outside their phases' declared Touches.
  Both were real, necessary discoveries made live during Build (the `AGENTSMYTH_HOME` fix while
  verifying Phase 1's own exit gate; the F5/F6 test update while running Phase 5's regression),
  not scope creep — the Plan's Touches lists were incomplete, not the Task's Changed Files. Fixed
  by updating the Plan's Phase 1 and Phase 5 Touches with an explanatory note, rather than
  hiding either file from the Task.

## Severity Summary

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 1 |
| P3 | 1 |

## Requirement Coverage

| Manifest ID | Status | Notes |
|---|---|---|
| R1 | covered | Fresh scratch fails, this repo's own check passes, standalone invocation unchanged |
| R2 | covered | Realistic + fully-blind scratch repos both verified, all 3 tiers behave as designed |
| R3 | covered | SKILL.md Step 5e rewritten, no stale claims remain |
| R4 | covered | check-setup-refs.mjs passes, 47 references |
| R5 | covered | All 9 named suites + commit-coverage:test pass |
| R6 | covered | Orphaned hook logic folded into the mandatory hook, verified end-to-end in a real scratch repo; orphan removed |
| RI1 | covered | No dependency changes |
| RI2 | covered | Standalone check-setup-complete.mjs/check-config.mjs invocation confirmed unchanged for callers without AGENTSMYTH_HOME |

## Architecture Notes

- role: Reviewer
- decision: Both findings were fixed in place during Review — the npm-init-stub exclusion is a
  small, isolated, immediately-re-verifiable fix; the Plan/Task Touches mismatch is corrected by
  updating the Plan (the artifact that was actually incomplete), consistent with this repo's own
  established convention for handling legitimate mid-Build discoveries.
- constraint: Confirmed no runtime dependency was introduced by either fix.
- tradeoff: None.
- downstream: The orphaned `src/workflow/validators/hooks/pre-commit` file, initially recorded as
  a deferred open item, was resolved within this same chain per explicit user direction (Phase 6)
  rather than left for later — its phase-gate-readiness logic now lives inside the mandatory hook.

## Verification Reviewed

- `npm run validate` (re-run post-fix, twice — once after the npm-init-stub fix, once after the
  Plan Touches fix) — passes both times, output inspected.
- All 9 named suites + `commit-coverage:test` (re-run post-fix) — all pass.
- Manual re-test of the npm-init-stub scenario post-fix: stub correctly excluded, real `build`
  script still correctly detected.

## Residual Risk

- Content-quality of the widened `pending-setup.yaml` questions (e.g. whether a user's answer to
  the source-of-truth or risks/non-goals question is substantive) is not mechanically verifiable —
  carried forward from Plan's own stated Non-Goal, not a new risk.

## Recommendation

pass
