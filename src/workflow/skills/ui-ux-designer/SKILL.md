---
name: ui-ux-designer
description: Domain-expert power skill for UI/UX design — component/layout/interaction/state, platform conventions, accessibility, responsive/adaptive behavior.
---

# UI/UX Designer

## Purpose

Focused expert for UI/UX design: component/layout/interaction/state design, platform conventions, accessibility, and responsive/adaptive behavior. Prevents an interface change from shipping with an inaccessible, platform-inconsistent, or unconsidered interaction state.

This is a power skill, not a lifecycle phase. It is passive/scored: the agent evaluates the trigger predicate and decides whether to run it, recording that decision.

## Invocation Context

Use this skill when the recorded `skill_scoring` trigger for `domain.ui-ux-designer` evaluates
true: `path~ui_globs` — i.e. the diff touches a component/view/screen/style file.

Do not invoke it for changes with no UI-shaped surface (backend logic, CLI-only tools with no
visual interface, etc.).

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
- The route file(s) matching the touched platform(s) (`references/{web,mobile-ios,mobile-android,cross-platform-mobile,desktop,tui,accessibility}.md`) — selected from the diff's file signals
- `references/accessibility.md` — always load alongside the platform route; accessibility is cross-cutting, not platform-specific

## Inputs

- The diff's touched component/view/screen/style files.
- The requirement's stated interaction/visual expectations, if any.

## Refusal / Stop Conditions

Stop and raise a `Q` instead of silently shipping when:

- a new or changed interactive element has no stated keyboard/assistive-technology path (accessibility gap)
- a new component's behavior under a state the requirement didn't address (loading, error, empty) is genuinely undefined, not just unstated-but-obvious

## Workflow

1. Confirm the trigger predicate evaluated true (or was explicitly requested); record the
   `skill_trigger_log` entry regardless of outcome.
2. Identify which platform route(s) apply from the diff's touched file shapes.
3. Load the matching route file(s) plus `accessibility.md`; apply their checklists to the actual diff.
4. Record a recommendation: interaction states covered, platform-convention notes, and
   accessibility notes, with rationale.
5. If a state or accessibility gap is genuinely unaddressed, raise it as a `Q`.
6. Record the recommendation in the invoking phase's Architecture Notes (Plan/Build) or review notes (Review).

## Exit Gate

- When triggered, a UX recommendation (interaction states, platform-convention notes,
  accessibility notes) with rationale and the selected route(s) is recorded.
- The `skill_trigger_log` entry is recorded whether the skill ran or was skipped.

## Determinism Rules

- Do not select a route file by guessing from the requirement's wording — select it from the diff's actual touched file shapes.
- Do not treat accessibility as optional or platform-specific — it loads alongside every platform route.
- Do not approve a component with an undefined loading/error/empty state without raising it as a `Q`.

## Output

Follow `references/output-schema.md`.

Return: the UX recommendation (routes selected, interaction states, platform notes, accessibility notes, rationale), any raised `Q`, and the `skill_trigger_log` entry.
