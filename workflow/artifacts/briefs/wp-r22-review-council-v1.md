---
slug: wp-r22-review-council
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-08-17
updated: 2026-08-29
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9, RI10, RI11, RI12, RI13, RI14, RI15, RI16, RI17, RI18, RI19, RI20, RI21, RI22, RI23, RI24, RI25]
upstream:
  - user-request
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: brief-review
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
  evidence_classes:
    repo: used
    trial: unused
    web: unused
    recall: unused
skill_trigger_log:
  - skill: repo-alignment-scan
    decision: ran
    reason: ran — R22 consumes contracts frozen by WP-R21, so alignment against what actually shipped is the dominant risk; buckets A and B checked the real files
  - skill: architecture-decision-advisor
    decision: skipped
    reason: skipped — the architecture decisions are inherited from WP-R21 and resolved there; the council surfaced wording defects, not new whole-repo decisions
  - skill: constraint-conflict-scan
    decision: ran
    reason: ran — bucket A was chartered on exactly this, and found the carve-out wording defect plus the unsynchronised decision-tree reference
---

# WP-R22 Review Council (Fresh-Eyes Multi-Agent Review) - Brief

## Source Links

- Notion WP-R22 — Review Council (Class Complex, P1, Target 1.1.0, Depends On WP-R21)
- `workflow/artifacts/briefs/wp-r21-think-council-v1.md`, `workflow/artifacts/reviews/wp-r21-think-council-v1.md`
- `src/workflow/skills/dispatch-subagents/references/council-contracts.md` — the frozen shared contract
- Council run 2026-08-17 — see `## Council Log`

## Status — APPROVED 2026-08-29, ready for Plan

Complete. 32 manifest IDs — R1–R7 and RI1–RI25 — each with an acceptance criterion and the files it
lands in. No open blockers; the brief was approved by the user on 2026-08-29 and the approval is
recorded verbatim in `## Checkpoint Approval`.

How it got here, since the history matters to anyone reading the Council Log:

- The 2026-08-17 council left it incomplete — three blocking questions, and bucket C dead after two
  API 529s so R5 had no acceptance criterion.
- Q1 and Q2 closed on re-verification, not by decision: WP-R21 shipped the fixes they asked for. See
  `## Re-verification`.
- Q3 was researched single-agent on 2026-08-29 (`## Q3 Research`) and answered by the user, who
  changed the design in two ways — closure enforced at Ship, and a two-file ledger.
- RI4–RI19 were derived on 2026-08-29. RI12–RI14 and RI17 exist because the first pass stated the
  work as intent and never named the skill and schema files it lands in; RI18 and RI19 because the
  implicit-requirements checklist named in `domain.yaml` had not been run.

## Re-verification (2026-08-29)

This brief was written on 2026-08-17 against `feat/wp-r21-think-council` as it then stood. R21 has
since shipped — its own remediation pass, plus three external PR review passes, closed a majority of
what this brief recorded as open. Every finding, question and risk was re-checked against source
before resuming. **The council's own conclusions were not carried forward on trust.**

| Item | Recorded 2026-08-17 | State on 2026-08-29 | Evidence |
|---|---|---|---|
| Q1 | carve-out verdict clause ambiguous, needs reword | **closed** — the recommended reword shipped | `dispatch-subagents/SKILL.md` — "only where the council's own output is not a verdict", plus a paragraph naming the superseded wording |
| Q2 | do R21's two open P1s block R22's Build? | **moot** — both closed 2026-08-18, three external passes since | R21 review artifact, Post-Review Remediation table |
| Q3 | unresearched — member died twice | **researched single-agent** | `## Q3 Research` below |
| F3 | `decision-tree-by-phase.md` never mentions the carve-out | **closed** | same file — "Exception — council auto-fire." |
| F4 | `Questions For User ?? ''` makes R5 checks vacuous on reviews | **closed** | escalation checks gated on `artifact === 'brief'`; fixture `da-no-questions-section` |
| F8 / RK-B | `council.default_fan_out` written phase-agnostically | **closed** | `phase-caps.md` — "Scope: the Think council only… Any package extending councils to a new phase must decide that phase's default explicitly." That instruction is addressed to this package |
| F7 / RI1 / RK-A | validator hard-filters to `briefs/` | **live — this is still the work** | `check-council-record.mjs` — the `briefs/` filter stands, and the `isBrief` guard below it was written and left inert *for* this package, with a comment saying so |
| F2 | `totals.briefs` and the summary line mislabel on reviews | **live** | `check-council-record.mjs` — `totals.briefs++` and "council brief(s)" |
| A1 | three frozen contracts stable | **holds, strengthened** | three external passes found nothing implicating them |
| A2 | `check-council-record.mjs` is the right host, unsettled | **strengthened** | the inert `isBrief` guard is R21 pre-placing this package's extension point |

**Contract movement R22 must absorb, none of which existed on 2026-08-17.** `termination_reason` is
now a two-value enum, with `resolved` cross-checked against the final round's `Open out` and an
escalation required to name at least one survivor ID. The Reconcile Contract excludes challengers
and must state both dedupe and disagreement handling. Findings carry a `Round` cross-checked against
the Rounds and Members tables. A recommendation resting on no `repo` or `trial` finding is rejected.
The fixture baseline R22 extends is 69 violation fixtures and 26 conformance checks, not 44 and 19.

**OI-81 belongs to this package.** It was filed against R21 with the note that the fix — giving a
Questions For User entry a bucket reference so the repo-shaped evidence rule can join per question —
"belongs with the Review-council work that is revising those blocks anyway". R22 owns it.

## Problem

Review is performed by the same agent that wrote the Plan and the Build, reading its own memory of
the change rather than the change itself. That is the weakest position from which to find a defect,
and it is the phase whose verdict blocks a commit.

