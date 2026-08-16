---
slug: wp-r8-behavior-tuning
version: 1
artifact: verify
status: blocked
created: 2026-08-14
updated: 2026-08-14
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9]
upstream:
  - workflow/artifacts/briefs/wp-r8-behavior-tuning-v1.md
  - workflow/artifacts/plans/wp-r8-behavior-tuning-v1.md
  - workflow/artifacts/tasks/wp-r8-behavior-tuning-v1.md
  - workflow/artifacts/reviews/wp-r8-behavior-tuning-v4.md
orchestration:
  phase: test
  status: blocked
  next_phase: ship
  blockers:
    - "T1 — mergeTunedMap's only production consumer is never exercised with a real repo-level tuning block by any automated check, so the merge branch is dead under npm run validate"
  user_checkpoint: none
---

# WP-R8 — Per-Repo Behavior Tuning - Verification

## Inputs

- Brief, plan, task, and review v4 (all `ready-for-next-phase`).
- Phase gate: `agentsmyth check --phase test --slug wp-r8-behavior-tuning` → exit 0.
- `workflow/config/verification.yaml` (configured commands: `validate`, `violations-test`).
- Review v4's stated assumption for Test: *"that `npm run validate` fails when an artifact this
  chain produced is broken — demonstrated on a real artifact rather than an injected fixture."*

Two things shaped this phase beyond re-running Review's evidence. First, Review cited four test
suites; the repo has ten, and regression surface matters more here than the suites this chain
touched. Second, three items sat in Residual Risk across all four review rounds as *assumption*
rather than evidence — the live consumer upgrade path chief among them. Those were the ones worth
spending Test on, and one of them produced a finding.

## Automated Checks

| Command | Outcome | Evidence |
|---|---|---|
| `npm run build` | pass | `build-bundle: ok`; schemas re-synced; `bin/prompts.mjs` copied. |
| `npm run validate` | pass | 25 validators. `check-config: ok`, `check-schema-keywords: ok` (11 schemas / 20 keywords), `check-trigger-predicates: ok` (10 predicates), `validate-example: ok`, `render-adapters: adapter shims are current`. |
| `npm run violations:test` | pass | 29/29 violations detected. |
| `npm run tuning-merge:test` | pass | 8/8 (`m1`…`m8`). |
| `npm run setup-checks:test` | pass | 6/6. |
| `npm run setup-refs:test` | pass | 5/5. |
| `npm run conformance:test` | pass | 15/15. |
| `npm run root-resolution:test` | pass | 16/16. |
| `npm run init-prepare-interop:test` | pass | 33/33. |
| `npm run checkpoint-approval:test` | pass | 3/3. |
| `npm run setup-validator-definitions-root:test` | pass | 3/3. |
| `npm run commit-coverage:test` | pass | 7 passed, 0 failed. |

All ten suites green — 125 assertions total. The six suites Review did not cite
(`setup-refs`, `conformance`, `root-resolution`, `checkpoint-approval`,
`setup-validator-definitions-root`, `commit-coverage`) were run to confirm this chain's changes to
`lib.mjs` and the schema engine caused no regression outside the tuning surface. None did.

## Manifest Coverage

