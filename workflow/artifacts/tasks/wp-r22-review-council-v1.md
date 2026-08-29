---
slug: wp-r22-review-council
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-08-29
updated: 2026-08-29
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9, RI10, RI11, RI12, RI13, RI14, RI15, RI16, RI17, RI18, RI19]
upstream:
  - workflow/artifacts/briefs/wp-r22-review-council-v1.md
  - workflow/artifacts/plans/wp-r22-review-council-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# WP-R22 Review Council (Fresh-Eyes Multi-Agent Review) - Task

## Active Phase

- Phase: Phase 10 - Fixtures, conformance, generated output — **complete; Build is done, all ten
  phases closed**. Named as a phase number rather than prose because `check-scope-fence` extracts
  the active phase from this line to bound the scope union, and a line it cannot parse fails the
  gate — which is what happened on the first attempt at this commit.
- Manifest IDs: RI9, RI11 (Build total: all 32)
- Exit gate: met. 84/84 violations, 55 council fixtures each emitting exactly one error, 41/41
  conformance, `npm run build` clean, `render-adapters` reports shims current.

## Plan Phases Overview

Plan revised 2026-08-29 on user direction after blocker B1; phases renumbered to 10 so the
schema-enforcement work lands early, where every later phase's constraints benefit from it.

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Per-phase council caps, symmetric | complete | RI5, RI20 |
| Phase 2 - Definitions validated against their schemas | complete | RI21, RI23, RI24 |
| Phase 3 - Per-repo council tuning and the setup interview | complete | RI22 |
| Phase 4 - Finding-quality ledger contract | complete | RI6, RI15, RI25 |
| Phase 5 - Review council skill and charter | complete | R2, R3, RI12, RI19 |
| Phase 6 - lifecycle-review restructuring and record shape | complete | R7, RI3, RI13, RI14, RI17, RI18 |
| Phase 7 - Validator extended to review artifacts | complete | R1, R4, R6, RI1, RI2, RI4 |
| Phase 8 - Ledger validator, closure gate, reporting | complete | R5, RI7, RI8, RI16 |
| Phase 9 - Per-question bucket join | complete | RI10 |
| Phase 10 - Fixtures, conformance, generated output | complete | RI9, RI11 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits (Phase 1) | `feat/wp-r22-review-council` | `* feat/wp-r22-review-council...origin/feat/wp-r22-review-council` / ` M workflow/artifacts/plans/wp-r22-review-council-v1.md` | Only modification is this chain's own plan artifact, carrying the approval recorded this turn. No unrelated dirty files. Branch matches the plan's declared working branch; base `release/1.1.0` |

## Scope

- In scope: the active phase's declared touches only, one phase at a time, in the plan's dependency
  order.
- Out of scope: opening a PR (user request only, per `release.yaml`); any commit to `main` or
  `release/1.1.0`; the 1.1.0 release mechanics (changelog, version bump, merge to main) which belong
  to that release's own chain, not to this one.

## Changed Files

**Phase 1 (RI5, RI20)** and **Phase 2 (RI21)** — complete. B1 closed.

- `src/workflow/agent-behavior.yaml` — `council.per_phase.review.default_fan_out: 2`, with the
  reasoning for 2-not-3 in the comment — IDs: RI5
- `src/workflow/schemas/agent-behavior.schema.yaml` — `per_phase` replaces the top-level
  `default_fan_out`, with `think` and `review` as closed objects and `think` required; `per_phase`
  replaces `default_fan_out` in the council `required` list — IDs: RI5, RI20
- `src/workflow/validators/check-config.mjs` — definitions files are now validated against their
  schemas, keyed off `kind` exactly as the repo-config loop is; absent definitions root is recorded
  as skipped rather than passing silently — IDs: RI21
- `src/workflow/schemas/repo-profile.schema.yaml` — `tuning.council.per_phase` replaces the repo-level
  `default_fan_out`, mirroring the global shape; nothing required, so a repo tunes the phases it
  cares about and inherits the rest — IDs: RI22
- `bin/agentsmyth.mjs` — item families generalised: `appendPendingItems(configDir, specs, marker)`
  with a per-family idempotency marker, so a family added later still reaches a repo that already
  resolved the earlier ones. New `councilTuningItemSpecs()`; seeded at init as PS-12 and appended on
  version skew — IDs: RI22
- `workflow/config/pending-setup.yaml` — PS-7 added by running the real skew path, not hand-written — IDs: RI22
- `src/setup/references/config-map.md` — council-size row in the derived-numbers table, stating the
  per-entry merge rule — IDs: RI22
- `test/run-tuning-merge-tests.mjs` — m12/m13/m14, the positive proof that overriding one phase
  leaves the other at its global value — IDs: RI22

**Phase 10 (RI9, RI11).**

- `src/workflow/validators/check-council-record.mjs` — Review-only rules RESTORED from `a66bd17`
  after Phase 9's edit deleted them — IDs: RI9
- `test/fixtures/lifecycle-violations/dr..dw` — six Review-record rules, one mutation each — IDs: RI9
- `test/fixtures/lifecycle-violations/dx..ea` — ledger rotation, both directions, plus the
  closed-only archive and the missing-archive case — IDs: RI9, RI6
- `test/fixtures/lifecycle-violations/eb, ec` — R5's two escapes — IDs: RI9, R5
- `test/fixtures/lifecycle-violations/ed` — the Ship closure gate — IDs: RI9, RI7
- `test/run-violation-tests.mjs` — 13 registrations — IDs: RI9

**Phase 9 (RI10).**

- `src/workflow/validators/check-council-record.mjs` — `repoShapedClassified` replaced by a
  per-ID classification map; the rule joins on the question's declared bucket, rejects a bucket
  reference that resolves to no classification row, and requires a bucket only of a question it
  would judge — IDs: RI10
