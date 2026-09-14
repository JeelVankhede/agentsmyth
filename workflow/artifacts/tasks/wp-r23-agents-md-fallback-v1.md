---
slug: wp-r23-agents-md-fallback
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-09-13
updated: 2026-09-13
manifest_ids: [R1, R2, R3, R4, R5, R6, RI1, RI2, RI3, RI4, RI5, RI6, RI7]
upstream:
  - workflow/artifacts/briefs/wp-r23-agents-md-fallback-v1.md
  - workflow/artifacts/plans/wp-r23-agents-md-fallback-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# WP-R23 — Generic AGENTS.md Adapter Fallback - Task

## Active Phase

- Phase: Phase 6 - Release note — **complete; Build is done, all six phases closed**. Named as a
  phase number rather than prose because `check-scope-fence` extracts the active phase from this line
  to bound the scope union, and a line it cannot parse fails the gate — which is what happened on the
  first attempt here, exactly as it did in wp-r22-review-council-v1.
- Manifest IDs: RI7 (Build total: all 13 — R1-R6, RI1-RI7)
- **Review fix pass, 2026-09-13.** Build reopened at the user's instruction ("fix all") to close
  review findings F1 (P1) and F2 (P2). Active phase stays Phase 6 so `check-scope-fence` bounds the
  scope union across all six phases — the fix touches files owned by Phases 1, 2 and 4, all of which
  are already in the plan's Repo Impact Map, so no plan amendment is required this time.
- Fix-pass scope: `src/assets/AGENTS.md` (F1 + F2), `bin/agentsmyth.mjs` (F2),
  `test/run-agents-md-tests.mjs` (harden the assertion that let F2 through), `dist/` (rebuild).
- Fix-pass exit gate: the block names a hook path that **resolves to a real file** in a scratch repo;
  the block instructs an agent to run setup while `.agentsmyth/` exists; block still ≤ 25 lines;
  `agents-md:test` green with the hardened assertion; full 13-suite list green.
- Exit gate: the 1.1.0 entry names the `AGENTS.md` fallback; `git diff package.json` shows no version
  change; the 1.1.0 entry's date line is unchanged from its pre-phase value.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Block content and marker grammar | complete | R2, R4, R5, RI2 |
| Phase 2 - init owns the write | complete | R1, R2, R3, R6 |
| Phase 3 - Codex reconciliation and convention documentation | complete | R6, RI1, RI2 |
| Phase 4 - Trials and suites | complete | R2, R3, RI4, RI5 |
| Phase 5 - Regenerate and close the example gap | complete | RI3, RI6 |
| Phase 6 - Release note | complete | RI7 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `feat/wp-r23-agents-md-fallback` | `?? workflow/artifacts/briefs/wp-r23-agents-md-fallback-v1.md`, `?? workflow/artifacts/plans/wp-r23-agents-md-fallback-v1.md` | Clean apart from this chain's own two artifacts. No unrelated dirty files to preserve. Branch is non-default and matches the plan's Branch Strategy. |
| At handoff | `feat/wp-r23-agents-md-fallback` | 7 modified/new paths, all declared; `dist/` regenerated but gitignored | Scope confirmed against the plan's Repo Impact Map as amended. No unrelated file touched. Nothing staged, nothing committed. |

## Scope

- In scope (Phase 6): `CHANGELOG.md` only — the existing 1.1.0 entry.
- Out of scope (Phase 6): `package.json` version (release.yml runs `npm version` itself) and the
  1.1.0 entry's date (corrected at dispatch, not at this merge).
- Completed (Phases 1-5): `src/assets/AGENTS.md`, `bin/agentsmyth.mjs`, `src/setup/SKILL.md`,
  `test/run-agents-md-tests.mjs`, `package.json`, `dist/` (regenerated, untracked).
- NOT created, deliberately: `examples/node-package/AGENTS.md` — see the Phase 5 log and the skipped
  check recorded there.
- Out of scope (whole chain): `src/workflow/validators/check-setup-complete.mjs` — the plan records
  its weakened adapter check as an accepted consequence of Q2, explicitly not repaired.
- Ship-owned and not performed here: push, PR, merge, release dispatch, external source updates.

## Changed Files

- `src/assets/AGENTS.md` — DONE (Phase 1): seven-step gate text replaced with a 19-line pointer block
  naming `.githooks/pre-commit`. No literal marker pair stored; markers are emitted by `init`. — IDs:
  R4, R5, RI2
