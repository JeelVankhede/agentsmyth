---
slug: wp-r13-setup-validator-definitions-root
version: 1
artifact: ship
status: blocked-for-user
created: 2026-07-21
updated: 2026-07-21
manifest_ids: [R1, R2, RI1, RI2]
upstream:
  - workflow/artifacts/briefs/wp-r13-setup-validator-definitions-root-v1.md
  - workflow/artifacts/plans/wp-r13-setup-validator-definitions-root-v1.md
  - workflow/artifacts/tasks/wp-r13-setup-validator-definitions-root-v1.md
  - workflow/artifacts/reviews/wp-r13-setup-validator-definitions-root-v1.md
  - workflow/artifacts/verify/wp-r13-setup-validator-definitions-root-v1.md
orchestration:
  phase: ship
  status: blocked-for-user
  next_phase: reflect
  blockers: []
  user_checkpoint: ship-review
---

# WP-R13 — Setup Validator Ignores definitions_root - Ship

## Inputs

- Verify recommendation: `ship`, `workflow/artifacts/verify/wp-r13-setup-validator-definitions-root-v1.md`.
- Review recommendation: `pass` (one P3 finding, non-blocking), `workflow/artifacts/reviews/wp-r13-setup-validator-definitions-root-v1.md`.
- `workflow/config/release.yaml`: no required PR/CI/release gate for this repo.
- User decision this session: push and open a PR anyway for real CI evidence, matching WP-R11/WP-R12's own precedent.

## Ship Status

- Recommendation: ship
- Review result: pass, `workflow/artifacts/reviews/wp-r13-setup-validator-definitions-root-v1.md`
- Verification recommendation: ship, `workflow/artifacts/verify/wp-r13-setup-validator-definitions-root-v1.md`
- PR / CI: PR #43 open, `validate` CI check passing — see PR / CI Readiness.
- Source-of-truth: not applicable.
- Release: no release gate configured; merge is the user's own action.

## Requirement Coverage

| Manifest ID | Status | Evidence | Notes |
|---|---|---|---|
| R1 | shipped | `linked` case passes, re-verified at Build/Review/Test independently | |
| R2 | shipped | `defensive-fallback` (pass) + `defensive-fallback-broken` (correctly fails) | |
| RI1 | shipped | `workflow/artifacts`/`workflow/learnings` unconditional in all 3 cases | |
| RI2 | shipped | `git diff origin/main -- src/workflow/validators/` shows only `check-setup-complete.mjs` | |

## PR / CI Readiness

- Base: `main`. Head: `wp-r13-setup-validator-definitions-root`.
- PR: [#43](https://github.com/JeelVankhede/agentsmyth/pull/43).
- CI: `validate` — SUCCESS, run `29843523989`, completed 2026-07-21T15:21:13Z. https://github.com/JeelVankhede/agentsmyth/actions/runs/29843523989/job/88678127243
- Owner/next action: user, merge when satisfied.

## Release Readiness

- Branch cut cleanly off current `origin/main` (post-WP-R12-merge) — no staleness to reconcile this time.
- Change type: bug fix only, no dependency/version change.
- No release gate configured.

## Source-of-Truth Status

not applicable.

## Risk And Rollback

- Residual risk: Finding #1 (P3, fixture indentation) — low, non-blocking, tracked as a follow-up.
- Rollback area: `src/workflow/validators/check-setup-complete.mjs`, plus its own test fixtures/runner/CI wiring.
- Rollback risk: very low — narrow, additive-only logic split, no other file touched.
- Rollback trigger: a real consumer with a linked global install still failing setup after this ships, or a defensive-fallback repo incorrectly passing when it shouldn't.
- Rollback action: `git revert` the merge commit — clean, isolated change.
- Rollback owner: user.

## Blocked Handoff

none.

## Architecture Notes

- role: Senior DevOps
- decision: Recommendation `ship` — all 4 manifest IDs shipped, one non-blocking P3 finding, clean CI.
- downstream: A companion, independently-branched fix (PR #44, `build-scope-first-fix`) strengthens `lifecycle-build/SKILL.md`'s own scope-before-work discipline — unrelated to this WP's own manifest but worth merging around the same time since both came out of the same session's dogfooding.

## Checkpoint Approval

- Checkpoint: ship-review
- Status: pending — presented to the user in the same response this Ship artifact is written, for real review before being marked approved.
- User's own words (verbatim, this turn): none yet — see the task-level response for the actual question being asked.

## Exit Gate

- [x] Recommendation: `ship`
- [x] Every active `R`/`RI` has a `shipped` row.
- [x] No active unwaived blocker.
- [x] PR/CI explicit (PR #43, CI pass, run cited).
- [x] Rollback trigger, action, owner defined.
- [ ] Checkpoint Approval — pending real user review, see above.

## Next Phase

Reflect, pending Checkpoint Approval above.
