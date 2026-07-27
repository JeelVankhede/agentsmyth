---
slug: wp-r11-docs-site
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-07-20
updated: 2026-07-20
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, RI1, RI2, RI3, RI4, RI5, RI6, RI7]
upstream:
  - workflow/artifacts/briefs/wp-r11-docs-site-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
skill_trigger_log:
  - skill: domain.interface-contract-designer
    decision: skipped
    reason: "path~contract_globs OR touches_contract both false — this work touches site/, package.json, and .github/workflows/*.yml; none match contract_globs (**/routes/**, **/api/**, *.proto, openapi*.y[a]ml, *.graphql, **/cli/**), and repo-profile.yaml's public_contracts is empty."
  - skill: domain.data-schema-designer
    decision: skipped
    reason: "path~schema_globs is false — no migrations/, schema/, *.sql, or models/ touched by a static docs site."
  - skill: domain.system-design-advisor
    decision: ran
    reason: "new_surface=true — ran; recommendation recorded in Architecture Notes (monolith route, zero-coupling boundary between site/ and src/)."
  - skill: domain.ui-ux-designer
    decision: ran
    reason: "path~ui_globs=true — Phase 3 (polish) plans a custom VitePress theme under site/.vitepress/theme/ with CSS and possibly Vue overrides, matching ui_globs (**/*.css, **/*.vue). Recommendation recorded in Architecture Notes (web route + accessibility)."
  - skill: domain.quality-gates-validator
    decision: ran
    reason: "task_class=complex (!= trivial) — ran; per-bar adequacy verdicts recorded in Architecture Notes."
---

# WP-R11 — Documentation Site (VitePress) - Plan

## Summary

Stand up a VitePress site at `site/` (kept fully separate from the internal `docs/` tree), migrate the 12-section content already audited and corrected this session, and wire — but not yet fire — a GitHub Pages deploy workflow, so that once the repo goes public, publishing needs no further code change. Build is split into three independent, sequentially dependency-ordered sub-phases matching WP-R11's own phase structure: `-p1` scaffold, `-p2` content migration, `-p3` polish and deploy-wiring.

## Inputs

- `workflow/artifacts/briefs/wp-r11-docs-site-v1.md` (approved, `ready-for-next-phase`).
- `workflow/config/repo-profile.yaml`, `domain.yaml`, `source-of-truth.yaml`, `verification.yaml`, `release.yaml`.
- Repo inspection: `package.json`, `.github/workflows/ci.yml`, `.gitignore`, `docs/` tree, `Agentsmyth Docs Site.dc.html`, `Agentsmyth Docs.dc.html`.

