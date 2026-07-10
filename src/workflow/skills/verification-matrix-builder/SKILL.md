---
name: verification-matrix-builder
description: Power skill that builds the R/RI to method to evidence to status verification matrix, flagging method-less or evidence-less rows.
---

# Verification Matrix Builder

## Purpose

Build the verification matrix mapping every active `R`/`RI` to a verification method, evidence, and status; flag any row with no named method. Prevents Test from producing vague or empty verification rows.

This is a power skill, not a lifecycle phase. It is gate-bound: it runs at every Test Exit Gate.

## Invocation Context

Use this skill when:

- Test is building or finalizing its `## Manifest Coverage` section
- Test is about to set its Sign-Off recommendation

Do not invoke it before the plan's Verification Plan exists — that is the source of each ID's
intended evidence type.

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
- `references/method-taxonomy.md` — the recognized evidence/method types
- The plan's `## Verification Plan` section (source of intended method per ID)
- The task artifact's Command Results / Implementation Log (actual evidence gathered)

## Inputs

- Active `R`/`RI` IDs and their planned verification method.
- Task artifact's actual command/evidence results.

## Refusal / Stop Conditions

Stop or return an incomplete matrix instead of approving when:

- an active `R`/`RI` has no row at all in the matrix
- a row names no method (command, manual QA, generated-output check, review evidence, source-of-truth check, or waiver)
- a row claims `pass` with no evidence field populated

## Workflow

1. Read every active `R`/`RI` from the plan's Verification Plan.
2. For each, confirm a matrix row exists with: manifest ID, method, evidence, expected result,
   actual result, status.
3. Cross-check the method against the plan's originally intended method — note (not necessarily
   block) if it changed.
4. Flag any row missing a method or evidence for a claimed `pass`.
5. Report the full matrix and any gaps.

## Exit Gate

- Every active `R`/`RI` has a matrix row with a named method.
- No row claims `pass` with an empty evidence field.

## Determinism Rules

- Do not infer a method from context — if the row does not state one, it is a gap.
- Do not accept "tested" or "verified" alone as a method — name the actual command, manual
  scenario, or check type.
- Do not silently drop an ID with no row — report it.

## Output

Follow `references/output-schema.md`.

Return: the full matrix, any method-less or evidence-less rows found, and an overall pass/fail for the Exit Gate this skill was invoked from.
