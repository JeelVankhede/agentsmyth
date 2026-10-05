---
slug: site-docs-remediation-tier2-3
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-07-26
updated: 2026-07-26
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, RI1, RI2]
upstream:
  - workflow/artifacts/briefs/site-docs-remediation-tier2-3-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
---

# Site docs remediation (Tiers 2 + 3) - Plan

## Summary

Eight phases: one isolated `bin/agentsmyth.mjs` fix, three new "Use it" pages, one quick footer-link addition, one small factual-drift fix, one `/in-action` repositioning fix, one metadata pass, one README restructure, and one diagram pass (last, since it needs a new build-time dependency wired in). Sequenced so small, independent phases land first and the two largest, most interconnected phases (README restructure, diagrams) land last.

## Inputs

- `workflow/artifacts/briefs/site-docs-remediation-tier2-3-v1.md` (approved; Q1 resolved: Mermaid)
- Current `site/.vitepress/config.ts` sidebar/nav structure (confirmed by direct read): "Start here" (3 items), "Use it" (3 items: Install, Run it, Setup), "How it works" (5 items), "See it whole" (1 item) — 12 total, matching the brief's cited WP-R11 baseline.
- No Mermaid support currently configured (`grep -rn mermaid package.json site/.vitepress/config.ts` — zero hits); VitePress 1.6.4 has no built-in Mermaid renderer, so R9 requires adding a markdown-it-based Mermaid plugin as a **site-build-only devDependency** (e.g. `vitepress-plugin-mermaid` + `mermaid`) — this is separate from and does not violate the repo's CLI zero-runtime-dependency golden rule (that rule scopes the shipped npm package, `vitepress` itself is already a devDependency for the same reason).

