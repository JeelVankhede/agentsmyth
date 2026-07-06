# Output Schema

Plan writes:

```text
workflow/artifacts/plans/<slug>-v<N>.md
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

## Starter Block

Copy this block to create a new plan artifact. Replace every `<placeholder>`.

```markdown
---
slug: <slug>
version: 1
artifact: plan
status: draft
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
manifest_ids: []
upstream:
  brief: workflow/artifacts/briefs/<slug>-v<N>.md
orchestration:
  phase: plan
  status: blocked-for-user
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
---

# <Title> - Plan

## Summary

## Inputs

## Requirement Coverage

| Manifest ID | Covered by phases | Notes |
|---|---|---|

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|

## Source-of-Truth Strategy

## Approach

## Phases

### Phase 1 - <name>

- Manifest IDs:
- Touches:
- Work:
- Exit gate:

## Dependency Order

## Branch Strategy

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|

## Verification Plan

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|

## Architecture Notes

- role: Principal Engineer
- decision:
- constraint:
- tradeoff:
- downstream:

## Open Questions

## Exit Gate

- [ ] Every active R and RI mapped to a phase.
- [ ] Every phase has a binary exit gate.
- [ ] Verification plan covers every R and RI.
- [ ] User approved or waiver recorded.
```
