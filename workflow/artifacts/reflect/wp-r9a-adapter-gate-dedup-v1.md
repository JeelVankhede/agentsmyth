---
slug: wp-r9a-adapter-gate-dedup
version: 1
artifact: reflect
status: done
created: 2026-07-19
updated: 2026-07-19
manifest_ids: [R1, R2, RI1, RI2]
upstream:
  - workflow/artifacts/briefs/wp-r9a-adapter-gate-dedup-v1.md
  - workflow/artifacts/plans/wp-r9a-adapter-gate-dedup-v1.md
  - workflow/artifacts/tasks/wp-r9a-adapter-gate-dedup-v1.md
  - workflow/artifacts/reviews/wp-r9a-adapter-gate-dedup-v1.md
  - workflow/artifacts/verify/wp-r9a-adapter-gate-dedup-v1.md
  - workflow/artifacts/ship/wp-r9a-adapter-gate-dedup-v1.md
orchestration:
  phase: reflect
  status: done
  next_phase: done
  blockers: []
  user_checkpoint: none
---

# WP-R9a — Redundant Adapter-Gate Fix - Reflect

## Inputs

- Full chain: brief → plan (2 phases) → task → review → verify → ship, all
  `ready-for-next-phase`/`ship`, 0 open findings at close.
- Ship: commit `2f6cb2a` on `feat/wp-r9a-adapter-gate-dedup`, not yet pushed.
- Origin: Notion [WP-R9a](https://app.notion.com/p/3a1972bdebbb8135b816d135a5f8fe1d), split
  from the WP-R9 spike's §8 finding, itself discovered while researching a larger,
  unrelated initiative (init-as-scaffold-only).

## Outcome

Shipped locally (committed, not yet pushed). All 4 requirements (R1, R2, RI1, RI2)
implemented, verified, and reviewed with 0 open findings, reproduced 3× across Build/Review/
Test/Ship. Release/deployment: not applicable. Source-of-truth: not applicable. Rollback:
`git revert`, clean (purely additive prose change, original table untouched).

## What Worked

- The entire chain moved fast and cleanly because the scoping work was already done
  thoroughly in Notion before this chain started — Brief, Plan, and Build all cited the
  Notion research directly rather than re-deriving it, and nothing needed correction along
  the way.
- Every marker string and file path was verified against the real source 3 times
  independently (Build, Review, Test) rather than trusted forward from the first check — zero
  drift found each time, confirming the discipline is cheap insurance, not wasted repetition,
  for a fix whose entire correctness rests on exact string matches.
- The worked-example trace (10 scenarios: 5 tools × global-gate-present/absent, collapsing to
  2 always-place exceptions) substituted cleanly for a runnable test on agent-executed prose
  with no code path to invoke — reused at every phase (Build wrote it, Review re-traced it
  independently, Test cited it, Ship inherited it) rather than being written once and trusted.
- Applied the sibling WP-R9c's own new Ship step 4a (origin/main staleness check) for a
  second time this session and got the same clean result — a second real data point that the
  rule behaves as intended, not just a one-off.

## What Did Not Work

- One evidence-citation gap: the first draft of the Review artifact's "Verification Reviewed"
  table left 4 Notes cells empty, tripping `check-evidence-citations.mjs`. Caught immediately
  by `npm run validate`, fixed in the same turn. Minor, but worth naming since it's a concrete
  instance of a documented rule (every citation row needs a real cited value) being missed by
  the same session that wrote the rule.

## Surprises

None.

## Manifest Coverage Retrospective

| Manifest ID | Outcome | Evidence path | Notes |
|---|---|---|---|
| R1 | shipped | `workflow/artifacts/verify/wp-r9a-adapter-gate-dedup-v1.md` Manifest Coverage row R1 | 10-scenario worked-example trace, reproduced 3x |
| R2 | shipped | `workflow/artifacts/verify/wp-r9a-adapter-gate-dedup-v1.md` Manifest Coverage row R2 | Marker/path comparison against real source, reproduced 3x |
| RI1 | shipped | `workflow/artifacts/verify/wp-r9a-adapter-gate-dedup-v1.md` Manifest Coverage row RI1 | Exactly one file changed, every time |
| RI2 | shipped | `workflow/artifacts/verify/wp-r9a-adapter-gate-dedup-v1.md` Manifest Coverage row RI2 | Zero jargon, zero regression |

## Deferred

- Cleanup of already-existing redundant per-repo adapter files in repos that ran `init`
  before this fix existed — explicitly out of this brief's stated scope (see Review's
  Residual Risk), not deferred as a missed requirement. No follow-up item needed unless real
  usage surfaces it as an actual problem.

## Source-of-Truth Outcome

not applicable — `source-of-truth.yaml` `mode: optional`, `providers: []`.

## Learning Candidates

- **Candidate learning**: for a fix whose entire correctness rests on exact string/path
  matches against a separate source file (not a shared constant), re-verify those matches
  independently at every phase rather than once — this chain did so 3× and found zero drift
  each time, but the cost was low and the fixture-non-vacuousness-style discipline this repo
  already applies to regex fixes applies just as well to prose fixes with the same "must
  match reality exactly" property. Source: this chain's own Build/Review/Test pattern —
  propose-only.

## Follow-Ups

| Action | Owner | Suggested Artifact Or Ticket | Status |
|---|---|---|---|
| Push commit `2f6cb2a` and decide whether to open a PR | user | manual action | open |
| Start WP-R9c (Node TUI polish), branched from this chain's work per the user's explicit sequencing (not from WP-R9b, which remains unstarted) | user/agent | new lifecycle chain | open |
| Update Notion WP-R9a page to ✅ Done once merged | user/agent | Notion update | open |

## Raw Session Entry

See `workflow/learnings/sessions/2026-07-19-wp-r9a-adapter-gate-dedup.md`.

## Architecture Notes

- role: Project Manager
- decision: No new `open-items.yaml` entries needed — this chain's only follow-ups are
  mechanical (push, PR decision, Notion status update, start R9c), already captured in
  Follow-Ups above and in the user's own next-step instruction, not durable cross-session
  tracked debt.
- downstream: WP-R9b, when it starts, should port this chain's dedup logic into CLI code
  verbatim — the 10-scenario trace in this chain's task/verify artifacts is the reference
  behavior to preserve, not redesign.

## Exit Gate

- [x] Manifest Coverage Retrospective has one row per active R and RI.
- [x] Every follow-up has a named owner and suggested artifact title.
- [x] Learning candidates tagged propose-only.
- [x] `orchestration.status: done`, `next_phase: done`.
