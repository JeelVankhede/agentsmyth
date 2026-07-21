---
slug: wp-r11-docs-site
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-07-20
updated: 2026-07-20
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, RI1, RI2, RI3, RI4, RI5, RI6, RI7]
upstream:
  - user-request
  - notion-wp-r11-docs-site
  - notion-docs-site-draft
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: brief-review
skill_trigger_log:
  - skill: repo-alignment-scan
    decision: ran
    reason: new_surface=true (a public VitePress site has no existing precedent in this repo) and task_class=complex — scanned real repo state; found a naming/purpose collision risk between the proposed public site and the existing internal docs/ tree, resolved by the user directing the site to a separate site/ root.
  - skill: architecture-decision-advisor
    decision: ran
    reason: new_surface=true — the requirement raises whole-repo-consistent decisions (CI build-check placement, deploy-workflow placement, docs/ vs site/ separation), recorded below.
  - skill: constraint-conflict-scan
    decision: ran
    reason: task_class=complex (!= trivial) — checked all three domain.yaml constraint arrays and repo-profile.yaml protected paths; found a conflict with [provider-neutrality-1] on deploy-target selection, resolved by an explicit user-configured choice (GitHub Pages) per [provider-neutrality-2].
---

# WP-R11 — Documentation Site (VitePress) - Brief

## Source Links

