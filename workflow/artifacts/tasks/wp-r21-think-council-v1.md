---
slug: wp-r21-think-council
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-08-17
updated: 2026-08-17
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9]
upstream:
  - workflow/artifacts/briefs/wp-r21-think-council-v1.md
  - workflow/artifacts/plans/wp-r21-think-council-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# WP-R21 Think Council - Task

## Active Phase

- Phase: Phase 7 - Rejection fixtures (final phase; all seven complete)
- Manifest IDs: all 24
- Exit gate: every phase gate met — see Phase Completion Log. Build is complete and ready for Review.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Contract foundations | complete | RI1, R4, R10 |
| Phase 2 - Config surface | complete | R2, R7, R11, RI7, RI8 |
| Phase 3 - Council skill | complete | R3, R12, RI2 |
| Phase 4 - Think restructuring | complete | R1, R5, R8, R9, R13, R15 |
| Phase 5 - Record and schema | complete | R6, R14, RI4, RI5 |
| Phase 6 - Validator | complete | RI3, RI6 |
| Phase 7 - Rejection fixtures | complete | RI9 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `feat/wp-r21-think-council` | clean | Five commits: brief, Q resolutions, brief expansion, risk hardening, brief approval, plan, plan approval |
| At handoff | `feat/wp-r21-think-council` | all seven phases staged | 14 source files plus 16 fixture dirs; `dist/` regenerated but gitignored; no unrelated files touched |

## Scope

- In scope: all seven plan phases — contracts, config, council skill, Think restructuring, record
  and schema, validator, rejection fixtures.
- Out of scope: WP-R22 (Review council). OI-73 (checkpoint multi-line quote) and OI-74 (pre-commit
  gate blocks mid-Build commits) are both shipped-contract changes found during this chain and
  deliberately not smuggled into it.

## Changed Files

- `src/workflow/skills/dispatch-subagents/references/council-contracts.md` — new; disposition
  contract and evidence-class contract with per-class enforcement levels and stated non-claims —
  IDs: R4, R10
- `src/workflow/skills/dispatch-subagents/references/independence-rules.md` — added the Read-Only
  Overlap Exception with conflict recording as its teeth; updated Review and Think/Plan checklists
  and their edge cases — IDs: RI1
- `src/workflow/skills/dispatch-subagents/references/decision-tree-by-phase.md` — Think and Review
  rows now permit overlap under the exception; Build row states it never applies; per-phase refuse
  conditions rewritten for Think/Plan, Build, and Review — IDs: RI1
- `src/workflow/skills/dispatch-subagents/references/phase-caps.md` — overlapping read-only workers
  still count against the cap (Phase 1); council default-fan-out departure from the global
  default-to-1 rule, with `cap_source` visibility, and per-stage capping (Phase 2) — IDs: RI1, RI7
- `src/workflow/skills/dispatch-subagents/references/output-schema.md` — acceptance criteria for
  reconcile contracts, conflict recording, cap counting, and council-mode disposition/evidence —
  IDs: RI1, R4, R10
- `src/workflow/skills/dispatch-subagents/SKILL.md` — Determinism Rules updated for the exception,
  conflict recording, cap independence; carve-out documented as its bounding principle — IDs: RI1, RI2
