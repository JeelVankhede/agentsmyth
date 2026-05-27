# Output Schema

Reflect writes two artifacts:

```text
.workflow/artifacts/reflect/<slug>-v<N>.md
.workflow/learnings/sessions/<YYYY-MM-DD>-<slug>.md
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
architecture_notes:
  role: Project Manager
  decisions:
  constraints:
  tradeoffs:
  assumptions:
  downstream_impact:
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
