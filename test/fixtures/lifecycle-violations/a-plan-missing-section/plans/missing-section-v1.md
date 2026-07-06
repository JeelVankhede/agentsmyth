---
slug: missing-section
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-01-01T00:00:00Z
updated: 2026-01-01T00:00:00Z
manifest_ids:
  - R1
upstream:
  - workflow/artifacts/briefs/missing-section-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
---

# Missing Section — Plan

## Summary

A plan that omits the Verification Plan section.

## Requirement Coverage

- R1: covered.

## Repo Impact Map

- src/example.ts

## Source-of-Truth Strategy

No external source update required.

## Architecture Notes

No architectural changes.

## Exit Gate

All sections present except Verification Plan — this is the deliberate violation.