- `src/workflow/skills/lifecycle-think/references/output-schema.md` — the Q entry's bucket
  reference and why it exists — IDs: RI10
- `src/workflow/validators/README.md` — rule description updated; the brief-wide non-claim removed — IDs: RI10
- `test/fixtures/lifecycle-violations/dp-q-web-only-repo-bucket`,
  `test/fixtures/lifecycle-violations/dq-q-no-bucket-reference` — new — IDs: RI10, RI9
- `test/fixtures/conformance/council-external-question/` — new; the negative half of the join — IDs: RI10
- `test/run-violation-tests.mjs`, `test/run-conformance-tests.mjs` — registration and the pin — IDs: RI10
- `workflow/artifacts/open-items.yaml` — OI-81 closed with a resolution — IDs: RI10

**Phase 8 (R5, RI7, RI8, RI16).**

- `src/workflow/validators/check-finding-quality.mjs` — new; schema validation of both ledger files,
  both rotation directions, closed-only archive, the R5 cross-check that every council finding has a
  row, and the quality tally computed across both files — IDs: R5, RI16, RI8
- `src/workflow/validators/check-release-readiness.mjs` — the Ship closure gate: a `pending` row
  blocks a `ship` declaration unless a Waivers entry covers it, mirroring the open-P0/P1 handling
  directly above it rather than inventing a second mechanism — IDs: RI7
- `scripts/validate-template.mjs` — `check-finding-quality` registered — IDs: RI16
- `test/fixtures/conformance/finding-quality-both-files/` — new; one pending row active, two closed
  rows archived, so a tally read from the active file alone reports "0 proved real" and fails — IDs: RI8
- `test/run-conformance-tests.mjs` — `r22-finding-quality-spans-both-files`,
  `r22-finding-quality-absent-ok` — IDs: RI8, RI16

**Phase 7 (R1, R4, R6, RI1, RI2, RI4).**

- `src/workflow/validators/check-council-record.mjs` — `briefs/` filter widened to briefs and
  reviews; `tableObjects()` + `col()` replace fixed-index row reads; totals and summary made
  artifact-type-aware; five Review-only rules added — IDs: R1, R4, R6, RI1, RI2, RI4
- `src/workflow/validators/README.md` — the dual-record scope, the header-keyed parsing note, the
  Review-additional rules, and the new non-claim about prose-smuggled fixes — IDs: RI1, RI2
- `test/fixtures/conformance/council-review-wellformed/` — new; positive control for the review
  record, without which the rejection rules would be satisfied by a validator that rejects every
  review — IDs: RI1
- `test/run-conformance-tests.mjs` — `r22-council-review-wellformed`, `r22-council-review-counted`;
  `r21-council-summary` updated for the type-aware line — IDs: RI1

**Phase 6 (R7, RI3, RI13, RI14, RI17, RI18).**

- `src/workflow/skills/lifecycle-review/references/single-agent-path.md` — new; the pre-council
  10-step Workflow, extracted from the committed blob rather than retyped — IDs: R7, RI3
- `src/workflow/skills/lifecycle-review/SKILL.md` — mode resolution before stage 1, six council
  stages, the preserved path as the single-agent route, and eight council bullets on the Exit Gate
  naming `check-council-record.mjs` — IDs: R7, RI13
- `src/workflow/skills/lifecycle-review/references/output-schema.md` — `## Council Log` starter
  block with seven subsections mirroring the Think record; Severity Summary corrected to the five
  columns real reviews use; `### Skipped Checks` added so RI18 has somewhere to write — IDs: RI14, RI18
- `src/workflow/skills/lifecycle-review/references/review-risk-categories.md` — the ten categories
  become the council's assignment surface, disjoint across reviewers, files deliberately not
  partitioned — IDs: RI17
- `test/run-conformance-tests.mjs` — `r22-review-single-agent-verbatim`,
  `r22-review-severity-columns`, `r22-review-council-log-block` — IDs: RI3, RI14

**Phase 5 (R2, R3, RI12, RI19).**

- `src/workflow/skills/review-council/SKILL.md` — new; charter with the three fences, disjoint
  risk-category assignment, the challenge pass, the no-fix rule scoped to council-log findings, and
  failed-member recording — IDs: R2, R3, RI12, RI19
- `src/workflow/skills/review-council/references/output-schema.md` — new; round result and refusal
  result, including `repo_integrity`, per-member `input` and `status`, and `skipped_checks` — IDs: R2, R3, RI12, RI19
- `test/run-conformance-tests.mjs` — `r22-review-council-sections`, `-fences`, `-no-verdict` — IDs: RI12

**Phase 4 (RI6, RI15, RI25).**

- `src/workflow/schemas/finding-quality.schema.yaml` — new; `additionalProperties: false`, an
  `FQ-N` id pattern, and three `if/then` conditionals — a closed outcome requires `closed_in_phase`
  and `resolution`, `waived` requires `waiver_ref`, `noise`/`unresolved-at-reflect` require
  `reason` — IDs: RI15
- `workflow/artifacts/finding-quality.yaml` — new; active ledger, `items: []` until the Review
  council first runs — IDs: RI6
- `workflow/artifacts/finding-quality-archive.yaml` — new; append-only archive, distinct `kind` so
  neither file can be mistaken for the other — IDs: RI6
- `src/workflow/validators/lib.mjs` — `required` is enforced independently of `properties`; without
  this every conditional in the schema above was inert — IDs: RI25
- `test/run-conformance-tests.mjs` — `schema-required-without-properties` and
  `schema-conditional-required`, asserted against the engine directly — IDs: RI25

**Phase 2 extension (RI23, RI24).**

- `src/workflow/validators/check-definitions.mjs` — new; validates definitions files against their
  schemas at the resolved definitions root, registered in the source command list so that root is
  `src/workflow/` — IDs: RI23
- `src/workflow/validators/check-config.mjs` — the definitions block added for RI21 removed again,
  with the reason recorded in its place; check-config stays on repo-local config so one fact is
  checked in one place — IDs: RI23
