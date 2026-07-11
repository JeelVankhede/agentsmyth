---
slug: power-skills-domain-experts
version: 1
artifact: reflect
status: done
created: 2026-07-11T16:00:00Z
updated: 2026-07-11T16:00:00Z
manifest_ids:
  - R1
  - R2
  - R3
  - R4
  - R5
  - R6
  - R7
  - R8
  - R9
  - RI1
  - RI2
  - RI3
  - RI4
  - RI5
  - RI6
upstream:
  - workflow/artifacts/briefs/power-skills-domain-experts-v1.md
  - workflow/artifacts/plans/power-skills-domain-experts-v1.md
  - workflow/artifacts/tasks/power-skills-domain-experts-v1.md
  - workflow/artifacts/reviews/power-skills-domain-experts-v1.md
  - workflow/artifacts/verify/power-skills-domain-experts-v1.md
  - workflow/artifacts/ship/power-skills-domain-experts-v1.md
orchestration:
  phase: reflect
  status: done
  next_phase: done
  blockers: []
  user_checkpoint: none
---

# Power Skills — Wave 3 (Explorers + Domain Experts) - Reflect

## Inputs

Full chain: brief → plan → build (6 phases) → review → test → ship, all for slug
`power-skills-domain-experts`, version 1. Ship recommendation: `ship`, user-confirmed ("Proceed",
2026-07-11) after a status question and a fresh regression at the Ship checkpoint. 5 commits on
`feat/wp-r4-power-skills-domain-experts` (off `origin/main`), working tree has this chain's own
lifecycle artifacts uncommitted (bundled at Ship per the established precedent).

## Outcome

Shipped: 3 Think-phase explorers (C1 `repo-alignment-scan`, C2 `architecture-decision-advisor`, C3
`constraint-conflict-scan`), 7 domain-expert skills (D1-D7) with 39 substantive knowledge-route
files, `check-constraint-conflicts.mjs` (the one new validator this wave needed), E1
(`verification-parallelizer`, documented as a `dispatch-subagents` profile), and 10 new
`skill_scoring.triggers` entries. All wired into the correct lifecycle phase files per each
skill's spec card.

Release status: not applicable — no package version bump, no deployment, no external publish in
scope. "Shipped" means the branch is complete, verified, and mergeable at the user's discretion.

Source-of-truth status: not applicable per `source-of-truth.yaml` (no provider configured).

Rollback status: not applicable in the traditional sense (nothing deployed) — `git revert` is
sufficient if needed; all changes are additive or narrowly-scoped edits to existing phase files.

## What Worked

- **Verifying real assumptions before writing the brief paid off directly.** Confirming
  `check-skill-triggers.mjs` audits generically (no hardcoded skill list) before finalizing the
  brief meant R7's trigger-map fill-in needed zero validator code changes — exactly as predicted,
  not just hoped.
- **The constraint-ID convention was redesigned mid-Build for the better, and disclosed as
  such.** The Plan's tentative design (an optional schema `id` field) would have required a
  `domain.schema.yaml` structural change; Build found a simpler, fully backward-compatible
  alternative (bracket-prefix IDs inside existing plain strings) and used it — recorded explicitly
  as an implementation-detail refinement, not silently substituted.
- **`grep -l` verification against each skill's own spec card caught a real gap before Ship, not
  after.** D3 was correctly wired into 2 of its 3 declared phases; the systematic per-skill
  re-verification (not just "did the phase pass its own gate") caught the third.
- **The user's Ship-checkpoint pushback ("don't force waiver on obvious fixes") was acted on
  immediately and concretely** — not just apologized for. A fresh, independent regression was run
  specifically to answer the status question directly, and both items were correctly reclassified
  from waivers to resolved scope notes before re-presenting the checkpoint.

## What Did Not Work

