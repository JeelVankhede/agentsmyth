---
slug: open-items-remediation
version: 1
artifact: reflect
status: done
created: 2026-09-09
updated: 2026-09-09
manifest_ids:
  - R1
  - R2
  - R3
  - R4
  - R5
  - R6
  - R7
  - R8
upstream:
  - workflow/artifacts/briefs/open-items-remediation-v1.md
  - workflow/artifacts/plans/open-items-remediation-v1.md
  - workflow/artifacts/tasks/open-items-remediation-v1.md
  - workflow/artifacts/reviews/open-items-remediation-v1.md
  - workflow/artifacts/verify/open-items-remediation-v1.md
  - workflow/artifacts/ship/open-items-remediation-v1.md
orchestration:
  phase: reflect
  status: done
  next_phase: done
  blockers: []
  user_checkpoint: none
---

# Open-Items Remediation (pre-1.1.0) — Reflect

## Inputs

The six upstream artifacts above. Ship recommendation `ship`, approved at the `ship-review`
checkpoint on 2026-09-09 for the decision and the phase transition only. Branch
`chore/open-items-triage-1.1.0` at `9cd920b`, five commits unpushed, PR #66 open and stale.

## Outcome

Eight requirements, all shipped. Twelve open items closed across the chain (OI-16, OI-20, OI-43,
OI-45, OI-55, OI-56, OI-65/OI-5, OI-66, OI-67, OI-69, OI-79, OI-82, OI-84, OI-86), three new ones
filed (OI-88, OI-89, OI-90), and one materially advanced without being closed (OI-83).

- **Release:** not in scope for this chain. 1.1.0 publishes from `main` via `release.yml`;
  this chain contributes the CHANGELOG entry and leaves `package.json` at `1.0.1` deliberately.
- **Source-of-truth:** not applicable — no provider configured.
- **Rollback:** recorded in ship v1. One commit (`ecbef64`) carries all shipped behaviour change;
  the rest are records and documentation. Nothing has been published, so rollback is a branch
  operation.
- **Waivers:** none. Test was skippable for a Standard chain and was not skipped.

## What Worked

- **Reviewing the diff instead of the record.** Review was scoped to `release/1.1.0..HEAD` — what
  PR #66 actually merges — rather than to the five phases the task artifact described. That single
  choice produced F1 and F2. A review scoped to the record would have confirmed the record, passed
  the chain, and shipped a PR whose largest two bodies of work no artifact mentioned.
- **Reproducing before concluding.** Every load-bearing claim in the Review was executed, not
  reasoned: the coverage rule recomputed against the task artifacts as they existed at each of two
  commits; the validator trees compared file by file; the resolution defect demonstrated with a
  marker experiment. The marker attempt is the instructive one — the first version was appended
  after the validator's own `process.exit()`, where it could never run, and would have "confirmed"
  the defect either way. Reading the file before trusting the probe is what caught it.
- **Re-running verification instead of citing it.** Two residual risks were closed by doing the
  work rather than arguing about it, and both paid: the full mutation audit confirmed `0/221` at
  head, and re-running R4's upgrade rehearsal against the real published tarball surfaced F6, a
  defect invisible in the previous run's summary.
- **Validators catching artifact prose.** `check-evidence-citations` rejected the verify artifact
  for seven empty evidence cells, and `check-release-readiness` rejected the ship artifact for
  declaring `ship` while carrying blockers. Both within a minute of writing, both exactly the class
  of failure R3 added its run-validate-immediately rule for. The second taught a real distinction:
  a pending decision is a checkpoint, not a blocker.
- **The three-way split in the ship ask.** Approving the ship decision, pushing, and merging were
  presented as separate choices. "Continue to reflect" then had exactly one meaning, and the
  checkpoint records which.

## What Did Not Work

- **Scope discipline failed first, and everything else followed.** Thirteen commits landed after
  Build closed, under no requirement and no plan phase, one of them reversing a Non-Goal this
  chain's own brief had declared. The lifecycle's rule — new requirements return to Think/Plan or
  require an explicit plan update — is not ambiguous. It was not followed, and nothing mechanical
  noticed.
- **A mandatory gate did not execute, twice, and still cannot be explained.** The coverage rule was
  recomputed at both commits and rejects both. Hook mode, `core.hooksPath`, the trivial-size escape
  and CLI support were all checked and excluded. `--no-verify` leaves no trace, so the cause is
  unproven — and a gate whose bypass is invisible is a gate that reports discipline it has not
  verified.
- **A fix that solved half its problem was recorded as closed.** OI-86 made the hook prefer the
  repo's own `bin/`, which changed only which CLI ran; the validator files still came from
  `definitions_root`. The item's own text noticed the coupling and dismissed it as harmless because
  the trees were byte-identical — which stopped being true in the very same chain, when R2 changed
  a validator.
- **A review overstated one of its own findings.** F5 was written as a breaking change to a shipped
  contract. `check-council-record` has never been published; councils ship first in 1.1.0. The
  installed tree carried the file, which is what made it look shipped — itself a symptom of F3.
  Caught only when the recommendation was challenged.

