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
| `bin/agentsmyth.mjs` | The CLI — `prepare` expands the bundle to `~/.agentsmyth/` (global-only, no repo write); `init` copies payload into `.agentsmyth/` and links the repo to the global install (auto-running `prepare` first if needed) |
| `src/adapters/*/global-gate.md` | Token-free global gate templates installed by `prepare` to tool-native global paths |
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
AGENTSMYTH_WF=src/workflow agentsmyth check --phase <name> --slug <slug>      # lifecycle phase gate (resolves via two-root resolver)
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

## Two-Root Resolver (WP-R2)

`src/workflow/validators/lib.mjs` resolves two roots at module load time:

- **`defsRoot`** — where skills, schemas, validators, and `agent-behavior.yaml` live.
  Resolution order: `definitions_root` in `workflow/config/repo-profile.yaml` →
  `AGENTSMYTH_HOME` environment variable → repo-local `workflow/` (backward-compat default).
- **`dataRoot`** — always `join(repoRoot, 'workflow')` — per-repo config, artifacts, learnings.

When `defsRoot === dataRoot` (default), behavior is byte-identical to pre-WP-R2. This is the
backward-compat theorem: no config + no env = no change.

`AGENTSMYTH_HOME` overrides both `repo-profile.yaml` and the default — useful for CI or for
pointing a repo at a non-default global install path. Setting `AGENTSMYTH_HOME` to a path that
doesn't exist triggers the RI1 guard: a clean human-readable error and `exit 1`.

**Global tree** (`~/.agentsmyth/` by default):
```
~/.agentsmyth/
  workflow/           ← defsRoot when definitions_root: ~/.agentsmyth/workflow
    router.md
    agent-behavior.yaml
    lifecycle.md
    skills/
    schemas/
    validators/
```

**`init`/`prepare` interoperability (WP-R7):** `agentsmyth prepare` is the global-only install
— it refreshes `~/.agentsmyth/workflow/` and the 5 adapters' global gate files and writes zero
repo-level files. `agentsmyth init` always ends with the repo linked to a global install: it
auto-runs `prepare` when `~/.agentsmyth/workflow/` doesn't exist yet (no opt-out, no fallback
to a local copy — any failure is surfaced as a clear error, not silently absorbed), then writes
`definitions_root` into the repo's `repo-profile.yaml`. `--system` was removed outright
(WP-R7) — it never shipped in a published release, so no deprecated alias was kept; use
`prepare` instead.

**`init`'s mechanical scaffold + setup's resolution pass (WP-R9b):** `init` does not stop at
linking `definitions_root` — it also writes all 5 `workflow/config/*.yaml` stubs,
`pending-setup.yaml`, `workflow/artifacts/`/`workflow/learnings/`, and (for Cursor and
non-macOS Copilot specifically, the two tools no global gate can ever cover) an adapter file,
all before staging `.agentsmyth/` for the agent. The setup skill (`src/setup/SKILL.md`) no
longer runs a from-scratch interview — its Phase 2 is a **resolution pass** over
`pending-setup.yaml`, reusing `router.md`'s "Pending Setup Resolution" pattern (inspect first,
batch remaining items as one question block). Both share one implementation
(`headlessBootstrap()` in `bin/agentsmyth.mjs`), also used by `agentsmyth check` for the same
headless-bootstrap case.

