---
slug: power-skills-wave2
version: 1
artifact: reflect
status: done
created: 2026-07-10T21:00:00Z
updated: 2026-07-10T21:00:00Z
manifest_ids:
  - R1
  - R2
  - R3
  - R4
  - R5
  - R6
  - R7
  - R8
  - RI1
  - RI2
  - RI3
  - RI4
  - RI5
  - RI6
upstream:
  - workflow/artifacts/briefs/power-skills-wave2-v1.md
  - workflow/artifacts/plans/power-skills-wave2-v1.md
  - workflow/artifacts/tasks/power-skills-wave2-v1.md
  - workflow/artifacts/reviews/power-skills-wave2-v1.md
  - workflow/artifacts/verify/power-skills-wave2-v1.md
  - workflow/artifacts/ship/power-skills-wave2-v1.md
orchestration:
  phase: reflect
  status: done
  next_phase: done
  blockers: []
  user_checkpoint: none
---

# Power Skills — Wave 2 (Phase Gates) - Reflect

## Inputs

Full chain: brief → plan → task → review → verify → ship, all for slug `power-skills-wave2`,
version 1. Ship recommendation: `ship` (upgraded from an initial `hold-with-waiver` after the user
rejected the waiver framing and asked for real resolution). 6 commits on
`feat/wp-r4-power-skills-explorers` (off `feat/wp-r4-power-skills-spine`), plus a merge of
`origin/main`, working tree has the chain's own lifecycle artifacts uncommitted (bundled at Ship
per the Wave 1 precedent).

## Outcome

Shipped: 4 new gate-bound power skills (`requirement-phase-mapper` B1, `plan-assumption-verifier`
B2, `verification-matrix-builder` B6, `follow-up-owner-assigner` B9) with 5 backing validators and
5 negative fixtures, plus the corrected `open-items-ledger` (E2) — a real, populated
`workflow/artifacts/open-items.yaml` persisting Wave 1's 5 reflect follow-ups past their original
narrative for the first time. All wired into the relevant lifecycle `SKILL.md` files and into
`npm run validate`'s automated chain.

Release status: not applicable — no package version bump, no deployment, no external publish in
scope. "Shipped" means the branch is complete, verified, and mergeable at the user's discretion.

Source-of-truth status: not applicable per `source-of-truth.yaml` (no provider configured).

Rollback status: not applicable in the traditional sense (nothing deployed) — `git revert` is
sufficient if needed; all changes are additive or narrowly-scoped bug fixes to existing files.

## What Worked

- **Dogfooding against real artifacts continued to be the dominant bug-finding method**, exactly as
  Wave 1's Reflect predicted it should be treated as standing practice, not a one-off. This chain
  alone found 7 real bugs this way (3 in `check-phase-map.mjs`, 1 in `lib.mjs`'s YAML parser, 3 in
  `check-waivers.mjs`) — 0 of the 5 Phase 4 fixtures caught anything the real-artifact dogfooding in
  Phase 3 hadn't already found first.
- Recognizing the retroactive-application tension for `check-assumptions.mjs` (2 pre-existing plans
  lacking the new convention) and resolving it the same way Wave 1 resolved its own precedent
  (`ship/system-level-install-v1.md` coverage-table fix) — reformat real, already-written text, never
  fabricate — gave a clean, repeatable pattern that also applied cleanly a 3rd time when the
  `origin/main` merge brought in a 3rd affected plan.
- The Ship checkpoint doing its actual job: presenting a real decision to the user rather than
  self-resolving it, and the user's answer ("resolve them instead of silently passing or skipping")
  materially changed the outcome for the better — R8 went from a permanent-feeling waiver to a fully
  resolved requirement, and the underlying stale-`main` root cause (which would have recurred on
  every future chain branched the same way) got fixed instead of just documented around.

## What Did Not Work

- **Ship initially proposed waiving R8 without first investigating whether it was actually
  resolvable.** The "cross-branch dependency, PR #27 not yet merged" framing was factually accurate
  about *this branch's* state but never checked whether `origin/main` itself had moved — it had, by
  two full merges. This is the same class of error the P2 sign-off gap was in Wave 1's Reflect: an
  agent-authored framing was treated as settled fact and presented to the user for rubber-stamping
  rather than being questioned first. The user caught it, again.
