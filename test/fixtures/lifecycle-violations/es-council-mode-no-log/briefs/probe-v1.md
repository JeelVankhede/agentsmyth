---
slug: probe
version: 1
artifact: brief
status: blocked-for-user
created: 2026-08-17
updated: 2026-08-17
manifest_ids: [R1]
upstream:
  - user-request
orchestration:
  phase: think
  status: blocked-for-user
  next_phase: plan
  blockers: []
  user_checkpoint: brief-review
council:
  mode: council
  authorization: carve-out
  cap_resolved: 3
  cap_source: configured
  depth: standard
  dispatch_depth: 1
  rounds_run: 2
  termination_reason: user-decision-required
  resolution:
    dispatch_enabled: optional
    council_enabled: on-for-complex
    task_class: complex
  repo_integrity:
    before: sha256:aaaaaaaaaaaa
    after: sha256:aaaaaaaaaaaa
    algorithm: sha256/sorted-relpath+size+content
  evidence_classes:
    repo: used
    trial: unused
    web: used
    recall: used
---
# Probe - Brief

## Source Links

## Problem

## Goals

## Non-Goals

## User Impact

## Success Metrics

## Requirements

## Constraints

## Risks

## Open Questions

## Requirement Manifest

### Explicit (R)

- **R1** placeholder. Acceptance: placeholder.

### Implicit (RI)

### Assumptions (A)

### Open Questions (Q)

## Questions For User

- **Q5** — recommend deferring; rests on F1 (repo) and F2 (web)

## Architecture Notes

- role: Architect

## Exit Gate

- [ ] placeholder
