---
slug: system-level-install
version: 1
artifact: brief
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
  - wpr2-spike-notion-396972bd
  - user-request
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: brief-review
skill_trigger_log:
  - skill: repo-alignment-scan
    decision: skipped
    reason: Predates the skill-scoring feature; triggers were not evaluated at authoring time (backfilled for presence enforcement).
  - skill: architecture-decision-advisor
    decision: skipped
    reason: Predates the skill-scoring feature; triggers were not evaluated at authoring time (backfilled).
  - skill: constraint-conflict-scan
    decision: skipped
    reason: Predates the skill-scoring feature; triggers were not evaluated at authoring time (backfilled).
---

# System-Level Install — Brief (WP-R2)

## Source Links

- Research spike: Notion WP-R2 spike (396972bd) — T2.1 global paths + resolver design, all decisions locked
- Classification: **Complex** — new CLI surface, architectural two-root resolver, global install flow,
  headless bootstrap; affects lib.mjs, validators, CLI, adapters, and setup skill

## Problem

Today every repo running agentsmyth must run `npx agentsmyth init` to get the full workflow tree
(`workflow/` at repo root). The workflow *definitions* — skills, router, lifecycle, rules, schemas,
validators, and `agent-behavior.yaml` — are identical across every repo. Shipping them per-repo is
redundant and forces every new repo through the full init flow even when the machine already has
the definitions.

The goal is a **once-per-machine global install** that puts definitions into `~/.agentsmyth/workflow/`
and a thin global gate per AI tool, so every new repo inherits the lifecycle without running init
again. Per-repo data (config, artifacts, learnings) stays repo-local.

This requires:
1. A clean split between **definitions** (global) and **data** (repo) in the validator path
   resolver — currently impossible because `agent-behavior.yaml` straddles the `config/`
   directory alongside repo-specific files.
2. A `two-root resolver` in `lib.mjs` that routes reads to the correct root.
3. A `agentsmyth check` CLI subcommand so validators can be invoked without hardcoding a node
   path (which would break when validators live globally).
4. An `init --system` CLI flow that installs the global tree and thin per-tool gates.
5. A headless config bootstrap that infers repo config on first use without blocking.
6. A version-skew policy so a repo can detect and respond to definition/package version drift.

## Goals

- Single `agentsmyth init --system` installs definitions globally once per machine.
- A fresh repo with no `workflow/` gets config bootstrapped headlessly on first lifecycle use.
- All five supported tools get a global gate (4 file-drop, 1 paste-text for Cursor).
- The two-root resolver is backward-compatible: repos without `definitions_root` behave identically
  to today (byte-for-byte same paths).
- Per-repo install (`npx agentsmyth init`, no `--system`) continues to work unchanged.
- `npm run build`, `npm run validate`, and `npm run violations:test` pass throughout every step.

## Non-Goals

- Native per-tool skill format conversion (Approach B rejected; spike §5).
- Monorepo / nested-repo support (deferred to WP-R5).
- Forced migration: existing per-repo installs keep working as-is.
- GUI-based install paths for any tool.

## Decisions Locked (from WP-R2 spike)

| Decision | Choice |
|---|---|
| Global tree location | Neutral `~/.agentsmyth/workflow/` (one canonical tree; thin per-tool gates point into it) |
| Approach A vs B | **A** — global tree + thin gates (not native per-tool skill conversion) |
| Config bootstrap interactivity | **Headless** — infer from signals, queue unknowns to `pending-setup.yaml`, don't block |
| Cursor global | **Per-repo only** (`agentsmyth.mdc` in `.cursor/rules/` outranks User Rules anyway; `--system` emits paste-text only) |
| CLI surface | **In scope** — `agentsmyth check` (validators) and `agentsmyth doctor` (stub) |
| `agent-behavior.yaml` placement | **Relocate first** (R1 below) — move to `src/workflow/` root, collapses the config-straddle problem |
| Resolver design | **Option 3 / Hybrid** — `repo-profile.yaml` declares optional `definitions_root`; `AGENTSMYTH_HOME` env override; absent = today exactly |

## Requirement Manifest

### Explicit (R)

