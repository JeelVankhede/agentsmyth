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

## The one model you must hold: source vs. shipped

Everything hinges on a two-world split. Get this wrong and you will edit the wrong file.

| | **Source (this repo)** | **Shipped (consumer repo)** |
|---|---|---|
| Workflow dir | `.workflow/` (dotted) | `workflow/` (undotted) |
| Authored by | Hand, in this repo | Generated, expanded by the agent |
| Adapters | `adapters/` | placed at tool-native path (`.claude/CLAUDE.md`, etc.) |
| Configs | `.workflow/config/` (this repo's own) | `workflow/config/` (consumer's, agent-filled) |

- `scripts/build-bundle.mjs` compiles `.workflow/` → `dist/workflow-bundle.md` (FILE-marker
  blocks the agent expands) and `setup/` → `dist/setup-bundle.md`.
- `bin/agentsmyth.mjs` copies `dist/` + `assets/` + `validators/` into the consumer's
  `.agentsmyth/`, then the **agent** does all real setup work (see `setup/SKILL.md`).
- `validators/lib.mjs:9` auto-detects which world it runs in. The dotted string is
  *constructed* (`['.','workflow'].join('')`) so the consumer copy never contains a literal
  `.workflow` reference. Preserve that trick if you touch it.

---

## Golden rules (also see `docs/knowledge-map/repo-mental-map.md` → Planning Rules)

1. **Edit source, never generated output.** `dist/`, `validators/` (root), and
   `assets/adapters/` are build products. Edit `.workflow/`, `setup/`, `adapters/`,
   `scripts/` — then rebuild.
2. **Rebuild after any `.workflow/`, `setup/`, or `adapters/` change:** `npm run build`.
   A change to source without a rebuild ships stale bundles.
3. **Keep adapters in sync.** All five adapters (`claude`, `codex`, `copilot`, `cursor`,
   `windsurf`) must carry the same mandatory-gate content. Change one → change all.
4. **No runtime dependencies.** Do not add npm deps for parsing, validation, or CLI. The
   zero-dep, hand-rolled stack is a deliberate invariant.
5. **Validators are contract checks, not tests.** Run `npm run validate` before shipping.
   They check structure/schema, not behavior — they do not replace manual verification.
6. **Dogfood the lifecycle.** This repo uses its own workflow. For Standard/Complex work,
   go through `AGENTS.md` → `.workflow/router.md` and write artifacts under
   `.workflow/artifacts/`. Trivial changes (typo, single-location) skip the chain.
7. **Evidence over claims.** Never claim a command passed, a release shipped, or CI is green
   without current tool output or a cited artifact. Treat skipped checks as visible risk.
8. **Branch, don't push to main.** Use a non-default branch for planned changes unless the
   user says otherwise. Commit/push only when asked.

---

## Where things live (fast map)

| Path | Role |
|---|---|
| `.workflow/router.md`, `lifecycle.md`, `rules.md` | Orchestration core |
| `.workflow/skills/lifecycle-*/` | 7 phase skills (SKILL.md + references/) |
| `.workflow/skills/{decompose-requirements,dispatch-subagents,restore-context,lifecycle-orchestrator}/` | 4 power skills |
| `.workflow/config/agent-behavior.yaml` | Shipped invariant: task classes, chain, evidence, waivers |
| `.workflow/schemas/` | YAML-schema contracts |
| `.workflow/validators/` | Source validators (`lib.mjs` = parser + schema engine) |
| `setup/SKILL.md` | The one-time porting skill the agent runs in a consumer repo |
| `scripts/build-bundle.mjs` | Source → `dist/` compiler |
| `bin/agentsmyth.mjs` | The `init` CLI |
| `adapters/` | Five tool gate shims (source of truth for gates) |
| `examples/` | Three worked repos, checked by `validate-example.mjs` |
| `docs/`, `docs/archive/` | Human docs; archive holds planning history |

---

## Before you finish any change

- [ ] Edited **source**, not generated output.
- [ ] Ran `npm run build` if `.workflow/`, `setup/`, or `adapters/` changed.
- [ ] Ran `npm run validate` and it passed.
- [ ] Adapters still in sync if a gate changed.
- [ ] No new runtime dependency introduced.
- [ ] Standard/Complex work has its artifact chain under `.workflow/artifacts/`.
