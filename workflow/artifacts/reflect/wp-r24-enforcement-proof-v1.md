---
slug: wp-r24-enforcement-proof
version: 1
artifact: reflect
status: done
created: 2026-09-17
updated: 2026-09-17
manifest_ids: [R1, R2, R3, R4, RI1, RI2, RI3, RI4, RI5, RI6, RI7]
upstream:
  - workflow/artifacts/briefs/wp-r24-enforcement-proof-v1.md
  - workflow/artifacts/plans/wp-r24-enforcement-proof-v1.md
  - workflow/artifacts/tasks/wp-r24-enforcement-proof-v1.md
  - workflow/artifacts/reviews/wp-r24-enforcement-proof-v1.md
  - workflow/artifacts/verify/wp-r24-enforcement-proof-v1.md
  - workflow/artifacts/ship/wp-r24-enforcement-proof-v1.md
orchestration:
  phase: reflect
  status: done
  next_phase: done
  blockers: []
  user_checkpoint: none
---

# WP-R24 — Enforcement Proof & Competitive Positioning Content - Reflect

## Inputs

The full chain, approved at all three checkpoints (`brief-review` "Continue to plan", `plan-review`
"Plan is approved", `ship-review` "Ship is approved"), with `ship` recommended and every outward action
outstanding by design.

## Outcome

Eleven requirements shipped, none deferred, none waived. The README and the docs site home now carry a
generated capture of the gate refusing a commit, the Spec Kit comparison is stated in file paths at a
pinned SHA, and a current skill count exists with its counting rule attached. Nothing has been
committed; six handoffs are open.

## What Worked

- **Verifying the competitor claims during Think instead of at Build.** The user redirected this at the
  first assumption, and it changed the work rather than just confirming it: two sentences that would
  have shipped imprecise were caught, and the strongest line in the finished comparison —
  agent-dispatched versus git-enforced — came out of the verification rather than the plan.
- **Distrusting the artefact the chain produces.** `provoke()` throws if the gate ever permits the
  commit, and `--check` compares the published copies against a freshly provoked refusal. Both exist
  because the question "how would this quietly become false?" was asked of the deliverable itself.
- **The item-by-item walkthrough.** Six items, one at a time, each with a decision. It cost more turns
  and produced a better artifact: three of the six changed scope, and one of them (Q2) removed a file
  from the Touches list entirely.
- **Reading the fixture's own failure output.** Phase 1's first attempt refused nothing (a one-line file
  took the `trivial-size escape`) and its second drowned the refusal under six setup failures. Both are
  now recorded findings; neither was predictable from the plan.

## What Did Not Work

- **The plan asserted an impossible acceptance criterion.** RI4 asked for the two published blocks to be
  "byte-identical". They cannot be — a Markdown fence and a Vue `<pre>` are different wrappers. The
  guarantee was right, the wording was not achievable, and it survived plan-review because it reads
  plausibly. Build corrected it to payload-identity and recorded the correction.
- **The review was not independent.** The agent that wrote the Build reviewed it. Four real findings came
  out of that pass, so it was not worthless — but the structural gap is the same one OI-85 already
  records, and the user asked about it directly, which suggests it is visible from outside too.
- **Three validators were discovered by failing them**, not by reading them: `check-scope-fence` on an
  out-of-repo Touches entry, `check-scope-fence` again on a prose active-phase line, and
  `check-artifacts` on an inline mention of a section heading. Each cost a cycle.

## Surprises

- **The capture is more persuasive than intended, for a reason nobody planned.** The transcript shows
  coverage passing, setup passing, and the artifact's own claim of readiness being *accepted*
  (`→ ready-for-next-phase ✓`) — and then the approval check failing. It demonstrates that the gate does
  not trust the artifact's self-report, which is a sharper point than "a commit was refused".
- **A one-line change is not refused at all.** `trivial-size escape: src/app.js (<= 15 changed lines)`.
  The obvious way to build the demo — touch a file, try to commit — would have produced a capture of the
  gate *allowing* a commit, published under a caption claiming the opposite.
