---
slug: wp-r8-behavior-tuning
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-08-12
updated: 2026-08-14
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9]
upstream:
  - workflow/artifacts/briefs/wp-r8-behavior-tuning-v1.md
  - workflow/artifacts/plans/wp-r8-behavior-tuning-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# WP-R8 — Per-Repo Behavior Tuning - Task

## Active Phase

- Phase: Phase 19 — Ship S1 fix (release-readiness reads the latest review)
- Manifest IDs: RI3
- Exit gate: the ship artifact validates against a v4 showing P1:0 despite v1 showing P1:1; injecting P1:1 into v4 rejects it, proving the validator reads the latest review rather than merely skipping the first.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Schema surface | complete | R1, R2, R4, RI5 |
| Phase 2 - Cross-file union rule | complete | R3 |
| Phase 3 - Validator merge for scoring tunables | complete | RI2 |
| Phase 4 - Consumption points | complete | RI1 |
| Phase 5 - Negative fixtures | complete | RI4 |
| Phase 6 - Consumer documentation | superseded by Phase 11 — not executed | RI6 |
| Phase 7 - Rebuild and full verification | superseded by Phase 12 — not executed | RI3 |
| Phase 8 - Intent layer | complete | R5, RI7, RI8 |
| Phase 9 - Threshold split | complete | R6 |
| Phase 10 - Setup negotiation and upgrade skew | complete | R7, R8 |
| Phase 11 - Consumer documentation (supersedes 6) | complete | RI6 |
| Phase 12 - Rebuild and full verification (supersedes 7) | complete | RI3, RI9 |
| Phase 13 - Review fixes (F1, F2, F3) | complete | RI2, R1, RI1 |
| Phase 14 - Review v2 fix (F4 deprecation window) | complete | RI9, R4 |
| Phase 15 - Schema-keyword audit (F5) | complete | RI3 |
| Phase 16 - Review v3 fixes (F6, F7, F8) | complete | RI3, RI9 |
| Phase 17 - Review v4 fix (F9) | complete | RI3 |
| Phase 18 - Test T1 fix (tuning overlay regression cover) | complete | RI2, R6 |
| Phase 19 - Ship S1 fix (release-readiness latest review) | complete | RI3 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits (Phase 1) | `feat/wp-r8-behavior-tuning` | `?? workflow/artifacts/briefs/wp-r8-behavior-tuning-v1.md`, `?? workflow/artifacts/plans/wp-r8-behavior-tuning-v1.md` | Clean apart from this chain's own two untracked artifacts. No unrelated user changes present, so nothing to preserve or work around. Branch matches the plan's Branch Strategy: cut from `release/1.1.0`, not `main`. |
| At handoff | `feat/wp-r8-behavior-tuning` | 15 modified/untracked source + test paths, 3 chain artifacts | Scope confirmed by `check-scope-fence` against the plan's declared Touches for Phases 1-12. No unrelated user changes were present at any point, so none were overwritten or staged. Nothing committed — commit authorization not given. |

## Scope

**Phase 1 (complete).**
- In scope: `src/workflow/schemas/repo-profile.schema.yaml`, plus `src/workflow/validators/lib.mjs` by the user-approved amendment resolving B-1.
- Out of scope for the package: the schema's `required:` array, which must not change or 1.1.0 stops being a minor release (plan risk R-5).

**Phase 2 (complete).**
- In scope: `src/workflow/validators/check-config.mjs` — the one cross-file rule the schema cannot express.
- Out of scope: any key enumeration in that file (Q1 put the enumeration in the schema and nowhere else — adding a key list there would reverse that decision).

**Phase 3 (complete).**
- In scope: `src/workflow/validators/check-trigger-predicates.mjs`.
- Out of scope: `skill_scoring.triggers`, which stays global-only — a locked key; merging it would open per-repo predicate rewriting through the back door.

**Phase 4 (complete).**
- In scope: `src/workflow/skills/dispatch-subagents/SKILL.md`, `src/workflow/skills/dispatch-subagents/references/phase-caps.md`, `src/workflow/skills/dispatch-subagents/references/decision-tree-by-phase.md`, `src/workflow/skills/dispatch-subagents/references/output-schema.md`, `src/workflow/agent-behavior.yaml` (comments only), `src/workflow/rules.md`.
- Out of scope: any change to `agent-behavior.yaml` *values* — Phase 4 touches its comments only.

**Phase 19 (complete).**
- In scope: `src/workflow/validators/check-release-readiness.mjs` (review selection only).
- Out of scope: the historical review artifacts v1-v3. The available workaround was to edit them and insert "(fixed)" markers so the old severity counts would stop tripping the check; that is rewriting the record to satisfy a validator reading the wrong file, and it would have destroyed the evidence that two review rounds genuinely held.

**Phase 18 (complete).**
- In scope: `src/workflow/validators/check-trigger-predicates.mjs` (`--dir` support only), `test/fixtures/tuning-resolution/thresholds-applied/config/repo-profile.yaml`, `test/fixtures/tuning-resolution/weights-applied/config/repo-profile.yaml`, `test/run-tuning-merge-tests.mjs`.
- Out of scope: `src/workflow/validators/lib.mjs`. The initial T1 diagnosis proposed decoupling `_dataRoot` from `AGENTSMYTH_WF`; that diagnosis was wrong, the root resolver is correct as written, and changing it would have been an unnecessary edit to the most load-bearing file in the package.
- Also out of scope: the `expected-triggers.yaml` sandbox fixture, which stays as the untuned baseline both the control (m11) and `npm run validate` depend on.

**Phase 17 (complete).**
- In scope: `src/workflow/validators/check-artifacts.mjs` (baseline matcher only).
- Out of scope: the baseline contents, which are unchanged — this is a matcher-precision fix, not a debt change.

**Phase 16 (complete).**
- **In scope:** `src/workflow/validators/check-schema-keywords.mjs`, `src/workflow/validators/check-artifacts.mjs`, `src/workflow/schemas/artifact-baseline.schema.yaml`, `workflow/config/artifact-baseline.yaml`, `scripts/validate-template.mjs`.
- **Out of scope:** fixing the 96 grandfathered violations themselves. They are recorded as visible debt with a mechanism that forces them out one at a time; rewriting dozens of already-shipped historical artifacts is a separate decision.

**Phase 15 (complete).**
- **In scope:** `src/workflow/validators/check-schema-keywords.mjs` (new), `src/workflow/validators/README.md`, `scripts/validate-template.mjs`, plus whatever the audit finds in `src/workflow/schemas/*.yaml`.
- **Out of scope:** implementing every missing keyword. The audit reports; each finding is then implemented or removed on its merits.

**Phase 14 (complete).**
- **In scope:** `src/workflow/validators/lib.mjs` (`deferredWarnings` + `x_enforcement` handling), `src/workflow/schemas/verification.schema.yaml`, `src/workflow/schemas/agent-behavior.schema.yaml` (marker lines only).
- **Out of scope:** removing or weakening the Phase 13 engine fix itself — the fix is correct and stays; this phase only defers enforcement for declarations that predate it.

**Phase 13 (complete).**
- **In scope:** `src/workflow/validators/lib.mjs` (shared `mergeTunedMap`), `src/workflow/validators/check-trigger-predicates.mjs` (use it + finite-score guard), `src/workflow/schemas/repo-profile.schema.yaml` (F2 typing), `src/workflow/agent-behavior.yaml` (F3 comment), `test/run-tuning-merge-tests.mjs` (new), `package.json` (script wiring).
- **Out of scope:** any change to the derivation semantics themselves, the intent layer, or the locked-key set. This phase fixes how a partial edit merges, not what may be tuned.