- `bin/agentsmyth.mjs` — DONE (Phase 2, amended after reopen): tempered block pattern; reads moved
  inside the try. Added `AGENTS_BLOCK_PATTERN` / `AGENTS_BLOCK_RE` /
  `AGENTS_BLOCK_RE_ALL`, `agentsMdBlock()` and `placeAgentsMd()` at :909-975, plus the call at :1282
  between `placeDeterministicAdapters()` and `installPreCommitHook()`. Pattern-based marker match;
  version read from `package.json` inside the function, matching `runPrepare()`. — IDs: R1, R2, R3, R6
- `src/setup/SKILL.md` — DONE (Phase 3): Step 5a's two collision rows replaced with a single
  do-not-touch row; Step 5a.1's Codex row collapsed to "nothing to place"; a new "Repo-local marker"
  subsection added beside the global-gate table; the Step 5c example log line corrected so it no
  longer claims an append that no longer happens. — IDs: R6, RI1, RI2
- `test/run-agents-md-tests.mjs` — DONE (Phase 4): committed suite, 17 checks across scenarios A-E,
  house style matching `run-init-prepare-interop-tests.mjs`. — IDs: R2, R3, RI5
- `package.json` — DONE (Phase 4): `agents-md:test` registered after `domain-placeholders:test`. No
  dependency added. — IDs: RI4
- `dist/workflow-bundle.md`, `dist/setup-bundle.md` — DONE (Phase 5): regenerated by `npm run build`;
  both are gitignored, so they appear in no diff. — IDs: RI3
- `examples/node-package/AGENTS.md` — NOT CREATED (Phase 5). Nothing validates it; see the skipped
  check below. — IDs: RI6
- `CHANGELOG.md` — DONE (Phase 6): the 1.1.0 entry's Added section gained the fallback entry. Date
  and `package.json` version both deliberately untouched. — IDs: RI7
- `.github/workflows/ci.yml` — DONE (Phase 4, by amendment): one step invoking `agents-md:test`. — IDs: RI4
- `.github/workflows/release.yml` — DONE (Phase 4, by amendment): one line in the Verify step. — IDs: RI4

## Implementation Log

### Phase 1 — pre-work scoping (before first edit)

Baseline measured before touching the file, so the exit gate has something to compare against:

- `src/assets/AGENTS.md` is 28 lines / ~2.3K, structured as seven numbered steps plus a
  "Bypass is not permitted" closing line. (Recorded as 37 in this artifact's first pass and corrected
  here after measuring with `wc -l`. The seven-step count and the zero hook mentions were measured
  and both held.)
- `grep -c "pre-commit"` against it returns 0 — the current block never names the hook, which is
  exactly what R4 exists to fix.
- The hook's real path is `.githooks/pre-commit` (confirmed present in this repo; it is the file
  whose `run_agentsmyth()` helper prefers `./bin/agentsmyth.mjs` at line 41-42).

### Phase 1 — implementation and result

Rewrote `src/assets/AGENTS.md` as a pointer block bounded to the four concerns R5 names. Measured
against the exit gate immediately after writing:

| Condition | Required | Measured |
|---|---|---|
| Line count | ≤ 25 | 19 |
| `.githooks/pre-commit` named | ≥ 1 | 1 |
| `workflow/router.md` named | ≥ 1 | 2 |
| `workflow/lifecycle.md` named | ≥ 1 | 1 |
| Numbered step headings | 0 | 0 |
| Literal `agentsmyth:` marker in the asset | 0 | 0 |

All six hold. Phase 1 exit gate met.

Decision taken during Phase 1: the block uses no `{{TOKEN}}` substitution. `buildAdapterTokens()`
resolves DEFAULT_BRANCH, BRANCH_POLICY, PROTECTED_PATHS, VERIFICATION_CMDS and CONSTRAINTS — none of
which a four-concern pointer needs. Phase 2 still routes the asset through `renderAdapterTemplate()`
for consistency with the sibling placements; on token-free content that is a no-op, and it keeps the
block byte-stable across two `init` runs, which condition (b) depends on.

### Phase 2 — pre-work scoping (before first edit)

Read the real insertion region before designing the write:

- `placeDeterministicAdapters()` at `bin/agentsmyth.mjs:888-906` is the enumerated-placement
  precedent: `.cursor/rules/agentsmyth.mdc` and, on non-macOS only, `.github/copilot-instructions.md`,
  both guarded by `if (!existsSync(dest))` — skip-if-exists.
- `installPreCommitHook()` at `:918-961` is the existing **marker-based** precedent, keyed on
  `HOOK_BEGIN_MARKER` (`# >>> agentsmyth:mandatory-lifecycle-gate >>>`). Two behaviours carry over and one deliberately does not: it
  degrades to a warning rather than failing `init` (carried over), and it appends when the marker is
  absent (carried over) — but when the marker IS present it simply returns, never refreshing the
  block. That is weaker than R2 requires, so `placeAgentsMd()` replaces between markers instead of
  skipping. Worth flagging to Review as an intentional divergence from the sibling function.
