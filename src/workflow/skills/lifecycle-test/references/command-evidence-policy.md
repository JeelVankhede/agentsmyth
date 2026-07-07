# Command Evidence Policy

Command evidence must be exact and attributable.

Record:

- command
- working directory or repo area
- relevant environment notes
- outcome: pass, fail, not run, blocked
- short output summary
- timestamp when useful
- manifest IDs covered

Rules:

- Use configured commands from `workflow/config/verification.yaml` or commands discovered from repo context.
- Do not invent commands.
- Do not paraphrase a command so broadly that it cannot be rerun.
- Do not claim success from a previous run unless the artifact cites the exact existing evidence and why it is still valid.
- Network, sandbox, dependency, or tool failures are blocked/not-run evidence with risk, not pass evidence.
