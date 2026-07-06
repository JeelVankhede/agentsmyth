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
2. `.workflow/` — canonical workflow rules, lifecycle order, phase contracts, config.
3. `AGENTS.md` — the agent router for this repo (source priority + context-load order).
4. This file (`docs/knowledge-map/repo-mental-map.md`) — repo orientation.
5. Repository code and existing lifecycle artifacts for the active slug.

There is no external issue tracker configured; requirements arrive via user request and the
planning history is not retained in the repo.

---

## Key Paths

| Path | What lives here |
|---|---|
| `.workflow/` | **Source** workflow tree (dotted). Compiled into the shipped bundle. |
| `.workflow/router.md` / `lifecycle.md` / `rules.md` / `glossary.md` | Orchestration core |
| `.workflow/skills/lifecycle-*/` | 7 phase skills — `SKILL.md` + granular `references/*.md` |
| `.workflow/skills/{decompose-requirements,dispatch-subagents,restore-context,lifecycle-orchestrator}/` | 4 power skills |
| `.workflow/config/` | This repo's own config (agent-behavior is a shipped invariant) |
| `.workflow/schemas/` | YAML-schema contracts for configs and artifacts |
| `.workflow/validators/` | Source validators; `lib.mjs` holds the YAML parser + schema engine |
| `.workflow/artifacts/` | This repo's own lifecycle artifacts (dogfooding) |
| `setup/` | One-time porting skill run in the consumer repo; **not** shipped to it as a phase |
| `scripts/build-bundle.mjs` | Compiles `.workflow/` + `setup/` → `dist/` bundles |
| `bin/agentsmyth.mjs` | The `init` CLI — copies payload into `.agentsmyth/`, nothing more |
| `adapters/` | Five tool gate shims (source of truth for the mandatory gate) |
| `assets/` | Static package payload (adapters copy + placeholder configs + AGENTS.md) |
| `dist/`, `validators/` (root) | **Generated** build output (gitignored) |
| `examples/` | Three worked consumer repos, verified by `validate-example.mjs` |
| `docs/` | `overview.md` + `knowledge-map/` — living orientation only |

---

## Protected Paths

- `.workflow/config/agent-behavior.yaml` — a shipped **invariant** (task classes, artifact
  chain, evidence policy, waiver schema). Changing it changes every consumer's contract.
  Requires explicit discussion.
- `validators/lib.mjs:9` — the source/shipped world-detection line. The dotted string is
  deliberately constructed so consumer copies stay clean. Do not hardcode `.workflow`.
- `.workflow/schemas/` — schema contracts. Editing one can invalidate existing artifacts.

---

## Verification Defaults

```bash
# build (compile source into dist/ bundles + refresh generated assets)
npm run build

# full validation (template + examples + adapter render check)
npm run validate

# negative test suite — each fixture must be rejected by check-artifacts
npm run violations:test

# individual dev validators
node .workflow/validators/check-starter-blocks.mjs
node .workflow/validators/check-lifecycle.mjs           # add --phase <name> --slug <slug> for gate check
node .workflow/validators/check-artifacts.mjs           # add --dir <path> to scan a custom artifacts dir
node .workflow/validators/check-domain-placeholders.mjs
```

There is no unit-test suite; validators are the automated contract layer. Behavioral
confidence comes from the smoke test (`npx . init` in a clean temp repo) and manual QA.

---

## Planning Rules

- **Never edit generated output.** `dist/`, root `validators/`, and `assets/adapters/` are
  build products. Edit source (`.workflow/`, `setup/`, `adapters/`, `scripts/`), then rebuild.
- **Rebuild after source changes.** Any `.workflow/`, `setup/`, or `adapters/` edit must be
  followed by `npm run build` or the shipped bundle drifts from source.
- **Keep all five adapters in sync.** The mandatory-gate content is identical across them.
- **Branch for planned changes.** Do not commit to `main` without approval. Push only when asked.
- **Dogfood the lifecycle.** Standard/Complex work goes through `AGENTS.md` →
  `.workflow/router.md` with artifacts under `.workflow/artifacts/`.

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
- **Source vs. shipped confusion is the top failure mode.** Always confirm whether you are in
  the dotted (`.workflow/`) source world or the undotted (`workflow/`) consumer world.
