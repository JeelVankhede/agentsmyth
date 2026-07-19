---
slug: wp-r9b-scaffold-init-resolution
version: 1
artifact: reflect
status: done
created: 2026-07-19
updated: 2026-07-19
manifest_ids: [R1, R2, R3, R4, R5, RI1, RI2]
upstream:
  - workflow/artifacts/briefs/wp-r9b-scaffold-init-resolution-v1.md
  - workflow/artifacts/plans/wp-r9b-scaffold-init-resolution-v1.md
  - workflow/artifacts/tasks/wp-r9b-scaffold-init-resolution-v1.md
  - workflow/artifacts/reviews/wp-r9b-scaffold-init-resolution-v1.md
  - workflow/artifacts/verify/wp-r9b-scaffold-init-resolution-v1.md
  - workflow/artifacts/ship/wp-r9b-scaffold-init-resolution-v1.md
orchestration:
  phase: reflect
  status: done
  next_phase: done
  blockers: []
  user_checkpoint: none
---

# WP-R9b — Scaffold-Only Init + Resolution-Pass Setup - Reflect

## Inputs

- Full chain: brief → plan (5 phases) → task → review → verify → ship, all
  `ready-for-next-phase`/`ship`, 0 open findings at close (2 P2 + 1 P3 found and fixed
  same-cycle at Review).
