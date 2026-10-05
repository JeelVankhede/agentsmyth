---
slug: open-items-remediation
version: 1
artifact: review
status: ready-for-next-phase
created: 2026-09-08
updated: 2026-09-08
manifest_ids:
  - R1
  - R2
  - R3
  - R4
  - R5
  - R6
  - R7
  - R8
upstream:
  - workflow/artifacts/briefs/open-items-remediation-v1.md
  - workflow/artifacts/plans/open-items-remediation-v1.md
  - workflow/artifacts/tasks/open-items-remediation-v1.md
orchestration:
  phase: review
  status: ready-for-next-phase
  next_phase: test
  blockers: []
  user_checkpoint: none
council:
  mode: single-agent
---

# Open-Items Remediation (pre-1.1.0) — Review

## Findings

### F1 — P1 — the chain record covers 4 of the branch's 17 commits

**Area:** `workflow/artifacts/tasks/open-items-remediation-v1.md`, whole branch
**Manifest IDs:** all (R1–R5 are what the record covers; the finding is what it does not)

Build closed at `9ff59f6` with all five phases complete. Thirteen commits landed after that:
`87e8a1b` (OI-65/OI-5 — 96 grandfathered artifact violations repaired at source,
`workflow/config/artifact-baseline.yaml` emptied) and twelve mutation-defence commits
`443a6c3..b8fe90a` (OI-82). None of that work appears in the brief's scope, the plan's five
phases, the task artifact's `## Changed Files`, its `## Verification Items`, or its
`## Phase Completion Log`. The only artifact those thirteen commits touched is
`workflow/artifacts/open-items.yaml`.

Two concrete consequences, not just bookkeeping:

- The task's `## Command Results` reads `npm run violations:test — 129/129`. At branch head the
  same suite measures 209/209. The recorded evidence describes a smaller change than the PR
  merges, so Ship would be citing numbers that no longer correspond to the diff.
- Three shipped validators changed outside any plan: `check-pending-setup.mjs` (gained `--dir`,
  making its eight rules reachable), `check-domain-placeholders.mjs` (excludes `test/fixtures/`),
  and `lib.mjs` (an unused export deleted). Each is defensible on its own — I read all three and
  found no defect — but none passed through a phase gate that was watching for them.

**Fix:** extend the chain to what it actually shipped — add a Phase 6 (OI-65/OI-5) and Phase 7
(OI-82) to the plan with their own requirement IDs, declare their `Changed Files` in the task
artifact, and re-run the command table at head so the recorded numbers match the diff. If you would
rather keep this chain at its original five phases, move the thirteen commits onto their own branch
and chain instead. Either is fine; shipping the current record as-is is not.

**Fixed 2026-09-08** (user-authorised fix pass). R6 and R7 added to the brief with a Scope Change
note that says plainly which requirements were written retroactively and that R7 reverses a stated
Non-Goal; Phases 6, 7 and 8 added to the plan with their Touches; every path on the branch declared
in the task artifact's Changed Files, which `check-scope-fence` now confirms is inside a declared
phase's Touches; the command table re-run at head and recorded separately from the stale one rather
than overwriting it. Splitting the thirteen commits onto their own chain was the alternative, and
the reason for not taking it is recorded in the brief rather than left implicit.

### F2 — P1 — an uncovered file landed on this branch, so the gate R1 repaired was bypassed

**Area:** `test/run-domain-placeholders-tests.mjs` (added in `b4db7c6`)
**Manifest IDs:** R1

`test/run-domain-placeholders-tests.mjs` is matched by no `## Changed Files` entry in any task
artifact in the repo — I checked all of them by re-implementing `check-commit-coverage.mjs`'s
`coveredPaths()`/`isCovered()` union over the 184-file diff; it is the single uncovered path of the
81 non-safe files.

The gate would have caught it. Reproduced in an isolated git repo with one covered and one
uncovered `test/*.mjs` staged: `check-commit-coverage` exits 1 and names
`test/run-domain-placeholders-tests.mjs`. `b4db7c6` staged more than one non-safe file, so the
`TRIVIAL_MAX_FILES` escape cannot account for it, and the file is neither Markdown nor under a
`SAFE_PREFIXES` entry. The commit therefore ran with `--no-verify`, or the hook did not fire.