This brief's own council run is evidence for the premise. Bucket A found that
`decision-tree-by-phase.md` never mentions the carve-out at all, so a reader following it refuses an
auto-fire that `SKILL.md` permits — a defect that survived three prior passes by the agent that
wrote both files, including a review that explicitly checked whether the five dispatch files were in
sync.

## Goals

- Reviewers see the diff and the manifest, never the Build session transcript.
- Reviewers carry fresh context over disjoint risk categories, so a finding is found rather than recalled.
- The parent consolidates one artifact and owns the verdict; a reviewer's claim is evidence, never authority.
- Inconvenient findings cannot be quietly dropped — every one carries a disposition.
- Review accumulates a finding-quality record, so the council's value is measurable rather than asserted.

## Non-Goals

- Consensus or voting. Agreement never constitutes a pass; the parent decides.
- Any reviewer writing to the review artifact directly.
- The Think phase (WP-R21).
- Forking `council-contracts.md`. R22 consumes it.

## User Impact

For a consumer, Review stops being the phase most likely to pass its own work. Today the agent that
wrote the Plan and the Build also decides whether the change is sound, reading its memory of the
change rather than the change itself. After R22, findings come from reviewers that never saw the
Build session, over disjoint risk categories, and the parent must dispose of every one — so an
inconvenient finding has to be argued with rather than forgotten.

The cost is real and lands on every Complex chain in a repo that leaves the council enabled: more
invocations per Review, and a Review that takes longer. R21 measured that trade once and the result
was unfavourable on invocation count. R5 exists so the second measurement is a by-product of normal
use rather than another one-off study.

## Success Metrics

- **Finding quality is reported, not asserted.** `check-council-record`'s summary line carries
  proved-real / noise / pending counts over active + archived ledgers after any Review council run.
- **No finding is silently lost.** Zero rows reach Ship still `pending` without a waiver — enforced,
  so the number is a consequence of the gate rather than a claim about diligence.
- **Additivity holds.** Every pre-1.1.0 review artifact validates with zero edits.
- **The rollback surface is real.** The preserved single-agent Review path stays byte-identical
  under its conformance lock, as R21's R8 did.
- **The council's cost is answerable.** After R22 ships, "is the Review council worth it" is a query
  over the ledgers rather than an opinion.

## Requirements

Numbered in the Requirement Manifest.

## Constraints

- Gated on WP-R21 landing; R22 consumes three contracts frozen there.
- Additive only for 1.1.0 — new review-artifact fields optional with safe defaults.
- Zero runtime dependencies.
- Additive-only extends to the ledger: a repo with no finding-quality file is a valid repo, and the
  checks that read it must be silent rather than failing when it is absent.
- The Review council must not be able to write to the repository, and must not dispatch — R21's
  carve-out and depth-1 rule are inherited, not restated.
- A reviewer's finding is evidence, never authority: nothing a reviewer produces may appear as a
  verdict, which the frozen `council-contracts.md` output rule already states.
- Enforcement extends `check-council-record.mjs` rather than adding a parallel validator, so the
  Review path cannot drift from the Think path it shares a contract with.

## Risks

- **RK-A (high): the council record for a Review would be silently unvalidated.** F7 — the validator
  hard-filters to `briefs/`, so a Review council's record lands in `reviews/` and every one of its
  checks is skipped. Not "fails" — *skipped*. The most dangerous shape of gap, and the same class as
  R21's own P1-1.
- **RK-B (high → CLOSED 2026-08-29): extending the council to Review silently multiplies cost.** F8
  reported `council.default_fan_out` as phase-agnostic. `phase-caps.md` now scopes the departure to
  the Think council explicitly and states that any package extending councils to a new phase must
  decide that phase's default rather than inheriting it. R22 must therefore *choose* a Review
  default and say so — the risk is now a required decision instead of a silent inheritance.
- **RK-C (medium): a compromised verdict is worse than no council.** Review's output blocks commits;
  confident wrong findings are more dangerous here than in Think.
- **RK-D (medium): fresh context is asserted, not enforceable.** R21 mitigated this for the challenge
  pass by passing raw findings; a reviewer needs *some* framing, so the same trick may not transfer.
- **RK-E (unassessed → assessed 2026-08-29): the finding-quality baseline.** Bucket C failed; the
  question was researched single-agent instead. See `## Q3 Research`.

## Open Questions

- **Q1 — reword the carve-out's verdict clause. CLOSED 2026-08-29, not by decision.** The
  recommendation was implemented during WP-R21's remediation: `dispatch-subagents/SKILL.md` now
  scopes the principle to "only where the council's own output is not a verdict" and keeps a
  paragraph explaining what the earlier wording said and why it read as excluding Review. R22 needs
  no explicit authorization on this ground. Recorded as closed rather than deleted, because the
  council's finding is why it was fixed. Owner: workflow owner. Blocking: no (was yes; closed
  2026-08-29).

- **Q2 — do R21's two open P1s block R22's Build? CLOSED 2026-08-29, moot.** Both P1s were closed on
  2026-08-18, and three external PR review passes have since run against the same validator. The
  question was well-posed and is simply no longer live. Owner: user. Blocking: no (was yes; closed
  2026-08-29).

