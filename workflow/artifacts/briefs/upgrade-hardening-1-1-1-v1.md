---
slug: upgrade-hardening-1-1-1
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-10-10
updated: 2026-10-10
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, RI1, RI2, RI3, RI4, RI5]
upstream:
  - user-request
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: brief-review
skill_trigger_log:
  - skill: repo-alignment-scan
    decision: ran
    reason: task_class is standard (predicate `task_class != trivial` is true). Mapped every requirement to its real surface — bin/agentsmyth.mjs:535-600, scripts/build-bundle.mjs:75, scripts/validate-template.mjs:14/66, check-lifecycle.mjs:150-232, check-setup-complete.mjs:262-285, check-pending-setup.mjs:65, src/setup/SKILL.md:240-279, router.md step 5, test/run-init-prepare-interop-tests.mjs:299-315, test/run-violation-tests.mjs:528-539, test/run-mutation-audit.mjs:71.
  - skill: architecture-decision-advisor
    decision: skipped
    reason: complexity_score ≈ 8 files×3 + 5 RI×4 + standard 6 = 50, below threshold 60; repo-profile paths.public_contracts is empty so touches_contract is false; no new surface (one new test suite inside an existing pattern). The one design choice (exclude-list vs move) is recorded in Architecture Notes.
  - skill: constraint-conflict-scan
    decision: ran
    reason: task_class is standard. Checked domain.yaml constraints — no conflict. [safety-2] is respected (no upgrade is run against a real repo; trials use scratch dirs). [provider-neutrality-*] untouched. CLAUDE.md golden rules 1–4 apply (edit src, rebuild, adapters untouched, zero deps).
---

# 1.1.1 upgrade hardening - Brief

## Source Links

- User request (this session): two pasted field findings from a consumer repo (niyam) upgraded to 1.1.0, then "one branch".
  - Finding A: the upgrade never asked `tuning.council.model_tier`, because the council item family is appended all-or-nothing behind a `per_phase` marker.
  - Finding B: `check-setup-refs` and `check-trigger-predicates` ship in every global install but only work inside agentsmyth's own source tree.
- Finding B revised mid-session by the user. It now asks for both validators to be source-only, plus an empty-repo regression test; the shipped-fixture option was dropped. It adds a separate feature request: a consumer-side check that each tuned `path_glob_categories` glob still matches tracked files. That request is a Non-Goal here.
- Scope agreed in-session: per-question append (skipping already-set values), source-only validators out of the bundle, regression tests for both, on one branch.

## Problem

**A.** `appendPendingItems` (bin/agentsmyth.mjs:535) returns early when the file contains the family marker. `appendCouncilTuningPendingItems` (:598) keys the two-item council family on `tuning.council.per_phase` alone. A repo carrying a `per_phase` item from an earlier build but no `model_tier` item gets nothing appended. `model_tier` is the one setting that blocks: `check-lifecycle.mjs:150-232` refuses every council phase (think, review) until it resolves. The pre-commit hook runs that gate, so commits get rejected while `check-pending-setup` reports "0 open".

A follow-on gap: once the tier is answered through the pending-item path, `check-setup-complete.mjs:262-285` requires the rendered council-member definition. The only instructions for rendering it live in `src/setup/SKILL.md` step 5a.3, which a consumer no longer has after setup deletes `.agentsmyth/`. Neither router step 5 nor the item's own `hint` mentions it.

**B.** `scripts/build-bundle.mjs:75` bundles every file under `src/workflow/`, so both validators reach `~/.agentsmyth/workflow/validators/`. Both read paths relative to the current directory that exist only in this repo (`src/setup/references/*`, `examples/power-skill-sandbox/expected-triggers.yaml`), so they fail in every consumer repo. `agentsmyth check` never runs them, which is why `check` and a sweep of the installed directory disagree.

## Goals

- An upgrade fills in a partly present item family, adding only the items that are missing and not already answered.
- No validator installed into a definitions tree depends on a file that exists only in agentsmyth's source repo.
- Both defects have regression tests that would have caught them.