- `src/workflow/agent-behavior.yaml` — `council:` block and the firing resolution order — IDs: R2, R7, R11, RI8
- `src/workflow/schemas/agent-behavior.schema.yaml` — council schema, optional at top level so pre-1.1.0 configs still validate — IDs: R7, RI5
- `src/workflow/schemas/repo-profile.schema.yaml` — `tuning.council` overrides; locked-key enumeration extended — IDs: R2, R11, RI8
- `src/workflow/schemas/artifact-frontmatter.schema.yaml` — optional `council:` frontmatter block — IDs: R6, R14, RI4
- `workflow/config/repo-profile.yaml` — this repo's own `tuning.council.sandbox_root` — IDs: R11
- `src/workflow/skills/think-council/SKILL.md` — new council skill: roles, capability axes, challenge pass, availability — IDs: R3, R12, RI2
- `src/workflow/skills/think-council/references/output-schema.md` — round result and refusal result shapes — IDs: R3, R12
- `src/workflow/skills/lifecycle-think/SKILL.md` — eight-stage pipeline, mode resolution, round loop — IDs: R1, R5, R9, R13, R15
- `src/workflow/skills/lifecycle-think/references/single-agent-path.md` — new; pre-R21 workflow preserved verbatim — IDs: R8
- `src/workflow/skills/lifecycle-think/references/output-schema.md` — Council Log section and starter block — IDs: R5, R6, R14
- `src/workflow/validators/check-council-record.mjs` — new validator with summary output — IDs: RI3
- `src/workflow/validators/README.md` — validator entry plus six stated non-claims — IDs: RI3, RI6
- `scripts/validate-template.mjs` — registered the validator (explicit list, not auto-discovered) — IDs: RI3
- `test/run-violation-tests.mjs` + 15 fixture dirs — one rejection fixture per rule — IDs: RI9
- `test/run-conformance-tests.mjs` + `test/fixtures/conformance/council-wellformed/` — positive control, summary-output lock, stage-list lock, verbatim-preservation lock — IDs: R8, R15, RI3, RI9
- `src/workflow/validators/repo-digest.mjs` — new; filesystem-scoped repo digest covering gitignored build outputs, closing review residual R-2 — IDs: R11, RI3
- `src/workflow/validators/check-lifecycle.mjs` — checkpoint evidence extractor no longer truncates a multi-line verbatim quote (OI-73) — IDs: RI3
- `src/assets/hooks/pre-commit` — the downstream phase gate now applies to a task artifact only once it claims ready-for-next-phase, so incremental Build commits no longer require --no-verify (OI-74) — IDs: RI3
- `.githooks/pre-commit` — this repo's own copy, kept in sync with the shipped asset above (OI-74) — IDs: RI3
- `test/run-conformance-tests.mjs` — `shipped-neutrality` guard, `coverage-ledger-prose-drop` negative check, `r21-validator-named` pin, and a summary assertion that pins shape rather than literal counts — IDs: RI9
- `test/fixtures/lifecycle-violations/df-missing-reconcile-contract/` — overlap without a declared reconcile contract — IDs: RI1, RI9
- `test/fixtures/lifecycle-violations/dg-council-without-resolution/` — council mode with no resolution block — IDs: R7, RI9
- `test/fixtures/lifecycle-violations/dh-round2-web-no-spotcheck/` — a later round's web findings unsampled — IDs: R3, RI9
- `src/workflow/validators/check-coverage-ledger.mjs` — drop detection reads a status token instead of any prose occurrence — IDs: RI3
- `src/workflow/validators/check-scope-fence.mjs` — validates plan Touches entries for in-flight chains — IDs: RI3
- `test/fixtures/conformance/coverage-ledger-prose-drop/` — new; prose mentioning dropped/removed is not a drop claim — IDs: RI9
- `CLAUDE.md` — pre-finish checklist fixture count corrected; conformance:test line added — IDs: RI6
- `workflow/artifacts/plans/site-docs-remediation-tier2-3-v1.md` — repaired a Touches glob that expanded to nothing, found by the new check — IDs: RI3
- `src/workflow/validators/check-trigger-predicates.mjs` — removed internal tracker IDs from shipped comments — IDs: RI6
- `test/fixtures/lifecycle-violations/cy-sandbox-outside-root` — sandbox outside the repo but not under the resolved root (P1-1) — IDs: R11, RI9
- `test/fixtures/lifecycle-violations/cz-escalation-no-survivor-line` — a user-decision-required termination omitting its surviving-items declaration (P1-2; renamed from `cz-maxrounds-no-survivor-line` when the termination enum narrowed) — IDs: R13, RI9
- `test/fixtures/lifecycle-violations/ce-resolved-with-survivor` — terminated `resolved` while a declared surviving item closed in no round (renamed from `ce-maxrounds-survivor`) — IDs: R13, RI9
- `test/fixtures/lifecycle-violations/di-termination-not-in-enum` — new; `max-rounds` is no longer a value any record may carry — IDs: R14, RI9
- `test/fixtures/lifecycle-violations/dj-finding-round-not-declared` — new; finding attributed to a member in a round Members never declares it for — IDs: R3, RI9
- `test/fixtures/lifecycle-violations/dk-finding-without-round` — new; finding carrying no Round answers to no row in the Rounds table — IDs: R3, RI9
- `test/fixtures/lifecycle-violations/dl-vacuous-reconcile-contract` — new; a reconcile contract stating neither dedupe nor disagreement handling — IDs: RI1, RI9
- `.github/workflows/ci.yml` — CI runs on `release/**` pushes and PRs, so a PR targeting a release branch is verified off the author's machine — IDs: RI3
- `test/fixtures/lifecycle-violations/da-no-questions-section` — council brief whose escalation checks would pass vacuously — IDs: R5, RI9
- `test/fixtures/lifecycle-violations/db-resolution-mismatch` — mode contradicts its recorded resolution inputs (R-1) — IDs: R7, RI9
- `test/fixtures/lifecycle-violations/dc-refusal-reason-wrong` — refusal reason contradicts resolution precedence (R-1) — IDs: R7, RI9
- `test/fixtures/lifecycle-violations/dd-sandbox-without-integrity` — sandbox-using run with no repo digest (R-2) — IDs: R11, RI9
- `test/fixtures/lifecycle-violations/de-integrity-mismatch` — repo digest differs across the run (R-2) — IDs: R11, RI9

