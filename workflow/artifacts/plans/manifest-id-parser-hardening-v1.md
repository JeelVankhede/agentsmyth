---
slug: manifest-id-parser-hardening
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-07-18
updated: 2026-07-18
manifest_ids: [R1, R2, R3, RI1, RI2, RI3]
upstream:
  - workflow/artifacts/briefs/manifest-id-parser-hardening-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: approved
---

# Manifest-ID Parser Hardening - Plan

## Summary

Fix 3 validators' manifest-ID extraction so realistic prose doesn't produce false
coverage-mismatch errors. Reading the actual source during this Plan (not just the brief's
prior description) revealed the 3 files need **two different fix shapes**, not one uniform
approach: `check-phase-map.mjs` and `check-manifest-coverage.mjs` both parse *structured,
schema-defined* ID positions (a Manifest IDs line; a `— IDs:` tag) and can share one new
`parseIdList()` helper in `lib.mjs`. `check-coverage-ledger.mjs`'s `waiverIds()` scans
*free-text* Waivers table content that has no reliable structured ID position (confirmed by
reading a real Waivers table — the first column is prose like "scope-fence (Plan Touches
list, Phase 3)", not a bare ID) — it gets a narrower, file-specific regex fix instead. This
revises the brief's Architecture Notes assumption ("3 independent fixes, no shared utility")
now that real investigation shows 2 of the 3 genuinely share one utility worth extracting.

## Inputs

- Brief: `workflow/artifacts/briefs/manifest-id-parser-hardening-v1.md`
  (`orchestration.status: ready-for-next-phase`, approved).
- Manifest IDs: R1, R2, R3, RI1, RI2, RI3.
- Full source read this Plan: `src/workflow/validators/check-manifest-coverage.mjs`,
  `check-coverage-ledger.mjs`, `check-phase-map.mjs` (96, 79, 89 lines respectively).
- Real Waivers table sample read (`workflow/artifacts/tasks/power-skills-wave2-v1.md`) to
  confirm its actual authoring convention before assuming a fix shape.

## Requirement Coverage

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R1 | Phase 2 | `check-manifest-coverage.mjs` switched to structured-tag scanning |
| R2 | Phase 3 | `check-coverage-ledger.mjs`'s `waiverIds()` — narrower, file-specific regex fix |
| R3 | Phase 1 | `check-phase-map.mjs` uses the new shared `parseIdList()` helper |
| RI1 | Phase 5 | Full existing-artifact regression check |
| RI2 | Phase 4 | New fixtures wired into `npm run conformance:test` |
| RI3 | Phase 5 | `npm run build/validate/violations:test`, no new dependency |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `src/workflow/validators/lib.mjs` | runtime | R3, R1 | Add `export function parseIdList(raw)` — strips parenthetical content before comma-splitting, then anchors each segment against `^R(I)?[0-9]+$` |
| `src/workflow/validators/check-phase-map.mjs` | runtime | R3 | Replace `idsMatch[1].split(',').map(s => s.trim()).filter(Boolean)` with `parseIdList(idsMatch[1])` |
| `src/workflow/validators/check-manifest-coverage.mjs` | runtime | R1 | Replace `taskDerivedIds()`'s `/\b(R(?:I)?[0-9]+)\b/g` free-prose scan with: (a) a `[—-]\s*IDs?:\s*([^\n]+)` tag scan feeding `parseIdList()`, (b) a table-row scan (`^\|\s*(R(?:I)?[0-9]+)\s*\|`) for Verification Items rows |
| `src/workflow/validators/check-coverage-ledger.mjs` | runtime | R2 | `waiverIds()`'s regex gets a negative lookbehind/lookahead for a preceding/following hyphen: `/(?<!-)\b(R(?:I)?[0-9]+)\b(?!-)/g` — excludes the confirmed compound-token class (`WP-R7-T7.2`), keeps free-word matching since real Waivers content is prose, not tagged |
| `test/fixtures/lifecycle-violations/` | tests | RI2 | 2 new fixture dirs (see Phase 4) |
| `test/run-violation-tests.mjs` | tests | RI2 | Register both new fixtures |

## Source-of-Truth Strategy

No external source-of-truth involved. Self-contained fix within
`src/workflow/validators/` and `test/`.

## Approach

5 phases in dependency order: the shared helper first (Phase 1, since Phase 2 depends on it),
then the two validators that don't share it (Phases 2, 3 — independently reviewable, no
ordering dependency between them), then fixtures proving all 3 fixes (Phase 4, needs the code
to exist first), then full-suite verification (Phase 5, needs everything else done).

