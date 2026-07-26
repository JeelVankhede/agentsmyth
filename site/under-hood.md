---
title: Under the hood
description: How agentsmyth actually works — the source-of-truth hierarchy, adapters, and the shared global install.
---

# Under the hood

You can use agentsmyth without reading this. But if you want to know why the install has the shape it does, or you plan to contribute, here is the machinery.

## Bundles, not a file tree

The package does not ship a nested directory of skill files. Package managers mangle those, and unzip steps invite collisions. Instead the workflow is compiled into flat bundles: `workflow-bundle.md` and `setup-bundle.md`. Each bundle is a single file where the original tree is encoded with `FILE` and `END FILE` markers.

The agent reads a bundle and expands it back into real files, one at a time, deciding what to do at each path. This is why setup can never clobber your repo blindly. Expansion is a series of deliberate, per-file agent decisions, not a `tar -x`.

## The four worlds

The same skills live in four different places, and confusing them means editing the wrong file.

| World | Where | What it is |
|---|---|---|
| Source | `src/workflow/` | The canonical, authored workflow |
| Bundle | `dist/workflow-bundle.md` | The compiled artifact shipped in the package |
| Definitions | `~/.agentsmyth/workflow/` | Expanded once by prepare, shared by every repo on the machine |
| Installed | `workflow/` in your repo | Your config, artifacts, and learnings — definitions resolve from the shared tree |

`scripts/build-bundle.mjs` compiles source into bundle. `prepare` expands bundle into the shared definitions tree. `init` links your repo to it. You edit source, and never the bundle or the definitions tree by hand.

## What the install leaves in your repo

```text
workflow/
  config/          your five YAML configs, filled during setup
  artifacts/       the lifecycle artifact chain lives here
  learnings/       raw and curated learning records
.claude/CLAUDE.md  or AGENTS.md / .cursor/rules / etc, your adapter

~/.agentsmyth/workflow/   the shared definitions, one copy per machine
```

## Adapters: one workflow, five front doors

Each supported tool gets a thin adapter placed at the path that tool reads automatically. The adapter does one job: point the tool at `workflow/router.md`.

| Tool | Adapter path |
|---|---|
| Claude Code | `.claude/CLAUDE.md` |
| Codex | `AGENTS.md` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Cursor | `.cursor/rules/index.mdc` |
| Windsurf | `.windsurfrules` |

## The adapters are advisory; the pre-commit hook is not

Adapters are prompt content — an AI tool has to read and choose to obey them. Nothing stops an
agent from skipping the lifecycle anyway, and no adapter mechanism is common to all five tools
(none of them expose a way to block a tool call before it happens).

`git commit` is the one thing every tool's output passes through regardless of which tool
produced it. `init` installs a local `pre-commit` hook (appended to any hook you already have,
never overwritten) that runs `agentsmyth check --staged`: safe paths (`workflow/`, `docs/`,
adapter dirs, Markdown) and small single-file diffs pass automatically; anything else must be
named in a real lifecycle task artifact's Changed Files, or the commit is rejected. This is
local-only by design — no CI template ships with agentsmyth. The only bypass is git's native
`--no-verify`.

## The source-of-truth hierarchy

When two sources disagree, agentsmyth does not guess. It has a ranked chain, and higher always wins:

1. **Your current request**, and any answer you give to a blocker.
2. **The workflow definitions** — canonical rules, lifecycle order, phase contracts.
3. **The adapter / AGENTS.md**, which sets source priority and context-load order.
4. **repo-mental-map.md**, the repo orientation written at setup.
5. **The code and the existing artifact chain** for the active work.

This chain is what makes handoffs safe. Every agent resolves conflicts the same way, so nobody's private assumption quietly wins.

## Zero runtime dependencies

The CLI, the YAML parser, the schema validator, and every check are hand-written Node ESM. There is no framework underneath and no service to call. The workflow is Markdown and YAML on your disk. That is what makes it portable enough to drop into any repo.
