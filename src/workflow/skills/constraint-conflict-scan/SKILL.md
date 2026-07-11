---
name: constraint-conflict-scan
description: Power skill that cross-checks a request against domain.yaml constraints and protected paths, surfacing conflicts before framing.
---

# Constraint Conflict Scan

## Purpose

Cross-check the request against `workflow/config/domain.yaml`'s configured constraints (`product`,
`safety`, `provider_neutrality`) and `repo-profile.yaml`'s protected paths, surfacing any conflict
before Think finishes framing. Prevents a brief from being written that silently violates a
constraint the repo already declared.

This is a power skill, not a lifecycle phase. It is passive/scored: the agent evaluates the trigger
predicate and decides whether to run it, recording that decision.

## Invocation Context

Use this skill when the recorded `skill_scoring` trigger for `constraint-conflict-scan` evaluates
true: `task_class != trivial OR touches_protected`.

Do not invoke it for Trivial work that touches no protected path — the check is cheap but not free,
and a Trivial change with no protected-path signal has essentially no conflict surface.

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
- `references/constraint-id-convention.md` — how constraint IDs are written in `domain.yaml` and how to cite one
- `workflow/config/domain.yaml` — the actual configured constraints
- `workflow/config/repo-profile.yaml` — `paths.protected`

## Inputs

- The request or in-progress brief draft.
- `domain.yaml`'s `constraints.{product,safety,provider_neutrality}` arrays.
- `repo-profile.yaml`'s `paths.protected` glob list.

## Refusal / Stop Conditions

Stop and raise the conflict as a `Q` (or, if severe, refuse to proceed) instead of silently
absorbing it when:

- the request would require doing something a configured constraint explicitly prohibits
- the request touches a path matching `paths.protected` with no explicit user approval already on record

## Workflow

1. Read every constraint in `domain.yaml`'s three constraint arrays, noting each one's bracketed ID
   (`[<id>]` prefix — see `references/constraint-id-convention.md`).
2. Read the request/brief draft and check it against each constraint for a direct conflict — not a
   vague thematic overlap, an actual "this constraint says X, the request implies not-X."
3. Check the request's implied file paths against `repo-profile.yaml`'s `paths.protected` glob list.
4. For each real conflict found, cite the specific constraint ID and record it as a `Q` (or a
   Refusal, per the Stop Conditions above).
5. Report "no conflict found" only after having actually checked every constraint array and the
   protected-paths list, not by default.

## Exit Gate

- No unaddressed conflict between the request and a configured constraint remains — every real
  conflict found is either resolved (with the constraint ID cited) or raised as a `Q`.
- The `skill_trigger_log` entry is recorded whether the skill ran or was skipped.

## Determinism Rules

- Do not cite a constraint ID that does not exist in `domain.yaml` — every citation must resolve to
  a real, present ID (this is exactly what `check-constraint-conflicts.mjs` verifies structurally).
- Do not report "no conflict" without having read all three constraint arrays and the protected-paths list this session.
- Do not silently proceed past a protected-path conflict — it is a Refusal condition, not a note.

## Output

Follow `references/output-schema.md`.

Return: any conflicts found (each citing a real constraint ID), or confirmation that all three constraint arrays and the protected-paths list were checked with no conflict found, plus the `skill_trigger_log` entry.
