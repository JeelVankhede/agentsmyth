---
slug: fix-definitions-root-portability
version: 1
artifact: review
status: complete
created: 2026-07-23
updated: 2026-07-23
manifest_ids: [R1, R2]
upstream:
  - workflow/artifacts/briefs/fix-definitions-root-portability-v1.md
  - workflow/artifacts/plans/fix-definitions-root-portability-v1.md
  - workflow/artifacts/tasks/fix-definitions-root-portability-v1.md
orchestration:
  phase: review
  status: complete
  next_phase: test
  blockers: []
  user_checkpoint: none
---

# Fix definitions_root Portability (OI-52) - Review

## Findings

- P3 (fixed) — `test/run-init-prepare-interop-tests.mjs`'s `C4-definitions-root` check read
  `profilePath` twice via `readFileSync` (once for the positive assertion, once for the negation)
  where a single read, stored and reused, was strictly better. Fixed by reading once into
  `initProfileContent` and reusing it for both halves of the assertion, matching the pattern the
  adjacent `F3-definitions-root` check already used.
- P3 (fixed, process) — Plan's Phase 1 Touches named `test/run-root-resolution-drift-tests.mjs`,
  which `check-scope-fence.mjs` correctly flagged as not matching what was actually touched
  (`test/run-init-prepare-interop-tests.mjs`). This was a real Build-time discovery (the named
  file tests a different field's resolution, `workspace_root`'s `repoRoot`, not `definitions_root`
  at all) — fixed by updating the Plan's Touches and Repo Impact Map to match reality, with an
  explanatory note, per this repo's own established convention for this exact situation.

## Severity Summary

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 2 |

## Requirement Coverage

| Manifest ID | Status | Notes |
|---|---|---|
| R1 | covered | Portable literal written and verified resolving correctly, both manually and via 3 automated checks (C4, F3, F5) |
| R2 | covered | Old expanded-absolute-path form verified still resolving correctly via manual QA |

## Architecture Notes

- role: Reviewer
- decision: Both findings were fixed in place — the double-read was a trivial, isolated cleanup;
  the Plan/Task Touches mismatch was corrected in the artifact that was actually incomplete,
  consistent with how this exact situation was handled in the immediately preceding chain
  (`deepen-setup-interview-v1`).
- constraint: Confirmed no runtime dependency introduced.
- tradeoff: None.
- downstream: None — this is a narrowly-scoped, single-constant fix with no further surface.

## Verification Reviewed

- `npm run init-prepare-interop:test` (re-run post-fix) — 33/33, output inspected.
- `npm run validate` (re-run post both fixes) — passes, `check-scope-fence` clean.
- Manual re-confirmation that `C4`/`F3`'s logic is unchanged in behavior after the double-read
  cleanup (same two conditions, now reading the file once).

## Residual Risk

- Migrating already-`init`'d consumer repos' existing absolute-path `definitions_root` values is
  explicitly out of scope (Brief's own Non-Goal, inherited from OI-52) — those repos keep working
  via R2's backward-compatibility guarantee, but never get the portable form unless they re-run
  `init` or edit it by hand. Not a defect in this fix, a deliberately deferred follow-up.

## Recommendation

pass
