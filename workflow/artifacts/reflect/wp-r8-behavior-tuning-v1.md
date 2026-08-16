---
slug: wp-r8-behavior-tuning
version: 1
artifact: reflect
status: done
created: 2026-08-15
updated: 2026-08-15
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9]
upstream:
  - workflow/artifacts/briefs/wp-r8-behavior-tuning-v1.md
  - workflow/artifacts/plans/wp-r8-behavior-tuning-v1.md
  - workflow/artifacts/tasks/wp-r8-behavior-tuning-v1.md
  - workflow/artifacts/reviews/wp-r8-behavior-tuning-v4.md
  - workflow/artifacts/verify/wp-r8-behavior-tuning-v2.md
  - workflow/artifacts/ship/wp-r8-behavior-tuning-v1.md
orchestration:
  phase: reflect
  status: done
  next_phase: done
  blockers: []
  user_checkpoint: none
---

# WP-R8 — Per-Repo Behavior Tuning - Reflect

## Inputs

- Full chain: brief v1, plan v1, task v1 (19 build phases), reviews v1–v4, verify v1–v2, ship v1.
- Brief IDs: 8 `R`, 9 `RI`, 4 `A`, 3 `Q`.
- Ship recommendation `ship`, checkpoint `ship-review` approved 2026-08-15.
- PR #62 against `release/1.1.0`; commits `ffdefbc`, `36e3ff8`, `cab0f2a`.
- Phase gate `agentsmyth check --phase reflect` → exit 0.

## Outcome

**Shipped into PR #62, not merged and not released.** All 17 requirements implemented, verified,
committed, and pushed. `release/1.1.0` is now a shared remote ref; the merge to `main` and the
1.1.0 release itself are release-level work that outlives this package.

- **Release status:** not applicable at work-package level. `release.required: false`; no version
  bump, tag, or publish. 1.1.0 releases as a whole.
- **Source-of-truth status:** **updated.** Four corrections applied to the WP-R8 Notion page on
  user request and verified by re-fetch — `Class` Standard→Complex, the allowlist's home corrected
  from `check-config.mjs` to `repo-profile.schema.yaml`, a sixth tunable added, and an intent-layer
  section that did not exist. The `PR` property now carries the PR URL.
- **Rollback status:** defined, not exercised. Trigger is a previously-valid consumer config
  failing `check-config` after upgrade; action is reverting the WP-R8 commits on `release/1.1.0`
  before it reaches `main`. The change is additive — no new required field, no existing key's
  meaning altered — so a revert cannot strand a config that already validated.
- **Waivers:** none. No requirement was deferred, blocked, or waived.

The shape of the work is worth recording: 19 build phases, of which **7 were fixes to findings
raised by later phases in this same chain** (13–17 from Review, 18 from Test, 19 from Ship). The
gate did the job it exists to do, repeatedly, and mostly against my own work.

## What Worked

- **Mutation testing as the standard of proof for a coverage fix.** Verify v2's MQ-6 removed the
  three `mergeTunedMap` calls and showed `npm run validate` and `violations:test` staying green
  while only the new assertions dropped, with the untuned control holding in both columns. A new
  test that passes proves nothing; a new test that fails when the thing it guards is broken proves
  the gap is closed. The same discipline appeared at F1 (`m2`/`m8` verified against the pre-fix
  spread) and F9 (96/0/0 vs 95/1/1).
- **Testing the packed tarball rather than the working tree.** `npm pack` then install into a
  throwaway repo under a sandboxed `$HOME` is what made R7, R8, and RI9 real evidence instead of
  inference. It also surfaced something invisible from inside the repo: `agentsmyth check` never
  invokes `check-config` on the consumer surface, which is what bounds the deprecation window's
  risk.
- **Sandboxing `$HOME` instead of skipping the global-install tests.** `prepare` writes to
  `homedir()` unconditionally and would have overwritten the developer's real `~/.agentsmyth` and
  five tools' global config. Verifying the sandbox assumption *before* relying on it, then
  confirming the real install's mtimes afterwards, turned an untestable phase into evidence.
- **The baseline ratchet as an answer to inherited debt.** 96 pre-existing violations neither
  blocked the wiring nor were blessed into the contract. One exact file-and-message pair per entry,
  stale entries are errors, so the list can only shrink — and none of this chain's own artifacts
  are in it, verified by grep.
