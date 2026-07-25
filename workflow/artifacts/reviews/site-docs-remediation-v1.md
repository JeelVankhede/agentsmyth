---
slug: site-docs-remediation
version: 1
artifact: review
status: ready-for-next-phase
created: 2026-07-26
updated: 2026-07-26
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, R9, RI1]
upstream:
  - workflow/artifacts/briefs/site-docs-remediation-v1.md
  - workflow/artifacts/plans/site-docs-remediation-v1.md
  - workflow/artifacts/tasks/site-docs-remediation-v1.md
orchestration:
  phase: review
  status: ready-for-next-phase
  next_phase: test
  blockers: []
  user_checkpoint: none
---

# Site docs remediation (Tier 1) - Review

## Findings

none

## Severity Summary

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |

## Requirement Coverage

| Manifest ID | Evidence | Status | Notes |
|---|---|---|---|
| R1 | `git diff --cached site/install.md`; `grep -rn --exclude-dir=dist "never writes to your repo root" site/ README.md` → 0 hits; cross-checked repo-root write list against `bin/agentsmyth.mjs:329` (5 config files), `:466-473` (7 artifact dirs + learnings), `:686-696` (Cursor/non-macOS Copilot adapters), `:713-750` (mandatory hook, `existsSync` skip-if-exists throughout) | covered | List in `site/install.md` matches actual write sites exactly; independently re-derived from source, not just trusted from the brief's citation. |
| R2 | `grep -rn --exclude-dir=dist "pre-commit\|opt-in" site/*.md README.md`; `installPreCommitHook()` at `bin/agentsmyth.mjs:713` confirmed unconditional, no prompt | covered | Stale opt-in callout removed from `site/setup.md`; `site/install.md` now carries a matching one-line mandatory mention. Remaining "opt-in" hits are correct negations ("no opt-in step"), not stale framing. |
| R3 | Read `README.md`'s Config Files section; table row count = 5; cross-checked against `bin/agentsmyth.mjs:328` config-file loop (exactly `domain.yaml`, `release.yaml`, `repo-profile.yaml`, `source-of-truth.yaml`, `verification.yaml`) | covered | "Six" → "Five" and the `agent-behavior.yaml` row removal both match source ground truth. |
| R4 | Read `site/setup.md`'s Phase 3 config table; row count = 5; explanatory paragraph at original line 34 untouched | covered | Only the `agent-behavior.yaml` table row was deleted, exactly as the plan scoped this requirement. |
| R5 | `grep -n "\.cursor/rules/" README.md` → single path `agentsmyth.mdc` at both mentions; cross-checked `bin/agentsmyth.mjs:686` (`cursorDest = join(repoDir, '.cursor', 'rules', 'agentsmyth.mdc')`) | covered | `site/under-hood.md:49` still carries the stale `index.mdc` value; the brief's Non-Goals/Risks already deferred that page to a separate future pass (T-D14), so it carries no manifest ID here — tracked as residual risk below, not a finding. |
| R6 | Read `site/setup.md:49` and README's adapter table; cross-checked `bin/agentsmyth.mjs:795-803` (`~/.codex/AGENTS.md`) and `src/adapters/codex/README.md:3` | covered | Both now scope `AGENTS.md` to Codex explicitly; no other adapter in `src/adapters/` uses that filename. |
| R7 | `grep -n "seed local artifacts and learnings" site/install.md` → 0 hits; new wording ("the full workflow... the agent expands") matches `README.md:130`'s existing description | covered | |
| R8 | Read `site/validators.md`'s setup-validators table (3 rows, `check-pending-setup` marked non-blocking); cross-checked `README.md:189-193`'s post-setup command list (all 3 named); confirmed no hard validator count added (`grep -n "22" site/validators.md` → 0 hits) | covered | Reconciliation matches README's already-correct list exactly. |
| R9 | `grep -rn --exclude-dir=dist "prefers-color-scheme" site/public site/.vitepress/config.ts` → 0 hits; read `logo-light.svg`/`logo-dark.svg` (hardcoded `#17171A`/`#F5F4F0`, no `<style>` block, same pattern as `assets/brand/lockup-light.svg`/`lockup-dark.svg`); `site/.vitepress/config.ts`'s `themeConfig.logo` now `{ light, dark, alt, width, height }`; `grep -n "favicon" site/.vitepress/config.ts` confirms `head` link still targets `favicon.svg`; `npm run site:build` passed | covered | `favicon.svg` itself still has its own `prefers-color-scheme` block; that file was never part of R9's target surface (R9 only covers the theme `logo`, not the favicon). Visual render across all 4 OS-theme × site-theme combinations was not independently re-verified in Review beyond the task artifact's claim of a passing `site:build`; see Residual Risk. |
| RI1 | Diff review of all 7 changed/created/deleted files against the brief's Constraints list (two taglines, Introduction opening, "What it refuses to be", vibe-coding arc, two quoted lines, router classification table, `/in-action` fabrication label) | covered | None of those sections appear in any touched hunk — every edit is scoped to Config Files/adapter table (README), "What init actually does" (install.md), Phase 3 table/AGENTS.md line/pre-commit callout (setup.md), setup-validators table (validators.md), and the logo/config.ts pair. |

