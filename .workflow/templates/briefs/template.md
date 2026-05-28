---
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
architecture_notes:
  role: Architect
  decisions: []
  constraints: []
  tradeoffs: []
  assumptions: []
  downstream_impact: []
---

# <Title> - Brief

## Source Links

- User request:
- Source-of-truth:
- GitHub / issue / ticket:
- Prior lifecycle chain:
- Target repo evidence:

## Problem

<What problem or request is being addressed?>

## Goals

- <Goal>

## Non-Goals

- <Explicitly out of scope>

## User Impact

<Who is affected and what changes for them?>

## Success Metrics

- <Observable success signal>

## Requirements

- <Plain-language requirement summary>

## Constraints

- <Repo, domain, source, release, verification, compatibility, or safety constraint>

## Risks

- <Risk and why it matters>

## Open Questions

- `<QID>` - <question, owner, and blocked phase>

## Requirement Manifest

### Explicit (R)

- **R1** - <one-line explicit requirement>
  - Acceptance: <observable proof>

### Implicit (RI)

- **RI1** - <context-derived requirement>
  - Acceptance: <observable proof>

### Assumptions (A)

- **A1** - <safe assumption, or mark needs confirmation>

### Open Questions (Q)

- **Q1** - <material open question> - owner: <owner>

## Questions For User

- `Q1` - <copy-ready user question>

## Architecture Notes

- Role: Architect
- Decisions:
  - <scoping decision>
- Constraints:
  - <constraint that Plan must preserve>
- Tradeoffs:
  - <alternative considered and why rejected>
- Assumptions:
  - <A IDs or summaries>
- Downstream impact:
  - <impact on Plan, Build, Review, Test, Ship, or Reflect>

## Exit Gate

- [ ] Goal, scope, and non-goals are concrete.
- [ ] Standard/Complex work has at least one `R` ID.
- [ ] Every active `R` and `RI` has acceptance criteria.
- [ ] Blocking `Q` IDs appear in `orchestration.blockers`.
- [ ] Assumptions are explicit as `A` IDs.
- [ ] Architecture notes capture decisions and downstream impact.
- [ ] User has approved the brief or an explicit waiver is recorded.
