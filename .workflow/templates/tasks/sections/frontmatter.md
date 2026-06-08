# Task Frontmatter

```yaml
slug: <slug>
version: <N>
artifact: task
status: in-progress
created: <YYYY-MM-DDTHH:MM:SSZ>
updated: <YYYY-MM-DDTHH:MM:SSZ>
manifest_ids: []
upstream:
  - .workflow/artifacts/plans/<slug>-v<N>.md
orchestration:
  phase: build
  status: in-progress
  next_phase: review
  blockers: []
  user_checkpoint: build-complete
```

Rules:

- Keep `artifact: task`, `orchestration.phase: build`, and `orchestration.next_phase: review`.
- Link the approved plan in `upstream`.
- Use `status: in-progress` while Build work remains, `blocked` when Build cannot continue, and `ready-for-next-phase` only when Build evidence is complete.
- Put active Build `R` and `RI` IDs in `manifest_ids`.
- Put unresolved Build blockers in `orchestration.blockers`.
