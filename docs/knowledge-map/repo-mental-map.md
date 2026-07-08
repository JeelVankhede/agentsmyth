# Repo Mental Map

An AI agent running any lifecycle skill should load this file to orient itself before
touching the repository. This is the knowledge base for **contributing to agentsmyth
itself** (the dev repo), not for consumer repos that installed it.

---

## What This Repo Does

agentsmyth is a portable AI engineering lifecycle, shipped as an npm package
(`@jeelvankhede/agentsmyth`). Consumers run `npx agentsmyth init`; an agent then ports a
gated 7-phase workflow (`brief → plan → task → review → verify → ship → reflect`) into their
repo, enforced by on-disk artifacts, config, and validators. It is a template and workflow
contract — **not** an application, service, or project scaffolder. Zero runtime dependencies.

The primary consumers are AI coding agents (Claude Code, Codex, Copilot, Cursor, Windsurf)
and the engineers who direct them.

---

## Source-of-Truth Hierarchy

Higher overrides lower. When a higher source is silent, fall to the next — never invent state.

1. The current user request and any answer the user gives to a blocker.
2. `src/workflow/` — canonical workflow rules, lifecycle order, phase contracts, config.
3. `AGENTS.md` — the agent router for this repo (source priority + context-load order).
4. This file (`docs/knowledge-map/repo-mental-map.md`) — repo orientation.
5. Repository code and existing lifecycle artifacts for the active slug.

There is no external issue tracker configured; requirements arrive via user request and the
planning history is not retained in the repo.

---

## Key Paths

| Path | What lives here |
|---|---|
| `src/workflow/` | **Source** workflow tree — compiled into the shipped bundle |
| `src/workflow/router.md` / `lifecycle.md` / `rules.md` / `glossary.md` | Orchestration core |
| `src/workflow/skills/lifecycle-*/` | 7 phase skills — `SKILL.md` + granular `references/*.md` |
| `src/workflow/skills/{decompose-requirements,dispatch-subagents,restore-context,lifecycle-orchestrator}/` | 4 power skills |
| `src/workflow/agent-behavior.yaml` | Shipped invariant: task classes, artifact chain, evidence policy, waivers |
| `src/workflow/schemas/` | YAML-schema contracts for configs and artifacts (source of truth) |
| `src/workflow/validators/` | Source validators; `lib.mjs` holds the YAML parser + schema engine |
| `src/setup/` | One-time porting skill run in the consumer repo; not a phase itself |
| `src/adapters/` | Five tool gate shims (source of truth for the mandatory gate) |
| `src/assets/` | Static package payload (adapters copy + placeholder configs + AGENTS.md) |
| `scripts/build-bundle.mjs` | Compiles `src/workflow/` + `src/setup/` → `dist/` bundles |
| `bin/agentsmyth.mjs` | The `init` CLI — copies payload into `.agentsmyth/`, nothing more |
| `workflow/config/` | This repo's own per-repo lifecycle config (not shipped) |
| `workflow/artifacts/` | This repo's dogfood lifecycle artifacts (not shipped) |
| `workflow/learnings/` | Curated retros and session notes (not shipped) |
| `workflow/schemas/` | Build-synced schema copy for dev validator use (gitignored) |
| `dist/`, `validators/` (root) | **Generated** build output (gitignored) |
| `src/assets/adapters/` | **Generated** adapter copy (gitignored) — source is `src/adapters/` |
| `examples/` | Three worked consumer repos, verified by `validate-example.mjs` |
| `docs/` | `overview.md` + `knowledge-map/` — living orientation only |

---

## Protected Paths

- `src/workflow/agent-behavior.yaml` — a shipped **invariant** (task classes, artifact
  chain, evidence policy, waiver schema). Changing it changes every consumer's contract.
  Requires explicit discussion.
- `src/workflow/validators/lib.mjs` — the source/shipped world-detection line. The dotted
  string is deliberately constructed so consumer copies stay clean. Do not hardcode `.workflow`.
- `src/workflow/schemas/` — schema contracts. Editing one can invalidate existing artifacts.

---

## Verification Defaults

```bash
# build (compile source into dist/ bundles + refresh generated assets)
npm run build

# full validation (template + examples + adapter render check)
npm run validate

# negative test suite — each fixture must be rejected by check-artifacts
npm run violations:test

# individual dev validators (AGENTSMYTH_WF=src/workflow points them at source)
AGENTSMYTH_WF=src/workflow node src/workflow/validators/check-starter-blocks.mjs
AGENTSMYTH_WF=src/workflow node src/workflow/validators/check-lifecycle.mjs   # --phase <name> --slug <slug> for gate check
node src/workflow/validators/check-artifacts.mjs                               # checks workflow/artifacts/ by default
node src/workflow/validators/check-artifacts.mjs --dir <path>                  # custom artifacts dir (fixture testing)
node src/workflow/validators/check-domain-placeholders.mjs
```

There is no unit-test suite; validators are the automated contract layer. Behavioral
confidence comes from the smoke test (`npx . init` in a clean temp repo) and manual QA.

---

## Planning Rules

- **Never edit generated output.** `dist/`, root `validators/`, `src/assets/adapters/`, and
  `workflow/schemas/` are build products. Edit source (`src/workflow/`, `src/setup/`,
  `src/adapters/`, `scripts/`), then rebuild.
- **Rebuild after source changes.** Any `src/workflow/`, `src/setup/`, or `src/adapters/`
  edit must be followed by `npm run build` or the shipped bundle drifts from source.
- **Keep all five adapters in sync.** The mandatory-gate content is identical across them.
- **Branch for planned changes.** Do not commit to `main` without approval. Push only when asked.
- **Dogfood the lifecycle.** Standard/Complex work goes through `AGENTS.md` →
  `src/workflow/router.md` with artifacts under `workflow/artifacts/`.

---

## Known Risks and Non-Goals

- **Do not add runtime dependencies.** The zero-dep hand-rolled stack (CLI, YAML parser,
  schema validator) is a deliberate invariant. New deps need a brief review first.
- **Enforcement is prompt-level, not hard.** Nothing runs outside the model to block a
  non-compliant tool call; validators are retrospective (catch drift after artifacts exist).
  A git pre-commit hook running `check-lifecycle --phase` is the tracked mitigation (WP-R1) —
  do not assume the gate is unskippable today.
- **Not a scaffolder (yet).** agentsmyth installs a workflow into an existing repo. Public
  starter bootstrapping (fare/bare) is a deferred roadmap item, not current behavior.
- **Source vs. workspace confusion is the top failure mode.** Source lives in `src/`; dev
  workspace lives in `workflow/` at repo root. Never write workflow phase artifacts into
  `src/workflow/` — that would ship them to consumers.