- That hook marker already uses the `agentsmyth:<name>` colon form, so the user's
  `agentsmyth:<version>` choice extends a shape the repo already uses rather than adding a fourth
  marker style.
- Call site: the init sequence at `:1207-1217` (`headlessBootstrap` → `placeDeterministicAdapters` →
  `installPreCommitHook`). `placeAgentsMd()` slots in after `placeDeterministicAdapters()` and reads
  the version from `package.json` itself, matching `runPrepare()` rather than threading a new
  parameter through the call chain.

### Phase 2 — implementation and result

Added to `bin/agentsmyth.mjs`: `placeAgentsMd()` and its two regexes, inserted before
`HOOK_BEGIN_MARKER`, with the call site placed after `placeDeterministicAdapters()` so it renders from
the same resolved token set.

**A defect I introduced and fixed inside this phase, recorded rather than quietly repaired.** The first
insertion attempt corrupted the file: the script performing the edit used a *string* replacement whose
text contained the two-character sequence dollar-quote, which `String.prototype.replace` expands to
"everything after the match". The rest of the file was spliced into the middle of a comment.
`node --check` caught it immediately; `node --check` on the HEAD copy passed, which is what confirmed
the fault was mine and not pre-existing. Recovery: `cp` the `git show HEAD:bin/agentsmyth.mjs` copy back
over the file, verify `git diff --stat` was empty, then re-apply with a function replacement. The
shipped runtime code already guarded against exactly this hazard in its own block substitution; the
build-time script did not.

**A harness correction, not a product change.** The first run of condition (b) failed with
`.agentsmyth/ already exists in this directory.` — `init` refuses to re-run while that directory is
present, and the setup skill deletes it as the final step of its Phase 5. A second `init` in a real
consumer repo therefore always happens with `.agentsmyth/` absent. The harness now removes it between
runs, which models a genuine upgrade rather than an interrupted setup. Worth carrying into Phase 4's
committed suite, since a naive test would hit this and could easily be misread as an idempotency bug.

Exit gate measured against four scratch repos, each with its own scratch `HOME` so nothing could
write into a developer's real `~/.agentsmyth` (the isolation pattern
`test/run-init-prepare-interop-tests.mjs` already uses):

| Condition | Checks | Result |
|---|---|---|
| (a) no `AGENTS.md` | created, one pair, current stamp, hook named | 4/4 pass |
| (b) `init` twice | byte-identical, still one pair | 2/2 pass |
| (c) older stamp | one pair, old stamp gone, old body gone, new stamp, text above and below preserved | 6/6 pass |
| (d) content above and below | non-block region byte-identical | 1/1 pass |

13 passed, 0 failed. Condition (c) is the one that fails under literal marker matching, and it is the
reason Q1's caveat became an acceptance criterion rather than a code comment.

### Phase 2 — REOPENED after a user challenge, two defects found and fixed

Phase 2 had been recorded complete on the strength of 13/13 gate checks. The user asked whether it
was actually implemented properly, and re-reading the code against that question rather than against
the gate found two defects. The gate had passed because every case it exercised was well-formed
input — it tested what the code was designed for, not what a real file might contain.

**Defect A — silent user data loss, a direct R3 violation.** `AGENTS_BLOCK_PATTERN` used a plain
non-greedy middle. Given an `AGENTS.md` carrying an orphan `BEGIN` with no matching `END` — a
truncated write, a killed process, a pasted fragment — the first `init` finds no well-formed pair and
appends one, and the second `init` then matches from the ORPHAN `BEGIN` all the way to the appended
block's `END`, deleting everything in between. Reproduced deliberately before fixing: a seeded file
lost both its `IMPORTANT USER CONTENT` line and its `## My own section` heading on the second run.
This is exactly the class of failure R3 exists to prevent, and it destroys the user's own writing
with no error.

Fix: the middle is now a tempered match — any character, so long as another `BEGIN` does not start
at that position. The match therefore begins at the LAST `BEGIN` before an `END`, so an orphan is
left alone as the stray text it is. Re-running the probe after the fix: user content and section both
survive two `init` runs, exactly one well-formed pair exists, and the orphan `BEGIN` is untouched.

**Defect B — the catch block promised a degradation the code did not provide.** The comment read
"a missing block must not fail init outright", but the `package.json` read, the asset read and
`buildAdapterTokens()` all sat OUTSIDE the `try`. An unreadable asset threw straight out of `init` —
the one case the comment named. `installPreCommitHook()` has the same shape, so the code was
consistent with its sibling while the comment was not consistent with the code.

