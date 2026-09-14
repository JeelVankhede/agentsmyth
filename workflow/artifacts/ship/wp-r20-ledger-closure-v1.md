---
slug: wp-r20-ledger-closure
version: 1
artifact: ship
status: ready-for-next-phase
created: 2026-09-13
updated: 2026-09-14
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8]
upstream:
  - workflow/artifacts/briefs/wp-r20-ledger-closure-v1.md
  - workflow/artifacts/plans/wp-r20-ledger-closure-v1.md
  - workflow/artifacts/tasks/wp-r20-ledger-closure-v1.md
  - workflow/artifacts/reviews/wp-r20-ledger-closure-v1.md
  - workflow/artifacts/verify/wp-r20-ledger-closure-v1.md
orchestration:
  phase: ship
  status: ready-for-next-phase
  next_phase: reflect
  blockers: []
  user_checkpoint: ship-review
---

# WP-R20 — Open-Items Ledger Closure Lifecycle - Ship

## Inputs

Full chain: brief (approved brief-review), plan (approved plan-review, amended twice — Phase 6 Touches
made explicit paths at Build, `lifecycle-ship/SKILL.md` added at Review), task (seven phases complete),
review (`pass-with-risk`, 3 findings resolved), verify (`ship`, 15 pass / 1 partial / 0 fail, 2 skipped
checks).

## Ship Status

- Recommendation: **ship**
- Review result: `pass-with-risk` — 3 findings (2× P2, 1× P3), all resolved in place and re-verified
- Verification recommendation: `ship` — 14 suites re-run at Test against the final tree, mutation
  ratchet `0/226 undefended`
- PR / CI: **not performed, not authorized.** `release.yaml` sets
  `pull_request.create_policy: user_requested_or_configured` and no request exists. `ci.provider: none`,
  so no CI gate is configured for this repo's own config — GitHub Actions will run on a PR if one is
  opened, which is a consequence of opening it rather than a gate satisfied here
- Source-of-truth: `not required` — `mode: optional`, `providers: []`
- Release: **1.1.0 stays open.** This is the sixth of seven packages; WP-R24 remains unstarted

## Requirement Coverage

| Manifest ID | Status | Evidence | Notes |
|---|---|---|---|
| R1 | shipped | verify `## Manifest Coverage` R1 | Live ledger holds no `done` item. |
| R2 | shipped | verify R2 | Flat `open-items-archive.yaml` per Q1, superseding the page's yearly directory. |
| R3 | shipped | verify R3 | `resolution` and `closed_in_run` declared; object closed. |
| R4 | shipped | verify R4 | Sweep in the skill's Workflow and Exit Gate; never-sets-`status` at three sites. |
| R5 | shipped | verify R5 | Two-file validator, 5 rejection fixtures, 1 positive control. |
| R6 | shipped | verify `## Manual QA` | 70 moved, 0 lost, 0 characters consumed. |
| R7 | shipped | verify R7 | Seven surfaces swept, including the one Review found missing. |
| R8 | shipped | verify R8 | OI-93, OI-94, OI-95 filed; OI-1..OI-95 contiguous. |
| RI1 | shipped | verify RI1 | One schema, two-value `kind`; 12 schema files, unchanged. |
| RI2 | shipped | verify RI2 | 221 → 226 rules, 0 undefended, nothing regressed. |
| RI3 | shipped | verify `## Automated Checks` + Manual QA | Both configured required commands, at the phases config names. |
| RI4 | shipped | verify RI4 | No new `*:test` script; `r22-every-suite-runs-in-ci` passes. |
| RI5 | **partial** | verify RI5; review F2 | The one requirement not fully met. Documented tightening, owner user, does not block ship — see Risk And Rollback. |
| RI6 | shipped | verify RI6 | Archive-holds-closed-only is mechanical. |
| RI7 | shipped | verify `## Generated Output Evidence` | Build-synced schema identical; bundle carries the change 15×. |
| RI8 | shipped | verify RI8 | CHANGELOG entry added, date untouched, no version bump. |

Fifteen shipped, one partial, none blocked, none waived, none dropped.

## PR / CI Readiness

**Not performed.** `release.yaml` → `gates.pull_request.required: false`,
`create_policy: user_requested_or_configured`. No request was made, so no PR exists and none was opened.
Carried as Blocked Handoff #3.

