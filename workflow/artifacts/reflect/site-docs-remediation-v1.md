---
slug: site-docs-remediation
version: 1
artifact: reflect
status: done
created: 2026-07-26
updated: 2026-07-26
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, R9, RI1]
upstream:
  - workflow/artifacts/briefs/site-docs-remediation-v1.md
  - workflow/artifacts/plans/site-docs-remediation-v1.md
  - workflow/artifacts/tasks/site-docs-remediation-v1.md
  - workflow/artifacts/reviews/site-docs-remediation-v1.md
  - workflow/artifacts/verify/site-docs-remediation-v1.md
  - workflow/artifacts/ship/site-docs-remediation-v1.md
orchestration:
  phase: reflect
  status: done
  next_phase: done
  blockers: []
  user_checkpoint: none
---

# Site docs remediation (Tier 1) - Reflect

## Inputs

- Ship recommendation: `ship`, real `ship-review` approval recorded ("Yes, push and open the PR").
- PR [#51](https://github.com/JeelVankhede/agentsmyth/pull/51) open (`fix/site-docs-remediation` → `main`), not yet merged at time of this reflection.

## Outcome

- Released: not yet merged. PR #51 open, ready for the user's own merge decision.
- Source-of-truth: not applicable.
- Release: not applicable — no version bump, package publish, or deployment in this brief's scope.
- Rollback: defined in the ship artifact (`git revert` the two feature commits, redeploy docs) — not exercised, no incident.
- All 10 active manifest IDs (R1-R9, RI1) shipped, no waivers, no deferred requirement within this brief's own scope.
- Mid-Ship, the plan's Branch Strategy assumption (continue on `fix/docs-site-base-path` because PR #49 was still open) went stale — the user reported PR #49 had already merged. Re-verified via `git merge-base --is-ancestor` before acting, then moved the work to a fresh branch off `main` per explicit user choice, rather than silently continuing on a dead branch or silently opening a second PR against a branch that no longer needed one.

## What Worked

- Independently re-deriving ground truth against `bin/agentsmyth.mjs` and `src/adapters/` during both Review and Test — rather than trusting the brief's/task's own citations — caught nothing new here, but it's the only way Review/Test evidence is worth anything; a rubber-stamp pass on wording someone else already wrote would have been much weaker verification.
- Closing Review's one open residual risk (R9's four-combination visual-render claim) by reading VitePress's own `VPImage.vue` component source, rather than attempting a live screenshot, produced stronger evidence than a single-viewport render would have — the CSS rule (`html:not(.dark) .VPImage.dark{display:none}`) has no OS-conditional branch, so one source read proves all four combinations at once.
- Treating "All PRs are already merged" as a state report requiring a decision, not as an implicit instruction — surfacing the branch-strategy fork explicitly (per `lifecycle-ship`'s step 4a) rather than guessing avoided either silently opening a confusing second PR against a dead branch or silently rewriting the plan's already-approved Branch Strategy without the user's input.
- Running `npm run validate` proactively during Test (it's only configured for `[review, ship]` phases, not `test`) surfaced two genuine issues in this chain's own artifacts before they reached Ship: an ambiguous-wording false-positive in the review's Notes column (`check-coverage-ledger` flagging "dropped"/"out of scope" language describing unrelated things) and a malformed phase-number format in the task artifact (`check-scope-fence`). Both were real defects in the artifacts, not validator bugs, and running the check one phase earlier than strictly required caught them before Ship.

## What Did Not Work

- The task and review artifacts' own free-text prose tripped two validators that weren't run until deep into Test, even though `check-coverage-ledger` and `check-scope-fence` are cheap, fast, and could have been run immediately after each artifact was written in Build/Review rather than batched into one `npm run validate` call at the end of Test. Writing free-form evidence prose without an intermediate validate pass risks compounding small wording issues before they're caught.
- The plan's Branch Strategy (`workflow/artifacts/plans/site-docs-remediation-v1.md`) hard-coded an assumption about another PR's (`#49`) open/closed state at Plan time, with no explicit trigger telling a later phase to re-check that assumption before acting on it. It happened to get caught here because the user volunteered the update, not because the lifecycle prompted for it — `lifecycle-ship`'s step 4a (fetch and compare against remote default branch) is the closest existing safeguard, and it did work once invoked, but nothing forces an agent to invoke it before Ship if the user hadn't mentioned it first.

## Surprises

- None beyond the branch-staleness discovery already covered above under Outcome/What Did Not Work — no other surprises this run.

## Manifest Coverage Retrospective

| Manifest ID | Outcome | Evidence path | Notes |
|---|---|---|---|
| R1 | shipped | `workflow/artifacts/ship/site-docs-remediation-v1.md` — R1 row | |
| R2 | shipped | Same — R2 row | |
| R3 | shipped | Same — R3 row | |
| R4 | shipped | Same — R4 row | |
| R5 | shipped | Same — R5 row | `site/under-hood.md:49`'s matching stale value is an accepted, explicitly out-of-scope gap — see Deferred below. |
| R6 | shipped | Same — R6 row | |
| R7 | shipped | Same — R7 row | |
| R8 | shipped | Same — R8 row | |
| R9 | shipped | Same — R9 row | |
| RI1 | shipped | Same — RI1 row | |

## Deferred

- `site/under-hood.md:49` still carries the stale `.cursor/rules/index.mdc` value that R5 fixed everywhere else in scope. Explicitly out of this brief's scope from Think onward (one of four pages named in the brief's Tier 3/T-D14 sweep) — not a gap discovered during execution. Tracked as OI-53 below.

## Source-of-Truth Outcome

not applicable.

## Learning Candidates

- **Candidate learning**: When a plan's Branch Strategy or other environment assumption depends on external state that can change between phases (an open PR, a feature flag, a package version), Ship's step 4a (fetch + compare against remote) should be treated as mandatory to run proactively before acting on that assumption, not just as a response to the user happening to mention a change — source: this run's `fix/docs-site-base-path`/PR #49 staleness, caught only because the user volunteered it — propose-only.
- **Candidate learning**: Running the repo's configured `npm run validate` (or equivalent) immediately after writing each lifecycle artifact — not just once, batched, during Test — catches artifact-prose validator false-positives (ambiguous wording tripping regex-based checks like `check-coverage-ledger`) while the fix is still cheap and the context is still fresh, rather than discovering them several phases later — source: this run's coverage-ledger and scope-fence fixes during Test — propose-only.

## Follow-Ups

| Action | Owner | Suggested Artifact Or Ticket | Status |
|---|---|---|---|
| Decide whether/when to merge PR #51 (`fix/site-docs-remediation`) | user | PR #51 | open |
| Fix `site/under-hood.md:49`'s stale `.cursor/rules/index.mdc` value as part of the future T-D14 four-page sweep (Tier 3, out of this brief's scope) | whoever picks up the T-D14 sweep | future brief covering Tier 3 (README restructure, four-page sweep, `/in-action` disclaimer, per-page meta descriptions, conceptual diagrams) | open |
| Consider whether `lifecycle-ship`'s step 4a (fetch/compare against remote default branch) should be reworded from a conditional ("when... may have advanced") to an unconditional "always run before acting on a plan's Branch Strategy" — this run's staleness was only caught because the user mentioned it, not because the step was proactively triggered | workflow owner | future lifecycle-hardening WP, if this pattern recurs | open |
| Consider adding a fast, cheap validator step (or explicit reminder) inside `lifecycle-build`/`lifecycle-review` to run `npm run validate` right after each artifact is written, rather than deferring all validation to Test | workflow owner | future validator-hardening WP, if this pattern recurs | open |