Fix: the reads moved inside the `try`. Verified by making the asset unreadable (`chmod 000`) and
running `init` in a scratch repo: the warning surfaced, `init` continued past it, and
`workflow/config/` was still scaffolded with all six files. `init` did still exit 1 — but from
`copyRecursive` at `bin/agentsmyth.mjs:1309`, a pre-existing step that copies `src/assets/` into
`.agentsmyth/` and has nothing to do with this change. The asset's mode was restored to 644 and its
content confirmed unchanged.

**Gate extended.** A defect found once should not be able to return, so condition (e) — orphan
`BEGIN`, two runs, user content must survive — is now part of the Phase 2 gate. 13 checks became 17,
all passing. Phase 4's committed suite must carry case (e) as well; it is the single most valuable
case in the set, because it is the only one that was ever actually broken.

### Phase 3 — implementation and result

Four edits to `src/setup/SKILL.md`:

1. Step 5a's two `AGENTS.md` collision rows (`does not exist` / `exists`) collapsed into one row
   instructing the agent not to touch the file at all, because `init` owns it.
2. Step 5a.1's Codex row changed from "Handled by Step 5a above" to "none — nothing to place", naming
   `init` and the generic fallback block. This is Q2's decision landing in the shipped prose.
3. A new `##### Repo-local marker — not a global gate` subsection placed immediately after the
   global-gate marker table. It is deliberately **not** a row inside that table: that table's second
   column is "Global file", and a repo-local block filed there would misrepresent what it is. The
   subsection documents the pair, states that matching is by pattern rather than literal, and spells
   out both consequences — content between the markers is overwritten by the next `init`, content
   outside them is never touched, including a stray unpaired marker.
4. Step 5c's example completion log line updated: it previously read
   `skipped  AGENTS.md (exists — appended agentsmyth section instead)`, describing an append that no
   longer happens. A sample output that lies about behaviour is a defect with a long half-life, since
   it is copied by readers.

Exit gate measured:

| Condition | Result |
|---|---|
| No row instructs an agent to copy or append root `AGENTS.md` | none found |
| Codex row names `init` | yes |
| Marker pair documented | yes |

Remaining `AGENTS.md` mentions are all correct: line 176 is Codex's **global** gate at
`~/.codex/AGENTS.md`, a different file, correctly untouched.

Suites run after the edit: `validate`, `setup-refs:test`, `setup-checks:test`, `conformance:test`,
`violations:test` — all exit 0.

### Phase 4 — pre-work scoping (before first edit)

Read `test/run-init-prepare-interop-tests.mjs` for house style before writing anything. Conventions to
match: shebang plus a header comment stating what the suite covers and what it deliberately does not;
a `spawnCli()` that **requires** an explicit scratch `home` and throws without one, so no test can
fall through to a developer's real `$HOME`; `check(id, description, condition)` emitting
`[PASS]`/`[FAIL]`; a `cleanup` array drained with `rmSync` at the end; a final
`passed/total` line; `process.exit(1)` when anything failed. Scratch dirs come from `tmpdir()`, which
is the repo's existing test convention.

Two behaviours the ad-hoc runner discovered must carry into the committed suite: `.agentsmyth/` has to
be removed between `init` runs or the second refuses to start, and case (e) — the orphan `BEGIN` — is
the only case that ever actually caught a defect.

### Phase 4 — implementation and result

`test/run-agents-md-tests.mjs` committed: 17 checks across five scenarios (A create, B idempotent,
C cross-version replace, D byte preservation, E orphan BEGIN), matching the house style of
`run-init-prepare-interop-tests.mjs` — required scratch `home` with no fallback to the real `$HOME`,
`check(id, description, condition)`, cleanup array, `passed/total` line, exit 1 on failure.
`package.json` gained one `scripts` entry and no dependency.

Two things written into the suite's header comment rather than left for a future reader to
rediscover: why `.agentsmyth/` is removed between runs, and why scenario E is load-bearing.

`PAIR_RE` in the suite is a deliberate second literal rather than an import from `bin/`. If the
implementation's pattern is edited, the assertions must be re-derived by hand instead of silently
agreeing with whatever the implementation now does.

**Mutation check — is the suite actually load-bearing?** A suite that cannot fail is not evidence.
The tempered pattern was reverted to the plain non-greedy form (reintroducing defect A), and the
suite was re-run:

| Scenario | Under the defect |
|---|---|
| A, B, C, D | all still pass |
| E1, E2, E4 | **fail** |

14/17, exit non-zero. `bin/agentsmyth.mjs` was then restored from a pre-mutation copy and verified
byte-identical with `diff -q`; the suite returns 17/17. This confirms both halves of what mattered:
scenario E genuinely catches the defect, and scenarios A-D were blind to it — which is exactly why
13/13 looked like proof earlier and was not.

