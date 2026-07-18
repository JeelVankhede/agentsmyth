---
slug: lifecycle-process-hardening
version: 1
artifact: learning-session
date: 2026-07-18
source: lifecycle-reflect
upstream:
  - workflow/artifacts/reflect/lifecycle-process-hardening-v1.md
---

# Raw Learnings - lifecycle-process-hardening v1

## Context

Bundled 6 small open items (OI-8, OI-9, OI-12, OI-15, OI-26, OI-27) into one chain at the
user's suggestion, plus a 7th requirement (R7) added mid-Build after Phase 6's own
verification surfaced a live jargon leak in already-merged code. Shipped as PR #37, 7-phase
Build, 0 open Review/Verify findings at close.

## Candidate Learnings

- Bundling several small, independently-recorded follow-ups into one chain should budget for
  at least one item's real scope differing from its own follow-up description — a live
  Plan/Brief amendment mid-Build is a normal outcome of this pattern, not an exception.
- A verification step with a narrow stated purpose (confirm this diff is jargon-free) is
  still worth running against the full rebuilt output, not a diff-scoped subset — that's what
  surfaced R7, a live defect from a different, already-merged chain.
- check-waivers.mjs's unstructured-claim heuristic has now false-triggered on descriptive
  prose about waiver-related work (not an actual claim) twice across 2 chains — worth
  extending its existing reflect/-only exemption logic.

## Raw Notes

- R1 originally planned as a repo-wide free-text scan for range-shorthand (e.g. "R1-R4").
  Before writing any code, grepped the real pattern across workflow/artifacts/ — found 46
  occurrences, nearly all legitimate narrative shorthand, not defects. Re-read the original
  Wave 2 incident closely: only 1 of its 3 real instances (a Requirement Coverage table row)
  sat where a validator's contract was actually violated; the other 2 were explicitly
  described by that review as "not scanned by any current validator." Traced
  check-coverage-ledger.mjs's existing logic and found it already catches most of the
  fallout (every ID but the first in a range). Presented 2 options (narrow vs. drop) to the
  user; they chose narrow. Rescoped Brief/Plan before writing check-coverage-range-shorthand.mjs,
  confirmed via a scoped grep that the narrowed design has zero false positives against real
  content before implementation began.
- Built the narrowed validator, verified the regex correctly distinguishes a range (R1-R4)
  from a legitimate hyphenated sub-label (RI5-a) and a multi-ID cell (R9, RI3, RI4) via 6
  inline test cases before building the fixture. Zero false positives against 45 real files.
- Phase 2 (CI wiring): ran all 4 target scripts locally twice (Plan-time and immediately
  pre-edit) — all passed both times, confirming the CI-wiring risk (a red job) never
  materialized.
- Phase 3 (Ship steps 4a/6a) and Phase 5 (Build step 6b) were straightforward additive edits
  mirroring existing conventions (lifecycle-build's own pre-existing step 6a).
- Phase 4 (rules.md Approval section) — new section placed between Evidence and Git Safety.
- Phase 6 (full verification): rebuilt dist/, grepped for jargon — found 5 matches. 2 were
  benign (follow-up-owner-assigner's own ledger-format doc using OI-1/OI-2 as generic
  placeholder examples). 3 were real: check-manifest-coverage.mjs/check-coverage-ledger.mjs
  code comments (from the already-merged manifest-id-parser-hardening chain) referencing an
  internal chain name — a pre-existing, live defect this chain did not introduce. Reported
  rather than silently fixed or silently ignored.
- User said "Fix it in this chain" — amended Brief/Plan to add R7 before touching any file,
  then reworded the 4 flagged lines across 2 files, preserving the substantive technical
  reasoning while removing the internal references. Confirmed comment-only (no logic touched)
  by reading the diff hunks directly, not just trusting the "zero regression" claim.
- Review re-ran everything independently (build, validate, violations, conformance, dist
  grep, plus a fresh full-tree run of the new validator post-Phase-7) rather than trusting the
  task artifact's narrative. 0 findings.
- Test re-ran all 13 automated checks fresh, including the 4 newly-CI-wired scripts.
- Ship applied its own new step 4a to itself for the first time — fetched origin/main, found
  local main byte-identical, nothing to surface. A real (if unremarkable) self-consistency
  signal.
- check-waivers.mjs false-triggered once in this chain (task artifact's own Changed Files
  bullet naming a step "resolved-fix vs. waiver classification") — same false-positive class
  as manifest-id-parser-hardening's earlier "waived RI5-a's partial scope" instance. Worked
  around by rewording both times; not fixed at the validator level in either chain.
- Process: commit (918d01f) only after explicit request; push done by the user; PR #37
  created via gh pr create following the user's global PR template, only after explicit
  "raise PR" request. open-items.yaml: 6 items marked done with PR #37 citations, 2 new items
  added (OI-28 merge decision, OI-29 the recurring check-waivers false-trigger pattern).

## Curator Marks

- promoted-to-curated: none
- consolidated-with: none
- rejected-as-not-general: none
