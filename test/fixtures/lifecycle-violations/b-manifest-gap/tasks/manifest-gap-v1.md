---
slug: manifest-gap
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-01-01T00:00:00Z
updated: 2026-01-01T00:00:00Z
manifest_ids:
  - R1
  - R99
upstream:
  - workflow/artifacts/plans/manifest-gap-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: build-complete
---

# Manifest Gap — Task

## Active Phase

Phase 1 of 1.

## Branch / Repo Status

On branch feat/test.

## Changed Files

- src/example.ts (R1, R99)

## Implementation Log

R99 is not declared in the upstream brief — this is the deliberate violation.

## Verification Items

- [ ] Unit test passes

## Command Results

None run.

## Architecture Notes

Test fixture. R99 is not in the brief manifest; validator must reject this.