Exit gate measured: `agents-md:test` exit 0, `validate` exit 0, `violations:test` exit 0,
`test/mutation-baseline.json` unchanged (no validator rule was added, so the ratchet must not move).

### Phase 5 — pre-work scoping (before first edit)

`dist/` is a build product. Golden rule 2 in CLAUDE.md requires `npm run build` after any
`src/workflow/`, `src/setup/` or `src/adapters/` change; this chain changed `src/setup/SKILL.md` and
`src/assets/AGENTS.md`, so both bundles must be regenerated rather than edited. The example file is
new and additive: `examples/node-package/` was chosen in the plan because it is the example that
represents an npm-package consumer of this CLI, and `power-skill-sandbox` is a fixture owned by
`check-trigger-predicates`.

### Phase 5 — implementation and result

**RI3 — regenerate.** `npm run build` run; `dist/setup-bundle.md` confirmed to carry both Phase 3
edits (the new "Repo-local marker" subsection and the corrected Step 5c log line). A second
consecutive build produced byte-identical bundles, so the build is deterministic.

Two facts about `dist/` that the plan got wrong and are corrected here rather than glossed:

1. **`dist/` is gitignored** (`.gitignore:2: /dist/`) and `git ls-files dist/` returns zero entries.
   The plan's RI3 exit gate — "`npm run build` followed by `git status --porcelain dist/` is empty" —
   therefore can never fail, because an ignored path never appears in `git status`. It was a gate that
   looked strict and measured nothing. Recorded as a mis-specified gate, not silently satisfied.
2. **The real guarantee lives in CI.** `.github/workflows/release.yml` line 51 runs
   `node scripts/build-bundle.mjs` inside its Verify step, before `npm pack` and `npm publish`. That
   is what makes "no stale bundle ships" structurally true, independent of anything done locally.
   Checked and found sound: `build-cli.mjs` is not run there, but its output `bin/prompts.mjs` is a
   tracked file, so it ships from the repo rather than needing a build.

The new asset is correctly absent from both bundles: `src/assets/` is shipped as files via
`package.json`'s `files` array and copied by `init` at runtime, not compiled into a bundle.

**RI6 — example coverage. Not closed; recorded as a skipped check.** The plan proposed adding
`examples/node-package/AGENTS.md` so `validate-example.mjs` could catch a regression. Checked before
writing it, and the premise does not hold:

- `src/workflow/validators/check-domain-placeholders.mjs` line 10 lists `/^examples\//` in its
  `excluded` array, so every file under `examples/` is skipped by that scan.
- `scripts/validate-example.mjs` inspects each example's README, config and lifecycle artifacts. It
  has no `AGENTS.md` handling at all.

So the file would have been validated by nothing. Creating it would have produced a green tick for
coverage that does not exist, which is worse than the gap it claims to close. RI6's own acceptance
criterion names this alternative explicitly, so this is the plan's sanctioned branch rather than a
deviation from it.

Skipped check, with the six fields `verification.yaml` `skipped_checks.required_fields` requires:

| Field | Value |
|---|---|
| check | Example-repo regression coverage for the `AGENTS.md` marker block |
| why_skipped | No validator reaches example `AGENTS.md` files. `check-domain-placeholders` excludes `^examples/`; `validate-example.mjs` has no `AGENTS.md` handling. Adding a fixture would create the appearance of coverage without any. |
| risk | A regression in block placement would not be caught by the example corpus. Partially offset: `test/run-agents-md-tests.mjs` covers all five behaviours against real scratch repos, which is stronger evidence than a static fixture would have been. Residual risk is narrow — it is the shape of a *shipped example*, not the behaviour, that goes unchecked. |
| owner | user |
| blocks_ship | no |
| manifest_ids | RI6 |

Making it real coverage would mean teaching `validate-example.mjs` about `AGENTS.md`, which is a
validator change requiring its own rejection fixture under the mutation ratchet. That is new scope
and is not proposed here.

### Phase 6 — pre-work scoping (before first edit)

`CHANGELOG.md` already carries a `## [1.1.0] - 2026-09-08` entry with Added / Changed / Fixed /
Removed sections. This change is additive behaviour, so it belongs under Added. Two prohibitions from
`docs/release-checklist.md` apply and are encoded in the exit gate: `package.json` must not be
pre-bumped, because `release.yml` runs `npm version` itself and a pre-bumped repo publishes the
version after the intended one; and the entry's date is corrected at dispatch, not now.

### Phase 4 — scope amendment discovered after the fact

Running the full release suite list at handoff surfaced a failure that the per-phase checks had not:
`conformance:test` rule `r22-every-suite-runs-in-ci` — "every :test script is invoked by CI and by
release". `agents-md:test` had been registered in `package.json` in Phase 4 and wired into neither
workflow, so it would have shipped as a suite that never ran anywhere.