- **Q3 — how does the finding-quality baseline get written back? RESOLVED 2026-08-29 by the user.**
  Mechanism B — a durable finding-quality ledger — with two refinements the user added, both of
  which change the design rather than confirm it:

  1. **Closure is a gate, not a convention.** A finding raised at Review that names a later phase
     must be closed at Test or Ship, enforced mechanically. "Closed at Reflect by habit" was the
     weaker thing I proposed; the user asked for a blocker so a finding cannot be missed.
  2. **Two files, not one.** An active ledger that stays lean, and an archive. A closed row moves to
     the archive, so the active file reflects the current cycle rather than growing without bound.

  **Consequence the two refinements create together, decided here rather than left implicit:** if
  the summary metric is computed from the lean active file alone, it reports the current cycle and
  silently stops being a baseline — which is the one thing R5 exists to provide. So the reporter
  reads **active + archive**, and the archive is append-only. Rotation keeps the working file lean;
  it must not make the measurement lie.

  Owner: user. Blocking: no (was yes; answered 2026-08-29).

## Requirement Manifest

### Explicit (R)

Format per `decompose-requirements/references/manifest-format.md`: a one-line requirement, an
`Acceptance:` bullet, and — because intent without a deliverable ships as prose — the files each
requirement lands in.

- **R1** - Reviewers are read-only; a council reviewer finding may not carry a fix recommendation.
  - Files: `src/workflow/validators/check-council-record.mjs`, `src/workflow/skills/lifecycle-review/references/output-schema.md`
  - Contract collision to resolve: `lifecycle-review/references/output-schema.md` requires *every* finding to carry a fix recommendation, which is the opposite of this rule. The no-fix rule binds council-log reviewer findings only; the parent's consolidated `## Findings` entries keep theirs, because the parent is not a reviewer. Both documents must say so.
  - Acceptance: a council-log finding row carrying a fix recommendation is rejected; a consolidated `## Findings` entry carrying one still passes.

- **R2** - Reviewers receive the diff and the manifest, never the Build session transcript.
  - Files: `src/workflow/skills/review-council/SKILL.md`, review artifact Council Log Members table
  - Acceptance: each reviewer's declared input is recorded; an input naming the Build transcript fails.

- **R3** - The parent owns consolidation, verdict, and evidence.
  - Files: `src/workflow/skills/review-council/references/output-schema.md`
  - Contract: inherited verbatim from `think-council` — "No verdict, recommendation-as-decision, or exit-gate claim appears in the result."
  - Acceptance: no reviewer output appears as `## Recommendation`; consolidation cites every reviewer that produced a finding.

- **R4** - Every reviewer finding carries a disposition, with a non-empty reason when rejected.
  - Files: consumes `dispatch-subagents/references/council-contracts.md` unchanged
  - Acceptance: the Review path is rejected by the same fixtures that enforce the Think path — no forked disposition enum.

- **R5** - Each finding records whether it proved real, was waived, or was noise, and the record accumulates across runs.
  - Files: delivered by RI6, RI7, RI8, RI15, RI16
  - Acceptance: a council finding with no ledger row fails; a row still `pending` at Ship fails unless waived; the summary line reports counts over active **and** archive.

- **R6** - New review-artifact fields are optional with safe defaults; pre-1.1.0 reviews still validate.
  - Acceptance: `npm run validate` passes over every existing review under `workflow/artifacts/reviews/` and `examples/` with zero edits, and `git status` on those trees is clean afterwards.

- **R7** - A config field disables the council; the single-agent Review path stays functional and CI-exercised for one release.
  - Files: `src/workflow/agent-behavior.yaml`, `src/workflow/skills/lifecycle-review/references/single-agent-path.md`
  - Acceptance: mirrors R21's R8 — preserved verbatim, byte-locked by conformance, removed in 1.2.0 alongside A5.

### Implicit (RI)

Derived against the seven `requirement_discovery.implicit_requirement_sources` this repo's
`domain.yaml` names. RI1–RI3 keep the meanings the 2026-08-17 council gave them; RI4–RI19 were
derived on 2026-08-29. Sources considered and rejected are listed after RI19, per the library's
rule that a considered-and-rejected category is marked rather than left silent.

- **RI1** - `check-council-record.mjs` handles review artifacts, not briefs alone.
  - Files: `src/workflow/validators/check-council-record.mjs`
  - Contract: widen the `briefs/`-only filter; make `totals.briefs` and the summary label artifact-type-aware (F2); keep the already-placed `isBrief` guard so escalation checks stay brief-scoped.
  - Acceptance: both artifact types are checked; no check is silently skipped or vacuous on either.

- **RI2** - The Review-only no-fix-recommendation assertion, scoped to council-log findings (F6).
  - Acceptance: a fixture with a fix-carrying council finding is rejected, attributable to this rule alone.

- **RI3** - The pre-R22 single-agent Review path is preserved verbatim with a byte-comparison lock.
  - Files: `src/workflow/skills/lifecycle-review/references/single-agent-path.md` (new)
  - Acceptance: byte-identical to today's 10-step Workflow; a conformance check fails on drift, mirroring `r21-single-agent-verbatim`.

- **RI4** - Review-artifact frontmatter carries `council:` additively.
  - Verified 2026-08-29: `council:` is already top-level and optional in `artifact-frontmatter.schema.yaml`, so **no schema change is required** — the work is validator- and starter-block-side. Stated so Build does not "fix" a correct schema.
  - Acceptance: council-mode and single-agent reviews are distinguishable from frontmatter alone; every existing review validates unedited.

- **RI5** - The Review council's fan-out default is decided for this phase explicitly, never inherited.
  - Files: `src/workflow/agent-behavior.yaml`, `src/workflow/schemas/agent-behavior.schema.yaml`, `src/workflow/skills/dispatch-subagents/references/phase-caps.md`
  - Contract: `phase-caps.md` states the Think departure is "the Think council only… Any package extending councils to a new phase must decide that phase's default explicitly."
  - Acceptance: a resolved Review cap is recorded with its `cap_source`; the chosen number appears in `phase-caps.md` beside Think's.

