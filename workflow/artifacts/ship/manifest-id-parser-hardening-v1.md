---
slug: manifest-id-parser-hardening
version: 1
artifact: ship
status: blocked-for-user
created: 2026-07-18
updated: 2026-07-18
manifest_ids: [R1, R2, R3, RI1, RI2, RI3]
upstream:
  - workflow/artifacts/briefs/manifest-id-parser-hardening-v1.md
  - workflow/artifacts/plans/manifest-id-parser-hardening-v1.md
  - workflow/artifacts/tasks/manifest-id-parser-hardening-v1.md
  - workflow/artifacts/reviews/manifest-id-parser-hardening-v1.md
  - workflow/artifacts/verify/manifest-id-parser-hardening-v1.md
orchestration:
  phase: ship
  status: blocked-for-user
  next_phase: reflect
  blockers: []
  user_checkpoint: ship-review
---

# Manifest-ID Parser Hardening - Ship

## Inputs

- Verify: `workflow/artifacts/verify/manifest-id-parser-hardening-v1.md` — recommendation
  `ship`, 0 findings, 0 skipped checks, all 9 Automated Checks re-run fresh this Ship phase
  (see below).
- Review: `workflow/artifacts/reviews/manifest-id-parser-hardening-v1.md` — recommendation
  `pass` (1 P2 + 3 P3 found, all fixed and independently re-verified in Task Phase 6, 0 open
  findings remain).
- `workflow/config/release.yaml` — `release.required: false`,
  `default_recommendation_when_no_release_gate: ship`; `pull_request.required: false,
  create_policy: user_requested_or_configured`; `ci.required: false, provider: none`;
  `branch.required: true`; `rollback.required: when_release_or_external_handoff_is_in_scope`.
- `workflow/config/source-of-truth.yaml` — `mode: optional`, `providers: []`.

## Ship Status

- Recommendation: **ship** (meaning: this Build unit is complete, verified, and ready for you
  to commit/merge/PR at your discretion — not that anything has been committed, pushed, or
  released externally)
