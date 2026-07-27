---
slug: validator-false-positive-fixes
version: 1
artifact: reflect
status: done
created: 2026-07-27
updated: 2026-07-27
manifest_ids: [R1, R2, R3, RI1]
upstream:
  - workflow/artifacts/briefs/validator-false-positive-fixes-v1.md
  - workflow/artifacts/plans/validator-false-positive-fixes-v1.md
  - workflow/artifacts/tasks/validator-false-positive-fixes-v1.md
  - workflow/artifacts/reviews/validator-false-positive-fixes-v1.md
  - workflow/artifacts/verify/validator-false-positive-fixes-v1.md
  - workflow/artifacts/ship/validator-false-positive-fixes-v1.md
orchestration:
  phase: reflect
  status: done
  next_phase: done
  blockers: []
  user_checkpoint: none
---

# Validator false-positive fixes (OI-29, OI-37, OI-38) - Reflect

## Inputs

- Ship artifact: `workflow/artifacts/ship/validator-false-positive-fixes-v1.md`, recommendation `ship`, checkpoint approved ("Appoved, commit and raise PR").
- Commit `d5578a9` on `fix/validator-false-positives`, pushed to `origin`, PR [#56](https://github.com/JeelVankhede/agentsmyth/pull/56) opened against `main`.

## Outcome

Shipped. Release: not required (`release.yaml`). Source-of-truth: not required. Rollback: `git revert` the merge commit once merged, self-contained scope. PR #56 open, not yet merged at the time of this Reflect — Reflect proceeds anyway per this chain's own decided precedent (verified completion, not merge status, is the closure signal; see Follow-Ups).

## What Worked

- Reproducing each bug against real historical text (not invented prose) before fixing it, for both R1 and R2 — this caught two separate false starts (a soft-wrapped fixture that didn't reproduce OI-29, and a naive first R2 fixture) before either fix was trusted.
- Pausing and using `AskUserQuestion` at both real scope-growth moments (the 28-issue scope-fence blast radius, and the checkpoint-approval gap on 4 of those same plans) instead of picking a resolution unilaterally. Both times the user's actual answer shaped the fix meaningfully (which files got Touches corrections vs. task-side fixes; which 2 of 4 plans got real historical quotes vs. a backfill).
- Independent re-verification at both Review and Test — rerunning every command fresh rather than citing Build's or Review's prior output — caught nothing new here, but is what makes the "no regression" claims in this chain's own artifacts mean something rather than being asserted.

## What Did Not Work

- First attempt at the OI-29 fixture used freely-composed prose instead of the real historical text, and silently failed to reproduce the bug (for a reason unrelated to the regex fix itself — a coincidental filename substring in the real case, absent from the invented one). Cost one extra round-trip before switching to `git show`-derived real text.
- Used `blockers: [ship-review-pending]` on the Ship artifact by analogy to a Plan-artifact precedent seen elsewhere in this repo's history, without confirming the analogy actually held for `check-release-readiness.mjs`'s specific ship-only contract. It didn't — cost a validate failure and a fix.
- The Checkpoint Approval evidence quotes for two historical plans were first written wrapped across two physical lines (matching normal prose style in this repo), which silently truncated under `check-lifecycle.mjs`'s multiline-`$`-bounded capture regex — same underlying class of bug as the OI-29 fixture's original line-wrap failure, hit twice in one session without connecting the two until the second occurrence.

## Surprises

- Fixing a validator false-negative (R2) has a fundamentally different and larger blast radius than fixing a false-positive (R1, R3): a false-positive fix can only ever narrow what gets flagged, but a false-negative fix can newly flag things that were always real. This wasn't explicitly named as a distinction in the Plan's Risk Register (which called R2 "highest risk" but framed the risk as "might not fix cleanly," not "will surface unrelated hidden debt") — worth naming explicitly next time a false-negative fix is scoped.
- The checkpoint-approval mechanism gap on 4 historical plans was a completely separate discovery from the scope-fence blast radius, surfaced only because committing those same 4 (now scope-fence-corrected) files triggered the mandatory pre-commit hook's own per-artifact phase-gate check. Two unrelated waves of historical debt, both only visible because this chain happened to touch those specific files for an unrelated reason.

## Manifest Coverage Retrospective

| Manifest ID | Outcome | Evidence path | Notes |
|---|---|---|---|
| R1 | shipped | `workflow/artifacts/verify/validator-false-positive-fixes-v1.md` | `check-waivers.mjs` fix, real historical reproduction. |
| R2 | shipped | `workflow/artifacts/verify/validator-false-positive-fixes-v1.md` | `check-scope-fence.mjs` fix; triggered the two waves of historical-debt discovery described above. |
| R3 | shipped | `workflow/artifacts/verify/validator-false-positive-fixes-v1.md` | Skipped Checks template fix, plus a second stale instance found beyond the original plan. |
| RI1 | shipped | `test/run-conformance-tests.mjs` | Three new regression checks (r14, r15, r16), 15/15 conformance suite green. |

## Deferred

none

## Source-of-Truth Outcome

not applicable

## Learning Candidates

- **Candidate learning**: A false-negative validator fix warrants running against the full real historical tree as a distinct, named Plan-phase risk category ("this fix may surface pre-existing hidden violations"), separate from and larger than "this fix may not work cleanly" — source: `workflow/artifacts/plans/validator-false-positive-fixes-v1.md` Risk Register — propose-only.
- **Candidate learning**: Any regex authored against this repo's own artifact prose that uses `$` with the `m` flag to bound a captured quote/evidence field will silently truncate at the first physical line wrap, not the field's logical end — write evidence quotes as one unwrapped line, and treat multi-line-wrapped input as an explicit test case for any new such regex — source: this session, hit twice (`check-waivers.mjs` fixture, `check-lifecycle.mjs` checkpoint evidence) — propose-only.
- **Candidate learning**: `open-items.yaml` entries can close on independently-verified completion rather than merge status, when the user explicitly directs it — source: this session's direct instruction ("have you worked for it? yes! then close it") — propose-only, and narrower than a blanket policy change: still worth asking rather than assuming for future chains, since several existing entries (OI-30, OI-33) used merge as their closure signal by established convention.

## Follow-Ups

| Action | Owner | Suggested Artifact Or Ticket | Status |
|---|---|---|---|
| Merge PR #56 into `main` | user | — | open |
| Decide whether `open-items.yaml`'s closure convention should generally shift toward "verified complete" over "merged," or stay case-by-case per explicit instruction | user | Notion decision log or `workflow/rules.md` amendment | open |
| Sweep other historical plans for the same missing-`## Checkpoint Approval` gap this chain found on 4 (out of the ones actually touched) — an unknown number of untouched historical plans likely share it, invisible until next touched | workflow owner | new open item once scoped | open |
| Consider whether `check-lifecycle.mjs`'s checkpoint-evidence regex should be hardened to accept a line-wrapped quote, rather than requiring authors to remember the single-line constraint | workflow owner | new open item once scoped | open |

## Raw Session Entry

See `workflow/learnings/sessions/2026-07-27-validator-false-positive-fixes.md`.

## Architecture Notes

- role: Project Manager
- decision: Two unrelated waves of historical-debt discovery in one chain (scope-fence violations, then checkpoint-approval gaps) were both handled the same way — pause, investigate root cause per-instance, ask the user, use real evidence where it existed before falling back to anything else. Consistency in that pattern across two different discoveries in the same session is itself worth naming as the thing that worked, not just each fix individually.
- constraint: Neither historical-debt fix expanded this chain's actual requirements (R1/R2/R3/RI1 stayed exactly as scoped at Plan) — both were corrections to pre-existing artifacts, tracked transparently in the task/ship artifacts' own Architecture Notes rather than folded into the requirement set.
- downstream: The two open follow-ups about systemic sweeps (other historical plans possibly missing Checkpoint Approval; the line-wrap regex fragility) are real, named, and left open rather than silently assumed fixed by this one chain's narrow touch.

## Exit Gate

- [x] Manifest Coverage Retrospective has one row per active R and RI.
- [x] Every follow-up has a named owner and suggested artifact title.
- [x] Learning candidates tagged propose-only.
- [x] orchestration.status: done, next_phase: done.
