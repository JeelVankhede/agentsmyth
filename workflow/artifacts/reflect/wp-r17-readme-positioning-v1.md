---
slug: wp-r17-readme-positioning
version: 1
artifact: reflect
status: done
created: 2026-08-08
updated: 2026-08-08
manifest_ids: [R1, R2, R3, RI1, RI2, RI3]
upstream:
  - workflow/artifacts/briefs/wp-r17-readme-positioning-v1.md
  - workflow/artifacts/plans/wp-r17-readme-positioning-v1.md
  - workflow/artifacts/tasks/wp-r17-readme-positioning-v1.md
  - workflow/artifacts/reviews/wp-r17-readme-positioning-v1.md
  - workflow/artifacts/verify/wp-r17-readme-positioning-v1.md
  - workflow/artifacts/ship/wp-r17-readme-positioning-v1.md
orchestration:
  phase: reflect
  status: done
  next_phase: done
  blockers: []
  user_checkpoint: none
---

# WP-R17 — README & Docs Positioning Rewrite - Reflect

## Inputs

Full lifecycle chain for `wp-r17-readme-positioning` (brief → plan → task → review → verify → ship, all `ready-for-next-phase`/approved). Ship recommendation `ship`, ship-review approved ("Ship is approved"). Work: README `## Where it fits` section (R1/R3) + Notion page 01 one-bullet edit (R2), on branch `feat/wp-r17-readme-positioning`, uncommitted.

## Outcome

