---
slug: wp-r8-behavior-tuning
version: 3
artifact: review
status: ready-for-next-phase
created: 2026-08-14
updated: 2026-08-14
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9]
upstream:
  - workflow/artifacts/briefs/wp-r8-behavior-tuning-v1.md
  - workflow/artifacts/plans/wp-r8-behavior-tuning-v1.md
  - workflow/artifacts/tasks/wp-r8-behavior-tuning-v1.md
  - workflow/artifacts/reviews/wp-r8-behavior-tuning-v2.md
orchestration:
  phase: review
  status: ready-for-next-phase
  next_phase: test
  blockers: []
  user_checkpoint: none
---

# WP-R8 — Per-Repo Behavior Tuning - Review v3 (post-F4/F5)

Re-review after Phase 14 (F4 deprecation window) and Phase 15 (F5 schema-keyword audit). v1 and v2
stand unchanged as the record of the two prior holds. F4 and F5 are confirmed resolved. Three new
findings, none blocking.

## Findings

### F6 — P2 — `x_enforcement` is honoured only inside `additionalProperties`; anywhere else it silently does nothing

- **Area:** `src/workflow/validators/lib.mjs:812`, `src/workflow/validators/check-schema-keywords.mjs`
- **Manifest IDs:** RI9
- **Problem:** The deprecation-window marker is read in exactly one place — the `additionalProperties` branch. A schema author who marks any other declaration gets no deferral and no signal:

  ```
  properties: { age: { type: string, x_enforcement: warn-until-1.2.0 } }
  value: { age: 42 }
  → errors: 1  ("x.age expected type string, got number")
  → deferredWarnings: 0
  ```

  The marker was ignored and the failure was hard. That is the **fifth instance in this package of the same defect class**: a declaration that reads as a contract and is decoration. It is worse here than in the earlier four, because the marker's entire purpose is to soften a break — so a silently-ignored one turns an intended warning into exactly the hard failure F4 was raised to prevent.

  `check-schema-keywords.mjs` cannot catch this. It lists `x_enforcement` in `ANNOTATIONS`, which accepts it at any schema position by design, so the one validator built to detect ignored declarations is blind to the ignored declaration the same phase introduced.
- **Fix recommendation:** teach `check-schema-keywords.mjs` to accept `x_enforcement` **only** directly under a schema-valued `additionalProperties`, and error anywhere else naming the position. Small, and it closes the loop: the keyword validator then covers its own mechanism. Alternatively honour the marker generally in `validateSchema` — more code, and the generalised semantics are unclear for `required`/`const`, so the positional check is preferable.

### F7 — P2 — `lifecycle-artifact.schema.yaml` is never applied to anything, leaving 16 declared section requirements unenforced

