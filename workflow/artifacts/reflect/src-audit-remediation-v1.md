---
slug: src-audit-remediation
version: 1
artifact: reflect
status: done
created: 2026-07-16T09:30:00Z
updated: 2026-07-16T09:30:00Z
manifest_ids:
  - R1
  - R2
  - R3
  - R4
  - R5
  - R6
  - R7
  - R8
  - R9
  - R10
  - R11
  - R12
  - R13
  - RI1
  - RI2
  - RI3
  - RI4
upstream:
  - workflow/artifacts/briefs/src-audit-remediation-v1.md
  - workflow/artifacts/plans/src-audit-remediation-v1.md
  - workflow/artifacts/tasks/src-audit-remediation-v1.md
  - workflow/artifacts/reviews/src-audit-remediation-v1.md
  - workflow/artifacts/verify/src-audit-remediation-v1.md
  - workflow/artifacts/ship/src-audit-remediation-v1.md
orchestration:
  phase: reflect
  status: done
  next_phase: done
  blockers: []
  user_checkpoint: none
---

# Src Audit Remediation - Reflect

## Inputs

Full chain brief→ship for the `src/` contract/validator drift remediation. Shipped as commit `1af7d25`
on `fix/src-audit-remediation`, PR https://github.com/JeelVankhede/agentsmyth/pull/34.

## Outcome

- Release: not applicable (`release.required: false`); shipped as a PR to `main`, not a package publish.
- Source-of-truth: not applicable (`providers: []`).
- Rollback: revert the merge / `git revert` the range; self-contained, no data migration.
- 17 requirements shipped; full suite green (validate + violations 20/20 + conformance 9/9 + setup-refs
  5/5 + setup-checks 4/4 + root-resolution 16/16). All 5 review findings resolved before Test.

## What Worked

- **Fixture-first / guard-first.** Every new or strengthened validator was run against its target
  BEFORE the fix to prove it caught the defect (R8 found 24 drifts pre-fix; R12 rejects a seeded broken
  block; R10 still catches a real claim). This made "did the fix work" a command, not a claim.
- **Dogfooding surfaced real bugs the audit missed.** Running the repo's own lifecycle on the change
  exposed R9/R10/R11/R13 — none visible from reading.
- **Folding finds into the current chain (no v2).** Per user direction, R9–R13 were folded into the
  live brief/plan rather than spawning a second version; kept one coherent artifact trail.

## What Did Not Work

- **The initial audit was a reading audit.** It read contracts and ran the suite on already-healthy
  artifacts, so it was blind to the "validator ≠ documented contract" class. Findings drip-fed one per
  lifecycle phase, which (rightly) frustrated the user.
- **Repeated mid-task stops.** Several pauses to surface each new find read as indecision; the better
  move was the exhaustive sweep, done later, that enumerated the whole class at once.
- **Over-ceremony on a mechanical action.** After an authorized commit failed on a `-F` misuse, I
  reached for a message-file workaround instead of just `git commit -m` — see follow-up + memory.

## Surprises

- The `upstream` shape defect was in **all 7** starter blocks, not the 6 first assumed (Think's
  `upstream: []` also violates `minItems:1`).
- `check-waivers` false-fires on any artifact whose *subject* is the waiver mechanism — including the
  shipped verify starter block itself — because framing artifacts (brief/plan) have no `## Waivers`
  section by contract, so the suppression path is unreachable.
- Writing the review artifact itself tripped the very check it was reviewing (`waived-Test` next to
  `r10`), a live demonstration that the R10 refinement works.

## Manifest Coverage Retrospective

