---
slug: wp-r13-setup-validator-definitions-root
version: 1
artifact: review
status: ready-for-next-phase
created: 2026-07-21
updated: 2026-07-21
manifest_ids: [R1, R2, RI1, RI2]
upstream:
  - workflow/artifacts/briefs/wp-r13-setup-validator-definitions-root-v1.md
  - workflow/artifacts/plans/wp-r13-setup-validator-definitions-root-v1.md
  - workflow/artifacts/tasks/wp-r13-setup-validator-definitions-root-v1.md
orchestration:
  phase: review
  status: ready-for-next-phase
  next_phase: test
  blockers: []
  user_checkpoint: none
---

# WP-R13 — Setup Validator Ignores definitions_root - Review

## Findings

1. **P3** — `test/fixtures/setup-validator-definitions-root/{linked,defensive-fallback,defensive-fallback-broken}/workflow/config/repo-profile.yaml` (R1, test quality) — `definitions_root` is declared at the top level of these fixture files (0-indent, sibling to `repository:`), but the real schema (`src/workflow/schemas/repo-profile.schema.yaml`) nests it *inside* the `repository:` object (4-space indent). Confirmed this doesn't affect the fix's correctness — both `check-setup-complete.mjs`'s new `definitionsRootIsSet()` and `lib.mjs`'s existing, already-shipped `_readDefinitionsRoot()` use the same indentation-agnostic `^\s*definitions_root:\s*(.+)$` regex, so either placement matches identically. But the fixture itself isn't representative of a real, schema-conformant `repo-profile.yaml`, which could mislead a future reader into thinking that's the correct shape. Fix: re-indent the 3 fixtures' `definitions_root:` line to sit inside `repository:`, matching the real schema — no code change needed, test-data-only.

## Severity Summary

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 1 |

## Requirement Coverage

| Manifest ID | Evidence | Status | Notes |
|---|---|---|---|
| R1 | `node test/run-setup-validator-definitions-root-tests.mjs` (re-run this Review, fresh) — `linked` case passes; direct read of `check-setup-complete.mjs`'s diff against `origin/main` confirms the change is exactly as claimed (33 insertions, 3 deletions, no unrelated edits) | covered | Finding #1 doesn't affect functional correctness, only fixture representativeness. |
| R2 | Same test run — `defensive-fallback` (pass) and `defensive-fallback-broken` (correctly fails) cases both confirmed | covered | |
| RI1 | All 3 fixture cases include `workflow/artifacts`/`workflow/learnings`; confirmed present in `alwaysRequiredPaths`, unconditional in the code | covered | |
| RI2 | `git diff origin/main -- src/workflow/validators/` (re-run this Review) shows only `check-setup-complete.mjs`; `check-config.mjs` untouched, confirmed by its own separate `grep` for any relevant path or `definitions_root` reference (zero matches, unchanged from Think's own investigation) | covered | |

## Architecture Notes

- role: Staff Reviewer
- decision: Independently re-ran `node test/run-setup-validator-definitions-root-tests.mjs` fresh (not reusing Build's own reported output), plus the 3 other regression suites Build cited (`npm run validate`, `violations:test`, `checkpoint-approval:test`) and the pre-existing, unrelated `setup-checks:test` suite — all pass, matching Build's claims.
- decision: Directly inspected the actual code diff (`git diff origin/main -- src/workflow/validators/check-setup-complete.mjs`) rather than only trusting the task artifact's own description — confirmed the change is exactly the claimed 33-insertion/3-deletion split, no scope creep.
- decision: Cross-checked the fix's regex against `lib.mjs`'s existing, already-shipped `_readDefinitionsRoot()` (the production reader other validators rely on) — both use the identical `^\s*definitions_root:\s*(.+)$` pattern (indentation-agnostic), confirming consistency between the new check and the existing resolution mechanism it's meant to align with. This cross-check is also what surfaced Finding #1 — the fixtures' own placement doesn't match the real schema's nesting, even though the regex doesn't care.
- decision: Recommending `pass-with-risk`? No — recommending plain `pass`. The one finding is P3, test-data-only, doesn't affect the shipped fix's correctness, and has a trivial fix recommendation. No residual risk beyond that one finding exists for this narrow, well-contained WP.
- constraint: Per Review's own role boundary, Finding #1 was not fixed here — recorded for Build or a follow-up to address, not silently patched during Review.
- downstream: None beyond Finding #1's own fix recommendation — this WP's scope was narrow enough that no Ship-relevant residual risk exists (no PR/CI gate implications beyond what any small validator fix would have, no release/source-of-truth involvement).

## Verification Reviewed

| Item | Outcome | Notes |
|---|---|---|
| `node test/run-setup-validator-definitions-root-tests.mjs` (re-run this Review, fresh) | pass | 3/3, all cases correct. |
| `npm run validate` (re-run this Review, fresh) | pass | Zero new failures. |
| `npm run violations:test` (re-run this Review) | pass | 21/21, unaffected. |
| `npm run checkpoint-approval:test` (re-run this Review) | pass | 3/3, unaffected. |
| `npm run setup-checks:test` (re-run this Review, pre-existing unrelated suite) | pass | 4/4, confirms no interaction with the prior domain.yaml regex fix. |
| `git diff origin/main -- src/workflow/validators/check-setup-complete.mjs` (new this Review) | pass | Exactly the claimed diff, no unrelated changes. |
| `git diff origin/main -- src/workflow/validators/` directory-wide (new this Review) | pass | Confirms `check-config.mjs` and every other validator file untouched. |
| Cross-check against `lib.mjs`'s `_readDefinitionsRoot()` regex (new this Review) | pass, surfaced Finding #1 | Same pattern, confirms consistency; also revealed the fixture indentation mismatch. |

## Residual Risk

- Finding #1 (P3, fixture indentation) — low risk, test-data-only, trivial fix. Owner: whoever picks up the next small fix, or Reflect follow-up.
- This validator's `definitionsRootIsSet()` treats any non-empty captured value as "set," matching `A2`'s stated scope — it does not confirm the referenced global install path actually exists or is populated. This is by design (a separate, existing concern owned by `lib.mjs`'s own resolver), not a gap introduced by this WP, but worth restating here since it's the only place this Review's own investigation touched that boundary.

## Recommendation

pass
