# Workflow

`workflow/` is the canonical source for lifecycle behavior.

## Entry Points

| Path | Purpose |
|---|---|
| `router.md` | How an agent chooses a phase or restores state. |
| `lifecycle.md` | Phase order and transition contract. |
| `rules.md` | Cross-phase rules. |
| `config/` | Machine-readable repository policy. |
| `schemas/` | YAML schema contracts. |
| `skills/` | Phase and power-skill playbooks. |
| `artifacts/` | Runtime lifecycle artifacts. |
| `learnings/` | Raw sessions and curated learnings. |
| `validators/` | Active contract checks for config, Starter Blocks, lifecycle state, artifacts, and placeholder leakage. |

## Load Order

1. Root `AGENTS.md`.
2. `workflow/router.md`.
3. `workflow/config/agent-behavior.yaml`.
4. Relevant config files under `workflow/config/`.
5. Current lifecycle artifact chain, if any.
6. The selected skill under `workflow/skills/`.
7. Skill references and the relevant template.

Do not use adapter files or chat memory as a replacement for this load order.
