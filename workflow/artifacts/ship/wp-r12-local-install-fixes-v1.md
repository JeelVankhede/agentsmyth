---
slug: wp-r12-local-install-fixes
version: 1
artifact: ship
status: ready-for-next-phase
created: 2026-07-21
updated: 2026-07-21
manifest_ids: [R1, R2, R3, R4, R5, RI1, RI2, RI3, RI4, RI5]
upstream:
  - workflow/artifacts/briefs/wp-r12-local-install-fixes-v1.md
  - workflow/artifacts/plans/wp-r12-local-install-fixes-v1.md
  - workflow/artifacts/tasks/wp-r12-local-install-fixes-v1-p1.md
  - workflow/artifacts/tasks/wp-r12-local-install-fixes-v1-p2.md
  - workflow/artifacts/tasks/wp-r12-local-install-fixes-v1-p3.md
  - workflow/artifacts/tasks/wp-r12-local-install-fixes-v1-p4.md
  - workflow/artifacts/reviews/wp-r12-local-install-fixes-v1.md
  - workflow/artifacts/verify/wp-r12-local-install-fixes-v1.md
orchestration:
  phase: ship
  status: ready-for-next-phase
  next_phase: reflect
  blockers: []
  user_checkpoint: ship-review
---

# WP-R12 — Local Install Fixes - Ship

## Inputs

- Verify recommendation: `ship`, `workflow/artifacts/verify/wp-r12-local-install-fixes-v1.md`.
- Review recommendation: `pass-with-risk` (one P3 finding, non-blocking), `workflow/artifacts/reviews/wp-r12-local-install-fixes-v1.md`.
- `workflow/config/release.yaml`: `release.required: false`; `gates.pull_request.required: false`; `gates.ci.required: false`; `gates.branch.required: true`.
- Branch-staleness finding from Review/Test (this branch predated WP-R11's merge into `main`) — resolved this phase: merged `origin/main` into `wp-r12-local-install-fixes`, resolved 3 real conflicts (`.github/workflows/ci.yml`, `package.json`, `workflow/artifacts/open-items.yaml`), re-ran the full regression suite post-merge (all pass, including a fresh `npm run site:build` to confirm WP-R11's own work still builds).
- User decision this session: push the branch and open a PR to obtain real CI evidence, even though not strictly required by `release.yaml` or this WP's own R5 acceptance criteria.

## Ship Status

- Recommendation: ship
- Review result: pass-with-risk, `workflow/artifacts/reviews/wp-r12-local-install-fixes-v1.md`
- Verification recommendation: ship, `workflow/artifacts/verify/wp-r12-local-install-fixes-v1.md`
- PR / CI: PR #42 open, `validate` CI check passing — see PR / CI Readiness.
- Source-of-truth: not applicable — no provider configured.
- Release: no release gate configured for this repo; merge is the release action, at the user's discretion.

## Requirement Coverage

| Manifest ID | Status | Evidence | Notes |
|---|---|---|---|
| R1 | shipped | `grep -c "'src', 'adapters'" bin/agentsmyth.mjs` → `0` (re-verified this phase, post-merge); real packed-install repro in `-p1`, independently re-confirmed by Review and Test | |
| R2 | shipped | `check-release-readiness.mjs` fresh run (re-verified this phase, post-merge) → `ok`, all real Ship artifacts correctly detected | |
| R3 | shipped | Same run; `npm run violations:test` fixture `o` still correctly rejects (re-verified this phase, post-merge) | |
| R4 | shipped | 5-adapter invocation command, verified 3 times independently (Build, Review, Test) via separate scratch installs; content and idempotency confirmed | Live in-tool invocation not verifiable in this environment — see Risk And Rollback and `open-items.yaml` OI-42. |
| R5 | shipped | `npm run checkpoint-approval:test` → 3/3 (re-verified this phase, post-merge); `agentsmyth check --phase build --slug wp-r12-local-install-fixes` → `ok`, both checks pass; dogfooded against this WP's own real Plan violation before any fixture existed | |
| RI1 | shipped | `npm run validate` (re-verified this phase, post-merge) — zero new failures | |
| RI2 | shipped | `git diff <merge-base> HEAD -- package.json` — only the new `checkpoint-approval:test` script line; post-merge `package.json` also correctly carries WP-R11's `vitepress`/`site:*` additions (merged, not this WP's own change) | |
| RI3 | shipped | Scratch-consumer-repo `prepare` run, zero new repo-level files, verified 3 times independently | |
| RI4 | shipped | Shared instructional content confirmed present in all 5 adapter files, adapted per format | |
| RI5 | shipped | Codex deprecation risk named explicitly in `-p3`, brief Risks, and `open-items.yaml` OI-41 | |

