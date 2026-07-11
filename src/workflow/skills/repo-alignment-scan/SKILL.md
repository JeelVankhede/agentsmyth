---
name: repo-alignment-scan
description: Power skill that explores the actual repo and stack before framing, surfacing where a requirement is misaligned with existing conventions.
---

# Repo Alignment Scan

## Purpose

Digest the requirement, explore the actual repository (conventions, stack, existing patterns), and surface where the requirement is misaligned with what already exists — before Think finishes framing it. Prevents a plan from being built on an assumed architecture that the real repo already contradicts.

This is a power skill, not a lifecycle phase. It is passive/scored: the agent evaluates the trigger predicate against recorded signals and decides whether to run it, recording that decision.

## Invocation Context

Use this skill when the recorded `skill_scoring` trigger for `repo-alignment-scan` evaluates true:
`complexity_score >= 40 OR new_surface OR task_class != trivial`.

Do not invoke it for Trivial work with no new surface and a low complexity score — the trigger predicate itself should evaluate false, and Think should record a `skipped` decision with that reason rather than running the skill anyway.

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
- `references/scan-method.md` — what "the actual repo" means to inspect and how to compare it against the requirement
- `workflow/config/repo-profile.yaml` — protected paths, public contracts, generated outputs
- The requirement as framed so far (brief draft or user request)

## Inputs

- The requirement text (user request or in-progress brief draft).
- Real repo state: directory structure, existing naming conventions, existing similar features, `repo-profile.yaml`.

## Refusal / Stop Conditions

Stop and report the misalignment as an `A`/`Q` entry instead of silently proceeding when:

- the requirement names a pattern, library, or structure that does not exist anywhere in the repo
- the requirement's implied file locations conflict with `repo-profile.yaml`'s documented roots
- the requirement would introduce a second, competing convention for something the repo already does one way

## Workflow

1. Read the requirement as currently framed.
2. Inspect the real repo: search for existing instances of the same kind of work (similar features, similar file types, similar naming), read `repo-profile.yaml` for documented roots and conventions.
3. Compare the requirement's implicit assumptions against what was actually found.
4. For each misalignment found, record it as an `A` (if resolvable by evidence) or `Q` (if it needs a user decision) entry, per `assumption-policy.md`'s existing Think-phase convention — never silently reconcile it without recording that reconciliation happened.
5. Report a list of concrete repo surfaces the requirement maps to (real file paths or directories), not abstract categories.

## Exit Gate

- The requirement is mapped to concrete, real repo surfaces (file paths or directories), not abstract descriptions.
- Every misalignment found is recorded as an `A` or `Q` entry — none are silently absorbed into the brief's prose without a citation trail.

## Determinism Rules

- Do not infer repo conventions from the requirement's own wording — inspect the actual repo files.
- Do not report "no misalignment found" without having actually searched for existing instances of the same kind of work.
- Do not silently pick one of two competing conventions — surface it as a `Q` for the user unless one is clearly deprecated (with evidence).

## Output

Follow `references/output-schema.md`.

Return: the requirement mapped to concrete repo surfaces, any misalignments found as `A`/`Q` entries, and the `skill_trigger_log` entry recording this run's decision and reason.
