# Artifact Contract

Artifacts are the durable state of the lifecycle. They must be complete enough for a later agent to restore context without relying on chat memory.

## Location

```text
.workflow/artifacts/briefs/<slug>-v<N>.md
.workflow/artifacts/plans/<slug>-v<N>.md
.workflow/artifacts/tasks/<slug>-v<N>.md
.workflow/artifacts/reviews/<slug>-v<N>.md
.workflow/artifacts/verify/<slug>-v<N>.md
.workflow/artifacts/ship/<slug>-v<N>.md
.workflow/artifacts/reflect/<slug>-v<N>.md
```

Use the templates in `.workflow/templates/`. Preserve section order unless a later schema revision changes it.

## Frontmatter

Every artifact must include:

- `slug`
- `version`
- `artifact`
- `status`
- `created`
- `updated`
- `manifest_ids`
- `upstream`
- `orchestration`

The schema contract lives in `.workflow/schemas/artifact-frontmatter.schema.yaml`.

## Requirement IDs

- Explicit requirements use `R<N>`.
- Implicit requirements use `RI<N>`.
- Assumptions use `A<N>`.
- Open questions use `Q<N>`.

Do not renumber existing IDs after downstream artifacts exist. New facts should append new IDs or clearly mark superseded IDs.

## Architecture Notes

Architecture notes preserve decisions that affect later phases. They should include:

- role
- decisions
- constraints
- tradeoffs
- assumptions
- downstream impact

These notes are not optional when a decision changes implementation, verification, release, source handling, or follow-up risk.

## Blockers

Blockers belong in both the body and `orchestration.blockers` when they affect lifecycle progress.

Common blockers:

- unanswered `Q` IDs
- missing required source access
- unknown verification command
- failed or skipped required check
- unresolved review finding
- missing release or rollback evidence
- external handoff without waiver

## Evidence

Artifacts should cite exact paths, commands, URLs, user-provided proof, or prior artifact rows. Vague statements like "tests passed" or "source updated" are not sufficient.
