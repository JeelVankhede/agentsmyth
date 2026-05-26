# Phase 3 Skill Contracts Plan

## Purpose

Phase 3 rewrites the placeholder lifecycle and power skills into generic, single-repo workflow playbooks.

This phase turns the scaffold from Phase 2 into an executable instruction contract for AI agents, while still avoiding artifact template implementation, validators, examples, and adapter-specific behavior.

## Source Inputs

- `docs/migration-from-reference-workspace.md`
- `docs/phase-2-scaffold-plan.md`
- Reference lifecycle skills from `JeelVankhede/ai-recipes-workspace`
- Current placeholder skill folders under `.workflow/skills/`

## Scope

Rewrite these skill files and their supporting references:

```text
.workflow/skills/lifecycle-orchestrator/
.workflow/skills/lifecycle-think/
.workflow/skills/lifecycle-plan/
.workflow/skills/lifecycle-build/
.workflow/skills/lifecycle-review/
.workflow/skills/lifecycle-test/
.workflow/skills/lifecycle-ship/
.workflow/skills/lifecycle-reflect/
.workflow/skills/decompose-requirements/
.workflow/skills/restore-context/
.workflow/skills/dispatch-subagents/
```

## Non-Goals

- Do not finalize artifact templates in `.workflow/templates/`.
- Do not implement `.workflow/validators/*.mjs`.
- Do not write adapter-specific behavior beyond generic references.
- Do not create real examples.
- Do not reintroduce workspace or multi-repo assumptions.
- Do not copy AI Recipes domain language into canonical files.

## Required Skill File Contract

Every `SKILL.md` must include:

```text
Purpose
Context Loading
Inputs
Refusal / Stop Conditions
Workflow
Exit Gate
Determinism Rules
Output
```

Phase skills must also include:

```text
Role
Artifact written or reviewed
Required upstream artifacts
Required config files
Architecture notes expectations
```

Power skills must include:

```text
Invocation context
Inputs
Workflow
Refusal conditions
Output contract
```

## Required Generic Runtime Rules

All skills must follow these rules:

- Use `.workflow/` as canonical workflow source.
- Use `.workflow/config/*.yaml` for repo/domain/source/release/verification context.
- Use `.workflow/artifacts/**` for lifecycle outputs.
- Preserve a single-target-repo model.
- Ask or block when source-of-truth, release, verification, or domain policy is unclear.
- Treat the AI agent as executor/advisor, not decision authority.
- Record evidence before claiming progress.
- Preserve unrelated user changes.
- Do not invent commands, tickets, PRs, releases, or external updates.

## Required Phase Responsibilities

| Skill | Responsibility |
|---|---|
| `lifecycle-orchestrator` | Route the lifecycle, restore context, pause/resume, and enforce no skipped Standard/Complex phases without waiver. |
| `lifecycle-think` | Convert a request into a brief with Requirement Manifest, assumptions, questions, and architecture notes. |
| `lifecycle-plan` | Convert approved brief into requirement-mapped execution phases, risks, verification plan, branch/source-of-truth strategy. |
| `lifecycle-build` | Execute exactly one approved plan phase at a time, preserve unrelated changes, and update task evidence. |
| `lifecycle-review` | Produce durable review findings, requirement coverage, verification review, residual risk, and recommendation. |
| `lifecycle-test` | Produce verification evidence per R/RI using configured commands, manual QA, generated-output checks, and skipped-check risk. |
| `lifecycle-ship` | Gate release readiness, source-of-truth handoff, PR/CI state when configured, rollback, and waiver handling. |
| `lifecycle-reflect` | Capture outcome, coverage retrospective, learning candidates, follow-ups, and raw learning session. |
| `decompose-requirements` | Create/backfill R/RI/A/Q Requirement Manifest entries without renumbering or hiding assumptions. |
| `restore-context` | Resolve slug/version and rebuild current lifecycle state from artifacts, config, git state, and blockers. |
| `dispatch-subagents` | Define safe optional delegation rules, caps, independence checks, and dispatch logging. |

## Reference Rewrite Groups

### Group A - Orchestrator

```text
.workflow/skills/lifecycle-orchestrator/SKILL.md
.workflow/skills/lifecycle-orchestrator/references/*
```

Output: generic lifecycle state machine and pause/resume contract.

### Group B - Think / Plan

```text
.workflow/skills/lifecycle-think/**
.workflow/skills/lifecycle-plan/**
```

Output: upstream requirement and planning contracts.

### Group C - Build / Review / Test

```text
.workflow/skills/lifecycle-build/**
.workflow/skills/lifecycle-review/**
.workflow/skills/lifecycle-test/**
```

Output: execution, review, and evidence contracts.

### Group D - Ship / Reflect

```text
.workflow/skills/lifecycle-ship/**
.workflow/skills/lifecycle-reflect/**
```

Output: release, handoff, retrospective, and learning contracts.

### Group E - Power Skills

```text
.workflow/skills/decompose-requirements/**
.workflow/skills/restore-context/**
.workflow/skills/dispatch-subagents/**
```

Output: reusable support skills for manifest creation, context recovery, and safe delegation.

## Recommended PR Strategy

Use separate PRs after this plan to keep review quality high:

```text
PR 3A: Orchestrator and shared lifecycle references
PR 3B: Think and Plan
PR 3C: Build, Review, and Test
PR 3D: Ship and Reflect
PR 3E: Power skills
```

Each PR should update only its skill group and must not modify artifact templates unless explicitly approved.

## Acceptance Criteria

Phase 3 is complete when:

- Every skill placeholder has been replaced by usable generic instructions.
- Every skill reference placeholder has meaningful generic content.
- All lifecycle skills point to `.workflow/config/*.yaml`, `.workflow/templates/**`, and `.workflow/artifacts/**` where relevant.
- Review is durable and writes `.workflow/artifacts/reviews/<slug>-v<N>.md`.
- No workspace, multi-repo, AI Recipes, or Codex-only assumptions remain in canonical skill files.
- Every phase has explicit stop/refusal conditions and exit gates.
- Every phase requires architecture notes where role/technical decisions matter.
- Power skills support the lifecycle without becoming phase owners.

## Phase 3 Output

The final output of Phase 3 is a generic skill contract layer. It should be ready for Phase 4 artifact template implementation.
