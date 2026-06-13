# Exemplar

## Good Example

A complete ship artifact. Every gate is explicitly checked or marked not applicable. Rollback is defined. Requirement Coverage has one row per ID with a status of shipped, deferred, blocked, or waived.

```markdown
---
slug: domain-yaml-loader
version: 1
artifact: ship
status: ready-for-next-phase
created: 2026-05-17
updated: 2026-05-17
manifest_ids: [R1, R2, RI1, RI2]
upstream:
  brief: .workflow/artifacts/briefs/domain-yaml-loader-v1.md
  plan: .workflow/artifacts/plans/domain-yaml-loader-v1.md
  task: .workflow/artifacts/tasks/domain-yaml-loader-v1.md
  review: .workflow/artifacts/reviews/domain-yaml-loader-v1.md
  verify: .workflow/artifacts/verify/domain-yaml-loader-v1.md
orchestration:
  phase: ship
  status: ready-for-next-phase
  next_phase: reflect
  blockers: []
  user_checkpoint: none
---

## Inputs

- Verify recommendation: `ship` (`.workflow/artifacts/verify/domain-yaml-loader-v1.md`)
- Review recommendation: `pass-with-risk` (`.workflow/artifacts/reviews/domain-yaml-loader-v1.md`)
- P2 finding on RI1: resolved — explicit absent-file condition confirmed by Test grep.
- Release config: `.workflow/config/release.yaml` — no PR or CI gate configured; release config specifies direct merge.
- Source-of-truth config: `.workflow/config/source-of-truth.yaml` — no external tracking configured.

## Ship Status

- Recommendation: ship
- Review result: pass-with-risk (P2 resolved before Test sign-off), `.workflow/artifacts/reviews/domain-yaml-loader-v1.md`
- Verification recommendation: ship, `.workflow/artifacts/verify/domain-yaml-loader-v1.md`
- PR / CI: not applicable — release config does not require a PR or CI gate.
- Source-of-truth: not applicable — no external tracking configured.
- Release: ready — documentation-only change; no package version, deployment artifact, or binary affected.

## Requirement Coverage

| Manifest ID | Status | Evidence | Notes |
|---|---|---|---|
| R1 | shipped | SKILL.md On demand block confirmed by Test grep at line 47 | No outstanding gap. |
| R2 | shipped | output-schema.md Constraints section confirmed by Test grep at line 23 | No outstanding gap. |
| RI1 | shipped | Explicit absent-file condition confirmed by Test grep at line 48; P2 fix verified | Residual risk from Review fully resolved. |
| RI2 | shipped | Negative check confirmed by Test; no migration language in either file | No outstanding gap. |

## PR / CI Readiness

Not applicable — release config (`release.yaml`) specifies direct merge; no PR or CI gate required or configured.

## Release Readiness

- Branch: `feature/domain-yaml-loader` — ready to merge to `main`.
- Change type: documentation and skill config only; no package, binary, or deployment artifact.
- Release gate: none configured in `release.yaml`.

## Source-of-Truth Status

Not applicable — no source-of-truth provider configured in `.workflow/config/source-of-truth.yaml`.

## Risk And Rollback

- Residual risk: none unwaived. P2 finding resolved before Test sign-off.
- Rollback trigger: unexpected domain constraint behavior in briefs produced after merge.
- Rollback action: `git revert` the SKILL.md and output-schema.md commits.
- Rollback owner: workflow owner.

## Blocked Handoff

none

## Architecture Notes

- role: Senior DevOps
- decision: `ship` is appropriate — all configured gates satisfied; no active unwaived blockers.
- constraint: Release config has no PR gate for this repo; this is a deliberate config decision, not a gap.
- downstream: Reflect should note that validator coverage (skipped check in Test artifact) remains open for Phase 7.

## Exit Gate

- [x] Recommendation: `ship`
- [x] All active R and RI IDs in Requirement Coverage with `shipped` status.
- [x] No active unwaived blockers.
- [x] PR/CI and source-of-truth explicitly marked not applicable with config reference.
- [x] Rollback trigger, action, and owner defined.

## Next Phase

Reflect. `orchestration.next_phase: reflect`.
```

## Bad Example

A ship artifact that asserts `ship` without inspecting gates and leaves critical sections vague or absent.

```markdown
---
slug: domain-yaml-loader
status: shipped
---

## Ship Decision

The changes look good and all requirements are met. Review passed and testing was done. Everything is ready.

## Requirements

- R1: done
- R2: done
- RI1: done
- RI2: done

## Notes

No major risks. The PR can be merged when ready.
```

## Why The Bad Is Bad

- "All requirements are met" is not derived from reading upstream artifacts — there is no citation of the verify artifact path, the review recommendation, or whether the P2 finding on RI1 was resolved before this artifact was written. Ship is claiming a gate was satisfied without showing it read the gate.
- `status: shipped` is not a valid orchestration status. The valid values are `ready-for-next-phase` (for `ship`) and `blocked-for-user` (for `hold`). Restore-context and downstream processes cannot determine lifecycle state from this value.
- Requirement Coverage is a flat list with "done" — no Evidence column, no status per ID, no way to audit whether any ID was actually inspected. If RI1's fix was never applied, this artifact still shows it as done.
- "The PR can be merged when ready" is a deferred action with no branch name, no owner, and no PR URL. If release config requires a PR gate, this sentence hides the gap rather than recording it as a hold.
- PR/CI Readiness, Release Readiness, Source-of-Truth Status, and Risk And Rollback sections are entirely absent — the four gate sections that determine `ship` vs `hold` are missing. An agent restoring context from this artifact cannot determine what was checked, what the rollback plan is, or whether source-of-truth was applicable.
- "No major risks" is not a rollback plan. It names no trigger, no action, and no owner. If something goes wrong after merge, there is no actionable recovery path recorded.
