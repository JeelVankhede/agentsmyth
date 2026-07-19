---
slug: wp-r9a-adapter-gate-dedup
version: 1
artifact: review
status: ready-for-next-phase
created: 2026-07-19
updated: 2026-07-19
manifest_ids: [R1, R2, RI1, RI2]
upstream:
  - workflow/artifacts/briefs/wp-r9a-adapter-gate-dedup-v1.md
  - workflow/artifacts/plans/wp-r9a-adapter-gate-dedup-v1.md
  - workflow/artifacts/tasks/wp-r9a-adapter-gate-dedup-v1.md
orchestration:
  phase: review
  status: ready-for-next-phase
  next_phase: test
  blockers: []
  user_checkpoint: none
---

# WP-R9a — Redundant Adapter-Gate Fix - Review

## Findings

none

## Severity Summary

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |

## Requirement Coverage

| Manifest ID | Evidence | Status | Notes |
|---|---|---|---|
| R1 | New Step 5a.1 dedup-check paragraph + table; 10-scenario worked-example trace (task artifact) | covered | Independently re-traced the diff against all 10 scenarios; every decision matches the stated acceptance criteria |
| R2 | Marker strings/paths independently re-compared against `bin/agentsmyth.mjs` this Review, not just trusted from Build | covered | Exact match, all 4 auto-installable tools |
| RI1 | `git diff --stat` re-run this Review | covered | Exactly one file changed, `src/adapters/*` untouched |
| RI2 | Rebuilt `dist/setup-bundle.md` grepped for jargon; full suite re-run this Review | covered | Zero jargon, zero regression |

## Architecture Notes

- role: Staff Reviewer
- decision: No findings recorded. Independently re-verified every claim in the task artifact
  (marker strings/paths by direct comparison, jargon-freeness by re-grepping the rebuilt
  bundle, full suite by re-running it) rather than trusting the Build phase's own narrative.
- decision: Considered whether the fix should also address already-existing redundant
  per-repo adapter files in repos that ran `init` before this fix existed — decided this is
  correctly out of scope, not a missed requirement: the brief's Success Metrics and R1's
  acceptance criteria are both phrased around "a fresh `init` run," and retroactive cleanup of
  already-placed files was never part of this brief's stated goals. Noted as residual risk,
  not a finding, since nothing was promised and not delivered.
- constraint: `src/setup/SKILL.md` ships via `dist/setup-bundle.md` — re-confirmed the jargon
  grep against the rebuilt output specifically, not just source, matching this repo's
  established two-layer check.
- downstream: WP-R9b should treat the 10-scenario trace in this chain's task artifact as the
  reference behavior to port into CLI code verbatim, per the brief's own downstream note —
  Review independently confirms that trace is accurate, so it's safe to treat as ground truth
  for that future port.

## Verification Reviewed

| Item | Outcome | Notes |
|---|---|---|
| `git diff -- src/setup/SKILL.md` (read in full by Review) | Matches the Plan's Repo Impact Map exactly | No undeclared file touched; diff is a clean insertion + one sentence's addendum |
| Independent comparison of new table's paths/markers vs. `bin/agentsmyth.mjs` (re-run by Review) | Exact match, 4/4 tools | Reproduced Build's own claim independently |
| `npm run build` (re-run by Review) | pass, exit 0 | `dist/setup-bundle.md` regenerated clean |
| Jargon grep of source + rebuilt `dist/setup-bundle.md` (re-run by Review) | 0 matches, both | `grep -inE "OI-[0-9]\|WP-R[0-9]\|wp-r9a" src/setup/SKILL.md dist/setup-bundle.md` |
| `npm run validate` (re-run by Review) | pass, exit 0 | Full existing artifact tree, zero errors |
| `npm run violations:test` (re-run by Review) | pass, 21/21 | Zero regression |
| `npm run conformance:test` (re-run by Review) | pass, 12/12 | Zero regression |
| 10-scenario worked-example trace (re-traced by Review against the actual diff, not just read from the task artifact) | 10/10 correct | Independently confirmed, including both always-place exceptions (Cursor, non-macOS Copilot) |

## Residual Risk

- Repos that ran `init` before this fix existed may already have a redundant per-repo adapter
  file sitting alongside a now-covering global gate. This fix stops new duplication; it does
  not clean up pre-existing duplication. Accepted as out of this brief's stated scope, not a
  gap in what was promised.

## Recommendation

pass
