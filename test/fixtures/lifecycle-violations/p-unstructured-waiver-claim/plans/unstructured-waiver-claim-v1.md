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

## Summary

A plan that claims a waiver in prose instead of a structured `## Waivers` table row.

## Requirement Coverage

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R1 | Phase 1 | — |
| R2 | Phase 1 | The user waived R2's verification gate in chat — no table entry recorded here, which is the deliberate violation. |

## Repo Impact Map

- `src/example.ts`

## Source-of-Truth Strategy

No external source update required.

## Architecture Notes

No architectural changes.

## Exit Gate

R2's waiver claim above is prose-only — this is the deliberate violation for `check-waivers.mjs`'s
unstructured-claim scan.
