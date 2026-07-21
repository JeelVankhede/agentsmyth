---
slug: wp-r13-setup-validator-definitions-root
version: 1
artifact: verify
status: ready-for-next-phase
created: 2026-07-21
updated: 2026-07-21
manifest_ids: [R1, R2, RI1, RI2]
upstream:
  - workflow/artifacts/briefs/wp-r13-setup-validator-definitions-root-v1.md
  - workflow/artifacts/plans/wp-r13-setup-validator-definitions-root-v1.md
  - workflow/artifacts/tasks/wp-r13-setup-validator-definitions-root-v1.md
  - workflow/artifacts/reviews/wp-r13-setup-validator-definitions-root-v1.md
orchestration:
  phase: test
  status: ready-for-next-phase
  next_phase: ship
  blockers: []
  user_checkpoint: none
---

# WP-R13 — Setup Validator Ignores definitions_root - Verification

## Inputs

- Approved brief (R1, R2, RI1, RI2), single-phase plan, task artifact, and Review (`pass`, one P3 finding — fixture indentation, non-blocking).
- `workflow/config/verification.yaml`: no pre-configured commands (`commands: []`); `command_policy.allow_discovered_commands: true` — every command below was discovered from `package.json` scripts and direct validator invocation.
- Fresh session: every command below was re-run in this Test phase, independent of Build's and Review's prior runs.

## Automated Checks

| Command | Outcome | Evidence |
|---|---|---|
| `node test/run-setup-validator-definitions-root-tests.mjs` | pass | 3/3 — `linked` (pass), `defensive-fallback` (pass), `defensive-fallback-broken` (correctly fails). |
| `npm run validate` | pass | Zero new failures. |
| `npm run violations:test` | pass | 21/21, unaffected. |
| `npm run checkpoint-approval:test` | pass | 3/3, unaffected. |
| `npm run setup-checks:test` (pre-existing, unrelated suite) | pass | 4/4, confirms no interaction with the prior domain.yaml regex fix in the same file. |

## Manifest Coverage

| Manifest ID | How Verified | Evidence | Result | Notes |
|---|---|---|---|---|
| R1 | command | `linked` case in the new test suite | pass | |
| R2 | command | `defensive-fallback` (pass) + `defensive-fallback-broken` (correctly fails) | pass | |
| RI1 | command | All 3 cases include `workflow/artifacts`/`workflow/learnings` in their fixture trees | pass | |
| RI2 | command | `git diff origin/main -- src/workflow/validators/` shows only `check-setup-complete.mjs` | pass | |

## Manual QA

not applicable — every requirement is fully provable by command evidence; no scenario requires human observation of a live tool or UI.

## Generated Output Evidence

not applicable — no generated output is affected by this WP.

## Findings

none new this phase — Review's one P3 finding (fixture indentation) remains open, carried forward as a follow-up, not re-litigated here.

## Skipped Checks

none.

## Architecture Notes

- role: Senior QA
- decision: No Skipped Checks this phase — unlike WP-R11/WP-R12, this WP's scope has no live-tool-dependent requirement, no external CI/PR requirement, and no waiver — every requirement is command-verifiable end to end.
- constraint: Per Test's own role boundary, no fix was made this phase — Review's P3 finding remains open, tracked for Ship/Reflect to note as a follow-up, not silently closed.
- downstream: Ship should note this WP has no PR/CI gate requirement per `release.yaml`, and no branch-staleness risk (branch was cut cleanly after WP-R12's own merge, confirmed current).

## Sign-Off

- Verifier: Claude (Senior QA, lifecycle-test)
- Date: 2026-07-21
- Recommendation: ship
