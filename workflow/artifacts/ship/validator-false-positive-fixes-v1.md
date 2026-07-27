---
slug: validator-false-positive-fixes
version: 1
artifact: ship
status: ready-for-next-phase
created: 2026-07-27
updated: 2026-07-27
manifest_ids: [R1, R2, R3, RI1]
upstream:
  - workflow/artifacts/briefs/validator-false-positive-fixes-v1.md
  - workflow/artifacts/plans/validator-false-positive-fixes-v1.md
  - workflow/artifacts/tasks/validator-false-positive-fixes-v1.md
  - workflow/artifacts/reviews/validator-false-positive-fixes-v1.md
  - workflow/artifacts/verify/validator-false-positive-fixes-v1.md
orchestration:
  phase: ship
  status: ready-for-next-phase
  next_phase: reflect
  blockers: []
  user_checkpoint: ship-review
---

# Validator false-positive fixes (OI-29, OI-37, OI-38) - Ship

## Inputs

- Review recommendation: `pass`, no findings.
- Verify recommendation: `ship`, all automated checks pass, one low-risk skip recorded (`npm run build`, not required — no bundle-feeding path touched).
- `workflow/config/release.yaml`: `release.required: false`; only the `branch` gate is required (evidence: git status + branch name). `pull_request` and `ci` gates both `required: false`.
- `workflow/config/source-of-truth.yaml`: `mode: optional`, `default_required: false` — not configured as required for this chain, no external source was referenced.

## Ship Status

- Recommendation: ship
- Review result: pass
- Verification recommendation: ship
- PR / CI: not applicable — not configured as a required gate; not yet requested by the user (per standing instruction, PR creation always needs explicit confirmation, separate from this recommendation)
- Source-of-truth: not required
- Release: not required (`release.yaml`: `release.required: false`)

## Requirement Coverage

| Manifest ID | Status | Evidence | Notes |
|---|---|---|---|
| R1 | shipped | `workflow/artifacts/verify/validator-false-positive-fixes-v1.md` Manifest Coverage row R1 | `check-waivers.mjs` fix, independently re-verified at Test. |
| R2 | shipped | `workflow/artifacts/verify/validator-false-positive-fixes-v1.md` Manifest Coverage row R2 | `check-scope-fence.mjs` fix; full real `workflow/artifacts` tree confirmed clean. |
| R3 | shipped | `workflow/artifacts/verify/validator-false-positive-fixes-v1.md` Manifest Coverage row R3 | Skipped Checks template fix, including the `exemplar.md` instance found beyond the original Plan. |
| RI1 | shipped | `workflow/artifacts/verify/validator-false-positive-fixes-v1.md` Manifest Coverage row RI1 | Regression coverage itself verified (`npm run conformance:test`, 15/15). |

## PR / CI Readiness

Not applicable per `release.yaml` (`pull_request.required: false`, `ci.required: false`). No CI provider is configured in this repo's dev-workspace `release.yaml` (this is the repo's own dogfood config, distinct from the shipped package's `.github/workflows/ci.yml`, which is a separate, already-existing gate not modified by this chain).

Branch gate (the one required gate): evidence below.

- Branch: `fix/validator-false-positives`, created from `main` (post-PR #54 merge).
- `git status --short --branch`: 11 modified files, 6 new files/directories, all matching the task artifact's declared Changed Files — no unrelated dirty state.
- `git rev-list --left-right --count origin/main...fix/validator-false-positives` (run this phase, step 4a): `0	0` — branch has not diverged from `origin/main`; no rebase/merge decision needed.
- **Not yet committed.** All Build/Review/Test work exists as uncommitted working-tree changes on this branch. Per this repo's own standing instruction (commit/push only when the user asks, and PR creation always needs separate explicit confirmation even after an authorized commit), committing is the next action pending user go-ahead — not assumed as part of this Ship recommendation.

## Release Readiness

Not required (`release.yaml`: `release.required: false`). This chain fixes internal dev-workspace validators and their own reference documentation — no `package.json` version bump, no `CHANGELOG.md` entry needed (nothing shipped-package-facing changed; the fixed validators are dev-tooling that already ships as part of `src/workflow/validators/` regardless of version).

## Source-of-Truth Status

not required — `source-of-truth.yaml`'s `mode: optional`, `default_required: false`; this chain referenced no external source-of-truth document.

## Risk And Rollback

- Residual risk: carried from Review/Test — (1) `check-scope-fence.mjs` is now exercising its real enforcement path against the full historical tree for the first time; (2) 5 historical artifacts were retroactively corrected, annotated in-place with dated explanations; (3) `npm run build` was not run this chain (low risk, no bundle-feeding path touched — see Verify's Skipped Checks).
- Rollback trigger: `npm run validate`, `npm run violations:test`, or `npm run conformance:test` regresses after this change lands on `main` (either from this chain's own edits or from a later chain interacting with the widened `check-waivers.mjs`/`check-scope-fence.mjs` regexes in an unexpected way).
- Rollback action: `git revert` the merge commit (once merged) — all 17 changed/new files are self-contained to this chain's scope (validators, their reference docs, two new fixture directories, the 5 retroactive artifact corrections, and `open-items.yaml`'s OI-29/37/38 closure); no schema or shipped-package-contract change to unwind separately.
- Rollback owner: user (repo maintainer).

## Blocked Handoff

none — no external access, authority, or state is missing. The one pending action (commit) is a standing-instruction confirmation gate, not a blocked handoff.

## Architecture Notes

- role: Senior DevOps
- decision: Recommended `ship` on the technical merits (all gates green, no unwaived blocker, no configured release/PR/CI/source requirement outstanding) while explicitly not treating "ready to ship" as "already committed" — those are different claims, and this repo's evidence policy (`no_external_claim_without_evidence`) means I should not describe uncommitted work as shipped.
- constraint: `release.yaml`'s `pull_request.create_policy: user_requested_or_configured` — a PR is only created when the user asks or config demands it; neither is true yet, so PR/CI status is correctly `not applicable`, not `pending`.
- tradeoff: Closed OI-29/OI-37/OI-38 in `open-items.yaml` before this branch is committed or merged, per explicit user direction this session ("have you worked for it? yes! then close it") — the work is done and independently re-verified at Test; gating the tracker entry on merge status would have measured process, not completion.
- downstream: Reflect should capture the OI-29/37/38 closure-before-merge precedent as a real learning (when is "done" the right signal for an open-items entry vs. "merged"), since prior entries in this same file (e.g. OI-30, OI-33) used merge as the closure signal and this chain deliberately didn't.

## Checkpoint Approval

- Checkpoint: ship-review
- Status: approved
- User's own words (verbatim, this turn): "Appoved, commit and raise PR"

## Exit Gate

- [x] Recommendation is ship / hold / hold-with-waiver.
- [x] Every R and RI has a coverage row.
- [x] Rollback trigger and action defined.
- [x] All configured gates checked or marked not applicable with config reference.

## Next Phase

Reflect