**Phase 8 (complete).**
- In scope: `src/workflow/schemas/repo-profile.schema.yaml` (the `intent:` block), `src/workflow/validators/check-config.mjs` (provenance consistency check), and the three intent fixtures.
- Out of scope: the threshold split itself (Phase 9 — this phase declares the intent levels, Phase 9 makes thresholds tunable and symbolic); setup negotiation and skew (Phase 10); documentation (Phase 11); build products (Phase 12).

**Phase 5 (complete).**
- **In scope:** `test/fixtures/lifecycle-violations/w-tuning-unknown-key/`, `.../x-tuning-locked-key/`, `.../y-tuning-looser-value/`, `.../z-tuning-checkpoint-dropped/`, `test/run-violation-tests.mjs`, and `src/workflow/validators/check-config.mjs` (add `--dir` support — the runner invokes every validator that way, and without it these fixtures cannot be exercised by the negative suite at all).
- **Out of scope this phase:** the intent layer (Phase 8); threshold split (Phase 9); setup negotiation and skew (Phase 10); documentation (Phase 11); and all build products in `dist/`, root `validators/`, `workflow/schemas/` (Phase 12 regenerates these — never hand-edited).

## Changed Files

- `src/workflow/validators/check-release-readiness.mjs` — cross-check the latest review version rather than the oldest (Phase 19, Ship S1) — IDs: RI3
- `src/workflow/validators/check-trigger-predicates.mjs` — add `--dir <path>` so the tuning overlay can be exercised against a fixture profile (Phase 18, Test T1) — IDs: RI2, R6
- `test/fixtures/tuning-resolution/thresholds-applied/config/repo-profile.yaml` — tuned threshold fixture; must be rejected (Phase 18) — IDs: RI2
- `test/fixtures/tuning-resolution/weights-applied/config/repo-profile.yaml` — partial nested weight fixture, doubles as an end-to-end F1 guard; must be rejected (Phase 18) — IDs: RI2, R6
- `test/run-tuning-merge-tests.mjs` — m9/m10/m11 spawn the real validator so the merge wiring, not just the merge function, is covered (Phase 18) — IDs: RI2
- `src/workflow/schemas/repo-profile.schema.yaml` — add optional `tuning:` property with nested closed objects for the five allowlisted keys; `required:` untouched — IDs: R1, R2, R4, RI5
- `src/workflow/validators/lib.mjs` — implement the missing `maximum` keyword in `validateSchema`, mirroring the existing `minimum` branch (added by the user-approved Phase 1 amendment resolving blocker B-1) — IDs: R1
- `src/workflow/validators/check-config.mjs` — cross-file checkpoint-union rule, no key list — IDs: R3
- `src/workflow/validators/check-trigger-predicates.mjs` — per-entry merge of `weights` and `path_glob_categories`; `triggers` stays global — IDs: RI2
- `src/workflow/skills/dispatch-subagents/SKILL.md` — resolve `dispatch.enabled` before authorization; `disabled` refuses in every phase — IDs: RI1
- `src/workflow/skills/dispatch-subagents/references/phase-caps.md` — resolve cap global-then-repo-local; `dispatch.enabled` checked first — IDs: RI1
- `src/workflow/skills/dispatch-subagents/references/decision-tree-by-phase.md` — removed two hardcoded `(3)` cap literals — IDs: RI1
- `src/workflow/skills/dispatch-subagents/references/output-schema.md` — acceptance criteria name the resolved values — IDs: RI1
- `src/workflow/agent-behavior.yaml` — `RESOLUTION` comment block stating per-entry semantics for `weights`/`path_glob_categories` and that `triggers` is not tunable (comments only, no value changes) — IDs: RI1
- `src/workflow/rules.md` — Approval section states the resolved checkpoint list is global unioned with repo-local, additive in effect, never relaxing per-artifact enforcement — IDs: RI1
- `test/fixtures/lifecycle-violations/w-tuning-unknown-key/config/repo-profile.yaml` — non-allowlisted key under `tuning:` — IDs: R2, RI4
- `test/fixtures/lifecycle-violations/x-tuning-locked-key/config/repo-profile.yaml` — locked key (`task_classes`) under `tuning:` — IDs: RI5, RI4
- `test/fixtures/lifecycle-violations/y-tuning-looser-value/config/repo-profile.yaml` — `dispatch.enabled: required`, the forbidden looser direction — IDs: R3, RI4
- `test/fixtures/lifecycle-violations/z-tuning-checkpoint-dropped/config/repo-profile.yaml` — tuned checkpoint list dropping `ship-review` — IDs: R3, RI4
- `test/run-violation-tests.mjs` — register the four new fixtures — IDs: RI4
- `src/workflow/validators/check-config.mjs` — add `--dir` support so the negative suite can point config reads at a fixture tree — IDs: RI4
- `src/workflow/schemas/repo-profile.schema.yaml` — `intent:` block (8 concerns, surface_map, appetites, derived_keys) plus `concern_level`/`concern_level_floored` `$defs` enforcing the two floors — IDs: R5, RI7
- `src/workflow/validators/check-config.mjs` — `derived_keys` stale-provenance check — IDs: RI8
- `test/fixtures/lifecycle-violations/aa-intent-floor-constraints/config/repo-profile.yaml` — `constraints_safety: not-applicable` — IDs: RI7
- `test/fixtures/lifecycle-violations/ab-intent-floor-alignment/config/repo-profile.yaml` — `repo_alignment: not-applicable` — IDs: RI7
- `test/fixtures/lifecycle-violations/ac-intent-stale-provenance/config/repo-profile.yaml` — `derived_keys` naming an absent tuning key — IDs: RI8
- `src/workflow/agent-behavior.yaml` — `skill_scoring.thresholds` added; five predicates rewritten to reference thresholds symbolically (values unchanged) — IDs: R6
- `src/workflow/validators/check-trigger-predicates.mjs` — symbolic threshold resolution with per-entry merge; unknown symbol throws — IDs: R6
- `src/workflow/schemas/agent-behavior.schema.yaml` — declare `skill_scoring.thresholds` — IDs: R6
- `src/workflow/schemas/repo-profile.schema.yaml` — `tuning.skill_scoring.thresholds` — IDs: R6
- `src/workflow/skills/repo-alignment-scan/SKILL.md` — predicate text matches the new symbolic form — IDs: R6
- `src/workflow/skills/architecture-decision-advisor/SKILL.md` — predicate text matches the new symbolic form — IDs: R6
- `src/workflow/skills/system-design-advisor/SKILL.md` — predicate text matches the new symbolic form — IDs: R6
- `src/workflow/skills/clean-code-architect/SKILL.md` — predicate text matches the new symbolic form — IDs: R6
- `src/workflow/skills/performance-optimizer/SKILL.md` — predicate text matches the new symbolic form — IDs: R6
- `bin/agentsmyth.mjs` — `intentItemSpecs()`/`intentPendingItems()`/`appendIntentPendingItems()`; intent items seeded at bootstrap and appended on skew, both non-blocking — IDs: R7, R8
- `src/workflow/router.md` — step 8 of the pending-setup pass: intent resolution order, derivation into `tuning:`, `derived_keys` recording, and the explicit non-blocking rule — IDs: R7, R8
- `src/setup/references/config-map.md` — "Per-Repo Behavior Tuning" section: interview questions, all eight concerns and the skills each governs, the six derived values, resolution rules, and the locked set with its rationale — IDs: RI6
- `src/workflow/validators/README.md` — documents the two checks `check-config.mjs` performs beyond schema validation, and why neither carries a key list — IDs: RI6
- `docs/knowledge-map/repo-mental-map.md` — new "Per-Repo Behavior Tuning (WP-R8)" section; version-skew paragraph updated to note the warning now writes pending-setup proposals — IDs: RI6
- `src/workflow/validators/lib.mjs` — exported `mergeTunedMap()` (one-level-deeper per-entry merge, F1); implemented schema-valued `additionalProperties` in `validateSchema`, previously parsed and silently ignored (F2) — IDs: RI2, R1
- `src/workflow/validators/check-trigger-predicates.mjs` — use `mergeTunedMap()` for all three scoring maps; finite-score guard (F1) — IDs: RI2
- `src/workflow/schemas/repo-profile.schema.yaml` — `tuning.skill_scoring.path_glob_categories` typed as array-of-string, matching the global schema (F2) — IDs: R1
- `src/workflow/agent-behavior.yaml` — `RESOLUTION` comment names all six tunables and states that per-entry reaches one level into map-valued entries (F3) — IDs: RI1
- `test/run-tuning-merge-tests.mjs` — new positive suite, 8 assertions; `m2`/`m8` verified to fail against the pre-fix merge — IDs: RI2
- `package.json` — `tuning-merge:test` script — IDs: RI2
- `src/workflow/validators/lib.mjs` — `deferredWarnings` channel and `x_enforcement: warn-until-<version>` handling in the additionalProperties branch; `finish()` prints warnings without failing (F4) — IDs: RI9, R4
- `src/workflow/schemas/verification.schema.yaml` — `commands[].env` marked `warn-until-1.2.0` (consumer-authored; the one real break) — IDs: RI9
- `src/workflow/schemas/agent-behavior.schema.yaml` — five pre-existing declarations marked `warn-until-1.2.0` — IDs: RI9
- `src/workflow/validators/check-schema-keywords.mjs` — new: structural keyword audit across all shipped schemas (F5) — IDs: RI3
- `src/workflow/validators/lib.mjs` — implement `if`/`then`/`else` conditional subschemas (F5) — IDs: RI3
- `src/workflow/schemas/artifact-frontmatter.schema.yaml` — `format: date-time` replaced with an enforceable `pattern` accepting both date and date-time forms (F5) — IDs: RI3
- `scripts/validate-template.mjs` — run `check-schema-keywords.mjs` in `npm run validate` — IDs: RI3
- `src/workflow/validators/README.md` — document `check-schema-keywords.mjs` and why a check beats a documented list — IDs: RI3
- `src/workflow/validators/check-schema-keywords.mjs` — `x_enforcement` made positional (F6); one-way-drift note (F8) — IDs: RI3
- `src/workflow/validators/check-artifacts.mjs` — `--baseline` ratchet: per-file-and-message suppression, stale entries error (F7) — IDs: RI3, RI9
- `src/workflow/schemas/artifact-baseline.schema.yaml` — new schema for the baseline ledger (F7) — IDs: RI3
- `workflow/config/artifact-baseline.yaml` — 96 pre-existing violations recorded as visible, shrink-only debt (F7) — IDs: RI3
- `scripts/validate-template.mjs` — run `check-artifacts.mjs` in `npm run validate`, which it never was (F7) — IDs: RI3
- `src/workflow/validators/check-artifacts.mjs` — baseline matcher compares the message exactly rather than by substring (F9) — IDs: RI3
- `dist/workflow-bundle.md`, `dist/setup-bundle.md`, `validators/`, `workflow/schemas/` — **regenerated** by `npm run build` in Phase 12, never hand-edited. Gitignored, so they produce no `git status` entry; verified by content instead (`concern_level_floored`, `skill_scoring.thresholds`, `derived_keys`, the symbolic predicate, and the resolved-dispatch prose all present) and by a second build producing no further change. This is also where RI9's back-compat guarantee is proven: these regenerated outputs, plus this repo's own and all four `examples/` profiles left unedited, validate and yield the same 10 predicate outcomes as before the package — IDs: RI3, RI9
- `test/fixtures/lifecycle-violations/ad-tuning-trigger-rewrite/config/repo-profile.yaml` — attempts predicate rewrite via `tuning:` — IDs: R6

