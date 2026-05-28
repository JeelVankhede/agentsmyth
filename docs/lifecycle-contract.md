# Lifecycle Contract

This contract defines phase order, ownership, and exit behavior for Standard and Complex work.

## Phase Chain

| Phase | Skill | Artifact | Next |
|---|---|---|---|
| Think | `.workflow/skills/lifecycle-think/SKILL.md` | `.workflow/artifacts/briefs/<slug>-v<N>.md` | Plan |
| Plan | `.workflow/skills/lifecycle-plan/SKILL.md` | `.workflow/artifacts/plans/<slug>-v<N>.md` | Build |
| Build | `.workflow/skills/lifecycle-build/SKILL.md` | `.workflow/artifacts/tasks/<slug>-v<N>.md` | Review |
| Review | `.workflow/skills/lifecycle-review/SKILL.md` | `.workflow/artifacts/reviews/<slug>-v<N>.md` | Test |
| Test | `.workflow/skills/lifecycle-test/SKILL.md` | `.workflow/artifacts/verify/<slug>-v<N>.md` | Ship |
| Ship | `.workflow/skills/lifecycle-ship/SKILL.md` | `.workflow/artifacts/ship/<slug>-v<N>.md` | Reflect |
| Reflect | `.workflow/skills/lifecycle-reflect/SKILL.md` | `.workflow/artifacts/reflect/<slug>-v<N>.md` | Done |

## Phase Responsibilities

- Think converts the request into requirements, assumptions, questions, risks, and architecture notes.
- Plan maps every active `R` and `RI` to phases, files, dependencies, risks, branch strategy, and verification.
- Build executes one approved plan phase at a time and records changed files and command evidence.
- Review inspects the actual diff and task evidence, then records findings, coverage, residual risk, and recommendation.
- Test verifies requirements with commands, manual QA, generated-output checks, source checks, or waivers.
- Ship decides `ship`, `hold`, or `hold-with-waiver` using configured release/source gates and rollback policy.
- Reflect records outcome, coverage retrospective, learning candidates, and follow-ups.

## State Rules

- `orchestration.phase` must match the phase artifact.
- `orchestration.next_phase` must follow the chain unless a user-approved waiver records the exception.
- Blocking `Q` IDs, missing evidence, failed gates, and unresolved handoffs must appear in `orchestration.blockers`.
- `ready-for-next-phase` means the current phase exit gate passed or a waiver is explicit.
- `done` is only for completed Reflect artifacts.

## Skipping Phases

Skipping a phase is allowed only when:

- The user explicitly approves the exception.
- The artifact records what was skipped and why.
- The residual risk and downstream impact are visible.
- Ship or Reflect can still reconstruct requirement coverage.

## Evidence Rules

- Do not claim command success without current output or cited artifact evidence.
- Do not claim external source updates, PR state, CI state, release state, deployment, or handoff completion without evidence.
- Skipped checks are risk, not success.
- Waivers require explicit approval evidence, owner, residual risk, and follow-up.

## Restore Rules

When resuming work:

1. Read `.workflow/config/agent-behavior.yaml`.
2. Walk the artifact chain for the slug/version.
3. Prefer artifact frontmatter over chat memory.
4. Inspect git state and relevant repo evidence.
5. Continue only when the current phase gate is clear.
