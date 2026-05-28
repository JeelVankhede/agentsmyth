---
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
---

# <Title> - Plan

## Summary

<One-paragraph implementation strategy grounded in the approved brief.>

## Inputs

- Brief:
- Source-of-truth:
- Repo/profile config:
- Verification config:
- Release config:

## Requirement Coverage

| Manifest ID | Plan Coverage | Owning Phase | Notes |
|---|---|---|---|
| R1 | <how the plan addresses it> | Phase 1 | <notes> |
| RI1 | <how the plan addresses it> | Phase 1 | <notes> |

## Repo Impact Map

| Path / Surface | Change Type | Manifest IDs | Public Contract Impact | Generated Output Impact | Protected / Owner Notes |
|---|---|---|---|---|---|
| `<path>` | docs / config / runtime / tests / release / source | R1 | none / describe | none / describe | none / describe |

## Source-of-Truth Strategy

- Source type:
- Source item / lookup:
- Read requirements:
- Update target:
- Handoff owner:
- Blocks Ship: yes / no / waiver-required

## Approach

<High-level approach. Do not include code bodies unless needed for a contract boundary.>

## Phases

### Phase 1 - <name>

- Manifest IDs: R1, RI1
- Touches:
  - `<path>`
- Work:
  - <work item>
- Why now:
  - <dependency/risk reason>
- Exit gate:
  - <binary completion gate>

## Dependency Order

1. <First dependency>
2. <Next dependency>

## Branch Strategy

- Base branch:
- Working branch:
- Commit policy:
- PR expectation:
- Default branch exception: none / user-approved
- Dirty state handling:

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs | Waiver Needed |
|---|---|---|---|---|---|---|
| <risk> | low / medium / high | low / medium / high | <mitigation> | <owner> | R1 | no |

## Verification Plan

| Manifest ID | Evidence Type | Command / Inspection Target | Expected Result | Owning Phase | Risk If Skipped |
|---|---|---|---|---|---|
| R1 | command / manual / review / generated-output / source / waiver | `<command or path>` | <expected> | Test | <risk> |

## Architecture Notes

- Role: Principal Engineer
- Decisions:
  - <planning decision>
- Constraints:
  - <constraint from config, source, repo, verification, or release>
- Tradeoffs:
  - <tradeoff>
- Assumptions:
  - <A IDs or summaries>
- Downstream impact:
  - <impact on Build, Review, Test, Ship, or Reflect>

## Open Questions

- `<QID>` - <question, owner, and blocked phase>

## Exit Gate

- [ ] Every active `R` and `RI` is mapped to at least one phase.
- [ ] Every active `R` and `RI` has one owning completion phase.
- [ ] Every phase has a binary exit gate.
- [ ] Dependency order is explicit.
- [ ] Branch strategy is explicit.
- [ ] Source-of-truth and release handling are explicit or marked not applicable.
- [ ] Verification plan covers every active `R` and `RI`.
- [ ] User has approved the plan or an explicit waiver is recorded.
