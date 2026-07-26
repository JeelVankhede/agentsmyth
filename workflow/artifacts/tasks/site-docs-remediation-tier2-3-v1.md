---
slug: site-docs-remediation-tier2-3
version: 1
artifact: task
status: in-progress
created: 2026-07-26
updated: 2026-07-26
manifest_ids: [R10, R1, R2, R3, RI1, RI2]
upstream:
  - workflow/artifacts/briefs/site-docs-remediation-tier2-3-v1.md
  - workflow/artifacts/plans/site-docs-remediation-tier2-3-v1.md
orchestration:
  phase: build
  status: in-progress
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# Site docs remediation (Tiers 2 + 3) - Task

## Active Phase

- Phase: Phase 2 - Three new "Use it" pages
- Manifest IDs: R1, R2, R3, RI1, RI2
- Exit gate: all three pages render; sidebar shows 3 new entries under "Use it"; `npm run site:build` passes.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - bin/agentsmyth.mjs warning fix | complete | R10 |
| Phase 2 - Three new "Use it" pages | active | R1, R2, R3, RI1, RI2 |
| Phase 3 - Footer LICENSE/CHANGELOG links | pending | R4, RI1 |
| Phase 4 - site/artifacts.md upstream-shape fix | pending | R6, RI1 |
| Phase 5 - /in-action disclaimer and example fix | pending | R7, RI1 |
| Phase 6 - Per-page meta descriptions and OG image | pending | R8, RI1 |
| Phase 7 - README restructure | pending | R5, RI1 |
| Phase 8 - Mermaid diagrams | pending | R9, RI1, RI2 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `fix/site-docs-remediation` | Clean — `git status --short --branch` shows no uncommitted changes; last commit `b5da6ff` (the approved plan). | No unrelated dirty state present at Phase 1 start. |

## Scope

- In scope (Phase 2): `site/uninstall.md`, `site/troubleshooting.md`, `site/updating.md` (new pages); `site/.vitepress/config.ts` sidebar entries under "Use it".
- Out of scope: any other page; no changes to `site/install.md` (R3's "or install-page section" alternative was not needed — a standalone Updating page reads better and keeps parity with the other two).

## Changed Files

- `bin/agentsmyth.mjs` — corrected the version-skew warning's false "re-stamp repo-profile.yaml" claim — IDs: R10
- `site/uninstall.md` — new page: repo-root cleanup, hook marker removal, `~/.agentsmyth/` shared-install caveat, broken-link failure mode — IDs: R1
- `site/troubleshooting.md` — new page: four scenarios (validator won't clear, agent doesn't pick up setup-bundle.md, hook rejecting a commit, version-skew warning) — IDs: R2
- `site/updating.md` — new page: no-auto-refresh behavior, manual `prepare` requirement, `definitions_root` stability, version-skew warning is informational — IDs: R3
- `site/.vitepress/config.ts` — added 3 sidebar entries under "Use it" (Updating, Troubleshooting, Uninstall and removal) — IDs: R1, R2, R3, RI2

## Implementation Log

- Replaced the false "re-stamp repo-profile.yaml" claim (`bin/agentsmyth.mjs:129`) with accurate text: `prepare` refreshes the global tree only, and the warning is informational/non-blocking. No behavior change — message text only, matching the brief's R10 requirement exactly.
- Wrote all three Phase 2 pages using the brief's R1/R2/R3 requirement text as the source of every factual claim (repo-root write list, hook marker format, `resolveValidator()` candidate-chain failure mode, `installGateSection`/`expandBundle` overwrite behavior, `init`'s printed next-step text) — no new claims invented beyond what the brief already grounded against `bin/agentsmyth.mjs`.
- Matched the site's existing prose style (confirmed against `site/setup.md`: short declarative sentences, occasional aphorism, `::: tip` sparingly, tables only where genuinely tabular) rather than introducing a new voice.
- Chose a standalone `site/updating.md` page over folding R3 into `site/install.md` (the plan's stated alternative) — parity with the other two new pages and a cleaner sidebar entry outweighed the alternative's slight discoverability benefit of living next to install instructions; `/updating` is linked from `/troubleshooting`'s version-skew answer either way.
- Cross-linked the three new pages to each other and to `/validators` where a claim depended on content documented elsewhere, rather than duplicating it.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R10 | `grep -n "re-stamp repo-profile.yaml" bin/agentsmyth.mjs` | zero hits |
| R10 | `npm run build` | passes, bundle unaffected (this file isn't part of the workflow bundle) |
| R1, R2, R3 | `npm run site:build` | passes, 3 new `.html` files produced |
| R1, R2, R3, RI2 | Sidebar entries | 3 new "Use it" entries present in built page site-data |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `grep -n "re-stamp repo-profile.yaml" bin/agentsmyth.mjs` | R10 | pass (zero hits, exit 1) | |
| `npm run build` | R10 | pass | `build-bundle: ok` |
| `grep -rln "re-stamp repo-profile\|version skew detected" test/` | R10 | pass (no hits) | confirmed no test suite depends on the old exact warning text |
| `npm run site:build` | R1, R2, R3 | pass | client+server bundles and page render both succeeded |
| `ls site/.vitepress/dist/ \| grep -E "uninstall\|troubleshooting\|updating"` | R1, R2, R3 | pass | all 3 `.html` files present |
| `grep -o "Uninstall and removal\|Troubleshooting\|Updating" site/.vitepress/dist/uninstall.html` | RI2 | pass | all 3 nav labels found embedded in built page output |

## Dispatch Log

none

## Architecture Notes

- role: Senior Engineer
- decision: Kept the fix to message text only, no behavior change — matches the brief's R10 scope exactly (a docs-adjacent CLI messaging bug, not a functional change).
- constraint: none new.
- tradeoff: none new.
- downstream: Review should confirm the new warning text doesn't overclaim either — it describes prepare's actual effect (global tree only) without implying any further automatic fix exists.
- decision (Phase 2): Standalone Updating page, not an install-page section — see Implementation Log.
- downstream (Phase 2): The nav-entry count is now 15 (12 baseline + 3 new pages) — Review/Ship should confirm this is recorded wherever WP-R11's original figure of 12 was tracked (RI2), so it doesn't go stale the same way the original figure did.

## Blockers

none

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Phase 1 - bin/agentsmyth.mjs warning fix | complete | 2026-07-26 | R10 verified via grep + build |
| Phase 2 - Three new "Use it" pages | complete | 2026-07-26 | R1, R2, R3 verified via site:build + dist inspection; nav count now 15 (was 12) |