- **Ship again framed 2 fully-resolved Build discoveries as waivers requiring risk-acceptance,
  the identical mistake from Wave 2's R8.** This is now a second occurrence, not a one-off — Ship's
  default behavior should be to ask "is this genuinely open risk, or a completed fix that happens
  to be out-of-declared-scope" *before* presenting anything to the user as pending sign-off, not
  wait for the user to correct it a second time.
- **The Plan's own Repo Impact Map missed a wiring target (D3 → Think) that its own upstream spec
  card named explicitly.** This is a real process gap: nothing cross-checked the Plan's declared
  Touches against each skill's spec card's own phase list before Plan was finalized — the gap was
  only caught mechanically, during Build's own later verification step, not during Plan review itself.
- **Route-file substance was reviewed by sampling (3 of 10 skills, 21 of 39 files), not
  exhaustively.** A reasonable tradeoff given the scale, but it means roughly 46% of the new content
  received no direct human-or-agent read before shipping — acceptable given the structural
  no-stub-files confirmation covered all 39, but worth naming as a real, accepted gap.

## Surprises

- `origin/main` advanced past this branch's intended base mid-session (PR #28, Wave 2, merged)
  without any explicit action on this chain's part — the branch this chain was created from
  happened to already be at, or very near, that new tip, so no rebase was needed. Purely fortunate
  timing, not a designed safeguard; a slightly different branch creation moment could have produced
  a real merge conflict requiring the same resolution Wave 2 needed for its own R8.
