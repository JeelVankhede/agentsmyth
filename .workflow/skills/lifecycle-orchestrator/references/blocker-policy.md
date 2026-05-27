# Blocker Policy

## Purpose

Define when the orchestrator must stop instead of guessing.

## Blocking Conditions

Stop when any of these are true:

- Required source-of-truth location is missing.
- Domain rules, non-goals, or protected paths are unclear.
- Release or rollback policy is required but unknown.
- Verification commands or required evidence are unknown.
- User approval checkpoint is active.
- Phase exit gate failed.
- Required tool, repo, branch, PR, CI, release, or source update cannot be verified.
- External source updates are required but cannot be performed safely.
- Target repo has unrelated changes that overlap planned edits.
- Requirement IDs are missing, partial, or inconsistent across artifacts.
- A user correction changes approved scope.

## Waivers

A waiver is valid only when it records:

- blocker ID
- waived risk
- owner
- follow-up action
- user acceptance

Do not treat a silent assumption as a waiver.

## Open Questions

Open questions must be recorded as `Q<N>` IDs in the active artifact and listed in `orchestration.blockers` while unresolved.

## Blocked Handoff

When the agent cannot perform an external action, write copy-ready handoff text and mark the phase held unless the user accepts a waiver.
