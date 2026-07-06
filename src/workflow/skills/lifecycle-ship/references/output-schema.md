# Output Schema

Ship writes:

```text
workflow/artifacts/ship/<slug>-v<N>.md
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

## Starter Block

Copy this block to create a new ship artifact. Replace every `<placeholder>`.

```markdown
---
slug: <slug>
version: 1
artifact: ship
status: draft
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
manifest_ids: []
upstream:
  brief: workflow/artifacts/briefs/<slug>-v<N>.md
  plan: workflow/artifacts/plans/<slug>-v<N>.md
  task: workflow/artifacts/tasks/<slug>-v<N>.md
  review: workflow/artifacts/reviews/<slug>-v<N>.md
  verify: workflow/artifacts/verify/<slug>-v<N>.md
orchestration:
  phase: ship
  status: blocked-for-user
  next_phase: reflect
  blockers: []
  user_checkpoint: ship-review
---

# <Title> - Ship

## Inputs

## Ship Status

- Recommendation:
- Review result:
- Verification recommendation:
- PR / CI:
- Source-of-truth:
- Release:

## Requirement Coverage

| Manifest ID | Status | Evidence | Notes |
|---|---|---|---|
| R1 | shipped / deferred / blocked / waived | | |

## PR / CI Readiness

not applicable / <evidence>

## Release Readiness

## Source-of-Truth Status

not applicable / <status>

## Risk And Rollback

- Residual risk:
- Rollback trigger:
- Rollback action:
- Rollback owner:

## Blocked Handoff

none

## Architecture Notes

- role: Senior DevOps
- decision:
- constraint:
- downstream:

## Exit Gate

- [ ] Recommendation is ship / hold / hold-with-waiver.
- [ ] Every R and RI has a coverage row.
- [ ] Rollback trigger and action defined.
- [ ] All configured gates checked or marked not applicable with config reference.

## Next Phase

<Reflect / blocked>
```
