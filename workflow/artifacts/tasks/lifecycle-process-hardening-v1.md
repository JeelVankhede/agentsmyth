---
slug: lifecycle-process-hardening
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-07-18
updated: 2026-07-18
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, RI1, RI2, RI3, RI4]
upstream:
  - workflow/artifacts/briefs/lifecycle-process-hardening-v1.md
  - workflow/artifacts/plans/lifecycle-process-hardening-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# Lifecycle Process Hardening - Task

## Active Phase

- Phase: Phase 7 - Fix pre-existing jargon leak found during Phase 6
- Manifest IDs: R7
- Exit gate: `grep -inE "OI-[0-9]|WP-R[0-9]|manifest-id-parser-hardening"` against both files
  and the rebuilt `dist/workflow-bundle.md` finds zero matches; `npm run validate` still
  passes.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Range-shorthand structural check | complete (rescoped) | R1, RI4 |
| Phase 2 - CI script coverage | complete | R2 |
| Phase 3 - Ship Workflow additions | complete | R3, R4 |
| Phase 4 - No-self-approval rule | complete | R5 |
| Phase 5 - Build Workflow addition | complete | R6 |
| Phase 6 - Full verification | complete | RI1, RI2, RI3 |
| Phase 7 - Fix pre-existing jargon leak found during Phase 6 | complete | R7 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `feat/lifecycle-process-hardening` | clean except two untracked lifecycle artifacts (brief, plan) plus the already-committed OI-25 housekeeping fix | No unrelated changes to preserve |

## Scope

- In scope: `src/workflow/validators/check-id-range-shorthand.mjs` (new),
  `scripts/validate-template.mjs`, `test/fixtures/lifecycle-violations/v-*/`,
  `test/run-violation-tests.mjs`, `.github/workflows/ci.yml`,
  `src/workflow/skills/lifecycle-ship/SKILL.md`, `src/workflow/rules.md`,
  `src/workflow/skills/lifecycle-build/SKILL.md`.
- Out of scope: OI-11 and the other 8 excluded open items (see brief's Source Links).

## Changed Files

- `src/workflow/validators/check-coverage-range-shorthand.mjs` — new validator, scoped to
  Requirement/Manifest Coverage table Manifest ID cells only, after the rescope — IDs: R1
- `scripts/validate-template.mjs` — registered the new validator in `artifactCommands` — IDs: R1
- `test/fixtures/lifecycle-violations/v-id-range-shorthand/plans/id-range-shorthand-v1.md` —
  new fixture: a plan whose Requirement Coverage row uses `R1-R4` as its Manifest ID cell —
  IDs: R1
- `test/run-violation-tests.mjs` — registered fixture `v` — IDs: R1
- `workflow/artifacts/plans/lifecycle-process-hardening-v1.md` — Phase 1's Work/Exit gate
  rescoped from a repo-wide free-text scan to the Requirement/Manifest Coverage table position
  only, per the user's "Option 1" decision — IDs: R1
- `workflow/artifacts/briefs/lifecycle-process-hardening-v1.md` — R1's acceptance criteria
  updated to match the rescoped design — IDs: R1
- `.github/workflows/ci.yml` — added 4 steps (`setup-checks:test`, `setup-refs:test`,
  `root-resolution:test`, `init-prepare-interop:test`), mirroring the existing
  `violations:test`/`conformance:test` step style exactly — IDs: R2
- `src/workflow/skills/lifecycle-ship/SKILL.md` — new Workflow steps 4a (origin/main
  staleness check) and 6a (resolved-fix-vs-open-risk classification), generic wording —
  IDs: R3, R4
- `src/workflow/rules.md` — new `## Approval` section stating the no-self-approval rule,
  generic wording — IDs: R5
- `src/workflow/skills/lifecycle-build/SKILL.md` — new Workflow step 6b (boundary-comparison
  verification), mirroring the existing step 6a convention, generic wording — IDs: R6
- `src/workflow/validators/check-manifest-coverage.mjs` — reworded 2 comment lines that
  referenced an internal chain name, keeping the substantive reasoning intact — IDs: R7
- `src/workflow/validators/check-coverage-ledger.mjs` — reworded 2 comment lines that
  referenced an internal chain/work-package name, keeping the substantive reasoning intact —
  IDs: R7
- `workflow/artifacts/plans/lifecycle-process-hardening-v1.md`,
  `workflow/artifacts/briefs/lifecycle-process-hardening-v1.md` — added R7 (manifest_ids,
  Requirement Coverage, Repo Impact Map, Verification Plan, Phase 7, Exit Gate) per the user's
  "Fix it in this chain" instruction — IDs: R7

## Implementation Log

### Phase 1 - Range-shorthand structural check

- Before writing any validator code, grepped the real, current scope of the pattern the Plan
  described (`R[0-9]+[–-]R(I)?[0-9]+`) across the entire `workflow/artifacts/` tree, per this
  chain's own R6 requirement (verify a check's boundary with real evidence before
  implementing) and the Plan's own Risk Register warning about historical-prose false
  positives.
