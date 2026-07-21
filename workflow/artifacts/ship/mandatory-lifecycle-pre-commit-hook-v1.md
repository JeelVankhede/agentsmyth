---
slug: mandatory-lifecycle-pre-commit-hook
version: 1
artifact: ship
status: ready-for-next-phase
created: 2026-07-21
updated: 2026-07-21
manifest_ids: [R1, R2, R3, R4, R5, RI1, RI2, RI3, RI4]
upstream:
  - workflow/artifacts/briefs/mandatory-lifecycle-pre-commit-hook-v1.md
  - workflow/artifacts/plans/mandatory-lifecycle-pre-commit-hook-v1.md
  - workflow/artifacts/tasks/mandatory-lifecycle-pre-commit-hook-v1.md
  - workflow/artifacts/reviews/mandatory-lifecycle-pre-commit-hook-v1.md
  - workflow/artifacts/verify/mandatory-lifecycle-pre-commit-hook-v1.md
orchestration:
  phase: ship
  status: ready-for-next-phase
  next_phase: reflect
  blockers: []
  user_checkpoint: ship-review
---

# Mandatory Local Lifecycle Pre-Commit Hook - Ship

## Inputs

Review (recommendation: pass, 1 finding fixed) and Verify (recommendation: ship, no open findings)
artifacts for this slug.

## Ship Status

Recommendation: **ship**.

All 4 planned phases complete, reviewed, and verified. Committed as `7ee8326` on branch
`mandatory-lifecycle-pre-commit-hook`, per explicit user approval to bundle this task's changes
together with the earlier session's unrelated fixes (`check-lifecycle.mjs` validator-resolution
fix, `.cursor/rules/agentsmyth.mdc` re-render, `verification.yaml` schema fix) into one commit.
This repo's own opt-in dev pre-commit hook (`.githooks/pre-commit`) ran during the commit and
caught one real defect in this task's own Verify artifact (a Skipped Checks table missing the
required `manifest_ids` column) — fixed and re-validated before the commit succeeded. Not yet
pushed or merged; remains local to this branch pending further user instruction.

## Requirement Coverage

| Manifest ID | Status | Notes |
|---|---|---|
| R1 | met | Automatic hook install verified in Verify |
| R2 | met | 7/7 coverage fixture tests pass |
| R3 | met | No CI file added anywhere |
| R4 | met | No new bypass mechanism |
| R5 | met | No tool-specific branching |
| RI1 | met | `.githooks/pre-commit` untouched |
| RI2 | met | Custom-hook chaining verified |
| RI3 | met | `runPrepare()` untouched |
| RI4 | met | Non-fatal warning path verified |

## PR / CI Readiness

Not applicable — this repo's own contribution flow for this work is a local branch pending the
user's own commit decision; no PR has been opened, and per this work's own R3/non-goal, no CI
workflow is added or required by it.

## Release Readiness

Not applicable — this is a source-level workflow-tooling change to agentsmyth itself, not a
version bump or npm publish. No `workflow/config/release.yaml` process is triggered by this work.

## Source-of-Truth Status

Source edited directly (`src/workflow/validators/check-commit-coverage.mjs`,
`src/assets/hooks/pre-commit`, `bin/agentsmyth.mjs`), per CLAUDE.md's "edit source, never
generated output" rule. `npm run build` was run after each source change in Build; `dist/` and
`workflow/schemas/` are current, confirmed by `npm run validate`'s `render-adapters: adapter shims
are current` output.

## Risk And Rollback

- Trigger: if the mandatory hook is later found to false-block a legitimate class of commit not
  covered by the safe-allowlist or trivial-escape heuristics.
- Action: the hook can be disabled per-repo via `git commit --no-verify` immediately (no code
  change needed), or the safe-allowlist / trivial-escape thresholds in
  `check-commit-coverage.mjs` can be widened in a follow-up change.
- Owner: whoever maintains this repo's `bin/agentsmyth.mjs`/`src/workflow/validators/` going
  forward — currently the user (Jeel Vankhede) and this agent within a given session.
- Rollback for the repo-local install itself: removing the marker block from
  `.git/hooks/pre-commit` (or the configured hooksPath file) is a one-line manual edit; no
  irreversible state is created by installing it.

## Blocked Handoff

None — commit completed (`7ee8326`) per explicit user approval of scope.

## Architecture Notes

- role: Shipper
- decision: Ship stops at "ready to commit, evidenced" rather than performing the commit itself.
- constraint: User's own global rule ("NEVER commit changes unless explicitly asked") and
  CLAUDE.md golden rule 8 both apply directly.
- tradeoff: None.
- downstream: Reflect (next phase) can proceed once the user has actually committed, or can
  proceed now to capture learnings independent of the commit timing — user's call.

## Checkpoint Approval

- Checkpoint: ship-review
- Status: approved
- User's own words (verbatim, this turn): "Continue"

## Exit Gate

- [x] Every active R and RI shows `met`, `waived`, or a named blocker.
- [x] User approved or waiver recorded.

## Next Phase

Reflect — once the user has responded to this Ship artifact (either approving/declining the
commit, or explicitly deferring that decision) — per this artifact's own Checkpoint Approval
rule, not before.
