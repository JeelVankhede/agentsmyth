---
slug: power-skills-wave2
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-07-10T13:51:01Z
updated: 2026-07-10T13:51:01Z
manifest_ids:
  - R1
  - R2
  - R3
  - R4
  - R5
  - R6
  - R7
  - R8
  - RI1
  - RI2
  - RI3
  - RI4
  - RI5
  - RI6
upstream:
  - workflow/artifacts/reflect/power-skills-spine-v1.md
  - workflow/artifacts/reflect/audit-validator-fixture-gaps-v1.md
  - wpr4-spike-notion-396972bd
  - user-request
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: approved
---

# Power Skills — Wave 2 (Phase Gates) - Brief

## Source Links

- Resolved WP-R4 Notion spec (page `396972bd-ebbb-81ce-b93a-f78ddd97157d`) — B1
  `requirement-phase-mapper`, B2 `plan-assumption-verifier`, B6 `verification-matrix-builder`, B9
  `follow-up-owner-assigner`, E2 `open-items-ledger` per-skill cards.
- `workflow/artifacts/reflect/power-skills-spine-v1.md` — prior chain's Follow-Ups: "Design +
  implement WP-R4 Wave 2–4" (now unblocked) and confirms the real-task checkpoint precondition is
  satisfied (`workflow/artifacts/reflect/audit-validator-fixture-gaps-v1.md`).
- User request (this session): approved chunking Wave 2–4 into 3 sub-chains; this is the first,
  scoped to the 4 phase-gate skills.
- Classification: **Complex** (new architectural pattern: a cross-run persistent artifact type,
  E2, distinct from the existing 7 slug-versioned lifecycle artifacts).

## Problem

Plan, Test, and Reflect each have real, named gaps the resolved spec identifies: Plan has no
mechanical check that every R/RI maps to exactly one build phase (`requirement-phase-mapper`) or
that planning assumptions are evidence-backed rather than silent (`plan-assumption-verifier`); Test
has no check that its verification matrix actually covers every R/RI with a named method
(`verification-matrix-builder`); Reflect has no check that follow-ups carry an owner, and no durable
place for them to live past the reflection narrative (`follow-up-owner-assigner` + the `open-items`
ledger it writes to).