| Manifest ID | How Verified | Evidence | Result | Notes |
|---|---|---|---|---|
| R1 | command | `check-config: ok` against full `tuning:` block; `w-tuning-unknown-key` rejected | pass | — |
| R2 | command | `violations:test` fixture `w` rejects a non-allowlisted key by name | pass | Enumeration, not shape check. |
| R3 | command | fixtures `y` (looser `dispatch.enabled`) and `z` (dropped checkpoint) both rejected | pass | Union rule holds. |
| R4 | command + manual | `required:` untouched; MQ-3 consumer with non-string `env` exits 0 with deferred warnings | pass | Minor-bump guarantee intact. |
| R5 | command | intent block accepted; `aa`/`ab` floor fixtures rejected | pass | — |
| R6 | command + manual | 10 predicates evaluate correctly; `ad` predicate-rewrite fixture rejected; MQ-5 flips a symbolic threshold end-to-end | pass | Mechanism correct — see T1 for its *coverage*. |
| R7 | manual | MQ-1: fresh `init` emits PS-1…PS-11 including the three intent items | pass | Real tarball, sandboxed HOME. |
| R8 | manual | MQ-2: skew on a completed v1.0.0 repo appends PS-9/10/11, idempotent over 3 runs, exit 0 | pass | Non-blocking confirmed. |
| RI1 | manual | Six tunables traced to consumption points; `weights`/`path_glob_categories` consumed in code (RI2), the rest in prose | pass | See Architecture Notes on the grep correction. |
| RI2 | manual | MQ-5: repo tuning `domain.clean-code-architect` 50→0 flips the outcome and fails the check | **fail** | Mechanism works; **no automated check exercises it** — T1. |
| RI3 | command | `check-artifacts` and `check-schema-keywords` both in `validate`; MQ-4 proves the ratchet fires on this chain's own artifact | pass | — |
| RI4 | command | 29/29 | pass | — |
| RI5 | command | `x-tuning-locked-key` rejected | pass | — |
| RI6 | manual | `src/setup/references/config-map.md` documents all six tunables, resolution order, union exception, locked set | pass | — |
| RI7 | command | `aa`/`ab` floor fixtures rejected | pass | — |
| RI8 | command | `ac-intent-stale-provenance` rejected | pass | — |
| RI9 | manual | MQ-3: v1.0.0 config with no `tuning:`/`intent:` and non-string `env` → exit 0 + deferred warnings | pass | Backward compat holds on the real consumer surface. |

16 pass, 1 fail (RI2). No skipped or waived rows.

## Manual QA

All manual QA ran against the **packed tarball** (`npm pack` →
`jeelvankhede-agentsmyth-1.0.1.tgz`, 39 files), not the working tree, so what was tested is what
ships. `prepare` writes to `homedir()` unconditionally and would have overwritten the real
`~/.agentsmyth` plus the global adapter files in `~/.claude/`, `~/.codex/`, `~/.cursor/`. All runs
therefore used a sandboxed `HOME`; the override was verified before being relied on
(`os.homedir()` honours `$HOME` on POSIX), and the real global install was confirmed untouched
afterwards — `~/.agentsmyth/workflow/router.md` and `~/.claude/CLAUDE.md` both still dated
2026-07-26.

**MQ-1 — fresh consumer bootstrap (R7)**

- Environment: sandboxed `HOME`, fresh `git init` + `npm init` repo, tarball installed from disk.
- Steps: `agentsmyth prepare` → `agentsmyth init`.
- Expected: global tree at `$HOME/.agentsmyth/workflow/`; `pending-setup.yaml` seeded with intent items.
- Observed: `prepare` exit 0, installed global invocation commands for all five tools, global tree
  present (`router.md`, `rules.md`, `agent-behavior.yaml`, `schemas/`, `skills/`, `validators/`).
  `init` exit 0. `pending-setup.yaml` carries **PS-1…PS-11**, with PS-9 `intent.repo_character`,
  PS-10 `intent.surface_map`, PS-11 `intent.concerns`.
- Outcome: pass.

**MQ-2 — upgrade skew on a completed v1.0.0 repo (R8)**

This is the item v1–v3 carried as residual risk every round and never exercised.

- Environment: copy of MQ-1's repo, made faithful to a genuine 1.0.0 install —
  `agentsmyth_version: 1.0.0`, no `intent:` block in `repo-profile.yaml`, and `pending-setup.yaml`
  truncated to PS-1…PS-8 (a 1.0.0 repo never had the intent items at all).
- Steps: `agentsmyth check` ×3, then complete setup (fill placeholders, write
  `docs/knowledge-map/repo-mental-map.md`, remove `.agentsmyth/`) and check again.
- Expected: skew detected and reported as informational; exactly three items appended; idempotent;
  does not block once setup is otherwise complete.
