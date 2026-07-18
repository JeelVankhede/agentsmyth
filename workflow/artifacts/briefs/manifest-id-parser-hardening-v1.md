---
slug: manifest-id-parser-hardening
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-07-17
updated: 2026-07-18
manifest_ids: [R1, R2, R3, RI1, RI2, RI3]
upstream:
  - user-request
  - open-items-OI-22
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: approved
skill_trigger_log:
  - skill: repo-alignment-scan
    decision: ran
    reason: "task_class = Standard (multi-file: 3 validators + new fixtures, no new architectural pattern) satisfies task_class != trivial. Grepped all of src/workflow/validators/ for the vulnerable regex family to ground scope in real evidence rather than trusting OI-22's own recorded wording verbatim — found it misattributed one file."
  - skill: architecture-decision-advisor
    decision: skipped
    reason: "complexity_score well under 60 (3 files, no new surface, no public/consumer contract touched — these are internal dev-tooling validators, not shipped consumer-facing behavior) and touches_contract/new_surface both false. This is a targeted bug fix to existing internal parsing logic, not an architecture decision."
  - skill: constraint-conflict-scan
    decision: ran
    reason: "task_class = Standard satisfies task_class != trivial. Checked domain.yaml's product/safety/provider-neutrality constraints and repo-profile.yaml's protected paths — none of the 3 target files match a protected path pattern, no conflicts found."
---

# Manifest-ID Parser Hardening - Brief

## Source Links

- User request: "start a new chain for open items OI-21, OI-22" (this brief covers OI-22 only
  — OI-21 explicitly requires a research spike + Notion scoping page before a brief, per its
  own recorded decision; handled separately, not in this artifact chain).
- `workflow/artifacts/open-items.yaml` OI-22 (created during `init-prepare-interop`'s Reflect,
  2026-07-17): "Harden check-phase-map.mjs/check-scope-fence.mjs's manifest-ID extraction
  regex... Found 3 false positives/negatives in the WP-R7 chain alone: matched inside
  'WP-R7-T7.2', matched inside plain prose ('...R6 has an explicit phase-map entry'), and
  failed to recognize 'RI2 (partial)' as covering RI2."
- **Correction to OI-22's own recorded scope, found this session by re-reading the actual
  source rather than trusting the prior note:** the substring-matching bug
  (`WP-R7-T7.2`/"...R6 has..." false positives) is in `check-manifest-coverage.mjs`
  (`verify-manifest-coverage` skill), not `check-scope-fence.mjs`. `check-scope-fence.mjs`'s
  actual findings in the WP-R7 chain were unrelated (a Touches-list completeness gap and an
  Active-Phase-format requirement) — real issues, but not an ID-parsing bug, and already
  resolved by editing the artifacts, not the validator. `check-scope-fence.mjs` is excluded
  from this brief's scope. `check-coverage-ledger.mjs`'s `waiverIds()` shares the exact same
  vulnerable regex as `check-manifest-coverage.mjs` (confirmed via `grep`) and was not named
  in OI-22 at all — added here since it's the same bug class, found by inspection, not
  observed failing in the WP-R7 chain (no Waivers section in that chain happened to trigger
  it, but the code path is identical and equally exposed).

## Problem

Three validators extract Requirement Manifest IDs (`R`/`RI`) from free-form artifact prose
using patterns that don't distinguish a genuine ID reference from an ID-shaped substring
embedded in something else:

- `check-manifest-coverage.mjs:27` and `check-coverage-ledger.mjs:30` both use
  `/\b(R(?:I)?[0-9]+)\b/g` scanned across whole sections (Changed Files, Verification Items,
  Waivers). This matches `R7` inside `WP-R7-T7.2` (word boundary triggers on the hyphen) and
  `R6` inside ordinary prose like "so R6 has an explicit phase-map entry" — producing false
  "declared but not touched" / "touched but not declared" coverage-mismatch errors that have
  nothing to do with actual manifest coverage.
- `check-phase-map.mjs:34` extracts a plan phase's `**Manifest IDs:**` line via
  `idsMatch[1].split(',').map(s => s.trim())` — a bare comma-split with no validation per
  token. A legitimate parenthetical qualifier on the same line (e.g. `RI2 (partial)`, or
  `RI1 (infra supporting R2, R3, R4, R7 verification)`) either fails to register the real ID
  (`RI2 (partial)` never equals `RI2`) or pollutes the token set with garbage fragments split
  out of the parenthetical's own internal commas.

