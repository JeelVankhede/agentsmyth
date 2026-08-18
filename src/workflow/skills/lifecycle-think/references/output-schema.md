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
13. Council Log (only when frontmatter has `council.mode: council` — see below)
14. Architecture Notes
15. Checkpoint Approval
16. Exit Gate

`## Council Log` is required whenever frontmatter carries a `council:` block with
`mode: council`. It is omitted entirely by single-agent briefs and by briefs written before councils
existed — the `council:` block and this section are both optional additions, so every earlier brief
continues to validate with no edits.

The frontmatter `council:` block is the **summary**; `## Council Log` is the **detail**. Together
they must let a reader reconstruct the run from the artifact alone, with no session transcript:
every round with its member counts and roles, evidence classes used, findings with class and
disposition, conflicts and their resolutions, which item IDs each round closed, and why the loop
stopped.

`manifest_ids` should include active `R` and `RI` IDs covered by the brief. **Only `R` and `RI` IDs may appear in `manifest_ids`** — `A` (assumption) and `Q` (question) IDs must never be listed there (the schema's `manifest_ids` pattern accepts only `R`/`RI`). Blocking `Q` IDs must also appear in `orchestration.blockers`.

`## Checkpoint Approval` is required whenever `orchestration.user_checkpoint` is not the literal
string `none` (it is `brief-review` by default — see Starter Block). `check-lifecycle.mjs --phase
plan` hard-blocks the next phase if this artifact declares `status: ready-for-next-phase` without
a matching, approved, evidenced Checkpoint Approval section — the artifact's own status field is
not sufficient proof the user actually reviewed it, since the same agent writes both. The
`User's own words` line must be the user's real, verbatim message approving this specific brief
— never authored or paraphrased by the agent (see `workflow/rules.md`'s `## Approval` section).
If the user has not yet actually responded to this brief's own content, do not write this section
— leave `status: blocked-for-user` and wait.

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
upstream:
  - user-request
orchestration:
  phase: think
  status: blocked-for-user
  next_phase: plan
  blockers: []
  user_checkpoint: brief-review
skill_trigger_log:
  - skill: repo-alignment-scan
    decision: ran
    reason: <ran or skipped — why>
  - skill: architecture-decision-advisor
    decision: skipped
    reason: <ran or skipped — why>
  - skill: constraint-conflict-scan
    decision: ran
    reason: <ran or skipped — why>
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

<!-- Every surviving Q carries a recommendation and the finding IDs it rests on.
     Evidence references must not be exclusively `recall`. -->

## Council Log

<!-- Required only when frontmatter has council.mode: council. Omit entirely otherwise. -->

### Requirement Classification

<!-- Every active R/RI, with the evidence class(es) that would actually settle it. Written at
     stage 2, BEFORE any dispatch — deciding what would settle a question is what stops research
     becoming an undirected read of whatever is nearby. -->

| Manifest ID | Question bucket | Evidence classes |
|---|---|---|

### Members

| Member | Role | Round | Capabilities | Sandbox |
|---|---|---|---|---|

### Rounds

| Round | Researchers | Challengers | Open in | Open out | Items closed | Sizing rationale |
|---|---|---|---|---|---|---|

### Findings

| Finding | Member | Role | Surface | Evidence class | Citation | Disposition | Reason / merged into |
|---|---|---|---|---|---|---|---|

### Conflicts

| Surface | Findings | Resolution |
|---|---|---|

### Termination

- Reason:
- Surviving items and their round history:

## Architecture Notes

- role: Architect
- decision:
- constraint:
- tradeoff:
- downstream:

## Checkpoint Approval

- Checkpoint: brief-review
- Status: <approved — only once the user has actually responded to this brief's own content>
- User's own words (verbatim, this turn): "<exact quote — never author this yourself>"

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
