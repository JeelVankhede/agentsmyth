---
name: data-schema-designer
description: Domain-expert power skill for data/schema design — table/collection/state shape, keys, indexes, normalization, nullability, migration safety.
---

# Data Schema Designer

## Purpose

Focused expert for data and schema design: table/collection/state shape, keys, indexes, normalization, nullability, and migration safety (data-loss/lock risk). Prevents a schema change from shipping with an unconsidered destructive-migration risk or an inconsistent data model.

This is a power skill, not a lifecycle phase. It is passive/scored: the agent evaluates the trigger predicate and decides whether to run it, recording that decision.

## Invocation Context

Use this skill when the recorded `skill_scoring` trigger for `domain.data-schema-designer`
evaluates true: `path~schema_globs` — i.e. the diff touches a schema, migration, or model file.

Do not invoke it for changes with no schema-shaped surface (e.g., a pure application-logic change
that reads existing fields without adding, removing, or retyping any).

## What To Load

**Foundation** (confirm in context; load if not already present):
- Root `AGENTS.md`
- `workflow/router.md`
- `workflow/lifecycle.md`
- `workflow/rules.md`

**Minimum for invocation**:
- This file
- `references/output-schema.md`

**Before starting work**:
- The route file matching the touched schema's shape (`references/{relational-sql,document-nosql,key-value,graph,migrations,event-schema}.md`) — selected from the diff's file signals
- `workflow/config/repo-profile.yaml` — `paths.generated_outputs` (a migration may itself be generated)

## Inputs

- The diff's touched schema/migration/model files.
- The requirement's stated data-volume or downtime constraints, if any.

## Refusal / Stop Conditions

Stop and raise a `Q` instead of silently proceeding when:

- the change would drop a column/field/collection or narrow a type in a way that loses existing data with no backup/migration-safety note
- the migration would require a long-held lock on a table/collection that has (or plausibly could have) production traffic, with no online-migration strategy stated

## Workflow

1. Confirm the trigger predicate evaluated true (or was explicitly requested); record the
   `skill_trigger_log` entry regardless of outcome.
2. Identify which knowledge route applies from the touched file's shape.
3. Load that route file and apply its checklist to the actual diff.
4. Record a recommendation: key/index design, normalization level, nullability choices, and a
   migration-safety note, with rationale.
5. If the migration is destructive or lock-risky, raise it as a `Q` with the concrete risk named —
   never silently ship a destructive migration.
6. Record the recommendation in the invoking phase's Architecture Notes (Plan/Build) or review notes (Review).

## Exit Gate

- When triggered, a schema recommendation (keys, indexes, migration-safety note) with rationale and
  the selected route is recorded.
- Destructive-migration risks are raised as `Q` IDs, never silently shipped.
- The `skill_trigger_log` entry is recorded whether the skill ran or was skipped.

## Determinism Rules

- Do not select a route file by guessing from the requirement's wording — select it from the diff's actual touched file shapes.
- Do not approve a data-loss-risking migration without an explicit backup or migration-safety note.
- Do not invent an index or key strategy without checking existing query patterns the schema already serves.

## Output

Follow `references/output-schema.md`.

Return: the schema recommendation (route selected, keys/indexes, nullability, migration-safety note, rationale), any raised `Q`, and the `skill_trigger_log` entry.
