---
slug: site-docs-remediation
version: 1
artifact: ship
status: ready-for-next-phase
created: 2026-07-26
updated: 2026-07-26
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, R9, RI1]
upstream:
  - workflow/artifacts/briefs/site-docs-remediation-v1.md
  - workflow/artifacts/plans/site-docs-remediation-v1.md
  - workflow/artifacts/tasks/site-docs-remediation-v1.md
  - workflow/artifacts/reviews/site-docs-remediation-v1.md
  - workflow/artifacts/verify/site-docs-remediation-v1.md
orchestration:
  phase: ship
  status: ready-for-next-phase
  next_phase: reflect
  blockers: []
  user_checkpoint: ship-review
---

# Site docs remediation (Tier 1) - Ship

## Inputs

- Review: recommendation `pass`, zero findings.
- Verify: recommendation `ship`, zero findings, zero skipped checks; closed Review's one residual risk (R9 visual-render claim) with `VPImage.vue` component-source evidence.
- `workflow/config/release.yaml`: `pull_request.required: false` (`create_policy: user_requested_or_configured`), `ci.required: false`, `release.required: false`, `rollback.required: when_release_or_external_handoff_is_in_scope` (not in scope — docs-only, no release).
- `workflow/config/source-of-truth.yaml`: `default_required: false`, no providers configured — not applicable to this brief.
- Branch context (step 4a): original plan assumed continuing on `fix/docs-site-base-path` (PR #49, open at brief-time). User confirmed mid-Ship that PR #49 has since merged into `main`. Re-checked: `fix/docs-site-base-path`'s tip (`da55855`) is a confirmed ancestor of `origin/main` with zero tree drift. Per user decision, created a fresh branch `fix/site-docs-remediation` off `origin/main` and moved all work there instead of continuing on the now-merged branch.
- Two commits recorded, per user decision on how to handle a second, unrelated pre-existing dirty-state item found in the working tree:
  - `3023218` — the nine docs-remediation fixes (R1-R9, RI1) plus all five site-docs-remediation lifecycle artifacts.
  - `5e901a1` — an unrelated, pre-existing uncommitted change (mandatory pre-commit hook install + `repo-profile.yaml` version/`definitions_root` update) that predates this brief and carries no manifest ID; user asked for it to ship in the same branch/PR as a separate commit.

## Ship Status

- Recommendation: ship
- Review result: pass
- Verification recommendation: ship
- PR / CI: opened — https://github.com/JeelVankhede/agentsmyth/pull/51 (base `main`, head `fix/site-docs-remediation`); CI not configured (`ci.required: false`)
- Source-of-truth: not applicable
- Release: not applicable (no release gate configured, docs-only change)

## Requirement Coverage

| Manifest ID | Status | Evidence | Notes |
|---|---|---|---|
| R1 | shipped | `workflow/artifacts/verify/site-docs-remediation-v1.md` Manifest Coverage row R1 | |
| R2 | shipped | verify artifact row R2 | |
| R3 | shipped | verify artifact row R3 | |
| R4 | shipped | verify artifact row R4 | |
| R5 | shipped | verify artifact row R5 | `site/under-hood.md:49` stale value deferred to future T-D14 sweep, per brief's Non-Goals — not this manifest ID's surface. |
| R6 | shipped | verify artifact row R6 | |
| R7 | shipped | verify artifact row R7 | |
| R8 | shipped | verify artifact row R8 | |
| R9 | shipped | verify artifact row R9 (VPImage.vue mechanism evidence) | |
| RI1 | shipped | verify artifact row RI1 | |

## PR / CI Readiness

Opened: https://github.com/JeelVankhede/agentsmyth/pull/51 (`fix/site-docs-remediation` → `main`), created via `gh pr create` following `~/.claude/PULL_REQUEST_TEMPLATE.md`'s required title/body format exactly (confirmed by reading the PR back via `gh pr view 51 --json url,title,body` after creation). `pull_request.required: false` in `release.yaml` — not a hard gate, but the user's chosen branch strategy explicitly included opening one, now done.

CI: `ci.required: false`, `provider: none` — not applicable.

## Release Readiness

Not applicable — `release.required: false`, no version bump, no package publish, no deployment in scope for this brief. (The unrelated second commit does touch `agentsmyth_version` in `repo-profile.yaml`, but that reflects this repo's own local config state after running its shipped CLI on itself, not a release action being performed by this lifecycle chain.)

## Source-of-Truth Status

not applicable — `source_of_truth.default_required: false`, no providers configured, and this brief's Notion source link was read-only input to Think, not a target requiring write-back.

## Risk And Rollback

- Residual risk: `site/under-hood.md:49` still carries the stale `.cursor/rules/index.mdc` value (accepted, deferred to future T-D14 sweep — see Verify's Manifest Coverage R5 row). R9's four-combination visual render was verified via component-source inspection, not a live screenshot (see Verify's Architecture Notes) — low risk, no OS-conditional branch exists in the mechanism.
- Rollback trigger: if the merged docs read incorrectly in production (e.g., a broken table row or a logo regression on the live GitHub Pages site).
- Rollback action: `git revert` the two commits on `main` (`3023218`, `5e901a1`) and redeploy the docs site; no database, external service, or release artifact is involved.
- Rollback owner: user (repo owner).

none — user confirmed push + PR this turn; both are now complete (see PR / CI Readiness above).

## Architecture Notes

- role: Senior DevOps
- decision: Did not treat "All PRs are already merged" as implicit authorization to push/open a PR unilaterally — that statement described repo state, not an instruction, so it was surfaced as a decision point (step 4a) and the user chose the branch strategy explicitly. Push/PR-open itself is being held for one more explicit confirmation this same turn before executing, consistent with treating external, hard-to-reverse actions as requiring their own checkpoint.
- constraint: `release.yaml`'s `pull_request.required: false` means a missing PR would not by itself force a `hold` — the `ship` recommendation above reflects that all *required* gates (branch evidence, generated-output verification) have evidence; PR/push is tracked separately in Blocked Handoff precisely because it's user-requested-and-configured, not because its absence blocks the underlying requirement coverage.
- tradeoff: Split into two commits (docs vs. unrelated hook/repo-profile update) per user's explicit choice, trading one slightly larger PR for cleaner, independently-revertable history.
- downstream: Reflect should note this PR (once opened) covers two unrelated pieces of work bundled at the user's request — a follow-up worth flagging is whether future unrelated dirty-state discoveries during Build should be flagged earlier (at Think/Plan) rather than surfacing for the first time at Ship.

## Checkpoint Approval

- Checkpoint: ship-review
- Status: approved
- User's own words (verbatim, this turn): "Yes, push and open the PR"

## Exit Gate

- [x] Recommendation is ship / hold / hold-with-waiver.
- [x] Every R and RI has a coverage row.
- [x] Rollback trigger and action defined.
- [x] All configured gates checked or marked not applicable with config reference.
- [x] Checkpoint Approval recorded with the user's real words for this specific ship decision.
- [x] PR opened and this artifact updated with the outcome.

## Next Phase

Reflect
