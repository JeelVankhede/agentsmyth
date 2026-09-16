---
slug: wp-r24-enforcement-proof
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-09-16
updated: 2026-09-16
manifest_ids: [R1, R2, R3, R4, RI1, RI2, RI3, RI4, RI5, RI6, RI7]
upstream:
  - workflow/artifacts/briefs/wp-r24-enforcement-proof-v1.md
  - workflow/artifacts/plans/wp-r24-enforcement-proof-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# WP-R24 — Enforcement Proof & Competitive Positioning Content - Task

## Active Phase

- Phase: Phase 7 - Release note, invariants and suites — **complete; Build is done, all seven phases
  closed**. Written as a phase number rather than as prose because `check-scope-fence` extracts the
  active phase from this line to bound the scope union, and a line it cannot parse fails the gate.
  That is exactly what happened on the first attempt here — and it is the **third consecutive chain**
  to hit it (`wp-r22-review-council-v1`, `wp-r23-agents-md-fallback-v1`, this one), each rediscovering
  it from the same failure message. Carried to Reflect as a follow-up rather than absorbed silently
  again.
- Manifest IDs: RI5, RI7 (Build total: all 11 — R1-R4, RI1-RI7)
- Exit gate: every plan phase's own exit gate met and recorded in the Phase Completion Log below.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Clean-room capture | complete | RI3 |
| Phase 2 - Regeneration script and documented steps | complete | RI2 |
| Phase 3 - Publish the capture on both surfaces | complete | R1, RI4 |
| Phase 4 - Comparison content | complete | R2, R3, RI1 |
| Phase 5 - Skill count, derived | complete | R4, RI6 |
| Phase 6 - Notion 04 — Reference | complete | R4 |
| Phase 7 - Release note, invariants and suites | complete | RI5, RI7 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits (Phase 1) | `feat/wp-r24-enforcement-proof` | `?? workflow/artifacts/briefs/wp-r24-enforcement-proof-v1.md`, `?? workflow/artifacts/plans/wp-r24-enforcement-proof-v1.md` | Both are this chain's own approved upstream artifacts, uncommitted by design — the user has not authorized a commit. No unrelated dirty state. Branch is stacked on `feat/wp-r20-ledger-closure` at `22412f2` per the plan's Branch Strategy. |
| At handoff | `feat/wp-r24-enforcement-proof` | `M CHANGELOG.md`, `MM README.md`, `M package.json`, `A scripts/capture-gate-refusal.mjs`, `A site/.vitepress/theme/GateCapture.vue`, `M site/.vitepress/theme/Layout.vue`, `M site/.vitepress/theme/style.css`, plus this chain's three artifacts | Every path is declared in the plan's Repo Impact Map or in the recorded deviation below. No unrelated file touched. Nothing committed — the user has not authorized a commit. |

## Scope

- In scope (Phase 1): standing up a disposable consumer-shaped repo under
  `tuning.council.sandbox_root`, provoking a real pre-commit refusal there, and recording the verbatim
  transcript plus the exact command sequence in this artifact.
- Out of scope (Phase 1): every shipped repo file. Phase 1 changes none — the scratch repo lives
  outside every repository by construction, and this artifact is the phase's only repo-visible output.
- Out of scope (chain): modifying the gate itself for presentation, editing the `## [1.0.0]` CHANGELOG
  entry, touching `site/index.md`, any Spec Kit interop work (WP-R25), and OI-60's README/site
  "Not a scaffolder" reconciliation.

## Changed Files

- `workflow/artifacts/tasks/wp-r24-enforcement-proof-v1.md` — this artifact; Phase 1's evidence
  surface — IDs: RI3
- `scripts/capture-gate-refusal.mjs` — new; the only writer of both published captures. Builds the
  fixture, provokes the refusal, gates on hygiene, writes both surfaces; `--check` verifies them
  against a fresh capture — IDs: RI2, RI3
