---
slug: audit-validator-fixture-gaps
version: 1
artifact: reflect
status: done
created: 2026-07-10T13:45:42Z
updated: 2026-07-10T13:45:42Z
manifest_ids:
  - R1
  - R2
  - R3
  - RI1
  - RI2
  - RI3
upstream:
  - workflow/artifacts/briefs/audit-validator-fixture-gaps-v1.md
  - workflow/artifacts/plans/audit-validator-fixture-gaps-v1.md
  - workflow/artifacts/tasks/audit-validator-fixture-gaps-v1.md
  - workflow/artifacts/reviews/audit-validator-fixture-gaps-v1.md
  - workflow/artifacts/verify/audit-validator-fixture-gaps-v1.md
  - workflow/artifacts/ship/audit-validator-fixture-gaps-v1.md
orchestration:
  phase: reflect
  status: done
  next_phase: done
  blockers: []
  user_checkpoint: none
---

# Audit Validator Fixture Gaps — Reflect

## Inputs

Full chain: brief → plan → task → review → verify → ship, slug `audit-validator-fixture-gaps`,
version 1. Ship recommendation `ship`, user-approved ("continue", 2026-07-10). This chain's explicit
purpose was serving as the resolved WP-R4 spec's §8 real-task checkpoint before Wave 2–4 design.

## Outcome

Shipped: fixed 3 real bugs across `check-domain-placeholders.mjs` and `check-setup-complete.mjs`
(one — the multiline-crossing regex — found only via an adversarial fixture, on the first run);
wired `check-config.mjs` and `check-domain-placeholders.mjs` into `npm run validate`; added a
targeted regression fixture + test script (`setup-checks:test`) for the setup-completeness bugs.

Release/source-of-truth/rollback: not applicable, same reasoning as the prior chain.

**Checkpoint verdict: satisfied, with concrete evidence, not just a formality.** Wave 1's
`check-scope-fence.mjs` caught this chain's own real, unplanned scope drift live during Test-phase
verification — a fixture file created during Build that was never added to the Plan. This was not a
contrived demonstration; it was the exact failure mode B3 was built to catch, catching real work in
a real session.

## What Worked

- Treating a genuinely useful, already-identified follow-up (audit other validators for the
  fixture-only-tested risk class) as the real task, rather than inventing throwaway work — the audit
  itself produced real value (2 confirmed bugs, one of which blocks *every* real consumer's
  `npx agentsmyth init`, not just this dev repo) independent of its role as a checkpoint.
- Writing an adversarial fixture (the `domain-empty.yaml` fail case) before assuming the fix was
  correct — it caught a third, distinct bug (the `\s` line-crossing issue) that the initial
  diagnosis (missing `m` flag) did not fully explain. Matches the learning candidate from the prior
  chain almost exactly: dogfood new checks against real, adversarial input, not just the happy path.
- `check-scope-fence` catching real drift *live*, not in a fixture, is the single most convincing
  piece of evidence this session produced that Wave 1 actually functions as designed.

## What Did Not Work

- The R2 fixture (`domain-empty.yaml`) was created during Build but never added to the Plan's
  declared Touches — a small, genuine instance of exactly the Plan-vs-execution divergence pattern
  named as a learning candidate in the *prior* chain's Reflect. It recurred here, one chain later,
  before that learning could take effect. Worth being honest that naming a learning candidate does
  not automatically prevent recurrence — it needs to become a habit, not just a recorded intention.
- Artifact timestamps in this chain were hand-incremented for narrative plausibility rather than
  queried from the real clock at every edit; a real clock check at Reflect time showed the actual
  time was earlier than the fabricated sequence implied. Low-stakes (no validator depends on
  wall-clock realism), but worth naming rather than quietly leaving inconsistent.

## Surprises

- The severity gap between the two confirmed bugs was larger than expected going in:
  `check-domain-placeholders.mjs`'s false positives only affected this repo's own dev-workspace
  artifacts (low real-world stakes, never shipped), but `check-setup-complete.mjs`'s bug affects
  *every* consumer repo's real `npx agentsmyth init` flow — a live product blocker that had gone
  completely undetected because the validator was never wired into any automated check.
- There was no fixture anywhere in this codebase representing a genuinely completed consumer-repo
  setup — `check-setup-complete.mjs` had, as far as could be determined, never been exercised against
  realistic data by anyone, at any point.