- Notion: [WP-R11 — Documentation Site (VitePress)](https://app.notion.com/p/3a3972bdebbb81d9b689f918f3afcfd5) — the work package this brief implements.
- Notion: [📖 Documentation Site (Draft)](https://app.notion.com/p/39f972bdebbb8134b23cfce09953075d) — 12-section content source, parent of the 12 per-section Notion pages.
- Notion: [06 — Roadmap & Work Packages](https://app.notion.com/p/393972bdebbb81e4ac24cb7d4e4bbf61) — parent roadmap entry.
- Repo (untracked, local): `Agentsmyth Docs Site.dc.html` — interactive content/copy prototype for all 12 sections, corrected this session (Section 6 rename + rewrite, cross-reference fixes) against `src/setup/SKILL.md` ground truth.
- Repo (untracked, local): `Agentsmyth Docs.dc.html` — visual/design mockup canvas (style tile, wordmark, home, content page, in-action, mobile, light variant, plus 3 new sections added this session: setup-resolution content page, command palette, social cards).
- `src/setup/SKILL.md` — ground truth for the corrected Section 6 content.
- `bin/agentsmyth.mjs` — ground truth confirming no `--system` mentions remain relevant (already removed, WP-R7).
- User direction (this turn): site lives at `site/`, not `docs/` (`docs/` stays reserved for actual repo documentation); deploy target is GitHub Pages, wired now so that going public later is the only remaining step; Section 12 stays illustrative.

## Problem

The public agentsmyth documentation site exists today only as Notion draft content plus two local, untracked HTML design/content prototypes. There is no buildable site in the repo. WP-R11 (Notion) scopes converting that draft into a working VitePress site, independent of the npm package release train, with an explicit two-part risk already called out by the work package itself: a content-freshness audit against `main` (Phase 2) must happen before content migration (Phase 3), because the draft predates two prior work packages (WP-R7, WP-R9b).

The Phase 2 audit and its confirmed fix (Section 6, "The Setup Interview" → "Setup: the resolution pass") were completed in the prior session of this conversation, directly in the two local `.dc.html` prototypes — see Source Links. This brief covers the remaining WP-R11 phases: scaffold, content migration, and polish/ship — including standing up the GitHub Pages deploy workflow now, ahead of the repo actually going public.

## Goals

- Stand up a real, buildable VitePress site at `site/` with all 12 sections navigable — kept separate from `docs/`, which remains this repo's own internal documentation (mental map, orientation).
- Keep the build pipeline devDependency-only, with a CI check that fails the build on breakage.
- Migrate the now-corrected 12-section content (not the original stale draft) into the site.
- Apply the already-designed visual system (steel/ember dark theme, light variant) from the design mockups.
- Wire a GitHub Pages deploy workflow now, so that once the repo goes public and Pages is enabled, no further code change is needed to publish.

## Non-Goals

- Changing anything under `src/workflow/`, `src/setup/`, `src/adapters/`, or any validator (WP-R11 is documentation-only).
- Flipping the repo public, or enabling GitHub Pages in repo settings — both remain manual, user-performed actions (owned by the separate "05 — Launch Readiness" Phase 4). This chain prepares the automation; it does not flip the switch.
- Publishing the npm package.
- Final custom-domain decisions for the deployed site.
- Rewriting `README.md` (owned separately by "05 — Launch Readiness" Phase 3; the two should eventually share positioning language but are not merged as one task).

## User Impact

Prospective and current users get a real, linkable documentation site instead of a private Notion draft. Once the repo goes public, publishing is a settings change, not a code change.

## Success Metrics

- `npm run site:build` exits 0 and is wired into CI.
- All 12 sections present with audited (non-stale) content.
- The GitHub Pages deploy workflow exists, is correctly configured, and needs no further code change once the repo is public and Pages is enabled.

## Requirements

See Requirement Manifest below; every `R`/`RI` carries its own acceptance criterion.

## Constraints

- **[provider-neutrality-1]** (`domain.yaml`) — do not make any hosting, CI, package, or deployment provider mandatory by default. Resolved, not violated: the user explicitly named GitHub Pages this turn, which is exactly the escape hatch [provider-neutrality-2] describes ("use configured providers only when ... the user request enables them").
- **[provider-neutrality-2]** (`domain.yaml`) — use configured providers only when config or the user request enables them. Satisfied by the explicit user request above.
- `repo-profile.yaml` → `paths.protected`: `.git/**`, `.env*`, `**/*secret*` — none of this work's file surfaces (`site/`, `package.json`, `.github/workflows/*.yml`) match; no conflict.
- `repo-profile.yaml` → `paths.docs_roots: [docs]` — declares `docs/` only. `site/` is a new, undeclared root; this is acceptable since `site/` is a distinct concern (public marketing/docs site) from `docs/` (internal repo documentation), and `repo-profile.yaml` is out of this chain's scope to edit (no requirement here depends on `docs_roots` covering `site/`). Noted for Plan in case a later WP wants it declared.
- CLAUDE.md golden rule 4 (zero runtime dependencies) — `vitepress` must land under `devDependencies` only; the `dependencies` field must stay untouched.
- WP-R11's own explicit out-of-scope list (see Non-Goals) is binding for this chain; scope creep into `src/workflow/` etc. is a stop condition, not a judgment call.

## Risks

- **Deploy workflow will be red until the repo is public.** A GitHub Pages deploy step needs Pages enabled, which needs (on the free tier) a public repo. Until both happen, this workflow's runs will fail. Mitigated by RI7: the deploy workflow must be a separate, non-required workflow file (not part of `ci.yml`'s `validate` job), so its expected-red state does not block merges to `main`. Ship must record this as a known, accepted state — not silently claim the site is live.
- **`site/` is a new, undeclared repo root.** `repo-profile.yaml`'s `docs_roots` only lists `docs/`. Accepted as a documented gap (see Constraints) rather than an in-scope config change, since editing `repo-profile.yaml`'s classification is a separate concern from building the site itself.
- **Re-staling content during migration.** Phase 3 must pull from the corrected local prototype (post today's fix), not fresh from the original Notion pages, or it reintroduces the exact staleness WP-R11 flagged. Mitigated by RI6/A4.
- **Soft dependency on README rewrite** ("05 — Launch Readiness" Phase 3) for consistent competitive-positioning language. Not a blocker; reconcile independently, per WP-R11's own notes.

## Open Questions

All resolved this turn — see the Q entries below for the recorded resolutions.

## Requirement Manifest

### Explicit (R)

- **R1**: Convert the 12-section Notion draft (content and design already done) into a working VitePress site inside the `agentsmyth` repo, buildable and deployable independently of the npm package release.
  Acceptance: `site/` builds locally and in CI; nav/search/design match the audited mockups; all 12 sections present with audited content.
- **R2**: New `site/` directory: VitePress config, one `.md` per section matching the Notion section order and titles, with Section 6 renamed per the completed Phase 2 audit. `docs/` is untouched.
  Acceptance: `site/.vitepress/config.ts` exists with theme/nav/sidebar config; one `.md` file per section at the correct path with correct frontmatter/title; `npm run site:build` exits 0 and all 12 nav entries render via `site:dev`; `git diff` shows zero changes under `docs/`.
- **R3**: Nav/sidebar structure mirroring the 12-section spine ("chat is smoke, artifacts are steel").
  Acceptance: sidebar groups match the four groupings already prototyped in `Agentsmyth Docs Site.dc.html` (Start here / Use it / How it works / See it whole); section order 1–12 preserved.
- **R4**: Build pipeline — `npm run site:dev` / `npm run site:build` scripts in `package.json`, `vitepress` as a devDependency only.
  Acceptance: `package.json` `devDependencies` includes `vitepress`; `scripts.site:dev` and `scripts.site:build` present; `dependencies` field unchanged.
- **R5**: CI — a build-only check (`npm run site:build` exits 0) added to `ci.yml`'s existing `validate` job.
  Acceptance: `.github/workflows/ci.yml` diff shows the new step inside the existing `validate:` job's `steps:` list (no new top-level job in `ci.yml`); a CI run shows the step passing, cited as evidence.
- **R6**: Content migration — pull each section's (corrected) text into its `site/*.md` file; convert Notion-specific structures (toggles → `::: details`, callouts → `::: tip`/`::: warning`). Section 12 ("agentsmyth in Action") stays the current illustrative/fabricated-but-faithful walkthrough, explicitly labeled as such (Q2, resolved).
  Acceptance: all 12 `site/*.md` files hold real, non-stub content ported from the corrected source; Section 12 carries an explicit "illustrative" label; no dead internal nav links.
- **R7**: Content freshness audit (Phase 2) — re-read each section against `main`, confirm/rewrite stale sections.
  Acceptance: **already met.** Section 6 was renamed and rewritten this session in `Agentsmyth Docs Site.dc.html` to match `src/setup/SKILL.md`'s actual resolution-pass model (Inspect → Pending Setup Resolution → Write Configs → Verify → Copy and Cleanup, including the Step 5e pre-commit gate offer); 4 cross-references in that file and 2 in `Agentsmyth Docs.dc.html` were fixed to match. Section 4 (Install) and the rest were spot-checked for `--system`/"interview" drift and found clean. This satisfies WP-R11's Phase 2 exit gate ("a written note confirming which sections needed changes and which were confirmed already accurate") — this brief section is that note. No further Phase 2 action needed; Phase 3 (R6) migrates from this corrected copy.
- **R8**: Polish and ship — apply the existing design work (theme colors, fonts, custom components); build and wire a GitHub Pages deploy workflow now (Q1, resolved), so that going public later needs no further code change.
  Acceptance: a dedicated deploy workflow (e.g. `.github/workflows/site-deploy.yml`) exists, uses the official `actions/configure-pages` + `actions/upload-pages-artifact` + `actions/deploy-pages` actions, triggers on push to `main` for `site/**` changes; visual theme/fonts/components match the design mockups in `Agentsmyth Docs.dc.html`; Ship records the workflow's current (expected-red, pre-public) status honestly, not as "deployed."

### Implicit (RI)

- **RI1**: Zero-runtime-dependency invariant preserved (CLAUDE.md golden rule 4).
  Acceptance: `git diff package.json` shows `vitepress` only under `devDependencies`; no new entries under `dependencies`.
- **RI2**: The new public site must not collide with, or blend into, the existing internal `docs/` tree (repo-alignment-scan finding; resolved by user direction to a separate root).
  Acceptance: `docs/overview.md` and `docs/knowledge-map/**` remain byte-identical/untouched; the entire public site lives under `site/`, a new top-level directory.
- **RI3**: The build-only CI check must not introduce a second, duplicate job in `ci.yml` (architecture-decision-advisor finding).
  Acceptance: `ci.yml` diff shows the site-build step added inside the existing `validate` job only.
- **RI4**: Build output must not be committed.
  Acceptance: `.gitignore` includes the VitePress build/cache paths (`site/.vitepress/dist`, `site/.vitepress/cache`); `git status` shows no built output tracked after a local `site:build` run.
- **RI5**: The deploy provider is explicitly user-configured, not defaulted ([provider-neutrality-2] satisfied via this turn's user request).
  Acceptance: the deploy workflow names GitHub Pages explicitly (via the official `actions/deploy-pages` action) and cites this brief's Q1 resolution as its justification, rather than being silently assumed.
- **RI6**: Phase 3 content migration must source from the corrected copy fixed this session, not the original stale Notion text.
  Acceptance: `site/setup.md`'s (or equivalent path's) title and phase descriptions match the corrected copy now in `Agentsmyth Docs Site.dc.html`, not the pre-fix Notion page text.
- **RI7**: The deploy workflow's expected-red state (until the repo is public and Pages is enabled) must not block merges or be misreported as passing.
  Acceptance: the deploy workflow is a separate file from `ci.yml`, is not added as a required status check, and Ship's evidence explicitly states the workflow has not yet succeeded (with the reason: repo still private / Pages not yet enabled) rather than omitting that fact.

### Assumptions (A)

- **A1**: Slug `wp-r11-docs-site` is used for this lifecycle chain, matching this repo's existing `wp-r<N>-<slug>` convention (`wp-r9a`, `wp-r9b`, `wp-r9c`, `wp-r5`).
- **A2**: VitePress build output is excluded via `.gitignore` rather than committed — standard VitePress default, low risk, reversible.
- **A3**: `npm` scripts are named `site:dev` / `site:build` (matching the `site/` directory chosen this turn) rather than WP-R11's original `docs:dev` / `docs:build` naming, to avoid a name/directory mismatch. Low risk, reversible.
- **A4**: Today's completed Phase 2 audit (Section 6 rename/rewrite plus cross-reference fixes, in both `.dc.html` files) satisfies WP-R11's Phase 2 exit gate; Plan/Build do not repeat that audit, only carry its corrected text forward into Phase 3 migration (R6/RI6).
- **A5**: This lifecycle chain covers WP-R11's full remaining scope (scaffold, content migration, polish/ship) as one Complex brief/plan, with Build split into independent sub-versioned phases (`-p1` scaffold, `-p2` content migration, `-p3` polish/ship-with-deploy-workflow) per `lifecycle.md`'s Build Phase Sub-Versioning — matching WP-R11's own phase structure. Reversible: Plan can re-sequence or re-split without changing this brief's scope.
- **A6**: The deploy workflow is built and committed now (per this turn's user direction) even though it cannot succeed until the repo is public — its correctness is verified by config/syntax inspection and a local `site:build` dry run, not by an actual successful deployment, which is out of this chain's reach until the external precondition (public repo + Pages enabled) is met by the user.

### Open Questions (Q)

- **Q1 — resolved this turn**: Deploy target. **Answer: GitHub Pages.** The user will make the repo public separately; this chain's job is to have the deploy workflow fully wired now so that "all I have to do is publish" once that happens. Cited constraint: [provider-neutrality-1]/[provider-neutrality-2] — satisfied, not violated, since the choice is explicit and user-directed.
- **Q2 — resolved this turn**: Section 12 ("agentsmyth in Action") content. **Answer: keep illustrative**, explicitly labeled as such (matches the Notion draft's own existing caveat).

## Questions For User

None outstanding — Q1 and Q2 were resolved this turn, and the `site/` vs `docs/` location question is incorporated into R2/RI2. Plan may start.

## Architecture Notes

- role: Architect
- decision: Site location — `site/`, a new top-level directory, kept fully separate from `docs/` (RI2). Rejected alternative (from this brief's original draft): `docs/index.md` as the public home page, with the rest of the public site living inside `docs/` alongside the existing internal `overview.md`/`knowledge-map/`. Reason: user-directed this turn — they want `docs/` reserved for actual repo documentation/consolidation, not shared with a public marketing site. This also sidesteps the original `docs/overview.md` naming collision more cleanly than the index.md workaround would have.
- decision: `npm` script naming — `site:dev`/`site:build` (A3). Rejected alternative: WP-R11's original `docs:dev`/`docs:build` naming. Reason: once the site moved to `site/`, `docs:*` script names would no longer match the directory they build, inviting confusion for future contributors.
- decision: CI build-check integration point — add a "Build docs site" step to the existing `.github/workflows/ci.yml` `validate` job (RI3). Rejected alternative: a new, separate `docs` job. Reason: WP-R11 explicitly scopes this into the existing job; a separate job would duplicate `actions/checkout` + `actions/setup-node` overhead for one lightweight build-only check, with no isolation benefit since the site build has no side effects on the other validate steps.
- decision: Deploy workflow is a **separate** file from `ci.yml` (RI7), not folded into the `validate` job. Rejected alternative: adding the deploy step to the existing `validate` job alongside the build check. Reason: the deploy step is expected to fail until the repo is public and Pages is enabled — bundling it into `validate` would make every PR's required check red for reasons unrelated to the PR's own content. A separate, non-required workflow file isolates that expected failure.
- decision: Deploy target — **GitHub Pages**, resolved via explicit user direction this turn (Q1), satisfying [provider-neutrality-2] rather than conflicting with [provider-neutrality-1].
- constraint: Zero-runtime-dependency invariant (CLAUDE.md golden rule 4) — `vitepress` is a devDependency only; this does not touch the invariant, which applies to `dependencies`.
- constraint: WP-R11's explicit out-of-scope list is binding — any drift into `src/workflow/`, `src/setup/`, `src/adapters/`, validators, npm publish, or actually flipping repo visibility/enabling Pages is out of scope for this chain, not a judgment call for Build.
- tradeoff: Running WP-R11 as one Complex brief with sub-versioned Build phases (A5) versus three separate slugs/versions. Chosen: one chain, sub-versioned Build (`-p1`/`-p2`/`-p3`), because `lifecycle.md` has a purpose-built mechanism for exactly this (independent Plan-approved Build phases under one plan/manifest), and the three WP-R11 sub-phases share the same Requirement Manifest and acceptance criteria rather than being independently scoped efforts.
- tradeoff: Building the deploy workflow now, ahead of the repo going public (A6), versus deferring it to a later WP once the repo is already public. Chosen: build it now, per explicit user direction — the workflow's correctness can be verified by config/syntax inspection and a local build dry run even though a live successful deployment can't happen yet; deferring would mean re-opening this WP later for what is otherwise a self-contained piece of work.
- assumption: A1–A6 above; A4 in particular means Plan should treat today's content-audit fixes as already-satisfied evidence for R7, not a redo item.
- downstream: Plan must (1) split Build into `-p1` scaffold / `-p2` content migration / `-p3` polish-ship-with-deploy per A5, (2) define the VitePress theme/config approach concretely (custom theme vs. default theme + CSS overrides) referencing the design mockups, (3) design the deploy workflow so its expected-red pre-public state is documented and non-blocking (RI7), (4) carry forward that `docs/` is fully out of scope — zero diff expected there in any phase.

## Exit Gate

- [x] Every active R and RI has acceptance criteria.
- [x] Blocking Q IDs appear in orchestration.blockers. (None are blocking; both Q1 and Q2 were resolved this turn.)
- [x] User approved or waiver recorded. — user resolved both open questions and directed the `site/` vs `docs/` split, then explicitly authorized continuing ("You can now continue with these answers in mind").
