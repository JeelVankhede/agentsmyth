# Plan Frontmatter

```yaml
slug: <slug>
version: <N>
artifact: plan
status: draft
created: <YYYY-MM-DDTHH:MM:SSZ>
updated: <YYYY-MM-DDTHH:MM:SSZ>
manifest_ids: []
upstream:
  - .workflow/artifacts/briefs/<slug>-v<N>.md
orchestration:
  phase: plan
  status: blocked-for-user
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
architecture_notes:
  role: Principal Engineer
  decisions: []
  constraints: []
  tradeoffs: []
  assumptions: []
  downstream_impact: []
```

Rules:

- Keep `artifact: plan`, `orchestration.phase: plan`, and `orchestration.next_phase: build`.
- Link the approved brief in `upstream`.
- Use `status: ready-for-next-phase` only when the Plan exit gate passes.
- Put every active `R` and `RI` ID in `manifest_ids`.
- Put unresolved planning blockers in `orchestration.blockers`.