This is OI-83's symptom — a gate that fires on a probe but not on a real commit — recurring on the
branch that repaired that same hook in `414b2e3`. OI-83 is still open, which is correct, but it now
has a second, reproducible instance rather than one unexplained one.

**Fix:** declare the path in whichever task artifact ends up owning the OI-82 work under F1, and
append this instance to OI-83 with the reproduction above. If the bypass was deliberate, record
that it was — an unexplained bypass and an accepted one look identical in git.

**Fixed 2026-09-08.** The path is declared under Phase 7. OI-83 now carries the reproduction and,
more usefully, a narrowed question: the coverage rule was recomputed against the task artifacts as
they existed at *each* of the two commits and it rejects both, the hook is mode 100755 at both
commits, `core.hooksPath` is set, the trivial-size escape cannot apply to either, and the globally
installed CLI does support `check --staged`. Rule, validator and installation are all correct, so
what did not happen is execution. The cause is still not claimed — `--no-verify` leaves no trace —
so the item stays open with a concrete next action: give the coverage rule a range mode so CI can
re-run it on the PR head, where a local bypass has no effect. That is new capability in a shipped
validator and is not smuggled into this chain.

### F3 — P2 — the hook now runs the repo's CLI but still the globally installed validators

**Area:** `.githooks/pre-commit`, `bin/agentsmyth.mjs:74-89`
**Manifest IDs:** R1

R1 makes both hook copies prefer `node ./bin/agentsmyth.mjs`, and the stated goal is that "the gate
tests the code under change". The binary now does. The validators do not: `resolveValidator()`
orders candidates `definitions_root` → `AGENTSMYTH_HOME` → repo-local `workflow/validators` →
`pkgRoot/src/workflow/validators`, and this repo's `workflow/config/repo-profile.yaml` sets
`definitions_root: ~/.agentsmyth/workflow`. The first candidate always exists, so the repo's own
`src/workflow/validators/` is never reached.

OI-86's own text judged this harmless because the two trees were byte-identical. They are not any
more, and R2 is why: eight validators differ from `src/` today —
`check-assumptions.mjs` (the file R2 fixed), `lib.mjs`, `check-council-record.mjs`,
`check-definitions.mjs`, `check-domain-placeholders.mjs`, `check-finding-quality.mjs`,
`check-pending-setup.mjs`, `check-release-readiness.mjs`. The pre-commit gate running in this repo
right now executes a `check-assumptions.mjs` that does not contain R2's fix.

**Fix:** immediate — `npm run build && agentsmyth prepare`, so the global tree tracks source again;
this also clears the `version skew detected` notice `check` currently prints. Durable — decide
whether a repo that *is* the package should resolve validators from its own `src/` ahead of
`definitions_root`, and record the answer on OI-86 or OI-83 rather than leaving the coupling to be
rediscovered. Note this cannot be worked around with an env var: `AGENTSMYTH_HOME` is checked
*after* `definitions_root`, not before.

**Fixed 2026-09-08 — the durable half.** `resolveValidator()` puts the package's own
`src/workflow/validators/` first when the resolved repo root and the package root are the same
directory and that copy exists. Both conditions are required, and neither can hold for a consumer:
`package.json`'s `files` never ships `src/workflow/`, and an install lives in `node_modules` or an
npx cache rather than at the repo root being checked.

Evidence, in that order: a marker inserted at import time in a source validator did not appear when
the repo's own CLI ran the phase gate (the defect, reproduced), and appears after the change.
Conformance `r8-source-precedence` and `r8-consumer-precedence` pin both directions using two
throwaway repos whose identically-named validators say different things.

**Not done, deliberately:** `agentsmyth prepare` was not run. It rewrites `~/.agentsmyth/` and the
five tools' global gate files — machine state outside this repository — and the resolver fix removes
the reason this repo needed it. The global tree is still stale for any *other* repo on this machine;
that is the user's call to make, not a fix pass's.

### F6 — P2 — the version-skew warning gives advice that cannot clear it

