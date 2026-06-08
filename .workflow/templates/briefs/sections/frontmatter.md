# Brief Frontmatter

```yaml
slug: <slug>
version: <N>
artifact: brief
status: draft
created: <YYYY-MM-DDTHH:MM:SSZ>
updated: <YYYY-MM-DDTHH:MM:SSZ>
manifest_ids: []
upstream:
  - user-request
orchestration:
  phase: think
  status: blocked-for-user
  next_phase: plan
  blockers: []
  user_checkpoint: brief-review
```

Rules:

- Keep `artifact: brief`, `orchestration.phase: think`, and `orchestration.next_phase: plan`.
- Use `status: ready-for-next-phase` only when the Think exit gate passes.
- Put every active `R` and `RI` ID in `manifest_ids`.
- Put unresolved blocking `Q` IDs in `orchestration.blockers`.
- Keep `upstream` as `user-request` unless revising from an existing lifecycle chain.
