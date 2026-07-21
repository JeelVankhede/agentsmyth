---
slug: wp-r13-setup-validator-definitions-root
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-07-21
updated: 2026-07-21
manifest_ids: [R1, R2, RI1, RI2]
upstream:
  - workflow/artifacts/briefs/wp-r13-setup-validator-definitions-root-v1.md
  - workflow/artifacts/plans/wp-r13-setup-validator-definitions-root-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# WP-R13 — Setup Validator Ignores definitions_root - Task

## Active Phase

- Phase: Phase 1 - Make the tree-presence check `definitions_root`-aware
- Manifest IDs: R1, R2, RI1, RI2
- Exit gate: `node test/run-setup-validator-definitions-root-tests.mjs` reports all 3 cases correct; `npm run validate` and existing `violations:test`/`checkpoint-approval:test`/`setup-checks:test` suites show zero regressions; `git diff --stat` for this WP touches only the files listed in Changed Files.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Make the tree-presence check `definitions_root`-aware | complete | R1, R2, RI1, RI2 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `wp-r13-setup-validator-definitions-root` (created off `origin/main`, post-WP-R12-merge) | clean | |
| At handoff | `wp-r13-setup-validator-definitions-root` | `.github/workflows/ci.yml`, `package.json`, `src/workflow/validators/check-setup-complete.mjs` modified; `test/fixtures/setup-validator-definitions-root/`, `test/run-setup-validator-definitions-root-tests.mjs` new | |

## Scope

- In scope: `src/workflow/validators/check-setup-complete.mjs`'s tree-presence check block only; new test fixtures and runner; `package.json`/`ci.yml` wiring.
- Out of scope: `src/setup/SKILL.md` (design already correct, untouched), `check-config.mjs` (confirmed unaffected, untouched), any other check within `check-setup-complete.mjs` itself (config-presence, placeholder-scanning, domain-field, adapter-presence checks all untouched).

## Changed Files

