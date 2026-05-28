# Verification Matrix

The verification matrix maps every active manifest ID to evidence.

Required fields:

- manifest ID
- acceptance criterion summary
- evidence type
- command, manual scenario, generated-output path, review evidence, source check, or waiver
- expected result
- actual result
- status: pass, fail, skip, blocked, or waived
- owner
- Ship impact

Evidence types:

- command
- manual QA
- generated-output check
- review evidence
- source-of-truth check
- release/rollback check
- waiver

Rules:

- Every active `R` and `RI` must have at least one evidence row.
- Failed evidence blocks Ship unless fixed/rerun or waived.
- Skipped evidence must also appear in Skipped Checks.
- Waivers require user authority and risk.
