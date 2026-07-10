---
slug: system-level-install
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-07-08T00:00:00Z
updated: 2026-07-08T00:00:00Z
manifest_ids:
  - R1
  - R2
  - R3
  - R4
  - R5
  - R6
  - RI1
  - RI2
  - RI3
  - RI4
  - RI5
upstream:
  - workflow/artifacts/briefs/system-level-install-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
---

# System-Level Install — Plan (WP-R2)

## Summary

Implements the once-per-machine global install for agentsmyth: skill definitions live in
`~/.agentsmyth/workflow/`; per-repo data (config, artifacts, learnings) stays repo-local. Six
build phases execute in strict dependency order (R1 → R2 → R3 → R4 → R5 → R6). Each phase
must pass `npm run build && npm run validate && npm run violations:test` before the next begins
(RI4). Documentation updates are woven into the phase that introduces the change (RI5).

**Phase gate check passed before writing this plan:**
`node src/workflow/validators/check-lifecycle.mjs --phase plan --slug system-level-install` → ok

## Inputs

- Brief: `workflow/artifacts/briefs/system-level-install-v1.md` — status `ready-for-next-phase`
- Active manifest IDs: R1–R6, RI1–RI5, A1–A6 (Q1–Q6 all resolved)
- Repo state post-`src/` restructure (PRs #23 + #24 merged to main)
- Branch: `feat/npm-package-shipping` — not the WP-R2 implementation branch; see Branch Strategy
- `workflow/config/repo-profile.yaml` — `workflow_root: .workflow` is stale (noted in spike); fix in Phase 1
- `scripts/build-bundle.mjs` — `WORKFLOW_EXCLUDES = new Set(['src/workflow/config'])` exists solely
  to keep `agent-behavior.yaml` out of the bundle; collapses after Phase 1
- `src/workflow/validators/hooks/pre-commit` (shipped template) hardcodes
  `node workflow/validators/check-lifecycle.mjs --phase ...`; `src/workflow/router.md` line 76
  does the same; both break when validators go global (R3 target)
- `src/workflow/schemas/repo-profile.schema.yaml` — does not yet have `definitions_root` or
  `agentsmyth_version` fields; both must be added before R4/R6 write them

## Requirement Coverage

| Manifest ID | Covered by phases | Owning phase |
|---|---|---|
| R1 | Phase 1 | Phase 1 |
| R2 | Phase 2 | Phase 2 |
| R3 | Phase 3 | Phase 3 |
| R4 | Phase 4 | Phase 4 |
| R5 | Phase 5 | Phase 5 |
| R6 | Phase 6 | Phase 6 |
| RI1 | Phase 5 | Phase 5 |
| RI2 | Phase 4 | Phase 4 |
| RI3 | Phase 4 | Phase 4 |
| RI4 | All phases (gate at each boundary) | Phase 1–6 each |
| RI5 | Phase 1 (RI5-a), Phase 3 (RI5-b), Phase 4 (RI5-c) | Phase 4 |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `src/workflow/config/agent-behavior.yaml` | delete (move) | R1 | moved to `src/workflow/agent-behavior.yaml` |
| `src/workflow/agent-behavior.yaml` | new (moved) | R1 | canonical new location; bundled normally |
| `src/assets/workflow/config/agent-behavior.yaml` | delete | R1 | no longer needs separate static-asset copy |
| `scripts/build-bundle.mjs` | modify | R1 | remove WORKFLOW_EXCLUDES + sync step; update schema sync comment |
| `scripts/render-adapters.mjs` | modify | R1 | update gate check path string |
| `src/workflow/validators/check-lifecycle.mjs` | modify | R1, R2 | load path (R1); defsPath for schemas + agent-behavior (R2) |
| `src/workflow/validators/check-artifacts.mjs` | modify | R2 | defsPath for schema load |
| `src/workflow/validators/check-config.mjs` | modify | R2 | defsPath for schemas; dataPath for configs |
| `src/workflow/validators/lib.mjs` | modify | R2 | add readProfile, defsRoot, dataRoot, defsPath, dataPath |
| `src/workflow/schemas/repo-profile.schema.yaml` | modify | R2, R6 | add optional `definitions_root` (R2) + `agentsmyth_version` (R6) to `repository` object |
| `bin/agentsmyth.mjs` | modify | R3, R4, R5, R6 | add `check` subcommand (R3); `--system` flag (R4); bootstrap (R5); version check (R6) |
| `src/workflow/validators/hooks/pre-commit` | modify | R3 | `node workflow/validators/check-lifecycle.mjs` → `agentsmyth check` |
| `src/workflow/router.md` | modify | R3, RI5-b | validator invocation line + RI5-b doc |
| `src/workflow/skills/lifecycle-plan/SKILL.md` | modify | R3 | phase gate refusal condition |
| `src/workflow/skills/lifecycle-build/SKILL.md` | modify | R3 | phase gate refusal condition |
| `src/workflow/skills/lifecycle-review/SKILL.md` | modify | R3 | phase gate refusal condition |
| `src/workflow/skills/lifecycle-test/SKILL.md` | modify | R3 | phase gate refusal condition |
| `src/workflow/skills/lifecycle-ship/SKILL.md` | modify | R3 | phase gate refusal condition |
| `src/workflow/skills/lifecycle-reflect/SKILL.md` | modify | R3 | phase gate refusal condition |
| `src/workflow/validators/README.md` | modify | R3 | invocation examples |
| `src/adapters/claude/global-gate.md` | new | R4, RI2 | token-free global gate template |
| `src/adapters/codex/global-gate.md` | new | R4, RI2 | token-free global gate template |
| `src/adapters/windsurf/global-gate.md` | new | R4, RI2 | token-free global gate (≤ 6,000 chars) |
| `src/adapters/copilot/global-gate.md` | new | R4, RI2 | token-free global gate (macOS + VS Code path) |
| `scripts/render-adapters.mjs` | modify | R4 | add global gate format validation pass |
| `workflow/config/repo-profile.yaml` | modify | R1, R2 | fix stale `workflow_root: .workflow` (R1); `definitions_root` field absent = per-repo default (R2) |
| `~/.agentsmyth/workflow/` | new (runtime) | R4 | created by `init --system`; not a repo file |
| `CLAUDE.md` | modify | R1 (RI5-a), R4 (RI5-c) | agent-behavior path; three-tier table |
| `AGENTS.md` | modify | R3 (RI5-b) | validator invocation line |
| `docs/knowledge-map/repo-mental-map.md` | modify | R1 (RI5-a), R3 (RI5-b), R4 (RI5-c) | key paths; resolver section; global tree |
| `src/workflow/README.md` | modify | R1 (RI5-a) | agent-behavior.yaml path |
| `src/setup/SKILL.md` | modify | R4 (RI5-c) | mention `init --system` as alternative |
| `src/workflow/skills/*/SKILL.md` (decompose-requirements, dispatch-subagents, restore-context, lifecycle-orchestrator) | modify | R1 | agent-behavior load path references |
| `src/workflow/skills/dispatch-subagents/references/phase-caps.md` | modify | R1 | agent-behavior.yaml path reference |
| `src/assets/AGENTS.md` | modify | R1 | consumer-facing agent-behavior path |
| ~18 additional skill/adapter files with `workflow/config/agent-behavior.yaml` | modify | R1 | path reference update |

## Source-of-Truth Strategy

**Generated outputs affected:** `dist/workflow-bundle.md`, `dist/setup-bundle.md`, `validators/`
(root), `src/assets/adapters/` — all are build products of `npm run build`. Any change to
`src/workflow/`, `src/setup/`, or `src/adapters/` requires a rebuild before the next commit.

**Sync step (Phase 1):** The `agent-behavior.yaml` sync step in `build-bundle.mjs` (copying
`src/workflow/config/agent-behavior.yaml` → `src/assets/workflow/config/`) is removed.
`agent-behavior.yaml` joins the bundle as a normal workflow file; no separate sync needed.

**Schema source of truth:** `src/workflow/schemas/` (source) → `workflow/schemas/` (build-synced
dev workspace copy). Adding fields to `repo-profile.schema.yaml` in Phase 2 and Phase 6 requires
a rebuild to sync the schema to `workflow/schemas/`.

**No Notion or external source-of-truth items.** All changes are self-contained in this repo.

## Approach

Each phase is self-contained and leaves the repo in a passing state before the next begins.
Phases 1–3 are purely refactoring and do not change observable behavior for consumers. Phases 4–6
introduce new behavior behind the `--system` flag or a new `check` subcommand — both are additive
and do not affect existing `init` behavior.

The two-root resolver (R2) is the architectural load-bearing change. Its backward-compat theorem
(`defsRoot === dataRoot` when no `definitions_root` is set) means no consumer is broken even when
the code changes. This must be verified explicitly in Phase 2 before any further work.

**RI4 enforcement pattern**: after every phase, run:
```
npm run build && npm run validate && npm run violations:test
```
Do not proceed to the next phase if any command exits non-zero.

## Phases

### Phase 1 — Relocate agent-behavior.yaml (R1, RI4, RI5-a)

**Manifest IDs:** R1, RI4, RI5-a

**Touches:**
- `src/workflow/config/agent-behavior.yaml` (move to `src/workflow/agent-behavior.yaml`)
- `src/assets/workflow/config/agent-behavior.yaml` (delete — no longer a separate static asset)
- `scripts/build-bundle.mjs` — remove `WORKFLOW_EXCLUDES` set + filter + sync step (agent-behavior
  now bundles as a normal workflow file; nothing in `src/workflow/config/` remains to exclude)
- `scripts/render-adapters.mjs` — update gate check path string from
  `workflow/config/agent-behavior.yaml` → `workflow/agent-behavior.yaml`
- `src/workflow/validators/check-lifecycle.mjs` line 139 — load path update
- All ~25 files that reference `workflow/config/agent-behavior.yaml` or
  `src/workflow/config/agent-behavior.yaml` — update to `workflow/agent-behavior.yaml` /
  `src/workflow/agent-behavior.yaml` respectively
- `workflow/config/repo-profile.yaml` — fix stale `workflow_root: .workflow` to `workflow_root: workflow`
- RI5-a doc updates: `CLAUDE.md` path table, `docs/knowledge-map/repo-mental-map.md` key paths,
  `src/workflow/README.md` agent-behavior mention

**Work:**
1. `git mv src/workflow/config/agent-behavior.yaml src/workflow/agent-behavior.yaml`
2. Delete `src/assets/workflow/config/agent-behavior.yaml` (and empty `src/assets/workflow/config/`
   directory if nothing else remains)
3. In `build-bundle.mjs`: remove the `WORKFLOW_EXCLUDES` constant, its filter predicate, and the
   agent-behavior sync block (lines 72–102 area)
4. Grep for `agent-behavior` across all tracked files; update every path reference
5. Fix stale `workflow_root` in `workflow/config/repo-profile.yaml`
6. Run `npm run build` then `npm run validate` then `npm run violations:test`

**Exit gate:**
- `git grep 'workflow/config/agent-behavior'` returns no results (all references updated)
- `src/workflow/agent-behavior.yaml` exists; `src/workflow/config/agent-behavior.yaml` does not
- `npm run build && npm run validate && npm run violations:test` all exit 0
- `workflow/config/repo-profile.yaml` has `workflow_root: workflow` (not `.workflow`)

---

### Phase 2 — Two-root resolver (R2, RI3, RI4)

**Manifest IDs:** R2, RI3, RI4

**Touches:**
- `src/workflow/validators/lib.mjs` — add `readProfile()`, `defsRoot`, `dataRoot`, `defsPath()`,
  `dataPath()`
- `src/workflow/validators/check-artifacts.mjs` — schema load → `defsPath`
- `src/workflow/validators/check-lifecycle.mjs` — schema load + agent-behavior load → `defsPath`
- `src/workflow/validators/check-config.mjs` — schema dir → `defsPath`; config dir → `dataPath`
- `src/workflow/schemas/repo-profile.schema.yaml` — add optional `definitions_root: { type: string }`
  to the `repository` object (allows the field to be written; validation passes with or without it)

**Work:**
1. Add to `lib.mjs`:
   - `readProfile()` — reads `workflow/config/repo-profile.yaml` using existing `loadYaml` /
     `repoPath`; returns `{}` if absent (no circular dependency; profile is always repo-local)
   - `defsRoot` — `profile.definitions_root ?? process.env.AGENTSMYTH_HOME ?? join(repoRoot, _wf)`
     with `~` expansion for user paths
   - `dataRoot` — `join(repoRoot, _wf)` (always repo-local)
   - `defsPath(...p)` — `join(defsRoot, ...p)`
   - `dataPath(...p)` — `join(dataRoot, ...p)`
2. Reclassify read sites in validators:
   - `defsPath`: schema files in check-artifacts, check-lifecycle, check-config; agent-behavior.yaml
     in check-lifecycle
   - `dataPath`: config files in check-config; artifacts tree in check-lifecycle; learnings (if any)
3. Add `definitions_root` optional field to `repo-profile.schema.yaml`
4. Run `npm run build` then `npm run validate` (with no `AGENTSMYTH_HOME` set)
5. Verify backward compat: run `AGENTSMYTH_HOME=/nonexistent npm run validate` — must fail gracefully
   with a path-resolution error (not a crash), confirming the env-override path is active
6. Verify RI3: run bare `npm run validate` in a clean checkout with no `definitions_root` in
   `workflow/config/repo-profile.yaml` — must pass identically to today
7. Run `npm run violations:test`

**Exit gate:**
- `lib.mjs` exports `defsPath` and `dataPath`; `readProfile()` exists
- `AGENTSMYTH_HOME=/tmp/test node src/workflow/validators/check-lifecycle.mjs` resolves schemas
  from `/tmp/test/` (exits non-zero on missing path, not an uncaught exception)
- `npm run validate` (no env) passes — backward compat intact
- `npm run violations:test` passes
- `src/workflow/schemas/repo-profile.schema.yaml` accepts a `definitions_root` string field without error

---

### Phase 3 — `agentsmyth check` CLI subcommand (R3, RI4, RI5-b)

**Manifest IDs:** R3, RI4, RI5-b

**Touches:**
- `bin/agentsmyth.mjs` — add `check` subcommand; add `doctor` stub
- `src/workflow/validators/hooks/pre-commit` — replace hardcoded node invocation with
  `agentsmyth check --phase "$phase" --slug "$slug"`
- `src/workflow/router.md` line 76 — update invocation
- Six lifecycle skill SKILL.md refusal conditions (plan, build, review, test, ship, reflect) —
  replace `node workflow/validators/check-lifecycle.mjs --phase` with `agentsmyth check --phase`
- `src/workflow/validators/README.md` — update invocation examples
- RI5-b doc updates: `AGENTS.md` validator line; `docs/knowledge-map/repo-mental-map.md`
  verification defaults section

**Work:**
1. In `bin/agentsmyth.mjs`, add `check` branch: parse `--phase` and `--slug` args; resolve
   validators via `defsPath` (import or shell-exec the resolved `check-lifecycle.mjs`); propagate
   exit code
2. Add `doctor` stub: print `"agentsmyth doctor: not yet implemented"`, exit 0
3. Update `src/workflow/validators/hooks/pre-commit` invocation lines — the script uses `if !`
   with the node call; replace with `agentsmyth check --phase "$phase" --slug "$slug"`
4. Update router.md line 76 and all six SKILL.md refusal conditions
5. Update README.md invocation examples
6. RI5-b: update `AGENTS.md` validator reference; update `docs/knowledge-map/repo-mental-map.md`
   verification defaults
7. Run `npm run build` to rebuild bundles + `src/assets/adapters/` with updated hook template
8. Run `npm run validate` and `npm run violations:test`

**Exit gate:**
- `agentsmyth check --phase plan --slug system-level-install` exits 0 (upstream brief passes gate)
- `src/workflow/validators/hooks/pre-commit` contains no `node workflow/validators/` string
- `src/workflow/router.md` contains no `node workflow/validators/` string
- All six lifecycle skill SKILL.md files reference `agentsmyth check --phase`, not node path
- `npm run build && npm run validate && npm run violations:test` pass

---

### Phase 4 — `init --system` + global gates (R4, RI2, RI3, RI4, RI5-c)

**Manifest IDs:** R4, RI2, RI3, RI4, RI5-c

**Touches:**
- `bin/agentsmyth.mjs` — add `--system` flag to `init` subcommand
- `src/adapters/claude/global-gate.md` — new token-free global gate template
- `src/adapters/codex/global-gate.md` — new token-free global gate template
- `src/adapters/windsurf/global-gate.md` — new token-free global gate (≤ 6,000 chars)
- `src/adapters/copilot/global-gate.md` — new token-free global gate (macOS + VS Code path noted)
- `scripts/render-adapters.mjs` — add validation pass: global gate files must contain no
  `{{...}}` substitution markers (RI2 check)
- `scripts/build-bundle.mjs` — ensure global gate templates are included in `src/assets/` copy
- RI5-c doc updates: `CLAUDE.md` two-world → three-tier table; `docs/knowledge-map/repo-mental-map.md`
  global tree section + `AGENTSMYTH_HOME` env note; `src/setup/SKILL.md` mention of `--system`

**Work:**
1. Author four global gate template files. Each is a thin pointer into `~/.agentsmyth/workflow/`:
   - States the global workflow tree location
   - Does not contain `{{REPO_NAME}}` or any other substitution token (RI2)
   - Is version-stamped (e.g. `# agentsmyth global gate vX.Y.Z`)
   - Windsurf variant must be ≤ 6,000 chars total
   - Cursor: no file — CLI prints paste-text during `--system` run
2. Add `--system` handling to `bin/agentsmyth.mjs`:
   - Copy `dist/` + `src/assets/` → `~/.agentsmyth/`
   - Write/append each tool's global gate file to the tool-native path (Claude: `~/.claude/CLAUDE.md`;
     Codex: `~/.codex/AGENTS.md`; Windsurf: `~/.codeium/windsurf/memories/global_rules.md`;
     Copilot: `~/Library/Application Support/Code/User/prompts/agentsmyth.instructions.md`)
   - For Cursor: print paste-text block to stdout with clear instructions; do not fail
   - Write `definitions_root: ~/.agentsmyth/workflow` into target repo's
     `workflow/config/repo-profile.yaml` (create file if absent; parse and merge if present)
