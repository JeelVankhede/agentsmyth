---
slug: fix-check-config-defs-root
version: 1
artifact: ship
status: ready-for-next-phase
created: 2026-07-22
updated: 2026-07-22
manifest_ids: [R1]
upstream:
  - workflow/artifacts/briefs/fix-check-config-defs-root-v1.md
  - workflow/artifacts/plans/fix-check-config-defs-root-v1.md
  - workflow/artifacts/tasks/fix-check-config-defs-root-v1.md
  - workflow/artifacts/reviews/fix-check-config-defs-root-v1.md
  - workflow/artifacts/verify/fix-check-config-defs-root-v1.md
orchestration:
  phase: ship
  status: ready-for-next-phase
  next_phase: reflect
  blockers: []
  user_checkpoint: ship-review
---

# Fix check-config.mjs's hardcoded workflow/ root - Ship

## Inputs

Review (recommendation: pass, no findings) and Verify (recommendation: ship, no open findings)
artifacts for this slug.

## Ship Status

Recommendation: **ship**.

Single-phase fix complete, reviewed, and verified. Committing to the existing
`mandatory-lifecycle-pre-commit-hook` branch (PR #45, already open with CI green) per Plan's
Branch Strategy — this fix was found while testing that same PR's install flow.

## Requirement Coverage

| Manifest ID | Status | Notes |
|---|---|---|
| R1 | met | Reproduction scenario: 6 errors before, 0 after; full local suite passes |

## PR / CI Readiness

Will be pushed to the existing open PR #45; CI (`validate`) will be re-checked after push, same
as the prior two fixes on this branch.

## Release Readiness

Not applicable — source-level validator fix, not a version bump or npm publish.

## Source-of-Truth Status

Source edited directly (`src/workflow/validators/check-config.mjs`). `npm run build` +
`agentsmyth prepare` were both run to refresh the build products (`dist/`, root `validators/`,
`~/.agentsmyth/workflow/validators/`) before verification.

## Risk And Rollback

- Trigger: if the fix somehow regresses schema resolution for a repo not using
  `definitions_root` at all (the older, pre-two-root-resolver style).
- Action: revert this single-file change; `check-config.mjs` is not depended on by any other
  validator internally.
- Owner: whoever maintains `src/workflow/validators/` going forward.
- Rollback is a one-file `git revert`, no other state affected.

## Blocked Handoff

None — user approved both the fix and the commit in the same response ("yes", answering "Approve
Brief + Plan so I can log Build/Review/Verify/Ship for what's already done, and commit it?").

## Architecture Notes

- role: Shipper
- decision: Bundled the full chain retroactively since the fix was implemented and verified
  before Brief/Plan were formally written — corrected mid-session after nearly reusing an
  unrelated earlier approval for this distinct checkpoint (caught before it happened).
- constraint: User's standing rule on commit approval — satisfied explicitly this turn.
- tradeoff: None.
- downstream: Reflect should note the near-miss on checkpoint-approval reuse as a learning candidate.

## Checkpoint Approval

- Checkpoint: ship-review
- Status: approved
- User's own words (verbatim, this turn): "yes" (answering "Approve Brief + Plan so I can log Build/Review/Verify/Ship for what's already done, and commit it?")

## Exit Gate

- [x] Every active R and RI shows `met`, `waived`, or a named blocker.
- [x] User approved or waiver recorded.

## Next Phase

Reflect.
