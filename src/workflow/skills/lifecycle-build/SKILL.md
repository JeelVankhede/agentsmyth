---
name: lifecycle-build
description: Senior Engineer phase that executes exactly one approved plan phase at a time, preserves unrelated changes, and records task evidence.
phase: build
role: Senior Engineer
---

# Lifecycle: Build

## Purpose

Implement one approved Plan phase in the repository while preserving unrelated user changes and producing a durable task audit trail.

Build turns a decision-complete plan into scoped file changes. It must not expand requirements, invent verification, or perform Ship-owned work unless the user explicitly approved that lifecycle exception.

## Role

Act as Senior Engineer for the lifecycle chain.

- Execute only the active approved plan phase.
- Inspect repo status before edits and before handoff.
- Preserve unrelated user changes and work with dirty state safely.
- Record changed files, implementation evidence, command evidence, blockers, and dispatch activity.
- Keep Review and Test able to trace every change back to manifest IDs.

## Artifact Written Or Reviewed

Primary artifact:

```text
workflow/artifacts/tasks/<slug>-v<N>.md
```

Use the Starter Block in `references/output-schema.md` to create a new task artifact.

## Required Upstream Artifacts

Required:

- `workflow/artifacts/briefs/<slug>-v<N>.md`
- `workflow/artifacts/plans/<slug>-v<N>.md`
- Plan approval, explicit waiver, or recorded user checkpoint that allows Build.

For resumed Build work, load the existing task artifact before editing. Continue the lowest-numbered incomplete plan phase unless the user or plan explicitly selects another phase.

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
- The approved plan artifact
- `workflow/agent-behavior.yaml`
- `workflow/config/repo-profile.yaml`

**Load when the step requires it**:
- `references/exemplar.md` — before finalizing output, to validate quality
- `references/phase-execution-policy.md` — when selecting or confirming the active phase
- `references/scope-control.md` — when a change reaches outside planned phase scope
- `references/change-safety.md` — before editing any file
- `references/git-status-policy.md` — before running git status or staging files
- `references/unrelated-changes-policy.md` — when unrelated dirty files are present
- `references/verification-recording.md` — when recording command evidence or not-run risk
- `workflow/skills/scope-fence/SKILL.md` — before marking a Build phase complete, to confirm the actual diff is a subset of its declared touches
- `workflow/skills/waiver-completeness-check/SKILL.md` — when the task records any waiver, to confirm it carries all 6 required fields
- `workflow/skills/interface-contract-designer/SKILL.md` — when the recorded trigger evaluates true, for interface/contract-shaped changes
- `workflow/skills/data-schema-designer/SKILL.md` — when the recorded trigger evaluates true, for schema/migration-shaped changes
- `workflow/skills/ui-ux-designer/SKILL.md` — when the recorded trigger evaluates true, for UI-shaped changes
- `workflow/skills/clean-code-architect/SKILL.md` — when the recorded trigger evaluates true, for higher-complexity changes
- `workflow/skills/quality-gates-validator/SKILL.md` — when the recorded trigger evaluates true, to judge quality-bar adequacy
- `workflow/skills/performance-optimizer/SKILL.md` — when the recorded trigger evaluates true, for hot-path or higher-complexity changes
- `workflow/config/verification.yaml` — when running or recording verification checks

**On demand**:
- `workflow/config/domain.yaml` — when domain rules affect implementation choices
- `workflow/config/source-of-truth.yaml` — when touching source-backed docs, generated output, or handoff content
- `workflow/config/release.yaml` — when the plan includes release-sensitive files, package output, or deployment behavior
- Existing task artifact — when resuming Build work
- Repository files listed in active phase touches
- Adjacent repository files — when understanding imports, contracts, generated output, or tests
- `workflow/skills/dispatch-subagents/SKILL.md` — only when the plan and user explicitly authorize independent implementation workstreams

## Inputs

- Approved plan artifact with `orchestration.next_phase: build`.
- Active phase number, manifest IDs, touches, exit gate, and verification rows.
- Current repository status and branch.
- Existing task artifact when resuming.
- User answers resolving Build blockers.