- **RI6** - The ledger is two files with defined rotation.
  - Files: `workflow/artifacts/finding-quality.yaml`, `workflow/artifacts/finding-quality-archive.yaml`
  - Contract: a row closes in the active file and moves to the archive in one operation; present in both, or in neither after closure, is an error.
  - Acceptance: both failure shapes have a fixture and are rejected by RI16's validator.

- **RI7** - Closure is enforced at Ship, not left to habit.
  - Files: `src/workflow/validators/check-release-readiness.mjs`
  - Contract: mirrors the existing open-P0/P1 handling — a `pending` row blocks `ship` unless a Waivers entry covers it.
  - Acceptance: a ship artifact declaring `ship` with a pending row and no waiver is rejected.

- **RI8** - Quality figures are reported on the existing summary line, computed over active + archive.
  - Files: `src/workflow/validators/check-council-record.mjs`, `test/run-conformance-tests.mjs`
  - Acceptance: the summary reports proved-real / noise / pending counts; a conformance check pins the line's shape; a count computed from the active file alone fails it.

- **RI9** - One rejection fixture per new mechanical rule, each emitting exactly one error.
  - Files: `test/run-violation-tests.mjs`, `test/fixtures/lifecycle-violations/`
  - Acceptance: the violation count rises by the number of new rules; the attribution sweep still shows exactly one error per council fixture.

- **RI10** - A Questions For User entry carries a bucket reference so the repo-shaped evidence rule joins per question (OI-81).
  - Files: `src/workflow/skills/lifecycle-think/references/output-schema.md`, `src/workflow/validators/check-council-record.mjs`, `src/workflow/validators/README.md`
  - Acceptance: the rule fires on a question whose own bucket is repo-classified and not on one whose bucket is external; the brief-wide approximation and its stated non-claim are both removed.

- **RI11** - Build outputs and adapters stay current.
  - Acceptance: `npm run build` clean; `render-adapters` reports shims current; all five adapters carry identical gate content if any gate text changed.

- **RI12** - A `review-council` skill exists, mirroring `think-council`'s shape.
  - Files: `src/workflow/skills/review-council/SKILL.md`, `src/workflow/skills/review-council/references/output-schema.md`
  - Contract: the charter states the repo fence, the outward-action axis, and no-nesting explicitly; it consumes `council-contracts.md` rather than forking it.
  - Acceptance: the skill loads standalone; a conformance check pins its stage list, as `r21-think-stages` does for Think.

- **RI13** - `lifecycle-review` is restructured for the two modes.
  - Files: `src/workflow/skills/lifecycle-review/SKILL.md`
  - Contract: mode resolution before stage 1 in R21's first-answer-wins order; the present 10-step Workflow becomes the single-agent path; the Exit Gate gains the council bullets and names `check-council-record.mjs`.
  - Acceptance: both modes produce the same artifact against the same output schema.

- **RI14** - The review output schema carries the Council Log.
  - Files: `src/workflow/skills/lifecycle-review/references/output-schema.md`
  - Contract: the starter block gains `## Council Log` with the subsections the Think record uses, so one validator serves both. Also fixes a live drift: the block declares `| Severity | Count |` while real reviews use `| Severity | Open | Found | IDs | Status |` and `check-release-readiness.mjs` was widened to tolerate the extra columns.
  - Acceptance: the block a reviewer copies produces an artifact that passes both validators unedited.

- **RI15** - A schema declares the ledger.
  - Files: `src/workflow/schemas/finding-quality.schema.yaml` (new)
  - Contract: `required: [version, kind, items]`; each item requires `id`, `finding_id`, `source_artifact`, `first_seen_run`, `disposition`, `outcome`; `outcome` enum `pending | proved-real | waived | noise | unresolved-at-reflect`; `waived` requires `waiver_ref`, `noise` and `unresolved-at-reflect` require `reason`, any closed outcome requires `closed_in_phase` and `resolution`; `additionalProperties: false`, closing the shape found in `open-items.schema.yaml`, which accepts a `resolution` key used by 22 entries and declared nowhere.
  - Acceptance: `check-schema-keywords.mjs` passes over it, so every keyword it declares is one the engine implements.

- **RI16** - A validator checks the ledger.
  - Files: `src/workflow/validators/check-finding-quality.mjs` (new), `scripts/validate-template.mjs`
  - Contract: mirrors `check-open-items.mjs` — validates both files against RI15's schema when present, exits 0 with a stated message when absent, so a repo with no ledger stays valid.
  - Acceptance: absent ledger exits 0; a malformed row, a row in both files, and a closed row missing a required field each fail with one error.

- **RI17** - Risk categories are assigned from the existing surface, disjointly.
  - Files: `src/workflow/skills/lifecycle-review/references/review-risk-categories.md`
  - Contract: the ten categories already listed there become the assignment surface; each reviewer's categories are disjoint and the assignment is recorded in the Council Log.
  - Acceptance: two reviewers sharing a risk category in the same round is rejected, on the same reasoning RI1's independence rule uses for surfaces.

- **RI18** - A council member that fails or never runs is recorded as a skipped check, not silently dropped.
  - Source: verification config — `command_policy.record_not_run_as_risk: true`, `skipped_checks.required_fields`
  - Files: `src/workflow/skills/review-council/references/output-schema.md`, `src/workflow/validators/check-council-record.mjs`
  - Why material: this brief is the evidence. Bucket C's member died twice on API 529s, and the only reason that is visible is that a human wrote it into prose. Nothing required it.
  - Acceptance: a Members row marked `failed` with no corresponding skipped-check entry carrying all six configured fields (`check`, `why_skipped`, `risk`, `owner`, `blocks_ship`, `manifest_ids`) is rejected.