3. Update `render-adapters.mjs` to validate global gate files for zero `{{...}}` markers
4. Verify RI3: run bare `agentsmyth init` (no `--system`) in a temp directory and confirm it
   produces the same `.agentsmyth/` layout as before (no `definitions_root` written)
5. RI5-c doc updates
6. Run `npm run build && npm run validate && npm run violations:test`

**Exit gate:**
- `render-adapters.mjs` passes with zero `{{...}}` markers found in global gate files (RI2)
- `agentsmyth init` (bare, no `--system`) produces identical `.agentsmyth/` layout as before;
  no `definitions_root` written to `repo-profile.yaml` (RI3)
- Windsurf global gate char count ≤ 6,000
- `CLAUDE.md` contains three-tier table (source / dev-workspace / global `~/.agentsmyth/`)
- `npm run build && npm run validate && npm run violations:test` pass

---

### Phase 5 — Headless config bootstrap (R5, RI1, RI4)

**Manifest IDs:** R5, RI1, RI4

**Touches:**
- `bin/agentsmyth.mjs` — add bootstrap logic inside the `check` subcommand: when
  `workflow/config/repo-profile.yaml` absent, run reduced setup (Phases 1–3 of the setup skill
  programmatically); write inferred values; queue gaps to `pending-setup.yaml`

