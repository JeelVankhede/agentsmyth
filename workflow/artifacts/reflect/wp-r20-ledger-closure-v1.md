---
slug: wp-r20-ledger-closure
version: 1
artifact: reflect
status: done
created: 2026-09-14
updated: 2026-09-14
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8]
upstream:
  - workflow/artifacts/briefs/wp-r20-ledger-closure-v1.md
  - workflow/artifacts/plans/wp-r20-ledger-closure-v1.md
  - workflow/artifacts/tasks/wp-r20-ledger-closure-v1.md
  - workflow/artifacts/reviews/wp-r20-ledger-closure-v1.md
  - workflow/artifacts/verify/wp-r20-ledger-closure-v1.md
  - workflow/artifacts/ship/wp-r20-ledger-closure-v1.md
orchestration:
  phase: reflect
  status: done
  next_phase: done
  blockers: []
  user_checkpoint: none
---

# WP-R20 — Open-Items Ledger Closure Lifecycle - Reflect

## Inputs

Full chain for `wp-r20-ledger-closure-v1`: brief (approved at brief-review), plan (approved at
plan-review, amended twice), task (seven phases), review (`pass-with-risk`, 3 findings all resolved),
verify (`ship`, 15 pass / 1 partial), ship (`ship`, approved at ship-review for the decision and
transition only).

## Outcome

The open-items ledger is now two files. The live one holds 25 unresolved items at 28,102 bytes, down
from 95 items at 95,802 — **a 70.7% cut in what every Reflect re-reads**, which was the entire point.
The 70 closed items are in `workflow/artifacts/open-items-archive.yaml`, which no phase reads for work.
Closure has declared fields (`resolution`, `closed_in_run`), the item object is closed so the next
undeclared key fails instead of accumulating to 40, and `check-open-items` reads both files because the
failures that matter — copied-not-moved, an ID reused across the split, an unresolved item parked where
nothing reads it — are invisible from either one alone.

**Nothing has been committed, pushed, merged or released.** The ship-review approval covered the ship
decision and the transition to Reflect. All four outward actions remain open and are carried below.

The shape worth recording: this package was specified in full before it started, and the specification
was wrong in one load-bearing place. The page said segment the archive by year, by `closed_in_run`'s
year. `closed_in_run` is a slug-vN and there is no date anywhere in the ledger schema. A complete,
carefully-reasoned spec can contain a mechanism that cannot execute, and the only thing that catches it
is reading the data the mechanism would run on.

## What Worked

- **Reading the repo before the page.** The decisive finding took twenty minutes: WP-R22 had already
  shipped `finding-quality-archive.yaml` — flat file, second `kind` in the same schema's enum, one
  validator reading both with rotation checked in both directions. `check-finding-quality.mjs` was very
  nearly the blueprint. Following the precedent meant no new schema file, no `schemaRegistry()` change,
  and a validator shaped like one that already works.
- **Measuring before tightening.** The precedent conditionally requires closure fields on closed rows and
  the engine supports it. Measuring first: 39 of 70 `done` items have a `resolution` and **31 do not**.
  Requiring it would have failed 31 honest historical entries on a rule none could retroactively satisfy.
  The count is now in the schema description so a later reader does not "fix" it back.
- **Probing whether a new assertion can fail.** Phase 1's gate reported `check-open-items: ok` and was
  worthless — run bare, the validator resolves schemas from `definitions_root`, so it validated the real
  ledger against the *global* install, confirmed still pre-edit. Only a deliberate probe with an
  undeclared key exposed it. The R23 chain recorded this exact lesson; applying it is what caught this.
- **Inspecting all 24 cases, not the three that were wrong.** The split marker matched `Done` used as a
  Notion status value. Re-inspecting every boundary rather than the failing ones is what then caught the
  *second*, independent error: the trim was dropping the full stop on 21 of 24 entries.
- **Reconstructing rather than spot-checking.** The no-loss check rebuilds the original from both files
  using the repo's own parser and asserts character equality per split. It reports **0 characters
  consumed**. A spot-check of a few entries would have passed over both split bugs.
- **Deriving the ratchet baseline from the tool's own output.** The baseline was written by parsing the
  audit log and asserting the derived totals equal the `0/226` line the audit printed itself — because
  `CLAUDE.md` records a count that drifted four times through nothing deriving it. It confirmed the
  earlier surgical edit independently: `entries changed: none`.

## What Did Not Work

- **The first phase gate measured the wrong tree, and the gate could not have told me.** Recorded above
  under What Worked because the probe caught it; recorded here because the gate was written, run, and
  passed while proving nothing. `AGENTSMYTH_WF=src/workflow` produces a *different* meaningless pass
  ("no open-items.yaml"). Two plausible invocations, two green results, neither about the edit.
- **The plan's Phase 6 Touches said "`SKILL.md` + both references".** Two real files named in prose
  rather than as paths, which `check-scope-fence` correctly could not resolve. The existing fence rule
  checks each declared path *is* a real path; this was the inverse hole — a real file no declared path
  names.