- **Area:** `src/workflow/schemas/lifecycle-artifact.schema.yaml`, `src/workflow/validators/check-artifacts.mjs`
- **Manifest IDs:** none (pre-existing; surfaced by this package's F5 audit)
- **Problem:** `check-artifacts.mjs` validates only `parsed.frontmatter` against `artifact-frontmatter.schema.yaml`. `check-setup-complete.mjs` merely asserts the file exists. Nothing validates an artifact against `lifecycle-artifact.schema.yaml`, so its seven `if`/`then` branches never ran — before Phase 15 because the keyword was unimplemented, and after Phase 15 because the schema is unused.

  Body sections are enforced instead by `artifactContracts.requiredSections` hand-coded in `lib.mjs`. The two lists disagree, and the schema is the more demanding one. Measured delta:

  | Artifact | schema declares | actually enforced | declared-but-unenforced |
  |---|---|---|---|
  | brief | 14 | 7 | User Impact, Success Metrics, Requirements, Constraints, Risks, Open Questions, Questions For User |
  | task | 12 | 7 | Plan Phases Overview, Scope, Dispatch Log, Blockers, Phase Completion Log |
  | reflect | 13 | 9 | Inputs, Surprises, Deferred, Source-of-Truth Outcome |
  | plan / review / verify / ship | 7 / 6 / 7 / 8 | 7 / 7 / 8 / 9 | none |

  Sixteen requirements exist as a written contract nobody checks.
- **Fix recommendation:** **not in this package.** Wiring the schema in would newly enforce all 16 and could fail existing artifacts and `examples/`, which is the same unscoped-blast-radius shape as F2→F4 — a mistake this chain has already paid for once. Correct sequencing is a separate work package: wire the schema, run it against the whole artifact corpus, reconcile the two lists deliberately (either the schema relaxes to match `artifactContracts`, or the corpus is brought up to the schema), and pick a bump accordingly. Build did the right thing raising it rather than absorbing it.

### F8 — P3 — `check-schema-keywords.mjs` drifts safely in one direction only

- **Area:** `src/workflow/validators/check-schema-keywords.mjs`
- **Manifest IDs:** RI3
- **Problem:** `SUPPORTED` is maintained by hand. Adding a keyword to `validateSchema` without adding it here fails loudly the next time a schema uses it — the safe direction. But *removing* a keyword from `validateSchema` while it stays in `SUPPORTED` restores the original silence: schemas keep using it, the audit keeps passing, and the declaration is decoration again. The validator's own comment acknowledges the manual step; it does not acknowledge that only one direction is protected.
- **Fix recommendation:** either derive `SUPPORTED` by reading `lib.mjs` for `schema.<keyword>` accesses (fragile in a different way), or add a note in the file stating the asymmetry so a future editor knows removal is the unguarded path. The note is sufficient; this is a P3.

## Severity Summary

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 2 |
| P3 | 1 |

## Requirement Coverage

| Manifest ID | Evidence | Status | Notes |
|---|---|---|---|
| R1 | full `tuning:` block accepted; unknown key rejected by name | covered | — |
| R2 | `w-tuning-unknown-key` rejected by name | covered | — |
| R3 | looser-value and checkpoint-omission fixtures rejected | covered | — |
| R4 | `required:` untouched; consumer with non-string `env` now exits 0 with a warning | covered | v2's partial resolved by F4's fix. |
| R5 | intent block accepted; both floors rejected | covered | — |
| R6 | 10 predicates identical; predicate-rewrite fixture rejected | covered | Re-verified after the merge and engine changes. |
| R7 | fresh bootstrap emits PS-1..PS-11; file validates | covered | — |
| R8 | skew adds 3 items, idempotent, gate completes with items open | covered | — |
| RI1 | grep across all six tunables — 4/4/3/1/1/6 | covered | — |
| RI2 | `mergeTunedMap` 8/8; `m2`/`m8` fail pre-fix | covered | — |
| RI3 | bundles regenerated and content-verified; keyword audit wired into `validate` | covered | F8 is a residual on the new validator, not a coverage gap. |
| RI4 | 29/29 violations | covered | — |
| RI5 | locked-key fixture rejected; `tuning:` objects all closed | covered | — |
| RI6 | `config-map.md`; 69 field refs schema-checked | covered | — |
| RI7 | floor fixtures rejected naming permitted set | covered | — |
| RI8 | stale-provenance fixture rejected | covered | — |
| RI9 | own + 4 `examples/` profiles unedited and valid; predicate outcomes unchanged; previously-valid consumer config no longer fails | covered | v2's partial resolved. F6 is a latent risk to the mechanism, not a live breach. |

All 17 covered. No partial, missing, deferred, or removed rows.

## Architecture Notes

- role: Staff Reviewer
- **decision — the two prior holds are resolved on evidence.** F4: a consumer `verification.yaml` with `PORT: 8080` and `DEBUG: true` exits **0** with two warnings naming the keys, expected types, and enforcing version, while WP-R8's own `path_glob_categories` still fails hard — the split is exactly as designed. F5: the audit is wired into `npm run validate`, and firing was proven by injecting `maxProperties` into a real schema and confirming rejection by name, then restoring.
- **decision — `if`/`then` was implemented correctly even though it changes nothing today.** Unit-verified on three cases: a complete plan passes with 0 errors, dropping one section yields exactly 1, and a brief does not trigger the plan branch. Correct JSON Schema semantics — `if` contributes no errors of its own. It activates nothing only because the schema that uses it is unused (F7).
- **constraint — the marker mechanism is narrower than it looks.** F4's fix is sound where it is honoured, and F6 is the boundary: the same declaration in a different position behaves oppositely, with no signal. The mechanism is correct; its reach is undocumented and unguarded.
- **tradeoff — `pass-with-risk` rather than another `hold`.** F6 and F7 are both real, but neither breaks a declared requirement of this package: RI9 holds in fact (the mechanism works where used), and F7 predates the package entirely. Two holds have already been called on this chain and both were justified by a falsified requirement; this is not that. Holding again on latent risk would be severity inflation.
- **observation worth carrying to Reflect:** this package found the same defect class five times — `maximum`, schema-valued `additionalProperties`, `if`/`then`, `format`, and now `x_enforcement`. Four were pre-existing and one was introduced by the fix for the second. The pattern is not carelessness in any single case; it is that the hand-rolled engine accepts any key silently, so every declaration is a claim nothing verifies. `check-schema-keywords.mjs` closes this for schema keywords. F6 shows the class extends to custom extension keys too.
- **assumption Test must verify:** that the deferred-warning path is exercised end to end, not just at the validator level — a consumer-shaped repo carrying a non-string `env` should complete a full lifecycle phase with the warning present and the gate passing.
- **downstream:** Test may start. F6 and F7 are Ship-or-defer decisions; F8 is a comment. Ship still owes the two Notion corrections (Q1 allowlist home; Standard→Complex reclassification).

## Verification Reviewed

| Item | Outcome | Notes |
|---|---|---|
| `npm run build` | pass | Deterministic. |
| `npm run validate` | pass | 24 validators, including the new keyword audit. |
| `npm run violations:test` | pass | 29/29. |
| `npm run tuning-merge:test` | pass | 8/8. |
| `npm run setup-checks:test` | pass | 6/6. |
| `npm run init-prepare-interop:test` | pass | 33/33. |
| F4 — consumer `env` non-string | pass | Exit 0, two `!` warnings naming key, expected type, and v1.2.0. |
| F4 — WP-R8's own key non-array | pass | Hard error: `path_glob_categories.ui_globs expected type array, got string`. |
| F5 — audit fires | pass | Injected `maxProperties` into `domain.schema.yaml`: rejected by name with both remedies. Restored, clean. |
| F5 — `if`/`then` semantics | pass | Complete plan 0 errors; one section dropped 1 error; non-matching artifact 0 errors. |
| F5 — `format` replacement | pass | `pattern` accepts both `2026-08-12` and `2026-05-28T00:00:00Z`, matching the real corpus. |
| **`x_enforcement` outside `additionalProperties`** | **fail** | Marker ignored, hard error produced, `deferredWarnings` empty. Basis for F6. |
| **`lifecycle-artifact.schema.yaml` application** | **fail** | No validator applies it; 16 declared sections unenforced. Basis for F7. |

## Residual Risk

- **F6 and F7 carried as accepted risk**, per the recommendation below.
- **`if`/`then` has no production exercise.** It is unit-verified but runs against no real input, because its only consumer schema is unused. If F7 is ever actioned, that implementation becomes load-bearing on first use — the unit tests are the only thing standing behind it.
- **The deprecation window has no expiry mechanism.** `warn-until-1.2.0` is honoured by string prefix; nothing compares it to the current version or fails when 1.2.0 ships with the markers still present. Removal is a manual step someone must remember at release time. Worth a release-checklist entry rather than a finding.
- **Carried from v1/v2, unchanged:** intent→tuning derivation has no mechanical correctness check; no live consumer repo has exercised the upgrade path; `skill_scoring.triggers`' locked/tunable boundary is prose; `mergeTunedMap` is one level deep by design and a future three-level tunable would reintroduce F1 one level down; two Notion pages stale.

## Recommendation

pass-with-risk

F1 through F5 are all resolved and independently re-verified. The per-entry merge is correct and
proven against the pre-fix implementation, the malformed-value case fails in the right layer, the
upgrade path is non-blocking again for repos that never touched this feature, and the schema-keyword
audit now runs in `npm run validate` and demonstrably fires.

Accepted risk: **F6** (the `x_enforcement` marker works only inside `additionalProperties` and is
silently inert elsewhere — small fix, recommend taking it before Ship) and **F7** (the artifact
schema is unused and 16 section requirements go unenforced — pre-existing, and correctly refused as
scope creep; it needs its own package). Neither falsifies a requirement of WP-R8. **F8** is a
comment.

Test may start.
