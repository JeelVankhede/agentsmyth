---
slug: wp-r24-enforcement-proof
version: 1
artifact: ship
status: ready-for-next-phase
created: 2026-09-17
updated: 2026-09-17
manifest_ids: [R1, R2, R3, R4, RI1, RI2, RI3, RI4, RI5, RI6, RI7]
upstream:
  - workflow/artifacts/briefs/wp-r24-enforcement-proof-v1.md
  - workflow/artifacts/plans/wp-r24-enforcement-proof-v1.md
  - workflow/artifacts/tasks/wp-r24-enforcement-proof-v1.md
  - workflow/artifacts/reviews/wp-r24-enforcement-proof-v1.md
  - workflow/artifacts/verify/wp-r24-enforcement-proof-v1.md
orchestration:
  phase: ship
  status: ready-for-next-phase
  next_phase: reflect
  blockers: []
  user_checkpoint: ship-review
---

# WP-R24 — Enforcement Proof & Competitive Positioning Content - Ship

## Inputs

Full chain: brief (`brief-review` approved 2026-09-16, verbatim "Continue to plan"), plan
(`plan-review` approved 2026-09-16, verbatim "Plan is approved", amended once at Build for
`GateCapture.vue`), task (seven phases complete), review (`pass` — four findings found, four resolved
and re-verified), verify (`ship` — 12 automated checks pass, 1 manual QA pass, 1 skipped check with
`blocks_ship: no`, 0 findings).

## Ship Status

- Recommendation: **ship**
- Review result: `pass`, 0 open findings (4 found: F1–F3 P2, F4 P3; all resolved in place)
- Verification recommendation: `ship`, re-derived against the post-fix tree rather than cited from Review
- **Nothing has been committed, pushed, or opened as a PR.** The working tree carries 13 changed or new
  paths. The `ship` recommendation is a judgement about readiness, not a report that anything shipped —
  every outward action is listed under Blocked Handoff and each needs the user's explicit instruction.
- Release: **1.1.0 does not dispatch on this merge.** This is the seventh and last package, so the
  release becomes dispatchable once this and PR #69 are merged — but dispatch is a separate user action
  with its own checklist.

## Requirement Coverage

| Manifest ID | Status | Evidence |
|---|---|---|
| R1 | shipped | verify `## Manifest Coverage` R1 — capture in `README.md` and in `dist/index.html` ahead of the features grid |
| R2 | shipped | verify R2 — four claims at `1d5106f`, both re-wordings applied |
| R3 | shipped | verify R3 — named statement of where Spec Kit is stronger |
| R4 | shipped | verify R4 — 35/7/28/+1 = 36 with the counting rule; `[1.0.0]` zero-diff; Notion updated |
| RI1 | shipped | verify RI1 — citations match the Think verdicts at the pinned SHA |
| RI2 | shipped | verify RI2 — script, `--check` with positive and negative control, `docs/regenerating-the-gate-capture.md` |
| RI3 | shipped | verify RI3 — hygiene gate plus the review-F2 sandbox guard |
| RI4 | shipped | verify RI4 — payload comparison, divergence proven detectable |
| RI5 | shipped | verify RI5 — `dependencies` key absent; no `src/` touch, so no rebuild owed |
| RI6 | shipped | verify RI6 — derived at Build, not carried from the brief |
| RI7 | shipped | verify RI7 — three 1.1.0 entries; entry date and `version` both unedited |

## PR / CI Readiness

- `release.yaml` `pull_request.required: false`, `create_policy: user_requested_or_configured`. **No PR
  has been requested and none has been created.**
- **The base is `feat/wp-r20-ledger-closure`, not `release/1.1.0`.** PR #69 is still open
  (`state: OPEN`, `mergeable: MERGEABLE`, `mergeStateStatus: CLEAN`), and this branch is stacked on it
  at `22412f2` by the user's decision of 2026-09-16. Opening against `release/1.1.0` now would present
  WP-R20's commits as part of this package. The base retargets to `release/1.1.0` once #69 merges —
  the pattern WP-R19/PR #63 followed when stacked on PR #62.
- `release.yaml` `ci.provider: none` for this repo's own config, so no CI gate is satisfied here.
  GitHub Actions runs on a PR as a consequence of opening one; that is not a gate cleared in advance.

## Release Readiness

- `CHANGELOG.md` `[1.1.0]` carries three entries for this work. **The entry date (`2026-09-08`) is a
  placeholder and was deliberately not edited** — `docs/release-checklist.md` requires the real dispatch
  date to be committed before dispatch.
- `package.json` `version` remains `1.0.1`. Not pre-bumped: `release.yml` runs `npm version` itself, and
  pre-bumping double-bumps the release.
- `grep -rn "x_enforcement: warn-until-1.1.0" src/` returns **zero** — the checklist's marker-stripping
  step is a no-op for this release. The markers present are all `warn-until-1.2.0` (OI-67).
- Remaining between here and a dispatchable 1.1.0: merge PR #69, merge this, merge `release/1.1.0` into
  `main`, then dispatch `release.yml` with `bump: minor`.

## Source-of-Truth Status

`source-of-truth.yaml` declares `mode: optional` with `providers: []`, so **no source-of-truth update
was required**. Two Notion actions are nonetheless in play, both user-directed rather than owed:

- **04 — Reference: DONE.** Updated at Build Phase 6 from the Phase 5 derivation, per the user's Q3
  answer — total 34 → 36, a councils row, the counting rule with its re-derivation command, the "one is
  wrong" premise retired on evidence, review date refreshed. It also now records that nothing derives
  that page from the repo, so it will go stale again.
