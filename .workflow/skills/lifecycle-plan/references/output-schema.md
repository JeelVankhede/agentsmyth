# Output Schema

Plan writes:

```text
.workflow/artifacts/plans/<slug>-v<N>.md
```

Required frontmatter keys:

```yaml
slug:
version:
artifact: plan
status:
created:
updated:
manifest_ids:
upstream:
orchestration:
  phase: plan
  status:
  next_phase:
  blockers:
  user_checkpoint:
architecture_notes:
  role: Principal Engineer
  decisions:
  constraints:
  tradeoffs:
  assumptions:
  downstream_impact:
```

Required body sections:

1. Summary
2. Inputs
3. Requirement Coverage
4. Repo Impact Map
5. Source-of-Truth Strategy
6. Approach
7. Phases
8. Dependency Order
9. Branch Strategy
10. Risk Register
11. Verification Plan
12. Architecture Notes
13. Open Questions
14. Exit Gate

Every active `R` and `RI` from the brief must appear in `manifest_ids`, Requirement Coverage, Phases, and Verification Plan.