## Implementation Log

**Phase 1 — `tuning:` block added to `src/workflow/schemas/repo-profile.schema.yaml`.** New optional top-level property with nested closed objects (`additionalProperties: false`) for `dispatch`, `skill_scoring`, and `pause_resume`, declaring only the five allowlisted leaves. `required:` untouched. Each leaf carries a `description:` stating its value domain and the governing rule; the block-level description enumerates the locked set and both resolution semantics (override, with union as the single exception).

**Gate exercised against a scratch repo** (`scratchpad/r8gate/`, a throwaway git repo with a `workflow/config/repo-profile.yaml` and `AGENTSMYTH_HOME` pointed at `src/workflow`) rather than by mutating this repo's own config — brief A3 says this repo's profile gains no `tuning:` block, so the positive case needed a home elsewhere. Four cases run; results in Command Results below.

**BLOCKER B-1 found while running case C.** The hand-rolled schema engine in `src/workflow/validators/lib.mjs` implements `minimum` (line 673) but **not `maximum`**. The keyword is parsed and silently ignored, so `tuning.dispatch.max_parallel_workstreams: 99` validates clean despite the schema declaring `maximum: 10`. Verified two ways: `sed -n '665,685p' src/workflow/validators/lib.mjs` shows `minLength`, `minimum`, `minItems`, and `uniqueItems` handling with no `maximum` branch; and `grep -rn "maximum:" src/workflow/schemas/` returns exactly one hit — line 259 of the file I just wrote. No pre-existing schema uses `maximum`, so this is not a latent repo-wide defect: it is a keyword the engine never needed until this change, and the value domain the plan declared (0–10) is currently half-enforced.

Phase 1 was paused for a scope decision rather than expanding into `lib.mjs` unilaterally (Build determinism rule: no silent scope expansion).

**B-1 resolved 2026-08-12, user-approved: amend Phase 1's touches and fix the engine.** The plan artifact was amended first (Phase 1 touches, Repo Impact Map, exit gate), then `src/workflow/validators/lib.mjs` gained a `maximum` branch mirroring the existing `minimum` handling at line 673, including its `typeof value === 'number'` guard. A comment records why the keyword was missing and that WP-R8 was the first schema in the repo to use it.

Per Build workflow rule 6b (a change to a check boundary must be verified across representative cases, not just the motivating one), the range was exercised at four points rather than one: `99` → rejected above maximum; `-1` → rejected below minimum; `10` → accepted, confirming the bound is inclusive as JSON Schema specifies; `1` → accepted (the original positive case). Then the full suite was re-run to confirm the shared engine change altered nothing else: 23/23 validators ok and 21/21 violation fixtures still detected.

Phase 1 complete. All four exit-gate conditions met.

**Phase 2 — cross-file union rule added to `src/workflow/validators/check-config.mjs`.** A `checkTuningCheckpointUnion()` function, called only for `kind: repo-profile`, loads `defsPath('agent-behavior.yaml')` and asserts the tuned `user_checkpoint_required_for` contains every globally-required checkpoint, naming any that were dropped.

Three deliberate choices worth recording. First, **no key list appears in this file** — the enumeration stays solely in the schema per Q1, and the function reaches for exactly one key path rather than iterating an allowlist. Second, a **missing `agent-behavior.yaml` is recorded as a skipped check in `details`, not silently ignored** — a repo may legitimately be validated before its definitions root resolves (fresh init, or CI checking out without a global install), and `verification.yaml`'s `record_not_run_as_risk: true` means a skipped check must never read as a passing one. Third, the error message states the *rule* ("append-only … a repo may add checkpoints but never remove one") alongside the dropped names, because the person who hits this will not have the WP page open.

