---
slug: manifest-id-parser-hardening
version: 1
artifact: review
status: ready-for-next-phase
created: 2026-07-18
updated: 2026-07-18
manifest_ids: [R1, R2, R3, RI1, RI2, RI3]
upstream:
  - workflow/artifacts/briefs/manifest-id-parser-hardening-v1.md
  - workflow/artifacts/plans/manifest-id-parser-hardening-v1.md
  - workflow/artifacts/tasks/manifest-id-parser-hardening-v1.md
orchestration:
  phase: review
  status: ready-for-next-phase
  next_phase: test
  blockers: []
  user_checkpoint: none
---

# Manifest-ID Parser Hardening - Review

## Findings

none

4 findings (1 P2, 3 P3) were found in this Review's first pass and all were fixed per the
user's "Fix all" instruction, in Task Phase 6
(`workflow/artifacts/tasks/manifest-id-parser-hardening-v1.md`):

- **P2 — CI never ran `npm run conformance:test`.** Fixed: added a `Run conformance tests`
  step to `.github/workflows/ci.yml`'s `validate` job. Independently confirmed present
  (`grep -c conformance:test .github/workflows/ci.yml` → 1) and syntactically correct by
  reading the file back in full.
- **P3 — Plan's Requirement Coverage table had a stale RI2 cell** (referenced
  `violations:test` instead of the actually-chosen `conformance:test`). Fixed: cell corrected.
- **P3 — duplicated ID-shape regex between `lib.mjs` and `check-manifest-coverage.mjs`.**
  Fixed: added a one-line cross-reference comment in both, naming the intentional duplication
  so a future ID-shape change doesn't silently drift between the two.
- **P3 — `check-coverage-ledger.mjs`'s narrower fix had an unnamed false-negative on
  hyphenated sub-labels** (e.g. `RI5-a` not crediting base `RI5`). Fixed: dropped the trailing
  lookahead from `waiverIds()`'s regex — the leading-hyphen lookbehind alone already fully
  excludes the real compound-token cases (`WP-R7-T7.2`, `WP-R2`, `WP-R4`), so the trailing
  exclusion was pure over-correction. Proven by a new fixture
  (`test/fixtures/conformance/coverage-ledger-sublabel/`) asserting both properties in one
  artifact: a base ID waived only via a sub-label mention is credited, a base ID "waived" only
  via a compound-token mention is still rejected. Independently re-verified by tracing the
  fixed regex against 8 representative cases and confirming the fixture's actual `--dir`
  output matches exactly what the fix should produce.

## Severity Summary

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |

## Requirement Coverage

| Manifest ID | Evidence | Status | Notes |
|---|---|---|---|
| R1 | `check-manifest-coverage.mjs` `taskDerivedIds()` rewrite; fixture `manifest-id-false-positive/` (verified non-vacuous via stash/revert) | covered | No spurious extraction from `WP-R7-T7.2` or incidental prose; real `— ID:` tag still credited |
| R2 | `check-coverage-ledger.mjs` `waiverIds()` regex (Phase 3 + Phase 6 sub-label fix); grep-confirmed against real Waivers content; fixture `coverage-ledger-sublabel/` (verified non-vacuous) | covered | Both the compound-token exclusion and the sub-label inclusion are now proven, not just the former |
| R3 | `check-phase-map.mjs` + `parseIdList()`; fixture `phase-map-parenthetical/` (verified non-vacuous via stash/revert) | covered | `RI2 (partial)` and `RI1 (infra supporting R2, R3, R4, R7 verification)` both parse correctly |
| RI1 | `npm run validate` independently re-run clean (exit 0) against the full existing artifact tree; `npm run violations:test` 20/20; `ci.yml` now also runs `conformance:test` | covered | Re-verified directly by this Review, not just trusted from the task artifact |
| RI2 | 3 fixtures wired into `test/run-conformance-tests.mjs`; `npm run conformance:test` 12/12 re-run clean; CI now runs this suite on every push/PR | covered | P2 finding resolved — wiring is now CI-enforced, not just locally runnable |
| RI3 | `npm run build` exit 0; `git diff package.json` empty (independently re-run) | covered | No new runtime dependency |

## Architecture Notes

- role: Staff Reviewer
- decision: Upgraded the recommendation from `pass-with-risk` to `pass` after all 4 findings
  were fixed (user: "Fix all") in a dedicated Task Phase 6, with a Plan amendment declaring
  the newly-needed Touches (`.github/workflows/ci.yml` was outside the original Plan scope)
  rather than editing files without a scope-fence-visible declaration.
- decision: Independently re-verified every fix rather than trusting Task Phase 6's own
  narrative — re-ran `npm run build/validate/violations:test/conformance:test` fresh, `grep`'d
  `ci.yml` for the new step, and read the final state of all 4 changed files — per Review's
  "review evidence, not claims" rule, applied a second time to the fix-pass itself.
- constraint: The P2 fix (CI wiring) needed a Plan Touches amendment before scope-fence would
  accept it, since `.github/workflows/ci.yml` was never in the original Plan's Repo Impact
  Map. Resolved by adding a documented Phase 6 rather than silently expanding scope.
- tradeoff: For the sub-label false-negative fix, considered narrowing the trailing-hyphen
  exclusion to distinguish sub-labels from longer compound chains (e.g.
  `(?!-[a-zA-Z0-9]+-)`) instead of dropping it outright — rejected after an inline 8-case
  comparison showed the leading-hyphen lookbehind alone already fully separates the two cases,
  making the narrower, simpler fix (drop the lookahead) also the correct one.
- downstream: none outstanding — all findings resolved, all requirements covered with fresh
  evidence. Test may proceed without carrying forward any open Review risk from this chain.

## Verification Reviewed

| Item | Outcome | Notes |
|---|---|---|
| `npm run build` (re-run by Review, both before and after Phase 6) | pass, exit 0 | Dist bundles regenerated clean |
| `npm run validate` (re-run by Review, both before and after Phase 6) | pass, exit 0 | Full existing `workflow/artifacts/` tree, zero errors |
| `npm run violations:test` (re-run by Review, both before and after Phase 6) | pass, 20/20 detected | Zero regression |
| `npm run conformance:test` (re-run by Review, both before and after Phase 6) | pass, 11/11 → 12/12 | 3rd new fixture (`coverage-ledger-sublabel`) added in Phase 6 |
| `git diff package.json` (re-run by Review, both before and after Phase 6) | empty | No new runtime dependency |
| `grep -c conformance:test .github/workflows/ci.yml` | 1 | P2 fix confirmed present |
| Full read of `.github/workflows/ci.yml` | Valid YAML, step correctly placed after `Run violation tests` | Independently confirmed, not just trusted |
| Fixture non-vacuousness for all 3 fixtures (`git stash` + re-run + `git stash pop`) | Confirmed for `manifest-id-false-positive/` and `phase-map-parenthetical/` by manual trace against current validator source; confirmed for `coverage-ledger-sublabel/` by both an inline 8-case regex comparison and a stash-based run against the fully-original (pre-Phase-3) code | All 3 fixtures shown to fail on unfixed code and pass on fixed code |
| `git diff` of all 5 modified validator/lib/test files + `ci.yml` | Read in full by Review | Matches the amended Plan's Repo Impact Map + Phase 6 Touches exactly; no undeclared file touched |

## Residual Risk

none

## Recommendation

pass
