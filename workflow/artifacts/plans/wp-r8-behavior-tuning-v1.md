---
slug: wp-r8-behavior-tuning
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-08-12
updated: 2026-08-14
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9]
upstream:
  - workflow/artifacts/briefs/wp-r8-behavior-tuning-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
---

# WP-R8 — Per-Repo Behavior Tuning - Plan

## Summary

Add an optional `tuning:` block to `repo-profile.yaml` carrying five allowlisted behavior keys, enforce the allowlist and the stricter-or-unchanged rule, make every tunable actually reach its consumption point, and document the whole surface for consumers.

Ten executed phases (1-5, 8-12), ordered schema → validators → consumption points → fixtures → intent → thresholds → setup/skew → docs → rebuild. Phases 6 and 7 were superseded by 11 and 12 during the 2026-08-13 scope expansion and were never executed. The schema is the single home for the key enumeration (Q1); `check-trigger-predicates.mjs` merges tuned values (Q2); skill prose and full consumer documentation are both in scope (Q3).

**One discovery from this Plan's repo scan shaped Phase 4** — see Q4 and risks R-1/R-8. Two of the five tunables (`dispatch.enabled`, `pause_resume.user_checkpoint_required_for`) have no consumer anywhere in the codebase today, so honouring their tuned value means *creating* the consumption point, not editing one. Resolved 2026-08-12 to option (a): both are created inside this package, making Phase 4 the largest and highest-judgment phase here.

## Inputs

- `workflow/artifacts/briefs/wp-r8-behavior-tuning-v1.md` — approved 2026-08-12, checkpoint `brief-review`, blockers empty, Q1–Q3 resolved.
- `workflow/config/repo-profile.yaml`, `workflow/config/verification.yaml`, `workflow/config/domain.yaml` — read this session.
- `~/.agentsmyth/workflow/agent-behavior.yaml` — the global definitions file whose keys the allowlist references.
- Notion WP-R8 page's **Tunable Key Allowlist (resolved 2026-08-09)** — the five keys, the locked set, the governing rule.
- Repo scan performed this Plan (grep over `src/` for all five key names, `test/fixtures/lifecycle-violations/`, `src/setup/references/config-map.md`, `docs/`).

### Correction to the brief

The brief's RI4 acceptance criterion says "the pre-existing 4 fixtures still fail as expected". That number is wrong — it came from `CLAUDE.md`'s stale "all 4 fixtures rejected" line. `test/fixtures/lifecycle-violations/` actually holds **19 fixture directories**, and `test/run-violation-tests.mjs` runs more cases than that (some directories are exercised by more than one validator, e.g. fixture `b` runs under both `check-artifacts.mjs` and `check-manifest-coverage.mjs`). The Verification Plan below uses "all pre-existing fixtures still rejected" rather than a count. `CLAUDE.md`'s stale line is logged as a follow-up, not fixed here — it is outside this package's scope.

## Assumptions Verified

`plan-assumption-verifier` — every A ID from the brief cross-checked against repo evidence this Plan. None required conversion to a Q ID.

| A ID | Status | Evidence |
|---|---|---|
| A1 | evidence-backed | Notion WP-R8 page read this session; its "Tunable Key Allowlist" section is dated 2026-08-09 and enumerates the five tunable keys, the locked set, and the governing rule. Consumed as settled input, not re-derived. |
| A2 | evidence-backed | `src/workflow/schemas/repo-profile.schema.yaml:6-14` — the `required:` array lists 8 entries, none of which `tuning:` affects; the root is `additionalProperties: false`, so `tuning:` enters as a new optional named property. Additive, minor-bump compatible. |
| A3 | evidence-backed | `workflow/config/repo-profile.yaml` read in full — 54 lines, no `tuning:` key, and its effective values already equal the global defaults. Dogfood coverage therefore comes from Phase 5 fixtures, not live self-configuration. |
| A4 | evidence-backed | `git branch` / `git status -sb` this session: `release/1.1.0` created from `origin/main` with upstream unset, `feat/wp-r8-behavior-tuning` created from it. Branch Strategy below restates the integration target. |

## Requirement Coverage

`coverage-tracer` ledger. Every active R/RI has exactly one owning phase.

| Manifest ID | Covered by phases | Owning phase | State | Notes |
|---|---|---|---|---|
| R1 | 1, 5, 12 | Phase 1 | covered | `tuning:` block accepted with all five keys. |
| R2 | 1, 5 | Phase 1 | covered | Enumeration lives in the schema (Q1). Phase 5 proves rejection. |
| R3 | 1, 2, 5 | Phase 2 | covered | Value domains in schema; union rule in `check-config.mjs`. |
| R4 | 1, 12 | Phase 1 | covered | `required:` array unchanged; all existing profiles validate. |
| RI1 | 4 | Phase 4 | covered | Consumption points. Scope affected by Q4. |
| RI2 | 3 | Phase 3 | covered | `check-trigger-predicates.mjs` merges tuned values. |
| RI3 | 12 | Phase 12 | covered | `npm run build` + generated-output discipline. Phase 7 superseded. |
| RI4 | 5 | Phase 5 | covered | Negative fixtures. |
| RI5 | 1, 5 | Phase 1 | covered | Locked keys unreachable via schema `additionalProperties: false`. |
| RI6 | 11 | Phase 11 | covered | Full consumer documentation (Q3), now also covering the intent layer. |
| R5 | 8 | Phase 8 | covered | Intent layer: `repo_character`, `surface_map`, `concerns`, `parallelism_appetite`, `review_ceremony`. |
| R6 | 9 | Phase 9 | covered | Threshold split out of `triggers`; predicates stay locked. |
| R7 | 10 | Phase 10 | covered | Setup negotiation via existing `pending-setup.yaml` mechanism. |
| R8 | 10 | Phase 10 | covered | Upgrade-skew reconciliation, non-blocking. |
| RI7 | 8 | Phase 8 | covered | Floors on `constraints_safety` and `repo_alignment`. |
| RI8 | 8 | Phase 8 | covered | Derived-vs-explicit provenance. |
| RI9 | 12 | Phase 12 | covered | Absence ⇒ today's behavior byte-for-byte. The minor-bump guarantee. |

