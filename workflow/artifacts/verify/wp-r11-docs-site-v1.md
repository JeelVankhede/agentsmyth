---
slug: wp-r11-docs-site
version: 1
artifact: verify
status: ready-for-next-phase
created: 2026-07-21
updated: 2026-07-21
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, RI1, RI2, RI3, RI4, RI5, RI6, RI7]
upstream:
  - workflow/artifacts/briefs/wp-r11-docs-site-v1.md
  - workflow/artifacts/plans/wp-r11-docs-site-v1.md
  - workflow/artifacts/tasks/wp-r11-docs-site-v1-p1.md
  - workflow/artifacts/tasks/wp-r11-docs-site-v1-p8.md
  - workflow/artifacts/tasks/wp-r11-docs-site-v1-p9.md
  - workflow/artifacts/reviews/wp-r11-docs-site-v1.md
orchestration:
  phase: test
  status: ready-for-next-phase
  next_phase: ship
  blockers: []
  user_checkpoint: none
---

# WP-R11 — Documentation Site (VitePress) - Verification

## Inputs

- Approved brief, plan, all 8 Build task artifacts, and the Review artifact (updated in place through 5 post-Review correction cycles — home layout, creative pass, forge realism, production port, performance fix).
- `workflow/config/verification.yaml`: no commands pre-configured for this repo (`commands: []`); `command_policy.allow_discovered_commands: true` — all commands below were discovered from `package.json`, `.github/workflows/`, and repo context, per that policy, not invented.
- Fresh session: every command below was run in this Test phase, independent of Build's or Review's prior runs, per `command-evidence-policy.md`'s rule against citing a previous run as current evidence.

## Automated Checks

| Command | Outcome | Evidence |
|---|---|---|
| `npm run site:build` | pass | `build complete in 1.10s`, client+server bundles + page rendering both succeeded. |
| `git diff --stat -- docs/` | pass (empty) | Zero output — `docs/` untouched. |
| `grep -rn -- "--system\|the setup interview" site/` | pass (empty) | Zero matches — no stale terms. |
| `git diff --cached --name-only -- site/ \| grep -c "dist\|cache"` | pass | `0` — no build output staged. |
| `git check-ignore -v site/.vitepress/dist/index.html site/.vitepress/cache` | pass | Both correctly matched by `.gitignore` lines 9–10. |
| `git ls-files site/ \| grep -c "dist\|cache"` | pass | `0` — nothing tracked that shouldn't be. |
| `npx --yes js-yaml .github/workflows/site-deploy.yml` | pass | Valid YAML. |
| `npx --yes js-yaml .github/workflows/ci.yml` | pass | Valid YAML. |
| `grep -l "site-deploy" .github/workflows/ci.yml` | pass (no match) | Deploy workflow isolated from the required `validate` job. |
| `grep -n "Build docs site\|Install dependencies" .github/workflows/ci.yml` | pass | Both steps present inside the existing `validate` job. |
| `grep -c "^  [a-z_-]*:$" .github/workflows/ci.yml` + manual read of `jobs:` block | pass | Only `validate:` — no second job was added. |
| `grep -n "shadowBlur" site/.vitepress/theme/ForgeBackground.vue` | pass | Comment only, zero real API calls. |
| `grep -c "createRadialGradient"` + manual read confirming placement | pass | 2 occurrences: 1 real call inside the one-time `makeSprite()`, 1 in a comment; none inside the per-frame `tick()`. |
| `grep -o "drawImage"` in `dist/assets/chunks/theme.*.js` | pass | Present — sprite-blit technique confirmed shipped. |
| `grep -c "forge-canvas"` on `dist/index.html` and `dist/install.html` | pass | `1` / `1` — background is genuinely site-wide. |
| `grep -c "VPSidebar"` on `dist/index.html` and `dist/install.html` | pass | `0` / `1` — home hero layout correct, content pages unaffected. |
| `grep -l "reveal-in"` in `dist/assets/chunks/*.js` | pass | Found — content-reveal system compiled in. |
| `grep -n "^import"` across all 4 theme files + `config.ts` | pass | Zero references to `src/` anywhere. |
| `grep -rn "outline"` across theme `.css`/`.vue` files | pass (empty) | No focus-outline removal. |
| `grep -c "text: 'Start here'\|text: 'Use it'\|text: 'How it works'\|text: 'See it whole'" site/.vitepress/config.ts` | pass | `4` — all four sidebar groups present. |
| `grep -n "^## Phase" site/setup.md` | pass | 5 headings, exact match against the corrected copy fixed earlier this session. |
| `git diff --cached package.json` | pass | `vitepress` under `devDependencies` only; `dependencies` untouched. |
| `npm audit` | flagged, not fixed | 3 vulnerabilities (2 moderate, 1 high), `esbuild`/`vite` transitively via `vitepress`, dev-server-only scope, no fix available upstream — see Skipped Checks / Findings. |
| `git status --short --branch` | informational | On `feat/wp-r11-docs-site`; working tree matches the expected staged file set; the two unrelated `.dc.html` files remain untracked and untouched throughout. |

