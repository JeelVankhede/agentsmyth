---
slug: wp-r24-enforcement-proof
version: 1
artifact: verify
status: ready-for-next-phase
created: 2026-09-17
updated: 2026-09-17
manifest_ids: [R1, R2, R3, R4, RI1, RI2, RI3, RI4, RI5, RI6, RI7]
upstream:
  - workflow/artifacts/briefs/wp-r24-enforcement-proof-v1.md
  - workflow/artifacts/plans/wp-r24-enforcement-proof-v1.md
  - workflow/artifacts/tasks/wp-r24-enforcement-proof-v1.md
  - workflow/artifacts/reviews/wp-r24-enforcement-proof-v1.md
orchestration:
  phase: test
  status: ready-for-next-phase
  next_phase: ship
  blockers: []
  user_checkpoint: none
---

# WP-R24 — Enforcement Proof & Competitive Positioning Content - Verify

## Inputs

Full chain: brief (`brief-review` approved), plan (`plan-review` approved, amended once at Build for
`GateCapture.vue`), task (seven phases complete), review (`pass`, four findings found and resolved).

Every command below was re-run against the **final** tree — after the review fix pass, not before it.
The review's own numbers were recorded pre-fix, which is why they are re-derived here rather than cited.

## Automated Checks

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `npm run validate` | configured, required at review+ship | pass (exit 0) | `verification.yaml` command id `validate`. |
| `npm run violations:test` | configured, required at review+ship | pass | 217/217 violations detected; attribution sweep 93/93 council fixtures emit exactly one error. |
| `npm run conformance:test` | discovered | pass | 49/49 conformance checks passed. |
| `npm run site:build` | discovered | pass (exit 0) | The check that would catch a broken home-layout edit or a Vue compile failure. |
| `npm run agents-md:test` | discovered | pass | 33/33. Run because this chain introduces a **second** marker family (`agentsmyth:capture`) into a repo where `init` already locates `agentsmyth:<version>` blocks by pattern; this suite is what would fail if the two collided. |
| `npm run capture:gate` (run 1) | generated output | pass | Rewrote both published copies from a real refusal. |
| `npm run capture:gate` (run 2) | generated output | pass | `git status --porcelain` byte-identical before and after — idempotency. |
| `npm run capture:gate -- --check` | generated output | pass | `ok — both published captures match a fresh refusal`. |
| `--check` **negative control** | generated output | pass | A published capture was tampered with (`failed with 1 issue(s)` → `0 issue(s)`); `--check` exited non-zero naming both `GateCapture.vue capture is stale` and `the two published captures differ from each other`; green again after regeneration. |
| Sandbox-guard probe | safety | pass | `~` and `/` refused as shallow; a path inside the repo refused; the configured root accepted. |
| `git diff package.json` | invariant | pass | One `capture:gate` script line. `dependencies` is absent from the file entirely. |
| `git diff CHANGELOG.md` `[1.0.0]` section | invariant | pass | Zero lines. The `34 skills` claim is untouched. |

## Manifest Coverage

| Manifest ID | Status | Evidence |
|---|---|---|
| R1 | verified | Capture present in `README.md`; rendered in `site/.vitepress/dist/index.html` with `gate-capture-wrap` at index 12160 and the features grid at 13212 — i.e. between hero actions and features, as Q2 specified. |
| R2 | verified | Four claims, each linked to its file at `1d5106f`; both required re-wordings present ("never opens the artifacts it gates on"; "no **git** hook", with the agent-hook distinction stated). |
| R3 | verified | Names `analyze.md`'s duplication/ambiguity detection, requirement-to-task coverage map, constitution-alignment pass and severity model, and states who should use Spec Kit instead. |
| R4 | verified | 1.1.0 entry states 35 / 7 / 28 / +1 = 36 with the counting rule; `[1.0.0]` zero-diff; Notion 04 — Reference updated from the same derivation. |
| RI1 | verified | Published citations match the Think-phase verdicts at the pinned SHA; no verdict re-derived at Build. |
| RI2 | verified | Script + `--check` (positive **and** negative control) + `docs/regenerating-the-gate-capture.md`; idempotent across two consecutive runs. |
| RI3 | verified | `assertHygiene()` gates on `/Users/`, `/home/`, `os.homedir()`, `version skew`, and the absence of a failure line; the published transcript contains none of them. Sandbox guard added at review F2. |
| RI4 | verified | `--check` compares both payloads after stripping wrappers; the negative control proves it detects divergence rather than always passing. |
| RI5 | verified | `package.json` has no `dependencies` key; only a script line was added. No phase touched `src/workflow/`, `src/setup/` or `src/adapters/`, so no rebuild was owed. |
| RI6 | verified | Counts derived at Build from `src/workflow/skills/`; the published figure equals a fresh derivation. |
| RI7 | verified | Three `[1.1.0]` entries added; entry date still `2026-09-08`; `package.json` version still `1.0.1`. |

## Manual QA