Verified in both directions against the scratch repo: a tuned list adding `build-review` while keeping all three global entries passes and logs the union check; the same list with `ship-review` removed fails, naming `ship-review`. Full suite re-run: 23/23 validators ok, 21/21 violation fixtures detected.

Phase 2 complete.

**Phase 3 — per-entry merge in `check-trigger-predicates.mjs`.** Object spread with the tuned map last, for both `weights` and `path_glob_categories`. `triggers` stays global-only. Evidence in Command Results.

**Phase 4 — consumption points created for all five tunables.**

`max_parallel_workstreams`: `phase-caps.md` now instructs resolve-global-then-repo-local instead of "read `agent-behavior.yaml`"; `decision-tree-by-phase.md` lost both hardcoded `(3)` literals; `output-schema.md`'s acceptance criterion names the resolved value.

`dispatch.enabled` — consumption point **created**, it had none. `dispatch-subagents/SKILL.md` now checks it *before* authorization: a resolved `disabled` refuses dispatch in every phase even with explicit user authorization, on the reasoning that a repo turning delegation off is a standing decision a per-session authorization does not reverse. `optional` preserves today's behavior.

`user_checkpoint_required_for` — consumption point **created**, it had none. `rules.md`'s Approval section now states that which phases require a checkpoint is the *resolved* list: global unioned with repo-local. Written deliberately so the list can only ever *add* a checkpoint — the per-artifact `orchestration.user_checkpoint` enforcement is stated as independent and never relaxed by tuning. This is the surface plan risk R-8 flagged as sitting next to a commit-blocking gate, so the prose says what tuning cannot do, not only what it can.

`weights` and `path_glob_categories`: a `RESOLUTION` block at the head of `agent-behavior.yaml`'s `skill_scoring` section states per-entry semantics in the agent's own terms — "a repo naming one weight or one glob category is changing that one thing, not deleting the rest" — and states that `triggers` is not tunable.

All three exit-gate conditions verified. Condition (1): the only remaining unqualified "read from `agent-behavior.yaml`" instructions are for locked keys (`evidence_policy`, `waivers`, `task_classes`), which is correct. Condition (2): each of the five has at least one instruction naming it as a value to resolve. Condition (3): `rules.md` states the union is additive in effect, not merely in shape.

Phase 4 complete. 23/23 validators ok, 21/21 fixtures detected.

**Phase 5 — four negative fixtures added, suite now 25/25.** `w-tuning-unknown-key` (non-allowlisted key), `x-tuning-locked-key` (`task_classes`), `y-tuning-looser-value` (`dispatch.enabled: required`), `z-tuning-checkpoint-dropped` (drops `ship-review`).

Required adding `--dir` support to `check-config.mjs`: `test/run-violation-tests.mjs` invokes every validator as `<validator> --dir <fixture>`, and `check-config.mjs` had no such flag, so without it these fixtures could not be exercised by the negative suite at all. Definitions reads (schemas, `agent-behavior.yaml`) still resolve through `defsPath` and are unaffected.

Each fixture was then verified to fail for its *intended* reason, not incidentally — the runner only checks exit status, so a fixture with a malformed base profile would report `[PASS]` while testing nothing. Run individually, each produces exactly one error naming its own rule: `tuning.retry_policy is not allowed`; `tuning.task_classes is not allowed`; `expected one of optional, disabled, got "required"`; `drops 1 globally-required checkpoint(s): ship-review`.

**`check-scope-fence` caught two real defects in my own artifacts during this phase**, which is the validator doing its job. First, the task Scope section had never declared Phase 4's touch list. Second — the substantive one — the plan's Phase 4 and Phase 5 Touches used ellipsis abbreviations (`.../decision-tree-by-phase.md`, `.../x-tuning-locked-key/`) that read fine to a human but match nothing: the validator does exact-path or directory-prefix matching. Both were rewritten to full paths. Any phase whose Touches are abbreviated that way has no effective scope fence at all.

Phase 5 complete.

**Phase 8 — intent layer added.** An `intent:` block alongside `tuning:`, carrying `repo_character`, `surface_map`, `concerns` (8 areas), `parallelism_appetite`, `review_ceremony`, and `derived_keys`.

The two floors turned out to be **schema-expressible**, which is better than the validator code I had planned: two `$defs` — `concern_level` (4 levels) and `concern_level_floored` (3, omitting `not-applicable`) — with `repo_alignment` and `constraints_safety` `$ref`-ing the floored one. That keeps value domains in the schema where Q1 put them, and the rejection message names the permitted set without any hand-written check.

Two absences are deliberate and documented in the schema's own descriptions. `parallelism_appetite` has no level deriving `enabled: required` — that is the looser direction the governing rule forbids, so it has no representation rather than being validated against after the fact. `review_ceremony` has no level that removes a checkpoint, because the union can only add.

`derived_keys` (RI8) is the provenance record: dotted paths of `tuning:` values the agent derived. A listed key may be safely re-derived by a later version; anything under `tuning:` *not* listed was set by hand and must never be silently overwritten. `check-config.mjs` gained a check for the failure mode that degrades quietly — a **stale** entry naming a key that no longer exists under `tuning:`, meaning intent and tuning have drifted and the next upgrade would reason from provenance that no longer describes the file. Nothing else in the system would ever notice that.

All four exit-gate conditions verified against the scratch repo: intent-only profile accepted; both floors rejected naming the permitted set; provenance accepted when consistent (`provenance (1 key(s))`) and rejected when stale.

Three fixtures added (`aa-intent-floor-constraints`, `ab-intent-floor-alignment`, `ac-intent-stale-provenance`), each verified to fail for its own reason. Suite 25/25 → **28/28**; `npm run validate` clean.

Phase 8 complete.

**Phase 9 — thresholds split out of the locked `triggers` key.** Five numeric cut-offs moved from inline literals into `skill_scoring.thresholds`, with predicates referencing them symbolically (`complexity_score >= thresholds.domain.clean-code-architect`). `thresholds` is tunable per-entry; `triggers` stays locked and global. A repo moves numbers, never boolean structure — so it can change how often a skill fires and can never make one unreachable by rewriting its condition.

The evaluator's `>=` matcher previously captured `(\d+)`. Threshold symbols carry dots and hyphens, so it now captures the RHS whole and classifies after — literal, `thresholds.<name>`, or error. **An unresolvable symbol throws rather than defaulting to 0**: a silent 0 would make every predicate referencing the typo fire unconditionally, which is precisely the quiet wrong answer this validator exists to catch. Verified against a deliberately typo'd copy of `agent-behavior.yaml` in a scratch tree — `predicate references unknown threshold "domain.clean-code-architekt"`.

Back-compat is the load-bearing claim here and it holds: all 10 predicates evaluate identically to pre-change against the sandbox fixture, because the extracted values are the same literals that were inline. Tunability proven separately — lowering `domain.clean-code-architect` from 50 to 40 makes the scenario's score of 48 clear it, flipping the skill to `ran`, and per-entry merge left the other four thresholds untouched.

Predicate text in the five affected `SKILL.md` files was updated to match, so the shipped skill prose and the config no longer disagree.

Fixture `ad-tuning-trigger-rewrite` attempts to neuter `clean-code-architect` by rewriting its predicate to `complexity_score >= 9999`; rejected as `tuning.skill_scoring.triggers is not allowed`, since `triggers` has no place in the closed `tuning.skill_scoring` object. Suite 28/28 → **29/29**; `npm run validate` clean.

Phase 9 complete.

