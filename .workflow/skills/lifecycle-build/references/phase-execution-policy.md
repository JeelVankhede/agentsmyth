# Phase Execution Policy

Build executes one approved Plan phase at a time.

Rules:

- Default to the lowest-numbered incomplete phase in the task artifact.
- A different phase may be selected only by user instruction or explicit Plan direction.
- The active phase must have manifest IDs, touches, work summary, verification rows, and a binary exit gate.
- A later phase cannot begin while the active phase is incomplete unless the Plan explicitly permits parallel work and the workstreams are independent.
- Any new requirement, changed acceptance criterion, source-of-truth conflict, or release/verification policy gap returns to Think/Plan or requires an explicit Plan update.

Completion requires:

- implementation evidence
- changed-file list
- command evidence or not-run risk
- blocker status
- phase completion log entry
