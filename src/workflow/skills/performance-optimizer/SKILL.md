---
name: performance-optimizer
description: Domain-expert power skill for performance — hot-path identification, algorithmic complexity, query/network cost, caching, mobile runtime cost.
---

# Performance Optimizer

## Purpose

Focused expert for performance: hot-path identification, algorithmic complexity/allocation, query/network cost, caching, and mobile runtime cost. Prevents a change from introducing a measurable performance regression that goes unnoticed until it reaches production traffic or a real device.

This is a power skill, not a lifecycle phase. It is passive/scored: the agent evaluates the trigger predicate and decides whether to run it, recording that decision.

## Invocation Context

Use this skill when the recorded `skill_scoring` trigger for `domain.performance-optimizer`
evaluates true: `path~hotpath_globs OR complexity_score >= 60`.

Do not invoke it for changes with no plausible performance impact (documentation, test-only
changes, or logic entirely off any hot path).

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
- The route file(s) matching the change's actual performance surface (`references/{frontend-runtime,backend-throughput,db-query,mobile-runtime,memory,network}.md`) — selected from the diff's actual touched code, not assumed
- `quality-gates-validator/references/perf-budget.md` — if a budget is already configured, this skill's recommendation should respect it, not duplicate the adequacy judgment

## Inputs

- The diff's touched hot-path code.
- Any existing performance budget or baseline measurement.

## Refusal / Stop Conditions

Stop and raise a `Q` (or a finding) instead of silently approving when:

- the change introduces an algorithmic complexity regression (e.g., O(n) to O(n²)) on a path that
  processes real, potentially large input
- the change adds a new synchronous network/database call inside a loop with no batching consideration

## Workflow

1. Confirm the trigger predicate evaluated true (or was explicitly requested); record the
   `skill_trigger_log` entry regardless of outcome.
2. Identify which performance surface(s) apply from the diff's actual touched code.
3. Load the matching route file(s) and apply their checklists.
4. Record a recommendation: cost analysis, proposed optimization (if any), and a measurement
   method, with rationale.
5. If a real regression is found with no mitigation, raise it as a `Q` or finding.

## Exit Gate

- When triggered, a performance recommendation (cost analysis, proposed optimization,
  measurement method) with the selected route(s) is recorded.
- Algorithmic or query-cost regressions on real-scale paths are raised, not silently shipped.
- The `skill_trigger_log` entry is recorded whether the skill ran or was skipped.

## Determinism Rules

- Do not select a route file by guessing — select it from the diff's actual touched code's performance surface.
- Do not approve an algorithmic complexity regression on a real-scale path without raising it.
- Do not recommend an optimization with no stated measurement method to confirm it worked.

## Output

Follow `references/output-schema.md`.

Return: the performance recommendation (route(s) selected, cost analysis, proposed optimization, measurement method, rationale), any raised finding, and the `skill_trigger_log` entry.