- **Diagnosing causes rather than symptoms.** F7 was filed as a missing check; investigation found
  `check-artifacts.mjs` had never been invoked against real artifacts at all. S1 was filed as "the
  ship artifact won't validate"; it was a validator reading the oldest review.

## What Did Not Work

- **I closed my own review.** Four review rounds, all self-authored, with the final round raising,
  fixing, and closing F9 in one pass. Two rounds genuinely held, which argues against pure
  rubber-stamping, but there was no independent check on the last one — and it shipped with an
  unproven assumption (see below) that only surfaced because the user pushed back.
- **Verify v1 shipped a confident, wrong root-cause analysis.** T1 was diagnosed as `_dataRoot`
  being redirected by `AGENTSMYTH_WF`, with a recommendation to decouple the two roots. That would
  have changed the most load-bearing file in the package to fix nothing. The validator is invoked
  under `AGENTSMYTH_HOME`, not `AGENTSMYTH_WF`. Three variant invocations were tried; the one
  command that settles it — full `npm run validate` with a `tuning:` block actually present — was
  not run until Build re-entry.
- **Review v4 closed with an assumption it had assigned to Test, unverified.** It stated Test
  "must verify" that `validate` fails on a broken artifact from this chain, then recommended
  `pass`. The check took two minutes when finally run. Naming a verification and not doing it is
  weaker than not naming it, because the name creates the impression of coverage.
- **Late-phase fixes need a plan amendment, and that was discovered by failing.** `check-scope-fence`
  resolves declared `Touches` from the plan's `### Phase N` blocks, so recording Phases 17–19 in
  the task alone left new files outside declared scope. Not a defect — but not documented anywhere
  a Build re-entry would look.
- **Blocker/recommendation coupling was got wrong first.** The ship artifact listed the pending
  checkpoint as an `orchestration.blockers` entry while recommending `ship`, which
  `check-release-readiness` correctly rejects as self-contradictory. The checkpoint is enforced
  separately and more precisely by `check-lifecycle --phase reflect`.

## Surprises

- **The chain could not ship itself.** `check-release-readiness.mjs` cross-checked
  `reviewCandidates[0]` — always the *oldest* review, since `listFiles` returns sorted paths. Any
  chain whose first review raises a P1 is permanently unshippable however completely that P1 is
  later fixed, because the validator never reads the review recording the fix. The only workaround
  was editing a historical review to insert a `(fixed)` marker: rewriting the record to satisfy a
  check pointed at the wrong file. Four review versions is apparently rare enough that this had
  never fired.
- **A stale global install misled the agent mid-chain, which is the exact problem this package
  fixes.** Verify v1 recorded the Test skill's Skipped Checks starter block as a 5-column/6-column
  source defect. The source has six; the five-column version was in a **v1.0.0
  `~/.agentsmyth`**. WP-R8 built skew reconciliation while being actively misled by skew.
- **OI-63 is closed but only half-fixed.** It tracked two starter-block/validator mismatches and
  was closed as "promoted to WP-R19." The Test half (`manifest_ids` column) has since been fixed in
  `src` independently; the Plan half — `## Assumptions Verified`, which `check-assumptions` requires
  when a brief declares `A` IDs — is **still missing** from
  `src/workflow/skills/lifecycle-plan/references/output-schema.md`. Confirmed by grep this phase.
  WP-R19 still has real work, and an item closed as "scheduled elsewhere" hid that half of it had
  been solved by a different route.
- **`check-trigger-predicates.mjs` contains 8 NUL bytes** — deliberate `\0DOUBLESTAR\0` sentinels
  in `globToRegex`. Harmless at runtime, but `grep` classifies the file as binary and silently
  returns nothing without `-a`, which cost real time during Test.

## Manifest Coverage Retrospective

