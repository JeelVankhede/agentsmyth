# Skills

Skills are phase playbooks. They define what an agent must load, decide, write, and report for a lifecycle phase.

## Lifecycle Skills

| Skill | Phase |
|---|---|
| `lifecycle-think` | Think |
| `lifecycle-plan` | Plan |
| `lifecycle-build` | Build |
| `lifecycle-review` | Review |
| `lifecycle-test` | Test |
| `lifecycle-ship` | Ship |
| `lifecycle-reflect` | Reflect |

## Power Skills

| Skill | Purpose |
|---|---|
| `decompose-requirements` | Create or backfill requirement manifest entries. |
| `restore-context` | Rebuild lifecycle state from artifacts, config, git, and source references. |
| `dispatch-subagents` | Define safe optional parallel workstreams. |

## Rules

- Load the selected skill after `.workflow/router.md`, `.workflow/lifecycle.md`, `.workflow/rules.md`, and relevant config.
- Load only the references needed for the current phase.
- Follow the skill output schema.
- Do not collapse reference files into `SKILL.md`; references are part of the contract.
