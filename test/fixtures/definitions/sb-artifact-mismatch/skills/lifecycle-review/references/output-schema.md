# Output Schema

Review writes:

```text
workflow/artifacts/reviews/<slug>-v<N>.md
```

Required frontmatter keys:

```yaml
slug:
version:
artifact: review
status:
created:
updated:
manifest_ids:
upstream:
orchestration:
  phase: review
  status:
  next_phase:
  blockers:
  user_checkpoint:
```

Required body sections:

1. Findings
2. Severity Summary
2a. Council Log — council mode only; omit entirely in single-agent mode
3. Requirement Coverage
4. Architecture Notes
5. Verification Reviewed
6. Residual Risk
7. Recommendation

Schema acceptance criteria:

- Findings appear first and say `none` when no findings exist.
- Findings are ordered by severity, then path or area.
- Every finding includes severity, path or area, affected manifest ID when applicable, problem, and fix recommendation.
- Requirement Coverage has one row per active `R` and `RI`.
- Coverage status is exactly `covered`, `partial`, or `missing`.
- `Open` is the count `check-release-readiness.mjs` reads. `Found` preserves what the review actually caught, so remediating a finding does not make the review look like it found nothing.
- Missing or partial coverage appears as a finding or residual risk.
- Verification Reviewed names exact command/evidence inspected and outcome.
- Recommendation is exactly `pass`, `pass-with-risk`, or `hold`.

## Starter Block

Copy this block to create a new review artifact. Replace every `<placeholder>`.

```markdown
---
slug: <slug>
version: 1
artifact: review
status: draft
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
manifest_ids: []
upstream:
  - workflow/artifacts/briefs/<slug>-v<N>.md
  - workflow/artifacts/plans/<slug>-v<N>.md
  - workflow/artifacts/tasks/<slug>-v<N>.md
orchestration:
  phase: review
  status: blocked-for-user
  next_phase: test
  blockers: []
  user_checkpoint: none
# council: is REQUIRED in council mode and omitted entirely in single-agent mode. In single-agent
# mode record `council: {mode: single-agent}` instead, so the two modes are distinguishable from
# frontmatter alone without a Council Log. The values below are a working example, not placeholders:
# the starter block is itself schema-validated, so replace them with the run's real values.
council:
  mode: council
  authorization: carve-out
  cap_resolved: 2
  cap_source: configured
  depth: standard
  dispatch_depth: 1
  rounds_run: 1
  termination_reason: resolved
  resolution:
    dispatch_enabled: optional
    council_enabled: on-for-complex
    task_class: complex
  repo_integrity:
    before: sha256:0000000000000000000000000000000000000000000000000000000000000000
    after: sha256:0000000000000000000000000000000000000000000000000000000000000000
    algorithm: sha256/sorted-relpath+size+content
  evidence_classes:
    repo: used
    trial: unused
    web: unused
    recall: unused
---

# <Title> - Review

## Findings

none

## Severity Summary

| Severity | Open | Found | IDs | Status |
|---|---|---|---|---|
| P0 | 0 | 0 | — | — |
| P1 | 0 | 0 | — | — |
| P2 | 0 | 0 | — | — |
| P3 | 0 | 0 | — | — |

## Council Log

<!-- Required only when frontmatter has council.mode: council. Omit entirely otherwise.
     Subsections mirror the Think record so one validator serves both. -->

### Requirement Classification

<!-- Every active R/RI, with the evidence class(es) that would settle it. Required of every council
     record, review and brief alike — the validator does not gate this on artifact type. -->

| Manifest ID | Question bucket | Evidence classes |
|---|---|---|

### Risk Category Assignment

<!-- The ten categories in references/review-risk-categories.md, partitioned DISJOINTLY across
     reviewers WITHIN A ROUND. A category may move to another reviewer in a later round — that is
     what a taper does — so the round is part of the assignment. A category assigned to nobody is a
     coverage gap and belongs in Skipped Checks. -->

| Member | Round | Risk categories | Rationale |
|---|---|---|---|

### Members

| Member | Role | Round | Capabilities | Input | Status | Sandbox |
|---|---|---|---|---|---|---|

### Rounds

| Round | Reviewers | Challengers | Open in | Open out | Items closed | Sizing rationale |
|---|---|---|---|---|---|---|

### Findings

<!-- A council-log finding states what is wrong and where. It carries NO fix recommendation —
     proposing a fix switches the candidate to Build scope. The parent's `## Findings` entries
     above do carry one; the parent is not a reviewer. -->

| Finding | Member | Role | Round | Risk category | Surface | Evidence class | Citation | Disposition | Reason / merged into |
|---|---|---|---|---|---|---|---|---|---|

### Reconcile Contract

<!-- Required whenever two or more non-challenger members produce findings on the same `surface`.
     State both how duplicates collapse and how disagreements surface; "we will reconcile" is not a
     contract. -->

### Conflicts

| Surface | Findings | Resolution |
|---|---|---|

### Skipped Checks

<!-- Required whenever a member is recorded `failed`, or a risk category went unassigned. Six
     fields, per workflow/config/verification.yaml's skipped_checks.required_fields. A council that
     lost a member and records nothing reports the same coverage as one that did not. -->

| Check | Why skipped | Risk | Owner | Blocks ship | Manifest IDs |
|---|---|---|---|---|---|

### Finding Quality

<!-- One row per council finding, written at Review with outcome `pending`, into
     workflow/artifacts/finding-quality.yaml. Closed at Test, Ship or Reflect and moved to
     finding-quality-archive.yaml in the same operation. See lifecycle-review's Workflow stage 5.
     This table is the human-readable view; the ledger files are what validators read. -->

| Finding | Ledger row | Outcome | Settled in phase |
|---|---|---|---|

### Termination

- Reason: <resolved | user-decision-required>
- Surviving items and their round history:

## Requirement Coverage

| Manifest ID | Evidence | Status | Notes |
|---|---|---|---|
| R1 | | covered / partial / missing | |

## Architecture Notes

- role: Staff Reviewer
- decision:
- constraint:
- downstream:

## Verification Reviewed

| Item | Outcome | Notes |
|---|---|---|

## Residual Risk

none

## Recommendation

<pass / pass-with-risk / hold>
```
