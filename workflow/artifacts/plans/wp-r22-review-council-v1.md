---
slug: wp-r22-review-council
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-08-29
updated: 2026-08-29
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9, RI10, RI11, RI12, RI13, RI14, RI15, RI16, RI17, RI18, RI19, RI20, RI21, RI22, RI23, RI24, RI25]
upstream:
  - workflow/artifacts/briefs/wp-r22-review-council-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
skill_trigger_log:
  - skill: domain.interface-contract-designer
    decision: ran
    reason: ran — trigger "path~contract_globs OR touches_contract" is true; the package changes validator contracts, the council record contract, and agent-behavior config keys
  - skill: domain.data-schema-designer
    decision: ran
    reason: ran — trigger "path~schema_globs" is true; RI15 creates src/workflow/schemas/finding-quality.schema.yaml and RI6 defines a two-file rotation with data-movement semantics
  - skill: domain.system-design-advisor
    decision: ran
    reason: ran — trigger "complexity_score >= threshold OR new_surface" is true; review-council is a new skill surface and the ledger is a new persistent-state surface
  - skill: domain.quality-gates-validator
    decision: ran
    reason: ran — trigger "task_class != trivial" is true; Complex work, and the fixture/conformance bars are the ones this package's own value rests on
  - skill: domain.ui-ux-designer
    decision: skipped
    reason: skipped — trigger "path~ui_globs" is false; this package touches no UI surface
  - skill: domain.performance-optimizer
    decision: skipped
    reason: skipped — trigger "path~hotpath_globs OR complexity_score >= 60" is false for path; the validators run once per commit, not on a hot path
---

# WP-R22 Review Council (Fresh-Eyes Multi-Agent Review) - Plan

## Summary

Extend the council mechanism WP-R21 built for Think to the Review phase, and add the finding-quality
ledger that makes a council's value measurable rather than asserted.

Ten phases, strictly ordered: the contract and schema decisions land first (Review fan-out default,
ledger schema), then the skill surfaces that produce records, then the validators that check them,
then the fixtures that prove the validators reject.

Two properties shape the whole plan. First, **R22 consumes WP-R21's frozen contracts rather than
forking them** — `council-contracts.md`, the independence rules, and the council record shape are
byte-stable since `a099b28` and stay that way. Second, **one validator serves both councils**:
`check-council-record.mjs` already carries an inert `isBrief` guard written by R21 specifically for
this package, so extending it is the planned route and a second validator is not.

## Inputs

- `workflow/artifacts/briefs/wp-r22-review-council-v1.md` — approved 2026-08-29, 26 manifest IDs, no
  blockers, checkpoint recorded verbatim.
- `src/workflow/skills/dispatch-subagents/references/council-contracts.md` and
  `independence-rules.md` — the frozen contracts R22 consumes.
- `src/workflow/skills/dispatch-subagents/references/phase-caps.md` — states that a package
  extending councils to a new phase must decide that phase's fan-out default explicitly.
- `src/workflow/validators/check-council-record.mjs` — the host being extended, including the
  pre-placed `isBrief` guard.
- `src/workflow/skills/lifecycle-review/` — SKILL.md plus nine reference files, including
  `review-risk-categories.md` (ten categories, the assignment surface for RI17).
- `src/workflow/schemas/open-items.schema.yaml` and `workflow/artifacts/open-items.yaml` — the
  ledger prior art RI6/RI15 follow, including the `resolution` defect they must not repeat.
- `workflow/config/verification.yaml` — two configured commands; `command_policy.allow_discovered_commands: true`.
- `workflow/config/repo-profile.yaml` — `tuning.council.sandbox_root`, branch policy.

## Requirement Coverage

Established as a `coverage-tracer` ledger: one row per active ID, with state and citation.

**Corrected 2026-08-30 (Review finding P3-2).** 21 of these rows named a phase two lower than the
one that actually owns the ID — written against the original eight-phase plan and never propagated
when Phases 2 and 3 were inserted on user direction. Every row read `covered` while pointing at a
phase that did not claim it. Regenerated from the phase blocks themselves rather than re-edited by
hand, so the two cannot drift apart again by transcription.

