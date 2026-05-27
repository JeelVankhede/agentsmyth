# Pause Resume Rules

## Purpose

Define how lifecycle work pauses safely and resumes without relying on memory.

## Pause Requirements

Before pausing, the active phase must record:

- `orchestration.phase`
- `orchestration.status`
- `orchestration.next_phase`
- `orchestration.blockers`
- `orchestration.user_checkpoint`
- the exact question, approval, evidence, or external action needed

When a phase artifact exists, update it before asking the user.

## Resume Requirements

Before continuing after a pause:

1. Run `restore-context`.
2. Read the active artifact chain for the slug/version.
3. Match the user answer to blocker IDs.
4. Update the active artifact with resolved blockers.
5. Re-check the current phase exit gate.
6. Continue only when no unwaived blocker remains.

## User Answer Handling

A user answer may:

- resolve a blocker
- defer a blocker with owner
- waive a risk
- change scope
- reject the current artifact
- request a pause

Scope changes that alter requirements must update the Requirement Manifest or create a new version.

## Stale Context Rule

Do not continue a lifecycle chain from chat memory alone. Existing chains must be reconstructed from `.workflow/artifacts/**`, config files, and repo/source evidence.

## Output When Paused

Return:

- slug and version
- current phase
- blocker IDs
- exact needed answer/action
- next phase after resolution