**Phase 10 — setup negotiation and upgrade skew.** Three intent items (`repo_character`, `surface_map`, `concerns`) are seeded by `init`'s headless bootstrap as PS-9..PS-11, and appended to an existing `pending-setup.yaml` on version skew. Both paths hand off to the router's existing session-start resolution pass; `router.md` gained step 8 covering resolution order, derivation into `tuning:`, `derived_keys` recording, and an explicit statement that these never gate lifecycle work.

The skew warning previously led nowhere — it told you to run `prepare` and stopped. It now writes the newer version's config surfaces as proposals. Ordering is deliberate: `repo_character` and `surface_map` are usually settleable by inspection, and their answers supply a recommended default for `concerns`, so the one genuinely human question arrives with a proposed answer instead of cold. `router.md` forbids asking for a bare `concerns` map with no recommendation attached.

**A real bug, caught by testing rather than by reading.** The first skew run printed the warning but silently added nothing. Cause: `INTENT_PENDING_ITEMS` was a `const` declared ~100 lines below the `check` command that calls it, so it sat in the temporal dead zone and threw `ReferenceError` — which my own `try/catch` swallowed into a no-op. Two fixes, and the second matters more than the first: the array became a hoisted `function intentItemSpecs()`, and the catch now reports what it caught instead of discarding it. A silent catch around a proposal-writing step is the same antipattern I called out in Phase 2's missing-`agent-behavior.yaml` branch, and here it had already hidden a live defect.

Verified: skew on a v0.9.0-stamped repo adds 3 items and prints what it did; three consecutive `check` runs leave exactly 4 items, so it is idempotent and cannot resurrect items the user has already settled or dismissed; a fresh bootstrap emits PS-1..PS-11 in file order; both generated `pending-setup.yaml` files validate against their schema. The gate ran to completion in every case with items open — non-blocking confirmed, per R8.

`check-scope-fence` caught one more artifact defect: a `{a,b,c}` brace-expansion path in Changed Files, which matches nothing — the same class as Phase 5's ellipsis. Expanded to one line per file.

Regression: `npm run validate` clean, 29/29 violations, 6/6 setup-complete checks, 33/33 init/prepare interop checks.

Phase 10 complete.

**Phase 11 — consumer documentation.** A "Per-Repo Behavior Tuning" section in `config-map.md` covering both layers: the six interview questions and their target fields, all eight concerns with the skills each governs and when each is legitimately `not-applicable`, the six derived mechanism values, the resolution rules, and the locked set with the reason for it.

Written so the locked set is explained rather than merely listed — a repo able to edit `task_classes` could classify all work as trivial and skip every phase; a repo able to edit the required-fields list under `waivers` could bypass every field that makes an exemption reviewable. The fourteen gate-bound skills absent from the concern map are named individually so nobody has to wonder whether the omission was an oversight.

`check-setup-refs.mjs` cross-checks every backticked field path in `config-map.md` against the real schemas, which makes the doc mechanically drift-proof rather than merely proofread: 69 field references checked, all resolving. Worth noting the validator reads schemas via `defsPath`, so running it bare resolves against the stale global install — `AGENTSMYTH_WF=src/workflow` is required for source-level checks, which is what `npm run validate` passes.

`validators/README.md` documents the two things `check-config.mjs` now does beyond schema validation, and states why neither carries a key list. `repo-mental-map.md` gained a WP-R8 section and an updated version-skew paragraph noting the warning now leads somewhere.

**`check-waivers.mjs` flagged my own Phase 10 prose** as a possible unstructured waiver claim, because the sentence contained the word "waived". A false positive from a deliberately broad heuristic — the right response is to reword the prose, not to suppress the check, since a heuristic that only fires on genuine waivers would miss the ones written casually. Reworded.

Phase 11 complete. `npm run validate` clean, 29/29 violations.

**Phase 12 — rebuild and full verification.** `npm run build` regenerated both bundles, the root `validators/` copy, and the `workflow/schemas/` sync.

On RI3's generated-output evidence: `git status` on `dist/`, `validators/`, and `workflow/schemas/` shows **no diff**, but that proves nothing — all three are gitignored and untracked (`.gitignore` lines 2, 3, 8), so they cannot show a diff and cannot be hand-edited into a commit either. `verification.yaml`'s `generated_output.source_only_inspection_is_not_enough` is explicit that inspection alone is insufficient, so the real evidence is content: `dist/workflow-bundle.md` carries `concern_level_floored` (3), `skill_scoring.thresholds` (4), `derived_keys` (7), the symbolic `thresholds.domain.clean-code-architect` predicate (3), and the resolved-dispatch instructions (6); `dist/setup-bundle.md` carries the "Per-Repo Behavior Tuning" documentation section. Building twice produced no further change, so the build is deterministic.

RI9 — the back-compat claim holding 1.1.0 to a minor — verified three ways: this repo's own `workflow/config/` and all four `examples/` profiles are **unedited** (`git status` clean for both paths) and validate; `check-trigger-predicates.mjs` reports the same 10 predicate outcomes as before the package began, because the extracted thresholds are the same literals that were inline; and `intent:`/`tuning:` are both optional additions to a schema whose `required:` array never changed.

`check-waivers.mjs` fired a second false positive on Phase 11's own log text, for the same reason as the first — prose about what a repo could do to `waivers.required_fields` reads like an unstructured waiver claim. Reworded again rather than suppressed.

Final gate: `npm run build` ok, `npm run validate` clean (23 validators), `npm run violations:test` 29/29, `npm run setup-checks:test` 6/6, `npm run init-prepare-interop:test` 33/33.

Phase 12 complete.

**Phase 13 — Review findings F1, F2, F3 fixed.**

**F1.** The merge moved into an exported `mergeTunedMap()` in `lib.mjs` that reaches one level into map-valued entries, so a repo tuning `files_touched.per_unit` keeps the global `cap`. Added a finite-score guard in `check-trigger-predicates.mjs` as defence in depth: a non-finite `complexity_score` now fails with a named error instead of silently making every threshold comparison false.

Covered by a new positive suite, `test/run-tuning-merge-tests.mjs` (8 assertions, wired as `npm run tuning-merge:test`), because the existing suites could not serve as proof — both already passed with the defect present. Verified the two key assertions genuinely fail against the pre-fix shallow spread: `m2` yields `{per_unit: 5}` instead of `{per_unit: 5, cap: 30}`, and `m8` yields `NaN` instead of 54. A test that passes either way would have proven nothing.

**F2 — larger than filed.** Typing the key correctly had no effect at first: the schema engine **only ever understood `additionalProperties: false`** and silently ignored the schema-valued form. So the global `agent-behavior.schema.yaml` was not validating `path_glob_categories` (arrays of strings), `triggers` (strings), or `thresholds` (integers) either — three open maps unchecked since they were written. Same class as the Phase 1 `maximum` gap: a keyword parsed and discarded.

Implemented schema-valued `additionalProperties` in `validateSchema`, deliberately not gated on `schema.properties` existing — a pure map schema has no declared keys, and the properties-gated block skipped it entirely, which is exactly how this stayed invisible. Newly enforcing three previously-unchecked declarations broke nothing: `npm run validate` clean. The malformed value now fails at the config gate: `tuning.skill_scoring.path_glob_categories.ui_globs expected type array, got string`.

**F3.** The `RESOLUTION` comment now names six tunables, says which three live in that block and which three do not, and states that per-entry reaches one level into map-valued entries — with the NaN consequence spelled out, since that is what makes the depth non-obvious. RI1's grep re-run across all six: every tunable has instruction sites (4, 4, 3, 1, 1, 6).

Full suite: build ok, validate clean, 29/29 violations, 8/8 tuning-merge, 6/6 setup-complete, 33/33 init/prepare interop.

Phase 13 complete.

**Phase 14 — F4 fixed via the deprecation window (user-chosen route).**

