---
name: skipped-check-accountant
description: Power skill that forces every skipped, blocked, or not-actually-run check into a risk entry with an owner, not a silent pass.
---

# Skipped Check Accountant

## Purpose

Force every skipped, blocked, or "assumed-passing but not actually run" check in a Test artifact into a recorded risk entry with an owner and follow-up — never a silent pass. Enforces `agent-behavior.yaml`'s `evidence_policy.skipped_checks_are_risk` and `blocked_or_not_run_checks_require_owner`.

This is a power skill, not a lifecycle phase. It is gate-bound: it runs at every Test Exit Gate. It is hardened beyond a simple skip-scan — it also audits checks marked as passed with no evidence a command actually ran.

## Invocation Context

Use this skill when:

- Test is finalizing its verification rows and Sign-Off
- any verification row has an outcome other than a positive, evidenced result

Do not invoke it for a Test artifact where every row already carries current-turn command output or manual-QA evidence with no gaps.

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
- `references/accounting-rules.md` — what counts as "actually run" vs. "assumed"
- `workflow/config/verification.yaml` — `skipped_checks.required_fields` and `outcomes`

**Load when the step requires it**:
- The verify artifact's `Automated Checks`, `Manual QA`, and `Skipped Checks` sections, in full

## Inputs

- The verify artifact's verification rows (automated checks, manual QA, skipped checks).
- `workflow/config/verification.yaml`.

## Refusal / Stop Conditions

Stop or return a failed accounting instead of approving when:

- a check outcome is `not run` or `blocked` with no corresponding `Skipped Checks` row carrying `check`, `why_skipped`, `risk`, `owner`, and `blocks_ship`
- a check outcome is claimed `pass` with no command output or manual-QA evidence for that specific check this session
- a `blocks_ship` value of `no` is asserted for a check whose risk description implies it should block — flag the inconsistency rather than accepting the asserted value uncritically

## Workflow

1. Enumerate every verification row in the artifact — automated, manual, and explicitly skipped.
2. For each row with a non-passing or unconfirmed outcome, confirm it has a matching `Skipped Checks` entry with all required fields (`check`, `why_skipped`, `risk`, `owner`, `blocks_ship`, `manifest_ids`).
3. For each row claiming `pass`, confirm there is current-turn command output or manual-QA evidence — not an assumption that it "should" pass.
4. Flag any row that is neither properly accounted as skipped/blocked nor properly evidenced as passed — this is the hardened check beyond a simple skip-scan.
5. Report the full accounting; do not let an unaccounted row pass silently into Ship.

## Exit Gate

- Every check is either run-with-evidence, or has a complete `Skipped Checks` risk entry with owner.
- No check claims `pass` with no evidence.
- No `blocks_ship` value contradicts its own stated risk description without explanation.

## Determinism Rules

- Do not downgrade a missing-evidence `pass` claim to `skipped` on this skill's own authority — report it back to Test as an accounting gap.
- Do not invent a risk level or owner for an unaccounted check.
- Treat every skip as risk, never as success, per `evidence_policy.skipped_checks_are_risk`.

## Output

Follow `references/output-schema.md`.

Return: full row-by-row accounting, any gaps found, and an overall pass/fail for the Exit Gate this skill was invoked from.
