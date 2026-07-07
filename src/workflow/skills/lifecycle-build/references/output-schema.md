# Output Schema

Build writes:

```text
workflow/artifacts/tasks/<slug>-v<N>.md
```

Required frontmatter keys:

```yaml
slug:
version:
artifact: task
status:
created:
updated:
manifest_ids:
upstream:
orchestration:
  phase: build
  status:
  next_phase:
  blockers:
  user_checkpoint:
```

Required body sections:

1. Active Phase
2. Plan Phases Overview
3. Branch / Repo Status
4. Scope
5. Changed Files
6. Implementation Log
7. Verification Items
8. Command Results
9. Dispatch Log
10. Architecture Notes
11. Blockers
12. Phase Completion Log

Plan Phases Overview requirements:

- One row per plan phase listing phase name, status (`complete` / `active` / `pending`), and the manifest IDs it covers.
- Present from the first task artifact; updated at the start of each new Build phase.
- Allows Review to see overall Build progress without reading the plan artifact.

Schema acceptance criteria:

- `manifest_ids` includes every active `R` and `RI` implemented or tracked by the task artifact.
- `upstream` points to the approved Plan artifact.
- Branch / Repo Status records status before edits and current status at handoff.
- Changed Files lists exact paths and manifest IDs.
- Verification Items and Command Results record evidence or explicit not-run risk.
- Dispatch Log exists and records every authorized dispatch, or states none.
- Phase Completion Log has one entry per completed active phase.

## Starter Block

Copy this block to create a new task artifact. Replace every `<placeholder>`.

```markdown
---
slug: <slug>
version: 1
artifact: task
status: in-progress
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
manifest_ids: []
upstream:
  brief: workflow/artifacts/briefs/<slug>-v<N>.md
  plan: workflow/artifacts/plans/<slug>-v<N>.md
orchestration:
  phase: build
  status: in-progress
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# <Title> - Task

## Active Phase

- Phase:
- Manifest IDs:
- Exit gate:

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - <name> | active | R1, RI1 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `<branch>` | <git status output> | <unrelated files noted> |
| At handoff | `<branch>` | <git status output> | <scope confirmed> |

## Scope

- In scope:
- Out of scope:

## Changed Files

- `<path>` — <what changed> — IDs: <R/RI IDs>

## Implementation Log

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|

## Dispatch Log

none

## Architecture Notes

- role: Senior Engineer
- decision:
- constraint:
- tradeoff:
- downstream:

## Blockers

none

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
```
