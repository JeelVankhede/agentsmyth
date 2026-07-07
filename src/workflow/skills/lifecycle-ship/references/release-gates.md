# Release Gates

Release gates come from `workflow/config/release.yaml`, the Plan, and user instruction.

Common gate types:

- branch state
- pull request readiness
- CI status
- package or artifact publishing
- deployment readiness
- documentation release
- generated-output promotion
- release notes
- rollback readiness
- source-of-truth handoff

Gate status values:

- `pass`: evidence exists and gate is satisfied.
- `fail`: evidence exists and gate failed.
- `blocked`: gate cannot be checked or completed.
- `not applicable`: config and Plan do not require the gate.
- `waived`: user accepted risk, owner, and follow-up.

Rules:

- Do not invent universal release commands.
- Do not treat local commits as remote release readiness when config requires PR/CI/release evidence.
- Failed or blocked required gates produce `hold` unless waived.
- Waived gates produce `hold-with-waiver`, not `ship`.
