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
  rounds_run: 0
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
    repo: unused
    trial: unused
    web: unused
    recall: unused
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

- **Q5** — recommend deferring; rests on no finding, since the bucket never ran

## Council Log

### Requirement Classification

| Manifest ID | Question bucket | Evidence classes |
|---|---|---|
| R1 | how the thing behaves today | repo, web |

### Members

| Member | Role | Round | Capabilities | Sandbox |
|---|---|---|---|---|
| m1 | researcher | 1 | read, fetch, search | ~/.agentsmyth/sandbox/agentsmyth/probe/1/m1 |
| m2 | researcher | 1 | read, fetch, search | ~/.agentsmyth/sandbox/agentsmyth/probe/1/m2 |
| m3 | researcher | 1 | read, fetch, search | |
| c1 | challenger | 1 | read, fetch, search | |
| m1 | researcher | 2 | read, fetch, search | ~/.agentsmyth/sandbox/agentsmyth/probe/2/m1 |
| m2 | researcher | 2 | read, fetch, search | ~/.agentsmyth/sandbox/agentsmyth/probe/2/m2 |
| c1 | challenger | 2 | read, fetch, search | |

### Rounds

| Round | Researchers | Challengers | Open in | Open out | Items closed | Sizing rationale |
|---|---|---|---|---|---|---|

### Findings

| Finding | Member | Role | Round | Surface | Evidence class | Citation | Disposition | Reason / merged into |
|---|---|---|---|---|---|---|---|---|

### Reconcile Contract

Duplicates on a shared surface collapse into the earliest finding ID, keeping the citation that
resolves. Disagreements are never collapsed: each is recorded in Conflicts with its resolution and
the basis for it.

### Conflicts

| Surface | Findings | Resolution |
|---|---|---|

### Termination

- Reason: user-decision-required
- Surviving items and their round history: Q5 open in rounds 1 and 2, closed in neither

## Architecture Notes

- role: Architect

## Exit Gate

- [ ] placeholder
