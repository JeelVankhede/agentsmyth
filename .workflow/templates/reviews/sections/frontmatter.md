# Review Frontmatter

```yaml
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
```

Rules:

- Keep `artifact: review`, `orchestration.phase: review`, and `orchestration.next_phase: test`.
- Link the brief, plan, and task artifacts in `upstream`.
- Use `status: blocked` when findings require Build changes; otherwise use `ready-for-next-phase`.
- Put every reviewed, partial, or missing active `R` and `RI` ID in `manifest_ids`.
- Put unresolved blocking findings or evidence gaps in `orchestration.blockers`.
