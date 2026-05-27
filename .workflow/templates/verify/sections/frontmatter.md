# Verify Frontmatter

```yaml
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
```

Rules:

- Keep `artifact: verify`, `orchestration.phase: test`, and `orchestration.next_phase: ship`.
- Link brief, plan, task, and review artifacts in `upstream` when available.
- Use `status: blocked` when failed or missing evidence blocks Ship.
- Use `status: ready-for-next-phase` only when Sign-Off is `ship`, or `hold-with-waiver` with explicit waiver evidence.
- Put every verified, failed, skipped, or waived active `R` and `RI` ID in `manifest_ids`.