## Requirement Coverage

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R1 | Phase 1, Phase 2, Phase 3 | Cross-cutting — the overall "working, deployable site" outcome is the sum of all three phases. |
| R2 | Phase 1 | Scaffold: config + 12 stub files. |
| R3 | Phase 1 | Nav/sidebar structure. |
| R4 | Phase 1 | Build pipeline scripts + devDependency. |
| R5 | Phase 1 | CI build-only check. |
| R6 | Phase 2 | Content migration. |
| R7 | Phase 0 (already complete, pre-Plan) | Evidence-only — cited, not re-executed. See brief R7. |
| R8 | Phase 3 | Theme polish + deploy workflow. |
| RI1 | Phase 1 | devDependency-only check. |
| RI2 | Phase 1 | `site/` vs `docs/` separation. |
| RI3 | Phase 1 | Single CI job, no duplicate. |
| RI4 | Phase 1 | `.gitignore` build output. |
| RI5 | Phase 3 | Explicit provider naming in the deploy workflow. |
| RI6 | Phase 2 | Migrate from corrected copy, not stale Notion text. |
| RI7 | Phase 3 | Deploy workflow isolated from required checks; honest Ship evidence. |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `site/.vitepress/config.ts` | tooling (new) | R2, R3 | VitePress config: theme, nav, sidebar (4 groups mirroring the prototype). |
| `site/index.md` | docs (new) | R2, R6 | Section 1, Overview/home. |
| `site/introduction.md` | docs (new) | R2, R6 | Section 2. |
| `site/vibe-loop.md` | docs (new) | R2, R6 | Section 3. |
| `site/install.md` | docs (new) | R2, R6 | Section 4. |
| `site/run-it.md` | docs (new) | R2, R6 | Section 5. |
| `site/setup.md` | docs (new) | R2, R6, RI6 | Section 6, renamed — content sourced from this session's corrected copy. |
| `site/lifecycle.md` | docs (new) | R2, R6 | Section 7. |
| `site/under-hood.md` | docs (new) | R2, R6 | Section 8. |
| `site/artifacts.md` | docs (new) | R2, R6 | Section 9. |
| `site/power-skills.md` | docs (new) | R2, R6 | Section 10. |
| `site/validators.md` | docs (new) | R2, R6 | Section 11. |
| `site/in-action.md` | docs (new) | R2, R6 | Section 12 — stays illustrative, explicitly labeled (Q2 resolution). |
| `site/.vitepress/theme/` | tooling (new) | R8 | Custom theme dir: `index.ts`, `style.css` (ember/steel palette, light variant) matching `Agentsmyth Docs.dc.html`. |
| `package.json` | tooling | R4, RI1 | Add `vitepress` under `devDependencies`; add `site:dev`/`site:build` scripts. No `dependencies` change. |
| `package-lock.json` | tooling | R4 | Deterministic `npm install` companion to the `package.json` change above — no independent content decision. |
| `.gitignore` | tooling | RI4 | Add `/site/.vitepress/dist/`, `/site/.vitepress/cache/` (matches the existing `/dist/`-style pattern already in this file). |
| `.github/workflows/ci.yml` | tooling | R5, RI3 | Add one step (`npm run site:build`) inside the existing `validate` job. |
| `.github/workflows/site-deploy.yml` | tooling (new) | R8, RI5, RI7 | New, separate workflow: `configure-pages` + `upload-pages-artifact` + `deploy-pages`, triggered on push to `main` for `site/**`. Not added as a required check. |
| `docs/**` | — | — | **Zero changes.** Explicitly out of scope (RI2); Repo Impact Map lists it only to confirm it is not touched. |
| `src/workflow/**`, `src/setup/**`, `src/adapters/**`, `*/validators/**` | — | — | **Zero changes.** Out of scope per brief Non-Goals. |

Public contract impact: none (`repo-profile.yaml` `public_contracts: []`; nothing in this work exposes a new contract). Generated-output impact: `site/.vitepress/dist/` is a new generated output, excluded via `.gitignore` rather than registered in `repo-profile.yaml`'s `generated_outputs` (that field is currently empty and out of scope to edit for this WP — informational note for a future WP, not a blocker here since nothing in this work's acceptance criteria depends on that registry). Protected-path impact: none (`.git/**`, `.env*`, `**/*secret*` — untouched).

## Source-of-Truth Strategy

`workflow/config/source-of-truth.yaml`: `mode: optional`, `default_required: false`, `providers: []` — no external source-of-truth provider is configured for this repo. Outcome: **no external source-of-truth update required.** Content is sourced from the corrected local `.dc.html` prototypes (brief R7/RI6), which are themselves untracked working files, not a configured source-of-truth provider — reading them is direct repo inspection, not a source-of-truth read. No Ship-blocking source update applies.

## Approach

Three sequentially dependency-ordered Build sub-phases (`-p1`, `-p2`, `-p3`), each independently reviewable, sharing this plan's one Requirement Manifest per brief A5. `-p1` must land before `-p2` (content migration needs the stub files and config to exist); `-p2` should land before `-p3` (theme polish is easier to verify against real content, and grouping deploy-wiring with polish matches WP-R11's own Phase 4). `docs/` is never touched by any sub-phase.

## Phases