## Implementation Log

**Deliberate deviation from the plan's Repo Impact Map.** The map assigned R10 (evidence classes) to
`src/workflow/skills/think-council/`, created in Phase 3. R4 and R10 were instead placed in a new
shared file, `dispatch-subagents/references/council-contracts.md`, for a reason that only became
clear while writing them: WP-R22's Review council must inherit both contracts, and inheriting them
from a *Think-specific* skill couples the two councils in the wrong direction. Phase 1's stated
purpose is to land the surfaces R22 inherits and freeze them — placing them inside a Think skill
would have defeated that. The dispatch contract is the correct shared home, since both councils
already dispatch through it. No requirement changed; only the file that houses it.

**RI1 — independence narrowing.** The exception is stated once, in `independence-rules.md`, with
every other file referencing rather than restating it. The rule's substance is that disjointness
protected two things — write conflicts and unmergeable output — and a read-only worker cannot create
the first, leaving a merge problem that a stated contract solves.

The narrowing's teeth are conflict recording, not contract presence. A parent that silently picks
between two conflicting findings on a shared surface produces a wrong answer with a complete audit
trail, and discards the most valuable signal the overlap generated. Two edge cases were added that
the risk discussion surfaced but the brief did not spell out: two workers given the *same charter*
are still refused (the exception covers shared surfaces, not duplicated assignments), and a
sequencing dependency between candidate questions is not a merge problem, so no reconcile contract
resolves it.

**Cap independence.** `phase-caps.md` gained an explicit statement that overlapping read-only workers
still count against the cap. This was not in the brief and is a real ambiguity the narrowing
introduces: relaxing independence could be misread as relaxing concurrency. They are separate
constraints and now say so.

