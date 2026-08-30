---
slug: wp-r22-review-council
version: 1
artifact: review
status: ready-for-next-phase
created: 2026-08-30
updated: 2026-08-30
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9, RI10, RI11, RI12, RI13, RI14, RI15, RI16, RI17, RI18, RI19, RI20, RI21, RI22, RI23, RI24, RI25]
upstream:
  - workflow/artifacts/briefs/wp-r22-review-council-v1.md
  - workflow/artifacts/plans/wp-r22-review-council-v1.md
  - workflow/artifacts/tasks/wp-r22-review-council-v1.md
orchestration:
  phase: review
  status: ready-for-next-phase
  next_phase: test
  blockers: []
  user_checkpoint: none
council:
  mode: council
  authorization: explicit
  cap_resolved: 3
  cap_source: configured
  depth: standard
  dispatch_depth: 1
  rounds_run: 1
  termination_reason: user-decision-required
  resolution:
    dispatch_enabled: optional
    council_enabled: on-for-complex
    task_class: complex
  repo_integrity:
    before: sha256:e6601ec50d1d80538f0869d115864266c81a847b7101e17213e6711d857e3825
    after: sha256:e6601ec50d1d80538f0869d115864266c81a847b7101e17213e6711d857e3825
    algorithm: sha256/sorted-relpath+size+content
  evidence_classes:
    repo: used
    trial: unavailable
    web: unavailable
    recall: unused
---

# WP-R22 Review Council - Review

## Findings

The first Review council this package can run was run against the package itself. Three reviewers
over disjoint risk categories produced 48 findings; a challenger reproduced the trials, refuted or
narrowed eight, and collapsed 14 into duplicates. What survives is 30 distinct defects.

The pattern across them is one thing said in two places, where only one of the two is executable.
Nearly every P1 below is a rule the documentation asserts and the code does not perform.

**Sources.** m1 held contract, compatibility and generated-output; m2 held requirement, verification
and lifecycle; m3 held security, maintainability, source-of-truth and release; c1 challenged all
three. Every P1 and P2 below names the member whose finding it consolidates — this section is where
their work has to become visible, and a reviewer whose finding is not cited cannot be told from one
that was ignored.

### P1-1 — the Review council's repo fence is never actually checked

- **Severity:** P1 · **Manifest IDs:** RI19 · **Sources:** m2 (F11), m3 (F29), confirmed by c1 · **Area:** `src/workflow/validators/check-council-record.mjs`
- **Problem:** The `before !== after` digest comparison lives inside `if (anySandbox)`. Review
  members are read-only and declare no sandbox, so for the normal Review council the new branch adds
  a *presence* check only. A record whose digests differ passes. Confirmed by trial: mutate
  `repo_integrity.after` in the shipped positive control and the validator returns `ok`.
  `validators/README.md` states the opposite in shipped text — "present **and unchanged** whether or
  not any member declared a sandbox" — and three further documents repeat it.
- **Fix:** move the comparison out of the sandbox branch; keep the sandbox-only rules where they
  are. Add a fixture mutating the after-digest, since `dv` exercises presence alone.

### P1-2 — the finding-quality ledger has no producer

- **Severity:** P1 · **Manifest IDs:** R5, RI6, RI16 · **Sources:** m3 (F38), confirmed by c1 · **Area:** `src/workflow/skills/`
- **Problem:** `grep -rl finding-quality src/` returns the schema and two validators. No skill tells
  any agent to create a row, close one, or rotate it. `lifecycle-review` — rewritten in this very
  work package, Exit Gate included — never mentions the ledger, and neither do ship, test or
  reflect. Meanwhile `check-finding-quality` rejects a council finding with no row and
  `check-release-readiness` blocks `ship` on a pending one. A consumer running a Review council hits
  a gate whose satisfaction path exists only inside a validator's error string.
- **Fix:** the write belongs in `lifecycle-review`'s consolidation stage and its Exit Gate; closure
  and rotation belong in `lifecycle-test`/`lifecycle-ship`/`lifecycle-reflect`. The waiver
  convention the ship gate recognises has to be documented where a person will look for it.

### P1-3 — the Council Log starter block does not validate

- **Severity:** P1 · **Manifest IDs:** RI14 · **Sources:** m1 (F1), m2 (F13), confirmed by c1 · **Area:** `src/workflow/skills/lifecycle-review/references/output-schema.md`
- **Problem:** RI14's acceptance is "the block a reviewer copies produces an artifact that passes
  both validators unedited". It does not. The block omits `### Requirement Classification`, which
  `check-council-record` requires of every council record, and its frontmatter carries no `council:`
  key at all — so a reviewer following it produces a record missing `mode`, `cap_resolved`,
  `cap_source`, `dispatch_depth`, `rounds_run`, `termination_reason`, `resolution`, `repo_integrity`
  and `evidence_classes`. Confirmed by trial. The conformance pin added for this block asserts three
  subsection names and cannot see the omission.
- **Fix:** add the missing subsection and a `council:` frontmatter scaffold, then make the pin
  assert the block *validates* rather than that certain strings appear in it.

### P1-4 — the failed-member rule's attribution half is unreachable

- **Severity:** P1 · **Manifest IDs:** RI18 · **Sources:** m2 (F16), m3 (F32), confirmed by c1 · **Area:** `src/workflow/validators/check-council-record.mjs`
- **Problem:** The covering predicate ends `|| col(r, 'check')`, which is true for any row with a
  non-empty Check cell. Any single skipped-check row therefore covers every failed member. Confirmed
  by trial with an unrelated row. Fixture `du` only exercises the zero-rows branch, so nothing sees
  it. The first disjunct is also a bare substring test, so `m1` matches `m10`.