Base divergence, per `lifecycle-ship` step 4a — run, not assumed:

```
git fetch origin
git rev-list --left-right --count origin/release/1.1.0...HEAD
  behind origin/release/1.1.0: 0    ahead: 1
```

The base has **not** advanced. The single commit of divergence is `881441d`, WP-R23's, which this branch
is stacked on; nothing from this chain is committed.

Identifier reconciliation, per step 4b — and this chain is the reason that step now names two files:

```
highest OI-N on origin/release/1.1.0 : 92
highest OI-N here (both files)       : 95
```

No collision. OI-93, OI-94 and OI-95 are free on the base, so the three entries Phase 4 filed do not
contend with anything already there.

**One check could not be performed.** `gh pr view 68` failed with a network timeout
(`dial tcp 20.207.73.85:443: i/o timeout`), so the current state of PR #68 — the WP-R23 PR this branch
stacks on — is **unknown to this artifact**. It was open earlier in the session. Recorded as unknown
rather than carried forward as still-open: an earlier observation is not current evidence, and if #68 has
merged in the meantime the right action is a rebase onto `release/1.1.0` rather than a PR stacked on a
merged branch.

## Release Readiness

- `release.yaml` → `gates.release.required: false`, `default_recommendation_when_no_release_gate: ship`.
- `CHANGELOG.md` carries a 1.1.0 entry with this work described under `### Added` and `### Changed`.
  **Its date reads 2026-09-08 and today is 2026-09-13** — deliberately not corrected here.
  `docs/release-checklist.md` owns that step, and the open item tracking the 1.1.0 close-out already says
  to fix the date at dispatch if it has slipped.
- `package.json` version is **unchanged and must stay so** until dispatch: `release.yml` runs
  `npm version <bump>` itself, so a pre-bumped repo publishes the version after the intended one.
- `generated_output` gate: `when_changed_or_configured`. `src/workflow/` changed, so it applies, and it is
  satisfied — see verify `## Generated Output Evidence`.
- **This merge does not close 1.1.0.** The release is seven packages by the user's 2026-09-13 scope
  decision; five are merged or in PR, this is the sixth, and WP-R24 is unstarted. Ship states that
  explicitly because the temptation at six-of-seven is to report the release as done.

## Source-of-Truth Status

`not required`. `source-of-truth.yaml` declares `mode: optional` with `providers: []`, so no external
source held authority and no update is owed.

The Notion WP-R20 page is the requirement source and is cited throughout the chain, but it is not a
configured provider and `require_user_request_or_config_for_external_write: true`, so no agent wrote to
it. Two updates are owed there and both are user actions: moving the row to Done, and recording that Q1
superseded the page's R2 — the page still specifies a yearly archive directory that this chain
deliberately did not build. Carried as Blocked Handoff #4.

## Risk And Rollback

- **Residual risk**: five items, carried from review and verify. The material one is F2: closing the item
  object is a tightening, so a consumer ledger carrying an agent-invented key other than `resolution`
  now fails where it passed. Expected impact nil and named in the CHANGELOG, but it is the one respect in
  which RI5's no-op-upgrade promise is kept with an exception. The others are: one reader held all ten
  review risk categories (council refused, `dispatch-disabled`); `check-waivers` false-positived twice on
  this chain's own prose; a bare validator invocation silently validates against the global install; and
  `closed_in_run` is `unrecorded` for 65 of 70 archived items, so the field's migration value is unproven
  until entries closed under the new contract accumulate.
- **Rollback trigger**: a consumer reports `check-open-items` failing after upgrade on a key the schema
  does not declare; or this repo's own Reflect gate fails to find an item a chain expected in the live
  ledger.
- **Rollback action**: nothing is committed, so before any commit the rollback is
  `git checkout -- workflow/artifacts/open-items.yaml` plus deleting `workflow/artifacts/open-items-archive.yaml`.
  After a merge it is a revert of this chain's commits; the ledger split is recoverable because rotation
  was a move and the no-loss verification established that both files together still contain every
  entry, so concatenating them reconstructs the pre-sweep ledger. No command beyond `git revert` is
  invented here.
