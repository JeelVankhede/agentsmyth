---
slug: wp-r9c-tui-polish
version: 1
artifact: reflect
status: done
created: 2026-07-19
updated: 2026-07-19
manifest_ids: [R1, R2, R3, RI1, RI2, RI3]
upstream:
  - workflow/artifacts/briefs/wp-r9c-tui-polish-v1.md
  - workflow/artifacts/plans/wp-r9c-tui-polish-v1.md
  - workflow/artifacts/tasks/wp-r9c-tui-polish-v1.md
  - workflow/artifacts/reviews/wp-r9c-tui-polish-v1.md
  - workflow/artifacts/verify/wp-r9c-tui-polish-v1.md
  - workflow/artifacts/ship/wp-r9c-tui-polish-v1.md
orchestration:
  phase: reflect
  status: done
  next_phase: done
  blockers: []
  user_checkpoint: none
---

# WP-R9c — Node TUI Polish (clack + esbuild) - Reflect

## Inputs

- Full chain: brief → plan (3 phases) → task → review → verify → ship, all
  `ready-for-next-phase`/`ship`, 0 open findings at close (1 P1 found and fixed same-cycle).
- Ship: approved, committed nowhere yet (both R9a and R9c sit uncommitted-then-committed
  separately — R9a already committed at `2f6cb2a`/`a050452`; R9c not yet committed).
- Origin: Notion [WP-R9c](https://app.notion.com/p/3a1972bdebbb8188b7c3ea54b401d02f), built
  directly on `feat/wp-r9a-adapter-gate-dedup`'s work per the user's explicit sequencing.

## Outcome

Shipped locally, not yet committed. All 6 requirements (R1, R2, R3, RI1, RI2, RI3) implemented,
verified, and reviewed with 0 open findings, reproduced 3× across Build/Review/Test/Ship.
Release/deployment: not applicable. Source-of-truth: not applicable. Rollback: `git revert`,
clean. This is the first chain this session (and this repo) to introduce a real third-party
dependency, even though it's dev-only and fully bundled at build time.

## What Worked

- The scoping correction found at Think (the real, single existing prompt vs. R9b's
  not-yet-built future ones) kept this chain grounded in real, testable code rather than
  speculative UX — R1's acceptance criteria were concrete from the start because they were
  about something that already existed.
- The architecture decision (new `src/cli/` → `bin/` bundling pattern, `bin/agentsmyth.mjs`
  itself staying unbundled) was reasoned through explicitly at Think, with a named rejected
  alternative and rationale — not decided implicitly during Build. Nothing about the design
  needed revisiting once Build started.
- **Review caught a real, meaningful bug by reading the third-party library's actual compiled
  source rather than trusting its type signature.** `@clack/prompts`'s `confirm()` defaults to
  accept on bare Enter — the opposite of the safe-decline default the prompt it replaced had.
  This is exactly the kind of defect a superficial "does it compile, does it look right" review
  would miss, since the type signature (`initialValue?: boolean`) gives no hint which way it
  defaults. Fixed same-cycle, verified present in the actual shipped bundle, not just the
  pre-build source.
- A real environment constraint (no TTY in this sandboxed shell) was documented honestly as a
  Skipped Check rather than either faked or silently omitted — the closest available
  substitute (verifying `isCancel()`'s pure-function behavior, proving the non-TTY branch
  unchanged by the diff itself, confirming the fix in the shipped bundle) was used and named
  explicitly as a substitute, not presented as equivalent to real interactive testing.

## What Did Not Work

- The same evidence-citation gap from WP-R9a recurred here: the first draft of both the Review
  and Verify artifacts' tables left cells empty (Notes column in Review's Verification
  Reviewed table; the `manifest_ids` column entirely missing from Verify's Skipped Checks
  table), both caught immediately by `npm run validate` and fixed same-turn. Two occurrences
  in two consecutive chains within the same session is now a real pattern, not a one-off typo
  — see Learning Candidates.

## Surprises

None beyond the `initialValue` finding itself, which is captured as a Learning Candidate
rather than a Surprise since it's a durable, generalizable lesson (verify third-party runtime
defaults from source, not types) rather than a one-off oddity.

## Manifest Coverage Retrospective