- The E1/Test-dispatch contradiction (a blanket "never" rule stated in 3 separate files, directly
  conflicting with E1's own spec) had apparently existed since Wave 1 shipped the dispatch-subagents
  skill, undetected until this chain actually tried to implement the one capability the contradiction
  blocked. A latent inconsistency between two unrelated pieces of shipped documentation, invisible
  until something depended on both being simultaneously true.

## Manifest Coverage Retrospective

| Manifest ID | Shipped As Scoped | Verified | Ship Status | Notes |
|---|---|---|---|---|
| R1 | yes | yes | shipped | `repo-alignment-scan`, commit `bd5f139` |
| R2 | yes | yes | shipped | `architecture-decision-advisor`, commit `bd5f139` |
| R3 | yes | yes | shipped | `constraint-conflict-scan`, commit `bd5f139` |
| R4 | yes | yes | shipped | `check-constraint-conflicts.mjs` + fixture `o1`, commit `bd5f139` |
| R5 | yes | yes | shipped | 7 D-skills, 39 route files, commits `d488cc2`/`ca9f06b`/`9d4f69c` |
| R6 | yes, after 1 real gap found and fixed | yes | shipped | wiring, commit `d369c3e`; D3/Think gap found during this same phase, fixed in the same commit |
| R7 | yes | yes | shipped | `skill_scoring.triggers`, commit `bd5f139` |
| R8 | yes, after resolving a real pre-existing contradiction | yes | shipped | E1 profile, commit `bd5f139`; 3-file Test-dispatch "never" rule narrowed consistently |
| R9 | yes | yes | shipped | full suite green, reproduced 5× across Build/Review/Test/Ship |
| RI1 | yes | yes | shipped | no runtime dependency added |
| RI2 | yes | yes | shipped | all 10 skills have substantive, non-stub `references/` |
| RI3 | yes | yes | shipped | bundle FILE-markers confirmed for all 10 skills |
| RI4 | yes | yes | shipped | zero adapter file changes |
| RI5 | yes | yes | shipped | correct branch/slug throughout |
| RI6 | yes | yes | shipped | `check-skill-triggers.mjs` confirmed generic by inspection, no code change needed |

## Deferred

Wave 4 (`conditional-preservation-check`/B4, plus non-validator playbook write-ups for
B4/C1/C2/D3/D4/D7 per the spec's own framing) — explicitly out of scope for this chain, tracked in
`open-items.yaml` (OI-6, previously scoped for Wave 4). This closes out all of Waves 0-3;
Wave 4 is the final remaining tracked piece of the resolved WP-R4 spec.

## Source-of-Truth Outcome

not applicable — no provider configured (`source-of-truth.yaml` `mode: optional`, `providers: []`).

## Learning Candidates

- **Candidate learning**: Ship should default to asking "is this genuinely open risk, or a
  completed, independently-verified fix that happens to be out-of-declared-Plan-scope" before
  presenting anything to the user as a pending waiver — this is now confirmed as a repeating
  pattern (Wave 2's R8, this chain's E1/D3 items), not a one-off miscalibration. Source: 2
  consecutive chains, same user correction both times. — propose-only.
- **Candidate learning**: A Plan's Repo Impact Map can omit a wiring target even when the
  requirement's own upstream source (a spec card, in this case) names it explicitly — a lightweight
  cross-check (every phase named in a skill's spec card appears in the Plan's declared Touches for
  the wiring phase) before Plan is finalized could catch this class of gap earlier than Build's own
  `grep -l` verification. Source: D3's missing `lifecycle-think` wiring, found during Build not Plan
  review. — propose-only.
- **Candidate learning**: When a new capability's spec (E1) requires a change to existing shared
  documentation that other, unrelated skills also depend on (the dispatch-subagents Test-phase
  rule), check all locations stating the rule being changed, not just the one location the Plan
  happened to declare — a rule restated in multiple files can drift out of sync with a single-file
  fix. Source: the 3-file E1/Test-dispatch contradiction. — propose-only.
- **Candidate learning**: For content-heavy, mostly-non-validator-checkable work (Category D domain
  experts), a structural no-stub-file check plus a deliberately diverse sample read (not
  exhaustive) is a reasonable, disclosed tradeoff — but should be named explicitly as a residual
  risk in Review/Verify, not silently treated as equivalent to full coverage. Source: this chain's
  own 3-of-10 route-file spot-check. — propose-only.

## Follow-Ups

| Action | Owner | Suggested Artifact Or Ticket | Status |
|---|---|---|---|
| Design + implement Wave 4 (B4 `conditional-preservation-check` + non-validator playbook write-ups for B4/C1/C2/D3/D4/D7) | user (to schedule) | new brief, e.g. `workflow/artifacts/briefs/power-skills-wave4-v1.md` | open |
| Decide whether/when to open a PR for this Wave 3 chain (target `main`, re-check `origin/main` staleness at that time per Wave 2's R8 lesson) | user | GitHub PR | open |
| Add a Plan-phase cross-check (spec card phase list vs. declared Touches) to catch the D3-class gap earlier than Build's own verification | user/agent | validator or Plan-phase checklist addition | open |
| Update Ship's own default behavior to ask "resolved fix vs. genuine waiver" before presenting a checkpoint, given this is now a confirmed repeating pattern | user/agent | `lifecycle-ship/SKILL.md` update | open |
| Consider a periodic (not per-chain) manual quality pass across all 39 D1-D7 route files, since only 21 were directly spot-read this chain | user | informal review session | open |

## Raw Session Entry

See `workflow/learnings/sessions/2026-07-11-power-skills-domain-experts.md`.

## Architecture Notes

- role: Project Manager
- decision: This reflection covers only Wave 3 (C1-C3, D1-D7, E1) — Wave 4 remains a distinct
  future chain, not a phase of this one.
- constraint: No release, deployment, or source-of-truth action was in scope, so most traditional
  Ship/Reflect release-outcome fields are legitimately "not applicable" rather than gaps.
- downstream: `open-items.yaml` must be updated with this chain's own Follow-Ups (OI-10 onward),
  applying `follow-up-owner-assigner` for the third real time — done as part of this Reflect.

## Exit Gate

- [x] Manifest Coverage Retrospective has one row per active R and RI.
- [x] Every follow-up has a named owner and suggested artifact title.
- [x] Learning candidates tagged `propose-only`.
- [x] `orchestration.status`: `done`, `next_phase`: `done`.
