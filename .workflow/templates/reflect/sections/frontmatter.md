# Reflect Frontmatter

```yaml
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
```

Rules:

- Keep `artifact: reflect`, `orchestration.phase: reflect`, and `orchestration.next_phase: done`.
- Link the full upstream chain through Ship in `upstream`.
- Use `status: done` only when the reflect artifact and raw learning session are written.
- Put every active `R` and `RI` ID from the completed chain in `manifest_ids`.
- Put reconstruction blockers in `orchestration.blockers` if Reflect cannot complete.
