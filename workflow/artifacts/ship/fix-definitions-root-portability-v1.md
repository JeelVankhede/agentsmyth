---
slug: fix-definitions-root-portability
version: 1
artifact: ship
status: ready-for-next-phase
created: 2026-07-23
updated: 2026-07-23
manifest_ids: [R1, R2]
upstream:
  - workflow/artifacts/briefs/fix-definitions-root-portability-v1.md
  - workflow/artifacts/plans/fix-definitions-root-portability-v1.md
  - workflow/artifacts/tasks/fix-definitions-root-portability-v1.md
  - workflow/artifacts/reviews/fix-definitions-root-portability-v1.md
  - workflow/artifacts/verify/fix-definitions-root-portability-v1.md
orchestration:
  phase: ship
  status: ready-for-next-phase
  next_phase: reflect
  blockers: []
  user_checkpoint: ship-review
---

# Fix definitions_root Portability (OI-52) - Ship

## Inputs

Review (recommendation: pass, 2 P3 findings fixed) and Verify (recommendation: ship, no open
findings) artifacts for this slug.

## Ship Status

Recommendation: **ship**.

Single-phase fix complete, reviewed, and verified. User approved committing and opening a normal
PR against `main`. Branch `fix-definitions-root-portability` was branched directly from
`origin/main` — PR #45 and #46 both merged before this chain started, so no stacking was needed.

## Requirement Coverage

| Manifest ID | Status | Notes |
|---|---|---|
| R1 | met | Portable literal written and verified resolving correctly (manual QA + 3 automated checks) |
| R2 | met | Old expanded-absolute-path form still resolves correctly (backward compatible) |

## PR / CI Readiness

User decision: commit now and open a normal PR against `main` (no stacking needed).

## Release Readiness

Not applicable — source-level fix, not a version bump or npm publish.

## Source-of-Truth Status

Source edited directly (`bin/agentsmyth.mjs`). `npm run build` run; `npm run validate`'s
`render-adapters: adapter shims are current` confirms build products in sync.

## Risk And Rollback

- Trigger: if the portable form somehow fails to resolve in a real-world environment this
  session's scratch testing didn't cover (e.g. an exotic `HOME` configuration).
- Action: single-constant, single-call-site change — trivially revertible (`git revert`), and the
  backward-compatibility guarantee (R2) means reverting wouldn't even break repos that already
  adopted the new form, since the read side already handles both.
- Owner: whoever maintains `bin/agentsmyth.mjs` going forward.
- Rollback: none needed beyond a standard revert if ever required — no irreversible state created.

## Blocked Handoff

None — user approved both the commit and opening a PR against `main` this turn.

## Architecture Notes

- role: Shipper
- decision: Commit + PR both proceed in this turn per explicit approval.
- constraint: User's own global rule on commit approval — satisfied explicitly this turn.
- tradeoff: None.
- downstream: Reflect follows immediately after commit + PR creation.

## Checkpoint Approval

- Checkpoint: ship-review
- Status: approved
- User's own words (verbatim, this turn): "Yes"

## Exit Gate

- [x] Every active R and RI shows `met`, `waived`, or a named blocker.
- [x] User approved or waiver recorded.

## Next Phase

Reflect.
