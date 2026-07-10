---
name: plan-assumption-verifier
description: Power skill that cross-verifies each planning assumption against concrete repo evidence, converting unresolved ones into raised blocking questions.
---

# Plan Assumption Verifier

## Purpose

For each assumption (`A` ID) carried into Plan from the brief, confirm it is backed by concrete repo evidence. Where evidence is absent, convert it into a raised blocking question (`Q` ID, mirrored into `orchestration.blockers`) rather than letting it remain a silent, unverified assumption. Prevents a plan from being built on an assumption nobody actually checked.

This is a power skill, not a lifecycle phase. It is active/gate-bound: invoked during Plan's workflow, and its result gates Plan's Exit Gate.

## Invocation Context

Use this skill when:

- Plan is processing the brief's `A` IDs while writing its own artifact
- a Plan revision introduces a new assumption

Do not invoke it for a plan with zero carried-over assumptions — nothing to verify.

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
- `references/evidence-standards.md` — what counts as sufficient evidence for an assumption
- The brief's Requirement Manifest `A` and `Q` sections
- `workflow/config/repo-profile.yaml` — for path/contract-based assumption checks

## Inputs

- The brief's `A` IDs.
- Repo state relevant to each assumption's claim.

## Refusal / Stop Conditions

Stop and raise a `Q` ID instead of silently proceeding when:

- an assumption cannot be confirmed by direct repo inspection (file existence, config value, command output)
- an assumption concerns user-authority policy that inspection cannot resolve (per `assumption-policy.md`'s existing Think-phase rule: user-authority decisions never count as safe assumptions)

## Workflow

1. Read every `A` ID from the brief's Requirement Manifest.
2. For each, determine what concrete evidence would confirm or refute it (a file path, a config
   value, a command's real output).
3. Gather that evidence via direct inspection this session — not recalled from earlier conversation.
4. If evidence confirms the assumption: record the citation, mark it evidence-backed.
5. If evidence is unavailable or contradicts the assumption: convert it into a new `Q` ID (owner:
   user or a named repo authority), and mirror it into `orchestration.blockers` if it would change
   Plan's scope or approach.
6. Write the `## Assumptions Verified` table into the plan artifact — one row per brief `A` ID, per
   `references/output-schema.md`. Omit the section entirely when there are zero brief `A` IDs.

## Exit Gate

- Every `A` ID is either evidence-backed (with a citation) or converted to a raised `Q` ID.
- No silent, unverified assumption remains in the plan.

## Determinism Rules

- Do not mark an assumption evidence-backed without citing the specific evidence found this
  session.
- Do not silently drop an assumption that turns out to be wrong — convert it to a `Q` ID and
  explain why.
- Do not invent evidence that was not actually inspected.

## Output

Follow `references/output-schema.md`.

Return: per-A-id status (evidence-backed with citation, or raised-as-question with the new Q ID), and an overall pass/fail for the Exit Gate this skill was invoked from.
