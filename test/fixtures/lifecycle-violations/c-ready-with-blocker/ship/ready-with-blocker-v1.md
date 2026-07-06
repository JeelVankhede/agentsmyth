---
slug: ready-with-blocker
version: 1
artifact: ship
status: ready-for-next-phase
created: 2026-01-01T00:00:00Z
updated: 2026-01-01T00:00:00Z
manifest_ids:
  - R1
upstream:
  - workflow/artifacts/verify/ready-with-blocker-v1.md
orchestration:
  phase: ship
  status: ready-for-next-phase
  next_phase: reflect
  blockers:
    - Q1
  user_checkpoint: ship-review
---

# Ready With Blocker — Ship

## Ship Status

Claims ready-for-next-phase but Q1 is still unresolved — deliberate violation.

## Requirement Coverage

- R1: covered.

## PR / CI Readiness

PR #123 merged.

## Release Readiness

Not applicable.

## Source-of-Truth Status

No update required.

## Sign-Off

Not signed off — blocked on Q1.