**Work:**
1. In the `check` subcommand (already added in Phase 3), before running the validator:
   - Check if `workflow/config/repo-profile.yaml` exists; if not, run bootstrap
   - Bootstrap inference signals (in priority order): environment variables for tool identity,
     global config presence (`~/.claude/`, `~/.codex/`), adapter file presence at known paths
   - Write inferred fields to `workflow/config/repo-profile.yaml` with `<USER-TODO>` markers
     for anything unresolvable
   - Write unresolved items to `workflow/config/pending-setup.yaml` (reuse existing format)
   - Print a summary of what was inferred and what was queued
   - Proceed to the validator — do not block
2. RI1: if `workflow/config/repo-profile.yaml` has `definitions_root` but `~/.agentsmyth/workflow/`
   does not exist, `agentsmyth check` must print a human-readable message and exit non-zero cleanly
   — not an uncaught exception
3. Run `npm run build && npm run validate && npm run violations:test`

**Exit gate:**
- Running `agentsmyth check --phase think` in a directory with no `workflow/config/` creates
  `workflow/config/repo-profile.yaml` and `workflow/config/pending-setup.yaml`; the check
  proceeds (does not block)
- Running `agentsmyth check --phase plan --slug x` when `definitions_root` points to a
  non-existent path prints "global definitions not found, run agentsmyth init --system" and exits
  non-zero without a Node stack trace (RI1)