| Manifest ID | Outcome | Evidence path | Notes |
|---|---|---|---|
| R1 | shipped | workflow/artifacts/verify/src-audit-remediation-v1.md | config-map schema-accurate |
| R2 | shipped | workflow/artifacts/verify/src-audit-remediation-v1.md | token-map + semantic pin |
| R3 | shipped | workflow/artifacts/verify/src-audit-remediation-v1.md | SKILL/schema examples |
| R4 | shipped | workflow/artifacts/verify/src-audit-remediation-v1.md | waived-Test contract |
| R5 | shipped | workflow/artifacts/verify/src-audit-remediation-v1.md | adapter parity |
| R6 | shipped | workflow/artifacts/verify/src-audit-remediation-v1.md | presence enforcement + backfill |
| R7 | shipped | workflow/artifacts/verify/src-audit-remediation-v1.md | Test upstream row |
| R8 | shipped | workflow/artifacts/verify/src-audit-remediation-v1.md | setup-refs guard |
| R9 | shipped | workflow/artifacts/verify/src-audit-remediation-v1.md | 7 starter-block upstreams |
| R10 | shipped | workflow/artifacts/verify/src-audit-remediation-v1.md | check-waivers refinement |
| R11 | shipped | workflow/artifacts/verify/src-audit-remediation-v1.md | -p suffix + aggregation |
| R12 | shipped | workflow/artifacts/verify/src-audit-remediation-v1.md | conformance guard |
| R13 | shipped | workflow/artifacts/verify/src-audit-remediation-v1.md | phase-map body format |
| RI1 | shipped | workflow/artifacts/verify/src-audit-remediation-v1.md | rebuild, no drift |
| RI2 | shipped | workflow/artifacts/verify/src-audit-remediation-v1.md | full suite green |
| RI3 | shipped | workflow/artifacts/verify/src-audit-remediation-v1.md | labels; date-time deferred |
| RI4 | shipped | workflow/artifacts/verify/src-audit-remediation-v1.md | zero deps |

## Deferred

- `format: date-time` enforcement in `lib.mjs` (RI3) — explicit Non-Goal; enforcing would mass-break
  bare-date artifacts. Tracked in Follow-Ups.

## Source-of-Truth Outcome

not applicable

## Learning Candidates

- **Candidate learning**: Audit a contract system by *instantiating* each contract and running its
  validators, not by reading — the "validator disagrees with a documented contract" class is invisible
  to reading and to running the suite on already-healthy artifacts — source: workflow/artifacts/briefs/src-audit-remediation-v1.md — propose-only.
- **Candidate learning**: Ship a conformance guard alongside such a fix so "did I find everything?"
  becomes a command output (here: `check-starter-blocks` instantiating every starter block) — source: workflow/artifacts/tasks/src-audit-remediation-v1.md — propose-only.
- **Candidate learning**: A heuristic validator that scans prose for a concept will false-fire on any
  artifact whose *subject* is that concept; exempt framing/retrospective artifacts and key on action
  patterns, not bare keywords — source: workflow/artifacts/reviews/src-audit-remediation-v1.md — propose-only.
- **Candidate learning**: When findings emerge mid-lifecycle, an exhaustive sweep that enumerates the
  whole class beats drip-feeding one find per phase — source: workflow/artifacts/briefs/src-audit-remediation-v1.md — propose-only.

## Follow-Ups

| Action | Owner | Suggested Artifact Or Ticket | Status |
|---|---|---|---|
| Enforce `format: date-time` in lib.mjs and migrate bare-date artifacts | user | brief: enforce-artifact-date-format | open |
| Extend the conformance guard to content-filled body-format validation (beyond R13) | user | brief: conformance-guard-body-format | open |
| Curate the 4 learning candidates into curated learnings if general | user | curation pass | open |

## Raw Session Entry

See `workflow/learnings/sessions/2026-07-16-src-audit-remediation.md`.

## Architecture Notes

- role: Project Manager
- decision: Close the chain as `done`; the one deferred item (date-time) is an explicit Non-Goal with a
  follow-up, not an incomplete requirement.
- constraint: learning candidates are propose-only; no curated learning edited without an explicit
  curation request.
- downstream: PR #34 review; the two follow-up briefs if the user wants the residuals closed.

## Exit Gate

- [x] Manifest Coverage Retrospective has one row per active R and RI.
- [x] Every follow-up has a named owner and suggested artifact title.
- [x] Learning candidates tagged propose-only.
- [x] orchestration.status: done, next_phase: done.