- **RI19** - Review council members inherit the sandbox fence and the repo-integrity digest.
  - Source: safety constraints `[safety-2]`, `[safety-3]`; R21's R11 and R-2
  - Files: `src/workflow/skills/review-council/SKILL.md`, `src/workflow/validators/check-council-record.mjs`
  - Why material: a Review council reads the repository it is reviewing. Nothing in R1–R7 said it may not write to it — R1 constrains what a *finding* may say, not what a member may do.
  - Acceptance: the sandbox and `repo_integrity` checks that apply to a Think council record apply unchanged to a Review council record; a Review run whose before/after digests differ is rejected.

- **RI20** - Council fan-out is configured per phase, symmetrically, with no phase special-cased.
  - Files: `src/workflow/agent-behavior.yaml`, `src/workflow/schemas/agent-behavior.schema.yaml`,
    `src/workflow/skills/dispatch-subagents/references/phase-caps.md`
  - Contract: `council.per_phase.<phase>.default_fan_out` carries every phase's value, Think's
    included. The top-level `default_fan_out` stops being Think's implicit home. A phase absent from
    the map gets no departure and falls back to default-to-1, so forgetting to decide fails safe.
  - Acceptance: `per_phase.think` and `per_phase.review` both resolve; a phase named in neither
    resolves to 1; no reader falls back to a phase-agnostic value.

- **RI21** - A definitions file is validated against its schema, so a constraint declared there is
  enforced rather than decoration.
  - Files: `src/workflow/validators/check-config.mjs`, `scripts/validate-template.mjs`
  - Why material: found at Build by probe (task blocker B1). Nothing loads
    `agent-behavior.schema.yaml` — a repo-wide grep returns one comment and the bundle copy. Every
    constraint in it is currently inert, including `required`, the `enabled` enum, and
    `max_rounds`'s bounds. `check-config` already validates `workflow/config/*.yaml` against their
    schemas; definitions files were never given the same treatment.
  - Acceptance: the three probes that passed at Phase 1 are rejected — an out-of-range
    `default_fan_out`, an unknown key under a closed object, and an unknown phase under `per_phase`
    — each with one error naming the offending path.

- **RI22** - Per-repo council caps are settable per phase and inherit from the global definitions
  when unset.
  - Files: `src/workflow/schemas/repo-profile.schema.yaml`, `workflow/config/pending-setup.yaml`,
    `src/setup/SKILL.md`
  - Contract: `tuning.council.per_phase.<phase>.default_fan_out` overrides that phase only, leaving
    every other phase on the global value — the same per-entry resolution rule `skill_scoring`
    already documents, where a repo naming one entry changes that one thing rather than replacing
    the map. A setup interview item exists so the question can be answered at `init` or later.
  - Acceptance: a repo overriding Review alone leaves Think's resolved value unchanged; a repo
    overriding neither inherits both; the interview item is present and resolvable.

- **RI23** - Definitions are validated against their schemas **at the source**, identically on every
  machine.
  - Files: `src/workflow/validators/check-definitions.mjs`, `scripts/validate-template.mjs`,
    `src/workflow/validators/check-config.mjs`
  - Why material: RI21 wired the schema in, but from `check-config`, which runs on the repo-local
    root. `defsPath()` there returns the global install on a developer machine — which only moves
    when `agentsmyth prepare` runs — and the build-synced copy in CI, which has no `~/.agentsmyth`.
    So a source change read clean locally until `prepare`, and CI and a developer validated
    different files. RI21 without RI23 enforces a copy, not the thing that ships.
  - Acceptance: an invalid value in `src/workflow/agent-behavior.yaml` fails `npm run validate`
    **without** `prepare` having run, and the error names the source path; the check produces the
    same verdict with no global install reachable.

- **RI24** - A validator that exists is a validator that runs.
  - Files: `test/run-conformance-tests.mjs`, `scripts/validate-template.mjs`,
    `src/workflow/schemas/pending-setup.schema.yaml`, `workflow/config/pending-setup.yaml`
  - Why material: three instances of one defect surfaced in this package alone — a schema nothing
    loaded, a definitions check reading the wrong copy, and `check-pending-setup.mjs`, which was
    registered nowhere and failed immediately when finally run. A file that looks like a guarantee
    and is never invoked is worse than an absent one, because it is counted as coverage.
  - Acceptance: a conformance check enumerates `src/workflow/validators/` and fails on any validator
    absent from `scripts/validate-template.mjs`, with CLI-invoked and non-check files exempted by
    name; and a second check pins the definitions check to the source command list specifically.

- **RI25** - The schema engine enforces `required` independently of `properties`.
  - Files: `src/workflow/validators/lib.mjs`, `test/run-conformance-tests.mjs`
  - Why material: found at Build by probing RI15's conditionals rather than trusting them. The
    engine checked `required` only inside `if (schema.properties && ...)`, so a schema declaring
    `required` alone enforced nothing — which is the exact shape every `then:` branch of an if/then
    takes. RI15's three conditional rules were accepted whatever a row said, while `pattern` and
    `additionalProperties` in the same schema worked, so the schema looked live. Without this, RI15
    ships as decoration and R5's whole ledger contract rests on it.
  - Acceptance: a schema with `required` and no `properties` sibling rejects a missing key; an
    if/then conditional fires on match and stays quiet otherwise; both asserted directly against the
    engine, since `check-schema-keywords` verifies that a keyword is implemented, not that it is
    reachable in the position a schema uses it.

**Sources considered and rejected** (listed after the final RI), per `implicit-requirements-library.md`:

- *source-of-truth*: `mode: optional` with `providers: []`, so no source read/update requirement attaches to R22 beyond the existing practice of updating the Notion page at Ship. No acceptance criterion changes.
- *release*: `gates.branch` and the PR policy are repo-wide and already enforced; R22 changes neither.
- *repo profile — ownership and branch policy*: generic to all work here, and R22 alters no protected path or public contract beyond those already captured in R6 and RI4.
- *domain — provider neutrality*: R22 introduces no provider dependency.

