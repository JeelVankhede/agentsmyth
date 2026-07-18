---
slug: probe
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-01-01
updated: 2026-01-01
manifest_ids:
  - RI5
  - R7
upstream:
  - workflow/artifacts/briefs/probe-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: none
---

# Probe — Plan (coverage-ledger hyphenated sub-label regression)

Fixture plan proving `check-coverage-ledger.mjs`'s `waiverIds()` credits a base ID mentioned
only via a hyphenated sub-label (`RI5-a`), while still excluding a `WP-R#`-style compound
token (`WP-R7-T7.2`) as a genuine waiver mention for `R7`.

## Requirement Coverage

| Manifest ID | Status | Notes |
|---|---|---|
| RI5 | dropped | Superseded by a later phase; scope removed. |
| R7 | dropped | Also removed from scope for this iteration. |

## Waivers

- RI5-a's partial scope was intentionally dropped from this phase; no further action needed.
- Unrelated context: this plan also references the WP-R7-T7.2 migration note from an earlier
  chain, purely for background.