- `scripts/validate-template.mjs` — `check-definitions` registered under `sourceEnv`;
  `check-pending-setup` registered at all, for the first time — IDs: RI23, RI24
- `test/run-conformance-tests.mjs` — `every-validator-wired` and `definitions-checked-at-source` — IDs: RI24
- `src/workflow/schemas/pending-setup.schema.yaml` — `resolved_by` gains `unrecorded`, documented as
  valid only for items that predate the field — IDs: RI24
- `workflow/config/pending-setup.yaml` — PS-1..3 marked `resolved_by: unrecorded` rather than
  backfilled with a guess — IDs: RI24
- `src/workflow/skills/dispatch-subagents/references/phase-caps.md` — new "Review council default"
  section stating 2 and its three reasons; the Think-only scoping paragraph now names
  `council.per_phase.<phase>` as the place every phase declares its own, a shipped-values table for
  think/review/everything-else, and the fail-safe rule — IDs: RI5, RI20

## Implementation Log

**Phase 10 (RI9, RI11) — and the regression it caught.**

Writing the fixtures immediately exposed that **Phase 9 had silently deleted every Review-only rule
Phase 7 added.** The Phase 9 edit replaced a span running up to the `evidence-class availability`
marker, and the Review block sat inside that span. All six new fixtures passed a validator that no
longer contained the rules they targeted, and `validate`, `violations:test` and `conformance:test`
were green across two commits while the rules were gone.

Nothing caught it because the rules had been proven by **probe** and locked by **nothing**. A probe
demonstrates a rule works once, at the moment you run it; a fixture keeps it working. That is
exactly the distinction RI9 exists to enforce, and the package demonstrated the cost of skipping it
on itself. The rules were restored from `a66bd17` — the Phase 7 commit — rather than retyped, and
all six fixtures then rejected with one error each.

13 fixtures registered: six for the Review-only record rules, four for the ledger's rotation and
archive rules, two for R5's escapes (no ledger at all; a ledger omitting a finding), and one for the
Ship closure gate. The attribution sweep covers all 55 council fixtures and confirms each emits
exactly one error against its own validator and exits non-zero.

**Phase 9 (RI10 / OI-81).** A Questions For User entry now names the manifest ID(s) whose
Requirement Classification covers it — its bucket — and the rule joins on that instead of asking
whether *any* row in the brief names repo.

The bucket reference is demanded only of a question the rule would actually judge: one resting on no
`repo` or `trial` finding. A question already grounded in repo or trial evidence never reaches the
rule, so the record-shape cost falls only where it buys something, and no existing brief or fixture
needed editing.

Three fixtures cover the join, and the third is the one that matters: `dp` fires when the question's
own bucket names repo, `dq` fires when no bucket is declared and the question therefore cannot be
judged, and conformance `r22-external-question-not-flagged` stays **silent** on a genuinely external
question resting on web alone — which is precisely what the brief-wide approximation got wrong. The
non-claim describing that approximation is removed from the README, because the approximation is
gone rather than merely documented.

**Phase 8 (R5, RI7, RI8, RI16).** `check-finding-quality.mjs` models `check-open-items.mjs` —
validate when present, exit 0 with a message when absent — with rotation as the rule specific to a
two-file ledger. Both failure directions are checked, because neither is visible from one file: a
row in both files was copied rather than moved, and a closed row still in the active file was never
rotated. A pending row in the archive is rejected too — nothing scans the archive for work to
finish, so it would sit forever while reading as accounted for.

**Absence is conditional, not always-fine.** A repo that never ran a Review council legitimately has
no ledger. One that HAS run a council and recorded no outcomes has lost exactly the record R5
exists to keep, and would otherwise pass by not creating the file — the omission escape this package
has closed twice already. So the ledger's absence is an error when a council-mode review exists.

**A bug found by probing, not reading.** The R5 cross-check keyed rows on `source_artifact` as a
path string, which matched only when the validator ran from the repo root; under `--dir` a
repo-relative ledger row could never match the scanned path. Keys are normalised to the artifact
FILENAME, which carries slug and version — the identity the key actually needs — and survives the
artifacts tree being relocated.

RI8 moved home. The plan put the quality figure on `check-council-record`'s summary line; it belongs
to the validator that owns the ledger. Reporting it from the record validator would put two readers
on the same two files, which is the duplicated-fact shape being closed throughout. Brief and plan
amended; no requirement changed, only its home.

**Phase 7 (R1, R4, R6, RI1, RI2, RI4).** The filter widening was the smallest part. The real hazard
was that the Review record adds columns *mid-table* — `Risk category` in Findings, `Input` and
`Status` in Members — so every fixed index after an insertion point would have read the wrong cell
and done it silently. Parsing is now keyed by **header name**, with one reader serving both records
where they name a concept differently (Think dispatches "researchers", Review "reviewers"). All 69
existing fixtures pass unchanged, which is the evidence that the refactor preserved Think's
behaviour rather than the assertion that it did.

F2 closed: totals are counted per artifact type and the summary names both, so a review can no
longer be reported as a brief.

Five Review-only rules landed with their enforcement, each probed against a purpose-built positive
control rather than assumed: input fence (R2), disjoint categories (RI17), failed-member skipped
check (RI18), mandatory repo digest (RI19 — stricter than Think's, because a Review council reads
the repository it is judging), and the no-fix rule (RI2). RI18 and RI19's record shapes landed in
Phases 5–6; their enforcement is here, which is where the validator lives.

RI2 is enforced **structurally**, against a declared column, not by scanning reason prose for
imperative phrasing. This repo has twice shipped a keyword matched without regard to its clause — a
coverage cell reading "never silently dropped", a waiver cell reading "rather than a waiver" — and a
third would cost more in false rejections than the rule gains. The limit is stated in the README's
non-claims list rather than papered over.

