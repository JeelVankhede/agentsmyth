# Verification Recording

Build records evidence; Test owns final verification.

For every check run during Build, record:

- exact command
- repo or area
- start context when relevant
- outcome: pass, fail, not run, blocked
- short notes
- affected manifest IDs

For every planned check not run during Build, record:

- reason
- risk
- owner phase, usually Test
- whether it blocks Review or Test

Rules:

- Do not claim a check passed without command output or existing evidence.
- Do not replace configured Test evidence with informal confidence.
- Failed checks must be fixed, rerun, or recorded as blockers.
- Skipped checks are risk, not success.