## Manifest Coverage

| Manifest ID | How Verified | Evidence | Result | Notes |
|---|---|---|---|---|
| R1 | command + generated-output inspection | `site:build` pass; `forge-canvas` global; content present on all 12 pages | pass | Covers the locally-provable substance. The "builds ... in CI" and "deployable" clauses require a real CI run / live deployment neither Build, Review, nor Test can obtain without a push and a public repo — see Skipped Checks. **Post-Test note (added after `-p9`):** this `pass` was reached using build-success and generated-output-grep evidence only, which is structurally incapable of detecting a CSS-paint-only defect — and one existed (the hero title was fully invisible; see Findings below and `-p9`). The `pass` verdict for the substance actually checked here still holds; it should not be read as having covered visual paint correctness, which no check in this row ever claimed to test. |
| R2 | command + generated-output inspection | `site:build` pass; `docs/` diff empty | pass | |
| R3 | generated-output inspection | 4/4 sidebar groups present in `config.ts` | pass | |
| R4 | generated-output inspection | `package.json` diff: `vitepress` devDependency-only, scripts present | pass | |
| R5 | command + generated-output inspection | Step placement correct inside existing `validate` job (config-level); real CI-run evidence not obtainable | pass | Same caveat as R1 — see Skipped Checks. |
| R6 | command + generated-output inspection | Stale-term grep empty; content present | pass | |
| R7 | review evidence | Cited to the brief's own R7 acceptance note and this session's direct edits to the two `.dc.html` prototypes | pass | Evidence-only per the brief; correctly not re-executed. |
| R8 | command + generated-output inspection | Theme builds; YAML valid; isolation confirmed; nav/design structurally correct | pass | Live deployment and full pixel-level visual QA not obtainable — see Skipped Checks. **Post-Test note (added after `-p9`):** the first real-browser check performed on this site (`-p9`, using Playwright the user provided after this Test phase closed) found the home page's hero title fully invisible in every theme — a defect none of this row's own checks could have caught, since they verify build success and compiled-output structure, not paint. Fixed and re-verified across both themes; see `workflow/artifacts/tasks/wp-r11-docs-site-v1-p9.md` and the Review artifact's Finding #1. This does not retroactively fail this row's own evidence, but it does mean "structurally correct" here should not be conflated with "visually correct" — those were never the same claim, and `-p9` is the first phase that actually tested the latter. |
| RI1 | generated-output inspection | `package.json` diff: no `dependencies` change | pass | |
| RI2 | command | `git diff --stat -- docs/` empty | pass | |
| RI3 | generated-output inspection | Only `validate:` job exists in `ci.yml`; new steps inside it | pass | |
| RI4 | command | `.gitignore` catches build output; nothing tracked | pass | |
| RI5 | generated-output inspection | `site-deploy.yml` names `actions/deploy-pages` explicitly | pass | |
| RI6 | generated-output inspection | `site/setup.md`'s 5 phase headings match the corrected copy exactly | pass | |
| RI7 | generated-output inspection | `site-deploy.yml` structurally isolated from `ci.yml`'s required job | pass | The "Ship states this plainly" half of RI7 is Ship-owned and not yet executed — that's expected, not a gap here. |

