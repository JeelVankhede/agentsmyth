---
name: restore-context
description: Power skill for reconstructing lifecycle state from artifacts, config, git state, blockers, and source references.
---

# Restore Context

## Purpose

Rebuild the current lifecycle state from durable evidence instead of chat memory.

This is a read-only power skill. It resolves slug/version, walks the artifact chain, reads orchestration state, checks blockers and coverage, inspects git state, summarizes external/source references, and recommends the next lifecycle action.

## Invocation Context

Use this skill when:

- resuming a lifecycle chain
- handling a user answer after a pause
- the user says "continue", "where were we", or names a slug/branch/artifact/source
- a phase needs to verify upstream state before proceeding
- the agent suspects local memory is stale or incomplete
- another skill invokes restore-context to verify an upstream artifact chain before proceeding

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
- `references/chain-walker.md` — to know how to walk the artifact chain

**Load when the step requires it**:
- `references/artifact-reader.md` — when reading individual lifecycle artifacts
- `references/git-walker.md` — when inspecting repository git state
- `references/source-of-truth-reader.md` — when the active chain references source-of-truth config
- `references/blocker-reader.md` — when extracting blockers from artifact frontmatter
- `references/summary-format.md` — when writing the restore summary

**On demand**:
- `workflow/config/*.yaml` files — only those referenced by the active chain being restored
- Existing lifecycle artifacts — only for candidate slug/version chains
- Repository files — only when artifact evidence identifies affected paths
- External source or PR/CI data — only when configured, referenced, and available through tools

## Inputs

- Slug/version, branch, artifact path, PR, issue, source item, ticket, or fuzzy feature reference.
- User's latest message, especially answers to blockers.
- Existing artifacts under `workflow/artifacts/**`.
- Current git state.
- Source-of-truth and release references from artifacts/config.

## Refusal / Stop Conditions

Stop with candidate summary instead of guessing when:

- no matching slug or artifact can be found
- multiple candidate chains are equally likely
- required upstream artifact links are broken
- current blockers cannot be resolved from the user's latest answer
- repository state cannot be inspected and the next phase depends on it
- external source or release state is required but unavailable and no blocked handoff exists

## Workflow

1. Resolve slug and version from explicit input, artifact paths, branch names, frontmatter, or search results.
2. Walk artifact chain: brief, plan, task, review, verify, ship, reflect.
3. Parse frontmatter and body status for each artifact.
4. Extract active manifest IDs, blockers, waivers, skipped checks, deferred requirements, and user checkpoints.
5. Compare manifest IDs across downstream artifacts to find coverage gaps.
6. Inspect git status for the repository and record unrelated or overlapping dirty state.
7. Read configured source-of-truth and release references without claiming external state unless evidence exists.
8. Identify inconsistencies: stale links, missing artifacts, mismatched next phase, missing evidence, dirty state, unresolved blockers, or blocked handoff gaps.
9. Recommend exactly one next action: lifecycle phase, `complete`, or `blocked`.
10. Return a concise restore summary.

## Exit Gate

- Slug/version resolution and confidence are explicit.
- Artifact chain is summarized even for missing artifacts.
- Current phase, status, next phase, blockers, and checkpoint are derived from evidence.
- Requirement coverage gaps are named.
- Git state is checked or marked not checked with reason.
- External/source/release state is not claimed without evidence.
- Recommended next action is actionable.
- No files are edited.

## Determinism Rules

- Never rely on chat memory alone.
- Prefer artifact frontmatter over filename inference.
- Prefer current git status over assumptions.
- Cite exact artifact paths and observed command results.
- Do not invent tickets, PRs, releases, source updates, package versions, SHAs, or CI results.
- Do not mutate artifacts while restoring context.

## Output Contract

Follow `references/output-schema.md`.

Return the context header, lifecycle chain, current state, requirement coverage, blockers, repo status, external/source context, learning context, inconsistencies, and recommended next action.

## Output

Same as Output Contract.
