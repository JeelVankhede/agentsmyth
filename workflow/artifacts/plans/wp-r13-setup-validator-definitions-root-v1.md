---
slug: wp-r13-setup-validator-definitions-root
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-07-21
updated: 2026-07-21
manifest_ids: [R1, R2, RI1, RI2]
upstream:
  - workflow/artifacts/briefs/wp-r13-setup-validator-definitions-root-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
---

# WP-R13 — Setup Validator Ignores definitions_root - Plan

## Summary

Single-phase fix. `check-setup-complete.mjs`'s "full workflow tree presence" check gains a `definitions_root` read (reusing the file's own existing `resolveRepoRoot()`-adjacent regex pattern, not a new YAML parser) and skips the 7 definitions-tree entries when it's set to a non-empty value, keeping `workflow/artifacts`/`workflow/learnings` unconditional. Verified against two scratch-repo scenarios (linked, defensive-fallback) plus a regression test added to this repo's own suite.

## Inputs

- Brief: `workflow/artifacts/briefs/wp-r13-setup-validator-definitions-root-v1.md`
- Manifest IDs: R1, R2, RI1, RI2
- No active blockers — brief-review already resolved.

## Assumptions Verified

| Assumption ID | Status | Evidence |
|---|---|---|
| A1 | evidence-backed | Matches this repo's existing non-`wp-r<N>`-prefixed slug convention for work not tracked on the numbered Notion roadmap in the same way (`manifest-id-parser-hardening`, `lifecycle-process-hardening`, `audit-validator-fixture-gaps`) — though this one does carry a `wp-r13` prefix per explicit user direction (Notion tracking already existed, kept rather than reworked). |
| A2 | evidence-backed | `lib.mjs`'s own `_readDefinitionsRoot()`-adjacent pattern (confirmed by reading `check-setup-complete.mjs`'s own `resolveRepoRoot()`, which already reads `repo-profile.yaml` via regex, not a YAML parser) treats any present, non-empty value as significant — this Plan's Work section reuses that exact style for consistency, not a new parsing approach. |

