---
name: architecture-decision-advisor
description: Power skill that forces a recorded, whole-repo architecture call on high-complexity requirements, with rejected alternatives named.
---

# Architecture Decision Advisor

## Purpose

For high-complexity requirements, force a big-picture architecture decision that considers the whole repo — not just the local task — and record the decision plus the alternatives that were rejected and why. Prevents a complex change from accumulating local, uncoordinated decisions that only make sense in isolation.

This is a power skill, not a lifecycle phase. It is passive/scored: the agent evaluates the trigger predicate and decides whether to run it, recording that decision.

## Invocation Context

Use this skill when the recorded `skill_scoring` trigger for `architecture-decision-advisor`
evaluates true: `complexity_score >= thresholds.architecture-decision-advisor OR touches_contract OR new_surface`.

Do not invoke it for requirements below that threshold with no contract or new-surface signal — a
local, self-contained change does not need a whole-repo architecture call.

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
- `references/decision-framing.md` — how to frame alternatives so the record is genuinely useful later, not just a formality
- `workflow/config/repo-profile.yaml` — repo mode, protected paths, public contracts
- The requirement as currently framed, and `repo-alignment-scan`'s findings if it already ran this session

## Inputs

- The requirement text.
- Real repo architecture signals: existing module boundaries, existing integration points, `repo-profile.yaml`.

## Refusal / Stop Conditions

Stop and record an explicit gap instead of silently picking an approach when:

- the requirement could be satisfied by two or more materially different architectures and neither is clearly repo-consistent
- the decision would affect a public contract or generated output and no rollback/compatibility note exists

## Workflow

1. Confirm the trigger predicate evaluated true (or was explicitly requested); record the
   `skill_trigger_log` entry regardless of outcome.
2. Identify the architecture question the requirement actually raises (module boundary, ownership,
   integration point, data flow direction) — not a restatement of the requirement itself.
3. Enumerate at least two genuinely different approaches, including the one that seems obvious —
   "we did the obvious thing" is only a real decision if the alternative was named and rejected
   with a reason.
4. Record the chosen approach, the rejected alternative(s), and the concrete reason for the choice
   in the invoking phase's Architecture Notes.
5. If no repo-consistent choice exists, raise it as a `Q` rather than choosing unilaterally.

## Exit Gate

- When triggered, an architecture decision with at least one named, rejected alternative and a
  concrete rationale is recorded in the invoking phase's Architecture Notes.
- The `skill_trigger_log` entry is recorded whether the skill ran or was skipped.

## Determinism Rules

- Do not record a decision without naming at least one real alternative that was considered and rejected.
- Do not treat "this is what the requirement implies" as a rationale — the rationale must reference repo-consistency, maintainability, or an explicit tradeoff.
- Do not silently choose between two repo-inconsistent options — raise a `Q`.

## Output

Follow `references/output-schema.md`.

Return: the architecture decision (chosen approach, rejected alternatives, rationale), or the raised `Q` if no repo-consistent choice exists, plus the `skill_trigger_log` entry.
