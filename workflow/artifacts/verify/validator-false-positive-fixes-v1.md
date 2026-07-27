---
slug: validator-false-positive-fixes
version: 1
artifact: verify
status: ready-for-next-phase
created: 2026-07-27
updated: 2026-07-27
manifest_ids: [R1, R2, R3, RI1]
upstream:
  - workflow/artifacts/briefs/validator-false-positive-fixes-v1.md
  - workflow/artifacts/plans/validator-false-positive-fixes-v1.md
  - workflow/artifacts/tasks/validator-false-positive-fixes-v1.md
  - workflow/artifacts/reviews/validator-false-positive-fixes-v1.md
orchestration:
  phase: test
  status: ready-for-next-phase
  next_phase: ship
  blockers: []
  user_checkpoint: none
---

# Validator false-positive fixes (OI-29, OI-37, OI-38) - Verification

## Inputs

- Review artifact: `workflow/artifacts/reviews/validator-false-positive-fixes-v1.md`
- Review recommendation: `pass`, no findings.
- Configured verification commands: `workflow/config/verification.yaml` — `validate` (`npm run validate`) and `violations-test` (`npm run violations:test`), both required at `review`/`ship` phases.

## Automated Checks

| Command | Outcome | Evidence |
|---|---|---|
| `npm run validate` | pass | Exit 0, full output in `/tmp/test-validate.log` this turn; ends `render-adapters: adapter shims are current`. |
| `npm run violations:test` | pass | Exit 0, `21/21 violations detected`, no regression to any existing seeded violation. |
| `npm run conformance:test` | pass | Exit 0, `15/15 conformance checks passed`, includes the 3 new checks for this chain (`r14-rather-than`, `r15-scope-fence-bullet`, `r16-skipped-checks-columns`). Not in `verification.yaml`'s required list but run anyway since it's this chain's own regression-coverage requirement (RI1). |
| `AGENTSMYTH_HOME=src/workflow node src/workflow/validators/check-waivers.mjs --dir test/fixtures/conformance/waiver-rather-than` | pass | Exit 0, `check-waivers: ok` — this turn. |
| `AGENTSMYTH_HOME=src/workflow node src/workflow/validators/check-waivers.mjs --dir test/fixtures/conformance/waivers-dir` | pass (correctly still fails) | Exit 1, flags the genuine claim — no regression. |
| `AGENTSMYTH_HOME=src/workflow node src/workflow/validators/check-waivers.mjs --dir test/fixtures/conformance/table-claim` | pass (correctly still fails) | Exit 1, flags the genuine table-cell claim — no regression. |
| `grep -rn "Check \| Why Skipped \| Risk \| Owner \| Blocks Ship \|$" src/workflow/` | pass | Zero hits, exit 1 (grep convention) — this turn. |
| `node src/workflow/validators/check-scope-fence.mjs --dir test/fixtures/conformance/scope-fence-bullet-boundary` | pass (correctly fails) | Exit 1, flags `scripts/unrelated-check.mjs` — the reproduced bug, now caught. |
| `node src/workflow/validators/check-scope-fence.mjs --dir test/fixtures/lifecycle-violations/j-file-outside-scope` | pass (correctly still fails) | Exit 1, flags `src/unrelated-file.ts` — no regression to the existing real-violation fixture. |
| `node src/workflow/validators/check-scope-fence.mjs --dir workflow/artifacts` | pass | Exit 0, `check-scope-fence: ok` — the full real historical tree, clean after all 5 retroactive corrections. This turn's run is independent of Build's and Review's earlier runs. |

## Manifest Coverage

| Manifest ID | How Verified | Evidence | Result | Notes |
|---|---|---|---|---|
| R1 | command | `check-waivers.mjs` against `waiver-rather-than` (pass) and `waivers-dir`/`table-claim` (still fail) | pass | Both directions independently re-run this turn, not reused from Build/Review. |
| R2 | command | `check-scope-fence.mjs` against `scope-fence-bullet-boundary` (fails, correct), `j-file-outside-scope` (still fails), and the full `workflow/artifacts` tree (clean) | pass | Three-way check: the fix catches the bug, doesn't regress the existing violation fixture, and the full historical tree is clean. |
| R3 | command | Repo-wide grep for the stale 5-column header (zero hits) plus `npm run validate` (passes) | pass | Confirms both the fix and Build's own exit-gate grep still hold at Test time. |
| RI1 | command | `npm run conformance:test` (15/15, all 3 new checks present) | pass | Regression-coverage requirement is itself verified, not just the underlying fixes. |

## Manual QA

not applicable — all evidence is command-based; no interactive/UI surface to exercise.

## Generated Output Evidence

not applicable — no generated output (`dist/`, bundles) depends on any file this chain touched; `npm run build` was not required and was not run.

## Findings

none

## Skipped Checks

| Check | Why Skipped | Risk | Owner | Blocks Ship | Manifest IDs |
|---|---|---|---|---|---|
| `npm run build` | Repo Impact Map for this chain touches only `src/workflow/validators/`, `src/workflow/skills/lifecycle-test/references/`, `test/`, and `workflow/artifacts/` — none of which feed `dist/workflow-bundle.md`/`dist/setup-bundle.md` in a way that changes shipped consumer-facing content differently from what's already true on `main`. | Low — `check-starter-blocks`/`render-adapters` (both part of `npm run validate`, both passed) would catch a starter-block or adapter drift if this assumption were wrong. | Senior QA (this chain) | no | R3 |

## Architecture Notes

- role: Senior QA
- decision: Re-ran every piece of evidence independently this phase rather than citing Build's or Review's prior runs — all commands above show current-turn output, per this repo's own evidence policy (`command_success_requires_current_output_or_cited_artifact`).
- constraint: `verification.yaml` only requires `validate` and `violations-test` at review/ship; `conformance:test` isn't in that list but is this chain's own RI1 requirement, so it's run and recorded anyway rather than treated as optional.
- tradeoff: Skipped `npm run build` (see Skipped Checks) — judged low-risk given the touched paths don't feed the bundle, but recorded as a real skip with owner and risk rather than silently omitted.
- downstream: Ship should decide the `CHANGELOG.md` question Review flagged (internal dev-workspace/validator corrections — likely no changelog entry, but an explicit call). Ship should also close `OI-29`, `OI-37`, `OI-38` in `open-items.yaml` once merged, matching the pattern already used for `OI-23`/`OI-52` in prior chains.

## Sign-Off

- Verifier: Senior QA (this chain)
- Date: 2026-07-27
- Recommendation: ship