## Phases

### Phase 1 - Shared `parseIdList()` helper + `check-phase-map.mjs` fix

- **Manifest IDs:** R3
- Touches: `src/workflow/validators/lib.mjs`, `src/workflow/validators/check-phase-map.mjs`
- Why first: Phase 2 depends on this helper existing.
- Work:
  - Add to `lib.mjs`: `export function parseIdList(raw) { return raw.replace(/\([^)]*\)/g, '').split(',').map(s => s.trim()).filter(s => /^R(I)?[0-9]+$/.test(s)); }` — strips parenthetical content (removing any IDs mentioned *inside* a qualifier, e.g. the `R2, R3, R4, R7` inside `RI1 (infra supporting R2, R3, R4, R7 verification)`) before splitting on commas, then keeps only segments that are *exactly* an ID (rejecting leftover fragments).
  - Import `parseIdList` in `check-phase-map.mjs`; replace the inline
    `idsMatch[1].split(',').map((s) => s.trim()).filter(Boolean)` with `parseIdList(idsMatch[1])`.
- **Exit gate:** `RI2 (partial)` parsed via `parseIdList()` returns `['RI2']`. `RI1 (infra
  supporting R2, R3, R4, R7 verification)` returns `['RI1']` — not `R2`/`R3`/`R4`/`R7`. A
  plan fixture using either form no longer produces a false orphan/coverage error from
  `check-phase-map.mjs`.

### Phase 2 - `check-manifest-coverage.mjs`: structured-tag scanning

- **Manifest IDs:** R1
- Touches: `src/workflow/validators/check-manifest-coverage.mjs`
- Why after Phase 1: reuses `parseIdList()`.
- Work:
  - Replace `taskDerivedIds(section)`'s body: instead of scanning the whole section for any
    `\bR\d+\b`-shaped substring, scan for the two structured positions Changed
    Files/Verification Items actually use: (a) a `— ID:`/`— IDs:` trailing tag per
    `lifecycle-build`'s own output-schema.md convention — regex `/[—-]\s*IDs?:\s*([^\n]+)/g`,
    feeding each match's captured value through `parseIdList()`; (b) a markdown table row
    whose first cell is exactly an ID — regex `/^\|\s*(R(?:I)?[0-9]+)\s*\|/` per line.
  - Do not remove the "Verification-only IDs" comment/logic (lines 66-73) — the fix only
    changes *how* IDs are extracted from each section, not which sections are scanned.
- **Exit gate:** a fixture whose Changed Files section contains prose mentioning
  `WP-R7-T7.2` and a sentence "...so R6 has..." produces no spurious `R7`/`R6` extraction —
  neither string matches either structured pattern. A fixture with a real `— IDs: R7, RI5`
  tag still correctly registers `R7` and `RI5`.

### Phase 3 - `check-coverage-ledger.mjs`: narrower compound-token exclusion

- **Manifest IDs:** R2
- Touches: `src/workflow/validators/check-coverage-ledger.mjs`
- Why not sharing Phase 1/2's approach: confirmed by reading a real Waivers table
  (`power-skills-wave2-v1.md`) that its "Waived Gate/Requirement" column is free prose
  ("scope-fence (Plan Touches list, Phase 3)"), not a bare ID or a structured tag — switching
  this file to structured-tag-only scanning would make it stop finding IDs in typical real
  waivers entirely, silently disabling the check. A narrower fix is the correct scope here.
- Work: change `waiverIds()`'s regex from `/\b(R(?:I)?[0-9]+)\b/g` to
  `/(?<!-)\b(R(?:I)?[0-9]+)\b(?!-)/g` — excludes a match immediately preceded or followed by
  a hyphen (the confirmed `WP-R7-T7.2` compound-token class), while still matching a genuine
  standalone word in prose.
- **Exit gate:** a Waivers section containing `WP-R7-T7.2` registers no `R7`. A Waivers
  section containing a legitimate bare mention (e.g. "waives R1's coverage requirement")
  still registers `R1` — confirms the narrower fix doesn't over-correct into the same kind of
  silent-disable risk the broader approach would have caused here.

### Phase 4 - New fixtures

- **Manifest IDs:** RI2
- Touches: `test/fixtures/conformance/manifest-id-false-positive/`,
  `test/fixtures/conformance/phase-map-parenthetical/`, `test/run-conformance-tests.mjs`
