---
slug: site-docs-remediation-tier2-3
version: 1
artifact: task
status: in-progress
created: 2026-07-26
updated: 2026-07-26
manifest_ids: [R10, R1, R2, R3, R4, R6, R7, R8, RI1, RI2]
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

- Phase: Phase 6 - Per-page meta descriptions and OG image
- Manifest IDs: R8, RI1
- Exit gate: each page's rendered `<meta name="description">` differs from the site-wide default; an `og:image` meta tag exists in build output.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - bin/agentsmyth.mjs warning fix | complete | R10 |
| Phase 2 - Three new "Use it" pages | complete | R1, R2, R3, RI1, RI2 |
| Phase 3 - Footer LICENSE/CHANGELOG links | complete | R4, RI1 |
| Phase 4 - site/artifacts.md upstream-shape fix | complete | R6, RI1 |
| Phase 5 - /in-action disclaimer and example fix | complete | R7, RI1 |
| Phase 6 - Per-page meta descriptions and OG image | active | R8, RI1 |
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
- `site/.vitepress/config.ts` — added `themeConfig.footer` with links to `LICENSE` and `CHANGELOG.md` (GitHub blob URLs, since VitePress doesn't serve repo-root raw files as site pages) — IDs: R4
- `site/artifacts.md` — fixed example frontmatter's `upstream` field from an object (`brief:`/`plan:` keys) to the schema-correct array-of-strings form; also added the missing `status`/`created`/`updated` example fields (T-D14 sweep's minor finding, fixed opportunistically) — IDs: R6
- `site/in-action.md` — repositioned the "Illustrative walkthrough" disclaimer from an above-the-fold `::: warning` callout to a small line directly under the H1, keeping the fabrication label intact — IDs: R7
- `site/run-it.md` — changed the example scenario from "add rate limiting to the public API endpoints" (identical to `/in-action`'s) to "add pagination to the search results endpoint", updating both the initial example and the later "continue the X work" callback for internal consistency — IDs: R7
- All 15 `site/*.md` pages — added a distinct `description:` frontmatter field per page — IDs: R8
- `site/public/og-image.png` (new, 1200×630) — generated from `assets/brand/lockup-dark.svg` (the existing brand lockup: anvil-ring mark, "agentsmyth" wordmark, "FORGE, DON'T VIBE" tagline, all in the confirmed light ink `#F5F4F0`) composited onto the site's actual dark-theme background color `#0b0c0e` (confirmed via `site/.vitepress/theme/style.css:49`'s `--vp-c-bg`) — IDs: R8
- `site/.vitepress/config.ts` — added `og:image`/`og:image:width`/`og:image:height`/`twitter:image`/`twitter:card` meta tags pointing at the new OG image via its confirmed production URL (`https://jeelvankhede.github.io/agentsmyth/og-image.png`, confirmed via `gh api repos/JeelVankhede/agentsmyth/pages`) — IDs: R8

## Implementation Log

