---
name: scope-fence
description: Power skill that asserts the actual Build diff is a subset of the active plan phase's declared touches, flagging out-of-scope files.
---

# Scope Fence

## Purpose

Assert that the actual set of changed files in Build is a subset of the active plan phase's declared `Touches` list, flagging any file changed outside that declared scope. Catches scope expansion at the moment it happens, inside Build, rather than letting it reach Review undetected.

This is a power skill, not a lifecycle phase. It is gate-bound: it runs at every Build phase's Exit Gate.

## Invocation Context

Use this skill when:

- a Build phase is about to be marked complete and its Exit Gate is evaluated
- Build's `git status` shows changed files and the active plan phase's `Touches` list needs to be checked against them

Do not invoke it before any files have been changed — there is nothing to fence yet.

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
- `references/comparison-method.md` — how to compare `git status` output against a plan phase's `Touches` list
- The active plan phase's `Touches` entry from the plan artifact
- Current `git status --short` output

## Inputs

- The active plan phase's declared `Touches` file list.
- Current `git status --short` output (changed, added, deleted files).
- Any scope-expansion waiver already recorded in the task artifact.

## Refusal / Stop Conditions

Stop or return a failed fence check instead of approving when:

- a changed file is not in the active plan phase's `Touches` list and no waiver covers it
- the active plan phase has no `Touches` list at all (this is a Plan defect, not something to guess past)

## Workflow

1. Read the active plan phase's `Touches` list in full — do not rely on a paraphrase from earlier in the conversation.
2. Run `git status --short` and enumerate every changed, added, or deleted file.
3. Compare: every file from step 2 must appear in the `Touches` list from step 1, or be covered by a scope-expansion waiver recorded in the task artifact's `waivers` block.
4. Flag any file outside both sets as an out-of-scope change.
5. Do not silently stage or commit an out-of-scope file — report it back to Build so it is either reverted, deferred to a later plan phase, or covered by an explicit waiver before proceeding.

## Exit Gate

- Every changed file maps to the active plan phase's declared scope, or to an approved scope-expansion waiver.
- No out-of-scope file is staged or committed without being reported first.

## Determinism Rules

- Do not expand the `Touches` list on the fence-check's own authority — that is a Plan-owned decision.
- Do not treat a file as "probably fine" because it looks small or related — the check is binary against the declared list.
- Do not invent a waiver to cover an out-of-scope file; only recognize waivers actually recorded in the task artifact.

## Output

Follow `references/output-schema.md`.

Return: the active plan phase's `Touches` list, the actual changed-file list, any out-of-scope files found, and an overall pass/fail for the Exit Gate this skill was invoked from.