- Why after Phases 1-3: needs the fixed code to test against.
- **Resolved during Build**: `test/run-violation-tests.mjs` is confirmed (by reading it in
  full) to be strictly a must-fail harness (`detected = result.status !== 0` counted as PASS)
  with no mechanism to assert "correct input passes clean" — so it is not the right home.
  `test/run-conformance-tests.mjs` already has the exact needed pattern (paired
  positive/negative `check(id, desc, cond)` assertions, e.g. `r12-all`/`r12-bad`,
  `r10-detect`/`r10-table`), so both new fixtures were placed there instead, following its
  existing directory-per-scenario convention (`waivers-dir/verify/probe-v1.md`,
  `table-claim/verify/probe-v1.md`) rather than the single-letter-then-number convention used
  by `test/fixtures/lifecycle-violations/`.
- Work:
  - Fixture `manifest-id-false-positive/`: a task artifact whose Changed Files section
    contains `WP-R7-T7.2`-style prose and a review artifact with correct `manifest_ids` —
    asserts `check-manifest-coverage.mjs` produces **no** error (a positive/regression
    fixture, not a violation fixture — proves the false positive is gone).
  - Fixture `phase-map-parenthetical/`: a plan artifact using `RI2 (partial)` and `RI1 (infra
    supporting R2, R3, R4, R7 verification)` on real Manifest IDs lines — asserts
    `check-phase-map.mjs` produces no orphan/coverage error for `RI1`/`RI2` and does not
    spuriously credit `R2`/`R3`/`R4`/`R7`.
  - Both wired into `test/run-conformance-tests.mjs` as `mid-false-positive` and
    `phase-map-parenthetical` checks; validity confirmed non-vacuous by reverting the fixed
    code (`git stash`) and observing both fixtures genuinely fail on the pre-fix validators.
- **Exit gate:** both new fixtures exist; the test script asserting them passes; all 20
  existing violation fixtures still correctly fail (no regression).

### Phase 5 - Full verification

- **Manifest IDs:** RI1, RI3
- Touches: none (verification only)
- Work: `npm run build && npm run validate && npm run violations:test` (and whichever suite
  Phase 4 wired the 2 new fixtures into) against the full existing `workflow/artifacts/` tree
  — confirms none of the 9+ prior chains' artifacts newly fail under the hardened parsers.
- **Exit gate:** all commands pass with current-turn output cited; `git diff package.json`
  shows no `dependencies` change.

### Phase 6 - Review fixes

- **Manifest IDs:** R1, R2, RI1, RI2
- Touches: `.github/workflows/ci.yml`, `src/workflow/validators/lib.mjs`,
  `src/workflow/validators/check-manifest-coverage.mjs`,
  `src/workflow/validators/check-coverage-ledger.mjs`,
  `workflow/artifacts/plans/manifest-id-parser-hardening-v1.md`,
  `test/fixtures/conformance/coverage-ledger-sublabel/`, `test/run-conformance-tests.mjs`
- Why after Phase 5: Review (`workflow/artifacts/reviews/manifest-id-parser-hardening-v1.md`)
  found 1 P2 and 3 P3 findings against the Phase 1-5 output; user said "Fix all" rather than
  waiving or deferring any of them.