## Non-Goals

- A new validator that checks a consumer's own `path_glob_categories` against their own files. That's a feature, and was explicitly deferred in-session.
- Retiring the `check-council-record` strictness on old records (finding A: "not a bug").
- The pre-existing `check-scope-fence` / `check-domain-placeholders` failures in the consumer repo.
- Changing the blocking semantics of `model_tier` itself.
- Releasing or publishing 1.1.1. Ship decides that separately.

## User Impact

Consumers upgrading from any 1.1.0 build whose `pending-setup.yaml` holds half the council family get the blocking tier question asked instead of a silent commit-hook rejection. Every consumer stops seeing two permanent false failures when sweeping installed validators.

## Success Metrics

- A fixture with a `per_phase` item and no `model_tier` gets exactly one item appended (`model_tier`).
- `dist/workflow-bundle.md` contains no FILE block for either source-only validator.
- Every bundled validator, run against an empty consumer repo, produces no error that names a source-repo-only path.

## Requirements

See Requirement Manifest.

## Constraints

- [CLAUDE.md golden rule 1–2] Edit `src/`, `scripts/`, `bin/`, `test/`; rebuild after `src/workflow/` changes.
- [CLAUDE.md golden rule 4] No runtime dependency. `bin/agentsmyth.mjs` imports no YAML parser today, so detecting "already set in repo-profile.yaml" must work within that.
- [agentsmyth-pending-setup contract] The append must stay idempotent and must never resurrect an item the user resolved or waived and then pruned (`bin/agentsmyth.mjs:530-534`).
- [release memory] 1.1.x is additive: no required-schema change, and every pre-existing artifact and config keeps validating.
- [safety-2] Trials run in scratch directories only; no `upgrade` against a real consumer repo.

## Risks

- Per-item checking could re-add an item the user resolved and pruned. RI1 mitigates this by also checking the config value.
- Detecting "value already set" without a YAML parser could false-negative on unusual formatting and re-add an item. The impact is one redundant non-blocking question, never a lost value.
- Removing validators from the bundle changes what `prepare` writes. If prune didn't remove them, existing 1.1.0 installs would keep the stale files (RI3).
- The mutation audit and violation suites enumerate `src/workflow/validators/`. Moving the files would silently drop their coverage, which the architecture decision avoids.

## Open Questions

- Q1: resolved: include it (R6). User answer: "Q1: yes".
- Q2: resolved: include it (R7). User answer: "Q2: yes".

## Requirement Manifest

### Explicit (R)

- **R1** - When appending an item family to an existing `pending-setup.yaml`, add each item whose `field` is not already present in the file, instead of skipping the whole family because one marker is present.
  - Acceptance: a fixture with a `tuning.council.per_phase` item and no `tuning.council.model_tier` item gains exactly one new item, `tuning.council.model_tier`, with the next free PS id. A second run appends nothing.
- **R2** - An item is not appended when its target value is already set in its config file, even when no item for it remains in `pending-setup.yaml`.
  - Acceptance: a fixture where `per_phase` is set in `repo-profile.yaml`, its item was pruned, and `model_tier` is absent gains only the `model_tier` item. A fixture with both values set gains nothing.
- **R3** - `check-setup-refs.mjs` and `check-trigger-predicates.mjs` are not included in `dist/workflow-bundle.md`, so `prepare` does not install them. They still run in this repo's own `npm run validate`.
  - Acceptance: `grep 'FILE: workflow/validators/check-setup-refs.mjs\|FILE: workflow/validators/check-trigger-predicates.mjs' dist/workflow-bundle.md` returns nothing after `npm run build`. `npm run validate` output still shows both validators running and passing.
- **R4** - A regression test runs every validator in the bundle against an empty consumer repo and fails when any error names a path that exists only in the source repo.
  - Acceptance: the suite fails when the exclusion from R3 is reverted (demonstrated once during Build/Test) and passes with it in place.
- **R5** - A regression test covers the half-present council family (R1) and the set-and-pruned case (R2).
  - Acceptance: both cases exist in an existing or new suite and fail against the pre-fix `appendPendingItems`.