### Phase 1 - Scaffold (Build `-p1`)

- **Manifest IDs:** R2, R3, R4, R5, RI1, RI2, RI3, RI4
- Touches: `site/` (directory-level — added retroactively 2026-07-27: the original "`site/index.md` … `site/in-action.md` (12 stub files)" ellipsis shorthand only mechanically declared the first and last of the 12 stub paths, not all 12, which `check-scope-fence.mjs` never enumerates from an ellipsis; found while fixing OI-37's scope-fence boundary bug, which had been separately masking the gap), `site/.vitepress/config.ts`, `package.json`, `package-lock.json` (deterministic npm-managed companion to the `package.json` devDependency addition), `.gitignore`, `.github/workflows/ci.yml`.
- Work: Initialize VitePress under `site/`; add `vitepress` devDependency and `site:dev`/`site:build` scripts; write `config.ts` with nav/sidebar matching the four groups already prototyped in `Agentsmyth Docs Site.dc.html` (Start here / Use it / How it works / See it whole); stub all 12 `.md` files with correct titles/frontmatter so the site navigates; add `.gitignore` entries for `site/.vitepress/dist/` and `site/.vitepress/cache/`; add one step to `ci.yml`'s existing `validate` job running `npm run site:build`.
- **Exit gate:** `npm run site:build` exits 0 (command output cited in the task artifact); `npm run site:dev` renders all 12 nav entries locally; `git diff --stat` shows zero lines changed under `docs/`; `git diff .github/workflows/ci.yml` shows the new step inside the existing `validate:` job's `steps:` list and no new top-level job.

### Phase 2 - Content Migration (Build `-p2`)

- **Manifest IDs:** R6, RI6
- Touches: `site/` (directory-level — added retroactively 2026-07-27: the original
  "all 12 `site/*.md` files" wording used a mid-string wildcard `check-scope-fence.mjs`'s
  glob matcher does not parse, since it only recognizes a trailing `*` or `/`; found while
  fixing OI-37's scope-fence boundary bug, which had been separately masking the gap) — body
  content for all 12 pages.
- Work: Port each section's corrected text from `Agentsmyth Docs Site.dc.html` (this session's audited copy, not the original Notion draft) into its `site/*.md` file; convert Notion-style toggles to VitePress `::: details` and callouts to `::: tip`/`::: warning`; Section 12 (`site/in-action.md`) keeps the illustrative walkthrough with an explicit "illustrative" label (Q2 resolution).
- **Exit gate:** all 12 `site/*.md` files contain non-stub body content; `grep -r -- "--system\|the setup interview" site/` returns zero matches; every internal nav/cross-section link resolves (no 404 on `site:build`'s link-checking, or a manual link pass if link-checking isn't built in); `site/setup.md`'s title and phase names match this session's corrected copy in `Agentsmyth Docs Site.dc.html`, verified by direct text comparison.

### Phase 3 - Polish and Deploy Wiring (Build `-p3`)

- **Manifest IDs:** R1, R7, R8, RI5, RI7
- Touches: `site/.vitepress/theme/index.ts`, `site/.vitepress/theme/style.css`, `site/.vitepress/theme/Layout.vue` (new, added post-Review — global slot wiring, later rewritten post-Review to mount the site-wide background and content-reveal watcher), `site/.vitepress/theme/ForgeBackground.vue` (new, added post-Review — the canvas particle simulation, ported from an approved artifact-preview iteration), `site/public/logo.svg` (new, post-Review), `site/public/favicon.svg` (new, post-Review), `.github/workflows/site-deploy.yml` (new).
- Work: Apply the ember/steel dark theme and light variant from `Agentsmyth Docs.dc.html` (colors, fonts, component styles — style tile section 1a is the token source); build `.github/workflows/site-deploy.yml` using the official `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages` actions, triggered on push to `main` for `site/**` paths, explicitly naming GitHub Pages (RI5); confirm the new workflow is a separate file from `ci.yml` and is not registered as a required status check (RI7); record R7's already-complete evidence (this session's Phase 2 audit) in the task/review chain rather than re-doing it.
- **Exit gate:** local `npm run site:dev` visually matches the design mockups' dark theme (and light variant, if a toggle is implemented) per manual comparison against `Agentsmyth Docs.dc.html`; `site-deploy.yml` passes YAML syntax validation; `git grep -l "site-deploy" .github/workflows/ci.yml` returns no match (confirms separation); Ship's evidence explicitly states the deploy workflow has not yet succeeded and why (repo still private / Pages not yet enabled), per RI7.