## Raw Session Entry

See `workflow/learnings/sessions/2026-07-26-site-docs-remediation.md`.

## Architecture Notes

- role: Project Manager
- decision: Recorded the branch-strategy pivot (continuing on a dead merged branch → fresh branch off `main`) as a process observation here rather than retroactively editing the plan artifact's already-approved Branch Strategy section — the plan's approval stands as a record of what was believed true at Plan time; the deviation and its reason live in Ship's Inputs/Architecture Notes and here, which is the correct place for a decision made after the plan was locked.
- constraint: No mechanical enforcement exists yet for "re-check external branch/PR state before Ship acts on a plan's stated strategy" — this run relied on the user volunteering the update plus `lifecycle-ship`'s existing (but conditionally-worded) step 4a. Disclosed as a real limitation, not overclaimed as automatic protection.
- downstream: Future runs should watch whether branch/PR-state staleness recurs without the user proactively mentioning it — if so, escalate step 4a from conditional prose to an unconditional pre-Ship check, following the same two-layer pattern (prose → mechanical gate) already used for checkpoint approval (R5, `wp-r12-local-install-fixes-v1`).

## Exit Gate

- [x] Manifest Coverage Retrospective has one row per active R and RI.
- [x] Every follow-up has a named owner and suggested artifact title.
- [x] Learning candidates tagged propose-only.
- [x] `orchestration.status: done`, `next_phase: done`.
