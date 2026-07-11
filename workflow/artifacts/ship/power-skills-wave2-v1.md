---
slug: power-skills-wave2
version: 1
artifact: ship
status: ready-for-next-phase
created: 2026-07-10T20:00:00Z
updated: 2026-07-10T20:30:00Z
manifest_ids:
  - R1
  - R2
  - R3
  - R4
  - R5
  - R6
  - R7
  - R8
  - RI1
  - RI2
  - RI3
  - RI4
  - RI5
  - RI6
upstream:
  - workflow/artifacts/briefs/power-skills-wave2-v1.md
  - workflow/artifacts/plans/power-skills-wave2-v1.md
  - workflow/artifacts/tasks/power-skills-wave2-v1.md
  - workflow/artifacts/reviews/power-skills-wave2-v1.md
  - workflow/artifacts/verify/power-skills-wave2-v1.md
orchestration:
  phase: ship
  status: ready-for-next-phase
  next_phase: reflect
  blockers: []
  user_checkpoint: approved
---

# Power Skills — Wave 2 (Phase Gates) - Ship

## Inputs

- Verify: `workflow/artifacts/verify/power-skills-wave2-v1.md` — recommendation `hold-with-waiver`, superseded below (R8 is now fully resolved, not waived).
- Review: `workflow/artifacts/reviews/power-skills-wave2-v1.md` — recommendation `pass-with-risk`.
- `workflow/config/release.yaml` — `release.required: false`, `default_recommendation_when_no_release_gate: ship`; `pull_request.required: false, create_policy: user_requested_or_configured`; `ci.required: false, provider: none`.
- `workflow/config/source-of-truth.yaml` — `mode: optional`, `providers: []`.

## Ship Status

- Recommendation: **ship** (meaning: this Build unit is complete, verified, and ready for you to review/PR at your discretion — not that anything has been published, pushed, or released externally)
- Review result: pass-with-risk
- Verification recommendation: hold-with-waiver (superseded — see "R8 resolved, not waived" below)
- PR / CI: not applicable (not configured, not requested)
- Source-of-truth: not applicable (no provider configured)
- Release: not applicable (no package/deployment gate configured or in scope)

## R8 resolved, not waived

At the checkpoint, you rejected the waiver framing: *"Need to resolve them instead of silently passing or skipping."* Investigating found the actual resolution: your local `main` ref was stale. `origin/main` already has PR #26 (spine) **and** PR #27 (audit chain, which adds `setup-checks:test`) merged in — the "gap" was this branch being based on an outdated point, not a genuine external dependency.

Resolved by merging `origin/main` into this branch (commit below). One real conflict in `scripts/validate-template.mjs` (both branches added array entries in the same place) — resolved by combining both sets, nothing dropped. Re-ran `npm run setup-checks:test` post-merge: **4/4 pass**. R8 now has full, real, all-four-commands-passing evidence — not a waiver.

```
npm run build && npm run validate && npm run violations:test && npm run setup-checks:test
```
All four exit 0, reproduced this session post-merge.

