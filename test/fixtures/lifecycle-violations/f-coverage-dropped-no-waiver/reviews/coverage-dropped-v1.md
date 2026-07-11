---
slug: coverage-dropped
version: 1
artifact: review
status: ready-for-next-phase
created: 2026-01-01T00:00:00Z
updated: 2026-01-01T00:00:00Z
manifest_ids:
  - R1
  - R2
upstream:
  - workflow/artifacts/tasks/coverage-dropped-v1.md
orchestration:
  phase: review
  status: ready-for-next-phase
  next_phase: test
  blockers: []
  user_checkpoint: none
---

# Coverage Dropped — Review

## Findings

No findings.

## Severity Summary

None.

## Requirement Coverage

| Manifest ID | State | Citation |
|---|---|---|
| R1 | covered | task Changed Files |
| R2 | dropped | out of scope for this pass |

R2 is marked dropped with no matching Waivers entry anywhere in this artifact — this is the
deliberate violation for `check-coverage-ledger.mjs`.

## Architecture Notes

Test fixture only.

## Verification Reviewed

None.

## Residual Risk

None recorded — fixture only.

## Recommendation

pass