- **R1** — Relocate `agent-behavior.yaml` out of `config/`. Move `src/workflow/config/agent-behavior.yaml`
  to `src/workflow/agent-behavior.yaml` (sibling of `router.md`, `lifecycle.md`, `rules.md`). Consumer
  path becomes `workflow/agent-behavior.yaml`. Update all ~25 references in skills, adapters, router,
  docs, validators (`check-lifecycle.mjs` load path), `render-adapters.mjs` gate check, and
  `build-bundle.mjs` sync step. After this, `config/` contains only repo-local data — the two-root
  split in R2 becomes clean.
  - Acceptance: `npm run build && npm run validate && npm run violations:test` all pass; all adapter
    gate shims reference the new path; `check-lifecycle.mjs` loads `agent-behavior.yaml` from the
    correct location in both source (`AGENTSMYTH_WF=src/workflow`) and consumer contexts.

- **R2** — Implement the two-root resolver in `src/workflow/validators/lib.mjs` (Option 3/Hybrid).
  Add `readProfile()` (reads `workflow/config/repo-profile.yaml`, always repo-local, no circular
  dependency). Derive `defsRoot` = `profile.definitions_root ?? AGENTSMYTH_HOME ?? repoRoot+'/'+_wf`.
  Derive `dataRoot` = `repoRoot + '/' + _wf`. Expose `defsPath(...p)` and `dataPath(...p)` alongside
  the existing `repoPath`. Reclassify ~6 read sites: schemas, skills/output-schema, validators path,
  and `agent-behavior.yaml` → `defsPath`; config (excluding `agent-behavior.yaml`), artifacts,
  learnings → `dataPath`. Backward-compat theorem: no `definitions_root` + no `AGENTSMYTH_HOME`
  → `defsRoot === dataRoot` → byte-identical to today.
  - Acceptance: existing test suite + `npm run validate` + `violations:test` pass with no env set;
    setting `AGENTSMYTH_HOME=/tmp/test-global` causes defsPath reads to resolve there.

- **R3** — Add `agentsmyth check` CLI subcommand to `bin/agentsmyth.mjs`. Routes
  `agentsmyth check --phase <phase> --slug <slug>` through the resolver, invoking `check-lifecycle.mjs`
  from the resolved definitions root. Update `src/workflow/router.md` validator invocation line and
  `hooks/pre-commit` to call `agentsmyth check --phase ...` instead of hardcoded
  `node workflow/validators/check-lifecycle.mjs`. Stub `agentsmyth doctor` (print placeholder, exit 0).
  - Acceptance: `agentsmyth check --phase plan --slug my-slug` works from a repo root; the hook in
    `hooks/pre-commit` contains no hardcoded `node workflow/validators/` path.

- **R4** — `init --system` CLI flow. `bin/agentsmyth.mjs` parses `--system` flag alongside bare `init`.
  Copies `dist/` + `src/assets/` into `~/.agentsmyth/` (definitions tree). Writes
  `definitions_root: ~/.agentsmyth/workflow` into the target repo's `workflow/config/repo-profile.yaml`
  (creating it if absent). Installs a thin **token-free** global gate for each supported tool:
  Claude Code (`~/.claude/CLAUDE.md` append/create), Codex (`~/.codex/AGENTS.md`), Windsurf
  (`~/.codeium/windsurf/memories/global_rules.md`, ≤ 6,000 chars), Copilot
  (`~/Library/Application Support/Code/User/prompts/agentsmyth.instructions.md`, macOS+VS Code only).
  For Cursor: print paste-text to stdout with instructions; no file written. Global gate is
  version-stamped and token-free (no `{{REPO_NAME}}` etc.).
  - Acceptance: after `--system`, a fresh repo invokes the lifecycle via the global definitions;
    Windsurf gate ≤ 6,000 chars; Cursor flow prints paste text, does not hard-fail.