- **WP-R24 page: OUTSTANDING.** Moving it to Done with a PR reference is a user action and is listed
  under Blocked Handoff. Its Requirements section also still frames the count issue as "one is wrong on
  a public surface", which verification disproved; correcting that wording is part of the same handoff.

## Risk And Rollback

| Area | Risk | Rollback trigger | Rollback action | Owner | Evidence | Limits |
|---|---|---|---|---|---|---|
| Published capture | The gate's output changes and the published block silently becomes dated | `npm run capture:gate -- --check` fails | Re-run `npm run capture:gate`; the script refuses to publish if the gate ever permits the commit | agent | verify Automated Checks, negative control | Nothing runs `--check` automatically — it is not wired into CI, so staleness is detected only when someone runs it |
| Spec Kit claims | Upstream changes and the comparison becomes dated | A reader reports drift, or an upstream release notes the area | Re-verify against a new SHA and update the pinned links | user | verify RI1 | Claims are pinned at `1d5106f`, so they cannot become false — only dated. Nothing in this repo notices upstream movement |
| Site home layout | The slot injection regresses the hero region | `npm run site:build` fails, or visual report | Revert `Layout.vue`'s `home-hero-actions-after` template block; `GateCapture.vue` becomes inert | agent | verify Manual QA | No real-browser check ran — see the skipped check |
| Notion 04 — Reference | The page's counts drift from the repo again | Next skill added | Re-derive with `ls -d src/workflow/skills/*/ \| wc -l` and update | user | Build Phase 6 | Manual by construction; nothing derives the page |

## Blocked Handoff

Every item below needs the user's explicit instruction. None was inferred from the ship-review approval.

1. **Commit the chain** on `feat/wp-r24-enforcement-proof`. 13 paths: seven implementation files plus
   this chain's six artifacts. The pre-commit gate will run against them.
2. **Push the branch.**
3. **Open a PR against `feat/wp-r20-ledger-closure`** — *not* `release/1.1.0` while #69 is open.
   Retarget after #69 merges.
4. **Merge PR #69**, which is unblocked, mergeable and CI-green, and is the reason this branch is
   stacked rather than based on `release/1.1.0`.
5. **Update the Notion WP-R24 page**: move to Done with the PR reference, and correct the Requirements
   wording that says "one is wrong on a public surface" — neither published count was wrong, as recorded
   in the brief's Q3 and RI6.
6. **Dispatch 1.1.0** once all seven packages are merged, following `docs/release-checklist.md`:
   correct the CHANGELOG date at dispatch, do not pre-bump `package.json`.

## Architecture Notes

- role: Release Manager
- **decision**: recommending `ship` with everything unperformed. The chain's gates are met and its
  evidence is current; what remains is authorisation, not readiness. Conflating the two is what makes a
  ship artifact claim things that did not happen.
- **decision**: the PR base is named explicitly in two places (plan Branch Strategy, here) because it is
  the one mechanical mistake in this chain that would be expensive — merging WP-R20's commits into
  `release/1.1.0` a second time via this PR.
- **constraint**: `ci.provider: none`, so no CI status is claimed. The GitHub Actions run that follows a
  PR is a consequence of opening it, not a gate cleared here.
- **downstream — Reflect**: four follow-ups are owed, under the two-file ledger contract inherited from
  WP-R20 (search `open-items.yaml` **and** `open-items-archive.yaml` before allocating an `OI-N`):
  (1) `check-scope-fence` reads the active phase **number** and prose fails it — three consecutive
  chains have hit this and each rediscovered it from the same error message; (2) the unlocated
  `SPEC.md` referenced by the WP-R24 page; (3) 04 — Reference goes stale on counts by construction;
  (4) `check-artifacts` extracts the Requirement Manifest with an unanchored regex, so a brief that
  merely *mentions* `## Requirement Manifest` inline breaks its own ID extraction — this chain hit it
  and fixed it by rewording, which leaves the trap in place for the next author.

## Checkpoint Approval

- Checkpoint: ship-review
- Status: approved
- User's own words (verbatim, this turn): "Ship is approved"
- Approved: 2026-09-17, in response to this ship artifact's own content — the `ship` recommendation, the
  six blocked handoffs, the PR-base constraint, and the release position.
- **Scope of this approval, stated explicitly**: it approves the ship *decision* and the phase
  transition to Reflect. It does **not** authorise commit, push, PR creation, the merge of PR #69, the
  Notion WP-R24 update, or the 1.1.0 dispatch. Each remains under Blocked Handoff and needs its own
  instruction. This distinction is recorded rather than assumed because OI-92 records a prior chain in
  this repo where an approval was read wider than it was given.

## Exit Gate

- [x] Recommendation is one of `ship` / `hold` / `hold-with-waiver` — `ship`.
- [x] Requirement Coverage has one row per active R and RI — 11 rows, all citing the verify artifact.
- [x] PR, CI, release and source-of-truth status each explicit or marked not applicable.
- [x] Rollback names trigger, action and owner for all four areas, with limits stated.
- [x] No external action claimed without evidence — nothing external was performed.
- [x] User approved the ship decision — approved 2026-09-17, verbatim words recorded in `## Checkpoint Approval`; scope limited to the decision and the phase transition.

## Next Phase

Reflect, once the ship-review checkpoint is approved. Reflect does not require the handoff items to be
performed first — it records what the chain learned, and the outstanding handoffs are carried into it as
follow-ups with owners.