No deferred, waived, or dropped rows.

### Scope expansion — 2026-08-13

Absorbed in place per user decision; task class **Standard → Complex**, so Test is no longer
skippable without a waiver. Phases 1–3 are already complete and survive unchanged — the mechanism
layer they built is precisely what the intent layer derives into. Phases 8–12 are appended;
original Phases 4 and 5 keep their numbers and content; Phases 6 and 7 are superseded by 11 and 12
respectively and are not executed.

**Blocker B-2 resolved: per-entry merge.** A tuned entry replaces that entry only; unnamed entries
keep their global value, at every level of nesting. This applies to *all* repo-over-global
resolution, not just the two map-valued keys — it is the general rule. `user_checkpoint_required_for`
stays the single union exception. Measured against the sandbox scenario, whole-map replace turned a
stricter-intent edit into 48 → 15 and silenced every score-driven skill; per-entry gives 48 → 54.

**Non-blocking with global fallback.** Unreconciled config never stops work; values resolve from the
global install until the repo completes its own. This is load-bearing for the release: it is the
reason 1.1.0 stays a minor rather than becoming a major behavior change for existing consumers.

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `src/workflow/schemas/repo-profile.schema.yaml` | modify | R1, R2, R4, RI5 | Add `tuning:` as a named optional property. `required:` untouched. Nested `additionalProperties: false` at every level is what makes the enumeration exhaustive. |
| `src/workflow/validators/lib.mjs` | modify | R1 | Added by the 2026-08-12 Phase 1 amendment (blocker B-1). Implement the missing `maximum` keyword in `validateSchema`, mirroring the `minimum` branch at line 673. Shared schema engine — Review should confirm no existing schema changes behavior. |
| `src/workflow/validators/check-config.mjs` | modify | R3 | Add the cross-file union/superset check for `pause_resume.user_checkpoint_required_for` against `defsPath('agent-behavior.yaml')`. No key list here (Q1). |
| `src/workflow/validators/check-trigger-predicates.mjs` | modify | RI2 | Lines 24–27 currently read `defsPath('agent-behavior.yaml')` only. Resolve merged `weights` and `path_glob_categories`; update the header comment. |
| `src/workflow/skills/dispatch-subagents/references/phase-caps.md` | modify | RI1 | Lines 5, 17, 19 name `agent-behavior.yaml` as the cap source. Must resolve `tuning:` override. |
| `src/workflow/skills/dispatch-subagents/references/decision-tree-by-phase.md` | modify | RI1 | Lines 53, 70 hardcode the literal `(3)` alongside the key name — a tuned repo makes that parenthetical wrong. |
| `src/workflow/skills/dispatch-subagents/references/output-schema.md` | modify | RI1 | Line 56 asserts the cap is checked against `agent-behavior.yaml`. |
| `src/workflow/skills/dispatch-subagents/SKILL.md` | modify | RI1 | Consumption point for `dispatch.enabled` must be **created** — see Q4. Currently keys only off "explicit authorization" (line 22). |
| `src/workflow/agent-behavior.yaml` | modify (comments) | RI1 | The `skill_scoring` block comment tells the agent how to apply the rubric; must state that `weights` and `path_glob_categories` resolve against repo-local `tuning:`. No value changes. |
| `src/workflow/rules.md` or a lifecycle skill | modify | RI1 | Consumption point for `pause_resume.user_checkpoint_required_for` must be **created** — see Q4. Exact home decided in Phase 4. |
| `test/fixtures/lifecycle-violations/w-tuning-*/` | add | RI4, R2, R3, RI5 | New negative fixtures. Naming continues the existing single-letter convention (`v-` is the last in use). |
| `test/run-violation-tests.mjs` | modify | RI4 | Register the new fixtures. |
| `src/setup/references/config-map.md` | modify | RI6 | Consumer-reachable config documentation; already has four `repo-profile.yaml` sections to extend. |
| `src/workflow/validators/README.md` | modify | RI6 | Validator-facing note on what `check-config.mjs` now enforces. |
| `docs/knowledge-map/repo-mental-map.md` | modify | RI6 | Repo knowledge map references `repo-profile`; keep current. |
| `dist/workflow-bundle.md`, `dist/setup-bundle.md`, root `validators/`, `workflow/schemas/` | regenerate | RI3 | Build products. Never hand-edited. |

Protected paths checked: none of the above matches `.git/**`, `.env*`, or `**/*secret*`. `paths.public_contracts` is `[]` in this repo, so no declared contract path is touched.

## Source-of-Truth Strategy

- **Read source:** the Notion WP-R8 page's allowlist section is the authority for which keys are tunable and which are locked. This Plan consumes it; it does not re-derive it.
- **Update target:** the Notion WP-R8 page is **stale** on Q1 — it says the allowlist lives as a constant in `check-config.mjs`, and this Plan puts it in the schema. Correcting that page is a **Ship-phase** task, not a Build task. Recorded here so it is not lost.
- **In-repo source of truth:** `src/workflow/` is canonical; `dist/`, root `validators/`, and `workflow/schemas/` are build products per `CLAUDE.md` golden rule 1. No hand-edits to generated output.
- No external tracker, release, or publication action occurs in Build.

## Approach

The design has three layers, and keeping them separate is what keeps the enumeration in one place:

1. **Schema layer** — `repo-profile.schema.yaml` declares `tuning:` with exactly five nested properties, each with `additionalProperties: false` and its value domain (`dispatch.enabled` as an enum of `optional|disabled`; `max_parallel_workstreams` as an integer 0–10). This single declaration delivers R1, R2, and RI5: any non-allowlisted key, and every locked key, is rejected because it is simply not a declared property under a closed object. There is no second list to keep in sync.
2. **Cross-file rule layer** — `check-config.mjs` gains exactly one thing the schema cannot express: reading the global `agent-behavior.yaml` and asserting the repo-local `user_checkpoint_required_for` is a superset of the global list. Union semantics, not replacement. This is R3's append-only half.
3. **Consumption layer** — the tuned value must be what actually gets used. For `weights` and `path_glob_categories` that is code (`check-trigger-predicates.mjs`). For `max_parallel_workstreams` that is existing skill prose. For `dispatch.enabled` and `user_checkpoint_required_for` there is no consumer at all today, which is Q4.

Resolution semantics, stated once and applied everywhere: **global value, overridden by repo-local `tuning:` value — except `pause_resume.user_checkpoint_required_for`, which is resolved by union.** Absent `tuning:` means today's behavior byte-for-byte.

## Phases

### Phase 1 - Schema surface

- **Manifest IDs:** R1, R2, R4, RI5
- Touches: `src/workflow/schemas/repo-profile.schema.yaml`, `src/workflow/validators/lib.mjs`
- **Amendment (2026-08-12, user-approved, Build blocker B-1):** `lib.mjs` added to this phase's touches. Build found that the hand-rolled schema engine implements `minimum` (line 673) but has no `maximum` branch — the keyword is parsed and silently ignored, so a `max_parallel_workstreams: 99` passed against a schema declaring `maximum: 10`. `grep -rn "maximum:" src/workflow/schemas/` returns only the line this phase added, so no pre-existing schema was mis-validating. The fix is a ~3-line branch mirroring the existing `minimum` handling. Chosen over dropping `maximum:` (which would abandon the declared 0–10 domain) and over enforcing the range in `check-config.mjs` (which would partly reverse Q1's schema-owns-value-domains decision).
- Work: add `tuning:` as an optional top-level property. Nested objects for `dispatch`, `skill_scoring`, `pause_resume`, each `additionalProperties: false`, declaring only the allowlisted leaves. Value domains: `dispatch.max_parallel_workstreams` integer 0–10; `dispatch.enabled` enum `[optional, disabled]`; `skill_scoring.complexity_score.weights` object of numbers; `skill_scoring.path_glob_categories` object of string arrays; `pause_resume.user_checkpoint_required_for` array of strings. Add `description:` on each leaf naming the governing rule. `required:` array is not touched.
- **Exit gate:** `node src/workflow/validators/check-config.mjs` exits 0 against a hand-written `tuning:` block setting all five keys, and exits non-zero against each of: a sixth non-allowlisted key, a locked key, `dispatch.enabled: required`, and `max_parallel_workstreams` outside 0–10. `required:` array is byte-identical to its pre-change state (`git diff` shows no line inside `required:`). `npm run validate` still passes for every existing schema, confirming the `maximum` branch broke nothing.

### Phase 2 - Cross-file union rule

- **Manifest IDs:** R3
- Touches: `src/workflow/validators/check-config.mjs`
- Work: when a `repo-profile.yaml` declares `tuning.pause_resume.user_checkpoint_required_for`, load `defsPath('agent-behavior.yaml')` and assert the declared list contains every entry in the global `pause_resume.user_checkpoint_required_for`. Error names the missing checkpoint(s). No key enumeration added to this file.
- **Exit gate:** `node src/workflow/validators/check-config.mjs` exits non-zero, naming the dropped checkpoint, for a profile whose tuned list omits a globally-required entry; exits 0 for a profile whose tuned list is a strict superset.

### Phase 3 - Validator merge for scoring tunables

- **Manifest IDs:** RI2
- Touches: `src/workflow/validators/check-trigger-predicates.mjs`
- Work: replace the direct `defsPath('agent-behavior.yaml')` reads at lines 24–27 for `weights` and `path_glob_categories` with a resolution that overlays `tuning.skill_scoring.*` from `repo-profile.yaml` when present. `triggers` stays global-only — it is a locked key. Update the file's header comment to describe the merge.
- **Exit gate:** with a fixture repo profile tuning `path_glob_categories` such that a `path~<category>` term flips outcome, the validator's computed result changes accordingly; with no `tuning:` present, `npm run validate` produces identical output to pre-change (`check-trigger-predicates: ok`, 10 predicates).

### Phase 4 - Consumption points

- **Manifest IDs:** RI1
- Touches: `src/workflow/skills/dispatch-subagents/references/phase-caps.md`, `src/workflow/skills/dispatch-subagents/references/decision-tree-by-phase.md`, `src/workflow/skills/dispatch-subagents/references/output-schema.md`, `src/workflow/skills/dispatch-subagents/SKILL.md`, `src/workflow/agent-behavior.yaml` (comments only), `src/workflow/rules.md` (the home chosen for the checkpoint rule)
- Work: for `max_parallel_workstreams`, rewrite the three dispatch reference sites so the agent resolves global-then-`tuning:` rather than reading `agent-behavior.yaml` alone, and remove the hardcoded literal `(3)` at `decision-tree-by-phase.md:53,70`. For the `skill_scoring` rubric, update the `agent-behavior.yaml` block comment to state the same resolution. Per Q4 option (a), **create** the two consumption points that do not exist today: (i) `dispatch.enabled` — `dispatch-subagents/SKILL.md` must read the resolved value and treat `disabled` as a hard refusal to dispatch regardless of authorization, with `optional` preserving today's authorization-gated behavior; (ii) `pause_resume.user_checkpoint_required_for` — establish the resolved (unioned) list as the set of checkpoints an agent must require, layered **on top of** the existing per-artifact `user_checkpoint` enforcement in `check-lifecycle.mjs`, never replacing it.
- **Exit gate:** three binary conditions, all must hold. (1) Grep over `src/workflow/` for each of the five key names returns no instruction directing an agent to read that key from `agent-behavior.yaml` without also resolving `repo-profile.yaml`'s `tuning:`. (2) Each of the five keys has at least one instruction naming it as a value the agent must resolve before acting. (3) No instruction added in this phase permits a tuned `user_checkpoint_required_for` list to cause an artifact to skip a checkpoint that artifact declares — the union is additive-only in effect as well as in shape, verified by inspection against `check-lifecycle.mjs`'s existing gate.