- **R5** — Headless config bootstrap. On first lifecycle use in a repo where `workflow/config/` does
  not exist (or `repo-profile.yaml` is absent), `agentsmyth check` auto-runs a reduced setup
  (Phases 1–3): infer repo name, protected paths, and tool type from environment signals (env vars,
  global config presence, adapter presence in context). Write inferred values; emit `<USER-TODO>`
  markers for anything that cannot be resolved. Queue any unresolved items to `pending-setup.yaml`.
  Proceed — do not block the lifecycle for gaps. Batched questions surface in the next session.
  - Acceptance: a repo with no `workflow/config/` completes its first lifecycle phase without
    manual setup; `pending-setup.yaml` is created with any unresolved items.

- **R6** — Version-skew policy (T2.3). Add `agentsmyth_version: <semver>` field to `repo-profile.yaml`
  at bootstrap time (written by R4/R5). On any `agentsmyth check` invocation, compare
  `agentsmyth_version` in repo-profile against the installed package version. On mismatch: print a
  warning + instructions (`agentsmyth init --system` to update global, or update the package). Do
  not hard-fail on mismatch — warn only. Document the resolution order in `docs/`.
  - Acceptance: a repo with `agentsmyth_version: 0.0.1` and global `~/.agentsmyth/` at `0.1.0`
    prints a version mismatch warning; lifecycle check completes anyway.

### Implicit (RI)


- **RI1** — Portability on machines without global install. A repo configured for system-level use
  (has `definitions_root` in `repo-profile.yaml`) must degrade gracefully when run on a machine
  without `~/.agentsmyth/` (CI, teammates). Pre-commit hook and router must warn and skip, not
  hard-fail or produce an opaque node crash.
  - Acceptance: on a machine without global install, `agentsmyth check --phase plan` prints a
    human-readable "global definitions not found, run agentsmyth init --system" message and exits
    non-zero cleanly (not an uncaught exception).

- **RI2** — Global gate must be token-free. The global adapter installed by R4 contains no
  `{{REPO_NAME}}`, `{{PROTECTED_PATHS}}`, `{{VERIFICATION_CMDS}}`, or other per-repo tokens.
  Token substitution stays in the per-repo rendered adapter only.
  - Acceptance: `render-adapters.mjs` (or a new check) verifies the global gate template contains
    no `{{...}}` substitution markers.

- **RI3** — Per-repo install (no `--system`) works unchanged. `npx agentsmyth init` (bare) continues
  to write `workflow/` + per-repo adapter, producing a fully self-contained repo install with no
  `definitions_root` set. All existing consumers are unaffected.
  - Acceptance: bare `init` produces the same file layout as today; `validate` passes in that state.

- **RI4** — Continuous validator integrity. Each requirement (R1 through R6) must pass the full
  `npm run build && npm run validate && npm run violations:test` suite before the next requirement
  begins. No intermediate state breaks the validator chain.
  - Acceptance: CI stays green throughout; pre-commit hook fires and passes at each commit.

- **RI5** — Documentation currency. All agent-facing files that describe repo architecture must
  reflect post-WP-R2 state by the time R6 ships. Future agents load these files cold and must
  derive the correct mental model without stale references.
  - `CLAUDE.md`: two-world split table expands to three tiers (source / dev-workspace / global
    `~/.agentsmyth/`); add `AGENTSMYTH_HOME` to env var notes; update pre-finish checklist to
    reference `agentsmyth check`.
  - `docs/knowledge-map/repo-mental-map.md`: Key Paths table gains global tree path; add resolver
    section (`defsPath` / `dataPath` / `AGENTSMYTH_HOME`); update validator invocation pattern.
  - `AGENTS.md`: validator invocation line updated from `node workflow/validators/check-lifecycle.mjs`
    to `agentsmyth check --phase ...`.
  - `src/workflow/README.md`: `agent-behavior.yaml` path corrected after R1 relocation.
  - `src/setup/SKILL.md`: mention `init --system` as the system-level alternative to per-repo init.
  - Acceptance: after R6, no agent-facing file contains a stale `workflow/config/agent-behavior.yaml`
    path, hardcoded `node workflow/validators/` invocation, or missing reference to the global
    install tier; `check-domain-placeholders` passes.

### Assumptions (A)

- **A1** — The `agentsmyth` binary will be available as a global CLI after `init --system` (i.e.,
  the package exposes a `bin` entry and consumers have it on PATH). If not globally installed,
  the hook falls back to `npx agentsmyth check` — acceptable per RI1 degraded-tool behavior.

