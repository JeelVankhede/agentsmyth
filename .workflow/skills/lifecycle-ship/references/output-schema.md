# Output Schema

Ship writes:

```text
.workflow/artifacts/ship/<slug>-v<N>.md
```

Required frontmatter keys:

```yaml
slug:
version:
artifact: ship
status:
created:
updated:
manifest_ids:
upstream:
orchestration:
  phase: ship
  status:
  next_phase:
  blockers:
  user_checkpoint:
```

Required body sections:

1. Inputs
2. Ship Status
3. Requirement Coverage
4. PR / CI Readiness
5. Release Readiness
6. Source-of-Truth Status
7. Risk And Rollback
8. Blocked Handoff
9. Architecture Notes
10. Exit Gate
11. Next Phase

Schema acceptance criteria:

- Recommendation is exactly `ship`, `hold`, or `hold-with-waiver`.
- Requirement Coverage has one row per active `R` and `RI`.
- `ship` is used only when required gates have evidence and no active unwaived blocker remains.
- `hold` includes blocker IDs, owner, risk, and exact next action.
- `hold-with-waiver` includes explicit user acceptance of risk, owner, and follow-up.
- PR/CI/release/deployment/source status is explicit when configured, or marked not applicable.
- Rollback names trigger, action, and owner.
- No external action is claimed without evidence.
- Next Phase is Reflect only for `ship` or accepted `hold-with-waiver`.
