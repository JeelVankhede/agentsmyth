# Source-of-Truth Reader

Read source-of-truth context from configuration and artifacts.

Inspect:

- `.workflow/config/source-of-truth.yaml`
- source links in brief/plan/ship/reflect artifacts
- source read/update strategy in Plan
- source handoff status in Ship
- blocked handoff and waiver entries

Possible states:

- not configured
- not required
- source read complete
- update required
- update complete with evidence
- blocked with handoff
- waived by user

Rules:

- Do not make any provider mandatory.
- Do not claim external state without tool output, artifact evidence, or user-provided proof.
- If source update is required but target is unclear, recommend `blocked`.
