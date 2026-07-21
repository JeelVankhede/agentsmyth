---
slug: wp-r11-docs-site
version: 1
artifact: ship
status: ready-for-next-phase
created: 2026-07-21
updated: 2026-07-21
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, RI1, RI2, RI3, RI4, RI5, RI6, RI7]
upstream:
  - workflow/artifacts/briefs/wp-r11-docs-site-v1.md
  - workflow/artifacts/plans/wp-r11-docs-site-v1.md
  - workflow/artifacts/tasks/wp-r11-docs-site-v1-p1.md
  - workflow/artifacts/tasks/wp-r11-docs-site-v1-p2.md
  - workflow/artifacts/tasks/wp-r11-docs-site-v1-p3.md
  - workflow/artifacts/tasks/wp-r11-docs-site-v1-p4.md
  - workflow/artifacts/tasks/wp-r11-docs-site-v1-p5.md
  - workflow/artifacts/tasks/wp-r11-docs-site-v1-p6.md
  - workflow/artifacts/tasks/wp-r11-docs-site-v1-p7.md
  - workflow/artifacts/tasks/wp-r11-docs-site-v1-p8.md
  - workflow/artifacts/tasks/wp-r11-docs-site-v1-p9.md
  - workflow/artifacts/reviews/wp-r11-docs-site-v1.md
  - workflow/artifacts/verify/wp-r11-docs-site-v1.md
orchestration:
  phase: ship
  status: ready-for-next-phase
  next_phase: reflect
  blockers: []
  user_checkpoint: none
---

# WP-R11 — Documentation Site (VitePress) - Ship

## Inputs