**Real design correction found during this Think phase:** the resolved spec described the
open-items ledger as a slug-versioned file under `workflow/artifacts/open-items/<slug>-v<N>.md`,
matching the shape of the 7 existing lifecycle artifacts. On inspection, this is the wrong shape —
open items are genuinely cross-run persistent data (a running list of unresolved follow-ups
spanning every lifecycle chain in the repo, not one phase's output for one chain). The real
precedent for this shape already exists: `workflow/config/pending-setup.yaml` (a flat, `kind`-based
data file with an `items` array, no `orchestration`/phase-transition block). E2 is redesigned to
follow that precedent instead.

## Goals

- Ship `requirement-phase-mapper` (B1), `plan-assumption-verifier` (B2), `verification-matrix-builder`
  (B6), `follow-up-owner-assigner` (B9) with full power-skill anatomy, wired into Plan/Plan/Test/Reflect
  respectively.
- Ship the corrected `open-items-ledger` (E2) design: a single persistent
  `workflow/artifacts/open-items.yaml` file (not slug-versioned), schema modeled on
  `pending-setup.schema.yaml`'s shape, written by `follow-up-owner-assigner`.
- Ship 5 new validators (one per skill + `check-open-items` for E2's own structural shape), wired
  into `npm run validate`.
- Ship negative fixtures for each, following the Wave 1 + audit-chain precedent (dogfood against
  real artifacts before wiring, not just fixtures).

## Non-Goals

- Wave 3 (C1–C3 explorers, D1–D7 domain experts, E1 verification-parallelizer) and Wave 4 (B4,
  remaining playbooks) are explicitly out of scope — separate future chains.
- Do not retrofit `check-open-items.mjs`'s design onto the existing 7-artifact
  `artifactContracts`/`lifecycle-artifact.schema.yaml` machinery — E2 is deliberately a different
  kind of file (config/data, not a lifecycle-phase artifact) and gets its own schema + validator,
  matching `check-pending-setup.mjs`'s pattern, not `check-artifacts.mjs`'s.
- No adapter changes, no runtime dependency, no `check-lifecycle.mjs` phase-transition changes.

## User Impact

Consumer repos gain 4 more enforceable invariant checks (Plan's requirement-phase mapping and
assumption verification, Test's verification-matrix completeness, Reflect's follow-up
accountability) plus a durable, cross-run place for open items to actually persist and be tracked
— today they only exist as prose in individual Reflect artifacts, easy to lose track of.

## Success Metrics

- All 4 skills exist with full anatomy, cited from the correct phase `SKILL.md`.
- `workflow/artifacts/open-items.yaml` exists with a real schema; `follow-up-owner-assigner` writes
  to it.
- `npm run build && npm run validate && npm run violations:test` all pass, new validators included,
  0 regressions on the existing 14 Wave-1 fixtures + 4 setup-checks tests.

## Requirements

See Requirement Manifest below.

## Constraints

- Zero runtime dependencies.
- E2's schema/location must not collide with or duplicate `pending-setup.schema.yaml`'s role
  (config-resolution tracking) — open-items is follow-up tracking, a different concern, even though
  the file *shape* is borrowed.
- Reference files not collapsed into `SKILL.md`.
- Non-default branch (`feat/wp-r4-power-skills-explorers`, off `feat/wp-r4-power-skills-spine`).

## Risks

- E2's redesign (persistent single file vs. slug-versioned) is a real deviation from the literal
  Notion spec text — mitigated by grounding the new design in an existing, working precedent
  (`pending-setup.yaml`) rather than inventing a novel shape, and documenting the deviation
  explicitly rather than silently diverging.
- `check-open-items.mjs` needs its own artifact-type registration path distinct from
  `artifactContracts` — risk of inconsistency with how other validators resolve paths; mitigated by
  modeling directly on `check-pending-setup.mjs`'s existing, working implementation.

## Open Questions

None — the E2 design correction is grounded in direct repo inspection, not ambiguous; branch/wave
chunking already resolved via prior `AskUserQuestion` rounds this session.

## Requirement Manifest

### Explicit (R)

- **R1** - Implement `requirement-phase-mapper` (B1): maps every active R/RI to exactly one build
  phase with a binary exit gate; flags orphans and duplicates. Wired into Plan's `## Workflow` +
  `## Exit Gate`.
  - Acceptance: skill exists with full anatomy; `check-phase-map.mjs` flags a plan with an
    unmapped or duplicately-mapped R/RI.

- **R2** - Implement `plan-assumption-verifier` (B2): cross-verifies each planning assumption
  against concrete repo evidence; unresolved assumptions become raised blocking questions. Wired
  into Plan's `## What To Load` + `## Refusal / Stop Conditions`.
  - Acceptance: skill exists with full anatomy; `check-assumptions.mjs` flags an assumption with
    no evidence citation and no corresponding raised question.

- **R3** - Implement `verification-matrix-builder` (B6): builds the R/RI → method → evidence →
  status matrix; flags method-less rows. Wired into Test's `## Workflow` + `## Exit Gate`.
  - Acceptance: skill exists with full anatomy; `check-verify-matrix.mjs` flags a verify artifact
    row with no method.

- **R4** - Implement `follow-up-owner-assigner` (B9): ensures every open follow-up has an owner +
  next action, and persists it to the open-items ledger. Wired into Reflect's `## Exit Gate`.
  - Acceptance: skill exists with full anatomy; `check-followups.mjs` flags a follow-up row with
    no owner.

- **R5** - Implement the corrected `open-items-ledger` (E2): a single persistent
  `workflow/artifacts/open-items.yaml`, schema modeled on `pending-setup.schema.yaml`'s shape
  (`kind`-based, `items` array), written by `follow-up-owner-assigner`.
  - Acceptance: `open-items.schema.yaml` exists; a fixture `open-items.yaml` validates against it;
    `follow-up-owner-assigner`'s `SKILL.md` documents writing to this exact path.

- **R6** - Implement 5 new validators (`check-phase-map.mjs`, `check-assumptions.mjs`,
  `check-verify-matrix.mjs`, `check-followups.mjs`, `check-open-items.mjs`), wired into
  `npm run validate`.
  - Acceptance: `npm run validate` output shows all 5 executing.

- **R7** - Add negative fixtures for each of the 5 new validators, following the Wave 1 +
  audit-chain precedent (verify against real, adversarial content, not just minimal fixtures) —
  wired into `npm run violations:test`.
  - Acceptance: `npm run violations:test` reports all new fixtures `[PASS]`, 0 `[GAP]`.

- **R8** - `npm run build && npm run validate && npm run violations:test && npm run
  setup-checks:test` all pass, with no regression to the existing 14 Wave-1 fixtures or 4
  setup-complete regression checks.
  - Acceptance: all four commands exit 0, current-turn output cited.

### Implicit (RI)

- **RI1** - No new runtime dependency.
  - Acceptance: `package.json` `dependencies` unchanged; new validator code uses only `node:*` and
    `lib.mjs`.

- **RI2** - Reference files not collapsed into `SKILL.md` for any of the 4 new skills.
  - Acceptance: each skill directory has non-empty `references/`, cited from `SKILL.md`.

- **RI3** - `npm run build` picks up the 4 new skill directories and the new `open-items.schema.yaml`.
  - Acceptance: `dist/workflow-bundle.md` contains FILE-marker blocks for all 4 skills;
    `workflow/schemas/open-items.schema.yaml` exists post-build.

- **RI4** - No adapter file changes.
  - Acceptance: `git diff --stat` shows zero files under `src/adapters/`.

- **RI5** - Correct branch/slug throughout (`feat/wp-r4-power-skills-explorers`, slug
  `power-skills-wave2`).
  - Acceptance: `git branch --show-current` matches; all artifacts use the correct slug.

- **RI6** - E2's schema and validator follow the `pending-setup.yaml`/`check-pending-setup.mjs`
  precedent exactly (not the 7-artifact `lifecycle-artifact` shape) — a deliberate, documented
  architecture correction from the original Notion spec text.
  - Acceptance: `open-items.schema.yaml`'s structure is directly comparable to
    `pending-setup.schema.yaml`'s (both `kind`-based flat files with an `items` array); no
    `orchestration` block.

### Assumptions (A)

- **A1** - `workflow/artifacts/open-items.yaml` (top-level, not nested under a new `open-items/`
  subdirectory) is the correct location — matches `pending-setup.yaml`'s flat placement under
  `workflow/config/`, adapted to `workflow/artifacts/` since open items originate from Reflect
  (an artifact-producing phase), not initial repo config. Reversible, low-risk.

### Open Questions (Q)

None.

## Questions For User

None outstanding.

## Architecture Notes

- role: Lead Architect
- decisions:
  - E2 redesigned from a slug-versioned lifecycle artifact to a single persistent `kind`-based
    file, grounded in the real `pending-setup.yaml` precedent — the original Notion spec's literal
    text was under-specified/wrong about the shape, found by inspection before Build, not after.
  - Scope this chain to exactly the 4 phase-gate skills + E2 (their hard dependency), matching the
    approved Wave 2/3/4 chunking.
- constraints: zero-dep invariant; E2 must not duplicate `pending-setup.yaml`'s concern.
- tradeoffs: none significant — this is a smaller, more contained chain than Wave 1.
- downstream: Plan must define the exact `check-open-items.mjs` validation shape before Build,
  mirroring `check-pending-setup.mjs`'s structure closely enough that a future maintainer
  recognizes the pattern immediately.

## Exit Gate

- [x] Every active R and RI has acceptance criteria.
- [x] No blocking Q IDs.
- [x] User approved via "Yes, start Wave 2"; `status` set to `ready-for-next-phase`.