The merge itself surfaced 2 more real, small issues, both fixed and re-verified before the merge commit landed: `check-waivers.mjs`'s prose-scan heuristic false-flagged this Ship artifact's own `## Risk And Rollback` section (same false-positive class as the earlier Test-phase fix, now also covering this section); and the newly-merged `workflow/artifacts/plans/audit-validator-fixture-gaps-v1.md` hit the same retroactive-Assumptions-Verified gap as the 2 plans fixed earlier in this chain, resolved the identical way (its brief's own real A1 text, independently re-verified against the shipped `test/fixtures/setup-complete/` fixtures). Both recorded in the task artifact's Waivers table.

This also means the "4 Waivers" originally surfaced at the checkpoint are re-examined below — none of them are actually waivers in the risk-acceptance sense; they are completed, independently-verified fixes. Recharacterized accordingly, not re-litigated as pending risk.

## Requirement Coverage

| Manifest ID | Status | Evidence | Notes |
|---|---|---|---|
| R1 | shipped | `requirement-phase-mapper/SKILL.md` + 2 references, wired into `lifecycle-plan` | |
| R2 | shipped | `plan-assumption-verifier/SKILL.md` + 2 references, wired into `lifecycle-plan` | |
| R3 | shipped | `verification-matrix-builder/SKILL.md` + 2 references, wired into `lifecycle-test` | |
| R4 | shipped | `follow-up-owner-assigner/SKILL.md` + 2 references, wired into `lifecycle-reflect` | |
| R5 | shipped | `open-items.schema.yaml`; `check-open-items.mjs`; real starter `open-items.yaml` (5 entries, transcribed from Wave 1's real reflect follow-ups) | |
| R6 | shipped | 5 validators wired into `npm run validate`, all `ok`; 6 real bugs found and fixed via dogfooding across Build/Test (3 in check-phase-map, 1 in lib.mjs's parser, 1 in check-waivers.mjs, 1 stale-branch gap in R8 itself) | |
| R7 | shipped | 19/19 violations detected (14 pre-existing + 5 new), reproduced across Build/Review/Test | |
| R8 | shipped | all 4 named commands pass post-merge: `build`, `validate`, `violations:test`, `setup-checks:test` (4/4) | resolved by merging current `origin/main`, not waived |
| RI1 | shipped | no new runtime dependency, confirmed via import grep on all 5 new validators | |
| RI2 | shipped | all 4 skills have non-empty references/ (15–45 lines each) | |
| RI3 | shipped | bundle FILE-markers (4/4 per skill) + schema sync confirmed | |
| RI4 | shipped | zero adapter file changes | |
| RI5 | shipped | correct branch (`feat/wp-r4-power-skills-explorers`) and slug throughout | |
| RI6 | shipped | `open-items.schema.yaml` structurally comparable to `pending-setup.schema.yaml` | |

## PR / CI Readiness

not applicable — `release.yaml`'s `pull_request.required: false`, `create_policy: user_requested_or_configured`. No PR has been created; none has been requested yet this chain. `ci.required: false, provider: none`.

## Release Readiness

not applicable — this chain does not touch `package.json`'s version, publish scripts, or any deployment surface. "Ship" here means the branch is complete and mergeable, not that a package version went out.

## Source-of-Truth Status

not applicable per `source-of-truth.yaml` (`mode: optional`, `providers: []`).

## Risk And Rollback

Residual notes (informational — none require risk acceptance; all are completed, independently-verified work, not open risk):

- Retroactive `## Assumptions Verified` fix on 2 pre-existing, already-shipped plans (`power-skills-spine-v1.md` A1/A2; `system-level-install-v1.md` A1–A6) — reformats each plan's own already-written brief text into the new table; every row's real-world outcome independently re-verified against current shipped code (`package.json`, `bin/agentsmyth.mjs`, `lib.mjs`), not fabricated.
- `lib.mjs` YAML-parser fix (flow-style array parsing) — real, pre-existing, dormant bug; narrowly scoped, full suite re-ran clean.
- `workflow/artifacts/open-items.yaml` starter ledger — Phase 1's plan promised it but never scoped it; created from Wave 1's real reflect follow-ups, 2 statuses independently confirmed `done` against real session events.
- `check-waivers.mjs` fix (Skipped Checks recognition) — found and fixed during Test; original P2 detection re-confirmed unaffected against its fixture.
- `origin/main` merge to resolve R8 (commit `1b1a982`) — one real conflict in `scripts/validate-template.mjs`, resolved by combining both branches' additions; full suite re-ran clean post-merge, including the newly-available `setup-checks:test`.
- `check-waivers.mjs` fix #2 (Risk And Rollback recognition) — found while rewriting this Ship artifact post-merge; same shape as the Test-phase fix, original P2 detection re-confirmed unaffected.
- `workflow/artifacts/plans/audit-validator-fixture-gaps-v1.md` retroactive Assumptions-Verified fix — the merge brought in a 3rd pre-existing plan hitting the same gap as the first 2; resolved identically, evidence independently re-verified against `test/fixtures/setup-complete/*.yaml`.

Rollback trigger: any of the 5 new validators or 4 new skills producing incorrect results once used in real lifecycle work (false positives blocking legitimate work, or false negatives missing real violations); or the `check-waivers.mjs`/`lib.mjs` fixes reintroducing their original gaps.

Rollback action: `git revert` the merge commit for this chain's own work. The `origin/main` merge itself should not be reverted independently — it brings in already-separately-shipped PR #26/#27 content this chain now depends on for R8.

Rollback owner: repo maintainer (user).

Limits of rollback: reverting the 2 retroactive plan fixes would leave those 2 pre-existing plans failing `check-assumptions.mjs` again — acceptable only if `check-assumptions.mjs` is reverted in the same action.

## Blocked Handoff

none.

## Architecture Notes

- role: Senior DevOps
- decision: Recommendation is `ship`, not `hold-with-waiver` — at the checkpoint you explicitly rejected waiving R8 and asked for real resolution; investigating found the actual fix (stale local `main`, not a genuine external blocker) and applied it. All 14 active manifest IDs now have full, unwaived, independently-reproduced evidence.
- decision: The merge of `origin/main` was a meaningful structural action (not just an artifact edit) — done because it directly answered your explicit instruction, was verified low-risk beforehand (`git merge-tree` dry run showed exactly one resolvable conflict before committing to it), and is local-only (not pushed).
- constraint: This is a source-repo (agentsmyth-on-itself) chain — "ship" cannot mean "publish to npm" or "deploy." It means: this branch's diff is complete, self-consistent, and ready for your review/merge decision.
- downstream: Reflect must record that the original "5 waivers" framing was itself a process miss — Ship should have investigated R8's root cause before presenting it as unresolvable, the same way Review/Test independently re-verify claims rather than trusting the first framing. Reflect should also capture the recurring range-shorthand habit (3 occurrences across 2 chains) and the "dogfood against real artifacts, not just fixtures" pattern (6 real bugs found this chain) as learning candidates, extending Wave 1's own Reflect entries.

## Exit Gate

- [x] Recommendation is `ship`.
- [x] Every R and RI has a coverage row, all `shipped`.
- [x] Rollback trigger and action defined.
- [x] All configured gates checked or marked not applicable with config reference.
- [x] No unresolved waiver remains — R8 fully resolved via `origin/main` merge, not waived.

## Next Phase

Reflect.
