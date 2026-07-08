# agentsmyth Workflow Gate — {{REPO_NAME}}

> **Domain:** {{DOMAIN_NAME}} | {{REPO_PURPOSE}}

## Mandatory — read before any task

1. `workflow/router.md` — routes all tasks through the lifecycle.
2. `workflow/agent-behavior.yaml` — behavior invariants, task classes, evidence rules.

Never skip this gate. Never mark a phase complete without evidence.

## Branch policy

Default branch: `{{DEFAULT_BRANCH}}`
{{BRANCH_POLICY}}

## Protected paths

{{PROTECTED_PATHS}}

## Verification commands

{{VERIFICATION_CMDS}}

## Constraints

{{CONSTRAINTS}}