- **Finding: the false-positive risk is far larger than the Plan anticipated.** The grep found
  **46 real occurrences** across nearly every existing plan, brief, review, verify, task, and
  reflect artifact in this repo's history — not a handful of historical quotes. Representative
  examples: `power-skills-spine-v1.md`'s own frontmatter-adjacent "Active manifest IDs: R1–R7,
  RI1–RI7, A1–A2" line; `init-prepare-interop-v1.md`'s "R6 (T7.6, direct update — see revised
  A2): Once the shipped behavior (R1–R5, R7) is built..."; `src-audit-remediation-v1.md`'s task
  Command Results table row `| R1–R3, R8 | npm run setup-refs:test | 4/4 pass |`. All of these
  are legitimate, accepted narrative shorthand for "the full set of IDs this chain/step
  covers" — not documentation gaps.
- Re-read the actual Wave 2 incident text closely (`workflow/artifacts/reviews/power-skills-wave2-v1.md`
  P3 finding) rather than trusting the brief's/plan's paraphrase: the 3 real instances were (1)
  a Requirement Coverage table row using shorthand instead of one row per ID, (2) a Phase
  heading title, (3) a Dependency Order ASCII diagram line. The review's own text states
  instances 2 and 3 "aren't scanned by any current validator" — meaning even the original
  incident's own reviewer treated them as a manual/stylistic catch, not evidence of a
  machine-checkable defect class. Only instance 1 (a Requirement Coverage table row) sits in a
  position where a validator's contract (`check-coverage-ledger.mjs` expects one ID per row)
  is actually violated.
- Traced `check-coverage-ledger.mjs`'s existing per-ID row lookup
  (`section.split('\n').find(line => line.includes('|') && idPattern.test(line))`, where
  `idPattern = new RegExp('\\b' + id + '\\b')`) against a hypothetical shorthand row `R1-R3`:
  `\bR2\b` and `\bR3\b` do **not** match the literal substring `R1-R3` at all (no `R2`/`R3`
  token present), so those rows would already surface as `manifest ID R2/R3 has no row in the
  coverage table` under the *existing* validator — only `R1` (the first number in the range)
  would silently pass by matching its own bare substring. The residual, currently-uncaught gap
  is narrower than the brief/plan assumed: one specific ID per shorthand row, in one specific
  table type, not "range shorthand anywhere in a document."
- **Conclusion: R1 as scoped in the approved Plan (a repo-wide free-text scan flagging any
  dash-range pattern) is not safely implementable** — it would produce roughly 46 false
  positives against legitimate, already-shipped-quality artifacts on its very first run,
  which fails RI4's own exit gate (zero false positives against the real existing tree) by a
  wide margin, not a marginal one. Continuing to implement the originally-scoped design would
  mean either accepting a broken/noisy validator or silently narrowing scope without
  recording it — both against this chain's own Determinism Rules and R6's evidence-first
  principle. Paused here rather than doing either.
- **User chose Option 1 (narrow, don't drop).** Amended the brief's R1 acceptance criteria and
  the plan's Phase 1 Work/Exit gate to the narrowed scope (Requirement/Manifest Coverage table
  Manifest ID cell only) before writing any code, per the same discipline used earlier this
  session for the scope-fence Touches correction in `manifest-id-parser-hardening`.