| Manifest ID | Covered by phases | State | Citation |
|---|---|---|---|
| R1 | Phase 7 | covered | Brief R1; collision resolved against `lifecycle-review/references/output-schema.md` |
| R2 | Phase 5 | covered | Brief R2 |
| R3 | Phase 5 | covered | Brief R3; inherits `think-council/references/output-schema.md` no-verdict rule |
| R4 | Phase 7 | covered | Brief R4; `council-contracts.md` consumed unchanged |
| R5 | Phase 8 | covered | Brief R5; delivered via RI6/RI7/RI8/RI15/RI16 |
| R6 | Phase 7 | covered | Brief R6; 30 existing review artifacts in scope, none carrying a Council Log |
| R7 | Phase 6 | covered | Brief R7; mirrors R21's R8 |
| RI1 | Phase 7 | covered | Brief RI1; `check-council-record.mjs` briefs/ filter |
| RI2 | Phase 7 | covered | Brief RI2 |
| RI3 | Phase 6 | covered | Brief RI3 |
| RI4 | Phase 7 | covered | Brief RI4; verified no schema change needed |
| RI5 | Phase 1 | covered | Brief RI5; `phase-caps.md` requires the explicit decision |
| RI20 | Phase 1 | covered | Brief RI20; added post-approval on user direction |
| RI21 | Phase 2 | covered | Brief RI21; closes Build blocker B1 |
| RI22 | Phase 3 | covered | Brief RI22; per-repo inheritance and the init interview |
| RI23 | Phase 2 | covered | Brief RI23; RI21 enforced a copy, this enforces the source |
| RI24 | Phase 2 | covered | Brief RI24; the general lock against unwired checks |
| RI25 | Phase 4 | covered | Brief RI25; without it RI15's conditionals are decoration |
| RI6 | Phase 4 | covered | Brief RI6 |
| RI7 | Phase 8 | covered | Brief RI7 |
| RI8 | Phase 8 | covered | Brief RI8 |
| RI9 | Phase 10 | covered | Brief RI9 |
| RI10 | Phase 9 | covered | Brief RI10; OI-81 |
| RI11 | Phase 10 | covered | Brief RI11 |
| RI12 | Phase 5 | covered | Brief RI12 |
| RI13 | Phase 6 | covered | Brief RI13 |
| RI14 | Phase 6 | covered | Brief RI14 |
| RI15 | Phase 4 | covered | Brief RI15 |
| RI16 | Phase 8 | covered | Brief RI16 |
| RI17 | Phase 6 | covered | Brief RI17; `review-risk-categories.md` already lists the ten |
| RI18 | Phase 6 | covered | Brief RI18; `verification.yaml` `skipped_checks.required_fields` |
| RI19 | Phase 5 | covered | Brief RI19; R21's R11 and R-2 |

No ID is `deferred`, `waived`, or `dropped`.

## Assumptions Verified

Written by `plan-assumption-verifier`. Evidence gathered by direct inspection on 2026-08-29, not
recalled.

| Assumption ID | Status | Evidence / Question |
|---|---|---|
| A1 | evidence-backed | `git diff --stat a099b28..HEAD -- src/workflow/skills/dispatch-subagents/references/` returns empty — the frozen contracts have not moved since WP-R21 merged. All seven reference files present. |
| A2 | evidence-backed | `check-council-record.mjs` carries the comment "INERT TODAY, deliberately… a one-line change the Review council will make, and a filter widened without this guard would reject every council-mode review". R21 pre-placed the extension point, so the host is chosen rather than assumed. |

## Repo Impact Map

