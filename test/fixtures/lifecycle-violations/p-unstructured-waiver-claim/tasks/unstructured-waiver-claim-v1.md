---
slug: unstructured-waiver-claim
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-01-01T00:00:00Z
updated: 2026-01-01T00:00:00Z
manifest_ids:
  - R1
  - R2
upstream:
  - workflow/artifacts/briefs/unstructured-waiver-claim-v1.md
  - workflow/artifacts/plans/unstructured-waiver-claim-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# Unstructured Waiver Claim — Task

## Active Phase

Phase 1.

## Implementation Log

The user waived R2's verification gate in chat — this is stated only here in prose and was never
moved into a structured `## Waivers` table row. That is the deliberate violation `check-waivers.mjs`
must still catch on a gate-executing artifact (task/verify/ship/review), even after briefs and plans
are exempted from the unstructured-claim scan.

## Blockers

none
