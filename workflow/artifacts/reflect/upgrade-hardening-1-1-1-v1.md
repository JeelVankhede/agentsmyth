---
slug: upgrade-hardening-1-1-1
version: 1
artifact: reflect
status: done
created: 2026-10-11
updated: 2026-10-11
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, RI1, RI2, RI3, RI4, RI5]
upstream:
  - workflow/artifacts/briefs/upgrade-hardening-1-1-1-v1.md
  - workflow/artifacts/plans/upgrade-hardening-1-1-1-v1.md
  - workflow/artifacts/tasks/upgrade-hardening-1-1-1-v1.md
  - workflow/artifacts/reviews/upgrade-hardening-1-1-1-v1.md
  - workflow/artifacts/verify/upgrade-hardening-1-1-1-v1.md
  - workflow/artifacts/ship/upgrade-hardening-1-1-1-v1.md
orchestration:
  phase: reflect
  status: done
  next_phase: done
  blockers: []
  user_checkpoint: none
---

# 1.1.1 upgrade hardening - Reflect

## Inputs

The full chain under `workflow/artifacts/*/upgrade-hardening-1-1-1-v1.md` and commit `76bc3b6` on `fix/1.1.1-upgrade-hardening`. The commit holds 32 files, and the pre-commit gate ran and passed on it.

## Outcome

All 12 requirements shipped to the branch:
- the two field findings, each reproduced on the released code and fixed;
- 5 Review findings, all fixed, none accepted;
- no waivers, no skipped checks, no residual risk, and no new open items.

The version bump and publish are CI's, per the user. The CHANGELOG entry sits under `## [Unreleased]`. Not pushed; no PR.

## What Worked

- **Reproducing on the released code.** Building `git archive v1.1.0` / `v1.0.1` and installing each into a scratch `HOME` turned both reports from claims into observed output:
  - Released 1.1.0 skipped `model_tier`: `model_tier items: 0`, `Added 3`.
  - The installed validators failed with the reported messages verbatim.
  - The 1.0.1 install really has no ledger, which is the case only `retiredDefinitionFiles` covers.
  - The consumer-sweep simulations assume those shapes; the trials showed the releases produce them. See verify Trials A and B.
- **Revert demonstrations for every new guard.** J5–J8 against the old family-marker guard, the sweep against an empty `SOURCE_ONLY`, and r26 against the old router wording each failed before passing. None of the new tests is green only because it never ran.
- **Byte-level parity for the gate refactor.** 32 runs of old vs new `check-lifecycle`, 0 differences. It was re-run after F1's fix to show the fix moved nothing anyone relies on.
- **Deriving the conformance expectations from the templates.** r26 reads the tokens and the `Placed at` paths from the five adapter templates rather than restating them, and that is how it found F4: a defect all three copies shared, which no copy-vs-copy comparison could have seen.

## What Did Not Work

- **First pass treated two findings as acceptable residual risk.** F3 and the flow-style scan were filed as "accepted" in a bug-fix release. The user overruled it ("NO OPEN ITEMS, THIS IS A BUG FIX VERSION AND I WANT ALL OF THEM FIXED AS REPORTED"). Fixing F3 then uncovered F4, a real shipped defect, so the "accepted" call had hidden a bug, not just deferred polish.
- **Unquoted plan Touches.** The plan listed paths without backticks, so `check-scope-fence` parsed every phase's scope as empty, and validate failed mid-Build. The plan's own output schema shows the backtick form; the chain didn't copy it.
- **New suite not wired into CI on first write.** `consumer-sweep:test` was caught by conformance `r22-every-suite-runs-in-ci` at the Build handoff, not at authoring, which cost a plan amendment.
- **Two denied shell commands.** One staged a temporary file inside `src/` and removed it; one used `rm -rf` on scratch. Both were redone entirely inside the scratchpad without deletes. The lesson: keep comparison copies out of the source tree from the start.

## Surprises

