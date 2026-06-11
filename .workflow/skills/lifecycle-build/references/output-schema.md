# Output Schema

Build writes:

```text
.workflow/artifacts/tasks/<slug>-v<N>.md
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