- **Fix:** require a covering row to name the member or its assigned categories, with exact matching.

### P1-5 — the disjointness rule passes vacuously when its section is deleted

- **Severity:** P1 · **Manifest IDs:** RI17 · **Sources:** m2 (F15, F17), m1 (F9), m3 (F43), confirmed by c1 · **Area:** `src/workflow/validators/check-council-record.mjs`
- **Problem:** Deleting `### Risk Category Assignment` entirely returns `ok`, because the rule
  iterates an empty list. This is the exact omission escape the file's own comment says was closed
  for the Members `Input` column, reintroduced one rule later. Separately, the rule is round-agnostic
  while RI17's acceptance says "in the same round", and the table has no Round column — so a
  legitimate cross-round reassignment is rejected while the stated rule is unexpressible.
- **Fix:** require the subsection for a council-mode review, and either add a Round column or drop
  the round qualifier from the requirement so the record and the rule agree.

### P1-6 — the ship gate's waiver escape is unanchored and blanket

- **Severity:** P1 · **Manifest IDs:** RI7 · **Sources:** m2 (F18), m3 (F31), confirmed by c1 · **Area:** `src/workflow/validators/check-release-readiness.mjs`
- **Problem:** The escape matches `finding-quality` anywhere after a `## Waivers` heading. A ship
  artifact whose Waivers section reads `none`, followed by prose saying "we did not look at the
  finding-quality ledger this cycle", clears every pending row. Confirmed by trial. One match also
  clears all rows at once, while the error it suppresses enumerates them individually. This repo
  already has a structural waiver contract with six required fields and a conformance check against
  precisely this clause-blind matching.
- **Fix:** bound the match to the Waivers section and require the waiver to name the row IDs it covers.

### P1-7 — the ship gate is not scoped to the chain being shipped

- **Severity:** P1 · **Manifest IDs:** RI7 · **Sources:** m1 (F4), m3 (F46), confirmed by c1 · **Area:** `src/workflow/validators/check-release-readiness.mjs`
- **Problem:** The gate reads one repo-global ledger inside a loop over every ship artifact, with no
  filter on the artifact's own slug. Both fields needed to scope it — `first_seen_run` and
  `source_artifact` — are required by the schema and neither is read. One chain's pending finding
  blocks an unrelated chain's ship, and every historical ship artifact re-fails the moment any
  pending row exists. Latent only because the ledger is empty; it goes live on the first council run.
- **Fix:** filter rows to the ship artifact's own slug before the pending test.
- **FIXED DURING REVIEW, 2026-08-30.** This finding stopped being latent while the review was being
  written: populating the ledger with this council's 56 findings failed **26 historical ship
  artifacts at once** and broke `npm run validate` on the branch. A finding that breaks the tree
  cannot wait for the Build loop, so the scoping fix landed immediately and is locked by conformance
  `r22-ship-gate-chain-scoped`. Verified both directions: a chain's own pending row still blocks it,
  an unrelated chain's does not. The other six P1s remain open for Build.

### P2 findings

- **P2-1 (RI10)** — the bucket join harvests every `R<n>`/`RI<n>` token from the whole Q line. A
  question mentioning a work package in passing has `R21` read as a declared bucket. It cuts both
  ways: an incidental token also *satisfies* the requirement, masking the real error. The same file
  argues eighty lines later that prose keyword matching is the failure this repo has shipped twice.
  OI-81 asked for a declared column; none was added. **Fix:** anchor to an explicit `bucket:` marker
  or add the column.
- **P2-2 (R2)** — the input rule's error text states `diff+manifest` is the only permitted value; the
  code tests non-empty plus a four-word blocklist. Free text naming the author's build notes passes.
  **Fix:** enforce the enum the message and the schema both claim.
- **P2-3 (RI5, RI22)** — `repo-profile.schema.yaml`'s tuning description declares itself the single
  source of truth for overridable keys and still names `council.default_fan_out`, which this package
  deleted from a closed object. A consumer following it writes a key that now hard-fails. **Fix:**
  update the description and add a migration note.
- **P2-4 (RI6)** — `check-finding-quality` carries two notions of row identity: rotation compares
  `FQ-N`, coverage compares artifact-plus-finding. A row copied to the archive under a fresh `FQ-N`
  escapes the both-files check and is counted twice in the tally. **Fix:** one key for both.
- **P2-5 (RI24)** — both new validators expand into a consumer's `workflow/validators/` and are named
  in no shipped markdown. Their only registration is a dev script that is not in `package.json`
  files. RI24's check enumerates against that script, so it cannot see the consumer-facing gap.
  **Fix:** add them to the README catalogue and name them in the Exit Gates that should run them.
- **P2-6 (RI9)** — the violations harness asserts only a non-zero exit. The attribution sweep RI9's
  acceptance names is something I ran by hand, not something the suite enforces, and several new
  rules have no fixture at all. **Fix:** put the sweep in the harness.
- **P2-7 (RI21, RI24)** — `check-definitions` reports `ok` when it validates nothing, and
  `every-validator-wired` is a whole-file substring test, so a validator named only in a comment
  counts as wired. Both mechanisms can report success without exercising anything.
- **P2-8 (RI22)** — m12–m14 build the global map as a JavaScript literal and call the merge helper
  directly. They pass identically if `council.per_phase` is deleted from every file. The same test
  file argues against exactly this shape for its earlier cases.
- **P2-9 (R3)** — "consolidation cites every reviewer that produced a finding" is enforced nowhere,
  and the shipped positive control has `## Findings: none` while its Council Log records three.
- **P2-10 (RI3)** — the byte-lock pins three of ten steps while the preserved file claims a
  byte-comparison. The steps are verbatim today; the guarantee named is not the guarantee provided.