## Dependency Order

1. Phase 1 (Scaffold) — no dependencies; establishes `site/` and the build pipeline everything else needs to exist.
2. Phase 2 (Content Migration) — depends on Phase 1's stub files and working build.
3. Phase 3 (Polish and Deploy Wiring) — depends on Phase 2 for a meaningful visual review surface, though the deploy-workflow half of Phase 3 is technically independent of content; kept together to match WP-R11's own Phase 4 grouping (brief A5/tradeoff).

No two phases are parallelized — each is reviewable and mergeable on its own, in order.

## Branch Strategy

- Base branch: `main`.
- Working branch: `feat/wp-r11-docs-site` (already created, per repo-profile.yaml's `require_non_default_branch_for_changes: true`).
- Commits are expected before PR creation; one commit per Build sub-phase is recommended (matches the `-p1`/`-p2`/`-p3` split) but not mandated.
- PR creation: not required by `release.yaml` (`gates.pull_request.required: false`, `create_policy: user_requested_or_configured`) — Ship will ask the user rather than assume a PR is wanted.
- No unrelated local changes overlap this work's planned files (the two untracked `.dc.html` files at repo root are read as sources, never written to by Build, and are not part of this branch's staged scope).

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs | Waiver needed |
|---|---|---|---|---|---|---|
| Deploy workflow fails on every push while repo stays private | High (certain, until repo goes public) | Low (isolated, non-blocking) | Separate workflow file, not a required check (RI7); Ship records the expected-red state honestly | Build/Ship | R8, RI7 | No |
| `site/` becomes a second undeclared doc root, confusing future tooling that only knows `docs_roots: [docs]` | Low | Low | Documented in brief Constraints/this plan; no requirement here depends on `docs_roots` covering `site/` | Plan (documented, not fixed) | RI2 | No |
| Content migration (Phase 2) accidentally re-pulls from the original stale Notion text instead of the corrected local copy | Medium | Medium (reintroduces exactly the staleness WP-R11 flagged) | Exit gate greps for the specific stale terms (`--system`, "the setup interview") and diffs `site/setup.md` against the corrected source directly | Build `-p2` | R6, RI6 | No |
| Custom VitePress theme introduces an inaccessible or keyboard-untestable component | Low | Medium | `ui-ux-designer` recommendation (web + accessibility routes) applied during Phase 3; native semantic HTML preferred over styled `<div>`s | Build `-p3` | R8 | No |
| Unrelated local changes (the two untracked `.dc.html` files) get accidentally staged/committed as part of this branch | Low | Low | Branch Strategy explicitly excludes them from staged scope; `git status` reviewed before each commit | Build (all phases) | — | No |

