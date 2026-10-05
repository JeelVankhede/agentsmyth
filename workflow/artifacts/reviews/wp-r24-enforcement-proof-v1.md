---
slug: wp-r24-enforcement-proof
version: 1
artifact: review
status: ready-for-next-phase
created: 2026-09-16
updated: 2026-09-16
manifest_ids: [R1, R2, R3, R4, RI1, RI2, RI3, RI4, RI5, RI6, RI7]
upstream:
  - workflow/artifacts/briefs/wp-r24-enforcement-proof-v1.md
  - workflow/artifacts/plans/wp-r24-enforcement-proof-v1.md
  - workflow/artifacts/tasks/wp-r24-enforcement-proof-v1.md
orchestration:
  phase: review
  status: ready-for-next-phase
  next_phase: test
  blockers: []
  user_checkpoint: none
council:
  mode: single-agent
---

# WP-R24 — Enforcement Proof & Competitive Positioning Content - Review

## Findings

Four found, four resolved in place and re-verified. Each is recorded with the evidence that closed it.

- **F1 — P2 — `scripts/capture-gate-refusal.mjs` / `site/.vitepress/theme/GateCapture.vue` — R1, RI4.**
  The generated block was injected into a Vue SFC `<template>` as
  `<pre class="gate-capture"><code>…</code></pre>` with no `v-pre`. Inside a template, `{{ … }}` is
  compiled as an interpolation — so a future gate message containing braces would be evaluated as an
  expression rather than displayed, or would break `site:build` outright. Nothing in today's transcript
  contains braces, which is precisely why this would have shipped: it is latent until the day the
  validator's wording changes, and the content is **generated**, so this file does not control what
  lands there.
  - Fix: `vueBlock()` now emits `<pre v-pre …>`, `payloadFromVue()` matches the new opening tag, and the
    reasoning is recorded at the function so it is not "tidied away" later.
  - Re-verified: block regenerated, `--check` ok, `npm run site:build` exits 0.

- **F2 — P2 — `scripts/capture-gate-refusal.mjs` — RI2.** `buildFixture()` calls
  `fs.rmSync(dir, { recursive: true, force: true })` on a path assembled from a **config value**, with
  no guard. A truncated edit, a typo, or `sandbox_root: ~` would have aimed a recursive delete at a
  real directory. The repo's own config is correct today; the script's safety should not depend on
  that staying true.
  - Fix: `sandboxRoot()` now resolves the value and refuses anything that is a filesystem root, the home
    directory, the repo root, fewer than three path segments deep, or inside the repository.
  - Re-verified: `~` and `/` refused as shallow, a path under the repo refused as in-repo, the
    configured `~/.agentsmyth/sandbox/agentsmyth` accepted; the real run is unaffected.

- **F3 — P2 — documented steps — RI2.** RI2's acceptance (b) requires steps that describe invoking the
  script and what to verify. Build shipped them as a header comment in the script and a comment in
  `GateCapture.vue`. A comment inside the thing being documented is not discoverable by someone who does
  not already know the file exists, and neither comment stated the verification steps (`--check`, the
  second-run idempotency check, `site:build`). The plan's own Repo Impact Map anticipated this by naming
  `docs/` as a candidate location.
  - Fix: `docs/regenerating-the-gate-capture.md` — what the script does in six steps, what to verify
    after running it, and the four standing rules (never hand-edit the block, never edit the hook to
    improve the output, the marker namespace, and why `capture:gate` is not a `*:test` script).
  - Re-verified: file present under a path the plan already declared; no plan amendment required.

- **F4 — P3 — `scripts/capture-gate-refusal.mjs` — RI2, RI3.** Every `git` call in `buildFixture()`
  ignored its exit status. A silently-failed `git init` or `git add` produces a fixture that looks
  assembled and a refusal that means something other than what the caption claims — the worst possible
  failure for an artefact whose entire value is that it is real.
  - Fix: `gitOrThrow()` wraps the seven setup calls and throws with the git status and stderr. The
    deliberate exception is `provoke()`'s commit, whose non-zero status **is** the product.
  - Re-verified: full run still green end to end.

## Severity Summary

| Severity | Open | Found | IDs | Status |
|---|---|---|---|---|
| P0 | 0 | 0 | — | — |
| P1 | 0 | 0 | — | — |
| P2 | 0 | 3 | F1, F2, F3 | all resolved and re-verified |
| P3 | 0 | 1 | F4 | resolved and re-verified |

## Requirement Coverage

