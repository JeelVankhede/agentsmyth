---
slug: manifest-id-parser-hardening
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-07-18
updated: 2026-07-18
manifest_ids: [R1, R2, R3, RI1, RI2, RI3]
upstream:
  - workflow/artifacts/briefs/manifest-id-parser-hardening-v1.md
  - workflow/artifacts/plans/manifest-id-parser-hardening-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# Manifest-ID Parser Hardening - Task

## Active Phase

- Phase: Phase 6 - Review fixes
- Manifest IDs: R1, R2, RI1, RI2
- Exit gate: all 4 Review findings resolved with evidence; `npm run
  build/validate/violations:test/conformance:test` all pass; `git diff package.json` empty;
  Review artifact updated to reflect the fixed state.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Shared `parseIdList()` + `check-phase-map.mjs` fix | complete | R3 |
| Phase 2 - `check-manifest-coverage.mjs` structured-tag scanning | complete | R1 |
| Phase 3 - `check-coverage-ledger.mjs` narrower fix | complete | R2 |
| Phase 4 - New fixtures | complete | RI2 |
| Phase 5 - Full verification | complete | RI1, RI3 |
| Phase 6 - Review fixes | complete | R1, R2, RI1, RI2 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `feat/manifest-id-parser-hardening` | clean except two untracked lifecycle artifacts (brief, plan) | No unrelated changes to preserve |

## Scope

- In scope: `src/workflow/validators/lib.mjs`, `check-phase-map.mjs`,
  `check-manifest-coverage.mjs`, `check-coverage-ledger.mjs`; new fixtures under
  `test/fixtures/lifecycle-violations/` or wherever Phase 4 determines is the correct
  "must-pass" suite; `test/run-violation-tests.mjs` and/or `test/run-conformance-tests.mjs`.
