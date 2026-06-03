---
slug: add-help-panel
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-05-28T00:00:00Z
updated: 2026-05-28T00:00:00Z
manifest_ids:
  - R1
  - RI1
upstream:
  - user-request
  - examples/minimal-markdown-source/source/requirements.md
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: brief-review
architecture_notes:
  role: Architect
  decisions:
    - Treat the local Markdown requirements file as source authority for this example.
  constraints:
    - Keep the change docs-only unless Plan finds a runtime dependency.
  tradeoffs:
    - Stop at Plan in this example instead of inventing Build evidence.
  assumptions:
    - A1 source file content is current for the example.
  downstream_impact:
    - Plan must preserve source link and docs-only scope.
---

# Add Help Panel - Brief

## Source Links

- User request: Add a help panel from the local requirements file.
- Source-of-truth: `examples/minimal-markdown-source/source/requirements.md`
- GitHub / issue / ticket: not applicable
- Prior lifecycle chain: none
- Target repo evidence: example only

## Problem

Account settings documentation lacks a clear support path.

## Goals

- Add a short help panel to account settings documentation.

## Non-Goals

- Do not change runtime application behavior.
- Do not publish release notes.

## User Impact

Readers can find the support contact page from account settings documentation.

## Success Metrics

- The docs page includes the help panel and support link.

## Requirements

- The help panel links to the support contact page.

## Constraints

- The source authority is local Markdown.
- The example remains provider-neutral.

## Risks

- Docs-only scope could drift into runtime work if Plan does not constrain paths.

## Open Questions

- none

## Requirement Manifest

### Explicit (R)

- **R1** - Add a help panel to account settings documentation.
  - Acceptance: Docs include a help panel with a support contact link.

### Implicit (RI)

- **RI1** - Preserve the source term "account settings".
  - Acceptance: The new docs text uses "account settings".

### Assumptions (A)

- **A1** - The local requirements file is the current source authority for this example.

### Open Questions (Q)

- none

## Questions For User

- none

## Architecture Notes

- Role: Architect
- Decisions:
  - Keep scope docs-only.
- Constraints:
  - Local Markdown source authority must be cited downstream.
- Tradeoffs:
  - No release artifact is created in this partial example.
- Assumptions:
  - A1
- Downstream impact:
  - Plan must map R1 and RI1 to docs paths and verification.

## Exit Gate

- [x] Goal, scope, and non-goals are concrete.
- [x] Standard/Complex work has at least one `R` ID.
- [x] Every active `R` and `RI` has acceptance criteria.
- [x] Blocking `Q` IDs appear in `orchestration.blockers`.
- [x] Assumptions are explicit as `A` IDs.
- [x] Architecture notes capture decisions and downstream impact.
- [x] User has approved the brief or an explicit waiver is recorded.
