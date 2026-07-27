---
slug: validator-false-positive-fixes
version: 1
artifact: learning-session
date: 2026-07-27
source: lifecycle-reflect
upstream:
  - workflow/artifacts/reflect/validator-false-positive-fixes-v1.md
---

# Raw Learnings - validator-false-positive-fixes v1

## Context

Full brief→plan→task→review→verify→ship→reflect chain fixing three open validator bugs (OI-29, OI-37, OI-38): `check-waivers.mjs`'s negation regex missing a "rather than" case, `check-scope-fence.mjs`'s boundary regex missing a bullet-dash-prefixed label case, and `lifecycle-test`'s Skipped Checks template undercounting its required columns. Shipped as PR #56 against `main`. The scope-fence fix's correctness surfaced two separate, unrelated waves of pre-existing historical debt mid-Build and again mid-Ship, each requiring a pause-and-ask rather than a silent decision.

## Candidate Learnings

- **Candidate learning**: When a fix corrects a validator false-negative (something that should have been caught but wasn't), immediately run it against the full real historical artifact tree, not just the new fixture — a false-negative fix by definition can surface real, previously-hidden violations elsewhere, and that's a different risk class than a false-positive fix (which can only narrow what gets flagged) — propose-only.
- **Candidate learning**: A regex requiring `$` with the `m` flag to bound a captured evidence quote will silently truncate at the first physical line break, not the intended logical end — this tripped twice in one session (`check-waivers.mjs`'s line-by-line scan in Build, `check-lifecycle.mjs`'s checkpoint-evidence capture in Ship). When authoring or debugging a quote/evidence field for this repo's own validators, always write it as a single unwrapped physical line, and when writing a *new* validator regex over free-form prose, treat multi-line-wrapped input as an explicit test case — propose-only.
- **Candidate learning**: When retroactively correcting historical artifacts to satisfy a validator fix, investigate each flagged instance's actual root cause individually before applying a fix — in this chain, 5 historical scope-fence violations turned out to have 3 distinct causes (self-referencing plan edits, a task-side basename duplication that needed no plan change at all, and two different unparseable Touches shorthands), and a single mechanical "add to Touches" pattern applied blindly would have produced at least one dishonest fix (the basename-duplication case) — propose-only.
- **Candidate learning**: "The work is verified and complete" and "the PR is merged" are different signals for closing an `open-items.yaml` entry — this session's user explicitly rejected gating OI-29/37/38's closure on merge status once Test had already independently re-verified everything, on the grounds that closure should track completion, not process state. Worth considering as a default going forward: close on verified completion, cite the branch/PR as evidence, don't wait for merge — propose-only.

## Raw Notes

- OI-29's fixture required real historical reproduction, not an invented example: `git log --all -S"rather than record"` traced the real false positive to commit `f99c388`, whose own commit message named the exact regex gap. The first fixture attempt (freely-written prose) failed to reproduce the bug at all — not because the fix was wrong, but because the invented text didn't happen to co-occur "waiver" with an R-id/gate word on the same physical line, which turned out to be a second, load-bearing detail (see the multi-line learning above) only visible once the *real* historical text was recovered and diffed against the freely-written version.
- The real historical trigger for OI-29 (from `f99c388~1`) turned out to satisfy the R-id/gate requirement only via a coincidental "r11" substring inside a cited filename (`wp-r11-docs-site-v1.md`) matching `\b(R|RI)\d+\b` case-insensitively — not a genuine manifest ID reference. Used an explicit, deliberate R-id mention in the final fixture instead of relying on that coincidence, since a future reader of the fixture should be able to tell why it reproduces the bug without decoding an accidental regex match.
- Running the fixed `check-scope-fence.mjs` against the full real `workflow/artifacts/` tree (not just fixtures, per the Plan's own Verification Plan) found 28 previously-hidden violations across 5 historical artifacts — paused Build and used AskUserQuestion rather than picking a resolution; user chose "correct the plans' Touches lists" over waiving or descoping.
- That same real-tree run, once re-triggered by staging the corrected historical plans for commit, hit a second and completely separate wave of pre-existing debt: the repo's mandatory pre-commit hook checks every staged lifecycle artifact's *own* next-phase gate, and 4 of the 5 corrected plans had no `## Checkpoint Approval` section at all — because that mechanism (added by `wp-r12-local-install-fixes-v1`'s R5) postdates all 4 of those chains. Two of the four turned out to already have real, contemporaneous approval quotes recorded in their own Exit Gate sections (just never moved into the newer structured section) — used those instead of the user's offered backfill text once found, since real historical evidence is strictly better than a retroactive one. The other two had no such record anywhere (checked both Plan and Ship artifacts before concluding this), and only used the user's explicitly-offered backfill text ("Plan is approved") after telling them plainly that no real record existed to cite — the validator's own error message ("do not self-author this evidence") made clear that inventing it myself was not an option, but the user directly supplying it in the moment is not the same as self-authorship.
- `check-release-readiness.mjs` rejects a `ship` recommendation body-text co-occurring with a non-empty `orchestration.blockers` list — initially used `blockers: [ship-review-pending]` to represent an unapproved checkpoint (matching a Plan-artifact precedent seen elsewhere in this repo's history), but that precedent doesn't transfer to Ship specifically, since `check-release-readiness.mjs` only runs against ship artifacts and treats any blocker as contradicting a stated "ship" recommendation. The correct mechanism for an unapproved checkpoint is `status: blocked-for-user` + `user_checkpoint: ship-review` alone, with `blockers: []`.

## Curator Marks

- promoted-to-curated: none
- consolidated-with: none
- rejected-as-not-general: none
