---
slug: site-docs-remediation
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-07-26
updated: 2026-07-26
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, R9, RI1]
upstream:
  - workflow/artifacts/briefs/site-docs-remediation-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
---

# Site docs remediation (Tier 1) - Plan

## Summary

Nine targeted edits across `README.md`, `site/install.md`, `site/setup.md`, `site/validators.md`, and the logo/config pair, each fixing one anchored correctness defect from the approved brief. No new decisions here — sequencing and verification only.

## Inputs

- `workflow/artifacts/briefs/site-docs-remediation-v1.md` (approved)
- `bin/agentsmyth.mjs`, `src/setup/SKILL.md` — ground truth already cited per-requirement in the brief; not re-derived here

## Requirement Coverage

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R1 | Phase 1 | Repo-root-write claim fix |
| R2 | Phase 1, Phase 3 | Spans both `site/install.md` (hook mention) and `site/setup.md` (callout removal) |
| R7 | Phase 1 | Same section of `site/install.md` as R1 |
| R3 | Phase 2 | README Config Files six→five |
| R5 | Phase 2 | README Cursor adapter path |
| R6 | Phase 3 | AGENTS.md Codex-scoping |
| R4 | Phase 3 | Same file (`site/setup.md`) as R6 |
| R8 | Phase 4 | Validators page setup-gate row |
| R9 | Phase 5 | Logo theme-desync split (T-D18) |
| RI1 | Every phase | Diff checked against "Do not touch" list before each commit, not just once at the end |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `site/install.md` | modify | R1, R2, R7 | All three land in the same "What init actually does" section |
| `README.md` | modify | R3, R5 | Config Files section number/table; Cursor path cell |
| `site/setup.md` | modify | R2, R4, R6 | Opt-in callout removed; config table row removed; AGENTS.md line scoped to Codex |
| `site/validators.md` | modify | R8 | One new table row |
| `site/public/logo.svg` | delete | R9 | Replaced by the two files below |
| `site/public/logo-light.svg`, `logo-dark.svg` | create | R9 | Hardcoded ink, no `<style>` block |
| `site/.vitepress/config.ts` | modify | R9 | `themeConfig.logo` → `{ light, dark, alt, width, height }` |

No `src/`, `bin/`, or schema files touched — docs and static assets only.

## Source-of-Truth Strategy

Every fix's wording is already anchored in the brief against ground truth (`bin/agentsmyth.mjs`, `src/setup/SKILL.md`, or an already-correct sentence elsewhere in the same repo). Plan does not re-derive any of that; Build applies it verbatim.

## Approach

Group edits by file, not by requirement ID, since several requirements share a file/section. Apply each group in one pass, then run that requirement's verification immediately — stop and report on any failure rather than continuing to the next phase.

## Phases

### Phase 1 - `site/install.md`

- **Manifest IDs:** R1, R2, R7, RI1
- Touches: `site/install.md` ("What init actually does" section)
- Work: Delete the false repo-root-write sentence, replace with the correctly scoped promise and a list of actual repo-root writes (R1); add a one-line mandatory-hook mention (R2); fix the `workflow-bundle.md` table row description to match README's accurate wording (R7).
- **Exit gate:** `grep -r "never writes to your repo root" site/ README.md` and `grep -n "seed local artifacts and learnings" site/install.md` both return zero hits; `grep -rn "pre-commit" site/install.md` shows the mandatory framing.

### Phase 2 - `README.md`

- **Manifest IDs:** R3, R5, RI1
- Touches: `README.md` (Config Files section, adapter table)
- Work: Change "Six" to "Five" in the Config Files sentence, drop the `agent-behavior.yaml` row, add the shared-definitions-tree sentence (R3); fix the Cursor adapter table cell to `.cursor/rules/agentsmyth.mdc` (R5).
- **Exit gate:** Config Files section says "five" and the table has exactly 5 rows; `grep -n "\.cursor/rules/" README.md` returns one distinct path across both mentions.

### Phase 3 - `site/setup.md`

- **Manifest IDs:** R2, R4, R6, RI1
- Touches: `site/setup.md` (Phase 3 config table, Phase 5 callout and AGENTS.md line)
- Work: Delete the `agent-behavior.yaml` table row, leaving the explanatory paragraph untouched (R4); reword the AGENTS.md line to name Codex explicitly (R6); delete the stale opt-in pre-commit callout, replace with mandatory framing matching `src/setup/SKILL.md` Step 5e (R2, second half).
- **Exit gate:** table has exactly five rows; `site/setup.md` describes `AGENTS.md` as Codex-specific; `grep -rn "pre-commit\|opt-in" site/setup.md` shows no stale opt-in framing.

