# Minimal Markdown Source Example

This example shows a repository where a local Markdown file is the source of truth for a small documentation request.

## Files

| Path | Purpose |
|---|---|
| `source/requirements.md` | Local source authority for the request. |
| `.workflow/config/source-of-truth.yaml` | Example-specific source config. |
| `.workflow/artifacts/briefs/add-help-panel-v1.md` | Sanitized Think artifact. |
| `.workflow/artifacts/plans/add-help-panel-v1.md` | Sanitized Plan artifact. |

## What It Demonstrates

- Source-of-truth can be local and provider-neutral.
- Think records source links, requirements, assumptions, and architecture notes.
- Plan maps source-backed requirements to repo surfaces and verification evidence.

This example intentionally stops at Plan. Build, Review, Test, Ship, and Reflect would be added only when the work is actually performed.
