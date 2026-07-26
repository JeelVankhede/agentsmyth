<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/brand/lockup-dark.svg">
    <img src="assets/brand/lockup-light.svg" alt="agentsmyth" width="380">
  </picture>
</p>

# agentsmyth

A portable AI engineering lifecycle. Drop it into any repo — your agent drives it and leaves durable artifacts behind, not chat smoke.

[![npm version](https://img.shields.io/npm/v/%40jeelvankhede%2Fagentsmyth)](https://www.npmjs.com/package/@jeelvankhede/agentsmyth)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![node >=18](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](package.json)

**[Read the full docs →](https://jeelvankhede.github.io/agentsmyth/)**

Picture the last thing an AI agent built for you — now try to answer which requirement it satisfied, what you decided against, and what evidence proved it worked, without scrolling back. If you can't, you didn't lose the code; you lost everything around it.

## What it refuses to be

Knowing what a tool is not is usually more honest than knowing what it is.

- **Not a framework.** It adds no library, no import, no build step to your code.
- **Not an agent.** It brings no model. It rides the agent you already run: Claude Code, Codex, Copilot, Cursor, or Windsurf.
- **Not a scaffolder.** It does not generate your project. It attaches a lifecycle to the project you have.
- **Not opinionated about your domain.** The workflow learns your domain during setup, from your repo and your answers, not from a template's guesses.
- **Not a paywall.** Every skill ships free. There is no gated tier, no premium content fetched from a server. Community-first, by decision.

## Setup

### Option A — npx (recommended)

```bash
npx @jeelvankhede/agentsmyth@latest init
```

That's the whole install for most people. `npx` fetches the published package, runs `init`, and leaves.

### Option B — Run directly from GitHub (no install)

```bash
npx github:JeelVankhede/agentsmyth init
```

This fetches the latest package from the repo and runs `init` without installing anything permanently.

### Option C — Install from a GitHub Release tarball

Download the `.tgz` from the [Releases](../../releases) page, then:

```bash
npm install --save-dev file:./jeelvankhede-agentsmyth-<version>.tgz
npx agentsmyth init
```

### Option D — Local development build

From this repo root:

```bash
npm run build       # rebuild dist/ bundles
npm pack            # produces jeelvankhede-agentsmyth-<version>.tgz
```

Then install in a target repo as in Option C.

### What `init` does

`npx agentsmyth init` performs the full mechanical scaffold itself — no AI agent involved yet:
- Links the repo to a global lifecycle-definitions install (`~/.agentsmyth/workflow/`, run via
  `agentsmyth prepare` automatically on first use).
- Writes all five `workflow/config/*.yaml` files (real structure, `<USER-TODO>` placeholders
  where a value can't be inferred) and `workflow/config/pending-setup.yaml` (every open item,
  with a question and an inspection hint).
- Creates `workflow/artifacts/` (the 7 empty lifecycle phase directories) and
  `workflow/learnings/` (README, `curated.md`, empty `sessions/`).
- Places an adapter file mechanically for the two tools no global gate can ever reach — Cursor
  (`.cursor/rules/agentsmyth.mdc`, always) and Copilot on a non-macOS platform
  (`.github/copilot-instructions.md`) — never overwriting an existing file at either path.
- Creates `.agentsmyth/` in the target repo root containing:
  - `setup-bundle.md` — the setup skill the agent reads to finish onboarding
  - `workflow-bundle.md` — the full workflow (router, lifecycle, all skills) the agent expands
  - `validators/` — health-check scripts
  - `assets/` — adapter shims and default config files

`.agentsmyth/` is added to `.gitignore` automatically. It is temporary — the agent removes it after setup.

### Mandatory local lifecycle gate

`init` also installs a **local git pre-commit hook** (`.git/hooks/pre-commit`, or your configured
`core.hooksPath` file if you already use one) — automatically, with no separate opt-in step. It
runs `agentsmyth check --staged` before every commit: staged files under `workflow/`, `docs/`,
`.cursor/`, `.claude/`, `.github/`, or any Markdown file are always safe; a single small
(≤15-line) non-safe file is treated as trivial; anything else must be named in a real (non-draft,
non-blocked) lifecycle task artifact's "Changed Files" section, or the commit is rejected with the
exact uncovered paths.

This is deliberately **local-only** — no CI workflow is added to or required by your repo. It's
enforced at the one point every supported AI tool's output passes through regardless of which
tool produced it: `git commit`. The only bypass is git's own `git commit --no-verify` — no new
flag or config toggle is introduced. If you already have a custom `pre-commit` hook, `init`
appends this check to the end of it rather than overwriting; re-running `init` is idempotent and
won't duplicate the check.

### Running setup

Open your AI agent in the target repo and say:

```
run the agentsmyth setup
```

The agent reads `setup-bundle.md` and runs a **resolution pass**, not a from-scratch interview:
it resolves `pending-setup.yaml`'s open items (inspecting the repo first, asking only what's
left), fills in the remaining `<USER-TODO>` fields in the config files `init` already wrote,
places the adapter for whichever of the other three tools (Claude Code, Codex, Windsurf) you
use — Copilot is already covered either by the global gate (macOS) or by `init`'s mechanical
placement (non-macOS) — and removes `.agentsmyth/` when done.

### What ends up in the target repo

```
workflow/
  config/          ← init writes stubs; the agent resolves what's left
  router.md
  lifecycle.md
  rules.md
  glossary.md
  skills/          ← full phase skill tree
  validators/      ← post-setup health checks
  schemas/
  artifacts/       ← lifecycle artifact chain lives here
  learnings/
.claude/CLAUDE.md  ← or AGENTS.md / .cursor/rules/ etc. depending on your tool
docs/knowledge-map/repo-mental-map.md
```

### Post-setup validation

After setup, verify the installation from the target repo root:

```bash
node workflow/validators/check-setup-complete.mjs
node workflow/validators/check-config.mjs
node workflow/validators/check-pending-setup.mjs   # shows any open items
```

## How it works

### Lifecycle

```text
brief -> plan -> task -> review -> verify -> ship -> reflect
```

Each Standard or Complex change leaves a readable artifact chain under `workflow/artifacts/`. The artifacts preserve requirement IDs, blockers, architecture notes, command evidence, skipped-check risk, release status, and follow-up decisions. Trivial changes (typo fixes, small config edits) are exempt from the full chain — the router (`workflow/router.md`) classifies each request on arrival.

| Phase | What happens |
|---|---|
| `brief` | Requirements captured, scope and complexity classified |
| `plan` | Architecture decisions, implementation plan, verification criteria |
| `task` | Active implementation tracked against the plan |
| `review` | Code review against the plan's manifest and requirements |
| `verify` | Commands run, evidence recorded against the verification plan |
| `ship` | Release checklist, risk sign-off, deployment evidence |
| `reflect` | Post-ship learnings, open follow-ups |

### Adapters

agentsmyth supports five AI tools out of the box. During setup, the agent places the correct adapter at the tool's native path:

| Tool | Adapter path |
|---|---|
| Claude Code | `.claude/CLAUDE.md` |
| Codex | `AGENTS.md` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Cursor | `.cursor/rules/agentsmyth.mdc` |
| Windsurf | `.windsurfrules` |

### Config Files

Five YAML files in `workflow/config/` capture repo-specific context written by the agent during setup:

| File | Purpose |
|---|---|
| `domain.yaml` | Project domain, tech stack, key terminology |
| `repo-profile.yaml` | Repo shape, primary language, monorepo/single-repo |
| `source-of-truth.yaml` | Authoritative sources for requirements and decisions |
| `release.yaml` | Release process, environments, deployment targets |
| `verification.yaml` | Testing strategy, coverage expectations, CI commands |

`agent-behavior.yaml` lives in the shared definitions tree at `~/.agentsmyth/workflow/`, is identical for every repo, and is never written by setup or edited by consumers.

## Guardrails

- Do not make a provider, CI system, package manager, deployment process, or external source mandatory unless config or the user requires it.
- Do not claim commands, external updates, releases, PRs, CI, or handoffs without evidence.
- Treat skipped checks and waivers as visible risk.
- Treat validators as contract checks. They support review, but they do not replace code tests, manual QA, release evidence, or human judgment.

## Development (this repo)

This section is about `agentsmyth`'s own source repository, not what gets installed into a consumer repo.

- Setup skill in `src/setup/` — one-time porting that configures a new target repo.
- Lifecycle router and phase contracts in `src/workflow/router.md` and `src/workflow/lifecycle.md`.
- Phase skills in `src/workflow/skills/`.
- Artifact Starter Blocks in each skill's `references/output-schema.md`.
- Behavior config in `src/workflow/agent-behavior.yaml`.
- YAML schema contracts in `src/workflow/schemas/`.
- Optional tool adapters in `src/adapters/` — one per supported AI tool.

The `src/` tree is compiled into `dist/` bundles by `npm run build`. Consumers receive `workflow/` (the compiled, expanded install) — not the raw `src/`.

Build bundles and run all checks:

```bash
npm run build       # rebuild dist/ bundles and sync generated assets
npm run validate    # validate-template + validate-example + render-adapters
npm run violations:test  # confirm all violation fixtures are rejected
```

Run individual dev validators (source-level validators need `AGENTSMYTH_WF=src/workflow`):

```bash
AGENTSMYTH_WF=src/workflow node src/workflow/validators/check-starter-blocks.mjs
AGENTSMYTH_WF=src/workflow node src/workflow/validators/check-lifecycle.mjs
node src/workflow/validators/check-artifacts.mjs
node src/workflow/validators/check-domain-placeholders.mjs
```

Source lives in `src/`; dev workspace is `workflow/` at repo root. Never confuse them.