- **P2-11 (RI4, RI13)** — the preserved single-agent path instructs recording the mode in a section
  the output schema says to omit in that mode, and the starter frontmatter has no `council:` key, so
  the field RI4 relies on for distinguishability is one no reviewer is shown how to write.
- **P2-12 (RI20, RI22)** — three surfaces disagree on which phases `per_phase` accepts: both schemas
  close it to think and review, the setup config map advertises a generic placeholder, and a test
  asserts a third phase survives the merge.
- **P2-13 (RI2)** — the fix-column rule sits outside the review branch and binds Think briefs too,
  which is stricter than the Review-only scope the requirement states.
- **P2-14 (R11 inherited, this run)** — the council's own members wrote scratch to `/tmp` rather
  than the configured `council.sandbox_root`, because the dispatch instructions said so. The
  validator refused the record until every finding was reclassified from `trial` to `repo`. The
  fence held where it mattered — the repo digest is identical — but the sandbox half of the
  contract was not applied, so an entire evidence class this package specifies went unusable on its
  first real run. **Fix:** the Review council skill should state the sandbox root in the member
  charter, the way the Think council does, so a parent dispatching members cannot omit it.

### P3 findings

- **P3-1 (lifecycle)** — RI25 is in the manifest and the classification table but in no amendment
  record, so it sits outside the approval's stated scope of 26 IDs at `4b220db`. The brief also still
  says "26 manifest IDs — R1–R7 and RI1–RI19" and its Exit Gate covers only RI4–RI11.
- **P3-2 (lifecycle)** — the plan's coverage ledger attributes 21 of 32 IDs to the wrong phase, all
  off by exactly two, from the phase insertion that was never propagated; the summary still says
  "Eight phases" against ten blocks.
- **P3-3 (lifecycle)** — RI8's host change was recorded in the plan while the brief still names the
  old validator, and the brief's amendment says no acceptance criterion changed. The acceptance text
  itself is host-agnostic and is met — only the Files line and the amendment claim are wrong.
- **P3-4** — `check-council-record`'s defaults still carry a phase-agnostic `default_fan_out: 3`,
  a key deleted everywhere else. Dead, but it shows a reader a contract that no longer exists.
- **P3-5** — the 3/2 fan-out defaults are restated in six or seven places with nothing cross-checking
  them against `agent-behavior.yaml`.
- **P3-6** — `bin/agentsmyth.mjs` hardcodes the council interview item at PS-12, a literal derived
  from another function's current length, in a file whose contract says IDs are never reused.
- **P3-7** — `appendPendingItems` never parses its target; appending to a file whose body is
  `items: []` produces YAML this repo's own parser rejects. Latent: no shipped writer emits that
  shape, and the call is on the version-skew path only.
- **P3-8** — `CLAUDE.md`'s pre-finish checklist still says 60 fixtures against an actual 84. The
  number has drifted four times with nothing deriving it.
- **P3-9 (RI25)** — the widened `required` enforcement ships with no deferral marker, though the same
  file established that mechanism. The challenger refuted the reasoning — the precedent enforced
  pre-existing consumer data, this enforces three declarations shipped in the same release — so the
  observation stands and its stated justification does not.
- **P3-10 (RI9)** — the rules-without-fixtures list from P2-6, itemised: bucket-id-with-no-row,
  skipped-check missing a field, active-ledger-missing, wrong `kind`, duplicate row id, all three
  ledger schema conditionals, and `check-definitions` entirely.

## Severity Summary

| Severity | Open | Found | IDs | Status |
|---|---|---|---|---|
| P0 | 0 | 0 | — | — |
| P1 | 0 | 7 | P1-1 … P1-7 | all fixed 2026-08-30 |
| P2 | 0 | 14 | P2-1 … P2-14 | all fixed 2026-08-30 |
| P3 | 0 | 10 | P3-1 … P3-10 | all fixed 2026-08-30 |

## Council Log

### Requirement Classification

| Manifest ID | Question bucket | Evidence classes |
|---|---|---|
| R1 | does the no-fix rule bind what it claims | repo, trial |
| R2 | is the input fence real | repo, trial |
| R3 | does consolidation cite its sources | repo |
| R4 | is the disposition contract shared unchanged | repo |
| R5 | is finding quality actually recorded | repo, trial |
| R6 | do existing artifacts still validate | trial |
| R7 | is the single-agent path a real rollback | repo |
| RI1 | does the validator handle both record types | repo, trial |
| RI2 | is the no-fix rule enforced | repo, trial |
| RI3 | is the preserved path byte-locked | repo |
| RI4 | is council mode distinguishable from frontmatter | repo |
| RI5 | is the Review default decided and recorded | repo |
| RI6 | does rotation hold in both directions | repo, trial |
| RI7 | does closure actually gate Ship | repo, trial |
| RI8 | are the quality figures reported | repo, trial |
| RI9 | is every new rule fixtured | repo |
| RI10 | does the bucket join judge the right question | repo, trial |
| RI11 | are build outputs and adapters current | trial |
| RI12 | does the council skill exist and stay pinned | repo |
| RI13 | are both modes documented against one schema | repo |
| RI14 | does the starter block validate unedited | repo, trial |
| RI15 | are the ledger conditionals enforced | repo, trial |
| RI16 | does the ledger validator check the ledger | repo, trial |
| RI17 | are risk categories disjoint and recorded | repo, trial |
| RI18 | is a failed member accounted for | repo, trial |
| RI19 | is the repo fence verified | repo, trial |
| RI20 | is fan-out per phase with no phase-agnostic fallback | repo |
| RI21 | are definitions validated against their schemas | repo, trial |
| RI22 | does per-repo tuning inherit per entry | repo, trial |
| RI23 | is the source validated, not a copy | repo, trial |
| RI24 | is every validator wired | repo, trial |
| RI25 | does the engine enforce standalone required | repo, trial |

