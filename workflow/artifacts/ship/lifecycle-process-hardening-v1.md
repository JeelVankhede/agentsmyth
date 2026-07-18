---
slug: lifecycle-process-hardening
version: 1
artifact: ship
status: blocked-for-user
created: 2026-07-18
updated: 2026-07-18
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, RI1, RI2, RI3, RI4]
upstream:
  - workflow/artifacts/briefs/lifecycle-process-hardening-v1.md
  - workflow/artifacts/plans/lifecycle-process-hardening-v1.md
  - workflow/artifacts/tasks/lifecycle-process-hardening-v1.md
  - workflow/artifacts/reviews/lifecycle-process-hardening-v1.md
  - workflow/artifacts/verify/lifecycle-process-hardening-v1.md
orchestration:
  phase: ship
  status: blocked-for-user
  next_phase: reflect
  blockers: []
  user_checkpoint: ship-review
---

# Lifecycle Process Hardening - Ship

## Inputs

- Verify: `workflow/artifacts/verify/lifecycle-process-hardening-v1.md` — recommendation
  `ship`, 0 findings, 0 skipped checks, all 13 Automated Checks re-run fresh this Ship phase
  (see below, applying this chain's own new step 4a for the first time).
- Review: `workflow/artifacts/reviews/lifecycle-process-hardening-v1.md` — recommendation
  `pass`, 0 findings.
- `workflow/config/release.yaml` — `release.required: false`,
  `default_recommendation_when_no_release_gate: ship`; `pull_request.required: false,
  create_policy: user_requested_or_configured`; `ci.required: false, provider: none`;
  `branch.required: true`; `rollback.required: when_release_or_external_handoff_is_in_scope`.
- `workflow/config/source-of-truth.yaml` — `mode: optional`, `providers: []`.

## Ship Status

- Recommendation: **ship** (meaning: this Build unit is complete, verified, and ready for you
  to commit/merge/PR at your discretion — not that anything has been committed, pushed, or
  released externally)
- Review result: pass (0 findings)
- Verification recommendation: ship
- PR / CI: not applicable (not configured, not requested this session)
- Source-of-truth: not applicable (no provider configured; self-contained process/validator
  hardening, no external tracker involved)
- Release: not applicable (no package/deployment gate configured or in scope)
- **Step 4a applied** (this chain's own new rule, exercised on itself for the first time):
  fetched `origin/main`, compared against the local branch's base — local `main` is byte-
  identical to `origin/main` (both at `deaa98f`), no divergence to surface.

## Requirement Coverage

| Manifest ID | Status | Evidence | Notes |
|---|---|---|---|
| R1 | shipped | `check-coverage-range-shorthand.mjs`; fixture `v`; 45-file full-tree run, 0 errors | Rescoped mid-Build per user's Option 1 decision |
| R2 | shipped | `ci.yml` diff; all 4 scripts pass (4/4, 5/5, 16/16, 32/32) | Now CI-enforced |
| R3 | shipped | `lifecycle-ship/SKILL.md` step 4a — applied to this very Ship phase, see above | Self-verifying |
| R4 | shipped | `lifecycle-ship/SKILL.md` step 6a | Nothing to classify this chain — Review found 0 findings, no ambiguous discovery |
| R5 | shipped | `rules.md` new `## Approval` section | Jargon-free |
| R6 | shipped | `lifecycle-build/SKILL.md` step 6b | Jargon-free |
| R7 | shipped | `check-manifest-coverage.mjs`/`check-coverage-ledger.mjs` reworded | Pre-existing jargon leak fixed, substance preserved |
| RI1 | shipped | Rebuilt `dist/` grep — 2 benign generic-example matches only | Reproduced 3× across Build/Review/Test |
| RI2 | shipped | Full `build/validate/violations:test/conformance:test`, reproduced 4× across Build/Review/Test/Ship | Zero regression |
| RI3 | shipped | `git diff package.json` empty, reproduced 4× | No new dependency |
| RI4 | shipped | Full-tree run, 45 files, 0 errors, reproduced 3× (Build, Review, Test) | |

## PR / CI Readiness

not applicable — `release.yaml`'s `pull_request.required: false`,
`create_policy: user_requested_or_configured`. No PR has been created; none requested this
session. `ci.required: false, provider: none` — not a Ship-blocking gate, though this chain's
own R2 fix means `ci.yml` now runs 4 more test scripts than it did at the start of this chain
(6 total, was 2), and R7's fix means the CI-run `conformance:test`/`violations:test` suites
exercise jargon-free validator source.

## Release Readiness

not applicable — `release.yaml`'s `release.required: false`; this chain touches no
`package.json` version, publish script, or deployment surface. "Ship" here means the branch's
diff is complete and mergeable, not that a package version went out.

## Source-of-Truth Status

not applicable per `source-of-truth.yaml` (`mode: optional`, `providers: []`). No external
tracker or documentation source is affected by this self-contained process/validator chain.

## Risk And Rollback

- Residual risk: none. Both Review and Verify report 0 findings; Verify's Findings/Skipped
  Checks are both empty.
- Rollback trigger: any of the following behaving incorrectly once used in real lifecycle
  work — the new range-shorthand validator false-positiving on a legitimate Requirement
  Coverage row; any of the 4 newly-CI-wired scripts failing in CI despite passing locally
  (environment difference); the new Ship/Build Workflow steps or Approval rule producing
  confusing or contradictory guidance in practice.
- Rollback action: `git revert` the commit(s) once made — all changes are additive (a new
  validator, new CI steps, new Workflow steps, a new rules.md section, 4 reworded comment
  lines) with no existing behavior removed or retyped, so revert is clean. No data migration,
  no external state to unwind.
- Rollback owner: repo maintainer (user).
- Limits of rollback: none identified — this chain touches `src/workflow/`, `scripts/`,
  `.github/workflows/`, and `test/` only; no consumer-facing shipped bundle version was
  published (this fix ships to future contributors and `agentsmyth init` consumers via the
  next `dist/workflow-bundle.md`, not via any already-published package version).

## Blocked Handoff

none — nothing in this chain requires external action, approval, or access beyond the
commit/merge decision itself, which is reserved for you.

## Architecture Notes

- role: Senior DevOps
- decision: Recommending `ship` — 0 findings from both Review and Verify, all 11 requirements
  independently re-verified at every phase boundary (Build → Review → Test → Ship, 3-4×
  reproduction on the key commands).
- decision: Applied this chain's own new step 4a to itself for the first time this Ship phase
  — found local `main` byte-identical to `origin/main`, nothing to surface. A clean
  self-consistency data point, not just an assertion that the rule works.
- decision: Nothing on this branch is committed yet (confirmed via `git status` — 8 modified,
  6 untracked files, all from this chain). Consistent with this repo's established Ship
  precedent and this session's standing instruction not to commit without being asked.
- constraint: This is a source-repo (agentsmyth-on-itself) chain — "ship" means the branch's
  diff is complete and ready for your review/merge decision, not that anything was published
  or deployed.
- downstream: Reflect should note this chain's own dogfooding result — R1's rescope and R7's
  discovery both happened because this chain's Build applied evidence-first discipline before
  the corresponding new rules (R6, and the R3/R7 jargon-check habit) even existed as written
  rules. Worth naming as validation that the rules capture something real, not speculative.

## Exit Gate

- [x] Recommendation is `ship`.
- [x] Every R and RI has a coverage row, all `shipped`.
- [x] Rollback trigger and action defined.
- [x] All configured gates checked or marked not applicable with config reference
      (`release.yaml`, `source-of-truth.yaml`).
- [ ] User approved proceeding to Reflect — pending. Commit/push/PR are also unrequested and
      not assumed by this recommendation.

## Next Phase

Reflect — pending your go-ahead. Also pending: whether to commit this branch's work now (and
if so, whether to push and/or open a PR).
