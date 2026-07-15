---
slug: probe
version: 1
artifact: verify
status: ready-for-next-phase
created: 2026-01-01
updated: 2026-01-01
manifest_ids:
  - R5
upstream:
  - workflow/artifacts/briefs/probe-v1.md
orchestration:
  phase: test
  status: ready-for-next-phase
  next_phase: ship
  blockers: []
  user_checkpoint: none
---

# Probe — Verify

## Verification Matrix

## Prose (intentional test content)

- We waived the R5 gate in prose here and recorded it nowhere structured.

This bullet is a genuine unstructured waiver claim (prose, not a table row, no `## Waivers`/
`## Skipped Checks` disclosure). The conformance test asserts `check-waivers` STILL flags it (R10
must preserve the real P2 detection while suppressing enum/table false-positives).