### Assumptions (A)

- **A1** — WP-R21's three frozen contracts are stable. Verified: R21's review found no finding
  implicating any of them.
- **A2** — `check-council-record.mjs` is the right host rather than a second validator. Supported by
  F7 (one-line filter) but not settled; RI1's scope depends on it.

### Open Questions (Q)

See Open Questions. Q1 and Q2 closed 2026-08-29 by what WP-R21 shipped; **Q3 alone is blocking** and is
mirrored in `orchestration.blockers`.

## Questions For User

- **Q1** (rests on F1, F5) — CLOSED 2026-08-29: the recommended reword shipped with WP-R21, so the carve-out now scopes "no verdict" to the council's own output and R22 needs no authorization on this ground.
- **Q2** (rests on F7) — CLOSED 2026-08-29: both P1s were fixed on 2026-08-18 and three external review passes have run against the same validator since, so this no longer gates R22's Build.
- **Q3** (rests on no finding — bucket C never ran, so this was researched single-agent instead) — recommend a durable `finding-quality.yaml` ledger written at Review and closed at Reflect, reusing the open-items shape; see Q3 Research for the two rejected alternatives and why.

## Q3 Research

Bucket C died on 2026-08-17 (two API 529s). Researched single-agent on 2026-08-29 rather than
re-dispatching: this is one bounded question over surfaces that exist in this repo, not three
disjoint buckets, and WP-R21 measured a council at roughly 6x invocations for less coverage.
Evidence class `repo` throughout — every claim below resolves to a file in this repository.

**The finding that reframes the requirement: quality is not knowable at Review time.** A finding's
*disposition* — accepted / merged / rejected-with-reason — is decided by the parent at consolidation
and is already contracted in `council-contracts.md`. Whether an accepted finding *proved real* is
knowable only after someone acts on it: at Test (the fix held, the claim reproduced), at Ship
(waived, with a recorded waiver), or at Reflect (it was nothing). So R5 is not a wider column on the
Review table. It is a **second write at a later phase**, which is what "write-back" was reaching for.

**Prior art already in the repo, in three places.**

1. `workflow/artifacts/open-items.yaml` is a working durable write-back ledger — cross-run, keyed by
   ID, `status: open|done|blocked|deferred`, closed later with a resolution, written at the end of
   each Reflect by `follow-up-owner-assigner` (`lifecycle-reflect/SKILL.md`). Its schema calls it
   "not a lifecycle artifact — a single persistent file". That is the exact shape a cross-run
   quality baseline needs.
2. The review artifact **already prototyped the per-finding outcome table by hand, twice**. WP-R21's
   review carries `| Severity | Open | Found | IDs | Status |` with the note that `Open` is what
   `check-release-readiness.mjs` reads while `Found` "preserves what the review actually caught".
3. Reflect already holds the retrospective shape one level up: `## Manifest Coverage Retrospective`
   with `Outcome: shipped / deferred / blocked / waived`.

**Two drifts found while researching, both small, both R22-adjacent.**

- The review starter block still declares `| Severity | Count |`, while real reviews use five
  columns and `check-release-readiness.mjs` was widened to tolerate "any column count beyond
  Severity + first count column" — a comment that records the validator chasing the artifact. The
  starter block never caught up. R5 extends exactly this table, so it inherits the drift.
- `resolution:` is used by 22 entries in `open-items.yaml` and is **declared nowhere** in
  `open-items.schema.yaml`, which sets no `additionalProperties: false` and so accepts it silently.
  The field the ledger's write-back actually turns on is undeclared. This is the same class
  `check-schema-keywords.mjs` exists to catch, one file over.

**Three candidate mechanisms.**

