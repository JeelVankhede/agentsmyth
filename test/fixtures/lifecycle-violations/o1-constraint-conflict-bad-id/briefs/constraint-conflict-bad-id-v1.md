---
slug: constraint-conflict-bad-id
version: 1
artifact: brief
status: blocked-for-user
created: 2026-01-01T00:00:00Z
updated: 2026-01-01T00:00:00Z
manifest_ids:
  - R1
orchestration:
  phase: think
  status: blocked-for-user
  next_phase: plan
  blockers:
    - Q1
  user_checkpoint: none
---

# Constraint Conflict Bad ID — Brief

## Summary

A brief whose Open Questions section cites a constraint ID that does not exist in `domain.yaml`.

## Requirement Manifest

### Explicit (R)

- **R1** - Example requirement.

### Open Questions (Q)

- **Q1** - The request may conflict with [safety-99], a constraint ID that was never actually
  defined in `domain.yaml` — this is the deliberate violation.
  - Owner: user
  - Blocking: yes

## Exit Gate

Blocked on Q1.