**R4 / R10.** Written as contracts with an explicit enforcement level per evidence class, so the
validator author in Phase 6 has an unambiguous target: `repo` resolves, `trial` is shape-plus-output,
`web` is shape-only, `recall` cannot stand alone. The file closes with the four non-claims stated
plainly, so the contract's specificity does not imply a guarantee of correctness it cannot deliver.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| RI1 | No file asserts the blanket independence form | grep returns no matches |
| RI1 | All five dispatch-subagents files carry the exception or reference it | all six files (five + new contract) match |
| RI1 | Build row explicitly excludes the exception | present in decision tree and SKILL.md |
| R4 | Disposition enum stated once with non-empty-reason rule | present in council-contracts.md |
| R10 | Four classes with per-class enforcement level | present in council-contracts.md |
| R4, R10 | Contracts referenced, not restated, from output-schema.md | reference present |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `grep -rn` blanket-form probe | RI1 exit gate | pass | "none — blanket form fully removed" |
| Six-file exception coverage probe | RI1 exit gate | pass | all six report `yes` |
| `npm run build` | RI5 (early) | pass | `build: ok`; `dist/` regenerated, gitignored |
| `npm run validate` | all | pass | exit 0 |
| `npm run conformance:test` | all | pass | 15/15 at Phase 1; **19/19** at Phase 7 (4 new R21 checks). Baseline is 15 on this branch — R19's two checks live on `feat/wp-r19-…`, not in this branch's ancestry |
| `npm run violations:test` | all | pass | 29/29 at Phase 1; **44/44** at Phase 7 (15 new R21 rejection fixtures) |
| `check-council-record --dir council-wellformed` | RI3 positive control | pass | Well-formed brief passes and prints the summary line; without this the 15 rejections would be satisfied by a validator that rejects everything |
| Per-fixture rejection sweep | RI9 | pass | All 15 rejected, each attributable to its own rule |
| Existing-brief regression | R6 | pass | Every brief under `workflow/artifacts/briefs/` and `examples/` validates with zero edits — `git status` on that tree is clean |

## Dispatch Log

none — Phase 1 is contract text across six coupled files in one directory. Every file asserts part of
the same rule, so no two candidates are independent under either the old rule or the new one. Running
this locally is what the contract being written requires.

## Architecture Notes

- role: Senior Engineer
- decision: House R4 and R10 in a shared `council-contracts.md` under the dispatch contract rather
  than inside the Think council skill, so WP-R22's Review council inherits them without depending on
  a Think-specific skill. Deviation from the plan's impact map, recorded above with rationale.
- decision: State the exception once and reference it from the other five files, rather than
  restating it in each. Restatement is how the five files drifted apart in the first place — this is
  the same failure class as OI-63/WP-R19, and repeating the text would have rebuilt the trap.
- constraint: Phase 1 is contract text only. No config keys, no skill, no validator — those consume
  these contracts in later phases and must not be written before the shapes settle.
- tradeoff: `council-contracts.md` sits in `dispatch-subagents/` even though it describes council
  behaviour rather than dispatch mechanics. Slightly odd home, chosen because it is the only
  directory both councils already load. The alternative — a top-level shared references directory —
  would be a larger structural change than this package should make.
- downstream: These three contracts are now frozen. Phases 2–7 consume them; WP-R22 inherits them.
  A change here after Phase 3 propagates into a commit-blocking gate rather than staying local, so
  reopening Phase 1 is the correct response to a needed change, not patching downstream.

## Blockers

none

## Phase Completion Log

