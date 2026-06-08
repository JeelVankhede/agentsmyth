# Output Schema

Review writes:

```text
.workflow/artifacts/reviews/<slug>-v<N>.md
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