### Phase 5 - Negative fixtures

- **Manifest IDs:** RI4, R2, R3, RI5
- Touches: `test/fixtures/lifecycle-violations/w-tuning-unknown-key/`, `test/fixtures/lifecycle-violations/x-tuning-locked-key/`, `test/fixtures/lifecycle-violations/y-tuning-looser-value/`, `test/fixtures/lifecycle-violations/z-tuning-checkpoint-dropped/`, `test/run-violation-tests.mjs`, `src/workflow/validators/check-config.mjs`
- Work: four fixtures — a non-allowlisted key under `tuning:`; a locked key (`task_classes`) under `tuning:`; `tuning.dispatch.enabled: required`; a tuned checkpoint list omitting a globally-required entry. Register each in the runner against `check-config.mjs`.
- **Exit gate:** `npm run violations:test` exits 0 with all four new fixtures reported rejected and every pre-existing fixture still rejected.

### Phase 6 - Consumer documentation — SUPERSEDED, NOT EXECUTED

> Superseded by Phase 11 on 2026-08-13 when scope expanded; Phase 11 covers this scope plus the intent layer. This block is retained for traceability and was never executed. RI6's owning phase is Phase 11.

- **Manifest IDs:** RI6
- Touches: `src/setup/references/config-map.md`, `src/workflow/validators/README.md`, `docs/knowledge-map/repo-mental-map.md`
- Work: a per-repo tuning section in `config-map.md` covering all five keys, their permitted values, the global-then-local resolution rule and its union exception, the locked set with the reason it is locked, and a worked `tuning:` example. A note in `validators/README.md` on what `check-config.mjs` now enforces beyond schema validation. Keep `repo-mental-map.md` current.
- **Exit gate:** the five keys, their permitted values, the resolution rule, the union exception, and the locked set all appear in `config-map.md`; `node src/workflow/validators/check-setup-refs.mjs` exits 0 (no broken cross-reference introduced).

### Phase 7 - Rebuild and full verification — SUPERSEDED, NOT EXECUTED

> Superseded by Phase 12 on 2026-08-13 when scope expanded; Phase 12 covers this scope plus the RI9 back-compat proof. This block is retained for traceability and was never executed. RI3's owning phase is Phase 12.

- **Manifest IDs:** RI3, R1, R4
- Touches: `dist/workflow-bundle.md`, `dist/setup-bundle.md`, root `validators/`, `workflow/schemas/` (all regenerated)
- Work: `npm run build`, then the full gate. Confirm no generated file was hand-edited by checking that the only `dist/` changes are those the build produces.
- **Exit gate:** `npm run build && npm run validate && npm run violations:test` all exit 0, output captured in the verify artifact. `workflow/config/repo-profile.yaml` and all four `examples/*/workflow/config/` profiles validate with no edits to those files.

### Phase 8 - Intent layer

- **Manifest IDs:** R5, RI7, RI8
- Touches: `src/workflow/schemas/repo-profile.schema.yaml`, `src/workflow/validators/check-config.mjs`, `test/fixtures/lifecycle-violations/aa-intent-floor-constraints/`, `test/fixtures/lifecycle-violations/ab-intent-floor-alignment/`, `test/fixtures/lifecycle-violations/ac-intent-stale-provenance/`, `test/run-violation-tests.mjs`
- Work: add an `intent:` block alongside `tuning:` — `repo_character` (enum), `surface_map` (map of path arrays), `concerns` (map of the 8 concern areas to `not-applicable | light | standard | strict`), `parallelism_appetite`, `review_ceremony`. The 8 concerns cover all 10 scored skills: `architecture` → architecture-decision-advisor + system-design-advisor; `code_quality` → clean-code-architect + quality-gates-validator; `api_contracts` → interface-contract-designer; `data_schema` → data-schema-designer; `ui_ux` → ui-ux-designer; `performance` → performance-optimizer; `repo_alignment` → repo-alignment-scan; `constraints_safety` → constraint-conflict-scan. Enforce the RI7 floors. Record derivation provenance per RI8.
- **Exit gate:** a profile setting only `intent.concerns` validates; every concern at `standard` derives thresholds byte-identical to today's literals; `constraints_safety: not-applicable` and `repo_alignment: not-applicable` are each rejected naming the floor; a profile mixing derived and hand-set mechanism values records which is which.

### Phase 9 - Threshold split

- **Manifest IDs:** R6
- Touches: `src/workflow/agent-behavior.yaml`, `src/workflow/validators/check-trigger-predicates.mjs`, `src/workflow/schemas/agent-behavior.schema.yaml`, `src/workflow/schemas/repo-profile.schema.yaml`, `src/workflow/skills/repo-alignment-scan/SKILL.md`, `src/workflow/skills/architecture-decision-advisor/SKILL.md`, `src/workflow/skills/system-design-advisor/SKILL.md`, `src/workflow/skills/clean-code-architect/SKILL.md`, `src/workflow/skills/performance-optimizer/SKILL.md`, `test/fixtures/lifecycle-violations/ad-tuning-trigger-rewrite/`, `test/run-violation-tests.mjs`
- Work: extract numeric thresholds from `skill_scoring.triggers` into `skill_scoring.thresholds`; rewrite predicates to reference them symbolically. Extend the predicate evaluator's `>=` term matcher to resolve a symbol as well as a literal. Predicate boolean structure stays locked and un-tunable.
- **Exit gate:** all 10 predicates evaluate identically to pre-change against `examples/power-skill-sandbox/expected-triggers.yaml`; a fixture attempting to rewrite predicate structure via `tuning:` is rejected; `npm run validate` passes.

