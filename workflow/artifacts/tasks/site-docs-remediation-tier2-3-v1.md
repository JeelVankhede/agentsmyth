---
slug: site-docs-remediation-tier2-3
version: 1
artifact: task
status: in-progress
created: 2026-07-26
updated: 2026-07-26
manifest_ids: [R10]
upstream:
  - workflow/artifacts/briefs/site-docs-remediation-tier2-3-v1.md
  - workflow/artifacts/plans/site-docs-remediation-tier2-3-v1.md
orchestration:
  phase: build
  status: in-progress
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# Site docs remediation (Tiers 2 + 3) - Task

## Active Phase

- Phase: Phase 1 - bin/agentsmyth.mjs version-skew warning fix
- Manifest IDs: R10
- Exit gate: `grep -n "re-stamp repo-profile.yaml" bin/agentsmyth.mjs` returns zero hits; `npm run build` still passes.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - bin/agentsmyth.mjs warning fix | active | R10 |
| Phase 2 - Three new "Use it" pages | pending | R1, R2, R3, RI1, RI2 |
| Phase 3 - Footer LICENSE/CHANGELOG links | pending | R4, RI1 |
| Phase 4 - site/artifacts.md upstream-shape fix | pending | R6, RI1 |
| Phase 5 - /in-action disclaimer and example fix | pending | R7, RI1 |
| Phase 6 - Per-page meta descriptions and OG image | pending | R8, RI1 |
| Phase 7 - README restructure | pending | R5, RI1 |
| Phase 8 - Mermaid diagrams | pending | R9, RI1, RI2 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `fix/site-docs-remediation` | Clean — `git status --short --branch` shows no uncommitted changes; last commit `b5da6ff` (the approved plan). | No unrelated dirty state present at Phase 1 start. |

## Scope

- In scope: `bin/agentsmyth.mjs` line ~129 (the version-skew warning message string only).
- Out of scope: any other line in `bin/agentsmyth.mjs`; no behavior change, message text only.

## Changed Files

- `bin/agentsmyth.mjs` — corrected the version-skew warning's false "re-stamp repo-profile.yaml" claim — IDs: R10

## Implementation Log

- Replaced the false "re-stamp repo-profile.yaml" claim (`bin/agentsmyth.mjs:129`) with accurate text: `prepare` refreshes the global tree only, and the warning is informational/non-blocking. No behavior change — message text only, matching the brief's R10 requirement exactly.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R10 | `grep -n "re-stamp repo-profile.yaml" bin/agentsmyth.mjs` | zero hits |
| R10 | `npm run build` | passes, bundle unaffected (this file isn't part of the workflow bundle) |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `grep -n "re-stamp repo-profile.yaml" bin/agentsmyth.mjs` | R10 | pass (zero hits, exit 1) | |
| `npm run build` | R10 | pass | `build-bundle: ok` |
| `grep -rln "re-stamp repo-profile\|version skew detected" test/` | R10 | pass (no hits) | confirmed no test suite depends on the old exact warning text |

## Dispatch Log

none

## Architecture Notes

- role: Senior Engineer
- decision: Kept the fix to message text only, no behavior change — matches the brief's R10 scope exactly (a docs-adjacent CLI messaging bug, not a functional change).
- constraint: none new.
- tradeoff: none new.
- downstream: Review should confirm the new warning text doesn't overclaim either — it describes prepare's actual effect (global tree only) without implying any further automatic fix exists.

## Blockers

none

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Phase 1 - bin/agentsmyth.mjs warning fix | complete | 2026-07-26 | R10 verified via grep + build |