### Phase 4 - `site/validators.md`

- **Manifest IDs:** R8, RI1
- Touches: `site/validators.md` (setup-validators table)
- Work: Add a `check-pending-setup` row, explicitly marked advisory/non-blocking, reconciling with README's 3-command post-setup list. No hard count of the 22 lifecycle validators added anywhere on the page.
- **Exit gate:** all three post-setup checks from `README.md:189-193` are named on the page, with `check-pending-setup` marked non-blocking.

### Phase 5 - Logo theme-desync split

- **Manifest IDs:** R9, RI1
- Touches: `site/public/logo.svg` (delete), `site/public/logo-light.svg` + `logo-dark.svg` (create), `site/.vitepress/config.ts` (modify)
- Work: Create the two hardcoded-ink SVGs (no `<style>`/media-query, matching `assets/brand/lockup-light.svg`/`lockup-dark.svg`'s pattern); set `themeConfig.logo` to `{ light, dark, alt, width, height }`; confirm the favicon `head` link still points at `favicon.svg` before deleting the old `logo.svg`.
- **Exit gate:** `grep -r "prefers-color-scheme" site/` returns nothing; logo renders correctly in all four OS-theme × site-theme combinations (verified by rendering, not just grep); `npm run site:build` still passes.

## Dependency Order

Phases 1-4 are independent of each other and of Phase 5. Phase 5 continues on branch `fix/docs-site-base-path` per the brief's constraint (same branch already touching `config.ts` and `logo.svg` for the unrelated base-path fix); Phases 1-4 land on the same branch to keep this as one reviewable change.

## Branch Strategy

Continue on `fix/docs-site-base-path` rather than opening a new branch — it's still open (PR #49), already touches `site/.vitepress/config.ts` and `site/public/logo.svg`, and this brief's Architecture Notes already called out keeping site-related work there to avoid a merge conflict between the two efforts.

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|
| Phase 5 touches the same two files as PR #49's still-open base-path fix | Low | Low | Already confirmed no line-level conflict — that earlier edit only touched `base` and `themeConfig.logo`'s `src`, not the light/dark split being added now | agent | R9 |
| A fix's wording drifts from what the brief actually verified against source, if rewritten during Build instead of copied | Low | Medium | Build copies the brief's exact "Fix:" wording per requirement rather than re-authoring it | agent | R1-R9 |

## Verification Plan

| Manifest ID | Verification method | Command / Scenario |
|---|---|---|
| R1 | Command | `grep -r "never writes to your repo root" site/ README.md` → zero hits |
| R2 | Command | `grep -rn "pre-commit" site/ README.md` → one consistent mandatory story; zero "opt-in" hits adjacent to "pre-commit" |
| R7 | Command | `grep -n "seed local artifacts and learnings" site/install.md` → zero hits |
| R3 | Manual QA | Read `README.md`'s Config Files section and count table rows → says "five", 5 rows |
| R5 | Command | `grep -n "\.cursor/rules/" README.md` → one distinct path (`agentsmyth.mdc`) |
| R6 | Manual QA | Read `site/setup.md:50` and README's adapter table → both Codex-specific only |
| R4 | Manual QA | Count `site/setup.md`'s Phase 3 config table rows → exactly five |
| R8 | Manual QA | Read `site/validators.md`'s setup-validators table → all three checks named, `check-pending-setup` marked non-blocking |
| R9 | Command + Manual QA | `grep -r "prefers-color-scheme" site/` → nothing; render in all 4 OS-theme × site-theme combinations → logo visible in each |
| RI1 | Manual QA | Diff review against the Notion "Do not touch" list → no touched line falls inside a protected block |

After all five phases: `npm run build` and `npm run site:build` must both still pass.

## Architecture Notes

- role: Architect
- decision: none new — this plan is mechanical execution of an already-approved brief.
- constraint: none new.
- tradeoff: none new.
- downstream: none.

## Open Questions

None.

## Checkpoint Approval

- Checkpoint: plan-review
- Status: approved
- User's own words (verbatim, this turn): "Yes, proceed with the plan"

## Exit Gate

- [x] Every active R and RI from the brief appears in Requirement Coverage, Phases, and Verification Plan.
- [x] User approved or waiver recorded. (see Checkpoint Approval above)
