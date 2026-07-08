# CLAUDE.md — Contributing to agentsmyth

This file is for Claude Code (and any agent) **working on the agentsmyth project itself** —
not for consumer repos that have installed agentsmyth. Read it before making changes.

For the full picture, load `docs/knowledge-map/repo-mental-map.md` (repo knowledge) and
`AGENTS.md` (the lifecycle router — this repo dogfoods its own workflow).

---

## What this repo is

agentsmyth is a **portable AI lifecycle workflow shipped as an npm package**. It is a
*template and workflow contract*, not an application and not a scaffolder. A consumer runs
`npx agentsmyth init`, an agent drives a one-time setup, and their repo gains a gated
7-phase engineering lifecycle (`brief → plan → task → review → verify → ship → reflect`)
enforced through on-disk artifacts and validators.

There is **no runtime service and no external dependencies** — the CLI, YAML parser, schema
validator, and all validators are hand-written Node ESM. Keep it that way (see Rules).

---

## The one model you must hold: source vs. workspace vs. global

Everything hinges on a three-world split. Get this wrong and you will edit the wrong file.

| | **Source (`src/`)** | **Dev workspace (`workflow/`)** | **Shipped (consumer repo)** | **Global install (`~/.agentsmyth/`)** |
|---|---|---|---|---|
| Workflow skills/schemas/validators | `src/workflow/` | — | `workflow/` (expanded from bundle) | `~/.agentsmyth/workflow/` (same bundle, expanded by `--system`) |
| Adapters (per-repo) | `src/adapters/` | — | placed at tool-native path | — |
| Adapters (global gate) | `src/adapters/*/global-gate.md` | — | — | installed to tool-native global path by `--system` |
| Static assets | `src/assets/` | — | `.agentsmyth/assets/` | — |
| Setup skill | `src/setup/` | — | `.agentsmyth/` (then deleted) | — |
| Behavior config | `src/workflow/agent-behavior.yaml` | — | `workflow/agent-behavior.yaml` | `~/.agentsmyth/workflow/agent-behavior.yaml` |
| Per-repo config | — | `workflow/config/` (domain, repo-profile…) | `workflow/config/` (agent-filled) | — (always repo-local) |
| Artifacts | — | `workflow/artifacts/` | `workflow/artifacts/` | — |
| Learnings | — | `workflow/learnings/` | — | — |

- `scripts/build-bundle.mjs` compiles `src/workflow/` → `dist/workflow-bundle.md` (FILE-marker
  blocks the agent expands) and `src/setup/` → `dist/setup-bundle.md`. Also syncs
  `src/workflow/schemas/` → `workflow/schemas/` so dev-workspace validators can find them.
- `bin/agentsmyth.mjs` copies `dist/` + `src/assets/` + `validators/` into the consumer's
  `.agentsmyth/`, then the **agent** does all real setup work (see `src/setup/SKILL.md`).
  With `--system`, it expands `dist/workflow-bundle.md` → `~/.agentsmyth/workflow/`, installs
  global gate files into each AI tool's global config, and writes `definitions_root` into
  `workflow/config/repo-profile.yaml`.
- `src/workflow/validators/lib.mjs` uses a two-root resolver: `definitions_root` in
  `repo-profile.yaml` → `AGENTSMYTH_HOME` env → repo-local fallback. The dotted string is
  *constructed* (`['.','workflow'].join('')`) so the consumer copy never contains a literal
  `.workflow` reference. Preserve that trick if you touch it.
- Build scripts pass `AGENTSMYTH_WF=src/workflow` when running source-level validators so they
  check `src/workflow/` instead of the dev workspace `workflow/`.

---

## Golden rules (also see `docs/knowledge-map/repo-mental-map.md` → Planning Rules)

1. **Edit source, never generated output.** `dist/`, `validators/` (root), `src/assets/adapters/`,
   and `workflow/schemas/` are build products. Edit `src/workflow/`, `src/setup/`, `src/adapters/`,
   `scripts/` — then rebuild.
2. **Rebuild after any `src/workflow/`, `src/setup/`, or `src/adapters/` change:** `npm run build`.
   A change to source without a rebuild ships stale bundles.
3. **Keep adapters in sync.** All five adapters (`claude`, `codex`, `copilot`, `cursor`,
   `windsurf`) must carry the same mandatory-gate content. Change one → change all.
4. **No runtime dependencies.** Do not add npm deps for parsing, validation, or CLI. The
   zero-dep, hand-rolled stack is a deliberate invariant.
5. **Validators are contract checks, not tests.** Run `npm run validate` before shipping.
   They check structure/schema, not behavior — they do not replace manual verification.
6. **Dogfood the lifecycle.** This repo uses its own workflow. For Standard/Complex work,
   go through `AGENTS.md` → `src/workflow/router.md` and write artifacts under
   `workflow/artifacts/`. Trivial changes (typo, single-location) skip the chain.
7. **Evidence over claims.** Never claim a command passed, a release shipped, or CI is green
   without current tool output or a cited artifact. Treat skipped checks as visible risk.
8. **Branch, don't push to main.** Use a non-default branch for planned changes unless the
   user says otherwise. Commit/push only when asked.

---

## Where things live (fast map)

| Path | Role |
|---|---|
| `src/workflow/router.md`, `lifecycle.md`, `rules.md` | Orchestration core |
| `src/workflow/skills/lifecycle-*/` | 7 phase skills (SKILL.md + references/) |
| `src/workflow/skills/{decompose-requirements,dispatch-subagents,restore-context,lifecycle-orchestrator}/` | 4 power skills |
| `src/workflow/agent-behavior.yaml` | Shipped invariant: task classes, chain, evidence, waivers |
| `src/workflow/schemas/` | YAML-schema contracts (source of truth) |
| `src/workflow/validators/` | Source validators (`lib.mjs` = parser + schema engine) |
| `src/setup/SKILL.md` | The one-time porting skill the agent runs in a consumer repo |
| `scripts/build-bundle.mjs` | Source → `dist/` compiler |
| `bin/agentsmyth.mjs` | The `init` CLI |
| `src/adapters/` | Five tool gate shims (source of truth for gates) |
| `examples/` | Three worked repos, checked by `validate-example.mjs` |
| `docs/` | `overview.md` + `knowledge-map/` — living orientation only |
| `workflow/config/` | This repo's own per-repo lifecycle config (not shipped) |
| `workflow/artifacts/` | This repo's dogfood lifecycle artifacts (not shipped) |
| `workflow/schemas/` | Build-synced copy for dev validator use (gitignored) |

---

## Before you finish any change

- [ ] Edited **source** (`src/`), not generated output.
- [ ] Ran `npm run build` if `src/workflow/`, `src/setup/`, or `src/adapters/` changed.
- [ ] Ran `npm run validate` and it passed.
- [ ] Ran `npm run violations:test` and it passed (all 4 fixtures rejected).
- [ ] Adapters still in sync if a gate changed.
- [ ] No new runtime dependency introduced.
- [ ] Standard/Complex work has its artifact chain under `workflow/artifacts/`.
