# agentsmyth Workflow Gate — {{REPO_NAME}}

> **Domain:** {{DOMAIN_NAME}} | {{REPO_PURPOSE}}

## Mandatory — read before any task

1. `workflow/router.md` — routes all tasks through the lifecycle. If this file does not
   exist, read `definitions_root` from `workflow/config/repo-profile.yaml` and load
   `<definitions_root>/router.md` instead — this repo is linked to a global install rather
   than holding a local copy.
2. `workflow/agent-behavior.yaml` — behavior invariants, task classes, evidence rules. Same
   local-or-linked resolution as above (`<definitions_root>/agent-behavior.yaml`).

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
