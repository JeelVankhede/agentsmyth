---
name: lifecycle-think
description: Architect phase that converts a request into a brief with Requirement Manifest, assumptions, questions, and architecture notes.
phase: think
role: Architect
---

# Lifecycle: Think

## Purpose

Create or update a lifecycle brief for the repository. Think clarifies intent, extracts requirements, records assumptions, identifies blockers, and prepares the chain for Plan.

Think is a discovery and framing phase. It must make the work understandable without deciding policy for the user or jumping into implementation.

## Role

Act as Architect for the lifecycle chain.

- Translate user intent and source-of-truth context into clear scope.
- Separate explicit requirements from inferred repo, domain, source, release, and verification requirements.
- Identify assumptions and open decisions early enough that Plan can proceed without hidden guesses.
- Keep the output at the "what and why" level. Plan owns sequencing; Build owns code.

## Artifact Written Or Reviewed

Primary artifact:

```text
workflow/artifacts/briefs/<slug>-v<N>.md
```

Use the Starter Block in `references/output-schema.md` to create a new brief artifact.

## Required Upstream Artifacts

For a new request, no upstream lifecycle artifact is required.

For resumed or revised work, load the current slug chain first through `restore-context` and preserve existing manifest IDs. Create a new version when the request materially changes scope, acceptance criteria, source-of-truth handling, release behavior, or verification expectations.

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
- `references/role.md`

**Load when the step requires it**:
- `references/exemplar.md` — before finalizing output, to validate quality
- `references/requirement-discovery.md` — when deriving `RI` IDs from repo or config sources
- `references/assumption-policy.md` — when recording `A` IDs
- `references/question-policy.md` — when formulating blocking or non-blocking `Q` IDs
- `references/architecture-notes-guide.md` — when writing architecture notes
- `workflow/skills/waiver-completeness-check/SKILL.md` — when the brief records any waiver, to confirm it carries all 6 required fields

**On demand**:
- `workflow/config/domain.yaml` — when domain terminology, constraints, or non-goals affect scope
- `workflow/config/repo-profile.yaml` — when protected paths, generated outputs, or public contracts affect requirements
- `workflow/config/source-of-truth.yaml` — when source authority or handoff scope is unclear
- `workflow/config/verification.yaml` — when acceptance criteria or verification expectations are unclear
- `workflow/config/release.yaml` — when the request may affect deployment, publishing, rollout, or release
- Existing brief artifact — when revising a chain or resuming prior work
- Repository files — when needed to derive implicit requirements, contracts, protected paths, or verification constraints
- `workflow/skills/decompose-requirements/SKILL.md` — when the manifest needs creation or repair
- `workflow/skills/dispatch-subagents/SKILL.md` — only when explicitly authorized exploration splits into independent read-only topics

## Inputs

- User request or source-of-truth item.
- Existing brief when revising a chain.
- Repo/source context needed to derive implicit requirements.
- User answers to previously recorded `Q` IDs.

## Refusal / Stop Conditions

Stop and ask, or return a blocked brief, when any of these apply:

- The source-of-truth location or authority is required but unknown.
- The domain rule, non-goal, protected path, release expectation, or verification expectation would change scope and is unclear.
- The user request conflicts with configured repo/domain constraints and no waiver is provided.
- A material decision would require inventing product policy, external tracking state, release status, commands, or ownership.
- Existing manifest IDs would need renumbering to continue in the same version.
- The request is actually orchestration across multiple repositories. Record it as out of scope unless the user explicitly narrows it to the repository.

## Workflow

1. Classify task as Trivial, Standard, or Complex.
2. Determine slug and version. Reuse the active slug where possible; bump version for material scope change.
3. Inspect available source, repo, and config context before asking questions.
4. Extract explicit requirements as `R` IDs.
5. Derive implicit requirements as `RI` IDs from repo contracts, domain config, source-of-truth expectations, compatibility, generated output, verification, release, and safety.
6. Record assumptions as `A` IDs only when proceeding is safe.
7. Record open decisions as `Q` IDs. Copy blocking `Q` IDs into `orchestration.blockers`.
8. Define concrete acceptance criteria for every active `R` and `RI`.
9. Add architecture notes covering role, decisions, constraints, tradeoffs, assumptions, and downstream impact.
10. Write or update `workflow/artifacts/briefs/<slug>-v<N>.md`.
11. Set `orchestration.status` to `blocked-for-user` when questions remain, otherwise `ready-for-next-phase` with `next_phase: plan`.

## Architecture Notes Expectations

The brief must include architecture notes when any decision, constraint, tradeoff, assumption, or downstream impact affects Plan or later phases.

Use the `## Architecture Notes` section in the brief body to capture at minimum:

- role: `Architect`
- decisions made during scoping
- constraints from config, source-of-truth, repo structure, or user instruction
- tradeoffs considered and rejected
- assumptions that Plan must verify or preserve
- downstream impact on Plan, Build, Review, Test, Ship, or Reflect

## Exit Gate

- Goal, scope, and non-goals are concrete.
- Requirement Manifest contains R IDs for Standard/Complex work.
- Every R/RI has testable acceptance criteria.
- Open questions are answered, deferred with owner, or listed as blockers.
- Architecture notes capture decisions and downstream impact.
- `orchestration.phase` is `think`, `orchestration.status` is accurate, and `next_phase` is `plan` when unblocked.
- The user has approved the brief or the artifact records an explicit waiver before Plan begins.
- Any waiver recorded in the brief passes `waiver-completeness-check` (all 6 required fields present).

## Determinism Rules

- Do not decide product/domain policy for the user.
- Do not renumber existing R/RI/A/Q IDs after downstream artifacts exist.
- Do not hide assumptions in prose; use `A` IDs.
- Do not continue to Plan with unresolved blocking `Q` IDs unless the user accepts a waiver recorded in the brief.
- Do not implement code, run release steps, update external trackers, or claim verification in Think.
- Do not copy reference-repo domain language into canonical artifacts.

## Output

Follow `references/output-schema.md`.

The user-facing response must include the brief artifact path, manifest summary, blockers or waivers, and whether Plan may start.
