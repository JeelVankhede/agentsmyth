---
slug: wp-r21-think-council
version: 1
artifact: task
status: in-progress
created: 2026-08-17
updated: 2026-08-17
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9]
upstream:
  - workflow/artifacts/briefs/wp-r21-think-council-v1.md
  - workflow/artifacts/plans/wp-r21-think-council-v1.md
orchestration:
  phase: build
  status: in-progress
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# WP-R21 Think Council - Task

## Active Phase

- Phase: Phase 1 - Contract foundations (complete, awaiting user checkpoint before Phase 2)
- Manifest IDs: RI1, R4, R10
- Exit gate: a grep proves no file still asserts the blanket independence form; all five
  `dispatch-subagents` files changed together; disposition and evidence-class shapes stated once,
  referenced elsewhere, and containing no open placeholders. **Met** — see Command Results.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Contract foundations | complete | RI1, R4, R10 |
| Phase 2 - Config surface | pending | R2, R7, R11, RI7, RI8 |
| Phase 3 - Council skill | pending | R3, R12, RI2 |
| Phase 4 - Think restructuring | pending | R1, R5, R8, R9, R13, R15 |
| Phase 5 - Record and schema | pending | R6, R14, RI4, RI5 |
| Phase 6 - Validator | pending | RI3, RI6 |
| Phase 7 - Rejection fixtures | pending | RI9 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `feat/wp-r21-think-council` | clean | Five commits: brief, Q resolutions, brief expansion, risk hardening, brief approval, plan, plan approval |
| At handoff | `feat/wp-r21-think-council` | Phase 1 changes staged | Six source files touched, all under `src/workflow/skills/dispatch-subagents/`; `dist/` regenerated but gitignored |

## Scope

- In scope: Phase 1 only — the three contracts WP-R22 inherits (RI1 independence narrowing, R4
  disposition contract, R10 evidence classes). Frozen after this phase per the plan's Approach.
- Out of scope: Phases 2–7. No config, skill, pipeline, schema, validator, or fixture work in this
  phase. No behavioural code — Phase 1 is contract text only.

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
- `src/workflow/skills/dispatch-subagents/references/phase-caps.md` — new section: overlapping
  read-only workers still count against the cap — IDs: RI1
- `src/workflow/skills/dispatch-subagents/references/output-schema.md` — acceptance criteria for
  reconcile contracts, conflict recording, cap counting, and council-mode disposition/evidence —
  IDs: RI1, R4, R10
- `src/workflow/skills/dispatch-subagents/SKILL.md` — Determinism Rules updated for the exception,
  conflict recording, and cap independence — IDs: RI1

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
| `npm run conformance:test` | all | pass | 15/15 — correct baseline on this branch; R19's two extra checks live on `feat/wp-r19-…`, not in this branch's ancestry |
| `npm run violations:test` | all | pass | 29/29 |

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
