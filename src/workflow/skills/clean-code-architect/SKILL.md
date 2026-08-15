---
name: clean-code-architect
description: Domain-expert power skill for clean-code architecture — naming, layering, cohesion/coupling, abstraction boundaries, duplication, testability. Language-agnostic.
---

# Clean Code Architect

## Purpose

Focused expert for clean-code architecture: naming, layering, cohesion/coupling, abstraction boundaries, duplication/dead-code, and testability. Language-agnostic. Prevents a change from degrading the codebase's structural quality even when it satisfies the functional requirement.

This is a power skill, not a lifecycle phase. It is passive/scored: the agent evaluates the trigger predicate and decides whether to run it, recording that decision.

## Invocation Context

Use this skill when the recorded `skill_scoring` trigger for `domain.clean-code-architect`
evaluates true: `complexity_score >= thresholds.domain.clean-code-architect`.

Do not invoke it for low-complexity changes where the structural-quality analysis cost exceeds the
benefit — a one-line fix does not need a layering review.

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
- The route file matching the codebase's dominant paradigm (`references/{oo,functional,layered,module-boundaries}.md`) — selected from the actual code being touched, not a language default assumption
- The touched files' existing structure and naming conventions

## Inputs

- The diff's touched files.
- The repo's existing conventions for naming, layering, and module boundaries.

## Refusal / Stop Conditions

Stop and raise a `Q` instead of silently proceeding when:

- the change would introduce duplication of existing logic with no clear reason the existing logic
  couldn't be reused or extended
- the change would blur an existing, otherwise-consistent layering boundary (e.g., business logic
  reaching directly into a data-access implementation detail it shouldn't know about)

## Workflow

1. Confirm the trigger predicate evaluated true (or was explicitly requested); record the
   `skill_trigger_log` entry regardless of outcome.
2. Identify the codebase's dominant paradigm/structure from the actual touched files.
3. Load the matching route file and apply its checklist.
4. Record a recommendation: layering/coupling assessment, naming consistency, and testability
   notes, with rationale.
5. If a real duplication or layering-boundary violation is found, raise it as a `Q` (or fix it
   directly if within the current Build phase's own declared scope).

## Exit Gate

- When triggered, a code-architecture recommendation (layering/coupling assessment) with rationale
  and the selected route is recorded.
- The `skill_trigger_log` entry is recorded whether the skill ran or was skipped.

## Determinism Rules

- Do not select a route file from a language default — confirm it against the actual codebase's dominant paradigm.
- Do not approve new duplication of existing logic without raising it as a `Q`.
- Do not treat "it works" as sufficient — testability and layering consistency are part of this skill's Exit Gate.

## Output

Follow `references/output-schema.md`.

Return: the code-architecture recommendation (route selected, layering/coupling assessment, naming notes, testability notes, rationale), any raised `Q`, and the `skill_trigger_log` entry.