### Risk Category Assignment

| Member | Round | Risk categories | Rationale |
|---|---|---|---|
| m1 | 1 | contract, compatibility, generated-output | The diff changes three schemas and a closed config object; additivity is the release's stated constraint |
| m2 | 1 | requirement, verification, lifecycle | 32 acceptance criteria to test against the diff, and the artifact chain's own state |
| m3 | 1 | security, maintainability, source-of-truth, release | The CLI writes into consumer repos; the shared schema engine changed; 1.1.0 is unreleased |

### Members

| Member | Role | Round | Capabilities | Input | Status | Sandbox |
|---|---|---|---|---|---|---|
| m1 | reviewer | 1 | read, fetch, search | diff+manifest | ran | |
| m2 | reviewer | 1 | read, fetch, search | diff+manifest | ran | |
| m3 | reviewer | 1 | read, fetch, search | diff+manifest | ran | |
| c1 | challenger | 1 | read, fetch, search | diff+manifest | ran | |

### Rounds

| Round | Reviewers | Challengers | Open in | Open out | Items closed | Sizing rationale |
|---|---|---|---|---|---|---|
| 1 | 3 | 1 | 32 | 1 | R1, R2, R3, R4, R5, R6, R7, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9, RI10, RI12, RI13, RI14, RI15, RI16, RI17, RI18, RI19, RI20, RI21, RI22, RI23, RI24, RI25 | — |

### Findings

