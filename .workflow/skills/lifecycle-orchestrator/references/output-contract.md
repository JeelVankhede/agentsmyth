# Output Contract

## Purpose

Define the user-facing response shape for orchestrator turns.

## Required Ending States

Every orchestrator turn must end in exactly one state.

### Paused

Use when user input, approval, evidence, or external action is required.

Include:

- current phase
- slug/version when known
- blocker IDs
- exact question or action needed
- artifact path updated
- next phase after resolution

### Advanced

Use when the current phase gate passed and the lifecycle moved forward.

Include:

- completed phase
- artifact path updated
- next phase
- remaining risks or blockers, if any

### Complete

Use when Reflect is done or the user explicitly stops with recorded risk.

Include:

- final artifact path
- outcome
- follow-ups
- learning candidates or curation recommendation

## Response Rules

- Start with the current state.
- Be specific about file paths and phase names.
- Do not claim commands, tests, PRs, releases, or source updates happened unless evidence exists.
- Do not expose internal scratchpad reasoning.
- Keep the response actionable and short.

## Blocker Format

Use this format for blockers:

```text
Blocked in: <phase>
Artifact: <path>
Blockers: <Q/R/RI IDs or external blocker names>
Needed from user: <exact answer or action>
Next after resolution: <phase>
```

## Completion Format

Use this format when complete:

```text
Completed: <slug>-v<N>
Final phase: reflect
Artifacts: <brief, plan, task, review, verify, ship, reflect paths>
Follow-ups: <none or list>
```
