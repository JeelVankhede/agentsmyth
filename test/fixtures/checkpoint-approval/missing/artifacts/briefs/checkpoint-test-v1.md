---
slug: checkpoint-test
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-01-01T00:00:00Z
updated: 2026-01-01T00:00:00Z
manifest_ids:
  - R1
upstream:
  - user-request
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: brief-review
---

# Checkpoint Test — Brief

Fixture only. Declares `user_checkpoint: brief-review` and `status: ready-for-next-phase` but
has no `## Checkpoint Approval` section — the deliberate violation for
`check-lifecycle.mjs --phase plan`'s checkpoint-approval gate.

## Requirement Manifest

### Explicit (R)

- **R1**: fixture only.
  Acceptance: fixture only.
