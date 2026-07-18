---
slug: lifecycle-process-hardening
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-07-18
updated: 2026-07-18
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, RI1, RI2, RI3, RI4]
upstream:
  - workflow/artifacts/briefs/lifecycle-process-hardening-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: approved
---

# Lifecycle Process Hardening - Plan

## Summary

Six small, independent fixes across this repo's own validators, CI config, and phase skills,
grounded in real evidence gathered this Plan (not just the brief's prior description): a new
range-shorthand validator (R1), 4 test scripts confirmed to pass locally and ready for CI
wiring (R2), two `lifecycle-ship` Workflow additions (R3, R4), one `rules.md` addition (R5),
and one `lifecycle-build` Workflow addition (R6). 6 phases, one per requirement plus a final
verification phase, since each touches a different file with no real dependency between them —
unlike `manifest-id-parser-hardening`'s Phase 1→2 helper dependency, nothing here shares code.

## Inputs

- Brief: `workflow/artifacts/briefs/lifecycle-process-hardening-v1.md`
  (`orchestration.status: ready-for-next-phase`, approved).
- Manifest IDs: R1, R2, R3, R4, R5, R6, RI1, RI2, RI3, RI4.
- Confirmed this Plan by running each locally: `npm run setup-checks:test` (4/4),
  `npm run setup-refs:test` (5/5), `npm run root-resolution:test` (16/16),
  `npm run init-prepare-interop:test` (32/32) — all pass today, so R2's CI-wiring risk
  (a red job) does not materialize.
- Read `scripts/validate-template.mjs` in full to confirm how validators are registered
  (an ordered array of `['node', ['src/workflow/validators/check-*.mjs']]` entries).
- Read the exact real range-shorthand incidents (`workflow/artifacts/reviews/power-skills-wave2-v1.md`
  P3 finding): pattern is `R[0-9]+[–-]R[0-9]+` / `RI[0-9]+[–-]RI[0-9]+` appearing in a plan's
  Requirement Coverage table cell, a Phase heading title, and a Dependency Order ASCII diagram
  — i.e. anywhere in a document's free text, not a single structured position. This differs
  from `manifest-id-parser-hardening`'s problem shape (distinguishing real IDs from false
  substring matches in structured positions) — here every occurrence of the pattern is wrong,
  so a simple repo-wide free-text scan is sufficient; no structured-tag design needed.
- Read `src/workflow/skills/lifecycle-ship/SKILL.md`'s full Workflow/Refusal sections and
  `src/workflow/skills/lifecycle-build/SKILL.md`'s full Workflow (including the existing step
  6a `conditional-preservation-check` precedent) to plan exact, minimally-disruptive insertion
  points rather than rewriting either section.
- Read `test/fixtures/lifecycle-violations/` directory listing: next available single-letter
  fixture ID is `v` (a-u used, h/i/k/m historically skipped/reused).