Phase 13's engine fix was correct but unscoped: implementing schema-valued `additionalProperties` newly enforced 8 declarations, 6 of them outside WP-R8. The dangerous one was `verification.schema.yaml`'s `commands[].env` — consumer-authored, so a repo that wrote `env: {PORT: 8080}` passed before 1.1.0 and failed after, on upgrade. That falsified RI9 and contradicted the non-blocking-upgrade decision.

Implemented as a declarative marker rather than a hardcoded key list: a schema declaration carrying `x_enforcement: warn-until-<version>` is still validated, but failures route to `deferredWarnings` and print as `!` lines without failing the gate. The **temporary exception** is what carries the marker, not the permanent rule — so when the window closes, deleting the six marker lines turns enforcement on with no code change and nothing to remember.

Verified both directions. A consumer `verification.yaml` with `PORT: 8080` and `DEBUG: true` now exits **0** with two warnings naming the keys, the expected types, and the version they start failing at. WP-R8's own `tuning.skill_scoring.path_glob_categories` has no marker and still fails hard: `expected type array, got string`. New surfaces enforce immediately; pre-existing ones get a release.

Full suite: build ok, validate clean, 29/29 violations, 8/8 tuning-merge, 6/6 setup-complete, 33/33 interop.

Phase 14 complete.

**Phase 15 — F5 fixed: `check-schema-keywords.mjs`, wired into `npm run validate`.**

It structurally walks every shipped schema — descending only into real schema positions, so property *names* are never mistaken for keywords — and fails on any keyword `validateSchema` does not implement. Proven to fire by injecting `maxProperties` into `domain.schema.yaml`: rejected by name with the reason and both remedies, then restored and clean.

The audit immediately found **two more dead declarations**, bringing the tally to four in this package:

- **`format: date-time`** on `created`/`updated` — unimplemented, *and* wrong: the real corpus carries both `2026-08-12` and `2026-05-28T00:00:00Z`, so it never described the data. Replaced with a `pattern` that the engine does enforce and that accepts both forms.
- **`if`/`then`** — seven conditional branches in `lifecycle-artifact.schema.yaml`, ignored entirely. Implemented with correct JSON Schema semantics: `if` is evaluated for validity only and contributes no errors of its own, so a non-matching branch stays silent. Unit-verified three ways — a complete plan passes with 0 errors, dropping one section yields exactly 1, and a brief does not trigger the plan branch at all.

**A finding I am deliberately not acting on, because acting on it is a separate decision.** Implementing `if`/`then` did not activate those seven branches, because **`lifecycle-artifact.schema.yaml` is never applied to anything.** `check-artifacts.mjs` validates only `parsed.frontmatter` against `artifact-frontmatter.schema.yaml`; `check-setup-complete.mjs` merely asserts the file exists. Body sections are enforced instead by `artifactContracts.requiredSections` hand-coded in `lib.mjs`. So the branches were doubly dead — unsupported keyword *and* unused schema.

Wiring that schema in would newly enforce 16 section requirements the hand-coded lists omit (brief: User Impact, Success Metrics, Requirements, Constraints, Risks, Open Questions, Questions For User; task: Plan Phases Overview, Scope, Dispatch Log, Blockers, Phase Completion Log; reflect: Inputs, Surprises, Deferred, Source-of-Truth Outcome) and could fail existing artifacts and examples. That is exactly the shape of the F2→F4 mistake — a correct-looking fix with unscoped blast radius — so it is raised for decision rather than absorbed.

Full suite: build ok, validate clean (24 validators), 29/29 violations, 8/8 tuning-merge, 6/6 setup-complete, 33/33 interop.

Phase 15 complete.

**Phase 16 — F6, F7, F8 fixed.**

**F6.** `x_enforcement` is now positional in `check-schema-keywords.mjs`: legal directly on a schema-valued `additionalProperties`, an error anywhere else. Verified by injecting it at a schema root — rejected naming the position and stating why a marker that looks like it defers enforcement but does not is worse than no marker. The keyword validator now covers its own mechanism.

**F8.** The one-way drift is documented in the file an editor will actually be looking at: adding a keyword without listing it fails loudly; *removing* one while it stays listed restores the original silence. "Delete a branch, delete its entry in the same commit."

**F7 — the filed finding was the symptom.** Investigation found `check-artifacts.mjs` was never invoked against real artifacts at all: it appears in neither list in `validate-template.mjs`, and its only callers are `run-violation-tests.mjs` and `run-conformance-tests.mjs`, both fixture-only. So this repo's own artifacts were never frontmatter- or section-checked, and **96 violations accumulated across 67 files**. It also explains the original F7: the 16 unenforced section requirements went unnoticed because section enforcement was not running at all. Worse, other validators defer to it — `check-waivers.mjs:127` skips structural frontmatter errors as "check-artifacts's job" — so those errors fell through a gap between two validators, each assuming the other had it.

Fixed per the user's decision — grandfather what exists, enforce everything new — with a **ratchet** rather than an exemption list. `--baseline <path>` suppresses violations recorded in a checked-in, schema-validated file. Three properties make it tighten-only:

1. An entry matches one specific **file-and-message pair**, so a *new* violation in an *old* file still fails. Grandfathering covers the debt that existed, never the file carrying it.
2. A **stale entry is an error**. Fixing an artifact forces its entry out, and nobody can leave dead suppressions behind to cover a future regression.
3. The list is **checked in and schema-validated**, so the debt is visible and reviewable rather than hidden behind a flag.

Blast radius checked before wiring: `scripts/` is not in `package.json` `files`, so `validate-template.mjs` never ships. Consumers run `agentsmyth check` (check-lifecycle + check-setup-complete). **Zero consumer impact** — this is entirely a dev-gate change.

Verified four ways: baseline run reports 96 grandfathered / 0 new / 0 stale; a bogus key injected into an already-grandfathered file still fails; a fabricated stale entry fails with a removal instruction; and **no artifact from this chain appears in the baseline** — this package's own work is enforced, not excused.

Full suite: build ok, validate clean (25 validators), 29/29 violations, 8/8 tuning-merge, 6/6 setup-complete, 33/33 interop.

Phase 16 complete.

**Phase 17 — F9 fixed: the baseline matcher compares exactly.** It now strips `entry.file` from the front of the violation and requires strict equality with `entry.message`, replacing a substring test that let a hand-broadened entry absorb a *different* violation of the same shape while `stale` stayed 0 — silently defeating the one mechanism that forces entries out.

Verified both directions: the real baseline still matches all 96 exactly (96/0/0), and the same broadening that previously absorbed a substitute now yields 95 grandfathered / 1 new / 1 stale — the entry surfaces as stale *and* the unmatched violation surfaces as new. Broadening an entry now makes it useless rather than dangerous.

Then a single consolidated re-verification of every fix in the chain: merge suite 8/8; finite-score guard fires with its named message on a non-numeric weight; malformed glob rejected at the config gate; consumer `env` exits 0 with deferred warnings; keyword audit ok; ratchet 96/0/0; exact matcher as above.

Full suite: build ok, validate clean (25 validators), 29/29 violations, 8/8 tuning-merge, 6/6 setup-complete, 33/33 interop.

**All nine review findings (F1–F9) are closed.** Build is complete and Review is closed; Test may start.

**Phase 18 — Test finding T1 fixed: the tuning overlay now has regression cover.** Test held Ship on RI2. The mechanism was correct and demonstrably reachable, but nothing automated ever handed `check-trigger-predicates.mjs` a repo-profile carrying `tuning:` — this repo's own profile has none — so `tunedScoring` resolved to `undefined` on every CI run and `mergeTunedMap(global, undefined)` returned the global map unchanged. The three merge call sites could be deleted outright with every suite staying green.

