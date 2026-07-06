# Output Schema

Test writes:

```text
workflow/artifacts/verify/<slug>-v<N>.md
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

## Starter Block

Copy this block to create a new verify artifact. Replace every `<placeholder>`.

```markdown
---
slug: <slug>
version: 1
artifact: verify
status: draft
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
manifest_ids: []
upstream:
  brief: workflow/artifacts/briefs/<slug>-v<N>.md
  plan: workflow/artifacts/plans/<slug>-v<N>.md
  task: workflow/artifacts/tasks/<slug>-v<N>.md
  review: workflow/artifacts/reviews/<slug>-v<N>.md
orchestration:
  phase: test
  status: blocked-for-user
  next_phase: ship
  blockers: []
  user_checkpoint: none
---

# <Title> - Verification

## Inputs

## Automated Checks

| Command | Outcome | Evidence |
|---|---|---|

## Manifest Coverage

| Manifest ID | How Verified | Evidence | Result | Notes |
|---|---|---|---|---|
| R1 | command / manual / generated-output / waiver | | pass / fail / skip / waived | |

## Manual QA

not applicable

## Generated Output Evidence

not applicable

## Findings

none

## Skipped Checks

| Check | Why Skipped | Risk | Owner | Blocks Ship |
|---|---|---|---|---|

## Architecture Notes

- role: Senior QA
- decision:
- constraint:
- downstream:

## Sign-Off

- Verifier:
- Date:
- Recommendation: <ship / hold / hold-with-waiver>
```
