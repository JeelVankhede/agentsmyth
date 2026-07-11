---
slug: ship-with-open-p1
version: 1
artifact: ship
status: ready-for-next-phase
created: 2026-01-01T00:00:00Z
updated: 2026-01-01T00:00:00Z
manifest_ids:
  - R1
upstream:
  - workflow/artifacts/verify/ship-with-open-p1-v1.md
orchestration:
  phase: ship
  status: ready-for-next-phase
  next_phase: reflect
  blockers: []
  user_checkpoint: ship-review
---

# Ship With Open P1 — Ship

## Ship Status

- Recommendation: ship

This declares "ship" even though the upstream review has an open P1 with no Waivers entry
anywhere in either artifact — this is the deliberate violation for `check-release-readiness.mjs`'s
Severity Summary table parsing.

## Requirement Coverage

- R1: shipped.

## PR / CI Readiness

Not applicable.

## Release Readiness

Not applicable.

## Source-of-Truth Status

Not applicable.

## Risk And Rollback

- Residual risk: none recorded — fixture only.
- Rollback trigger: none.
- Rollback action: none.
- Rollback owner: none.

## Architecture Notes

Test fixture only.

## Sign-Off

Verifier: fixture. Recommendation: ship.
