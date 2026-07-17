---
slug: unstructured-waiver-claim
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-01-01T00:00:00Z
updated: 2026-01-01T00:00:00Z
manifest_ids:
  - R1
  - R2
upstream:
  - workflow/artifacts/briefs/unstructured-waiver-claim-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
---

# Unstructured Waiver Claim — Plan

Benign upstream plan for this fixture. The deliberate `check-waivers` violation (a waiver claimed in
prose, never structured) lives in the sibling `tasks/` artifact — briefs and plans are framing
artifacts and are exempt from the unstructured-claim scan (they cannot hold a structured `## Waivers`
table by contract; a real active waiver is recorded in the gate-executing task/verify/ship artifact).

## Summary

Sets up R1 and R2 for the Build phase.

## Requirement Coverage

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R1 | Phase 1 | — |
| R2 | Phase 1 | — |

## Repo Impact Map

- `src/example.ts`

## Source-of-Truth Strategy

No external source update required.

## Architecture Notes

No architectural changes.

## Exit Gate

Plan is benign; the violation is in the task artifact.