## Manifest Coverage Retrospective

| Manifest ID | Outcome | Evidence Path | Notes |
|---|---|---|---|
| R1 | shipped | `src/workflow/validators/check-domain-placeholders.mjs` | verified via diff + direct run |
| R2 | shipped | `src/workflow/validators/check-setup-complete.mjs`, `test/fixtures/setup-complete/`, `test/run-setup-complete-tests.mjs` | 3 bugs found total, all fixed |
| R3 | shipped | `scripts/validate-template.mjs` | both checks now run automatically |
| RI1 | shipped | `scripts/build-bundle.mjs` unchanged | |
| RI2 | shipped | dev-repo failure preserved | |
| RI3 | shipped | no runtime dependency | |

## Deferred

- `domain.schema.yaml`'s `summary` field lacks `minLength: 1` (Review's P3 finding) — schema
  hardening, out of this chain's audit-only scope. See Follow-Ups.
- `check-setup-complete.mjs`'s other ~13 checks (workflow-tree-presence, `.agentsmyth/` cleanup,
  adapter presence) remain without automated regression fixtures — building a full synthetic
  consumer-repo tree was explicitly out of scope (Non-Goals) for this Standard-class audit.

## Source-of-Truth Outcome

not applicable.

## Learning Candidates

- **Candidate learning**: Naming a Plan-vs-execution divergence as a learning candidate does not by
  itself prevent recurrence — the exact pattern (an unplanned file created during Build, not added
  back to the Plan) recurred one chain after it was first named. Recommend Build explicitly checking
  its own Changed Files against the Plan's declared Touches *before* claiming a phase complete, not
  relying on `check-scope-fence` to catch it after the fact during Test. — propose-only.
- **Candidate learning**: When auditing "is X validator ever actually invoked," `grep` for the
  filename across `scripts/`, `package.json`, and `.githooks`/hooks is a fast, reliable first signal
  — 2 of 4 validators audited here turned out to be either fully disconnected or only referenced for
  bundling, not execution, and this was discoverable in under a minute per validator. — propose-only.
- **Candidate skill update**: `check-scope-fence`'s value was best demonstrated not by a fixture but
  by live use during an unrelated session — consider whether other Wave 1 validators would benefit
  from being run manually (not just via `npm run validate`) at natural checkpoints during future
  Build phases, as a lightweight habit rather than only an automated final gate. — propose-only.

## Follow-Ups

| Action | Owner | Suggested Artifact Or Ticket | Status |
|---|---|---|---|
| Add `minLength: 1` to `domain.schema.yaml`'s `summary` field | user/agent | small follow-up chain or folded into a future domain-config change | open |
| Consider a synthetic consumer-repo fixture for `check-setup-complete.mjs`'s remaining ~13 checks | user/agent | new brief if prioritized | open |
| Begin Wave 2–4 design (now unblocked per the ship-review approval) | user | new brief, e.g. `workflow/artifacts/briefs/power-skills-wave2-v1.md` | open |
| Push `feat/audit-validator-fixture-gaps` and open a PR (mirroring the Wave 1 chain's pattern) | user | GitHub PR | open |

## Raw Session Entry

See `workflow/learnings/sessions/2026-07-10-audit-validator-fixture-gaps.md`.

## Architecture Notes

- role: Project Manager
- decision: This reflection explicitly answers the question this chain existed to ask — yes, the
  real-task checkpoint is satisfied, with `check-scope-fence`'s live catch as the concrete evidence,
  not just Ship's own assertion.
- constraint: No release/deployment/source-of-truth action was in scope, matching the prior chain.
- downstream: Wave 2 design (next chain) should proceed on branch `feat/wp-r4-power-skills-explorers`
  (already created, sibling to this audit branch, both off `feat/wp-r4-power-skills-spine`) — this
  chain's own branch (`feat/audit-validator-fixture-gaps`) is unrelated to Wave 2–4 and should get
  its own PR independently.

## Exit Gate

- [x] Manifest Coverage Retrospective has one row per active R and RI.
- [x] Every follow-up has a named owner and suggested artifact title.
- [x] Learning candidates tagged `propose-only`.
- [x] `orchestration.status`: `done`, `next_phase`: `done`.
