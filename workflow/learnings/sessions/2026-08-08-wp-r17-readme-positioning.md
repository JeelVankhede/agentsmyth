# Raw Learning Session — wp-r17-readme-positioning (2026-08-08)

## Context

WP-R17 (README & docs positioning rewrite), one of three WPs in the planned 1.0.1 patch release (alongside WP-R15 release pipeline and the already-merged WP-R16 version-skew fix). Standard class. Full lifecycle chain run this session: brief → plan → build → review → verify → ship → reflect. Deliverables: a `## Where it fits` section in root `README.md` (names + links GitHub Spec Kit, BMAD-METHOD, claude-task-master, agentpreflight; states the mechanical-phase-gate differentiator; adds a no-paid-tier paragraph), and a one-bullet rewrite of Notion page 01's "What agentsmyth Is Not" list to drop the stale scaffolder-exclusion (per resolved OQ-R6.1). Shipped `ship`; branch uncommitted pending user go-ahead.

## Candidate Learnings

1. Plan and Test skill starter blocks (`references/output-schema.md`) are out of sync with their validators: Plan's starter omits the `## Assumptions Verified` section `check-assumptions` requires when the brief has A IDs; Test's starter shows a 5-column Skipped Checks table but `check-skipped-accounting` requires 6 (`manifest_ids`). Copying either verbatim fails `npm run validate`. Fix at `src/workflow/skills/lifecycle-plan/` and `src/workflow/skills/lifecycle-test/` then rebuild.
2. External-doc (Notion) edits with no configured SoT provider: pre-draft the exact before/after string in Plan, apply via targeted single-string `update_content` (never whole-page replace), then re-fetch to diff — makes "change exactly one thing" mechanically verifiable.
3. Recurrence of OI-56 (run `validate` right after each artifact write). Two sessions now show late-validate catching format defects that a per-artifact validate would have caught free.

## Raw Notes

- `git checkout -b feat/wp-r17-readme-positioning` off clean `main` (0/0 vs origin/main throughout).
- Brief: repo-alignment-scan found `site/introduction.md` duplicates README's "What it refuses to be" list verbatim (incl. "Not a scaffolder"). Scoped R1 to README only; recorded the README/site divergence as accepted/deferred (A2), matching WP-R11's own prior note that README/site reconciliation is separate work.
- Constraint check: `[safety-3]` (no external-state claim without evidence) flagged as binding on R2's Notion edit; `source-of-truth.yaml` has `mode: optional`, `providers: []` so R2 is a normal in-chain Build step, not a formal handoff.
- Plan pre-wrote R2's before/after bullet and resolved R3 placement (README, co-located with competitor context) — the two items the brief deferred to Plan.
- Build Phase 1 (README) exit gate: `grep`=1 for each of 4 names; section L30 < Setup L40; README-only diff. Phase 2 (Notion) exit gate: re-fetch showed "scaffold" gone, exactly one bullet changed.
- Review: `npm run validate` FAILED first — check-scope-fence couldn't parse a phase number after Build wrote "## Active Phase: Both phases complete" (fixed to name "Phase 2"), and check-assumptions required a `## Assumptions Verified` section the plan lacked (added A1–A5 table, all evidence-backed). Both fixed in-review (lifecycle-artifact hygiene, no product code). violations:test passed 21/21.
- User asked to "fix all" → web-searched + added competitor links. Three map to canonical GitHub repos (github/spec-kit, bmad-code-org/BMAD-METHOD, eyaltoledano/claude-task-master); agentpreflight mapped to `agent-preflight.szybnev.cc` (the one-word npm project matching the exact name, distinct from the unrelated hyphenated `aminglab/agent-preflight`). Did not fabricate URLs.
- Test: ran a real Test (not a Standard-skip waiver) since genuine evidence exists per R/RI. `check-skipped-accounting` then failed — Skipped Checks table needed a 6th `manifest_ids` column (starter block showed 5). Fixed; validate green.
- Ship: recommendation `ship`. Deliberately did NOT add CHANGELOG 1.0.1 entry (brief A3 scopes it as release-level). Rollback defined. ship-review approved verbatim "Ship is approved"; commit NOT authorized this turn — branch left uncommitted.
- Surprise (from earlier this session, pre-WP): `release.yml` increments package.json mechanically, so `bump: patch` off 1.0.0 → 1.0.1; the Notion "hand-set + skip auto-bump" note was a misread.

## Curator Marks

_(empty — awaiting a curation pass)_
