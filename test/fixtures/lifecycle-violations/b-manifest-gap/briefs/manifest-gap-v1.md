---
slug: manifest-gap
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-01-01T00:00:00Z
updated: 2026-01-01T00:00:00Z
manifest_ids:
  - R1
upstream:
  - user-request
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: brief-review
---

# Manifest Gap — Brief

## Source Links

- User request: fixture for R4 violation test.

## Problem

Testing cross-artifact manifest ID validation.

## Goals

- Verify that a task cannot reference IDs not declared here.

## Non-Goals

- This is a test fixture only.

## Requirement Manifest

### Explicit (R)

- **R1** - The only declared requirement.
  - Acceptance: R1 is the only valid ID for this slug.

## Architecture Notes

Test fixture — no architectural impact.

## Exit Gate

Brief is complete. Only R1 is declared. Task referencing R99 must fail.