- `src/workflow/validators/check-setup-complete.mjs` — new `definitionsRootIsSet()` helper (regex read of `repo-profile.yaml`, mirroring `resolveRepoRoot()`'s own style); `requiredPaths` split into `alwaysRequiredPaths` (`workflow/artifacts`, `workflow/learnings`) and `definitionsTreePaths` (the other 15 entries), the latter only checked when `definitionsRootIsSet()` is false. — IDs: R1, R2, RI1, RI2
- `test/fixtures/setup-validator-definitions-root/linked/` (new) — full, otherwise-complete fixture repo with `definitions_root` set and no local definitions tree. — IDs: R1
- `test/fixtures/setup-validator-definitions-root/defensive-fallback/` (new) — same base, no `definitions_root`, full definitions tree present (stub content, existence-only). — IDs: R2, RI1
- `test/fixtures/setup-validator-definitions-root/defensive-fallback-broken/` (new) — same as `defensive-fallback` with `workflow/router.md` deliberately removed. — IDs: R2
- `test/run-setup-validator-definitions-root-tests.mjs` (new) — standalone test runner; copies each fixture into an isolated OS temp directory and `git init`s it there before running the real validator, since `check-setup-complete.mjs` resolves its own repo root via git-toplevel detection (would otherwise climb up and resolve to this repo's own real root instead of the fixture's). — IDs: R1, R2, RI1
- `package.json` — new `setup-validator-definitions-root:test` script. — IDs: R1
- `.github/workflows/ci.yml` — new CI step running it. — IDs: R1

## Implementation Log

- Confirmed via direct read that `check-config.mjs` has zero dependency on any `workflow/router|skills|validators|schemas` path or `definitions_root` — RI2 holds by construction, not just by not touching the file.
- `definitionsRootIsSet()` deliberately mirrors `resolveRepoRoot()`'s own existing regex style in the same file (`^\s*<field>:\s*(.+)$`, `m` flag) rather than introducing a YAML parser or importing `lib.mjs`'s own definitions_root resolution — same reasoning the file's own header comment already gives for not importing `lib.mjs`: its module-level code can `process.exit(1)` if a custom root doesn't exist yet, an unacceptable side effect during setup verification itself.
- Building the `linked` fixture surfaced a real design problem before it became a bug: `check-setup-complete.mjs`'s `resolveRepoRoot()` falls back to `git rev-parse --show-toplevel` for any non-`polyrepo-member` repo — meaning a fixture directory with no `.git` of its own would have git climb up and resolve to *this actual repo's* real toplevel, silently testing the wrong tree entirely (and, worse, potentially reporting false results based on this repo's own real state rather than the fixture's). Confirmed by testing the `linked` fixture both with and without a nested `git init` — without it, the validator's repo-root resolution pointed outside the fixture. Since a nested `.git` cannot be committed into this repo's own tracked fixture tree (git treats it as a submodule-like boundary, and this repo doesn't want one), resolved by having the test runner copy each fixture into an isolated OS temp directory and run `git init` there at test time — the fixtures committed to this repo are plain config directories with no `.git` of their own.
- Built the 3 fixtures incrementally, testing the `linked` case alone first (before building the other two) to confirm the validator's *other* checks (config presence, placeholder scanning, domain fields, adapter presence) were satisfied correctly — avoided the Plan's own named risk (a fixture failing for an unrelated reason, not the tree-presence logic being tested).
- Ran the pre-existing, narrower `setup-checks:test` suite (a prior regression test for an unrelated `check-setup-complete.mjs` bug — the `domain.name`/`domain.summary` regex `m`-flag fix) as an explicit regression check, not just this WP's own new suite — confirmed 4/4 still passing, no interaction between the two fixes.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R1 | `node test/run-setup-validator-definitions-root-tests.mjs`, `linked` case | pass |
| R2 | Same runner, `defensive-fallback` case | pass |
| R2 | Same runner, `defensive-fallback-broken` case | fail (correctly) |
| RI1 | All 3 cases — `workflow/artifacts`/`workflow/learnings` presence still checked in every branch | pass |
| RI2 | `git diff --stat` for this WP | only the files listed in Changed Files |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `node test/run-setup-validator-definitions-root-tests.mjs` | R1, R2, RI1 | pass | 3/3, all cases correct. |
| `npm run validate` | RI2 | pass | Zero new failures. |
| `npm run violations:test` | RI2 | pass | 21/21, unaffected. |
| `npm run checkpoint-approval:test` | RI2 | pass | 3/3, unaffected. |
| `npm run setup-checks:test` (pre-existing, unrelated suite) | RI2 | pass | 4/4, confirms no interaction with the prior domain.yaml regex fix. |
| `agentsmyth check --phase build --slug wp-r13-setup-validator-definitions-root` | — | pass | Both status-readiness and checkpoint-approval checks report success. |

## Dispatch Log

none

## Architecture Notes

- role: Senior Engineer
- decision: Fixed the fixture git-root-resolution problem (see Implementation Log) by moving `git init` into the test runner rather than committing a nested `.git` — the correct, clean solution once identified, but worth recording since it wasn't anticipated at Plan time (the Plan's Repo Impact Map listed the fixtures as plain directories without flagging this).
- decision: `definitionsTreePaths` is kept as a literal array (not derived from any other existing list, e.g. by filtering the old `requiredPaths`) — the two lists are conceptually distinct (always-required vs. defensive-fallback-only) and keeping them as separate, explicit arrays is clearer than a filter expression a future reader would need to reverse-engineer.
- constraint: Per the brief's own Non-Goals, `src/setup/SKILL.md` and `check-config.mjs` were not touched — confirmed via `git diff --stat`.
- downstream: If a future WP adds a new lifecycle phase skill or validator file, it must be added to `definitionsTreePaths`, not `alwaysRequiredPaths`, or this exact bug class reappears for the new path.

## Blockers

none

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Phase 1 - Make the tree-presence check `definitions_root`-aware | complete | 2026-07-21 | All 3 fixture cases correct; zero regression across 4 other test suites (`validate`, `violations:test`, `checkpoint-approval:test`, `setup-checks:test`). |
