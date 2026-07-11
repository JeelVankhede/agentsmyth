---
slug: power-skills-wave4
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-07-11T17:15:00Z
updated: 2026-07-11T17:25:00Z
manifest_ids:
  - R1
  - R2
  - RI1
  - RI2
  - RI3
upstream:
  - workflow/artifacts/briefs/power-skills-wave4-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: approved
---

# Power Skills — Wave 4 (Conditional Preservation Check) - Plan

## Summary

Ships the one remaining skill from the resolved WP-R4 22-skill catalog: B4
`conditional-preservation-check`. Single Build phase — smallest WP-R4 chain, matching the
established anatomy of every other shipped skill, no validator (spec-rated "No/semantic").

**Phase gate check passed before writing this plan:**
`node src/workflow/validators/check-lifecycle.mjs --phase plan --slug power-skills-wave4` → ok

## Inputs

- Brief: `workflow/artifacts/briefs/power-skills-wave4-v1.md` — status `ready-for-next-phase`, user-approved.
- Active manifest IDs: R1, R2, RI1-RI3, A1 (non-blocking).
- Branch: `feat/wp-r4-power-skills-wave4`, branched fresh off `origin/main`.
- Real precedent inspected: `architecture-decision-advisor/SKILL.md` (C2, Wave 3) — closest anatomy
  match for an Active, judgment-only, no-validator skill.

## Requirement Coverage

| Manifest ID | Covered by phases | Owning phase |
|---|---|---|
| R1 | Phase 1 | Phase 1 |
| R2 | Phase 1 | Phase 1 |
| RI1 | Phase 1 | Phase 1 |
| RI2 | Phase 1 | Phase 1 |
| RI3 | Phase 1 | Phase 1 |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `src/workflow/skills/conditional-preservation-check/SKILL.md` + `references/{output-schema,detection-method}.md` | new | R1, RI2 | B4 skill |
| `src/workflow/skills/lifecycle-build/SKILL.md` | modify | R2 | wire into `## Workflow`, invoked when a refactor touches control flow |
| `src/workflow/skills/README.md` | modify | R1 | add 1 new Power Skills row |

## Source-of-Truth Strategy

No external source-of-truth update required — self-contained repository files.

## Assumptions Verified

| Assumption ID | Status | Evidence / Question |
|---|---|---|
| A1 | evidence-backed | `ls src/workflow/validators/` contains no `check-architecture-decision*`, `check-system-design*`, `check-ui-ux*`, or `check-performance-optimizer*` files — confirms C2/D3/D4/D7 (the spec's other "No/semantic" rated skills) genuinely shipped with no validator in Wave 3, the exact precedent B4 follows. |

## Approach

Single Build phase — the scope is one skill directory plus one phase-file wiring point, small
enough that further sub-phasing would add process overhead with no reviewability benefit.

**Enforcement pattern:** `npm run build && npm run validate && npm run violations:test` must exit 0
before Review begins.

## Phases

### Phase 1 — B4 skill + Build wiring (R1, R2, RI1, RI2, RI3)

**Manifest IDs:** R1, R2, RI1, RI2, RI3

**Touches:**
- `src/workflow/skills/conditional-preservation-check/`
- `src/workflow/skills/lifecycle-build/SKILL.md`
- `src/workflow/skills/README.md`

**Work:**
1. Author `conditional-preservation-check` with full anatomy (Purpose, Invocation Context, What To
   Load, Inputs, Refusal/Stop Conditions, Workflow, Exit Gate, Determinism Rules, Output), matching
   the established pattern.
2. Wire into `lifecycle-build/SKILL.md`'s `## Workflow`, invoked when a refactor touches control
   flow (fold/merge/rename operations detected in the diff).
3. Add to `src/workflow/skills/README.md`'s Power Skills table.

**Exit gate:**
- Skill directory exists with `SKILL.md` + non-empty `references/`; wired into `lifecycle-build/SKILL.md`.
- `npm run build && npm run validate && npm run violations:test` all exit 0.

## Dependency Order

Single phase — no ordering to resolve.

## Branch Strategy

`feat/wp-r4-power-skills-wave4`, branched fresh off `origin/main` (which now includes all of Waves 1-3).

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Semantic-only skill has no automated regression protection | High (inherent) | Low | Matches the spec's own explicit "No (semantic)" rating — same accepted tradeoff as C2/D3/D4/D7 |

## Verification Plan

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1 | `ls src/workflow/skills/conditional-preservation-check/SKILL.md` | Test | |
| R2 | `grep -l conditional-preservation-check src/workflow/skills/lifecycle-build/SKILL.md` | Test | |
| R9 | `npm run build && npm run validate && npm run violations:test` | Test | |

## Architecture Notes

- role: Lead Architect
- decision: Single Build phase — scope is too small to benefit from sub-phasing.
- constraint: no validator/fixture, matching the spec's own rating.
- assumptions: A1 (see brief).
- downstream_impact: this is the final chain closing the resolved WP-R4 22-skill catalog. Reflect
  must record this as WP-R4's completion.

## Open Questions

none.

## Exit Gate

- [x] Every phase has manifest IDs, Touches, Work, and a binary Exit gate.
- [x] Every active R and RI is covered.
- [x] User approved ("Proceed", 2026-07-11). `status` set to `ready-for-next-phase`, `user_checkpoint: approved`.