- Work:
  - P2: add a `Run conformance tests` step (`npm run conformance:test`) to `ci.yml`'s
    `validate` job — the entire conformance suite (9 pre-existing checks + this chain's 2 new
    ones) was CI-unreachable, only runnable locally.
  - P3: correct the Plan's own Requirement Coverage table (this file) — the RI2 row's stale
    reference to `npm run violations:test` (superseded by Phase 4's actual resolution to
    `npm run conformance:test`).
  - P3: add a short cross-reference comment between `lib.mjs`'s `parseIdList()` and
    `check-manifest-coverage.mjs`'s `isPureIdTag()` — both independently define the same
    ID-shape regex; no shared export (per Phase 2's Architecture Notes), but the duplication
    should at least be named so a future ID-shape change doesn't drift between the two.
  - P3: widen `check-coverage-ledger.mjs`'s `waiverIds()` exclusion so a hyphenated sub-label
    reference (e.g. `RI5-a`) still credits its base ID (`RI5`), while still excluding a
    `WP-R#`-style compound token — proven by a new fixture, not just asserted.
- **Exit gate:** all 4 Review findings resolved with evidence; `npm run
  build/validate/violations:test/conformance:test` all pass; `git diff package.json` empty;
  Review artifact updated to reflect the fixed state.

## Dependency Order

Phase 1 → Phase 2 (needs `parseIdList()`) → Phase 3 (independent of 1/2, ordered after for
reviewer continuity — no real dependency) → Phase 4 (needs all 3 fixes to exist) → Phase 5
(needs everything else done) → Phase 6 (needs Review's findings to exist).

## Branch Strategy

- Base: `main`.
- Working branch: `feat/manifest-id-parser-hardening` (already created off `origin/main`).
- Commits: one per phase preferred, not mandatory.
- No commits to `main` directly (`repo-profile.yaml`'s
  `branch_policy.require_non_default_branch_for_changes: true`).
- PR: not required by default (`release.yaml`); create only if requested.

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|
| A fix too strict introduces new false negatives (a genuine ID no longer recognized) | medium | medium | Phase 4's fixtures explicitly prove both the false-positive fix *and* that a real, correctly-tagged ID still gets recognized — not just the negative case | Build | R1, R2, R3 |
| `check-manifest-coverage.mjs`/`check-coverage-ledger.mjs` are used across every existing chain's artifacts — a regression surfaces broadly | medium | high | Phase 5 runs full `npm run validate` against all existing artifacts, not just new fixtures | Test | RI1 |
| `check-coverage-ledger.mjs`'s narrower fix leaves a residual gap (a genuine prose-mention false positive in a Waivers reason column, not exercised by any current real content) | low | low | Explicitly documented as an accepted, evidence-based scope decision (see Phase 3), not silently missed — no current real Waivers content exercises this pattern | — (accepted) | R2 |

No risk here lacks a mitigation; none require a waiver.

## Verification Plan

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1 | Fixture `v` (or wherever Phase 4 places it): no false positive on `WP-R7-T7.2`/prose; correct positive on a real `— IDs:` tag | Test | |
| R2 | Fixture proving `WP-R7-T7.2` excluded, genuine prose mention still included | Test | |
| R3 | Fixture `w`: `RI2 (partial)` and the `RI1 (infra supporting...)` case both parse correctly | Test | |
| RI1 | `npm run validate` against full existing `workflow/artifacts/` tree | Test | |
| RI2 | Both new fixtures wired into the correct test script, confirmed passing | Test | |
| RI3 | `git diff package.json`; `npm run build/validate/violations:test` current-turn output | Ship | |

## Architecture Notes

- role: Principal Engineer
- decision: Revised the brief's "3 independent fixes, no shared utility" stance after reading
  real source — `check-phase-map.mjs` and `check-manifest-coverage.mjs` both parse
  structured, schema-defined ID positions and genuinely share one small utility worth
  extracting (`parseIdList()` in `lib.mjs`). `check-coverage-ledger.mjs` does not share it,
  because its actual content (confirmed via a real sample) is free prose, not a structured
  tag — forcing it into the same fix shape would have silently disabled the check for typical
  real waivers.
- constraint: `parseIdList()` must not be exported with a name/shape that implies it handles
  free-prose scanning too — it is specifically for parsing a known, already-isolated
  comma-separated ID list (a Manifest IDs line's value, or a `— IDs:` tag's value), not a
  general-purpose ID extractor.
- tradeoff: Considered giving `check-coverage-ledger.mjs`'s Waivers table a required
  structured ID column (a schema change) instead of a narrower regex fix — rejected as
  out of scope: this brief fixes parsers to tolerate existing realistic content, not the
  other way around (same principle the brief's own Non-Goals already established).
- downstream: Build should re-confirm during Phase 4 which existing test script
  (`run-violation-tests.mjs` vs `run-conformance-tests.mjs`) is the right home for
  "must-pass" positive fixtures — Plan defers this exact call to Build's own re-read of both
  scripts' actual current scope, per the Phase 4 work note.

## Open Questions

None.

## Exit Gate

- [x] Every active R and RI mapped to exactly one owning phase (`requirement-phase-mapper`
      check: R1→Phase 2, R2→Phase 3, R3→Phase 1, RI1→Phase 5, RI2→Phase 4, RI3→Phase 5).
- [x] Every phase has a binary, falsifiable exit gate.
- [x] Dependency order is explicit.
- [x] Every risk has a mitigation; none need a waiver.
- [x] Verification plan covers every R and RI.
- [x] Source-of-truth and release handling are explicit (not applicable; no release gate
      configured).
- [x] Branch strategy is explicit; does not target `main`.
- [x] No brief assumptions to verify (brief's Assumptions section was empty).
- [x] User approved the plan — "continue with build," 2026-07-18, after this plan's specific
      design (shared-helper decision, phase breakdown, fixture placement) was presented.