- `package.json` — one script entry, `capture:gate`. No dependency change — IDs: RI2, RI5
- `site/.vitepress/theme/GateCapture.vue` — new; holds the generated site-side block and its framing
  copy — IDs: R1, RI4
- `site/.vitepress/theme/Layout.vue` — mounts `GateCapture` in the `home-hero-actions-after` slot
  alongside the existing `layout-top` slot — IDs: R1
- `site/.vitepress/theme/style.css` — capture styling: constrained width, contained horizontal
  overflow, theme-variable colours — IDs: R1
- `README.md` — capture block inside "Where it fits"; new "Compared with Spec Kit, in file paths"
  subsection — IDs: R1, R2, R3, RI1, RI4
- `docs/regenerating-the-gate-capture.md` — new; added in the Review fix pass (F3) to make RI2's
  documented steps discoverable outside the file they document — IDs: RI2
- `CHANGELOG.md` — three `## [1.1.0]` entries: the capture, the comparison, the derived count.
  `## [1.0.0]` deliberately untouched — IDs: R4, RI6, RI7

## Implementation Log

### Phase 1 — pre-work scoping (2026-09-16)

Artifact written before any Phase 1 work, per `lifecycle-build` Workflow step 4.

Environment facts established before starting, so the capture's realism is a recorded property rather
than an assumption:

- `agentsmyth` resolves from PATH at `~/.npm/bin/agentsmyth` — the same resolution branch a real
  consumer repo takes in `src/assets/hooks/pre-commit` (the hook prefers `./bin/agentsmyth.mjs`, which
  exists only in this repo; every consumer falls through to PATH).
- `~/.agentsmyth/sandbox/` already exists, so the scratch root needs no new location invented.
- The refusal itself was already reproduced once during Think in *this* repo, which is what established
  RI3: it emitted a six-line version-skew banner and an `adapters present:` line alongside the real
  error. Phase 1 exists to get a transcript without that noise.

### Phase 1 — execution (2026-09-16)

**Scratch repo**: `<sandbox_root>/gate-demo`, assembled by hand from `src/assets/` — `workflow/config/`
(five YAMLs, every `<PLACEHOLDER>` filled), `workflow/artifacts/` (seven phase dirs),
`workflow/learnings/`, `docs/knowledge-map/repo-mental-map.md`, a root `AGENTS.md` adapter, and
`src/assets/hooks/pre-commit` installed at `.git/hooks/pre-commit`. `repo-profile.yaml` stamped
`agentsmyth_version: 1.0.0` to match the globally installed CLI, and `definitions_root:
~/.agentsmyth/workflow`.

**Three findings that shape Phase 2:**

1. **A one-line change does not get refused.** The first attempt committed cleanly with
   `trivial-size escape: src/app.js (<= 15 changed lines)`. A capture built on a toy diff would have
   demonstrated the opposite of the point. The script must provoke a change above that floor.
2. **An incomplete consumer repo drowns the refusal.** Before the scaffold was finished, the real
   error arrived under six `check-setup-complete` failures (unfilled placeholders, missing
   `docs/knowledge-map/`, missing `workflow/learnings/`, no adapter). Those are artifacts of a
   half-built repo, not of the product — but a reader cannot tell. RI3's gate is therefore about
   *completeness of the fixture*, not only about paths and banners.
3. **The gate fires only on a `ready-for-next-phase` artifact.** `src/assets/hooks/pre-commit` reads
   `orchestration.status` from the **staged blob** and skips the downstream check on any status it can
   positively read that is not `ready-for-next-phase` — so an in-progress artifact stays committable.
   The R1 scenario is therefore precise: a plan that *claims* it is ready for Build while carrying no
   approval.

**Captured transcript** (verbatim, `exit=1`):

```console
$ git commit -m "plan: session handling"
all staged files are safe (workflow/docs/config or Markdown) — nothing to gate
check-commit-coverage: ok
  adapters present: AGENTS.md
check-setup-complete: ok
build: workflow/artifacts/plans/add-session-handling-v1.md → ready-for-next-phase ✓
check-lifecycle --phase build --slug add-session-handling: failed with 1 issue(s)
- build: upstream workflow/artifacts/plans/add-session-handling-v1.md's checkpoint "plan-review" is not marked approved (status: "pending").
$ echo $?
1
```