**Area:** `bin/agentsmyth.mjs:147-154`
**Manifest IDs:** R4 (found by re-running R4's own rehearsal), R8

Raised 2026-09-08 by re-running the OI-69 upgrade rehearsal against the genuinely published 1.0.0
tarball, which is exactly what that rehearsal exists to catch.

On upgrade, `check` warns that `repo-profile.yaml` was written by an older version and tells the
reader to run `agentsmyth prepare` — then adds that prepare does not update `repo-profile.yaml`. It
never says what does. Verified end to end in the rehearsal consumer: after `prepare`, the stamp is
still `1.0.0` and the identical warning prints on every subsequent `check`. The one command that
does update it is `agentsmyth init`, which the warning never mentions, and which also re-scaffolds
`.agentsmyth/` — so a consumer who finds that route hits a fresh `check-setup-complete` failure for
a directory they had already been told to delete.

The warning is informational and nothing is blocked, which is why this is P2 and not P1. But it is
a permanent warning on the upgrade path this release depends on, and the remedy it names cannot
work by its own admission.

**Fix:** name what actually clears it. `prepare` stays global-only — that is a WP-R7 invariant, not
an oversight — so the message now says the stamp persists until updated, that prepare deliberately
does not write repo files, and that re-running `init` updates it, with the `.agentsmyth/`
re-scaffold called out so it is not a surprise.

**Fixed 2026-09-08.** Message rewritten and verified against the rehearsal consumer with its stamp
reset to `1.0.0`.

### F4 — P3 — a shipped module lost an exported symbol with no release note yet

**Area:** `src/workflow/validators/lib.mjs`
**Manifest IDs:** none (arrives with the OI-82 work covered by F1)

`19ba50e` deleted `export function assertCondition()`. It has no callers in `src/`, `test/`,
`scripts/` or `bin/`, so nothing in the package breaks, and `lib.mjs` is not a documented extension
point. But `validators/` ships in `package.json`'s `files`, so this is an exported symbol
disappearing from a published module in a minor release.

**Fix:** one line in the 1.1.0 CHANGELOG entry (still unwritten — OI-87 step 3) under Removed. No
code change.

**Fixed 2026-09-08.** `CHANGELOG.md` now carries the full 1.1.0 entry — the two councils, per-repo
behavior tuning, the mutation audit and its ratchet, the release checklist, the resolution and mode
changes, the four fixes, and `assertCondition` under Removed. This closes OI-87's step 3 ahead of
its sequence; the entry's date is today's, and `docs/release-checklist.md` requires a real date, so
it needs correcting if the dispatch slips.

### F5 — P3 — `check-council-record` contradicts `single-agent-path.md` for non-Complex chains

**Area:** `src/workflow/validators/check-council-record.mjs:275-296`,
`src/workflow/skills/lifecycle-review/references/single-agent-path.md`
**Manifest IDs:** R3 (adjacent — R3 edited this skill, though not this text)

`references/single-agent-path.md` tells a Standard chain to record `council: {mode: single-agent}`.
The output schema's starter block ships a `council:` example that includes a `resolution:` block.
`check-council-record` computes the expected mode from those resolution inputs and, for
`task_class` other than `complex`, requires `refused` with `refusal_reason: not-complex` — so a
Standard review that follows the skill *and* fills in the starter block's resolution fields is
rejected, with a message telling it to declare a refusal the skill explicitly says is not needed
("task class is not `complex` → single-agent, **no refusal needed**").

This review avoided the trap by recording `mode: single-agent` with no `resolution` block, which is
what `single-agent-path.md` asks for. That is a workaround, not agreement between the two.

**Fix:** pick one contract. Either teach the validator that `single-agent` is the expected mode when
`task_class !== complex` and reserve `refused` for the two kill-switch cases, or change the skill to
require `refused`/`not-complex` for non-Complex chains. The validator's current wording is the
narrower change and matches the skill's own mode-resolution order.

**Fixed 2026-09-08** — the validator, as recommended. It was the side that disagreed with both the
skill *and* the frontmatter schema's own description of `refused` ("the council was applicable but
did not fire"), which a non-Complex chain never was. `not-complex` stays in the `refusal_reason`
enum so records written under the old reading still parse. Fixture `jd` asserts the rule's own
wording rather than merely that an error occurred: the mismatch message is shared with the two
kill-switch branches, so a broader assertion would have passed while leaving the new behaviour
undefended — the exact trap the OI-82 sweep documented twice.

## Severity Summary

| Severity | Open | Found | IDs | Status |
|---|---|---|---|---|
| P0 | 0 | 0 | — | — |
| P1 | 0 | 2 | F1, F2 | fixed 2026-09-08 — chain record extended; path declared and the bypass reproduced on OI-83 |
| P2 | 0 | 2 | F3, F6 | fixed 2026-09-08 — resolver precedence, pinned in both directions; skew-warning remedy named |
| P3 | 0 | 2 | F4, F5 | fixed 2026-09-08 — release note written; validator aligned with the skill |

## Requirement Coverage

| Manifest ID | Evidence | Status | Notes |
|---|---|---|---|
| R1 | `.githooks/pre-commit` and `src/assets/hooks/pre-commit` both read at head: coverage proxy runs as `if ! run_agentsmyth check --staged`, `run_agentsmyth` defined as a shell function with `./bin/agentsmyth.mjs` preferred. Both copies carry identical logic. `npm run commit-coverage:test` 7/7. | covered | The `set -e` reachability defect (OI-79) is genuinely fixed, and the function form is the right call — a variable holding `node ./bin/...` would word-split under the artifact loop's newline `IFS`. F3 records that the binary preference does not reach validator resolution; F2 records that the repaired gate was bypassed on this branch. |
| R2 | `check-assumptions.mjs` selects the highest brief version by numeric reduce over a set the filter guarantees matches `-v[0-9]+\.md`; fixture `fw` registered and rejecting. `npm run violations:test` 209/209 with attribution 92/92. | covered | Numeric comparison is the right fix (`-v10` sorts before `-v2` as a string). The `reduce` cannot throw on a non-matching name because the regex filter runs first. Baseline for this validator is now 0 undefended of 4 rules. |
| R3 | `lifecycle-ship/SKILL.md` step 4a unconditional and 4b present; `lifecycle-build/SKILL.md` step 8a present; `lifecycle-review/SKILL.md` Workflow preamble present. `npm run conformance:test` 46/46, including `r22-review-single-agent-verbatim`. | covered | `references/single-agent-path.md` was correctly left untouched — its ten steps are byte-locked, and the Review guidance went to the preamble where it binds both modes. Prose-only, so this is the OI-50 category of change: followed because it is written down, not because anything enforces it. |
| R4 | `docs/release-checklist.md` at head. Verified two of its claims independently rather than reading them: the `warn-until-1.2.0` window is exactly 6 declarations, 1 in `verification.schema.yaml` and 5 in `agent-behavior.schema.yaml`, as the table states; `release.yml` does run `npm version <bump>` itself, so the do-not-pre-bump rule is real and `package.json` correctly still reads 1.0.1. | covered | The strongest artifact in the chain. The pre-bump hazard was found by nearly causing it during the rehearsal, and the checklist says so. The OI-69 rehearsal itself I did not re-run — see Residual Risk. |
| R5 | `test/run-root-resolution-drift-tests.mjs` scenario 5; `npm run root-resolution:test` 21/21 with `gitcwd-routes`, `gitcwd-distinct`, `gitcwd-no-target`, `gitcwd-unknown-falls-back` all passing. | covered | The scenario asserts routing plus both fallbacks against two real sibling checkouts, which is what OI-20 asked for. The relative-vs-absolute `sibling_repos[].path` hazard it surfaced was recorded on the item rather than patched into `join()` semantics — correct restraint for a documented schema contract. |
| R6 | `workflow/config/artifact-baseline.yaml` carries `entries: []`; `npm run validate` runs `check-artifacts` against the real corpus with no baseline to lean on and reports no violation. | covered | Recorded retroactively (F1). The repair is real — the 96 were fixed in the artifacts that carried them, and the file's own note records the breakdown, including that 35 of the 96 were manifest IDs declared in a form the validator did not scan for rather than missing scope. |
| R7 | `test/mutation-baseline.json` — 0 undefended across 221 rules in 30 validators; `npm run violations:test` 209/209; `domain-placeholders:test` present in `package.json`, `ci.yml`, `release.yml` and the audit's `SUITES`. | covered | Recorded retroactively (F1), and it reverses a stated Non-Goal — both facts are in the brief's Scope Change note. The zero itself is read from the baseline, not re-measured here; see Residual Risk. |
| R8 | This review's own findings F1–F5 and their remediation, recorded per finding below. | covered | The requirement exists because the review held the chain. Each finding carries its own **Fixed** line with the evidence; the Severity Summary's Open column is the roll-up. |

## Architecture Notes

- role: Staff Reviewer
- decision: single-agent mode, per `lifecycle-review/SKILL.md`'s mode resolution rule 3 — the brief
  classifies this chain Standard (`briefs/open-items-remediation-v1.md:119`), and councils are
  Complex-only. No refusal is logged because none is owed; the mode is in frontmatter, where
  `single-agent-path.md` requires it.
- decision: reviewed the diff `release/1.1.0..HEAD` — what PR #66 merges — rather than the five
  phases the task artifact describes. That choice is what surfaced F1; a review scoped to the
  record would have confirmed the record and missed thirteen commits.
- constraint: the mutation audit (`npm run mutation:audit`) takes tens of minutes and was not run
  here, so the central claim of the OI-82 commits is recorded, not verified. See Residual Risk.
- constraint: the local gate executes validators from `~/.agentsmyth/workflow`, not `src/` (F3), so
  no conclusion about gate behaviour in this repo can be drawn from reading `src/` alone. Every
  gate claim above rests on running the validator directly or on a reproduction.
- tradeoff: `hold` rather than `pass-with-risk`. The R1–R5 work is sound and I would pass it as
  scoped; what cannot be waived into risk is that the artifact chain does not describe the change
  being merged, which is the property the whole lifecycle exists to maintain.
- assumption for Test/Ship: after F1 is repaired, the command table must be re-run at head — the
  129/129 currently recorded is stale by 80 fixtures.
- downstream: F1 and F2 are Build work on artifacts. F3 is a decision for the workflow owner. F4
  lands in the 1.1.0 CHANGELOG entry that OI-87 step 3 already requires. F5 is workflow-contract
  follow-up, unrelated to the release.
- decision (2026-09-08): the user authorised a fix pass over all five findings, so this artifact
  now carries remediation as well as review. The findings are left standing with their evidence and
  a **Fixed** line each rather than rewritten — the Severity Summary's split `Open`/`Found` columns
  exist precisely so that remediating a finding does not make the review look like it found nothing.
- constraint (2026-09-08): the fix pass changed one shipped validator and one shipped CLI path.
  Both are guarded and both are pinned by tests that would fail if the guard stopped holding —
  `r8-consumer-precedence` for the CLI, fixture `jd` for the validator. Neither guard is prose.

## Verification Reviewed

| Item | Outcome | Notes |
|---|---|---|
| `agentsmyth check --phase review --slug open-items-remediation` (repo `bin/`) | pass, exit 0 | Entry gate. Also printed `version skew detected — repo-profile.yaml was written by v1.0.0, CLI is v1.0.1`, which is the same global-tree staleness F3 describes. |
| `npm run validate` | pass, exit 0 | Includes `check-artifacts` against an emptied `artifact-baseline.yaml` — the 96 grandfathered violations are genuinely repaired, not re-baselined. Trailing notice: 4 pending setup items still open. |
| `npm run violations:test` | pass, 209/209, attribution 92/92 | Task artifact records 129/129; the delta is the OI-82 fixtures (F1). |
| `npm run conformance:test` | pass, 46/46 | Includes the byte-lock on `single-agent-path.md` and `shipped-neutrality`. |
| `npm run root-resolution:test` | pass, 21/21 | R5's scenario 5 among them. |
| `npm run commit-coverage:test` | pass, 7/7 | Suite is green while the real gate was bypassed on this branch — precisely why F2 needed a reproduction rather than a suite result. |
| `npm run domain-placeholders:test` | pass, 5/5 | New suite; wired into `package.json`, `ci.yml`, `release.yml` and the audit's `SUITES` list. Correctly wired, undeclared in any artifact (F1/F2). |
| `npm run setup-checks:test` / `setup-refs:test` / `tuning-merge:test` / `checkpoint-approval:test` / `init-prepare-interop:test` / `setup-validator-definitions-root:test` | pass — 13/13, 5/5, 15/15, 9/9, 38/38, 3/3 | Full suite sweep at head. |
| Coverage union re-implemented over the 184-file diff | 81 non-safe files, 1 uncovered | Evidence for F2. 80 of the 81 are covered by task artifacts from *other* chains, since `coveredPaths()` unions every task artifact in the repo. |
| `check-commit-coverage` against a synthetic staged pair | rejects the uncovered path, exit 1 | Evidence for F2 — the gate's rule is correct; it did not run. |
| Global vs. source validator trees compared file by file | 8 of 31 differ | Evidence for F3, including `check-assumptions.mjs` and `lib.mjs`. |
| `test/mutation-baseline.json` read | 30 validators, 221 rules, 0 undefended | Recorded, not re-measured. `repo-digest.mjs` is absent from the baseline because the audit only targets files containing `errors.push(` — a principled exclusion, not a silent cap. |
| `npm run mutation:audit` (full, at head) | pass — `0/221 rules undefended` across 30 validators, `mutation-audit: ok` | Re-measured rather than read from the baseline. This is the claim thirteen of the branch's commits exist to produce, and it holds at head with this chain's own changes in place. |
| `node test/run-mutation-audit.mjs --only check-council-record.mjs` (post-fix) | pass — 73 rules, 0 undefended, `mutation-audit: ok` | The ratchet for the one validator this fix pass changed. No regression against its baseline of 0, and fixture `jd` is what holds the new branch. |
| Whole suite re-run at head after the fix pass | pass — validate 0, violations 210/210 with attribution 93/93, conformance 48/48, root-resolution 21/21, commit-coverage 7/7, domain-placeholders 5/5, setup-checks 13/13, setup-refs 5/5, tuning-merge 15/15, checkpoint-approval 9/9, init-prepare-interop 38/38, setup-validator-definitions-root 3/3 | The counts that moved are the two the fix pass touched: violations 209 → 210 (fixture `jd`) and conformance 46 → 48 (the two precedence checks). |
| `npm run build` after the `src/` change | exit 0, no drift | Bundles regenerated; no tracked generated output changed, so nothing stale ships. |
| Marker experiment, before and after (F3) | 0 hits before, 1 after | The source validator was restored from a backup and `git status` confirms it is unmodified. |
| Coverage rule recomputed at `537eebb` and `b4db7c6` (F2) | rejects both | 4 gated paths / 2 uncovered, and 81 gated / 1 uncovered, respectively. |
| OI-69 upgrade rehearsal against the published 1.0.0 tarball | not re-run | Task artifact records it as clean. Recorded as risk below. |

## Residual Risk

- ~~The mutation audit's zero is unverified here.~~ **Closed 2026-09-08 — re-measured, not read.**
  A full `npm run mutation:audit` at head reports `0/221 rules undefended` across all 30 validators,
  `mutation-audit: ok`, matching `test/mutation-baseline.json` exactly. The audit's `SUITES` list
  omits `test/run-init-prepare-interop-tests.mjs`; that omission can only make rules look *less*
  defended, so it could not have hidden a gap behind the zero either way.
- ~~The OI-69 upgrade rehearsal was not re-run.~~ **Closed 2026-09-08 — re-run in full, and it
  earned its keep.** Against the genuine `npm pack @jeelvankhede/agentsmyth@1.0.0` tarball in an
  isolated `HOME`: 1.0.0 `prepare` + `init` produced a real 1.0.0 consumer (stamp `1.0.0`, PS-1..8,
  27 global validators); the candidate's `prepare` refreshed the tree to 32; skew was detected with
  the correct versions; four per-repo tuning items appended as PS-9..PS-12 with PS-1..8 intact; all
  six configs parsed with the candidate's own parser; and `check` exited 0 once setup was completed.
  Every assertion `docs/release-checklist.md` asks for. It also surfaced F6, which no amount of
  reading the previous run's record would have found.
- **R3 is prose.** Ship 4a/4b, Build 8a and the Review preamble are instructions with nothing
  mechanical behind them — the OI-50 category. Whether they are followed will only be visible in
  later chains. **Filed 2026-09-08 as OI-89**, to be assessed together with OI-50 rather than
  separately: a risk that lives only in a closed review artifact has no owner.
- **The 96 artifact repairs rewrote historical records.** `87e8a1b` normalised frontmatter across
  40+ closed chains' artifacts (`status: complete` → `done`, `user_checkpoint` booleans, `upstream`
  objects → path strings). Structurally correct and user-directed, but it edits the record of
  finished work, and it is the change least covered by any plan (F1).
- **`--dir` with no operand** yields a `"undefined/config"` path in `check-pending-setup.mjs` rather
  than an error, matching the existing convention in sibling validators. Developer-facing flag only.
  **Filed 2026-09-08 as OI-88**, scoped as one sweep across the validator set rather than a
  one-validator fix, and noting that each new guard is a new rule the mutation ratchet will require
  a fixture for.

Added by the 2026-09-08 fix pass:

- **Why the gate did not execute is still unknown** (F2). Everything mechanical checks out, which
  leaves `git commit --no-verify` as the plausible cause and no way to confirm it after the fact.
  Until the coverage rule can run on a commit range in CI, a local bypass remains invisible.
- **The CHANGELOG date is today's.** If the release dispatch slips past 2026-09-08 the entry needs
  correcting first; `docs/release-checklist.md` asks for a real date, and this repo has had to fix a
  changelog date once already.
- ~~`~/.agentsmyth/` is still stale for every other repo on this machine.~~ **Closed 2026-09-08** —
  `agentsmyth prepare` was run on the user's authorisation. All 31 source validators now byte-match
  the installed tree, where 8 differed before. Note what was installed is a 1.1.0 *candidate*: every
  other repo on this machine now gates against definitions that have not been published yet.
- ~~One shipped contract changed.~~ **Withdrawn 2026-09-08 — the premise was wrong, and it is worth
  saying why rather than deleting it.** F5's change was recorded as a contract change to a shipped
  validator. `check-council-record.mjs` does not exist on `main`: `git ls-tree main src/workflow/
  validators/` returns no council validator at all, because councils ship for the first time in
  1.1.0. No published version ever enforced the `refused`/`not-complex` reading, so no consumer can
  hold a record written against it. What looked like a breaking change to a shipped contract is the
  initial contract of an unshipped feature. The installed tree at `~/.agentsmyth` did carry the file,
  which is what made it look shipped — but that tree was written by a `prepare` from a 1.1.0
  candidate, which is the same drift F3 is about.