## Surprises

- **Repairing debt can make coverage worse.** Fixing the grandfathered artifact violations (R6)
  removed the only thing exercising `check-artifacts`' next_phase rule, and the undefended count
  went **up**. A rule whose sole exercise is a real violation in this repo's own artifacts stops
  being defended the moment someone fixes the artifact.
- **The coverage gate unions Changed Files across every task artifact in the repo, not the active
  chain.** 80 of the 81 gated files in this branch were "covered" by chains closed months ago. The
  rule asks whether some chain once touched this path, not whether this change is in scope — which
  is a much weaker claim than the gate's name suggests.

## Manifest Coverage Retrospective

| Manifest ID | Outcome | Evidence path | Notes |
|---|---|---|---|
| R1 | shipped | `workflow/artifacts/verify/open-items-remediation-v1.md` — R1 row | The `set -e` half is complete; the binary half needed F3 to actually reach the validators. |
| R2 | shipped | `workflow/artifacts/verify/open-items-remediation-v1.md` — R2 row | Fixture `fw` plus a numeric-selection probe. |
| R3 | shipped | `workflow/artifacts/verify/open-items-remediation-v1.md` — R3 row | Prose-only; carried as OI-89. |
| R4 | shipped | `workflow/artifacts/verify/open-items-remediation-v1.md` — Manual QA | The rehearsal found F6 on its second run. |
| R5 | shipped | `workflow/artifacts/verify/open-items-remediation-v1.md` — R5 row | |
| R6 | shipped | `workflow/artifacts/verify/open-items-remediation-v1.md` — R6 row | Recorded retroactively; first Test phase it ever had. |
| R7 | shipped | `workflow/artifacts/verify/open-items-remediation-v1.md` — R7 row | Recorded retroactively; `0/221` measured at head. |
| R8 | shipped | `workflow/artifacts/reviews/open-items-remediation-v1.md` — F1–F6 Fixed lines | F6 was found by R4 and fixed in the same phase. |

## Deferred

none — no requirement was deferred, dropped or waived. Three follow-ups were filed as open items
rather than deferred requirements; they are new work, not unfinished work from this manifest.

## Source-of-Truth Outcome

not applicable — `source-of-truth.yaml` configures no provider, and no external source was written.

## Learning Candidates

- **Candidate learning**: Review the diff the PR merges, not the phases the task artifact
  describes. When the two disagree, that disagreement is the finding — and it is invisible to a
  review scoped to the record. — source: `workflow/artifacts/reviews/open-items-remediation-v1.md`
  (F1) — propose-only.
- **Candidate learning**: When a probe returns the answer that confirms your hypothesis, verify the
  probe could have returned the other answer. A marker appended after `process.exit()` proves
  nothing and looks like proof. — source: `workflow/artifacts/tasks/open-items-remediation-v1.md`
  (Phase 8, F3) — propose-only.
- **Candidate learning**: A "harmless" coupling recorded as harmless because two things are
  currently identical becomes a defect the moment one changes — often in the same chain that
  recorded it. Close the coupling or state what would make it bite. — source:
  `workflow/artifacts/reviews/open-items-remediation-v1.md` (F3) — propose-only.

## Follow-Ups

| Action | Owner | Suggested Artifact Or Ticket | Status |
|---|---|---|---|
| Push `chore/open-items-triage-1.1.0` and merge PR #66 into `release/1.1.0` | user | OI-90 | open |
| Give the coverage rule a range mode so CI can re-run it on the PR head, where `--no-verify` has no effect | workflow owner | OI-83 | open |
| Sweep the validator set for `--dir` with a missing operand | workflow owner | OI-88 | open |
| Decide whether the prose-only skill rules need mechanical backing, jointly with OI-50 | workflow owner | OI-89 | open |
| Re-derive the npm audit position before the 1.1.0 dispatch | user / repo maintainer | OI-35 | open |
| Complete the 1.1.0 release sequence | user | OI-87 | open |

## Raw Session Entry

See `workflow/learnings/sessions/2026-09-09-open-items-remediation.md`.

## Architecture Notes

- role: Project Manager
- decision: closed the chain with the push and merge still outstanding. The ship approval was
  scoped to the decision, and Reflect does not widen it.
- constraint: this chain's two largest requirements (R6, R7) were written after their work landed.
  The record is accurate now, but it was reconstructed rather than planned, and the brief says so.
- downstream: the 1.1.0 release inherits an unpushed branch, a stale PR, an unre-derived npm audit
  position (OI-35), and a CHANGELOG entry dated 2026-09-08 that needs correcting if the dispatch
  slips further.

## Exit Gate

- [x] Manifest Coverage Retrospective has one row per active R; this chain declares no RI.
- [x] Every follow-up has a named owner and an open item to carry it.
- [x] Learning candidates tagged propose-only; no curated learning file was edited.
- [x] `orchestration.status: done`, `next_phase: done`.