- F4: the setup skill's "path named in the template's first line" had shipped in 1.1.0 and was true of no template. It surfaced only because the guard took its expectations from the templates.
- The mutation audit took ~55 minutes for 248 rules, which explains most of the reported ~1h30m release runtime.

## Manifest Coverage Retrospective

| Manifest ID | Outcome | Evidence path | Notes |
|---|---|---|---|
| R1 | shipped | workflow/artifacts/verify/upgrade-hardening-1-1-1-v1.md | J5/J6 + Trial A |
| R2 | shipped | workflow/artifacts/verify/upgrade-hardening-1-1-1-v1.md | J7–J9 + 42-case harness |
| R3 | shipped | workflow/artifacts/verify/upgrade-hardening-1-1-1-v1.md | dist grep 0 |
| R4 | shipped | workflow/artifacts/verify/upgrade-hardening-1-1-1-v1.md | sweep + Trial B |
| R5 | shipped | workflow/artifacts/tasks/upgrade-hardening-1-1-1-v1.md | revert demonstration |
| R6 | shipped | workflow/artifacts/reviews/upgrade-hardening-1-1-1-v1.md | F3/F4; conformance r26 |
| R7 | shipped | workflow/artifacts/verify/upgrade-hardening-1-1-1-v1.md | tier-note cases + Trial A |
| RI1 | shipped | workflow/artifacts/verify/upgrade-hardening-1-1-1-v1.md | J1–J4, J6 |
| RI2 | shipped | workflow/artifacts/verify/upgrade-hardening-1-1-1-v1.md | upgrade-path 178 |
| RI3 | shipped | workflow/artifacts/verify/upgrade-hardening-1-1-1-v1.md | real 1.1.0 + 1.0.1 installs cleaned |
| RI4 | shipped | workflow/artifacts/verify/upgrade-hardening-1-1-1-v1.md | source-only wording |
| RI5 | shipped | workflow/artifacts/verify/upgrade-hardening-1-1-1-v1.md | 16 suites + mutation 0/248 |

## Deferred

none

## Source-of-Truth Outcome

not applicable. No provider is configured.

## Learning Candidates

- **Candidate learning**: In a bug-fix release, Review dispositions are "fixed" only. A finding that seems acceptable is a question for the user, never a self-granted acceptance. Here the one finding accepted on judgement was hiding a shipped defect (F4). — source: workflow/artifacts/reviews/upgrade-hardening-1-1-1-v1.md — propose-only.
- **Candidate learning**: When an instruction is restated in several places, guard it against the thing it describes (here the adapter templates), not just against the other copies. A shared error passes every copy-vs-copy check. — source: test/run-conformance-tests.mjs (r26) — propose-only.
- **Candidate learning**: For an upgrade or installer defect reported from the field, reproduce it on the released code (`git archive <tag>` into a scratch `HOME`) before and after the fix. Simulated install shapes in a suite are evidence only once a real release is shown to produce them. — source: workflow/artifacts/verify/upgrade-hardening-1-1-1-v1.md (Trials A, B) — propose-only.

## Follow-Ups

none. By user direction, this bug-fix chain files no follow-ups or open items. Every finding was fixed in the chain.

## Raw Session Entry

See `workflow/learnings/sessions/2026-10-11-upgrade-hardening-1-1-1.md`.

## Architecture Notes

- role: Project Manager
- decision: No follow-ups and no open items, per the user's direction for bug-fix releases. Learning candidates are proposals only and do not enter any ledger.
- constraint: Push, PR and release are outside this chain. Push and PR need separate confirmation; the version bump and release belong to CI.
- downstream: The CI release run lifts `## [Unreleased]` into the numbered entry. The new `consumer-sweep:test` now runs on every push and every release.

## Exit Gate

- [x] Manifest Coverage Retrospective has one row per active R and RI.
- [x] Every follow-up has a named owner and suggested artifact title (none filed).
- [x] Learning candidates tagged propose-only.
- [x] orchestration.status: done, next_phase: done.
