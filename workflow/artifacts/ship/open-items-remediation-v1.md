---
slug: open-items-remediation
version: 1
artifact: ship
status: blocked-for-user
created: 2026-09-08
updated: 2026-09-08
manifest_ids:
  - R1
  - R2
  - R3
  - R4
  - R5
  - R6
  - R7
  - R8
upstream:
  - workflow/artifacts/briefs/open-items-remediation-v1.md
  - workflow/artifacts/plans/open-items-remediation-v1.md
  - workflow/artifacts/tasks/open-items-remediation-v1.md
  - workflow/artifacts/reviews/open-items-remediation-v1.md
  - workflow/artifacts/verify/open-items-remediation-v1.md
orchestration:
  phase: ship
  status: blocked-for-user
  next_phase: reflect
  blockers: []
  user_checkpoint: ship-review
---

# Open-Items Remediation (pre-1.1.0) — Ship

## Inputs

- Verify v1 — recommendation `ship`, R1–R8 all `pass`, two checks skipped with owners.
- Review v1 — recommendation `pass`, six findings, zero open.
- `workflow/config/release.yaml` — only `branch` is a required gate; `generated_output` is required
  when changed. `release.required: false`, and PR/CI/deployment/package are all `required: false`.
- `workflow/config/source-of-truth.yaml` — `mode: optional`, `default_required: false`,
  `providers: []`.
- Branch `chore/open-items-triage-1.1.0` at `b39b585`, 4 commits unpushed, 21 ahead of
  `release/1.1.0`, 84 ahead of `main`.

## Ship Status

- Recommendation: **ship** — every required gate has evidence and no unwaived blocker remains. The
  outward actions are not part of that recommendation; they are listed under Blocked Handoff and
  wait on the user.
- Review result: `pass`.
- Verification recommendation: `ship`.
- PR / CI: PR #66 is open against `release/1.1.0` and `MERGEABLE`. Its head is `b8fe90a`, four
  commits behind local `b39b585` — the entire Review, remediation and Test of this chain is not on
  the PR yet. The last CI run (33546849673, `validate` green) therefore describes the *old* head
  and must not be read as covering this work. CI is `required: false` in config; this is recorded
  as fact, not as a satisfied gate.
- Source-of-truth: **not applicable** — no provider is configured.
- Release: **not this chain.** 1.1.0 publishes from `main` via `release.yml` after its own steps;
  this chain contributes the CHANGELOG entry and deliberately does not touch `package.json`.

## Requirement Coverage

| Manifest ID | Status | Evidence | Notes |
|---|---|---|---|
| R1 | shipped | verify v1 R1 — `sh -n` both copies, `set -e` reachability probe, both forms present once each | Also observed live: this chain's own commits ran the gate. |
| R2 | shipped | verify v1 R2 — fixture `fw` inside 210/210, plus the numeric-selection probe | |
| R3 | shipped | verify v1 R3 — three skill edits present, conformance 48/48 including the byte-lock | Prose-only; owned by OI-89. |
| R4 | shipped | verify v1 R4 + Manual QA — full upgrade rehearsal against the published 1.0.0 tarball | Found F6. |
| R5 | shipped | verify v1 R5 — root-resolution 21/21 including four `gitcwd-*` | |
| R6 | shipped | verify v1 R6 — `entries: []` and `check-artifacts` clean without the baseline | Recorded retroactively; first Test phase it has had. |
| R7 | shipped | verify v1 R7 — full mutation audit, `0/221 undefended` across 30 validators | Recorded retroactively; measured, not inherited. |
| R8 | shipped | verify v1 R8 — six findings fixed, each with its own evidence | |

## PR / CI Readiness

PR #66 exists and is mergeable, but is four commits stale. Updating it requires a push, which is an
outward action and is not inferred from any approval given so far. Once pushed, CI re-runs the
`validate` job against the real head; that job is a subset of what has already been run locally
(validate plus the suites), so no result is expected to change — which is a prediction, not
evidence, and the run itself is what settles it.

## Release Readiness

The 1.1.0 release is a separate sequence, tracked by OI-87, and this chain reaches only its third
step. What this chain leaves the release:

- `CHANGELOG.md` has its 1.1.0 entry, dated `2026-09-08`. `docs/release-checklist.md` requires a
  real date; if the dispatch slips, correct it before the run.
- `package.json` stays at `1.0.1`. `release.yml` runs `npm version <bump>` itself, so a pre-bumped
  repo publishes the version after the intended one. This is the checklist's first entry and the
  single most reversible-looking mistake in the sequence.