- **R6** - Answering `tuning.council.model_tier` through the pending-item path also tells the agent to render the council-member definition. The `model_tier` item's `hint` (bin/agentsmyth.mjs:438) and a new router.md step-5 sub-step for `tuning.council.model_tier` both name `<definitions_root>/adapters/<tool>/council-member.md`. They also say to substitute the tier, write the result to the tool-native path the template names, and skip rendering if the item is waived. This mirrors src/setup/SKILL.md step 5a.3, which consumers no longer have.
  - Acceptance: `dist/workflow-bundle.md`'s router and a newly appended `model_tier` item both contain the render instruction and the definitions-root template path. `npm run conformance:test` passes, and adapters are untouched.
- **R7** - `check-pending-setup` prints one extra line, still exiting 0, when `tuning.council.model_tier` resolves to nothing (repo tuning, then global) while dispatch and councils are enabled. The line names the gate the unset tier will trip. The resolution matches `check-lifecycle.mjs`'s `councilTierPrecondition`, with no new rule.
  - Acceptance: one fixture with the tier unset and councils enabled prints the line, and two fixtures (tier set; councils disabled) don't. All exit 0, and the existing check-pending-setup violation cases still pass.

### Implicit (RI)

- **RI1** - Idempotency and non-resurrection hold: re-running never duplicates an item, and never re-adds one whose value is set.
  - Acceptance: existing `init-prepare-interop` cases at test/run-init-prepare-interop-tests.mjs:299-315 still pass unchanged, plus R2's fixture.
- **RI2** - The `items: []` rebuild branch and the refuse-and-warn branch (`bin/agentsmyth.mjs:551-577`) keep their behavior when only a subset of a family is appended. The reconcile-item caller at :2082 (single-spec, own marker) is unaffected.
  - Acceptance: `npm run upgrade-path:test` and `npm run init-prepare-interop:test` pass.
- **RI3** - Existing 1.1.0 installs lose the two stale validator files on the next `prepare`, through the existing bundle-ledger prune.
  - Acceptance: a scratch-home trial (1.1.0-shaped install with both files, then `prepare` from the branch build) shows both files removed. Alternatively an existing suite already asserts prune of dropped bundle files, cited by line.
- **RI4** - Shipped text that tells consumers to run or rely on these validators no longer does: `src/workflow/agent-behavior.yaml:341` comment and `src/workflow/schemas/repo-profile.schema.yaml:397-401` description.
  - Acceptance: both read as source-repo-only checks. `grep -rn 'check-trigger-predicates\|check-setup-refs' dist/workflow-bundle.md` shows only those clarified mentions.
- **RI5** - The full contract suites stay green: `npm run build`, `npm run validate`, `npm run violations:test`, `npm run conformance:test`, plus the suites R4/R5 touch, and `npm run mutation:audit` shows no lost coverage for the two validators.
  - Acceptance: current command output recorded in the verify artifact.

### Assumptions (A)

- **A1** - Field presence in `pending-setup.yaml` can be detected by the same `field: "<name>"` substring convention the current marker uses. Every item the CLI writes renders `field:` with that exact quoting (`pendingItemsFrom`).
- **A2** - "Value already set" for the two council fields can be detected from `repo-profile.yaml` text without a full YAML parse, the same way `check-setup-complete.mjs:272` already detects `model_tier`. Plan confirms the exact rule for `per_phase` (a mapping, not a scalar).
- **A3** - The intent family (`intent.*` marker) gets the same per-item treatment for free through the shared `appendPendingItems`. No intent-specific behavior is requested or expected to change.
- **A4** - Which earlier 1.1.0 build wrote PS-9..PS-12 into the consumer repo doesn't change the fix (stated in finding A).

### Open Questions (Q)

- **Q1** - Should this branch also close the council-member render gap: once `model_tier` is answered via the pending item, nothing post-setup tells the agent to render `<definitions_root>/adapters/<tool>/council-member.md` to the tool-native path, so `check-setup-complete` then fails?
  - Owner: user
  - Blocking: no (resolved 2026-10-10: "Q1: yes" → R6)