- Verify recommendation: `hold` (`workflow/artifacts/verify/wp-r11-docs-site-v1.md`), blocked on exactly two `waiver-required` Skipped Checks: no real CI-run evidence (R1, R5), and an unclean `npm audit` (R4). Both are resolved below — the first by obtaining real evidence, the second by a formal waiver — so this Ship artifact does not need to hold on either.
- Review recommendation: `pass-with-risk` (`workflow/artifacts/reviews/wp-r11-docs-site-v1.md`), no open P0. One P1 (Finding #1, hero title invisible) was found post-Test and fixed/re-verified in `-p9`, independently re-confirmed by Review itself — not an open finding at this point in the chain.
- Release config: `workflow/config/release.yaml` — `release.required: false`, `default_recommendation_when_no_release_gate: ship`; `gates.ci.required: false`, `gates.pull_request.required: false`, `gates.release/deployment/docs/package.required: false`; `gates.branch.required: true` (evidence: current branch name, checked below); `gates.rollback.required: when_release_or_external_handoff_is_in_scope` (the GitHub Pages deploy is in scope, so rollback is recorded below).
- Source-of-truth config: `workflow/config/source-of-truth.yaml` — `mode: optional`, `default_required: false`, `providers: []` — no external tracking configured for this repo.
- User decisions this session (both explicit, both acted on): (1) push the branch and open a PR to obtain real CI evidence rather than waive the gap — done, PR #41; (2) waive the `npm audit` finding rather than hold shipping on it indefinitely, since no upstream fix exists — recorded formally below.

## Ship Status

- Recommendation: ship
- Review result: pass-with-risk, `workflow/artifacts/reviews/wp-r11-docs-site-v1.md`
- Verification recommendation: hold (both blocking items now resolved/waived by Ship, see below), `workflow/artifacts/verify/wp-r11-docs-site-v1.md`
- PR / CI: PR #41 open, `validate` CI check passing — see PR / CI Readiness.
- Source-of-truth: not applicable — no provider configured.
- Release: no release gate configured for this repo (`release.yaml`); merge is the release action. Not yet merged — that decision belongs to the user.

## Requirement Coverage

| Manifest ID | Status | Evidence | Notes |
|---|---|---|---|
| R1 | shipped | `npm run site:build` passes (re-verified locally this phase); `forge-canvas` global; all 12 pages present; **real CI run now obtained** — PR #41, run `29812351574`, job `validate`, SUCCESS, completed 2026-07-21T07:57:14Z (`gh pr checks 41` → 1 passed, 0 failed). | The "builds ... in CI" clause Review/Verify both flagged as unresolved is now closed with a genuine run, not a waiver. |
| R2 | shipped | `site/.vitepress/config.ts` + 12 `site/*.md`; `git diff --stat -- docs/` empty (re-verified this phase). | |
| R3 | shipped | 4/4 sidebar groups present in `config.ts` (re-verified this phase). | |
| R4 | shipped | `vitepress` under `devDependencies` only; `dependencies` unchanged (re-verified this phase). `npm audit` residual (3 findings, dev-server-only, no fix upstream) is formally waived — see Risk And Rollback. | Requirement itself shipped cleanly; the waiver covers an inherited ecosystem advisory, not a defect in this work. |
| R5 | shipped | `ci.yml` diff: new step inside existing `validate` job only; real CI run now obtained (same run as R1). | Same resolution as R1. |
| R6 | shipped | Stale-term grep empty; real content on all 12 pages (re-verified this phase). | |
| R7 | shipped | Evidence-only per the brief — cited to `Agentsmyth Docs Site.dc.html`/`Agentsmyth Docs.dc.html` edits and the brief's own R7 acceptance note. | |
| R8 | shipped | Theme applied and builds; home-layout defect (`-p4`), creative/forge-realism passes (`-p5`/`-p6`), production port (`-p7`), performance fix (`-p8`), and the two real browser-audit defects (`-p9`: invisible hero title, light-mode contrast regression) all fixed and re-verified — most recently via a second, independent Playwright session in Review. | Full pixel-level visual diff against the mockups and a full cross-browser/mobile-viewport sweep remain not performed — non-blocking residual, see Risk And Rollback. |
| RI1 | shipped | `package.json` diff: no `dependencies` change. | |
| RI2 | shipped | `git diff --stat -- docs/` empty (re-verified this phase). | |
| RI3 | shipped | Only `validate:` job exists in `ci.yml`; new steps inside it. | |
| RI4 | shipped | `.gitignore` catches `site/.vitepress/dist`/`cache`; nothing extraneous tracked. | |
| RI5 | shipped | `site-deploy.yml` names `actions/deploy-pages` explicitly. | Live deployment itself is a post-merge, post-Pages-enablement action — see Release Readiness. |
| RI6 | shipped | `site/setup.md`'s 5 phase headings match the corrected source exactly. | |
| RI7 | shipped | `site-deploy.yml` structurally isolated from `ci.yml`'s required job. | This artifact states the deploy workflow has not yet actually run, plainly, per RI7's own acceptance note — see PR / CI Readiness. |

## PR / CI Readiness

- Base branch: `main`. Head branch: `feat/wp-r11-docs-site`.
- PR: [#41](https://github.com/JeelVankhede/agentsmyth/pull/41) — opened this phase, at the user's explicit request, specifically to obtain real CI evidence (`release.yaml` does not require a PR gate, but Ship's own refusal condition — "Verify recommendation is hold and no user-accepted waiver exists" — required either real evidence or a waiver, and the user chose evidence).
- CI provider: GitHub Actions. Check name: `validate` (from `.github/workflows/ci.yml`'s `pull_request` trigger).
- CI status: **pass**, on the second attempt.
  - Run 1 (`29812051292`): **fail**. Real defect, not a flake — `node src/workflow/validators/check-waivers.mjs` errored on a genuine false positive: its negation heuristic recognizes "no waiver" / "without a waiver" / "not ... waiver" but not "rather than record a waiver," which is exactly the phrasing `workflow/artifacts/tasks/wp-r11-docs-site-v1-p1.md` used in a scope note. Reproduced locally (`node scripts/validate-template.mjs`), confirmed as a validator gap (out of scope to fix — `src/workflow/validators/` is excluded by this WP's brief), and worked around by rewording the artifact's prose to state the same fact without tripping the heuristic (commit `f99c388`). This is the third distinct validator gap found across this work package (after `check-scope-fence`'s unbounded last-phase Touches capture, and `check-skipped-accounting`'s undocumented 6th column) — see Architecture Notes for the Reflect follow-up.
  - Run 2 (`29812351574`): **pass**. Job `validate` succeeded in 24s, completed 2026-07-21T07:57:14Z. `gh pr checks 41` → `CI Checks Summary: Passed: 1, Failed: 0`. Evidence link: https://github.com/JeelVankhede/agentsmyth/actions/runs/29812351574/job/88575911962
- Review status: not configured/requested — no reviewers assigned by this phase; PR is open for the user's own review and merge decision.
- Owner and next action: user. Merge PR #41 into `main` when satisfied; no further Ship-owned action is blocking that.

## Release Readiness

- Branch: `feat/wp-r11-docs-site`, pushed to `origin`, tracked. `gates.branch.required: true` — satisfied; a feature-branch-plus-PR flow is this repo's own established pattern (`git log` shows every prior WP merged the same way).
- Change type: additive — new `site/` directory, new `.github/workflows/site-deploy.yml`, one new step inside the existing `ci.yml` `validate` job, `vitepress` added as a `devDependency` only. No `dependencies` change, no package version bump, no change to any file under `docs/`, `src/`, `bin/`, or `validators/` (root).
- Release gate: none configured in `release.yaml` (`release.required: false`); merge to `main` is the release action, at the user's discretion.
- Live deployment: not yet exercised. The repo is currently private and GitHub Pages is not enabled — both are external, user-owned preconditions this session cannot perform. `site-deploy.yml` is syntax-valid (`js-yaml`, re-verified across Review/Test) and names `actions/deploy-pages` correctly, but has never actually run. This is stated plainly per RI7's own acceptance note and Determinism Rule "do not claim... deployments... happened without evidence" — see Blocked Handoff.

## Source-of-Truth Status

not applicable — `workflow/config/source-of-truth.yaml` has `mode: optional`, `default_required: false`, and `providers: []`; no external tracking system is configured for this repo.

## Risk And Rollback

- Residual risk (waived): `npm audit` reports 3 vulnerabilities (2 moderate, 1 high) in `esbuild`/`vite`, pulled in transitively by the new `vitepress` devDependency (GHSA-67mh-4wv8-2f99 class). No fix is currently available upstream. Scope is dev-server-only (`vitepress dev`/`site:dev`) — does not affect `vitepress build`'s shipped output, which is what actually gets deployed.
  - **Waiver record** (per `workflow/config/release.yaml`'s `waivers.required_fields`):
    - waived_gate_or_requirement_id: R4 / Verify Skipped Check "npm audit clean result"
    - reason: no fix exists upstream for the `esbuild`/`vite` chain pulled in by `vitepress`; blocking indefinitely on an unfixable upstream advisory would hold this WP forever for no actionable benefit.
    - residual risk: contributors running `npm run site:dev` locally carry the (low, dev-server-only) exposure until `vitepress` bumps its transitive `esbuild`/`vite` versions.
    - owner: user / repo maintainer.
    - follow_up_action: re-run `npm audit` after any future `vitepress` upgrade; drop this waiver once clean.
    - expiry/revisit condition: next `vitepress` (or transitive `esbuild`/`vite`) version bump.
    - approval_evidence: this session, `AskUserQuestion` — "And how do you want to handle the `npm audit` findings (3 vulnerabilities in esbuild/vite via vitepress, dev-server-only, no upstream fix exists)?" → user selected "Waive it (Recommended)."
- Residual risk (non-blocking, disclosed): the fire/ember background glow is visibly more intense near the bottom of short pages (e.g. Home) — confirmed real via real-viewport Playwright screenshots in `-p9`, not a screenshot artifact. Left unresolved by design, not oversight: it may already be the "fills the whole background" effect the user approved during the earlier Artifact-preview iteration, and changing it unilaterally risks undoing an approved creative call. Owner: user, to confirm intended or request a rebalance.
- Residual risk (non-blocking, disclosed): `-p9`'s browser audit covered only Chromium, one desktop viewport (1280×900), and two pages (home + `/install`). No mobile-viewport or cross-browser check has been performed. Owner: whoever does a pre-launch pass; reasonable Reflect follow-up, not a Ship blocker.
- Rollback area: `site/` (new VitePress site), `.github/workflows/site-deploy.yml` (new), `.github/workflows/ci.yml`'s new `site:build` step, `package.json`/`package-lock.json`'s `vitepress` devDependency.
- Rollback risk: low. All changes are additive; nothing under `docs/`, `src/`, `bin/`, or root `validators/` was touched, and no runtime dependency or package version changed — a revert cannot affect the shipped npm package.
- Rollback trigger: CI failure on `main` post-merge, or the user reporting a functional/visual regression in the merged site that isn't already a disclosed residual risk above.
- Rollback action: before merge, close PR #41 without merging (no rollback needed — nothing has touched `main`). After merge, `git revert` the merge commit; this is a clean revert since no other work has built on top of `site/` yet.
- Rollback owner: user (repo maintainer) — Ship/Build do not have merge or revert authority on `main` without explicit request.
- Rollback evidence required: the merge commit SHA (not yet assigned — PR #41 is unmerged as of this artifact).
- Rollback limits: reverting removes the doc site and its CI/deploy scaffolding entirely; it does not need to touch any other in-flight work, since this WP's Touches were scope-fenced to `site/`, two workflow files, and `package.json`/`package-lock.json` throughout Build (see Review's Architecture Notes on scope-fence corrections).

## Blocked Handoff

- provider_or_source_type: GitHub repository visibility + GitHub Pages settings (not a source-of-truth provider — a release precondition).
- source_item_or_lookup: `JeelVankhede/agentsmyth` repository settings.
- fields_or_sections_to_update: (1) Settings → General → Danger Zone → change repository visibility to Public (GitHub Pages on a free plan requires a public repo, or a paid plan for private-repo Pages); (2) Settings → Pages → Build and deployment → Source → "GitHub Actions" (this will pick up `.github/workflows/site-deploy.yml` automatically).
- owner: user — these are account/repo-administration actions no session in this environment can perform.
- exact_handoff: after merging PR #41 to `main`, make the repository public, then set Pages source to "GitHub Actions" as above. No further code change is required — `site-deploy.yml` already targets the right branch and build output.
- risk: until both steps are done, the doc site exists only in the repository, not at a live URL. This is expected pre-launch state, not a defect.
- affected_manifest_ids: R8, RI5.
- ship_impact: does not block this Ship recommendation — `release.yaml` has no deployment gate configured (`gates.deployment.required: false`), and RI7's own acceptance note already requires only that Ship "states this plainly," which this section does.

## Architecture Notes

- role: Senior DevOps
- decision: Recommendation is `ship`, not `hold` or `hold-with-waiver` for the whole artifact — Verify's original `hold` rested on exactly two blocking items (Skipped Checks marked `waiver-required`), and both are now closed: real CI evidence was obtained (not waived — an actual passing run exists), and the `npm audit` finding is formally waived per the user's explicit choice this session. No other input to `release-readiness-gate`'s aggregation fails: Review has no open P0/P1 (the one P1 found post-Test was fixed and independently re-verified before this phase), and every active `R`/`RI` has a `shipped` coverage row with no gap or unwaived `dropped` state.
- decision: Opening PR #41 was itself a real, user-approved action this phase, not something inferred from "Proceed" — `release.yaml` does not require a PR gate for this repo, and PR/CI policy is explicit that Ship must not create PRs unless the user requested it or config allows it. Asked the user directly (two separate `AskUserQuestion` calls) before pushing the branch and before opening the PR; both were explicitly approved.
- decision: The first CI run's failure was investigated as a real defect before any workaround was applied, not assumed to be unrelated noise — reproduced locally with the exact command CI runs (`node scripts/validate-template.mjs`), root-caused to a specific negation-heuristic gap in `check-waivers.mjs`, and fixed by rewording the artifact text that tripped it (not by skipping the check, not by touching the validator, which is out of this WP's scope per its brief's Non-Goals). Re-verified locally with the full `npm run validate` chain before re-pushing, and confirmed by the second real CI run passing.
- constraint: `release.yaml` configures no PR, CI, release, deployment, docs, or package gate as strictly required (`required: false` on all of them, with `default_recommendation_when_no_release_gate: ship`) — the CI-evidence requirement driving this phase's work came from R1/R5's own acceptance criteria (recorded in the brief/plan), not from `release.yaml`'s gate config. Both sources were honored: the manifest-level requirement got real evidence, and no release-config gate was left unaddressed.
- constraint: No source-of-truth provider is configured (`source-of-truth.yaml`), so Ship performed no external update or handoff for that concern — correctly recorded as not applicable rather than silently skipped.
- tradeoff: Waiving `npm audit` rather than holding indefinitely is the only actionable choice here — no upstream fix exists for the `esbuild`/`vite` chain, and the exposure is scoped to a local dev server, not the shipped site. Holding would not produce a better outcome, only a longer wait for an upstream fix with no current ETA; the waiver keeps this visible as residual risk (see Risk And Rollback) rather than pretending it doesn't exist.
- downstream: Reflect should capture, as real process findings from this WP (not hypothetical future risk): (1) three distinct validator gaps found via genuine dogfooding — `check-scope-fence`'s unbounded last-phase Touches capture, `check-skipped-accounting`'s undocumented 6th required column, and `check-waivers`'s narrow negation heuristic (misses "rather than X" as a negation of X) — all three real, all three reproduced, none touched because `src/workflow/validators/` was out of scope for this WP; (2) that this WP's Test phase correctly went to `hold` rather than guessing at CI/audit outcomes, and Ship's own two-question `AskUserQuestion` call (rather than silently assuming "Proceed" meant "waive everything") is the pattern to repeat — a generic "proceed" instruction should not be read as blanket authorization for specific, named residual-risk decisions; (3) the GitHub Pages live-deployment handoff (make repo public, enable Pages) remains the one real user-owned action left before the site is actually reachable at a URL.

## Exit Gate

- [x] Recommendation: `ship`
- [x] Every active `R` and `RI` has a `shipped` status row in Requirement Coverage.
- [x] No active unwaived blocker remains — the one waiver (npm audit, R4) has all required fields and cited user approval evidence.
- [x] PR/CI status explicit (PR #41, CI pass, run cited) and source-of-truth explicitly not applicable with config reference.
- [x] Rollback trigger, action, owner, and limits defined.
- [x] Live deployment correctly recorded as Blocked Handoff (user-owned, non-blocking per `release.yaml`), not claimed as done.

## Next Phase

Reflect. `orchestration.next_phase: reflect`.