- OI-35 is still open and blocks the release, not this chain: the npm audit position must be
  re-derived rather than re-asserted, since the set grew from 3 to 8, two are now high, and four
  report `fixAvailable`.
- The full mutation audit that `release.yml` runs on dispatch has already been run at head here and
  passes, so the long pole in that workflow is not expected to surprise anyone.

## Source-of-Truth Status

not applicable — `source-of-truth.yaml` configures no provider, and
`require_user_request_or_config_for_external_write` is honoured by making no external write. The one
outstanding external update in the wider release (moving the Notion WP-R22 page to Done) belongs to
OI-87, not to this chain.

## Risk And Rollback

- Residual risk: three carried open items, none a defect in this branch — OI-83 (why the coverage
  gate did not execute), OI-88 (`--dir` operand sweep), OI-89 (prose-only skill rules). Plus the
  CHANGELOG date, and the fact that this machine's global definitions tree now runs 1.1.0-candidate
  definitions for every repo on it.
- Rollback trigger: a consumer reports `agentsmyth check` resolving a validator from an unexpected
  location, or a council record rejected with a mode the skill told it to write.
- Rollback action: revert `ecbef64`. It is the only commit in this chain that changes shipped
  behaviour — the other three are records, the changelog, and the verify artifact. Reverting it
  restores `definitions_root`-first resolution and the previous expected mode, and drops fixture
  `jd` and the two conformance checks with it.
- Rollback owner: user.
- Rollback evidence: `git revert ecbef64` on a branch, then `npm run validate`, `violations:test`
  and `conformance:test` — expect 209/209 and 46/46, the pre-chain counts.
- Rollback limits: nothing has been published, so rollback is a branch operation only. Once 1.1.0
  publishes, a consumer who has run `prepare` holds the new resolution order and a revert does not
  reach them until they run `prepare` again.

## Blocked Handoff

Two outward actions, both the user's to authorise, neither performed. They are recorded here and as
the pending `ship-review` checkpoint rather than as `orchestration.blockers` — `check-release-readiness`
rejects a `ship` recommendation that carries blockers, and it is right to: no gate is blocked and no
evidence is missing. What is outstanding is a decision, which the checkpoint models. Conflating the
two would have reported this chain as having unfinished verification work when it has none.

1. **Push** `chore/open-items-triage-1.1.0` (4 commits) to update PR #66 and let CI run against the
   real head.
2. **Merge** PR #66 into `release/1.1.0`.

Neither is inferred from the approval to commit. The commits exist locally; nothing has left this
machine.

## Architecture Notes

- role: Senior DevOps
- decision: recommend `ship` while holding the chain at `blocked-for-user`. The gates are met and
  the work is done; what is missing is a decision, not evidence. Conflating the two would let a
  ship recommendation carry an unapproved push along with it.
- decision: step 4a was run unconditionally, as R3 now requires. The base has not advanced —
  0 behind both `origin/release/1.1.0` and `origin/main` — so 4b's identifier reconciliation was
  not needed. Recorded because "not needed" and "not checked" look identical in an artifact that
  omits them.
- constraint: CI's last green run describes a head four commits old. It is reported as such rather
  than counted as this chain's evidence.
- assumption Reflect must preserve: `package.json` untouched at `1.0.1`.
- downstream: OI-87's remaining release steps are unchanged by this chain except step 3 (the
  CHANGELOG entry), which is now done.

## Checkpoint Approval

- Checkpoint: ship-review
- Status: **pending** — the user has not yet responded to this ship decision. This section stays
  pending until they do; it must never be self-authored, and Reflect is gated on it.
- User's own words (verbatim, this turn): not yet given.

## Exit Gate

- [x] Recommendation is `ship`.
- [x] Every R (R1–R8) has a coverage row; this chain declares no RI.
- [x] Rollback trigger and action defined, with the one commit that carries shipped behaviour named.
- [x] All configured gates checked or marked not applicable against `release.yaml`/
      `source-of-truth.yaml`: `branch` pass (non-default branch, 4 commits unpushed);
      `generated_output` pass (verify v1's Generated Output Evidence); `pull_request` open but
      stale, recorded as fact; `ci` not required by config and its last run describes an older
      head; `release`, `deployment`, `package`, `docs` not required by config; `source_of_truth`
      not applicable, no provider configured; `rollback` recorded above.
- [ ] Checkpoint `ship-review` approved — **pending**, and the reason this artifact is
      `blocked-for-user`.

## Next Phase

blocked — Reflect cannot begin until the `ship-review` checkpoint carries the user's own words.
`check-lifecycle --phase reflect` enforces that mechanically, which is the intended behaviour here,
not an obstacle to work around.
