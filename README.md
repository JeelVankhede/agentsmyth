# agentsmyth

Portable AI lifecycle workflow — drop into any repo and let your agent drive structured, evidence-based engineering.

`agentsmyth` gives AI agents a durable engineering workflow for a single repository. It turns requests into lifecycle artifacts, keeps decisions inspectable, and makes verification, release, handoff, and reflection evidence explicit.

The canonical workflow source is `.workflow/`. Consumer repos receive it as `workflow/` after setup.

## What Is Included

- One-time porting skill in `setup/` — use this to configure a new target repository.
- Lifecycle router and phase contracts in `.workflow/router.md` and `.workflow/lifecycle.md`.
- Phase skills in `.workflow/skills/`.
- Artifact Starter Blocks in each skill's `references/output-schema.md`.
- Config defaults in `.workflow/config/`.
- YAML schema contracts in `.workflow/schemas/`.
- Optional tool adapters in `adapters/` — one per supported AI tool.

`setup/` is a one-time tool for porting. It is not copied to the target repository.

## Lifecycle

```text
brief -> plan -> task -> review -> verify -> ship -> reflect
```

Each Standard or Complex change leaves a readable artifact chain under `workflow/artifacts/`. The artifacts preserve requirement IDs, blockers, architecture notes, command evidence, skipped-check risk, release status, and follow-up decisions.

## Project Knowledge

### Lifecycle Phases

agentsmyth enforces a 7-phase artifact chain. Each Standard or Complex task produces one artifact per phase under `workflow/artifacts/<slug>/`:

| Phase | What happens |
|---|---|
| `brief` | Requirements captured, scope and complexity classified |
| `plan` | Architecture decisions, implementation plan, verification criteria |
| `task` | Active implementation tracked against the plan |
| `review` | Code review against the plan's manifest and requirements |
| `verify` | Commands run, evidence recorded against the verification plan |
| `ship` | Release checklist, risk sign-off, deployment evidence |
| `reflect` | Post-ship learnings, open follow-ups |

Trivial changes (typo fixes, small config edits) are exempt from the full chain. The router (`workflow/router.md`) classifies each request on arrival.

### Adapters

agentsmyth supports five AI tools out of the box. During setup, the agent places the correct adapter at the tool's native path:

| Tool | Adapter path |
|---|---|
| Claude Code | `.claude/CLAUDE.md` |
| Codex | `AGENTS.md` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Cursor | `.cursor/rules/index.mdc` |
| Windsurf | `.windsurfrules` |

### Config Files

Six YAML files in `workflow/config/` capture repo-specific context written by the agent during setup:

| File | Purpose |
|---|---|
| `domain.yaml` | Project domain, tech stack, key terminology |
| `repo-profile.yaml` | Repo shape, primary language, monorepo/single-repo |
| `source-of-truth.yaml` | Authoritative sources for requirements and decisions |
| `agent-behavior.yaml` | Enforcement rules, compliance stance, waiver policy |
| `release.yaml` | Release process, environments, deployment targets |
| `verification.yaml` | Testing strategy, coverage expectations, CI commands |

## Setup

### Option A — Run directly from GitHub (no install)

```bash
npx github:JeelVankhede/agentsmyth init
```

This fetches the latest package from the repo and runs `init` without installing anything permanently.

### Option B — Install from a GitHub Release tarball

Download the `.tgz` from the [Releases](../../releases) page, then:

```bash
npm install --save-dev file:./jeelvankhede-agentsmyth-<version>.tgz
npx agentsmyth init
```

### Option C — Local development build

From this repo root:

```bash
npm run build       # rebuild dist/ bundles
npm pack            # produces jeelvankhede-agentsmyth-<version>.tgz
```

Then install in a target repo as in Option B.

### What `init` does

`npx agentsmyth init` creates `.agentsmyth/` in the target repo root containing:
- `setup-bundle.md` — the setup skill the agent reads to drive onboarding
- `workflow-bundle.md` — the full workflow (router, lifecycle, all skills) the agent expands
- `validators/` — health-check scripts
- `assets/` — adapter shims and default config files

`.agentsmyth/` is added to `.gitignore` automatically. It is temporary — the agent removes it after setup.

### Running setup

Open your AI agent in the target repo and say:

```
run the agentsmyth setup
```

The agent reads `setup-bundle.md`, inspects the repo, interviews you about domain and config, writes `workflow/config/*.yaml`, places the adapter at your tool's native path, expands the workflow tree under `workflow/`, and removes `.agentsmyth/` when done.

### What ends up in the target repo

```
workflow/
  config/          ← agent fills these during setup
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

## Development (this repo)

Build bundles and run all checks:

```bash
npm run build       # rebuild dist/ bundles and assets/
npm run validate    # validate-template + validate-example + render-adapters
```

Run individual dev validators:

```bash
node .workflow/validators/check-starter-blocks.mjs
node .workflow/validators/check-lifecycle.mjs
node .workflow/validators/check-artifacts.mjs
node .workflow/validators/check-domain-placeholders.mjs
```

## Guardrails

- Keep `.workflow/` canonical in this dev repo. Consumer repos get the compiled output.
- Do not make a provider, CI system, package manager, deployment process, or external source mandatory unless config or the user requires it.
- Do not claim commands, external updates, releases, PRs, CI, or handoffs without evidence.
- Treat skipped checks and waivers as visible risk.
- Treat validators as contract checks. They support review, but they do not replace code tests, manual QA, release evidence, or human judgment.