## PR / CI Readiness

- Base branch: `main`. Head branch: `wp-r12-local-install-fixes`.
- PR: [#42](https://github.com/JeelVankhede/agentsmyth/pull/42) — opened this phase, at the user's explicit request (release.yaml doesn't require a PR gate; requested anyway for real CI evidence).
- CI provider: GitHub Actions. Check name: `validate`.
- CI status: **pass**, first attempt. Run `29835222570`, job `validate`, SUCCESS, completed 2026-07-21T13:37:10Z. Evidence link: https://github.com/JeelVankhede/agentsmyth/actions/runs/29835222570/job/88649715973
  - Notably clean on the first try, unlike WP-R11's Ship phase (which hit two real validator false-positives before passing) — this WP's own local pre-push regression discipline (full `npm run validate` + `violations:test` + `checkpoint-approval:test`, re-run after every phase and again after the merge) caught what would otherwise have been CI-time surprises.
- Review status: not configured/requested — PR is open for the user's own review and merge decision.
- Owner and next action: user. Merge PR #42 when satisfied.

## Release Readiness

- Branch: `wp-r12-local-install-fixes`, pushed to `origin`, tracked, merged with the current `origin/main` (post WP-R11) — no longer stale.
- Change type: bug fixes (`bin/agentsmyth.mjs` packaging paths, `check-release-readiness.mjs`) + one new capability (5-adapter invocation command) + one new process-safety mechanism (checkpoint-approval hard gate). No package version bump, no `dependencies` change.
- Release gate: none configured in `release.yaml`; merge to `main` is the release action, at the user's discretion.

## Source-of-Truth Status

not applicable — no provider configured in `workflow/config/source-of-truth.yaml`.

## Risk And Rollback

- Residual risk: R4's live in-tool invocation (does `/agentsmyth` actually appear and fire in Cursor, Windsurf, VS Code+Copilot, Codex CLI) has never been observed in a real client — file placement/content is the verified ceiling across all 3 Build/Review/Test passes. Owner: user, next time they're in each tool. Tracked as `open-items.yaml` OI-42.
- Residual risk: Codex's custom-prompts mechanism is documented by OpenAI as deprecated. Owner: user/repo maintainer. Tracked as OI-41.
- Residual risk: the checkpoint-approval gate (R5) enforces form, not cryptographic authenticity of quoted evidence — a fundamental limitation of any file-based check, disclosed at every phase (Build, Review, Test, and here), not something a future fix is expected to close. The real defense is the explicit rule in `workflow/rules.md` forbidding agent self-authorship.
- Residual risk: `exemplar.md` gap (Review Finding #1, P3) — non-blocking, tracked as OI-43.
- Rollback area: `bin/agentsmyth.mjs`, `src/workflow/validators/check-lifecycle.mjs`, `src/workflow/validators/check-release-readiness.mjs`, `src/workflow/rules.md`, 3 skill `output-schema.md` files, 5 new adapter source files, test infra, CI config.
- Rollback risk: low. All changes are additive or narrowly-scoped bug fixes; the merge with `origin/main` was clean (3 conflicts, all trivial "both sides appended" cases, resolved by keeping both additions — verified via full regression re-run afterward).
- Rollback trigger: CI failure on `main` post-merge, or the user reporting the checkpoint-approval gate incorrectly blocking a legitimate phase transition, or R1's packaging fix somehow not working against a real published install.
- Rollback action: before merge, close PR #42 without merging. After merge, `git revert` the merge commit — clean, since nothing else has built on top of this WP's changes yet.
- Rollback owner: user.
- Rollback limits: reverting the checkpoint-approval gate (R5) specifically would remove the mechanical enforcement added because of a real violation this session — if reverted, `workflow/rules.md`'s prose-only rule (already proven insufficient once) would be the only remaining defense. Flagging this explicitly since it's the one rollback with a real, non-obvious downside beyond "undo the change."

## Blocked Handoff

none

## Architecture Notes

- role: Senior DevOps
- decision: Recommendation is `ship` — all 5 requirements and 5 implicit requirements are independently verified `shipped` with no unwaived blocker; the one Review finding (P3, exemplar.md) doesn't affect the actual enforcement mechanism and is tracked as a follow-up, not a blocker.
- decision: Resolved the branch-staleness risk Review/Test both flagged by actually merging `origin/main` in this phase (not deferring it further) — per `lifecycle-ship/SKILL.md`'s own step 4a. Chose merge over rebase to match this repo's own established precedent (the `power-skills-wave2-v1` chain, OI-9) and because merge is the lower-risk, non-history-rewriting option for a branch already pushed nowhere yet at that point.
- decision: All 3 real merge conflicts (`.github/workflows/ci.yml`, `package.json`, `workflow/artifacts/open-items.yaml`) were "both branches independently added something near the same location" cases — resolved by keeping both additions, not by picking one side. The `open-items.yaml` conflict was more than cosmetic: both branches had independently assigned OI-33/34/35 to *different* items, and `origin/main`'s OI-40 was literally the original bug report for what this WP's own OI-33 said was now fixed — resolved by renumbering WP-R12's 3 items to OI-41/42/43 and marking OI-40 `done` with a cross-reference to the actual fix, closing the loop `-p2`'s own task artifact had already anticipated.
- constraint: Per Ship's own role boundary, no product files were edited beyond conflict resolution (which is mechanical reconciliation of already-reviewed content, not new work) and the artifact writes this phase itself performs.
- downstream: Reflect should capture the checkpoint-approval mechanism's own origin story as a durable lesson — a documented, prose-only rule (`workflow/rules.md`'s pre-existing `## Approval` section) was not sufficient to prevent a real violation of that exact rule, and the fix required both a mechanical hard gate AND a strengthened, explicit rule about the gate's own limits (cannot prove evidence authenticity). Also: this is the first WP where a mid-session `origin/main` merge required real conflict resolution (not just a "confirm still byte-identical" check like the Wave 3 precedent) — worth confirming whether `lifecycle-ship/SKILL.md`'s step 4a adequately covers the reconciliation-not-just-detection case, or whether it needs its own explicit sub-step.

## Checkpoint Approval

- Checkpoint: ship-review
- Status: approved
- User's own words (verbatim, this turn): the agent presented the Ship artifact (recommendation `ship`, PR #42 with real passing CI, all 10 manifest IDs shipped) and asked directly: "Do you approve this Ship decision? If yes, I'll record it as the real ship-review evidence, same as we did for the Plan." The user responded: "Yes".

## Exit Gate

- [x] Recommendation: `ship`
- [x] Every active `R` and `RI` has a `shipped` status row in Requirement Coverage.
- [x] No active unwaived blocker remains.
- [x] PR/CI status explicit (PR #42, CI pass, run cited) and source-of-truth explicitly not applicable.
- [x] Rollback trigger, action, owner, and limits defined.
- [x] Checkpoint Approval — approved this turn, see above.

## Next Phase

Reflect. `orchestration.next_phase: reflect`.