The commit did not happen. Note what the transcript shows beyond the refusal: coverage passed, setup
passed, and the artifact's own claim of readiness was accepted (`→ ready-for-next-phase ✓`) — the gate
then checked whether a human had actually approved it, and that is the check that failed. The claim is
not what the gate trusts.

### Phases 2–7 — execution (2026-09-16)

**Phase 2 — the script.** `scripts/capture-gate-refusal.mjs`, Node builtins only. It rebuilds the
fixture from scratch every run (a fixture that accumulates state cannot be idempotent), provokes the
refusal, gates on hygiene, and writes both published copies. Three things it does that are worth
knowing:

- It reads `sandbox_root` out of `repo-profile.yaml` rather than hardcoding a path, so a repo that
  moves its sandbox does not silently get a fixture in the old place.
- It points the fixture's `bin/agentsmyth.mjs` shim at **this repo's** CLI and stamps
  `agentsmyth_version` from this repo's `package.json`. That kills the version-skew banner
  deterministically and means the published capture always shows the behaviour of the code shipping
  alongside it, not whatever the developer happens to have installed globally.
- `provoke()` **throws if the commit succeeds**. A capture script that silently published a
  success would be worse than no capture at all.

**Phase 3 — placement.** `GateCapture.vue` (new) holds the generated block and its framing copy;
`Layout.vue` mounts it in `#home-hero-actions-after`; `style.css` constrains width, contains horizontal
overflow and draws from VitePress theme variables so both themes work without a second palette.

**Phase 4 — the comparison.** Rewritten as a four-row table, every claim linked to its file at
`1d5106f`. Both required re-wordings applied. The closing paragraph states the distinction as
agent-dispatched versus git-enforced, and the section ends by naming where Spec Kit is better and who
should use it instead.

**Phase 5 — the count.** Derived, not transcribed: 35 directories in `src/workflow/skills/`, 7 phase +
28 power, plus the `src/setup/` skill = 36 under the reference convention. The `[1.1.0]` entry states
the rule and explains why 22 and 34 were both correct in their own context.

**Phase 6 — Notion.** 04 — Reference updated from the Phase 5 derivation: heading 34 → 36, a councils
row, the counting rule with its re-derivation command, a paragraph retiring the "one is wrong" premise,
and the review date. It also now records that nothing derives the page from the repo, so it will go
stale again.

**Phase 7 — invariants.** `dependencies` is absent from `package.json` entirely and stayed that way;
only a `capture:gate` script line was added. Version still `1.0.1`, 1.1.0 entry date still
`2026-09-08`, `[1.0.0]` untouched.

## Verification Items

