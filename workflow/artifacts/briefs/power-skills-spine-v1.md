---
slug: power-skills-spine
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-07-10T06:43:38Z
updated: 2026-07-10T07:05:00Z
manifest_ids:
  - R1
  - R2
  - R3
  - R4
  - R5
  - R6
  - R7
  - RI1
  - RI2
  - RI3
  - RI4
  - RI5
  - RI6
  - RI7
upstream:
  - wpr4-spike-notion-396972bd
  - user-request
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: approved
skill_trigger_log:
  - skill: repo-alignment-scan
    decision: skipped
    reason: Predates the skill-scoring feature; triggers were not evaluated at authoring time (backfilled for presence enforcement).
  - skill: architecture-decision-advisor
    decision: skipped
    reason: Predates the skill-scoring feature; triggers were not evaluated at authoring time (backfilled).
  - skill: constraint-conflict-scan
    decision: skipped
    reason: Predates the skill-scoring feature; triggers were not evaluated at authoring time (backfilled).
---

# Power Skills — Invariant Spine (WP-R4 Wave 0+1) - Brief

## Source Links

- Research spike (resolved, dev-ready): Notion WP-R4 spike (page `396972bd-ebbb-81ce-b93a-f78ddd97157d`) — 22-skill catalog across 5 categories, all 9 original comment threads + 1 follow-up (D1–D7 explicit-card expansion) resolved 2026-07-10.
- Roadmap: Notion "06 — Roadmap & Work Packages" (page `393972bd-ebbb-81e4-ac24-cb7d4e4bbf61`) — WP-R4 updated to Class: Complex, status "Spec dev-ready", Wave 0+1 vs Wave 2–4 split recorded.
- User request (this session): "It's ready now. Update notion doc along with roadmap, consider the branch feat/system-level-install as base and pick up this task. Task class is complex so make sure you divide it in proper manageable chunks... don't assume and resolve with me instead of silently dropping/hiding it."
- Two scope-defining decisions were resolved with the user via `AskUserQuestion` in this session before this brief was written (see Questions For User / Q1, Q2 below) — not assumed.

## Problem

Today only 4 power skills exist (`decompose-requirements`, `restore-context`, `dispatch-subagents`, `lifecycle-orchestrator`), and Build/Review/Test/Ship have thin or no power-skill support. The resolved WP-R4 spec designs a complete 22-skill system, but wiring all 22 at once repeats the exact mistake WP-R1 was created to fix: adding skill surface faster than the agent can be verified to follow it. The spec's own §8 build order stages this — Wave 1 (7 gate-bound, validator-backed skills forming the "invariant spine") ships first, with a real-task drift-measurement checkpoint before Waves 2–4 (15 more skills, mostly passive/judgment) are wired.

This brief scopes **only Wave 0 (scoring infrastructure) + Wave 1 (the invariant spine)** — the smallest complete, independently shippable, validator-backed slice of WP-R4.

## Goals

- Ship the 7 Category A/B gate-bound Wave-1 skills as real `src/workflow/skills/` power-skill directories, each following the existing power-skill anatomy.
- Wire each into the `## What To Load` + `## Exit Gate` sections of every lifecycle phase `SKILL.md` it applies to.
- Ship 8 new semantic validators (7 for the Wave-1 skills + `check-skill-triggers` for the Wave-0 scoring-log audit) and register them into the existing validation pipeline (`scripts/validate-template.mjs`, `test/run-violation-tests.mjs`), following the exact pattern those files already use — not a new invocation mechanism.
- Ship the `skill_scoring` model as a new first-class, schema-validated top-level key in `agent-behavior.yaml` (not stuffed into the untyped `extensions: {}` escape hatch), plus the `skill_trigger_log` frontmatter contract.
- Every new validator ships with at least one negative fixture under `test/fixtures/lifecycle-violations/` that it must reject.

## Non-Goals

