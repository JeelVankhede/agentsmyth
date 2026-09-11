---
slug: probe
version: 1
artifact: verify
status: ready-for-next-phase
created: 2026-01-01
updated: 2026-01-01
manifest_ids: [R1]
upstream:
  - workflow/artifacts/reviews/probe-v1.md
orchestration:
  phase: test
  status: ready-for-next-phase
  next_phase: ship
  blockers: []
  user_checkpoint: none
---

# Probe - Verify

## Automated Checks

| Check | Command | Outcome | Notes |
|---|---|---|---|
| typecheck | npm run tsc | not run | sandbox had no toolchain |
