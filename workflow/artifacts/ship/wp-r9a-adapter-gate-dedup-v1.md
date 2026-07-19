---
slug: wp-r9a-adapter-gate-dedup
version: 1
artifact: ship
status: blocked-for-user
created: 2026-07-19
updated: 2026-07-19
manifest_ids: [R1, R2, RI1, RI2]
upstream:
  - workflow/artifacts/briefs/wp-r9a-adapter-gate-dedup-v1.md
  - workflow/artifacts/plans/wp-r9a-adapter-gate-dedup-v1.md
  - workflow/artifacts/tasks/wp-r9a-adapter-gate-dedup-v1.md
  - workflow/artifacts/reviews/wp-r9a-adapter-gate-dedup-v1.md
  - workflow/artifacts/verify/wp-r9a-adapter-gate-dedup-v1.md
orchestration:
  phase: ship
  status: blocked-for-user
  next_phase: reflect
  blockers: []
  user_checkpoint: ship-review
---

# WP-R9a — Redundant Adapter-Gate Fix - Ship

## Inputs

- Verify: recommendation `ship`, 0 findings, 0 skipped checks, all 8 Automated Checks re-run
  fresh this Ship phase (applying step 4a below).
- Review: recommendation `pass`, 0 findings.
- `workflow/config/release.yaml` — no release gate configured; branch gate required, satisfied.
- `workflow/config/source-of-truth.yaml` — `mode: optional`, `providers: []`.

## Ship Status

- Recommendation: **ship**
- Review result: pass (0 findings)
- Verification recommendation: ship
- PR / CI: not applicable (not configured, not requested this session)
- Source-of-truth: not applicable
- Release: not applicable
- **Step 4a applied**: fetched `origin/main`, compared against local branch's base — local
  `main` is byte-identical to `origin/main` (both at `c6b9b7f`), no divergence to surface.

## Requirement Coverage

| Manifest ID | Status | Evidence | Notes |
|---|---|---|---|
| R1 | shipped | 10-scenario worked-example trace, reproduced 3x (Build, Review, Test) | All scenarios match acceptance criteria |
| R2 | shipped | Marker/path comparison against `bin/agentsmyth.mjs`, reproduced 3x | Exact match every time |
| RI1 | shipped | `git diff --stat`, reproduced 3x | Exactly one file changed |
| RI2 | shipped | Full suite + jargon grep, reproduced 3x across Build/Review/Test | Zero regression, zero jargon |

## PR / CI Readiness

not applicable — not configured, not requested this session.

## Release Readiness

not applicable — no package/deployment gate configured or in scope. This is an instruction-only
change to `src/setup/SKILL.md`, shipped to future `agentsmyth init` consumers via the next
`dist/setup-bundle.md`, not via any already-published package version.

## Source-of-Truth Status

not applicable per `source-of-truth.yaml`.

## Risk And Rollback

- Residual risk: the one item Review flagged (repos that ran `init` before this fix existed
  may still have a pre-existing redundant per-repo adapter file) — accepted as out of this
  brief's stated scope, not a gap in what was promised. No other residual risk; Review and
  Verify both report 0 findings.
- Rollback trigger: the dedup check causing a false skip (an agent incorrectly reads a global
  file as having the marker pair when it doesn't, or vice versa) — would surface as a missing
  or duplicate adapter gate in a real repo.
- Rollback action: `git revert` the commit once made — purely additive prose change, the
  original placement table is untouched, only gated behind a new conditional. Revert restores
  the prior always-place behavior exactly.
- Rollback owner: repo maintainer (user).
- Limits of rollback: none identified — single file, no code, no schema, no external state.

## Blocked Handoff

none.

## Architecture Notes

- role: Senior DevOps
- decision: Recommending `ship` — 0 findings from Review and Verify, all 4 requirements
  independently re-verified 3x across the chain's phases.
- decision: Applied this chain's sibling WP-R9's own new step 4a (origin/main staleness check)
  for the second time now — found no divergence again, consistent with the first application.
- decision: Nothing on this branch is committed yet. Consistent with this session's standing
  instruction not to commit without being asked.
- downstream: Reflect should note this is the first of the R9 family (R9a/R9b/R9c) to ship —
  R9b inherits the proven dedup logic verbatim when it starts; R9c is unaffected (different
  file). Per the user's explicit sequencing, R9c starts next, built on top of R9a, not R9b.

## Exit Gate

- [x] Recommendation is `ship`.
- [x] Every R and RI has a coverage row, all `shipped`.
- [x] Rollback trigger and action defined.
- [x] All configured gates checked or marked not applicable.
- [ ] User approved proceeding to Reflect — pending. Commit/push/PR also unrequested.

## Next Phase

Reflect — pending your go-ahead. Also pending: whether to commit this branch's work now.