RI4 confirmed by inspection, not changed: `council:` was already top-level and optional in
`artifact-frontmatter.schema.yaml`, so no schema edit was needed and none was made.

**Phase 6 (R7, RI3, RI13, RI14, RI17, RI18).** The preserved path was extracted from the committed
blob with `git show HEAD:...` and written to `single-agent-path.md` **before** SKILL.md was touched,
rather than retyped — a copy that is re-derived is the drift the byte-lock exists to catch. `diff`
against the extracted text shows no difference beyond a trailing newline. The lock discriminates:
altering one word of step 1 fails `r22-review-single-agent-verbatim`, and restoring it passes.

`lifecycle-review` now resolves mode before stage 1 in the same first-answer-wins order R21
established, then runs six stages in council mode — the parent owns grounding, category assignment
and the verdict; the council owns fan-out, challenge and consolidation input. Single-agent mode is
the preserved path, unchanged.

Two record-shape fixes landed with it. The Severity Summary starter block declared
`| Severity | Count |` while every real review used five columns and `check-release-readiness.mjs`
had already been widened to tolerate them — the block a reviewer copies was the stale thing, so it
now carries `Open | Found | IDs | Status`. And the Council Log gained a `### Skipped Checks`
subsection: RI18's rule had a rule and no place to write the answer, which would have made it
unenforceable at Phase 7 no matter what the validator did.

**Phase 5 (R2, R3, RI12, RI19).** `review-council/` created, mirroring `think-council`'s shape.
Three fences are stated in the charter itself rather than by reference, because a member loads only
this file: the repo axis (absolute — a Review council reads the repository it is judging, so a
member that writes edits the thing under review), the outward axis (carve-out gets read/fetch/search
only), and a Review-specific **input fence** — reviewers receive the diff and the manifest, never the
Build session transcript, since a reviewer that reads the author's reasoning reviews the intention
rather than the artefact.

Risk categories, not files, are the unit of assignment, drawn from the ten already in
`review-risk-categories.md`. Categories are disjoint across reviewers; files are not, because a
schema change is legitimately `contract` to one reviewer and `compatibility` to another. R1's
collision is resolved in the charter as planned: no council-log finding carries a fix, while the
parent's consolidated findings still do.

`council-contracts.md` needed no edit — it already names the Review council as a consumer. Six of
the seven files in `dispatch-subagents/references/` are byte-identical to the WP-R21 merge, so A1
holds. The seventh, `phase-caps.md`, changed in Phase 1 by design (RI5/RI20) — I first recorded this
as "the directory is unchanged", which the numstat contradicted. Corrected rather than left, since
an unverified byte-stability claim is exactly the kind of evidence this chain keeps catching.

**Phase 4 (RI6, RI15, RI25) — the conditionals were decoration until the engine was fixed.**

The ledger schema was written to the brief's contract, `check-schema-keywords` passed, and both
ledger files validated. Probing it rather than trusting it showed **every conditional rule
accepted a row that violated it** — a closed row with no `closed_in_phase`, a waived row with no
`waiver_ref`, a noise row with no `reason`. `pattern` and `additionalProperties` in the same schema
rejected correctly, so the schema looked live.

Cause: the engine checked `required` only inside `if (schema.properties && isPlainObject(value))`.
Every `then:` branch of an if/then names newly-mandatory keys and re-declares no properties, so its
`required` was skipped entirely. `check-schema-keywords` cannot see this — it asserts a keyword is
implemented, not that it is reachable in the position a schema uses it, which is the same
looks-enforced-from-every-angle-but-one shape as B1.

Fixed in `lib.mjs` (RI25), which every validator's schema checking runs through, so the full suite
was re-run rather than the phase's own checks alone. Locked by two direct assertions against the
engine, since no schema-level check can cover it.

**Phase 2 reopened and completed (RI23, RI24).** The two findings below were raised as
carry-to-Review and the user rejected that: "NO, FIX IT RIGHT NOW. NO DEFERRALS". Both are fixed,
and the underlying shape is locked.

RI21 turned out to enforce a *copy*. `check-config` runs on the repo-local root because it also
reads `workflow/config/`, and `AGENTSMYTH_WF` moves defsRoot and dataRoot together — so it could
never be pointed at the source without breaking its other half. The definitions check is now its own
validator, `check-definitions.mjs`, registered in the **source** command list so it validates
`src/workflow/agent-behavior.yaml` itself. Proven: an out-of-range value and a removed required key
in the SOURCE each fail `npm run validate` with no `prepare` run and no global install reachable,
naming the source path.

RI24 generalises it. Three instances of one defect appeared in this package alone — a schema nothing
loaded, a definitions check reading the wrong copy, and `check-pending-setup.mjs` registered
nowhere. A conformance check now enumerates `src/workflow/validators/` and fails on any validator
missing from `validate-template.mjs`, with CLI-invoked files and non-checks exempted by name; a
second check pins the definitions check to the source list specifically, since registering it
anywhere else silently reintroduces the copy problem.

`check-pending-setup` is now registered and passes. Its three failing items were `resolved` with no
`resolved_by`, and the provenance is genuinely unrecoverable — nothing in git history records it. I
did not backfill a guess: the schema gained `unrecorded`, documented as valid only for items that
predate the field, and the three are marked with it.

**Phase 3 (RI22) — the two findings, as originally raised.**

*The dogfood loop validates the GLOBAL definitions, not the source.* A schema change in
`src/workflow/schemas/` is synced by `npm run build` into `dist/` and the dev workspace, but
`~/.agentsmyth/workflow/` only moves when `agentsmyth prepare` runs. `defsPath()` resolves to the
global install here (`definitions_root` in `repo-profile.yaml`), so `check-config` was validating
the old global copy while the source already carried the new shape — the traversal probe said
`MISSING at per_phase` for a key plainly present in `src/`. Running `prepare` closed it. The
asymmetry is real and not local-only: CI has no `~/.agentsmyth`, so the two-root resolver falls back
to the repo-local `workflow/` copy that `build` syncs — meaning **CI and a developer's machine
validate different files**. That is the "passes on the author's machine" class the WP-R21 PR review
flagged, one layer down. Recorded, then fixed the same day as RI23 on user instruction rather than carried to Review.