| Field | Value |
|---|---|
| scenario | The published capture renders on the docs site home in the intended position, is horizontally contained, and resolves colours in both themes. |
| environment | macOS, Node 24, `vitepress@1.6.4`, built output under `site/.vitepress/dist/` (build exit 0). No browser driver is installed in this repo — see Skipped Checks. |
| steps | 1. `npm run site:build`. 2. Locate `gate-capture-wrap` and the features grid in `dist/index.html` and compare indices. 3. Extract the `.gate-capture` rule from the built stylesheet. 4. Extract the `@media (max-width: 640px)` block and confirm it carries the capture overrides. 5. Confirm the colour declarations are VitePress theme variables rather than literals. |
| expected | Capture precedes the features grid; `overflow-x: auto` present on the built rule; mobile overrides present; all colours expressed as `var(--vp-*)`. |
| observed | Capture at 12160 vs features at 13212. Built rule: `.gate-capture{margin:0;padding:16px 18px;overflow-x:auto;border:1px solid var(--vp-c-divider);border-radius:10px;background:var(--vp-code-block-bg, var(--vp-c-bg-alt));color:var(--vp-c-text-1);…}`. Mobile block present: `@media (max-width: 640px){.gate-capture-wrap{padding:0 16px;margin-top:28px}.gate-capture{font-size:11.5px}}`. Every colour is a theme variable, so both themes resolve from one declaration. |
| outcome | pass |
| evidence | Built artefacts inspected directly (`dist/index.html`, `dist/assets/style.DH5gT_NN.css`), not source. |
| manifest_ids | R1, RI4 |

**What this does not establish**, stated plainly: that the block *looks* correct. Confirming the
containment mechanism is present in the built CSS is not the same as observing no horizontal scroll at
375px, and reading `var(--vp-c-text-1)` is not the same as seeing legible contrast in dark mode. That
distinction is the Skipped Check below, not a claim quietly folded into this pass.

## Generated Output Evidence

The two published capture blocks are generated output under `repo-profile.yaml`
`generated_output_policy`, and `verification.yaml` sets
`generated_output.source_only_inspection_is_not_enough`.

- **Source mapping**: both blocks ← `scripts/capture-gate-refusal.mjs`, which is their only writer.
- **Regeneration method**: `npm run capture:gate`; verification via `npm run capture:gate -- --check`.
- **The artefacts themselves were verified**, not the generator: `--check` compares the *published*
  README and `GateCapture.vue` payloads against a freshly provoked refusal, and the negative control
  confirms it fails when they diverge. Reading the script and concluding it works would not have
  satisfied this rule, and was not the evidence relied on.
- **Self-invalidating by design**: `provoke()` throws if the gate ever permits the commit, so the
  capture cannot silently degrade into a claim that is no longer true.

## Findings

none

## Skipped Checks

| check | why_skipped | risk | owner | blocks_ship | manifest_ids |
|---|---|---|---|---|---|
| Real-browser visual QA of the capture block — no horizontal page scroll at 375px, and contrast/legibility in dark mode | No browser driver is available in this repo: `devDependencies` are `@clack/prompts`, `esbuild`, `mermaid`, `vitepress`, `vitepress-plugin-mermaid`, and `node_modules/.bin` holds no Playwright, Puppeteer or Chrome binary. Installing one to satisfy this check would add tooling this chain has no mandate to add | Low — the containment mechanism (`overflow-x: auto`, `max-width: 760px`, a 640px override) is confirmed present in the **built** stylesheet, and every colour is a VitePress theme variable rather than a literal, so a theme regression would have to be a VitePress regression. Residual exposure is cosmetic: wrapping or spacing that looks wrong without being broken | user | no | R1, RI4 |

This is the same gap OI-39 already records for the site at large ("broaden real-browser QA coverage
beyond Chromium at one desktop viewport"). This chain adds one more block to that unswept surface
rather than opening a new class of exposure.

## Architecture Notes

- role: Verifier
- **decision**: every command was re-run against the post-fix tree rather than citing the review's
  numbers. The review recorded its counts before the F1–F4 remediation, and a verify artifact that
  quotes pre-fix evidence for a post-fix tree is exactly the class of drift this phase exists to catch.
- **decision**: `agents-md:test` was run although no phase touched `AGENTS.md`. This chain introduces a
  second marker family into a repo where `init` locates blocks *by pattern*, and that suite is what
  would fail on a collision. Verifying the absence of an interaction is worth one command.
- **observation**: the negative control is the single most valuable check in this artifact, and it did
  not exist until Review asked for it. `--check` passing proved nothing on its own — a function that
  always returns ok passes a positive control perfectly.
- **constraint**: `release.yaml` sets `ci.provider: none` for this repo's own config, so no CI gate is
  satisfied here. GitHub Actions runs on a PR as a consequence of opening one, which is Ship's concern.

## Sign-Off

- Verifier: agent (Test phase, single-agent — councils are Complex-only and this chain is Standard)
- Date: 2026-09-17
- Checks: 12 automated, all pass · 1 manual QA, pass · 1 skipped check, `blocks_ship: no` · 0 findings
- Recommendation: **ship**
