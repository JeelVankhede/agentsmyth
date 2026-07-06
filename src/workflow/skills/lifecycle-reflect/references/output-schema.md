# Output Schema

Reflect writes two artifacts:

```text
workflow/artifacts/reflect/<slug>-v<N>.md
workflow/learnings/sessions/<YYYY-MM-DD>-<slug>.md
```

Required reflect frontmatter keys:

```yaml
slug:
version:
artifact: reflect
status:
created:
updated:
manifest_ids:
upstream:
orchestration:
  phase: reflect
  status:
  next_phase:
  blockers:
  user_checkpoint:
```

Required reflect body sections:

1. Inputs
2. Outcome
3. What Worked
4. What Did Not Work
5. Surprises
6. Manifest Coverage Retrospective
7. Deferred
8. Source-of-Truth Outcome
9. Learning Candidates
10. Follow-Ups
11. Raw Session Entry
12. Architecture Notes
13. Exit Gate

Required raw session sections:

1. Context
2. Candidate Learnings
3. Raw Notes
4. Curator Marks

Schema acceptance criteria:

- Both artifacts exist.
- Reflect upstream links include brief, plan, tasks, verify, and ship artifacts.
- Manifest Coverage Retrospective has one row per active `R` and `RI`.
- Outcome states release, source-of-truth, and rollback status explicitly or marks each not applicable.
- Every learning candidate is tagged `propose-only`.
- Follow-ups include owner and suggested artifact or ticket title.
- Raw session is append-only and has empty Curator Marks initially.
- No curated learning file is edited unless the user explicitly requested curation.

## Starter Block

Copy this block to create a new reflect artifact. Replace every `<placeholder>`.

```markdown
---
slug: <slug>
version: 1
artifact: reflect
status: draft
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
manifest_ids: []
upstream:
  brief: workflow/artifacts/briefs/<slug>-v<N>.md
  plan: workflow/artifacts/plans/<slug>-v<N>.md
  task: workflow/artifacts/tasks/<slug>-v<N>.md
  review: workflow/artifacts/reviews/<slug>-v<N>.md
  verify: workflow/artifacts/verify/<slug>-v<N>.md
  ship: workflow/artifacts/ship/<slug>-v<N>.md
orchestration:
  phase: reflect
  status: in-progress
  next_phase: done
  blockers: []
  user_checkpoint: none
---

# <Title> - Reflect

## Inputs

## Outcome

## What Worked

## What Did Not Work

## Surprises

none

## Manifest Coverage Retrospective

| Manifest ID | Outcome | Evidence path | Notes |
|---|---|---|---|
| R1 | shipped / deferred / blocked / waived | | |

## Deferred

none

## Source-of-Truth Outcome

not applicable

## Learning Candidates

- **Candidate learning**: <durable, agent-actionable description> — source: <artifact path> — propose-only.

## Follow-Ups

| Action | Owner | Suggested Artifact Or Ticket | Status |
|---|---|---|---|
| | | | open |

## Raw Session Entry

See `workflow/learnings/sessions/<YYYY-MM-DD>-<slug>.md`.

## Architecture Notes

- role: Project Manager
- decision:
- constraint:
- downstream:

## Exit Gate

- [ ] Manifest Coverage Retrospective has one row per active R and RI.
- [ ] Every follow-up has a named owner and suggested artifact title.
- [ ] Learning candidates tagged propose-only.
- [ ] orchestration.status: done, next_phase: done.
```