*`check-pending-setup.mjs` is never run.* It is not registered in `scripts/validate-template.mjs`,
so `npm run validate` never calls it. Run directly, it exits 1 on this repo — PS-1, PS-2 and PS-3
are `resolved` with no `resolved_by`, which its own rule forbids. Pre-existing, unrelated to RI22,
and initially left alone per `scope-control.md`. Fixed as RI24 on the same instruction. Same family
as B1: a checker that exists and never runs.

This artifact was created before any Phase 1 file was touched, per `lifecycle-build`'s workflow
step 4 — scoping, not documentation after the fact.

**Phase 1 — the decision.** `council.per_phase.review.default_fan_out` is **2**, not Think's 3.
Reasons recorded in `phase-caps.md`: the Think council was measured at ~6x invocations for less
coverage than a single-agent baseline and Review carries the same bill on every Complex chain;
Review's output blocks a commit, so a confident wrong finding costs more here; and two reviewers over
disjoint risk categories deliver the property Review needs. Semantics chosen so that forgetting to
decide fails safe: a phase absent from `per_phase` gets no departure and falls back to default-to-1,
rather than silently inheriting Think's 3 — which is the failure F8 reported and R21 fixed for Think.

**Phase 1 — what the discriminating probes found.** After the suites came back green, three probes
were run against the new schema constraints rather than re-reading them (WP-R21's reflect: "a
validator's own correctness is not establishable by its author reading it"). All three were
**accepted** when they should have been rejected — see Command Results. Root cause established by
inspection: **nothing loads `agent-behavior.schema.yaml`.** `grep -rn "agent-behavior.schema"`
across the repo returns one comment in `lib.mjs` and the bundle copy; no validator reads it.
`check-config` validates that each schema is well-formed and validates `workflow/config/*.yaml`
against their schemas, but `agent-behavior.yaml` is a definitions file and no validator applies its
schema to it.

The consequence is not limited to the keys added here. Every constraint in that schema is currently
decoration — `required: [enabled, max_rounds, depth, default_fan_out, sandbox_root]`, the `enabled`
enum, `max_rounds`'s 1..10 bound, and now `per_phase`. This is the P1-1 shape WP-R21's review named
exactly: the config key, the schema, the documentation and the resolver all exist, which makes the
requirement look enforced from every angle except the one that matters.

Recorded as a blocker rather than fixed in place: wiring a definitions file to its schema is outside
Phase 1's declared touches, and `scope-control.md` requires stopping and raising it rather than
expanding scope unilaterally.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| RI5 | `phase-caps.md` states a Review default distinct from Think's | present, and Think's departure stays scoped to Think |
| RI5 | `src/workflow/agent-behavior.yaml` carries the Review default | resolvable without a repo-level override |
| RI5 | `src/workflow/schemas/agent-behavior.schema.yaml` accepts it | `npm run validate` exit 0 |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `git status --short --branch` | Phase 1 pre-work | pass | Recorded above; clean apart from this chain's plan artifact |
| `npm run build` | Phase 1 | pass | `build: ok`; bundle regenerated |
| `npm run validate` | Phase 1 | pass | exit 0 |
| `npm run violations:test` | Phase 1 | pass | 69/69 |
| `npm run conformance:test` | Phase 1 | pass | 26/26 |
| `node src/workflow/validators/check-schema-keywords.mjs` | Phase 1 | pass | 11 schemas against 20 supported keywords; the new `per_phase` block uses only implemented keywords |
| Probe: `per_phase.review.default_fan_out: 99` (schema maximum 10) | Phase 1 | **fail — accepted** | Should have been rejected. Evidence for the blocker |
| Probe: unknown key `challengers` under `per_phase.review` (`additionalProperties: false`) | Phase 1 | **fail — accepted** | Should have been rejected |
| Probe: unknown phase `ship` under `per_phase` (`additionalProperties: false`) | Phase 1 | **fail — accepted** | Should have been rejected |
| `grep -rn "agent-behavior.schema"` across repo | Phase 1 root-cause | pass | One comment in `lib.mjs`, one bundle copy, zero validator reads — the schema is never applied |
| Probe re-run: `default_fan_out: 99` | Phase 2 | **pass — now rejected** | `...council.per_phase.review.default_fan_out is above maximum 10` |
| Probe re-run: unknown key `challengers` | Phase 2 | **pass — now rejected** | `...council.per_phase.review.challengers is not allowed` |
| Probe re-run: unknown phase `ship` | Phase 2 | **pass — now rejected** | `...council.per_phase.ship is not allowed` |
| New probe: required `max_rounds` removed | Phase 2 | **pass — rejected** | `...council.max_rounds is required` — proves the pre-existing `required` list is live too, not just the new keys |
| `node src/workflow/validators/check-config.mjs` (unmodified repo) | Phase 2 | pass | Clean — enforcement added no false positive |
| `npm run build`, `validate`, `violations:test`, `conformance:test` | Phases 1-2 | pass | build ok, exit 0, 69/69, 26/26 |
| `node bin/agentsmyth.mjs check` (real skew path) | Phase 3 | pass | Appended PS-7 for `tuning.council.per_phase`; the already-resolved `intent.` family was left alone, proving the per-family marker guard |
| `node bin/agentsmyth.mjs check` (second run) | Phase 3 | pass | Added 0 — idempotent |
| `npm run tuning-merge:test` | Phase 3 | pass | **14/14**, was 11/11. m12 overriding review leaves think at 3; m13 overriding neither inherits both; m14 a repo-named phase absent from the global map survives |
| Probe: repo `tuning.council.per_phase.review.default_fan_out: 99` | Phase 3 | pass — rejected | `...per_phase.review.default_fan_out is above maximum 10` |
| Probe: repo override of `1` | Phase 3 | pass — accepted | Valid override is not rejected; the fence discriminates rather than blanket-failing |
| `node src/workflow/validators/check-pending-setup.mjs` | Phase 3 | **fail — pre-existing** | PS-1..3 `resolved` without `resolved_by`. Unrelated to RI22; validator is not registered in validate-template so `npm run validate` never runs it |
| Probe: invalid value in **source** `agent-behavior.yaml`, no `prepare` | Phase 2 (RI23) | pass — rejected | `.../src/workflow/agent-behavior.yaml...default_fan_out is above maximum 10` — names the source, not the global copy |
| Probe: required key removed from **source** | Phase 2 (RI23) | pass — rejected | `.../src/workflow/agent-behavior.yaml.council.max_rounds is required` |
| `HOME=/nonexistent ... check-definitions.mjs` | Phase 2 (RI23) | pass | Same verdict with no global install reachable — CI and local now check one file |
| `npm run conformance:test` | Phase 2 (RI24) | pass | **28/28**, was 26. `every-validator-wired` and `definitions-checked-at-source` |
| `node src/workflow/validators/check-pending-setup.mjs` | Phase 2 (RI24) | pass | Now registered and green; 4 open / 3 resolved |
| Probe suite: 10 ledger documents against the schema | Phase 4 | pass | Before the engine fix, all four conditional violations were ACCEPTED; after it, each is rejected naming the missing key, and both well-formed rows and the two shipped ledger files still pass |
| `npm run conformance:test` | Phase 4 | pass | **30/30**, was 28 |
| Full suite re-run after the `lib.mjs` change | Phase 4 | pass | validate exit 0, 69/69 violations, 30/30 conformance, eight auxiliary suites — the engine is used by every validator, so the phase's own checks were not sufficient evidence |
| `npm run conformance:test` | Phase 5 | pass | **33/33**, was 30. Three RI12 pins |
| `git diff --numstat a099b28..HEAD` per file in `dispatch-subagents/references/` | Phase 5 | pass | Six of seven byte-identical, `council-contracts.md` and `independence-rules.md` among them, so A1 holds. `phase-caps.md` +36/-11 from Phase 1's RI5/RI20, which is a declared deliverable, not drift |
| `diff` preserved path vs `git show HEAD:` extract | Phase 6 | pass | Identical apart from a trailing newline |
| Probe: one word altered in preserved step 1 | Phase 6 | pass — rejected | `r22-review-single-agent-verbatim` fails on drift and passes when restored, so the lock discriminates rather than always passing |
| `npm run conformance:test` | Phase 6 | pass | **36/36**, was 33 |
| 69 existing fixtures after the header-keyed refactor | Phase 7 | pass | 69/69 — the refactor preserved Think's behaviour rather than being asserted to |
| Positive control: well-formed council REVIEW | Phase 7 | pass | Checked, not skipped, and counted as `1 council review(s)` rather than a brief |
| Probe: input names the Build transcript | Phase 7 | pass — rejected | One error naming the member |
| Probe: input column blank | Phase 7 | pass — rejected | Omission does not evade the fence |
| Probe: two reviewers share a risk category | Phase 7 | pass — rejected | Names the category and both members |
| Probe: member `failed` with no skipped check | Phase 7 | pass — rejected | |
| Probe: `repo_integrity` removed from a review | Phase 7 | pass — rejected | Required regardless of sandbox |
| Probe: Fix column in council-log Findings | Phase 7 | pass — rejected | One error once the probe filled the added column; the first attempt emptied a reason cell and produced a second, unrelated error — probe artefact, not a validator defect |
| R6: 30 review artifacts in scope | Phase 7 | pass | All validate unedited; `git status` on `workflow/artifacts/reviews/` and `examples/` clean |
| `npm run conformance:test` | Phase 7 | pass | **38/38**, was 36 |
| Probe: absent ledger | Phase 8 | pass | Exits 0 with a message — the feature is not mandatory by the back door |
| Probe: closed row never rotated out of active | Phase 8 | pass — rejected | |
| Probe: same row in both files | Phase 8 | pass — rejected | Would be double-counted in every figure |
| Probe: pending row in the archive | Phase 8 | pass — rejected | |
| Probe: archive deleted, active kept | Phase 8 | pass — rejected | A figure from one file is not a baseline |
| Probe: council review with NO ledger | Phase 8 | pass — rejected | Names the 3 unrecorded findings and their artifact |
| Probe: ledger present, 3 findings unrecorded | Phase 8 | pass — 3 errors | One per unrecorded finding |
| Probe: all findings recorded, repo-relative paths | Phase 8 | pass | Exposed and fixed the path-string keying bug — normalised to filename |
| Probe: ship declared with a pending row, no waiver | Phase 8 | pass — rejected | Names the pending IDs |
| Probe: same, with a finding-quality waiver | Phase 8 | pass — accepted | 0 pending errors; the gate discriminates rather than blanket-blocking |
| `npm run conformance:test` | Phase 8 | pass | **40/40**, was 38 |
| `npm run violations:test` | Phase 9 | pass | **71/71**, was 69; `dp` and `dq` one error each |
| Conformance `r22-external-question-not-flagged` | Phase 9 | pass | The case the old approximation got wrong now passes |
| `grep brief-wide` in README | Phase 9 | pass | 0 — the non-claim is removed, not merely reworded |
| `npm run conformance:test` | Phase 9 | pass | **41/41**, was 40 |
| `npm run violations:test` | Phase 10 | pass | **84/84**, was 71 |
| Attribution sweep, 55 council fixtures | Phase 10 | pass | Each emits exactly one error against its own validator and exits non-zero. The first sweep read stdout only and reported 0 errors everywhere — `finish()` writes to stderr; the sweep was wrong, not the fixtures |
| Regression check after restoring the deleted rules | Phase 10 | pass | All six Review fixtures reject; before the restore all six passed against a validator missing the rules |
| `npm run build` / `render-adapters` | Phase 10 | pass | `build-bundle: ok`; adapter shims current — RI11 |
| Ten suites | Phase 3 | pass | violations, conformance, tuning-merge, setup-checks, setup-refs, root-resolution, init-prepare-interop, checkpoint-approval, setup-validator-definitions-root, commit-coverage |
| Eight auxiliary suites | Phases 1-2 | pass | setup-checks, setup-refs, root-resolution, init-prepare-interop, checkpoint-approval, setup-validator-definitions-root, commit-coverage, tuning-merge |

## Dispatch Log

none — Phase 1 is a three-file config and documentation change whose parts are mutually dependent
(the config key, its schema, and the prose that explains it). No independent workstream exists.

## Architecture Notes

- role: Senior Engineer
- decision: recorded per phase in the Implementation Log as each lands.
- constraint: additive-only for 1.1.0; zero runtime dependencies; five adapters stay in sync.
- downstream: Review inherits the fixture and conformance evidence recorded here.

## Blockers

none open.

**B1 — CLOSED 2026-08-29 by Phase 2.** Retained with its evidence rather than deleted, because a
blocker log that only ever lists open items gives no signal about whether anything gets closed.
Resolution: the user chose option (a) and added a design direction; the brief gained RI20, RI21 and
RI22 by post-approval amendment, the plan was revised to 10 phases, and `check-config` now applies a
definitions file's schema to it. All three original probes and one new one (a removed `required`
key) are rejected with the offending path named.

