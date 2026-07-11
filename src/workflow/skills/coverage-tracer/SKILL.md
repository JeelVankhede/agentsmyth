---
name: coverage-tracer
description: Power skill that traces every active R/RI manifest ID from brief through ship into a covered/deferred/waived/dropped ledger with a citation per line.
---

# Coverage Tracer

## Purpose

Maintain a coverage ledger tracing every active `R`/`RI` manifest ID from the brief through Ship: `covered`, `deferred`, `waived`, or `dropped`, each with an artifact citation. Prevents a requirement from silently disappearing between phases.

This is a power skill, not a lifecycle phase. It is gate-bound: Plan establishes the ledger, Review/Ship/Reflect verify and extend it at their own Exit Gates.

## Invocation Context

Use this skill when:

- Plan is writing its Requirement Coverage section — this is the ledger's first population
- Review is confirming the task's changes map back to every manifest ID
- Ship is aggregating final coverage state before a go/hold/blocked decision
- Reflect is writing the Manifest Coverage Retrospective

Do not invoke it for Trivial work (no manifest, nothing to trace).

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
- `references/ledger-states.md` — the 4 valid states and when each applies
- The brief's Requirement Manifest (source of the active `R`/`RI` set)
- The current phase's own artifact (plan, review, ship, or reflect) being written

**Load when the step requires it**:
- Prior-phase artifacts in the chain — to trace a manifest ID's state as it moved between phases

## Inputs

- Active `R`/`RI` IDs from the brief's Requirement Manifest.
- The artifact being written or reviewed, and any prior artifacts in the chain.

## Refusal / Stop Conditions

Stop or return an incomplete ledger instead of approving when:

- an active `R`/`RI` ID from the brief has no row anywhere in the ledger
- a row is marked `dropped` with no accompanying waiver
- a row cites no artifact — a state with no citation is not traceable and does not count as recorded

## Workflow

1. Read the brief's Requirement Manifest for the full active `R`/`RI` set.
2. For each ID, determine its current state from the artifact being written: `covered` (implemented and evidenced), `deferred` (explicitly pushed to a later phase or follow-up, with owner), `waived` (a valid waiver exists per `waiver-completeness-check`), or `dropped` (removed from scope — requires a waiver, otherwise this is a Refusal condition).
3. Record one ledger row per ID with state and a citation (file path, section, or command output reference).
4. Carry forward the ledger from the prior phase's artifact when extending rather than re-deriving it from scratch.
5. Report any ID with no row as a gap, not a silent omission.

## Exit Gate

- Every active `R`/`RI` has a ledger row with a state and a citation.
- No row is `dropped` without a waiver.
- The ledger is consistent with the prior phase's ledger (no state silently reverted without explanation).

## Determinism Rules

- Do not invent a state for an ID with no evidence — report it as a gap.
- Do not drop an ID from the ledger between phases; it must appear even if `dropped` or `waived`.
- Do not merge or collapse two IDs into one ledger row.

## Output

Follow `references/output-schema.md`.

Return: the full ledger table (ID, state, citation), any gaps found, and an overall pass/fail for the Exit Gate this skill was invoked from.