The rule is correct and the omission was mine. `.github/workflows/ci.yml` gained one step and
`.github/workflows/release.yml` one line in its Verify block, placed alongside the existing suites.

Neither file was in Phase 4's declared touches, so this is a scope addition to an approved plan. Build's
determinism rules forbid *silent* expansion, not expansion — so it is handled the sanctioned way: the
plan artifact carries a dated amendment block explaining the cause, its Repo Impact Map lists both
files, Phase 4's Touches and Exit gate were updated (`conformance:test` added to the gate so the same
omission cannot recur unnoticed), and it is surfaced to the user in the handoff message rather than
buried here. `check-scope-fence` passes against the amended plan.

Worth noting for Review: this was caught only because the full release list was run at handoff. The
per-phase gates would all still be green with a dead suite in the repo.

### Phase 6 — implementation and result

`CHANGELOG.md`'s existing `## [1.1.0]` entry gained an Added item describing the fallback: what `init`
now writes, the marker grammar, pattern-matching and why, the create-or-replace exception, and Codex
subsumption.

Exit gate measured:

| Condition | Required | Measured |
|---|---|---|
| 1.1.0 entry names the fallback | 1 | 1 |
| `package.json` version changed | 0 | 0 |
| 1.1.0 date line | unchanged | `## [1.1.0] - 2026-09-08`, unchanged |

One unintended diff caught and reverted in this phase: registering the npm script by rewriting
`package.json` through `JSON.stringify` normalised the description field's escaped `\u2014` into a
literal em-dash. Semantically identical JSON, but an unrequested change to a shipped field and a
violation of `stage_only_approved_scope` in spirit. Restored, so `git diff package.json` is now exactly
one added line.

### Build handoff

All six phases closed. Full release-suite list run at handoff:

| Suite | Result |
|---|---|
| validate, violations:test, conformance:test, agents-md:test | pass |
| setup-refs, setup-checks, root-resolution, init-prepare-interop | pass |
| checkpoint-approval, setup-validator-definitions-root, tuning-merge | pass |
| commit-coverage, domain-placeholders | pass |

`check-scope-fence` passes. `test/mutation-baseline.json` unmoved. Nothing staged, nothing committed,
no push, no PR — all Ship-owned and none of it performed here.

Two items Review and Test should carry rather than rediscover: the RI6 skipped check (example coverage
not closed, recorded with all six fields, owner user, blocks_ship no), and the Phase 4 scope amendment
above.

### Review fix pass — pre-work scoping (before first edit)

Two findings to close, both in the block's content, one with a code half.

**F1 — setup trigger.** Restore the instruction the rewrite dropped, conditional on `.agentsmyth/`
existing. R5's gate is ≤ 25 lines and the block is at 19, so there is room. Deliberately phrased as a
precondition ("setup has not finished") rather than as a numbered step, to stay inside R5's "pointer,
not a second copy of the contract" bound.

**F2 — hook path.** The block hardcodes `.githooks/pre-commit`, which is correct only in this repo
because it sets `core.hooksPath`. Two options were recorded in the review: drop the path, or resolve
it at write time. Taking the second. Dropping it would fail R4's acceptance as written ("rendered
block contains the hook's path"), and changing an approved acceptance criterion to match what was
built is the wrong direction — the criterion was right and the implementation was wrong.

The resolution logic already exists inside `installPreCommitHook()`. Rather than duplicating it,
extract `resolveHooksDir(repoDir)` and have both call sites use it: the function that writes the hook
and the function that tells the reader where it went must not be able to disagree, and F2 is exactly
what their disagreeing looks like. The path is then passed to the block through the existing
`{{TOKEN}}` mechanism, which `placeAgentsMd()` already routes the asset through.

**Test hardening.** A4 asserted `text.includes('.githooks/pre-commit')` — that a *string* appears,
not that it resolves. That is why F2 survived a green gate. The assertion becomes: extract the path
the block actually names and assert a file exists at it inside the scratch repo. A test that can only
confirm its own hardcoded expectation is not evidence.

### Review fix pass — implementation and result

**F1 closed.** The block regained the setup trigger as a precondition rather than a numbered step:
if `.agentsmyth/` exists, read `.agentsmyth/setup-bundle.md` and run setup first, and do not start
lifecycle work while that directory is present. Block grew 19 to 23 lines, still inside R5's ≤ 25
gate.

**F2 closed, with the duplication that caused it removed.** `resolveHooksDir(repoDir)` was extracted
and is now the single source of the hooks location, used by `installPreCommitHook()` (which writes
the hook) and `placeAgentsMd()` (which tells the reader where it went). The block takes the path
through a new `{{HOOK_PATH}}` token rendered per repo. The review offered dropping the path instead;
that was rejected because R4's acceptance requires the block to contain the hook's path, and
loosening an approved acceptance criterion to match what was built is the wrong direction — the
criterion was right and the implementation was wrong.