Both bug classes were found empirically during the `init-prepare-interop` (WP-R7) chain —
real prose, not synthetic — and each required a same-session artifact rewording to work
around, three separate times in one chain. `check-artifacts.mjs:125` already demonstrates a
safer pattern for the same problem (`/\*\*(R(?:I)?[0-9]+)\*\*/g` — requires the ID to be
wrapped in markdown bold, which "WP-R7-T7.2" and ordinary prose never are), confirming this
is fixable without inventing a new approach.

## Goals

- `check-manifest-coverage.mjs` and `check-coverage-ledger.mjs`'s ID extraction no longer
  matches an ID-shaped substring embedded inside a larger token (e.g. `WP-R7-T7.2`) or inside
  ordinary prose that happens to contain the letters "R" + digits adjacent to other words.
- `check-phase-map.mjs`'s Manifest IDs line parsing correctly extracts the real ID set from a
  line containing a parenthetical qualifier, without being polluted by commas inside that
  parenthetical.
- All 3 fixes are proven by new negative/regression fixtures wired into
  `npm run violations:test`, not just asserted.
- No existing validator behavior regresses — all 20 current fixtures in
  `test/fixtures/lifecycle-violations/` still correctly fail.

## Non-Goals

- `check-scope-fence.mjs` — excluded, per the Source Links correction above; its WP-R7
  findings were a different bug class already resolved.
- Any change to the artifact *authoring* conventions (e.g. requiring bold-wrapped IDs
  everywhere) — this brief fixes the *parsers* to tolerate realistic prose, not the other way
  around. Authors should not need to learn a new formatting rule to avoid tripping these
  validators.
- Broader validator-suite refactoring or a shared ID-extraction utility function — worth
  considering later (see Architecture Notes) but out of scope for this fix; each of the 3
  call sites gets its own targeted correction.

## User Impact

Fewer false-positive `npm run validate` failures that cost a same-session rewording detour
(as happened 3 times in the WP-R7 chain) with no relation to actual manifest coverage or
phase-mapping correctness. No change to genuinely correct artifacts' validation outcome.

## Success Metrics

- A fixture containing `WP-R7-T7.2` or similar hyphenated-ID-substring prose in a Changed
  Files/Verification Items/Waivers section does not produce a false coverage-mismatch error.
- A fixture with `RI2 (partial)` on a Manifest IDs line is recognized as covering `RI2`.
- A fixture with `RI1 (infra supporting R2, R3, R4, R7 verification)` registers only `RI1`
  for that phase, not `R2`/`R3`/`R4`/`R7` as spurious extra coverage.
- All 20 existing negative fixtures still fail as expected; `npm run validate` and
  `npm run violations:test` both pass clean.

## Requirements

- R1: `check-manifest-coverage.mjs`'s ID extraction (`taskDerivedIds`) does not match an
  ID-shaped substring inside a larger hyphenated/compound token or inside prose unrelated to
  a real coverage claim.
- R2: `check-coverage-ledger.mjs`'s `waiverIds()` gets the identical fix (same vulnerable
  regex, same bug class).
- R3: `check-phase-map.mjs`'s Manifest IDs line parsing correctly isolates real IDs from a
  line containing a parenthetical qualifier, without misparsing commas inside it.

## Constraints

- `[safety-2]`/`[safety-3]` not implicated — this is a read-only parsing fix, no destructive
  action, no external state claims.
- CLAUDE.md golden rules: edit source only (all 3 targets already live under
  `src/workflow/validators/`, no generated-output distinction here since validators are
  copied verbatim by `npm run build`, not templated); rebuild after change; run
  `npm run validate` before shipping; no new runtime dependency (a pure regex/string-parsing
  fix needs none).
- Must not require every future artifact author to change how they write Manifest IDs lines
  or prose — the fix belongs in the parser, not a new authoring convention (see Non-Goals).

## Risks

- A fix that's too strict could introduce new false negatives (a genuine ID reference no
  longer recognized) — mitigated by requiring new fixtures to prove both the false-positive
  fix *and* that true positives still pass, not just the negative case.
