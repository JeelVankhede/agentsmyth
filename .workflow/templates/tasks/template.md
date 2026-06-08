---
slug: <slug>
version: <N>
artifact: task
status: in-progress
created: <YYYY-MM-DDTHH:MM:SSZ>
updated: <YYYY-MM-DDTHH:MM:SSZ>
manifest_ids: []
upstream:
  - .workflow/artifacts/plans/<slug>-v<N>.md
orchestration:
  phase: build
  status: in-progress
  next_phase: review
  blockers: []
  user_checkpoint: build-complete
---

# <Title> - Task Artifact

## Active Phase

- Phase:
- Manifest IDs:
- Exit gate:
- Status: in-progress / blocked / complete

## Branch / Repo Status

| Moment | Branch | Status | In-Scope Files | Unrelated Changes | Notes |
|---|---|---|---|---|---|
| Before edits | `<branch>` | `<git status --short --branch>` | `<paths>` | `<paths or none>` | <notes> |
| Handoff | `<branch>` | `<git status --short --branch>` | `<paths>` | `<paths or none>` | <notes> |

## Scope

- Approved phase touches:
  - `<path>`
- Explicitly out of scope:
  - `<path or behavior>`
- Scope changes:
  - none / <change and approval>

## Changed Files

- `<path>` - <what changed> - IDs: R1, RI1

## Implementation Log

- [ ] <task item> - IDs: R1

## Verification Items

| Manifest ID | Planned Evidence | Build Status | Owner Phase | Notes |
|---|---|---|---|---|
| R1 | <command / inspection / manual / generated-output> | done / deferred / blocked | Test | <notes> |

## Command Results

| Command | Area | Outcome | Notes | Manifest IDs |
|---|---|---|---|---|
| `<command>` | repository | pass / fail / not run / blocked | <summary> | R1 |

## Dispatch Log

| Work Delegated | Agent Type | Cap Slot | Ownership | Result | Merged Into |
|---|---|---:|---|---|---|
| none | n/a | n/a | n/a | n/a | n/a |

## Architecture Notes

- Role: Senior Engineer
- Decisions:
  - <implementation decision>
- Constraints:
  - <constraint from plan/repo/verification/generated output>
- Tradeoffs:
  - <tradeoff>
- Assumptions:
  - <assumptions Review/Test must verify>
- Downstream impact:
  - <review focus, verification risk, release impact>

## Blockers

- none

## Phase Completion Log

- Phase <N> - <YYYY-MM-DD> - evidence: <command/path/artifact> - status: pass / fail / blocked
