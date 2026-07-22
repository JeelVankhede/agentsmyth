---
slug: fix-check-config-defs-root
version: 1
artifact: task
status: complete
created: 2026-07-22
updated: 2026-07-22
manifest_ids: [R1]
upstream:
  - workflow/artifacts/briefs/fix-check-config-defs-root-v1.md
  - workflow/artifacts/plans/fix-check-config-defs-root-v1.md
orchestration:
  phase: build
  status: complete
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# Fix check-config.mjs's hardcoded workflow/ root - Task

## Active Phase

- Phase: Phase 1 of 1 - Fix the resolver
- Manifest IDs: R1
- Exit gate: Reproduction scenario passes with zero errors; full local test suite unaffected.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Fix the resolver | complete | R1 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before Build | `mandatory-lifecycle-pre-commit-hook` | clean (prior work already committed/pushed as bdf8c67, PR #45 CI green) | Same branch reused per Plan's Branch Strategy — this fix was found while testing that same PR |
| At handoff | `mandatory-lifecycle-pre-commit-hook` | staged, ready to commit | |

## Scope

Fix `check-config.mjs`'s hardcoded `workflow/` root to use `defsPath('schemas')`/`dataPath('config')`.

## Changed Files

- `src/workflow/validators/check-config.mjs` — modify — IDs: R1

## Implementation Log

- Reproduced the bug first: fresh `agentsmyth init` in a scratch repo (default, `definitions_root`-linked flow), then ran `node ~/.agentsmyth/workflow/validators/check-config.mjs` against it — 6 false "no matching schema" errors on a healthy install, confirming the report.
- Replaced the hardcoded `workflowRoot = 'workflow'` (used for both schema and config lookups) with `defsPath('schemas')` for schemas and `dataPath('config')` for config, importing both from `lib.mjs`. Removed the dead `const repoRoot = process.cwd()` line, which was declared but never used.
- Rebuilt (`npm run build`) and re-ran `agentsmyth prepare` to refresh the global install's copy of the fixed file, then re-ran the exact reproduction scenario — zero errors.
- Spot-checked the sibling validator `check-domain-placeholders.mjs` for the same bug class (clean, no hardcoded root) and confirmed `check-setup-complete.mjs` already handles the defs/data split correctly by design (`definitionsRootIsSet()` branch) — this was the one real outlier.

## Verification Items

- R1: Manual QA — fresh scratch `agentsmyth init`, `check-config.mjs` run against it via the real global install: 6 errors before the fix, 0 after. PASS.
- R1: Command — `npm run validate` (which runs this file with `AGENTSMYTH_HOME=src/workflow`, this repo's own dogfood override) still passes after the fix. PASS.

## Command Results

| Command | Result | Notes |
|---|---|---|
| `node src/workflow/validators/check-config.mjs` (plain, this repo) | pass | Resolves against this repo's own local `workflow/schemas/` |
| `AGENTSMYTH_HOME=src/workflow node src/workflow/validators/check-config.mjs` | pass | Matches `scripts/validate-template.mjs`'s own invocation |
| `agentsmyth prepare` + scratch-repo reproduction | pass | 0 errors, was 6 before the fix |
| `npm run validate` | pass | Full suite unaffected |
| `npm run violations:test` | pass | 21/21 |
| `npm run commit-coverage:test` | pass | 7/7 |
| `npm run setup-checks:test` | pass | 4/4 |

## Dispatch Log

None.

## Architecture Notes

- role: Builder
- decision: Minimal, mechanical fix reusing `lib.mjs`'s existing resolver — no new abstractions.
- constraint: None beyond existing golden rules.
- tradeoff: None.
- downstream: None.

## Blockers

None.

## Phase Completion Log

- Phase 1 (Fix the resolver) — complete. Exit gate met: reproduction scenario passes with zero errors; full local test suite (`validate`, `violations:test`, `commit-coverage:test`, `setup-checks:test`) all pass.
