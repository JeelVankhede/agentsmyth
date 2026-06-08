# Output Schema

Test writes:

```text
.workflow/artifacts/verify/<slug>-v<N>.md
```

Required frontmatter keys:

```yaml
slug:
version:
artifact: verify
status:
created:
updated:
manifest_ids:
upstream:
orchestration:
  phase: test
  status:
  next_phase:
  blockers:
  user_checkpoint:
```

Required body sections:

1. Inputs
2. Automated Checks
3. Manifest Coverage
4. Manual QA
5. Generated Output Evidence
6. Findings
7. Skipped Checks
8. Architecture Notes
9. Sign-Off

Schema acceptance criteria:

- `manifest_ids` includes every active `R` and `RI` verified, failed, skipped, or waived.
- Automated Checks lists every command run or intentionally not run.
- Manifest Coverage has one row per active `R` and `RI`.
- Manual QA states `not applicable` when unused.
- Generated Output Evidence states `not applicable` when unused.
- Skipped Checks names reason, risk, owner, and Ship impact.
- Findings says `none` when no findings exist.
- Sign-Off includes verifier, date, and recommendation.
- Recommendation is exactly `ship`, `hold`, or `hold-with-waiver`.
