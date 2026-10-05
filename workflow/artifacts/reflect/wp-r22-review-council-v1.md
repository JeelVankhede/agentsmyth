---
slug: wp-r22-review-council
version: 1
artifact: reflect
status: done
created: 2026-08-30
updated: 2026-08-30
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9, RI10, RI11, RI12, RI13, RI14, RI15, RI16, RI17, RI18, RI19, RI20, RI21, RI22, RI23, RI24, RI25]
upstream:
  - workflow/artifacts/ship/wp-r22-review-council-v1.md
orchestration:
  phase: reflect
  status: done
  next_phase: done
  blockers: []
  user_checkpoint: none
---

# WP-R22 Review Council - Reflect

## Inputs

The full chain: brief (32 requirements, three amendments), plan (ten phases), task, review (31
findings from a real council), verify (mutation testing), ship (recommendation `ship`).

## Outcome

Delivered: a Review council — read-only reviewers over disjoint risk categories, an adversarial
challenge pass, a parent that owns the verdict — plus the finding-quality ledger that makes a
council's value a number rather than an assertion. One validator serves both councils.

- Release status: **not released.** This chain ships into `release/1.1.0`; 1.1.0 itself still needs
  OI-69's upgrade rehearsal, a changelog, the merge to `main`, and `release.yml`.
- **The merge of PR #65 has not been performed.** The user approved the ship decision and the
  transition to Reflect; that is not merge authorization and was not treated as such. The branch is
  26 commits ahead of `release/1.1.0` and the PR is open and green.
- Source-of-truth: not required (`mode: optional`, no providers). Notion is informal.
- Rollback: real and exercised — `council.enabled: disabled` restores the single-agent Review path,
  which is byte-locked across all ten steps and CI-exercised.
- Waivers: none.

## What Worked

- **The council found what nine Build phases and three green suites did not.** 30 distinct defects,
  every P1 a rule the shipped documentation asserted while the code did not perform it. Fresh
  context over disjoint risk categories is the mechanism; the author could not have found these by
  reading, having just written them.
- **The challenger paid for itself.** It refuted or narrowed eight findings, six of which would
  otherwise have entered the review at full strength. On a phase whose output blocks a commit, a
  confident wrong finding costs real work.
- **Probing beat reading, every time.** Every P1 in the review, and every one of the 27 undefended
  rules at Test, came from mutating something and observing the result. Not one came from inspection.
- **The read-only fence held and was verified rather than asserted.** Repo digest byte-identical
  before and after a four-agent council.
- **Recording a decision's reasoning made later corrections cheap.** When RI8 changed host and when
  the `per_phase` shape changed, the brief and plan already said why the original choice was made,
  so the amendment was a paragraph rather than an archaeology exercise.

## What Did Not Work

- **A green suite meant almost nothing, twice.** Phase 9 silently deleted Phase 7's rules and every
  suite stayed green across two commits. Then mutation testing showed 27 of this package's own 86
  rules — and 106 of the package's 217 — were deletable with everything green. The suite answered
  "does it pass" when the question was "would it notice".
- **A fixture can pass for the wrong reason.** `cp-missing-classification` rejected via a different
  rule than its description named, so the named rule had no coverage at all, and the attribution
  sweep could not see it because it counts errors rather than which rule produced them.
- **My own tooling produced two confidently wrong measurements.** One inflated by running a
  repo-mutating harness concurrently with my own work; one reported *perfect* coverage because a
  fixture expectation had baked in "package.json has 63 lines", so a failing suite scored every
  mutant as killed. Neither announced a problem.
- **I disbelieved a correct measurement** on the strength of a manual check that was itself broken
  by the bug I had not yet found.
- **Scope discipline slipped in the record, not the code.** Two files were committed without any
  task artifact declaring them, because a fix-up edit failed on a stale match string and I did not
  re-check. The gate that should have caught it did not, and I could not explain why (OI-83).

## Surprises

- **The worst-defended validator is the most important one.** `check-lifecycle`, the phase gate every
  consumer repo runs, measured 16 of 17 rules undefended. The correlation is with how a validator is
  exercised — real healthy artifacts versus dedicated fixtures — not with how carefully it was
  written or how central it is.
- **A validator that exists to catch decoration was itself decoration.** `check-schema-keywords`
  exists to stop schemas declaring keywords the engine ignores; both of its own rules were
  undefended.
- **The strongest evidence for the feature came from the feature attacking its author.** The review
  found `check-council-record` rules the author had written days earlier and believed correct.

## Manifest Coverage Retrospective