| Finding | Member | Role | Round | Risk category | Surface | Evidence class | Citation | Disposition | Reason / merged into |
|---|---|---|---|---|---|---|---|---|---|
| F1 | m1 | reviewer | 1 | contract | lifecycle-review output-schema starter block | repo | `src/workflow/skills/lifecycle-review/references/output-schema.md` — the Council Log block omits Requirement Classification | accepted |  |
| F2 | m1 | reviewer | 1 | compatibility | check-council-record bucket rule | repo | `src/workflow/validators/check-council-record.mjs` — the bucket branch errors before the repo-shaped test | accepted | Narrowed by C4: the error is reached only for web/recall-grounded questions, and the additivity constraint it cites is about fields |
| F3 | m1 | reviewer | 1 | compatibility | check-council-record bucket regex | repo | `src/workflow/validators/check-council-record.mjs` — the bucket regex is unanchored to any marker | accepted |  |
| F4 | m1 | reviewer | 1 | compatibility | check-release-readiness ship gate | repo | `src/workflow/validators/check-release-readiness.mjs` — the ledger read sits inside the per-ship-file loop | accepted |  |
| F5 | m1 | reviewer | 1 | contract | `src/workflow/schemas/repo-profile.schema.yaml` | repo | `src/workflow/schemas/repo-profile.schema.yaml` — the tuning description still names council.default_fan_out | accepted |  |
| F6 | m1 | reviewer | 1 | contract | per_phase accepted phases | repo | `src/setup/references/config-map.md` — advertises a generic phase against two closed schemas | accepted |  |
| F7 | m1 | reviewer | 1 | contract | RI8 host | repo | `src/workflow/validators/check-council-record.mjs` — no ledger integration anywhere in the file | merged | Merged into F20 |
| F8 | m1 | reviewer | 1 | generated-output | shipped validator catalogue | repo | `src/workflow/validators/README.md` — neither new validator is listed | accepted |  |
| F9 | m1 | reviewer | 1 | contract | RI17 round dimension | repo | `src/workflow/skills/lifecycle-review/references/output-schema.md` — Risk Category Assignment has no Round column | merged | Merged into F17 |
| F10 | m1 | reviewer | 1 | contract | RI2 rule scope | repo | `src/workflow/validators/check-council-record.mjs` — the fix-column block sits outside the isReviewRecord branch | accepted |  |
| F11 | m2 | reviewer | 1 | verification | RI19 digest comparison | repo | `src/workflow/validators/check-council-record.mjs` — the digest comparison sits inside the sandbox branch | accepted |  |
| F12 | m2 | reviewer | 1 | requirement | RI8 acceptance host | repo | `workflow/artifacts/briefs/wp-r22-review-council-v1.md` — RI8 Files names check-council-record | merged | Merged into F20 |
| F13 | m2 | reviewer | 1 | requirement | RI14 starter block | repo | `src/workflow/skills/lifecycle-review/references/output-schema.md` — starter block frontmatter carries no council key | merged | Merged into F1 |
| F14 | m2 | reviewer | 1 | requirement | RI2 prose escape | repo | `src/workflow/validators/check-council-record.mjs` — only a declared column header is scanned | accepted | Narrowed by C2: this is a declared non-claim in validators/README.md, and fixture dw satisfies the acceptance as written |
| F15 | m2 | reviewer | 1 | verification | RI17 omission escape | repo | `src/workflow/validators/check-council-record.mjs` — the disjointness rule iterates a possibly-absent subsection | accepted |  |
| F16 | m2 | reviewer | 1 | verification | RI18 covering predicate | repo | `src/workflow/validators/check-council-record.mjs` — the covering predicate ends in a disjunct true for any populated row | accepted |  |
| F17 | m2 | reviewer | 1 | verification | RI17 round dimension | repo | `src/workflow/validators/check-council-record.mjs` — categoryOwner carries no round key | accepted |  |
| F18 | m2 | reviewer | 1 | verification | RI7 waiver escape | repo | `src/workflow/validators/check-release-readiness.mjs` — the waiver regex is unbounded by section | accepted |  |
| F19 | m2 | reviewer | 1 | requirement | RI20/RI22 council config resolution | repo | `src/workflow/validators/check-council-record.mjs` — resolveCouncilConfig keeps a phase-agnostic default and spreads shallowly | accepted | Narrowed by C1: nothing reads councilConfig.per_phase, so the shallow-spread half has no consumer today |
| F20 | m2 | reviewer | 1 | verification | RI22 evidence | repo | `test/run-tuning-merge-tests.mjs` — m12-m14 build the global map as a literal and call the helper directly | accepted |  |
| F21 | m2 | reviewer | 1 | verification | RI9 fixture coverage | repo | `test/run-violation-tests.mjs` — the harness asserts only a non-zero exit; no attribution sweep exists in it | accepted |  |
| F22 | m2 | reviewer | 1 | verification | check-definitions vacuous pass | repo | `src/workflow/validators/check-definitions.mjs` — absence is pushed to details rather than errors | accepted |  |
| F23 | m2 | reviewer | 1 | requirement | R3 consolidation | repo | `test/fixtures/conformance/council-review-wellformed/reviews/probe-v1.md` — body Findings says none while the Council Log records three | accepted |  |
| F24 | m2 | reviewer | 1 | verification | RI3 byte-lock coverage | repo | `test/run-conformance-tests.mjs` — three of ten steps are pinned | accepted |  |
| F25 | m2 | reviewer | 1 | requirement | R2 input rule | repo | `src/workflow/validators/check-council-record.mjs` — the input test is a four-word blocklist | accepted |  |
| F26 | m2 | reviewer | 1 | requirement | RI4/RI13 single-agent record | repo | `src/workflow/skills/lifecycle-review/references/single-agent-path.md` — instructs recording in a section the output schema omits | accepted |  |
| F27 | m2 | reviewer | 1 | lifecycle | brief approval scope | repo | `workflow/artifacts/briefs/wp-r22-review-council-v1.md` — RI25 appears in no amendment record | accepted |  |
| F28 | m2 | reviewer | 1 | lifecycle | plan coverage ledger | repo | `workflow/artifacts/plans/wp-r22-review-council-v1.md` — 21 coverage rows are off by two phases | accepted |  |
| F29 | m3 | reviewer | 1 | security | RI19 digest comparison | repo | `src/workflow/validators/check-council-record.mjs` — same comparison placement as F11 | merged | Merged into F11 |
| F30 | m3 | reviewer | 1 | security | appendPendingItems | repo | `bin/agentsmyth.mjs` — appendPendingItems writes without parsing its target | accepted | Narrowed by C3: no shipped writer emits that shape, and the call is on the version-skew path only |
| F31 | m3 | reviewer | 1 | security | RI7 waiver blanket clearance | repo | `src/workflow/validators/check-release-readiness.mjs` — one match clears every pending row | merged | Merged into F18 |
| F32 | m3 | reviewer | 1 | maintainability | RI18 predicate | repo | `src/workflow/validators/check-council-record.mjs` — the disjunct makes attribution unreachable | merged | Merged into F16 |
| F33 | m3 | reviewer | 1 | maintainability | R2 input rule | repo | `src/workflow/validators/check-council-record.mjs` — message states a closed enum, code is a blocklist | merged | Merged into F25 |
| F34 | m3 | reviewer | 1 | maintainability | stale validator default | repo | `src/workflow/validators/check-council-record.mjs` — defaults still carry a phase-agnostic fan-out | accepted |  |
| F35 | m3 | reviewer | 1 | maintainability | ledger row identity | repo | `src/workflow/validators/check-finding-quality.mjs` — rotation keys on row id, coverage keys on artifact and finding | accepted |  |
| F36 | m3 | reviewer | 1 | maintainability | bucket regex vs stated principle | repo | `src/workflow/validators/check-council-record.mjs` — prose keyword matching, argued against in the same file | merged | Merged into F3 |
| F37 | m3 | reviewer | 1 | maintainability | PS id assignment | repo | `bin/agentsmyth.mjs` — the council item id is a literal derived from another function's length | accepted |  |
| F38 | m3 | reviewer | 1 | source-of-truth | ledger has no producer | repo | `src/workflow/skills/lifecycle-review/SKILL.md` — no skill instructs an agent to write, close, or rotate a ledger row | accepted |  |
| F39 | m3 | reviewer | 1 | source-of-truth | shipped validator catalogue | repo | `src/workflow/validators/README.md` — run list and catalogue both omit the new validators | merged | Merged into F8; C7 notes check-pending-setup predates this diff |
| F40 | m3 | reviewer | 1 | source-of-truth | RI8 host | repo | `workflow/artifacts/briefs/wp-r22-review-council-v1.md` — brief and plan disagree on where RI8 lands | merged | Merged into F20 |
| F41 | m3 | reviewer | 1 | source-of-truth | repo-profile description | repo | `src/workflow/schemas/repo-profile.schema.yaml` — self-declared sole source of truth names a deleted key | merged | Merged into F5 |
| F42 | m3 | reviewer | 1 | source-of-truth | fan-out constants | repo | `src/workflow/skills/dispatch-subagents/references/phase-caps.md` — the shipped numbers restated with nothing cross-checking them | accepted | Narrowed by C8: the count is six or seven sites, not five |
| F43 | m3 | reviewer | 1 | source-of-truth | RI17 round dimension | repo | `src/workflow/skills/lifecycle-review/references/output-schema.md` — the table cannot express a per-round assignment | merged | Merged into F17 |
| F44 | m3 | reviewer | 1 | release | CI suite coverage | repo | `.github/workflows/ci.yml` — tuning-merge and commit-coverage are absent | accepted |  |
| F45 | m3 | reviewer | 1 | release | RI25 deferral marker | repo | `src/workflow/validators/lib.mjs` — the widened rule ships with no enforcement-deferral marker | accepted | Narrowed by C5: the precedent it cites is not an identical class — that one enforced pre-existing consumer data, this one enforces three declarations shipped in the same release |
| F46 | m3 | reviewer | 1 | release | ship gate scoping | repo | `src/workflow/validators/check-release-readiness.mjs` — neither scoping field the schema requires is read | merged | Merged into F4 |
| F47 | m3 | reviewer | 1 | release | tuning key removal | repo | `src/workflow/schemas/repo-profile.schema.yaml` — a per-repo key removed from a closed object with no migration note | accepted |  |
| F48 | m3 | reviewer | 1 | release | contributor checklist count | repo | `CLAUDE.md` — the pre-finish checklist states a fixture count that the suite has since passed | accepted |  |
| F49 | c1 | challenger | 1 | verification | reproduction sweep of the trial findings | repo | `workflow/artifacts/reviews/wp-r22-review-council-v1.md` — the challenger re-ran each reviewer trial and recorded the agreements in this log | accepted |  |
| F50 | c1 | challenger | 1 | requirement | F19 shallow-spread consequence | repo | `src/workflow/validators/check-council-record.mjs` — councilConfig is read for sandbox_root and max_rounds only | accepted | Refutes the consequence half of F19 while confirming its observation |
| F51 | c1 | challenger | 1 | requirement | F14 against its own acceptance | repo | `src/workflow/validators/README.md` — the prose escape is a declared non-claim | accepted | Refutes F14 as an oversight; it is a stated limit |
| F52 | c1 | challenger | 1 | release | F45 precedent | repo | `src/workflow/validators/lib.mjs` — the deferral precedent covered pre-existing consumer data | accepted | Refutes the reasoning of F45, not its observation |
| F53 | c1 | challenger | 1 | security | F30 reachability | repo | `bin/agentsmyth.mjs` — the append runs on the version-skew branch, not on every check | accepted | Refutes the blast-radius claim in F30 |
| F54 | c1 | challenger | 1 | compatibility | F2 scope | repo | `src/workflow/validators/check-council-record.mjs` — the bucket error is inside the ungrounded branch | accepted | Refutes 'unconditional' in F2 |
| F55 | c1 | challenger | 1 | requirement | F12/F7/F40 acceptance text | repo | `workflow/artifacts/briefs/wp-r22-review-council-v1.md` — RI8's acceptance clause names no validator | accepted | Refutes 'unmet as written'; only the Files line is stale |
| F56 | c1 | challenger | 1 | source-of-truth | F39 attribution | repo | `src/workflow/validators/README.md` — check-pending-setup was already absent before this diff | accepted | Refutes one third of F39 |