- `npm run build && npm run validate && npm run violations:test` pass

---

### Phase 6 — Version-skew policy (R6, RI4)

**Manifest IDs:** R6, RI4

**Touches:**
- `bin/agentsmyth.mjs` — add version comparison in the `check` subcommand
- `src/workflow/schemas/repo-profile.schema.yaml` — add optional `agentsmyth_version: { type: string }`
  to `repository` object
- `scripts/build-bundle.mjs` or `bin/agentsmyth.mjs` — write `agentsmyth_version` at bootstrap /
  `--system` install time (from `package.json` version field)
- `docs/` — add or update a doc describing version resolution order and how to respond to
  a mismatch warning

**Work:**
1. After bootstrap (R5) and after `--system` install (R4), write
   `agentsmyth_version: <current-package-version>` to `repo-profile.yaml`
2. In the `check` subcommand, after reading `repo-profile.yaml`:
   - Read `agentsmyth_version` from profile (absent = unknown, no warning)
   - Compare to the installed package version (`package.json` version field at runtime)
   - On mismatch: print a one-line warning + instructions; proceed normally (do not fail)
3. Add `agentsmyth_version` optional field to `repo-profile.schema.yaml`
4. Write version-resolution doc (what the version field means, how mismatch is handled,
   how to update: `agentsmyth init --system` for global; package update for per-repo)
