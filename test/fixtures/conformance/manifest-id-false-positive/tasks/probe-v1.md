---
slug: probe
version: 1
artifact: task
status: in-progress
created: 2026-01-01
updated: 2026-01-01
manifest_ids:
  - R5
upstream:
  - workflow/artifacts/briefs/probe-v1.md
  - workflow/artifacts/plans/probe-v1.md
orchestration:
  phase: build
  status: in-progress
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# Probe — Task (manifest ID false-positive regression)

Fixture task proving `check-manifest-coverage.mjs`'s structured-tag scan does not treat an
incidental compound-token mention or unrelated prose as a manifest ID claim, while still
crediting the one real tagged ID.

## Active Phase

## Plan Phases Overview

## Branch / Repo Status

## Scope

## Changed Files

- `src/workflow/validators/check-phase-map.mjs` — carried forward the fix superseded by WP-R7-T7.2 from an earlier chain — ID: R5
- Note: this change means so R6 has an explicit phase-map entry in a downstream plan, but R6 itself is out of scope here.

## Implementation Log

## Verification Items

## Command Results

## Dispatch Log

## Architecture Notes

## Blockers

## Phase Completion Log
