# Severity Model

Use exactly these severities:

- `P0`: Stop immediately. Data loss, secret exposure, destructive action, invalid lifecycle state, or release action that could cause serious harm.
- `P1`: Blocks handoff. Requirement missing, acceptance criteria unmet, serious regression, public contract break, generated output invalid, required evidence absent, or source-of-truth mismatch.
- `P2`: Should fix before Ship or explicitly waive. Meaningful maintainability, correctness, documentation, verification, or release risk that does not fully block Build handoff.
- `P3`: Non-blocking follow-up. Low-risk clarity, cleanup, or documentation polish.

Ordering:

1. P0
2. P1
3. P2
4. P3
5. path or area order inside each severity

Do not use severity for preference-only comments. A finding needs concrete behavioral, evidence, maintainability, release, or lifecycle risk.