| Manifest ID | Verification target | Expected result | Result |
|---|---|---|---|
| R1 | Capture renders on the built home page between hero actions and features | Present, before the features grid | **pass** — `gate-capture-wrap` at index 12160, features at 13212 in `site/.vitepress/dist/index.html` |
| R1 | Capture present in README inside "Where it fits" | Block between markers | **pass** |
| R2 | Every comparative claim carries path + pinned SHA | All claims cited at `1d5106f` | **pass** — 5 occurrences of the SHA in README |
| R3 | A concrete statement of where Spec Kit is stronger | Names a capability | **pass** — names `analyze.md`'s duplication/ambiguity detection, coverage map, constitution pass, severity model |
| RI1 | Citations match the Think-phase verdicts | No re-derivation, no drift | **pass** — both required re-wordings applied |
| RI2 | Two consecutive script runs | Second leaves the tree unchanged | **pass** — `git status --porcelain` identical before/after |
| RI2 | `--check` mode detects staleness | Exits 0 when current | **pass** |
| RI4 | Two published payloads identical | Byte-identical after wrapper strip | **pass** — asserted by `--check` |
| RI5 | `package.json` dependencies | Unchanged | **pass** — `dependencies` is absent entirely; only a script line added |
| RI6 | Published count equals a fresh derivation | Equal | **pass** — 35 dirs / 7 phase / 28 power / +1 setup = 36 |
| R4 | `## [1.0.0]` CHANGELOG section | Zero diff lines | **pass** — the `34 skills` line is absent from the diff |
| RI7 | 1.1.0 entry date and package version | Both unedited | **pass** — date still `2026-09-08`, version still `1.0.1` |
| RI3 | Transcript contains the pre-commit refusal and a non-zero exit | Refusal text present, exit status non-zero | **pass** — refusal present, `exit=1` |
| RI3 | `grep -cE '/Users/\|/home/\|version skew'` over the transcript | Zero matches | **pass** — 0 matches |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `git status --short --branch` | repo | pass | Recorded in Branch / Repo Status above, before any edit. |
| `which agentsmyth` | environment | pass | Resolved on PATH under the user's npm prefix — consumer-path resolution confirmed available. |
| `git commit -m "feat: add app entry point"` (scratch repo, 1-line file) | gate | pass (commit allowed) | Emitted `trivial-size escape: src/app.js (<= 15 changed lines)`. Establishes that the coverage check has a size floor — a demo built on a one-line change would show the gate *permitting* the commit. |
| `git commit -m "feat: add session handling"` (scratch repo, 24-line file, no task artifact) | gate | pass (commit refused) | `check-commit-coverage: failed with 1 issue(s) — src/auth.js — no task artifact's Changed Files covers this path`, `exit=1`. Second verified refusal path, clean. |
| `git commit -m "plan: session handling"` (scratch repo, unapproved plan staged) | gate | pass (commit refused) | The R1 refusal. Full transcript in the Implementation Log below; `exit=1`. |
| `grep -cE '/Users/\|/home/\|version skew'` over the captured transcript | hygiene | pass | 0 matches — RI3's gate. |
| `node --check scripts/capture-gate-refusal.mjs` | Phase 2 | pass | Syntax clean. |
| `npm run capture:gate` (first run) | Phase 2/3 | pass | `updated (README.md written, GateCapture.vue written)`. |
| `npm run capture:gate` (second run) | Phase 2 | pass | Tree unchanged — idempotency gate. |
| `npm run capture:gate -- --check` | Phase 2/3 | pass | `ok — both published captures match a fresh refusal`. |
| `npm run site:build` | Phase 3 | pass | `build complete in 4.63s`. |
| `grep`/index comparison over `site/.vitepress/dist/index.html` | Phase 3 | pass | Capture renders before the features grid. |
| `ls -d src/workflow/skills/*/ \| wc -l` and phase/power split | Phase 5 | pass | 35 / 7 / 28; +1 setup skill = 36. |
| `npm run validate` | Phase 7 | pass | exit 0. |
| `npm run violations:test` | Phase 7 | pass | 217/217 violations detected; 93/93 council fixtures emit exactly one error. |
| `npm run conformance:test` | Phase 7 | pass | 49/49 conformance checks passed. |

## Dispatch Log

none

## Architecture Notes

- role: Senior Engineer
- **constraint**: Phase 1 must not run `agentsmyth init` in the scratch repo. `init` auto-runs
  `prepare`, which re-expands `~/.agentsmyth/workflow/` from the installed CLI's bundle — and this
  repo's `repo-profile.yaml` sets `definitions_root: ~/.agentsmyth/workflow`, so a `prepare` mid-chain
  would swap the definitions every validator in this chain resolves against, from underneath the chain.
  The scratch repo is therefore assembled from `src/assets/` by hand.
- **decision**: the captured refusal is the *plan-not-approved* variant rather than the coverage
  variant, because R1 names it specifically ("refusing a commit because Build has no approved Plan").
  The hook's `phase_for_dir` maps a staged `plans/` artifact to the `build` gate, so staging a plan
  whose own `plan-review` checkpoint is unapproved produces exactly that refusal.