### Phase 10 - Setup negotiation and upgrade skew

- **Manifest IDs:** R7, R8
- Touches: `bin/agentsmyth.mjs`, `src/setup/SKILL.md`, `src/setup/references/config-map.md`, `src/workflow/router.md`
- Work: seed intent items into `pending-setup.yaml` at `init`. On skew (`bin/agentsmyth.mjs:121-139` already detects it and currently only warns), enumerate config surfaces the new version introduces, scan the repo, and write proposing `PS-N` items. Both paths reuse the router's existing session-start resolution pass — inspect first, then one batched ask with recommendations. Nothing blocks.
- **Exit gate:** a fresh `init` yields open intent items, with `repo_character`/`surface_map` resolved by inspection alone; a repo stamped with an older `agentsmyth_version` gets items written on `agentsmyth check` and can still run every lifecycle phase to completion with those items open, resolving all values from the global install.

### Phase 11 - Consumer documentation (supersedes Phase 6)

- **Manifest IDs:** RI6
- Touches: `src/setup/references/config-map.md`, `src/workflow/validators/README.md`, `docs/knowledge-map/repo-mental-map.md`
- Work: Phase 6's scope plus the intent layer — the 8 concerns and which skills each governs, the four levels, the two floors, derivation, and the non-blocking upgrade flow. State plainly which skills are locked and why.
- **Exit gate:** a repo owner can configure both layers from the documentation alone without opening a schema; the locked set and the reason for it are stated; `check-setup-refs.mjs` exits 0.

### Phase 12 - Rebuild and full verification (supersedes Phase 7)

- **Manifest IDs:** RI3, RI9, R1, R4
- Touches: all build products, regenerated
- Work: `npm run build`, then the full gate, plus the RI9 back-compat proof.
- **Exit gate:** `npm run build && npm run validate && npm run violations:test` all exit 0; this repo's own profile and all four `examples/` profiles validate unedited; `check-trigger-predicates.mjs` reports the same 10 outcomes as before the package began.

### Phase 13 - Review fixes (F1, F2, F3)

- **Manifest IDs:** RI2, R1, RI1
- Touches: `src/workflow/validators/lib.mjs`, `src/workflow/validators/check-trigger-predicates.mjs`, `src/workflow/schemas/repo-profile.schema.yaml`, `src/workflow/agent-behavior.yaml`, `test/run-tuning-merge-tests.mjs`, `package.json`
- Added 2026-08-14 after Review returned `hold` with one P1. Work: **F1** — move the tuned-map merge into a shared, exported `mergeTunedMap()` in `lib.mjs` that merges one level deeper, so a partial nested edit (`files_touched.per_unit` without `cap`) keeps the unnamed sub-keys instead of dropping them; add a finite-score guard so a non-finite `complexity_score` fails loudly rather than silently making every threshold false; cover both with a real positive test, since the existing suites pass with the defect present. **F2** — type `tuning.skill_scoring.path_glob_categories` as the global schema does (array of strings) so a malformed value fails in `check-config.mjs` rather than crashing `check-trigger-predicates.mjs`. **F3** — update the stale `RESOLUTION` comment to name all six tunables and re-run RI1's grep across all of them.
- **Exit gate:** a partial nested weight edit yields a finite score with unnamed sub-keys preserved, proven by a test that **fails against the pre-fix merge**; a malformed `path_glob_categories` value is rejected by `check-config.mjs` naming the key; the `RESOLUTION` comment names six tunables; RI1's grep passes across all six; full suite green.

### Phase 14 - Review v2 fix (F4 deprecation window)

- **Manifest IDs:** RI9, R4
- Touches: `src/workflow/validators/lib.mjs`, `src/workflow/schemas/verification.schema.yaml`, `src/workflow/schemas/agent-behavior.schema.yaml`
- Added 2026-08-14 after Review v2 returned `hold` on F4. Phase 13's engine fix newly enforced 8 previously-decorative declarations, 6 outside WP-R8 — including consumer-authored `verification.yaml` `commands[].env`, so a previously-valid repo would fail on upgrade. User chose the deprecation-window route: keep the engine fix, mark pre-existing declarations `x_enforcement: warn-until-1.2.0` so they validate and report without failing the gate, and let WP-R8's own new declarations enforce immediately.
- **Exit gate:** a consumer `verification.yaml` with a non-string `env` value exits 0 with a named warning stating the type and the enforcing version; `tuning.skill_scoring.path_glob_categories` with a non-array value still fails hard; full suite green.

### Phase 15 - Schema-keyword audit (F5)

- **Manifest IDs:** RI3
- Touches: `src/workflow/validators/check-schema-keywords.mjs`, `src/workflow/validators/README.md`, `scripts/validate-template.mjs`, `src/workflow/validators/lib.mjs`, `src/workflow/schemas/artifact-frontmatter.schema.yaml` (the last two added once the audit reported what it found — `if`/`then` implemented in the engine, `format: date-time` replaced with an enforceable pattern)
- Added 2026-08-14. Three schema-engine gaps surfaced in this package by accident (`maximum` ignored, schema-valued `additionalProperties` ignored, and the enforcement-timing question the second raised). Nothing tells a schema author that a declaration they wrote has no effect. Work: a validator that structurally walks every shipped schema, collects the keywords used at real schema positions, and fails on any the engine does not implement. A check rather than a documented list, because a list drifts and a check cannot.
- **Exit gate:** the validator runs in `npm run validate`, reports the keyword count it checked, and fails on an unsupported keyword — proven by a deliberate injection; every unsupported keyword it finds in the current schemas is either implemented or removed.

### Phase 16 - Review v3 fixes (F6, F7, F8)

