---
description: Start or resume the agentsmyth lifecycle orchestrator for the repository in the current working directory.
---

# agentsmyth

1. Read `workflow/config/` in this repo for per-repo config (domain, protected paths, verification commands).
2. If `workflow/config/` is absent, run `agentsmyth check` to auto-bootstrap repo config first.
3. Load `~/.agentsmyth/workflow/router.md` — classifies the task and routes the lifecycle.
4. Load `~/.agentsmyth/workflow/agent-behavior.yaml` — task classes, evidence rules, artifact chain.
5. Follow the phase skill from `~/.agentsmyth/workflow/skills/` for whatever phase the router determines.

Never skip the gate. Never mark a phase complete without evidence.
