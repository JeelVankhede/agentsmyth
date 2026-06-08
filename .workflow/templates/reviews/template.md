---
slug: <slug>
version: <N>
artifact: review
status: draft
created: <YYYY-MM-DDTHH:MM:SSZ>
updated: <YYYY-MM-DDTHH:MM:SSZ>
manifest_ids: []
upstream:
  - .workflow/artifacts/briefs/<slug>-v<N>.md
  - .workflow/artifacts/plans/<slug>-v<N>.md
  - .workflow/artifacts/tasks/<slug>-v<N>.md
orchestration:
  phase: review
  status: blocked-for-user
  next_phase: test
  blockers: []
  user_checkpoint: review-complete
---

# <Title> - Review

## Findings

- P1 `<path-or-area>` [R1] - <problem>.
  - Fix: <concrete fix or follow-up>

## Severity Summary

| Severity | Count | Notes |
|---|---:|---|
| P0 | 0 |  |
| P1 | 0 |  |
| P2 | 0 |  |
| P3 | 0 |  |

## Requirement Coverage

| Manifest ID | Evidence | Status | Notes |
|---|---|---|---|
| R1 | `<path:line>` / task evidence / none | covered / partial / missing | <note> |
| RI1 | `<path:line>` / task evidence / none | covered / partial / missing | <note> |

## Architecture Notes

- Role: Staff Reviewer
- Decisions:
  - <review scope/evidence trust decision>
- Constraints:
  - <missing evidence, diff shape, generated output, source, or release constraint>
- Tradeoffs:
  - <pass/pass-with-risk/hold tradeoff>
- Assumptions:
  - <assumptions Test/Ship must verify>
- Downstream impact:
  - <fix, verification, release, or follow-up impact>

## Verification Reviewed

| Evidence | Source | Outcome | Notes |
|---|---|---|---|
| `<command or artifact>` | task artifact / local run / not run | pass / fail / not run / blocked | <note> |

## Residual Risk

- <unchecked area, skipped evidence, accepted risk, or `none` with reason>

## Recommendation

- Result: pass / pass-with-risk / hold
- Reason: <one-sentence reason>
