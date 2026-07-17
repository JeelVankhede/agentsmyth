---
slug: probe
version: 1
artifact: verify
status: ready-for-next-phase
created: 2026-01-01
updated: 2026-01-01
manifest_ids:
  - R1
upstream:
  - workflow/artifacts/briefs/probe-v1.md
  - workflow/artifacts/plans/probe-v1.md
  - workflow/artifacts/tasks/probe-v1.md
  - workflow/artifacts/reviews/probe-v1.md
orchestration:
  phase: test
  status: ready-for-next-phase
  next_phase: ship
  blockers: []
  user_checkpoint: none
---

# Probe — Verification (Test waived)

Worked example of the Waived Test Phase path: the Standard task waived Test, so this verify artifact
still exists, records the waiver, and is `ready-for-next-phase` — Ship's gate is satisfied and the
waiver stays visible as residual risk.

## Manifest Coverage

| Manifest ID | Method | Evidence | Status | Notes |
|---|---|---|---|---|
| R1 | waiver | see Waivers | waived | Test phase waived; not asserted as pass. |

## Waivers

| waived_gate_or_requirement_id | reason | residual_risk | owner | follow_up_action | approval_evidence |
|---|---|---|---|---|---|
| test-phase | Standard task; verification deferred to post-merge smoke | R1 unverified until smoke run | user | run smoke suite in follow-up ticket | user approval 2026-01-01 |

## Sign-Off

- Verifier: user
- Date: 2026-01-01
- Recommendation: hold-with-waiver
