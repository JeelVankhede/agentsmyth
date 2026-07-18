---
slug: manifest-id-parser-hardening
version: 1
artifact: learning-session
date: 2026-07-18
source: lifecycle-reflect
upstream:
  - workflow/artifacts/reflect/manifest-id-parser-hardening-v1.md
---

# Raw Learnings - manifest-id-parser-hardening v1

## Context

Fix for OI-22: 3 lifecycle validators (`check-manifest-coverage.mjs`, `check-coverage-ledger.mjs`,
`check-phase-map.mjs`) extracted R/RI manifest IDs from prose with regexes that matched
ID-shaped substrings inside compound tokens and unrelated sentences, found empirically 3 times
in the `init-prepare-interop` (WP-R7) chain. Shipped as PR #36, 6-phase Build (Phase 6 added
post-Review to fix findings), 0 open Review findings at close.

## Candidate Learnings

- Verify a fix's boundary with an inline before/after comparison across representative cases
  *before* implementing, not just after via full-tree regression — worked cleanly twice in
  this chain (Phase 3, Phase 6) once adopted.
- Check whether a test/conformance script a chain touches is actually wired into CI, not just
  an npm script that passes locally — `conformance:test` sat CI-unenforced for a full prior
  chain before Review caught it here.
- When a new chain's origin is an open-items.yaml entry from a sibling chain's still-open PR,
  check whether that entry exists on the new branch before assuming the ledger is current.

## Raw Notes

- Brief corrected OI-22's own misattributed scope (bug is in check-manifest-coverage.mjs, not
  check-scope-fence.mjs) by re-reading real source rather than trusting the open-item's prose.
- Plan revised brief's "3 independent fixes" into a shared-helper design (`parseIdList()`) after
  reading real source; check-coverage-ledger.mjs correctly excluded from sharing it since real
  Waivers content is prose, not structured.
- Build found 3 real regressions via full-tree runs (not fixture-only checks): RI5-a/-b/-c
  sub-labels over-rejected, multi-ID table cells dropped to one ID, bare `(RI4)` convention
  unrecognized (confirmed 31 real instances via grep before fixing).
- Every fixture proven non-vacuous: `git stash`/revert + rerun where a commit existed to revert
  to; an inline 8-case regex comparison for the Phase 6 fix, since nothing was committed yet to
  stash against.
- Review found 2 real gaps beyond Build's own re-verification: CI never ran `conformance:test`
  (9 pre-existing checks + this chain's own, all locally-runnable-only); check-coverage-ledger's
  Phase 3 fix had a second false-negative (hyphenated sub-labels) distinct from the one it fixed.
- User said "Fix all" — all 4 findings (1 P2, 3 P3) fixed in a new Build Phase 6, requiring a
  Plan Touches amendment (`.github/workflows/ci.yml` wasn't originally in scope) before
  scope-fence would accept the work. Re-verified fresh by Review, then Test, then Ship.
- Two near-miss Plan self-approvals this session (WP-R7's and this chain's) — both self-caught,
  recurring across 2 unrelated chains in one session.
- open-items.yaml's OI-22 (this chain's own stated origin) does not exist on this branch — it
  was added on the still-unmerged feat/init-prepare-interop (PR #35), based on origin/main at
  an earlier point. Reconstructed OI-22 from the brief's quoted text, flagged the coming
  duplicate-ID merge collision as a Follow-Up. New items numbered from OI-24 to reduce (not
  guarantee) collision with PR #35's presumed OI-21/23.
- Process: commit (d97ac4b) only after explicit request; push done by the user, not the agent;
  PR #36 created via `gh pr create` following the user's global PR_REQUEST_TEMPLATE.md format,
  only after explicit "raise PR" request.

## Curator Marks

- promoted-to-curated: none
- consolidated-with: none
- rejected-as-not-general: none
