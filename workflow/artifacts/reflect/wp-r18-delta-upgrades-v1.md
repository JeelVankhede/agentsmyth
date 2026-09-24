---
slug: wp-r18-delta-upgrades
version: 1
artifact: reflect
status: done
created: 2026-09-24
updated: 2026-09-24
manifest_ids: [R1, R2, R3, R4, R5, R6, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9, RI10, RI11, RI12, RI13, RI14, RI15, RI16, RI17, RI18, RI19, RI20, RI21]
upstream:
  - workflow/artifacts/briefs/wp-r18-delta-upgrades-v1.md
  - workflow/artifacts/plans/wp-r18-delta-upgrades-v1.md
  - workflow/artifacts/tasks/wp-r18-delta-upgrades-v1.md
  - workflow/artifacts/reviews/wp-r18-delta-upgrades-v1.md
  - workflow/artifacts/verify/wp-r18-delta-upgrades-v1.md
  - workflow/artifacts/ship/wp-r18-delta-upgrades-v1.md
orchestration:
  phase: reflect
  status: done
  next_phase: done
  blockers: []
  user_checkpoint: none
---

# WP-R18 Version-Aware Delta Upgrades - Reflect

## Inputs

The full chain: brief (2 council rounds, 120 findings), plan (13 phases — ten approved, three
appended as disclosed remediation), task, review (12 members, 3 rounds, 77 findings, `hold`),
verify (`ship`, after returning `hold` once), ship (PR #72). Plus `open-items.yaml`,
`finding-quality.yaml` and its archive, and the two Notion pages corrected at Ship.

## Outcome

Shipped as PR #72 against `release/1.1.0` — 21 commits, open and unmerged. 26 of 27 manifest IDs
shipped, 1 partial (RI18), 0 deferred, 0 blocked, 2 findings waived by ID with owners.

The feature does what the brief asked: a consumer repo can now be brought current without either
losing the user's edits or re-flagging every file on every upgrade. Verified against the actually
published 1.0.1 tarball rather than a repo edited backwards into the old shape.

What it cost is the more useful number. **Four separate defect-finding passes fired after Build
declared itself complete**, and each one found real defects the previous pass had certified:

| Pass | Found | Where the previous pass had signed off |
|---|---|---|
| Think round 2 (post-Build) | 2 release-blockers | Build exit gate met |
| Review council | 77 findings, 6 P0 | Build complete, 51/51 green |
| Test | 2 defects in the Review remediation | Review remediation "pinned by tests" |
| Live use (the user) | 2 more, in marker-bounded writers | Test signed `ship` |

That is not a story about one weak phase. It is the same failure four times, and naming it is the
main thing this chain has to hand forward.

## What Worked

- **The revert probe.** Every P0/P1 fix was verified by reverting *that fix alone* in a throwaway
  package copy and confirming a named assertion goes red. Twelve for twelve. It caught three of my
  own tests passing for the wrong reason — X2 never reached a write, X3 was vacuously true, Y3
  asserted "kept OR cleaned up" which passes either way. Inspection had not caught any of them.
- **The published-tarball rehearsal.** `npm pack @jeelvankhede/agentsmyth@1.0.1`, bootstrap, install
  the candidate over the top. This is where the day-one adopt path and the skew fix met a genuinely
  old repo. A synthesised manifest state would have proved much less.
- **Reimplementing the check independently.** R1's digests were recomputed from the schema's declared
  normalization rule rather than by calling the CLI's own `digestFile()`. Re-using it would only have
  proved the CLI agrees with itself.
- **The council's adversarial challengers.** C-CODE and C-EVID refuted one framing (F-CON2's guard is
  not uniformly blind), recalibrated two severities, and *proved* F-VERIF3 by trial rather than
  accepting it. A challenger charged to refute is worth more than another finder.
- **The gates refused things they should have refused.** The Test entry gate blocked on a review
  artifact whose `user_checkpoint` had no `## Checkpoint Approval` section. The ship gate blocked on
  five pending finding-quality rows. Neither was worked around.

## What Did Not Work