- **Review found a surface the sweep missed, and the miss was self-inflicted.** `lifecycle-ship` step 4b
  tells agents to grep `OI-<n>` for duplicate IDs. This chain is what made that grep incomplete, and the
  chain that created the hazard is the one that failed to update the instruction guarding against it.
  The earlier `grep open-items` had matched the file on an unrelated line, so it read as already swept.
- **`check-waivers` rejected this chain's own prose twice**, once for quoting a schema enum description
  and once for a sentence whose entire content is that there are no waivers. Both worked around by
  rewording an artifact to satisfy a heuristic rather than to say something truer.
- **Estimating fixture count in the plan.** The plan said four; the code needed five, because writing the
  validator split the cross-file clash into two genuinely distinct diagnoses. Harmless, but the ratchet
  determines that number and the plan cannot.

## Surprises

- **The drift had nearly doubled since it was documented.** The page recorded the undeclared `resolution`
  key as one defect on OI-23. `finding-quality.schema.yaml` later recorded 22 — and named this exact file
  as the cautionary example while closing its own object. It was **39 of 92** by the time this chain
  measured it. A defect described in prose in a shipped schema, by an author who understood it precisely,
  still grew by 77% before anyone acted.
- **The engine's compatibility escape hatch does not cover the boolean form.** `x_enforcement:
  warn-until-<version>` exists for precisely the upgrade break that closing an object causes, and it is
  honoured only on a *schema-valued* `additionalProperties`. So the one hardening in this change that
  could break a consumer is the one that cannot be softened.
- **`Done` is not a closure marker in this ledger.** Three entries use it as a Notion status *value* —
  "update the page status to Done, with PR #42 link, once merged" — which is an action, not a closure.
  The word that looks most like the signal was the false one.

## Manifest Coverage Retrospective

| Manifest ID | Outcome | Evidence path | Notes |
|---|---|---|---|
| R1 | shipped | `workflow/artifacts/verify/wp-r20-ledger-closure-v1.md` | Live ledger holds no `done` item. |
| R2 | shipped | same | Flat archive per Q1, superseding the page's yearly directory. |
| R3 | shipped | same | `resolution` + `closed_in_run` declared; object closed at both levels. |
| R4 | shipped | same | Sweep in Workflow and Exit Gate; never-sets-`status` asserted at three sites. |
| R5 | shipped | same | Two-file validator; 5 rejection fixtures, 1 positive control. |
| R6 | shipped | same, `## Manual QA` | 70 moved, 0 lost, 0 characters consumed. |
| R7 | shipped | same | Seven surfaces; the seventh found by Review. |
| R8 | shipped | same | OI-93/94/95 filed; OI-95 as `source: requirement`. |
| RI1 | shipped | same | One schema, two-value `kind`; 12 schema files, unchanged. |
| RI2 | shipped | same | 221 → 226 rules, 0 undefended, nothing regressed. |
| RI3 | shipped | same | Both configured commands plus the manual item. |
| RI4 | shipped | same | No new `*:test` script. |
| RI5 | **partial** | same, review finding F2 | The one requirement not fully met: closing the object is a tightening. Documented in `CHANGELOG.md`, owner user, does not block ship. |
| RI6 | shipped | same | Archive-holds-closed-only is mechanical. |
| RI7 | shipped | same | Build-synced schema identical; bundle carries the change 15×. |
| RI8 | shipped | same | CHANGELOG entry; date untouched; no version bump. |

Fifteen shipped, one partial, none blocked, none waived, none dropped.

## Deferred

- **RI5's remaining fraction** — an upgrade rehearsal against a real consumer ledger carrying an
  undeclared key other than `resolution`. No such ledger exists to test against, so the check is recorded
  as skipped with all six fields in the verify artifact rather than performed. Owner: user, at release.

## Source-of-Truth Outcome

`not applicable`. `source-of-truth.yaml` declares `mode: optional` with `providers: []`, so no external
source held authority and no update was owed.

Two updates are nonetheless owed to the Notion WP-R20 page and both are user actions: moving the row to
Done, and recording that Q1 superseded the page's R2. The page still specifies a yearly archive directory
that this chain deliberately did not build, so leaving it unamended leaves the durable record stating a
design that was considered and rejected on evidence.

## Learning Candidates

- **Candidate learning**: a complete, internally consistent specification can contain a mechanism that
  cannot execute. Before building to a spec, read the data its mechanism would run on — this one said
  segment by `closed_in_run`'s year, and no date exists anywhere in the schema. — source: `workflow/artifacts/briefs/wp-r20-ledger-closure-v1.md` — propose-only.
- **Candidate learning**: in a repo with a two-root resolver, running a validator bare validates against
  the *global* definitions, not the source being edited. A green result from `node …/check-<x>.mjs` after
  a schema change means nothing; `AGENTSMYTH_HOME=<source>` is the override that moves definitions while
  leaving data in place, and `AGENTSMYTH_WF` moves both and produces a different false pass. — source: `workflow/artifacts/tasks/wp-r20-ledger-closure-v1.md` — propose-only.
