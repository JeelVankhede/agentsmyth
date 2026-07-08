---
applyTo: "**"
---
<!-- agentsmyth global gate BEGIN -->
## agentsmyth Lifecycle Workflow (system-level)

When working in any repository that has a `workflow/` directory or `workflow/config/`:

1. Load `~/.agentsmyth/workflow/router.md` — classifies the task and routes the lifecycle.
2. Load `~/.agentsmyth/workflow/agent-behavior.yaml` — task classes, evidence rules, artifact chain.
3. Read `workflow/config/` in the current repo for per-repo config (domain, protected paths, verification commands).
4. If `workflow/config/` is absent, run `agentsmyth check` to auto-bootstrap repo config.
5. Follow the phase skill from `~/.agentsmyth/workflow/skills/`.

Never skip the gate. Never mark a phase complete without evidence.

Global definitions: `~/.agentsmyth/workflow/`
Per-repo data: `workflow/config/`, `workflow/artifacts/`, `workflow/learnings/`
<!-- agentsmyth global gate END -->
