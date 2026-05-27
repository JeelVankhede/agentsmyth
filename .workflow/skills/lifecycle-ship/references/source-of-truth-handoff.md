# Source-of-Truth Handoff

Source-of-truth handling is configured, not assumed.

Possible outcomes:

- `updated`: the configured source was updated and evidence exists.
- `not required`: config/Plan says no update is required.
- `blocked`: update is required but cannot be completed.
- `waived`: user accepted that source will remain stale or be handled later.

Record:

- provider or source type from config
- source item or lookup method
- fields/sections expected to change
- update evidence or blocked reason
- owner
- exact handoff text when blocked
- Ship impact

Rules:

- Do not make any provider mandatory.
- Do not claim an external update without tool output, artifact evidence, or user-provided proof.
- Copy-ready handoff is not completion unless the user accepts a waiver.
- If source target is unclear, Ship should hold.
