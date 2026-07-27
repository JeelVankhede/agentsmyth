---
slug: bullet-boundary
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-01-01
updated: 2026-01-01
manifest_ids: [R1]
upstream:
  - workflow/artifacts/briefs/bullet-boundary-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: none
---

# Bullet Boundary (conformance fixture) - Plan

## Phases

### Phase 1 - Only phase

- **Manifest IDs:** R1
- Touches: `src/real-file.mjs`
- Work: implement the change
- **Exit gate:** `scripts/unrelated-check.mjs` passes clean
