---
name: evidence-auditor
description: Power skill that confirms every claim tagged as verified in a lifecycle artifact cites a resolvable evidence source.
---

# Evidence Auditor

## Purpose

For every claim in a lifecycle artifact that is tagged as verified, confirm a cited evidence source exists — command output, a file path, a review finding, or another artifact reference — and flag claims with no citation. Enforces `agent-behavior.yaml`'s `evidence_policy.no_external_claim_without_evidence`.

This is a power skill, not a lifecycle phase. It is gate-bound: it runs at Review, Test, Ship, and Reflect Exit Gates.

## Invocation Context

Use this skill when:

- Review is finalizing findings that assert something passed, failed, or was checked
- Test is recording verification outcomes
- Ship is aggregating evidence for a go/hold/blocked recommendation
- Reflect is describing what worked, what didn't, and outcomes

Do not invoke it for claims explicitly marked as opinion, recommendation, or open question — only claims asserted as fact or verified state are in scope.

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
- `references/citation-shapes.md` — what counts as a resolvable citation
- `workflow/agent-behavior.yaml` — `evidence_policy` block

**Load when the step requires it**:
- The artifact being audited, in full

## Inputs

- The lifecycle artifact (or draft) containing claims to audit.
- `agent-behavior.yaml`'s `evidence_policy`.

## Refusal / Stop Conditions

Stop or return a failed audit instead of approving when:

- a claim asserts command success with no current-turn output or cited artifact containing that output
- a claim asserts external state (PR merged, CI passed, deployment succeeded, source updated) with no tool output, artifact evidence, or user-provided proof
- a citation points to a file, path, or command that does not actually exist or was not actually run this session

## Workflow

1. Scan the artifact for claims phrased as verified fact: "passes," "confirmed," "works," "deployed," "merged," or an explicit outcome value (`pass`, `ship`, `covered`).
2. For each claim, locate its citation — a command block with output, a file path with a specific finding, or a reference to another artifact section.
3. Confirm the citation is resolvable: the command was actually run this session (not assumed), the file path exists, or the referenced artifact section actually contains the claimed content.
4. Flag any claim with no citation, or a citation that does not resolve, as a failure — do not downgrade it to a softer claim on the auditor's own authority; report it back to the phase for correction.

## Exit Gate

- Every claim tagged as verified carries a resolvable evidence citation.
- No claim of external state (PR, CI, release, source update) lacks tool output, artifact evidence, or user-provided proof.

## Determinism Rules

- Do not accept "should work" or "should have passed" as evidence.
- Do not manufacture a citation on the artifact author's behalf — report the gap.
- Do not treat a citation to prior-conversation memory (not re-verified this turn) as sufficient for a command-success claim.

## Output

Follow `references/output-schema.md`.

Return: count of claims audited, pass/fail per claim with the reason for any failure, and an overall pass/fail for the Exit Gate this skill was invoked from.
