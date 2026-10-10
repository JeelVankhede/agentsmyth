---
slug: upgrade-hardening-1-1-1
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-10-10
updated: 2026-10-10
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, RI1, RI2, RI3, RI4, RI5]
upstream:
  - workflow/artifacts/briefs/upgrade-hardening-1-1-1-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
skill_trigger_log:
  - skill: domain.clean-code-architect
    decision: ran
    reason: "Trigger `complexity_score >= 50`. Score ≈ 30 (files, capped) + 20 (5 RI × 4) + 6 (standard) = 56, so true. Ran. Outcomes are recorded in Architecture Notes: the tier resolution moves into one lib.mjs helper instead of a third copy, appendPendingItems keeps one code path for all three families, and config-key detection is one small indentation-aware helper rather than per-field regexes."
  - skill: domain.quality-gates-validator
    decision: ran
    reason: "Trigger `task_class != trivial`; class is standard. Ran. The Verification Plan uses verification.yaml's two required commands plus the suites each phase touches. It adds revert-and-fail demonstrations for R4/R5, because a regression test that has never failed proves nothing. It adds a scratch-home trial for RI3, which no configured command covers."
  - skill: domain.system-design-advisor
    decision: skipped
    reason: "Trigger `complexity_score >= 60 OR new_surface`. Score 56 < 60. No new surface: one new test suite inside the existing test/run-*.mjs pattern, and no new command, config key or artifact type. Both disjuncts false."
  - skill: domain.interface-contract-designer
    decision: skipped
    reason: "Trigger `path~contract_globs OR touches_contract`. No planned touch matches contract_globs (no **/cli/**, **/api/**, openapi, proto, graphql), and repo-profile public_contracts is empty. The pending-setup item shape is unchanged; only which items get appended changes."
  - skill: domain.data-schema-designer
    decision: skipped
    reason: "Trigger `path~schema_globs`. src/workflow/schemas/repo-profile.schema.yaml gets a description-text edit, but `**/schema/**` doesn't match the `schemas/` directory and no schema shape changes. False."
  - skill: domain.ui-ux-designer
    decision: skipped
    reason: "Trigger `path~ui_globs`. No .vue/.tsx/.jsx/.css or components/views/screens touched. False."
  - skill: domain.performance-optimizer
    decision: skipped
    reason: "Trigger `path~hotpath_globs OR complexity_score >= 60`. No **/hot/** or **/perf/** touch; score 56 < 60. Both false."
---

# 1.1.1 upgrade hardening - Plan

## Summary

**Amended at Build (2026-10-10), formatting only.** The Touches lines originally listed paths without backticks. `check-scope-fence` reads only backtick-quoted paths, so every phase's declared scope parsed as empty, and validate failed on the first Changed Files entries. The paths are now backtick-quoted, and `test/fixtures/pending-setup-tier/**` became the trailing-slash prefix the fence accepts (it rejects interior globs). No file, requirement or phase boundary changed.