| Manifest ID | Outcome | Evidence path | Notes |
|---|---|---|---|
| R1 | shipped | `workflow/artifacts/verify/wp-r8-behavior-tuning-v2.md` | `tuning:` block, six keys, closed objects. |
| R2 | shipped | `test/fixtures/lifecycle-violations/w-tuning-unknown-key/` | Enumeration in the schema only (Q1). |
| R3 | shipped | `test/fixtures/lifecycle-violations/y-tuning-looser-value/` and the checkpoint-omission fixture | Stricter-or-unchanged; union for checkpoints. |
| R4 | shipped | `workflow/artifacts/verify/wp-r8-behavior-tuning-v2.md` MQ-3 | `required:` untouched — the minor-bump guarantee. |
| R5 | shipped | `test/fixtures/lifecycle-violations/aa-intent-floor-constraints/`, `ab-intent-floor-alignment/` | Intent layer; both floors schema-enforced. |
| R6 | shipped | `test/run-tuning-merge-tests.mjs` m9 | Thresholds split out; predicates symbolic. |
| R7 | shipped | `workflow/artifacts/verify/wp-r8-behavior-tuning-v2.md` MQ-1 | PS-1…PS-11 on fresh bootstrap, real tarball. |
| R8 | shipped | `workflow/artifacts/verify/wp-r8-behavior-tuning-v2.md` MQ-2 | Skew appends PS-9/10/11, idempotent, non-blocking. |
| RI1 | shipped | `workflow/artifacts/verify/wp-r8-behavior-tuning-v1.md` Architecture Notes | Consumption points; grep correction recorded. |
| RI2 | shipped | `workflow/artifacts/verify/wp-r8-behavior-tuning-v2.md` MQ-6 | Mutation-tested. Held Ship for one round. |
| RI3 | shipped | `workflow/config/artifact-baseline.yaml` | Ratchet at 96/0/0; fires on this chain's own brief. |
| RI4 | shipped | `test/run-violation-tests.mjs` | 29/29. |
| RI5 | shipped | `test/fixtures/lifecycle-violations/x-tuning-locked-key/` | Locked set unreachable. |
| RI6 | shipped | `src/setup/references/config-map.md` | 69 field refs schema-checked; Notion now current too. |
| RI7 | shipped | `test/fixtures/lifecycle-violations/aa-intent-floor-constraints/` | Floors on both concerns. |
| RI8 | shipped | `test/fixtures/lifecycle-violations/ac-intent-stale-provenance/` | Derived-vs-explicit provenance. |
| RI9 | shipped | `workflow/artifacts/verify/wp-r8-behavior-tuning-v2.md` MQ-3 | Absence resolves from global; back-compat holds. |

17/17 shipped. None deferred, blocked, or waived.

## Deferred

Nothing from the manifest was deferred. Four items are accepted residual risk, carried into
Follow-Ups with owners:

- 96 grandfathered artifact violations — visible, ratcheted, unowned.
- `lifecycle-artifact.schema.yaml` still unwired; its 16 section requirements remain unenforced.
- No live consumer has upgraded from a genuinely *published* 1.0.0 tarball.
- The `warn-until-1.2.0` deprecation window has no expiry mechanism.

## Source-of-Truth Outcome

**updated.** Four corrections applied to the WP-R8 Notion page
(`https://app.notion.com/p/3a1972bdebbb81fdad2cee228a1ec707`) on explicit user request, satisfying
`require_user_request_or_config_for_external_write: true`, and each verified by re-fetching the
page rather than trusting a success response. Notion remains unconfigured in
`source-of-truth.yaml` (`providers: []`), so this was never a required gate — the page was simply
wrong, in two more ways than the running list had tracked.

The `Notes` property was deliberately left carrying its original Think-phase framing; it records
how the task was set, not where the allowlist ended up. The `Status` property was left at
🟡 Ready — the allowed values were unknown and guessing on a tracking field is worse than leaving
it for the owner.

## Learning Candidates

- **Candidate learning**: A test written to close a coverage finding must be mutation-tested before
  the finding is marked resolved — break the thing it guards and confirm the new assertion fails
  while the pre-existing suite stays green. A passing new test is evidence of nothing; the pre-fix
  failure is the evidence. Applies equally to a fixture, a unit assertion, and a validator wiring —
  source: `workflow/artifacts/verify/wp-r8-behavior-tuning-v2.md` MQ-6 — propose-only.
- **Candidate learning**: Before proposing a fix to shared infrastructure on the strength of a
  diagnosis, run the exact command the real gate runs, in the real configuration, with the
  triggering condition actually present. Verify v1 tried three variant invocations of a validator
  and concluded the root resolver was broken; one run of `npm run validate` with a `tuning:` block
  present falsified that in a single step and reduced the fix from a change to `lib.mjs` to a
  missing fixture — source: `workflow/artifacts/verify/wp-r8-behavior-tuning-v2.md` Findings —
  propose-only.
