# Requirement Coverage

Review must cover every active `R` and `RI` from the Plan/Task scope.

Required fields:

- manifest ID
- evidence path, command, task entry, or diff area
- status: `covered`, `partial`, or `missing`
- notes

Status meanings:

- `covered`: the diff and task evidence satisfy the requirement for the active phase.
- `partial`: some evidence exists, but part of the acceptance criteria is incomplete, unverified, or deferred.
- `missing`: no meaningful evidence satisfies the requirement.

Rules:

- Missing active `R` coverage usually requires a `P1`.
- Missing active `RI` coverage requires a `P1` or `P2` depending on risk.
- Partial coverage must appear in Findings or Residual Risk.
- Deferred or waived coverage must name owner, phase, and waiver/source.