<details>
<summary>B1 as originally raised</summary>

**B1 — `agent-behavior.schema.yaml` is never applied to `agent-behavior.yaml`.** Open. Raised at
Phase 1 by discriminating probe, not by reading. Every constraint in that schema is unenforced,
including the ones RI5 just added. Phase 1's implementation is complete and its first two exit-gate
clauses are met, but closing the phase would mean recording a constraint as enforced when it is
decoration — which is the exact defect class this package exists to prevent.

Needs a user decision, because resolving it changes scope:

- **(a)** Revise the Plan to add wiring a definitions file to its schema — a new validator or an
  extension of `check-config` — as a requirement of this package.
- **(b)** File it as an open item and proceed; the defect predates R22 and RI5's decision is still
  correctly recorded in prose that `phase-caps.md` carries.
- **(c)** Drop the `per_phase` schema constraints entirely and keep the decision in config plus
  prose, so this package adds no decoration even if it fixes no pre-existing decoration.

Not resolved unilaterally: `scope-control.md` requires stopping, recording, and raising a blocker
when a change reaches outside the active phase's declared scope.

</details>

## CI Reproduction (2026-08-30)

PR #65 opened against `release/1.1.0`, which is what makes CI run — `feat/**` is in no push filter,
so 21 commits of this package had never been verified off one machine. **CI failed on its first
run**, and the failure was real rather than environmental:

    agentsmyth: global definitions root not found: /home/runner/.agentsmyth/workflow