Verified in a real scratch consumer repo rather than by reading the code: the written block names
`.git/hooks/pre-commit`, and a file exists at that path. Before the fix it named
`.githooks/pre-commit`, which exists only in agentsmyth's own repo.

**The assertion that let F2 through was replaced.** A4 previously checked
`text.includes('.githooks/pre-commit')` — that a hardcoded string appears. It has become four checks:
A4 (a path is named at all), A5 (that path resolves to a file that exists in the scratch repo), A6
(no unrendered `{{TOKEN}}` reaches a consumer's file — a new failure mode introduced by adding token
rendering), and A7 (the setup trigger is present, closing F1). Suite went 17 to 20 checks.

**Both fixes proven load-bearing by mutation**, not asserted:

| Mutation | Result |
|---|---|
| `{{HOOK_PATH}}` reverted to the literal `.githooks/pre-commit` | A5 fails, 19/20 |
| Asset restored | 20/20, `diff -q` byte-identical |

The old A4 string check would have passed that mutation, which is the whole point.

Full 13-suite release list green, `check-scope-fence` green, block at 23 lines against a ≤ 25 gate.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R4 | `grep -c "\.githooks/pre-commit" src/assets/AGENTS.md` | ≥ 1 |
| R5 | `wc -l < src/assets/AGENTS.md` | ≤ 25 |
| R5 | `grep -cE "^[0-9]+\. \*\*" src/assets/AGENTS.md` | 0 (no numbered step headings remain) |
| RI2 | HTML-comment form chosen; *documenting* it belongs to Phase 3's Step 5a.1 table, not to this asset | form chosen, documentation deferred to Phase 3 |
| R1 | scratch repo with no `AGENTS.md`, run `init` | file created, exactly one marker pair |
| R2 | scratch repo, `init` twice, diff the results | byte-identical |
| R2 | scratch repo seeded with an `agentsmyth:0.0.1` block, run `init` | one pair remains, carrying the current version |
| R3 | scratch repo, user content above and below the block, run `init` | diff of non-block region empty |
| R6 | placement lives in `bin/agentsmyth.mjs`, not `src/setup/SKILL.md` | present in the former only |
| R2 | grammar is `<!-- agentsmyth:<version> BEGIN/END -->`, emitted by init not stored in the asset | asset contains no literal marker pair |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `node --check bin/agentsmyth.mjs` | Phase 2 | fail, then pass | Failed on the corrupted first insertion; passed on the HEAD copy, which localised the fault; passes after re-apply. |
| Phase 2 gate script, 4 scratch repos with isolated HOME | Phase 2 | pass | 13 checks, 0 failures — but only over well-formed input; see the reopening below. |
| Orphan-BEGIN probe, before fix | Phase 2 | fail (intended) | Reproduced silent deletion of user content across two init runs. R3 violation confirmed rather than assumed. |
| Orphan-BEGIN probe, after fix | Phase 2 | pass | User content and section survive; one well-formed pair; orphan left untouched. |
| `npm run agents-md:test` | Phase 4 | pass | 17/17. |
| `npm run agents-md:test` with the fix reverted | Phase 4 | fail (intended) | 14/17 — E1, E2, E4 fail. Proves the suite catches the defect rather than merely describing it. |
| `diff -q bin/agentsmyth.mjs` against pre-mutation copy | Phase 4 | pass | Byte-identical after restore, so the mutation left nothing behind. |
| `npm run setup-refs:test`, `setup-checks:test`, `conformance:test` | Phase 3 | pass | All exit 0 after the SKILL.md edits. |
| `npm run build` | Phase 5 | pass | Bundles regenerated; setup bundle confirmed to carry both Phase 3 edits. |
| `npm run build` a second time, bundles diffed | Phase 5 | pass | Byte-identical, so the build is deterministic. |
| `npm run conformance:test` at handoff | Phase 4 | fail, then pass | r22-every-suite-runs-in-ci caught agents-md:test being registered but never invoked. Fixed by wiring both workflows; passes after. |
| Full release suite list (13 suites) | handoff | pass | All green. |
| `npm run agents-md:test` after fix pass | fix pass | pass | 20/20 (was 17). |
| `npm run agents-md:test` with `{{HOOK_PATH}}` reverted | fix pass | fail (intended) | 19/20 — A5 fails. Proves the new assertion catches F2 where the old string check did not. |
| Scratch consumer repo, block path vs real file | fix pass | pass | Block names `.git/hooks/pre-commit`; file exists there. |
| Full release suite list, after fix pass | fix pass | pass | All 13 green. |
| `git ls-files dist/`, `git check-ignore dist/` | Phase 5 | pass | Zero tracked entries; ignored at .gitignore:2. Establishes that the plan's dist/ gate measured nothing. |
| `chmod 000` asset, init in scratch repo | Phase 2 | pass | Warning surfaced, init continued, config still scaffolded. Non-zero exit traced to pre-existing copyRecursive at :1309, not to placeAgentsMd. Mode restored to 644. |
| Phase 2 gate script, extended | Phase 2 | pass | 17 checks, 0 failures, including the orphan case. |
| `node bin/agentsmyth.mjs check --phase build --slug wp-r23-agents-md-fallback` | phase gate | pass | Re-run after the `bin/` edit. |
| `git status --short --branch` | repo | pass | Recorded above; only this chain's artifacts dirty. |
| `node bin/agentsmyth.mjs check --phase build --slug wp-r23-agents-md-fallback` | phase gate | pass | Plan `ready-for-next-phase`, checkpoint `plan-review` approved. |