- Waves 2–4 (`requirement-phase-mapper`/B1, `plan-assumption-verifier`/B2, `verification-matrix-builder`/B6, `follow-up-owner-assigner`/B9, all of Category C explorers, all 7 Category D domain experts, `verification-parallelizer`/E1, `open-items-ledger`/E2, `conditional-preservation-check`/B4) are explicitly out of scope for this chain. They become a separate follow-up brief once the Wave-1 real-task checkpoint clears (per the spec's own §8 and the roadmap update made this session).
- No adapter changes (`src/adapters/**`). Confirmed by inspection: adapters are generic gate shims referencing only `workflow/router.md` and `workflow/agent-behavior.yaml` — they do not enumerate individual skills, so CLAUDE.md's "keep adapters in sync" rule does not apply to this change.
- No new runtime dependency (repo invariant, CLAUDE.md rule 4).
- No change to `check-lifecycle.mjs`'s phase-transition gate behavior — Wave-1 validators are new, separate semantic checks, not modifications to the existing upstream-readiness gate.

## User Impact

Consumer repos gain 7 enforceable invariant checks (waiver completeness, requirement coverage tracing, evidence citation, build scope-fencing, manifest-coverage-vs-diff, skipped-check accounting, release-readiness aggregation) that currently exist only as advisory prose in `agent-behavior.yaml` and phase `SKILL.md` files, with no validator enforcing them today.

## Success Metrics

- All 7 Wave-1 skills exist with full anatomy and are cited from the correct phase `SKILL.md` `## What To Load` + `## Exit Gate` sections.
- `npm run build`, `npm run validate`, and `npm run violations:test` all pass with the new validators and fixtures included.
- Each new validator's fixture is confirmed rejected (non-zero exit), following the existing `[PASS]`/`[GAP]` reporting convention in `test/run-violation-tests.mjs`.

## Requirements

See Requirement Manifest below — this section intentionally stays at summary level per Think's "what and why" scope; Plan owns sequencing.

## Constraints

- Zero runtime dependencies — hand-rolled Node ESM only (CLAUDE.md rule 4).
- `additionalProperties: false` on both `agent-behavior.schema.yaml` and `artifact-frontmatter.schema.yaml` roots — `skill_scoring` and `skill_trigger_log` must be added as explicit schema properties, not silently permitted by a wildcard.
- Reference files are part of the skill contract and must not be collapsed into `SKILL.md` (`src/workflow/skills/README.md` rule).
- `require_non_default_branch_for_changes: true` and `default_branch_commit_requires_user_approval: true` (`repo-profile.yaml`) — work happens on `feat/wp-r4-power-skills-spine`, branched off `feat/system-level-install` per this session's resolved branch decision.
- `commands.discovery.do_not_invent_commands: true` (`repo-profile.yaml`) — verification commands are the real `npm run build` / `npm run validate` / `npm run violations:test` scripts already in `package.json`, not invented ones.

## Risks

- **Blast radius.** Wave-1 skills (via A1–A3) touch nearly every lifecycle phase `SKILL.md` (Think, Plan, Build, Review, Test, Ship, Reflect) — the largest single-chain footprint since WP-R1. Mitigation: Plan should consider `-p<P>` Build sub-phase splitting (per `lifecycle.md`'s "Build Phase Sub-Versioning") to keep each unit reviewable.
- **Schema amendment risk.** Adding `skill_scoring` and `skill_trigger_log` as first-class schema properties (rather than `extensions`) changes two schemas other tooling may assume are stable. Mitigation: additive-only changes (new optional properties), no existing property removed or retyped.
- **Wave 0 has no consumer in this chain.** `skill_scoring`/`skill_trigger_log`/`check-skill-triggers` are exercised only by a synthetic fixture until Wave 3 lands — confirmed and accepted by the user (Q2 below), not silently carried.

## Open Questions

See Questions For User — both raised in this session were resolved synchronously before this brief was finalized; recorded here for traceability per `assumption-policy.md` ("do not record a user-authority decision as an assumption").

## Requirement Manifest

### Explicit (R)

- **R1** - Implement the `skill_scoring` model in `agent-behavior.yaml` as specified in the resolved Notion spec §5 (signals, `complexity_score` weights, per-skill trigger predicates), as a new first-class schema-validated top-level key.
  - Acceptance: `agent-behavior.yaml` contains a `skill_scoring` block with `signals`, `complexity_score.weights`, and `triggers`; `agent-behavior.schema.yaml` validates it as a typed property (not via `extensions`); `npm run validate` passes.

- **R2** - Implement the `skill_trigger_log` frontmatter contract so any phase artifact can record a triggered skill's ran/skipped + reason decision.
  - Acceptance: `artifact-frontmatter.schema.yaml` (or a referenced sub-schema) validates a `skill_trigger_log` array of `{skill, signals, decision, reason}` entries; a fixture artifact with a valid log passes schema validation.

- **R3** - Implement the 7 Wave-1 gate-bound skills as new power-skill directories under `src/workflow/skills/`: `waiver-completeness-check`, `coverage-tracer`, `evidence-auditor`, `scope-fence`, `verify-manifest-coverage`, `skipped-check-accountant`, `release-readiness-gate` — each with the full power-skill anatomy (Purpose, Invocation Context, What To Load, Inputs, Refusal/Stop Conditions, Workflow, Exit Gate, Determinism Rules, Output), matching `decompose-requirements`'s shape.
  - Acceptance: all 7 directories exist with `SKILL.md` + non-empty `references/`; each Exit Gate states the concrete detectable failure named in the Notion spec's per-skill card (§4, A1–A3/B3/B5/B7/B8).

- **R4** - Wire each Wave-1 skill into the `## What To Load` and `## Exit Gate` sections of every lifecycle phase `SKILL.md` it applies to, per the Notion spec's phase mapping: A1 → Think/Plan/Build/Test/Ship; A2 → Plan/Review/Ship/Reflect; A3 → Review/Test/Ship/Reflect; B3 → Build; B5 → Review; B7 → Test; B8 → Ship.
  - Acceptance: `grep` for each skill name across `src/workflow/skills/lifecycle-*/SKILL.md` returns a hit in both `## What To Load` and `## Exit Gate` for every phase named in its card.

- **R5** - Implement 8 new validators under `src/workflow/validators/`: `check-waivers.mjs`, `check-coverage-ledger.mjs`, `check-evidence-citations.mjs`, `check-scope-fence.mjs`, `check-manifest-coverage.mjs`, `check-skipped-accounting.mjs`, `check-release-readiness.mjs`, `check-skill-triggers.mjs`, registered into `scripts/validate-template.mjs`'s existing validator-invocation array (the same pattern `check-starter-blocks.mjs`/`check-lifecycle.mjs` already use).
  - Acceptance: `npm run validate` invokes all 8 new validators; each exits 0 against a conforming fixture and non-zero against its negative fixture.

- **R6** - Add one negative fixture per new validator under `test/fixtures/lifecycle-violations/` (`e` through `n`, excluding any letters already used by the existing `a`–`d` fixtures) and register each in `test/run-violation-tests.mjs`'s `fixtures` array, following the existing `{id, dir, description}` shape.
  - Acceptance: `npm run violations:test` reports `[PASS]` (non-zero validator exit) for every new fixture; 0 `[GAP]` lines.

- **R7** - `npm run build`, `npm run validate`, and `npm run violations:test` all pass after the full Wave 0+1 change, with no regression to the 4 existing fixtures (`a`–`d`).
  - Acceptance: all three commands exit 0 with current-turn command output cited as evidence in the Build/Test artifacts.

### Implicit (RI)

- **RI1** - No new runtime dependency is introduced (repo invariant, CLAUDE.md rule 4).
  - Acceptance: `package.json` `dependencies` is unchanged; all new validator code is hand-rolled Node ESM using only `node:*` builtins and `lib.mjs`.

- **RI2** - New skill reference files are not collapsed into `SKILL.md` (`src/workflow/skills/README.md` rule).
  - Acceptance: each of the 7 new skill directories has a non-empty `references/` directory; `SKILL.md` cites each reference file by path.

- **RI3** - `npm run build` (`scripts/build-bundle.mjs`) picks up the 7 new skill directories into `dist/workflow-bundle.md` and syncs any new schema files from `src/workflow/schemas/` into `workflow/schemas/` without a build-script code change, or the build script is updated if it does not.
  - Acceptance: after `npm run build`, `dist/workflow-bundle.md` contains FILE-marker blocks for all 7 new skill directories; `workflow/schemas/` contains the updated `agent-behavior.schema.yaml` and `artifact-frontmatter.schema.yaml`.

- **RI4** - No adapter file (`src/adapters/**`) requires a change for this chain (confirmed by inspection this session — adapters are generic gate shims, not per-skill enumerations).
  - Acceptance: `git diff` for this chain touches no file under `src/adapters/`.

- **RI5** - This repo's own dogfooded lifecycle chain (`workflow/artifacts/`) records this Complex work under slug `power-skills-spine` v1, on branch `feat/wp-r4-power-skills-spine` (branched from `feat/system-level-install`), honoring `branch_policy.require_non_default_branch_for_changes`.
  - Acceptance: `git branch --show-current` returns `feat/wp-r4-power-skills-spine`; `workflow/artifacts/briefs/power-skills-spine-v1.md` (this file) exists.

- **RI6** - `agent-behavior.schema.yaml`'s root `additionalProperties: false` requires `skill_scoring` to be added as an explicit typed property, not merely permitted via the existing `extensions: {}` object (which has `additionalProperties: true` but provides no structural validation of its own contents).
  - Acceptance: `agent-behavior.schema.yaml` defines a `skill_scoring` property with its own nested schema (signals, complexity_score, triggers), not a free-form blob.

- **RI7** - `artifact-frontmatter.schema.yaml`'s root `additionalProperties: false` requires `skill_trigger_log` to be added as an explicit optional typed property.
  - Acceptance: `artifact-frontmatter.schema.yaml` defines `skill_trigger_log` as an optional array property with a typed item shape (`skill`, `signals`, `decision` enum `ran|skipped`, `reason`).

### Assumptions (A)

- **A1** - The 7 new validators stay as separate files matching the exact names already approved in the Notion spec (rather than merging their logic into the existing `check-artifacts.mjs` walk for parsing efficiency) — reversible, low-risk, and keeps this implementation traceable 1:1 to the stakeholder-approved spec naming. Plan may still factor shared parsing helpers into `lib.mjs` without renaming the validator files themselves.

- **A2** - `-p<P>` Build sub-phase splitting (per `lifecycle.md`) is left to Plan's judgment given the blast radius noted in Risks; not pre-decided here since it does not change requirement scope.

### Open Questions (Q)

- **Q1** - Branch strategy: new branch off `feat/system-level-install`, or continue directly on it?
  - Owner: user
  - Blocking: no — resolved 2026-07-10 in this session via `AskUserQuestion`. Decision: new branch `feat/wp-r4-power-skills-spine` off `feat/system-level-install`. See Architecture Notes.

- **Q2** - Does this chain cover Wave 0+1 only, or all 22 skills in one chain? And separately, does Wave 0 (no in-chain consumer) ship now or defer to Wave 2–4?
  - Owner: user
  - Blocking: no — resolved 2026-07-10 in this session via two `AskUserQuestion` rounds. Decisions: (1) Wave 0+1 only, Waves 2–4 become a separate follow-up brief after the real-task checkpoint; (2) Wave 0 ships now as originally scoped in the spec, accepting that it has no in-chain consumer until Wave 3. See Architecture Notes.

## Questions For User

None outstanding — Q1 and Q2 above were both resolved synchronously in this session before this brief was finalized.

## Architecture Notes

- role: Lead Architect
- decisions:
  - Scope this chain to Wave 0+1 only (7 gate-bound skills + scoring infra), not all 22 skills — keeps the Complex-class chain reviewable and matches the spec's own real-task checkpoint design (§8). Waves 2–4 will be a separate brief.
  - Branch `feat/wp-r4-power-skills-spine` off `feat/system-level-install` (unmerged, 7 commits ahead of `main`) rather than continuing directly on it — keeps WP-R4 independently reviewable/revertable from the system-install work.
  - `skill_scoring` and `skill_trigger_log` become first-class schema properties, not `extensions` blobs — consistent with every other config file in this repo (`domain.yaml`, `repo-profile.yaml`, `release.yaml`, `verification.yaml`, `source-of-truth.yaml`) all having explicit schemas; the `extensions: {}` escape hatch exists for genuinely ad hoc per-repo data, not for a spec-approved structural feature.
  - New validators are registered by extending the existing invocation pattern in `scripts/validate-template.mjs` and `test/run-violation-tests.mjs` (both already have a hardcoded list/array design) rather than inventing an auto-discovery mechanism — smallest change consistent with current architecture.
- constraints:
  - `additionalProperties: false` on both `agent-behavior.schema.yaml` and `artifact-frontmatter.schema.yaml` roots (confirmed by inspection) forces explicit schema amendment for both new keys (RI6, RI7).
  - Adapters confirmed untouched by inspection (RI4) — do not open `src/adapters/**` as part of this chain.
- tradeoffs:
  - Wave 0 ships without an in-chain consumer (accepted risk, Q2) rather than being deferred — trades a small amount of "unexercised until Wave 3" surface for avoiding a second `agent-behavior.yaml`/`artifact-frontmatter.schema.yaml` top-level amendment later.
  - Keeping 7 separate validator files (A1) over merging into `check-artifacts.mjs` trades a small amount of parse-efficiency for 1:1 traceability to the Notion-approved spec.
- assumptions: A1, A2 (see Requirement Manifest) — Plan must preserve the separate-file validator naming from A1 unless it returns to the user for confirmation.
- downstream_impact:
  - Plan must produce a Repo Impact Map covering: `agent-behavior.yaml` + `agent-behavior.schema.yaml`, `artifact-frontmatter.schema.yaml`, 7 new skill directories, 8 new validator files, up to 7 lifecycle phase `SKILL.md` files (What To Load + Exit Gate edits), `scripts/validate-template.mjs`, `test/run-violation-tests.mjs`, up to 8 new fixture directories.
  - Build should evaluate `-p<P>` sub-phase splitting (A2) given the file count and phase-file blast radius.
  - Ship must record that Waves 2–4 remain a tracked follow-up (roadmap already updated this session) rather than letting the work silently stop after Wave 1.

## Exit Gate

- [x] Every active R and RI has acceptance criteria.
- [x] No blocking Q IDs — Q1 and Q2 are both resolved and non-blocking; `orchestration.blockers` is empty.
- [x] User approved this finished brief document ("Approved, proceed to Plan", 2026-07-10). `status` set to `ready-for-next-phase`, `user_checkpoint: approved`.