- Out of scope: `check-scope-fence.mjs` (excluded per the brief's Source Links correction).

## Changed Files

- `src/workflow/validators/lib.mjs` — added `export function parseIdList(raw)` — IDs: R3
- `src/workflow/validators/check-phase-map.mjs` — imports `parseIdList`, replaces the inline
  `idsMatch[1].split(',').map(s => s.trim()).filter(Boolean)` with `parseIdList(idsMatch[1])`
  — IDs: R3
- `src/workflow/validators/check-manifest-coverage.mjs` — `taskDerivedIds()` rewritten to
  scan 3 structured positions (`— IDs:` tags, table-row first cells with one or more
  comma-separated IDs, bare `(ID)`/`(ID, ID2)` parenthetical tags) instead of free-prose
  bare-word matching; new local `isPureIdTag()` helper — IDs: R1
- `src/workflow/validators/check-coverage-ledger.mjs` — `waiverIds()`'s regex gains a
  negative lookbehind/lookahead for a preceding/following hyphen, excluding the
  `WP-R#`-style compound-token class while keeping free-word (including
  parenthesized) matching intact — IDs: R2
- `test/fixtures/conformance/manifest-id-false-positive/tasks/probe-v1.md`,
  `test/fixtures/conformance/manifest-id-false-positive/reviews/probe-v1.md` — new fixture
  pair: a task Changed Files section mixing a `WP-R7-T7.2` compound-token mention and an
  incidental "so R6 has..." sentence with one real `— ID: R5` tag, paired with a review
  declaring only `R5` — IDs: R1, RI2
- `test/fixtures/conformance/phase-map-parenthetical/plans/probe-v1.md` — new fixture: a plan
  with `**Manifest IDs:** RI2 (partial)` and `**Manifest IDs:** RI1 (infra supporting R2, R3,
  R4, R7 verification)` across two phases — IDs: R3, RI2
- `test/run-conformance-tests.mjs` — added `mid-false-positive` and `phase-map-parenthetical`
  checks invoking the two new fixtures against the real validators — IDs: RI2
- `workflow/artifacts/plans/manifest-id-parser-hardening-v1.md` — Phase 4's Touches/Work
  corrected from the placeholder `test/fixtures/lifecycle-violations/` /
  `test/run-violation-tests.mjs` to the actually-chosen `test/fixtures/conformance/...` /
  `test/run-conformance-tests.mjs`, matching Build's resolved decision — IDs: RI2
- `workflow/artifacts/plans/manifest-id-parser-hardening-v1.md` — added Phase 6 (Review
  fixes), declaring Touches for the P2/P3 fix work below; corrected the Requirement Coverage
  table's stale RI2 row (`violations:test` → `conformance:test`) — IDs: RI2 (Review P2, P3)
- `.github/workflows/ci.yml` — added a `Run conformance tests` step
  (`npm run conformance:test`) to the `validate` job — IDs: RI1, RI2 (Review P2)
- `src/workflow/validators/lib.mjs` — added a cross-reference comment on `parseIdList()`
  pointing at `check-manifest-coverage.mjs`'s `isPureIdTag()` (duplicated ID-shape regex) —
  IDs: R1 (Review P3)
- `src/workflow/validators/check-manifest-coverage.mjs` — added the matching cross-reference
  comment on `isPureIdTag()` — IDs: R1 (Review P3)
- `src/workflow/validators/check-coverage-ledger.mjs` — `waiverIds()`'s regex narrowed from
  `/(?<!-)\b(R(?:I)?[0-9]+)\b(?!-)/g` to `/(?<!-)\b(R(?:I)?[0-9]+)\b/g` (dropped the trailing
  lookahead) — the leading-hyphen exclusion alone already fully covers the real compound-token
  cases (`WP-R7-T7.2`, `WP-R2`, `WP-R4`); the trailing exclusion was over-correction that
  false-negatived a hyphenated sub-label mention (`RI5-a`) — IDs: R2 (Review P3)
- `test/fixtures/conformance/coverage-ledger-sublabel/plans/probe-v1.md` — new fixture: a plan
  with 2 dropped manifest IDs, one whose only Waivers mention is a hyphenated sub-label
  (`RI5-a`, must be credited), one whose only Waivers mention is a compound token
  (`WP-R7-T7.2`, must still be rejected) — IDs: R2, RI2 (Review P3)
- `test/run-conformance-tests.mjs` — added the `coverage-ledger-sublabel` check — IDs: RI2
  (Review P3)

## Implementation Log

### Phase 1 - Shared `parseIdList()` helper + `check-phase-map.mjs` fix

- Added `parseIdList()` to `lib.mjs` per the Plan's design: strip parenthetical content,
  split on commas, keep only exact-ID segments.
- **Real regression found and fixed during this same phase, not deferred to Test**: the
  Plan's exit gate only specified the two brief-derived cases (`RI2 (partial)`, `RI1 (infra
  supporting...)`), both of which passed on the first attempt. But re-running
  `check-phase-map.mjs` against the *full* existing artifact tree (not just the new cases) —
  exactly what RI1's "no regression" requirement calls for — immediately surfaced that
  `system-level-install-v1.md` uses bare hyphenated sub-labels (`RI5-a`, `RI5-b`, `RI5-c`,
  no parentheses at all) to decompose one implicit requirement across 3 phases, a pattern
  `check-phase-map.mjs`'s own coverage logic explicitly documents and relies on
  (`listedId.startsWith(id + '-')`). My first filter regex (`^R(I)?[0-9]+$`, exact match
  only) silently rejected `RI5-a` as invalid, breaking this. Fixed by extending the filter to
  `^R(I)?[0-9]+(-[a-zA-Z0-9]+)?$` — allows an optional hyphenated suffix — and re-verified
  all 4 cases (2 from the Plan, 2 from this regression) plus a full re-run of
  `check-phase-map.mjs` against every existing plan artifact.
- This is exactly why Plan sequenced "full verification against the existing tree" as its
  own phase (Phase 5) rather than trusting fixture-only evidence — caught here, one phase
  early, instead of surfacing later.

### Phase 2 - `check-manifest-coverage.mjs` structured-tag scanning

- First attempt (dash-tag scan + single-ID-per-cell table scan) passed the brief's own
  false-positive test cases immediately, but running against the full existing tree
  surfaced two more real regressions the Plan hadn't anticipated:
  1. A Verification Items row can hold *multiple* comma-separated IDs in one cell
     (`| R9, RI3, RI4 | ... |`) — the first table-row regex only captured a single bare ID
     per cell, silently dropping every ID in a multi-ID row. Fixed by running the cell
     content through `parseIdList()` instead of expecting exactly one token.
  2. `wp-r5-repo-shape-taxonomy-v1.md`'s task artifact uses a third convention altogether —
     a bare `(RI4)` parenthetical tag inline in prose (e.g. "...with zero intermediate
     breakage (RI4)"), not a dash-tag or a table row. Confirmed via `grep` that this pattern
     appears 31 times across existing task artifacts — a real, common convention, not a
     one-off. Added a third extraction path: any `(...)` group whose *entire* content is a
     comma-separated list of valid IDs (checked via a new local `isPureIdTag()` helper, not
     `parseIdList()`, since the semantics differ — `parseIdList()` tolerates non-ID content
     alongside IDs by design, while this check must reject a parenthetical that mixes prose
     with an ID). Verified this doesn't reintroduce either original false positive
     ("WP-R7-T7.2", "so R6 has...") since neither was ever parenthesized.
- Final state verified against all 3 patterns individually plus a full clean re-run of
  `check-manifest-coverage.mjs` against every existing review/task artifact pair.

### Phase 3 - `check-coverage-ledger.mjs` narrower fix

- Before implementing, checked Phase 2's own downstream note: does real Waivers content use
  the bare `(ID)` convention too? `grep` across every existing task artifact's `## Waivers`
  section confirmed yes — 2 real instances (`(RI2)`, `(RI5)`) — alongside 3 real
  `WP-R2`/`WP-R4` compound-token mentions, confirming the *original* bug is also live in
  Waivers content, not just hypothetical.
