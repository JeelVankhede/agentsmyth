---
slug: wp-r23-agents-md-fallback
version: 1
artifact: ship
status: ready-for-next-phase
created: 2026-09-13
updated: 2026-09-13
manifest_ids: [R1, R2, R3, R4, R5, R6, RI1, RI2, RI3, RI4, RI5, RI6, RI7]
upstream:
  - workflow/artifacts/briefs/wp-r23-agents-md-fallback-v1.md
  - workflow/artifacts/plans/wp-r23-agents-md-fallback-v1.md
  - workflow/artifacts/tasks/wp-r23-agents-md-fallback-v1.md
  - workflow/artifacts/reviews/wp-r23-agents-md-fallback-v1.md
  - workflow/artifacts/verify/wp-r23-agents-md-fallback-v1.md
orchestration:
  phase: ship
  status: ready-for-next-phase
  next_phase: reflect
  blockers: []
  user_checkpoint: ship-review
---

# WP-R23 — Generic AGENTS.md Adapter Fallback - Ship

## Inputs

- Verify artifact, recommendation `ship`; 12 pass, 1 skip, 0 fail across 13 manifest IDs.
- Review artifact, recommendation `pass`; both findings (F1 P1, F2 P2) closed in a Build fix pass and
  re-verified independently at Test rather than accepted as closed.
- `workflow/config/release.yaml` — `branch` is the only gate marked `required: true`.
  `generated_output` is `when_changed_or_configured` and generated output did change, so it is
  required. `source_of_truth` is `when_configured` and no provider is configured. `pull_request`,
  `ci`, `release`, `deployment`, `docs`, `package` are all `required: false`.
- `workflow/config/repo-profile.yaml` — `branch_policy.require_non_default_branch_for_changes: true`,
  `default_branch_commit_requires_user_approval: true`.

## Ship Status

- **Recommendation: ship**
- Review result: `pass` (0 open findings; 2 found, both resolved)
- Verification recommendation: `ship`
- PR / CI: not applicable — both `required: false`; no PR opened and none requested
- Source-of-truth: not required — `providers: []`, no configured external authority
- Release: **not performed and not in scope for this chain.** This work is one of three remaining
  packages in 1.1.0; merging it does not close the release.

**Nothing has been committed.** The branch carries zero commits
(`git rev-list --left-right --count origin/release/1.1.0...feat/wp-r23-agents-md-fallback` returns
`0 0`); all work is in the working tree. The `ship` recommendation is a decision about readiness, not
a report that anything was shipped. Commit, push, PR and merge are all user-authorized actions and are
listed under Blocked Handoff.

## Requirement Coverage

| Manifest ID | Status | Evidence | Notes |
|---|---|---|---|
| R1 | shipped | `agents-md:test` A1–A2; manual QA STEP 2 | `init` creates `AGENTS.md` when absent. |
| R2 | shipped | `agents-md:test` B1–B2, C1–C4; manual QA STEP 3 | Idempotent; older-stamped block replaced in place. |
| R3 | shipped | `agents-md:test` D1, E1–E4; manual QA STEP 4 | Non-block region byte-identical, orphan `BEGIN` included. |
| R4 | shipped | `agents-md:test` A4–A5; manual QA STEP 5 | Hook path resolved per repo; verified to name a file that exists. |
| R5 | shipped | `wc -l` 23 against ≤ 25; A7 | Bound met with the setup trigger inside it. |
| R6 | shipped | Placement in `bin/agentsmyth.mjs`, absent from `src/setup/SKILL.md` | Convention change landed. |
| RI1 | shipped | `src/setup/SKILL.md` diff; `setup-checks:test` 13/13 | Single writer; Codex row collapsed. Residual risk below. |
| RI2 | shipped | Marker pair documented beside the global-gate table | HTML-comment form, consistent with existing gates. |
| RI3 | shipped | Two builds, identical md5; bundle content greps | See verify Generated Output Evidence. |
| RI4 | shipped | 13 suites green; `mutation-baseline.json` unchanged | |
| RI5 | shipped | Manual QA against a consumer-shaped repo | Authored content preserved verbatim across two runs. |
| RI6 | **deferred** | Verify Skipped Checks row, all six fields | Example-repo coverage. Owner: user. Does not block ship. Not a waiver — see Architecture Notes. |
| RI7 | shipped | `CHANGELOG.md` 1.1.0 entry; `git diff package.json` one added line | Entry date deliberately unchanged; corrected at dispatch. |

