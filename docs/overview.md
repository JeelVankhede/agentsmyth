# Overview

`agentsmyth` is a repository-local workflow contract for AI-assisted engineering. It is meant to be copied into a targeted repository, configured for that repository, and used by agents to produce durable artifacts instead of relying on chat memory.

## Mental Model

```text
skill playbook -> reference files -> artifact template -> artifact output -> verification and ship evidence
```

The skill tells the agent what phase it is in. Reference files define the detailed policy for that phase. Templates define the durable artifact shape. Config files decide which repo, source, verification, and release rules apply.

## Main Directories

| Path | Purpose |
|---|---|
| `.workflow/router.md` | Entry point for choosing or restoring lifecycle state. |
| `.workflow/lifecycle.md` | Phase order, gate expectations, and transitions. |
| `.workflow/rules.md` | Cross-phase rules that always apply. |
| `.workflow/skills/` | Phase and power-skill playbooks. |
| `.workflow/templates/` | Markdown artifact templates and reusable sections. |
| `.workflow/config/` | Machine-readable defaults and adoption settings. |
| `.workflow/schemas/` | YAML schema contracts for configs and artifacts. |
| `.workflow/artifacts/` | Runtime artifact output. |
| `.workflow/learnings/` | Raw and curated learning records. |
| `docs/` | Human-facing setup and adoption documentation. |
| `adapters/` | Optional instruction shims for specific agent tools. |

## Lifecycle Output

The workflow creates an artifact chain:

```text
.workflow/artifacts/briefs/<slug>-v<N>.md
.workflow/artifacts/plans/<slug>-v<N>.md
.workflow/artifacts/tasks/<slug>-v<N>.md
.workflow/artifacts/reviews/<slug>-v<N>.md
.workflow/artifacts/verify/<slug>-v<N>.md
.workflow/artifacts/ship/<slug>-v<N>.md
.workflow/artifacts/reflect/<slug>-v<N>.md
```

Artifacts are state, not decoration. Later agents should restore context from artifacts, config, git state, and cited evidence before continuing.

## Non-Goals

- It is not a project-management system by itself.
- It does not require a specific source provider or issue tracker.
- It does not require a specific model or agent tool.
- It does not make release, CI, deployment, or publishing mandatory unless configured.
- It does not replace tests, code review, or human approval for risky actions.