- Observed: run 1 printed *"version skew detected — repo-profile.yaml was written by v1.0.0, CLI is
  v1.0.1"* and *"Added 3 per-repo tuning item(s)"*. Items appended as **PS-9/10/11**, numbering
  continuing correctly from PS-8 with no collision. Runs 2 and 3 printed the skew line but **not**
  the "Added 3" line; 11 items total after three runs, `uniq -d` on the ID list returned nothing.
  After setup completion: `check-setup-complete: ok`, `check-lifecycle: ok`, **exit 0** with
  PS-9/10/11 still `status: open`.
- Outcome: pass. This is the precise behavior asked for — absorbed, non-blocking, user continues
  working while repo-level config stays unresolved.

**MQ-3 — backward compatibility of a 1.0.0-era config (R4, RI9)**

- Environment: the MQ-2 consumer, with `commands[0].env: {PORT: 8080, DEBUG: true}` — the shape F4
  was raised about.
- Observed: `agentsmyth check` exit 0. Run directly, `check-config` exit **0** with two deferred
  warnings naming the version and the remedy: *"expected type string, got number (not enforced
  until v1.2.0 — fix now to stay compatible)"*.
- Outcome: pass.
- Note recorded as an observation, not a defect: `agentsmyth check` does not run `check-config` on
  the consumer surface at all — it resolves `check-setup-complete` and `check-lifecycle` only. So a
  consumer sees these warnings when an agent runs the lifecycle validators, not from `check`. This
  matches Review's blast-radius finding and is why the deprecation window is low-risk.

**MQ-4 — the ratchet enforces this chain's own work (RI3; Review v4's stated assumption)**

- Steps: changed `status: ready-for-next-phase` → `status: complete` in
  `workflow/artifacts/briefs/wp-r8-behavior-tuning-v1.md` — the exact drift shape 42 grandfathered
  artifacts carry — then ran `node scripts/validate-template.mjs`.
- Observed: `check-artifacts: failed with 1 issue(s)` —
  *"…briefs/wp-r8-behavior-tuning-v1.md.frontmatter.status expected one of draft, in-progress,
  blocked, blocked-for-user, ready-for-next-phase, done, got "complete""*, and
  `validate-template.mjs` aborted non-zero.
- Restored; `check-artifacts` back to `96 pre-existing violation(s) grandfathered, 0 new, 0 stale`.
- Outcome: pass. The baseline grandfathers old debt and does not excuse new work, including this
  package's own.

**MQ-5 — merged threshold resolution, end to end (RI2, R6)**

- Steps: appended `tuning.skill_scoring.thresholds.domain.clean-code-architect` to this repo's
  `repo-profile.yaml` and ran `check-trigger-predicates` in the **consumer path shape**
  (`AGENTSMYTH_HOME=$PWD/src/workflow`, so definitions come from source while the data root stays
  `workflow/`).
- Expected: lowering the threshold from 50 to 0 makes a pure-score predicate always true, flipping
  `domain.clean-code-architect` from the fixture's expected `skipped` to `ran`, and failing.
- Observed: exit **1** — *"predicate "complexity_score >= thresholds.domain.clean-code-architect"
  evaluates to "ran" against the sandbox scenario, but …expected-triggers.yaml expects "skipped""*,
  preceded by *"using repo-local tuning.skill_scoring.thresholds from …/repo-profile.yaml"*.
- Outcome: pass **for the mechanism**. The same tuning under `npm run validate`'s environment
  produced exit 0 and no tuning line at all — which is finding T1.
- `repo-profile.yaml` restored; `git diff` on it is empty and `npm run validate` exits 0.

## Generated Output Evidence

`npm run build` is the generator; `dist/workflow-bundle.md`, `dist/setup-bundle.md`,
`workflow/schemas/`, root `validators/`, and `src/assets/adapters/` are its products.

- Rebuilt from source this phase; `build-bundle: ok`.
- `render-adapters: adapter shims are current` — confirms all five adapters carry identical gate
  content, checked against source rather than inspected by eye.
- The packed tarball used for MQ-1…MQ-3 was produced by `npm pack` **after** the rebuild, so the
  consumer-path evidence above is evidence about generated output, not about `src/`.
- `scripts/` is absent from `package.json` `files` (39 files packed) — re-confirmed this phase,
  which is what bounds T1's impact to the development gate.

