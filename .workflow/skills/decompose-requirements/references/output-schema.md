# Output Schema

Return this structure after creating, updating, or proposing a manifest:

```markdown
## Manifest Update

- Brief: `.workflow/artifacts/briefs/<slug>-v<N>.md` or proposed new brief
- Mode: created / backfilled / merged / answered-questions / no-op / blocked
- Added IDs:
- Updated IDs:
- Stable IDs:
- Orchestration blockers:
- Assumptions needing confirmation:

## Requirement Manifest Patch

<manifest markdown or summary of no-op>

## Questions For User Patch

<questions markdown or `None.`>

## Frontmatter Patch

<orchestration blocker patch when needed>

## Summary

Decompose: <R count> R, <RI count> RI, <A count> A, <Q count> Q. Added: <ids>. Updated: <ids>. Blockers: <Q ids or none>.
```

Acceptance criteria:

- Every explicit user requirement appears as an `R`.
- Every relevant implicit requirement appears as an `RI` or is explicitly not applicable.
- Every `R` and `RI` has at least one acceptance criterion.
- Existing IDs are preserved.
- Every unresolved `Q` appears in questions and blockers.
- No separate manifest file is created.
- No external state is invented.