5. Run `npm run build && npm run validate && npm run violations:test`

**Exit gate:**
- `workflow/config/repo-profile.yaml` with `agentsmyth_version: 0.0.1` causes `agentsmyth check`
  to print a version mismatch warning when the installed package is a different version; check
  completes successfully (exit 0 if lifecycle gate passes)
- `repo-profile.schema.yaml` validates a profile with `agentsmyth_version: "0.1.0"` without error
- Version resolution doc exists under `docs/`
- `npm run build && npm run validate && npm run violations:test` pass

---

## Dependency Order

```
Phase 1 (R1)  ← must complete first: removes config/ straddle; unlocks clean two-dir split for R2
  │
Phase 2 (R2)  ← depends on R1: defsPath/dataPath classify agent-behavior.yaml at its new location
  │
Phase 3 (R3)  ← depends on R2: agentsmyth check uses the resolver to find validators
  │
Phase 4 (R4)  ← depends on R3: init --system writes definitions_root; check subcommand must exist
  │
Phase 5 (R5)  ← depends on R4: bootstrap runs inside the check subcommand introduced in R3/R4
  │
Phase 6 (R6)  ← depends on R5: agentsmyth_version written at bootstrap/system-install time
```

RI4 is enforced at every arrow: `npm run build && npm run validate && npm run violations:test`
must pass before crossing each boundary.

