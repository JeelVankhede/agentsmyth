---
title: Run it
---

# Run it

You have run `init`. The staging folder is sitting in your repo. Now you say one sentence.

## Hand it off

Open your agent in the repo and tell it:

```text
run the agentsmyth setup
```

That instruction is the entire handoff. The agent reads `setup-bundle.md`, inspects your repo, resolves whatever `init` left open, writes your config, places the right adapter, links your repo to the shared workflow, and deletes the staging folder when it is done.

## Daily work

From here, you just work, and the workflow catches the work:

```text
add pagination to the search results endpoint
```

The agent's adapter routes that request to `workflow/router.md`, which classifies it before doing anything:

| Class | Example | What runs |
|---|---|---|
| Trivial | Fix a typo, bump a constant | No lifecycle. Just do it. |
| Standard | Add a feature, fix a real bug | Full seven-phase loop |
| Complex | Touches requirements, releases, public behavior, or generated output | Full loop, mandatory, no shortcuts |

For anything Standard or Complex, the agent moves through the phases in order, pausing at the checkpoints your config asks it to, and writing an artifact per phase as it goes.

## Picking up where you left off

This is where loop engineering earns its keep. Come back tomorrow, or send in a different agent, and say:

```text
continue the pagination work
```

The agent does not ask you to re-explain. It reads the artifact chain on disk, restores the full context, and continues from the exact gate you stopped at. The session that created the work is long gone. The record it left behind is not.

## The rules the agent is now bound to

- **Evidence or nothing.** No claiming a command passed without its output in the current turn, and no claiming a PR merged or a deploy landed without proof.
- **Skipped is not skipped silently.** Any check the agent does not run is recorded as risk, with a reason, a level, and an owner.
- **Branch safety.** Planned changes go on a non-default branch unless you say otherwise. Destructive git needs your explicit yes.

You did not write these rules today. Setup wrote them once, and every run inherits them.