- Replaced the false "re-stamp repo-profile.yaml" claim (`bin/agentsmyth.mjs:129`) with accurate text: `prepare` refreshes the global tree only, and the warning is informational/non-blocking. No behavior change — message text only, matching the brief's R10 requirement exactly.
- Wrote all three Phase 2 pages using the brief's R1/R2/R3 requirement text as the source of every factual claim (repo-root write list, hook marker format, `resolveValidator()` candidate-chain failure mode, `installGateSection`/`expandBundle` overwrite behavior, `init`'s printed next-step text) — no new claims invented beyond what the brief already grounded against `bin/agentsmyth.mjs`.
- Matched the site's existing prose style (confirmed against `site/setup.md`: short declarative sentences, occasional aphorism, `::: tip` sparingly, tables only where genuinely tabular) rather than introducing a new voice.
- Chose a standalone `site/updating.md` page over folding R3 into `site/install.md` (the plan's stated alternative) — parity with the other two new pages and a cleaner sidebar entry outweighed the alternative's slight discoverability benefit of living next to install instructions; `/updating` is linked from `/troubleshooting`'s version-skew answer either way.
- Cross-linked the three new pages to each other and to `/validators` where a claim depended on content documented elsewhere, rather than duplicating it.
- Added `themeConfig.footer` (VitePress renders `message`/`copyright` via `v-html`, so real `<a>` tags work) linking `LICENSE` and `CHANGELOG.md` via their GitHub blob URLs, since VitePress's static build doesn't serve repo-root raw files as site routes.
- Fixed `site/artifacts.md`'s example `upstream` field per the completed T-D14 sweep's real finding — matches `src/workflow/schemas/artifact-frontmatter.schema.yaml`'s array-of-strings requirement and every real artifact on disk.
- Chose to change `run-it.md`'s example rather than `in-action.md`'s: `in-action.md`'s entire walkthrough narrative (7 gates, artifact filenames like `rate-limiting-v1.md`, findings specific to a rate limiter) is built around the rate-limiting scenario, while `run-it.md`'s use is incidental (one command-line example plus a callback). Changing the incidental one avoids rewriting a page's whole narrative for a duplication fix.
- Used `<small><em>...</em></small>` instead of VitePress's `::: warning` container for the repositioned disclaimer — the brief's R7 requirement asked for "a small line," and the warning container's visual weight (colored box, icon) is exactly the above-the-fold prominence being removed; plain small italic text reads as a footnote, not an alert.
- R8's OG image: no SVG-to-PNG rasterization tool was available in this environment (`rsvg-convert`, `imagemagick`, `sharp`, `resvg` all absent), and the auto-mode permission classifier initially blocked an unauthorized `npx sharp-cli` fetch as an unrequested external package install. Surfaced this to the user rather than shipping a broken SVG-as-`og:image` (most social platforms — Twitter/X, LinkedIn, Discord — don't render SVG for link previews) or silently skipping the requirement. User explicitly authorized a one-time `npx` invocation (no persisted devDependency). Composited a 1200×630 canvas from the existing, already-brand-approved `lockup-dark.svg` rather than designing new artwork — reuses a confirmed-correct asset instead of inventing new visual design mid-Build.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R10 | `grep -n "re-stamp repo-profile.yaml" bin/agentsmyth.mjs` | zero hits |
| R10 | `npm run build` | passes, bundle unaffected (this file isn't part of the workflow bundle) |
| R1, R2, R3 | `npm run site:build` | passes, 3 new `.html` files produced |
| R1, R2, R3, RI2 | Sidebar entries | 3 new "Use it" entries present in built page site-data |
| R4 | `npm run site:build` + grep footer href | both `LICENSE`/`CHANGELOG.md` links present, correct GitHub blob URLs |
| R6 | `grep -n "brief: workflow/artifacts" site/artifacts.md` | zero hits |
| R7 | Read `site/in-action.md`: disclaimer position + fabrication label presence | small text under H1, not a blocking callout; label present |
| R7 | Read `site/in-action.md` and `site/run-it.md`: example scenarios | differ (rate limiting vs. pagination) |
| R8 | `grep '<meta name="description"' site/.vitepress/dist/*.html` | each page's description differs from the site-wide default and from every other page |
| R8 | `grep 'og:image' site/.vitepress/dist/index.html` | present, points at the real deployed PNG URL |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `grep -n "re-stamp repo-profile.yaml" bin/agentsmyth.mjs` | R10 | pass (zero hits, exit 1) | |
| `npm run build` | R10 | pass | `build-bundle: ok` |
| `grep -rln "re-stamp repo-profile\|version skew detected" test/` | R10 | pass (no hits) | confirmed no test suite depends on the old exact warning text |
| `npm run site:build` | R1, R2, R3 | pass | client+server bundles and page render both succeeded |
| `ls site/.vitepress/dist/ \| grep -E "uninstall\|troubleshooting\|updating"` | R1, R2, R3 | pass | all 3 `.html` files present |
| `grep -o "Uninstall and removal\|Troubleshooting\|Updating" site/.vitepress/dist/uninstall.html` | RI2 | pass | all 3 nav labels found embedded in built page output |
| `npm run site:build` | R4 | pass | |
| `grep -o 'href="[^"]*LICENSE[^"]*"\|href="[^"]*CHANGELOG[^"]*"' site/.vitepress/dist/index.html` | R4 | pass | both hrefs point at confirmed-existing repo-root files (`LICENSE`, `CHANGELOG.md`); no live network fetch performed in this sandboxed environment to confirm HTTP 200, but URL construction is correct by direct file-existence check |
| `grep -n "brief: workflow/artifacts" site/artifacts.md` | R6 | pass (zero hits, exit 1) | |
| `npm run site:build` | R6 | pass | |
| `npm run site:build` | R7 | pass | |
| `grep -n "Illustrative walkthrough\|fabricated" site/in-action.md` | R7 | pass | disclaimer present as small under-H1 text, fabrication label intact |
| `grep -n "rate limiting\|pagination" site/run-it.md site/in-action.md` | R7 | pass | confirms the two pages no longer share an identical example scenario |
| `npx --yes sharp-cli -i og-image.svg -o og-image.png resize 1200 630` | R8 | pass | one-time invocation, user-authorized; output confirmed 1200×630 8-bit RGBA PNG via `file` |
| `npm run site:build` | R8 | pass | |
| Per-page `grep '<meta name="description"' site/.vitepress/dist/*.html` (all 15 pages) | R8 | pass | every page's description is distinct from the site-wide default and from every other page (spot-checked full list, not just a sample) |
| `grep -o 'property="og:image"[^>]*' site/.vitepress/dist/index.html` | R8 | pass | `content="https://jeelvankhede.github.io/agentsmyth/og-image.png"` |
| `gh api repos/JeelVankhede/agentsmyth/pages --jq '.html_url'` | R8 | pass | confirmed real production URL (`https://jeelvankhede.github.io/agentsmyth/`) before hardcoding it into `og:image` |

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
| Phase 3 - Footer LICENSE/CHANGELOG links | complete | 2026-07-26 | R4 verified via site:build + href grep |
| Phase 4 - site/artifacts.md upstream-shape fix | complete | 2026-07-26 | R6 verified via grep + site:build |
| Phase 5 - /in-action disclaimer and example fix | complete | 2026-07-26 | R7 verified via grep + manual read; fabrication label preserved, only position/example changed |
| Phase 6 - Per-page meta descriptions and OG image | complete | 2026-07-26 | R8 verified via site:build + full 15-page description check + og:image URL confirmation; OG image generation required user authorization for a one-time npx invocation after tooling was unavailable |