RI5 doc updates are woven: Phase 1 owns RI5-a (agent-behavior path), Phase 3 owns RI5-b
(CLI invocation), Phase 4 owns RI5-c (three-tier table + global tree). All RI5 docs are
in-place by the end of Phase 4.

## Branch Strategy

- **WP-R2 branch:** `feat/system-level-install` — branch from `main` (not from
  `feat/npm-package-shipping`; that branch is unrelated)
- One commit per phase boundary at minimum; commit only after the full suite passes (RI4)
- Do not target `main` directly; branch must be reviewed and merged via PR per repo-profile policy
- `workflow/artifacts/` changes (this brief and plan) are committed on the WP-R2 branch; they
  are excluded from the shipped bundle (they are dev workspace dogfood artifacts)
- `npm run build` must run before any commit that changes `src/`

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|
| R1 reference sweep misses a file | Medium | High — stale path causes runtime error | After Phase 1, run `git grep 'workflow/config/agent-behavior'`; must return zero results | Build phase | R1, RI4 |
| R2 resolver breaks backward compat | Low | High — all existing consumers break | Backward-compat theorem verified by running suite with no env set; explicit test with AGENTSMYTH_HOME=/nonexistent | Build phase | R2, RI3 |
| Global gate `~/.claude/CLAUDE.md` overwrites user content | Medium | High — destroys user's existing global Claude config | `--system` must append into a clearly delimited section, not overwrite the whole file | Build phase | R4 |
| Windsurf global gate exceeds 6,000-char cap | Low | Medium — gate silently truncated | Char-count check in `render-adapters.mjs` added in Phase 4; Windsurf gate authored to ≤ 600 chars (well within limit) | Build phase | R4, RI2 |
| `agentsmyth check` unavailable on PATH in consumer hook | Medium | Medium — pre-commit hook fails for consumers not on PATH | Hook falls back to `npx agentsmyth check`; document both forms in `hooks/pre-commit` header | Build phase | R3 |
| Headless bootstrap infers wrong tool type | Medium | Low — wrong adapter placed; correctable | `<USER-TODO>` markers + `pending-setup.yaml` queue ensure no silent wrong inference; user sees what was guessed | Build phase | R5 |
| Copilot path is macOS + VS Code only | Known | Low — documented non-support for other OS/editors | `--system` skips Copilot file drop and prints a note if the path does not exist; never fails | Build phase | R4, A4 |