- **Manifest IDs:** RI3, RI9
- Touches: `src/workflow/validators/check-schema-keywords.mjs`, `src/workflow/validators/check-artifacts.mjs`, `src/workflow/schemas/artifact-baseline.schema.yaml`, `workflow/config/artifact-baseline.yaml`, `scripts/validate-template.mjs`
- Added 2026-08-14. **F6:** `x_enforcement` is honoured only on a schema-valued `additionalProperties`; make the keyword audit reject it anywhere else. **F8:** document the audit's one-way drift. **F7:** investigation showed the filed finding was the symptom — `check-artifacts.mjs` was never invoked against real artifacts at all, only fixtures, so 96 violations accumulated across 67 files. Per user decision, grandfather what exists and enforce everything new: wire the validator in behind a checked-in, schema-validated baseline that suppresses one specific file-and-message pair per entry, errors on stale entries, and can therefore only shrink.
- **Exit gate:** a misplaced `x_enforcement` is rejected naming the position; `check-artifacts.mjs` runs in `npm run validate` reporting 96 grandfathered / 0 new / 0 stale; a new violation injected into an already-grandfathered file still fails; a stale baseline entry fails; no artifact from this chain appears in the baseline.

### Phase 17 - Review v4 fix (F9 exact baseline matcher)

- **Manifest IDs:** RI3
- Touches: `src/workflow/validators/check-artifacts.mjs`
- Added 2026-08-14. The baseline matcher compared the message by substring, so a hand-broadened entry could absorb a *different* violation of the same shape while `stale` stayed 0 — defeating the one mechanism that forces entries out when their violation is fixed. Compare exactly instead.
- **Exit gate:** the real baseline still matches all 96 exactly; a broadened entry surfaces as both stale and unmatched.

### Phase 18 - Test T1 fix (tuning overlay regression cover)

- **Manifest IDs:** RI2, R6
- Touches: `src/workflow/validators/check-trigger-predicates.mjs`, `test/fixtures/tuning-resolution/thresholds-applied/config/repo-profile.yaml`, `test/fixtures/tuning-resolution/weights-applied/config/repo-profile.yaml`, `test/run-tuning-merge-tests.mjs`
- Added 2026-08-14, from Test finding T1. The repo-local tuning overlay was correct and reachable but never exercised: this repo's own profile carries no `tuning:`, so every CI run resolved it to `undefined` and the three `mergeTunedMap` call sites could be deleted with every suite staying green. Add `--dir` to the validator (the convention `check-config.mjs` and `check-artifacts.mjs` already use), two fixtures that do carry tuning, and spawn-based assertions. The `weights-applied` fixture tunes `per_unit` without `cap`, so it doubles as an end-to-end guard for the F1 shape — a shallow merge yields a NaN score, the predicate goes false, and the fixture would be wrongly accepted.
- **Exit gate:** both fixtures rejected for the named skill; the untuned control still passes; and — the point of the phase — removing the merge wiring must drop the suite while `npm run validate` and `violations:test` stay green, proving the new assertions are what closes the gap.

### Phase 19 - Ship S1 fix (release-readiness reads the latest review)

- **Manifest IDs:** RI3
- Touches: `src/workflow/validators/check-release-readiness.mjs`
- Added 2026-08-15, from Ship finding S1. `check-release-readiness.mjs` cross-checked
  `reviewCandidates[0]` — and `listFiles` returns sorted paths, so that is always the *oldest*
  review. A chain whose first review raised a P1 could therefore never declare `ship`, however
  thoroughly that P1 was later fixed, because the validator never read the review recording the
  fix. Inconsistent with the rest of the lifecycle, which everywhere resolves the newest version.
- **Exit gate:** the ship artifact validates against a v4 showing P1:0 despite v1 showing P1:1; and
  injecting P1:1 into v4 rejects it — proving the validator reads the latest review rather than
  merely skipping the first.

## Dependency Order

1 → 2 → 3 → 4 → 5 → 6 → 7.

- Phase 1 precedes everything: Phases 2, 3, and 5 all need `tuning:` to be a legal shape before they can read or reject it.
- Phase 2 precedes Phase 5 because fixture `z-tuning-checkpoint-dropped` tests the rule Phase 2 implements.
- Phase 3 is independent of Phase 2 and could run in parallel, but both touch validator files reviewed together; sequencing them costs nothing and keeps one reviewable diff per concern.
- Phase 4 is independent of Phases 2–3 (prose vs. code) and is the phase most likely to expand — see Q4. It precedes Phase 11 because documentation describes the behavior Phase 4 establishes.
- Phase 12 is last by definition: the build consumes every preceding source change. Running it earlier produces a bundle that is stale by the next phase.

**Revised order (2026-08-13):** 1 → 2 → 3 → 4 → 5 → 8 → 9 → 10 → 11 → 12. Phases 6 and 7 are
superseded by 11 and 12 respectively and are not executed separately.

- Phase 8 (intent) depends on Phases 1–3: it derives *into* the mechanism surface those built.
- Phase 9 (threshold split) depends on Phase 8, which is what supplies the intent levels the
  thresholds are derived from.
- Phase 10 (setup + skew) depends on 8 and 9 — it can only propose config for surfaces that exist.
- Phase 11 documents 8–10, so it follows them. Phase 12 is last by definition.

Task class is now **Complex**, so no phase is skippable without a waiver — including Test. Phase 12
supplies the verify artifact's command evidence; the RI9 back-compat proof is its substance.

## Branch Strategy

