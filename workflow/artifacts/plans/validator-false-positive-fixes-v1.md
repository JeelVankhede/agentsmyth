---
slug: validator-false-positive-fixes
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-07-27
updated: 2026-07-27
manifest_ids: [R1, R2, R3, RI1]
upstream:
  - workflow/artifacts/briefs/validator-false-positive-fixes-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
---

# Validator false-positive fixes (OI-29, OI-37, OI-38) - Plan

## Summary

Fix three shared-validator false-positive/mismatch bugs at their real root cause — a regex in `check-waivers.mjs`, a regex in `check-scope-fence.mjs`, and a stale documentation template in `lifecycle-test`'s Starter Block — each with a dedicated regression check so the bug class can't silently recur. Sequenced lowest-risk first: R1 (regex narrowing, low risk) → R3 (doc-only, low risk) → R2 (boundary-regex change touching actual scope-creep enforcement, highest risk of the three), so the trickiest change gets full attention with the other two already settled.

## Inputs

- `workflow/artifacts/briefs/validator-false-positive-fixes-v1.md` (approved 2026-07-27)
- `src/workflow/validators/check-waivers.mjs` (current negation regex, ~line 109)
- `src/workflow/validators/check-scope-fence.mjs` (`phaseTouches()`, line 47)
- `src/workflow/skills/lifecycle-test/references/output-schema.md` (Skipped Checks table, lines 47 & 105-108)
- `src/workflow/validators/check-skipped-accounting.mjs` and `workflow/config/verification.yaml` (the real 6-field contract R3 must match)
- `test/run-conformance-tests.mjs` and `test/fixtures/conformance/` (existing convention for regression coverage — one fixture dir per case, one `check(id, desc, cond)` per assertion)

## Requirement Coverage

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R1 | Phase 1 | `check-waivers.mjs` negation regex |
| R3 | Phase 2 | `lifecycle-test` Starter Block doc fix |
| R2 | Phase 3 | `check-scope-fence.mjs` boundary regex |
| RI1 | Phase 1, Phase 2, Phase 3 | Regression check added per-phase, not deferred to a separate phase |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `src/workflow/validators/check-waivers.mjs` | modify | R1 | Negation regex gains a `rather than ... waiver` alternative |
| `test/fixtures/conformance/waiver-rather-than/tasks/rather-than-v1.md` | add | R1, RI1 | New fixture reproducing the exact false-positive phrasing |
| `src/workflow/skills/lifecycle-test/references/output-schema.md` | modify | R3 | Skipped Checks table + prose gain the 6th `Manifest IDs` column |
| `src/workflow/validators/check-scope-fence.mjs` | modify | R2 | `phaseTouches()` lookahead accepts an optional `- ` bullet-dash prefix |
| `test/fixtures/conformance/scope-fence-bullet-boundary/plans/bullet-boundary-v1.md` | add | R2, RI1 | New fixture: last phase uses `- **Work:**`/`- **Exit gate:**` |
| `test/run-conformance-tests.mjs` | modify | R1, R2, R3, RI1 | Three new `check(...)` assertions, one per requirement |
| `workflow/artifacts/open-items.yaml` | modify | R1, R2, R3 | Close OI-29, OI-37, OI-38 with resolution notes once shipped |

No consumer-facing contract changes: R1/R2 only narrow/correctly-scope what a validator flags (never widen it to accept something previously rejected as a real violation); R3 is documentation-only.

## Source-of-Truth Strategy