- **Q2** - Should `check-pending-setup` name an unresolved blocking setting (tier unset while councils are enabled) in its output, instead of a bare "0 open"?
  - Owner: user
  - Blocking: no (resolved 2026-10-10: "Q2: yes" → R7)

## Questions For User

Both resolved by the user on 2026-10-10 ("Q1: yes", "Q2: yes"). The recommendations are kept below for the record.

- **Q1 — council-member render gap.** Recommendation: **include it.** It's the second half of the failure chain the user reported, and without it fixing R1 just moves the consumer from one red gate to the next.
  - The fix is text only:
    - Extend the `model_tier` item's `hint` (bin/agentsmyth.mjs:438) to say that resolving it also means rendering the definition from `<definitions_root>/adapters/<tool>/council-member.md`.
    - Add the same as a sub-step under router.md step 5 for `tuning.council.model_tier`.
  - Evidence:
    - src/setup/SKILL.md:240-279 is the only place the step exists, and setup deletes that file in consumers.
    - router.md step 5 covers only "apply the value to the config".
    - check-setup-complete.mjs:272-283 enforces the file.
    - build-bundle.mjs:85-97 already ships the templates to the definitions tree, so the instruction has something to point at. (bucket R1)
- **Q2 — misleading "0 open".** Recommendation: **include a minimal version.**
  - `check-pending-setup` keeps exit 0. It adds one line when `model_tier` resolves to nothing while councils are enabled, naming the gate it will trip.
  - It reuses the resolution `check-lifecycle.mjs:150-180` already performs; no new rule.
  - Evidence: check-pending-setup.mjs:65 prints counts only, and the consumer saw "0 open" while the gate refused. (bucket R1)
  - Alternative: leave it out. R1 alone means the item is now *open*, so the count is no longer 0 for the reported case.

## Architecture Notes

- role: Architect
- decision: **Exclude the source-only validators in `scripts/build-bundle.mjs` with a named list, rather than moving the files to `scripts/`.**
  - The files stay in `src/workflow/validators/`, where `test/run-mutation-audit.mjs:71`, `test/run-violation-tests.mjs:23` (`validatorPath`), `test/run-tuning-merge-tests.mjs:164` and `test/run-setup-refs-tests.mjs:13` already find them.
  - Rejected alternative: moving them. It would touch every one of those suites, and the mutation audit's directory enumeration would silently stop covering them.
  - The weakness of a list (someone forgets to add a future source-only validator) is closed by R4's test, which would fail on that omission.
- decision: per-item append is implemented inside the shared `appendPendingItems`, so every family (intent, council, reconcile) benefits. The family-level marker becomes redundant and is replaced by per-spec `field` checks.
- constraint: no YAML parser in `bin/`; config-value detection is textual (A2) and errs toward re-asking, never toward dropping an item.
- constraint: shipped definitions change (bundle content, two comments), so `npm run build` is required and `dist/` is regenerated, not hand-edited.
- tradeoff: `check-trigger-predicates` stays source-only, not shipped with a fixture. Its `expected:` map was computed against the global globs, so it would false-fail on exactly the repos that tune `path_glob_categories`.
- downstream: Plan sequences A (bin + tests, plus R6 hint/router text), B (bundler + new suite) and C (R7 check-pending-setup line + fixtures) as independent tasks. R7 reuses the tier resolution and doesn't fork it; if that needs a shared helper in lib.mjs, Plan says so. Test must run the scratch-home prune trial (RI3). Ship decides version bump and CHANGELOG.

## Checkpoint Approval

- Checkpoint: brief-review
- Status: approved
- User's own words (verbatim, this turn): "Brief is approved"

## Exit Gate

- [x] Every active R and RI has acceptance criteria.
- [x] Blocking Q IDs appear in orchestration.blockers (Q1 and Q2 resolved; none remain).
- [x] User approved or waiver recorded.