- Implemented exactly the Plan's designed fix (negative lookbehind/lookahead for a hyphen)
  and verified it already handles both findings correctly without modification: a paren
  isn't a hyphen, so `(RI2)`/`(RI5)` still match; `WP-R2`/`WP-R4` have the ID
  immediately preceded by `-`, so both are excluded. No `isPureIdTag()`-style widening
  needed here — the narrower fix was sufficient on the first attempt, unlike Phases 1-2.
- Full re-run against every existing plan/review/ship/reflect artifact (the 4
  `LEDGER_DIRS`) passed clean immediately — no regression found.

### Phase 4 - New fixtures

- Read `test/run-violation-tests.mjs` in full first: confirmed it is strictly a "must-fail"
  harness (`detected = result.status !== 0` counted as PASS) — not suited for asserting that
  correctly-tagged input passes clean. Read `test/run-conformance-tests.mjs` in full and
  confirmed it already contains the exact needed pattern — paired positive/negative
  `check(id, desc, cond)` assertions (e.g. `r12-all`/`r12-bad`, `r10-detect`/`r10-table`) —
  resolving the Plan's own explicitly-deferred decision in favor of the conformance suite.
- Inspected `test/fixtures/conformance/`'s existing directory convention (`waivers-dir/verify/probe-v1.md`,
  `table-claim/verify/probe-v1.md`) before designing the new fixtures, to match it exactly:
  each fixture directory holds only the specific artifact subpath(s) the target validator's
  `--dir` argument needs, not a full lifecycle chain.
- Fixture 1 (`manifest-id-false-positive/`): a task `## Changed Files` section combining the
  `WP-R7-T7.2` compound-token mention and the "so R6 has..." prose sentence (the two real
  false-positive scenarios found in Phase 2) with one genuinely tagged `— ID: R5` line, paired
  with a review declaring only `manifest_ids: [R5]`. Targets `check-manifest-coverage.mjs`.
- Fixture 2 (`phase-map-parenthetical/`): a plan with `**Manifest IDs:** RI2 (partial)` on one
  phase and `**Manifest IDs:** RI1 (infra supporting R2, R3, R4, R7 verification)` on another,
  declaring `manifest_ids: [RI1, RI2]`. Targets `check-phase-map.mjs`.
