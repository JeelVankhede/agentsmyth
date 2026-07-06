---
slug: phase-mismatch
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-01-01T00:00:00Z
updated: 2026-01-01T00:00:00Z
manifest_ids:
  - R1
upstream:
  - workflow/artifacts/plans/phase-mismatch-v1.md
orchestration:
  phase: review
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: build-complete
---

# Phase Mismatch — Task

File is in tasks/ directory but orchestration.phase is review — deliberate violation.

## Active Phase

Phase 1 of 1.

## Branch / Repo Status

On branch feat/test.

## Changed Files

- src/example.ts (R1)

## Implementation Log

Phase mismatch: artifact declares review but lives in tasks/.

## Verification Items

- [ ] No checks needed — this is a fixture.

## Command Results

None.

## Architecture Notes

Test fixture. phase mismatch (tasks/ dir expects build, artifact declares review).
