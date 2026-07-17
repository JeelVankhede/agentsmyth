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
---

# <Title> - Review

## Findings

none

## Severity Summary

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |

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
