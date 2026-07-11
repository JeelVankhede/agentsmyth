---
slug: power-skills-wave4
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-07-11T17:30:00Z
updated: 2026-07-11T17:40:00Z
manifest_ids:
  - R1
  - R2
  - RI1
  - RI2
  - RI3
upstream:
  - workflow/artifacts/briefs/power-skills-wave4-v1.md
  - workflow/artifacts/plans/power-skills-wave4-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# Power Skills — Wave 4 (Conditional Preservation Check) - Task

## Active Phase

- Phase: Phase 1 - B4 skill + Build wiring (complete — only phase)
- Manifest IDs: R1, R2, RI1, RI2, RI3
- Exit gate: skill directory exists with full anatomy, wired into `lifecycle-build/SKILL.md`; full suite exits 0.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - B4 skill + Build wiring | complete | R1, R2, RI1, RI2, RI3 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `feat/wp-r4-power-skills-wave4` | clean except this chain's own brief/plan (untracked, in scope) | branched fresh off `origin/main`, which now includes all of Waves 1-3 |

## Scope

- In scope: B4 `conditional-preservation-check`, wired into `lifecycle-build/SKILL.md`.
- Out of scope: nothing — this closes the resolved WP-R4 22-skill catalog entirely.

## Changed Files

- `src/workflow/skills/conditional-preservation-check/SKILL.md` + `references/{output-schema,detection-method}.md` — new skill (B4) — IDs: R1, RI2
- `src/workflow/skills/lifecycle-build/SKILL.md` — wired into `## Workflow` (new step 6a) and `## What To Load` — IDs: R2
- `src/workflow/skills/README.md` — added 1 new Power Skills row — IDs: R1

## Waivers

none — Phase 1 stayed exactly within its declared Touches.

## Implementation Log

**Phase 1 (complete):**
- Authored `conditional-preservation-check` with full anatomy, following the same pattern
  established across 21 prior skills (this session's Wave 1-3 work). Exit Gate states the concrete
  detectable failure named in the spec's B4 card (dropped branch on fold/merge/rename).
- Wired into `lifecycle-build/SKILL.md`: a new Workflow step 6a (invoked when a diff's shape
  indicates a fold/merge/rename touching control flow) and a `What To Load` entry.
- No validator/fixture — matches the spec's own "No (semantic)" rating for B4, same precedent as
  C2/D3/D4/D7 (confirmed by inspection in Plan's Assumptions Verified table: `ls
  src/workflow/validators/` has no matching files for any of those 4 skills either).
- `npm run build && npm run validate && npm run violations:test && npm run setup-checks:test` all
  exit 0 on first run — no structural issues, smallest and cleanest WP-R4 chain so far.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R1 | `ls src/workflow/skills/conditional-preservation-check/SKILL.md` | exists |
| R2 | `grep -l conditional-preservation-check src/workflow/skills/lifecycle-build/SKILL.md` | hit |
| RI3 | `grep -c "skills/conditional-preservation-check/" dist/workflow-bundle.md` | 4 refs |
| RI1 | `git diff package.json` | no dependency change — inspection-only, no code touched |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `npm run build && npm run validate && npm run violations:test && npm run setup-checks:test` | Phase 1 gate | pass | all 4 exit 0, first run, no regressions |
| `git diff --stat origin/main...HEAD -- src/adapters/` | closure | pass | empty, RI4-equivalent confirmed |

## Dispatch Log

none — single-agent sequential execution.

## Architecture Notes

- role: Senior Engineer
- decision: No sub-phasing — the scope (1 skill, 1 wiring point) doesn't benefit from it.
- downstream: Review should confirm this is genuinely the last remaining item from the resolved
  WP-R4 22-skill catalog (4 pre-existing + 7 Wave 1 + 4 Wave 2 + 10 Wave 3 + 1 this chain = 22
  skills, plus E1/E2 as documented extensions).

## Blockers

none

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Phase 1 - B4 skill + Build wiring | complete | 2026-07-11T17:40:00Z | clean on first run, no structural issues |
