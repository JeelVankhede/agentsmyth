# agentsmyth

Portable AI lifecycle workflow — drop into any repo and let your agent drive structured, evidence-based engineering.

`agentsmyth` gives AI agents a durable engineering workflow for a single repository. It turns requests into lifecycle artifacts, keeps decisions inspectable, and makes verification, release, handoff, and reflection evidence explicit.

## What Is Included

- Setup skill in `src/setup/` — one-time porting that configures a new target repo.
- Lifecycle router and phase contracts in `src/workflow/router.md` and `src/workflow/lifecycle.md`.
- Phase skills in `src/workflow/skills/`.
- Artifact Starter Blocks in each skill's `references/output-schema.md`.
- Behavior config in `src/workflow/agent-behavior.yaml`.
- YAML schema contracts in `src/workflow/schemas/`.
- Optional tool adapters in `src/adapters/` — one per supported AI tool.

The `src/` tree is compiled into `dist/` bundles by `npm run build`. Consumers receive `workflow/` (the compiled, expanded install) — not the raw `src/`.

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

## Development (this repo)

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

## Guardrails

- Source lives in `src/`; dev workspace is `workflow/` at repo root. Never confuse them.
- Do not make a provider, CI system, package manager, deployment process, or external source mandatory unless config or the user requires it.
- Do not claim commands, external updates, releases, PRs, CI, or handoffs without evidence.
- Treat skipped checks and waivers as visible risk.
- Treat validators as contract checks. They support review, but they do not replace code tests, manual QA, release evidence, or human judgment.
