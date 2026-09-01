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
4. Assumptions Verified (only when the brief declares `A` IDs — see below)
5. Repo Impact Map
6. Source-of-Truth Strategy
7. Approach
8. Phases
9. Dependency Order
10. Branch Strategy
11. Risk Register
12. Verification Plan
13. Architecture Notes
14. Open Questions
15. Checkpoint Approval
16. Exit Gate

Every active `R` and `RI` from the brief must appear in `manifest_ids`, Requirement Coverage, Phases, and Verification Plan.

`## Assumptions Verified` is required whenever the upstream brief declares any `A` ID, and is
omitted entirely when it declares none. `check-assumptions.mjs` fails the plan if the section is
missing while the brief declares assumptions, or if any declared `A` ID has no row. One row per
brief `A` ID; `Status` is exactly `evidence-backed` or `raised-as-question`; the third column must
be non-empty — a specific citation for `evidence-backed`, or the superseding `Q` ID for
`raised-as-question`. The `plan-assumption-verifier` power skill writes this table.

`## Checkpoint Approval` is required whenever `orchestration.user_checkpoint` is not the literal
string `none` (it is `plan-review` by default — see Starter Block). `check-lifecycle.mjs --phase
build` hard-blocks Build from starting if this artifact declares `status: ready-for-next-phase`
without a matching, approved, evidenced Checkpoint Approval section. Answering earlier
clarifying questions during Think does **not** satisfy this — the user must have actually seen
and responded to this Plan's own content specifically (see `workflow/rules.md`'s `## Approval`
section). The `User's own words` line must be the user's real, verbatim message, never authored
or paraphrased by the agent. If the user has not yet reviewed this plan, leave
`status: blocked-for-user` and present it to them instead of proceeding to Build.

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
  - workflow/artifacts/briefs/<slug>-v<N>.md
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

## Assumptions Verified

<!-- Required when the upstream brief declares A IDs; omit this section entirely if it declares none. -->

| Assumption ID | Status | Evidence / Question |
|---|---|---|

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|

## Source-of-Truth Strategy

## Approach

## Phases

### Phase 1 - <name>

- **Manifest IDs:**
- Touches:
- Work:
- **Exit gate:**

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

## Checkpoint Approval

- Checkpoint: plan-review
- Status: <approved — only once the user has actually responded to this plan's own content>
- User's own words (verbatim, this turn): "<exact quote — never author this yourself>"

## Exit Gate

- [ ] Every active R and RI mapped to a phase.
- [ ] Every phase has a binary exit gate.
- [ ] Verification plan covers every R and RI.
- [ ] User approved or waiver recorded.
```
