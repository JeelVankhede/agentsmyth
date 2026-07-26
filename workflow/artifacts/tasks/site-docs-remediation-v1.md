---
slug: site-docs-remediation
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-07-26
updated: 2026-07-26
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, R9, RI1]
upstream:
  - workflow/artifacts/briefs/site-docs-remediation-v1.md
  - workflow/artifacts/plans/site-docs-remediation-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# Site docs remediation (Tier 1) - Task

## Active Phase

- Phase: Phase 5 (final) — all five plan phases landed in this pass
- Manifest IDs: R1, R2, R3, R4, R5, R6, R7, R8, R9, RI1
- Exit gate: all nine Requirement-level grep/manual-QA checks pass (see Verification Items) and `npm run build` + `npm run site:build` both succeed.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - `site/install.md` | complete | R1, R2, R7, RI1 |
| Phase 2 - `README.md` | complete | R3, R5, RI1 |
| Phase 3 - `site/setup.md` | complete | R2, R4, R6, RI1 |
| Phase 4 - `site/validators.md` | complete | R8, RI1 |
| Phase 5 - Logo theme-desync split | complete | R9, RI1 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `fix/docs-site-base-path` | Working tree already carried the five plan phases' edits staged, plus two unrelated pre-existing staged changes (`.githooks/pre-commit` mandatory-gate install, `workflow/config/repo-profile.yaml` version/`definitions_root` bump) from prior dogfooding work on this repo — out of scope for this brief, left untouched. | Per plan's Branch Strategy: continue on this branch (already open as PR #49, already touching `config.ts`/`logo.svg` for the base-path fix). |
| At handoff | `fix/docs-site-base-path` | Same staged set; `npm run build` and `npm run site:build` both pass. | No new files touched beyond the plan's Repo Impact Map. |

## Scope

- In scope: `site/install.md`, `README.md`, `site/setup.md`, `site/validators.md`, `site/public/logo-light.svg` + `logo-dark.svg` (new), `site/public/logo.svg` (deleted), `site/.vitepress/config.ts` — exactly the plan's Repo Impact Map.
- Out of scope (left as pre-existing dirty state, not authored by this task): `.githooks/pre-commit`, `workflow/config/repo-profile.yaml` — these belong to earlier, separate dogfooding work (mandatory pre-commit hook install / `definitions_root` linkage) and carry no manifest ID from this brief.

## Changed Files

- `site/install.md` — replaced the false "never writes to your repo root" claim with a scoped promise plus the actual repo-root write list, added the mandatory pre-commit mention, fixed the `workflow-bundle.md` table row wording — IDs: R1, R2, R7
- `README.md` — Cursor adapter path corrected to `.cursor/rules/agentsmyth.mdc`; Config Files section changed "Six" → "Five", dropped the `agent-behavior.yaml` row, added the shared-definitions-tree sentence — IDs: R3, R5
- `site/setup.md` — dropped the `agent-behavior.yaml` config-table row; scoped the `AGENTS.md` sentence to Codex; replaced the stale opt-in pre-commit callout with mandatory framing — IDs: R2, R4, R6
- `site/validators.md` — added a `check-pending-setup` row marked explicitly non-blocking, reconciling with README's three-command post-setup list — IDs: R8
- `site/public/logo-light.svg`, `site/public/logo-dark.svg` — new hardcoded-ink SVGs, no `<style>`/media-query block — IDs: R9
- `site/public/logo.svg` — deleted, superseded by the light/dark pair — IDs: R9
- `site/.vitepress/config.ts` — `themeConfig.logo` changed to `{ light: '/logo-light.svg', dark: '/logo-dark.svg', alt: 'agentsmyth', width: 24, height: 24 }` — IDs: R9

## Implementation Log

- Each edit copied the brief's exact "Fix:" wording verbatim, per the plan's Source-of-Truth Strategy — no re-derivation of ground truth during Build.
- R9: confirmed the favicon `head` link (`site/.vitepress/config.ts:14`) already points at `favicon.svg`, not `logo.svg`, before removing the old single-file logo — no conflict, matches brief note.
- RI1 checked per file against the Notion "Do not touch" list before treating each file as done; no touched line falls inside a protected block (verified again at handoff via diff review below).
- `agentsmyth check --phase build --slug site-docs-remediation` initially failed on upstream checkpoint evidence: the brief's `brief-review` ("Approved") and plan's `plan-review` ("Continue") quotes were both 8 characters, under the validator's 10-char placeholder-detection floor. Rather than self-author longer text, the user was asked in chat to restate approval in their own words; they gave "Yes, I approve this brief" and "Yes, proceed with the plan", which were written verbatim into each artifact's Checkpoint Approval section. Re-run of the phase gate then passed clean.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R1 | `grep -r "never writes to your repo root" site/ README.md` (excluding `dist/`) | zero hits |
| R2 | `grep -rn "pre-commit" site/*.md README.md` and `grep -rn "opt-in" site/*.md README.md` | one consistent mandatory-hook story; only "no opt-in step" phrasing remains, no stale "opt-in offer" framing |
| R7 | `grep -n "seed local artifacts and learnings" site/install.md` | zero hits |
| R3 | Read README's Config Files section | says "Five", table has exactly 5 rows |
| R5 | `grep -n "\.cursor/rules/" README.md` | single distinct path, `agentsmyth.mdc`, across both mentions |
| R6 | Read `site/setup.md` and README's adapter table | both describe `AGENTS.md` as Codex-specific only |
| R4 | Count `site/setup.md`'s Phase 3 config table rows | exactly five |
| R8 | Read `site/validators.md`'s setup-validators table | all three post-setup checks named, `check-pending-setup` marked non-blocking |
| R9 | `grep -r "prefers-color-scheme" site/public site/.vitepress/config.ts` | zero hits (favicon.svg's media query is untouched/out of scope, correctly not part of this requirement's file set) |
| RI1 | Diff review against Notion "Do not touch" list | no touched line falls inside a protected block |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `grep -rn --exclude-dir=dist --exclude-dir=node_modules "never writes to your repo root" site/ README.md` | R1 | pass (zero hits) | ran against source only; `dist/` build output correctly excluded |
| `grep -rn --exclude-dir=dist "pre-commit" site/*.md README.md` | R2 | pass | one consistent mandatory-gate story across `site/install.md`, `site/setup.md`, `site/under-hood.md`, `README.md` |
| `grep -rn --exclude-dir=dist "opt-in" site/*.md README.md` | R2 | pass | remaining hits are "no opt-in step" / "no separate opt-in step" — correct negation, not stale framing |
| `grep -n "seed local artifacts and learnings" site/install.md` | R7 | pass (zero hits) | |
| `grep -n "\.cursor/rules/" README.md` | R5 | pass | both mentions now read `.cursor/rules/agentsmyth.mdc` |
| `grep -rn --exclude-dir=dist "prefers-color-scheme" site/public site/.vitepress/config.ts` | R9 | pass (zero hits) | `site/public/favicon.svg`'s own media query is a separate, out-of-scope file and was not touched |
| `grep -n "favicon" site/.vitepress/config.ts` | R9 | pass | still points at `favicon.svg`, confirming no conflict from the logo split |
| `npm run build` | All | pass | `build-bundle: ok`; no bundle breakage from doc/asset edits |
| `npm run site:build` | All | pass | `vitepress build site` — client + server bundles and page render both succeeded |
| Manual read of README Config Files section, `site/setup.md` Phase 3 table, `site/setup.md`/README AGENTS.md wording, `site/validators.md` table | R3, R4, R6, R8 | pass | row counts and wording match plan's stated expected results (recorded inline in Verification Items above) |
| Diff review against Notion "Do not touch" list | RI1 | pass | none of the protected blocks (taglines, Introduction opening, "What it refuses to be", vibe-coding arc, the two quoted lines, router classification table, `/in-action` fabrication label) appear in any touched hunk |

## Dispatch Log

none — all nine requirements are small, file-scoped text edits with no independent-workstream boundary; single-pass execution per the plan's Approach.

## Architecture Notes

- role: Senior Engineer
- decision: Recorded all five plan phases in one task artifact/version rather than one task per phase, since the plan's own Dependency Order states Phases 1-4 are independent of each other and of Phase 5, and all five landed together on the same branch with no cross-phase conflict.
- constraint: Left the two pre-existing unrelated staged changes (`.githooks/pre-commit`, `workflow/config/repo-profile.yaml`) untouched — they predate this brief, carry no manifest ID, and the plan's Repo Impact Map explicitly scopes this work to docs/static-asset files only.
- tradeoff: none new — plan already resolved sequencing; Build applied verbatim.
- downstream: Review should confirm the diff is exactly the Repo Impact Map (7 files touched/created/deleted) plus the two pre-existing unrelated staged files, and that no line inside the Notion "Do not touch" list was altered. Ship should note this branch (`fix/docs-site-base-path`, PR #49) already carries an unrelated base-path fix and the forge-ring brand asset commit, so the eventual PR/merge covers more than this brief alone.

## Blockers

none

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Phase 1 - `site/install.md` | complete | 2026-07-26 | R1, R2, R7 verified via grep |
| Phase 2 - `README.md` | complete | 2026-07-26 | R3, R5 verified via manual read + grep |
| Phase 3 - `site/setup.md` | complete | 2026-07-26 | R2 (second half), R4, R6 verified via grep + manual read |
| Phase 4 - `site/validators.md` | complete | 2026-07-26 | R8 verified via manual read |
| Phase 5 - Logo theme-desync split | complete | 2026-07-26 | R9 verified via grep + `npm run site:build` |
