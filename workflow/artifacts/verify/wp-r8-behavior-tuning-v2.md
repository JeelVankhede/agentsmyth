---
slug: wp-r8-behavior-tuning
version: 2
artifact: verify
status: ready-for-next-phase
created: 2026-08-14
updated: 2026-08-14
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9]
upstream:
  - workflow/artifacts/briefs/wp-r8-behavior-tuning-v1.md
  - workflow/artifacts/plans/wp-r8-behavior-tuning-v1.md
  - workflow/artifacts/tasks/wp-r8-behavior-tuning-v1.md
  - workflow/artifacts/reviews/wp-r8-behavior-tuning-v4.md
  - workflow/artifacts/verify/wp-r8-behavior-tuning-v1.md
orchestration:
  phase: test
  status: ready-for-next-phase
  next_phase: ship
  blockers: []
  user_checkpoint: none
---

# WP-R8 — Per-Repo Behavior Tuning - Verification v2

Supersedes v1, which held Ship on T1. T1 is fixed and re-verified. This version also **corrects
v1's root-cause analysis of T1**, which was wrong in a way that would have caused an unnecessary
change to the most load-bearing file in the package — that correction is recorded in full rather
than quietly dropped, because the wrong diagnosis is the more plausible-sounding one and will be
re-derived otherwise.

## Inputs

- v1 of this artifact (status `blocked`, one P2 finding).
- Task artifact Phase 18, written after Test handed T1 back to Build.
- Plan artifact amended with Phase 17 and Phase 18 blocks (required by `check-scope-fence`, which
  reads declared `Touches` from the plan, not the task).
- All evidence from v1 that remains valid — MQ-1 through MQ-4 were not re-run, since nothing in the
  Phase 18 fix touches the consumer bootstrap, upgrade-skew, backward-compat, or artifact-ratchet
  paths they cover. What was re-run is the full ten-suite gate, below.

## Automated Checks

| Command | Outcome | Evidence |
|---|---|---|
| `npm run build` | pass | Re-run after the Phase 18 source change; `build-bundle: ok`. |
| `npm run validate` | pass | 25 validators, exit 0, including `check-scope-fence` against the amended plan. |
| `npm run violations:test` | pass | 29/29. |
| `npm run tuning-merge:test` | pass | **11/11** (was 8/8 — m9, m10, m11 added). |
| `npm run setup-checks:test` | pass | 6/6. |
| `npm run setup-refs:test` | pass | 5/5. |
| `npm run conformance:test` | pass | 15/15. |
| `npm run root-resolution:test` | pass | 16/16. |
| `npm run init-prepare-interop:test` | pass | 33/33. |
| `npm run checkpoint-approval:test` | pass | 3/3. |
| `npm run setup-validator-definitions-root:test` | pass | 3/3. |
| `npm run commit-coverage:test` | pass | 7 passed, 0 failed. |

**128 assertions across ten suites**, up from 125. The three added are the T1 fix.

## Manifest Coverage

| Manifest ID | How Verified | Evidence | Result | Notes |
|---|---|---|---|---|
| R1 | command | `check-config: ok`; `w-tuning-unknown-key` rejected | pass | — |
| R2 | command | fixture `w` rejects a non-allowlisted key by name | pass | — |
| R3 | command | fixtures `y` and `z` rejected | pass | — |
| R4 | command + manual | `required:` untouched; MQ-3 consumer exits 0 with deferred warnings | pass | Carried from v1. |
| R5 | command | intent block accepted; `aa`/`ab` floor fixtures rejected | pass | — |
| R6 | command | m9 — a tuned symbolic threshold flips the outcome; `ad` predicate-rewrite fixture rejected | pass | Now mechanically covered. |
| R7 | manual | MQ-1 — fresh `init` emits PS-1…PS-11 | pass | Carried from v1. |
| R8 | manual | MQ-2 — skew appends PS-9/10/11, idempotent, exit 0 | pass | Carried from v1. |
| RI1 | manual | six tunables traced to consumption points | pass | See v1's grep correction. |
| RI2 | command | **m9 + m10 + m11**, mutation-tested | **pass** | Was v1's fail. |
| RI3 | command | ratchet in `validate`; MQ-4 proves it fires on this chain's own artifact | pass | Carried from v1. |
| RI4 | command | 29/29 | pass | — |
| RI5 | command | `x-tuning-locked-key` rejected | pass | — |
| RI6 | manual | `config-map.md` documents all six tunables and the resolution rule | pass | — |
| RI7 | command | `aa`/`ab` rejected | pass | — |
| RI8 | command | `ac-intent-stale-provenance` rejected | pass | — |
| RI9 | manual | MQ-3 — v1.0.0 config with no `tuning:`/`intent:` exits 0 | pass | Carried from v1. |

**17/17 pass.** No fail, skip, or waived rows.

## Manual QA

