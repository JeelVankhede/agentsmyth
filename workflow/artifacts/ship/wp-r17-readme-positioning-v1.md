---
slug: wp-r17-readme-positioning
version: 1
artifact: ship
status: ready-for-next-phase
created: 2026-08-08
updated: 2026-08-08
manifest_ids: [R1, R2, R3, RI1, RI2, RI3]
upstream:
  - workflow/artifacts/briefs/wp-r17-readme-positioning-v1.md
  - workflow/artifacts/plans/wp-r17-readme-positioning-v1.md
  - workflow/artifacts/tasks/wp-r17-readme-positioning-v1.md
  - workflow/artifacts/reviews/wp-r17-readme-positioning-v1.md
  - workflow/artifacts/verify/wp-r17-readme-positioning-v1.md
orchestration:
  phase: ship
  status: ready-for-next-phase
  next_phase: reflect
  blockers: []
  user_checkpoint: ship-review
---

# WP-R17 — README & Docs Positioning Rewrite - Ship

## Inputs

- Verify recommendation: `ship` (no findings; every R/RI `pass`).
- Review recommendation: `pass-with-risk` (P2 findings fixed in-review; one P3 by-design observation).
- `workflow/config/release.yaml`: `release.required: false`; branch gate required; PR/CI/release/package not required; rollback required when external handoff is in scope.
- `workflow/config/source-of-truth.yaml`: `mode: optional`, `providers: []` — no formal SoT gate.
- Repo state: branch `feat/wp-r17-readme-positioning`, 0/0 divergence vs `origin/main` (fetched this phase); `README.md` modified + this chain's six artifacts untracked; nothing committed yet.

## Ship Status

- Recommendation: **ship** (pending ship-review checkpoint + user-gated commit)
- Review result: pass-with-risk
- Verification recommendation: ship
- PR / CI: not required by config; no PR created (repo policy: PR only on explicit user request)
- Source-of-truth: not a required gate; the R2 Notion edit is nonetheless done and evidenced (below)
- Release: not in this WP's scope — the npm `1.0.1` publish is WP-R15; per the parent "1.0.1 — Patch Release Work Plan" this branch must merge to `main` *before* the WP-R15 dispatch fires

## Requirement Coverage

| Manifest ID | Status | Evidence | Notes |
|---|---|---|---|
| R1 | shipped | `README.md:32` (four competitors named + linked), `:34` (differentiator), section L30 < `## Setup` L40 | Local change; lands on `main` at merge |
| R2 | shipped | Notion page 01 re-fetch 2026-08-08T11:57Z — "scaffold" removed; URL below | External write, completed + verified |
| R3 | shipped | `README.md:36-38` no-paid-tier paragraph | Local change |
| RI1 | shipped | `README.md:28` bullet consistent with `:38` paragraph | — |
| RI2 | shipped | `git diff --stat` = README-only; 0 `site/` changes | — |
| RI3 | shipped | Notion re-fetch: exactly one bullet changed | — |

## PR / CI Readiness

not applicable — `release.yaml` marks PR `required: false` (`create_policy: user_requested_or_configured`) and CI `required: false`. No PR opened; the user has not requested one this session. Branch gate (required) satisfied: work is on `feat/wp-r17-readme-positioning`, not `main`.

## Release Readiness

No release action in this WP. `release.yaml` `release.required: false`. The `1.0.1` npm publish is WP-R15's deliverable (`release.yml` `workflow_dispatch(bump: patch)`), gated on the user's npm Trusted Publisher registration — out of scope here. Sequencing carried forward: **merge this branch to `main` before firing the WP-R15 dispatch**, so `1.0.1` ships with all three patch-release WPs (R15/R16/R17) together rather than splitting.

Release-level follow-ups owned by the parent plan (not this WP, per brief A3): the `CHANGELOG.md` `1.0.1` entry covering R15/R16/R17, and updating Notion page 05 / the Release Log once the dispatch succeeds.

## Source-of-Truth Status

**Updated** (though not a formally required gate — `source-of-truth.yaml` `mode: optional`, `providers: []`). R2 edited Notion page 01 "What agentsmyth Is Not":
- Page: https://app.notion.com/p/384972bdebbb814aba61d2cccff9d2e2
- Before: "Not a domain-opinionated scaffold — domain attachment happens during setup, driven by the user's repo"
- After: "Not domain-opinionated — domain attachment happens during setup, driven by the user's repo, not baked into a template's guesses"
- Evidence ([safety-3]): same-session re-fetch confirmed the change and that no other content on the page changed.

## Risk And Rollback

- Residual risk (all Low, all carried to Reflect): (1) intended README-vs-Notion "scaffolder" divergence until WP-R6 ships (review P3); (2) no automated check guards positioning prose — a future edit could regress wording silently; (3) one competitor link (`agent-preflight.szybnev.cc`) is a personal-domain homepage, less durable than a github.com repo. None block ship.
- Rollback trigger: user rejects the positioning wording after merge, or a competitor link is found dead/wrong.
- Rollback action: for the README — `git revert` the WP-R17 merge commit (or delete the `## Where it fits` section, restoring `README.md` to its pre-WP state); for Notion — re-run the reverse one-bullet `update_content` on page 01 restoring the original "Not a domain-opinionated scaffold" text.
- Rollback owner: user.

## Blocked Handoff

none — no external action is blocked. The one external write (R2/Notion) is already done. The only remaining external actions belong to WP-R15 (npm registration + release dispatch), which is a separate work package, not a blocked handoff of this chain.

## Architecture Notes

- role: Senior DevOps
- decision: Recommend **ship**. Verify=ship, Review=pass-with-risk with all P2s already fixed, all six R/RI covered, no required release/PR/CI gate configured. The change is local + one completed external edit.
- decision: Deliberately did **not** add the `CHANGELOG.md` 1.0.1 entry here, despite offering it earlier — brief A3 scopes the changelog as a release-level item (owned by the parent 1.0.1 plan, written once R15/R16/R17 all land), and Ship must not expand this WP's scope. Recorded as a release-level follow-up instead.
- constraint: Repo policy — commit/push and PR only on explicit user request; this artifact does not commit. `[safety-3]` — external Notion state cited via live re-fetch, not asserted.
- constraint: Ship does not edit product files; no code touched this phase.
- downstream: On ship-review approval + user-authorized commit, the branch is ready to merge to `main`. That merge is the gating prerequisite for WP-R15's release dispatch. Reflect should record the three Low residual risks and the release-level follow-ups (CHANGELOG entry, Notion page 05 update, R16/R17 Done-marking) as open items.

## Checkpoint Approval

- Checkpoint: ship-review
- Status: approved
- User's own words (verbatim, this turn): "Ship is approved"
- Note: ship decision approved; commit of the branch was **not** separately authorized this turn — branch remains uncommitted pending explicit user go-ahead (repo policy: commit/push only when asked).

## Exit Gate

- [x] Recommendation is ship / hold / hold-with-waiver. → ship
- [x] Every R and RI has a coverage row.
- [x] Rollback trigger and action defined.
- [x] All configured gates checked or marked not applicable with config reference.

## Next Phase

Reflect — once the ship-review checkpoint is approved.
