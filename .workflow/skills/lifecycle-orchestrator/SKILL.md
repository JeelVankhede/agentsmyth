---
name: lifecycle-orchestrator
description: Primary lifecycle router for this repository. Use to turn a user request into a gated Think, Plan, Build, Review, Test, Ship, and Reflect workflow with pause/resume support.
---

# Lifecycle Orchestrator

## Purpose


The orchestrator is a router and state manager. It does not own phase-specific reasoning. It loads the right phase skill, enforces lifecycle order, writes or updates phase artifacts through those skills, and pauses when user input, evidence, or external action is required.

## Context Loading

Always load:

1. Root `AGENTS.md`.
2. `.workflow/router.md`.
3. `.workflow/lifecycle.md`.
4. `.workflow/rules.md`.
5. `.workflow/config/agent-behavior.yaml`.
6. This skill file.
7. These references:
   - `references/phase-routing.md`
   - `references/pause-resume-rules.md`
   - `references/blocker-policy.md`
   - `references/lifecycle-state-machine.md`
   - `references/output-schema.md`

Load on demand:

- `.workflow/config/domain.yaml` when domain rules, terminology, risks, or constraints affect the request.
- `.workflow/config/repo-profile.yaml` when repo structure, branch policy, public contracts, generated output, or protected paths matter.
- `.workflow/config/source-of-truth.yaml` when requirements, external tracking, release handoff, or source updates are involved.
- `.workflow/config/verification.yaml` when planning, testing, reviewing, or shipping verification evidence.
- `.workflow/config/release.yaml` when release, deployment, publishing, rollback, or handoff is in scope.
- `.workflow/skills/restore-context/SKILL.md` before resuming an existing slug, recovering after interruption, or processing a user answer to a blocker.
- Phase skill files only when entering that phase.
- Existing lifecycle artifacts only for the active slug/version.
- Repository files only when the current phase requires implementation, review, verification, or source inspection.

## Inputs

- A new user request, feature idea, bug report, cleanup request, or workflow instruction.
- An existing slug/version, branch, artifact path, PR, issue, or source-of-truth reference.
- A user answer after a lifecycle pause.
- A scope change to an existing lifecycle chain.

## Start Or Resume

- New request without an existing lifecycle chain: start with `lifecycle-think` unless the request is explicitly trivial.
- Existing slug/version or vague resume request: run `restore-context` first, then continue from the recommended next phase.
- User answer after a pause: run `restore-context`, update the active artifact with the answer, clear resolved blockers, then continue only if the current exit gate passes.
- Scope change: update the Requirement Manifest when compatible with the current version; create a new version when requirements materially change or existing IDs would otherwise need renumbering.
- Explicit phase request: respect the requested phase only when upstream artifacts and gates needed by that phase exist or the user explicitly waives missing context.

## Phase Order

Normal lifecycle order:

```text
Think -> Plan -> Build -> Review -> Test -> Ship -> Reflect
```

Phase mapping:

| Phase | Skill | Primary artifact |
|---|---|---|
| Think | `.workflow/skills/lifecycle-think/SKILL.md` | `.workflow/artifacts/briefs/<slug>-v<N>.md` |
| Plan | `.workflow/skills/lifecycle-plan/SKILL.md` | `.workflow/artifacts/plans/<slug>-v<N>.md` |
| Build | `.workflow/skills/lifecycle-build/SKILL.md` | `.workflow/artifacts/tasks/<slug>-v<N>.md` |
| Review | `.workflow/skills/lifecycle-review/SKILL.md` | `.workflow/artifacts/reviews/<slug>-v<N>.md` |
| Test | `.workflow/skills/lifecycle-test/SKILL.md` | `.workflow/artifacts/verify/<slug>-v<N>.md` |
| Ship | `.workflow/skills/lifecycle-ship/SKILL.md` | `.workflow/artifacts/ship/<slug>-v<N>.md` |
| Reflect | `.workflow/skills/lifecycle-reflect/SKILL.md` | `.workflow/artifacts/reflect/<slug>-v<N>.md` and raw learning session |

## Stop Conditions

Stop and ask the user when any condition from `references/blocker-policy.md` applies, including:

- Required source-of-truth location is unknown.
- Domain rule, non-goal, release policy, verification command, or protected path is unclear.
- A phase artifact has unresolved `Q` IDs.
- A user approval checkpoint is required.
- A phase exit gate fails.
- Required repo, source, tool, branch, PR, release, or verification evidence is unavailable.
- Required external updates cannot be performed and no accepted handoff or waiver exists.
- The repository has unrelated changes overlapping the planned work.
- The user changes scope, asks to pause, or rejects the current direction.

When stopping, update the active artifact first when an artifact exists. The user-facing response must include slug, phase, blocker IDs, exact question/action needed, and next phase after resolution.

## Continue Conditions

Continue only when:

- All blocking questions for the current gate are answered, deferred with owner, or explicitly waived.
- The current phase exit gate is satisfied.
- Required evidence exists or the user has accepted a documented waiver.
- `orchestration.status`, `blockers`, and `next_phase` are updated.
- No new blocker was introduced by the latest user answer or repo/source inspection.

## Workflow

1. Classify the request as new, resume, answer, scope change, explicit phase, or trivial.
2. Load only the minimum required context.
3. If resuming or updating an existing chain, run `restore-context` first.
4. Resolve slug, version, current phase, blockers, and next phase.
5. Enter the correct phase skill using `references/phase-routing.md`.
6. Let the phase skill create or update its artifact and evaluate its exit gate.
7. Pause on blockers using `references/pause-resume-rules.md` and `references/blocker-policy.md`.
8. Advance state using `references/lifecycle-state-machine.md` only when the phase gate passes.
9. End the response using `references/output-schema.md`.

## Exit Gate

The orchestrator pass is complete when it ends in exactly one of these states:

- Paused: active artifact updated if applicable, blockers recorded, exact user action requested.
- Advanced: current phase gate passed, next phase started or completed, artifact chain updated.
- Complete: Reflect is done and no active follow-up blocks the lifecycle chain.

## Determinism Rules

- Do not skip Standard or Complex phases without an explicit user waiver recorded in the active artifact.
- Do not invent source-of-truth state, commands, releases, PRs, issue IDs, ticket IDs, or CI results.
- Do not claim a phase completed unless its exit gate passed or the user accepted a documented waiver.
- Do not infer implementation correctness from planning text alone.
- Do not continue from stale memory; use `restore-context` for existing chains.
- Do not modify product files in Think, Plan, Review, Test, Ship, or Reflect unless that phase explicitly allows the requested change and the user asked for it.
- Keep this workflow scoped to this repository. Do not make assumptions about external systems or processes beyond what is explicitly documented in the loaded context.

## Output

Follow `references/output-schema.md`.