- Review result: pass (0 open findings)
- Verification recommendation: ship
- PR / CI: not applicable (not configured, not requested)
- Source-of-truth: not applicable (no provider configured; this is a self-contained fix to
  this repo's own validators, no external tracker involved)
- Release: not applicable (no package/deployment gate configured or in scope)

## Requirement Coverage

| Manifest ID | Status | Evidence | Notes |
|---|---|---|---|
| R1 | shipped | `check-manifest-coverage.mjs` `taskDerivedIds()` rewrite; fixture `manifest-id-false-positive/`, exit 0 | No spurious extraction from compound tokens or incidental prose |
| R2 | shipped | `check-coverage-ledger.mjs` `waiverIds()` (Phase 3 + Phase 6 sub-label fix); fixture `coverage-ledger-sublabel/` proves both directions in one run | Widened during Review's fix pass (Task Phase 6) after Review found the original narrower fix had its own false-negative edge case |
| R3 | shipped | `check-phase-map.mjs` + shared `parseIdList()`; fixture `phase-map-parenthetical/`, exit 0 | Parenthetical annotations parsed correctly, no orphan |
| RI1 | shipped | `npm run validate` (exit 0) + `npm run violations:test` (20/20), reproduced across Build/Review/Test/Ship | Zero regression against the full existing 9+ chain artifact tree |
| RI2 | shipped | `npm run conformance:test` (12/12); `ci.yml` now runs it on every push/PR | 3 new fixtures (2 from Build, 1 from Review's fix pass), all CI-enforced |
| RI3 | shipped | `npm run build` exit 0; `git diff package.json` empty, reproduced 4× across the chain | No new runtime dependency |

## PR / CI Readiness

not applicable — `release.yaml`'s `pull_request.required: false`,
`create_policy: user_requested_or_configured`. No PR has been created; none was requested
this session. `ci.required: false, provider: none` — no CI gate configured for this repo as a
Ship-blocking requirement, though this chain itself *added* a new CI step
(`npm run conformance:test` in `.github/workflows/ci.yml`) as one of its own fixes (Review P2)
— that step will run automatically once this branch is pushed and a PR is opened, but is not
itself a precondition for this Ship recommendation.

## Release Readiness

not applicable — `release.yaml`'s `release.required: false`, and this chain does not touch
`package.json`'s version, publish scripts, or any deployment surface. Nothing in this chain is
npm-published or otherwise externally released by shipping it; "ship" here means the branch's
diff is complete and mergeable, not that a package version went out.

## Source-of-Truth Status

not applicable per `source-of-truth.yaml` (`mode: optional`, `providers: []`). No external
tracker or documentation source is affected by this chain — it is a self-contained fix to
`src/workflow/validators/` and `test/`.

## Risk And Rollback

- Residual risk: none carried forward. Review's original 1 P2 + 3 P3 findings were all fixed
  and independently re-verified (Task Phase 6, then re-confirmed by Review and again by Test).
  `workflow/artifacts/reviews/manifest-id-parser-hardening-v1.md`'s Residual Risk section
  reads `none`.
- Rollback trigger: any of the 3 hardened validators (`check-manifest-coverage.mjs`,
  `check-coverage-ledger.mjs`, `check-phase-map.mjs`) producing an incorrect result once used
  in real lifecycle work — either a false positive (blocking a legitimate artifact) or a false
  negative (missing a real coverage/waiver gap it should have caught).
- Rollback action: `git revert` the commit(s) once made (all changes are additive/behavioral —
  a new exported helper, 3 rewritten extraction functions, 1 new CI step, 3 new test
  fixtures — no schema, frontmatter contract, or existing property was removed or retyped, so
  revert is clean). No data migration, no external state to unwind.
- Rollback owner: repo maintainer (user).
- Limits of rollback: none identified — this chain touched no runtime behavior outside
  `src/workflow/validators/`, `test/`, and `.github/workflows/ci.yml`; no consumer-facing
  shipped bundle version was published (these validators are dev-tooling for this repo's own
  dogfooded lifecycle, not part of the npm package's `files` list — confirmed by
  `package.json`'s `files` field not including `src/workflow/validators/` or `test/`).

## Blocked Handoff

none — nothing in this chain requires external action, approval, or access beyond the
commit/merge decision itself, which is reserved for you.

## Architecture Notes

- role: Senior DevOps
- decision: Recommending `ship` (not `hold-with-waiver`) — all 4 Review findings were fixed
  and independently re-verified within the same chain, not waived; Verify's Residual Risk and
  Review's Residual Risk both read `none`.
- decision: Nothing on this branch is committed yet (confirmed via `git status` — 6 modified,
  9 untracked files, all from this chain). This is consistent with this repo's own established
  Ship precedent (`power-skills-spine-v1.md`): "ship" at this checkpoint means the branch's
  diff is complete, verified, and ready for a merge/commit decision — not that a commit,
  push, or PR has happened. Those actions remain separately gated behind your explicit
  request, per this session's standing instruction not to commit without being asked.
- constraint: This is a source-repo (agentsmyth-on-itself) chain — "ship" cannot mean
  "publish to npm" or "deploy," since neither is in scope. `src/workflow/validators/` is
  dev-tooling for this repo's own dogfooded lifecycle (confirmed not present in
  `package.json`'s `files` list), so this fix ships to future contributors to this repo, not
  to `agentsmyth` package consumers.
- downstream: Reflect should record the Review→Build→Review-fix cycle (1 P2 + 3 P3 found,
  fixed same-chain, re-verified 3× — Review, Test, Ship) as a clean instance of the "Fix all"
  pattern working end-to-end with full evidence at each step, and should assess whether the
  CI-conformance-suite gap (now fixed) reveals a broader pattern worth a follow-up open item
  (e.g. auditing whether any other locally-runnable-but-CI-unenforced test scripts exist).

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
