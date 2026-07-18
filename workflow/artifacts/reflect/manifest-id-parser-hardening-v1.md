---
slug: manifest-id-parser-hardening
version: 1
artifact: reflect
status: done
created: 2026-07-18
updated: 2026-07-18
manifest_ids: [R1, R2, R3, RI1, RI2, RI3]
upstream:
  - workflow/artifacts/briefs/manifest-id-parser-hardening-v1.md
  - workflow/artifacts/plans/manifest-id-parser-hardening-v1.md
  - workflow/artifacts/tasks/manifest-id-parser-hardening-v1.md
  - workflow/artifacts/reviews/manifest-id-parser-hardening-v1.md
  - workflow/artifacts/verify/manifest-id-parser-hardening-v1.md
  - workflow/artifacts/ship/manifest-id-parser-hardening-v1.md
orchestration:
  phase: reflect
  status: done
  next_phase: done
  blockers: []
  user_checkpoint: none
---

# Manifest-ID Parser Hardening - Reflect

## Inputs

- Full chain: brief → plan (6 phases) → task → review → verify → ship, all
  `ready-for-next-phase`/`ship`, 0 open findings at close.
- Ship: `workflow/artifacts/ship/manifest-id-parser-hardening-v1.md` — recommendation `ship`,
  PR #36 open, commit `d97ac4b` pushed to `feat/manifest-id-parser-hardening`.
- Origin: `workflow/artifacts/open-items.yaml` OI-22, created during `init-prepare-interop`'s
  Reflect (2026-07-17) — see Follow-Ups for a real complication with this origin.

## Outcome