## Requirement Coverage

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R10 | Phase 1 | Isolated `bin/agentsmyth.mjs` fix, no docs dependency |
| R1 | Phase 2 | Uninstall page |
| R2 | Phase 2 | Troubleshooting page |
| R3 | Phase 2 | Updating page/section |
| R4 | Phase 3 | Footer LICENSE/CHANGELOG links |
| R6 | Phase 4 | `site/artifacts.md` upstream-shape fix |
| R7 | Phase 5 | `/in-action` disclaimer + example fix |
| R8 | Phase 6 | Meta descriptions + OG image |
| R5 | Phase 7 | README restructure |
| R9 | Phase 8 | Mermaid diagrams (needs Phase 8's own devDependency addition) |
| RI1 | Every phase | Diff checked against "Do not touch" list before each phase's commit |
| RI2 | Phase 2 (nav count), Phase 8 (final `site:build` confirmation) | Nav count updated when Phase 2 lands; final build check closes it out |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `bin/agentsmyth.mjs` | modify | R10 | One warning-message string, line 129 |
| `site/uninstall.md` | create | R1 | New page |
| `site/troubleshooting.md` | create | R2 | New page |
| `site/updating.md` (or a new section in `site/install.md`) | create/modify | R3 | Plan defers final placement to Build; page form preferred for sidebar discoverability unless Build finds compelling reason to fold into install.md |
| `site/.vitepress/config.ts` | modify | R1, R2, R3, R4, R8, R9 | Sidebar entries for 3 new pages; footer config; OG image `head` tag; Mermaid plugin wiring |
| `LICENSE`, `CHANGELOG.md` | read-only reference | R4 | Linked, not modified |
| `site/artifacts.md` | modify | R6 | `upstream` example shape fix; optionally the missing example fields |
| `site/in-action.md` | modify | R7 | Disclaimer reposition |
| `site/run-it.md` or `site/in-action.md` | modify | R7 | Whichever page keeps the rate-limiting example; the other gets a new example |
| `site/*.md` (all pages) | modify | R8 | Per-page `description` frontmatter |
| `README.md` | modify | R5 | Full restructure |
| `site/under-hood.md` | modify | R9 | Both diagrams (source-of-truth hierarchy; global-tree-vs-repo split) |
| `site/<TBD second page>` | modify | R9 | Second location for the global-tree-vs-repo split diagram, Build selects the best fit (likely `/install` or `/setup`) |
| `package.json` | modify | R9 | New devDependency for Mermaid rendering |

No `src/workflow/`, `src/setup/`, or schema files touched — `bin/agentsmyth.mjs` (R10) is the only non-docs/non-config file in scope, and it's a single-line message string.

## Source-of-Truth Strategy

Every requirement's factual claims are already anchored in the brief against direct source reads (`bin/agentsmyth.mjs` line numbers, `src/workflow/schemas/artifact-frontmatter.schema.yaml`, real artifacts on disk). Plan does not re-derive any of it; Build applies the brief's findings verbatim, the same discipline Tier 1 (`site-docs-remediation-v1`) already established.

## Approach

Land the smallest, most independent phases first (R10, then the Tier 2 new pages, then the quick R4/R6/R7 fixes), so each is individually reviewable and none blocks the others. Save R5 (README restructure, the largest content rewrite) and R9 (diagrams, the only phase needing a new dependency) for last, since both touch the most surface area and benefit from the rest of the site already being in its final Tier 2/3 shape before final polish.

## Phases

### Phase 1 - `bin/agentsmyth.mjs` version-skew warning fix

- **Manifest IDs:** R10
- Touches: `bin/agentsmyth.mjs` (line ~129, the version-skew warning message)
- Work: Replace the false "re-stamp repo-profile.yaml" claim with accurate text describing that `prepare` refreshes only the global tree, and that the warning itself is informational (not something `prepare` alone resolves).
- **Exit gate:** `grep -n "re-stamp repo-profile.yaml" bin/agentsmyth.mjs` returns zero hits; `npm run build` still passes (bundle unaffected, this file isn't part of the workflow bundle).

### Phase 2 - Three new "Use it" pages (Tier 2 core)

- **Manifest IDs:** R1, R2, R3, RI1, RI2 (nav count)
- Touches: `site/uninstall.md` (new), `site/troubleshooting.md` (new), `site/updating.md` (new, or a new section in `site/install.md` if Build finds that reads better), `site/.vitepress/config.ts` (sidebar entries under "Use it")
- Work: Write all three per the brief's R1/R2/R3 requirement text verbatim (repo-root cleanup + hook marker removal + shared-install caveat + broken-link failure mode; the four troubleshooting scenarios without repeating R10's pre-fix wording; the no-auto-refresh + manual-`prepare` + stable-`definitions_root` update story). Add sidebar entries; update the nav-entry count tracked wherever WP-R11's original 12 was recorded.
- **Exit gate:** all three pages render; sidebar shows 3 new entries under "Use it" (or 2 new pages + 1 install-page section, if Build folds Updating in); `npm run site:build` passes.

### Phase 3 - Footer LICENSE/CHANGELOG links

- **Manifest IDs:** R4, RI1
- Touches: `site/.vitepress/config.ts` (`themeConfig.footer`)
- Work: Add a `footer` config linking `LICENSE` and `CHANGELOG.md` (GitHub-hosted URLs, since VitePress's own footer doesn't serve raw repo-root files as site pages).
- **Exit gate:** both links present in rendered output, resolve without a 404 (verified by URL construction against the GitHub repo, not a live network fetch in this sandboxed environment — Build records this as the verification method).

### Phase 4 - `site/artifacts.md` upstream-shape fix

- **Manifest IDs:** R6, RI1
- Touches: `site/artifacts.md` (lines 32-44)
- Work: Change the example frontmatter's `upstream:` from the object-keyed form (`brief:`, `plan:`) to the schema-correct array-of-strings form; optionally add the missing `status`/`created`/`updated` example fields.
- **Exit gate:** `grep -n "brief: workflow/artifacts" site/artifacts.md` returns zero hits; the example's `upstream` field matches the array shape used in real artifacts.

### Phase 5 - `/in-action` disclaimer and example fix

- **Manifest IDs:** R7, RI1
- Touches: `site/in-action.md`, and either `site/in-action.md` or `site/run-it.md` (whichever loses the shared rate-limiting example)
- Work: Move the "Illustrative walkthrough" callout from above-the-fold to a small line under the H1 or the page footer, keeping the fabrication label intact (Do-Not-Touch). Change one of the two pages' example scenario so `/in-action` and `/run-it` no longer share an identical one.
- **Exit gate:** disclaimer no longer renders as a blocking above-the-fold callout; the fabrication label still present; the two pages' example scenarios differ.

### Phase 6 - Per-page meta descriptions and OG image

- **Manifest IDs:** R8, RI1
- Touches: every page under `site/` (frontmatter `description` field), `site/.vitepress/config.ts` (`head`, OG image tag), `site/public/og-image.png` (new OG image asset)
- Work: Add a distinct `description` frontmatter value per page (including the three new Phase 2 pages). Add an OG image asset and its `head` meta tags.
- **Exit gate:** each page's rendered `<meta name="description">` differs from the site-wide default; an `og:image` meta tag exists in build output.

### Phase 7 - README restructure

- **Manifest IDs:** R5, RI1
- Touches: `README.md`
- Work: Reorder per the brief's R5 spec — lockup, tagline, badges (npm version, MIT, node >=18), doc-site link, compressed three-questions hook, "What it refuses to be" (verbatim, Do-Not-Touch), install, then repo-internals content under a renamed `## Development` heading (replacing `## Project Knowledge`).
- **Exit gate:** README opens with pitch content, not a `src/` path inventory; "What it refuses to be" bullets present verbatim; `## Project Knowledge` no longer exists under that name; diff review confirms no Do-Not-Touch line was altered, only relocated.

### Phase 8 - Mermaid diagrams

- **Manifest IDs:** R9, RI1, RI2 (final build confirmation)
- Touches: `package.json` (new devDependency), `site/.vitepress/config.ts` (Mermaid plugin wiring), `site/under-hood.md` (both diagrams), one additional page (Build selects, likely `/install` or `/setup`) for the global-tree-vs-repo split diagram
- Work: Add a Mermaid rendering plugin compatible with VitePress 1.6.4 (Build confirms exact package and wiring at implementation time — this plan does not pre-select a specific npm package version). Add the source-of-truth hierarchy diagram and the global-tree-vs-repo split diagram, both visualizing only already-true, already-documented relationships.
- **Exit gate:** both diagrams render correctly in `npm run site:build` output; neither introduces a claim absent from existing site prose; full site build passes — this is also RI2's final confirmation point for the whole plan.

## Dependency Order

Phase 1 is fully independent. Phases 2-6 are independent of each other and of Phase 1. Phase 7 (README) is independent of Phases 1-6 but should land after Phase 3 (footer links) if the restructured README's doc-site link section wants to reference the same LICENSE/CHANGELOG links for consistency — not a hard dependency, just a sequencing preference. Phase 8 (diagrams) depends on Phase 2 (the "Use it" pages must exist before the global-tree-vs-repo diagram's second placement can be chosen from real candidates) and is otherwise last because it's the only phase introducing new tooling.