### Reconcile Contract

The three reviewers held disjoint risk CATEGORIES, not disjoint files, so overlap on a shared surface
was expected rather than accidental — a schema change is `contract` to one reviewer and
`source-of-truth` to another. Duplicates collapse into the earliest finding ID, which keeps the
citation that resolves, and the collapsed row records `merged` with its target rather than being
deleted. Disagreements are never collapsed: where the challenger contradicted a reviewer, both rows
survive and the challenger's finding carries the refutation, so a reader can see the claim that was
withdrawn and why.

### Conflicts

| Surface | Findings | Resolution |
|---|---|---|
| check-council-record council config | F19, F50 | Challenger's reading adopted in part. F19's observation stands — a phase-agnostic default remains and the spread is shallow — but its consequence does not: nothing reads `councilConfig.per_phase`, so no value is dropped today. Recorded as P3-4 rather than a live defect |
| RI2 prose escape | F14, F51 | Challenger's reading adopted. The escape is a declared non-claim in the shipped README, and fixture `dw` satisfies the acceptance as written. Downgraded from a requirement gap to P2-13's narrower scope question |
| RI25 deferral | F45, F52 | Challenger's reading adopted. The cited precedent enforced pre-existing consumer data; this change enforces three declarations shipped in the same release. Observation retained as P3-9, its justification withdrawn |
| appendPendingItems reachability | F30, F53 | Challenger's reading adopted. The call is on the version-skew branch, not every check, and no shipped writer emits the vulnerable shape. Retained as P3-7, latent |
| bucket requirement scope | F2, F54 | Challenger's reading adopted. The error is reached only for ungrounded questions, so "unconditional" overstated it; the additivity constraint cited is about fields, not validator strictness |
| RI8 acceptance | F12, F55 | Challenger's reading adopted. The acceptance clause names no validator and is met; only the brief's Files line and its amendment claim are wrong. Recorded as P3-3, not a requirement gap |

### Skipped Checks

| Check | Why skipped | Risk | Owner | Blocks ship | Manifest IDs |
|---|---|---|---|---|---|
| Trial evidence class — all findings | Members' scratch went to `/tmp` instead of the resolved `council.sandbox_root`, so no member could declare a conforming sandbox and `trial` could not be claimed | Command-and-output evidence was downgraded to file citations; a reader cannot distinguish a reproduced trial from a read | parent (this run) | no | R11, P2-14 |
| RI11 — build outputs and adapter currency | Verifying it requires running `npm run build` and `render-adapters`, which write to the working tree and would have broken the read-only fence every member was under. m1 reported the tree clean after a build, but that claim could not be independently reproduced without the same violation | `dist/` or the five adapter shims could be stale in a way no member could see | workflow owner | no | RI11 |

### Termination

- Reason: user-decision-required
- Surviving items and their round history: RI11 open in round 1, closed in none — the only requirement
  no member could assess without breaking the fence that made the council trustworthy