`workflow/artifacts/open-items.yaml` is the requirement source for all three bugs (OI-29, OI-37, OI-38) — each entry already names the exact mechanism and, for R3, the exact correct target shape (`verification.yaml`'s `skipped_checks.required_fields`). No external source-of-truth conflict: these are internal-to-agentsmyth validator bugs, not a consumer-repo requirement.

## Assumptions Verified

| Assumption ID | Status | Evidence / Question |
|---|---|---|
| A1 | evidence-backed | `git log --all -S"rather than record" --oneline` traced the real historical false positive to commit `f99c388` ("reword p1 task note to clear check-waivers false positive"), whose own commit message states the negation regex "catches 'no waiver'/'without a waiver'/'not ... waiver' but not 'rather than record a waiver'" — confirming this is the one missing construction, not a guess. Re-derived the exact original flagged text via `git show f99c388~1:workflow/artifacts/tasks/wp-r11-docs-site-v1-p1.md` and reproduced the false positive against current `main` before fixing (Phase 1), confirming no other negation gap was masking a second missing case. |

## Approach

Each phase is independent (no phase depends on another's code landing first) but shares one branch and one review/ship pass, per the brief's Architecture Notes tradeoff (bundled chain, not three separate ones). For each of R1/R2: read the exact historical false-positive text cited in the OI, write a fixture reproducing it under `test/fixtures/conformance/`, confirm it currently fails (proving the bug is real before touching code), fix the regex, confirm the fixture now passes, confirm the sibling real-violation fixture still fails (no regression), then wire a `check(...)` assertion into `test/run-conformance-tests.mjs`. For R3: fix the template text directly, then add a grep-based assertion proving the stale 5-column shape is gone and the 6-column shape is present.

## Phases

### Phase 1 - Fix check-waivers.mjs's "rather than" false positive (R1)

- **Manifest IDs:** R1, RI1
- Touches: `src/workflow/validators/check-waivers.mjs`, `test/fixtures/conformance/waiver-rather-than/`, `test/run-conformance-tests.mjs`
- Work: Add `test/fixtures/conformance/waiver-rather-than/tasks/rather-than-v1.md` reproducing "rather than record a waiver" in prose; confirm it currently fails `check-waivers.mjs`. Broaden the negation regex with a `\brather than\b.{0,20}\bwaiv` alternative. Confirm the new fixture now passes and the existing `waivers-dir`/`p-unstructured-waiver-claim` genuine-claim fixture still fails. Add a `check('r14-rather-than', ...)` assertion to `test/run-conformance-tests.mjs` covering both directions.
- **Exit gate:** New fixture passes `check-waivers.mjs` clean; existing genuine-claim fixture still fails; new conformance check passes.

### Phase 2 - Fix lifecycle-test's stale Skipped Checks template (R3)

- **Manifest IDs:** R3, RI1
- Touches: `src/workflow/skills/lifecycle-test/references/output-schema.md`, `test/run-conformance-tests.mjs`
- Work: Update the Skipped Checks table header (line 107-108) to `| Check | Why Skipped | Risk | Owner | Blocks Ship | Manifest IDs |` and the prose bullet (line 47) to name all 6 fields. Grep `src/workflow/` for any other reference to the stale 5-column shape. Add a `check('r15-skipped-checks-columns', ...)` assertion in `test/run-conformance-tests.mjs` reading the Starter Block table and confirming it has 6 columns including `Manifest IDs`.
- **Exit gate:** Table + prose show 6 columns; `npm run validate` passes; zero remaining hits for the stale 5-column header string anywhere in `src/workflow/`; new conformance check passes.

### Phase 3 - Fix check-scope-fence.mjs's bullet-dash boundary miss (R2)

- **Manifest IDs:** R2, RI1
- Touches: `src/workflow/validators/check-scope-fence.mjs`, `test/fixtures/conformance/scope-fence-bullet-boundary/`, `test/run-conformance-tests.mjs`
- Work: Add `test/fixtures/conformance/scope-fence-bullet-boundary/plans/bullet-boundary-v1.md` — a plan whose last phase uses this repo's real `- **Work:**` / `- **Exit gate:**` convention — plus a paired task fixture touching a file outside that phase's real (bounded) `Touches:` list but inside what the *unbounded* capture would wrongly absorb; confirm this currently produces a false pass (or the wrong error) proving the bug. Broaden `phaseTouches()`'s lookahead to accept an optional `- ` immediately before the bold marker. Confirm the fixture now correctly bounds `Touches:` and the existing `j-file-outside-scope` real-violation fixture still fails as expected. Add a `check('r16-scope-fence-bullet', ...)` assertion.
- **Exit gate:** New fixture proves `Touches:` is bounded at the bullet-dash label; existing `j-file-outside-scope` fixture still fails; new conformance check passes.

## Dependency Order

None of the three phases depends on another's code. Sequenced by ascending risk per the brief (R1 → R3 → R2, low-risk and quick wins first, riskiest boundary-regex change last with full attention). All three land on one branch and ship together in one Review/Ship pass.

## Branch Strategy

Continue on `fix/validator-false-positives` (already created off `main`, confirmed clean at Plan time). Single branch for all three phases; no rebasing plan needed unless `main` advances materially before Ship (re-check per `lifecycle-ship/SKILL.md` step 4a at that time).

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|
| R2's boundary-regex broadening accidentally accepts a boundary it shouldn't, letting real scope-creep slip through unflagged | Low-Medium | High (weakens the actual anti-scope-creep gate) | Test both the false-positive fixture AND the existing real-violation fixture (`j-file-outside-scope`) in the same pass before considering Phase 3 done; do not merge if either regresses | Build/Review | R2 |
| R1's regex change is too broad and starts suppressing a real "rather than X, do the waiver anyway" claim | Low | Medium | `.{0,20}` distance cap keeps the match local to the actual negation phrase, matching the existing pattern's own distance-capping convention (`.{0,15}` for "no"/"not") | Build | R1 |
| R3's doc fix misses another stale reference to the 5-column shape elsewhere in the repo | Low | Low | Repo-wide grep for the stale header string as part of Phase 2's exit gate, not just the one known location | Build | R3 |

## Verification Plan

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1 | `node src/workflow/validators/check-waivers.mjs` run against the new fixture (pass) and the existing genuine-claim fixture (still fails); new `test/run-conformance-tests.mjs` check | Build/Test | Manual command output plus the automated check |
| R3 | `npm run validate`; repo-wide grep for the stale 5-column header; new conformance check | Build/Test | Doc-only, no runtime behavior change to verify beyond the validator still passing |
| R2 | `node src/workflow/validators/check-scope-fence.mjs` run against the new bullet-boundary fixture (pass, correctly bounded) and `j-file-outside-scope` (still fails); new conformance check | Build/Test | Highest-scrutiny case — both directions must be shown, not just the fix |
| RI1 | `npm run conformance:test` full run, green, showing all three new checks | Test | Confirms the regression-check requirement itself, not just the underlying fixes |

## Architecture Notes

- role: Principal Engineer
- decision: One bundled chain (Think→Plan→Build→Review→Ship→Reflect) covering all three fixes, carried from the brief's own Architecture Notes — not revisited here since nothing found during Plan changes that call.
- constraint: No change to `verification.yaml`'s `required_fields` contract or to `check-skipped-accounting.mjs`'s logic (R3 fixes only the stale template, per the brief's Constraints).
- tradeoff: Phase order (R1 → R3 → R2) prioritizes settling the two low-risk fixes before spending the most scrutiny on R2's boundary-regex change, at the cost of not matching the brief's original R1/R2/R3 numbering order in the Phases list — deliberate, not an oversight.
- downstream: `workflow/artifacts/open-items.yaml`'s OI-29/OI-37/OI-38 get closed with resolution notes at Ship, mirroring how OI-23 was closed in the prior chain.

## Open Questions

None.

## Checkpoint Approval

- Checkpoint: plan-review
- Status: approved
- User's own words (verbatim, this turn): "Looks correct"

## Exit Gate

- [x] Every active R and RI mapped to a phase.
- [x] Every phase has a binary exit gate.
- [x] Verification plan covers every R and RI.
- [x] User approved or waiver recorded.
