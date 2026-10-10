---
slug: upgrade-hardening-1-1-1
version: 1
artifact: verify
status: ready-for-next-phase
created: 2026-10-10
updated: 2026-10-11
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, RI1, RI2, RI3, RI4, RI5]
upstream:
  - workflow/artifacts/briefs/upgrade-hardening-1-1-1-v1.md
  - workflow/artifacts/plans/upgrade-hardening-1-1-1-v1.md
  - workflow/artifacts/tasks/upgrade-hardening-1-1-1-v1.md
  - workflow/artifacts/reviews/upgrade-hardening-1-1-1-v1.md
orchestration:
  phase: test
  status: ready-for-next-phase
  next_phase: ship
  blockers: []
  user_checkpoint: none
---

# 1.1.1 upgrade hardening - Verification

## Inputs

- Review `workflow/artifacts/reviews/upgrade-hardening-1-1-1-v1.md`: recommendation pass, F1–F5 all fixed, no residual risk.
- Verification config `workflow/config/verification.yaml`: required commands `npm run validate` and `npm run violations:test`, both in phases review and ship.
- The working tree on `fix/1.1.1-upgrade-hardening` after the Review fix passes, rebuilt with `npm run build` before every run below.
- Real released code for the trials: `git archive v1.1.0` and `git archive v1.0.1`, each built with its own `scripts/build-bundle.mjs` and installed with its own `bin/agentsmyth.mjs prepare` into a scratch `HOME`. No real user home and no real consumer repo were touched.

## Automated Checks

| Command | Outcome | Evidence |
|---|---|---|
| `npm run build` | pass (rc 0) | `build-bundle: ok` |
| `npm run validate` | pass (rc 0) | ends `render-adapters: adapter shims are current`; check-scope-fence, check-artifacts, check-manifest-coverage, check-phase-map ok |
| `npm run violations:test` | pass (rc 0) | `239/239 violations detected` |
| `npm run conformance:test` | pass (rc 0) | `57/57 conformance checks passed` (includes the two r26 checks) |
| `npm run init-prepare-interop:test` | pass (rc 0) | `61/61` (J5–J9) |
| `npm run upgrade-path:test` | pass (rc 0) | `178 passed, 0 failed, 1 skipped (platform-conditional)` |
| `npm run consumer-sweep:test` | pass (rc 0) | `10 passed, 0 failed` |
| `npm run setup-checks:test` | pass (rc 0) | `24/24` (4 tier-note cases) |
| `npm run setup-refs:test` | pass (rc 0) | `5/5` |
| `npm run tuning-merge:test` | pass (rc 0) | `18/18` |
| `npm run root-resolution:test` | pass (rc 0) | `24/24` |
| `npm run path-containment:test` | pass (rc 0) | `21/21 path-containment assertions hold` |
| `npm run finding-closure:test` | pass (rc 0) | `53/53 finding-closure clauses verified` |
| `npm run checkpoint-approval:test` | pass (rc 0) | `13/13`, including `tier-gates-at-review` |
| `npm run setup-validator-definitions-root:test` | pass (rc 0) | `3/3` |
| `npm run commit-coverage:test` | pass (rc 0) | `8 passed, 0 failed` |
| `npm run domain-placeholders:test` | pass (rc 0) | `5/5` |
| `npm run agents-md:test` | pass (rc 0) | `33/33` |
| `npm run mutation:audit` | pass (rc 0) | `0/248 rules undefended`, `mutation-audit: ok`; ratchet against `test/mutation-baseline.json` held. lib.mjs 13/0, check-lifecycle 23/0, check-pending-setup 8/0. Ran on its own temp copy (~55 min); the working tree afterwards shows the same modified-file set as before, and no `void (` mutant is present |

All 16 `:test` scripts in package.json are listed above. The list was derived from package.json, not remembered.

## Manifest Coverage

| Manifest ID | How Verified | Evidence | Result | Notes |
|---|---|---|---|---|
| R1 | command + manual | interop J5/J6; Trial A (released 1.1.0 vs branch) | pass | released 1.1.0 adds 0 `model_tier` items; branch adds 1 |
| R2 | command | interop J7/J8/J9; 42-case matcher harness (Review F5) | pass | |
| R3 | command + generated-output | `grep -c` FILE markers in dist → 0; validate shows both validators ok from source | pass | |
| R4 | command + manual | consumer-sweep S1–S3b; Trial B sweeps of the upgraded real installs | pass | 27 validators swept per install, 0 source-path failures |
| R5 | command | J5–J9 present; revert demo recorded in task (J5–J8 fail on the old guard) | pass | |
| R6 | command + source | conformance r26 ×2; router step 5, hint, setup 5a.3 all name the `Placed at` line | pass | Review F3/F4 |
| R7 | command + manual | setup-checks tier-note cases; Trial A `check-pending-setup` names the unset tier at 5 open | pass | |
| RI1 | command | interop J1–J4 unchanged; J6 idempotent | pass | |
| RI2 | command | upgrade-path 178 passed (reconcile I-series) | pass | |
| RI3 | command + manual | consumer-sweep S4a/S4a2/S4b/S4c; Trial B on real 1.1.0 (ledger) and real 1.0.1 (no ledger) installs | pass | both report `removed 2 file(s) this version no longer ships` |
| RI4 | generated-output | dist mentions of the two validators are source-only wording only | pass | |
| RI5 | command | every row in Automated Checks, including `mutation:audit` 0/248 | pass | both verification.yaml-required commands (validate, violations:test) pass |

## Manual QA

### Trial A — finding A on released code (R1, R7)

