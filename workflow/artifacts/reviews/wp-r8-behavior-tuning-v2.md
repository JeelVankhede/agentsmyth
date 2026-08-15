---
slug: wp-r8-behavior-tuning
version: 2
artifact: review
status: blocked
created: 2026-08-14
updated: 2026-08-14
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9]
upstream:
  - workflow/artifacts/briefs/wp-r8-behavior-tuning-v1.md
  - workflow/artifacts/plans/wp-r8-behavior-tuning-v1.md
  - workflow/artifacts/tasks/wp-r8-behavior-tuning-v1.md
  - workflow/artifacts/reviews/wp-r8-behavior-tuning-v1.md
orchestration:
  phase: review
  status: blocked
  next_phase: test
  blockers: [F4]
  user_checkpoint: none
---

# WP-R8 — Per-Repo Behavior Tuning - Review v2 (post-fix)

Re-review after Phase 13 addressed v1's F1, F2, and F3. v1 is retained unchanged as the record of
the original `hold`. This version re-verifies those three fixes independently and reviews the new
diff Phase 13 introduced — which is where the one remaining blocker comes from.

## Findings

### F4 — P1 — the F2 engine fix tightens validation globally and can fail a previously-valid consumer repo on upgrade, violating RI9

- **Area:** `src/workflow/validators/lib.mjs` (schema-valued `additionalProperties` support, added by Phase 13)
- **Manifest IDs:** RI9, R4
- **Problem:** F2's fix was correct but its blast radius was not scoped. The engine previously understood only `additionalProperties: false` and **silently discarded** the schema-valued form. Implementing it newly enforces **8 declarations across 3 schemas**, and only 2 of those belong to WP-R8:

  | Schema | Line | Newly enforced | In WP-R8 scope? |
  |---|---|---|---|
  | `repo-profile.schema.yaml` | 280, 296 | `path_glob_categories`, `thresholds` | yes |
  | `agent-behavior.schema.yaml` | 172, 199, 203, 207, 262 | `signals`, `thresholds`, `triggers`, `path_glob_categories`, `boolean_policy_object` | no — shipped file, low risk |
  | `verification.schema.yaml` | 70 | `commands[].env` | **no — consumer-authored** |

  `commands[].env` is the dangerous one. It is a map of environment variables in a file every consumer writes by hand, and it is declared string-valued. A consumer who wrote the natural YAML:

  ```yaml
  env:
    PORT: 8080
    DEBUG: true
  ```

  passed validation before this change and **fails after it**. Verified directly:

  ```
  - verification.yaml.commands[0].env.PORT expected type string, got number
  - verification.yaml.commands[0].env.DEBUG expected type string, got boolean
  ```

  This contradicts RI9 as written — "a repo with no `tuning:` and no `intent:` … behaves byte-for-byte as it does today" — for a repo that never touches either block. It also contradicts the user's explicit release decision that upgrading to 1.1.0 must be **non-blocking**: a repo in this state cannot run `agentsmyth check` at all until it edits its config, which is the opposite of "continue working, config resolves from global until you get to it".

  In fairness to the fix: such a config was always invalid against its own declared schema, and the failure is loud with an obvious remedy (quote the value). This is a tightening toward correctness, not a new defect. But "previously passing, now failing, on upgrade" is a compatibility break regardless of who was technically right, and it is exactly the class of change the 1.1.0 additive-only constraint exists to catch.

- **Fix recommendation:** three viable routes, and this is a release-level call rather than a code-level one:
  1. **Scope the enforcement** to schemas WP-R8 introduced, deferring the rest to a major. Ugly (special-casing by key) but preserves the minor bump exactly.
  2. **Deprecation window** — emit newly-enforced pre-existing declarations as warnings for 1.1.0, errors in 1.2.0. Principled, more code, and consistent with how the skew warning already behaves.
  3. **Accept the tightening**, document it prominently in the changelog as a required config fix, and re-check whether 1.1.0 still qualifies as a minor under `07 — Versioning Policy`.

  Recommend **2**. It keeps the genuinely valuable engine fix, matches the non-blocking posture the rest of this package already adopts for upgrades, and gives consumers a release to correct their configs. Whichever is chosen, `07 — Versioning Policy` should be consulted before Ship, not after.

