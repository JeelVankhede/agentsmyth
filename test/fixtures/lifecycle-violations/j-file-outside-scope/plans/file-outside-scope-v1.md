---
slug: file-outside-scope
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-01-01T00:00:00Z
updated: 2026-01-01T00:00:00Z
manifest_ids:
  - R1
upstream:
  - workflow/artifacts/briefs/file-outside-scope-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
---

# File Outside Scope — Plan

## Summary

A plan whose only declared touch is `src/example.ts`.

## Requirement Coverage

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R1 | Phase 1 | — |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `src/example.ts` | modify | R1 | the only declared touch |

## Source-of-Truth Strategy

No external source update required.

## Phases

### Phase 1 - Only touch

- Manifest IDs: R1
- Touches: `src/example.ts`
- Work: modify src/example.ts
- Exit gate: R1 implemented

### Phase 2 - Later phase, not yet active

- Manifest IDs: R1
- Touches: `src/unrelated-file.ts`
- Work: not started — this phase has not begun
- Exit gate: not applicable yet

`src/unrelated-file.ts` is declared in Phase 2's Touches, not Phase 1's. The task below is on
Phase 1 (not yet reached Phase 2) but its Changed Files already includes this file — it must
still be rejected, proving `check-scope-fence.mjs` excludes phases beyond the active one rather
than matching any backtick-quoted path anywhere in the plan.

## Verification Plan

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1 | manual inspection | Test | fixture only |

## Architecture Notes

No architectural changes.

## Exit Gate

Touches declares only `src/example.ts`.
