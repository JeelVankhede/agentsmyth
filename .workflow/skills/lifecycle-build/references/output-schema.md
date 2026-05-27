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
architecture_notes:
  role: Senior Engineer
  decisions:
  constraints:
  tradeoffs:
  assumptions:
  downstream_impact:
```

Required body sections:

1. Active Phase
2. Branch / Repo Status
3. Scope
4. Changed Files
5. Implementation Log
6. Verification Items
7. Command Results
8. Dispatch Log
9. Architecture Notes
10. Blockers
11. Phase Completion Log

Schema acceptance criteria:

- `manifest_ids` includes every active `R` and `RI` implemented or tracked by the task artifact.
- `upstream` points to the approved Plan artifact.
- Branch / Repo Status records status before edits and current status at handoff.
- Changed Files lists exact paths and manifest IDs.
- Verification Items and Command Results record evidence or explicit not-run risk.
- Dispatch Log exists and records every authorized dispatch, or states none.
- Phase Completion Log has one entry per completed active phase.