- **downstream — Phase 2**: whatever sequence Phase 1 proves by hand becomes the script's contents
  verbatim. If a step here needs a human decision, the script cannot be idempotent and Phase 2's exit
  gate will fail — so any such step must be removed here, not worked around there.
- **deviation from plan, corrected in the artifact (RI4)**: the plan's RI4 acceptance asked for the two
  published blocks to be "byte-identical". They cannot be — a Markdown fence renders on GitHub and a
  `<pre>` renders in a Vue slot, so the wrappers necessarily differ. What must match is the **payload**,
  and `--check` compares payloads after stripping each wrapper and unescaping the HTML. The guarantee
  the plan wanted is intact; the wording was wrong and is recorded here rather than reinterpreted
  silently.
- **plan amendment 1**: `site/.vitepress/theme/GateCapture.vue` added to Phase 3. `check-scope-fence`
  refused the changed file because no phase declared it, which is the fence working as designed. The
  plan was amended and the reason recorded in its Summary.
- **third recurrence, carried to Reflect**: `check-scope-fence` extracts the active phase **number**
  from the `## Active Phase` line, and prose there fails the gate. `wp-r22-review-council-v1`,
  `wp-r23-agents-md-fallback-v1` and this chain have each hit it and each rediscovered it from the same
  error message. wp-r23 wrote a warning into its own artifact, which did not help this chain, because
  nothing carries that warning to the next author. The fix belongs in the starter block or the
  validator's message, not in another artifact comment.

## Blockers

none

## Phase Completion Log

### Phase 1 - Clean-room capture — complete 2026-09-16

- Manifest IDs: RI3
- Exit gate: **met.** Transcript contains the refusal and `exit=1`; hygiene grep returns 0 matches for
  `/Users/`, `/home/` and `version skew`.
- Repo files changed: none, as planned — the phase's only repo-visible output is this artifact.
- Carried to Phase 2: the 15-line coverage floor, the fixture-completeness requirement, and the
  `ready-for-next-phase` precondition, all recorded above.

### Phase 2 - Regeneration script and documented steps — complete 2026-09-16

- Manifest IDs: RI2
- Exit gate: **met.** Two consecutive `npm run capture:gate` runs; `git status --porcelain` identical
  before and after the second. `package.json` gained one script line and no dependency.
- Documented steps ship as the header comment of `scripts/capture-gate-refusal.mjs` plus the
  `GateCapture.vue` file comment, both of which point at the command rather than restating the
  procedure — RI2's one-source-of-truth guard.

### Phase 3 - Publish the capture on both surfaces — complete 2026-09-16

- Manifest IDs: R1, RI4
- Exit gate: **met.** `npm run site:build` exits 0; the built `index.html` places the capture before
  the features grid; `--check` confirms both payloads match a fresh refusal.

### Phase 4 - Comparison content — complete 2026-09-16

- Manifest IDs: R2, R3, RI1
- Exit gate: **met.** Four claims, each linked to its upstream file at `1d5106f`; both re-wordings
  applied; a named statement of where Spec Kit is stronger.

### Phase 5 - Skill count, derived — complete 2026-09-16

- Manifest IDs: R4, RI6
- Exit gate: **met.** Published figures equal the fresh derivation; the counting rule is stated beside
  them; `## [1.0.0]` has zero diff lines.

### Phase 6 - Notion 04 — Reference — complete 2026-09-16

- Manifest IDs: R4
- Exit gate: **met.** Page updated from the Phase 5 derivation — total 34 → 36, councils row, counting
  rule with re-derivation command, the "one is wrong" premise retired, review date refreshed.

### Phase 7 - Release note, invariants and suites — complete 2026-09-16

- Manifest IDs: RI5, RI7
- Exit gate: **met.** `npm run validate` 0, `npm run violations:test` 217/217, `npm run conformance:test`
  49/49, `npm run site:build` 0. `dependencies` absent and unchanged; version `1.0.1` unbumped; 1.1.0
  entry date unedited.

