# Ship Frontmatter

```yaml
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
```

Rules:

- Keep `artifact: ship`, `orchestration.phase: ship`, and `orchestration.next_phase: reflect` when Ship can proceed.
- Link the full upstream chain through Verify in `upstream`.
- Use `status: blocked-for-user` for `hold`; use `ready-for-next-phase` for `ship` or accepted `hold-with-waiver`.
- Put every shipped, deferred, blocked, or waived active `R` and `RI` ID in `manifest_ids`.
- Put unwaived blocked handoffs or missing required gate evidence in `orchestration.blockers`.
