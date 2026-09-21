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

## Where it fits

You are not choosing between agentsmyth and nothing. **[GitHub Spec Kit](https://github.com/github/spec-kit)** (GitHub-backed), **[BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD)**, **[claude-task-master](https://github.com/eyaltoledano/claude-task-master)**, and **[agentpreflight](https://agent-preflight.szybnev.cc/)** already give an AI agent structure to work inside, and every one of them is free. The honest question is what agentsmyth does that they don't.

They shape the **prompt** — the instructions, personas, and task breakdowns you feed the agent. agentsmyth shapes the **lifecycle**, mechanically. Each phase reads and writes a durable artifact on disk, and a schema validator gates the move to the next phase: no approved brief, no plan; no plan, no build; a missing requirement ID or a claim with no evidence fails the check and the phase does not advance. That structure does not rely on the model remembering to follow it, because it is enforced outside the model — in files you can read and a validator that exits non-zero. Prompted structure degrades the moment the context window turns over or a different agent picks up the work; on-disk, validated structure does not. That is the whole bet.

Here is that validator refusing a commit. The plan artifact declares itself ready for Build; the gate
checks whether a human ever approved it, disagrees, and stops the commit:

<!-- agentsmyth:capture BEGIN -->
```console
$ git commit -m "plan: session handling"
all staged files are safe (workflow/docs/config or Markdown) — nothing to gate
check-commit-coverage: ok
  adapters present: AGENTS.md
check-setup-complete: ok
build: workflow/artifacts/plans/add-session-handling-v1.md → ready-for-next-phase ✓
check-lifecycle --phase build --slug add-session-handling: failed with 1 issue(s)
- build: upstream workflow/artifacts/plans/add-session-handling-v1.md's checkpoint "plan-review" is not marked approved (status: "pending").
$ echo $?
1
```
<!-- agentsmyth:capture END -->

That block is generated, not written. `npm run capture:gate` rebuilds a throwaway consumer repo,
provokes the refusal, and rewrites the text above with whatever actually came back — and it fails
loudly if the gate ever lets that commit through.

### Compared with Spec Kit, in file paths

Adjectives are cheap, so here are the specifics. Every claim below was checked against
[`github/spec-kit`](https://github.com/github/spec-kit) at commit
[`1d5106f`](https://github.com/github/spec-kit/tree/1d5106f59e1b148ee23ab136638932dd790ff1b6) — pinned,
because `main` moves and a claim that cannot be re-checked is just another assertion.

| What | Spec Kit at `1d5106f` | agentsmyth |
|---|---|---|
| Prerequisite checking | [`scripts/bash/check-prerequisites.sh`](https://github.com/github/spec-kit/blob/1d5106f59e1b148ee23ab136638932dd790ff1b6/scripts/bash/check-prerequisites.sh) gates on **existence** — `[[ ! -f "$IMPL_PLAN" ]]`, `[[ ! -d "$FEATURE_DIR" ]]` — and never opens the artifacts it gates on | Validators parse each artifact and check its contents: manifest IDs, acceptance criteria, evidence citations, checkpoint approval |
| Cross-artifact analysis | [`templates/commands/analyze.md`](https://github.com/github/spec-kit/blob/1d5106f59e1b148ee23ab136638932dd790ff1b6/templates/commands/analyze.md) is **"STRICTLY READ-ONLY"** and offers remediation — "Do NOT apply them automatically" | Review writes a findings artifact with dispositions; unresolved findings block the next phase |
| The gate before implementation | [`templates/commands/implement.md`](https://github.com/github/spec-kit/blob/1d5106f59e1b148ee23ab136638932dd790ff1b6/templates/commands/implement.md) asks: *"Some checklists have unchecked items. Do you want to proceed with implementation anyway? (yes/no)"* | `git commit` exits non-zero. There is no prompt to answer |
| Where enforcement lives | Agent-side hooks the model is instructed to honour — `.specify/extensions.yml`, `.cursor/hooks.json` and friends. The template's own words: *"you MUST actually invoke the hook"* | A `.git/hooks/pre-commit` that git runs, whether or not the agent cooperates |

The distinction that matters is the last row, and it is narrower than "hooks versus no hooks" — Spec Kit
installs plenty of hooks. Theirs are **agent-dispatched**: instructions a cooperating model executes.
Ours is **git-enforced**: the commit is rejected by a process that never consults the model at all.
Both are real; they fail differently. An instruction degrades when the context window turns over, the
model is swapped, or someone is in a hurry. A non-zero exit code does not.

**Where Spec Kit is straightforwardly better:** its requirements engineering is deeper than ours.
`analyze.md` carries duplication and ambiguity detection, a requirement-to-task coverage map, a
constitution-alignment pass, and a severity model that separates a CRITICAL constitution violation from
a LOW wording nit. agentsmyth's Think phase has nothing of that sophistication — it structures the
questions and records the evidence, then trusts the model. If your problem is *"my specs are vague"*,
Spec Kit is the more developed tool and you should use it. If your problem is *"my agent skipped the
plan and shipped anyway"*, that is the one this solves.

### Why there's no paid tier

agentsmyth is free, and that is a decision, not a placeholder for a paywall arriving later. Every tool named above is free too, and a workflow made of Markdown skills can't meaningfully be content-gated anyway — an agent has to read the plaintext at inference time, so "locking" it buys friction and nothing else. So the whole workflow ships in the open, community-first. If a paid surface ever appears it will be a real service — hosted validation, support — never a wall around the skills you already have.

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

`agentsmyth prepare` (which `init` runs automatically) installs a typed command in every
supported tool: `/agentsmyth` in Claude Code, Cursor, Windsurf, and Copilot (VS Code), or
`/prompts:agentsmyth` in Codex. Open your AI agent in the target repo and type it:

```
/agentsmyth
```

Plain-English phrasing like "run the agentsmyth setup" usually works too, but an agent can skip
a freeform instruction it doesn't recognize as a trigger — a typed command is resolved directly
by the tool instead, so it can't be silently skipped the same way.

The agent reads `setup-bundle.md` and runs a **resolution pass**, not a from-scratch interview:
it resolves `pending-setup.yaml`'s open items (inspecting the repo first, asking only what's
left), fills in the remaining `<USER-TODO>` fields in the config files `init` already wrote,
places the adapter for whichever of the other three tools (Claude Code, Codex, Windsurf) you
use — Copilot is already covered either by the global gate (macOS) or by `init`'s mechanical
placement (non-macOS) — and removes `.agentsmyth/` when done.

### What ends up in the target repo

`init` links the repo to a shared, machine-wide definitions install rather than copying the
workflow tree into every repo — this is the default outcome, not an opt-in:

```
workflow/
  config/          ← init writes stubs; the agent resolves what's left
  artifacts/       ← lifecycle artifact chain lives here
  learnings/
.claude/CLAUDE.md  ← or AGENTS.md / .cursor/rules/ etc. depending on your tool
docs/knowledge-map/repo-mental-map.md

~/.agentsmyth/workflow/   router.md, lifecycle.md, rules.md, glossary.md, skills/,
                          validators/, schemas/ — one shared copy per machine
```

Router, lifecycle, rules, glossary, skills, validators, and schemas resolve from
`~/.agentsmyth/workflow/` at runtime instead of being copied per repo — see
[Under the hood](https://jeelvankhede.github.io/agentsmyth/under-hood) for why. A repo-local copy
of all of those only appears in the defensive fallback case (no global install could be linked),
which should not normally happen.

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

Run individual dev validators — every validator imports the shared resolver in
`src/workflow/validators/lib.mjs`, which needs `AGENTSMYTH_WF=src/workflow` to check source
directly instead of falling back to a global install that may not exist on your machine:

```bash
AGENTSMYTH_WF=src/workflow node src/workflow/validators/check-starter-blocks.mjs
AGENTSMYTH_WF=src/workflow node src/workflow/validators/check-lifecycle.mjs
AGENTSMYTH_WF=src/workflow node src/workflow/validators/check-artifacts.mjs
AGENTSMYTH_WF=src/workflow node src/workflow/validators/check-domain-placeholders.mjs
```

Source lives in `src/`; dev workspace is `workflow/` at repo root. Never confuse them.
