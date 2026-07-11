---
slug: claim-without-evidence
version: 1
artifact: verify
status: ready-for-next-phase
created: 2026-01-01T00:00:00Z
updated: 2026-01-01T00:00:00Z
manifest_ids:
  - R1
upstream:
  - workflow/artifacts/tasks/claim-without-evidence-v1.md
orchestration:
  phase: test
  status: ready-for-next-phase
  next_phase: ship
  blockers: []
  user_checkpoint: none
---

# Claim Without Evidence — Verify

## Inputs

- Task artifact for slug `claim-without-evidence`.

## Automated Checks

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `npm test` | unit | pass | |

The Notes cell above is empty for a claimed "pass" outcome — this is the deliberate violation
for `check-evidence-citations.mjs`.

## Manifest Coverage

| Manifest ID | Evidence |
|---|---|
| R1 | npm test |

## Manual QA

None.

## Generated Output Evidence

Not applicable.

## Skipped Checks

None.

## Architecture Notes

Test fixture only.

## Sign-Off

Verifier: fixture. Recommendation: ship.