MQ-1 through MQ-4 stand as recorded in v1 (packed-tarball consumer bootstrap, v1.0.0 upgrade skew,
backward compatibility, and the artifact ratchet on this chain's own brief). They were not re-run:
Phase 18 changed one validator's argument parsing and added test-only files, none of which is
reachable from those paths.

**MQ-5 (revised) — the merged overlay, now under CI rather than by hand**

v1 verified this manually and recorded it as a mechanism that worked but had no automated cover.
That is now m9/m10/m11 and needs no manual step. What replaced the manual check is the mutation
test below, which is stronger: it proves the *assertions* work, not just the mechanism.

**MQ-6 — mutation test: do the new assertions actually catch the regression they name?**

- Environment: working tree, ten-suite gate.
- Steps: replaced all three `mergeTunedMap(...)` calls in `check-trigger-predicates.mjs` with direct
  reads of the global maps — i.e. deleted the entire WP-R8 resolution change — then ran the gate.
- Expected: the new assertions fail; the old gate does not.
- Observed:

  | Check | With merge wiring | With wiring removed |
  |---|---|---|
  | `npm run validate` | exit 0 | **exit 0** |
  | `npm run violations:test` | 29/29 | **29/29** |
  | `npm run tuning-merge:test` | 11/11 | **9/11 — m9 and m10 fail** |
  | m11 (untuned control) | pass | pass |

- Outcome: pass. The two columns differing only in the new suite is the exact shape of the claim:
  before Phase 18 nothing in the repo could tell these two states apart. The control staying green
  in both columns is what rules out m9/m10 failing for an unrelated reason.
- Wiring restored and byte-verified afterward: 3 `mergeTunedMap` call sites back, and the 8
  `globToRegex` NUL sentinels intact (the file is rewritten by script during the mutation, so
  confirming the sentinels survived is not paranoia — losing them would silently corrupt every glob
  pattern while leaving the file syntactically valid).

## Generated Output Evidence

- `npm run build` re-run after the Phase 18 source change; `build-bundle: ok`,
  `render-adapters: adapter shims are current`.
- `src/workflow/validators/check-trigger-predicates.mjs` is a bundled source file, so the `--dir`
  addition propagates to `dist/workflow-bundle.md` and root `validators/`; the rebuild is what makes
  that true rather than assumed.
- The two new fixtures live under `test/`, which is absent from `package.json` `files` — they are
  development-only and do not enter the tarball.
- The v1 tarball evidence (39 files packed, `scripts/` excluded) is unaffected by Phase 18.

## Findings

**T1 — RESOLVED 2026-08-14.** The repo-local tuning overlay had no regression cover.

- Manifest IDs: RI2, R6.
- Fixed in Phase 18: `--dir <path>` added to `check-trigger-predicates.mjs`; fixtures
  `test/fixtures/tuning-resolution/thresholds-applied` and `weights-applied` added; assertions m9,
  m10, m11 added to `run-tuning-merge-tests.mjs`.
- Verified by MQ-6 above rather than by the fix passing its own tests.
- `weights-applied` was chosen deliberately over a second threshold fixture: it tunes
  `files_touched.per_unit` without `cap`, the F1 shape. Merged correctly, `cap` survives, the score
  is 69 and the predicate flips. Merged shallowly, `cap` is lost, `Math.min(90, undefined)` is
  `NaN`, the comparison goes false, and the fixture would be *accepted*. So m10 is green only when
  the merge is both wired and deep — one fixture covering both the T1 and F1 failure modes.

**Correction to v1's diagnosis of T1.** v1 stated the cause was `_dataRoot` being derived as
`join(repoRoot, _wf)` and therefore redirected by `AGENTSMYTH_WF`, and recommended decoupling the
two roots. That is a true statement about `AGENTSMYTH_WF` invocations and **irrelevant to this
validator**: `validate-template.mjs` runs `check-trigger-predicates.mjs` in its `artifactCommands`
group under `AGENTSMYTH_HOME`, so definitions resolve to `src/workflow` while the data root
correctly stays `workflow/`. The overlay was fully reachable under `npm run validate` all along.

How the error happened, since it is instructive: v1 tested the validator three ways — bare (reads
the stale v1.0.0 global, which has literal thresholds and no `thresholds` map), with
`AGENTSMYTH_WF` (redirects both roots), and with `AGENTSMYTH_HOME` (correct). It never ran the one
command that settles it, `npm run validate` with a `tuning:` block actually present. Doing that
produced an immediate failure on the flipped predicate and falsified the diagnosis in one step.
The real defect was narrower than v1 claimed — no fixture supplied tuning — and the fix is
test-only. Had v1's recommendation been implemented, `lib.mjs`'s root resolver would have been
changed to fix nothing.

**Observation withdrawn from v1: the Skipped Checks column mismatch is not a source defect.**
v1 recorded that `lifecycle-test/references/output-schema.md` shows a five-column Skipped Checks
table while the validator requires six. The source file
(`src/workflow/skills/lifecycle-test/references/output-schema.md`) already has all six columns.
The five-column version is in `~/.agentsmyth/workflow/`, a **v1.0.0 global install** — the skew
this work package exists to reconcile, encountered firsthand while building it. No source change
needed; the fix is `agentsmyth prepare`. Worth keeping in the record as unplanned evidence that the
skew problem is real and does silently mislead an agent following the documented template.

No open findings.

## Skipped Checks

| Check | Why Skipped | Risk | Owner | Blocks Ship | Manifest IDs |
|---|---|---|---|---|---|
| `agentsmyth prepare` against the real `~/.agentsmyth` | `prepare` writes to `homedir()` unconditionally and would overwrite the global install plus five tools' global config files | Low — the sandboxed run exercised identical code with only `$HOME` differing; nothing in `prepare` branches on the home path's value | Jeel Vankhede | no | R7, R8 |
| Multi-tool adapter verification beyond file placement | MQ-1 confirmed all five global command files were written, but no Codex/Cursor/Windsurf/Copilot session was driven | Low — `render-adapters` proves gate-content parity mechanically; per-tool loading is unchanged by this work package | Jeel Vankhede | no | R7 |
| Real-world upgrade from a *published* 1.0.0 install | The v1.0.0 consumer was simulated by editing a 1.0.1-generated repo down to 1.0.0 shape rather than installing 1.0.0 from the registry | Low-moderate — the simulation was made faithful (version stamp, no `intent:` block, PS truncated to 1…8), but a real 1.0.0 tarball could differ in ways not reproduced | Jeel Vankhede | no | R8, RI9 |
| Re-run of MQ-1…MQ-4 after the Phase 18 fix | Phase 18 changed one validator's argument parsing and added test-only files; none of those paths is reachable from the consumer bootstrap, skew, back-compat, or ratchet flows | Low — the full ten-suite gate was re-run and is green; the unchanged paths have unchanged evidence | Jeel Vankhede | no | R7, R8, RI3, RI9 |

## Architecture Notes

- role: Senior QA
- **decision — mutation-test the fix rather than accept a green suite.** A new assertion that
  passes proves nothing on its own; what matters is whether it fails when the thing it guards is
  broken. Removing the merge wiring and watching `validate` and `violations:test` stay green while
  only the new assertions dropped is the evidence that Phase 18 closed the gap, and it is the same
  discipline the chain reached for at F1 (`m2`/`m8` verified to fail pre-fix) and F9 (96/0/0 vs
  95/1/1). Adopting it as the default for any test written to close a coverage finding is the
  single most transferable thing in this chain.
- **decision — record the wrong diagnosis instead of replacing it.** v1's `_dataRoot` analysis was
  coherent, specific, and wrong, and someone re-reading `lib.mjs` will reconstruct it. Leaving only
  the corrected version would strip the one detail that prevents that: which command distinguishes
  the two explanations.
- **correction — the defect class count stays at six, not seven.** v1 called T1 a seventh instance
  of "something written to enforce a contract, wired to nothing." On the corrected analysis it is
  not that: the code was wired and reachable, only untested. That is a coverage gap, a different
  and milder thing, and inflating the count would have distorted Reflect's central lesson. Reflect
  should carry **six**.
- **constraint — Phase 18 required amending the plan, not just the task.** `check-scope-fence`
  resolves declared `Touches` from the plan's `### Phase N` blocks, unioned Phase 1 through active.
  A Test-driven fix therefore cannot be recorded in the task alone; Phases 17 and 18 were both
  added to the plan. Worth knowing before the next late-phase fix.
- **assumption Ship must preserve:** that `scripts/` and `test/` stay out of `package.json`
  `files`. The bounded severity of T1 and Review's F7 blast-radius conclusion both depend on the
  first; the second is what keeps the new fixtures out of the tarball.
- **downstream:** Ship may start. Ship owes the two Notion corrections (Q1 allowlist-home wording;
  the Standard→Complex reclassification) and a release-checklist entry to remove the
  `warn-until-1.2.0` markers when 1.2.0 ships. Reflect should carry the six-instance defect class,
  the mutation-testing lesson, the 96 grandfathered violations, the still-unwired
  `lifecycle-artifact.schema.yaml`, and `CLAUDE.md`'s stale "4 fixtures" line (now 29).

## Sign-Off

- Verifier: Claude (Senior QA), with Jeel Vankhede
- Date: 2026-08-14
- Recommendation: **ship**

All 17 requirements verified. T1 is fixed and the fix is mutation-tested rather than assumed — with
the merge wiring removed, `npm run validate` and `violations:test` both still pass while m9 and m10
fail and the untuned control holds, which is precisely the blind spot v1 identified.

Two corrections to v1 are recorded above and both narrow the finding rather than widen it: T1's
cause was a missing fixture, not a root-resolution defect, and the Skipped Checks column mismatch
was my stale global install rather than a source bug. Neither changes the outcome; both change what
a future reader would otherwise conclude.

Residual risk is unchanged from Review v4 and remains accepted, not resolved: 96 grandfathered
artifact violations with no owner, `lifecycle-artifact.schema.yaml` still unwired, no live consumer
repo has exercised the upgrade path against a genuinely published 1.0.0 tarball, and the
`warn-until-1.2.0` deprecation window has no expiry mechanism.