## Requirement Coverage

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R1 | Phase 1 | New `definitions_root` read + conditional skip in the tree-presence check block. |
| R2 | Phase 1 | Same block — the `else`/default path is exactly today's unconditional behavior, unchanged. |
| RI1 | Phase 1 | `workflow/artifacts` and `workflow/learnings` stay in an unconditional list, never moved into the conditional block. |
| RI2 | Phase 1 | `git diff --stat` scoped check in Verification Plan. |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `src/workflow/validators/check-setup-complete.mjs` | modify | R1, R2, RI1, RI2 | Split `requiredPaths` into an unconditional list (`workflow/artifacts`, `workflow/learnings`) and a conditional list (the 7 definitions-tree entries), gated on a new `definitionsRootIsSet()` read of `repo-profile.yaml`. |
| `test/fixtures/setup-validator-definitions-root/{linked,defensive-fallback,defensive-fallback-broken}/` | new | R1, R2, RI1 | 3 scratch-repo-shaped fixtures for a new standalone test runner (this validator's checks span multiple concerns — config presence, placeholder scanning, tree presence — so a full fixture must satisfy the earlier checks too, not just the tree-presence block being tested). |
| `test/run-setup-validator-definitions-root-tests.mjs` | new | R1, R2, RI1 | New standalone test runner (same reasoning as `wp-r12`'s `run-checkpoint-approval-tests.mjs` — `check-setup-complete.mjs` resolves its own repo root from `process.cwd()`, not a `--dir` flag, so each case needs its own real `cwd`, most cleanly done via `spawnSync` with `cwd` set per fixture rather than reusing the generic `--dir`-based harness). |
| `package.json` | modify | R1 | New test script. |
| `.github/workflows/ci.yml` | modify | R1 | New CI step. |

## Source-of-Truth Strategy

No source-of-truth updates required. `workflow/config/source-of-truth.yaml` has no provider configured for this repo.

## Approach

Single phase — one file's one logic block, plus its own dedicated test coverage. No cross-phase dependency; nothing else in `check-setup-complete.mjs` needs to change, and `check-config.mjs` is confirmed untouched.

## Phases

### Phase 1 — Make the tree-presence check `definitions_root`-aware

- **Manifest IDs:** R1, R2, RI1, RI2
- Touches: `src/workflow/validators/check-setup-complete.mjs`, `test/fixtures/setup-validator-definitions-root/linked/`, `test/fixtures/setup-validator-definitions-root/defensive-fallback/`, `test/fixtures/setup-validator-definitions-root/defensive-fallback-broken/`, `test/run-setup-validator-definitions-root-tests.mjs`, `package.json`, `.github/workflows/ci.yml`
- Work: Add a small `definitionsRootIsSet()` helper mirroring `resolveRepoRoot()`'s own existing regex style (read `workflow/config/repo-profile.yaml`, match `^\s*definitions_root:\s*(.+)$`, return whether a non-empty value was captured). Split the existing `requiredPaths` array: keep `workflow/artifacts` and `workflow/learnings` in an always-checked list; move the other 15 entries (router.md, lifecycle.md, rules.md, glossary.md, 7 `skills/lifecycle-*/SKILL.md`, `validators/check-config.mjs`, `validators/check-artifacts.mjs`, `schemas/lifecycle-artifact.schema.yaml`) into a second list only checked when `definitionsRootIsSet()` is false. Build 3 fixtures: a full, otherwise-complete scratch repo shaped like a real post-setup consumer repo (all agent configs filled, mental map present, adapter present) — one variant with `definitions_root` set and none of the 15 conditional-list files present (must pass), one variant with no `definitions_root` and all files genuinely present (must pass, unchanged behavior), one variant with no `definitions_root` and one file deliberately missing (must fail, proving no regression to the defensive case's own strictness).
- **Exit gate:** `node test/run-setup-validator-definitions-root-tests.mjs` reports all 3 cases correct; `npm run validate` and existing `violations:test`/`checkpoint-approval:test` suites show zero regressions; `git diff --stat` for this WP touches only the files listed above, nothing else under `src/workflow/validators/`.

## Dependency Order

Single phase — none.

## Branch Strategy

Single branch `wp-r13-setup-validator-definitions-root`, created off `origin/main` (current, post-WP-R12-merge). No sub-branch.

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|
| A `definitionsRootIsSet()` false-positive (e.g. matching a commented-out or placeholder `definitions_root:` line) could let an actually-broken repo pass setup | low | medium | Regex requires a genuinely non-empty captured value on an uncommented line, mirroring the exact pattern `resolveRepoRoot()` in the same file already uses successfully for `mode`/`workspace_root` | Build | R1 |
| The 3 new fixtures could accidentally under-specify a real post-setup repo shape (e.g. missing an agent config the earlier checks require), producing a false pass/fail unrelated to the tree-presence logic being tested | medium | low (would surface immediately as a wrong-reason failure, not a silent gap) | Build each fixture against the validator's own earlier checks first (config presence, placeholders, domain fields) before layering the tree-presence scenario on top | Build | R1, R2 |

## Verification Plan

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1 | `node test/run-setup-validator-definitions-root-tests.mjs` — `linked` case passes | Phase 1 | |
| R2 | Same runner — `defensive-fallback` case passes, `defensive-fallback-broken` case correctly fails | Phase 1 | |
| RI1 | Same 3 cases, `workflow/artifacts`/`workflow/learnings` presence checked in all of them | Phase 1 | |
| RI2 | `git diff --stat <merge-base> HEAD -- src/workflow/validators/` shows only `check-setup-complete.mjs` | Phase 1 | |

## Architecture Notes

- role: Principal Engineer
- decision: New standalone test runner, not an addition to the generic `run-violation-tests.mjs` harness — same reasoning as WP-R12's `checkpoint-approval:test`: this validator resolves its own repo root from `process.cwd()` (via `resolveRepoRoot()`), not a `--dir` flag, so each fixture needs its own real working directory via `spawnSync`'s `cwd` option, which the generic `--dir`-based harness doesn't support.
- decision: 3 fixtures, not 2 — the brief's own R2 acceptance ("still fails... with the same error it produces today") requires proving the defensive-fallback path both *works when complete* and *still correctly fails when incomplete*, not just that it wasn't touched.
- constraint: Per the brief's own Non-Goals, `src/setup/SKILL.md` and `check-config.mjs` are untouched — Build must not extend scope into either even if a related gap is noticed in passing (record as a new open item instead).
- downstream: If a future WP adds more definitions-tree paths to the validator (e.g. a new lifecycle phase skill), they must be added to the *conditional* list, not the unconditional one, or this bug reappears for the new path specifically.

## Open Questions

None.

## Exit Gate

- [x] Every active R and RI mapped to a phase.
- [x] Every phase has a binary exit gate.
- [x] Verification plan covers every R and RI.
- [x] User approved or waiver recorded. — approved this turn, see Checkpoint Approval below.

## Checkpoint Approval

- Checkpoint: plan-review
- Status: approved
- User's own words (verbatim, this turn): the agent asked directly, "Do you approve this plan?" The user responded: "Yes".
