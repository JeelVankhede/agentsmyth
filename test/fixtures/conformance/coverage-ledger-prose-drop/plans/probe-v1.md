---
slug: probe
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-08-19
updated: 2026-08-19
manifest_ids: [R1, R2]
upstream:
  - workflow/artifacts/briefs/probe-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: none
---

# Probe - Plan

## Requirement Coverage

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R1 | Phase 1 | Availability is recorded per class, never silently dropped |
| R2 | Phase 1 | Nothing is removed from the manifest by this phase |
