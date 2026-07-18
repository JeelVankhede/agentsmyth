---
slug: id-range-shorthand
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-01-01T00:00:00Z
updated: 2026-01-01T00:00:00Z
manifest_ids:
  - R1
  - R2
  - R3
  - R4
upstream:
  - workflow/artifacts/briefs/id-range-shorthand-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
---

# ID Range Shorthand — Plan

## Requirement Coverage

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R1-R4 | Phase 1 | All four requirements land together |

## Phases

### Phase 1 - Only touch

- **Manifest IDs:** R1, R2, R3, R4
- Touches: `src/example.mjs`
- Work: placeholder.
- **Exit gate:** placeholder.
