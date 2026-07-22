---
slug: fix-check-config-defs-root
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-07-22
updated: 2026-07-22
manifest_ids: [R1]
upstream:
  - workflow/artifacts/briefs/fix-check-config-defs-root-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
---

# Fix check-config.mjs's hardcoded workflow/ root - Plan

## Summary

Single-phase fix: replace `check-config.mjs`'s hardcoded `workflowRoot = 'workflow'` (used for
both config and schema lookups) with `dataPath('config')`/`defsPath('schemas')`, matching the
two-root resolver every other definitions-aware validator in this codebase already uses.

## Inputs

- `workflow/artifacts/briefs/fix-check-config-defs-root-v1.md` (approved)
- `src/workflow/validators/check-config.mjs` (the bug)
- `src/workflow/validators/lib.mjs` (`defsPath`, `dataPath` — already correct, already exported)
- `src/workflow/validators/check-setup-complete.mjs` (sibling precedent for the same split)

## Requirement Coverage

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R1 | Phase 1 | The entire fix |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `src/workflow/validators/check-config.mjs` | modify | R1 | Replace hardcoded root with `defsPath`/`dataPath`; remove dead `repoRoot = process.cwd()` |

`validators/check-config.mjs` (root) and `~/.agentsmyth/workflow/validators/check-config.mjs`
(global) are both build products of this same source file — refreshed via `npm run build` +
`agentsmyth prepare`, not edited directly.

## Source-of-Truth Strategy

Single source of truth: `src/workflow/validators/check-config.mjs`. Build/prepare propagate it.

## Approach

Import `defsPath`/`dataPath` from `lib.mjs` (already exported, already used correctly by other
validators — no new mechanism). Replace the schema-listing loop's root with `defsPath('schemas')`
and the config-listing loop's root with `dataPath('config')`. Replace the per-config schema-path
lookup (`${workflowRoot}/schemas/${config.kind}.schema.yaml`) with
`defsPath('schemas', `${config.kind}.schema.yaml`)`. Remove the unused `repoRoot`/`workflowRoot`
constants entirely.

## Phases

### Phase 1 - Fix the resolver

- **Manifest IDs:** R1
- Touches: `src/workflow/validators/check-config.mjs`
- Work: Swap hardcoded root for `defsPath`/`dataPath`; remove dead code.
- **Exit gate:** Reproduction scenario (fresh `agentsmyth init` in a scratch repo, run
  `~/.agentsmyth/workflow/validators/check-config.mjs` against it) passes with zero errors;
  `npm run validate`, `npm run violations:test`, `npm run commit-coverage:test`,
  `npm run setup-checks:test` all still pass.

## Dependency Order

Single phase, no dependencies.

## Branch Strategy

Same branch as the in-flight PR #45 work (`mandatory-lifecycle-pre-commit-hook`) — this fix was
found while testing that same PR's install flow; no new branch needed.

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|
| Fix could regress this repo's own dogfood validate flow (`AGENTSMYTH_HOME=src/workflow` override) | Low | Medium | Explicitly re-tested both the plain (`AGENTSMYTH_HOME` unset) and dogfood (`AGENTSMYTH_HOME=src/workflow`) cases before commit | agent | R1 |

## Verification Plan

| Manifest ID | Verification method | Command / Scenario |
|---|---|---|
| R1 | Manual QA + Command | Fresh scratch `agentsmyth init`, run global `check-config.mjs` against it (before/after fix); `npm run validate`, `violations:test`, `commit-coverage:test`, `setup-checks:test` |

## Architecture Notes

- role: Architect
- decision: Reuse existing `defsPath`/`dataPath`, no new resolver logic.
- constraint: None beyond existing golden rules.
- tradeoff: None.
- downstream: None.

## Open Questions

None.

## Checkpoint Approval

- Checkpoint: plan-review
- Status: approved
- User's own words (verbatim, this turn): "yes"

## Exit Gate

- [x] Every active R and RI appears in Requirement Coverage, Phases, and Verification Plan.
- [x] User approved or waiver recorded.
