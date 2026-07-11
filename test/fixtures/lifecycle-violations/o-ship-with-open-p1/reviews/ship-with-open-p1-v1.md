---
slug: ship-with-open-p1
version: 1
artifact: review
status: blocked
created: 2026-01-01T00:00:00Z
updated: 2026-01-01T00:00:00Z
manifest_ids:
  - R1
upstream:
  - workflow/artifacts/tasks/ship-with-open-p1-v1.md
orchestration:
  phase: review
  status: blocked
  next_phase: test
  blockers:
    - P1-open-finding
  user_checkpoint: none
---

# Ship With Open P1 — Review

## Findings

### P1 — Fixture finding, deliberately left open

- **Path/area:** src/example.ts
- **Problem:** fixture only.
- **Fix recommendation:** fixture only.

## Severity Summary

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 1 |
| P2 | 0 |
| P3 | 0 |

## Requirement Coverage

- R1: partial.

## Architecture Notes

Test fixture only.

## Verification Reviewed

None.

## Residual Risk

The open P1 above.

## Recommendation

hold
