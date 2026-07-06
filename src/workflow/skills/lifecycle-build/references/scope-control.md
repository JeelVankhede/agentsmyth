# Scope Control

Build scope is defined by the approved Plan phase.

Allowed:

- files listed in the active phase touches
- directly necessary adjacent files when the task artifact records why and the Plan is updated if scope changes materially
- tests, docs, or generated output explicitly tied to active manifest IDs

Not allowed without Plan update or user approval:

- new features or acceptance criteria
- unrelated cleanup
- broad refactors
- release, PR, CI, publication, or external handoff work assigned to later phases
- edits to protected paths not named by the Plan

When scope changes:

1. Stop implementation.
2. Record the scope issue in the task artifact.
3. Add a blocker or request Plan revision.
4. Continue only after the user or orchestrator resolves the blocker.