## Verification Plan

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R2, R3, R4, R5, RI1, RI3, RI4 | Command: `npm run site:build` (discovered/added this WP; not yet in `verification.yaml`) | Build `-p1` / Test | Exit code 0, output cited in the task artifact. |
| RI2 | Command: `git diff --stat -- docs/` | Build `-p1` / Test | Must show no output (zero changes). |
| R6, RI6 | Manual QA: content diff review against `Agentsmyth Docs Site.dc.html`; command: `grep -r -- "--system\|the setup interview" site/` | Build `-p2` / Test | Grep must return no matches. |
| R7 | Durable review finding/coverage check — citation to this session's `.dc.html` edits, already complete | Think (pre-Plan) | No further evidence needed; already-covered. |
| R8 (theme) | Manual QA: visual comparison of `site:dev` output against `Agentsmyth Docs.dc.html` | Build `-p3` / Test | Dark theme + light variant if implemented. |
| R8 (deploy), RI5, RI7 | Command: YAML syntax check on `site-deploy.yml` (e.g. `node -e` YAML parse, or `actionlint` if available — do not invent an unavailable command; fall back to manual inspection if no linter is present) | Build `-p3` / Test | Cannot verify a live deploy (repo still private) — this is the one item where evidence is necessarily "syntax/config correct," not "deployed," and Ship must say so explicitly. |
| RI7 (isolation) | Inspection: confirm `site-deploy.yml` is not referenced by `ci.yml` and not listed in any branch-protection required-checks config present in the repo | Build `-p3` / Test | No branch-protection config exists in-repo to inspect (GitHub-side setting); note as inspected-to-the-extent-possible. |

Skipped/unavailable checks: a live GitHub Pages deployment cannot be verified until the repo is public and Pages is enabled — recorded as risk (Risk Register row 1), not a silent gap, per `verification.yaml`'s `command_policy.record_not_run_as_risk: true`.

## Architecture Notes

- role: Principal Engineer
- decision (system-design-advisor, monolith route selected — `repo-profile.yaml` `repository.mode: single-repository`, no services/microservices/event topology in this repo): `site/` introduces **zero dependency coupling** with `src/`/`bin/` — the VitePress build never imports application code, and application code never reads `site/`. Rejected alternative: having `site/.vitepress/config.ts` import the package version or shared constants directly from `src/`. Reason: that would create a real edge between two independently-deployed build outputs (npm package vs. static site) for marginal DRY benefit; reading `../package.json`'s `version` field (which both already depend on as data, not code) achieves the same without a `src/` import.
- decision (ui-ux-designer, web + accessibility routes): interaction states already designed in `Agentsmyth Docs.dc.html` (hover/active/copied states on buttons and code blocks, sidebar active-item indicator, mobile drawer). Phase 3 must additionally: preserve visible focus indicators (do not strip the default outline without a replacement), ensure any custom `<span onClick>`-style elements ported from the `.dc.html` mockups become real semantic `<button>`/`<a>` elements in the actual VitePress theme (the mockups use `onClick` on `<span>` purely as a static-prototype convenience — Build must not carry that pattern into real interactive code), and confirm color is never the sole signal (the ember-accent "active" states in the mockups already pair color with a left-rule/background tint, not color alone — preserve that pairing). No accessibility gap raised as blocking; these are Phase 3 build-time obligations, tracked via the Phase 3 exit gate's manual-comparison step.
- decision (quality-gates-validator): two bars materially apply — **integration** (does the whole site actually build end-to-end with the real `vitepress` dependency, not mocked — `npm run site:build` in CI is exactly this bar, and it's adequate because it exercises the real toolchain) and **lint-type** (minimal surface — `site/.vitepress/config.ts` is the only real TypeScript in scope; adequacy = it compiles as part of `site:build`, no separate type-check command needed since VitePress's own build fails on config errors). Three bars judged **not materially affected** and skipped with reason: unit-coverage (no application logic units — content and config, not testable business logic), security-scan (no new attack surface — static site, no secrets, no backend; `vitepress` itself is subject to the same `npm audit` posture already covering every devDependency, not a new posture), perf-budget (no perf budget is configured or enforced anywhere in this repo today, for any surface — introducing one here would be new scope, not adequacy-checking existing scope).
- constraint: `docs/` is never touched — every phase's exit gate includes an explicit zero-diff check on `docs/`.
- constraint: the deploy workflow (Phase 3) must remain structurally separate from `ci.yml`'s required `validate` job (RI7) — this is a hard exit-gate condition, not a preference.
- tradeoff: verifying the deploy workflow's *correctness* (syntax/config) now, versus its *success* (an actual deployment), which is not achievable pre-public. Chosen: verify correctness now via syntax/config inspection, explicitly record in Ship that a live deployment has not happened and why — rejected alternative (silently treating a syntactically-valid-but-never-run workflow as "done") would violate `evidence_policy.no_external_claim_without_evidence`.
- downstream: Review must confirm each phase's Changed Files map back to its stated manifest IDs (scope fence) and that `docs/` shows zero diff across all three phases combined, not just per-phase. Test must run `npm run site:build` for real and cite its output — not assume Build's own claim. Ship must state the deploy workflow's actual (not-yet-succeeded) status plainly and name the two remaining external actions (make repo public; enable Pages with source "GitHub Actions") as the user's next steps, matching R8's "all I have to do is publish" framing.