- **A2** — Windsurf's 6,000-char cap applies to the entire `global_rules.md` file, not per-block.
  Today's adapter shim is ~600 chars; the global gate will be similarly thin. Confirmed safe given
  spike §4 findings.

- **A3** — `~/.agentsmyth/` is a writable user directory on all target platforms (macOS, Linux).
  No elevated permissions required. Windows not in scope for this work package.

- **A4** — Copilot's user-level instructions path (`~/Library/Application Support/Code/User/prompts/`)
  is stable for macOS + VS Code. Confirmed via docs + community discussion (spike sources). Other
  OS/editor combinations are out of scope for R4 and must not cause `--system` to fail.

- **A5** — Cursor's per-repo `.cursor/rules/agentsmyth.mdc` outranking User Rules is the current
  documented precedence (Team → Project → User). If Cursor ships a global rules directory in a
  future version, R4 can add file-drop support without touching the rest of WP-R2.

- **A6** — The two-root resolver's backward-compat theorem holds without a dedicated test: when
  `definitions_root` is absent and `AGENTSMYTH_HOME` is unset, `defsRoot` reduces to
  `repoRoot + '/' + _wf` (same string as `dataRoot`). All read sites produce the same absolute
  paths as today. This is a logical invariant, not an empirical claim — no test needed for the
  theorem itself, but R2 acceptance criteria still exercise both modes.

### Questions (Q)

All questions were resolved in the WP-R2 research spike before this brief was opened.

- **Q1 \[resolved\]** — Approach A (global tree + thin gates) vs B (native per-tool format).
  → **A selected.** Preserves router model; no per-tool re-authoring.

- **Q2 \[resolved\]** — Global tree location: tool-owned dirs vs neutral `~/.agentsmyth/`.
  → **Neutral `~/.agentsmyth/workflow/`.** One canonical tree, less duplication, one version target.

- **Q3 \[resolved\]** — Config bootstrap interactivity: interactive interview vs headless.
  → **Headless.** Infer from signals; queue gaps to `pending-setup.yaml`; don't block.

- **Q4 \[resolved\]** — CLI surface scope: in or out of WP-R2.
  → **In scope.** `agentsmyth check` is required to decouple validator call sites.

- **Q5 \[resolved\]** — Cursor global support: block system install or accept per-repo-only.
  → **Per-repo-only.** Repo `.cursor/rules/agentsmyth.mdc` outranks User Rules; strongest
  placement, not a compromise. `--system` emits paste-text; never blocks.

- **Q6 \[resolved\]** — `agent-behavior.yaml` placement: leave in `config/` or relocate first.
  → **Relocate first as R1.** Collapses the config-straddle problem cleanly before R2.

## Architecture Notes

**Two-root resolver (R2) is the load-bearing change.** Every subsequent requirement depends on it.
R1 must land first to eliminate the `config/` straddle before R2 classifies read sites.

**`agent-behavior.yaml` relocation (R1)** is a pure reference update — no logic changes. ~25 file
references move from `…/config/agent-behavior.yaml` to `…/agent-behavior.yaml`. The build-bundle
`WORKFLOW_EXCLUDES` must be updated (currently excludes `src/workflow/config`; after R1, only the
remaining per-repo config files need exclusion from the bundle).

**CLI invocation path (R3)** decouples all call sites from the node filesystem layout. This is the
prerequisite for global validators (R4) — once the hook calls `agentsmyth check`, the CLI can
resolve validators from anywhere via the two-root resolver.

**Recommended implementation order:** R1 → R2 → R3 → R4 → R5 → R6. Each unlocks the next.

## Exit Gate

- R1 through R6 each have acceptance criteria; no requirement is implementation detail.
- RI1 through RI5 each have acceptance criteria; RI5 ensures documentation currency post-WP-R2.
- A1 through A6 are explicit; all are safe to proceed on (none block the brief).
- Q1 through Q6 are all resolved; zero open questions; `orchestration.blockers` is empty.
- Classification confirmed Complex (new CLI surface, architectural resolver, multi-subsystem).
- Spike T2.1 deliverable (§4 global-paths table) is complete and referenced.