**Amendment 3, at Review (2026-10-10): scope addition, at the user's direction.** The user ruled that this bug-fix release carries no accepted findings or residual risks ("NO OPEN ITEMS, THIS IS A BUG FIX VERSION AND I WANT ALL OF THEM FIXED AS REPORTED"). Two changes follow:
- Phase 1's Touches gain `test/run-conformance-tests.mjs`. Review F3 is closed with a conformance check that the three copies of the council-member render instruction agree with the adapter templates.
- `configKeyPresent` in `bin/agentsmyth.mjs` (already in Phase 1's Touches) is extended to read flow-style mappings and quoted keys, closing the review's second residual risk.

Writing that guard exposed a real defect in all three copies, including setup step 5a.3, which already shipped in 1.1.0. They told the agent to write the definition to "the path named in the template's first line", but every template names its path on a `Placed at` line (Claude's first line is frontmatter `---`). So `src/setup/SKILL.md` joins Phase 1's Touches to correct step 5a.3. No requirement changes; all of this serves R2 and R6.

**Amendment 2, at Build (2026-10-10): scope addition.** Phase 2's Touches gain `.github/workflows/ci.yml` and `.github/workflows/release.yml`. The repo invariant `r22-every-suite-runs-in-ci` in `npm run conformance:test` requires every `:test` script to be invoked by both workflows, so the new `consumer-sweep:test` had to be wired in. Each workflow gains one line, both build the bundle before their suites, and no requirement changes.

The plan has three independent build phases and one verification-only phase:

1. Make the pending-item append work per item and skip already-set values, and teach the `model_tier` path to render the council-member definition (R1, R2, R5, R6).
2. Keep the two source-only validators out of the bundle, remove stale copies from existing installs, and add a consumer-sweep regression suite (R3, R4, RI3, RI4).
3. Make `check-pending-setup` name an unset blocking tier, through one shared tier resolver (R7).
4. Run the full contract suites and the revert demonstrations (RI5).

## Inputs

- Approved brief: `workflow/artifacts/briefs/upgrade-hardening-1-1-1-v1.md` (checkpoint "Brief is approved").
- Code read during Think and Plan: bin/agentsmyth.mjs:405-600 (item specs, append), :455-480 (`pendingItemsFrom`, `yamlScalar`), :900-960 (bundle expansion and ledger prune), :2035-2085 (reconcile caller); scripts/build-bundle.mjs:75-125; scripts/validate-template.mjs:14,60-66; check-lifecycle.mjs:120-232; check-setup-complete.mjs:262-285; check-pending-setup.mjs; src/setup/SKILL.md:240-279; test/run-init-prepare-interop-tests.mjs:260-320; test/run-violation-tests.mjs:20-30,528-539.
- `git show v1.0.0|v1.0.1|v1.1.0:bin/agentsmyth.mjs | grep -c expanded-files` → 0 / 0 / 1. Only 1.1.0+ writes the prune ledger.

## Requirement Coverage

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R1 | Phase 1 | per-item presence check in `appendPendingItems` |
| R2 | Phase 1 | config-value check before appending |
| R3 | Phase 2 | build-bundle exclusion list |
| R4 | Phase 2 | new consumer-sweep suite |
| R5 | Phase 1 | interop suite J5–J8 |
| R6 | Phase 1 | `model_tier` hint + router step 5 sub-step |
| R7 | Phase 3 | shared tier resolver + check-pending-setup line |
| RI1 | Phase 1 | existing J1–J4 unchanged + J7/J8 |
| RI2 | Phase 1 | empty-sequence and refuse branches unchanged; reconcile caller migrated |
| RI3 | Phase 2 | ledger prune (1.1.0 installs) + retired-files list (ledgerless 1.0.x installs) |
| RI4 | Phase 2 | two shipped comments reworded |
| RI5 | Phase 4 | full suite run, owned by Test |

## Assumptions Verified

| Assumption ID | Status | Evidence / Question |
|---|---|---|
| A1 | evidence-backed | bin/agentsmyth.mjs:468-472. `pendingItemsFrom` renders `field: ${yamlScalar(item.field)}`, which always double-quotes. Build matches the field line quoted or unquoted, so hand-written items are recognized too. |
| A2 | evidence-backed | check-setup-complete.mjs:272 already detects `model_tier` textually. `per_phase` is a mapping (workflow/config/repo-profile.yaml:54-67 shape), so Build uses an indentation-aware key-path scan (`tuning` → `council` → key) instead of a scalar regex. bin/agentsmyth.mjs:22-25 and :1350-1352 record the deliberate no-lib.mjs-import rule in bin. |
| A3 | evidence-backed | appendIntentPendingItems (:589) and appendCouncilTuningPendingItems (:598) both go through `appendPendingItems`, so a per-item change applies to both. |
| A4 | evidence-backed | The fix keys on file content and config values, never on which build wrote the items. That is independent of provenance by construction. |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| bin/agentsmyth.mjs | modify | R1, R2, R6, RI1, RI2, RI3 | `appendPendingItems` per-item; `configKeyPresent` helper; family wrappers and reconcile caller updated; `model_tier` hint; retired-definitions list in prepare |
| src/workflow/router.md | modify | R6 | step-5 sub-step for `tuning.council.model_tier` |
| test/run-init-prepare-interop-tests.mjs | modify | R5, RI1 | new J5–J8 cases |
| scripts/build-bundle.mjs | modify | R3 | `SOURCE_ONLY` exclusion list |
| src/workflow/validators/check-setup-refs.mjs | modify (comment) | R3 | header names the exclusion list |
| src/workflow/validators/check-trigger-predicates.mjs | modify (comment) | R3 | header names the exclusion list |
| src/workflow/agent-behavior.yaml | modify (comment) | RI4 | :341 says the check is source-repo-only |
| src/workflow/schemas/repo-profile.schema.yaml | modify (description) | RI4 | :397-401 same |
| test/run-consumer-sweep-tests.mjs | create | R4, RI3 | sweep suite + retired-file prune case |
| package.json | modify | R4 | `consumer-sweep:test` script |
| .github/workflows/ci.yml, .github/workflows/release.yml | modify | R4 | run `consumer-sweep:test` (amendment 2; conformance `r22-every-suite-runs-in-ci`) |
| src/workflow/validators/lib.mjs | modify | R7 | `resolveCouncilTier(configDir)` helper |
| src/workflow/validators/check-lifecycle.mjs | modify | R7 | uses the helper; messages unchanged |
| src/workflow/validators/check-pending-setup.mjs | modify | R7 | one advisory line, exit 0 |
| test/run-setup-complete-tests.mjs | modify | R7 | three tier-line cases |
| test/fixtures/pending-setup-tier/** | create | R7 | tier-unset / tier-set / councils-disabled config trees |
| dist/workflow-bundle.md, dist/setup-bundle.md, validators/lib.mjs | regenerate | R3, R6, R7, RI4 | `npm run build` only, never hand-edited |

## Source-of-Truth Strategy

No external source-of-truth provider is involved. The brief and the two pasted findings are the source. No tracker or external update is planned.

## Approach

- **Per-item append.** `appendPendingItems(configDir, specs, family)`:
  - First filters `specs` to the missing ones. A spec is missing when no line matches `^\s*-?\s*field:\s*["']?<field>["']?\s*$`, AND `configKeyPresent(join(configDir, spec.config ?? 'repo-profile.yaml'), spec.field)` is false.
  - If none are missing, it returns 0. Otherwise the existing branches (refuse+warn, `items: []` rebuild, plain append) run unchanged on the filtered list.
  - The refuse warning names the family and the missing fields, so J2b's assertion on `tuning.council.per_phase` still holds.
  - The `marker` parameter becomes a `family` label used only for the warning. Its three callers are updated.
  - Reconcile fields (`reconcile.<v>.<path>`) are never config keys, so the value check is a no-op for them, and their own ledger guard is untouched.
- **`configKeyPresent(path, dotted)`.**
  - It reads the file (absent → false) and walks the dotted segments by indentation.
  - Each segment must appear as `<indent><key>:` under its parent's block, where a block ends at the next line with indent ≤ the parent's. Blank lines and `#` comments are ignored.
  - "Present" means the key line exists with a non-empty scalar or a child block. A bare `key:` with no children, or `key: null`/`~`/`""`, is not present.
  - It errs toward "absent", so an unusual layout re-asks a question rather than dropping one.
- **R6 text.**
  - The `model_tier` hint gains one sentence: resolving it also means rendering `<definitions_root>/adapters/<tool>/council-member.md` with the tier substituted to the tool-native path the template names, and skipping that if the item is waived.
  - router.md step 5 gets a nested bullet with the same instruction, citing that the setup skill is gone post-setup.
  - Adapters are untouched, so golden rule 3 is not engaged.
- **Source-only exclusion.**
  - `const SOURCE_ONLY = new Set(['src/workflow/validators/check-setup-refs.mjs', 'src/workflow/validators/check-trigger-predicates.mjs'])` filters `workflowFiles`, with a comment pointing at the sweep suite as the guard.
  - The files stay put, so every existing suite path and the mutation audit's directory enumeration still reach them.
- **Retired definitions.**
  - prepare gets `RETIRED_DEFINITION_FILES = ['workflow/validators/check-setup-refs.mjs', 'workflow/validators/check-trigger-predicates.mjs']`.
  - It removes those paths from the definitions tree when present, whether or not a ledger exists. The definitions tree is agentsmyth-owned, and the paths are exact files, never globs.
  - This covers installs last prepared by 1.0.x, which have no ledger. The ledger prune already covers 1.1.0 installs.
- **Tier resolver.**
  - `resolveCouncilTier(configDir)` in lib.mjs returns `{ state: 'disabled' | 'resolved' | 'invalid' | 'unset' | 'unreadable', tier, councilPhases }`, using exactly the reads and precedence in check-lifecycle.mjs:150-180.
  - check-lifecycle maps states to its existing messages, byte-identical.
  - check-pending-setup prints `check-pending-setup: note — tuning.council.model_tier is unset while councils are enabled; check-lifecycle refuses council phases (<phases>) until it is set (cheap | standard | deep) or tuning.council.enabled is disabled` on `unset`, and an `invalid` variant naming the bad value. Exit stays 0.
- **Sweep suite.**
  - It expands `dist/workflow-bundle.md` into a temp `AGENTSMYTH_HOME`, makes an empty git-inited temp repo, and runs every expanded `validators/check-*.mjs` with cwd = that repo and a timeout.
  - A validator may fail, but it fails the suite if its output names `src/setup/`, `src/workflow/`, or `examples/`.
  - It also asserts the bundle carries no `SOURCE_ONLY` file, and runs the retired-file prune case against a ledgerless fake home.

## Phases

### Phase 1 - Per-item pending append and tier render instruction

- **Manifest IDs:** R1, R2, R5, R6, RI1, RI2
- Touches: `bin/agentsmyth.mjs`, `src/workflow/router.md`, `test/run-init-prepare-interop-tests.mjs`, `test/run-conformance-tests.mjs`, `src/setup/SKILL.md`
- Work:
  - Implement `configKeyPresent` and per-item filtering in `appendPendingItems`, and update the three callers.
  - Add the R6 hint sentence and the router sub-step.
  - Add interop cases:
    - J5: `per_phase` item present, `model_tier` absent → exactly `model_tier` added.
    - J6: J5 run twice → second run adds nothing.
    - J7: `per_phase` set in profile, no items, `model_tier` absent → only `model_tier` added.
    - J8: both set in profile → nothing added.
- **Exit gate:**
  - `npm run init-prepare-interop:test` and `npm run upgrade-path:test` pass with J5–J8 present.
  - J5 and J7 fail when `appendPendingItems`' filter is reverted to the old family-marker early return (demonstrated once, recorded in the task artifact).

### Phase 2 - Source-only validators out of the install

- **Manifest IDs:** R3, R4, RI3, RI4
- Touches: `scripts/build-bundle.mjs`, `bin/agentsmyth.mjs`, `src/workflow/validators/check-setup-refs.mjs`, `src/workflow/validators/check-trigger-predicates.mjs`, `src/workflow/agent-behavior.yaml`, `src/workflow/schemas/repo-profile.schema.yaml`, `test/run-consumer-sweep-tests.mjs`, `package.json`, `.github/workflows/ci.yml`, `.github/workflows/release.yml`, `dist/workflow-bundle.md`, `dist/setup-bundle.md`
- Work:
  - Add the exclusion list and the retired-definitions removal.
  - Reword the two shipped comments and the two validator headers.
  - Write the sweep suite and its npm script, then `npm run build`.
- **Exit gate:**
  - The `grep` from R3's acceptance returns nothing.
  - `npm run validate` still shows both validators passing.
  - `npm run consumer-sweep:test` passes, and fails when `SOURCE_ONLY` is emptied (demonstrated once, recorded).

### Phase 3 - Blocking tier named by check-pending-setup

- **Manifest IDs:** R7
- Touches: `src/workflow/validators/lib.mjs`, `src/workflow/validators/check-lifecycle.mjs`, `src/workflow/validators/check-pending-setup.mjs`, `test/run-setup-complete-tests.mjs`, `test/fixtures/pending-setup-tier/`, `validators/lib.mjs`
- Work:
  - Extract `resolveCouncilTier` and switch check-lifecycle onto it with no message change.
  - Add the advisory line and the three fixtures and cases, then `npm run build`.
- **Exit gate:**
  - The tier-unset fixture prints the note and the other two don't; all exit 0.
  - `npm run violations:test` passes, which includes the existing check-lifecycle tier-gate fixtures.

### Phase 4 - Full contract verification

- **Manifest IDs:** RI5
- Touches: none (verification only; results recorded in the verify artifact)
- Work:
  - Run build, validate, violations, conformance, every suite touched above, and the mutation audit.
  - Run the RI3 scratch-home trial: a 1.1.0-shaped home with a ledger, then `prepare` from the branch, and confirm both files are gone.
- **Exit gate:** every listed command exits 0 with output recorded, and the mutation audit reports no new survivors against `test/mutation-baseline.json`.

## Dependency Order

Phases 1, 2 and 3 share no code path. Phase 2 and Phase 1 both edit bin/agentsmyth.mjs, in disjoint functions (`appendPendingItems` vs. prepare's expansion), so they run sequentially: 1 → 2 → 3 → 4. Each phase rebuilds before its exit gate, and Phase 4 runs last on the final tree.

## Branch Strategy

All work on `fix/1.1.1-upgrade-hardening` (cut from `main` at 5a089ea). One commit per phase plus lifecycle-artifact commits, and only when the user asks. No push and no PR without explicit confirmation.

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|
| Textual key scan misreads an unusual repo-profile layout | low | low: one redundant non-blocking question | errs toward "absent"; J7/J8 cover the real layout | Build | R2 |
| A waived-then-pruned item with an unset value is re-asked | low | low; for `model_tier` it is correct, since the gate blocks regardless | accepted; documented in the append comment | Build | R1, RI1 |
| check-lifecycle refactor changes a gate message | medium | high: gate behavior drift | messages kept byte-identical; violations suite + mutation audit cover check-lifecycle | Build/Test | R7, RI5 |
| Mutation audit baseline shifts after the lib.mjs extraction | medium | medium | run `mutation:audit` in Phase 4; if mutant counts move, update the baseline with the diff explained in the verify artifact | Test | RI5 |
| Sweep suite flakes on a validator that hangs on an empty repo | low | medium | per-validator timeout, reported by name | Build | R4 |
| A 1.0.x install upgraded straight to 1.1.1 keeps the stale files | high without mitigation | medium | `RETIRED_DEFINITION_FILES` removal, tested ledgerless | Build | RI3 |

## Verification Plan

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1 | command: `npm run init-prepare-interop:test` (J5, J6) + revert demonstration | test | |
| R2 | command: same suite (J7, J8) | test | |
| R3 | command: `npm run build` then `grep` on dist; `npm run validate` output | test | |
| R4 | command: `npm run consumer-sweep:test` + revert demonstration | test | |
| R5 | command: J5–J8 present and passing; J5/J7 fail on revert | test | |
| R6 | source + generated-output: grep router and a J5-appended item for the render instruction; `npm run conformance:test` | test | |
| R7 | command: `npm run setup-checks:test` tier cases; `npm run violations:test` | test | |
| RI1 | command: J1–J4 unchanged and passing | test | |
| RI2 | command: `npm run upgrade-path:test` (reconcile I-series) | test | |
| RI3 | command: sweep suite's ledgerless case; manual: scratch-home trial with a 1.1.0 ledger | test | manual QA fields per verification.yaml |
| RI4 | generated-output: `grep -n 'check-trigger-predicates\|check-setup-refs' dist/workflow-bundle.md` shows only source-only wording | test | |
| RI5 | command: `npm run validate`, `violations:test`, `conformance:test`, `mutation:audit` | test | the two verification.yaml-required commands are included |

## Architecture Notes

- role: Principal Engineer
- decision: Keep the validators in place with an exclusion list, rather than moving them, so mutation and violation coverage keep working. The sweep suite guards the list.
- decision: Extract the tier resolver into lib.mjs instead of copying it into check-pending-setup. The resolver already exists once in check-lifecycle and in a weaker textual form in check-setup-complete:272. A third, drifting copy is exactly the defect class this chain closes. check-setup-complete is left alone, out of scope.
- decision: `appendPendingItems` keeps one path for all families. A council-only special case would leave intent with the same half-family bug.
- constraint: no YAML parser import in bin (bin/agentsmyth.mjs:22-25); zero new dependencies; `dist/` and root `validators/` regenerated only via `npm run build`.
- tradeoff: retired-file removal is an explicit list, not a broader "delete anything unknown". The ledger already handles the general case for 1.1.0+, and a broad sweep of a ledgerless tree risks deleting user-placed files.
- downstream:
  - Review focuses on check-lifecycle message parity and on `configKeyPresent` edge cases.
  - Test owns the revert demonstrations and the scratch-home trial.
  - Ship decides the 1.1.1 version bump and CHANGELOG entry, which are not part of this plan.

## Open Questions

None.

## Checkpoint Approval

- Checkpoint: plan-review
- Status: approved
- User's own words (verbatim, this turn): "Build all phases"

## Exit Gate

- [x] Every active R and RI mapped to a phase.
- [x] Every phase has a binary exit gate.
- [x] Verification plan covers every R and RI.
- [x] User approved or waiver recorded.