## Findings

**T1 — the merged-tuning code path is dead under `npm run validate`, so RI2 has no mechanical
regression cover.**

- Area: `src/workflow/validators/lib.mjs` (root resolution) × `check-trigger-predicates.mjs`.
- Manifest IDs: RI2 (and R6's resolution half).
- What is true: the mechanism itself is correct. MQ-5 proves a repo-local tuned threshold reaches
  predicate evaluation and changes the outcome.
- What is wrong: nothing automated ever proves that. `_dataRoot` is derived as
  `join(repoRoot, _wf)`, and `AGENTSMYTH_WF` overrides `_wf` — so the env var that `npm run
  validate` sets to point definitions at `src/workflow/` **also moves the data root there**. There
  is no `src/workflow/config/repo-profile.yaml`, so `tunedScoring` is permanently `undefined` and
  the entire merge branch — `mergeTunedMap` for `weights`, `path_glob_categories`, and
  `thresholds` — never executes under CI.
- Confirmed blast radius: `check-trigger-predicates.mjs` is `mergeTunedMap`'s **only** production
  consumer. All six `tuning:` fixtures in `violations:test` assert against `check-config`, not this
  validator. `tuning-merge:test` covers the function in isolation, not its wiring.
- Failure this permits: revert `check-trigger-predicates.mjs` to read the global maps directly —
  deleting the whole WP-R8 resolution change — and `npm run build`, `npm run validate`,
  `violations:test` and `tuning-merge:test` all stay green. The regression is invisible.
- Why it matters beyond coverage bookkeeping: this is the **seventh instance** of the defect class
  this work package has been fighting. `maximum`, schema-valued `additionalProperties`, `if`/`then`,
  `format`, and `x_enforcement` were declarations that did nothing. F7 was a validator wired
  nowhere. T1 is a *correct implementation whose test harness cannot reach it*. Same shape:
  something written to enforce a contract, with no signal when it stops working.
- Severity: P2. Not a defect in shipped behavior — consumers resolve tuning correctly, as MQ-3 and
  MQ-5 show — but it removes the regression guarantee from the requirement that is the point of the
  work package.
- Suggested fix (Build, not Test): give the sandbox a `tuning:` block and assert the merged
  outcome, either by adding a case to `test/run-tuning-merge-tests.mjs` that spawns
  `check-trigger-predicates` with `AGENTSMYTH_HOME` set (the consumer shape MQ-5 used), or by
  decoupling `_dataRoot` from `AGENTSMYTH_WF` so the two roots can be pointed independently. The
  second is the more honest fix — `AGENTSMYTH_WF` is documented as naming the *definitions*
  directory, and silently relocating the data root with it is the underlying surprise.

## Skipped Checks

| Check | Why Skipped | Risk | Owner | Blocks Ship | Manifest IDs |
|---|---|---|---|---|---|
| `agentsmyth prepare` against the real `~/.agentsmyth` | `prepare` writes to `homedir()` unconditionally and overwrites the global install plus five tools' global config files; running it for verification would mutate the developer's live environment | Low — the sandboxed run exercised identical code with only `$HOME` differing; nothing in `prepare` branches on the home path's value | Jeel Vankhede | no | R7, R8 |
| Multi-tool adapter verification beyond file placement | MQ-1 confirmed all five global command files were written, but no actual Codex/Cursor/Windsurf/Copilot session was driven | Low — `render-adapters` proves gate-content parity mechanically; per-tool loading is unchanged by this work package | Jeel Vankhede | no | R7 |
| Real-world upgrade from a *published* 1.0.0 install | The v1.0.0 consumer was simulated by editing a 1.0.1-generated repo down to 1.0.0 shape rather than installing 1.0.0 from the registry | Low-moderate — the simulation was made faithful (version stamp, no `intent:` block, PS truncated to 1…8), but a real 1.0.0 tarball could differ in ways not reproduced | Jeel Vankhede | no | R8, RI9 |

## Architecture Notes

- role: Senior QA
- **decision — test the shipped tarball, not the working tree.** `npm pack` first, install from
  disk, drive the CLI from `node_modules/`. The three consumer-facing requirements (R7, R8, RI9)
  make claims about what a user experiences after installing, and the working tree is not that.
  This also surfaced the observation that `agentsmyth check` never invokes `check-config` on the
  consumer surface — visible only from outside the source repo.
- **decision — sandbox `HOME` rather than skip the global-install tests.** The alternative was
  recording R7/R8 as unverifiable, which would have left the upgrade path assumed for a fifth
  round. Verifying the sandbox assumption *before* relying on it, and confirming the real
  `~/.agentsmyth` mtimes afterwards, is what makes the evidence trustworthy rather than merely
  green.
- **correction — RI1's grep evidence needed refining.** A literal search for
  `complexity_score.weights` and `path_glob_categories` across `skills/`, `rules.md` and
  `router.md` returns zero hits, which initially read as a gap. It is not: those two tunables are
  consumed by `check-trigger-predicates.mjs` in code, while the other four are consumed in
  agent-read prose (`complexity_score` appears in five SKILL.md files as
  `complexity_score >= thresholds.<name>`). Review's "grep across all six tunables" was correct in
  conclusion but the dotted-literal form does not appear, and a future audit repeating that grep
  naively will reach the wrong answer. Recorded so it is not re-derived a third time.
- **observation — `check-trigger-predicates.mjs` contains 8 NUL bytes** (offsets 6278–6421),
  deliberate `\0DOUBLESTAR\0` / `\0STAR\0` sentinels inside `globToRegex`. Not corruption and not a
  defect, but `grep` classifies the file as binary and silently returns nothing without `-a`. That
  cost real time this phase and will cost it again in any CI step or audit that greps validator
  sources. Worth a one-line comment at the function, or non-NUL sentinels; no behavior change
  either way.
- **observation — the Test skill's own starter block is out of sync with the validator.** The
  Skipped Checks table in `lifecycle-test/references/output-schema.md` shows five columns; the
  validator requires six (`manifest_ids`), and `verification.yaml`'s `skipped_checks.required_fields`
  agrees with the validator. Copying the documented starter block verbatim produces an artifact that
  fails the gate — which is how this was found. Same class as T1 in miniature: a template that
  claims to be the contract and is not. Cheap fix, belongs with T1.
- **constraint — Test did not edit product files.** T1 has a suggested fix and it was not applied,
  per the phase's determinism rules. The finding is recorded, not resolved.
- **assumption Ship must preserve:** that `scripts/` stays out of `package.json` `files`. Both
  T1's bounded severity and Review's F7 blast-radius conclusion depend on it; if `scripts/` ever
  ships, the development gate becomes a consumer gate and both assessments need redoing.
- **downstream:** Ship is blocked on T1. Ship still owes the two Notion corrections (Q1
  allowlist-home wording; the Standard→Complex reclassification) and a release-checklist entry to
  remove the `warn-until-1.2.0` markers when 1.2.0 ships. Reflect should carry the defect class at
  **seven** instances — the count moved during Test, which is itself the point — plus the 96
  grandfathered violations, the still-unwired `lifecycle-artifact.schema.yaml`, and the stale
  "4 fixtures" line in `CLAUDE.md` (now 29).

## Sign-Off

- Verifier: Claude (Senior QA), with Jeel Vankhede
- Date: 2026-08-14
- Recommendation: **hold**

Sixteen of seventeen requirements verified with fresh evidence, including the three that had been
carried as assumption since v1 — the live upgrade path (R8), backward compatibility on a real
consumer config (RI9), and the ratchet's enforcement of this chain's own artifacts (RI3), which
Review v4 explicitly deferred to this phase.

The hold is on RI2 alone, and not because the feature is broken — MQ-5 shows it working end to end.
It is because the guarantee is unenforced: the merge branch cannot execute under the gate that is
supposed to protect it, so deleting the work package's central mechanism would leave every suite
green. Given that this chain has now produced seven instances of exactly that failure shape,
shipping an eighth knowingly is the wrong call. The fix is small and well-scoped.