- Work branch: `feat/wp-r8-behavior-tuning`, already created from `release/1.1.0`.
- Integration target: `release/1.1.0`. **Not `main`.** Per the user's 1.1.0 model, every package merges into the release branch and `release/1.1.0` moves to `main` in one merge after the whole release is done.
- `release/1.1.0` was created with **no upstream** so a bare `git push` cannot target `main`. Preserve that.
- `repo-profile.yaml`'s `branch_policy.require_non_default_branch_for_changes: true` is satisfied. `default_branch_commit_requires_user_approval` is not engaged — nothing here commits to `main`.
- Commits staged to approved scope only (`stage_only_approved_scope: true`). Unrelated working-tree changes preserved.
- No tag is cut in this package. Tagging is a release-level action after every 1.1.0 package lands.

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|
| **R-1.** `dispatch.enabled` and `user_checkpoint_required_for` have no consumer today, so Phase 4 must author new enforcement prose rather than edit existing prose. Larger and more judgment-heavy than the brief implies. | High (confirmed, not predicted) | Medium | Q4 resolved to option (a): both consumption points are created. Phase 4's exit gate requires all five keys to have a consumption instruction, so the gap cannot be silently skipped. | Build | RI1 |
| **R-8.** New checkpoint-enforcement prose for `user_checkpoint_required_for` sits adjacent to a commit-blocking gate; a wrong formulation could let a tuned list *weaken* checkpoint enforcement — the exact outcome WP-R8's design exists to prevent. | Low | High | Phase 4 exit gate condition (3) asserts the union is additive-only in effect, verified by inspection against `check-lifecycle.mjs`. Review is directed at this surface specifically (see Architecture Notes → downstream). | Build, Review | RI1, R3 |
| **R-2.** Tuning ships inert for one or more keys — schema validates a block nothing reads. | Medium | High | Phase 4's exit gate is a grep over all five key names, not a subjective read. | Build | RI1 |
| **R-3.** `user_checkpoint_required_for` resolved by replacement instead of union, silently dropping a checkpoint. | Medium | High | Phase 2 implements the superset assertion; fixture `z-tuning-checkpoint-dropped` proves rejection. Two independent mechanisms. | Build | R3 |
| **R-4.** Validator/agent divergence on `path_glob_categories` persists because the merge is incomplete. | Low | Medium | Phase 3's exit gate requires a fixture whose outcome differs between tuned and untuned config — a no-op merge cannot pass it. | Build | RI2 |
| **R-5.** A required field creeps into the schema, escalating 1.1.0 to a major bump. | Low | High | Phase 1's exit gate asserts the `required:` array is byte-identical via `git diff`. | Build | R4 |
| **R-6.** Generated output hand-edited instead of rebuilt, shipping a stale bundle. | Low | Medium | Phase 12 runs `npm run build` and inspects that `dist/` changes are build-produced only. `CLAUDE.md` golden rules 1–2. | Build | RI3 |
| **R-7.** Notion WP page keeps saying the allowlist is a `check-config.mjs` constant; a future reader implements from the stale page. | Medium | Low | Recorded in Source-of-Truth Strategy as a Ship-phase correction with a named target page. | Ship | R2 |

Every risk has a mitigation. None requires a waiver.

## Verification Plan

Commands drawn from `workflow/config/verification.yaml` (`validate` and `violations-test`, both `required: true` for review and ship) plus `npm run build` per `CLAUDE.md` golden rule 2.

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1 | command — `npm run validate`; plus a positive fixture profile setting all five keys | Phase 1 | Absence of `tuning:` must also pass, proving the default path. |
| R2 | command — `npm run violations:test` rejecting `w-tuning-unknown-key` | Phase 5 | Error message must name the rejected key, checked by inspection. |
| R3 | command — `npm run violations:test` rejecting `y-tuning-looser-value` and `z-tuning-checkpoint-dropped` | Phase 5 | Two fixtures: enum floor and union rule. |
| R4 | command — `npm run validate` against this repo's own and all four `examples/` profiles, unedited; plus `git diff` showing no change inside the schema's `required:` array | Phase 12 | The additive-only claim binding the whole 1.1.0 release. |
| RI1 | manual — grep over `src/workflow/` for each of the five key names, scenario/steps/expected/observed recorded in the verify artifact | Phase 4 | Prose correctness cannot be command-proven; manual QA per `verification.yaml`'s `manual_qa` block, all 8 required fields. |
| RI2 | command — `npm run validate` (`check-trigger-predicates: ok`, 10 predicates) both with and without a tuned fixture, showing different computed outcomes | Phase 3 | A no-op merge fails this. |
| RI3 | generated-output — `npm run build` output, plus confirmation that `dist/`, root `validators/`, and `workflow/schemas/` changes are build-produced | Phase 12 | `verification.yaml`'s `generated_output` block: source-only inspection is explicitly not enough. |
| RI4 | command — `npm run violations:test` exit 0, all four new fixtures rejected, every pre-existing fixture still rejected | Phase 5 | No count asserted — see Correction to the brief. |
| RI5 | command — `npm run violations:test` rejecting `x-tuning-locked-key` | Phase 5 | Plus review-evidence that the schema's closed objects are traceable in one file. |
| RI6 | review — both layers, value domains, resolution rule, union exception, floors, and locked set present in `config-map.md`; command — `check-setup-refs.mjs` exit 0 | Phase 11 | Documentation adequacy is a review judgment; link integrity is mechanical. |
| R5 | command — `npm run validate` against a profile setting only `intent.concerns`; plus a fixture proving all-`standard` derives today's literals unchanged | Phase 8 | The all-`standard` identity is the back-compat anchor for the whole intent layer. |
| R6 | command — `check-trigger-predicates.mjs` reporting the same 10 outcomes as pre-change; plus a rejected fixture attempting predicate-structure rewrite | Phase 9 | Proves the split moved numbers only, not control. |
| R7 | manual — a fresh `init` in a scratch repo, recording which intent items inspection resolved and which were batch-asked; all 8 `manual_qa` fields | Phase 10 | Interview behavior has no command proof. |
| R8 | manual — a repo stamped with an older `agentsmyth_version` run through `agentsmyth check`, then a full lifecycle phase completed with items still open; all 8 `manual_qa` fields | Phase 10 | Proves non-blocking and global fallback together. |
| RI7 | command — `npm run violations:test` rejecting fixtures setting `constraints_safety` and `repo_alignment` to `not-applicable` | Phase 8 | Two fixtures, one per floor. |
| RI8 | command — a fixture carrying both derived and hand-set mechanism values, re-derived, asserting hand-set values unchanged | Phase 8 | The safety property a later upgrade depends on. |
| RI9 | command — this repo's profile and all four `examples/` profiles validating unedited; `check-trigger-predicates.mjs` outcomes identical to pre-package | Phase 12 | The minor-bump guarantee. If this fails, the release is a major. |