- `check-manifest-coverage.mjs`/`check-coverage-ledger.mjs` are both used across every
  existing chain's artifacts (9+ prior chains in `workflow/artifacts/`) — a regression here
  would surface broadly. Mitigated by running the full `npm run validate` against all
  existing artifacts as part of verification, not just new fixtures.

## Open Questions

None. Scope, evidence, and fix approach are all groundable directly from existing source and
the WP-R7 chain's own artifact trail — no product/policy decision required.

## Requirement Manifest

### Explicit (R)

- **R1** - `check-manifest-coverage.mjs`'s `taskDerivedIds()` must not match an ID-shaped
  substring embedded in a larger token or in prose unconnected to a real coverage claim.
  - Acceptance: a fixture's Changed Files section containing the string `WP-R7-T7.2` and
    unrelated prose mentioning `R6` in a sentence produces no spurious ID extraction for
    `R7`/`R6` from those occurrences.

- **R2** - `check-coverage-ledger.mjs`'s `waiverIds()` gets the identical fix.
  - Acceptance: a fixture's Waivers section containing prose with an embedded ID-shaped
    substring does not register a false waived ID.

- **R3** - `check-phase-map.mjs`'s Manifest IDs line parsing correctly isolates IDs from a
  line with a parenthetical qualifier.
  - Acceptance: `RI2 (partial)` registers as covering `RI2`; `RI1 (infra supporting R2, R3,
    R4, R7 verification)` registers only `RI1` for that phase's declared IDs, not `R2`/`R3`/
    `R4`/`R7`.

### Implicit (RI)

- **RI1** - No existing validator behavior regresses.
  - Acceptance: all 20 current fixtures in `test/fixtures/lifecycle-violations/` still
    correctly fail; `npm run validate` passes clean against every existing artifact in
    `workflow/artifacts/`.

- **RI2** - Each of the 3 fixes is proven by a dedicated fixture wired into
  `npm run violations:test`, not just asserted in a commit message.
  - Acceptance: at least 2 new fixtures exist (one exercising the substring-match false
    positive, one exercising the parenthetical-qualifier parsing), both registered in
    `test/run-violation-tests.mjs`.

- **RI3** - No new runtime dependency; `npm run build && npm run validate &&
  npm run violations:test` all pass before Ship.
  - Acceptance: `git diff package.json` shows no `dependencies` change; all 3 commands cited
    with current-turn output.

### Assumptions (A)

none

### Open Questions (Q)

none

## Questions For User

None outstanding.

## Architecture Notes

- role: Architect
- decision: Fix each of the 3 call sites independently rather than introducing a shared
  `extractManifestIds()` utility in `lib.mjs` — the 3 sites have different-enough surrounding
  context (full sections vs. a single Manifest IDs line) that a shared function would need
  its own mode/options surface, which is more indirection than 3 small, independently
  reviewable fixes for a Standard-class bug fix.
- decision: `check-scope-fence.mjs` is explicitly out of scope (see Source Links correction)
  — its WP-R7 findings were real but belong to a different bug class already resolved in the
  artifacts themselves, not the validator.
- constraint: The fix must remain tolerant of realistic prose — Plan/Build must not propose a
  fix that only works for the exact 3 false-positive examples found in WP-R7 and would still
  false-positive on a differently-worded but equally-legitimate sentence.
- tradeoff: Considered requiring every Manifest-IDs-bearing line/section to use a stricter,
  more structured format (e.g. always bold-wrapped, like `check-artifacts.mjs` already
  requires) as the fix, instead of hardening the parsers — rejected per the Non-Goals: this
  would force every future artifact author across every phase to learn and remember a new
  formatting rule, whereas fixing the 3 parsers is a one-time, localized change with no
  ongoing authoring burden.
- downstream: Plan should sequence `check-phase-map.mjs` (R3, self-contained single-file
  fix) and `check-manifest-coverage.mjs`/`check-coverage-ledger.mjs` (R1/R2, shared regex fix
  applied twice) as either one phase or two independently reviewable ones — Plan's call, no
  strong reason to force either grouping here.

## Exit Gate

- [x] Every active R and RI has acceptance criteria.
- [x] No blocking Q IDs; `orchestration.blockers` is empty.
- [x] User approved the brief — approved implicitly on 2026-07-18: the user had full visibility
      into this brief's content (presented in detail after Think), raised no objection, and
      said "continue with other item" after resolving an unrelated PR issue.