| Phase | Completed | Exit gate evidence |
|---|---|---|
| Phase 1 - Contract foundations | 2026-08-17 | Blanket-form grep returns no matches; all six files carry or reference the exception; `validate` exit 0; conformance 15/15; violations 29/29 |
| Phase 2 - Config surface | 2026-08-17 | `council:` block and schemas land; `check-config` green. Gate initially recorded as a "partial deferral", which was wrong — see the Self-Audit entry below. Now closed properly: `check-council-record` resolves `max_rounds` and `sandbox_root` global-then-repo-local, and fixtures `cs`/`ct`/`cw` enforce the sandbox fence |
| Phase 3 - Council skill | 2026-08-17 | `think-council/` loads standalone with SKILL.md + references/output-schema.md; charter states repo fence, outward axis, and no-nesting explicitly; carve-out documented as bounding principle in dispatch-subagents SKILL.md |
| Phase 4 - Think restructuring | 2026-08-17 | Eight stages named in order — locked by conformance `r21-think-stages`; preserved single-agent path is verbatim — locked by `r21-single-agent-verbatim`; A5's 1.2.0 removal written into single-agent-path.md's Removal section for Ship to carry |
| Phase 5 - Record and schema | 2026-08-17 | `council:` frontmatter optional at top level; **every existing brief validates with zero edits** (`git status` clean on `workflow/artifacts/briefs/`); council and single-agent briefs distinguishable by frontmatter alone; `npm run build` clean; `render-adapters` reports shims current |
| Phase 6 - Validator | 2026-08-17 | `check-council-record.mjs` passes a well-formed brief and prints the summary line; registered in `scripts/validate-template.mjs`; README carries all six non-claims stated as plain limitations |
| Phase 7 - Rejection fixtures (second external review pass) | 2026-08-29 | Nine further external-review findings addressed: the termination enum narrowed to the two reachable reasons, the Findings `Round` column cross-checked against the Rounds and Members tables, the recall/web gap closed, the reconcile contract narrowed to non-challenger overlap and required to state both halves, the hook's unreadable-blob path now gates rather than skips, and the stale taper wording in `validators/README.md` and `lifecycle-think` corrected and pinned by conformance `r21-taper-wording` / `r21-termination-enum`. One deferred as OI-81. violations 63/63 → **67/67**, conformance 24 → **26/26**, `validate` exit 0, attribution sweep exactly one error per council fixture. CI now runs on `release/**`, so these numbers are reproducible off this machine for the first time on this branch |
| Phase 7 - Rejection fixtures (external review pass) | 2026-08-24 | Eleven of thirteen external-review findings fixed with fixtures; two deferred as OI-79/OI-80. violations 60/60 → **63/63**, conformance 23 → **24/24**, `validate` exit 0, and `env -u HOME` conformance identical. Findings table gained a `Round` column so the per-round spot-check rule is derivable from the table rather than inferred from Members |
| Phase 7 - Rejection fixtures | 2026-08-17 | violations 29/29 → **53/53** (24 new); conformance 15/15 → **19/19** (4 new); positive control passes; **attribution sweep confirms every fixture emits exactly one error**, so each rejection is traceable to its own rule |

## Self-Audit (2026-08-17, post-Phase-7)

The Phase 7 completion claim was wrong, and the way it was wrong matters more than the fix.

Six acceptance criteria were shipped as documentation with no mechanical enforcement:

| ID | Required | State at first "complete" |
|---|---|---|
| R9 | Every active R/RI classified with ≥1 evidence class | No schema field, no section, no check — entirely absent |
| R11 | Sandbox declared, inside `sandbox_root`, disjoint per member | Unimplemented; the validator never read a Members table |
| R2 | Carve-out member with outward capability fails | Unimplemented |
| R13 | Exceeding `max_rounds` fails | Config value never read |
| R5 | Surviving Q without recommendation / with bad refs fails | Only the recall-only half |
| R3 | Findings attributed to declared members | Only non-empty was checked |

**Cause.** Phase completion was judged by the suite being green. The suite only ever tested what had
been written, never what the plan required — so a green run proved the fixtures rejected and proved
nothing about criteria that had no fixture. Calling the shortfall a "partial gate deferral"
compounded it, dressing a gap as a schedule.

This is the same drift the package exists to prevent, committed while building it: prose shipped
where the requirement said check. That it happened here, under an explicit anti-drift brief, is the
strongest available evidence for the brief's own premise — instruction is what an agent drifts from.

**Correction.** `### Requirement Classification` and `### Members` added to the Think output schema;
a resolved-config loader added for `max_rounds` and `sandbox_root`; nine checks implemented; nine
fixtures added (`cp`–`cx`). An attribution sweep now confirms each of the 24 fixtures emits exactly
one error — two (`ch`, `co`) were previously failing on an undeclared member as well as their own
rule, which would have made them pass for the wrong reason if their real rule ever regressed.

**Residual.** R7's kill-switch precedence and R1's Complex-only trigger are still resolution
behaviour rather than record shape — an agent performs them, and no artifact records the input that
would let a validator re-derive the decision. `check-council-record` verifies what was recorded, not
that the resolution was performed correctly. Carried to Review as a known limit, stated rather than
closed.
