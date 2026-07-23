---
title: Install
---

# Install

Installing agentsmyth is the least interesting thing you will do with it, which is the point. The command drops a staging folder and exits. Nothing is configured yet. The real work starts when you point your agent at it.

## The one you will use

```bash
npx @jeelvankhede/agentsmyth@latest init
```

That is the whole install for most people. `npx` fetches the package, runs `init`, and leaves.

## Run straight from GitHub, no install

```bash
npx github:JeelVankhede/agentsmyth init
```

## From a local tarball

Useful offline, or if you are testing an unreleased build:

```bash
npm install --save-dev file:/path/to/jeelvankhede-agentsmyth-<version>.tgz
npx agentsmyth init
```

## What init actually does

`init` does three things in order: it makes sure a shared copy of the workflow exists on your machine, installing the definitions tree once under `~/.agentsmyth/` the first time you run it. It creates the `.agentsmyth/` staging folder at your repo root. And it links this repo to the shared copy by recording `definitions_root` in your `repo-profile.yaml`. Only your repo-specific files are written into the repo. Here is what lands in the staging folder:

| Inside `.agentsmyth/` | What it is |
|---|---|
| `setup-bundle.md` | The setup skill your agent reads to drive onboarding |
| `workflow-bundle.md` | The workflow compiled into one file, used to seed local artifacts and learnings |
| `validators/` | Health-check scripts that refuse a broken install |
| `assets/` | Adapter shims and the default config files |

`.agentsmyth/` is added to your `.gitignore` automatically, and it is temporary: the agent deletes it once setup is done. The command never writes to your repo root directly, so a collision with an existing `AGENTS.md` or `workflow/` is impossible until the agent makes deliberate, file-by-file decisions later.

## prepare on its own

```bash
npx @jeelvankhede/agentsmyth@latest prepare
```

`prepare` installs or updates just the shared definitions tree, with no repo write. You rarely run it directly since `init` runs it for you on first use. For CI or air-gapped machines, commit a copy of the definitions tree into the repo and point `definitions_root` at it.

## Requirements

- Node.js 18 or newer.
- One of the supported agents: Claude Code, Codex, Copilot, Cursor, or Windsurf.
- A git repo. Single-repo, monorepo, or polyrepo all work.
