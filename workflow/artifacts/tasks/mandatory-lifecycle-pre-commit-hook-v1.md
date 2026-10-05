---
slug: mandatory-lifecycle-pre-commit-hook
version: 1
artifact: task
status: done
created: 2026-07-21
updated: 2026-07-21
manifest_ids: [R1, R2, R3, R4, R5, RI1, RI2, RI3, RI4]
upstream:
  - workflow/artifacts/briefs/mandatory-lifecycle-pre-commit-hook-v1.md
  - workflow/artifacts/plans/mandatory-lifecycle-pre-commit-hook-v1.md
orchestration:
  phase: build
  status: done
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# Mandatory Local Lifecycle Pre-Commit Hook - Task

## Active Phase

- Phase: Phase 4 of 4 - Tests + docs
- Manifest IDs: R1, R2, R3
- Exit gate: `npm run commit-coverage:test` passes all fixture cases; `npm run validate` and `npm run violations:test` still pass unchanged; docs updated.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Coverage validator | complete | R2, R5 |
| Phase 2 - CLI wiring | complete | R2 |
| Phase 3 - Hook template + installer | complete | R1, R3, R4, R5, RI1, RI2, RI3, RI4 |
| Phase 4 - Tests + docs | complete | R2, R1, R3 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before Build | `mandatory-lifecycle-pre-commit-hook` | dirty (uncovered, pre-existing edits from an earlier, unrelated bug-fix session: `bin/agentsmyth.mjs`'s validator-resolution fix, `workflow/config/{domain,verification,repo-profile}.yaml`) | Branched from `main` per CLAUDE.md golden rule 8 before this work started |
| At handoff | `mandatory-lifecycle-pre-commit-hook` | dirty (this task's files, uncommitted, plus the same pre-existing unrelated edits) | Nothing committed yet — commit is a user decision |

## Scope

Implements the Plan's 4 phases: a new staged-diff coverage validator, `--staged` CLI wiring, a
mandatory (non-opt-in) pre-commit hook installer wired only into `init`, and fixture tests + docs.

## Changed Files

- `src/workflow/validators/check-commit-coverage.mjs` — new — IDs: R2, R5
- `bin/agentsmyth.mjs` — modify (this task's portion: `resolveValidator()` extraction + `--staged` routing in `check`; `installPreCommitHook()` + `HOOK_BEGIN_MARKER`/`HOOK_END_MARKER`; call site in `init` after `placeDeterministicAdapters()`) — IDs: R1, R2, R3, R4, RI1, RI2, RI3, RI4
- `src/assets/hooks/pre-commit` — new — IDs: R1, R4, R5, RI1
- `test/run-commit-coverage-tests.mjs` — new — IDs: R2
- `package.json` — modify (`commit-coverage:test` script) — IDs: R2
- `README.md` — modify ("Mandatory local lifecycle gate" section) — IDs: R1, R3
- `site/under-hood.md` — modify ("The adapters are advisory; the pre-commit hook is not" section) — IDs: R1, R3

Note: `bin/agentsmyth.mjs`'s diff also carries an earlier, unrelated fix (the `check-lifecycle.mjs` two-root validator-resolution bug) from a prior session in this same conversation, made before this lifecycle chain started — not part of this task's manifest IDs, called out here only for Changed-Files honesty. `workflow/config/{domain,verification,repo-profile}.yaml` and `workflow/config/pending-setup.yaml` carry similarly unrelated pre-existing edits from that same earlier session; none are touched by this task.

## Implementation Log

- Phase 1: Implemented `check-commit-coverage.mjs` — safe-prefix allowlist (`workflow/`, `docs/`, `.cursor/`, `.claude/`, `.github/`, `*.md`), a single-file ≤15-line trivial escape, and coverage-by-non-stub-task-artifact matching (reusing `check-scope-fence.mjs`'s `namedSection`/Changed-Files-path-extraction pattern, adapted rather than copy-pasted verbatim). Verified standalone against real staged diffs in this repo (safe-only pass, and a real uncovered scratch file correctly blocked).
- Phase 2: Extracted the existing `check` command's validator-resolution logic (definitions_root → AGENTSMYTH_HOME → repo-local → source-repo dev fallback) into `resolveValidator()`, parameterized by filename. Added `--staged` arg detection routing to `check-commit-coverage.mjs` instead of `check-lifecycle.mjs`. Rebuilt and verified via the real globally linked `agentsmyth` binary (symlinked install, not a dev-tree invocation) — both `agentsmyth check` and `agentsmyth check --staged` work correctly.
- Phase 3: Added the marker-delimited `src/assets/hooks/pre-commit` template and `installPreCommitHook()`, wired only into the `init` command path (confirmed via grep: no reference in `runPrepare()`). Detects `core.hooksPath`, defaults to `.git/hooks/pre-commit`, writes fresh or appends-with-marker-check for idempotency, and warns non-fatally when not a git repo or the hooks path can't be created/written.
- Phase 4: Added `test/run-commit-coverage-tests.mjs` (7 fixture-driven cases spawning the validator as a real subprocess against real scratch git repos) and the `commit-coverage:test` npm script. Documented the mandatory local hook in `README.md` and `site/under-hood.md`, explicitly noting the local-only, no-CI scope.

## Verification Items

- R1: Manual QA — fresh scratch git repo, `agentsmyth init`, hook present at `.git/hooks/pre-commit`, executable, no extra step. PASS.
- R1 (idempotency): re-running `init` in the same repo does not duplicate the marker block (grep count for the marker string unchanged: 2 before and after). PASS.
- R2: Command — `npm run commit-coverage:test`, 7/7 fixture cases pass (safe-only, trivial-escape, covered-by-real-task, uncovered, draft-only-not-covering, blocked-for-user-only-not-covering). PASS.
- R3: Command (inspection) — `git diff` for this task's Changed Files contains no `.github/workflows/*` addition; grep for `.yml`/`.yaml` under any `workflows` path in the diff found none. PASS.
- R4: Manual QA + inspection — grep of `installPreCommitHook()` and the hook template found no new bypass flag/env var/config toggle; git's own `--no-verify` is the only bypass path (untouched, native git behavior). PASS.
- R5: Command (inspection) — grep of `check-commit-coverage.mjs` and `src/assets/hooks/pre-commit` for tool-name branching (`claude`, `codex`, `copilot`, `cursor`, `windsurf`) found none. PASS.
- RI1: Command (inspection) — `git diff .githooks/pre-commit` is empty; new hook source lives at the separate `src/assets/hooks/pre-commit` path. PASS.
- RI2: Manual QA — scratch repo with a pre-existing custom `pre-commit` (`echo "custom hook ran"`); after `init`, original line preserved verbatim, agentsmyth marker block appended after it. PASS.
- RI3: Command (inspection) — grep confirms `installPreCommitHook` is called only once, in the `init` command path; `runPrepare()`'s body has zero references to it. PASS.
- RI4: Manual QA — `agentsmyth init` run against a plain (non-git) scratch directory: prints the non-fatal warning, `init` still completes (exit 0), `workflow/config/` still scaffolded. PASS.

## Command Results

| Command | Result | Notes |
|---|---|---|
| `npm run build` | pass | Ran after Phase 2 and again after Phase 3 changes |
| `agentsmyth check` (real global CLI) | pass | Confirms earlier session's validator-resolution fix and this task's `--staged` routing coexist correctly |
| `agentsmyth check --staged` (real global CLI) | pass | New `--staged` mode works from the real symlinked global install, not just the dev tree |
| `npm run commit-coverage:test` | pass | 7/7 |
| `npm run validate` | pass | Full existing suite unaffected |
| `npm run violations:test` | pass | 21/21 violation fixtures still correctly detected |

## Dispatch Log

None — no subagent dispatch was authorized or used for this task; all phases implemented and verified directly in this session.

## Architecture Notes

- role: Builder
- decision: Kept `check-commit-coverage.mjs`'s coverage rule to existence-of-a-real-task-artifact only, exactly as scoped in Plan — did not expand it to re-validate full chain status, which stays `check-lifecycle.mjs`'s job.
- constraint: No runtime dependency added; hook template is POSIX shell calling into the already-published `agentsmyth` CLI (or `npx` fallback).
- tradeoff: None beyond what Plan already named (existence-only proxy accepts some risk of an incomplete-but-covered artifact slipping through, in exchange for a fast, explainable rule).
- downstream: None of Review/Ship's existing validators change behavior; this is a purely additive gate.

## Blockers

None.

## Phase Completion Log

- Phase 1 (Coverage validator) — complete. Exit gate met: validator runs standalone against a real staged diff with correct pass/fail and actionable output.
- Phase 2 (CLI wiring) — complete. Exit gate met: `agentsmyth check --staged` works from the real globally-installed CLI.
- Phase 3 (Hook template + installer) — complete. Exit gate met: all 5 named scenarios (fresh install, idempotent re-run, custom-hook chaining, non-git warning, no CI file written) verified.
- Phase 4 (Tests + docs) — complete. Exit gate met: `npm run commit-coverage:test` passes all cases; `npm run validate` and `npm run violations:test` unaffected; README.md and site/under-hood.md updated.