## Requirement Coverage

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R1 | Phase 1 | New `check-id-range-shorthand.mjs`, registered in `validate-template.mjs`, fixture `v` |
| R2 | Phase 2 | `ci.yml` gains steps for the 4 currently-unwired, currently-passing test scripts |
| R3 | Phase 3 | `lifecycle-ship/SKILL.md` new Workflow step 4a (origin/main staleness check) |
| R4 | Phase 3 | `lifecycle-ship/SKILL.md` new Workflow step 6a (resolved-fix vs. waiver classification) |
| R5 | Phase 4 | `rules.md` new rule (no self-approval without genuine per-artifact user review) |
| R6 | Phase 5 | `lifecycle-build/SKILL.md` new Workflow step (boundary-comparison, mirrors existing 6a) |
| RI1 | Phase 6 | `dist/` rebuild + grep for jargon (`OI-`, `WP-R`, this chain's slug) — zero matches |
| RI2 | Phase 6 | Full `npm run build/validate/violations:test/conformance:test`, zero regression |
| RI3 | Phase 6 | `git diff package.json` empty |
| RI4 | Phase 1 | R1's own exit gate: full-tree run of the new validator against `workflow/artifacts/`, zero false positives |
| R7 | Phase 7 | Reworded 3 jargon-laden comment lines in already-merged validator files, found by Phase 6's own RI1 grep |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `src/workflow/validators/check-id-range-shorthand.mjs` | runtime (new) | R1, RI4 | Scans artifact bodies for `R[0-9]+[–-]R(I)?[0-9]+`-shaped dash-range patterns; flags as error |
| `scripts/validate-template.mjs` | runtime | R1 | Register the new validator in the invocation array |
| `test/fixtures/lifecycle-violations/v-*/` | tests | R1, RI4 | New seeded fixture proving the check fires |
| `test/run-violation-tests.mjs` | tests | R1 | Register fixture `v` |
| `.github/workflows/ci.yml` | config | R2, RI2 | Add steps for `setup-checks:test`, `setup-refs:test`, `root-resolution:test`, `init-prepare-interop:test` |
| `src/workflow/skills/lifecycle-ship/SKILL.md` | runtime (shipped via dist) | R3, R4 | Two new Workflow steps (4a, 6a), generic wording, no internal jargon |
| `src/workflow/rules.md` | runtime (shipped via dist) | R5 | New rule under an existing or new section, generic wording |
| `src/workflow/skills/lifecycle-build/SKILL.md` | runtime (shipped via dist) | R6 | New Workflow step mirroring existing step 6a's convention |
| `src/workflow/validators/check-manifest-coverage.mjs` | runtime (shipped via dist) | R7 | Reword 2 comment lines referencing an internal chain name |
| `src/workflow/validators/check-coverage-ledger.mjs` | runtime (shipped via dist) | R7 | Reword 2 comment lines referencing an internal chain/work-package name |

## Source-of-Truth Strategy

No external source-of-truth involved. Self-contained fix within `src/workflow/`,
`scripts/`, `.github/workflows/`, and `test/`.

## Approach

6 phases, each independent (no phase depends on another's output, unlike
`manifest-id-parser-hardening`'s shared-helper dependency) — ordered by nothing more than
review continuity and grouping R3+R4 together since they touch the same file. Phase 6 (full
verification) runs last, needing every other phase's diff to exist.

## Phases

### Phase 1 - Range-shorthand structural check

- **Manifest IDs:** R1, RI4
- Touches: `src/workflow/validators/check-coverage-range-shorthand.mjs`,
  `scripts/validate-template.mjs`, `test/fixtures/lifecycle-violations/v-id-range-shorthand/`,
  `test/run-violation-tests.mjs`
- **Rescoped during Build, before any code was written** (see task artifact's Phase 1
  Implementation Log and Blockers for the full evidence trail): a repo-wide free-text scan, as
  originally planned, would have flagged ~46 real occurrences of this shorthand across nearly
  every existing artifact — almost all of them legitimate narrative usage (e.g. "Active
  manifest IDs: R1–R7, RI1–RI7"), not defects. Re-reading the original Wave 2 incident closely
  showed only one of its 3 instances (a Requirement Coverage table row) sat where a validator's
  actual contract (one ID per row) was violated; the other two were manual/stylistic catches
  the original Reviewer explicitly noted "aren't scanned by any current validator." Tracing
  `check-coverage-ledger.mjs`'s existing per-ID row lookup further showed it already catches
  most of a shorthand row's fallout (every ID but the first number in the range surfaces as
  "no row found"); the real residual gap is one silently-mis-covered ID, in one specific table
  position — not shorthand anywhere in a document. User chose to narrow R1 to that position
  rather than drop it. Confirmed via `grep -rn -E "^\s*\|\s*R(I)?[0-9]+[–-]R(I)?[0-9]+\s*\|"
  workflow/artifacts/` — zero real table rows use bare range-shorthand as their Manifest ID
  cell, so this narrowed scope has zero false positives against existing content.
- Work:
  - New validator scans every artifact's `## Requirement Coverage` / `## Manifest Coverage`
    (including `Manifest Coverage Retrospective`) table section specifically — not the whole
    document — and flags any row whose first (Manifest ID) cell matches a bare dash-range
    pattern between two full ID tokens (e.g. `R1-R4`, `RI2–RI5`), naming the exact file and row
    and suggesting the enumerated form instead. Must not flag a hyphenated sub-label (e.g.
    `RI5-a`, where the suffix after the hyphen is not itself a full `R`/`RI` token) or a
    legitimate comma-separated multi-ID cell (e.g. `R9, RI3, RI4`).
  - Register the new validator in `scripts/validate-template.mjs`'s invocation array,
    following the existing entries' exact pattern.
  - New fixture `v-id-range-shorthand`: an artifact whose Requirement/Manifest Coverage table
    has one row using range shorthand as its Manifest ID cell.
  - Register fixture `v` in `test/run-violation-tests.mjs`.
- **Exit gate:** fixture `v` is detected by `npm run violations:test`; a full run of the new
  validator against the complete existing `workflow/artifacts/` tree (not just the fixture)
  produces zero errors (RI4).

### Phase 2 - CI script coverage

- **Manifest IDs:** R2
- Touches: `.github/workflows/ci.yml`
- Why safe: all 4 target scripts (`setup-checks:test`, `setup-refs:test`,
  `root-resolution:test`, `init-prepare-interop:test`) were confirmed passing locally this
  Plan (4/4, 5/5, 16/16, 32/32) — wiring them in adds real protection, not a red job.
- Work: add one step per script to `ci.yml`'s `validate` job, following the existing
  `violations:test`/`conformance:test` step convention exactly (same job, same style).
- **Exit gate:** `ci.yml`, after the change, includes a step for each of the 4 named scripts;
  each is confirmed passing locally one more time immediately before the change is considered
  done (guards against local repo state having shifted between Plan's check and Build's edit).

### Phase 3 - Ship Workflow additions

- **Manifest IDs:** R3, R4
- Touches: `src/workflow/skills/lifecycle-ship/SKILL.md`
- Work:
  - New step **4a** (after existing step 4, "Inspect repository readiness for configured
    branch..."): fetch and compare the current branch against the remote default branch;
    treat meaningful divergence as something Ship must surface (a merge/rebase decision point)
    rather than silently ignore.
  - New step **6a** (after existing step 6, "Map every active R and RI to shipped, deferred,
    blocked, or waived"): for any Build/Review discovery not already covered by the plan's
    declared scope, first classify it as either a completed, independently-verified fix (a
    resolved scope note) or genuinely open, unresolved risk — only genuinely open risk may
    become a waiver in step 8; an already-fixed item must not be presented to the user as
    pending risk-acceptance.
  - Both steps worded generically (no chain name, no open-item ID) — this file ships via
    `dist/workflow-bundle.md`.
- **Exit gate:** both new steps exist in the Workflow list at the correct position; `grep` of
  the file for `OI-`/`WP-R`/this chain's slug finds zero matches.

### Phase 4 - No-self-approval rule

- **Manifest IDs:** R5
- Touches: `src/workflow/rules.md`
- Work: add a new rule (new subsection, or appended to an existing one — Build's call once it
  re-reads the file's current section structure) stating: a checkpoint status of `approved` or
  `ready-for-next-phase` requires the user to have responded to that specific artifact's own
  content in the current turn — not merely a prior phase's content, and not inferred from
  silence or an unrelated instruction. Worded generically.
- **Exit gate:** the new rule exists in `rules.md`; `grep` of the file for `OI-`/`WP-R`/this
  chain's slug finds zero matches.

### Phase 5 - Build Workflow addition

- **Manifest IDs:** R6
- Touches: `src/workflow/skills/lifecycle-build/SKILL.md`
- Work: add a new numbered Workflow step, positioned near existing step 6a
  (`conditional-preservation-check`) and following its exact convention, directing: before
  considering a fix to a check/scan/exclusion boundary complete, verify its correctness with
  an explicit before/after comparison across representative cases (not just the motivating
  case), in addition to any full-tree regression run already required elsewhere in this
  Workflow. Worded generically.
- **Exit gate:** the new step exists in the Workflow list; `grep` of the file for
  `OI-`/`WP-R`/this chain's slug finds zero matches.

### Phase 6 - Full verification

- **Manifest IDs:** RI1, RI2, RI3
- Touches: none (verification only)
- Work: `npm run build` (regenerates `dist/`); grep the rebuilt `dist/workflow-bundle.md` for
  `OI-`, `WP-R`, and this chain's own slug (`lifecycle-process-hardening`) — zero matches
  required; `npm run validate && npm run violations:test && npm run conformance:test` against
  the full existing `workflow/artifacts/` tree; `git diff package.json`.
- **Exit gate:** all commands pass with current-turn output cited; jargon grep against
  rebuilt `dist/` is empty; `git diff package.json` shows no `dependencies` change.

### Phase 7 - Fix pre-existing jargon leak found during Phase 6

- **Manifest IDs:** R7
- Touches: `src/workflow/validators/check-manifest-coverage.mjs`,
  `src/workflow/validators/check-coverage-ledger.mjs`
- Why: Phase 6's own RI1 jargon grep against the rebuilt `dist/` output found 3 real matches
  unrelated to this chain's own diff — code comments in these two files (added by the
  already-merged `manifest-id-parser-hardening` chain, PR #36) reference an internal chain
  name and a work-package-style label. User directed fixing it inside this chain rather than
  tracking it separately.
- Work: reword the 3 flagged comment lines to describe the behavior/reasoning without naming
  the internal chain — same pattern used earlier this session to fix the original WP-R7
  jargon-leak incident (rewrite, don't delete the substance; the comments still need to explain
  why the regex excludes what it excludes).
- **Exit gate:** `grep -inE "OI-[0-9]|WP-R[0-9]|manifest-id-parser-hardening"` against both
  files and the rebuilt `dist/workflow-bundle.md` finds zero matches; `npm run validate` still
  passes (these files are exercised by the existing conformance/violation suites, which must
  still pass unchanged since only comments are edited).

## Dependency Order

All 6 originally-planned phases are independent of each other's output (unlike
`manifest-id-parser-hardening`'s Phase 1→2 helper dependency) — Phase 6 is the only phase with
a real dependency, needing every other phase's diff to exist before its full-suite/jargon-grep
verification is meaningful. Phase 7 depends on Phase 6 (its own grep is what found the issue).
Suggested order: Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7, purely
for reviewer continuity (validator work first, then config, then the 3 shipped-skill-doc
phases grouped together, then verification, then the fix that verification surfaced).

## Branch Strategy

- Base: `main`.
- Working branch: `feat/lifecycle-process-hardening` (already created off local `main`, which
  is up to date with `origin/main` as of PR #35/#36 merging).
- Commits: one per phase preferred, not mandatory.
- No commits to `main` directly (`repo-profile.yaml`'s
  `branch_policy.require_non_default_branch_for_changes: true`).
- PR: not required by default (`release.yaml`); create only if requested.

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|
| R1's validator false-positives against historical prose that quotes the range-shorthand pattern while describing the past incident (e.g. this very Plan's own Inputs section, or `power-skills-wave2-v1`'s Review/Reflect artifacts) | medium | medium | Phase 1's exit gate explicitly requires a full-tree run and names this exact scenario as something Build must resolve (exclude reviews/reflect narrating history, or another proven-correct scoping) before considering the phase done | Build | R1, RI4 |
| Any of the 4 target test scripts (R2) has drifted and no longer passes by the time Build actually makes the change (time gap between this Plan's check and Build execution) | low | medium | Phase 2's exit gate requires re-confirming all 4 pass immediately before the change, not relying solely on this Plan's earlier check | Build | R2 |
| A generically-worded new rule/step (R3, R4, R5, R6) accidentally retains a jargon reference despite intent, since 4 separate files are being edited | low | high (this exact defect class caused the WP-R7 jargon-leak incident twice in this repo's history) | Every phase touching a shipped file has an explicit grep-based exit gate, and Phase 6 re-greps the fully rebuilt `dist/` output as a final independent check, not just the source files | Build | R3, R4, R5, R6, RI1 |

No risk here lacks a mitigation; none require a waiver.

## Verification Plan

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1 | Fixture `v-id-range-shorthand` detected by `npm run violations:test`; full-tree run against real `workflow/artifacts/` shows zero false positives | Build | |
| R2 | `ci.yml` diff shows all 4 new steps; each script re-confirmed passing locally immediately before the change | Build | |
| R3 | `lifecycle-ship/SKILL.md` diff shows new step 4a at the correct position, generic wording | Build | |
| R4 | `lifecycle-ship/SKILL.md` diff shows new step 6a at the correct position, generic wording | Build | |
| R5 | `rules.md` diff shows the new rule, generic wording | Build | |
| R6 | `lifecycle-build/SKILL.md` diff shows the new step, generic wording | Build | |
| RI1 | `npm run build`; grep rebuilt `dist/workflow-bundle.md` for jargon — zero matches | Build/Ship | |
| RI2 | `npm run build/validate/violations:test/conformance:test` current-turn output | Build/Ship | |
| RI3 | `git diff package.json` empty | Build/Ship | |
| RI4 | Same evidence as R1's full-tree run | Build | |
| R7 | `grep` of both files + rebuilt `dist/workflow-bundle.md` for jargon — zero matches; `npm run validate` unchanged pass | Build | Added when Phase 6's own RI1 check surfaced this pre-existing issue |

## Architecture Notes

- role: Principal Engineer
- decision: Kept all 6 requirements as independent, single-file-focused phases rather than
  grouping by theme (e.g. "all shipped-skill-doc changes in one phase") — R3/R4 share a file
  and are grouped (Phase 3), but R5/R6 touch different shipped files with no other overlap, so
  keeping them separate keeps each phase's Touches list and exit gate unambiguous.
- decision: Ran the 4 target CI scripts locally during Plan itself (not deferred to Build) to
  ground R2's risk assessment in real evidence — confirmed all pass today, directly informing
  the Risk Register's likelihood rating for that row.
- constraint: R3, R4, R5, R6 all touch files that ship via `dist/workflow-bundle.md` — every
  phase touching one of these has its own jargon-grep exit gate, and Phase 6 independently
  re-checks the fully rebuilt output, not just source, mirroring the two-layer verification
  this repo used to actually catch and fix the original WP-R7 jargon-leak incident (source
  grep alone had missed a match that only the rebuilt `dist/` output surfaced).
- tradeoff: Considered a single combined "shipped skill-doc changes" phase for R3/R4/R5/R6 —
  rejected because that phase's Touches list (4 files) and exit gate (4 independent greps)
  would be harder to review as one unit than 3 smaller phases, for no real efficiency gain
  since none of the 4 files share content or a dependency.
- downstream: Review should specifically re-verify Phase 1's false-positive-on-historical-prose
  resolution (the Risk Register's top row) against the actual shipped fix, not just trust
  Build's own full-tree run claim — this is the one requirement in this chain with genuine
  design ambiguity Plan could not fully resolve without seeing Build's actual scoping choice.

## Open Questions

None.

## Exit Gate

- [x] Every active R and RI mapped to exactly one owning phase (`requirement-phase-mapper`
      check: R1→Phase 1, R2→Phase 2, R3→Phase 3, R4→Phase 3, R5→Phase 4, R6→Phase 5, R7→Phase 7,
      RI1→Phase 6, RI2→Phase 6, RI3→Phase 6, RI4→Phase 1).
- [x] Every phase has a binary, falsifiable exit gate.
- [x] Dependency order is explicit.
- [x] Every risk has a mitigation; none need a waiver.
- [x] Verification plan covers every R and RI.
- [x] Source-of-truth and release handling are explicit (not applicable; no release gate
      configured).
- [x] Branch strategy is explicit; does not target `main`.
- [x] No brief assumptions to verify (brief's Assumptions section was empty).
- [x] User approved the plan — "Continue," 2026-07-18, after this plan's specific phase
      breakdown and R1 false-positive risk handling were presented.
- [x] R7 added and approved — "Fix it in this chain and then run review," 2026-07-18, direct
      user instruction after Phase 6 surfaced the pre-existing jargon leak.