## Dispatch Log

none — no subagent dispatch authorized or used.

## Architecture Notes

- role: Senior Engineer
- decision (Phase 2): `placeAgentsMd()` diverges from its closest sibling `installPreCommitHook()` on
  purpose. That function returns early when its marker is present, so it never refreshes a stale
  block; R2 requires replace-in-place, so this one replaces. Review should judge the divergence
  deliberately rather than read it as an inconsistency.
- decision (Phase 2): the extra-block sweep collapses a file carrying two or more pairs down to one,
  because R2's acceptance is "exactly one marker pair" and a file that somehow acquired two would
  otherwise accumulate forever.
- decision (Phase 2, post-reopen): the block regex is tempered against a second `BEGIN` rather than
  using a plain non-greedy middle. Review should treat this as the load-bearing line of the whole
  change: it is the difference between replacing our own block and deleting a user's file contents
  between an orphan marker and ours.
- constraint learned (Phase 2): an exit gate is evidence about the cases it encodes, nothing more.
  All four original conditions used well-formed input, so 13/13 said only that the happy path worked.
  The one defect that mattered lived in malformed input, which no condition described. Review and
  Test should weigh case (e) accordingly.
- decision: the asset holds the block **body** only; the version-stamped markers are emitted by
  `init` at write time (Phase 2). Storing a literal `agentsmyth:1.1.0` pair in the asset would freeze
  the stamp at whatever version the file was authored under, defeating Q1's purpose.
- constraint: R5's "block stays small" is enforced here as a line count because that is the only
  binary form available; the plan's exit gate names ≤ 25 lines.
- tradeoff: shrinking the block loses inline gate text for Codex users. Accepted by the user at
  brief-review via Q2 option 1, and offset by R4 naming the hook for the first time.
- downstream: Phase 2's exit gate asserts against these bytes, so this file must be final before the
  writer is implemented.

## Blockers

none

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Review fix pass (F1, F2) | complete | 2026-09-13 | Both review findings closed. resolveHooksDir() extracted so the hook's real location and the advertised location cannot drift again. Suite hardened 17 to 20 checks; both fixes mutation-proven. |
| Phase 6 - Release note | complete | 2026-09-13 | Three gate conditions met. An unintended package.json description re-escaping was caught and reverted so the diff is one line. |
| Phase 5 - Regenerate and close the example gap | complete | 2026-09-13 | RI3 done; two plan errors about dist/ corrected in the log (gitignored, so its gate could never fail; the real guarantee is release.yml line 51). RI6 NOT closed — nothing validates example AGENTS.md files, so a fixture would be fake coverage. Recorded as a skipped check with all six required fields, owner user, blocks_ship no. |
| Phase 4 - Trials and suites | complete | 2026-09-13 | 17-check suite committed and registered. Proven load-bearing by reverting the fix: scenario E fails 3 checks, A-D stay green. Mutation baseline unmoved. |
| Phase 3 - Codex reconciliation and convention documentation | complete | 2026-09-13 | Three gate conditions met. Five suites green. Included a fix to a stale example log line that would otherwise have shipped describing behaviour that no longer exists. |
| Phase 2 - init owns the write | complete (reopened once) | 2026-09-13 | First closed on 13/13 gate checks; reopened on a user challenge and found to carry two defects, including silent user-content deletion on an orphan BEGIN (R3). Both fixed, gate extended to 17/17. The gate passing was not evidence the code was right — it only covered well-formed input. |
| Phase 1 - Block content and marker grammar | complete | 2026-09-13 | Six exit-gate conditions measured and met; table in the Implementation Log. One pre-work baseline figure (line count) was recorded wrong and corrected in place rather than quietly overwritten. |