Twelve shipped, one deferred, none blocked, none waived.

## PR / CI Readiness

not applicable.

`release.yaml` sets `pull_request.required: false` with
`create_policy: user_requested_or_configured`, and `ci.required: false` with `provider: none`. No PR
has been requested, so none was opened. CI has not run against this work because nothing has been
pushed — recorded as a fact, not as a passed gate.

If the user later authorizes a push, `.github/workflows/ci.yml` will run on it, and this change adds
one step to that workflow (`agents-md:test`), so the first CI run will exercise the new suite.

## Release Readiness

| Gate | Config | Status | Evidence |
|---|---|---|---|
| branch | `required: true` | **pass** | On `feat/wp-r23-agents-md-fallback`, a non-default branch, satisfying `require_non_default_branch_for_changes`. No commit to `main` was made or attempted. |
| generated_output | `when_changed_or_configured` — changed | **pass** | Verify artifact's Generated Output Evidence: two builds, identical md5, bundle content confirmed current. |
| pull_request | `required: false` | not applicable | None requested. |
| ci | `required: false`, `provider: none` | not applicable | Nothing pushed. |
| release | `required: false` | not applicable | Out of scope; 1.1.0 is not being dispatched by this chain. |
| deployment | `required: false` | not applicable | No deployment surface. |
| docs | `required: false` | not applicable | `src/setup/SKILL.md` and `CHANGELOG.md` both updated regardless. |
| package | `required: false` | not applicable | `package.json` changed by one script line; version deliberately not bumped. |
| source_of_truth | `when_configured` | not applicable | `providers: []`. |
| rollback | when release or external handoff in scope | **recorded below** | Neither is in scope, but the rollback is trivial and stated rather than omitted. |

**Base divergence check (Workflow step 4a).** Run unconditionally, not because divergence was
suspected. `git fetch --all` then
`git log --oneline feat/wp-r23-agents-md-fallback..origin/release/1.1.0` returns empty:
`release/1.1.0` has not advanced since this branch was cut. Step 4b's identifier reconciliation
therefore has nothing to reconcile — no `OI-<n>`, `WP-R<n>` or `-v<N>` collision is possible, because
no commits landed on the base to collide with. Recorded so a reader can tell "checked, clean" from
"not checked".

**1.1.0 is not closed by this work.** `origin/release/1.1.0` is 90 commits ahead of `origin/main` and
mechanically dispatchable, but the user scoped the release to seven work packages (brief Q3). Four are
merged; this is the fifth; WP-R20 and WP-R24 remain unstarted. Ship explicitly does not report this
merge as completing the release, and `workflow/artifacts/open-items.yaml`'s OI-87 — which describes
1.1.0 as four packages — under-describes it by three.

## Source-of-Truth Status

not required.

`source-of-truth.yaml` declares `mode: optional` with `providers: []`, so no external source holds
authority and no update is owed. The Notion WP-R23 page is cited in the brief as the requirement's
origin, not as governing authority. Its status field still reads `🟡 Ready`; updating it is a user
action outside this chain's scope and is listed under Blocked Handoff for visibility, not as an
unfulfilled gate.

## Risk And Rollback

- **Residual risk:**
  1. `check-setup-complete`'s "at least one adapter present" check is now trivially satisfied, because
     `init` always writes `AGENTS.md` and that path is one of its five entries. Accepted by the user
     at brief-review via Q2; every repair considered was worse. Owner: user.
  2. RI6 — no example-repo coverage for the marker block. Deferred with a complete six-field skipped
     check. Offset by `agents-md:test` exercising real scratch repos. Owner: user.
  3. The version stamp is written but nothing reads it yet; it is provision for WP-R18. Its
     correctness in the direction that matters — a later release parsing the stamp and migrating —
     stays untested until something consumes it. Owner: WP-R18.
  4. `mutation:audit` was not run in this chain. `release.yml` runs it at dispatch. Owner: agent.
- **Rollback trigger:** any defect attributable to the `AGENTS.md` block appearing after merge — most
  plausibly a consumer reporting unexpected edits to their own `AGENTS.md`.