- **Verified fixtures are non-vacuous, not just passing on the fixed code**: `git stash`ed the
  4 fixed validator/lib files, re-ran both fixtures against the pre-fix code, and confirmed
  both genuinely fail (`check-manifest-coverage` flags spurious `R6`/`R7`; `check-phase-map`
  flags both `RI1` and `RI2` as orphans) before `git stash pop`-ing the fixes back. This
  confirms the fixtures actually exercise the bug class Phases 1-3 fixed, not a
  coincidentally-always-passing case.
- Wired both into `test/run-conformance-tests.mjs` as `mid-false-positive` and
  `phase-map-parenthetical` checks. Ran the full conformance suite (11/11 pass, including the
  9 pre-existing checks — zero regression) and the full violation suite (20/20 still detected
  — zero regression).

### Phase 5 - Full verification

- **Real issue found and fixed**: the first `npm run validate` run (with the Active Phase
  section updated to Phase 5, per this phase's own exit gate work) failed `check-scope-fence`
  — the Plan's Phase 4 Touches line still declared the placeholder
  `test/fixtures/lifecycle-violations/` / `test/run-violation-tests.mjs` path from before
  Build resolved the suite question, so the actual `test/fixtures/conformance/...` paths and
  `test/run-conformance-tests.mjs` fell outside the union of declared Touches. Fixed by
  correcting the Plan's Phase 4 Touches/Work text to match what was actually built (a
  documented resolution, not undeclared scope creep — the Plan itself flagged this exact
  decision as pending Build's investigation). Re-ran `npm run validate` clean after the fix.
- Ran `npm run build`, `npm run validate`, `npm run violations:test`, and
  `node test/run-conformance-tests.mjs` again after the Plan correction — all pass with zero
  regression.
- `git diff package.json` confirmed empty — no new runtime dependency introduced across any
  phase of this chain.

### Phase 6 - Review fixes

- Review (`workflow/artifacts/reviews/manifest-id-parser-hardening-v1.md`) found 1 P2 (CI
  never runs `npm run conformance:test`) and 3 P3s (stale Plan table cell; duplicated
  ID-shape regex; `check-coverage-ledger.mjs`'s narrower fix has an unnamed false-negative on
  hyphenated sub-labels). User said "Fix all."
- P2: added a `Run conformance tests` step to `ci.yml`'s `validate` job. Now all 12
  conformance checks (9 pre-existing + this chain's 3) run on every push/PR to `main`, not
  just locally.
- P3 (stale cell): corrected the Plan's Requirement Coverage table.
- P3 (duplicated regex): added a one-line cross-reference comment in both `lib.mjs` and
  `check-manifest-coverage.mjs` pointing at each other's copy of the ID-shape regex.
- P3 (sub-label false negative): the real fix. Ran an inline comparison first (before editing
  any file) of the current trailing-lookahead regex against a lookbehind-only variant across 8
  representative cases (`WP-R7-T7.2`, `WP-R2`, `WP-R4`, `RI5-a`, `RI5-b`, a bare `R1` mention,
  `(RI2)`, `(RI5)`) — confirmed the lookbehind alone already excludes every real compound-token
  case, and dropping the lookahead is exactly what's needed to credit `RI5-a`/`RI5-b` without
  reintroducing any of the 3 previously-fixed false positives. Applied the fix, then built a
  new fixture (`coverage-ledger-sublabel/`) proving both properties in one artifact: a plan
  with `RI5` (dropped, its only Waivers mention is `RI5-a`) and `R7` (dropped, its only
  Waivers mention is the compound token `WP-R7-T7.2`) — the fixed validator must flag only
  `R7`, never `RI5`. Confirmed exactly that output.
- **Non-vacuousness check differed from Phases 1-4's pattern**: since nothing on this branch
  is committed yet, `git stash`ing `check-coverage-ledger.mjs` reverts all the way to the
  original pre-Phase-3 bug (bare `/\b(R(?:I)?[0-9]+)\b/g`, no exclusion at all), not to the
  intermediate "Phase 3 fix, pre-Review-widening" state. Ran it anyway for a sanity check: the
  fully-unfixed regex reports 0 issues too, but for the wrong reason (it also over-credits
  `R7` from `WP-R7-T7.2`, masking the real problem) — confirming the fixture is sensitive to
  regex behavior, not a vacuous always-pass fixture. The real regression proof is the inline
  8-case comparison run before implementing, which directly shows old-vs-new behavior on the
  exact intermediate regex being replaced.
- Wired `coverage-ledger-sublabel` into `test/run-conformance-tests.mjs`. Full conformance
  suite: 12/12 pass (9 pre-existing + 3 from this chain, zero regression).

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R1 | Fixture with `WP-R7-T7.2`/prose false positive | No spurious error |
| R2 | Waivers fixture with compound-token false positive | No spurious error |
| R3 | Plan fixture with `RI2 (partial)` / `RI1 (infra supporting...)` | Correct ID set extracted |
| RI1 | Full `npm run validate` against existing artifacts; `ci.yml` now runs `conformance:test` too | No regression — pass |
| RI2 | New fixtures wired into test suite | `test/run-conformance-tests.mjs` 12/12 pass (incl. Phase 6's fixture) — pass |
| RI3 | `npm run build/validate/violations:test`, no new dependency | All pass, `git diff package.json` empty — pass |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `node --check lib.mjs && node --check check-phase-map.mjs` | Phase 1 | pass | Syntax valid |
| Inline `parseIdList()` calls: `RI2 (partial)`, `RI1 (infra supporting...)`, `R1, RI4, RI5-a`, `R4, RI2, RI3, RI4, RI5-c` | Phase 1, R3 | pass | All 4 return exactly the expected ID set |
| `node src/workflow/validators/check-phase-map.mjs` (full run, no `--dir`) | Phase 1, RI1 | pass (after 1 fix) | Initially failed: `system-level-install-v1.md`'s `RI5` flagged orphan (the `RI5-a`/`-b`/`-c` regression above). Re-ran clean after widening the filter regex |
| `node --check check-manifest-coverage.mjs` | Phase 2 | pass | Syntax valid |
| Inline `taskDerivedIds()` tests: bare paren tag, multi-ID row, false-positive exclusion | Phase 2, R1 | pass | All 3 cases correct |
| `node src/workflow/validators/check-manifest-coverage.mjs` (full run) | Phase 2, RI1 | pass (after 2 fixes) | Initially failed 5 ways across 3 files: multi-ID table cells silently dropped (fix 1), then `wp-r5-repo-shape-taxonomy-v1.md`'s bare `(RI4)` convention unrecognized (fix 2, confirmed 31 real instances repo-wide via grep before designing the fix). Clean after both |
| `grep` for `(ID)` and `WP-R#` patterns inside real `## Waivers` sections | Phase 3 | found 2 + 3 real instances | Grounded Phase 3's fix in evidence before implementing, per Phase 2's own downstream note |
| `node --check check-coverage-ledger.mjs` | Phase 3 | pass | Syntax valid |
| Inline `waiverIds()` regex tests: `WP-R4`, `(RI2)`, `(RI5)`, `WP-R2` | Phase 3, R2 | pass | All 4 real cases correct on the first attempt |
| `node src/workflow/validators/check-coverage-ledger.mjs` (full run) | Phase 3, RI1 | pass | Clean immediately, no regression |
| `node src/workflow/validators/check-manifest-coverage.mjs --dir test/fixtures/conformance/manifest-id-false-positive` | Phase 4, R1 | pass (exit 0) | No false positive on compound token / incidental prose |
| `node src/workflow/validators/check-phase-map.mjs --dir test/fixtures/conformance/phase-map-parenthetical` | Phase 4, R3 | pass (exit 0) | Parenthetical annotation parsed correctly, no orphans |
| Same 2 commands re-run after `git stash`-ing the 4 fixed validator/lib files | Phase 4 | fail (exit 1), as expected | Confirmed fixtures genuinely exercise the pre-fix bugs: `check-manifest-coverage` flagged spurious `R6`/`R7`; `check-phase-map` flagged both `RI1`/`RI2` as orphans. `git stash pop` restored the fixes |
| `node test/run-conformance-tests.mjs` | Phase 4, RI2 | pass | 11/11 (9 pre-existing + 2 new), zero regression |
| `node test/run-violation-tests.mjs` | Phase 4, RI1 | pass | 20/20 still detected, zero regression |
| `npm run build` | Phase 5, RI3 | pass | Dist bundles + schemas regenerated clean |
| `npm run validate` (1st run, Active Phase set to 5) | Phase 5, RI1 | fail (`check-scope-fence`) | Plan's Phase 4 Touches still had the placeholder `lifecycle-violations`/`run-violation-tests.mjs` path, not the actual `conformance`/`run-conformance-tests.mjs` path chosen during Build |
| `npm run validate` (2nd run, after correcting Plan Phase 4 Touches) | Phase 5, RI1 | pass (exit 0) | Full dev-workspace artifact tree, zero errors |
| `npm run violations:test` | Phase 5, RI1 | pass | 20/20 still detected |
| `node test/run-conformance-tests.mjs` (final re-run) | Phase 5, RI2 | pass | 11/11 |
| `git diff package.json` | Phase 5, RI3 | empty | No new runtime dependency introduced |
| Inline 8-case comparison: old trailing-lookahead regex vs. lookbehind-only regex on `WP-R7-T7.2`, `WP-R2`, `WP-R4`, `RI5-a`, `RI5-b`, bare `R1`, `(RI2)`, `(RI5)` | Phase 6, R2 | pass | Lookbehind-only excludes all 3 real compound-token cases and now also credits both sub-label cases; all previously-correct cases unchanged |
| `node check-coverage-ledger.mjs --dir test/fixtures/conformance/coverage-ledger-sublabel` (fixed regex) | Phase 6, R2 | fail (exit 1), as expected | Flags only `R7` (compound-token-only mention correctly rejected); `RI5` correctly credited via `RI5-a` — no error for it |
| Same command with `check-coverage-ledger.mjs` reverted via `git stash` (reverts to original pre-Phase-3 bug, nothing committed yet) | Phase 6, R2 | pass (exit 0), for the wrong reason | Confirms fixture is regex-sensitive: original bug over-credits `R7` from the compound token too, masking the problem it's supposed to catch |
| `node test/run-conformance-tests.mjs` (final, Phase 6) | Phase 6, RI2 | pass | 12/12 (9 pre-existing + 3 from this chain), zero regression |
| `npm run build` (Phase 6) | Phase 6, RI1 | pass | Clean |
| `npm run validate` (Phase 6) | Phase 6, RI1 | pass, exit 0 | Full dev-workspace artifact tree, zero errors |
| `npm run violations:test` (Phase 6) | Phase 6, RI1 | pass | 20/20 still detected |
| `git diff package.json` (Phase 6) | Phase 6, RI1 | empty | No new runtime dependency |
| Read back `.github/workflows/ci.yml` | Phase 6, RI1 | correct | `Run conformance tests` step added after `Run violation tests`, valid YAML |

## Dispatch Log

none

## Architecture Notes

- role: Senior Engineer
- decision (Phase 1): widened `parseIdList()`'s filter to allow an optional hyphenated
  suffix rather than adding a separate carve-out — keeps the function's contract simple
  ("an ID, optionally sub-labeled") instead of two different acceptance rules.
- constraint (Phase 1): the suffix pattern (`[a-zA-Z0-9]+`) is intentionally generic, not
  restricted to single lowercase letters — `RI5-a` is the only real precedent, but nothing
  in the schema restricts sub-labels to that exact shape, so the filter shouldn't either.
- downstream: Phase 2/3 should each independently re-run their target validator against the
  full existing artifact tree before considering the phase done — not just new fixtures —
  per the same discipline that caught Phase 1's regression.
- decision (Phase 2): kept `isPureIdTag()` local to `check-manifest-coverage.mjs` rather than
  exporting it to `lib.mjs` alongside `parseIdList()` — its semantics (reject any
  non-ID content in the parenthetical) are specific to "is this whole parenthetical an ID
  tag," a different question than `parseIdList()`'s "extract the IDs from this known list,"
  and Phase 3 hasn't yet confirmed whether `check-coverage-ledger.mjs` needs the same
  pattern — premature to share before a second real caller exists.
- downstream (Phase 2): Phase 3 should check whether Waivers content also uses the bare
  `(ID)` convention before assuming its narrower compound-token-only fix is sufficient —
  this phase found that convention is more widespread than the brief/plan anticipated.
- decision (Phase 3): validated the Plan's narrower design against real evidence *before*
  implementing (grep first), rather than implementing then discovering gaps via full-tree
  regression like Phases 1-2 did — paid off: the fix worked correctly on the first attempt
  because the evidence-gathering happened up front this time.
- decision (Phase 6): dropped the trailing-hyphen lookahead entirely rather than trying to
  special-case hyphenated sub-labels within it (e.g. `(?!-[a-zA-Z0-9]+-)` to distinguish a
  short sub-label suffix from a longer compound chain) — the inline 8-case comparison showed
  the leading-hyphen lookbehind alone already fully separates the two cases with no added
  complexity, so the simpler fix was also the correct one.
- downstream (Phase 6): Phase 3's original P3 residual-risk note (a hyphenated sub-label
  false negative, not exercised by any real content at the time) is now resolved — this
  finding from Review was the same gap Phase 3 had already flagged as accepted, just made
  concrete once Review's independent pass named it explicitly rather than leaving it purely
  theoretical.
- constraint (Phase 3): confirmed `check-coverage-ledger.mjs` should NOT be switched to
  `check-manifest-coverage.mjs`'s structured-tag approach — real Waivers content doesn't
  reliably use `— IDs:` tags or ID-only table cells (its first column is prose), so that
  approach would have silently reduced coverage-checking to near-zero for this file.
- decision (Phase 4): chose `test/fixtures/conformance/` + `test/run-conformance-tests.mjs`
  over `test/fixtures/lifecycle-violations/` + `run-violation-tests.mjs` — the latter is
  strictly a must-fail harness with no mechanism to assert "this correctly passes," and the
  former already has the exact paired positive/negative pattern needed. Resolves the Plan's
  explicitly-deferred decision.
- decision (Phase 4): verified fixture validity by intentionally reverting to pre-fix code
  (`git stash`) and confirming both new fixtures fail there — a fixture that only ever passes
  proves nothing about the fix; one shown to fail on the old code and pass on the new code
  proves the fix.

## Blockers

none (Phase 1's regression was found and fixed within the same phase, not carried forward as
a blocker)

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Phase 1 - Shared `parseIdList()` + `check-phase-map.mjs` fix | complete | 2026-07-18 | Exit gate met after fixing a real regression (RI5-a/-b/-c sub-labels) found by running against the full existing tree, not just new cases |
| Phase 2 - `check-manifest-coverage.mjs` structured-tag scanning | complete | 2026-07-18 | Exit gate met after fixing 2 real regressions (multi-ID table cells; bare `(ID)` convention, confirmed 31 real instances) found by running against the full existing tree |
| Phase 3 - `check-coverage-ledger.mjs` narrower fix | complete | 2026-07-18 | Exit gate met on first attempt — grepped real Waivers content for both patterns before implementing, confirmed the Plan's narrower design was already correct |
| Phase 4 - New fixtures | complete | 2026-07-18 | Both fixtures built, verified non-vacuous via stash/revert, wired into `test/run-conformance-tests.mjs`; 11/11 conformance + 20/20 violation checks pass |
| Phase 5 - Full verification | complete | 2026-07-18 | Found and fixed a real scope-fence gap (Plan's Phase 4 Touches still had the pre-Build-decision placeholder path); clean `npm run build/validate/violations:test`/conformance re-run after the fix; `git diff package.json` empty |
| Phase 6 - Review fixes | complete | 2026-07-18 | All 4 Review findings (1 P2, 3 P3) fixed with evidence: CI now runs `conformance:test`; Plan's stale cell corrected; duplicated regex cross-referenced; `check-coverage-ledger.mjs`'s sub-label false negative fixed and proven by a new fixture. 12/12 conformance, 20/20 violations, clean validate, empty package.json diff |
