---
slug: probe
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-01-01
updated: 2026-01-01
manifest_ids:
  - RI1
  - RI2
upstream:
  - workflow/artifacts/briefs/probe-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: none
---

# Probe — Plan (phase-map parenthetical annotation regression)

Fixture plan proving `check-phase-map.mjs` correctly parses a `**Manifest IDs:**` line carrying a
parenthetical annotation — `RI2 (partial)` and `RI1 (infra supporting R2, R3, R4, R7
verification)` — crediting only the intended ID and not orphaning it or spuriously extracting the
IDs named inside the parenthetical prose.

## Phases

### Phase 1

**Manifest IDs:** RI2 (partial)

**Exit gate:** RI2's partial scope for this phase lands and passes.

### Phase 2

**Manifest IDs:** RI1 (infra supporting R2, R3, R4, R7 verification)

**Exit gate:** RI1's supporting infra is in place and confirmed via the R2/R3/R4/R7 verification runs.
