# Skipped Check Policy

Skipped checks are risk, not success.

Every skipped or blocked check must record:

- check name
- manifest IDs affected
- why skipped
- risk
- owner
- whether it blocks Ship
- waiver reference when applicable

Ship impact values:

- `yes`: Ship must hold until evidence exists or waiver is accepted.
- `no`: Ship may proceed with recorded residual risk.
- `waiver-required`: Ship may proceed only if the user accepts the waiver.

Common skipped-check reasons:

- command is not configured yet
- tool or dependency unavailable
- network/sandbox blocked
- manual QA environment unavailable
- generated-output source missing
- check is out of current phase scope

Do not omit a skipped configured check because it is inconvenient.
