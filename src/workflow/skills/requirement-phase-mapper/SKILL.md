---
name: requirement-phase-mapper
description: Power skill that maps every active R/RI to exactly one build phase with a binary exit gate, flagging orphans and duplicates.
---

# Requirement Phase Mapper

## Purpose

Map every active `R`/`RI` manifest ID to exactly one Plan phase with a binary exit gate; flag any ID with no phase (an orphan) or more than one phase (a duplicate). Prevents a requirement from silently falling through Plan's own phase breakdown.

This is a power skill, not a lifecycle phase. It is gate-bound: it runs at every Plan Exit Gate.

## Invocation Context

Use this skill when:

- Plan is about to finalize its `## Phases` section and set `orchestration.status: ready-for-next-phase`
- a plan revision changes which phase covers which manifest IDs

Do not invoke it before the brief's Requirement Manifest and at least one Plan phase both exist.

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
- `references/mapping-method.md` — how phase coverage is determined from a plan's `## Phases` section
- The brief's Requirement Manifest (source of the active `R`/`RI` set)
- The plan's `## Phases` section, in full

## Inputs

- Active `R`/`RI` IDs from the brief.
- The plan's `## Phases` section.

## Refusal / Stop Conditions

Stop or return a failed mapping instead of approving when:

- an active `R`/`RI` ID appears in no phase's stated manifest IDs, and no phase lists a hyphenated sub-label of it (e.g. `RI5-a` covers base `RI5` — a legitimate per-phase decomposition, not an orphan)
- a phase declares manifest IDs but has no binary exit gate

An ID cited by multiple phases is not, by itself, a defect — real plans commonly and legitimately spread a cross-cutting ID (e.g. a full-suite verification gate) across every phase with no separate annotation required. Distinguishing that from a genuine accidental duplicate is a semantic judgment call this skill does not attempt to make mechanically; a human/agent reviewing the plan is better positioned to catch an actual copy-paste mistake than a structural pattern match.

## Workflow

1. Read the brief's Requirement Manifest for the full active `R`/`RI` set.
2. Read every `### Phase N` block's stated `**Manifest IDs:**` line.
3. Build the bijection: each ID should map to exactly one phase, unless explicitly noted as
   cross-cutting.
4. Confirm every phase with manifest IDs has an `**Exit gate:**` line stating an observable,
   binary condition — not vague language like "done" or "works."
5. Report any orphan, duplicate, or vague-exit-gate phase as a gap.

## Exit Gate

- No active `R`/`RI` is an orphan (uncovered by any phase, directly or via a hyphenated sub-label).
- Every phase with manifest IDs has a binary, falsifiable exit gate.

## Determinism Rules

- Do not invent a phase mapping for an orphan ID — report it as a gap for Plan to resolve.
- Do not accept "cross-cutting" as an explanation unless the plan text actually says so.
- Do not treat a subjective exit gate ("looks right", "seems complete") as binary.

## Output

Follow `references/output-schema.md`.

Return: the full R/RI → phase mapping, any orphans/duplicates/vague-exit-gates found, and an overall pass/fail for the Exit Gate this skill was invoked from.
