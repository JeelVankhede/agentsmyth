# PR / CI Policy

PR and CI handling is required only when configured by release config, repo profile, Plan, or user instruction.

Record:

- base branch
- head branch
- PR URL or handoff
- CI provider or check names when known
- CI status: pass, fail, pending, not required, blocked, or waived
- review status when configured
- owner and next action

Rules:

- Do not create or update PRs unless the user requested it or release config allows it.
- Do not claim CI state without tool output or user-provided evidence.
- Pending or failed required CI produces `hold` unless waived.
- Missing PR for a configured PR gate produces `hold`.
- Use one PR for the target repo unless the Plan explicitly says otherwise.
