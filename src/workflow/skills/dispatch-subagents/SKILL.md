---
name: dispatch-subagents
description: Power skill for deciding whether explicit subagent delegation is allowed, safe, bounded, and logged.
---

# Dispatch Subagents

## Purpose

Define safe optional delegation for lifecycle work.

This is a power skill, not a lifecycle phase. It decides whether subagents may be used, which work can be delegated, what ownership each worker has, how caps apply, and how the parent agent records and integrates results.

## Invocation Context

Use this skill only when:

- the user explicitly authorizes subagents, delegation, or parallel agent work
- a lifecycle phase has independent candidate workstreams
- a phase skill asks whether delegation is allowed

If explicit authorization is missing, do not dispatch. Continue locally and record a refusal only when it affects the active artifact.

**Check `dispatch.enabled` before authorization, not after.** Resolve it global-then-repo-local:
read `workflow/agent-behavior.yaml`, then let `tuning.dispatch.enabled` in
`workflow/config/repo-profile.yaml` override it when present. If the resolved value is `disabled`,
do not dispatch in any phase even with explicit user authorization — a repo that has turned
delegation off has made a standing decision that a per-session authorization does not reverse. Say
so plainly and continue locally. `optional` is the default and preserves authorization-gated
behavior. A repo cannot set `required`; the schema rejects it.

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
- `references/decision-tree-by-phase.md` — to determine whether dispatch is permitted for the active phase
- `references/phase-caps.md` — to determine the hard cap for the active phase

**Load when the step requires it**:
- `references/independence-rules.md` — when evaluating whether candidate work items are truly independent
- `references/worker-ownership-format.md` — when defining delegations and ownership boundaries
- `references/logging-format.md` — when writing the dispatch log entry in the active artifact

**On demand**:
- Active lifecycle artifact for the current phase — when logging dispatch or refusal
- Approved brief, plan, task, review, verify, or ship artifacts — when delegation depends on manifest IDs, file ownership, or phase gates
- Repository files — only when needed to verify independence between candidate work items

## Inputs

- Active phase.
- User authorization state.
- Task class: Trivial, Standard, or Complex.
- Candidate work items.
- Affected files, modules, generated-output paths, source handoff surfaces, commands, or risk categories.
- Manifest IDs and expected output for each candidate.

## Refusal / Stop Conditions

Do not dispatch when:

- the user did not explicitly authorize delegation
- phase cap is zero
- requested worker count exceeds the cap
- work is small enough that coordination cost exceeds benefit
- Build candidates overlap in file, import, generated-output, config, schema, fixture, test, source handoff, or release surface
- the parent cannot log dispatch in the active artifact
- the next local action depends on a delegated result
- delegation would hide ownership, blockers, or final integration responsibility

## Workflow

1. Confirm explicit user authorization.
2. Identify active phase and phase cap.
3. Reject delegation for phases with cap zero.
4. Classify candidate work items and remove small or dependent tasks.
5. Apply independence rules.
6. Define worker ownership: exact files, risk category, requirement bucket, output, allowed edits/read-only status, and validation/evidence expectation.
7. Keep the immediate blocking or integration task with the parent agent.
8. Dispatch only eligible independent work.
9. Treat subagent output as evidence, not authority.
10. Parent agent reviews, integrates, validates, and owns final claims.
11. Log every dispatch or material refusal in the active artifact.

## Exit Gate

- Decision is `spawn` or `do-not-spawn`.
- User authorization state is recorded.
- Phase cap is respected.
- Every delegated task has disjoint ownership and expected output.
- Every actual dispatch has a log entry.
- Parent integration and validation plan is explicit.
- Failed, unsupported, or conflicting subagent output is not merged as fact.

## Determinism Rules

- Caps are hard.
- Do not nest subagent dispatch.
- Do not duplicate work between parent and subagents.
- Do not dispatch state-dependent Test, Ship, or Reflect work — the one narrow exception is the `verification-parallelizer` (E1) profile: independently-reproducible `verification-matrix-builder` (B6) rows only, capped at 3, per `references/decision-tree-by-phase.md`'s E1 section.
- Do not allow Build workers to touch overlapping files or contracts.
- Read-only review workers must not edit files.
- Parent agent remains responsible for final integration, evidence, and user-facing claims.

## Output Contract

Follow `references/output-schema.md`.

Return dispatch decision, authorization state, phase cap, delegations when any, spawn prompt requirements, dispatch log patch, merge plan, or refusal summary.

## Output

Same as Output Contract.