| Manifest ID | Status | Evidence |
|---|---|---|
| R1 | covered | Capture present in `README.md` and rendered in `site/.vitepress/dist/index.html` before the features grid (index 12160 vs 13212). |
| R2 | covered | Four-row comparison table, every claim linked to its upstream file at `1d5106f`; both required re-wordings applied. |
| R3 | covered | Named paragraph on `analyze.md`'s duplication/ambiguity detection, coverage map, constitution pass and severity model, with an explicit "use Spec Kit instead if…" sentence. |
| R4 | covered | 1.1.0 entry states 35 / 7 / 28 / +1 = 36 with the counting rule; `[1.0.0]` has zero diff lines; Notion 04 — Reference updated from the same derivation. |
| RI1 | covered | Citations match the Think-phase verdicts at the pinned SHA; no claim re-derived or silently altered. |
| RI2 | covered | Script + `--check` mode + `docs/regenerating-the-gate-capture.md` (F3). Idempotency re-confirmed after the fix pass. |
| RI3 | covered | `assertHygiene()` gates on `/Users/`, `/home/`, `os.homedir()` and `version skew`, and on the absence of a failure line; plus the F2 sandbox guard. |
| RI4 | covered | `--check` compares the two payloads after stripping wrappers; both match a fresh refusal. |
| RI5 | covered | `package.json` has no `dependencies` key at all; only a `capture:gate` script line was added. |
| RI6 | covered | Counts derived at Build from `src/workflow/skills/`, not carried from the brief. |
| RI7 | covered | 1.1.0 entry gained three items; entry date still `2026-09-08`; `version` still `1.0.1`. |

## Architecture Notes

- role: Reviewer
- **decision**: F1 and F2 were both raised on *latent* risk — neither misbehaves against today's inputs.
  They are recorded as P2 rather than P3 because both sit under generated content or config, where the
  triggering input is not controlled by the file that would fail. A defect that only appears when
  someone else changes something is not a lower-severity defect; it is a later-detected one.
- **observation**: the two strongest parts of this Build both came from *distrusting the artefact*.
  `provoke()` throwing when the commit succeeds, and `--check` comparing published copies against a
  fresh capture, are what stop the proof from quietly becoming a fiction. The review's own findings were
  found by applying the same question to the generator that the generator applies to the gate.
- **constraint**: the fix pass touched only files already in the plan's Repo Impact Map (the script and
  `docs/`), plus the regenerated `GateCapture.vue` block. No plan amendment was required for the
  remediation; amendment 1 (the `GateCapture.vue` split) predates it.

## Verification Reviewed

| Evidence | Outcome |
|---|---|
| `npm run validate` | exit 0 |
| `npm run violations:test` | 217/217 violations detected; 93/93 council fixtures emit exactly one error |
| `npm run conformance:test` | 49/49 |
| `npm run site:build` | exit 0, after the `v-pre` fix |
| `npm run capture:gate` ×2 | second run leaves `git status --porcelain` unchanged |
| `npm run capture:gate -- --check` | ok — both published captures match a fresh refusal |
| Sandbox-guard probe | `~` and `/` refused as shallow; in-repo path refused; configured root accepted |
| `--check` **negative control** (added on re-review, 2026-09-17) | A published capture was deliberately tampered with (`failed with 1 issue(s)` → `0 issue(s)`); `--check` exited non-zero reporting both `GateCapture.vue capture is stale` and `the two published captures differ from each other`, then passed again after regeneration. The positive control alone would not have distinguished a working check from one that always says ok |
| `git diff` on `package.json` | one script line; `dependencies` absent and unchanged |
| `git diff` on `CHANGELOG.md` `[1.0.0]` | zero lines |

## Residual Risk

- **This review is not independent.** The agent that wrote the Build wrote this review. `council.enabled`
  is `on-for-complex` and this chain is Standard, so no Review council fired — correct per config, and
  it leaves the same structural gap OI-85 already records for WP-R22. The four findings are real and
  their fixes are evidenced, but a reviewer with no authorship stake would plausibly find things this
  pass did not.
- **The capture is verified mechanically, not visually.** `--check` proves the text matches a fresh
  refusal and `site:build` proves the page compiles; neither proves the block *looks* right at 375px or
  in dark mode. Test owns that as manual QA, and it is listed in the plan's Verification Plan as such.
- **The Spec Kit claims are pinned, not immortal.** They are true at `1d5106f` and cited there, so they
  cannot become false — but they can become *dated*, and nothing in this repo will notice when upstream
  moves.

## Recommendation

**pass** — four findings, all resolved in place and re-verified against the final tree, with the
residual risks above recorded rather than closed.
