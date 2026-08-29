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
  status: in-progress
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# WP-R22 Review Council (Fresh-Eyes Multi-Agent Review) - Task

## Active Phase

- Phase: Phase 4 - Finding-quality ledger contract
- Manifest IDs: RI6, RI15
- Exit gate: `check-schema-keywords.mjs` exits 0 over the new schema; both ledger files parse
  against it; `npm run validate` exits 0.

## Plan Phases Overview

Plan revised 2026-08-29 on user direction after blocker B1; phases renumbered to 10 so the
schema-enforcement work lands early, where every later phase's constraints benefit from it.

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Per-phase council caps, symmetric | complete | RI5, RI20 |
| Phase 2 - Definitions validated against their schemas | complete | RI21 |
| Phase 3 - Per-repo council tuning and the setup interview | complete | RI22 |
| Phase 4 - Finding-quality ledger contract | active | RI6, RI15 |
| Phase 5 - Review council skill and charter | pending | R2, R3, RI12, RI19 |
| Phase 6 - lifecycle-review restructuring and record shape | pending | R7, RI3, RI13, RI14, RI17, RI18 |
| Phase 7 - Validator extended to review artifacts | pending | R1, R4, R6, RI1, RI2, RI4 |
| Phase 8 - Ledger validator, closure gate, reporting | pending | R5, RI7, RI8, RI16 |
| Phase 9 - Per-question bucket join | pending | RI10 |
| Phase 10 - Fixtures, conformance, generated output | pending | RI9, RI11 |

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
- `src/workflow/skills/dispatch-subagents/references/phase-caps.md` — new "Review council default"
  section stating 2 and its three reasons; the Think-only scoping paragraph now names
  `council.per_phase.<phase>` as the place every phase declares its own, a shipped-values table for
  think/review/everything-else, and the fail-safe rule — IDs: RI5, RI20

## Implementation Log

**Phase 3 (RI22) — two findings worth carrying to Review.**

*The dogfood loop validates the GLOBAL definitions, not the source.* A schema change in
`src/workflow/schemas/` is synced by `npm run build` into `dist/` and the dev workspace, but
`~/.agentsmyth/workflow/` only moves when `agentsmyth prepare` runs. `defsPath()` resolves to the
global install here (`definitions_root` in `repo-profile.yaml`), so `check-config` was validating
the old global copy while the source already carried the new shape — the traversal probe said
`MISSING at per_phase` for a key plainly present in `src/`. Running `prepare` closed it. The
asymmetry is real and not local-only: CI has no `~/.agentsmyth`, so the two-root resolver falls back
to the repo-local `workflow/` copy that `build` syncs — meaning **CI and a developer's machine
validate different files**. That is the "passes on the author's machine" class the WP-R21 PR review
flagged, one layer down. Recorded rather than fixed: it is outside RI22 and belongs to Review.

*`check-pending-setup.mjs` is never run.* It is not registered in `scripts/validate-template.mjs`,
so `npm run validate` never calls it. Run directly, it exits 1 on this repo — PS-1, PS-2 and PS-3
are `resolved` with no `resolved_by`, which its own rule forbids. Pre-existing, unrelated to RI22,
and left alone per `scope-control.md`'s prohibition on unrelated cleanup. Same family as B1: a
checker that exists and never runs.

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

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Phase 1 - Per-phase council caps, symmetric | complete | 2026-08-29 | `per_phase.think: 3` and `per_phase.review: 2`, no phase special-cased; a phase absent from the map falls back to 1, so forgetting to decide fails safe. `phase-caps.md` carries a shipped-values table. Superseded the first Phase 1 implementation, which kept `default_fan_out` as Think's implicit home |
| Phase 3 - Per-repo council tuning and the setup interview | complete | 2026-08-29 | `tuning.council.per_phase` mirrors the global shape and merges per entry (m12-m14, 14/14). The interview item was added by running the real `check` skew path, and a second run added nothing. Both probe directions discriminate: an out-of-range repo override is rejected naming the path, a valid one is accepted. Two findings recorded for Review — the dogfood loop validates the global definitions rather than the source, and `check-pending-setup` is never registered |
| Phase 2 - Definitions validated against their schemas | complete | 2026-08-29 | `check-config` applies a definitions file's schema to it. Four probes rejected with the offending path named, including one against a pre-existing `required` key — so the fix covers the whole schema, not only the keys this package added. Unmodified repo still validates clean |
