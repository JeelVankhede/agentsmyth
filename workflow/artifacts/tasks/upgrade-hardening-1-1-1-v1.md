---
slug: upgrade-hardening-1-1-1
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-10-10
updated: 2026-10-10
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, RI1, RI2, RI3, RI4, RI5]
upstream:
  - workflow/artifacts/briefs/upgrade-hardening-1-1-1-v1.md
  - workflow/artifacts/plans/upgrade-hardening-1-1-1-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# 1.1.1 upgrade hardening - Task

## Active Phase

- Phase: Phase 3 - Blocking tier named by check-pending-setup (complete; Build done. Phase 4 is verification, owned by Test)
- Manifest IDs: R7
- Exit gate: met; see Phase Completion Log.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Per-item pending append and tier render instruction | complete | R1, R2, R5, R6, RI1, RI2 |
| Phase 2 - Source-only validators out of the install | complete | R3, R4, RI3, RI4 |
| Phase 3 - Blocking tier named by check-pending-setup | complete | R7 |
| Phase 4 - Full contract verification | pending (owned by Test) | RI5 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `fix/1.1.1-upgrade-hardening` | `?? workflow/artifacts/briefs/upgrade-hardening-1-1-1-v1.md`, `?? workflow/artifacts/plans/upgrade-hardening-1-1-1-v1.md` | only this chain's own artifacts; no unrelated changes |
| At handoff | `fix/1.1.1-upgrade-hardening` | ` M .github/workflows/ci.yml,  M .github/workflows/release.yml,  M bin/agentsmyth.mjs,  M package.json,  M scripts/build-bundle.mjs,  M src/workflow/agent-behavior.yaml,  M src/workflow/router.md,  M src/workflow/schemas/repo-profile.schema.yaml,  M src/workflow/validators/check-lifecycle.mjs,  M src/workflow/validators/check-pending-setup.mjs,  M src/workflow/validators/check-setup-refs.mjs,  M src/workflow/validators/check-trigger-predicates.mjs,  M src/workflow/validators/lib.mjs,  M test/run-init-prepare-interop-tests.mjs,  M test/run-setup-complete-tests.mjs, ?? test/fixtures/pending-setup-tier/, ?? test/run-consumer-sweep-tests.mjs, ?? workflow/artifacts/briefs/upgrade-hardening-1-1-1-v1.md, ?? workflow/artifacts/plans/upgrade-hardening-1-1-1-v1.md, ?? workflow/artifacts/tasks/upgrade-hardening-1-1-1-v1.md` | every path is in Changed Files or is this chain's artifact; `dist/` and root `validators/` are gitignored build products; nothing committed |

## Scope

- In scope: the Touches of Phases 1–3 in the approved plan, plus this task artifact.
- Out of scope: version bump and CHANGELOG (Ship), consumer-side glob validation (brief Non-Goal), check-setup-complete's textual tier check.

## Changed Files