One correction from Test's own first pass, recorded because the wrong version is the more plausible-sounding one: T1 was initially diagnosed as `_dataRoot` being redirected by `AGENTSMYTH_WF`. That is true of `AGENTSMYTH_WF` invocations but irrelevant here — `validate-template.mjs` runs this validator in its `artifactCommands` group under `AGENTSMYTH_HOME`, so definitions resolve to `src/workflow` while the data root correctly stays `workflow/`. Confirmed by adding a `tuning:` block to this repo's profile and running the full `npm run validate`, which failed on the flipped predicate. No root-resolution change was needed, and the proposed `_dataRoot` decoupling would have been a fix to nothing.

Changes: `check-trigger-predicates.mjs` gained `--dir <path>` (reading `<path>/config/repo-profile.yaml`), matching the convention `check-config.mjs` and `check-artifacts.mjs` already use. Two fixtures added under `test/fixtures/tuning-resolution/` — `thresholds-applied` lowers `domain.clean-code-architect` to 0, `weights-applied` raises `files_touched.per_unit` alone. Three assertions added to `run-tuning-merge-tests.mjs` (m9, m10, m11) spawning the real validator.

`weights-applied` is deliberately the F1 shape: tuning `per_unit` without `cap`. Merged correctly, `cap` survives, the score is 69 and the predicate flips to `ran`. Merged shallowly, `cap` is lost, `Math.min(90, undefined)` is `NaN`, the comparison goes false, and the fixture would be *accepted* — so m10 is green only when the merge is both wired and deep.

Mutation-tested rather than assumed: with the three `mergeTunedMap` calls replaced by direct global reads, `npm run validate` still exited 0 and `violations:test` still reported 29/29, while the merge suite dropped to 9/11 with m9 and m10 failing and the m11 control still passing. That is the precise blind spot T1 named, now closed. Wiring restored and byte-verified (8 `globToRegex` NUL sentinels intact, 3 call sites back).

Full suite: build ok, validate clean (25 validators), 29/29 violations, **11/11** tuning-merge, 6/6 setup-complete, 5/5 setup-refs, 15/15 conformance, 16/16 root-resolution, 33/33 interop, 3/3 checkpoint-approval, 3/3 definitions-root, 7/7 commit-coverage — 128 assertions across ten suites.

Phase 18 complete.

**Phase 19 — Ship finding S1 fixed: release-readiness now reads the latest review.** Ship could not validate its own artifact. `check-release-readiness.mjs` cross-checked the upstream review for unwaived P0/P1 findings using `reviewCandidates[0]`, and `listFiles` returns sorted paths — so it always read the *oldest* review. This chain has four: v1 recorded P1:1, v4 records P1:0 with every finding resolved. The validator read v1 and refused the ship artifact.

The failure mode is worse than a false alarm. It makes a chain permanently unshippable once its first review raises a P1, no matter how completely that P1 is fixed, because the validator never looks at the review that records the fix. The only escape was to edit a historical review artifact to insert a `(fixed)` marker — rewriting the record to satisfy a check pointed at the wrong file. It is also inconsistent with the rest of the lifecycle: `check-lifecycle`'s upstream resolution and `check-artifacts`' brief manifest map both take the newest version.

Fixed by selecting the highest `-v<N>` from the filename. Verified in both directions rather than one: with v1 at P1:1 and v4 at P1:0 the ship artifact now validates (proving v1 is no longer read), and injecting P1:1 into v4 rejects it (proving v4 *is* read — a fix that merely skipped the first candidate would pass the first test and fail this one).

Also corrected in the ship artifact itself, not the validator: `orchestration.blockers` had been populated with the pending checkpoint and the commit decision while the recommendation was `ship`, which `check-release-readiness` correctly rejects as contradictory. The pending `ship-review` checkpoint is enforced separately by `check-lifecycle --phase reflect`, so blockers is empty and the checkpoint does the gating. Confirmed the reflect gate still refuses to start.

Full suite after the fix: build ok, validate clean (25 validators), 29/29 violations, 11/11 tuning-merge, 6/6 setup-complete, 5/5 setup-refs, 15/15 conformance, 16/16 root-resolution, 33/33 interop, 3/3 checkpoint-approval, 3/3 definitions-root, 7/7 commit-coverage.