### F5 — P3 — two schema-engine keywords have now been found silently unimplemented in one package, and nothing audits the rest

- **Area:** `src/workflow/validators/lib.mjs`
- **Manifest IDs:** none (process finding)
- **Problem:** Phase 1 found `maximum` parsed and ignored. Phase 13 found schema-valued `additionalProperties` parsed and ignored. Both were discovered by accident — a schema author writes a declaration, it has no effect, and nothing anywhere reports that. The remaining keyword surface (`oneOf` appears twice in `lib.mjs`, `contains`, `minItems`, `uniqueItems`, `pattern`, `minLength`, `$ref`) has never been audited the same way, so an unknown number of declarations in the shipped schemas may be decorative.
- **Fix recommendation:** not for this package. A Reflect follow-up: either a validator that fails on a schema keyword the engine does not implement, or a documented list of supported keywords in `validators/README.md`. The former is better — a list drifts, a check cannot.

## Severity Summary

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 1 |
| P2 | 0 |
| P3 | 1 |

## Requirement Coverage

| Manifest ID | Evidence | Status | Notes |
|---|---|---|---|
| R1 | full `tuning:` block accepted; unknown key rejected by name | covered | Unchanged from v1. |
| R2 | `w-tuning-unknown-key` rejected: `tuning.retry_policy is not allowed` | covered | Unchanged from v1. |
| R3 | looser-value and checkpoint-omission fixtures both rejected by name | covered | Unchanged from v1. |
| R4 | `required:` array byte-identical; own + 4 `examples/` profiles validate unedited | **partial** | The array is untouched, but F4 means a *previously-valid consumer* config can now fail. The additive-only claim holds for schema shape and fails for validation outcome. |
| R5 | intent block accepted with `concerns` only; both floors rejected | covered | Unchanged from v1. |
| R6 | 10 predicates identical pre/post; predicate-rewrite fixture rejected | covered | Re-verified this review after the merge changed. |
| R7 | fresh bootstrap emits PS-1..PS-11; generated file validates | covered | Unchanged from v1. |
| R8 | skew adds 3 items, idempotent over 3 runs, gate completes with items open | covered | Unchanged from v1. |
| RI1 | grep re-run across **all six** tunables — 4/4/3/1/1/6 instruction sites | covered | v1's partial resolved by F3. |
| RI2 | `mergeTunedMap` merges one level deeper; 8/8 assertions; `m2`/`m8` confirmed failing against the pre-fix spread | covered | v1's F1 resolved and genuinely proven. |
| RI3 | bundles regenerated and content-verified; build deterministic | covered | Re-run this review after Phase 13. |
| RI4 | `npm run violations:test` 29/29 | covered | Unchanged from v1. |
| RI5 | locked-key fixture rejected; every `tuning:` object confirmed closed | covered | Unchanged from v1. |
| RI6 | `config-map.md` section; 69 field refs schema-checked | covered | Unchanged from v1. |
| RI7 | floor fixtures rejected naming the permitted set | covered | Unchanged from v1. |
| RI8 | stale-provenance fixture rejected | covered | Unchanged from v1. |
| RI9 | own + 4 `examples/` profiles unedited and valid; 10 predicate outcomes unchanged | **partial** | Holds for every claim about `tuning:`/`intent:` absence. Does **not** hold for a consumer whose `verification.yaml` carries a non-string `env` value — see F4. |

## Architecture Notes

