---
slug: assumptions-missing
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-01-01T00:00:00Z
updated: 2026-01-01T00:00:00Z
manifest_ids:
  - R1
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: none
---

# Assumptions Missing — Brief

## Summary

A brief declaring two assumptions, A1 and A2, whose downstream plan never verifies them.

### Assumptions (A)

- **A1** - The target file already exists and is writable.
- **A2** - No other in-flight change touches the same file.

## Exit Gate

A1 and A2 are explicit.