The conformance and tuning-merge harnesses had gained a static `import` of `lib.mjs`, which resolves
its definitions root from `repo-profile.yaml` and **exits at import time** when that machine-local
path is absent. A developer machine has `~/.agentsmyth`; a runner does not. The suites therefore
passed locally and died on a fresh checkout — the exact local-versus-CI divergence this package's own
Review council reported, reproduced in its test harness one commit later.

Fixed by setting the env override the validators already run under, before a dynamic import, since a
static import is hoisted and would run first. Verified by reproducing the CI condition locally with
`HOME=/nonexistent`: conformance 44/44, violations 92/92, tuning-merge 15/15.

Two suites were also added to CI and to release, closing the drift the review flagged:
`tuning-merge:test` and `commit-coverage:test` existed in `package.json` and ran in no workflow —
counted as coverage, never invoked — and `tuning-merge` holds the only automated evidence for
per-repo council tuning. Locked by `r22-every-suite-runs-in-ci`, which checks both workflows, since
a suite gating CI but not the publish is a gap at the moment it matters most.

## Post-Review Remediation (2026-08-30)

All 31 Review-council findings fixed. The per-finding table is in the review artifact; what belongs
here is what the remediation itself cost and taught.

**Two bugs I introduced while fixing, both caught by suites rather than by me.** The P1-1 fix left a
duplicate presence check — the newly-added attribution sweep caught it on its very first run, one
fixture emitting two errors. And the P3-6 fix put a `const` in the temporal dead zone, reintroducing
the exact ReferenceError `bin/agentsmyth.mjs` carries a comment warning about; `init-prepare-interop`
caught it. Both are the mechanism working on its author, one commit after being built.

**One schema assumption disproved by using it.** `closed_in_phase` was an enum of `test | ship |
reflect`, on my assumption that finding quality is never knowable at Review. Settling this council's
own 56 rows disproved it immediately: a finding fixed in the same review that raised it is settled
there. `review` added, with the reason recorded — the enum, not the rows, was wrong.

**The ledger completed a full cycle.** 56 rows written `pending` at Review, all closed and rotated to
the archive in one operation, leaving the active file empty and the tally computed across both files:
`56 proved real, 0 noise, 0 waived, 0 pending — 100% of settled findings proved real`. That 100% is
not a quality claim about the council; it means every finding it raised was acted on rather than
argued away, which is the number R5 exists to make visible.

Suite movement across the remediation: violations 84 → **92**, conformance 42 → **43**,
tuning-merge 14 → **15**, and the attribution sweep now runs inside `violations:test` rather than in
someone's terminal.

## Post-Build Fix During Review (2026-08-30)