| File / surface | Change type | Manifest IDs | Contract + generated-output impact | Ordering / protected-path notes |
|---|---|---|---|---|
| `src/workflow/agent-behavior.yaml` | config | RI5 | Shipped invariant; new optional council key with a safe default | Phase 1, before anything reads it |
| `src/workflow/schemas/agent-behavior.schema.yaml` | schema | RI5 | Additive optional property | Phase 1 |
| `src/workflow/skills/dispatch-subagents/references/phase-caps.md` | docs | RI5 | States the Review default beside Think's | Phase 1 |
| `src/workflow/validators/check-config.mjs` | runtime | RI21 | Applies definitions schemas; closes B1 | Phase 2, before any later schema is trusted |
| `scripts/validate-template.mjs` | tooling | RI21, RI23, RI24 | Registration; the source-vs-repo-root split | Phase 2 |
| `src/workflow/validators/check-definitions.mjs` | runtime (new) | RI23 | Validates definitions at the source under AGENTSMYTH_WF | Phase 2 |
| `src/workflow/schemas/pending-setup.schema.yaml` | schema | RI24 | `unrecorded` provenance value | Phase 2 |
| `test/run-conformance-tests.mjs` | tests | RI24 | The wiring lock | Phase 2 |
| `src/workflow/schemas/repo-profile.schema.yaml` | schema | RI22 | Additive `tuning.council.per_phase` | Phase 3 |
| `workflow/config/pending-setup.yaml` | config | RI22 | Interview item | Phase 3 |
| `src/setup/references/config-map.md` | docs | RI22 | The field mapping setup reads | Phase 3 |
| `bin/agentsmyth.mjs` | tooling | RI22 | Seeds the interview item at init and on version skew | Phase 3 |
| `test/run-tuning-merge-tests.mjs` | tests | RI22 | Positive proof of per-entry merge | Phase 3 |
| `src/workflow/schemas/finding-quality.schema.yaml` | schema (new) | RI15 | New contract; `additionalProperties: false` | Phase 4, before any writer or reader |
| `workflow/artifacts/finding-quality.yaml` | generated data (new) | RI6 | Repo-local ledger, absent-is-valid | Phase 6 |
| `workflow/artifacts/finding-quality-archive.yaml` | generated data (new) | RI6 | Append-only | Phase 6 |
| `src/workflow/skills/review-council/` | skill (new dir) | R2, R3, RI12, RI19 | New surface; consumes frozen contracts | Phase 5; new directory, declared with trailing slash |
| `src/workflow/skills/lifecycle-review/SKILL.md` | skill | R7, RI13 | Behaviour contract; single-agent path preserved | Phase 6, after the council skill exists |
| `src/workflow/skills/lifecycle-review/references/output-schema.md` | schema/docs | R1, RI14 | Artifact contract; fixes the Severity Summary drift | Phase 8 |
| `src/workflow/skills/lifecycle-review/references/single-agent-path.md` | docs (new) | RI3 | Byte-locked rollback surface | Phase 8 |
| `src/workflow/skills/lifecycle-review/references/review-risk-categories.md` | docs | RI17 | Assignment surface | Phase 8 |
| `src/workflow/validators/check-council-record.mjs` | runtime | R1, R4, R6, RI1, RI2, RI4, RI8, RI10, RI18, RI19 | Validator contract; widened scope | Phase 7 then 6 then 7 |
| `src/workflow/validators/check-finding-quality.mjs` | runtime (new) | RI16 | New validator, absent-ledger-is-valid | Phase 10 |
| `src/workflow/validators/check-release-readiness.mjs` | runtime | RI7 | Ship gate gains a blocking condition | Phase 10 |
| `scripts/validate-template.mjs` | tooling | RI16 | Validators are an explicit list, not auto-discovered | Phase 10 |
| `src/workflow/skills/lifecycle-think/references/output-schema.md` | schema/docs | RI10 | Starter-block change for the bucket column | Phase 9 |
| `src/workflow/validators/README.md` | docs | RI1, RI10 | Non-claims list must track the implementation | Phases 5 and 7 |
| `test/fixtures/lifecycle-violations/` | tests | RI9 | One fixture per new rule | Phase 10 |
| `test/run-violation-tests.mjs`, `test/run-conformance-tests.mjs` | tests | RI9, RI11, RI12 | Registration and conformance pins | Phase 10 |
| `dist/`, `src/assets/adapters/` | generated output | RI11 | Rebuilt, never hand-edited | Phase 10 |

No protected path (`.git/**`, `.env*`, `**/*secret*`) is touched.

## Source-of-Truth Strategy

`workflow/config/source-of-truth.yaml` declares `mode: optional` with `providers: []`, so no source
read is required to plan or build this work. The Notion WP-R22 page is the informal tracker; per
`update_policy.updates_belong_to_phase: ship`, moving it to Done with the PR reference is a Ship
action, not a Build one. No blocked handoff, no waiver needed.

## Approach

Contracts before producers, producers before checkers, checkers before fixtures.

The council mechanism already exists and is proven; what does not exist is a Review-shaped record, a
Review-shaped council charter, and a place to record whether findings were any good. So the plan
deliberately does **not** start with the validator — RI1's one-line filter widening is trivial to
write and impossible to test until a review artifact with a Council Log exists to run it against.
Phases 3 and 4 create that artifact shape; Phase 7 widens the validator to it.