Phase 19 complete.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R1 | A `repo-profile.yaml` carrying a `tuning:` block with all five allowlisted keys | `check-config.mjs` exits 0 |
| R1 | A `repo-profile.yaml` with no `tuning:` block (this repo's own, and all four `examples/`) | `check-config.mjs` exits 0, unchanged from pre-change behavior |
| R2 | A `tuning:` block carrying a sixth, non-allowlisted key | `check-config.mjs` exits non-zero, naming the rejected key |
| RI5 | A `tuning:` block carrying a locked key (`task_classes`) | `check-config.mjs` exits non-zero |
| R4 | `git diff` of the schema's `required:` array | No line inside `required:` changed |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `git status --short --branch` | repo | pass | Recorded above, before any edit. |
| `check-config.mjs` (scratch repo, all five tunables set) | Phase 1 / R1 | pass | `check-config: ok`. Positive case — a `tuning:` block carrying every allowlisted key validates. |
| `check-config.mjs` (scratch repo, `tuning.evidence_policy` added) | Phase 1 / R2, RI5 | pass (correctly rejected) | `failed with 1 issue(s) - workflow/config/repo-profile.yaml.tuning.evidence_policy is not allowed`. Locked key unreachable, and the message names it. |
| `check-config.mjs` (scratch repo, `tuning.dispatch.enabled: required`) | Phase 1 / R3 | pass (correctly rejected) | `expected one of optional, disabled, got "required"`. The looser direction is closed by the enum. |
| `check-config.mjs` (scratch repo, `max_parallel_workstreams: 99`) | Phase 1 / R1 | **fail** | `check-config: ok` — should have been rejected. Root cause is blocker B-1: `maximum` unimplemented in `lib.mjs`. Superseded by the retest below. |
| `check-config.mjs` (scratch repo, `99`) — after B-1 fix | Phase 1 / R1 | pass (correctly rejected) | `max_parallel_workstreams is above maximum 10`. |
| `check-config.mjs` (scratch repo, `-1`) | Phase 1 / R1 | pass (correctly rejected) | `max_parallel_workstreams is below minimum 0`. Confirms the pre-existing `minimum` branch still fires. |
| `check-config.mjs` (scratch repo, `10`) | Phase 1 / R1 | pass | Boundary accepted — the bound is inclusive, matching JSON Schema semantics. |
| `git diff` of schema `required:` array | Phase 1 / R4 | pass | 0 changed lines matching any `required:` entry. Diff is purely additive; the minor-bump constraint holds. |
| `npm run validate` | whole repo, after `lib.mjs` change | pass | 23/23 validators ok. The shared schema engine change altered no existing schema's behavior. |
| `npm run violations:test` | whole repo, after `lib.mjs` change | pass | `21/21 violations detected`. No negative fixture regressed. |
| `check-config.mjs` (scratch repo, tuned list adds `build-review`, keeps all 3 global) | Phase 2 / R3 | pass | `checked ... tuning checkpoint union against .../agent-behavior.yaml`, `check-config: ok`. Superset accepted. |
| `check-config.mjs` (scratch repo, tuned list drops `ship-review`) | Phase 2 / R3 | pass (correctly rejected) | `drops 1 globally-required checkpoint(s): ship-review. This list is append-only ...`. The looser direction is closed on the one tunable that touches gating. |
| `npm run validate` | whole repo, after Phase 2 | pass | 23/23 validators ok. This repo's own profile has no `tuning:` block, so the new check no-ops on it — the default path is unaffected. |
| `npm run violations:test` | whole repo, after Phase 2 | pass | `21/21 violations detected`. |

## Dispatch Log

none — Phase 1 is a single-file change with no independent workstreams. `dispatch.enabled` is `optional` in this repo and no dispatch authorization was requested or given.

## Architecture Notes

- role: Senior Engineer
- decision: the key enumeration is expressed once, as declared properties under closed (`additionalProperties: false`) objects in the schema — per plan Q1. No key list is added to any validator.
- constraint: the schema root is already `additionalProperties: false`, so `tuning:` must be explicitly declared to be legal at all; and `required:` must not gain an entry (plan risk R-5, brief A2).
- constraint: this file is source. `workflow/schemas/repo-profile.schema.yaml` is a build product synced by `npm run build` in Phase 7 — not edited here.
- tradeoff: declaring nested closed objects rather than one flat `tuning:` map costs more schema lines but is what makes locked keys structurally unreachable (RI5) instead of merely undocumented.
- downstream: Phase 2's union rule and Phase 5's fixtures both depend on `tuning:` being a legal shape first; Review should read the closed-object nesting specifically, since a single missing `additionalProperties: false` silently reopens the locked-key surface.

- **B-2 — RESOLVED 2026-08-13: per-entry merge.** A tuned entry replaces that entry only; unnamed entries keep their global value at every level of nesting. Adopted as the general rule for all repo-over-global resolution, not a special case for two keys. `user_checkpoint_required_for` remains the single union exception. Implemented in `check-trigger-predicates.mjs` as an object spread with the tuned map last, with a comment recording the measured evidence. Verified three ways: tuning one weight now scores 54 (not 15), firing `clean-code-architect` as intended; tuning `ui_globs` alone flips exactly one predicate instead of two, with `schema_globs` surviving; and the untuned path is unchanged — 23/23 validators ok, 21/21 fixtures detected. Original finding retained below for the record.
- **B-2 (original finding) — override granularity for the two map-valued tunables was unspecified.** Phase 3's merge works, but exercising it surfaced a contract question no earlier decision settles. `skill_scoring.path_glob_categories` and `skill_scoring.complexity_score.weights` are both *maps*. "Resolution: global value overridden by repo-local value" does not say whether the unit of override is the **whole map** or an **individual entry**.
  - Observed: a scratch profile tuning only `ui_globs` flipped two predicates, not one. `domain.ui-ux-designer` flipped as intended; `domain.data-schema-designer` also flipped, because replacing the whole map discarded `schema_globs`, `contract_globs`, and `hotpath_globs`. The same applies to `weights` — tuning one weight currently zeroes every other.
  - Why this matters beyond ergonomics: whole-map replacement lets a repo *silently disable power-skill triggers* by editing an unrelated category. That is a looser outcome, reached through the two keys the governing rule exempts from the stricter-or-unchanged check precisely because they were judged incapable of a looser direction. The judgment holds for per-entry override; it does not hold for whole-map replacement.
  - Options: (a) per-entry merge — a tuned category or weight replaces that entry, unnamed entries keep their global value; (b) whole-map replace — current behavior, the literal reading of "override"; document the foot-gun loudly.
  - Owner: user. Blocking: Phase 3 completion only. Phases 1–2 are done and unaffected; Phases 4–7 do not depend on this.

## Blockers

- **B-1 — `maximum` is unimplemented in the schema engine.** ~~Blocking Phase 1 completion.~~ **Resolved 2026-08-12**, user chose option (a): amend Phase 1's touches and fix `lib.mjs`. Plan amended before the edit; `maximum` branch added mirroring `minimum`; range verified at 4 points; full suite re-run green. See Implementation Log and Command Results.
  - Residual for Review: `lib.mjs` is the shared schema engine used by every validator. The change is additive (a previously-ignored keyword now enforced) and no pre-existing schema declares `maximum`, so no behavior change is possible elsewhere — but Review should confirm that claim independently rather than take it from this artifact.

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Phase 1 - Schema surface | complete | 2026-08-12 | `tuning:` block added with all five allowlisted keys under closed objects; `maximum` implemented in `lib.mjs` per the user-approved amendment resolving B-1. Gate met on all four conditions: positive case accepted, non-allowlisted key rejected, locked key rejected, looser `dispatch.enabled` rejected, out-of-range cap rejected at both bounds, `required:` array byte-identical, and 23/23 validators + 21/21 violation fixtures green. |
| Phase 2 - Cross-file union rule | complete | 2026-08-12 | Union rule added to `check-config.mjs` with no key list; verified both directions (superset accepted, dropped `ship-review` rejected by name). |
| Phase 3 - Validator merge for scoring tunables | complete | 2026-08-13 | `check-trigger-predicates.mjs` resolves merged effective values per-entry (B-2). Tuned weight → 54 firing `clean-code-architect`; tuned `ui_globs` flips one predicate not two; untuned path unchanged at 23/23 and 21/21. |
| Phase 4 - Consumption points | complete | 2026-08-13 | All five tunables now have a consumption instruction. Two (`dispatch.enabled`, `user_checkpoint_required_for`) had none and were created. All three exit-gate conditions verified by grep. |
| Phase 5 - Negative fixtures | complete | 2026-08-13 | Four fixtures added, each verified to fail for its own rule. Suite 21/21 → 25/25. `check-config.mjs` gained `--dir`. Two scope-fence defects in my own plan/task artifacts found and fixed. |
| Phase 8 - Intent layer | complete | 2026-08-14 | `intent:` block with 8 concerns covering all 10 scored skills; both floors schema-enforced via `$defs`; `derived_keys` provenance with a stale-entry check. Suite 25/25 → 28/28. |
| Phase 9 - Threshold split | complete | 2026-08-14 | Thresholds extracted to `skill_scoring.thresholds`, predicates symbolic, `triggers` still locked. All 10 predicates identical pre/post; tunability and typo-throw both proven. Suite 28/28 → 29/29. |
| Phase 10 - Setup negotiation and upgrade skew | complete | 2026-08-14 | Intent items seeded at bootstrap (PS-9..11) and appended on skew; idempotent; non-blocking confirmed. Router step 8 added. TDZ bug found and fixed; silent catch replaced with a reporting one. |
| Phase 11 - Consumer documentation | complete | 2026-08-14 | Both layers documented in `config-map.md` (69 field refs schema-checked), `validators/README.md`, and `repo-mental-map.md`. |
| Phase 12 - Rebuild and full verification | complete | 2026-08-14 | Bundles regenerated and content-verified (gitignored, so no diff is possible — evidence is presence, not absence). RI9 back-compat proven three ways. Full gate green. |
| Phase 18 - Test T1 fix (tuning overlay regression cover) | complete | 2026-08-14 | `--dir` added to `check-trigger-predicates.mjs`; two `tuning:` fixtures; m9/m10/m11 added. Mutation-tested: removing the three `mergeTunedMap` calls leaves `validate` at exit 0 and violations at 29/29 but drops the merge suite to 9/11. The initial `_dataRoot`/`AGENTSMYTH_WF` diagnosis was wrong and is corrected in the Implementation Log; no root-resolution change was needed. Suite 8/8 -> 11/11, 128 assertions across ten suites. |
| Phase 19 - Ship S1 fix (release-readiness latest review) | complete | 2026-08-15 | `check-release-readiness.mjs` read `reviewCandidates[0]`, always the oldest review, making any chain whose first review raised a P1 permanently unshippable. Now selects the highest `-v<N>`. Verified both directions: v1 P1:1 no longer trips it, injected v4 P1:1 does. Ship artifact's contradictory `blockers`/`ship` pairing also corrected. |