No `R`/`RI` relies on a skipped check. No waiver is required.

## Architecture Notes

- **role:** Principal Engineer
- **decision:** three separated layers — schema (enumeration + value domains), validator (cross-file rules only), consumption (code and prose). The enumeration exists once, in the schema, per Q1. `check-config.mjs` deliberately holds no key list, so there is nothing for a future edit to desynchronize.
- **decision:** resolution semantics fixed as global-overridden-by-local, with `user_checkpoint_required_for` as the single union exception. Stated once in the Approach and repeated verbatim wherever implemented, so the exception cannot be quietly generalized or forgotten.
- **decision:** `skill_scoring.triggers` stays global-only inside the Phase 3 merge even though `weights` and `path_glob_categories` are merged beside it. It is a locked key; merging it would silently open per-repo predicate rewriting through the back door.
- **constraint:** `repo-profile.schema.yaml` root is `additionalProperties: false`, so `tuning:` must be explicitly declared; and its `required:` array must not change or 1.1.0 stops being a minor.
- **constraint:** zero runtime dependencies. The merge and union logic are hand-rolled against the existing `lib.mjs` helpers.
- **constraint:** `src/workflow/` is source; `dist/`, root `validators/`, `workflow/schemas/` are build products. Phase 12 is not optional bookkeeping — skipping it ships a bundle without the feature.
- **tradeoff:** Phase 3 couples a definitions-side validator to repo-local data, which is a mild layering violation. Accepted per Q2: the alternative is a validator that silently checks a glob set the agent will not use.
- **tradeoff:** four separate fixtures in Phase 5 rather than one combined one. More files, but each failure names one rule, which is what makes a negative suite useful when it fires a year from now.
- **assumption Build must preserve:** absent `tuning:`, behavior is byte-identical to today. Every phase gate is written to detect a regression here.
- **decision (Q4, user, 2026-08-12):** option (a) — Phase 4 creates the two missing consumption points rather than shipping those keys inert or dropping them. This makes Phase 4 the largest and highest-judgment phase in the package; it is sequenced after the mechanical phases so a Build stall there does not block Phases 1–3 and 5.
- **downstream:** Review focuses on three surfaces where a defect is silent rather than loud: the locked-key surface, the union rule, and — added by Q4's resolution — the new checkpoint-enforcement prose, which must be read specifically for whether a tuned list could ever weaken enforcement (risk R-8). Test needs Phase 4's manual-QA grep recorded with all 8 `manual_qa` fields, since prose correctness has no command. Ship merges to `release/1.1.0`, cuts no tag, and owns the Notion WP page correction (R-7). Reflect should log the `CLAUDE.md` "4 fixtures" staleness as a follow-up.

## Open Questions

- **Q4** — Two of the five tunables have no consumption point anywhere in the repo today. `dispatch.enabled` is never read by `dispatch-subagents/SKILL.md` (it keys off "explicit authorization" at line 22). `pause_resume.user_checkpoint_required_for` is never read by any validator or skill — `check-lifecycle.mjs` enforces whatever `user_checkpoint` an artifact happens to declare, and never consults the global required-for list. So making these two tunable means **authoring the enforcement rule they tune**, not adjusting an existing one. Options: (a) full scope — Phase 4 creates both consumption points, honouring Q3's "RI1 fully in"; (b) narrow — ship all five as validated config, but explicitly document that these two are declared-not-yet-consumed, and open a follow-up; (c) drop the two unconsumed keys from the 1.1.0 allowlist and ship three tunables that all demonstrably work. **Recommendation: (a)**, consistent with your Q3 answer and with the package's reason for existing — but it is meaningfully more work than the WP page describes, and `user_checkpoint_required_for` in particular means writing new checkpoint-enforcement behavior, which is close to gate logic and deserves care.
  - Owner: user. Blocking: no — Phases 1, 2, 3, 5 are unaffected and Build can start on them. Phase 4 cannot complete until this is answered.
  - **Status: resolved 2026-08-12 — option (a), full scope.** Phase 4 creates both missing consumption points. Rejected: (b) declared-not-yet-consumed, which ships two of five tunables inert and contradicts Q3's "RI1 fully in"; (c) dropping the two keys, which would narrow the allowlist the WP page settled on 2026-08-09 and leave `repo-profile.yaml` unable to express the two knobs a stricter repo most plausibly wants.
  - Consequence for Build: `pause_resume.user_checkpoint_required_for` is the sharp one. Its consumption point is new checkpoint-enforcement behavior sitting adjacent to `check-lifecycle.mjs`'s hard gate, so Phase 4 must establish it as a rule the agent reads *in addition to* the existing per-artifact `user_checkpoint` enforcement — never as a replacement for it, and never in a way that lets a tuned list cause an artifact to skip a checkpoint it declares. Phase 4's exit gate is extended below to assert exactly that.

## Checkpoint Approval

- Checkpoint: plan-review
- Status: approved
- User's own words (verbatim, this turn): "Plan is approved"
- Date: 2026-08-12

## Exit Gate

- [x] Every active R and RI mapped to a phase.
- [x] Every phase has a binary exit gate.
- [x] Verification plan covers every R and RI.
- [x] User approved or waiver recorded.