- Ship: `ship`, nothing committed yet.
- Origin: Notion [WP-R9b](https://app.notion.com/p/3a1972bdebbb8178aed8e5a9539cc0e4), built on
  `feat/wp-r9c-tui-polish` per the user's explicit sequencing, then rebased onto `origin/main`
  once both WP-R9a (#38) and WP-R9c (#39) merged mid-chain.

## Outcome

Shipped locally, not yet committed. All 7 requirements (R1–R5, RI1, RI2) implemented, verified,
and reviewed with 0 open findings, reproduced across 3–5 independent checkpoints each
(Build/Review/Test, plus scratch-repo re-runs). Release/deployment: not applicable.
Source-of-truth: not applicable. Rollback: `git revert`, clean. This chain completes the R9
research spike's original three-way split (R9a shipped, R9c shipped, R9b now shipped) — WP-R10
remains deferred to post-v1 per its own separate page.

## What Worked

- **Resolving Q1 concretely instead of leaving it abstract.** The brief didn't just record the
  user's answer to "how should adapter placement move into the CLI" — it combined that answer
  with R9a's own already-shipped table (naming Cursor/non-macOS-Copilot as the only two
  global-gate-uncovered cases) to derive a specific, testable requirement (R5) before Plan
  started. The user confirmed the reading was correct without needing a correction, validating
  that grounding an ambiguous instruction in already-shipped precedent (rather than asking a
  second open-ended question) was the right call here.
- **Plan-time grounding caught two real gaps before Build started**: `headlessBootstrap()` was
  already structurally shared (no restructuring needed for R1), and no `workflow/learnings/`
  template existed anywhere in `src/assets/` despite the brief's A2 assumption implying one
  did. Both were found by reading actual source/templates at Plan, not assumed from the brief.
- **A real, non-trivial bug was found by testing, not by reading the diff.** The
  `writeDefinitionsRoot()` ordering bug (see Reflect's own Learning Candidates) was invisible
  in a code read of either function individually — only a fresh scratch-repo `init` run
  surfaced that the two config-writing entry points, once actually wired together, silently
  dropped most of `repo-profile.yaml`'s default content.
- **Review found 2 more real, if narrow, gaps by tracing code against edge cases the automated
  suite doesn't exercise** (YAML flow-style arrays; a branch-inference-failure-plus-non-default-
  policy combination) — neither would have been caught by re-running `npm run validate` a
  hundred times, since none of this repo's real config content or test fixtures exercise either
  case. This is the second chain this session (after WP-R9c) where reading a new deterministic
  implementation against genuine edge-case input, not just its default path, caught something
  real.

## What Did Not Work

- No process friction to report this chain — no evidence-citation gaps, no waiver-completeness
  issues, no skipped-check-accounting misses (the pattern that recurred across WP-R9a and
  WP-R9c earlier this session did not repeat here).

## Surprises

The Notion research spike's own §3 "Option A/B/C" framing for adapter-tool selection turned out
to already be *partially* superseded by content later in the same page (§8's R9a fix, §11's
scope split) that the spike's author (this same agent, in an earlier session) had written but
not fully reconciled back into the earlier sections. Re-deriving R5 required reading the whole
spike page fresh rather than trusting its own internal cross-references — captured as a
Learning Candidate below, not just a one-off oddity, since it's a durable pattern risk for any
long-lived research page that keeps accumulating sections.

## Manifest Coverage Retrospective

| Manifest ID | Outcome | Evidence path | Notes |
|---|---|---|---|
| R1 | shipped | `workflow/artifacts/verify/wp-r9b-scaffold-init-resolution-v1.md` Manifest Coverage row R1 | `headlessBootstrap()` confirmed already shared/generic |
| R2 | shipped | `workflow/artifacts/verify/wp-r9b-scaffold-init-resolution-v1.md` Manifest Coverage row R2 | Reproduced 5x across the chain |
| R3 | shipped | `workflow/artifacts/verify/wp-r9b-scaffold-init-resolution-v1.md` Manifest Coverage row R3 | `router.md` parity re-checked 3x |
| R4 | shipped | `workflow/artifacts/verify/wp-r9b-scaffold-init-resolution-v1.md` Manifest Coverage row R4 | 1 P3 finding fixed same-cycle at Review |
| R5 | shipped | `workflow/artifacts/verify/wp-r9b-scaffold-init-resolution-v1.md` Manifest Coverage row R5 | 2 P2 findings fixed same-cycle at Review |
| RI1 | shipped | `workflow/artifacts/verify/wp-r9b-scaffold-init-resolution-v1.md` Manifest Coverage row RI1 | Zero dependency change |
| RI2 | shipped | `workflow/artifacts/verify/wp-r9b-scaffold-init-resolution-v1.md` Manifest Coverage row RI2 | Zero regression at every checkpoint |

## Deferred

none — all 7 active requirements shipped.

## Source-of-Truth Outcome

not applicable.

## Learning Candidates

- **Candidate learning**: sharing one mechanical function between two CLI entry points can
  silently interact with *pre-existing* code at either call site in ways a code read alone
  won't catch — only a fresh, real end-to-end run surfaces it. This chain's own
  `writeDefinitionsRoot()`/`headlessBootstrap()` ordering bug is the concrete example: two
  individually-correct functions produced silently-wrong output once actually wired together.
  Source: this chain's own Build Implementation Log — propose-only.
- **Candidate learning**: verifying a new deterministic reimplementation of previously-
  agent-only prose logic against real edge-case input (not just the shipped default) is now a
  2-for-2 pattern this session for catching real gaps automated suites miss — WP-R9c's
  `@clack/prompts` `initialValue` finding, and this chain's `extractYamlList()` flow-style gap
  plus `BRANCH_POLICY` fallback inconsistency. Worth treating as a standing Review habit for
  any agent-logic-to-code port, not a one-off catch. Source: this chain's and WP-R9c's own
  Review Findings — propose-only.
- **Candidate learning**: a long-lived Notion research spike page that accumulates sections
  over multiple sessions can develop internal inconsistency between its earlier and later
  sections (later findings that supersede earlier framing, without the earlier section being
  edited to match) — re-deriving requirements from the *whole* page fresh, not trusting a
  section's own internal cross-reference, avoided building on a stale premise here. Source:
  this chain's own Think-phase re-grounding of Q1 against the WP-R9 spike's §3 vs. §8/§11 —
  propose-only.

## Follow-Ups

| Action | Owner | Suggested Artifact Or Ticket | Status |
|---|---|---|---|
| Decide whether/when to commit, push, and open a PR for `feat/wp-r9b-scaffold-init-resolution` (target `main` directly — no stacked-branch concern) | user | OI-30 | open |
| Fix the pre-existing stale `commands[0].run` field-name reference in `headlessBootstrap()`'s PS-3 pending-setup item (should be `commands[0].command`) — found during this chain's Plan, out of scope here | user/agent | OI-31 | open |
| Update Notion WP-R9b (and confirm WP-R9a/WP-R9c) page status to Done, and page 06's Triage Summary, once this chain merges | user | OI-32 | open |

## Raw Session Entry

See `workflow/learnings/sessions/2026-07-19-wp-r9b-scaffold-init-resolution.md`.

## Architecture Notes

- role: Project Manager
- decision: Persisted all 3 follow-ups to `workflow/artifacts/open-items.yaml` (OI-30, OI-31,
  OI-32) rather than leaving them only in this artifact's prose, per this repo's own
  `follow-up-owner-assigner` convention.
- decision: No new deferred/waived R/RI entries needed — all 7 active requirements shipped
  clean, so `open-items.yaml`'s new entries are all `source: follow-up`, not `source:
  requirement`.
- downstream: This closes the WP-R9 research spike's original three-way split (R9a, R9b, R9c
  all now shipped). WP-R10 (compiled binary distribution) remains the only open item from that
  spike, already deferred to post-v1 on its own page — no action needed here.

## Exit Gate

- [x] Manifest Coverage Retrospective has one row per active R and RI.
- [x] Every follow-up has a named owner and suggested artifact title.
- [x] Learning candidates tagged propose-only.
- [x] `orchestration.status: done`, `next_phase: done`.
