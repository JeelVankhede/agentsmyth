# Verification Planning

Build the verification plan from `.workflow/config/verification.yaml` and repo inspection.

Each active `R` and `RI` needs one or more evidence types:

- configured command
- focused manual QA
- durable review finding/coverage check
- generated-output verification
- source-of-truth read/update check
- release or rollback check
- explicit user waiver

Required verification row fields:

- manifest ID
- evidence type
- command or inspection target
- expected result
- owning phase: Review, Test, Ship, or waiver
- risk if skipped

Rules:

- Do not invent commands. If a command is not configured or discoverable, mark it as unknown and block or plan manual evidence.
- Do not use generic phrases like "run tests" without naming the exact command or check.
- Skipped checks are risks, not successes.
- Generated output must be verified against its configured source or regeneration path.
