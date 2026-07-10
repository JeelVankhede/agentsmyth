---
name: waiver-completeness-check
description: Power skill that validates every claimed waiver in a lifecycle artifact carries all 6 required fields and does not waive false evidence.
---

# Waiver Completeness Check

## Purpose

Confirm that every waiver claimed in a lifecycle artifact carries all 6 fields required by `agent-behavior.yaml`'s `waivers.required_fields` (`waived_gate_or_requirement_id`, `reason`, `residual_risk`, `owner`, `follow_up_action`, `approval_evidence`), and that no waiver attempts to waive false evidence (`waivers.cannot_waive_false_evidence`).

This is a power skill, not a lifecycle phase. It is gate-bound: it runs at every phase Exit Gate where a `waivers` block is present in the artifact, without exception.

## Invocation Context

Use this skill when:

- an artifact's frontmatter or body contains a `waivers` block
- a phase's Exit Gate is about to be evaluated and the artifact claims any waiver, skip, or exception
- Review, Test, or Ship encounters a chat-stated waiver that has not yet been written into an artifact's `waivers` block

Do not invoke it when no waiver is claimed anywhere in the artifact — an artifact with an empty or absent `waivers` block passes trivially without running the check.

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
- `references/field-checklist.md` — the 6 required fields and what counts as non-empty for each
- `workflow/agent-behavior.yaml` — `waivers.required_fields` and `waivers.cannot_waive_false_evidence`

**Load when the step requires it**:
- The artifact being checked, in full — never rely on a paraphrase of its waiver content

## Inputs

- The lifecycle artifact (or draft) containing one or more claimed waivers.
- `agent-behavior.yaml`'s `waivers` block.

## Refusal / Stop Conditions

Stop or return a failed check instead of approving when:

- a waiver is referenced in the artifact body or conversation but does not appear as a structured entry in the `waivers` block
- any of the 6 required fields is missing, empty, or a placeholder (e.g. `TBD`, `N/A` used to dodge the field rather than state a real reason)
- `approval_evidence` cites no user or configured decision owner
- a waiver's `reason` or `residual_risk` attempts to characterize evidence that is known false as if it were true (this is refused outright, not waived — `cannot_waive_false_evidence`)

## Workflow

1. Locate every waiver claim in the artifact: structured `waivers` block entries first, then scan body prose for waiver language not yet captured structurally.
2. For each structured waiver entry, confirm all 6 required fields are present and non-empty per `references/field-checklist.md`.
3. For each prose-only waiver claim with no structured entry, flag it as incomplete — it does not count as an existing waiver per `router.md`'s Pre-Action Gate ("reject chat-only waivers").
4. Confirm no waiver's `reason`/`residual_risk` masks false evidence.
5. Report pass/fail per waiver, citing the artifact path and the specific missing field(s) on failure.

## Exit Gate

- No waiver in the artifact is missing a required field.
- No waiver exists only in prose without a structured `waivers` block entry.
- No waiver attempts to waive false evidence.

## Determinism Rules

- Do not invent a waiver's missing field value — report it missing, do not infer or default it.
- Do not treat a chat-stated waiver as satisfying this check until it is written into the artifact's `waivers` block.
- Do not approve a waiver whose `approval_evidence` does not name a real approver from `waivers.approvers`.

## Output

Follow `references/output-schema.md`.

Return: artifact path, count of waivers checked, pass/fail per waiver with the specific field(s) failed, and an overall pass/fail for the Exit Gate this skill was invoked from.