## Branch Strategy

Continue on `fix/site-docs-remediation`, per explicit user instruction this session ("Continue on the same branch for them"). This branch already carries Tier 1's shipped commits (PR #51, not yet merged) plus this session's reconciliation and exemplar/fixture fixes. Before Build starts each phase, re-confirm `git status`/branch state per `lifecycle-build`'s own entry requirements, since this branch has had substantial commit activity this session.

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|
| PR #51 (Tier 1, same branch) still unmerged when Tier 2/3 work lands | Medium | Low | Both tiers are additive and don't conflict at the file level (Tier 1 touched README/install/setup/validators/logo/config.ts's `logo` key only; Tier 2/3 touches different sections of some of the same files) — Build should diff-check for overlap before each phase, not assume none exists | agent | all |
| R9's Mermaid plugin choice turns out incompatible with VitePress 1.6.4 or the site's existing build pipeline | Low | Medium | Build phase 8 verifies compatibility via an actual `npm run site:build` before committing to the choice; plan deliberately doesn't pre-commit to a specific package so Build can pick whatever's confirmed working | agent | R9 |
| R5's README restructure accidentally drops or paraphrases Do-Not-Touch content during reordering | Low | High | Exit gate explicitly requires a diff review confirming relocation, not deletion or paraphrase, of every Do-Not-Touch block | agent | R5, RI1 |
| R3's "new page or install-page section" choice affects R9's Phase 8 placement decision for the second diagram | Low | Low | Phase 2 resolves R3's placement before Phase 8 starts (dependency order above already sequences this correctly) | agent | R3, R9 |

