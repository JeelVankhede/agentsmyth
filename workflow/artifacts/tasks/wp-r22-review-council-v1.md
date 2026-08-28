---
slug: wp-r22-review-council
version: 1
artifact: task
status: in-progress
created: 2026-08-29
updated: 2026-08-29
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9, RI10, RI11, RI12, RI13, RI14, RI15, RI16, RI17, RI18, RI19]
upstream:
  - workflow/artifacts/briefs/wp-r22-review-council-v1.md
  - workflow/artifacts/plans/wp-r22-review-council-v1.md
orchestration:
  phase: build
  status: blocked
  next_phase: review
  blockers: [B1]
  user_checkpoint: none
---

# WP-R22 Review Council (Fresh-Eyes Multi-Agent Review) - Task

## Active Phase

- Phase: Phase 1 - Review-phase council config
- Manifest IDs: RI5
- Exit gate: `phase-caps.md` names a Review default distinct from Think's inheritance;
  `npm run validate` exits 0; a repo declaring no `max_parallel_workstreams` resolves a Review cap
  from the new key.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Review-phase council config | active | RI5 |
| Phase 2 - Finding-quality ledger contract | pending | RI6, RI15 |
| Phase 3 - Review council skill and charter | pending | R2, R3, RI12, RI19 |
| Phase 4 - lifecycle-review restructuring and record shape | pending | R7, RI3, RI13, RI14, RI17, RI18 |
| Phase 5 - Validator extended to review artifacts | pending | R1, R4, R6, RI1, RI2, RI4 |
| Phase 6 - Ledger validator, closure gate, reporting | pending | R5, RI7, RI8, RI16 |
| Phase 7 - Per-question bucket join | pending | RI10 |
| Phase 8 - Fixtures, conformance, generated output | pending | RI9, RI11 |

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

**Phase 1 (RI5)** — implementation complete, phase NOT closed pending the blocker below.

- `src/workflow/agent-behavior.yaml` — `council.per_phase.review.default_fan_out: 2`, with the
  reasoning for 2-not-3 in the comment — IDs: RI5
- `src/workflow/schemas/agent-behavior.schema.yaml` — `per_phase` declared as an optional object;
  `default_fan_out`'s description narrowed to state it is Think's alone — IDs: RI5
- `src/workflow/skills/dispatch-subagents/references/phase-caps.md` — new "Review council default"
  section stating 2 and its three reasons; the Think-only scoping paragraph now names
  `council.per_phase.<phase>` as the place a new phase declares its own, and states that a phase
  absent from that map gets no departure at all — IDs: RI5

## Implementation Log

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

## Dispatch Log

none — Phase 1 is a three-file config and documentation change whose parts are mutually dependent
(the config key, its schema, and the prose that explains it). No independent workstream exists.

## Architecture Notes

- role: Senior Engineer
- decision: recorded per phase in the Implementation Log as each lands.
- constraint: additive-only for 1.1.0; zero runtime dependencies; five adapters stay in sync.
- downstream: Review inherits the fixture and conformance evidence recorded here.

## Blockers

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

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
