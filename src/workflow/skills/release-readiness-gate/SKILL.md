---
name: release-readiness-gate
description: Power skill that aggregates verify status, open P0/P1 findings, coverage ledger state, and waivers into one go/hold/blocked recommendation with per-line evidence.
---

# Release Readiness Gate

## Purpose

Aggregate verify status, open P0/P1 review findings, the coverage ledger, and waivers into a single `go`/`hold`/`hold-with-waiver` recommendation with per-line evidence for each input. Absorbs most of Ship's individual refusal conditions into one composite check.

This is a power skill, not a lifecycle phase. It is gate-bound: it runs at every Ship Exit Gate, consuming `coverage-tracer`'s ledger and `skipped-check-accountant`'s accounting.

## Invocation Context

Use this skill when:

- Ship is about to set its `Ship Status` recommendation
- all upstream inputs (verify sign-off, review findings, coverage ledger, waivers) are available to aggregate

Do not invoke it before Test's verify artifact exists — there is no verify status to aggregate yet.

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
- `references/aggregation-rules.md` — how the four inputs combine into one recommendation
- The verify artifact's `Sign-Off`
- The review artifact's `Severity Summary`
- The coverage ledger (from `coverage-tracer`)
- Any waivers (checked via `waiver-completeness-check`)

## Inputs

- Verify artifact's sign-off outcome (`ship`, `hold`, `hold-with-waiver`).
- Review artifact's open findings by severity (P0/P1/P2/P3).
- The coverage ledger's state per manifest ID.
- Any recorded waivers relevant to release.

## Refusal / Stop Conditions

Stop or return a `blocked` recommendation instead of `go` when:

- verify sign-off is `hold` with no waiver
- any P0 or P1 finding from Review remains open with no waiver
- any manifest ID's coverage ledger state is `dropped` with no waiver, or has a gap (no row at all)
- an input needed for aggregation (verify sign-off, review severity summary, coverage ledger) is missing entirely

## Workflow

1. Gather the four inputs: verify sign-off, review open-findings-by-severity, coverage ledger state, and any waivers.
2. Evaluate each input against its own pass condition (verify: `ship` or waived `hold`; review: no open P0/P1 unwaived; coverage: no gap or unwaived `dropped`).
3. Combine: `go` only if all four inputs individually pass. `hold-with-waiver` if one or more inputs fail but each failing input has a valid waiver. `blocked`/`hold` if any input fails with no waiver.
4. Cite the specific evidence line for each input's pass/fail state — never a bare "looks fine."
5. Report the composite recommendation with its full evidence trail.

## Exit Gate

- The recommendation is exactly one of `go`, `hold`, or `hold-with-waiver`.
- Every input line has cited evidence.
- No `go` recommendation exists alongside an open P0/P1 finding or an uncovered/unwaived manifest ID.

## Determinism Rules

- Do not average or split the difference between inputs — the aggregation is a hard AND across pass conditions, not a weighted score.
- Do not recommend `go` because most inputs pass — every input must individually pass or be waived.
- Do not invent a waiver to clear a failing input; only recognize waivers actually recorded and validated by `waiver-completeness-check`.

## Output

Follow `references/output-schema.md`.

Return: the four input states with evidence, the composite recommendation, and an overall pass/fail for the Exit Gate this skill was invoked from.
