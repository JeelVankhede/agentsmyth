---
name: system-design-advisor
description: Domain-expert power skill for system/architecture design — module boundaries, dependency direction, coupling, integration contracts, failure modes across the whole repo.
---

# System Design Advisor

## Purpose

Focused expert for system and architecture design: module/service boundaries, dependency direction, coupling, integration contracts, and failure modes considered across the whole repo, not just the local task. Prevents a change from introducing a boundary violation or a failure mode nobody considered because the analysis stayed local.

This is a power skill, not a lifecycle phase. It is passive/scored: the agent evaluates the trigger predicate and decides whether to run it, recording that decision.

## Invocation Context

Use this skill when the recorded `skill_scoring` trigger for `domain.system-design-advisor`
evaluates true: `complexity_score >= 60 OR new_surface`.

Do not invoke it for a localized change with no new module/service boundary implication — this
skill's cost is only justified when the change actually has whole-repo structural consequences.

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
- The route file matching the system's actual topology (`references/{monolith,microservices,event-driven,serverless,integration-boundary}.md`) — selected from the repo's real structure, not the requirement's framing
- `workflow/config/repo-profile.yaml` — repository mode, module roots

## Inputs

- The requirement and its implied module/service touch points.
- The repo's actual existing module/service boundaries and dependency graph.

## Refusal / Stop Conditions

Stop and raise a `Q` instead of silently choosing a boundary when:

- the change would introduce a dependency that reverses an existing, established dependency direction (e.g., a shared/core module importing from a feature module)
- the change spans two services/modules with no existing integration contract and none is being defined as part of this work

## Workflow

1. Confirm the trigger predicate evaluated true (or was explicitly requested); record the
   `skill_trigger_log` entry regardless of outcome.
2. Identify the repo's actual topology (monolith, microservices, event-driven, serverless,
   integration-boundary) from real inspection, not assumption.
3. Load the matching route file and apply its checklist.
4. Record the architecture recommendation: boundaries affected, dependency direction, and failure
   modes considered, with rationale — including at least one rejected alternative for the
   boundary/dependency choice made.
5. If a boundary violation or undefined integration contract is unavoidable, raise it as a `Q`.

## Exit Gate

- When triggered, an architecture recommendation (boundaries, dependency direction, rejected
  alternatives) with rationale and the selected route is recorded.
- The `skill_trigger_log` entry is recorded whether the skill ran or was skipped.

## Determinism Rules

- Do not select a route file from the requirement's wording alone — confirm it against the repo's actual topology.
- Do not approve a dependency-direction reversal without raising it as a `Q`.
- Do not record a recommendation with no rejected alternative — an unconsidered choice is not a design decision.

## Output

Follow `references/output-schema.md`.

Return: the architecture recommendation (route selected, boundaries, dependency direction, failure modes, rationale, rejected alternatives), any raised `Q`, and the `skill_trigger_log` entry.