- **Shipped (pending commit/merge):** all six R/RI implemented and verified. `README.md` edit is local + uncommitted; the Notion page 01 edit is live.
- **Release status:** no release in this WP. The `1.0.1` npm publish is WP-R15 (gated on user's npm Trusted Publisher registration). Per the parent "1.0.1 — Patch Release Work Plan", this branch must merge to `main` before the WP-R15 dispatch fires.
- **Source-of-truth status:** R2 external write to Notion page 01 completed and evidenced (live re-fetch). Not a formally-required gate (`source-of-truth.yaml` `mode: optional`, `providers: []`).
- **Rollback status:** defined in Ship (revert README merge / delete section; reverse the one-bullet Notion edit). Not triggered.

## What Worked

- **Drafting R2's exact replacement text in Plan, not Build.** The plan pre-wrote the before/after bullet, so the Notion edit was a mechanical `update_content` search-and-replace against a shared external doc rather than live-drafting — kept RI3 (one-bullet-only) trivially verifiable via re-fetch.
- **Splitting Build by surface/tool (README vs. Notion).** Each phase got a binary, independently-checkable exit gate (`grep`/`git diff` for README; re-fetch diff for Notion). No cross-contamination.
- **Scoping R1 to README only, deferring site/introduction.md.** The repo-alignment-scan catch (site duplicates the README list) was recorded as an accepted, deferred inconsistency (brief A2) instead of silent scope creep — kept the diff to one file.
- **Not fabricating URLs.** Competitor names shipped unlinked first (honest), then linked only after web-search verification when the user asked to "fix all" — the one URL that couldn't map to a canonical GitHub repo (agentpreflight) was flagged as a personal-domain homepage rather than guessed.

## What Did Not Work

- **Two validator-format defects slipped to `npm run validate` instead of being caught at write time.** (1) The plan lacked the `## Assumptions Verified` section `check-assumptions` requires whenever the brief declares A IDs; (2) the verify artifact's Skipped Checks table had 5 columns but `check-skipped-accounting` requires 6 (`manifest_ids`). Both cost a validate/fix cycle — and both trace to the shipped skill **starter blocks not matching their own validators** (the Plan starter block omits `## Assumptions Verified`; the Test starter block shows a 5-column Skipped Checks table). This is a recurrence of the pattern already logged as [[OI-56]] (run validate right after each artifact write).
- **Build-handoff wording broke scope-fence.** Marking "## Active Phase" as "Both phases complete" stripped the phase number `check-scope-fence` parses. Minor, but a second instance of artifact-prose tripping a validator in the same session.

## Surprises

- The Notion note claiming the first release must "hand-set 1.0.1 and skip auto-bump" turned out to be a misread of `release.yml` (it increments `package.json` mechanically, so `bump: patch` off `1.0.0` correctly yields `1.0.1`) — surfaced earlier this session, not in this WP's own phases, but it reshaped how WP-R15 will actually run.

## Manifest Coverage Retrospective

| Manifest ID | Outcome | Evidence path | Notes |
|---|---|---|---|
| R1 | shipped | `README.md:32-34`; verify artifact Automated Checks | 4 competitors named + linked; differentiator before `## Setup` |
| R2 | shipped | Notion page 01 (re-fetch 2026-08-08T11:57Z); ship Source-of-Truth Status | "scaffold" removed |
| R3 | shipped | `README.md:36-38` | No-paid-tier paragraph with reasoning |
| RI1 | shipped | `README.md:28` vs `:38` | Bullet/paragraph consistent |
| RI2 | shipped | `git diff --stat` (README-only) | Zero `site/` changes |
| RI3 | shipped | Notion re-fetch | Exactly one bullet changed |

## Deferred

- README-vs-`site/introduction.md` positioning reconciliation (the duplicated "What it refuses to be" list, incl. the "Not a scaffolder" bullet) — deferred by brief A2, tied to WP-R6 shipping + the existing WP-R11/site reconciliation follow-up. Persisted as OI-60.

## Source-of-Truth Outcome

Updated. Notion page 01 "What agentsmyth Is Not" — one bullet rewritten to drop the stale scaffolder-exclusion (OQ-R6.1 direction). Evidence: live re-fetch, before/after captured in Ship. No configured SoT provider, so no formal handoff was required.

## Learning Candidates

- **Candidate learning**: The shipped Plan and Test skill starter blocks are out of sync with their own validators — the Plan `references/output-schema.md` starter block omits the `## Assumptions Verified` section `check-assumptions` requires whenever the brief has A IDs, and the Test starter block's Skipped Checks table shows 5 columns while `check-skipped-accounting` requires 6 (`manifest_ids`). An agent copying the starter block verbatim will fail `validate` every time. Fix at source: `src/workflow/skills/lifecycle-plan/references/output-schema.md` and `src/workflow/skills/lifecycle-test/references/output-schema.md` (then rebuild). — source: `workflow/artifacts/reviews/wp-r17-readme-positioning-v1.md`, `workflow/artifacts/verify/wp-r17-readme-positioning-v1.md` — propose-only.
- **Candidate learning**: For external-doc edits (e.g. Notion) under a lifecycle with no configured source-of-truth provider, pre-drafting the exact before/after string in Plan and applying it as a targeted single-string `update_content` (never a whole-page replace), then re-fetching to diff, makes a "touch exactly one thing" requirement (RI3-style) mechanically verifiable. Reusable pattern for external-write requirements. — source: `workflow/artifacts/plans/wp-r17-readme-positioning-v1.md` — propose-only.
- **Candidate learning**: Recurrence of [[OI-56]] — running `npm run validate` immediately after each artifact is written (not once at phase end) would have caught both format defects this session at zero extra cost. Two sessions now show the same pattern; worth promoting from "if it recurs" to a standing Build/Review step. — source: `workflow/artifacts/open-items.yaml` (OI-56) — propose-only.

## Follow-Ups

| Action | Owner | Suggested Artifact Or Ticket | Status |
|---|---|---|---|
| Reconcile README vs `site/introduction.md` "scaffolder" positioning once WP-R6 ships | user | OI-60 / tie to WP-R6 + WP-R11 site follow-up | open |
| Commit `feat/wp-r17-readme-positioning` and merge to `main` before the WP-R15 release dispatch | user | OI-61 / 1.0.1 patch-release sequencing | open |
| Release-level: add `CHANGELOG.md` 1.0.1 entry (R15/R16/R17); mark WP-R16 & WP-R17 Done in Notion Work Packages; update Release Log + page 05 after dispatch | user | OI-62 / 1.0.1 release plan acceptance | open |
| Fix Plan/Test starter-block ↔ validator mismatch (Assumptions Verified section; Skipped Checks 6th column) at `src/` and rebuild | workflow owner | OI-63 / skill-reference correctness | open |
| Monitor `agent-preflight.szybnev.cc` link durability; replace with a more canonical URL if it rots | user | OI-64 / low-priority link hygiene | open |

## Raw Session Entry

See `workflow/learnings/sessions/2026-08-08-wp-r17-readme-positioning.md`.

## Architecture Notes

- role: Project Manager
- decision: Kept CHANGELOG and Notion status-marking as release-level follow-ups (OI-62), not WP-R17 work — honoring brief A3's scope call rather than absorbing release bookkeeping into this WP.
- constraint: No external release/PR outcome claimed — the WP's only external write (Notion R2) is done and evidenced; everything else (commit, merge, npm publish) is explicitly pending and owned downstream.
- downstream: The Plan/Test starter-block fix (OI-63) is the highest-leverage durable improvement — it will silently save a validate/fix cycle on every future Standard/Complex task that has assumptions or skipped checks. Recommend a curation pass promote learning candidate #1 if a maintainer agrees.

## Exit Gate

- [x] Manifest Coverage Retrospective has one row per active R and RI.
- [x] Every follow-up has a named owner and suggested artifact title.
- [x] Learning candidates tagged propose-only.
- [x] orchestration.status: done, next_phase: done.
