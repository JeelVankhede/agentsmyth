---
slug: probe
version: 1
artifact: verify
status: ready-for-next-phase
created: 2026-01-01
updated: 2026-01-01
manifest_ids:
  - R7
upstream:
  - workflow/artifacts/briefs/probe-v1.md
orchestration:
  phase: test
  status: ready-for-next-phase
  next_phase: ship
  blockers: []
  user_checkpoint: none
---

# Probe — Verify (table-cell waiver claim)

The claim below sits in a table cell (not prose) and never appears in a `## Waivers` table. R10's
refinement must still catch an explicit action claim inside a table, while leaving enum cells
(`waiver`/`waived` as method/status options) alone.

## Manifest Coverage

| Manifest ID | Method | Evidence | Status | Notes |
|---|---|---|---|---|
| R7 | command | none | pass | The user waived R7's verification gate in chat — recorded nowhere structured. |