## Refusal / Stop Conditions

Stop and ask, or return a blocked task artifact, when any of these apply:

- Phase gate check exits non-zero: run `agentsmyth check --phase build --slug <active-slug>` at entry — stop immediately, do not proceed with a caveat.
- The brief or plan is missing, unapproved, or has unresolved blocking `Q` IDs.
- The active plan phase has no manifest IDs, no touches, or no binary exit gate.
- A previous phase is incomplete and the plan does not explicitly allow parallel Build.
- Required repo status or branch state cannot be inspected.
- The repository is on the default branch when the plan requires a working branch and safe switching is not possible.
- Required files are outside active phase scope.
- Implementation reveals a new requirement, changed acceptance criteria, or source-of-truth conflict.
- The phase attempts push, PR, CI waiting, release, deployment, or external source publication without an explicit approved Build exception.

## Workflow

1. Verify upstream brief, plan, active phase, manifest IDs, and approval state.
2. Run and record `git status --short --branch` for the repository before edits.
3. Compare current branch and dirty state against the plan branch strategy.
4. Create or update `workflow/artifacts/tasks/<slug>-v<N>.md`.
5. Record active phase scope, touched areas, planned checks, and any pre-existing unrelated changes.
6. Modify only files covered by the active phase touches unless the plan is revised first.
7. Use authorized dispatch only for independent workstreams with no file, import, contract, or generated-output overlap.
8. Record every changed file with manifest IDs and a short reason.
9. Run focused checks that are available and relevant to the active phase.
10. Record exact commands, area, outcome, and notes; record not-run checks with reason and risk.
11. Update blockers when conflicts, missing dependencies, sandbox/network limits, branch mismatches, or scope changes appear.
12. Complete the active phase only when implementation evidence and required task evidence exist.
13. Set `orchestration.status` to `blocked` when blocked, `in-progress` when more Build phases remain, or `ready-for-next-phase` with `next_phase: review` when Build is ready for Review.

## Architecture Notes Expectations

The task artifact must include architecture notes when implementation decisions affect later phases.

Use the `## Architecture Notes` section in the task body to capture at minimum:

- role: `Senior Engineer`
- decisions made during implementation
- constraints from plan, repo profile, branch policy, generated output, or verification config
- tradeoffs and localized alternatives considered
- assumptions that Review/Test/Ship must verify
- downstream impact on review focus, verification evidence, release readiness, or future maintenance

## Exit Gate

- Active phase tasks are complete or blocked with evidence.
- Task artifact records branch/status evidence before edits.
- Changed files are listed with manifest IDs.
- Command evidence is recorded for every check run or intentionally not run.
- No unrecorded scope expansion exists.
- No unrelated user changes were overwritten or silently staged.
- No default-branch commit is made unless explicitly approved in the plan.
- `orchestration.phase` is `build`, `orchestration.status` is accurate, and `next_phase` is `review` when unblocked.
- `scope-fence` confirms every changed file maps to the active phase's declared scope, or to an approved waiver.
- Any waiver recorded in the task passes `waiver-completeness-check`.

## Determinism Rules

- Before writing code, confirm that either (a) `restore-context` ran this session for the active slug, or (b) the Plan artifact was read in full via the file-read tool this turn. Plan content recalled from earlier in the conversation does not satisfy this requirement.
- Execute exactly one approved plan phase at a time.
- Do not silently expand scope; new requirements return to Think/Plan or require an explicit plan update.
- Do not invent commands, results, branches, PRs, tickets, releases, or external updates.
- Do not push branches, open PRs, wait for CI, publish releases, or mutate external sources unless the approved plan records a user-approved Build exception.
- Preserve unrelated user changes.
- Cite exact local paths in task evidence.
- Treat skipped checks as risk, not success.

## Output

Follow `references/output-schema.md`.

The user-facing response must include the task artifact path, active phase status, changed files summary, checks run or skipped, blockers or waivers, and whether Review may start.