## Manual QA

not applicable

R8's visual/motion quality was iteratively validated through a different, unusual-but-real mechanism this session: a live, published Artifact preview the user directly viewed and gave explicit pass/fail feedback on across six iterations (steel shine approved; fire realism approved after fixing an additive-blend wash-out bug; sparkle coverage approved after fixing a source-vs-ambient scoping bug), and one real-browser performance report (lag, root-caused and fixed). This is stronger than a single manual-QA pass/fail row would capture, but it is not a formal `manual-qa-policy.md`-shaped scenario (no fixed environment/steps/expected/observed table was recorded turn-by-turn), so it is documented here in prose rather than forced into the Manual QA table format, and the two things that specifically remain unverified (post-port pixel comparison, real frame-rate measurement) are recorded honestly below rather than folded into a false "verified" claim.

## Generated Output Evidence

not applicable — `site/.vitepress/dist/` is real generated output (VitePress build output) but is deliberately excluded from version control per RI4/A2 (verified above), not a checked-in generated artifact requiring source-mapping evidence under `repo-profile.yaml`'s `generated_output_policy`.

## Findings

- **Post-Test addendum (added after `-p9`, not part of this Test phase's own original run):** after this Test phase closed, the user supplied Playwright for real browser testing, which surfaced a genuine P1 defect this Test phase's own checks could not have caught: the home page's hero title was fully invisible in every theme, due to an orphaned CSS custom-property reference silently invalidating a `background-clip: text` gradient declaration. Root-caused, fixed, and re-verified across both themes in `-p9`; independently re-confirmed by Review via a second Playwright session. See `workflow/artifacts/tasks/wp-r11-docs-site-v1-p9.md` and the Review artifact's Finding #1 (P1) for full detail. Recorded here, not silently left out, because R1/R8 were both marked `pass` above on evidence that never actually exercised visual paint — this addendum makes that evidence gap explicit rather than letting a stale `pass` imply more than it verified.
- Otherwise: none beyond what Review already recorded and this Test phase re-confirmed still applies (the two open P2s: real CI-run evidence, `npm audit` waiver — both Ship-owned, not Test-owned).

## Skipped Checks

| Check | Why Skipped | Risk | Owner | Blocks Ship | Manifest IDs |
|---|---|---|---|---|---|
| Real GitHub Actions run of `ci.yml`'s new `site:build` step | Requires pushing to a remote; Test does not perform release or external-source actions per its own role boundary | R1/R5's "builds ... in CI" clause is verified by config only, not a live run | user (push and cite the run, or accept the gap) | waiver-required | R1, R5 |
| Live GitHub Pages deployment via `site-deploy.yml` | Repo is currently private and Pages is not enabled — an external, user-owned precondition, not something this session can perform | R8's "deployable" clause and RI5's real-world effect are unverified beyond config/syntax correctness | user (make repo public, enable Pages with source "GitHub Actions") | no — already fully disclosed as an expected pre-launch state, not a defect | R8, RI5 |
| `npm audit` clean result | 3 findings in `esbuild`/`vite`, transitively via `vitepress`, no fix currently available upstream | Dev-server-only scope (does not affect `vitepress build` output); real but low practical risk | user/Ship (explicit waiver recommended, since no fix exists to apply) | waiver-required | R4 |
| Real browser frame-rate/CPU measurement of the `-p8` performance fix | No browser or profiling tool available in this environment | The fix is justified by well-established facts about relative canvas-operation cost (sprite `drawImage` vs. `shadowBlur`/fresh gradients), not by a measured before/after number | user (confirm it's resolved, or provide profiling evidence/a specific repro if not) | no — the technique-level fix is real and independently verifiable in source/compiled output, even without a live measurement | R1, R8 |
| Full pixel-level visual comparison against `Agentsmyth Docs.dc.html` | No browser/screenshot tool available in this environment, for Build, Review, or Test | Subtler visual deltas (exact spacing, minor component styling) could exist beyond what token-level/structural checks catch | whoever does the pre-launch pass | no — mitigated by the extensive live-Artifact-preview iteration cycle this session, though that is not equivalent to a diff against the final real site | R8 |

## Architecture Notes

- role: Senior QA
- decision: R1, R5, and R8 are recorded `pass` in Manifest Coverage rather than `skip`, because the substantial majority of each requirement's substance is genuinely evidenced this session — only the specific sub-clauses requiring a live push/deployment/browser are unresolved, and those are captured explicitly as named Skipped Checks with owners rather than silently absorbed into either an optimistic `pass` or a pessimistic `skip` that would understate the real evidence gathered.
- decision: Sign-Off recommendation is `hold`, not `hold-with-waiver` — two Skipped Checks are marked `blocks_ship: waiver-required`, but no actual waiver exists yet. Per the router's own Pre-Action Gate rule, a waiver stated nowhere with recorded `approval_evidence` in a `## Waivers` block does not exist, regardless of how reasonable it would be to grant. Test does not have user waiver authority and does not self-grant one on the user's behalf; that decision belongs to Ship, where the user can actually accept it.
- decision: R8's motion/visual quality is documented in Manual QA as prose, not the standard scenario table, because the actual validation mechanism this session (iterative live Artifact-preview review with direct user pass/fail feedback across 6 rounds) doesn't cleanly fit a single environment/steps/expected/observed row — forcing it into that shape would either lose information or misrepresent a multi-round interactive process as a single QA pass.
- constraint: Per Test's own role boundary, no fix was made and no external/release action was taken during this phase — the two Skipped Checks with `blocks_ship: waiver-required` are exactly the two open items Review already flagged (Findings #1 and #2), now carried into Test's own independent evidence gathering rather than assumed unchanged.
- assumption: `workflow/config/verification.yaml` has zero pre-configured commands for this repo — every command used above was discovered from `package.json` scripts and `.github/workflows/` content, consistent with `command_policy.allow_discovered_commands: true` and `do_not_invent_commands: true`.
- decision: `node src/workflow/validators/check-skipped-accounting.mjs` initially failed — this artifact's `## Skipped Checks` table was written with 5 columns, matching `references/output-schema.md`'s own Starter Block exactly (`Check | Why Skipped | Risk | Owner | Blocks Ship`). The validator requires a 6th `Manifest IDs` column (matching `agent-behavior.yaml`'s `skipped_checks.required_fields`), which the shipped starter-block template does not show. This is the same class of gap as Review's Finding #5 (a real mismatch between documented/templated shape and enforced contract) — fixed here by adding the column, and flagged again for Reflect, since it has now been hit twice from two different validators in the same work package.
- downstream: Ship must resolve or explicitly waive both `waiver-required` Skipped Checks (real CI-run evidence, `npm audit`) before recommending `ship` outright — a `hold-with-waiver` recommendation is legitimate here if the user accepts both as residual risk, but silence on either would not be. Ship must also draft the plain, two-step external runbook (make the repo public; enable Pages, source "GitHub Actions") as the user-facing next action, and must not describe the site as live/deployed anywhere in its own artifact.
- decision (post-Test addendum): this artifact is being amended in place, not reissued as a new version, to add the `-p9` post-Test P1 finding and its evidence gap disclosure to Findings, Manifest Coverage (R1/R8), and upstream — consistent with how Review amended its own Finding #4 in place after the `-p4` home-layout fix, rather than treating a post-signoff discovery as something to omit because the phase had already closed. The Sign-Off recommendation (`hold`) is unchanged by this addendum: it was already `hold` for reasons unrelated to this defect (the two waiver-required Skipped Checks), and this defect is now fixed and verified, not an open item requiring its own hold.

## Sign-Off

- Verifier: Claude (Senior QA, lifecycle-test)
- Date: 2026-07-21
- Recommendation: hold