## Architecture Notes

- role: Staff Reviewer
- decision: Treated the task artifact's cited ground truth (`bin/agentsmyth.mjs`, `src/adapters/codex/README.md`) as a starting pointer, not as accepted fact — independently re-ran the relevant greps/reads against current source for R1, R2, R5, R6, R7, R8, R9 rather than trusting the brief's or task's prose. All matched.
- constraint: Two pre-existing unrelated staged changes on this branch (`.githooks/pre-commit` mandatory-gate install, `workflow/config/repo-profile.yaml`'s `agentsmyth_version`/`definitions_root` update) carry no manifest ID from this brief and were correctly left untouched by Build. Review scope excludes them from Requirement Coverage but flags them below since they'll ship in the same commit/PR.
- downstream: Ship should confirm this branch's eventual PR description accounts for all four logically-distinct pieces of work now staged together (base-path fix from PR #49, forge-ring brand assets, the mandatory-hook/repo-profile dogfooding update, and this docs-remediation pass) so reviewers aren't surprised by scope. Test/Ship should also independently render the site (not just build it) to confirm R9's visual claim across OS-theme × site-theme combinations, since Review verified file contents and build success but did not open a browser.

## Verification Reviewed

| Item | Outcome | Notes |
|---|---|---|
| `npm run build` (task artifact claim) | reviewed, evidence matches | Re-inspected `scripts/build-bundle.mjs` output cited in task artifact; consistent with a docs/asset-only diff (no `src/` change to cause bundle drift). |
| `npm run site:build` (task artifact claim) | reviewed, evidence matches | Task artifact quotes actual VitePress build success output; independently confirmed no `prefers-color-scheme` regression via a second, review-run grep. |
| Grep-based Requirement Manifest checks (R1, R2, R5, R7, R8, R9) | re-run independently in Review | All reproduced the same zero-hit / expected-match results claimed in the task artifact. |
| Manual-QA Requirement checks (R3, R4, R6, R8) | re-read independently in Review | Table row counts and wording confirmed by direct file read, not inferred from the task artifact's description. |
| RI1 "Do not touch" diff check | re-run independently in Review | Confirmed via diff-hunk inspection against the brief's Constraints list; no overlap. |

## Residual Risk

- `site/under-hood.md:49` still carries the stale `.cursor/rules/index.mdc` path (README now correct, this page is not) — explicitly accepted as a known gap per the brief's Risks section, deferred to the future T-D14 sweep. Not a finding because it was declared out of scope before Build started, not discovered during Review.
- R9's live-rendering claim (logo visible across all 4 OS-theme × site-theme combinations) rests on `site:build` succeeding plus static file inspection; no browser-based visual confirmation was captured in either Build or Review. Low risk given the file pattern exactly matches the already-proven-correct `lockup-light.svg`/`lockup-dark.svg` approach, but flagged for Test to close out with an actual render check.
- This branch (`fix/docs-site-base-path`) carries unrelated pre-existing staged work (mandatory pre-commit hook install, `repo-profile.yaml` version bump) alongside this brief's changes. Not a defect, but Ship's eventual PR description should account for all of it so reviewers aren't surprised by scope creep beyond "docs remediation."

## Recommendation

pass