- **Rollback owner**: user.
- **Evidence**: verify `## Manual QA` (zero-loss reconstruction), verify `## Automated Checks` (14 suites
  green at Test against the final tree).
- **Limits**: rollback restores the *data*. It does not un-publish a release, and if 1.1.0 has already
  been dispatched with this change, a consumer who has run their own sweep has a two-file ledger that an
  older validator does not understand — so the rollback window effectively closes at release dispatch,
  not at merge.

## Blocked Handoff

Four outward actions remain, none performed, all requiring explicit user authorization. Recorded as a
handoff rather than as gates, because none of them is a gate this config requires.

| # | Action | Why not performed | Owner | Exact next step |
|---|---|---|---|---|
| 1 | Commit the working tree | Commit is not authorized by approving a ship decision. Nothing is staged. | user | Authorize a commit on `feat/wp-r20-ledger-closure`; the pre-commit hook enforces artifact coverage. 25 paths. |
| 2 | Push the branch | Outward action; not requested. | user | `git push -u origin feat/wp-r20-ledger-closure` once committed. |
| 3 | Open a PR into `release/1.1.0` | `pull_request.create_policy: user_requested_or_configured`; not requested. **Check PR #68 first** — its state could not be read this session. If #68 has merged, rebase onto `release/1.1.0` rather than stacking. | user | Authorize PR creation; base is `release/1.1.0`, never `main`. |
| 4 | Update the Notion WP-R20 row | External write; no provider configured and `require_user_request_or_config_for_external_write: true`. | user | Set Status to Done with the PR reference, and record that Q1 superseded the page's R2 — the page still specifies a yearly archive directory that was deliberately not built. |

Items 1–3 are sequential. Item 4 depends on 3.

## Architecture Notes

- role: Senior DevOps
- decision: recommendation is `ship` rather than `hold-with-waiver`. Nothing needs waiving — RI5's
  shortfall is a documented and accepted tightening recorded as a finding and a skipped check, not an
  unmet gate, and no waiver would make either skipped check performable.
- decision: PR #68's state is recorded as **unknown** rather than as "open, as observed earlier". An
  earlier observation in the same session is not current evidence, and the difference changes the next
  action — stack a PR, or rebase.
- constraint: `package.json` must not be pre-bumped, and the CHANGELOG date must not be corrected here.
  Both belong to release dispatch.
- constraint: this merge does not close 1.1.0. Six of seven.
- downstream — Reflect: three items need filing in the ledger or they stay in closed artifacts with no
  owner — the `check-waivers` double false positive, the bare-invocation trap, and the `schema_globs`
  glob category not matching this repo's own `schemas/` directory. This chain's own Reflect is also the
  first run of `follow-up-owner-assigner` under the amended contract, so it is the first real exercise
  of R4's sweep step and should be recorded as such.

## Checkpoint Approval

- Checkpoint: ship-review
- Status: approved
- User's own words (verbatim, this turn): "Continue to reflect"

**Scope of this approval: the ship DECISION and the transition to Reflect only.** It does not authorize
any of the four Blocked Handoff actions — commit, push, PR, Notion — which were offered separately and
none of which was taken. Nothing has been committed or pushed. This distinction is stated rather than
left implicit because the ledger carries an open item recording a chain where it was not.

## Exit Gate

- [x] Recommendation is ship / hold / hold-with-waiver — `ship`.
- [x] Every R and RI has a coverage row — 16 rows, 15 shipped, 1 partial.
- [x] Rollback trigger, action, owner, evidence and limits defined.
- [x] All configured gates checked or marked not applicable with a config reference — branch (pass),
      pull_request (not performed, `create_policy`), ci (`provider: none`), release (not required),
      docs (changed), generated_output (satisfied), source_of_truth (not required), rollback (defined).
- [x] Base divergence and identifier spaces checked, per steps 4a and 4b, with one check recorded as
      unperformable.
- [x] User approved the ship decision — ship-review approved 2026-09-14, recorded verbatim in
      `## Checkpoint Approval`. Scoped to the decision and the phase transition; the four Blocked
      Handoff actions remain unperformed and unauthorized.

## Next Phase

Reflect. Approved 2026-09-14. Reflect is a records phase and does not require any of the four Blocked
Handoff actions to have been performed — it records that they are outstanding.