- **A phase that performs work and records its own success will record success.** Review closed 72
  ledger rows `proved-real` with the resolution "Remediated in Build Phase 12". Test then proved two
  of the underlying fixes did not work. The verdicts were right; the resolutions asserted a working
  fix roughly a day before one existed, and the archive is append-only so nothing can correct them.
- **Three of this chain's defects were the same wrong-path error at three levels**, each invisible
  from inside its own layer: the product probed for a `package.json` that only exists in `src/`; the
  unit test ran the validator from `src/`, so 20/20 was green over dead code; and my revert probe
  reverted `src/` without rebuilding `dist/`, so it reported a real fix as unpinned. A test that runs
  its subject from a location the product never uses can be green and mean nothing.
- **Two bugs reached the user that no suite could have caught**, because every fixture seeded an
  empty or unrelated file: `AGENTS.md` duplicated its own block when the body was already present
  unmarked, and `prepare` appended a blank line to the global config on every run — one real install
  had accumulated 34. Both are marker-bounded writers that do not normalise what they preserve.
- **I kept reporting `prepare` as "un-run" instead of observing it.** The user had to say so
  directly. The sandbox observation that followed produced the first evidence that the adapter-gate
  fix reaches an installed file, and the diff it produced is what exposed the blank-line bug. The
  deferral was not caution; it was an unexamined habit.
- **Phase boundaries were run backwards once and not recorded as such.** A post-Build verification
  pass was logged as round 2 of the *Think* council, which `lifecycle-think/SKILL.md` forbids, while
  the Build task's Dispatch Log read `none` for the same window.
- **Requirements were wrong in ways acceptance criteria could not see.** RI5 said "five states, never
  two" and the code implemented six. RI1 claimed additive-only and one enum widening is not. RI20
  named two deletion triggers without ordering them, and they collided into a data-loss path.

## Surprises

- **The Review council's most severe finding needed no attacker and one keystroke.** Re-running
  `init` — the only pre-1.1 update instinct anyone has — silently laundered a user's edits into
  "agentsmyth wrote this". It sat beside three path-traversal and symlink findings that all needed a
  crafted manifest or a mergeable PR, and the challenger correctly ranked it above all of them.