## Assumptions Verified

| Brief A ID | Status | Citation |
|---|---|---|
| A1 | evidence-backed | Slug convention: `ls workflow/artifacts/briefs/` this session showed `wp-r9a-*`, `wp-r9b-*`, `wp-r9c-*`, `wp-r5-*` — `wp-r11-docs-site` follows the same `wp-r<N>-<slug>` shape. |
| A2 | evidence-backed | Gitignore build output: `.gitignore` (read this session) already excludes `/dist/` and other generated build paths with the same comment convention this plan follows for `site/.vitepress/dist/`/`cache/`. |
| A3 | evidence-backed | Script naming (`site:dev`/`site:build`): recorded directly in the brief's Source Links / Problem section as this turn's explicit user direction — not a repo-inspection assumption, a stated decision, itself durable evidence once written into the brief artifact. |
| A4 | evidence-backed | Phase 2 audit already satisfies WP-R11's exit gate: this session's own edits to `Agentsmyth Docs Site.dc.html` (Section 6 rename/rewrite) and `Agentsmyth Docs.dc.html` (matching cross-reference fixes), both directly inspected and re-verified via `grep` for "interview" in this conversation. |
| A5 | evidence-backed | One chain, sub-versioned Build phases: `src/workflow/lifecycle.md`'s "Build Phase Sub-Versioning" section documents exactly this mechanism (`-p<P>` suffix, same slug/version as parent plan). |
| A6 | evidence-backed | Deploy workflow built now despite being inert pre-public: recorded directly in the brief's Source Links / Q1 resolution as this turn's explicit user direction. |

## Open Questions

None. Both brief-stage open questions (Q1 deploy target, Q2 Section 12 content) were resolved by the user before Plan started; no new Plan-stage questions were raised.

## Checkpoint Approval

- Checkpoint: plan-review
- Status: approved
- User's own words (verbatim, this turn, 2026-07-27): "Plan is approved"

Backfilled 2026-07-27: this section did not exist as a formal requirement when this plan was
originally approved (this chain shipped via PR #41 before `wp-r12-local-install-fixes-v1`'s R5
added the `check-lifecycle.mjs` checkpoint gate). No contemporaneous verbatim quote for this
specific plan's own approval was found recorded elsewhere in this file. The user explicitly
authorized this backfilled approval text this turn, after being told plainly that no such
record exists, rather than have it fabricated.

## Exit Gate

- [x] Every active R and RI mapped to a phase. (`requirement-phase-mapper`: no orphans — R7 is explicitly mapped to "Phase 0 / already complete," a legitimate non-Build phase per the brief; every other ID appears in exactly one of Phase 1/2/3's Manifest IDs.)
- [x] Every phase has a binary exit gate. (Phases 1–3 above each state observable pass/fail conditions — command exit codes, `git diff` emptiness, grep matches, file existence.)
- [x] Verification plan covers every R and RI. (See Verification Plan table; R7 covered by its already-complete citation.)
- [x] User approved or waiver recorded. (Brief was approved by the user this session; this plan directly implements the brief's resolved scope with no new blocking questions raised.)