| Manifest ID | Outcome | Evidence path | Notes |
|---|---|---|---|
| R1 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md | Scoped to council-log findings after Review found it binding briefs too |
| R2 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md |  |
| R3 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md | Was unenforced when the council ran; the council found it, and the positive control was itself violating it |
| R4 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md |  |
| R5 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md | Ledger completed a full cycle — 56 rows written, closed, rotated |
| R6 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md |  |
| R7 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md |  |
| RI1 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md |  |
| RI2 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md |  |
| RI3 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md | Byte-lock widened from 3 of 10 steps to all 10 after Review |
| RI4 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md |  |
| RI5 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md |  |
| RI6 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md |  |
| RI7 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md |  |
| RI8 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md |  |
| RI9 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md | 119 fixtures; 27 written because mutation testing found the rules undefended |
| RI10 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md |  |
| RI11 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md | The one requirement the council could not assess without breaking its own fence |
| RI12 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md |  |
| RI13 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md |  |
| RI14 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md | Starter block did not validate when the council ran; fixed |
| RI15 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md |  |
| RI16 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md |  |
| RI17 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md | Vacuous on omission and round-agnostic when the council ran; both fixed |
| RI18 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md | Attribution half of the predicate was unreachable; fixed |
| RI19 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md | Digest was never compared for a sandbox-free council; fixed |
| RI20 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md |  |
| RI21 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md | Enforcement existed but could report ok having validated nothing; fixed |
| RI22 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md |  |
| RI23 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md |  |
| RI24 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md |  |
| RI25 | shipped | workflow/artifacts/verify/wp-r22-review-council-v1.md | Derived mid-Build when probing showed every RI15 conditional inert |

## Deferred

- **OI-82 — 106 of 217 validator rules undefended.** Measured, baselined as a ratchet, not fixed.
  Predates this package; spans every validator.
- **OI-83 — the pre-commit gate did not fire once.** Verified working on a probe; unexplained on a
  real commit.
- **The merge of PR #65**, awaiting explicit approval.
- **A second council over the remediation.** The 31 findings were fixed by the same agent the
  council exists to check.

## Source-of-Truth Outcome

Not required, no handoff. The Notion WP-R22 page should move to Done with the PR reference once the
merge happens — deliberately not claimed here, since it has not been done.

## Learning Candidates

All `propose-only`. No curated learning file was edited.

1. **propose-only** — A passing negative test can pass for the wrong reason. Assert *which* error a
   fixture provokes, not merely that one occurred. Evidence: `cp` satisfied every check in the suite
   while testing a different rule than it named.
2. **propose-only** — "Does the suite pass" and "would the suite notice" are different questions,
   and only the second is evidence of coverage. Mutation testing answered it in minutes and found
   half the package's enforcement unlocked. Evidence: 106 of 217.
3. **propose-only** — A harness that reports success when its own preconditions are broken is worse
   than no harness, because the output is maximally reassuring exactly when it is worthless.
   Evidence: the audit reporting 0 undefended across 217 rules because one fixture had broken.

## Follow-Ups

| Item | Owner | Suggested artifact / ticket title | Status |
|---|---|---|---|
| Close the 106 undefended rules; ratchet the baseline down | workflow owner | "test: fixture the undefended validator rules (OI-82)" | open |
| Explain and close the pre-commit gate discrepancy | workflow owner | "fix(hooks): reproduce and close the silent commit-coverage pass (OI-83)" | open |
| Merge PR #65 into release/1.1.0 | user | "ship: merge WP-R22" | open |
| Run a second Review council over the remediation | user | "review: independent pass over the WP-R22 remediation" | open |
| Prefer the repo's own bin/ in the pre-commit hook | workflow owner | "fix(hooks): resolve agentsmyth from the repo under change" | open |

## Architecture Notes

- role: Reflector
- decision: Close the chain without the merge. The chain's own gates are satisfied and its artifacts
  are complete; the merge is a separate outward action with its own approval, and blocking Reflect on
  it would conflate "the work is done" with "the work is released".
- downstream: 1.1.0 should not publish before OI-82 is resolved. The package's central claim is
  mechanical enforcement, and half that enforcement is currently deletable without any suite
  noticing. That is not this chain's defect, but it is this release's problem.

## Raw Session Entry

`workflow/learnings/sessions/2026-08-30-wp-r22-review-council.md`

## Exit Gate

- [x] Reflect artifact exists with one coverage row per active R/RI.
- [x] Raw learning session written.
- [x] Outcome records release, source, and rollback status explicitly, including what was NOT done.
- [x] Learning candidates tagged `propose-only`; no curated learning file edited.
- [x] Follow-ups carry owners and suggested titles, and are persisted to `open-items.yaml`.
- [x] No unsupported external outcome claim — the merge and the Notion update are recorded as not done.