- **The "discrepancy" the work was chartered to fix did not exist.** The WP page said "one is wrong on a
  public surface". Neither number was wrong: 22 was a subset count, 34 was correct on the date it was
  written. The defect was an absence — no surface stated a current count with its rule — which is a
  different repair from the one the page specified.

## Manifest Coverage Retrospective

| Manifest ID | Final status | Note |
|---|---|---|
| R1 | shipped | Both surfaces; position verified in built HTML, not source. |
| R2 | shipped | Re-scoped by Think-phase verification; two claims re-worded before publication. |
| R3 | shipped | Given a concrete subject (`analyze.md`'s severity model and coverage map) rather than a concession in the abstract. |
| R4 | shipped | Re-scoped from "fix a wrong number" to "state a count with its rule" on evidence. |
| RI1 | shipped | Satisfied at Think rather than Build — unusual, and recorded as a tradeoff in the plan. |
| RI2 | shipped | Acceptance strengthened twice: the one-source-of-truth guard at Think, the discoverability fix at Review (F3). |
| RI3 | shipped | Gained the sandbox guard at Review (F2), which the plan did not anticipate. |
| RI4 | shipped | Acceptance wording corrected at Build; the guarantee held. |
| RI5 | shipped | `dependencies` key never existed and still does not. |
| RI6 | shipped | Derived at Build; the brief's own figures were deliberately not reused. |
| RI7 | shipped | Placeholder date left alone, version unbumped — both deliberate. |

## Deferred

Nothing deferred. One check was skipped with an owner: real-browser visual QA (verify Skipped Checks,
`blocks_ship: no`, owner user), which lands on the surface OI-39 already tracks.

## Source-of-Truth Outcome

`mode: optional`, `providers: []` — no update was owed. One user-directed Notion write was performed
(04 — Reference, updated from the Build-evidenced derivation) and one remains outstanding (the WP-R24
page: move to Done, and correct its "one is wrong" framing, which this chain disproved).

## Learning Candidates

- **Candidate learning**: when a deliverable's value is that it is *real*, the build must include a check
  that fails if it stops being real. A capture script that cannot detect the gate permitting a commit is
  a screenshot with extra steps. — source: `workflow/artifacts/tasks/wp-r24-enforcement-proof-v1.md` — propose-only.
- **Candidate learning**: a positive control proves a check can pass, not that it can fail. `--check`
  returned ok for an entire phase before anyone asked whether it could return anything else. — source: `workflow/artifacts/reviews/wp-r24-enforcement-proof-v1.md` — propose-only.
- **Candidate learning**: verify a requirement's *premise* before building to it. This charter said "one
  is wrong on a public surface"; both numbers were right, and the real defect was an absence. — source: `workflow/artifacts/briefs/wp-r24-enforcement-proof-v1.md` — propose-only.
- **Candidate learning**: an acceptance criterion can be unachievable and still pass review, because
  criteria are read for intent and not executed. "Byte-identical" survived plan-review and died on
  contact with two rendering contexts. — source: `workflow/artifacts/plans/wp-r24-enforcement-proof-v1.md` — propose-only.
- **Candidate learning**: build the demo fixture before designing the demo. The 15-line escape hatch and
  the setup-failure noise were both invisible from the plan and both would have produced a published
  artefact that argued against itself. — source: `workflow/artifacts/tasks/wp-r24-enforcement-proof-v1.md` — propose-only.
- **Candidate learning**: generated content injected into a template inherits that template's evaluation
  rules. A `{{` in a future gate message would have been compiled as a Vue expression. — source: `workflow/artifacts/reviews/wp-r24-enforcement-proof-v1.md` — propose-only.

## Follow-Ups

| Action | Owner | Suggested artifact or ticket | Status |
|---|---|---|---|
| Commit the chain on `feat/wp-r24-enforcement-proof` | user | Ship Blocked Handoff #1 | **done** 2026-09-17 — `c347ac4`, 17 files; the pre-commit gate ran and passed on it |
| Push the branch | user | Ship Blocked Handoff #2 | **done** 2026-09-17 — `origin/feat/wp-r24-enforcement-proof` |
| Open a PR against `feat/wp-r20-ledger-closure`, retargeting to `release/1.1.0` once #69 merges | user | Ship Blocked Handoff #3 | **done** 2026-09-17 — PR #70, base `feat/wp-r20-ledger-closure` |
| Merge PR #69 | user | Ship Blocked Handoff #4 | open — **retained by the user deliberately**; they instructed the agent to complete every other handoff and merge this one themselves |
| Update the Notion WP-R24 page: PR reference, and correct the "one is wrong on a public surface" wording | user | Ship Blocked Handoff #5 | **done** 2026-09-17 — see the deviation note below |
| Dispatch 1.1.0 once all seven packages are merged | user | Ship Blocked Handoff #6 | open — **blocked by its own precondition**, not by authorisation: #69 and #70 must merge and `release/1.1.0` must reach `main` first |
| Make `check-scope-fence`'s active-phase requirement discoverable before it fails | workflow owner | OI-107 | open |
| Anchor `check-artifacts`'s Requirement Manifest extraction to a line start | workflow owner | OI-108 | open |
| Give `check-scope-fence` a way to express a phase that deliberately touches no shipped file | workflow owner | OI-109 | open |
| Derive 04 — Reference's counts from the repo, or accept that they drift | user | OI-110 | open |
| Decide whether Review councils should be available below Complex class | user | OI-111 | open |

## Raw Session Entry

See `workflow/learnings/sessions/2026-09-17-wp-r24-enforcement-proof.md`.

## Architecture Notes

- role: Project Manager
- **decision**: `SPEC.md` was abandoned as a target rather than chased. It appears on the WP page, in no
  repository, and in no Notion page found by search; the user had no recollection of it. R4 closed
  against the surfaces that exist and the dead reference is filed (OI-108's sibling, recorded in the
  brief's Q3) so the next reader does not re-derive the same dead end.
- **decision**: the ship-review approval was recorded with its scope stated explicitly, because
  OI-92 records a prior chain in this repo where an approval was read wider than it was given. Commit,
  push, PR, merge, Notion and dispatch all remain unauthorised.
- **constraint**: nothing in this chain was committed. Every follow-up that moves code is owned by the
  user.
- **deviation from the commit strategy, recorded**: the plan's Branch Strategy specified one commit per
  phase. The chain shipped as a single commit (`c347ac4`). Build completed as a unit before commit was
  authorised, and carving seven commits out of a finished tree afterwards would have fabricated
  boundaries the work did not have — artifacts in particular accrete across every phase and cannot be
  split along phase lines honestly. Stated in the commit message as well as here.
- **deviation from Blocked Handoff #5, recorded**: the handoff said "move to Done with the PR
  reference". The page was set to **🔵 In Progress**, not Done, because PR #70 is open and WP-R20 — also
  open at PR #69 — carries In Progress under the same rule the user chose on 2026-09-16 (Shipped Date
  means the merge date). Marking this row Done while its PR is unmerged would have made the release log
  disagree with itself. The page moves to Done on merge.
- **downstream**: this is the seventh and final package of 1.1.0. The release becomes dispatchable when
  this and PR #69 are merged — five of the six open handoffs are on that path.

## Exit Gate

- [x] Manifest Coverage Retrospective has one row per active R and RI — 11 rows.
- [x] Every follow-up has a named owner and a suggested artifact or ticket — 11 rows, none `TBD`.
- [x] Learning candidates tagged propose-only — 6.
- [x] `follow-up-owner-assigner` run: five new items filed (OI-107..OI-111), allocated after checking
      **both** ledger files per the two-file contract inherited from WP-R20; highest existing id was
      OI-106. Sweep executed: the live ledger holds no `done` item, so nothing rotated to the archive —
      `items_swept: 0`, reported rather than omitted.
- [x] Raw session written, append-only, Curator Marks empty.
- [x] `orchestration.status: done`, `next_phase: done`.
