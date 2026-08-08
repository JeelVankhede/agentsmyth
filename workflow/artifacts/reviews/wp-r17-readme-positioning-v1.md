---
slug: wp-r17-readme-positioning
version: 1
artifact: review
status: ready-for-next-phase
created: 2026-08-08
updated: 2026-08-08
manifest_ids: [R1, R2, R3, RI1, RI2, RI3]
upstream:
  - workflow/artifacts/briefs/wp-r17-readme-positioning-v1.md
  - workflow/artifacts/plans/wp-r17-readme-positioning-v1.md
  - workflow/artifacts/tasks/wp-r17-readme-positioning-v1.md
orchestration:
  phase: review
  status: ready-for-next-phase
  next_phase: test
  blockers: []
  user_checkpoint: none
---

# WP-R17 — README & Docs Positioning Rewrite - Review

## Findings

- **P2 — lifecycle artifact — task/plan structural gaps caught by `npm run validate` (already fixed during Review).** IDs: n/a (chain hygiene).
  Problem: Build's handoff task artifact set "## Active Phase" to "Both build phases complete", stripping the phase number `check-scope-fence` parses (`/Phase\s+(\d+)/`) — `validate` failed. Separately, the plan lacked the `## Assumptions Verified` section `check-assumptions` requires when the brief declares A IDs (A1–A5).
  Fix recommendation: **applied this Review** — Active Phase reworded to name "Phase 2" (last completed), and a `## Assumptions Verified` table added to the plan with A1–A5 each `evidence-backed`. Both were artifact-format defects, not product-code changes; `npm run validate` now exits 0. No product file touched by these fixes.

- **P3 — `README.md:26` — README retains "Not a scaffolder" while Notion page 01 now drops the scaffolder-exclusion.** IDs: R1, R2 (observation, not a defect).
  Problem: After this WP, `README.md`'s "What it refuses to be" list still says "Not a scaffolder", whereas Notion page 01's strategy list no longer implies it.
  Fix recommendation: none required — this is the brief's explicit, approved design (Non-Goals + A2): README describes the *shipped* 1.0.0 product (genuinely not a scaffolder yet; WP-R6 is Blocked), Notion page 01 describes *strategic direction*. Recorded as residual risk / Reflect follow-up for the eventual WP-R11/site + WP-R6 reconciliation, not a fix.

## Severity Summary

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 1 |
| P3 | 1 |

## Requirement Coverage

| Manifest ID | Evidence | Status | Notes |
|---|---|---|---|
| R1 | `README.md:32` names GitHub Spec Kit, BMAD-METHOD, claude-task-master, agentpreflight; `README.md:34` states the differentiator; `## Where it fits` at line 30 precedes `## Setup` at line 40 | covered | `grep -c` = 1 for each of the four names; verified before `## Setup` |
| R2 | Notion page 01 re-fetched 2026-08-08T11:57Z; bullet now "Not domain-opinionated — … not baked into a template's guesses"; word "scaffold" absent | covered | Single-bullet edit; other bullets/sections unchanged |
| R3 | `README.md:36-38` `### Why there's no paid tier` paragraph gives an actual reason (Markdown skills can't be content-gated at inference; community-first) | covered | Paragraph, not a bare claim |
| RI1 | `README.md:28` "Not a paywall" bullet vs `README.md:38` paragraph — same claim (free, community-first, future paid = service only), no drift | covered | Bullet left unchanged; consistent with paragraph |
| RI2 | `git diff --stat` = `README.md` only; `git status \| grep site/` = 0 | covered | Zero `site/` changes |
| RI3 | Notion re-fetch: exactly one bullet in "What agentsmyth Is Not" changed; other three bullets + all other sections byte-unchanged | covered | Targeted `update_content`, not whole-page replace |

## Architecture Notes

- role: Staff Reviewer
- decision: Reviewed evidence directly (actual `README.md` lines, re-fetched Notion page, `git diff`/`grep` output) rather than trusting the task artifact's claims. The two P2 artifact-format defects were fixed in-place during Review because they are lifecycle-artifact hygiene (not product code) and blocked the required `validate` gate; per Review determinism rules, no product file was modified.
- constraint: `[safety-3]` — R2's external-state claim is backed by a same-session re-fetch of the live Notion page, not an assertion. `verification.yaml` required commands (`validate`, `violations:test`) both green.
- constraint: Brief Non-Goals held — diff is `README.md`-only; no `site/`, `src/`, `CHANGELOG.md`, or WP-R6 code touched.
- downstream: Test can rely on the manual read-through + command evidence here (no automated content check exists for prose positioning). Ship must cite the Notion page URL + before/after (already captured in the task Implementation Log) per `[safety-3]`, and record the merge-before-WP-R15-dispatch sequencing. Reflect should log the intended README-vs-Notion "scaffolder" split (P3) as an open follow-up tied to WP-R6 / site reconciliation.

## Verification Reviewed

| Item | Outcome | Notes |
|---|---|---|
| `npm run validate` | pass (exit 0) | After the two P2 artifact fixes; initially failed on scope-fence + assumptions |
| `npm run violations:test` | pass (21/21) | All violation fixtures rejected |
| `grep -c` 4 competitor names in `README.md` | pass | 1 each |
| Section-order (`## Where it fits` L30 < `## Setup` L40) | pass | Differentiator above the fold |
| `git diff --stat` / `git status` for `site/` | pass | Only `README.md`; 0 `site/` changes |
| Notion page 01 re-fetch (R2/RI3) | pass | "scaffold" removed; exactly one bullet changed |
| RI1 manual consistency read-through | pass | Bullet and paragraph tell one story |

## Residual Risk

- **Intended README/Notion "scaffolder" divergence (P3).** README keeps "Not a scaffolder" (shipped truth); Notion page 01 drops it (direction). By design per brief; carries forward until WP-R6 ships and the site/README positioning is reconciled (already a known WP-R11 follow-up). Owner: user.
- ~~**Competitor names are unlinked plain text.**~~ **Resolved 2026-08-08 (post-review fix, user-requested "fix all"):** all four names linked to verified sources — Spec Kit → `github.com/github/spec-kit`, BMAD-METHOD → `github.com/bmad-code-org/BMAD-METHOD`, claude-task-master → `github.com/eyaltoledano/claude-task-master`, agentpreflight → `agent-preflight.szybnev.cc` (the one-word npm project matching the exact name, distinct from the unrelated hyphenated `aminglab/agent-preflight`). URLs confirmed via web search this session, not fabricated. `README.md:32`.
- **No automated check guards prose positioning.** R1/R3 correctness rests on the manual read-through recorded above; a future wording regression would not be caught by `validate`. Low impact. Owner: user.

## Recommendation

pass-with-risk
