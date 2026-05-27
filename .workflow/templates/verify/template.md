---
slug: <slug>
version: <N>
artifact: verify
status: draft
created: <YYYY-MM-DDTHH:MM:SSZ>
updated: <YYYY-MM-DDTHH:MM:SSZ>
manifest_ids: []
upstream:
  - .workflow/artifacts/briefs/<slug>-v<N>.md
  - .workflow/artifacts/plans/<slug>-v<N>.md
  - .workflow/artifacts/tasks/<slug>-v<N>.md
  - .workflow/artifacts/reviews/<slug>-v<N>.md
orchestration:
  phase: test
  status: blocked-for-user
  next_phase: ship
  blockers: []
  user_checkpoint: verification-review
architecture_notes:
  role: Senior QA
  decisions: []
  constraints: []
  tradeoffs: []
  assumptions: []
  downstream_impact: []
---

# <Title> - Verification

## Inputs

- Brief:
- Plan:
- Tasks:
- Review:
- Environment:
- Verified by:

## Automated Checks

| Command | Area | Outcome | Notes | Manifest IDs |
|---|---|---|---|---|
| `<command>` | target repo | pass / fail / not run / blocked | <summary> | R1 |

## Manifest Coverage

| Manifest ID | How Verified | Evidence | Result | Notes |
|---|---|---|---|---|
| R1 | command / manual / generated-output / review / source / waiver | `<evidence>` | pass / fail / skip / waived | <notes> |
| RI1 | command / manual / generated-output / review / source / waiver | `<evidence>` | pass / fail / skip / waived | <notes> |

## Manual QA

- Scenario: not applicable / <scenario>
- Environment:
- Steps:
- Expected:
- Observed:
- Outcome: pass / fail / skipped / blocked
- Evidence:
- Manifest IDs:

## Generated Output Evidence

| Source | Generated Path | Method | Expected | Observed | Result | Manifest IDs |
|---|---|---|---|---|---|---|
| not applicable |  |  |  |  |  |  |

## Findings

- none

## Skipped Checks

| Check | Why Skipped | Risk | Owner | Blocks Ship | Manifest IDs |
|---|---|---|---|---|---|
| none |  |  |  |  |  |

## Architecture Notes

- Role: Senior QA
- Decisions:
  - <evidence decision>
- Constraints:
  - <environment, tooling, generated output, source, or release constraint>
- Tradeoffs:
  - <manual/skipped/waived evidence tradeoff>
- Assumptions:
  - <assumptions Ship must preserve or waive>
- Downstream impact:
  - <ship gate, rollback, handoff, or follow-up impact>

## Sign-Off

- Verified by:
- Date:
- Recommendation: ship / hold / hold-with-waiver
- Reason:
