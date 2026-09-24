---
slug: wp-r18-delta-upgrades
version: 1
artifact: verify
status: ready-for-next-phase
created: 2026-09-24
updated: 2026-09-24
manifest_ids: [R1, R2, R3, R4, R5, R6, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9, RI10, RI11, RI12, RI13, RI14, RI15, RI16, RI17, RI18, RI19, RI20, RI21]
upstream:
  - workflow/artifacts/briefs/wp-r18-delta-upgrades-v1.md
  - workflow/artifacts/plans/wp-r18-delta-upgrades-v1.md
  - workflow/artifacts/tasks/wp-r18-delta-upgrades-v1.md
  - workflow/artifacts/reviews/wp-r18-delta-upgrades-v1.md
orchestration:
  phase: test
  status: ready-for-next-phase
  next_phase: ship
  blockers: []
  user_checkpoint: none
---

# WP-R18 Version-Aware Delta Upgrades - Verify

## Inputs

- Brief, plan, task and review artifacts for `wp-r18-delta-upgrades`, all present.
- Review recommendation was `hold` with 77 council findings; Build Phase 12 remediated 6 P0 and
  17 P1 under the user's "Fix them all" scope approval.
- `workflow/config/verification.yaml` marks `npm run validate` and `npm run violations:test` as
  `required: true` for `[review, ship]`.
- Entry gate: `agentsmyth check --phase test --slug wp-r18-delta-upgrades` → ok. It initially
  refused, correctly: the review artifact declared a `user_checkpoint` with no
  `## Checkpoint Approval` section. That was fixed by recording the user's real verbatim words,
  not by weakening the gate or self-authoring approval evidence.

## Automated Checks

Every command below was executed in this phase. Nothing is carried forward from Build.

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `npm run upgrade-path:test` | R2, R4, RI5, RI9, RI18, RI20, RI21 | pass | 117 passed, 0 failed |
| `npm run violations:test` | RI3 | pass | 223/223; attribution sweep 107/107 |
| `npm run conformance:test` | R6, RI12 | pass | 49/49 |
| `npm run setup-checks:test` | RI16 | pass | 20/20 — but see V2, which is why this pass proves less than it appears to |
| `npm run root-resolution:test` | RI21 | pass | 24/24, including the fourth git-root copy |
| `npm run agents-md:test` | RI19 | pass | 33/33 |
| `npm run validate` | RI1, RI7, RI11 | pass | exit 0, 26 checks |
| `npm run mutation:audit` | RI3 | pass (Build Phase 12) | 0/234 undefended. Not re-run here: it takes tens of minutes and no validator changed after that run. Recorded as carried evidence rather than re-claimed |
| `npm pack @jeelvankhede/agentsmyth@1.0.1` | release rehearsal | pass | real tarball fetched and installed into an isolated prefix |
| independent digest recomputation | R1 | pass | see Manual QA R1 |

## Manifest Coverage

| Manifest ID | Method | Status | Evidence |
|---|---|---|---|
| R1 | manual QA, independent recomputation | pass | 7 entries, 0 digest mismatches, 0 missing; entry set equals the governed files actually placed |
| R2 | command | pass | `upgrade-path:test` state fixtures |
| R3 | manual QA | pass | backup byte-identical to the pre-upgrade file; live file rewritten |
| R4 | command | pass | one item per drifted file per upgrade |
| R5 | command | pass | descriptors validate at load; an invalid one is refused |
| R6 | command | pass | `conformance:test` — `every-validator-wired`, `cli-invoked-exemptions-are-real` |
| RI1 | command | pass | `npm run validate` exit 0 over the full pre-1.1.0 artifact set |
| RI2 | inspection | pass | `package.json` `dependencies` unchanged |
| RI3 | command | pass | 223 fixtures; mutation audit 0/234 undefended |
| RI4 | command + manual QA | pass | atomic write path; symlink containment proven by X2/X3 and by revert probe |
| RI5 | command | pass | all six states fixtured, including `newly-governed` |
| RI6 | manual QA | pass | a deliberately corrupted global `router.md` was refreshed before the upgrade proceeded |
| RI7 | command | pass | `validate` exit 0 with backups present |
| RI8 | manual QA | pass | a foreign `artifact-baseline.yaml` was neither backed up nor touched |
| RI9 | command | pass | marker survives pruning; no id re-issue |
| RI10 | inspection | pass | reconcile item names its true target config |
| RI11 | command | pass | `check-pending-setup` accepts `merged-from-backup` |
| RI12 | command | pass | host imports lib.mjs, is CLI-invoked, listed in conformance |
| RI13 | manual QA | pass | CRLF, LF, absent and extra trailing newlines produce one digest |
| RI14 | manual QA | pass | acceptance holds; the enforcement fires on a skipped step 5f and stays silent after it ran. V1 found it dead, Phase 13 scoped it to the config set, re-verified by the probe that found it |
| RI15 | inspection | pass | no shipped surface names `init` as the upgrade action; site pages no longer contradict |
| RI16 | manual QA | pass | the comparison fires with the validator run from the global tree, as a consumer runs it. V2 found it inert; `prepare` now stamps the version into the tree it installs |
| RI17 | generated-output comparison | pass | 252/252 bundle blocks identical to source |
| RI18 | manual QA | partial | 6 and 7 verified on darwin; the 8 branch is unexercised — see Skipped Checks |
| RI19 | manual QA | pass | content above and below the markers survived; content inside was replaced |
| RI20 | manual QA | pass | one backup retained; a still-open item's `backup_path` survived a second upgrade |
| RI21 | manual QA | pass | polyrepo backup landed inside the member repo and `git status` reports it |

## Manual QA

Environment for every scenario: macOS (darwin), node v24, isolated scratch `HOME` and scratch git
repos under the system temp directory. No scenario ran against this repository.

| ID | Scenario | Expected | Observed | Outcome |
|---|---|---|---|---|
| R1 | `init` a fresh repo; parse the manifest without the CLI's reader and recompute every digest from the normalization rule the schema declares | every entry matches | 7 entries, 0 mismatches, 0 missing; `AGENTS.md` and `pending-setup.yaml` correctly absent | pass |
| R3 | drift `domain.yaml`, upgrade with a descriptor present, diff the backup against the pre-upgrade content | byte-identical | byte-identical, and the live file was genuinely rewritten | pass |
| RI6 | overwrite the global `router.md` with junk, then upgrade | global tree refreshed first | 31 bytes → 8252 bytes, upgrade exit 0 | pass |
| RI8 | place a foreign `artifact-baseline.yaml` in `workflow/config/`, then drift a real config and upgrade | foreign file never backed up | not backed up, still present | pass |
| RI13 | digest one file's content as LF, CRLF, no trailing newline, and three trailing newlines | identical | 1 distinct digest across all four | pass |
| RI18 | count manifest entries with `core.hooksPath` set, and in a default repo | 7 and 6 on darwin | 7 and 6; `AGENTS.md` absent from both | pass |
| RI19 | add user content above the hook's marker block, inside it, and below it; upgrade | outside preserved, inside replaced | above kept, below kept, inside replaced | pass |
| RI20 | drift, upgrade, drift again, upgrade, without resolving the first item | one backup; the open item's path still resolves | 1 backup after each; first `backup_path` still resolvable | pass |
| RI21 | `mode: polyrepo-member` workspace outside any git repo, with one member checkout; drift and upgrade | backup inside the member tree, visible to git | `git status -uall` in the member reports it; nothing stranded beside the shared `workflow/` | pass |
| TB | release-checklist rehearsal: bootstrap with the published 1.0.1 tarball, upgrade with the candidate | adopt, then delta | see below | pass with one fixture defect |

### Release rehearsal against the published tarball

`npm pack @jeelvankhede/agentsmyth@1.0.1`, installed into an isolated prefix, used to bootstrap a
consumer repo, then the candidate run over the top. This is the only place the delta path meets a
genuinely older published package rather than a manifest state a test synthesised.

- A 1.0.1-bootstrapped repo has no manifest — the entire installed base on the day this ships. **pass**
- The first candidate upgrade adopted the baseline and reported nothing as drifted. **pass**
- The user's pre-existing edit was still on disk, untouched, after that adopt. **pass**
- `agentsmyth check` reported no version skew immediately after that one run. **pass** — this is the
  P2-2 fix meeting a real old repo; before it, two runs were needed and the warning told the user to
  run the command they had just run.
- A second upgrade was a clean no-op. **pass**
- An edit made after adoption was correctly detected as drift. **pass**
- `agentsmyth check` exiting 0: **fixture defect, not a product defect.** It exited 1 on unfilled
  `<PLACEHOLDER>` values and a missing `repo-mental-map.md` — because the rehearsal deleted
  `.agentsmyth/` to simulate setup completing without ever running the setup skill that fills those.
  `check-lifecycle` itself passed, and its new digest comparison reported 6 compared, 0 drifted,
  which is the correct answer for a genuinely-upgraded repo. Recorded as a defect in my rehearsal
  rather than charged to the product.

## Generated Output Evidence

Verified by comparison against source, not inferred from having run a build.

- `dist/workflow-bundle.md`: 252 `<!-- FILE -->` blocks extracted and compared against
  `src/workflow/` — **0 drifted, 0 without a source counterpart**. Both new schemas present.
- Root `validators/lib.mjs`, `check-config.mjs`, `check-setup-complete.mjs`: byte-identical to their
  `src/workflow/validators/` counterparts.
- A first pass reported 252 of 252 drifted. That was my extractor matching to the next `FILE`
  header instead of the explicit `<!-- END FILE -->` terminator, so every block absorbed its own
  terminator. A 100% mismatch rate is the signature of a broken comparison, not of broken output;
  recorded because the number would otherwise look like a finding.

## Findings

Two, both in the Build Phase 12 remediation, and both the same shape as the defects the Review
council was convened to find: **a check that cannot fail for the reason it was written.**

### V1 — RI14's enforcement cannot fire in the scenario it was written for

**Manifest ID:** RI14. **Surface:** `src/workflow/validators/check-lifecycle.mjs`.

The Review's P1-11 found RI14 enforced by `src/setup/SKILL.md` prose alone. Phase 12 added a digest
comparison that errors when a baseline was never re-taken after setup. The condition is
`drifted === compared && compared >= 3` — every governed file differing from disk.

That condition cannot hold in the case it targets. Setup rewrites the **five config files**; it does
not touch the pre-commit hook or the Cursor adapter, which stay pristine. So the real signature of a
skipped step 5f is 5 drifted of 7 governed, never 7 of 7.

Reproduced twice. A first pass replaced only `<PLACEHOLDER>` tokens and produced 3 of 7, which I
did not trust because the simulation was weaker than reality. A second pass rewrote all five configs
as setup genuinely does: **5 drifted of 7 compared, flagged = false.** The control also holds — after
5f runs, 0 of 6 drift and the check correctly stays silent, so there is no false positive to trade off.

**Consequence.** RI14 remains enforced by prose. The digest comparison is still worth having — it
reports drift to a reader before an upgrade acts on it — but the error branch is dead, and the
review artifact claims that gap is closed.

**Fix direction:** scope the condition to entries under `workflow/config/`, which is what setup
rewrites, rather than to the whole governed set.

**RESOLVED — Build Phase 13, 2026-09-24.** Scoped to config entries. Re-verified by the same probe
that found it: skipped 5f → 5 of 7 governed drift, 3 of 3 configs drift, rule fires; 5f run → 0 of 6
drift, rule silent. Pinned by `V1-catches-skipped-5f`, which fails when the condition alone is
reverted to the whole-governed-set form.

One further defect surfaced while fixing it, and it is the same mistake again one level down. The
first fix matched config entries with `entry.path.startsWith(\`${wf}/config/\`)`. `wf` is the
*validator's* notion of the workflow directory and is overridable per invocation; entry paths are
written by the *CLI*, which always emits `workflow/config/<name>`. Under `AGENTSMYTH_WF` — which is
how every fixture runs — those two disagree, so the rule silently stopped firing and its own brand
new rejection fixture went from rejecting to passing. Caught because `violations:test` dropped to
222/223, not by reading the code. Now matched on the manifest's own path shape, independent of `wf`.

### V2 — RI16's installed-version comparison is inert where it ships

**Manifest ID:** RI16. **Surface:** `src/workflow/validators/check-setup-complete.mjs`.

The Review's P1-8 found the `AGENTS.md` marker check near-tautological: it compared two stamps
written by the same invocation, so it could not catch a repo whose stamps agreed but trailed the
installed CLI — the exact scenario OI-105 was filed for. Phase 12 added a read of the installed
package's own version, best-effort, falling back to the repo-local comparison.

The fallback is the only branch that ever runs in a consumer. The validator ships to
`~/.agentsmyth/workflow/validators/` and is copied by `init` to `.agentsmyth/validators/`.
**Neither location has a `package.json` at either path the reader probes** — verified directly:
`../../../package.json exists=false` and `../../package.json exists=false` for both.

So `readPackagedVersion()` returns null, the comparison never fires, and the check degrades to
exactly the tautology it was written to remove. Demonstrated side by side against a repo whose two
stamps agree at `0.0.1`:

- run from the global tree, as it ships → `v0.0.1 (matches repo-profile.yaml; installed version not
  resolvable from here)`, comparison fired: **false**
- run from the source tree, as `setup-checks:test` runs it → `marker stamp is v0.0.1 but agentsmyth
  v1.0.1 is installed — this repo is behind`, comparison fired: **true**

**The unit test passes because it exercises a path that does not exist in deployment.** 20/20 green
is true and proves the code works when a package.json resolves; it says nothing about whether one
ever does. That is why this is a Test finding and not a Review one — it needs the shipped layout.

**Fix direction:** resolve the installed version from something that exists in the shipped layout.
`init` and `upgrade` already write a version stamp the CLI controls; the validator needs a source of
truth that travels with the global install rather than with the source checkout. Whatever the
mechanism, the accompanying test must run the validator **from the global tree**, or it will pass
for the same wrong reason again.

**RESOLVED — Build Phase 13, 2026-09-24.** `agentsmyth prepare` now writes
`~/.agentsmyth/workflow/installed-version.txt` as part of expanding the tree, and the validator reads
it from a path relative to itself before falling back to the source-tree package.json probe. A plain
file rather than an env var or a CLI argument, because the README documents running the validator
directly and it must answer the same way then.

The test runs the validator **from the global tree**, per the fix direction above. That mattered
twice over: the revert probe initially reported this fix *unpinned*, because it reverts `src/` while
the global tree is expanded from `dist/` — so the revert never reached the copy the test exercises.
That is the identical wrong-path error, now in the probe rather than the product. The probe rebuilds
the bundle after reverting a `src/` file, and both halves of the fix are pinned:
`V2-fires-in-shipped-layout` fails when either the stamp write or the stamp read is reverted alone.

## Skipped Checks

| Check | Why skipped | Risk | Owner | Blocks ship | Manifest IDs |
|---|---|---|---|---|---|
| RI18 eight-entry branch | Requires a non-darwin platform with a tracked hook and the Copilot adapter placed. Every environment available to this phase is darwin. Six and seven are verified by execution; eight is verified by code reading only | One of three counts in a mid-chain-restated acceptance rests on nobody having run it. Bounded: the conditional logic is shared with the two branches that were executed | Ship, or a CI matrix job | no | RI18 |
| RI13 native Windows checkout | The CRLF case was constructed by normalising a repo on darwin, not by a Windows checkout under `core.autocrlf`. The digest rule itself is verified directly against four line-ending variants | A behaviour appearing only through git's own checkout filter would not surface | Ship, or a CI matrix job | no | RI13 |
| `npm run mutation:audit` re-run | Carried from Build Phase 12 rather than re-executed: tens of minutes, and no validator changed after that run. Cited, not re-claimed | If a validator had changed since, the figure would be stale. It has not; `git log` shows no validator commit after the ratchet run | Test (this phase) | no | RI3 |

## Architecture Notes

- role: Senior QA
- decision: Verify R1 with an **independently reimplemented** digest rather than the CLI's own
  `digestFile()`. Re-using it would only prove the CLI agrees with itself. The normalization rule was
  implemented here from `provenance.schema.yaml`'s declared words, so a bug in the CLI's
  implementation of that rule would surface as a mismatch rather than cancel out.
- decision: Run the release rehearsal against the **actually published** 1.0.1 tarball rather than a
  repo edited backwards into the old shape. That is the difference between testing the upgrade path
  and testing a fixture's idea of it, and it is where the P2-2 skew fix met a real old repo.
- constraint: Every environment here is darwin, so two acceptance branches could not be executed at
  all. Both are recorded as skipped checks with owners rather than inferred from code reading and
  reported as passes.
- tradeoff: Both findings were reachable only by running the code somewhere other than where its
  tests run it. V1 needed a faithful setup simulation; V2 needed the shipped validator layout. Neither
  would have been caught by adding more assertions to the existing suites, which is the transferable
  lesson: a test that runs the subject from the wrong location can be green and meaningless.
- assumption Ship must preserve: the two findings below are fixed and re-verified **in the shipped
  layout**, not only in a unit test. If V2 is fixed and its test still runs from the source tree,
  nothing has changed.
- downstream: Ship additionally owns the Notion source-of-truth handoff and the RI18/RI13 platform
  branches. Reflect owns the OI-105 ledger closure, which must follow V2's fix — closing OI-105
  against a check that is inert in deployment would record a repair that has not happened.

## Finding Quality Closure

No *pending* row was settled by this phase, and that is the honest result rather than an omission.

Five rows remain `pending` in `workflow/artifacts/finding-quality.yaml`. Three (FQ-57, FQ-58, FQ-59)
are the Ship-owned Notion handoff; one (FQ-63) is the Reflect-owned ledger rotation; one (FQ-80) is
RI18's eight-entry branch, which this phase tried to settle and could not, because no non-darwin
environment was available. Guessing at any of them is what `pending` exists to prevent.

**Three archived rows are now known to have closed prematurely, and that matters more than the five
still open.** At Review I closed 72 rows `proved-real` with the resolution "Remediated in Build
Phase 12". Two findings behind three of those rows were not, in fact, remediated:

| Row | Finding | Closed as | What this phase found |
|---|---|---|---|
| FQ-79 | F23 — RI14 enforced by prose alone | proved-real | V1: the enforcement added for it cannot fire |
| FQ-131 | F75 — challenger confirmation of the same | proved-real | same |
| FQ-81 | F25 — RI16's check is near-tautological | proved-real | V2: still tautological in the shipped layout |

The archive is append-only by contract — rows are never edited or removed once written — so those
three are not rewritten here. What is wrong with them is not the `proved-real` verdict, which is
still true: acting on each finding did confirm it was real. What is wrong is the `resolution` line's
implication that acting on it worked.

The general lesson is the one this chain keeps relearning: **a phase that both performs work and
records its own success will record success.** Review closed those rows on the strength of a test
suite that passed, and both of the tests in question ran the subject from a location the product
never runs it from. Reflect should decide whether `resolution` needs a shape that can be corrected
by a later phase, since the current one can only be written once, by the phase least able to judge it.

**Updated after Build Phase 13.** V1 and V2 are now fixed and re-verified, so the three rows'
`proved-real` verdicts are correct and their resolutions are — finally — true. That does not make
the record clean: those rows asserted a working fix for roughly a day before one existed, and
nothing in the ledger shows that gap. Two facts are worth carrying to Reflect rather than treating
as closed:

- A `resolution` written by the phase that performed the work cannot be corrected by the phase that
  discovers it was wrong. The archive is append-only, which is right for tamper-resistance and wrong
  for this. A `verified_in_phase` field, written later and by someone else, would have caught it.
- The same wrong-path error occurred three times in this chain at three levels: in the product
  (V2's package.json probe), in the test (`setup-checks:test` running the validator from `src/`),
  and in the verification tooling (the revert probe reverting `src/` without rebuilding `dist/`).
  Each was invisible from inside its own layer. That is a pattern worth a rule, not three fixes.

## Sign-Off

- Verifier: Claude (Senior QA), acting for this chain
- Date: 2026-09-24
- Commands run: 10 automated, 10 manual QA scenarios, 1 release rehearsal against a published
  tarball, 1 generated-output comparison over 252 files
- Coverage: 26 of 27 manifest IDs pass, 1 partial (RI18, platform-bound), 0 fail, 0 waived
- Recommendation: ship

**Amended 2026-09-24 after Build Phase 13.** This artifact first recommended `hold` on V1 and V2.
Both were fixed and re-verified by the same probes that found them, rather than by new assertions
written to agree with the fix, and both are now pinned by a test that fails when that fix alone is
reverted. The findings below are left as written — a verify artifact that erases what it caught once
the fix lands stops being evidence that anything was caught.

The upgrade mechanism verified cleanly against a real published predecessor across all nine
rehearsal rows: backups survive a second upgrade, polyrepo lands inside a git tree, content outside
markers is preserved, a repo with no manifest adopts cleanly and clears its skew warning in one run,
and a fully set-up 1.0.1 repo brought current passes `agentsmyth check`.

RI18's eight-entry branch remains unexercised and is the one item carried to Ship. It is recorded as
a skipped check with an owner, not counted as a pass.
