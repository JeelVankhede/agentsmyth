---
slug: file-outside-scope
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-01-01T00:00:00Z
updated: 2026-01-01T00:00:00Z
manifest_ids:
  - R1
upstream:
  - workflow/artifacts/plans/file-outside-scope-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# File Outside Scope — Task

## Active Phase

Phase 1 of 1.

## Branch / Repo Status

On branch feat/test.

## Changed Files

- `src/example.ts` — implemented R1 — IDs: R1
- `src/unrelated-file.ts` — not declared in the plan's Touches — IDs: R1

The second file above is outside the plan's declared Touches (`src/example.ts` only) — this is
the deliberate violation for `check-scope-fence.mjs`.

## Implementation Log

Fixture only.

## Verification Items

- [ ] R1 verified

## Command Results

None run.

## Architecture Notes

Test fixture. `src/unrelated-file.ts` is out of scope on purpose.