- **Candidate learning**: When a validator selects one artifact from a versioned set, it must
  select the newest, matching how the rest of the lifecycle resolves upstream artifacts. Taking the
  first sorted candidate silently means the oldest, and for any cross-check on findings-since-fixed
  that makes a chain permanently unshippable once its first round raises a P0/P1. Audit remaining
  validators for `candidates[0]` on a `-v<N>` set — source:
  `src/workflow/validators/check-release-readiness.mjs`, WP-R8 Ship S1 — propose-only.

## Follow-Ups

| Action | Owner | Suggested Artifact Or Ticket | Status |
|---|---|---|---|
| Assign an owner and a schedule to the 96 grandfathered artifact violations, or explicitly accept them as permanent. Two shapes dominate: `status: complete` where the enum allows only `done` (42), and type drift in `upstream`/`user_checkpoint` (16). | user | OI-65 — Grandfathered artifact-violation debt (96) | open |
| Audit remaining validators for `candidates[0]` selection over a versioned artifact set; S1 is unlikely to be the only instance. | workflow owner | OI-66 — Validator version-selection audit | open |
| Add `warn-until-<version>` marker removal to the 1.2.0 release checklist; nothing fails when 1.2.0 ships with markers present. | user | OI-67 — Expire the deprecation window at 1.2.0 | open |
| Reopen the Plan half of OI-63: `## Assumptions Verified` is still missing from the Plan starter block. The Test half was fixed in `src` by another route; WP-R19's remaining scope is smaller than its description implies. | workflow owner | OI-68 — WP-R19 residual scope (Plan starter block only) | open |
| Exercise a real upgrade from a published 1.0.0 tarball before 1.1.0 ships; the current evidence simulates 1.0.0 by editing a 1.0.1 repo down. | user | OI-69 — Real 1.0.0→1.1.0 upgrade rehearsal | open |
| Correct `CLAUDE.md`'s "all 4 fixtures" line — the violation suite is now 29. | workflow owner | OI-70 — Stale fixture count in CLAUDE.md | open |
| Consider wiring `lifecycle-artifact.schema.yaml`, whose 16 section requirements remain unenforced and which is the only consumer of the newly-implemented `if`/`then`. | workflow owner | OI-71 — Wire lifecycle-artifact.schema.yaml | open |
| Replace or comment the `\0DOUBLESTAR\0` NUL sentinels in `globToRegex`; they make `grep` treat the file as binary and return nothing without `-a`. | workflow owner | OI-72 — NUL sentinels break grep on check-trigger-predicates | open |

## Raw Session Entry

See `workflow/learnings/sessions/2026-08-15-wp-r8-behavior-tuning.md`.

## Architecture Notes

- role: Project Manager
- **decision — record the six-instance defect class as six, not seven.** Verify v1 counted T1 as a
  seventh instance of "something written to enforce a contract, wired to nothing." On the corrected
  analysis it is not: the code was wired and reachable, only untested. That is a coverage gap, a
  milder and different thing. The six are `maximum`, schema-valued `additionalProperties`,
  `if`/`then`, `format`, and `x_enforcement` (declarations that did nothing), plus `check-artifacts`
  (a validator wired nowhere). Inflating the count would have blurred the lesson.
- **constraint — three of this chain's four biggest findings were about the checking layer, not the
  feature.** F7, T1, and S1 were all "the thing that was supposed to catch this wasn't running, or
  was running against the wrong input." The feature code was comparatively uneventful. For a
  package whose entire product *is* a checking layer, that ratio is the signal worth carrying.
- **tradeoff — the learning candidates are deliberately narrow.** Broader versions ("verify before
  concluding") are true and useless. Each is stated as a rule with a trigger and a check, so a
  future agent can tell whether it applies.
- **assumption future runs should verify:** that `scripts/` and `test/` stay out of `package.json`
  `files`. S1's bounded severity and F7's blast-radius conclusion both rest on the first; the
  second keeps the new fixtures out of the tarball.
- **downstream:** WP-R19's scope is now smaller than its description (see OI-68). The
  version-selection bug class (OI-66) may affect other validators. The intent layer means future
  work packages touching `agent-behavior.yaml` must ask whether a new field is tunable, locked, or
  derived — a question that did not exist before this package.

## Exit Gate

- [x] Manifest Coverage Retrospective has one row per active R and RI — 17/17.
- [x] Every follow-up has a named owner and suggested artifact title — 8 items, OI-65…OI-72.
- [x] Learning candidates tagged propose-only — 3.
- [x] Raw learning session written, Curator Marks empty.
- [x] No curated learning file edited — curation not requested.
- [x] orchestration.status: done, next_phase: done.