## Verification Plan

| Manifest ID | Verification method | Command / Scenario |
|---|---|---|
| R10 | Command | `grep -n "re-stamp repo-profile.yaml" bin/agentsmyth.mjs` → zero hits |
| R1, R2, R3 | Manual QA + Command | Read all three pages against the brief's requirement text; `npm run site:build` → sidebar shows the new entries |
| R4 | Manual QA | Read rendered footer; confirm both link URLs point at the correct GitHub paths |
| R6 | Command | `grep -n "brief: workflow/artifacts" site/artifacts.md` → zero hits |
| R7 | Manual QA | Read both `/in-action` and `/run-it`; confirm disclaimer position and differing examples |
| R8 | Manual QA + Command | Spot-check several pages' rendered `<meta name="description">`; confirm `og:image` tag present in build output |
| R5 | Manual QA | Read restructured README top-to-bottom against the brief's spec; diff review against Do-Not-Touch list |
| R9 | Command + Manual QA | `npm run site:build` renders both diagrams without error; visual read of the rendered Mermaid output for correctness against existing prose |
| RI1 | Manual QA | Diff review against Notion "Do not touch" list, per phase, not just once at the end |
| RI2 | Command | Final `npm run site:build` after Phase 8 exits 0; nav-entry count matches what Phase 2 recorded |

After all eight phases: `npm run build` (bundle, confirms Phase 1's `bin/agentsmyth.mjs` change didn't break anything) and `npm run site:build` (full site) must both still pass.

## Architecture Notes

- role: Architect
- decision: R9 (diagrams) is sequenced last specifically because it's the only phase introducing a new devDependency — isolating tooling risk to the final phase means Phases 1-7 can ship independently even if Mermaid integration hits an unexpected snag.
- constraint: R9's new devDependency is scoped to `site/`'s build tooling only, not the shipped npm package — does not conflict with the repo's CLI zero-runtime-dependency golden rule.
- tradeoff: Grouping R1/R2/R3 into one Phase 2 (rather than three separate phases) trades some Build-phase granularity for fewer total phases, since all three are the same shape of work (new "Use it" page) with no cross-dependency risk between them.
- downstream: Review should confirm Phase 7's README diff is purely a reorder-and-rename, not a rewrite, of any Do-Not-Touch content. Ship should note this branch's PR #51 (Tier 1) merge status before deciding whether Tier 2/3 becomes a second PR against `main` or an update to the still-open #51.
- amendment (2026-07-26, during Build Phase 6): Touches list updated to explicitly name `site/public/og-image.png` — an implementation detail always implied by "OG image asset" but not spelled out as a path at Plan time. No requirement, scope, or approved checkpoint changed; `check-scope-fence` flagged the unnamed path and this amendment resolved it without needing a waiver.

## Open Questions

None — Q1 was resolved in the brief before Plan began.

## Checkpoint Approval

- Checkpoint: plan-review
- Status: approved
- User's own words (verbatim, this turn): "Yes, approved"

## Exit Gate

- [x] Every active R and RI from the brief appears in Requirement Coverage, Phases, and Verification Plan.
- [x] User approved or waiver recorded (see Checkpoint Approval above).