- **Rollback action:** revert the merge commit on `release/1.1.0`. Scope is this branch's 7 modified
  and 1 new file plus regenerated `dist/`; no migration, no persisted state, no published artifact to
  unpublish, because nothing has been released. A consumer who already ran `init` keeps a marked block
  that a later `init` will replace or that they can delete between its markers by hand.
- **Rollback owner:** user.
- **Evidence required to execute rollback:** the merge commit SHA on `release/1.1.0`. It does not
  exist yet — nothing is committed.
- **Limits:** rollback covers this branch only. It cannot and does not affect 1.1.0's release state,
  because this chain does not dispatch a release.

## Blocked Handoff

Four outward actions remain, none performed, all requiring explicit user authorization. Recorded as a
handoff rather than as gates, because none of them is a gate this config requires.

| # | Action | Why not performed | Owner | Exact next step |
|---|---|---|---|---|
| 1 | Commit the working tree | Commit is not authorized by approving a ship decision. Nothing is staged. | user | Authorize a commit on `feat/wp-r23-agents-md-fallback`; the pre-commit hook will enforce artifact coverage. |
| 2 | Push the branch | Outward action; not requested. | user | `git push -u origin feat/wp-r23-agents-md-fallback` once committed. |
| 3 | Open a PR into `release/1.1.0` | `pull_request.create_policy: user_requested_or_configured`; not requested. | user | Authorize PR creation; base is `release/1.1.0`, never `main`. |
| 4 | Move the Notion WP-R23 row to Done with the PR reference | External write; `source-of-truth.yaml` `require_user_request_or_config_for_external_write: true`, and no provider is configured. | user | Set Status and PR on the WP-R23 row after merge. |

Items 1–3 are sequential. Item 4 depends on 3.

## Architecture Notes

- role: Senior DevOps
- **decision**: recommending `ship` while nothing is committed. These are different claims and the
  artifact keeps them apart: every configured required gate has evidence, and no unwaived blocker
  remains, which is what `ship` means here. It does not assert that code moved anywhere.
- **decision**: RI6 is recorded as `deferred`, not `waived`. A waiver under `release.yaml` requires
  user acceptance of residual risk with an approver, and per Workflow step 6a only genuinely open risk
  should be put to the user that way. RI6 is a deliberate, evidenced scoping decision with a complete
  skipped-check record — presenting it as pending risk-acceptance would manufacture a decision the
  user does not need to make.
- **constraint**: `release.yaml` makes `branch` the only hard gate. Most of the Release Readiness table
  is `not applicable` by configuration rather than by omission, and each row cites the config that
  makes it so — an unconfigured gate and an unchecked gate look identical otherwise.
- **tradeoff**: the base-divergence check found nothing, which is the least interesting possible
  result and is recorded anyway. The skill's step 4a exists because a stale Branch Strategy was once
  caught only by someone volunteering the news; a check that is only recorded when it finds something
  cannot be distinguished from one that never ran.
- **downstream**: Reflect should carry three things forward — the brief-level gap that produced F1
  (no `R`/`RI` required setup detection, so Build built exactly what was specified and still shipped a
  hole), the Requirement Classification schema tension found while writing the brief, and OI-87 now
  under-describing 1.1.0 by three work packages.

## Checkpoint Approval

- Checkpoint: ship-review
- Status: approved
- User's own words (verbatim, this turn): "Continue to reflect"
- Approved: 2026-09-13, in direct response to this artifact being presented with its recommendation,
  gate table, deferred RI6, base-divergence result, and the four Blocked Handoff actions listed
  separately.
- **Scope of this approval: the ship DECISION and the transition to Reflect only.** It does not
  authorize Blocked Handoff items 1-4 — commit, push, PR, Notion update. Those were offered as
  separate choices and none of them was taken. Nothing has been committed or pushed. This distinction
  is recorded explicitly because OI-92 exists precisely where it was not.

## Exit Gate

- [x] Recommendation is ship / hold / hold-with-waiver.
- [x] Every R and RI has a coverage row.
- [x] Rollback trigger and action defined.
- [x] All configured gates checked or marked not applicable with config reference.

## Next Phase

Reflect — once the ship-review checkpoint is approved. Approval of the ship decision covers the
decision and the phase transition only; it does not authorize any of the four Blocked Handoff actions,
which are offered separately.