The Review council's own P1-7 finding — the Ship closure gate reads a repo-global ledger with no
chain scoping — stopped being latent the moment the review wrote its 56 ledger rows. 26 historical
ship artifacts failed at once and `npm run validate` broke on the branch.

A finding that breaks the tree cannot wait for the Build loop, so the scoping fix landed immediately:
`check-release-readiness` now filters pending rows to the shipping artifact's own slug, matching on
`first_seen_run` or `source_artifact` — both required by the schema and neither previously read.
Locked by conformance `r22-ship-gate-chain-scoped`, and verified in both directions: a chain's own
pending row still blocks it, an unrelated chain's does not.

- `src/workflow/validators/check-release-readiness.mjs` — pending rows scoped to the shipping chain — IDs: RI7
- `test/fixtures/conformance/ship-gate-chain-scoped/` — new — IDs: RI7, RI9
- `test/run-conformance-tests.mjs` — `r22-ship-gate-chain-scoped` — IDs: RI9
- `workflow/artifacts/finding-quality.yaml` — 56 rows, all pending, written by hand at Review, which
  is itself finding P1-2 — IDs: R5

The other six P1 findings remain open and belong to the next Build pass.

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Phase 1 - Per-phase council caps, symmetric | complete | 2026-08-29 | `per_phase.think: 3` and `per_phase.review: 2`, no phase special-cased; a phase absent from the map falls back to 1, so forgetting to decide fails safe. `phase-caps.md` carries a shipped-values table. Superseded the first Phase 1 implementation, which kept `default_fan_out` as Think's implicit home |
| Phase 10 - Fixtures, conformance, generated output | complete | 2026-08-29 | 13 fixtures registered; violations 71 -> 84. Writing them exposed that Phase 9 had deleted Phase 7's Review-only rules — all suites had stayed green across two commits because those rules were probe-proven and fixture-free. Restored from a66bd17. Attribution sweep: 55 council fixtures, exactly one error each. Build clean, adapters current. **Build phase complete** |
| Phase 9 - Per-question bucket join | complete | 2026-08-29 | A Q names the manifest ID(s) whose classification covers it, and the rule joins on that rather than on whether any row in the brief names repo. Required only of a question the rule would judge, so no existing brief or fixture needed editing. Three fixtures cover both halves, including the external question the approximation wrongly flagged. README non-claim removed because the approximation is gone. OI-81 closed with a resolution. Violations 69 -> 71, conformance 40 -> 41 |
| Phase 8 - Ledger validator, closure gate, reporting | complete | 2026-08-29 | `check-finding-quality` validates both files, both rotation directions, and the closed-only archive; ledger absence is an error only when a council review exists, closing the omission escape. Ship gate blocks a pending row without a waiver and clears with one. Quality tally spans both files, pinned by a fixture that fails if read from the active file alone. Probing exposed a path-string keying bug that made the R5 cross-check work only from the repo root; keys normalised to the artifact filename. RI8 rehomed to the ledger validator. Conformance 38 -> 40 |
| Phase 7 - Validator extended to review artifacts | complete | 2026-08-29 | Filter widened to briefs and reviews; fixed-index parsing replaced by header-keyed reads, since the Review record inserts columns mid-table and every later index would have silently shifted. 69 existing fixtures pass unchanged. Five Review-only rules enforced and each probed against a new positive control. RI2 enforced structurally against a declared column, with the prose-smuggling limit stated as a non-claim. RI4 needed no schema change and none was made. Conformance 36 -> 38 |
| Phase 6 - lifecycle-review restructuring and record shape | complete | 2026-08-29 | Preserved path extracted from the committed blob before any edit and byte-locked, with the lock proven to discriminate. Mode resolution and six council stages added; single-agent route unchanged. Severity Summary starter block corrected to the five columns real reviews use — the validator had been widened to tolerate them and the block was the stale half. `### Skipped Checks` added so RI18's rule has a place to write its answer. Conformance 33 -> 36 |
| Phase 5 - Review council skill and charter | complete | 2026-08-29 | `review-council/` mirrors `think-council`'s shape; three fences stated in the charter itself, risk categories disjoint across reviewers, R1's collision resolved by scoping the no-fix rule to council-log findings. `council-contracts.md` unchanged — it already named Review as a consumer. Conformance 30 -> 33 |
| Phase 4 - Finding-quality ledger contract | complete | 2026-08-29 | Schema written to contract with three if/then conditionals, two ledger files created. Probing showed every conditional was inert: the engine skipped `required` whenever no `properties` sibling was present, which is the shape every `then:` branch takes. Fixed in lib.mjs as RI25 and locked by two direct engine assertions, since check-schema-keywords structurally cannot catch it. Conformance 28 -> 30 |
| Phase 3 - Per-repo council tuning and the setup interview | complete | 2026-08-29 | `tuning.council.per_phase` mirrors the global shape and merges per entry (m12-m14, 14/14). The interview item was added by running the real `check` skew path, and a second run added nothing. Both probe directions discriminate: an out-of-range repo override is rejected naming the path, a valid one is accepted. Two findings recorded for Review — the dogfood loop validates the global definitions rather than the source, and `check-pending-setup` is never registered |
| Phase 2 - Definitions validated against their schemas | complete (extended) | 2026-08-29 | Extended to RI23 and RI24 after Phase 3 showed RI21 was enforcing a copy. `check-definitions.mjs` validates the source under AGENTSMYTH_WF; a source mutation now fails validate with no `prepare` and no global install. `every-validator-wired` locks the general shape; `check-pending-setup` registered and green. Conformance 26 -> 28 |
| Phase 2 - Definitions validated against their schemas (initial) | complete | 2026-08-29 | `check-config` applies a definitions file's schema to it. Four probes rejected with the offending path named, including one against a pre-existing `required` key — so the fix covers the whole schema, not only the keys this package added. Unmodified repo still validates clean |