- Before writing the validator, re-confirmed via a scoped grep
  (`^\s*\|\s*R(I)?[0-9]+[–-]R(I)?[0-9]+\s*\|`) that zero real table rows anywhere in
  `workflow/artifacts/` use bare range shorthand as a first cell — the narrowed design has zero
  false positives against existing content before implementation even began.
- Implemented `check-coverage-range-shorthand.mjs`: scans each artifact's Requirement
  Coverage / Manifest Coverage (or Manifest Coverage Retrospective) section specifically,
  checks each table row's first cell against `/\bR(I)?[0-9]+[–-]R(I)?[0-9]+\b/`. Verified the
  regex correctly distinguishes a range (`R1-R4`, `RI2–RI5`) from a legitimate hyphenated
  sub-label (`RI5-a`) and a comma-separated multi-ID cell (`R9, RI3, RI4`) via 6 inline test
  cases before building the fixture.
- Registered in `scripts/validate-template.mjs`'s `artifactCommands` array (same group as
  `check-coverage-ledger.mjs`, same `AGENTSMYTH_HOME` env needs).
- Built fixture `v-id-range-shorthand` (a plan with `R1-R4` as a Requirement Coverage row's
  Manifest ID cell) and registered it in `test/run-violation-tests.mjs`.

### Phase 2 - CI script coverage

- Re-confirmed all 4 target scripts still pass locally immediately before editing `ci.yml`
  (per the Plan's own exit gate, guarding against local drift between Plan-time and Build-time
  checks): `setup-checks:test` 4/4, `setup-refs:test` 5/5, `root-resolution:test` 16/16,
  `init-prepare-interop:test` 32/32 — all unchanged from Plan's earlier check.
- Added one step per script to `ci.yml`'s `validate` job, mirroring the existing
  `violations:test`/`conformance:test` steps' exact naming and formatting style.

### Phase 3 - Ship Workflow additions