- **`violations:test` dropping from 223 to 222 caught a defect that code review had not.** Narrowing
  the RI14 rule to config files silently broke its own brand-new rejection fixture, because the match
  keyed on `wf` (the validator's overridable notion of the workflow dir) while entry paths come from
  the CLI, which always writes `workflow/config/`. A one-fixture regression was the only signal.
- **`mutation:audit` was re-run three times and re-derived once**, and each re-run was needed: its
  tree snapshot predated later edits every time. A long-running audit is a stale audit by default.

## Manifest Coverage Retrospective

| Manifest ID | Outcome | Evidence path | Notes |
|---|---|---|---|
| R1 | shipped | `workflow/artifacts/verify/wp-r18-delta-upgrades-v1.md` | digests recomputed independently of the CLI |
| R2 | shipped | `test/run-upgrade-path-tests.mjs` | six states fixtured, not the five RI5 named |
| R3 | shipped | `workflow/artifacts/verify/wp-r18-delta-upgrades-v1.md` | byte-identical backup before any overwrite |
| R4 | shipped | `test/run-upgrade-path-tests.mjs` | one item per drifted file per upgrade |
| R5 | shipped | `bin/agentsmyth.mjs` | schema validated at load; unknown op is a hard error |
| R6 | shipped | `test/run-conformance-tests.mjs` | host is CLI-invoked and wired |
| RI1 | shipped | `workflow/artifacts/briefs/wp-r18-delta-upgrades-v1.md` | claim corrected: additive for fields, the enum widening is forward-only |
| RI2 | shipped | `package.json` | `dependencies` byte-identical |
| RI3 | shipped | `test/mutation-baseline.json` | 0/234 undefended, two new fixtures |
| RI4 | shipped | `test/run-upgrade-path-tests.mjs` | atomic, with the containment the first version lacked |
| RI5 | shipped | `workflow/artifacts/briefs/wp-r18-delta-upgrades-v1.md` | requirement amended — it undercounted its own state machine |
| RI6 | shipped | `workflow/artifacts/verify/wp-r18-delta-upgrades-v1.md` | corrupted global tree refreshed first |
| RI7 | shipped | `npm run validate` | backups outside every recursive sweep |
| RI8 | shipped | `workflow/artifacts/verify/wp-r18-delta-upgrades-v1.md` | foreign file never copied |
| RI9 | shipped | `test/run-upgrade-path-tests.mjs` | marker survives pruning; one-time pre-1.1.0 id ambiguity announced, not hidden |
| RI10 | shipped | `bin/agentsmyth.mjs` | item names its true target config |
| RI11 | shipped | `src/workflow/router.md` | step 9, plus a refusal to guess when `backup_path` is missing |
| RI12 | shipped | `test/run-conformance-tests.mjs` | CLI-invoked, schema-capable host |
| RI13 | shipped | `workflow/artifacts/verify/wp-r18-delta-upgrades-v1.md` | four line-ending variants, one digest; Windows half modelled not run |
| RI14 | shipped | `src/workflow/validators/check-lifecycle.mjs` | enforced on the third attempt — see Learning 1 |
| RI15 | shipped | `site/`, `README.md`, `CLAUDE.md` | a commit claiming "every surface" had covered three files |
| RI16 | shipped | `src/workflow/validators/check-setup-complete.mjs` | OI-105 closed and rotated this phase |
| RI17 | shipped | `dist/workflow-bundle.md` | 252/252 blocks verified by comparison |
| RI18 | **waived** | `workflow/artifacts/ship/wp-r18-delta-upgrades-v1.md` | FQ-80: eight-artifact branch needs a non-darwin runner |
| RI19 | shipped | `test/run-upgrade-path-tests.mjs` | outside markers survives, inside is replaced |
| RI20 | shipped | `test/run-upgrade-path-tests.mjs` | requirement's two deletion triggers now ordered |
| RI21 | shipped | `test/run-upgrade-path-tests.mjs` | polyrepo backup inside the member tree, visible to git |

## Deferred

| Item | Why | Owner |
|---|---|---|
| RI18's eight-governed-artifact branch | Needs a non-darwin platform nobody in this chain had. Waived as FQ-80 with a follow-up | workflow owner, before the 1.1.0 tag |
| RI13's native Windows checkout | CRLF was constructed on darwin, not through git's own filter under `core.autocrlf` | workflow owner, same CI job |
| The version step | `package.json` deliberately stays at 1.0.1, so every stamp behaviour ran at 1.0.1 → 1.0.1 | dispatch |

## Source-of-Truth Outcome

**Updated at Ship.** Both Notion pages corrected: the WP-R18 page carried four factual errors about
what shipped (manifest format, manifest location, validator host, and whole-file replace), and the
1.1.0 release plan needed its Build-gate box, a status row, and a rewritten dispatch section.

The plan had statused this `not required`, which `source-of-truth.yaml` reserves for work with no
external record — while the same paragraph named two pages it knew were stale. The Review caught the
mismatch; Ship performed the update rather than re-statusing it to `blocked` and handing it on.

The research spike page was deliberately left as written, and the reason recorded on it: a dated
record of what was known on 2026-09-21 is not a live contract.

## Learning Candidates

- **Candidate learning**: A test that runs its subject from a location the product never uses can be
  green and mean nothing. Before trusting a passing check, ask where the *shipped* copy of that code
  lives and whether the test exercises it there — the source tree, the expanded bundle, and the
  global install are three different places, and a validator that resolves a path relative to itself
  answers differently in each. This chain produced the same error in the product, in a unit test, and
  in the verification tooling, each invisible from inside its own layer — source:
  `workflow/artifacts/verify/wp-r18-delta-upgrades-v1.md` — propose-only.
- **Candidate learning**: A phase that both performs work and records its own outcome will record
  success. Review closed 72 ledger rows asserting a working fix that Test later disproved, and the
  archive is append-only so the claim cannot be corrected. Where a record asserts that a fix *worked*
  rather than that a finding *was real*, the assertion belongs to a later phase and a different
  author — source: `workflow/artifacts/reviews/wp-r18-delta-upgrades-v1.md` — propose-only.
- **Candidate learning**: A writer that owns only part of a file must normalise what it preserves, not
  just what it writes. Both late bugs were marker-bounded writers: one duplicated content because it
  could not see an unmarked copy of its own body, the other duplicated whitespace because it counted
  a newline twice and grew the user's config without bound. Idempotence for these must be asserted on
  BYTES across repeated runs, against a file seeded with the user's own content — source:
  `workflow/artifacts/verify/wp-r18-delta-upgrades-v1.md` — propose-only.

## Follow-Ups

| Action | Owner | Suggested Artifact Or Ticket | Status |
|---|---|---|---|
| Add a non-darwin CI job asserting the eight-entry governed count and a native `core.autocrlf` checkout, closing FQ-80 and RI13's modelled half | workflow owner | `ci: non-darwin matrix job for governed-surface and CRLF branches` | open |
| Give `finding-quality` a `verified_in_phase` field, written later and by a different author than `resolution`, so a premature closure can be corrected without editing the append-only archive | workflow owner | `feat(schemas): separate "finding was real" from "fix worked" in the finding-quality ledger` | open |
| Extract one shared, tested marker-block primitive for `installGateSection`, `placeAgentsMd` and `installPreCommitHook` — three hand-rolled implementations of one idea, two of which produced a bug in this chain | workflow owner | `refactor(cli): one marker-bounded writer, byte-idempotent by construction` | open |
| Add a `cap_source` value for a cap the user raised in session — the enum offers `configured` and `council-default`, and this run was neither | workflow owner | `feat(schemas): cap_source needs a user-raised member` | open |
| Add a `closed_in_phase` member for a return to Build — 72 rows were closed as `review` because the enum has no `build`, which is the closest true value and not an exact one | workflow owner | `feat(schemas): closed_in_phase needs a build member` | open |
| Teach `check-council-record` that a two-round run has two integrity brackets — it reads one pair and reported `ok` over a record carrying three contradictory statements about that very check | workflow owner | `feat(validators): council integrity brackets are per-round` | open |
| Move the `AGENTS.md` duplication cases from `upgrade-path:test` into `agents-md:test`, where the feature that owns `placeAgentsMd` owns its tests | workflow owner | `test: relocate AGENTS.md adoption cases to their own feature suite` | open |
| Record that `lifecycle-think` was reopened after Build for a verification pass, which its own determinism rules forbid, and decide whether the chain needs a named post-Build verification round | workflow owner | `docs(workflow): name the post-Build verification round, or forbid it properly` | open |

## Raw Session Entry

See `workflow/learnings/sessions/2026-09-24-wp-r18-delta-upgrades.md`.

## Architecture Notes

- role: Project Manager
- decision: Record the four-passes-after-Build table in Outcome rather than burying it in What Did
  Not Work. It is the chain's headline result: the feature shipped, and the process finding is that
  four consecutive gates each certified work the next one disproved.
- constraint: The finding-quality archive is append-only, so three rows asserting a premature fix
  cannot be corrected. That constraint produced follow-up 2 rather than an edit.
- decision: Close and rotate OI-105 here rather than at Review, and record in its resolution that it
  took three attempts. The item's own `next_action` predicted both defects correctly; what it could
  not predict was that the first two repairs would pass their own tests. That is the reusable part.
- downstream: Eight follow-ups, all with owners. Two gate the 1.1.0 tag (the non-darwin job, and the
  RI18 waiver's acceptance). The rest are schema and refactor work for 1.2.0. PR #72 must merge
  before `release/1.1.0` → `main`.

## Exit Gate

- [x] Manifest Coverage Retrospective has one row per active R and RI — 27 rows.
- [x] Every follow-up has a named owner and suggested artifact title — 8 follow-ups.
- [x] Learning candidates tagged propose-only — 3, each sourced to an artifact path.
- [x] `orchestration.status: done`, `next_phase: done`.