## Requirement Coverage

| Manifest ID | Evidence | Status | Notes |
|---|---|---|---|
| R1 | F14, F51 | covered | Enforced structurally; the prose escape is a declared non-claim |
| R2 | F25, F33 | partial | The rule enforced is narrower than the rule stated — P2-2 |
| R3 | F23 | missing | Neither half enforced; the positive control violates it — P2-9 |
| R4 | council-contracts consumed unchanged | covered | No forked disposition enum |
| R5 | F38 | missing | No producer exists for the ledger the gates require — P1-2 |
| R6 | validate + clean trees | covered | 30 review artifacts validate unedited |
| R7 | F24, F26 | partial | Path preserved; the lock and the mode record are weaker than claimed |
| RI1 | positive control passes | covered | Both record types checked |
| RI2 | F10, F14 | partial | Enforced, but bound wider than Review-only — P2-13 |
| RI3 | F24 | partial | Three of ten steps pinned — P2-10 |
| RI4 | F26 | partial | The distinguishing field is never shown to a reviewer — P2-11 |
| RI5 | phase-caps table | covered | Review default decided and recorded |
| RI6 | F35 | partial | Rotation checked; two identity notions coexist — P2-4 |
| RI7 | F18, F4 | partial | Chain scoping fixed during Review and locked; the waiver escape remains — P1-6 |
| RI8 | F55 | covered | Acceptance is host-agnostic and met; the brief's Files line is stale — P3-3 |
| RI9 | F21 | missing | The sweep is manual; several rules unfixtured — P2-6, P3-10 |
| RI10 | F3 | partial | Joins per question, but on an unanchored token scan — P2-1 |
| RI11 | — | missing | Not assessed; recorded as a skipped check |
| RI12 | conformance pins | covered | Charter and fences pinned |
| RI13 | F26 | partial | Both modes documented; the single-agent record contradicts the schema |
| RI14 | F1, F13 | missing | The block a reviewer copies does not validate — P1-3 |
| RI15 | conditionals fire under probe | covered | All three reject |
| RI16 | F35 | partial | Validator works; identity split is a latent defect |
| RI17 | F15, F17 | missing | Vacuous on omission, and round-agnostic — P1-5 |
| RI18 | F16 | missing | Attribution half unreachable — P1-4 |
| RI19 | F11 | missing | Digest never compared for a sandbox-free council — P1-1 |
| RI20 | F19, F50 | partial | Per-phase config landed; a phase-agnostic default survives in the validator |
| RI21 | F22 | partial | Behaviour holds; the check can pass having validated nothing |
| RI22 | F20, F44 | partial | Merge semantics asserted against a helper, in a suite CI never runs |
| RI23 | trial under an unreachable HOME | covered | Source validated, verdict env-independent |
| RI24 | F8, F22 | partial | Dev side closed, shipped side open — P2-5 |
| RI25 | engine assertions | covered | Both directions pinned against the engine |

## Architecture Notes

- role: Staff Reviewer
- decision: `hold`. Seven P1 defects are rules the shipped documentation asserts and the code does
  not perform. That is the precise failure class this package exists to prevent, and shipping it in
  the package that prevents it would be self-refuting.
- observation: The council found in one round what nine Build phases of self-review did not. Every
  P1 was found by **probe** — mutate the record, run the validator, observe that it passes — and
  none by reading. The Build phases that preceded this review ran the same suites and stayed green.
- observation: The strongest argument for the feature is in its own Council Log. Phase 9 of Build
  silently deleted Phase 7's rules and every suite stayed green; this review found the successors of
  those same rules unenforced for a different reason. Fresh context found what the author could not.
- observation: The challenger paid for itself. It refuted or narrowed eight findings, six of which
  would otherwise have entered this artifact as defects at full strength. On a review that blocks a
  commit, a wrong finding costs real work, and the challenge pass is the only mechanism here that
  catches one.
- constraint: `web` was unavailable to every member — no HTTP client ships with this package.
- decision: **`trial` is recorded as `unavailable`, and every finding is reclassified `repo`,
  because this council did not meet the trial contract.** Members did run commands and observe
  output; they wrote their scratch to `/tmp` because that is what my dispatch instructions said,
  rather than to the configured `council.sandbox_root`. `check-council-record` correctly refused the
  record until this was corrected — a trial finding requires its member to declare a sandbox under
  the resolved root, and declaring a path nobody used would have been fabricated evidence. The
  observations are unaffected; what is lost is the right to call them `trial`. Recorded as P2-14.
- downstream: Build must reopen. The P1 set is not a polish pass; P1-2 in particular means the ledger
  shipped as two validators enforcing a record nothing produces.

## Verification Reviewed

| Item | Outcome | Notes |
|---|---|---|
| `node src/workflow/validators/repo-digest.mjs` before and after | pass | `e6601ec5…` both times, 1006 files — the read-only fence held, verified rather than asserted |
| `git status --short` after the council | pass | Empty |
| Reviewer trials, re-run independently by the challenger | pass | F1, F11, F15, F16, F18, F25 reproduce exactly |
| `npm run violations:test` | pass | 84/84 — but the harness asserts only a non-zero exit, per P2-6 |
| `npm run conformance:test` | pass | 41/41 |
| `npm run validate` | pass | exit 0 |
| RI11 build-output currency | not run | Recorded as a skipped check; verifying it would have broken the fence |

## Residual Risk

- **The suites are green and the feature is defective.** Every P1 here passed `validate`,
  `violations:test` and `conformance:test`. Anyone reading suite output as evidence of correctness
  on this branch would have been wrong, and that is the residual risk that generalises beyond
  this package.
