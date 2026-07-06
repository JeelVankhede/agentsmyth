# Lifecycle State Machine

## Purpose

Define valid phase and status transitions for lifecycle artifacts.

## Status Values

Use these statuses consistently:

| Status | Meaning |
|---|---|
| `draft` | Artifact exists but is not approved or complete. |
| `in-progress` | Phase work is actively underway. |
| `blocked-for-user` | User input, approval, or decision is required. |
| `blocked-external` | External access, tool, source, CI, release, or handoff is required. |
| `ready-for-next-phase` | Phase exit gate passed. |
| `done` | Final phase or terminal artifact is complete. |
| `superseded` | Artifact was replaced by a newer version. |

## Required Orchestration Block

Every lifecycle artifact must include:

```yaml
orchestration:
  phase: <phase>
  status: <status>
  next_phase: <phase-or-done>
  blockers: []
  user_checkpoint: <checkpoint-or-none>
```

## Valid Phase Transitions

```text
think -> plan -> build -> review -> test -> ship -> reflect -> done
```

A phase may remain on itself when blocked or when rework is required.

## Rework Transitions

Allowed rework transitions:

- Review hold -> Build
- Test hold -> Build
- Ship hold -> Build, Review, Test, or Ship depending on the blocker
- Reflect follow-up -> new Think or new version

Rework must preserve existing Requirement Manifest IDs unless a new version is created.

## Versioning Rule

Create a new version when:

- accepted requirements materially change
- existing R/RI IDs would need renumbering
- scope expands beyond the approved brief
- prior artifacts would become misleading if edited in place

## Completion Rule

A lifecycle chain is complete only when Reflect is done or the user explicitly stops before Reflect with recorded risk.
