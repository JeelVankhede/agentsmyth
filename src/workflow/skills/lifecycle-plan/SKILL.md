---
name: lifecycle-plan
description: Principal Engineer phase that turns an approved brief into a requirement-mapped execution plan for the repository.
phase: plan
role: Principal Engineer
---

# Lifecycle: Plan

## Purpose

Convert an approved brief into an implementation plan that maps every R/RI to phases, risks, verification evidence, branch strategy, and source-of-truth handling.

Plan is a decision-complete execution design for the repository. It must be specific enough for Build, Review, Test, Ship, and Reflect to proceed without re-discovering requirements or inventing policy.

## Role

Act as Principal Engineer for the lifecycle chain.

- Validate that the brief is approved or explicitly waived.
- Convert manifest requirements into ordered implementation phases.
- Ground the plan in actual repo/config/source context before naming touches or commands.
- Keep code-level implementation details out of Plan unless needed to define a contract, migration boundary, or risk.

## Artifact Written Or Reviewed

Primary artifact:

```text
workflow/artifacts/plans/<slug>-v<N>.md
```

Use the Starter Block in `references/output-schema.md` to create a new plan artifact.

## Required Upstream Artifacts

Required:

- `workflow/artifacts/briefs/<slug>-v<N>.md`
- Requirement Manifest containing active `R` and `RI` IDs.
- Brief approval, explicit waiver, or recorded user checkpoint that allows planning.

Refuse to proceed when the brief is missing, has unresolved blocking `Q` IDs, lacks acceptance criteria for active `R`/`RI` IDs, or would require renumbering existing manifest IDs.

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
- The approved brief artifact
- `workflow/agent-behavior.yaml`
- `workflow/config/repo-profile.yaml`

**Load when the step requires it**:
- `references/exemplar.md` — before finalizing output, to validate quality
- `references/repo-impact-map.md` — when mapping affected repository surfaces
- `references/dependency-ordering.md` — when sequencing implementation phases
- `references/risk-register.md` — when recording risks
- `references/verification-planning.md` — when building the verification plan
- `references/branch-policy.md` — when defining branch and commit strategy
- `references/source-of-truth-planning.md` — when source-of-truth handling is required
- `workflow/config/verification.yaml` — when building the verification plan
- `workflow/config/source-of-truth.yaml` — when source authority or handoff affects planning

**On demand**:
- `workflow/config/domain.yaml` — when domain terminology, constraints, or risks affect implementation
- `workflow/config/release.yaml` — when deployment, publishing, rollout, external handoff, PR, or CI gates are in scope
- Repository files — when needed to identify affected surfaces, contracts, generated output, protected paths, dependencies, or available commands
- Existing plan/task/review/verify/ship/reflect artifacts — when revising an existing chain
- `workflow/skills/dispatch-subagents/SKILL.md` — only when explicitly authorized parallel exploration of independent topics

## Inputs

- Approved brief artifact.
- Requirement Manifest R/RI/A/Q IDs.
- Repo/profile/config/source-of-truth context.
- User answers resolving Plan blockers.

## Refusal / Stop Conditions

Stop and ask, or return a blocked plan, when any of these apply:

- Phase gate check exits non-zero: run `agentsmyth check --phase plan --slug <active-slug>` at entry — stop immediately, do not proceed with a caveat.
- The upstream brief is missing, unapproved, or has no Requirement Manifest.
- Any active `R` or `RI` lacks acceptance criteria.
- Any active `R` or `RI` cannot be mapped to a plan phase.
- Required source-of-truth update location, branch policy, release policy, protected path policy, or verification command is unknown.
- Repo inspection is insufficient to name affected surfaces, commands, generated outputs, or public contracts.
- The plan would require orchestration across multiple repositories instead of a single repository.
- A risk has no mitigation and no explicit user waiver.

## Workflow

1. Verify the brief exists and is approved or explicitly waived.
2. Parse active `R`, `RI`, `A`, and `Q` IDs without renumbering.
3. Inspect repository state, config files, and source-of-truth items before naming touches, commands, branch strategy, generated output, or release impact.
4. Build the repository impact map.
5. Map every active `R` and `RI` to one or more plan phases and exactly one owning phase for completion.
6. Order phases by dependency, risk, contract boundaries, generated output, verification needs, docs/source updates, and release/handoff.
7. Define branch and commit strategy for the repository.
8. Write a source-of-truth strategy: read source, update target, blocked handoff, or explicit waiver.
9. Build a verification plan from `workflow/config/verification.yaml`; every `R`/`RI` must have evidence or a waiver.
10. Record risks with likelihood, impact, mitigation, owner, and affected manifest IDs.
11. Add architecture notes with planning decisions, constraints, tradeoffs, assumptions, and downstream impact.
12. Write or update `workflow/artifacts/plans/<slug>-v<N>.md`.
13. Set `orchestration.status` to `blocked-for-user` when questions or approval remain, otherwise `ready-for-next-phase` with `next_phase: build`.

## Architecture Notes Expectations

The plan must include architecture notes when a technical or process decision affects later phases.

Use the frontmatter `architecture_notes` block when the artifact schema supports it, and mirror longer explanation in the plan body. At minimum, capture:

- role: `Principal Engineer`
- decisions that shape the implementation sequence
- constraints from repo profile, domain config, source-of-truth config, verification config, and release config
- tradeoffs and alternatives considered
- assumptions Build/Test/Ship must preserve or verify
- downstream impact on task execution, review focus, verification evidence, release readiness, and reflection

## Exit Gate

- Every active R/RI is mapped to at least one phase and has one owning completion phase.
- Every phase has a binary exit gate.
- Dependency order is explicit.
- Risks have mitigation.
- Verification plan covers every R/RI.
- Source-of-truth and release handling are explicit.
- User approved the plan or accepted a waiver.
- Branch strategy is explicit and does not target the default branch unless the user approved that exception.
- `orchestration.phase` is `plan`, `orchestration.status` is accurate, and `next_phase` is `build` when unblocked.

## Determinism Rules

- Do not prescribe code bodies in Plan.
- Do not invent commands, releases, PRs, tickets, CI state, or external updates.
- Do not hide requirements inside phase prose; cite manifest IDs.
- Do not create phases with no manifest IDs.
- Do not write a phase exit gate that is subjective or un-falsifiable — every gate must be an observable binary condition that passes or does not.
- Do not use vague verification such as "test it"; name command, manual QA, generated-output check, source-of-truth check, review evidence, or waiver.
- Keep the plan scoped to the repository.
- Do not put Ship-owned work such as PR readiness, CI status, release, or source-of-truth publication into Build unless the user explicitly approved that lifecycle exception.

## Output

Follow `references/output-schema.md`.

The user-facing response must include the plan artifact path, phase summary, blockers or waivers, and whether Build may start.
