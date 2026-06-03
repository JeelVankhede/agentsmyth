---
slug: add-help-panel
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-05-28T00:00:00Z
updated: 2026-05-28T00:00:00Z
manifest_ids:
  - R1
  - RI1
upstream:
  - .workflow/artifacts/briefs/add-help-panel-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
architecture_notes:
  role: Principal Engineer
  decisions:
    - Plan a docs-only implementation phase.
  constraints:
    - Use local Markdown source authority as evidence.
  tradeoffs:
    - Manual inspection is enough for this example because no command is configured.
  assumptions:
    - A1
  downstream_impact:
    - Build should edit only docs and Test should inspect text/link output.
---

# Add Help Panel - Plan

## Summary

Implement a docs-only help panel using the local requirements file as source authority.

## Inputs

- Brief: `.workflow/artifacts/briefs/add-help-panel-v1.md`
- Source-of-truth: `examples/minimal-markdown-source/source/requirements.md`
- Repo/profile config: not shown
- Verification config: manual inspection
- Release config: release not required

## Requirement Coverage

| Manifest ID | Plan Coverage | Owning Phase | Notes |
|---|---|---|---|
| R1 | Add help panel to docs page. | Build | Verify by manual inspection. |
| RI1 | Preserve "account settings" wording. | Test | Verify text content. |

## Repo Impact Map

| Path / Surface | Change Type | Manifest IDs | Public Contract Impact | Generated Output Impact | Protected / Owner Notes |
|---|---|---|---|---|---|
| `docs/account-settings.md` | docs | R1, RI1 | user-facing docs | none | docs owner |

## Source-of-Truth Strategy

- Source type: local Markdown
- Source item / lookup: `examples/minimal-markdown-source/source/requirements.md`
- Read requirements: Read before Build.
- Update target: none
- Handoff owner: docs-owner
- Blocks Ship: no

## Approach

Add a concise panel to the account settings documentation and link to the support contact page.

## Phases

### Phase 1 - Docs Help Panel

- Manifest IDs: R1, RI1
- Touches:
  - `docs/account-settings.md`
- Work:
  - Add help panel text and link.
- Why now:
  - Single docs change with no runtime dependency.
- Exit gate:
  - Docs text includes the panel, link, and required term.

## Dependency Order

1. Read source file.
2. Edit docs.
3. Inspect rendered or raw Markdown output.

## Branch Strategy

- Base branch: main
- Working branch: example/add-help-panel
- Commit policy: one scoped docs commit
- PR expectation: optional
- Default branch exception: none
- Dirty state handling: record and preserve unrelated changes

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs | Waiver Needed |
|---|---|---|---|---|---|---|
| Link target is stale | low | medium | Inspect target path before Ship | docs-owner | R1 | no |

## Verification Plan

| Manifest ID | Evidence Type | Command / Inspection Target | Expected Result | Owning Phase | Risk If Skipped |
|---|---|---|---|---|---|
| R1 | manual | `docs/account-settings.md` | Help panel links to support contact page. | Test | Users may not find support. |
| RI1 | manual | `docs/account-settings.md` | Text uses "account settings". | Test | Terminology drift. |

## Architecture Notes

- Role: Principal Engineer
- Decisions:
  - Keep implementation docs-only.
- Constraints:
  - Source-of-truth file must be cited.
- Tradeoffs:
  - Manual verification instead of command evidence because this example has no configured docs build.
- Assumptions:
  - A1
- Downstream impact:
  - Build and Test should not invent release or command evidence.

## Open Questions

- none

## Exit Gate

- [x] Every active `R` and `RI` is mapped to at least one phase.
- [x] Every active `R` and `RI` has one owning completion phase.
- [x] Every phase has a binary exit gate.
- [x] Dependency order is explicit.
- [x] Branch strategy is explicit.
- [x] Source-of-truth and release handling are explicit or marked not applicable.
- [x] Verification plan covers every active `R` and `RI`.
- [x] User has approved the plan or an explicit waiver is recorded.
