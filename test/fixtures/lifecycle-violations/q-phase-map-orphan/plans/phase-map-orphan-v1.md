---
slug: phase-map-orphan
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-01-01T00:00:00Z
updated: 2026-01-01T00:00:00Z
manifest_ids:
  - R1
  - R2
upstream:
  - workflow/artifacts/briefs/phase-map-orphan-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
---

# Phase Map Orphan — Plan

## Summary

A plan whose `## Phases` section covers R1 but never mentions R2, even though R2 is an active
manifest ID declared in frontmatter. R2 is an orphan.

## Phases

### Phase 1 - Only touch

**Manifest IDs:** R1

**Touches:**
- `src/example.ts`

**Work:**
1. Modify `src/example.ts`.

**Exit gate:**
- R1 implemented; `npm test` passes.

## Exit Gate

R1 implemented. R2 is never covered by any phase.
