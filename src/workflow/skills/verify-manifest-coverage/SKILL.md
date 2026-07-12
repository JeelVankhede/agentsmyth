---
name: verify-manifest-coverage
description: Power skill that cross-checks a review artifact's declared manifest_ids against the actual diff scope, catching scope creep before Ship.
---

# Verify Manifest Coverage

## Purpose

Cross-check a Review artifact's declared `manifest_ids` against the actual diff it is reviewing. Catches scope creep at Review — before it reaches Ship — rather than discovering the mismatch after release.

This is a power skill, not a lifecycle phase. It is gate-bound: it runs at every Review Exit Gate.

## Invocation Context

Use this skill when:

- Review is finalizing its findings and about to set `manifest_ids` in its own frontmatter
- Review needs to confirm the diff it examined actually corresponds to the IDs it is claiming coverage for

Do not invoke it before Review has an actual diff to compare against (i.e., not during Think or Plan).

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
- `references/coverage-comparison.md` — how to derive the diff's actual manifest coverage from the task artifact's `Changed Files` section
- The task artifact's `Changed Files` section (each entry already carries manifest IDs per Build's own contract)
- The review artifact's declared `manifest_ids`

## Inputs

- The task artifact's `Changed Files` section (file → manifest IDs mapping from Build).
- The review artifact's declared `manifest_ids` in frontmatter.
- The actual diff (via `git diff` or the task artifact's file list) when a fresh cross-check against real changes is warranted.

## Refusal / Stop Conditions

Stop or return a failed check instead of approving when:

- the review artifact's `manifest_ids` includes an ID with no corresponding changed file in the task artifact
- a changed file in the task artifact carries a manifest ID absent from the review artifact's `manifest_ids`
- the task artifact's `Changed Files` section is missing or does not map files to manifest IDs at all

## Workflow

1. Read the task artifact's `Changed Files` section in full — build the set of manifest IDs actually touched by the diff.
2. Read the review artifact's declared `manifest_ids`.
3. Compare the two sets: every ID in one set must appear in the other.
4. Report any delta — an ID declared but not actually touched, or an ID touched but not declared — as a mismatch requiring explanation, not a silent pass.
5. A delta may be legitimate (e.g. a file touched for a documentation-only reason unrelated to any manifest ID) — but it must be explained in the review artifact, not just present.

## Exit Gate

- Declared manifest coverage in the review artifact equals observed diff coverage from the task artifact.
- Any delta between the two is explicitly explained in the review artifact, not silently absent.

## Determinism Rules

- Do not add or remove manifest IDs from the review artifact on this skill's own authority — report the delta back to Review for a human/agent decision.
- Do not treat "close enough" as a pass — the comparison is exact-set, not fuzzy.
- Do not skip this check because the diff "looks small."

## Output

Follow `references/output-schema.md`.

Return: the task-derived coverage set, the review-declared coverage set, any deltas found, and an overall pass/fail for the Exit Gate this skill was invoked from.
