---
slug: wp-r12-local-install-fixes
version: 1
artifact: reflect
status: done
created: 2026-07-21
updated: 2026-07-21
manifest_ids: [R1, R2, R3, R4, R5, RI1, RI2, RI3, RI4, RI5]
upstream:
  - workflow/artifacts/briefs/wp-r12-local-install-fixes-v1.md
  - workflow/artifacts/plans/wp-r12-local-install-fixes-v1.md
  - workflow/artifacts/tasks/wp-r12-local-install-fixes-v1-p1.md
  - workflow/artifacts/tasks/wp-r12-local-install-fixes-v1-p2.md
  - workflow/artifacts/tasks/wp-r12-local-install-fixes-v1-p3.md
  - workflow/artifacts/tasks/wp-r12-local-install-fixes-v1-p4.md
  - workflow/artifacts/reviews/wp-r12-local-install-fixes-v1.md
  - workflow/artifacts/verify/wp-r12-local-install-fixes-v1.md
  - workflow/artifacts/ship/wp-r12-local-install-fixes-v1.md
orchestration:
  phase: reflect
  status: done
  next_phase: done
  blockers: []
  user_checkpoint: none
---

# WP-R12 — Local Install Fixes - Reflect

## Inputs

- Ship recommendation: `ship`, real `ship-review` approval recorded, `workflow/artifacts/ship/wp-r12-local-install-fixes-v1.md`.
- PR [#42](https://github.com/JeelVankhede/agentsmyth/pull/42) open against `main`, CI passing (first attempt).

## Outcome

- Released: not yet merged. PR #42 is open with a passing CI run; merge is the user's own action.
- Source-of-truth: not applicable.
- Rollback: not triggered.
- All 10 active manifest IDs (R1-R5, RI1-RI5) shipped. No waivers this WP.
- The branch-staleness risk (this WP cut before WP-R11's PR #41 merged) was fully resolved during Ship — merged `origin/main` in, reconciled 3 real conflicts, full regression re-run clean.

## What Worked

- The packaging fix (R1) was root-caused, fixed, and verified end-to-end (real `npm pack` + `--install-links` scratch install, isolated `$HOME`) before any artifact was written — evidence came first, writeup came second. This is why Phase 1 never needed rework.
- Testing `check-release-readiness.mjs`'s fix against every real shipped Ship artifact (not just the fixture) found a second, previously-unknown instance of the exact bug being fixed (`power-skills-wave2-v1.md` was silently misdetected as `hold-with-waiver`). A fixture-only test would have missed this.
- Plan caught a real design risk before Build started: discovering the `o-ship-with-open-p1` violation fixture's own Findings-list format (heading-based, not bold-inline) during Plan meant R3's resolved-finding detection was designed narrow and position-anchored from the start, rather than needing a post-hoc fix after accidentally breaking that fixture.
- The checkpoint-approval mechanism (R5) was dogfooded against this WP's own real Plan *before* any test fixture was written — the strongest possible proof it actually catches the failure mode it exists for, not just a synthetic case built to look good.
- The `origin/main` merge conflict in `open-items.yaml` turned out to be more than mechanical — both branches had independently claimed OI-33/34/35 for different content, and `origin/main`'s OI-40 was literally the original bug report for a fix WP-R12 had already shipped. `-p2`'s own task artifact had explicitly flagged this exact reconciliation need in advance ("once both branches merge, confirm OI-40 ... is marked done"), which made resolving it at Ship a matter of following already-written intent rather than improvising under pressure.

## What Did Not Work

- **The core failure of this WP, named plainly**: Build proceeded from Plan through all 3 original phases without the Plan ever being presented for `plan-review`, treating the user's answers to earlier Think-phase clarifying questions as blanket approval for a separate, later checkpoint. `workflow/rules.md` already had a `## Approval` section stating the correct rule in prose (added by an earlier WP, `power-skills-wave4-v1`, tracked as OI-15) — it was not sufficient on its own to prevent a real recurrence. The fix (R5) required a mechanical, hard-blocking gate, not just better prose.
- The first attempt at `check-release-readiness.mjs`'s `declaredRecommendation()` fix was too strict — it broke 2 real, pre-schema-convention artifacts that declare their recommendation in free prose rather than the `- Recommendation:` bullet. Caught only because Phase 2 tested against every real Ship artifact, not just the target case; the initial design hadn't anticipated non-conforming historical documents.
- Writing this WP's own Ship artifact, an initial draft declared `- Recommendation: ship` in the body while simultaneously listing a blocker in `orchestration.blockers` — an internally inconsistent state that R2's own new blockers-consistency check correctly caught. A small, low-cost mistake, but a real one: it shows the two "is this ready" concepts (technical recommendation vs. checkpoint-approval status) are easy to conflate even by the same agent that just built the mechanism to keep them separate.
- Some of R4's file-format claims (Codex's `/prompts:agentsmyth` namespacing, Cursor's frontmatter-free format, Windsurf's workflow structure) rest entirely on WebSearch research, not first-hand tool access — a real, disclosed, but non-trivial verification gap that three separate phases (Build, Review, Test) all could only narrow to "file placement and content are correct," never "the command actually works in the real tool."

## Surprises

- `origin/main` moved mid-session (WP-R11's PR #41 merged) while WP-R12 was still in Build/Review/Test — the first time in this observed session history that a Ship phase had to perform a real, conflict-resolving merge rather than just confirm the branch was still current. `lifecycle-ship/SKILL.md`'s step 4a (added after `power-skills-wave2-v1`'s OI-9) correctly flagged the staleness, but its own wording ("fetch and compare... treat meaningful divergence as something to surface explicitly") is written toward *detection*, not toward the reconciliation work that followed once real conflicts appeared — worth a closer look at whether that step needs its own sub-step for the reconciliation case specifically.

## Manifest Coverage Retrospective

| Manifest ID | Outcome | Evidence path | Notes |
|---|---|---|---|
| R1 | shipped | `workflow/artifacts/ship/wp-r12-local-install-fixes-v1.md` — Requirement Coverage R1 row | Real packed-install repro, independently re-verified 3 times (Build, Review, Test). |
| R2 | shipped | Same — R2 row | Found and fixed a second, previously-unknown real instance of the bug along the way. |
| R3 | shipped | Same — R3 row | Design deliberately narrowed after Plan discovered a real second Findings-list format in use. |
| R4 | shipped | Same — R4 row | File-level verification only; live in-tool invocation is a disclosed, carried-forward gap (OI-42). |
| R5 | shipped | Same — R5 row | The mechanism this whole WP's meta-story is about — dogfooded against its own real violation before any fixture existed. |
| RI1 | shipped | Same — RI1 row | |
| RI2 | shipped | Same — RI2 row | |
| RI3 | shipped | Same — RI3 row | Verified 3 times independently across Build/Review/Test. |
| RI4 | shipped | Same — RI4 row | |
| RI5 | shipped | Same — RI5 row | Codex deprecation risk disclosed, tracked as OI-41. |

## Deferred

none — every active manifest ID shipped; no ID was deferred, blocked, or left uncovered.

## Source-of-Truth Outcome

not applicable — no provider configured.

## Learning Candidates

- **Candidate learning**: A documented process rule (prose in `workflow/rules.md`) is not sufficient on its own to prevent its own violation, even when the rule is clear and was added specifically to prevent a prior, similar incident. When a rule's violation would be genuinely costly (a phase proceeding without real user review), it needs a mechanical, hard-blocking check backing the prose, not prose alone — source: this WP's own R5, and the fact that `workflow/rules.md`'s `## Approval` section (from `power-skills-wave4-v1`, OI-15) already existed and wasn't enough — propose-only.
- **Candidate learning**: When fixing a validator, testing against every real, already-shipped artifact the validator applies to (not just the target case or a synthetic fixture) is worth doing as standard practice, not an optional extra — it found a second real bug instance in R2's case, and would have caught R2's own first-draft regression (breaking 2 pre-schema-convention artifacts) before it ever reached a fixture. This is a recurring, now-multiply-confirmed pattern (OI-4 named the same class of gap for `check-scope-fence`/`check-manifest-coverage`/`check-release-readiness` before this WP existed) — source: `-p2`'s Implementation Log — propose-only.
- **Candidate learning**: Two structurally different concepts — "is the work technically ready" (a Ship recommendation) and "has the user actually approved this artifact" (a checkpoint) — are easy to conflate even in the same document by the same agent that built the mechanism to keep them separate, as this WP's own Ship artifact draft demonstrated. A future schema revision might benefit from keeping these more visibly distinct (e.g., a recommendation should never coexist with an open checkpoint-blocker in a way a human skimming the frontmatter could misread as "fully done") — source: this WP's own Ship artifact draft, caught by R2's blockers-consistency check — propose-only.

## Follow-Ups

| Action | Owner | Suggested Artifact Or Ticket | Status |
|---|---|---|---|
| Decide whether/when to merge PR #42 (`wp-r12-local-install-fixes` → `main`) | user | PR #42 | open |
| Confirm `/agentsmyth` (or `/prompts:agentsmyth` for Codex) actually appears and fires in each of the 5 real tools | user | `open-items.yaml` OI-42 | open |
| Revisit Codex's custom-prompts mechanism if/when OpenAI removes it in favor of "skills" | user/repo maintainer | `open-items.yaml` OI-41 | open |
| Add a `## Checkpoint Approval` example to the 3 relevant `exemplar.md` files (lifecycle-think/plan/ship) | whoever picks up the next small fix | `open-items.yaml` OI-43 | open |
| Assess whether `lifecycle-ship/SKILL.md`'s step 4a needs an explicit reconciliation sub-step, given this WP's real merge-conflict experience went beyond simple staleness detection | workflow owner | new small brief, or fold into a future validator-hardening WP | open |
| Update Notion WP-R12 page/database row status to Done, with PR #42 link, once merged | user | Notion Work Packages database row `3a4972bdebbb81ba9968ce824ca126e4` | open |

## Raw Session Entry

See `workflow/learnings/sessions/2026-07-21-wp-r12-local-install-fixes.md`.

## Architecture Notes

- role: Project Manager
- decision: This WP's own meta-story (a real checkpoint-skip, caught by the user, fixed with a mechanical gate, then dogfooded against its own history) is recorded in full in the brief's Problem section and Architecture Notes, and preserved here rather than summarized away — future readers of this chain should be able to reconstruct exactly what went wrong and why the fix takes the shape it does.
- decision: Learning candidates are tagged `propose-only`, per policy; none promoted to curated learnings without a separate, explicit curation request.
- constraint: The R4 live-in-tool-invocation gap (OI-42) is a genuine, structural limitation of this environment, not a shortcut — it should not be closed by simulating or asserting behavior without a real client to test against.
- downstream: Any future WP touching `check-lifecycle.mjs`'s checkpoint-approval logic, or adding a 6th supported adapter (e.g. Antigravity, explicitly deferred by this WP), should read this Reflect and the `-p4` task artifact first — the design rationale (why body-section not frontmatter, why narrow-not-general Findings parsing in R3, why merge-not-rebase at Ship) is already documented and shouldn't need re-deriving.

## Exit Gate

- [x] Manifest Coverage Retrospective has one row per active R and RI.
- [x] Every follow-up has a named owner and suggested artifact title.
- [x] Learning candidates tagged propose-only.
- [x] `orchestration.status: done`, `next_phase: done`.