## Recommendation

pass

The R1–R5 work is done well and I would pass it as scoped: every requirement is covered, every
verification claim I re-ran reproduced, and two of the fixes (R2's selection bug, R4's pre-bump
hazard) close defects that would have cost real time later. The hold is not about that work.

It was about F1 and F2 together. The chain's record described five phases and seventeen files while
the PR merged 184 across seventeen commits, and the one file in that diff which no artifact covered
was the one that proved the mandatory coverage gate had been bypassed to put it there.

All five findings were fixed in a user-authorised pass on 2026-09-08, each with the evidence
recorded above, and the whole suite is green at head.

This artifact recommended `hold`, then `pass-with-risk`, and now `pass`. The three reasons it gave
for not passing cleanly have each been settled, and they are kept in Residual Risk with their
resolutions rather than edited out, because a review that quietly deletes its own wrong calls
teaches nothing:

- The mutation audit's zero was read rather than measured. It has now been re-measured at head:
  `0/221 rules undefended`, `mutation-audit: ok`.
- The global definitions tree was stale. `prepare` was run; all 31 source validators byte-match it.
- The "shipped contract change" was withdrawn — the validator it named has never been published, so
  there was nothing to break.

What remains is ordinary carried risk, each item owned: OI-83 for why the coverage gate did not
execute, OI-88 and OI-89 for the two follow-ups this review would otherwise have left floating, and
the release checklist for the CHANGELOG date. None of them is a defect in this branch.

Test may start.
