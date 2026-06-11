# Source-of-Truth Reader

Read source-of-truth context from configuration and artifacts.

## Skip Condition

If `.workflow/config/source-of-truth.yaml` is absent or its `provider` key is empty or unset, skip all source-of-truth reads. Record state as `not configured` and do not infer source requirements from any artifact.

## Inspect When Configured

- `.workflow/config/source-of-truth.yaml`
- source links in brief, plan, ship, and reflect artifacts
- source read/update strategy in Plan
- source handoff status in Ship
- blocked handoff and waiver entries

## Possible States

- `not configured` — config file absent or provider unset; skip all source checks
- `not required` — config present but source update was not in scope for this chain
- `source read complete` — source was read as input; no update required
- `update required` — config or artifact names an update target; update not confirmed
- `update complete with evidence` — update confirmed by tool output or artifact evidence
- `blocked with handoff` — update required but target or authority is unknown; copy-ready handoff recorded
- `waived by user` — user explicitly accepted that source was not updated

## Rules

- Do not make any provider mandatory.
- Do not claim external state without tool output, artifact evidence, or user-provided proof.
- If source update is required but target is unclear, recommend `blocked`.
- Never transition from `not configured` to any other state without reading the actual config file first.
