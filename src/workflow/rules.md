# Rules

These rules apply across every lifecycle phase.

## Canonical Source

- `workflow/` defines workflow behavior.
- Config files decide repository-specific policy.
- Adapter files only route tools to `workflow/`.
- Chat memory is not durable state.

## Scope

- Do not add secondary repository orchestration.
- Do not make providers, package managers, CI, deployment, or release processes mandatory by default.
- Do not edit unrelated files as part of lifecycle work.

## Evidence

- Record exact commands, paths, artifacts, source links, or user-provided proof.
- Do not claim command success without current-turn output or a cited artifact that contains the output.
- Do not claim external state (PR merge, CI status, deployment, source update) without tool output, artifact evidence, or user-provided proof.
- Treat skipped checks as risk; record them with reason, risk level, and owner.
- Treat waivers as visible residual risk, not success.

## Git Safety

- Use a non-default branch for planned changes unless the user approves otherwise.
- Preserve unrelated local changes.
- Record dirty state before Build and at handoff.
- Stage only approved files.
- Do not use destructive git operations without explicit user approval.

## Source And Release

- Source updates belong to Ship unless configured otherwise.
- Missing required source or release evidence produces `hold` unless waived.
- Copy-ready handoff text is not completion without a waiver.
- Rollback must be explicit when release, deployment, publishing, or external handoff is in scope.

## Learning

- Reflect may propose learning candidates.
- Raw sessions are append-only.
- Curated learnings require an explicit curation request.
