---
slug: fix-definitions-root-portability
version: 1
artifact: task
status: complete
created: 2026-07-23
updated: 2026-07-23
manifest_ids: [R1, R2]
upstream:
  - workflow/artifacts/briefs/fix-definitions-root-portability-v1.md
  - workflow/artifacts/plans/fix-definitions-root-portability-v1.md
orchestration:
  phase: build
  status: complete
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# Fix definitions_root Portability (OI-52) - Task

## Active Phase

- Phase: Phase 1 of 1 - Write the portable form
- Manifest IDs: R1, R2
- Exit gate: Fresh scratch init writes the portable literal; old-form absolute path still resolves; new/updated test scenarios pass; full regression suite passes.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Write the portable form | complete | R1, R2 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before Build | `fix-definitions-root-portability` | clean, branched directly from `origin/main` (PR #45 and #46 both merged before this chain started) | |
| At handoff | `fix-definitions-root-portability` | dirty (this task's files, uncommitted) | Nothing committed yet — commit is a user decision |

## Scope

Change what string `init`/`headlessBootstrap()` write as `definitions_root`, from the expanded
absolute path to the portable literal `~/.agentsmyth/workflow`, and add regression coverage.

## Changed Files

- `bin/agentsmyth.mjs` — modify (new `PORTABLE_DEFINITIONS_ROOT` constant; `headlessBootstrap()`'s
  single real call to `writeDefinitionsRoot()` now passes it instead of the expanded
  `globalWorkflowDir`) — IDs: R1
- `test/run-init-prepare-interop-tests.mjs` — modify (Scenario C's `C4-definitions-root` and
  Scenario F's `F3-definitions-root` both previously asserted the expanded form — the bug itself —
  inverted to assert the portable literal and explicitly reject the expanded form) — IDs: R1, R2

## Implementation Log

- Confirmed via re-reading `bin/agentsmyth.mjs` (post-PR-#45/#46-merge state) that there is only
  **one** real call site for `writeDefinitionsRoot()` — inside `headlessBootstrap()` — not two as
  the Plan assumed; bare `init` calls `headlessBootstrap()` itself rather than calling
  `writeDefinitionsRoot()` separately. Simplified the fix accordingly: only that one call site
  needed changing.
- Added `PORTABLE_DEFINITIONS_ROOT = '~/.agentsmyth/workflow'` as a module-level constant
  (hardcoded literal, never `path.join`-constructed, per the Windows-safety constraint from
  Think). Changed the `writeDefinitionsRoot()` call to pass it instead of `globalWorkflowDir` (the
  expanded path, which stays unchanged everywhere else it's used — `existsSync` checks, `prepare`
  invocation).
- **Found and fixed a real gap in my own first verification attempt**: the globally-linked
  `agentsmyth` binary on this machine is a real installed copy under
  `~/.npm/lib/node_modules/@jeelvankhede/agentsmyth/`, not a live symlink back to this dev repo —
  editing `bin/agentsmyth.mjs` here had no effect on it until `npm install -g . --force` was
  re-run. First scratch-repo test showed the stale, pre-fix expanded path; re-ran the global
  install and re-tested to get a true result.
- Verified R1 (fresh scratch `init` writes the portable literal, `agentsmyth check` resolves it
  correctly afterward — no "global definitions root not found") and R2 (a hand-written
  old-form absolute-path `definitions_root` still resolves correctly) both via direct scratch-repo
  manual QA.
- For the automated test: discovered `test/run-root-resolution-drift-tests.mjs` (the file the
  Plan named to mirror) actually tests `repoRoot` resolution for `workspace_root`, a different
  field from `definitions_root` entirely — not the right file to extend. Instead updated the two
  existing `test/run-init-prepare-interop-tests.mjs` assertions (`C4-definitions-root`,
  `F3-definitions-root`) that were *asserting the bug itself* (the expanded form) — inverted both
  to assert the portable literal and explicitly reject the expanded form. `F5-resolves` (already
  existing, unchanged) then serves as the real end-to-end resolution proof, since it runs a
  follow-up `check --phase/--slug` call against the same scratch, isolated `HOME` environment
  `spawnCli` already sets up per test run — effectively simulating "a different machine" already.

## Verification Items

- R1: Manual QA + Command — fresh scratch `init` writes `definitions_root: ~/.agentsmyth/workflow` verbatim; `agentsmyth check` resolves correctly afterward (no "global definitions root not found"); automated `C4-definitions-root`/`F3-definitions-root`/`F5-resolves` all pass. PASS.
- R2: Manual QA — hand-written scratch repo with the old, expanded absolute-path form still resolves correctly via `agentsmyth check` (`check-lifecycle: ok`). PASS.

## Command Results

| Command | Result | Notes |
|---|---|---|
| `npm run build` | pass | |
| `npm install -g . --force` | pass | Required to make the globally-linked binary reflect source changes (real installed copy, not a symlink) |
| `agentsmyth prepare` | pass | |
| Fresh scratch `agentsmyth init` | pass | `definitions_root: ~/.agentsmyth/workflow` written verbatim |
| Fresh scratch `agentsmyth check` (same repo) | correctly fails on unrelated setup-completeness, but resolves `check-lifecycle: ok` | Confirms R1 |
| Hand-written old-form scratch repo `agentsmyth check` | resolves `check-lifecycle: ok` | Confirms R2 (backward compat) |
| `npm run init-prepare-interop:test` | pass | 33/33 (C4, F3 fixed) |
| `npm run validate` | pass | |
| `npm run violations:test` | pass | 21/21 |
| `npm run setup-checks:test` | pass | 6/6 |
| `npm run setup-refs:test` | pass | 5/5 |
| `npm run conformance:test` | pass | 12/12 |
| `npm run root-resolution:test` | pass | 16/16 |
| `npm run checkpoint-approval:test` | pass | 3/3 |
| `npm run setup-validator-definitions-root:test` | pass | 3/3 |
| `npm run commit-coverage:test` | pass | 7/7 |
| `AGENTSMYTH_HOME=src/workflow node bin/agentsmyth.mjs check` (this repo) | pass | |
| `agentsmyth check --staged` (this repo) | pass | |

## Dispatch Log

None.

## Architecture Notes

- role: Builder
- decision: Reused the exact tilde convention already proven for `workspace_root` — no new mechanism, single constant, single call-site change.
- constraint: Hardcoded literal string, verified via prior-turn `path.win32`/`path.posix` simulation before Build started.
- tradeoff: None.
- downstream: Migrating already-`init`'d consumer repos' existing absolute-path values remains a separate, deferred decision (OI-52's own stated non-goal).

## Blockers

None.

## Phase Completion Log

- Phase 1 — complete. Exit gate met: portable literal written and verified resolving correctly; old form still backward-compatible; updated/existing automated tests pass; full regression suite passes with zero unaddressed regression.
