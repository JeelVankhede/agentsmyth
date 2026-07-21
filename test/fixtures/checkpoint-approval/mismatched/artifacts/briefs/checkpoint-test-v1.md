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

Fixture only. Declares `user_checkpoint: brief-review` but its `## Checkpoint Approval` section
names a different checkpoint ("ship-review") — a stale-copy-paste class of error the gate must
also catch, not just a fully-missing section.

## Requirement Manifest

### Explicit (R)

- **R1**: fixture only.
  Acceptance: fixture only.

## Checkpoint Approval

- Checkpoint: ship-review
- Status: approved
- User's own words (verbatim, this turn): "Ship it."
