---
title: Run it
description: What happens after setup — handing off daily work to your agent and resuming it later.
---

# Run it

You have run `init`. The staging folder is sitting in your repo. Now you say one sentence — or, more reliably, type one command.

::: tip Prefer the explicit command
`agentsmyth prepare` installs a typed command in every supported tool: `/agentsmyth` in Claude Code, Cursor, Windsurf, and Copilot (VS Code), or `/prompts:agentsmyth` in Codex. Every example on this page shows it. Plain-English phrasing like "run the agentsmyth setup" usually works too, but an agent can skip a freeform instruction it doesn't recognize as a trigger — in practice, this happens. A typed command is resolved directly by the tool, not interpreted; it can't be silently skipped the same way.
:::

## Hand it off

Open your agent in the repo and run:

```text
/agentsmyth
```

That's the entire handoff. The agent reads `setup-bundle.md`, inspects your repo, resolves whatever `init` left open, writes your config, places the right adapter, links your repo to the shared workflow, and deletes the staging folder when it is done.

## Daily work

From here, you just work, and the workflow catches the work — lead with the command, then describe the task:

```text
/agentsmyth add pagination to the search results endpoint
```

The command loads `workflow/router.md` explicitly and routes that request through it, which classifies it before doing anything:

| Class | Example | What runs |
|---|---|---|
| Trivial | Fix a typo, bump a constant | No lifecycle. Just do it. |
| Standard | Add a feature, fix a real bug | Full seven-phase loop |
| Complex | Touches requirements, releases, public behavior, or generated output | Full loop, mandatory, no shortcuts |

For anything Standard or Complex, the agent moves through the phases in order, pausing at the checkpoints your config asks it to, and writing an artifact per phase as it goes.

## Picking up where you left off

This is where loop engineering earns its keep. Come back tomorrow, or send in a different agent, and run:

```text
/agentsmyth continue the pagination work
```

The agent does not ask you to re-explain. It reads the artifact chain on disk, restores the full context, and continues from the exact gate you stopped at. The session that created the work is long gone. The record it left behind is not.

## The rules the agent is now bound to

- **Evidence or nothing.** No claiming a command passed without its output in the current turn, and no claiming a PR merged or a deploy landed without proof.
- **Skipped is not skipped silently.** Any check the agent does not run is recorded as risk, with a reason, a level, and an owner.
- **Branch safety.** Planned changes go on a non-default branch unless you say otherwise. Destructive git needs your explicit yes.

You did not write these rules today. Setup wrote them once, and every run inherits them.