- `bin/agentsmyth.mjs` — `configKeyPresent` + `pendingHasField` helpers; `appendPendingItems` filters specs per item (field already listed, or config value already set) and takes a `family` label instead of a marker; intent/council/reconcile callers updated; `model_tier` hint carries the council-member render instruction — IDs: R1, R2, R6, RI1, RI2
- `src/workflow/router.md` — step 5 sub-bullet: resolving `tuning.council.model_tier` also renders `<definitions_root>/adapters/<tool>/council-member.md` — IDs: R6
- `test/run-init-prepare-interop-tests.mjs` — `runAppend` takes `profileExtra`/`runs`; new J5–J8, plus J9 (flow-style values) from the second Review fix pass — IDs: R2, R5, RI1
- `test/run-conformance-tests.mjs` — r26 checks: every template's `Placed at` path is one check-setup-complete expects, and setup 5a.3, router step 5 and the model_tier hint all carry the template path, every template token, the `Placed at` destination and the skip rule for a declined item (plan amendment 3) — IDs: R6
- `src/setup/SKILL.md` — step 5a.3 names the `Placed at` line instead of the template's first line (plan amendment 3) — IDs: R6
- `scripts/build-bundle.mjs` — `SOURCE_ONLY` set filters the two validators out of `workflowFiles` — IDs: R3
- `bin/agentsmyth.mjs` (Phase 2) — `expandBundle` removes `retiredDefinitionFiles` (the two validators) after the ledger prune, ledger or not, with the same containment and lstat rules — IDs: RI3
- `src/workflow/validators/check-setup-refs.mjs` — header names the SOURCE_ONLY exclusion — IDs: R3
- `src/workflow/validators/check-trigger-predicates.mjs` — header: source-repo-only, and why a shipped fixture would not help a tuned repo — IDs: R3
- `src/workflow/agent-behavior.yaml` — path_glob_categories comment: the predicate check is source-repo-only; tuned sets are shape-checked by check-config — IDs: RI4
- `src/workflow/schemas/repo-profile.schema.yaml` — path_glob_categories description no longer names the validator as the consumer — IDs: RI4
- `test/run-consumer-sweep-tests.mjs` — new suite S1–S4c — IDs: R4, RI3
- `package.json` — `consumer-sweep:test` script — IDs: R4
- `.github/workflows/ci.yml` — runs `consumer-sweep:test` (plan amendment 2; required by conformance `r22-every-suite-runs-in-ci`, without which RI5's suite set was red) — IDs: R4, RI5
- `.github/workflows/release.yml` — runs `consumer-sweep:test` (plan amendment 2; required by conformance `r22-every-suite-runs-in-ci`, without which RI5's suite set was red) — IDs: R4, RI5
- `dist/workflow-bundle.md` — regenerated by `npm run build` — IDs: R3, R6, RI4
- `dist/setup-bundle.md` — regenerated by `npm run build` (no content change expected) — IDs: R3
- `src/workflow/validators/lib.mjs` — `COUNCIL_TIERS` + `resolveCouncilTier(configDir)`, the reads and precedence lifted unchanged from check-lifecycle — IDs: R7
- `src/workflow/validators/check-lifecycle.mjs` — `councilTierPrecondition` uses the shared resolver; messages unchanged — IDs: R7
- `src/workflow/validators/check-pending-setup.mjs` — `reportBlockingTier()` advisory note on both exit paths, exit code unchanged — IDs: R7
- `test/run-setup-complete-tests.mjs` — tier-note cases (unset, no pending file, set, councils disabled) — IDs: R7
- `test/fixtures/pending-setup-tier/` — four config trees for those cases — IDs: R7
- `validators/lib.mjs` — regenerated by `npm run build` from src (byte-identical, `diff -q`) — IDs: R7

## Implementation Log

### Phase 1

- The refusal warning now reads `skipped adding the <family> (<missing fields>) item(s)`, so J2b's assertion on `tuning.council.per_phase` still holds through the field list.
- The reconcile caller keeps its own `before.includes(marker)` refusal discrimination and its ledger guard. Only its label argument changed. A reconcile field is never a config key, so the value guard is a no-op for it (case "reconcile field" below).
- Step 6b before/after check of the new matchers: a scratch harness extracted `configKeyPresent` and `pendingHasField` from bin and ran 24 representative cases. Covered: scalar set/comment/null/~/"", bare key, child mapping, flow mapping, comments and blanks between levels, key under the wrong parent, grandchild-not-child, top-level sibling, commented-out key, missing block, prefix-named key, top-level intent key, reconcile field, absent file; and for field lines: double/single/unquoted, inline dash, prefix-only, and the field name inside hint text. All 24 matched expectation. The old guard was a substring test, so "field name inside hint text" and "prefix-only" both used to match; they no longer do.
- Revert demonstration (R5): replacing the filter with the old `content.includes('field: "<first field>')` early return made J5, J6, J7 and J8 fail (56/60). Restoring it returned 60/60. The fixed file was restored from a byte copy, and `grep -c "REVERT DEMO" bin/agentsmyth.mjs` → 0.
- `node bin/agentsmyth.mjs check` in this repo left `workflow/config/` unchanged: its profile sets `model_tier`, and its open per_phase item is listed.

### Phase 2

- Retired-file removal runs after the ledger prune and skips any path the current bundle declares. So if a future release re-ships one of these files, the list can never delete it. That is also why the revert demo below leaves the files in place: emptying SOURCE_ONLY makes them declared again.
- S3a matches source-repo paths only when a validator exits non-zero, so a passing validator that merely mentions a path in a progress line is not penalised. With the fix reverted, it reproduced the user's reported errors verbatim: `check-setup-refs.mjs: - missing src/setup/references/config-map.md` and `check-trigger-predicates.mjs: - examples/power-skill-sandbox/expected-triggers.yaml not found`.
- Revert demonstration (R4): `SOURCE_ONLY = new Set([])` + rebuild → S1, S2b, S3a, S4a, S4b fail (4 passed, 5 failed). Restored from a byte copy and rebuilt; `grep -c "REVERT DEMO" scripts/build-bundle.mjs` → 0, and the R3 grep on dist → 0 matches.
- Plan amended (formatting only): its Touches paths weren't backtick-quoted, so `check-scope-fence` parsed every phase's scope as empty and validate failed. The amendment is recorded in the plan Summary.
- `dist/` is gitignored, so the regenerated bundles are build products verified by grep and the sweep suite, not by a diff.
- Remaining bundle mentions of `check-trigger-predicates` (dist lines 378, 3018, 21354) are the reworded source-repo-only comments and a lib.mjs history comment. None tells a consumer to run it (RI4).
- At the Build handoff, `npm run conformance:test` failed `r22-every-suite-runs-in-ci` (54/55) because the new suite was in neither workflow. That's a repo invariant, so it was wired into both, and the plan was amended (amendment 2, Phase 2 Touches) before the edit was recorded here.

### Phase 3

- Parity check for the check-lifecycle refactor (step 6b): the pre-refactor file and the refactored one were staged side by side in the scratchpad, each with its own lib.mjs. Both ran over 8 config states (unset, resolved, invalid `supreme`, council disabled, dispatch disabled, unparseable profile, unparseable pending-setup, no pending-setup) × 4 phases (think, review, plan, build) = 32 runs. Comparing the full output plus exit code: **0 differences**. A first attempt placed the old copy inside `src/workflow/validators/` and was denied by the permission layer, so it was redone entirely in the scratchpad and nothing was written into src.
- Kept `existsSync` (cwd-relative) for the profile probe in `resolveCouncilTier`, exactly as the inline version had it, for strict parity. Observation for Review: with a *relative* `--dir` and a cwd other than the repo root, `existsSync` and `loadYaml` (repo-root-relative) would disagree. That predates this chain, and every current caller passes an absolute path or runs from the repo root.
- The note runs on both exit paths. The no-file path ("all items resolved at setup time") is the most misleading form of the original symptom, so it gets its own case.

### Review fix pass

- F1 (P2): `resolveCouncilTier` now probes `repo-profile.yaml` with `pathExists` (repo-root-relative, matching `loadYaml`) instead of cwd-relative `existsSync`. Pre-fix, running from `src/` with a relative `--dir` printed a false "tier unset" note on a tier-set fixture; post-fix it doesn't. The parity harness still shows 0 differences. File: `src/workflow/validators/lib.mjs`, rebuilt to `validators/lib.mjs`.
- F2 (P3): consumer-sweep S4a2 plants a stale file only the ledger names, isolating the ledger prune from the retired-files list. File: `test/run-consumer-sweep-tests.mjs`.

### Review fix pass 2 (user direction: no accepted findings in a bug-fix release)

- F3 closed: conformance r26 now derives the token set and destination paths from the five templates and checks all three instruction copies against them. Writing it exposed a shipped defect, Review F4: all three copies said "the path named in the template's first line", but every template names its destination on a `Placed at` line, and Claude's first line is `---`. All three were corrected.
  - Revert demo: putting "first line" back into router.md makes r26 fail (56/57). Restored from a byte copy, 57/57.
- Residual risk 2 closed (Review F5): `configKeyPresent` now reads flow mappings at any level (including a flow document root, multi-line flow, and quoted values and keys), a space before the colon, and a `---` marker. `{}` and `[]` now count as absent.
  - The matcher harness grew from 24 to 42 cases, all as expected.
  - The real-repo probe is unchanged.
  - Interop J9 covers a flow-style profile end to end.
- Suites after the pass: interop 61/61, upgrade-path 178 passed/0 failed/1 skip, consumer-sweep 10/10, setup-checks 24/24, setup-refs 5/5, violations 239/239, conformance 57/57, tuning-merge 18/18, agents-md 33/33.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R1 | interop J5, J6 | only `model_tier` appended; second run appends nothing |
| R2 | interop J7, J8 | set-and-pruned `per_phase` not re-added; both set → nothing |
| R5 | J5/J7 on reverted filter | fail |
| R6 | router.md + appended item hint | both name `<definitions_root>/adapters/<tool>/council-member.md` |
| RI1 | interop J1–J4 | unchanged and passing |
| RI2 | `npm run upgrade-path:test` | passing |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `npm run init-prepare-interop:test` | Phase 1 | pass, 60/60 | J5–J8 present |
| same, with old guard patched in | Phase 1 revert demo | fail, 56/60 (J5–J8) | restored afterwards |
| `npm run upgrade-path:test` | Phase 1 / RI2 | pass, 178 passed, 0 failed, 1 platform skip | |
| scratch `ckp.mjs` matcher harness | Phase 1 / step 6b | 24/24 as expected | |
| `npm run build` | Phase 2 | pass (`build-bundle: ok`) | |
| `npm run consumer-sweep:test` | Phase 2 | pass, 9/9 (27 validators swept) | |
| same, with `SOURCE_ONLY` emptied + rebuilt | Phase 2 revert demo | fail, 4 passed / 5 failed | restored + rebuilt afterwards |
| `grep -c 'FILE: workflow/validators/check-setup-refs.mjs\|…check-trigger-predicates.mjs' dist/workflow-bundle.md` | R3 | 0 | |
| `npm run conformance:test` | handoff | first run 54/55 (`r22-every-suite-runs-in-ci`: consumer-sweep not in CI/release); after the plan amendment and wiring, see below | |
| `npm run conformance:test` (re-run) | handoff | pass, 55/55 | |
| `npm run validate` (handoff) | handoff | exit 0; check-artifacts, check-scope-fence, check-manifest-coverage, check-phase-map ok | |
| scratch `parity.sh` (old vs new check-lifecycle) | Phase 3 / step 6b | 32 runs, 0 differences | |
| `npm run setup-checks:test` | Phase 3 | pass, 24/24 | 4 new tier-note cases |
| `npm run violations:test` | Phase 3 | pass, 239/239 detected; attribution sweep 123/123 | includes existing tier-gate fixtures je/jl/jm/jw |
| `npm run validate` | Phase 2 | first run exit 1 (check-scope-fence: unquoted plan Touches); after the plan formatting amendment, exit 0 with `check-setup-refs: ok`, `check-trigger-predicates: ok` | |

## Dispatch Log

none

## Architecture Notes

- role: Senior Engineer
- decision: see Implementation Log per phase
- constraint: no lib.mjs import in bin; build products regenerated only via `npm run build`
- tradeoff: recorded per phase
- downstream: Review should focus on check-lifecycle message parity (32-run evidence above), `configKeyPresent` edge cases (24-case harness), the retired-file removal's containment, and the cwd-relative `existsSync` observation in Phase 3. Test owns Phase 4: the full suite set, `mutation:audit` against the baseline, and the RI3 scratch-home trial.

## Blockers

none

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Phase 1 | complete | 2026-10-10 | exit gate met: interop 60/60, upgrade-path green, revert demo fails J5/J7 |
| Phase 2 | complete | 2026-10-10 | exit gate met: R3 grep 0, validate exit 0 with both validators ok, sweep 9/9, revert demo fails |
| Phase 3 | complete | 2026-10-10 | exit gate met: tier-unset prints the note, set/disabled don't, all exit 0; violations 239/239 |
