---
name: conditional-preservation-check
description: Power skill that detects silently dropped conditional branches or guard clauses when a refactor folds, merges, or renames code.
---

# Conditional Preservation Check

## Purpose

On fold/merge/rename operations, detect silently dropped conditional branches or guard clauses. A refactor that consolidates two similar-looking code paths can easily lose a branch that only one of them handled — this skill exists to catch that specific failure mode before it ships as a silent behavior regression.

This is a power skill, not a lifecycle phase. It is active: invoked by Build when a refactor's diff shape indicates a fold/merge/rename operation touching control flow, not a fixed gate every Build phase runs through.

## Invocation Context

Use this skill when:

- the diff removes a function, branch, or file whose logic is absorbed into another location (a fold or merge)
- the diff renames a function/module in a way that also restructures its internal control flow, not just its identifier
- the task description itself names a refactor, consolidation, or deduplication as its purpose

Do not invoke it for a diff that only adds new code with no removed/restructured control flow, or
for a pure rename with no logic change (identifier-only, structure untouched).

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
- `references/detection-method.md` — how to compare pre- and post-refactor control flow for dropped branches
- The pre-refactor version of every file being folded/merged/renamed (via git diff or git show against the base commit)

## Inputs

- The diff's removed, merged, or renamed functions/files.
- The pre-refactor version of each, for control-flow comparison.

## Refusal / Stop Conditions

Stop and raise a finding instead of silently approving when:

- a conditional branch, guard clause, or early-return present in the pre-refactor code has no
  corresponding path in the post-refactor code, and its removal is not explicitly justified in the
  diff's own commit message or task artifact
- two pre-refactor code paths being merged handle a shared condition differently, and the merged
  version silently picks one behavior without reconciling or flagging the difference

## Workflow

1. Identify every function/file in the diff that was removed, folded into another, or renamed with
   restructured control flow.
2. For each, enumerate its pre-refactor conditional branches and guard clauses (every `if`/`else`/
   early-return/`switch` case/guard).
3. Confirm each pre-refactor branch has a corresponding path in the post-refactor code — same
   condition, same resulting behavior (or an explicitly justified, intentional change).
4. Report any branch with no corresponding post-refactor path as a finding: cite the exact
   pre-refactor condition and location, and what appears to have replaced it (or nothing).
5. For merges of two similar code paths, explicitly check for a case where the two pre-refactor
   paths handled a shared input differently — the merged version must handle it correctly for both
   origins, not just one.

## Exit Gate

- Every pre-existing conditional branch in code the diff removes, folds, or restructures is either
  present post-change or its removal is explicitly noted and justified.
- No merge of two code paths silently drops a behavior difference between them.

## Determinism Rules

- Do not assume a dropped branch was dead code without confirming it — check for any caller/test
  that exercised it before concluding it was safe to drop.
- Do not accept "it looks equivalent" without actually comparing the specific conditions and their
  resulting behavior.
- Do not flag a genuinely intentional, explicitly-justified behavior change as a violation — this
  skill catches *silent* drops, not disclosed ones.

## Output

Follow `references/output-schema.md`.

Return: any dropped conditional branches found (with pre-refactor citation and post-refactor comparison), or confirmation that all branches were traced and preserved or explicitly justified.
