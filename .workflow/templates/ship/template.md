---
slug: <slug>
version: <N>
artifact: ship
status: draft
created: <YYYY-MM-DDTHH:MM:SSZ>
updated: <YYYY-MM-DDTHH:MM:SSZ>
manifest_ids: []
upstream:
  - .workflow/artifacts/briefs/<slug>-v<N>.md
  - .workflow/artifacts/plans/<slug>-v<N>.md
  - .workflow/artifacts/tasks/<slug>-v<N>.md
  - .workflow/artifacts/reviews/<slug>-v<N>.md
  - .workflow/artifacts/verify/<slug>-v<N>.md
orchestration:
  phase: ship
  status: blocked-for-user
  next_phase: reflect
  blockers: []
  user_checkpoint: ship-review
---

# <Title> - Ship

## Inputs

- Brief:
- Plan:
- Tasks:
- Review:
- Verify:
- Release config:
- Source-of-truth config:
- Release owner:

## Ship Status

- Recommendation: ship / hold / hold-with-waiver
- Review result:
- Verification recommendation:
- PR / CI:
- Source-of-truth:
- Release:
- Waivers:

## Requirement Coverage

| Manifest ID | Status | Evidence | Notes |
|---|---|---|---|
| R1 | shipped / deferred / blocked / waived | <verify evidence / PR / release / handoff> | <notes> |
| RI1 | shipped / deferred / blocked / waived | <verify evidence / PR / release / handoff> | <notes> |

## PR / CI Readiness

| Gate | Required | Evidence | Status | Next Action |
|---|---|---|---|---|
| PR | yes / no | <URL, branch, handoff, or not applicable> | pass / fail / pending / blocked / not applicable / waived | <action> |
| CI | yes / no | <check evidence or not applicable> | pass / fail / pending / blocked / not applicable / waived | <action> |

## Release Readiness

| Gate | Required | Evidence | Status | Owner | Notes |
|---|---|---|---|---|---|
| Release | yes / no | <release evidence or not applicable> | pass / fail / blocked / not applicable / waived | <owner> | <notes> |
| Deployment | yes / no | <deployment evidence or not applicable> | pass / fail / blocked / not applicable / waived | <owner> | <notes> |
| Docs | yes / no | <docs evidence or not applicable> | pass / fail / blocked / not applicable / waived | <owner> | <notes> |

## Source-of-Truth Status

- Required: yes / no
- Provider / source type:
- Source item:
- Update target:
- Status: updated / not required / blocked / waived
- Evidence:
- Still stale:
- Handoff:

## Risk And Rollback

| Area | Risk | Rollback Trigger | Rollback Action | Owner | Evidence |
|---|---|---|---|---|---|
| <area> | <risk> | <trigger> | <action> | <owner> | <evidence or not applicable> |

## Blocked Handoff

- none

<!-- Use this format when blocked:
- Blocker: <what is blocked>
  Owner: <owner>
  Exact handoff: <copy-ready action or text>
  Risk: <risk>
  Affected IDs: <R/RI IDs>
  Blocks Ship: yes / no / waiver-required
-->

## Architecture Notes

- Role: Senior DevOps
- Decisions:
  - <ship/hold/waiver decision>
- Constraints:
  - <release, source, PR/CI, access, or evidence constraint>
- Tradeoffs:
  - <accepted, deferred, blocked, or waived risk tradeoff>
- Assumptions:
  - <assumptions Reflect must preserve>
- Downstream impact:
  - <release, rollback, source handoff, or follow-up impact>

## Exit Gate

- [ ] Recommendation is `ship`, `hold`, or `hold-with-waiver`.
- [ ] Every active `R` and `RI` has shipped, deferred, blocked, or waived status.
- [ ] `ship` has no unwaived blocked handoff.
- [ ] `hold` records blocker, owner, risk, and exact next action.
- [ ] `hold-with-waiver` records explicit user acceptance of risk, owner, and follow-up.
- [ ] Required PR/CI/release/deployment/source gates have evidence or waiver.
- [ ] Rollback trigger and action are explicit or marked not applicable.
- [ ] No external action is claimed without evidence.

## Next Phase

- Reflect readiness: ready / blocked
- Reason:
