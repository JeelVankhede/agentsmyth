# Output Schema

Think writes:

```text
workflow/artifacts/briefs/<slug>-v<N>.md
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

## Starter Block

Copy this block to create a new brief artifact. Replace every `<placeholder>`.

```markdown
---
slug: <slug>
version: 1
artifact: brief
status: draft
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
manifest_ids: []
upstream: []
orchestration:
  phase: think
  status: blocked-for-user
  next_phase: plan
  blockers: []
  user_checkpoint: brief-review
---

# <Title> - Brief

## Source Links

## Problem

## Goals

## Non-Goals

## User Impact

## Success Metrics

## Requirements

## Constraints

## Risks

## Open Questions

## Requirement Manifest

### Explicit (R)

### Implicit (RI)

### Assumptions (A)

### Open Questions (Q)

## Questions For User

## Architecture Notes

- role: Lead Architect
- decision:
- constraint:
- tradeoff:
- downstream:

## Exit Gate

- [ ] Every active R and RI has acceptance criteria.
- [ ] Blocking Q IDs appear in orchestration.blockers.
- [ ] User approved or waiver recorded.
```

---

Requirement Manifest sub-section requirements:

- **Explicit (R)**: every `R` ID must have at least one `Acceptance:` criterion.
- **Implicit (RI)**: every `RI` ID must have at least one `Acceptance:` criterion.
- **Assumptions (A)**: present even when empty; must not contain user-authority decisions — those belong as `Q` IDs.
- **Open Questions (Q)**: every `Q` ID must include `Owner:` and `Blocking: yes / no`; blocking `Q` IDs must mirror in `orchestration.blockers`.