Shipped. All 6 requirements (R1, R2, R3, RI1, RI2, RI3) implemented, verified, and reviewed
with 0 open findings. Commit `d97ac4b` pushed; PR #36
(https://github.com/JeelVankhede/agentsmyth/pull/36) opened against `main`. Not yet merged —
merge decision reserved for the user. Release/deployment: not applicable (dev-tooling for this
repo's own lifecycle, not part of the npm package). Source-of-truth: not applicable. Rollback:
`git revert`, clean (all changes additive/behavioral, nothing removed or retyped).

## What Worked

- The brief corrected OI-22's own recorded scope before committing to requirements — re-read
  the actual source rather than trusting the prior note verbatim, and found the substring bug
  was in `check-manifest-coverage.mjs`, not `check-scope-fence.mjs` as OI-22 said.
- The plan revised the brief's "3 independent fixes, no shared utility" stance after reading
  real source during Plan itself — found `check-phase-map.mjs` and `check-manifest-coverage.mjs`
  genuinely share a structured-ID-parsing shape, while `check-coverage-ledger.mjs` doesn't
  (real Waivers content is prose, confirmed by reading an actual sample first).
- Full-tree regression testing after each Build phase (not just the new fixtures) caught 3 real
  regressions before they ever reached Review: hyphenated sub-labels (`RI5-a`/`-b`/`-c`)
  dropped by an over-strict filter, multi-ID table cells silently losing all but one ID, and a
  bare-parenthetical `(RI4)` convention neither the brief nor plan anticipated (confirmed 31
  real instances via grep before designing the fix).
- Every new fixture was proven non-vacuous — shown to fail on the pre-fix code and pass on the
  fixed code (via `git stash`/revert, or an inline before/after regex comparison when nothing
  was committed yet to stash against) — rather than trusted on the strength of passing alone.
- Review, working independently from Build's own re-verification, found 2 real gaps Build's
  evidence trail had not surfaced: the entire `conformance:test` suite (9 pre-existing checks +
  this chain's own new ones) was never run by CI, and `check-coverage-ledger.mjs`'s Phase 3 fix
  had a second, distinct false-negative edge case (hyphenated sub-labels) beyond the one it was
  designed to fix.
- "Fix all" closed every Review finding within the same chain — 1 P2 + 3 P3 fixed in a
  dedicated Build phase (Phase 6), each independently re-verified fresh by Review, then again
  by Test, then again by Ship, rather than trusted forward from the phase that fixed it.

## What Did Not Work

- Two near-miss self-approvals of the Plan artifact this session (WP-R7's and this chain's) —
  both caught before presenting to the user, but recurring across 2 unrelated chains in one
  session suggests this is a structural habit risk, not a one-off slip.
- The plan's Phase 4 originally declared the wrong test suite as a placeholder
  (`test/fixtures/lifecycle-violations/`/`run-violation-tests.mjs`), deferring the real
  suite-selection decision to Build. Build's correction was clean and well-evidenced, but a
  plan phase whose own Touches list is provisional is not fully falsifiable at time of
  approval — ideally that decision resolves before Build starts, not during it.
- `npm run conformance:test` existed with 9 real, meaningful checks since the
  `src-audit-remediation` chain (PR #34) without CI ever running it — a full chain's worth of
  time where a real regression in any of those 9 checks would have gone undetected by CI. This
  class of gap (a locally-runnable-only test script masquerading as durable protection) isn't
  caught by anything in the current lifecycle skills' default checklist; it took an independent
  Review pass explicitly reading `.github/workflows/ci.yml` to surface it.
- Cross-branch `open-items.yaml` drift: this chain's own stated origin, OI-22, does not exist
  in this branch's copy of the ledger at all — it was added on the still-unmerged
  `feat/init-prepare-interop` branch (PR #35), based on `origin/main` at an earlier point.
  This chain had to reconstruct the OI-22 entry from the brief's own quoted text rather than
  update a real existing one, and the two branches will collide on the same ID (different
  status: `open` vs. `done`) once both merge — see Follow-Ups.

## Surprises

`check-coverage-ledger.mjs`'s Phase 3 fix was considered complete and evidence-based at the
time (grepped real Waivers content, confirmed against 2 known patterns, passed full-tree
verification) — yet it still had a distinct, real gap that only surfaced when Review
independently re-examined the regex's own logic rather than re-running the same evidence
Build had already gathered. The grep-first approach found every pattern that existed in
*current* content, but not every pattern the fix's own new logic was newly capable of
mishandling (the trailing lookahead's over-exclusion of hyphenated sub-labels was a property
of the fix itself, not something any amount of grepping existing Waivers content would reveal,
since no existing content happened to use that convention inside a Waivers section yet).

## Manifest Coverage Retrospective

| Manifest ID | Outcome | Evidence path | Notes |
|---|---|---|---|
| R1 | shipped | `workflow/artifacts/verify/manifest-id-parser-hardening-v1.md` Manifest Coverage row R1 | `check-manifest-coverage.mjs` structured-tag scan; fixture `manifest-id-false-positive/` |
| R2 | shipped | `workflow/artifacts/verify/manifest-id-parser-hardening-v1.md` Manifest Coverage row R2 | `check-coverage-ledger.mjs` fix widened during Review's fix pass (Task Phase 6); fixture `coverage-ledger-sublabel/` |
| R3 | shipped | `workflow/artifacts/verify/manifest-id-parser-hardening-v1.md` Manifest Coverage row R3 | `check-phase-map.mjs` + shared `parseIdList()`; fixture `phase-map-parenthetical/` |
| RI1 | shipped | `workflow/artifacts/verify/manifest-id-parser-hardening-v1.md` Manifest Coverage row RI1 | `npm run validate`/`violations:test`, zero regression, reproduced 4× across the chain |
| RI2 | shipped | `workflow/artifacts/verify/manifest-id-parser-hardening-v1.md` Manifest Coverage row RI2 | 3 fixtures wired into `test/run-conformance-tests.mjs`, now CI-enforced |
| RI3 | shipped | `workflow/artifacts/verify/manifest-id-parser-hardening-v1.md` Manifest Coverage row RI3 | No new runtime dependency, confirmed 4× via `git diff package.json` |

## Deferred

none — all 6 active requirements shipped within this same chain.

## Source-of-Truth Outcome

not applicable — `source-of-truth.yaml` `mode: optional`, `providers: []`; no external
tracker or documentation source is affected by this self-contained validator fix.

## Learning Candidates

- **Candidate learning**: When a fix could plausibly be too broad or too narrow (a regex, a
  scan boundary, an exclusion rule), verify it with an inline before/after comparison across
  representative cases *before* implementing, not just after via full-tree regression — this
  chain's Task Phase 6 fix did this and landed correctly on the first attempt, confirming the
  same lesson Phase 3 learned earlier in the same chain as a repeatable pattern, not a one-off.
  Source: `workflow/artifacts/tasks/manifest-id-parser-hardening-v1.md` Phase 6 Implementation
  Log — propose-only.
- **Candidate learning**: Review (or Ship) should explicitly check whether any test/conformance
  script a chain touches or extends is actually wired into CI, not just an `npm run` script —
  "the fixture passes" and "CI enforces this going forward" are different claims, and nothing
  in the current lifecycle skills' default checklist prompts for the second one. Source:
  `workflow/artifacts/reviews/manifest-id-parser-hardening-v1.md` P2 finding — propose-only.
- **Candidate learning**: When starting a new lifecycle chain from `origin/main` while citing a
  sibling chain's still-open PR as the originating source (an open-items.yaml entry, etc.),
  explicitly check whether that source actually exists on the new branch — it may only exist on
  the unmerged sibling, meaning the new chain must reconstruct it from a quoted reference and
  flag a future merge-reconciliation concern rather than assume the ledger is current. Source:
  this Reflect's own Outcome/What Did Not Work sections — propose-only.

## Follow-Ups

| Action | Owner | Suggested Artifact Or Ticket | Status |
|---|---|---|---|
| Reconcile `open-items.yaml` OI-22 duplication between PR #35 (adds OI-21/22/23, OI-22 left `open`) and PR #36 (recreates OI-22 as `done`) once both merge to `main` — keep the `done` version, verify no other ID collisions | user | merge-time manual reconciliation | open |
| Decide whether/when to merge PR #35 (`feat/init-prepare-interop`, still open) and PR #36 (`feat/manifest-id-parser-hardening`) | user | PR #35 / PR #36 merge decision | open |
| Audit `package.json`'s other `npm run *:test` scripts for the same CI-unenforced gap found in `conformance:test` (only `violations:test` was wired into `ci.yml` before this chain) | user/agent | new brief, if any gap is found | open |
| Consider adding "verify a fix's boundary with a before/after comparison before implementing" as an explicit step in `lifecycle-build`'s Workflow section, per this chain's Phase 3/Phase 6 pattern | user/agent | skill/template improvement | open |
| Continue OI-21 (init-as-scaffold-only + TUI questionnaire spike) — still awaiting the user's decision on the 3 open questions in the WP-R9 Notion spike page; not touched by this chain | user | brief (after spike decision) | open |

## Raw Session Entry

See `workflow/learnings/sessions/2026-07-18-manifest-id-parser-hardening.md`.

## Architecture Notes

- role: Project Manager
- decision: Recreated OI-22 in this branch's `open-items.yaml` (marked `done`, sourced from
  the brief's own quoted original text) rather than leaving it absent, since this chain's own
  origin should be traceable in its own branch's ledger even though the "real" OI-22 entry
  lives on an unmerged sibling branch. Flagged the resulting duplication explicitly as a
  Follow-Up rather than silently hoping git merge resolves it correctly.
- decision: Numbered this chain's genuinely new follow-ups starting at OI-24, deliberately
  skipping OI-21/23 (known to be used by the still-unmerged PR #35) to reduce collision risk at
  merge time — this is a best-effort avoidance, not a guarantee, since this branch cannot see
  PR #35's actual current content.
- constraint: This reflection cannot verify PR #35's exact current open-items.yaml content
  (different branch, not fetched/inspected) — the OI-21/22/23 numbering assumption comes from
  this session's own conversation history, not from reading that branch's file directly. Flag
  this explicitly rather than presenting it as verified.
- downstream: The next chain to touch `open-items.yaml` after either PR merges should first
  check for duplicate IDs before adding anything new.

## Exit Gate

- [x] Manifest Coverage Retrospective has one row per active R and RI.
- [x] Every follow-up has a named owner and suggested artifact title.
- [x] Learning candidates tagged propose-only.
- [x] `orchestration.status: done`, `next_phase: done`.
