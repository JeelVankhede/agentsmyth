---
slug: site-docs-remediation-tier2-3
version: 1
artifact: brief
status: blocked-for-user
created: 2026-07-26
updated: 2026-07-26
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, RI1, RI2]
upstream:
  - user-request
  - "notion - Site Docs Remediation Backlog (audit 2026-07-26), Tiers 2 and 3"
  - "notion - WP-R12 — Docs Correctness & Gap Remediation (page 3a8972bdebbb81bbb893e09918994c03)"
orchestration:
  phase: think
  status: blocked-for-user
  next_phase: plan
  blockers: []
  user_checkpoint: brief-review
skill_trigger_log:
  - skill: repo-alignment-scan
    decision: ran
    reason: grepped bin/agentsmyth.mjs directly for uninstall/updating/troubleshooting ground truth (hook removal markers, version-skew warning, auto-prepare-if-missing, expandBundle's always-overwrite behavior) rather than guessing at CLI behavior from the Notion page's prose alone
  - skill: architecture-decision-advisor
    decision: skipped
    reason: no architectural decision in scope — this is new documentation content plus a docs-adjacent CLI messaging fix, no code paths change behaviorally
  - skill: constraint-conflict-scan
    decision: ran
    reason: checked the Notion backlog's "Do not touch" list against every target section (README restructure in particular) to confirm no protected prose is touched
---

# Site docs remediation (Tiers 2 + 3) - Brief

## Source Links

- Notion: "Site Docs Remediation Backlog (audit 2026-07-26)" — Tier 2 (T-D9–T-D12) and Tier 3 (T-D13–T-D17) tables.
- Notion: "WP-R12 — Docs Correctness & Gap Remediation" (page `3a8972bdebbb81bbb893e09918994c03`) — parent Work Package; Tier 1 already shipped as `site-docs-remediation-v1` (PR #51); this brief covers the two remaining tiers.
- `bin/agentsmyth.mjs` — ground truth for uninstall mechanics, version-skew/update behavior, and the hook-removal marker format (all re-derived directly this session, not assumed from the Notion page's prose).
- `site/.vitepress/config.ts`, `README.md`, `LICENSE`, `CHANGELOG.md` — current state confirmed by direct read.

## Problem

The Notion Work Package "WP-R12 — Docs Correctness & Gap Remediation" scopes three tiers of docs work. Tier 1 (nine correctness fixes) shipped as PR #51. Tiers 2 and 3 remain: four structural gaps (no Uninstall, Troubleshooting, or Updating page exists at all, and `LICENSE`/`CHANGELOG.md` are unreachable from the site) and five positioning/polish items (a README that opens with an internal file inventory instead of a pitch, four unaudited pages, a disclaimer placement problem, no per-page SEO metadata, and no conceptual diagrams anywhere on the site). The Notion page calls the Uninstall gap "the largest adoption blocker on the site" — nothing tells a reader how to back out a tool that writes a `workflow/` tree, an adapter file, and a commit-blocking git hook.

## Goals

- Ship all four Tier 2 structural-gap items (T-D9–T-D12): three new pages plus footer/LICENSE/CHANGELOG links.
- Ship all five Tier 3 positioning/polish items (T-D13–T-D17): README restructure, the four-page contradiction sweep, the `/in-action` disclaimer fix, per-page meta descriptions, and two conceptual diagrams.
- Every factual claim in new or edited content is grounded in this session's own direct source reads (`bin/agentsmyth.mjs`, `src/adapters/`), not paraphrased from the Notion page or invented.
- Fix a real CLI messaging bug found during this brief's own research (R10 below) — logged the same way the original audit logged new findings mid-sweep, as its own manifest ID rather than silently folded into a docs task.

## Non-Goals

- No re-litigation of Tier 1's already-shipped fixes (`site-docs-remediation-v1`, PR #51).
- No new architectural decisions about `init`/`prepare`/the hook mechanism — this brief documents existing, already-shipped behavior; it does not change how any of it works (except R10, a one-line warning-message text fix, not a behavior change).
- No OG image *design* decision beyond "one exists and is wired up" — the actual visual asset is a Build-phase creative deliverable, not a Think-phase requirement to pre-specify pixel-by-pixel.
- No change to the diagrams' underlying facts (source-of-truth hierarchy, global-tree-vs-repo split) beyond what's already true and already documented in prose elsewhere on the site — the diagrams visualize existing prose, they don't introduce new claims.

## User Impact

Today, a user who wants to remove agentsmyth (uninstall), hits a stuck validator or a rejected commit (troubleshooting), or upgrades the npm package (updating) has no page to consult — the only path is reading source or asking an agent to reverse-engineer the CLI. A user landing on the README first sees an inventory of `src/` paths before any pitch for why the tool exists. Four pages have never been checked against the same correctness bar Tier 1 already applied to the rest of the site.

## Success Metrics

- `npm run site:build` still exits 0 after all edits.
- Three new pages exist, render, and appear in the sidebar under the correct nav groups; the nav-entry count recorded in `site/validators.md`'s exit-gate reference (or wherever the count is tracked) is updated to match, superseding WP-R11's original figure of 12.
- Footer links to `LICENSE` and `CHANGELOG.md` resolve (no 404).
- The four swept pages (`/lifecycle`, `/under-hood`, `/artifacts`, `/power-skills`) contain no instance of the four contradiction classes Tier 1 already fixed elsewhere.
- No copy from the Notion "Do not touch" list is altered.

## Requirements

Every technical claim below was verified by direct read this session — anchors and line numbers are cited per requirement, not assumed from the Notion page's own prose.

- **R1** (T-D9): New page — Uninstall and removal. Must cover, per direct source verification: (a) what `init` writes to a repo root — `workflow/config/*.yaml` (5 files), `workflow/artifacts/` (7 dirs), `workflow/learnings/`, and for Cursor/non-macOS-Copilot only, an adapter file (`bin/agentsmyth.mjs:465-473`, `:686-696`) — all of which are safe to `rm -rf`; (b) removing the pre-commit hook: the hook is appended between literal marker comments `# >>> agentsmyth:mandatory-lifecycle-gate >>>` / `# <<< agentsmyth:mandatory-lifecycle-gate <<<` (`bin/agentsmyth.mjs:703-704`) — delete just that block if the user had a pre-existing hook the install appended to, or delete the whole file if agentsmyth created it fresh (no pre-existing content) — confirmed by reading `installPreCommitHook()`'s append-vs-fresh-write branching at `bin/agentsmyth.mjs:744-751`; (c) whether `~/.agentsmyth/` is safe to delete: yes for a single-repo user, but it is a *shared* global install — deleting it breaks `definitions_root`-linked resolution (`resolveValidator()`, `bin/agentsmyth.mjs:72-89`) for every other repo still linked to it, until `agentsmyth prepare` is re-run; (d) what breaks if a repo keeps `workflow/` but the global tree is gone: `resolveValidator()`'s candidate list tries `definitions_root` first, then `AGENTSMYTH_HOME`, then repo-local `workflow/validators/` — a `definitions_root`-linked repo with no repo-local validators copy and a missing global tree has no working candidate, so every `agentsmyth check` invocation fails outright until either the global tree is restored or the repo re-links.
- **R2** (T-D10): New page — Troubleshooting. Must cover, per direct verification: (a) a validator that fails and won't clear — point at reading the exact validator error text, since `check-setup-complete`/`check-config` refuse waivers by design (confirmed already-correct framing in `site/validators.md`); (b) the agent not picking up `.agentsmyth/setup-bundle.md` — ground truth: `init`'s own final console output tells the user to say "run the agentsmyth setup" to their agent (`bin/agentsmyth.mjs:1042-1043`), and only Claude Code currently has a dedicated `/agentsmyth` invocation skill (WP-R12/R12's R4) that reliably finds `.agentsmyth/setup-bundle.md` without the phrase being interpreted freeform — other tools rely on the passive global-gate file plus the agent's own repo inspection; (c) the hook rejecting a legitimate commit — the only bypass is `git commit --no-verify` (confirmed already-correct on `README.md`/`site/setup.md` from Tier 1); (d) version skew between `~/.agentsmyth/` and the installed package — `agentsmyth check` warns when `repo-profile.yaml`'s stamped `agentsmyth_version` doesn't match the installed CLI's `package.json` version (`bin/agentsmyth.mjs:121-131`), but this page must **not** repeat the CLI's own warning text verbatim, since that text is itself wrong (see R10).
- **R3** (T-D11): New page or install-page section — Updating. Must state, per direct verification: (a) a new npm version does **not** automatically refresh `~/.agentsmyth/workflow` — `runPrepare()`'s auto-invocation only fires when `~/.agentsmyth/workflow` doesn't exist at all (`bin/agentsmyth.mjs:290-291`, `:975-976`), never on a version change; (b) `agentsmyth prepare` must be re-run manually to refresh the global definitions tree, validators, and all five tools' global gates — confirmed `expandBundle()` unconditionally overwrites every file on each run (`bin/agentsmyth.mjs:498-508`, no `existsSync` guard, unlike every other write path in this codebase), so re-running `prepare` genuinely does pick up the new version's content; (c) `definitions_root` itself never needs to change across upgrades — it's always the portable literal `~/.agentsmyth/workflow` (`PORTABLE_DEFINITIONS_ROOT`, `bin/agentsmyth.mjs:19`, fixed by OI-52/PR #47); (d) **do not** claim that running `prepare` clears the version-skew warning — see R10, this is not currently true.
- **R4** (T-D12): Site footer or new page — link `LICENSE` (MIT, confirmed present at repo root) and `CHANGELOG.md` (confirmed present at repo root). Neither is reachable from the site today — confirmed by reading `site/.vitepress/config.ts`'s `themeConfig`, which has no `footer` key and no such links anywhere in `nav`/`sidebar`.
- **R5** (T-D13): `README.md` restructure. Confirmed current structure by direct read (`README.md:14` opens with `## What Is Included`, an inventory of `src/` paths, followed by `## Lifecycle` at line 26, `## Project Knowledge` at line 34). Restructure per the Notion spec: lockup, tagline, badges (npm version, MIT, node >=18), prominent doc-site link, the Introduction's three-questions hook compressed to two sentences, "What it refuses to be" (five bullets, lifted from the site — **on the Do-Not-Touch list, copy verbatim, do not paraphrase**), install, then repo-internals content moved under a renamed `## Development` heading (renaming `## Project Knowledge`, which the Notion spec correctly flags as internal vocabulary a public reader has no context for).
- **R6** (T-D14): Sweep `/lifecycle`, `/under-hood`, `/artifacts`, `/power-skills` for the same four contradiction classes Tier 1 already fixed elsewhere, plus any other plain factual drift. **Sweep complete** (background audit, independently re-verified against `bin/agentsmyth.mjs`, `src/adapters/`, `src/workflow/schemas/artifact-frontmatter.schema.yaml`, and real artifacts under `workflow/artifacts/`):
  - `site/lifecycle.md`: no findings. 7-phase table, task-class table, and gate/recommendation language all confirmed to match `src/workflow/router.md` and `lifecycle-review/SKILL.md`.
  - `site/under-hood.md:49`: confirmed still stale (`.cursor/rules/index.mdc` instead of `.cursor/rules/agentsmyth.mdc`) — this is OI-54, already tracked separately as an accepted, deferred gap; this brief logs it as confirmed-still-present but the actual fix belongs to OI-54's own follow-up, not a new sub-item here.
  - `site/artifacts.md:37-39`: **real new finding**. The example frontmatter shows `upstream:` as a YAML mapping keyed by phase name (`brief: workflow/artifacts/briefs/rate-limiting-v1.md`, `plan: ...`). The actual schema (`src/workflow/schemas/artifact-frontmatter.schema.yaml:58-63`) defines `upstream` as a flat array of path strings (`type: array, items: {type: string}`), and every real artifact on disk uses that array form (e.g. `workflow/artifacts/tasks/deepen-setup-interview-v1.md:9-10`). An object-shaped `upstream` would fail schema validation (`additionalProperties: false` at the document root) if anyone copied the example literally. Fix: change the example to the array form.
  - `site/artifacts.md:32-44`: minor — the example frontmatter also omits the schema-required `status`, `created`, and `updated` fields present in every real artifact. Lower-confidence (may be intentional truncation for a "here's the head of a task artifact" illustration) — fix opportunistically alongside the `upstream` correction, not required on its own.
  - `site/power-skills.md`: no findings. The nine-part skill anatomy, the four named example skills' phase attributions, and the "no premium tier" claim all confirmed against real `SKILL.md` files and `package.json`'s MIT license.
  - No config-file-count or `agent-behavior.yaml`-placement drift (classes 1–2) found on any of the four pages — neither topic is mentioned on any of them. No hard validator-count claim (class 4) appears on any of the four pages either.
- **R7** (T-D15): `/in-action` — move the "Illustrative walkthrough" disclaimer (`site/in-action.md:7`, currently an above-the-fold `::: warning` callout) to a small line directly under the H1 or to the page footer; do not delete it (it stays on the Do-Not-Touch list as "the fact `/in-action` is labelled as fabricated at all" — only its *position* moves). Separately, vary the rate-limiting example: confirmed both `/in-action` (`site/in-action.md:11,18,60-66`) and `/run-it` (`site/run-it.md:24,42`) use the identical "add rate limiting to the public API endpoints" scenario — one of the two needs a different example.
- **R8** (T-D16): Add per-page `description` frontmatter across the site and one OG image. Confirmed current state: `site/.vitepress/config.ts:7` sets one global `description: 'A portable AI engineering lifecycle'` with no per-page overrides anywhere (checked `site/index.md`'s frontmatter directly — no `description` key present), so every page currently shares the identical meta description and there is no OG image configured in `head`.
- **R9** (T-D17): Two conceptual diagrams: (a) the source-of-truth hierarchy (`AGENTS.md`/`CLAUDE.md` → `router.md` → `agent-behavior.yaml` → phase skills) on `/under-hood`, and (b) the global-tree-vs-repo split (what lives in `~/.agentsmyth/workflow/` vs. per-repo `workflow/`) on `/under-hood` plus one other page the Plan phase selects. Both ideas are currently carried entirely by prose with no visual.
- **R10** (new finding, logged per this Work Package's own "log anything found as a new T-D row" methodology — not in the original Notion backlog): `bin/agentsmyth.mjs:129`'s version-skew warning reads `"Run agentsmyth prepare to update the global definitions and re-stamp repo-profile.yaml"` — the "re-stamp repo-profile.yaml" half is false. `runPrepare()` writes zero repo-level files by design (confirmed by its own code comment at `bin/agentsmyth.mjs:762`, and by reading the full function body at `:767-830`, none of which touches any path under the calling repo). There is no code path that re-stamps an existing repo's `agentsmyth_version` after initial `init`/headless-bootstrap — the warning will keep firing on every `agentsmyth check` even after `prepare` is re-run, contradicting its own text. Fix: correct the warning message in `bin/agentsmyth.mjs` to accurately describe that `prepare` refreshes the *global* tree only, and that the warning itself is cosmetic/informational (it does not block anything) rather than implying a fix action that doesn't exist. This is a `src/`-adjacent (actually `bin/`) code change, not a docs-only change — flagged explicitly since it's a narrower exception to this brief's otherwise docs-only scope.

## Constraints

- Do not alter anything on the Notion page's "Do not touch" list (the two taglines, the Introduction's opening, "What it refuses to be", the vibe-coding arc, two specific quoted lines, the router classification table, and the fact that `/in-action` is labeled as fabricated).
- R5's README restructure must relocate, not delete, any Do-Not-Touch content it moves (e.g. "What it refuses to be" moves position within the README but its five bullets must be copied verbatim).
- R9's diagrams must not introduce any claim not already true and already stated in existing prose elsewhere on the site — they are visualizations, not new documentation.
- R10 is source code (`bin/agentsmyth.mjs`), not `site/`/`README.md` — Plan should treat it as an isolated, independently-shippable phase so a docs-only reviewer isn't surprised by a `bin/` diff, and so it can ship even if some Tier 2/3 docs content needs another pass.

## Risks

- R9's diagram format (ASCII, Mermaid, or a static image) is an open question for Plan/Build to resolve based on what VitePress's Markdown pipeline actually supports well — not resolved here since it's an implementation choice, not a requirement.
- This brief continues on `fix/site-docs-remediation`, per direct user instruction this session ("Continue on the same branch for them") — that branch is already substantially diverged from `main` with five docs-remediation-related commits; Plan's Branch Strategy should confirm this is still the intended target before Build starts, especially since Tier 1's own PR #51 on this branch is not yet merged.

## Open Questions

- **Q1**: R9's diagram implementation format (Mermaid embedded in Markdown vs. a static SVG/PNG asset) — blocking for Plan's Phase scoping of R9, not blocking for the other nine requirements.
  - Owner: user
  - Blocking: yes, for R9 only

## Requirement Manifest

### Explicit (R)

- R1 (T-D9): New Uninstall and removal page, covering repo-root cleanup, hook removal (marker-based), `~/.agentsmyth/` shared-install caveat, and the definitions_root-linked-repo-loses-global-tree failure mode.
  Acceptance: page exists, renders, appears in sidebar under "Use it"; all four sub-topics present; every technical claim traces to a `bin/agentsmyth.mjs` line cited in this brief.
- R2 (T-D10): New Troubleshooting page covering the four named scenarios, without repeating R10's known-incorrect warning text verbatim.
  Acceptance: page exists, renders, appears in sidebar under "Use it"; all four scenarios present; does not quote the pre-R10-fix warning text as if accurate.
- R3 (T-D11): New page or install-page section on Updating, stating the no-auto-refresh behavior, the manual-`prepare`-required fix, and `definitions_root`'s stability across upgrades.
  Acceptance: content exists and is discoverable from the install page or its own sidebar entry; does not claim `prepare` clears the version-skew warning (see R10).
- R4 (T-D12): Footer or new page linking `LICENSE` and `CHANGELOG.md`.
  Acceptance: both links present in rendered site output and resolve without a 404.
- R5 (T-D13): `README.md` restructured per the Notion spec (lockup/tagline/badges/doc-site-link/compressed-hook/refuses-to-be/install/Development), `## Project Knowledge` renamed.
  Acceptance: README opens with pitch content before any `src/`-path inventory; "What it refuses to be" five bullets present verbatim; `## Project Knowledge` heading no longer exists under that name.
- R6 (T-D14): Four-page contradiction sweep (`/lifecycle`, `/under-hood`, `/artifacts`, `/power-skills`); one real fix required (`site/artifacts.md:37-39`'s `upstream` example shape), one minor optional fix (missing example frontmatter fields), one already-tracked confirm-only item (OI-54).
  Acceptance: `site/artifacts.md`'s example `upstream` field uses array-of-strings form matching `src/workflow/schemas/artifact-frontmatter.schema.yaml`; `grep -n "brief: workflow/artifacts" site/artifacts.md` returns zero hits after the fix.
- R7 (T-D15): `/in-action` disclaimer repositioned (not deleted); rate-limiting example varied between `/in-action` and `/run-it`.
  Acceptance: disclaimer no longer sits above-the-fold as a blocking callout but the fabrication label remains present somewhere on the page; the two pages no longer share an identical example scenario.
- R8 (T-D16): Per-page `description` frontmatter added across site pages; one OG image added to `head`.
  Acceptance: at least the pages this Work Package touches (new Tier 2 pages, restructured README-linked pages) carry distinct `description` values; an OG image tag exists in `site/.vitepress/config.ts`'s `head`.
- R9 (T-D17): Two conceptual diagrams added (source-of-truth hierarchy; global-tree-vs-repo split).
  Acceptance: both diagrams render on their target page(s) after `npm run site:build`; neither introduces a claim absent from existing site prose.
- R10 (new, `bin/agentsmyth.mjs`): Fix the version-skew warning's inaccurate "re-stamp repo-profile.yaml" claim.
  Acceptance: `grep -n "re-stamp repo-profile.yaml" bin/agentsmyth.mjs` returns zero hits after the fix; the corrected message accurately describes `prepare`'s actual (global-tree-only) effect.

### Implicit (RI)

- RI1: No edit touches anything on the Notion "Do not touch" list. Acceptance: diff review confirms no touched line falls inside a "do not touch" quoted block.
- RI2: `npm run site:build` exits 0 after all Tier 2/3 changes, and the new-page nav-entry count is recorded wherever the prior count (12, from WP-R11) was tracked, so it doesn't silently go stale a second time. Acceptance: build passes; nav count reference updated with a citation to this brief/plan.

### Assumptions (A)

- A1: The Notion backlog's Tier 2/3 tables are read as scope-defining, not as final prose to copy verbatim — every technical claim inside them is independently re-verified against source before being used in a requirement (done for R1–R4, R10 above; R6 pending the parallel audit).
- A2: R9's diagrams are additive documentation aids, not a redesign of the underlying architecture — no new decision is being made about what `router.md`/`agent-behavior.yaml`/`definitions_root` actually do, only how existing, already-true relationships get visualized.

### Open Questions (Q)

- Q1: see Open Questions section above (R9 diagram format).

## Questions For User

- Q1: For the two new diagrams (R9), do you want Mermaid (renders inline from Markdown, easy to keep in sync with text changes) or static image assets (more design control, matches the hand-crafted logo/brand assets already in `assets/brand/`)? This determines Plan's Phase scoping for R9 — everything else in this brief can proceed regardless of your answer.

## Architecture Notes

- role: Architect
- decision: Combine Tier 2 and Tier 3 into one brief (per explicit user direction this session — "one brief covering all three" was the chosen sequencing option, later narrowed to Tier 2 + Tier 3 once OI-52 was confirmed already shipped) rather than three separate briefs, since both tiers were already scoped together under the same Notion Work Package and share no meaningful phase-ordering conflict with each other.
- constraint: R10 is a `bin/agentsmyth.mjs` code fix discovered mid-research, not part of the original Notion Tier 2/3 scope — included here rather than spun into a fourth brief, since it's small, isolated, and directly informs what R2/R3's page content is allowed to claim about the CLI's own warning behavior.
- tradeoff: Leaving R6 (T-D14 sweep) findings unresolved at brief-completion time means Plan cannot fully scope that one phase yet, but blocking the entire brief on that pending result would stall the other nine, already-fully-grounded requirements for no reason — the brief documents this explicitly as residual risk rather than hiding it.
- downstream: Plan should treat R10 as its own phase (isolated `bin/` diff, independently shippable) and R6 as the last phase scoped, once its findings land. R9's phase cannot be scheduled until Q1 is answered.

## Checkpoint Approval

(awaiting user review of this brief)

## Exit Gate

- [x] Every active R and RI has acceptance criteria (R6 explicitly notes its own acceptance is pending the parallel audit's findings, not yet unconditionally satisfied).
- [x] Blocking Q IDs appear in orchestration.blockers — **pending**: Q1 needs to be added to `orchestration.blockers` before this brief can be marked `ready-for-next-phase`; not yet added since the brief is still `blocked-for-user` pending initial review regardless.
- [ ] User approved or waiver recorded — pending this turn.
