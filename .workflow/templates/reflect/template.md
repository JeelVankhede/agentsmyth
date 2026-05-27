---
slug: <slug>
version: <N>
artifact: reflect
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
  - .workflow/artifacts/ship/<slug>-v<N>.md
orchestration:
  phase: reflect
  status: done
  next_phase: done
  blockers: []
  user_checkpoint: none
architecture_notes:
  role: Project Manager
  decisions: []
  constraints: []
  tradeoffs: []
  assumptions: []
  downstream_impact: []
---

# <Title> - Reflection

## Inputs

- Brief:
- Plan:
- Tasks:
- Review:
- Verify:
- Ship:
- PR / release / source evidence:
- Raw learning session:

## Outcome

- Shipped:
- Release:
- Docs:
- Source-of-truth:
- Rollback:
- Waivers:

## What Worked

- <specific lifecycle tactic, artifact, gate, check, or handoff pattern with evidence>

## What Did Not Work

- <specific friction, missed assumption, weak phase split, skipped check, unclear source, or blocked handoff with evidence>

## Surprises

- none - <reason>

## Manifest Coverage Retrospective

| Manifest ID | Shipped As Scoped | Verified | Ship Status | Post-Ship Issues | Notes |
|---|---|---|---|---|---|
| R1 | yes / no / partial / waived / deferred | yes / no / skipped / failed / waived | shipped / deferred / blocked / waived | none / issue | <notes> |
| RI1 | yes / no / partial / waived / deferred | yes / no / skipped / failed / waived | shipped / deferred / blocked / waived | none / issue | <notes> |

## Deferred

- none

## Source-of-Truth Outcome

- Updated:
- Blocked:
- Handoff:
- Waived:

## Learning Candidates

- **Candidate learning**: <agent-actionable pattern> - source: <artifact/evidence> - propose-only.
- **Candidate skill update**: <skill + change> - source: <artifact/evidence> - propose-only.
- **Candidate template update**: <template + change> - source: <artifact/evidence> - propose-only.

## Follow-Ups

| Action | Owner | Suggested Artifact Or Ticket | Status | Manifest IDs |
|---|---|---|---|---|
| <action> | <owner> | <artifact or title> | open / done / blocked / deferred / waived | R1 |

## Raw Session Entry

- Path: `.workflow/learnings/sessions/<YYYY-MM-DD>-<slug>.md`
- Status: created / blocked

## Architecture Notes

- Role: Project Manager
- Decisions:
  - <learning, deferral, or follow-up decision>
- Constraints:
  - <missing evidence, waiver, source, release, or lifecycle constraint>
- Tradeoffs:
  - <learning or follow-up tradeoff>
- Assumptions:
  - <future lifecycle assumptions to verify>
- Downstream impact:
  - <impact on skills, templates, config, validators, docs, or future runs>

## Exit Gate

- [ ] Reflect artifact status is `done` when complete.
- [ ] Raw learning session path is recorded.
- [ ] Every active `R` and `RI` has a retrospective row.
- [ ] Outcome states release, source-of-truth, and rollback status or marks each not applicable.
- [ ] Candidate learnings are tagged `propose-only`.
- [ ] Follow-ups have owner and suggested artifact or ticket title.
- [ ] Curated learnings were not edited unless the user explicitly requested curation.
