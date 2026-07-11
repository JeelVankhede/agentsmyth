---
name: quality-gates-validator
description: Domain-expert power skill that judges whether discipline-specific quality bars (coverage, integration, lint/type, security, performance) are adequate for the change, not just present.
---

# Quality Gates Validator

## Purpose

Focused expert that judges whether discipline-specific quality bars — unit coverage, integration presence, lint/type, security scan, performance budget — are adequate for the change, not merely present. Distinct from `release-readiness-gate` (B8), which aggregates overall go/hold/blocked status: this skill judges the adequacy of each individual bar itself.

This is a power skill, not a lifecycle phase. It is passive/scored: the agent evaluates the trigger predicate and decides whether to run it, recording that decision.

## Invocation Context

Use this skill when the recorded `skill_scoring` trigger for `domain.quality-gates-validator`
evaluates true: `task_class != trivial`.

Do not invoke it for Trivial work — the adequacy-judgment cost is not justified for the smallest
class of change.

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
- The route file(s) relevant to the change's actual risk surface (`references/{unit-coverage,integration,lint-type,security-scan,perf-budget}.md`) — not all 5 apply to every change; select the ones whose bar is materially affected
- `workflow/config/verification.yaml` — configured commands/evidence expectations

## Inputs

- The diff and its test/lint/security/performance surface.
- Configured verification commands, if any.

## Refusal / Stop Conditions

Stop and raise a `Q` (or a Review/Test finding) instead of silently accepting a gate as adequate when:

- a bar's evidence is present but does not actually cover the changed logic (e.g., coverage
  percentage is unchanged or dropped on the touched files specifically, even if the repo-wide
  number looks fine)
- a bar was explicitly skipped with no risk/owner entry, when `skipped-check-accountant` would flag it

## Workflow

1. Confirm the trigger predicate evaluated true (or was explicitly requested); record the
   `skill_trigger_log` entry regardless of outcome.
2. Identify which of the 5 bars are materially affected by this change (not all 5 apply to every diff).
3. Load each relevant route file and apply its adequacy criteria — not just "did a check run,"
   but "does the check's actual result mean what it needs to mean for this change."
4. Record a per-bar adequacy verdict with an evidence pointer.
5. If a bar is inadequate, raise it as a finding/risk, not a silent pass.

## Exit Gate

- When triggered, a per-gate adequacy verdict (bar applied + evidence pointer) with the selected
  route(s) is recorded for every materially-affected bar.
- Inadequate gates are raised as risks, not silently passed.
- The `skill_trigger_log` entry is recorded whether the skill ran or was skipped.

## Determinism Rules

- Do not treat "a check ran" as equivalent to "the bar is adequate" — adequacy requires the check's
  actual coverage to match the change's actual risk surface.
- Do not judge a bar irrelevant without stating why it doesn't apply to this specific change.
- Do not silently accept a skipped bar with no risk/owner entry.

## Output

Follow `references/output-schema.md`.

Return: per-bar adequacy verdicts (bar, applied route, evidence pointer, verdict), any raised risks, and the `skill_trigger_log` entry.