## Verification Plan

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1 | `git grep 'workflow/config/agent-behavior'` exits with no output; `npm run validate` passes | Phase 1 | Command output is the evidence |
| R2 | `npm run validate` (no env) passes; `AGENTSMYTH_HOME=/tmp/test node src/workflow/validators/check-lifecycle.mjs` resolves defs from `/tmp/test` | Phase 2 | Two runs required |
| R3 | `agentsmyth check --phase plan --slug system-level-install` exits 0; `hooks/pre-commit` and `router.md` contain no `node workflow/validators/` strings | Phase 3 | Command + grep evidence |
| R4 | `render-adapters.mjs` validation pass with zero `{{...}}` markers in global gates; Windsurf gate char count ≤ 6,000; bare `init` produces unchanged layout | Phase 4 | Command output |
| R5 | `agentsmyth check` in dir with no `workflow/config/` creates `repo-profile.yaml` + `pending-setup.yaml` and exits 0 | Phase 5 | Manual QA: run in temp dir, inspect created files |
| R6 | `agentsmyth check` with mismatched `agentsmyth_version` in profile prints warning; exits 0 | Phase 6 | Manual QA: set version to `0.0.1`, run check |
| RI1 | `agentsmyth check` with `definitions_root` pointing to absent path prints human-readable message, exits non-zero, no stack trace | Phase 5 | Manual QA |
| RI2 | `render-adapters.mjs` validation pass confirms zero `{{...}}` markers in all four global gate files | Phase 4 | Command output |
| RI3 | Bare `agentsmyth init` in temp dir produces `.agentsmyth/` layout byte-identical to pre-WP-R2; no `definitions_root` in `repo-profile.yaml` | Phase 4 | Manual QA: diff against known-good layout |
| RI4 | `npm run build && npm run validate && npm run violations:test` all exit 0 after every phase | Every phase | Recorded in each phase's commit message |
| RI5 | No file contains `workflow/config/agent-behavior.yaml` string (R1); no file contains `node workflow/validators/` string in router/hooks/skills (R3); `CLAUDE.md` contains three-tier table (R4); `check-domain-placeholders` passes | Phase 1, 3, 4 | Grep evidence + `npm run validate` |

