# Source-Of-Truth Guide

Source-of-truth handling is configured, not assumed.

Use `.workflow/config/source-of-truth.yaml` when requirements, docs, release notes, tasks, generated output, or external handoff depend on an authoritative source outside the local repository.

## Modes

| Mode | Meaning |
|---|---|
| `disabled` | External source handling is not used. |
| `optional` | Use external source references only when provided or configured. |
| `required` | Source read/update expectations can block lifecycle progress. |

The default is `optional`.

## Read Policy

Read source context when:

- the user provides a source link or reference
- the Plan depends on external requirements
- Ship needs release, handoff, or source update evidence
- Review needs to check whether changed files match source authority

If the source cannot be read and the answer affects scope, record a blocker.

## Update Policy

Source updates usually belong to Ship. A source update is complete only when the artifact cites evidence such as tool output, user-provided proof, or an updated source reference.

If the agent cannot update the source:

1. Record `blocked`.
2. Write copy-ready handoff text.
3. Name the owner and affected `R`/`RI` IDs.
4. Mark whether Ship is blocked or waiver-required.

Copy-ready handoff is not completion unless the user accepts a waiver.

## Provider Neutrality

No provider is mandatory by default. Add provider entries only when the repository actually uses them.

Each provider entry should make clear:

- provider or source type
- read permission
- update permission
- location or lookup method
- owner

## Artifact Expectations

- Brief records source links and source-derived requirements.
- Plan records source read/update strategy.
- Task records source evidence gathered during Build.
- Review flags missing or unsupported source claims.
- Verify records source checks when configured.
- Ship records update status, handoff, waiver, or not-applicable status.
- Reflect records final source outcome and follow-ups.
