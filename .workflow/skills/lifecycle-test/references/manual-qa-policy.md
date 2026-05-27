# Manual QA Policy

Manual QA is acceptable when configured commands cannot fully prove a requirement or when user-facing behavior must be inspected.

Record:

- scenario
- environment
- setup/data
- steps
- expected result
- observed result
- outcome: pass, fail, blocked, or skipped
- evidence path, screenshot path, log, or note
- manifest IDs covered

Rules:

- Manual QA must be repeatable from the artifact.
- Use `not applicable` when no manual QA is needed.
- Failed manual QA blocks Ship unless fixed/rerun or waived.
- Do not use manual QA as a substitute for configured commands unless the command is unavailable, irrelevant, or waived.
