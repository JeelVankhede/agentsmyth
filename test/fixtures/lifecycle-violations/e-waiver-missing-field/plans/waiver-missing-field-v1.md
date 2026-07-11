---
slug: waiver-missing-field
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-01-01T00:00:00Z
updated: 2026-01-01T00:00:00Z
manifest_ids:
  - R1
upstream:
  - workflow/artifacts/briefs/waiver-missing-field-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
---

# Waiver Missing Field — Plan

## Summary

A plan whose Waivers table has a row missing the `residual_risk` field.

## Requirement Coverage

- R1: covered.

## Repo Impact Map

- src/example.ts

## Source-of-Truth Strategy

No external source update required.

## Waivers

| Waived Gate/Requirement | Reason | Residual Risk | Owner | Follow-up Action | Approval Evidence |
|---|---|---|---|---|---|
| R1 | Time constraint this sprint | | user | Revisit next sprint | User approved in chat 2026-01-01 |

## Architecture Notes

No architectural changes.

## Exit Gate

The Waivers row above has an empty Residual Risk cell — this is the deliberate violation.