## Architecture Notes

- role: Principal Engineer

- decision: **agent-behavior.yaml bundles normally after Phase 1.** Removing WORKFLOW_EXCLUDES
  means the file joins the `workflow-bundle.md` expansion. This is the correct outcome — it is a
  definitions file and should travel with skills, router, and lifecycle. The separate static-asset
  sync step was a workaround for the config/ straddle; it is not needed once the straddle is gone.

- decision: **`readProfile()` has no circular dependency.** `repo-profile.yaml` is always
  repo-local — it is never read from `defsRoot`. The resolver reads it first using
  `join(repoRoot, _wf, 'config', 'repo-profile.yaml')` before any `defsPath` call. This is
  stable even when `defsRoot` points to a completely different machine path.

- decision: **Global gates append into delimited sections, not overwrite.** Phase 4 must not
  destroy existing `~/.claude/CLAUDE.md` content. The global gate is wrapped in clearly
  marked `# agentsmyth global gate — BEGIN` / `END` comments so it can be found, updated, or
  removed without affecting surrounding content.

- decision: **`agentsmyth check` shells out to the resolved validator path rather than importing
  it.** This keeps `bin/agentsmyth.mjs` free of a tight coupling to the validator module graph.
  The CLI resolves `defsPath('validators', 'check-lifecycle.mjs')` and `execFileSync`s it,
  propagating exit code and stdio unchanged.

- constraint: **`src/workflow/config/` must be empty after Phase 1 or removed.** If any file
  remains, `check-config.mjs` (via `AGENTSMYTH_WF=src/workflow`) will attempt schema validation
  against it and may fail if no schema exists. Verify the directory is gone.

- constraint: **Per-repo `init` must not write `definitions_root` (RI3).** The `--system` flag
  is the only code path that writes `definitions_root`. Bare `init` must not touch `repo-profile.yaml`
  at all (it does not today; preserve that).

- tradeoff: **`agentsmyth check` falls back to `npx agentsmyth check` in the shipped hook.**
  This adds a cold-start latency for consumers who install via npm but don't have the binary on
  PATH. The alternative (hardcode a node path) breaks global install. The fallback pattern is the
  lesser evil and is standard in the npm ecosystem.

- downstream: **Build phase must run `npm run build` before any `src/` commit.** This is already
  required by CLAUDE.md; RI4 makes it a hard gate. No intermediate state with stale `dist/` or
  `validators/` should be committed.

## Open Questions

None. Q1–Q6 from the brief are all resolved. Plan is unblocked.

## Exit Gate

- [x] Every active R and RI is mapped to exactly one owning phase.
- [x] Every phase has a binary, falsifiable exit gate.
- [x] Dependency order is explicit and correct (R1 → R2 → R3 → R4 → R5 → R6).
- [x] All risks have mitigations.
- [x] Verification plan covers every R and RI with named commands or named manual QA.
- [x] Source-of-truth and generated output handling explicit (rebuild required per CLAUDE.md).
- [x] Branch strategy defined (`feat/system-level-install` from `main`; no direct push to main).
- [x] RI5 doc updates woven into phases (RI5-a in Phase 1, RI5-b in Phase 3, RI5-c in Phase 4).
- [x] No open questions; no blockers.
