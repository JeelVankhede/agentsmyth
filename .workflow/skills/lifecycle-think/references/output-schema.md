# Output Schema

Think writes:

```text
.workflow/artifacts/briefs/<slug>-v<N>.md
```

Required frontmatter keys:

```yaml
slug:
version:
artifact: brief
status:
created:
updated:
manifest_ids:
upstream:
orchestration:
  phase: think
  status:
  next_phase:
  blockers:
  user_checkpoint:
architecture_notes:
  role: Architect
  decisions:
  constraints:
  tradeoffs:
  assumptions:
  downstream_impact:
```

Required body sections:

1. Source Links
2. Problem
3. Goals
4. Non-Goals
5. User Impact
6. Success Metrics
7. Requirements
8. Constraints
9. Risks
10. Open Questions
11. Requirement Manifest
12. Questions For User
13. Architecture Notes
14. Exit Gate

`manifest_ids` should include active `R` and `RI` IDs covered by the brief. Blocking `Q` IDs must also appear in `orchestration.blockers`.