**The definitions/data invariant, stated once:** skill *definitions* (skills, router,
lifecycle, rules, schemas, validators, `agent-behavior.yaml`) may live system-side and are read
at runtime via `defsRoot`; repo-specific *config and artifacts* are always repo-local via
`dataRoot`. This is the rule the two-root resolver above encodes in code — WP-R7 is what makes
`init` actually produce this split by default instead of every repo defaulting to a full local
copy (WP-R2's original `RI3`, "bare `init` must never write `definitions_root`", is superseded
by this — see `workflow/artifacts/briefs/system-level-install-v1.md`'s annotated entry).

A repo that ran `init` before WP-R7 (a full local `workflow/skills|router.md|...` copy, no
`definitions_root`) migrates the next time `init` runs: it audits for that stale local tree,
prompts with the exact paths, and deletes only on explicit confirmation — never silently either
way. The prompt requires a real interactive TTY; a non-interactive session (CI, piped input)
fails closed with the path list rather than hanging or silently deciding either way.

**Version skew:** `agentsmyth check` compares the `agentsmyth_version` stamped in
`repo-profile.yaml` against the running CLI's version and emits a plain warning pointing at
`prepare` on mismatch — there is no automatic re-link or version-pin enforcement. Since WP-R8 the
warning also *leads somewhere*: on skew, the newer version's per-repo config surfaces are appended
to `workflow/config/pending-setup.yaml` as open items, which the router's existing session-start
pass resolves (inspect first, then one batched ask). Idempotent — a file already carrying
`field: "intent.` is left alone, so re-running `check` never duplicates items or resurrects ones
the user resolved or waived. Deliberately non-blocking: until they resolve, every value falls back
to the global install, so an upgraded repo that ignores the prompt behaves exactly as before. That
non-blocking property is what keeps the change a minor bump rather than a behavior change for
every existing consumer.

---

## Per-Repo Behavior Tuning (WP-R8)

Two layers in `repo-profile.yaml`. **`intent:`** holds what a person can answer — `repo_character`,
`surface_map`, and a `concerns` map covering the ten scored power skills at
`not-applicable`/`light`/`standard`/`strict`. **`tuning:`** holds the five mechanism values the
agent derives from it: dispatch cap and on/off, scoring weights, path-glob vocabulary, firing
thresholds, and extra sign-off checkpoints. `intent.derived_keys[]` records which `tuning:` values
were derived, so an upgrade can re-derive those and never clobber a hand-set one.

Three rules carry the design. Resolution is **per entry, repo over global** — naming one weight or
one glob category changes that one thing, never the whole map (whole-map replacement silently
deleted what the author had not named, and turned a stricter-intent edit into a looser outcome).
`user_checkpoint_required_for` is the single **union** exception, so a repo can only ever add a
checkpoint. And the enumeration of what is tunable lives **only** in `repo-profile.schema.yaml`
under closed objects, so everything else — `lifecycle`, `task_classes`, `evidence_policy`,
`waivers`, `skill_scoring.triggers` — is structurally unreachable rather than merely undocumented.

`skill_scoring.thresholds` was split out of the `triggers` predicate strings so the numbers became
tunable while the boolean structure stayed locked: a repo changes how often a skill fires, never
whether its condition can be satisfied at all. Consumer-facing detail is in
`src/setup/references/config-map.md` § Per-Repo Behavior Tuning.

---

## Repo-Root Resolution (WP-R5)

Separate from the two-root resolver above: `repoRoot` itself (both `defsRoot` and `dataRoot`
build on it) is no longer a bare `process.cwd()`. Every repo shape — single-repo, monorepo,
polyrepo — places exactly one shared `workflow/` at one root; there are no package-scoped or
repo-scoped artifact subtrees in any shape.

**Resolution order** (`_resolveRepoRoot()` in `lib.mjs`):
1. `workspace_root` in `repo-profile.yaml`, only when `mode: polyrepo-member` — the shared
   `workflow/` lives in a parent directory containing this repo and its siblings as children, not
   inside any single git repo, so git-based detection can't reach it.
2. `git rev-parse --show-toplevel` — correct for `single-repository` and `monorepo` alike, since
   both are exactly one git repository regardless of which package subdirectory the agent was
   invoked from.
3. `process.cwd()` — fallback only when step 2 fails (not yet a git repo; the fresh-init case).

`repository.mode` is an enum (`single-repository`\|`monorepo`\|`polyrepo-member`), not the old
fixed `const`. `monorepo` adds an informational `packages[]` list; `polyrepo-member` adds
`workspace_root` plus a `sibling_repos[]` list (each entry needs a local `path`, not just a `url`
— git-dependent checks need a real checkout to run against, not just a remote reference).

**`target_repo` and `resolveGitCwd()`:** a polyrepo-member artifact's frontmatter can declare
`target_repo` (matching a `sibling_repos[].name`), since the shared `workflow/artifacts/` tree
doesn't itself say which member repo a given task belongs to. `resolveGitCwd(frontmatter)`
resolves this to a real path for git-dependent checks (`trackedFiles()`, etc.) — returns
`repoRoot` unchanged for every case except an artifact with `target_repo` set under
`mode: polyrepo-member`, so single-repo and monorepo behavior is a pure passthrough.

**Known boundary, not silently patched:** `check-lifecycle.mjs`'s staged-file slug
auto-detection (used when `--phase` is invoked with no explicit `--slug`) has no artifact
frontmatter yet to resolve `target_repo` from — finding the artifact is what that step does. It
stays scoped to `repoRoot` (this repo's own checkout); explicit `--slug` bypasses it entirely.
No real polyrepo fixture exists in this repo to exercise this further.

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