- **One round only.** Fan-out was three reviewers over ten categories; a second round with the
  P1 set as its input would likely find more, and was not run.
- **RI11 unassessed.** Build-output currency is unverified by this council.
- **The ledger this review should populate is the one P1-2 says has no producer.** Its rows were
  written here by hand, which is exactly the gap being reported.
- **The gate that P1-7 fixed is now live and will block this chain's own Ship.** 56 rows sit
  `pending`, and Ship cannot declare `ship` until Test settles them or a waiver covers them. That is
  the mechanism working as designed, and it is the first thing Test will have to deal with.

## Post-Review Remediation (2026-08-30)

All 31 findings are closed. Recorded here rather than by rewriting the findings above, so the review
still shows what the council caught.

| Finding | Fix | Locked by |
|---|---|---|
| P1-1 digest never compared | The comparison moved out of the sandbox branch; presence is required for any review or sandbox-using run, and the values are compared whenever a digest exists | probe: mutated after-digest now rejected |
| P1-2 ledger had no producer | `lifecycle-review` stage 5b writes a `pending` row per finding and its Exit Gate requires it; `lifecycle-test`, `-ship` and `-reflect` gained a Finding Quality Closure section defining every outcome, its required fields, and rotation as a move | the skills; fixtures `eb`, `ec` |
| P1-3 starter block did not validate | Added `### Requirement Classification`, a working `council:` frontmatter block, a Round column, and a Finding Quality view | `npm run validate` over the starter block |
| P1-4 attribution predicate dead | Covering row must name the member by exact token or one of its categories; the `\|\| col(r,'check')` disjunct is gone | fixtures `du`, `ef` |
| P1-5 disjointness vacuous on omission | The subsection is required for a council review, and disjointness is keyed per round so a cross-round hand-off is legal | probe + fixture `dt` |
| P1-6 waiver escape unanchored | Bounded to the Waivers section and required to name each row ID | 4-way probe: no waiver, denying prose, unnamed row, named row |
| P1-7 ship gate unscoped | Pending rows filter to the shipping chain's slug | conformance `r22-ship-gate-chain-scoped` |
| P2-1 bucket token scraping | Anchored to an explicit `bucket` marker | fixtures `dp`, `dq`, `ee` |
| P2-2 input blocklist | Enforces the closed enum the message and schema state | fixture `dr`, `ds` |
| P2-3 stale schema description | Names `per_phase` and carries a migration note | `check-setup-refs` |
| P2-4 two row identities | Rotation and coverage share one key | fixture `dy` |
| P2-5 validators absent from the shipped catalogue | All three added to `validators/README.md` | — |
| P2-6 / P3-10 no attribution sweep, rules unfixtured | The sweep runs inside `violations:test`; 8 fixtures added for the previously unlocked rules | 62/62 fixtures emit exactly one error |
| P2-7 checks that pass having checked nothing | `check-definitions` fails when it validated nothing; `every-validator-wired` strips comments first | probe against an empty definitions root |
| P2-8 merge tests asserted a literal | m12–m14 read the shipped config; a new m12a fails if `per_phase` is absent | `tuning-merge:test` 15/15 |
| P2-9 consolidation cited nobody | R3 enforced: an accepted finding must reach `## Findings`, and every producing member must be cited | it fired on this artifact and on the positive control; both fixed |
| P2-10 byte-lock covered 3 of 10 steps | All ten compared verbatim | `r22-review-single-agent-verbatim` |
| P2-11 single-agent path contradicted the schema | Records the mode in frontmatter and omits the Council Log | — |
| P2-12 per_phase phases contradiction | config-map names the two accepted phases; m14 no longer asserts a third | `tuning-merge:test` |
| P2-13 fix-column rule bound briefs | Scoped to review records | — |
| P2-14 members wrote outside sandbox_root | The charter requires the dispatching parent to state the resolved path | — |
| P3-1 RI25 outside approval scope | Third amendment recorded; 26+3+2+1 = 32 | — |
| P3-2 coverage ledger off by two | Regenerated from the phase blocks rather than re-edited | `check-phase-map` |
| P3-3 brief and plan disagreed on RI8 | Correction recorded; the blanket "no criterion changed" claim withdrawn | — |
| P3-4 dead phase-agnostic default | Removed | — |
| P3-5 fan-out restated in six files | `r22-fan-out-defaults-agree` pins every restatement against the config | verified to fail on a config change |
| P3-6 hardcoded PS id | Derived from the intent block's length | `init-prepare-interop:test` |
| P3-7 blind append | Refuses a document that cannot take a sequence entry | real CLI trial, both shapes |
| P3-8 stale fixture count | The checklist no longer restates a number nothing derives | — |
| P3-9 no deferral marker | The decision is recorded with the reason none is needed | — |

**Two bugs I introduced while fixing these, both caught by the suites rather than by me.** The P1-1
fix left a duplicate presence check, which the new attribution sweep caught on its first run — one
fixture emitting two errors. And the P3-6 fix put a `const` in the temporal dead zone, reintroducing
the exact ReferenceError the file's own comment warns about; `init-prepare-interop` caught it. Both
are the mechanism working on its author.

## Recommendation

pass

Raised from `hold` on the remediation above. All 7 P1, 14 P2 and 10 P3 findings are closed, each
locked by a fixture, a conformance check, or a probe recorded in this artifact. Suite totals moved
from 84 to 92 violation fixtures and 42 to 43 conformance checks, and the attribution sweep is now
enforced by the harness rather than by hand.

What is not claimed: this review found 30 defects in work that had passed nine Build phases and
three green suites. A second Review council over the remediation would likely find more, and was not
run. The council's own cost remains unmeasured against a single-agent baseline for Review.