- role: Staff Reviewer
- **decision — v2 rather than editing v1.** v1 recorded a P1 and named it in `orchestration.blockers`. Editing it in place would erase the only durable evidence that the defect existed and was caught, which is the specific thing a review artifact is for. v1 stands; this supersedes it.
- **decision — the fixes were re-verified, not accepted from the task artifact.** F1: ran the new suite (8/8) and independently confirmed `m2` and `m8` fail against a simulated pre-fix shallow spread — a test that passed either way would have proven nothing, which the task artifact correctly anticipated. F2: confirmed the malformed glob now fails at the config gate naming the key. F3: re-ran RI1's grep across all six tunables. Additionally confirmed the finite-score guard fires with an actionable message on a non-numeric weight, which is the defence-in-depth layer behind F1.
- **constraint — the interesting risk moved.** v1's findings were about the tuning surface. After Phase 13 the tuning surface is sound and the risk has moved to the **shared schema engine**, which every validator and every config depends on. A change there is not scoped to WP-R8 no matter which package made it, and that is what F4 is.
- **tradeoff — F4 as P1 rather than P2.** The config it breaks was always invalid against its own schema, which argues for P2. It is P1 because RI9 is a declared requirement of this package and F4 falsifies it, and because it contradicts a decision the user made explicitly about upgrade behaviour. Severity here tracks the requirement, not the sympathy of the case.
- **assumption Test must verify:** whichever F4 route is chosen, that a consumer config with a non-string `env` value produces the intended outcome — passing with a warning under route 2, or failing with a documented remedy under route 3. An untested choice here is the same silent-drift risk in a new place.
- **downstream:** F4 needs a user decision before Build can act. F5 is Reflect. Ship still owes the two Notion corrections plus, if route 3 is chosen, a versioning-policy re-check.

## Verification Reviewed

| Item | Outcome | Notes |
|---|---|---|
| `npm run build` | pass | Deterministic; second run no change. |
| `npm run validate` | pass | 23 validators clean. |
| `npm run violations:test` | pass | 29/29. |
| `npm run tuning-merge:test` | pass | 8/8. New suite. |
| `npm run setup-checks:test` | pass | 6/6. |
| `npm run init-prepare-interop:test` | pass | 33/33. |
| F1 fix — pre-fix comparison | pass | Simulated shallow spread: `m2` yields `{per_unit:5}` vs expected `{per_unit:5,cap:30}`; `m8` yields `NaN` vs expected 54. Both fail pre-fix, pass post-fix. |
| F1 defence in depth — finite-score guard | pass | Non-numeric weight produces a named error naming the key and the consequence, not a silent skip. |
| F2 fix — malformed glob | pass | Now fails at the config gate: `path_glob_categories.ui_globs expected type array, got string`. |
| F3 fix — RI1 grep across six tunables | pass | 4/4/3/1/1/6 instruction sites; `RESOLUTION` comment names six. |
| **Engine blast radius** | **fail** | 8 previously-decorative declarations newly enforced across 3 schemas; `verification.yaml`'s `commands[].env` is consumer-authored. Non-string values now rejected. Basis for F4. |

## Residual Risk

- **Carried from v1, unchanged:** the intent→tuning derivation has no mechanical correctness check; no live consumer repo has exercised the upgrade path end to end; `skill_scoring.triggers`' locked/tunable boundary is now prose rather than a file boundary; two Notion pages remain stale.
- **New:** the schema engine is now stricter than it was for every config in every consumer repo, not only for WP-R8's keys. F4 covers the one case verified to break; the other seven newly-enforced declarations were checked against this repo and its four examples and pass, but no consumer repo has been checked because none is available.
- **New:** `mergeTunedMap` merges exactly one level deep by deliberate choice. Nothing in the current tunable set nests deeper, so this is correct today — but a future tunable with three-level structure would reintroduce F1 one level down, and no test would catch it until someone wrote that config.

## Recommendation

hold

F1, F2, and F3 are properly fixed and independently re-verified — the merge is correct, the test
genuinely fails against the old implementation, the malformed-value case now fails in the right
layer, and the stale comment is accurate.

The hold is for F4, which the fix for F2 introduced: implementing a previously-ignored schema
keyword tightened validation for **every** config in every consumer repo, and a `verification.yaml`
that passed before 1.1.0 can fail after it. That falsifies RI9 and contradicts the explicit
non-blocking-upgrade decision. The engine fix is worth keeping; how to land it without breaking
existing repos is a release-level choice between scoping it, warning for one release, or accepting
it and re-checking the version bump. Recommend the deprecation window.