- The recurring range-shorthand habit surfaced a *third* time in this chain (after Wave 1's instance
  and this chain's own Phase 1 instance) — 2 more occurrences in the Plan's Phase 2 heading and
  Dependency Order diagram, found and fixed during Review. Three occurrences across two chains
  confirms Wave 1's Reflect's own prediction that this is "a genuine habit gap, not a one-off," but
  the habit has not actually stopped recurring despite being named twice already.
- `check-waivers.mjs`'s prose-scan heuristic — strengthened once already in Wave 1 with an accepted
  residual false-positive risk — hit that exact predicted risk three times more this chain (Skipped
  Checks recognition, Risk And Rollback recognition, and Reflect-artifact exclusion), all on this
  chain's own new, real artifacts. The heuristic is now on its fourth iteration; each iteration has
  been triggered by writing genuinely new
  artifact content the calibration corpus hadn't seen, not by a design flaw in the fix itself.

## Surprises

- Local `main` had drifted 6 commits behind `origin/main` mid-session, without any explicit fetch
  ever happening — both PR #26 (this repo's own Wave 1 spine chain) and PR #27 (the audit chain) had
  already been merged remotely. Nothing in this session's workflow surfaces branch staleness
  proactively; it was found only because the user pushed back on a waiver that turned out to be an
  artifact of that staleness, not a real constraint.
- The `check-waivers.mjs` heuristic's blast radius turned out to be broader than Wave 1's Review
  anticipated — not just "prose not seen during calibration" in the abstract, but specifically *this
  chain's own new structural conventions* (`## Skipped Checks`'s `waiver-required` value, `## Risk
  And Rollback`'s designated waiver-policy role) that didn't exist as recognized patterns when the
  heuristic was first calibrated. A heuristic calibrated against a fixed corpus at one point in time
  will keep drifting out of sync as the artifact vocabulary it's scanning keeps evolving.

## Manifest Coverage Retrospective

| Manifest ID | Shipped As Scoped | Verified | Ship Status | Notes |
|---|---|---|---|---|
| R1 | yes | yes | shipped | `requirement-phase-mapper`, commit `d95d805` |
| R2 | yes | yes | shipped | `plan-assumption-verifier`, commit `d95d805` |
| R3 | yes | yes | shipped | `verification-matrix-builder`, commit `d95d805` |
| R4 | yes | yes | shipped | `follow-up-owner-assigner`, commit `d95d805` |
| R5 | yes, plus a real starter ledger beyond the Plan's literal scope | yes | shipped | schema commit `86401e3`; real `open-items.yaml` added Phase 3, out-of-plan-scope per Waivers |
| R6 | yes, after 7 real bug fixes across 4 commits | yes | shipped | validators `2a59f72`; `check-waivers.mjs` fixes `02be701` (Test), `1b1a982` (Ship, post-merge), `fe24345` (Reflect) |
| R7 | yes | yes | shipped | 5 fixtures, commit `acab7b3`; 19/19 violations detected |
| R8 | yes, resolved not waived | yes | shipped | initially blocked on `setup-checks:test`; root-caused to stale local `main`, resolved by merging `origin/main` (`1b1a982`); 4/4 commands pass |
| RI1 | yes | yes | shipped | no runtime dependency added |
| RI2 | yes | yes | shipped | all 4 skills have non-empty references/ |
| RI3 | yes | yes | shipped | bundle + schema sync confirmed |
| RI4 | yes | yes | shipped | zero adapter file changes |
| RI5 | yes | yes | shipped | correct branch/slug throughout |
| RI6 | yes | yes | shipped | `open-items.schema.yaml` structurally comparable to `pending-setup.schema.yaml` |

## Deferred

Wave 3 (C1-C3 explorers, D1-D7 domain experts, E1 verification-parallelizer) and Wave 4 (B4,
remaining playbooks) — explicitly out of scope for this chain per the already-approved 3-sub-chain
split, tracked as separate future briefs. See Follow-Ups and `open-items.yaml` (OI-1).

## Source-of-Truth Outcome

not applicable — no provider configured (`source-of-truth.yaml` `mode: optional`, `providers: []`).

## Learning Candidates

- **Candidate learning**: Before presenting a gap as unresolvable and asking the user to waive it,
  check whether the stated blocker is actually still true — specifically, whether local branch refs
  are stale relative to their remotes. Source: this chain's R8, where a 2-command investigation
  (`git log origin/main`) found the "cross-branch dependency" was already resolved upstream.
  — propose-only.
- **Candidate learning**: A heuristic-based validator (not a full parser) should be expected to need
  a new exemption roughly every time the artifact vocabulary it scans gains a new structural
  convention, or is pointed at a new artifact *type* it wasn't originally scoped for — this happened
  three times in one chain for `check-waivers.mjs` alone (Skipped Checks, Risk And Rollback, and
  excluding Reflect artifacts entirely). Treat this as an ongoing maintenance cost of heuristic
  checks, not a one-time calibration event. Source: `check-waivers.mjs`'s 4 total false-positive
  fixes across Wave 1 + Wave 2. — propose-only.
- **Candidate validator**: The recurring range-shorthand mistake (3 occurrences: Wave 1's
  `Changed Files`, this chain's own `Requirement Coverage` table, and 2 more in a Plan's heading/
  diagram) keeps recurring despite being named twice in Reflect already. A cheap, generic grep-based
  check for en-dash/hyphen-joined `R`/`RI` ID pairs anywhere in an artifact (not scoped to specific
  tables) might catch it structurally instead of relying on it being noticed by chance during Review.
  Source: Wave 1 Reflect's own identical learning candidate, still unaddressed. — propose-only.
- **Candidate learning**: Fresh dogfooding of a new validator against real, complex artifacts
  continues to outperform purpose-built fixtures for finding real bugs — 6 real bugs this chain via
  dogfooding, 0 via the fixtures written for the same 5 validators. This is now confirmed across two
  consecutive chains (3 defects in Wave 1, 6 in Wave 2) and should be treated as a settled practice,
  not re-justified each time. Source: this chain's own Command Results table. — propose-only.

## Follow-Ups

| Action | Owner | Suggested Artifact Or Ticket | Status |
|---|---|---|---|
| Design + implement Wave 3 (C1-C3 explorers, D1-D7 domain experts, E1) | user (to schedule) | new brief, e.g. `workflow/artifacts/briefs/power-skills-domain-experts-v1.md` | open |
| Design + implement Wave 4 (B4, remaining playbooks) | user (to schedule) | new brief | open |
| Decide whether/when to open a PR for this Wave 2 chain (target `feat/wp-r4-power-skills-spine` or `main`, re-check staleness at that time per this chain's own R8 lesson) | user | GitHub PR | open |
| Investigate the recurring range-shorthand habit with a structural check (learning candidate above), rather than relying on Review noticing it a 4th time | user/agent | new validator or grep-based `npm run validate` addition | open |
| Consider whether this per-work-package branching workflow needs a standing "fetch + check origin/main before Ship" step, given R8's root cause | user | process decision, no artifact yet | open |

## Raw Session Entry

See `workflow/learnings/sessions/2026-07-10-power-skills-wave2.md`.

## Architecture Notes

- role: Project Manager
- decision: This reflection covers only Wave 2 (B1, B2, B6, B9, E2) — Waves 3-4 remain distinct
  future chains, not phases of this one.
- constraint: No release, deployment, or source-of-truth action was in scope, so most traditional
  Ship/Reflect release-outcome fields are legitimately "not applicable" rather than gaps.
- downstream: `open-items.yaml` must be updated with this chain's own Follow-Ups (OI-6 onward),
  applying `follow-up-owner-assigner` for the second real time — done as part of this Reflect, not
  deferred (see the ledger diff alongside this artifact).

## Exit Gate

- [x] Manifest Coverage Retrospective has one row per active R and RI.
- [x] Every follow-up has a named owner and suggested artifact title.
- [x] Learning candidates tagged `propose-only`.
- [x] `orchestration.status`: `done`, `next_phase`: `done`.