- **Candidate learning**: before adding a constraint the precedent suggests, measure the corpus it will
  apply to. A conditional requirement modelled on a sibling schema would have failed 31 existing entries
  on a rule none of them could satisfy. — source: `workflow/artifacts/tasks/wp-r20-ledger-closure-v1.md` — propose-only.
- **Candidate learning**: when a matching boundary is corrected, re-inspect every case rather than the
  failing ones. Re-reading all 24 split boundaries after fixing three is what surfaced a second,
  independent defect that the first fix did not touch. — source: `workflow/artifacts/tasks/wp-r20-ledger-closure-v1.md` — propose-only.
- **Candidate learning**: for a data migration, verify by reconstructing the original from the outputs and
  asserting equality, not by spot-checking entries. Reconstruction catches a systematic off-by-one-character
  loss that no sample of entries would reveal as wrong. — source: `workflow/artifacts/verify/wp-r20-ledger-closure-v1.md` — propose-only.
- **Candidate learning**: a chain that changes how a shared identifier space is stored must grep for
  instructions that *search* that space, not only for documents that describe it. — source: `workflow/artifacts/reviews/wp-r20-ledger-closure-v1.md` — propose-only.
- **Candidate learning**: derive recorded counts from tool output rather than transcribing them, and assert
  the derived total against the total the tool printed itself. — source: `workflow/artifacts/tasks/wp-r20-ledger-closure-v1.md` — propose-only.

## Follow-Ups

| Action | Owner | Suggested Artifact Or Ticket | Status |
|---|---|---|---|
| Commit the working tree on `feat/wp-r20-ledger-closure` | user | Ship artifact Blocked Handoff #1 | open |
| Push the branch | user | Ship artifact Blocked Handoff #2 | open |
| Open a PR into `release/1.1.0` (never `main`) — check PR #68's state first; if it has merged, rebase rather than stack | user | Ship artifact Blocked Handoff #3 | open |
| Move the Notion WP-R20 row to Done, and record that Q1 superseded the page's R2 — the page still specifies a yearly archive directory that was deliberately not built | user | Ship artifact Blocked Handoff #4 | open |
| Narrow `check-waivers`'s unstructured-claim heuristic: it rejected this chain's prose twice, once for quoting a schema enum description and once for a sentence asserting that there are no waivers | workflow owner | new open item | open |
| Make a bare validator invocation in this repo either resolve the source or say which definitions root it used — `validators/README.md` documents the bare form, which silently validates against the global install | workflow owner | new open item | open |
| Fix or widen the `schema_globs` trigger category: it is `**/schema/**` and does not match this repo's own `src/workflow/schemas/`, so `data-schema-designer` is mechanically false for every schema change agentsmyth makes to itself | workflow owner | new open item | open |
| Reassess `closed_in_run`'s migration value once entries closed under the new contract accumulate — 65 of 70 backfilled items are `unrecorded`, so the field is currently unproven | workflow owner | new open item | open |
| Watch for a consumer hitting RI5's tightening on upgrade (an undeclared key other than `resolution`) | user | Deferred, above | open |

## Raw Session Entry

See `workflow/learnings/sessions/2026-09-14-wp-r20-ledger-closure.md`.

## Architecture Notes

- role: Project Manager
- **decision**: recording the archive-shape divergence as a *specification* defect rather than a scope
  disagreement. The page's mechanism could not run on the data it named; that is a different thing from a
  preference, and filing it as a preference would have lost the reason.
- **decision**: RI5 recorded as `partial` at every phase that touched it — review, verify, ship and here —
  rather than as `shipped` with a footnote. The requirement said no-op upgrade; the outcome is
  no-op-with-one-exception, and the four artifacts agree on that wording.
- **constraint**: nothing in this chain was committed. Every follow-up that moves code is owned by the
  user and none was inferred from the ship-review approval, which was explicitly scoped to the decision
  and the phase transition.
- **downstream**: this Reflect is the first run of `follow-up-owner-assigner` under the contract this
  chain amended. Its sweep step found nothing to rotate — the live ledger holds 25 items, none `done` —
  which is the correct result and is reported as `items_swept: 0` rather than omitted, so "swept nothing"
  stays distinguishable from "did not sweep". R4's rotation path therefore remains unexercised against
  real closure and will not be until a later chain closes an item.

## Exit Gate

- [x] Manifest Coverage Retrospective has one row per active R and RI — 16 rows.
- [x] Every follow-up has a named owner and suggested artifact or ticket — 9 rows, none `TBD`.
- [x] Learning candidates tagged propose-only — 7.
- [x] `follow-up-owner-assigner` run: four new items filed, sweep executed with nothing to rotate.
- [x] Raw session written, append-only, Curator Marks empty.
- [x] `orchestration.status: done`, `next_phase: done`.