The ledger is sequenced the same way: schema (Phase 4) before the writer (Phase 6's skill text)
before the reader (Phase 8's validator). A schema written after its first writer is a schema fitted
to one example.

## Phases

### Phase 1 - Per-phase council caps, symmetric

- **Manifest IDs:** RI5, RI20
- Touches: `src/workflow/agent-behavior.yaml`,
  `src/workflow/schemas/agent-behavior.schema.yaml`,
  `src/workflow/skills/dispatch-subagents/references/phase-caps.md`
- Work: move council fan-out to `council.per_phase.<phase>.default_fan_out` for Think and Review
  alike, so no phase is special-cased and the top-level `default_fan_out` stops being Think's
  implicit home. Think stays 3; Review is 2, decided rather than inherited, with the reasoning
  recorded. A phase named in neither resolves to 1, so forgetting to decide fails safe.
- **Exit gate:** `phase-caps.md` states both phases' values and the fail-safe rule;
  `per_phase.think` and `per_phase.review` both resolve; `npm run validate` exits 0. The schema
  constraints are *not* claimed enforced by this phase — Phase 2 is what makes that true.

### Phase 2 - Definitions validated against their schemas

- **Manifest IDs:** RI21, RI23, RI24
- Touches: `src/workflow/validators/check-config.mjs`,
  `src/workflow/validators/check-definitions.mjs`,
  `src/workflow/validators/check-pending-setup.mjs`,
  `src/workflow/schemas/pending-setup.schema.yaml`,
  `workflow/config/pending-setup.yaml`,
  `test/run-conformance-tests.mjs`,
  `scripts/validate-template.mjs`
- Work: apply a definitions file's schema to the definitions file, the way `check-config` already
  applies `workflow/config/*.yaml` schemas to repo config. Closes Build blocker B1: nothing loads
  `agent-behavior.schema.yaml` today, so its `required` list, its enums, and its numeric bounds are
  all inert.
- **Exit gate:** the three probes recorded against Phase 1 in the task artifact are each **rejected**
  with one error naming the offending path; an invalid value in `src/workflow/agent-behavior.yaml`
  fails `npm run validate` **without** `prepare` having run, naming the source path; the check gives
  the same verdict with no global install reachable; a conformance check fails on any validator not
  registered in `validate-template.mjs`; `check-schema-keywords` still passes; the unmodified repo
  still validates clean.

### Phase 3 - Per-repo council tuning and the setup interview

- **Manifest IDs:** RI22
- Touches: `src/workflow/schemas/repo-profile.schema.yaml`,
  `workflow/config/pending-setup.yaml`,
  `src/setup/references/config-map.md`,
  `bin/agentsmyth.mjs`,
  `test/run-tuning-merge-tests.mjs`
- Touches corrected 2026-08-29 during Build, before any edit: `src/setup/SKILL.md` was declared but
  applies the router's generic resolution pass and names no individual field, so the field mapping
  belongs in `config-map.md` instead. `bin/agentsmyth.mjs` seeds and appends interview items and is
  what "answerable at init" actually means. `test/run-tuning-merge-tests.mjs` is where per-entry
  merge is proven positively — the negative suite cannot show that overriding Review left Think
  alone.
- Work: extend `tuning.council` with the same `per_phase` shape so a repo can override one phase's
  cap without disturbing another's, following the per-entry resolution rule `skill_scoring` already
  documents. Add a setup interview item so the question can be answered at `init` or later.
- **Exit gate:** a repo overriding Review alone leaves Think's resolved value unchanged; a repo
  overriding neither inherits both; the interview item is present and its `config`/`field` point at
  a real key; `npm run validate` and `npm run setup-checks:test` exit 0.

### Phase 4 - Finding-quality ledger contract

- **Manifest IDs:** RI6, RI15, RI25
- Touches: `src/workflow/schemas/finding-quality.schema.yaml`,
  `workflow/artifacts/finding-quality.yaml`,
  `workflow/artifacts/finding-quality-archive.yaml`,
  `src/workflow/validators/lib.mjs`,
  `test/run-conformance-tests.mjs`
- Touches extended 2026-08-29 during Build: probing the conditionals showed the schema engine
  ignores `required` when no `properties` sibling is present, so RI15's rules could not be enforced
  as written. The engine fix is directly necessary to this phase's own acceptance criterion, not
  adjacent cleanup.
- Work: write the schema — `required: [version, kind, items]`; per item `id`, `finding_id`,
  `source_artifact`, `first_seen_run`, `disposition`, `outcome`; `outcome` enum
  `pending | proved-real | waived | noise | unresolved-at-reflect`; `waived` requires `waiver_ref`;
  `noise` and `unresolved-at-reflect` require `reason`; any closed outcome requires `closed_in_phase`
  and `resolution`; `additionalProperties: false`. Define rotation: a row closes in the active file
  and moves to the archive in one operation.
- **Exit gate:** `check-schema-keywords` exits 0 over the new schema; both ledger files validate
  against it; each of the three conditional rules is proven to REJECT a row that violates it and to
  accept a well-formed one; `npm run validate` exits 0 and the full suite is re-run, since the
  engine change is used by every validator.

### Phase 5 - Review council skill and charter

- **Manifest IDs:** R2, R3, RI12, RI19
- Touches: `src/workflow/skills/review-council/`,
  `src/workflow/skills/dispatch-subagents/references/council-contracts.md`
- Work: create the skill mirroring `think-council`'s shape — SKILL.md plus
  `references/output-schema.md`. Charter states the repo fence, the outward-action axis, no nesting,
  and that members receive the diff and the manifest but never the Build transcript. Reviewer output
  is findings only; no verdict, per the inherited rule. Sandbox and repo-integrity requirements are
  stated as inherited from R21, not restated.
- **Exit gate:** the skill loads standalone with no dangling reference; `council-contracts.md` is
  unchanged apart from any Review-specific reference addition (`git diff --stat` shows no rule
  edits); `npm run validate` exits 0.

### Phase 6 - lifecycle-review restructuring and record shape

- **Manifest IDs:** R7, RI3, RI13, RI14, RI17, RI18
- Touches: `src/workflow/skills/lifecycle-review/SKILL.md`,
  `src/workflow/skills/lifecycle-review/references/output-schema.md`,
  `src/workflow/skills/lifecycle-review/references/single-agent-path.md`,
  `src/workflow/skills/lifecycle-review/references/review-risk-categories.md`
- Work: preserve today's 10-step Workflow verbatim into `single-agent-path.md` before editing
  anything. Add mode resolution in R21's first-answer-wins order. Add the `## Council Log` starter
  block with the subsections the Think record uses. Fix the Severity Summary starter block to the
  five columns real reviews use. State that reviewer risk categories are drawn disjointly from the
  ten already listed, and that a failed or never-run member is recorded as a skipped check carrying
  `verification.yaml`'s six required fields.
- **Exit gate:** `single-agent-path.md` is byte-identical to the pre-edit Workflow (verified by
  `git show HEAD:...` diff); the starter block produces an artifact that passes `npm run validate`
  unedited; both modes are documented against one output schema.

### Phase 7 - Validator extended to review artifacts

- **Manifest IDs:** R1, R4, R6, RI1, RI2, RI4
- Touches: `src/workflow/validators/check-council-record.mjs`,
  `src/workflow/validators/README.md`,
  `test/fixtures/conformance/council-review-wellformed/`,
  `test/run-conformance-tests.mjs`
- Touches extended 2026-08-29 during Build: the review positive control and its two conformance
  pins belong to this phase, not to Phase 10. Without a well-formed review record to check, the
  filter widening is unverified in the direction that matters — a council-mode review must be
  CHECKED rather than skipped — and the Review-only rejection rules would be satisfied by a
  validator that rejects every review.
- Work: widen the `briefs/` file filter; make `totals.briefs` and the summary label
  artifact-type-aware; keep the `isBrief` guard so escalation checks stay brief-scoped. Add the
  Review-only assertion that a council-log finding may not carry a fix recommendation, scoped so the
  parent's consolidated findings are unaffected. Update the README's rule list and non-claims.
- **Exit gate:** all 30 existing review artifacts validate with zero edits and `git status` on
  `workflow/artifacts/reviews/` and `examples/` is clean; a council-mode review record is checked
  rather than skipped; `npm run validate` and `npm run violations:test` exit 0.

### Phase 8 - Ledger validator, closure gate, reporting

- **Manifest IDs:** R5, RI7, RI8, RI16
- Touches: `src/workflow/validators/check-finding-quality.mjs`,
  `src/workflow/validators/check-release-readiness.mjs`,
  `scripts/validate-template.mjs`,
  `test/fixtures/conformance/finding-quality-both-files/`,
  `test/run-conformance-tests.mjs`
- Touches corrected 2026-08-29 during Build: `check-council-record.mjs` is NOT touched. RI8 was
  planned to put the quality figure on that validator's summary line, but the ledger figure belongs
  to the validator that owns the ledger — putting it on the record validator would mean two readers
  of the same two files, which is the duplicated-fact shape this package keeps closing. The fixture
  and its pins land here because the both-files property is what they prove.
- Work: create the ledger validator mirroring `check-open-items.mjs` — validate when present, exit 0
  with a stated message when absent. Register it. Add the Ship closure gate with a waiver escape
  mirroring the open-P0/P1 handling. Extend the summary line with proved-real / noise / pending
  counts computed over active **and** archive.
- **Exit gate:** a repo with no ledger exits 0; a `pending` row blocks a `ship` declaration without a
  waiver; the summary line reports counts drawn from both files, and a count computed from the
  active file alone fails the conformance pin added in Phase 10.

### Phase 9 - Per-question bucket join

- **Manifest IDs:** RI10
- Touches: `src/workflow/skills/lifecycle-think/references/output-schema.md`,
  `src/workflow/validators/check-council-record.mjs`,
  `src/workflow/validators/README.md`,
  `test/fixtures/lifecycle-violations/dp-q-web-only-repo-bucket`,
  `test/fixtures/lifecycle-violations/dq-q-no-bucket-reference`,
  `test/fixtures/conformance/council-external-question/`,
  `test/run-violation-tests.mjs`,
  `test/run-conformance-tests.mjs`,
  `workflow/artifacts/open-items.yaml`
- Work: add a bucket reference to the Questions For User entry shape, then narrow the repo-shaped
  evidence rule to that question's own classification rows instead of the brief-wide approximation.
  Remove the approximation's stated non-claim from the README once it no longer applies.
- **Exit gate:** the rule fires on a question whose own bucket is repo-classified and does not fire
  on one whose bucket is external; both directions have a fixture; OI-81 closes with a resolution.

### Phase 10 - Fixtures, conformance, generated output

- **Manifest IDs:** RI9, RI11
- Touches: `test/fixtures/lifecycle-violations/`,
  `test/run-violation-tests.mjs`,
  `test/run-conformance-tests.mjs`,
  `test/fixtures/conformance/`,
  `test/fixtures/definitions/`,
  `test/run-mutation-audit.mjs`,
  `test/mutation-baseline.json`,
  `package.json`,
  `workflow/artifacts/open-items.yaml`,
  `workflow/artifacts/ship/`,
  `workflow/artifacts/reflect/`,
  `workflow/learnings/sessions/`,
  `src/workflow/validators/check-council-record.mjs`
- Touches extended 2026-08-29 during Build: the validator is listed because this phase had to
  RESTORE the Review-only rules Phase 9 deleted. See the task artifact — the deletion is the
  strongest evidence this phase's own requirement exists for a reason.
- Work: one rejection fixture per new mechanical rule, each a single mutation off a well-formed base
  and emitting exactly one error; a positive control for the Review council record; conformance pins
  for the review-council stage list and the summary-line shape. Rebuild `dist/` and adapters.
- **Exit gate:** `npm run violations:test` count rises by the number of new rules and passes; the
  attribution sweep shows exactly one error per council fixture; `npm run conformance:test` passes;
  `npm run build` clean and `render-adapters` reports shims current.

## Dependency Order

Phase 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8. Strictly sequential.

Phases 1 and 2 are contract-setting and must precede every consumer. Phase 5 must precede Phase 6:
`lifecycle-review` references the council skill, and referencing a skill that does not yet exist is
the dangling-reference class `setup-refs:test` catches. Phase 7 must follow Phase 6 because the
validator has no Review-shaped record to check until the output schema defines one. Phase 8 follows
5 because the summary-line change edits the same function Phase 7 widens. Phase 9 is independent of
3–6 and could be parallelised, but is placed after them so a single validator file is edited by one
phase at a time. Phase 10 is last because a fixture can only be written against a rule that exists.

## Branch Strategy

- Base branch: `release/1.1.0`. WP-R22 targets 1.1.0 — settled by the user, restated 2026-08-29.
- Working branch: `feat/wp-r22-review-council`, already created from `origin/release/1.1.0` at
  `a099b28` and pushed. No new branch needed.
- Commits are expected before any PR. Incremental per-phase commits, which the pre-commit gate now
  permits for in-progress artifacts in every directory.
- PR: opened only on explicit user request, per `release.yaml`'s
  `pull_request.create_policy: user_requested_or_configured`. Target `release/1.1.0`, never `main`.
- No commits to `main` or `release/1.1.0` directly.
- Unrelated local changes: none at plan time; the working tree carries only this chain's artifacts.
  If unrelated changes appear over planned files, preserve them and stage only approved scope, per
  `repo-profile.yaml`'s `stage_only_approved_scope: true`.

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner phase | Manifest IDs | Waiver needed |
|---|---|---|---|---|---|---|
| Widening the `briefs/` filter brings 30 existing review artifacts into scope and newly fails some | low | high | Verified at plan time: none carries a `## Council Log`, so presence-symmetry short-circuits. Phase 7's exit gate re-checks all 30 with zero edits | Phase 9 | R6, RI1 | no |
| A Review council on every Complex chain multiplies invocations, as R21 measured for Think | high | medium | RI5 forces an explicit Review default rather than inheriting Think's 3; `council.enabled` disables it; the ledger makes the cost answerable rather than anecdotal | Phase 1 | RI5, R5, R7 | no |
| Ledger rotation loses a row — closed in the active file, never written to the archive | medium | high | Rotation is one operation with both post-conditions checked: present in exactly one file. Two fixtures, both directions | Phase 10 | RI6, RI16 | no |
| The metric is computed from the lean active file and silently stops being a baseline | medium | high | Explicit design decision recorded in the brief; the conformance pin fails a count drawn from the active file alone | Phase 8, 8 | RI8 | no |
| R1's no-fix rule collides with the review output schema's requirement that every finding carry one | high | high | Already resolved at Plan: the rule binds council-log findings only. Both documents must state it, and Phase 7's fixture proves the parent's findings still pass | Phases 4, 5 | R1, RI2 | no |
| Preserved single-agent path drifts from a real rollback surface into a paraphrase | medium | medium | Copy verbatim before editing; byte-lock by conformance, as `r21-single-agent-verbatim` does | Phase 8 | RI3, R7 | no |
| 1.1.0 is held for the length of a Complex chain | high | medium | Accepted by the user as scope. Phases are independently reviewable, so partial progress is shippable only as a whole package — no partial-council state ships | user | — | no |
| Wiring definitions to their schemas newly fails a definitions file that was silently non-conforming | medium | medium | Phase 2's exit gate requires the unmodified repo to validate clean before the probes are re-run; any pre-existing violation is fixed or recorded, never suppressed | Phase 2 | RI21 | no |
| A validator edited by three phases (5, 6, 7) accumulates conflicting assumptions | medium | medium | Sequential phases, each with its own exit gate and full suite run; no two phases edit it concurrently | Phases 5–7 | RI1, RI8, RI10 | no |

## Verification Plan

Commands: `npm run validate` and `npm run violations:test` are configured in
`workflow/config/verification.yaml` as required for `review` and `ship`. `npm run conformance:test`
and `npm run build` are discovered from `package.json` scripts, permitted by
`command_policy.allow_discovered_commands: true`. No command is invented.

| Manifest ID | Evidence type | Command / inspection target | Expected result | Owning phase | Risk if skipped |
|---|---|---|---|---|---|
| R1 | command + fixture | `npm run violations:test`; fix-carrying council finding fixture | rejected; parent findings still pass | Review | The two contracts stay contradictory |
| R2 | review | `review-council/SKILL.md` charter states the input contract | present | Review | Reviewers get the transcript |
| R3 | review | no-verdict rule present in the council output schema | present | Review | A reviewer's claim reads as authority |
| R4 | command | `npm run violations:test` — shared disposition fixtures | Review path rejected by the same fixtures | Review | Forked disposition enum |
| R5 | command | `npm run validate`; summary line output | counts reported over both ledgers | Test | The council's value stays asserted |
| R6 | command | `npm run validate`; `git status workflow/artifacts/reviews/ examples/` | exit 0; tree clean | Review | Existing consumers break |
| R7 | command + conformance | `npm run conformance:test` byte-lock | passes | Review | Rollback surface is a paraphrase |
| RI1 | command | `npm run validate` over a council-mode review | checked, not skipped | Review | The record is silently unvalidated |
| RI2 | fixture | one-mutation fixture | one error, attributable | Review | Rule unenforced |
| RI3 | conformance | byte-comparison lock | fails on drift | Review | Silent drift |
| RI4 | command | existing reviews validate unedited | exit 0 | Review | Non-additive change |
| RI5 | inspection | `phase-caps.md` names a Review default | present and distinct | Review | Silent cost inheritance |
| RI6 | fixture | row in both files; row in neither | each rejected | Test | Ledger rows lost |
| RI7 | fixture | `ship` with a pending row, no waiver | rejected | Test | Findings missed |
| RI8 | conformance | summary-line shape pin | passes; active-only count fails | Test | Metric silently degrades |
| RI9 | command | `npm run violations:test` + attribution sweep | count rises; one error each | Test | Fixtures prove nothing |
| RI10 | fixture | repo-bucket question; external-bucket question | fires / does not fire | Review | OI-81 stays open |
| RI11 | command | `npm run build`; `render-adapters` | clean; shims current | Ship | Stale bundles ship |
| RI12 | conformance | review-council stage list pin | passes | Review | Skill drifts from validator |
| RI13 | inspection | mode resolution present in the documented order | present | Review | Modes diverge |
| RI14 | command | starter block copied → `npm run validate` | exit 0 unedited | Review | Reviewers copy a broken block |
| RI15 | command | `check-schema-keywords.mjs` over the new schema | exit 0 | Review | Declarations are decoration |
| RI16 | command + fixture | absent ledger; malformed row | exit 0; one error | Test | Ledger unchecked |
| RI17 | fixture | two reviewers sharing a risk category | rejected | Review | Coverage overlap unnoticed |
| RI18 | fixture | `failed` member with no skipped-check entry | rejected | Test | A dead bucket disappears |
| RI19 | fixture | Review run whose repo digest moved | rejected | Test | A reviewer mutates the repo |
| RI20 | inspection + command | both phases resolve from `per_phase`; a third phase resolves to 1 | as stated | Review | Silent inheritance returns |
| RI21 | probe | the three Phase 1 probes re-run | each rejected with one error | Review | Schema constraints stay decoration |
| RI22 | command | `npm run validate`; `npm run setup-checks:test` | exit 0; override affects one phase only | Test | Repos cannot tune what they are billed for |

## Architecture Notes

- role: Principal Engineer
- decision: Extend `check-council-record.mjs` rather than add a second validator. R21 pre-placed the
  `isBrief` guard for exactly this, and one validator keeps the two councils' record contracts from
  diverging. Rejected alternative: a `check-review-council-record.mjs`, which would duplicate the
  citation, disposition, and taper logic and let the two drift independently — the failure this
  package spends its fixtures preventing.
- decision (interface-contract-designer): The council record is one contract with two artifact
  types, not two contracts. Versioning is additive — every new field optional with a safe default —
  so no consumer artifact needs editing. The one contract *narrowing* is R1's no-fix rule, which
  applies only to a section (`## Council Log` findings) that does not exist in any artifact written
  before this package, so it cannot break an existing review. No breaking change is shipped, and
  none needs a `Q`.
- decision (data-schema-designer): The ledger is keyed by `finding_id` scoped to `source_artifact`,
  not by a global counter, so two chains cannot collide. Rotation is the only data movement and is
  the migration-safety concern: it is a move, so the post-condition is "present in exactly one
  file", checked in both directions. Nullability: every closed outcome requires its evidence field,
  which is why the conditional requirements sit in the schema rather than in prose.
  `additionalProperties: false` is deliberate and is the lesson from `open-items.schema.yaml`, which
  accepts a `resolution` key that 22 entries depend on and that it never declares. No destructive
  migration exists — the ledger starts empty.
- decision (system-design-advisor): Dependency direction is one-way — `lifecycle-review` depends on
  `review-council`, which depends on `dispatch-subagents`' frozen contracts, and nothing depends
  back. Failure modes considered: a member dying mid-run (RI18 makes it visible rather than silent,
  which is exactly how bucket C was nearly lost in this chain's own brief); the ledger absent in a
  consumer repo (validators exit 0 rather than failing); and a Review council firing where the
  repository is mid-Build (the repo-integrity digest of RI19 catches a mutation). Rejected
  alternative for the boundary: putting the ledger writer inside `check-council-record.mjs` so one
  file both validates and records — rejected because a validator that writes is no longer a
  validator, and every other validator in this repo is read-only.
- decision (post-approval, user-directed): council fan-out is per-phase and symmetric rather than
  Think-implicit. The first Phase 1 implementation kept `default_fan_out` as Think's and added
  `per_phase.review`, which reads as a special case and invites the next phase to be added the same
  ad-hoc way. Symmetric configuration costs one more line and removes the question.
- decision: B1 is fixed inside this package rather than filed. A package whose thesis is that
  unenforced contracts drift cannot itself ship constraints that do not constrain — and RI5's own
  schema constraints were the ones found inert.
- constraint: Additive-only for 1.1.0; zero runtime dependencies; the five adapters stay in sync.
- tradeoff (quality-gates-validator): The bars that matter here are fixtures and conformance, not
  unit coverage — this repo has no unit-test framework by design. Adequacy judgment: the violation
  suite is adequate *only* under the one-error-per-fixture rule, because a fixture rejected for two
  reasons keeps passing when the rule it targets regresses. That rule is therefore a phase exit
  gate (Phase 10), not a convention. Lint/type and security-scan bars are not applicable: no
  TypeScript, and the package ships no network or credential surface.
- tradeoff: Sequencing Phase 9 after 5 and 6 costs parallelism to keep one validator file under one
  phase's ownership at a time.
- downstream: Build executes one phase at a time; each phase's exit gate is a command or an
  inspection with a binary result. Test inherits the fixture and conformance evidence. Ship inherits
  RI7's closure gate, which will apply to this chain's own review if it runs a council.

## Open Questions

None. The brief's Q1–Q3 are closed, and Plan raised no new blocking question: both assumptions were
evidence-backed by inspection, so neither converted to a `Q`.

## Checkpoint Approval

- Checkpoint: plan-review
- Status: approved
- User's own words (verbatim, this turn): "Plan looks good, continue to build"
- Date: 2026-08-29
- Scope of approval: this plan as written at commit `8544cab` — ten phases, 32 mapped
  requirements, the branch strategy targeting `release/1.1.0`, and the accepted-scope risk that
  1.1.0 is held for the length of this chain.

## Exit Gate

- [x] Every active R and RI mapped to exactly one owning phase — 26 IDs, verified by
      `requirement-phase-mapper`: no orphan, no unexplained duplicate.
- [x] Every phase has a binary exit gate stating an observable pass/fail condition.
- [x] Dependency order is explicit, with the reason each edge exists.
- [x] Every risk has a mitigation and an owning phase; none requires a waiver.
- [x] Verification plan covers every R and RI, using configured or discovered commands only.
- [x] Source-of-truth and release handling are explicit.
- [x] Branch strategy is explicit and does not target the default branch.
- [x] Requirement Coverage is a `coverage-tracer` ledger with a row and citation per active ID.
- [x] `plan-assumption-verifier` confirms A1 and A2 are evidence-backed; neither became a `Q`.
- [x] User approved the plan. Recorded verbatim in `## Checkpoint Approval` on 2026-08-29.
