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

## Approval

- A checkpoint status of `approved` or `ready-for-next-phase` requires the user to have
  responded to that specific artifact's own content in the current turn — not merely a prior
  phase's content, and not inferred from silence, a later unrelated instruction, or an earlier
  approval of a different artifact.
- When in doubt whether the user has actually seen and responded to the artifact in question,
  present it and wait rather than marking it approved.
- **Which phases require a checkpoint** is the resolved `pause_resume.user_checkpoint_required_for`
  list: the global list in `workflow/agent-behavior.yaml` **unioned with** any list the repo
  declares under `tuning.pause_resume.user_checkpoint_required_for` in
  `workflow/config/repo-profile.yaml`. Union, never replacement — a repo may add checkpoints and
  may never remove one the global list requires (`check-config.mjs` rejects a repo list that drops
  a globally-required entry). This list is additive in effect as well as in shape: it can only
  cause an artifact to require a checkpoint it would not otherwise have required. It can never
  cause an artifact to skip a checkpoint that artifact declares — the per-artifact
  `orchestration.user_checkpoint` enforcement below is independent of it and is never relaxed by
  repo tuning.
- **This rule is mechanically enforced, not advisory.** Any brief, plan, or ship artifact whose
  `orchestration.user_checkpoint` is not `none` must carry a `## Checkpoint Approval` section
  (Checkpoint / Status / the user's own verbatim words) before the next phase's gate
  (`check-lifecycle.mjs --phase <next>`) will pass — a missing, mismatched, unapproved, or
  placeholder entry is a hard failure, regardless of `orchestration.status`. This rule existed in
  prose alone before that check was added and was not sufficient on its own to prevent a real
  violation (an agent treated answering earlier clarifying questions as blanket approval for a
  later, distinct checkpoint it never actually surfaced) — do not treat the prose rule as
  satisfied just because the mechanical check might catch a slip; the mechanical check is a
  backstop for failure, not a substitute for actually waiting.
- Do not self-author the `## Checkpoint Approval` evidence. Copy the user's real words verbatim
  from the conversation. If no real user message exists approving this specific artifact, the
  checkpoint is not resolved — write `status: blocked-for-user` and present the artifact instead.

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
