---
slug: power-skills-wave2
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-07-10T14:00:00Z
updated: 2026-07-10T14:00:00Z
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
  - workflow/artifacts/briefs/power-skills-wave2-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: approved
---

# Power Skills — Wave 2 (Phase Gates) - Plan

## Summary

Five build phases: E2's schema/artifact foundation first (contract-setting, per dependency-ordering.md),
then the 4 skills in phase-dependency order (Plan skills B1/B2 before Test's B6 before Reflect's
B9, since B9 depends on E2 which Phase 1 establishes), then validators, then fixtures, then closure.
Mirrors the Wave 1 + audit-chain precedent exactly: gate every phase boundary on the full suite.

**Phase gate check passed before writing this plan:**
`node src/workflow/validators/check-lifecycle.mjs --phase plan --slug power-skills-wave2` → ok

## Inputs

- Brief: `workflow/artifacts/briefs/power-skills-wave2-v1.md` — approved.
- `src/workflow/validators/check-pending-setup.mjs` + `schemas/pending-setup.schema.yaml` — the
  direct structural precedent for E2.
- `src/workflow/validators/lib.mjs`'s `artifactContracts` — confirmed E2 must NOT be registered
  there (it's not a 7-phase lifecycle artifact); `check-open-items.mjs` reads/validates it directly,
  same as `check-pending-setup.mjs` does for its own file.

## Requirement Coverage

| Manifest ID | State | Citation |
|---|---|---|
| R1 | covered | Phase 2 |
| R2 | covered | Phase 2 |
| R3 | covered | Phase 2 |
| R4 | covered | Phase 2 |
| R5 | covered | Phase 1 |
| R6 | covered | Phase 3 |
| R7 | covered | Phase 4 |
| R8 | covered | Phase 5 |
| RI1 | covered | Phase 2 |
| RI2 | covered | Phase 2 |
| RI3 | covered | Phase 5 |
| RI4 | covered | Phase 5 (verified, not touched) |
| RI5 | covered | Phase 1 (branch already correct) |
| RI6 | covered | Phase 1 |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `src/workflow/schemas/open-items.schema.yaml` | new | R5, RI6 | modeled directly on `pending-setup.schema.yaml` |
| `src/workflow/schemas/artifact-frontmatter.schema.yaml` | **not modified** | — | E2 deliberately does not use this schema (RI6) |
| `src/workflow/skills/requirement-phase-mapper/SKILL.md` + `references/` | new | R1, RI2 | |
| `src/workflow/skills/plan-assumption-verifier/SKILL.md` + `references/` | new | R2, RI2 | |
| `src/workflow/skills/verification-matrix-builder/SKILL.md` + `references/` | new | R3, RI2 | |
| `src/workflow/skills/follow-up-owner-assigner/SKILL.md` + `references/` | new | R4, RI2 | |
| `src/workflow/skills/README.md` | modify | R1, R2, R3, R4 | 4 new rows |
| `src/workflow/skills/lifecycle-plan/SKILL.md` | modify | R1, R2 | add both skills |
| `src/workflow/skills/lifecycle-test/SKILL.md` | modify | R3 | add verification-matrix-builder |
| `src/workflow/skills/lifecycle-reflect/SKILL.md` | modify | R4 | add follow-up-owner-assigner |
| `src/workflow/validators/check-phase-map.mjs` | new | R6, RI1 | |
| `src/workflow/validators/check-assumptions.mjs` | new | R6, RI1 | |
| `src/workflow/validators/check-verify-matrix.mjs` | new | R6, RI1 | |
| `src/workflow/validators/check-followups.mjs` | new | R6, RI1 | |
| `src/workflow/validators/check-open-items.mjs` | new | R5, R6, RI1 | |
| `src/workflow/validators/README.md` | modify | R6 | |
| `scripts/validate-template.mjs` | modify | R6 | add all 5 to `artifactCommands` |
| `test/fixtures/lifecycle-violations/*` | new (5 dirs) | R7 | |
| `test/run-violation-tests.mjs` | modify | R7 | register 5 new fixtures |

## Source-of-Truth Strategy

No external source-of-truth update required.

## Assumptions Verified

| Assumption ID | Status | Evidence / Question |
|---|---|---|
| A1 | evidence-backed | Inspected `src/workflow/validators/check-pending-setup.mjs` and `schemas/pending-setup.schema.yaml` directly during Think — confirmed the flat, `kind`-based, non-slug-versioned shape is a real, working precedent for exactly this kind of cross-run persistent data, supporting the `workflow/artifacts/open-items.yaml` placement decision. |

## Approach

Phase 1 establishes E2's schema/artifact shape first — it's a hard dependency for
`follow-up-owner-assigner` (Phase 2) and for `check-open-items.mjs`/`check-followups.mjs` (Phase 3).
Phase 2 authors the 4 skills together (same anatomy pattern, parallelizable in principle, done
sequentially here). Phase 3 validators, Phase 4 fixtures (dogfooded against real artifacts per the
established discipline — write the fixture, run it against real content, expect surprises), Phase 5
closure.

## Phases

### Phase 1 — E2 foundation: open-items schema + starter artifact (R5, RI5, RI6)

**Manifest IDs:** R5, RI5, RI6

**Touches:**
- `src/workflow/schemas/open-items.schema.yaml`

**Work:**
1. Model `open-items.schema.yaml` directly on `pending-setup.schema.yaml`'s structure: `version`,
   `kind: open-items`, `items` array with `id` (format `OI-N`, never renumbered), `source` (enum:
   `requirement`, `follow-up`), `owner`, `next_action`, `status` (enum: `open`, `done`, `blocked`,
   `deferred`), `first_seen_run` (the slug/date of the reflect run that created it).
2. Confirm branch/slug (RI5).

**Exit gate:**
- `open-items.schema.yaml` exists with the shape above; structurally comparable to
  `pending-setup.schema.yaml` (RI6) — both `kind`-based, no `orchestration` block.
- `npm run build && npm run validate && npm run violations:test` all exit 0.

### Phase 2 — Author the 4 skills + wire into phase files (R1, R2, R3, R4, RI2)

**Manifest IDs:** R1, R2, R3, R4, RI2

**Touches:**
- `src/workflow/skills/requirement-phase-mapper/`
- `src/workflow/skills/plan-assumption-verifier/`
- `src/workflow/skills/verification-matrix-builder/`
- `src/workflow/skills/follow-up-owner-assigner/`
- `src/workflow/skills/README.md`
- `src/workflow/skills/lifecycle-plan/SKILL.md`
- `src/workflow/skills/lifecycle-test/SKILL.md`
- `src/workflow/skills/lifecycle-reflect/SKILL.md`

**Work:**
1. Author each skill following the established anatomy (Purpose → Invocation Context → What To
   Load → Inputs → Refusal/Stop → Workflow → Exit Gate → Determinism Rules → Output), per the
   Notion spec's B1/B2/B6/B9 cards.
2. `follow-up-owner-assigner`'s Output explicitly names `workflow/artifacts/open-items.yaml` as
   what it writes to.
3. Wire each into its owning phase file's `## What To Load`/`## Refusal-Stop`/`## Workflow` +
   `## Exit Gate` per the brief's stated mapping.
4. Update `src/workflow/skills/README.md`.

**Exit gate:**
- All 4 directories exist with non-empty `references/`.
- `grep -l requirement-phase-mapper` / `plan-assumption-verifier` on `lifecycle-plan/SKILL.md` →
  both present; `grep -l verification-matrix-builder lifecycle-test/SKILL.md` → present;
  `grep -l follow-up-owner-assigner lifecycle-reflect/SKILL.md` → present.
- `npm run build && npm run validate && npm run violations:test` all exit 0.

### Phase 3 — Implement 5 validators + wire into npm run validate (R6, RI1)

**Manifest IDs:** R6, RI1

**Touches:**
- `src/workflow/validators/check-phase-map.mjs`
- `src/workflow/validators/check-assumptions.mjs`
- `src/workflow/validators/check-verify-matrix.mjs`
- `src/workflow/validators/check-followups.mjs`
- `src/workflow/validators/check-open-items.mjs`
- `src/workflow/validators/README.md`
- `scripts/validate-template.mjs`

**Work:**
1. `check-phase-map.mjs` — for plan artifacts, confirm every active R/RI (from `manifest_ids`)
   appears in exactly one `### Phase N` block's stated coverage.
2. `check-assumptions.mjs` — for plan artifacts, confirm every `A` ID in the Requirement Manifest
   has either a citation or a corresponding raised `Q` ID.
3. `check-verify-matrix.mjs` — for verify artifacts, confirm every `Manifest Coverage` row has a
   non-empty "How Verified" method.
4. `check-followups.mjs` — for reflect artifacts, confirm every `Follow-Ups` row has a non-empty
   Owner.
5. `check-open-items.mjs` — models `check-pending-setup.mjs` directly: validates
   `workflow/artifacts/open-items.yaml` against its schema when present; exits 0 with an informative
   message when absent (matching `check-pending-setup.mjs`'s "no file — nothing to check" pattern).
6. Wire all 5 into `scripts/validate-template.mjs`'s `artifactCommands`.
7. Individually verify each against real repo state before wiring (established discipline).

**Exit gate:**
- Each validator individually verified against real state before wiring.
- `npm run validate` shows all 5 executing.
- `npm run build && npm run validate && npm run violations:test` all exit 0.

### Phase 4 — Negative fixtures (R7)

**Manifest IDs:** R7

**Touches:**
- `test/fixtures/lifecycle-violations/` (5 new directories)
- `test/run-violation-tests.mjs`

**Work:**
1. One fixture per validator, each a genuine, minimal violation.
2. Register in `test/run-violation-tests.mjs` following the established per-fixture dispatch
   pattern.
3. Verify each individually before running the full suite.

**Exit gate:**
- `npm run violations:test` reports all 5 new fixtures `[PASS]`, 0 `[GAP]`, no regression to the
  existing 14.

### Phase 5 — Closure (R8, RI3, RI4)

**Manifest IDs:** R8, RI3, RI4

**Touches:** none (verification only).

**Work:**
1. Confirm `dist/workflow-bundle.md` contains FILE-marker blocks for all 4 new skills.
2. Confirm `workflow/schemas/open-items.schema.yaml` exists post-build.
3. Confirm zero adapter diffs.
4. Full suite: `npm run build && npm run validate && npm run violations:test && npm run setup-checks:test`.

**Exit gate:**
- All confirmations pass; full suite exits 0.

## Dependency Order

```
Phase 1 (R5)     ← E2 schema first: hard dependency for Phase 2's B9 and Phase 3's validators
  │
Phase 2 (R1, R2, R3, R4)  ← depends on Phase 1 for B9's Output section
  │
Phase 3 (R6)     ← depends on Phase 2 for skill names; depends on Phase 1 for check-open-items
  │
Phase 4 (R7)     ← depends on Phase 3: fixtures need validators to exist
  │
Phase 5 (R8)     ← depends on Phase 4: closure needs the full fixture set
```

## Branch Strategy

- Branch: `feat/wp-r4-power-skills-explorers` — already created off `feat/wp-r4-power-skills-spine`.
- Commit per phase boundary, per the standing per-phase-commit authorization for this session's
  approved chains.
- PR against `feat/wp-r4-power-skills-spine` (its actual parent, still unmerged), same reasoning as
  the audit chain's PR #27.

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|
| `check-open-items.mjs`'s "file absent = pass" behavior masks a genuine missing-ledger bug | Low | Low | Matches `check-pending-setup.mjs`'s established, working pattern exactly — an absent ledger is not itself an error, only a malformed one is | Build phase | R5, R6 |
| New validators pass their own fixtures but fail on first real-artifact contact (Wave 1's own pattern, 3-for-3 so far) | Medium | Medium | Explicit Build-phase step: dogfood each validator against real `workflow/artifacts/**` before wiring, not just its fixture | Build phase | R6 |
| B9's Output section drifts from E2's actual schema if Phase 2 is written before Phase 1 fully settles | Low | Low | Dependency order enforces Phase 1 before Phase 2 | Build phase | R4, R5 |

## Verification Plan

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1, R2, R3, R4 | `grep -l <skill>` on the correct phase file(s) | Phase 2 | |
| R5 | schema comparison to `pending-setup.schema.yaml` | Phase 1 | |
| R6 | `npm run validate` output | Phase 3 | |
| R7 | `npm run violations:test` output | Phase 4 | |
| R8 | full suite exit codes | Phase 5 | |
| RI1 | import grep on new validators | Phase 3 | |
| RI2 | `references/` non-empty per skill | Phase 2 | |
| RI3 | bundle + schema sync | Phase 5 | |
| RI4 | adapter diff empty | Phase 5 | |
| RI5 | branch/slug correct | Phase 1 | |
| RI6 | schema structural comparison | Phase 1 | |

## Architecture Notes

- role: Principal Engineer
- decision: E2 schema-first ordering (Phase 1) is the one meaningful sequencing deviation from Wave
  1's "schema → skills → wiring → validators → fixtures → closure" pattern — necessary because B9's
  Output section references E2 directly, unlike Wave 1 where `skill_scoring` had no such per-skill
  Output dependency.
- constraint: `check-open-items.mjs` must not register in `artifactContracts` (RI6) — it validates
  `workflow/artifacts/open-items.yaml` directly, the same way `check-pending-setup.mjs` validates
  `workflow/config/pending-setup.yaml` directly.
- tradeoff: none significant.
- downstream: Review must confirm E2's schema genuinely matches `pending-setup.schema.yaml`'s shape
  (not just superficially) and that `follow-up-owner-assigner` actually writes to the right path.

## Open Questions

None. Plan is unblocked.

## Exit Gate

- [x] Every active R and RI is mapped to exactly one owning phase.
- [x] Every phase has a binary, falsifiable exit gate.
- [x] Dependency order is explicit.
- [x] All risks have mitigations.
- [x] Verification plan covers every R and RI with named commands.
- [x] Source-of-truth handling explicit: none required.
- [x] Branch strategy defined.
- [x] No open questions; no blockers.