- Inserted step **4a** (origin/main staleness) directly after existing step 4 ("Inspect
  repository readiness...") and step **6a** (resolved-fix-vs-open-risk classification) directly
  after existing step 6 ("Map every active R and RI..."), both worded generically — no chain
  slug, open-item ID, or work-package label.
- `grep -inE "OI-|WP-R|lifecycle-process-hardening" lifecycle-ship/SKILL.md` → zero matches,
  confirmed immediately after the edit, before moving to the next phase.

### Phase 4 - No-self-approval rule

- Added a new `## Approval` section to `rules.md`, positioned between `## Evidence` and
  `## Git Safety` (both adjacent concepts — trustworthy state reporting), stating the rule
  generically per this session's own repeated real incidents (not named in the shipped text).
- `grep -inE "OI-|WP-R|lifecycle-process-hardening" rules.md` → zero matches.

### Phase 5 - Build Workflow addition

- Added new Workflow step 6b to `lifecycle-build/SKILL.md`, positioned directly after the
  existing step 6a (`conditional-preservation-check`) and mirroring its exact style
  (sub-numbered, same "before recording the change as complete" framing).
- `grep -inE "OI-|WP-R|lifecycle-process-hardening" lifecycle-build/SKILL.md` → zero matches.

### Phase 6 - Full verification

- `npm run build` regenerated `dist/` clean. Grepped the rebuilt `dist/workflow-bundle.md` for
  jargon (`OI-[0-9]`, `WP-R[0-9]`, this chain's own slug): found 5 matches, all pre-existing
  and unrelated to this chain's own diff — 2 are a generic illustrative example
  (`follow-up-owner-assigner`'s ledger-format doc uses `OI-1`/`OI-2` as placeholder IDs, not a
  reference to a real internal item) and 3 are genuine jargon (mentions of "the WP-R7 chain"
  and "manifest-id-parser-hardening R2 follow-up" inside code comments in
  `check-manifest-coverage.mjs`/`check-coverage-ledger.mjs`) left over from the already-merged
  `manifest-id-parser-hardening` chain (PR #36) — a real, separate, pre-existing defect this
  chain did not introduce. Re-ran the same grep scoped to only this chain's own new/changed
  files (`lifecycle-ship/SKILL.md`, `rules.md`, `lifecycle-build/SKILL.md`,
  `check-coverage-range-shorthand.mjs`) — zero matches, confirming RI1 is met for this chain's
  own diff. The pre-existing defect is reported separately to the user, not silently fixed
  here (outside this chain's declared Touches) and not silently ignored either.
- `npm run validate` — failed once on a false positive: this task artifact's own Changed Files
  bullet describing step 6a's name ("resolved-fix vs. waiver classification") tripped
  `check-waivers.mjs`'s prose heuristic. Reworded to "resolved-fix-vs-open-risk
  classification" (same meaning, avoids the trigger word combination) and re-ran clean.
- `npm run violations:test` — 21/21 (20 pre-existing + `v`), zero regression.
- `npm run conformance:test` — 12/12, zero regression.
- `git diff package.json` — empty, no new dependency.

### Phase 7 - Fix pre-existing jargon leak found during Phase 6

- User directed fixing this inside the current chain rather than tracking separately. Amended
  the brief (added R7 with acceptance criteria) and plan (R7 in manifest_ids, Requirement
  Coverage, Repo Impact Map, Verification Plan, new Phase 7, Exit Gate) before touching any
  file, per this chain's own R5/Determinism Rules on scope changes needing an explicit plan
  update, not a silent edit.
- Reworded the 2 flagged lines in each of `check-manifest-coverage.mjs` and
  `check-coverage-ledger.mjs`: replaced "WP-R7-T7.2"/"WP-R4"/"WP-R2" example strings with a
  generic "prefix-R7-suffix"-style illustrative token, and replaced "dogfooding the WP-R7
  chain"/"Review found it during manifest-id-parser-hardening R2 follow-up" with generic
  "dogfooding real lifecycle artifacts"/"rejected during review" phrasing — kept the
  substantive technical reasoning (why the regex excludes what it excludes) fully intact, only
  removed the internal chain/work-package references, matching the exact repair pattern used
  earlier this session for the original WP-R7 jargon-leak incident.
- Rebuilt `dist/` and re-grepped: zero real jargon remains (the only 2 remaining `OI-`
  matches are `follow-up-owner-assigner`'s own ledger-format documentation using `OI-1`/`OI-2`
  as generic placeholder IDs — not a reference to any real internal item, confirmed by reading
  the surrounding context).
- Re-ran `npm run validate` (pass), `npm run violations:test` (21/21), `npm run conformance:test`
  (12/12) — comment-only changes, zero behavioral regression as expected.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R1 | Fixture `v-id-range-shorthand` via `check-coverage-range-shorthand.mjs --dir` | Flagged error |
| RI4 | Full run of `check-coverage-range-shorthand.mjs` against real `workflow/artifacts/` (45 files) | Zero errors |
| R2 | `ci.yml` diff shows all 4 new steps; each script re-confirmed passing locally immediately before the change | Present, all pass |
| R3 | `lifecycle-ship/SKILL.md` diff shows new step 4a at the correct position | Present, generic wording |
| R4 | `lifecycle-ship/SKILL.md` diff shows new step 6a at the correct position | Present, generic wording |
| R5 | `rules.md` diff shows the new `## Approval` section | Present, generic wording |
| R6 | `lifecycle-build/SKILL.md` diff shows new step 6b | Present, generic wording |
| RI1 | Rebuilt `dist/` jargon grep scoped to this chain's own diff | 0 matches — pass |
| RI2 | `npm run build/validate/violations:test/conformance:test` | All pass, zero regression |
| RI3 | `git diff package.json` | Empty — pass |
| R7 | `grep` of both files + rebuilt `dist/` for jargon | 0 matches — pass |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `grep -rn -E "R[0-9]+[–-]R(I)?[0-9]+\|RI[0-9]+[–-]RI?[0-9]+" workflow/artifacts/` | Phase 1, R1 | 46 matches | Full repo-wide occurrence count, far exceeding the Plan's anticipated "historical prose" scale |
| Manual trace of `check-coverage-ledger.mjs`'s existing `idPattern`/row-lookup logic against a hypothetical `R1-R3` row | Phase 1, R1 | partial existing coverage confirmed | R2/R3 would already surface as missing rows under current code; only R1 (first-in-range) silently passes |
| `grep -rn -E "^\s*\|\s*R(I)?[0-9]+[–-]R(I)?[0-9]+\s*\|" workflow/artifacts/` | Phase 1, R1 | 0 matches | Confirmed narrowed scope has zero false positives before writing any code |
| Inline regex test: 6 cases (`R1-R4`, `RI2–RI5`, `RI5-a`, `R9, RI3, RI4`, `R1`, `RI5-a, RI5-b`) | Phase 1, R1 | pass | Correctly distinguishes range from sub-label and multi-ID cell |
| `AGENTSMYTH_HOME=src/workflow node check-coverage-range-shorthand.mjs` (full run, no `--dir`) | Phase 1, RI4 | pass, 0 errors | 45 real artifact files checked, zero false positives |
| `node check-coverage-range-shorthand.mjs --dir test/fixtures/lifecycle-violations/v-id-range-shorthand` | Phase 1, R1 | fail (exit 1), as expected | Flags the seeded `R1-R4` row |
| `node test/run-violation-tests.mjs` | Phase 1, R1 | pass | 21/21 (20 pre-existing + `v`), zero regression |
| `npm run validate` | Phase 1 | pass, exit 0 | New validator registered and runs clean in the full suite |
| `npm run setup-checks:test` (re-confirm) | Phase 2, R2 | pass, 4/4 | Unchanged from Plan's earlier check |
| `npm run setup-refs:test` (re-confirm) | Phase 2, R2 | pass, 5/5 | Unchanged from Plan's earlier check |
| `npm run root-resolution:test` (re-confirm) | Phase 2, R2 | pass, 16/16 | Unchanged from Plan's earlier check |
| `npm run init-prepare-interop:test` (re-confirm) | Phase 2, R2 | pass, 32/32 | Unchanged from Plan's earlier check |
| `grep -inE "OI-\|WP-R\|lifecycle-process-hardening" lifecycle-ship/SKILL.md` | Phase 3, R3/R4 | 0 matches | Jargon-free, confirmed immediately after edit |
| `grep -inE "OI-\|WP-R\|lifecycle-process-hardening" rules.md` | Phase 4, R5 | 0 matches | Jargon-free, confirmed immediately after edit |
| `grep -inE "OI-\|WP-R\|lifecycle-process-hardening" lifecycle-build/SKILL.md` | Phase 5, R6 | 0 matches | Jargon-free, confirmed immediately after edit |
| `npm run build` | Phase 6, RI1 | pass | dist/ regenerated clean |
| `grep -inE "OI-[0-9]\|WP-R[0-9]\|lifecycle-process-hardening" dist/workflow-bundle.md` (full bundle) | Phase 6, RI1 | 5 matches, all pre-existing | 2 generic example (OI-1/OI-2 in ledger-format.md), 3 real jargon leftover from already-merged manifest-id-parser-hardening chain — reported separately, not this chain's diff |
| Same grep scoped to this chain's own 4 changed/new source files | Phase 6, RI1 | 0 matches | This chain's own diff is clean |
| `npm run validate` (1st run) | Phase 6, RI2 | fail (`check-waivers`) | This task artifact's own prose ("resolved-fix vs. waiver classification") tripped the heuristic |
| `npm run validate` (2nd run, after rewording) | Phase 6, RI2 | pass, exit 0 | Clean |
| `npm run violations:test` | Phase 6, RI2 | pass | 21/21 |
| `npm run conformance:test` | Phase 6, RI2 | pass | 12/12 |
| `git diff package.json` | Phase 6, RI3 | empty | No new dependency |
| `grep -inE "OI-[0-9]\|WP-R[0-9]\|manifest-id-parser-hardening"` (source, both files) | Phase 7, R7 | 0 matches | Fix confirmed at source level |
| `npm run build` (Phase 7) | Phase 7, R7 | pass | dist/ regenerated with the fix |
| `grep -inE "OI-[0-9]\|WP-R[0-9]\|manifest-id-parser-hardening" dist/workflow-bundle.md` (Phase 7) | Phase 7, R7 | 2 matches, both benign | Only `follow-up-owner-assigner`'s generic `OI-1`/`OI-2` placeholder example remains |
| `npm run validate` (Phase 7) | Phase 7, R7 | pass, exit 0 | Comment-only change, no regression |
| `npm run violations:test` (Phase 7) | Phase 7, R7 | pass | 21/21 |
| `npm run conformance:test` (Phase 7) | Phase 7, R7 | pass | 12/12 |

## Dispatch Log

none

## Architecture Notes

- role: Senior Engineer
- decision: Stopped before implementing Phase 1 rather than either (a) shipping a validator
  that would false-positive 46 times on real content, or (b) silently narrowing R1's scope on
  my own authority. Per this chain's own R6 (verify a fix's boundary with real evidence before
  implementing) and Build's Refusal condition ("implementation reveals a new requirement or
  changed acceptance criteria" → stop and ask), this is exactly the situation that condition
  exists for.
- constraint: The Plan's Risk Register anticipated *some* false-positive risk from historical
  prose but scoped it as a manageable, narrow concern ("this Plan's own Inputs section, or
  `power-skills-wave2-v1`'s Review/Reflect artifacts") — real evidence shows the concern is
  the dominant, not the exceptional, case: 46 legitimate uses vs. effectively 0 remaining real
  defect instances (the one real Wave 2 table-row incident was already fixed by that chain's
  own Build/Review).
- downstream: This finding needed a Plan-level decision, not a Build-level workaround — user
  chose Option 1 (narrow) over dropping R1 entirely.
- decision (post-rescope): Kept the narrowed check as a standalone new validator
  (`check-coverage-range-shorthand.mjs`) rather than folding the logic into
  `check-coverage-ledger.mjs` — the two check different things (row-per-ID shape vs.
  waiver-completeness) and mixing them would make either harder to reason about independently,
  consistent with this repo's general one-validator-one-concern convention.
- decision (Phase 6): found a real, pre-existing jargon leak in already-merged code
  (`check-manifest-coverage.mjs`/`check-coverage-ledger.mjs` comments reference an internal
  chain name) while grepping the rebuilt `dist/` output for this chain's own RI1 check. Did
  not fix it here — it is outside this chain's declared Touches, and this chain's own R5
  (no silent scope changes) applies as much to Build's own discoveries as to anyone else's.
  Reported to the user directly rather than silently absorbed into this chain or silently
  left for a future Reflect to maybe notice.

## Blockers

none (Phase 1's R1-scope blocker was resolved by the user's Option 1 decision, not carried
forward)

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Phase 1 - Range-shorthand structural check | complete | 2026-07-18 | Rescoped after finding the original design would false-positive 46×; user chose Option 1; narrowed check built, fixture proven, zero false positives against real tree |
| Phase 2 - CI script coverage | complete | 2026-07-18 | All 4 scripts re-confirmed passing immediately before the change; `ci.yml` now runs all 6 test scripts |
| Phase 3 - Ship Workflow additions | complete | 2026-07-18 | Steps 4a/6a inserted at the correct positions, generic wording, zero jargon confirmed |
| Phase 4 - No-self-approval rule | complete | 2026-07-18 | New `## Approval` section added to `rules.md`, generic wording, zero jargon confirmed |
| Phase 5 - Build Workflow addition | complete | 2026-07-18 | New step 6b added to `lifecycle-build/SKILL.md`, mirroring existing 6a convention, zero jargon confirmed |
| Phase 6 - Full verification | complete | 2026-07-18 | All commands pass; this chain's own diff has zero jargon; found and reported (not fixed) a separate pre-existing jargon leak in already-merged code |
| Phase 7 - Fix pre-existing jargon leak found during Phase 6 | complete | 2026-07-18 | User directed the fix into this chain; brief/plan amended with R7 first; 4 comment lines reworded across 2 files; zero jargon confirmed in source and rebuilt dist/; zero regression |
