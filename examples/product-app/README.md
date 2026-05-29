# Product App Example

This example shows a complete sanitized lifecycle chain for a small product UI request.

The product is fictional. It uses generic terms and does not depend on a provider, deployment platform, package manager, or external tracker.

## Artifact Chain

```text
.workflow/artifacts/briefs/settings-empty-state-v1.md
.workflow/artifacts/plans/settings-empty-state-v1.md
.workflow/artifacts/tasks/settings-empty-state-v1.md
.workflow/artifacts/reviews/settings-empty-state-v1.md
.workflow/artifacts/verify/settings-empty-state-v1.md
.workflow/artifacts/ship/settings-empty-state-v1.md
.workflow/artifacts/reflect/settings-empty-state-v1.md
```

## What It Demonstrates

- Full `brief -> plan -> task -> review -> verify -> ship -> reflect` flow.
- Requirement coverage across `R` and `RI` IDs.
- Manual QA evidence without claiming an external release.
- Ship status with release/source gates marked not applicable.
- Reflect learning candidates tagged `propose-only`.
