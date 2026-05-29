# Node Package Example

This example shows how a repository that actually has Node package scripts can configure verification evidence.

## Files

| Path | Purpose |
|---|---|
| `package.json` | Example package scripts. |
| `.workflow/config/verification.yaml` | Example-specific verification config. |
| `.workflow/artifacts/verify/package-health-v1.md` | Sanitized verification artifact. |

## What It Demonstrates

- Commands are configured because this example repository has them.
- Command output is represented as artifact evidence.
- Manual QA and generated output are marked not applicable when unused.

Do not copy these commands into another repository unless that repository has the same scripts.