| Manifest ID | Outcome | Evidence path | Notes |
|---|---|---|---|
| R1 | shipped | `workflow/artifacts/verify/wp-r9c-tui-polish-v1.md` Manifest Coverage row R1 | Includes the `initialValue` fix, verified in the shipped bundle |
| R2 | shipped | `workflow/artifacts/verify/wp-r9c-tui-polish-v1.md` Manifest Coverage row R2 | New `src/cli/` -> `bin/` bundling pattern, reusable by WP-R9b |
| R3 | shipped | `workflow/artifacts/verify/wp-r9c-tui-polish-v1.md` Manifest Coverage row R3 | Non-TTY branch provably unchanged |
| RI1 | shipped | `workflow/artifacts/verify/wp-r9c-tui-polish-v1.md` Manifest Coverage row RI1 | First dependency (dev-only) this repo has taken on |
| RI2 | shipped | `workflow/artifacts/verify/wp-r9c-tui-polish-v1.md` Manifest Coverage row RI2 | Zero real jargon |
| RI3 | shipped | `workflow/artifacts/verify/wp-r9c-tui-polish-v1.md` Manifest Coverage row RI3 | Zero regression, including 4 CLI-specific suites |

## Deferred

- Real interactive TTY exercise of the accept/decline/cancel prompt — genuinely not possible
  in this session's environment. Deferred to the first real user session that triggers this
  prompt (documented as a Skipped Check in Verify, `blocks_ship: no`).

## Source-of-Truth Outcome

not applicable.

## Learning Candidates

- **Candidate learning**: when integrating a new third-party library, verify its documented
  default behavior against real compiled source, not just its type signature or README summary
  — a type like `initialValue?: boolean` gives no indication of which way it defaults when
  omitted. This chain's own `@clack/prompts` `confirm()` default (accept-on-Enter) would have
  silently shipped as a real safety regression on a destructive-action prompt if Review hadn't
  read the actual runtime source. Source: this chain's own Review Findings — propose-only.
- **Candidate learning**: the "empty evidence-citation cell" mistake (a table row missing a
  required column's content) has now recurred in 2 consecutive chains within the same session
  (`wp-r9a-adapter-gate-dedup` and this chain), both caught immediately by `npm run validate`
  but both requiring a same-turn fix cycle. Worth a lighter-weight local habit — visually
  scanning a newly-written evidence table for empty cells before running validate, rather than
  relying on the validator to catch it after the fact every time. Source: this chain's and
  WP-R9a's own `check-evidence-citations`/`check-skipped-accounting` catches — propose-only.

## Follow-Ups

| Action | Owner | Suggested Artifact Or Ticket | Status |
|---|---|---|---|
| Commit and decide on push/PR for both `wp-r9a-adapter-gate-dedup` (already committed, `2f6cb2a`/`a050452`) and `wp-r9c-tui-polish` (not yet committed) | user | manual action | open |
| Update Notion WP-R9a and WP-R9c pages to reflect completion (Build done, 0 findings) | user/agent | Notion update | open |
| Start WP-R9b when ready — reuses R9a's dedup logic and R9c's `src/cli/` bundling pattern verbatim, per both chains' own downstream notes | user | new lifecycle chain | open |

## Raw Session Entry

See `workflow/learnings/sessions/2026-07-19-wp-r9c-tui-polish.md`.

## Architecture Notes

- role: Project Manager
- decision: No new `open-items.yaml` entries needed — this chain's follow-ups are mechanical
  (commit/push/PR decisions, Notion sync, starting R9b), already captured above.
- downstream: WP-R9b inherits two concrete, proven assets from this session's R9a/R9c work:
  the adapter-gate dedup logic (10-scenario-verified) and the `src/cli/` -> `bin/` bundling
  pattern (genuinely bundled, verified standalone-runnable). Neither should be redesigned when
  R9b starts — both are load-bearing precedent now, not just prior art to reference loosely.

## Exit Gate

- [x] Manifest Coverage Retrospective has one row per active R and RI.
- [x] Every follow-up has a named owner and suggested artifact title.
- [x] Learning candidates tagged propose-only.
- [x] `orchestration.status: done`, `next_phase: done`.