| | Mechanism | Verdict |
|---|---|---|
| A | Extend the review artifact's Severity Summary into a per-finding outcome table; a later phase writes the outcome back into it | **Rejected.** Requires a later phase to edit an earlier phase's artifact. The lifecycle treats artifacts as phase-owned; where this repo has done it (R21's Post-Review Remediation) it was deliberately append-only and explicitly justified. Making it routine would erode the property |
| B | A durable `finding-quality.yaml`, same shape as the open-items ledger: one row per council finding, written at Review with `outcome: pending`, closed at Reflect | **Recommended.** Reuses a proven mechanism and an existing write-back path; accumulates across runs, which is the whole point of R5 ("measurable rather than asserted"); mutates no upstream artifact |
| C | Fold council findings into `open-items.yaml` with a new `source: council-finding` | **Rejected on contract, not taste.** The ledger requires `owner` and `next_action`, "never TBD". A noise finding has neither. C would fill a ledger whose contract is "needs an owner and a next action" with rows that have neither |

**Recommended shape (B).** Review appends one row per council finding — `id`, `first_seen_run`,
`disposition` (from the council contract), `outcome: pending`. Reflect closes each row with
`proved-real | waived | noise`, where `waived` requires a waiver reference and `noise` requires a
reason. A finding whose truth is genuinely not known by Reflect closes as `unresolved-at-reflect`
with a stated reason rather than a guess — the ledger is cross-run by construction, so a later chain
can update it. Enforcement extends `check-council-record.mjs` rather than adding a validator: every
council finding in a review has a ledger row, and no row is left `pending` once its chain reaches
Reflect.

**What this research does not settle.** Whether R5 for 1.1.0 is the *recording* half only, or
recording plus a reported metric (the ratio that would make R21's cost measurement checkable). That
is a scope call, and it is the question put to the user.

**Superseded in part by the answer.** The user chose mechanism B and changed two things about it:
closure is enforced as a gate at Ship rather than closed at Reflect by habit, and the ledger is two
files rather than one. The decision as taken is recorded under Q3 in `## Open Questions`; this
section is kept as the research that led to it, not as the design.

## Council Log

### Requirement Classification

| Manifest ID | Question bucket | Evidence classes |
|---|---|---|
| R1 | reviewer capability and the fix-recommendation rule | repo |
| R2 | reviewer input representation | repo |
| R3 | parent consolidation and verdict ownership | repo |
| R4 | disposition contract reuse | repo |
| R5 | finding-quality write-back | repo |
| R6 | additive schema compatibility | repo |
| R7 | single-agent Review preservation | repo |
| RI1 | validator extension to review artifacts | repo |
| RI2 | Review-only fix-recommendation assertion | repo |
| RI3 | verbatim preservation and byte lock | repo |
| RI4 | additive review frontmatter | repo |
| RI5 | Review-phase fan-out default | repo |
| RI6 | finding-quality ledger shape and rotation | repo |
| RI7 | closure enforcement at Ship | repo |
| RI8 | summary-line reporting over both ledgers | repo |
| RI9 | rejection fixture set | repo, trial |
| RI10 | per-question bucket join (OI-81) | repo |
| RI11 | build outputs and adapter currency | repo, trial |
| RI12 | review-council skill exists | repo |
| RI13 | lifecycle-review restructured for two modes | repo |
| RI14 | review output schema carries the Council Log | repo |
| RI15 | finding-quality schema | repo |
| RI16 | finding-quality validator | repo, trial |
| RI17 | disjoint risk-category assignment | repo |
| RI18 | failed member recorded as a skipped check | repo |
| RI19 | sandbox fence and repo-integrity inherited | repo, trial |
| RI20 | symmetric per-phase council caps | repo |
| RI21 | definitions validated against their schema | repo, trial |
| RI22 | per-repo per-phase council tuning and interview | repo |
| RI23 | definitions validated at the source | repo, trial |
| RI24 | every validator is wired and runs | repo, trial |
| RI25 | schema engine enforces standalone `required` | repo, trial |

RI4–RI17 were **not** classified by the 2026-08-17 council. They were derived and classified on
2026-08-29 while resuming: RI6–RI8 and RI15–RI16 exist because of what Q3's answer decided, and
RI12–RI14 and RI17 because the first pass stated the work as intent and never named the skill and
schema files it lands in. They are recorded here because every active requirement needs a
settling class, not to suggest the council produced them.

### Members

| Member | Role | Round | Capabilities | Sandbox |
|---|---|---|---|---|
| m1 | researcher | 1 | read, fetch, search | |
| m2 | researcher | 1 | read, fetch, search | |
| m3 | researcher | 1 | read, fetch, search — FAILED (API 529, twice; bucket C unresearched) | |
| c1 | challenger | 1 | read, fetch, search | |

### Rounds

| Round | Researchers | Challengers | Open in | Open out | Items closed | Sizing rationale |
|---|---|---|---|---|---|---|
| 1 | 3 | 1 | 3 | 3 | | — |

### Findings

| Finding | Member | Role | Round | Surface | Evidence class | Citation | Disposition | Reason / merged into |
|---|---|---|---|---|---|---|---|---|
| F1 | m1 | researcher | 1 | dispatch-subagents/SKILL.md | repo | `src/workflow/skills/dispatch-subagents/SKILL.md` L24-25 — principle "in phases that produce no verdict" | accepted | |
| F2 | m1 | researcher | 1 | dispatch-subagents/SKILL.md | repo | `src/workflow/skills/dispatch-subagents/SKILL.md` L31 — condition "the phase is Think or Review" | rejected-with-reason | Challenger refuted the contradiction reading; "no verdict" scopes to council output, not phase artifact. Wording defect stands, diagnosis does not |
| F3 | m1 | researcher | 1 | decision-tree-by-phase.md | repo | `src/workflow/skills/dispatch-subagents/references/decision-tree-by-phase.md` L18 — "If explicit authorization is absent, do not dispatch." No council mention in file | accepted | |
| F4 | m2 | researcher | 1 | check-council-record.mjs | repo | `src/workflow/validators/check-council-record.mjs` L385 — `namedSection(parsed.body, 'Questions For User') ?? ''` makes R5 checks vacuous on reviews | accepted | |
| F5 | c1 | challenger | 1 | dispatch-subagents/SKILL.md | repo | `src/workflow/skills/think-council/references/output-schema.md` L89 — "No verdict, recommendation-as-decision, or exit-gate claim appears in the result." | accepted | |
| F6 | c1 | challenger | 1 | decision-tree-by-phase.md | repo | `src/workflow/skills/dispatch-subagents/references/decision-tree-by-phase.md` L58 — "A candidate is asked to produce a fix recommendation (that switches it to Build scope)" | accepted | Refutes the claimed R22/review-schema contradiction |
| F7 | c1 | challenger | 1 | check-council-record.mjs | repo | `src/workflow/validators/check-council-record.mjs` L129 — `if (file.split('/').slice(-2, -1)[0] !== 'briefs') continue;` | accepted | |
| F8 | c1 | challenger | 1 | phase-caps.md | repo | `src/workflow/skills/dispatch-subagents/references/phase-caps.md` L30-32 — council default_fan_out written phase-agnostically | accepted | |

### Reconcile Contract

Buckets A and B were assigned disjoint surfaces, so overlap was not planned. It arose anyway: the
challenger inspected `dispatch-subagents/SKILL.md`, which bucket A already owned. Duplicates on a
shared surface collapse into the researcher's finding, which holds the original citation.
Disagreements are never collapsed — each is recorded in Conflicts below with its resolution and the
basis for it, which is what happened to F2.

### Conflicts

| Surface | Findings | Resolution |
|---|---|---|
| dispatch-subagents/SKILL.md | F2, F5 | Challenger's reading adopted. F2 claimed principle and conditions contradict; F5 shows "no verdict" is scoped to the council's own output (`think-council/references/output-schema.md` L89), making this a wording ambiguity rather than a design conflict. F2 rejected, defect retained as Q1 |

### Termination

- Reason: user-decision-required
- Surviving items and their round history: Q1 open in round 1, closed in none; Q2 open in round 1, closed in none; Q3 open in round 1, closed in none — bucket C never researched

## Architecture Notes

- role: Architect
- decision: Consume `council-contracts.md` rather than fork it.
- constraint: Additive-only for 1.1.0; gated on R21 landing.
- tradeoff: Rotation versus measurement. A lean active ledger is what makes the file usable per
  cycle; a baseline is what makes R5 worth having. Computing the metric over active + archive keeps
  both, at the cost of the reporter reading two files instead of one. The alternative — counts
  rolled up into a header on rotation — was rejected as a second place for the same fact to drift.
- tradeoff: Enforcing closure at Ship rather than Reflect. Ship already blocks on open P0/P1 with a
  waiver escape, so the pattern and its escape hatch exist; Reflect has no blocking power. The cost
  is that a finding whose truth genuinely is not known by Ship must be waived rather than left
  honestly pending.
- decision: The single-agent Review path is preserved verbatim and byte-locked, mirroring R21's R8
  rather than inventing a second preservation mechanism.
- decision: The no-fix-recommendation rule binds council-log reviewer findings only. The parent's
  consolidated findings keep their fix recommendations, because `lifecycle-review`'s output schema
  requires one on every finding and the parent is not a reviewer. Without this scoping the package
  would ship two contracts that contradict each other.
- downstream: F7 means R22 still inherits the brief-scoped validator; F8's fan-out defect is closed,
  but its replacement text *requires* this package to choose a Review default explicitly (RI5).
- downstream: Plan sequences RI12–RI16 before RI1 and RI7. The validator work has nothing to check
  until the skill, the output schema, and the ledger schema exist.

## Checkpoint Approval

- Checkpoint: brief-review
- Status: approved
- User's own words (verbatim, this turn): "Brief is approved"
- Date: 2026-08-29
- Scope of approval: this brief as it stands at commit `4b220db` — 26 manifest IDs including RI18
  and RI19, which were added after the manifest rebuild and are the two the user had not seen when
  the brief was first presented.

## Post-Approval Amendment (2026-08-29)

Three requirements were added **after** the approval recorded above, on the user's explicit
direction during Build. Recorded here rather than by silently growing the manifest, because the
checkpoint approval names the brief as it stood at commit `4b220db`.

Trigger: Phase 1 of Build raised blocker B1 — discriminating probes showed that nothing loads
`agent-behavior.schema.yaml`, so every constraint in it, including the ones RI5 had just added, was
decoration. Presented with three options, the user chose to fix it inside this package and added a
design direction.

**User's own words (verbatim):** "go with (a). I would think different caps for think and review
configured via schema and inherited/setup for any projects during init or later interview stages."

- RI20 comes from "different caps for think and review configured via schema" — symmetric per-phase
  configuration, which supersedes the Think-special-cased shape Phase 1 first implemented.
- RI21 comes from "go with (a)" — the schema-enforcement fix for B1.
- RI22 comes from "inherited/setup for any projects during init or later interview stages".

A second amendment on 2026-08-29 added **RI23** and **RI24**, on the user's instruction to fix
rather than defer a finding Build had surfaced and I had proposed carrying to Review. RI21 turned
out to enforce a *copy* of the definitions rather than the source; RI23 fixes that, and RI24
generalises it so the underlying shape — a check that exists but never runs — cannot recur silently.

**User's own words (verbatim):** "NO, FIX IT RIGHT NOW. NO DEFERRALS" 

IDs are appended after the highest existing ID and nothing is renumbered, per
`decompose-requirements`.

**Correction, 2026-08-30 (Review finding P3-3).** This section previously claimed "no existing
requirement's acceptance criterion changed". That was wrong in one respect: RI8's *Files* line moved
from `check-council-record.mjs` to `check-finding-quality.mjs` during Build, recorded only in the
plan. Its acceptance clause names no validator and is unchanged, so what moved was the requirement's
declared home rather than its criterion — but the blanket claim was inaccurate and the brief and
plan disagreed until now.

**Third amendment, 2026-08-30 (Review finding P3-1).** RI25 was added during Build's Phase 4 and
appears in the manifest and the classification table but in no amendment record, so it sat outside
the approval's stated scope of 26 IDs at `4b220db`. Recorded here: RI25 — the schema engine enforces
`required` independently of `properties` — was derived when probing RI15's conditionals showed every
one of them inert. 26 approved + 3 + 2 + 1 = 32, which is what `manifest_ids` carries.

## Exit Gate

- [x] Every active R and RI has acceptance criteria. R5's was written once Q3 was answered; RI4–RI25
      were derived across 2026-08-29/30 and each carries one.
- [x] Blocking Q IDs appear in orchestration.blockers. Q1 and Q2 closed against shipped source, Q3
      answered by the user, so the list is now empty.
- [x] Goal, scope and non-goals are concrete.
- [x] Architecture notes capture decisions, both tradeoffs, and downstream impact.
- [x] Every active R/RI has a classification entry naming at least one evidence class.
- [x] The council run is logged, and its record passes `check-council-record.mjs`.
- [x] **User approved.** Recorded in `## Checkpoint Approval` on 2026-08-29 in the user's own
      words. Not authored here.