- scenario: a user repo whose `pending-setup.yaml` holds only a `tuning.council.per_phase` item (PS-12), at version skew (profile stamp 1.0.0), with no tier set. This is the reporter's shape.
- environment: macOS, Node 24.11.0. Scratch `HOME`s `homeA-rel` (prepared by released v1.1.0) and `homeA-br` (prepared by this branch). Scratch git repos `repoA-rel` and `repoA-br` built by one script, so they are identical.
- steps: `agentsmyth check` in each repo with its own `HOME` and CLI, then count `field:` lines in `pending-setup.yaml`, then run the installed `check-pending-setup` in the branch repo.
- expected: released 1.1.0 writes no `model_tier` item; the branch writes exactly one; the branch's `check-pending-setup` names the unset tier.
- observed:
  - released: `model_tier items: 0 ; per_phase items: 1 ; Added 3 per-repo tuning item(s)` (the three intent items only).
  - branch: `model_tier items: 1 ; per_phase items: 1 ; Added 4 per-repo tuning item(s)`.
  - branch `check-pending-setup`: `5 open, 0 resolved, 0 waived`, followed by `note — tuning.council.model_tier is unset while councils are enabled; check-lifecycle refuses council phases (think, review) …`.
- outcome: pass. The defect reproduces on the released code and is absent on the branch.
- evidence: scratchpad `ri3/checkA-rel.log`, `ri3/checkA-br.log`, and the two `pending-setup.yaml` files. This session's tool output is quoted above.
- manifest_ids: R1, R7

### Trial B — finding B on released installs (R4, RI3)

- scenario: global installs written by the released code, then upgraded by this branch's `prepare`.
- environment: macOS, Node 24.11.0. Scratch `HOME`s `home-v1.1.0` and `home-v1.0.1`, plus an empty scratch git repo `consumer`.
- steps:
  1. Build each tag and `prepare` into its home. Confirm both validators are installed, and whether a ledger exists.
  2. From the empty repo, run the 1.1.0-installed `check-setup-refs` and `check-trigger-predicates`.
  3. Run the branch's `prepare` over each home.
  4. Re-list, then sweep every installed `check-*.mjs` from the empty repo.
- expected: step 2 fails exactly as reported; after step 3 both files are gone from both homes; step 4 finds no failure that names a source-repo-only path.
- observed:
  - step 1: both homes carry `check-setup-refs.mjs` and `check-trigger-predicates.mjs`; `expanded-files.txt` exists for 1.1.0 and does not exist for 1.0.1.
  - step 2: `check-setup-refs: failed with 2 issue(s)` (`missing src/setup/references/config-map.md`, `missing src/setup/references/token-map.md`) and `check-trigger-predicates: failed with 1 issue(s)` (`examples/power-skill-sandbox/expected-triggers.yaml not found`). This matches the report verbatim.
  - step 3: both `prepare rc=0`, `stale left: 0`, and each printed `✓ removed 2 file(s) this version no longer ships:` followed by the two paths.
  - step 4: `[v1.1.0 upgraded] swept 27 validators, source-repo-path failures: 0` and `[v1.0.1 upgraded] swept 27 validators, source-repo-path failures: 0`.
- outcome: pass. The ledgerless 1.0.1 case is the one only `retiredDefinitionFiles` can reach, and it was cleaned.
- evidence: scratchpad `ri3/prep-v1.1.0.log`, `ri3/prep-v1.0.1.log`, `ri3/upgrade-v1.1.0.log`, `ri3/upgrade-v1.0.1.log`. This session's tool output is quoted above.
- manifest_ids: R4, RI3

## Generated Output Evidence

- `dist/workflow-bundle.md` and `dist/setup-bundle.md` were regenerated by `npm run build` (source: `src/workflow/`, `src/setup/`, `src/adapters/`). Inspection: `grep -c 'FILE: workflow/validators/check-setup-refs.mjs\|FILE: workflow/validators/check-trigger-predicates.mjs' dist/workflow-bundle.md` → 0. consumer-sweep S1 asserts the same mechanically.
- `validators/lib.mjs` was regenerated by `npm run build` from `src/workflow/validators/lib.mjs`; `diff -q` reported them identical at Build.
- Both are gitignored build products, so they are verified by inspection and by suites, not by diff.

## Findings

none. Test found no new defect, and every Review finding (F1–F5) is already fixed and re-verified in the review artifact.

## Skipped Checks

| Check | Why Skipped | Risk | Owner | Blocks Ship | Manifest IDs |
|---|---|---|---|---|---|
| none | — | — | — | no | — |

## Architecture Notes

- role: Senior QA
- decision: The trials used the actual released code from git tags, not simulated trees. The consumer-sweep S4 cases already simulate both install shapes, so a real-release run is the only evidence that adds something: it shows the shapes the suite assumes are the shapes the releases actually produce.
- decision: The mutation audit is cited only for `src/workflow/validators/` (`lib.mjs`, `check-lifecycle.mjs`, `check-pending-setup.mjs`). Its own header says it is not evidence about `bin/agentsmyth.mjs`, which is covered by interop J1–J9, upgrade-path, consumer-sweep and the two trials.
- constraint: [safety-2]. Every `prepare`/`check` ran against scratch `HOME`s and scratch repos only. No real `~/.agentsmyth/` and no real consumer repo was written.
- downstream: Ship owns the version bump to 1.1.1 and the CHANGELOG. Two items belong in the release note: Review F4 (setup step 5a.3 named the wrong destination line in 1.1.0), and the automatic removal of the two source-only validators from existing installs.

## Sign-Off

- Verifier: Claude (agent), Test phase
- Date: 2026-10-11
- Recommendation: ship
