---
slug: wp-r25-prerelease-hardening
version: 1
artifact: task
status: in-progress
created: 2026-10-03
updated: 2026-10-03
manifest_ids:
  - R1
  - R2
  - R3
  - R4
  - R5
  - R7
  - R8
  - R10
  - RI2
  - RI7
  - RI8
  - RI9
  - RI11
  - RI12
upstream:
  - workflow/artifacts/briefs/wp-r25-prerelease-hardening-v2.md
  - workflow/artifacts/plans/wp-r25-prerelease-hardening-v1.md
orchestration:
  phase: build
  status: in-progress
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# WP-R25 Pre-Release Hardening - Task

## Active Phase

- Phase: Phase 4 - Bundle pruning
- Manifest IDs: R9
- Exit gate: `check-lifecycle --phase think` exits non-zero for a Complex chain with no resolved
  `model_tier` and exits 0 once one is set; `check-council-record` rejects a council record that
  omits `model_tier` when the config declares one and accepts one that carries it; `agentsmyth
  check` invokes `check-council-record` in a scratch consumer repo, and a repo with no council
  artifacts still exits 0; `render-adapters` reports shims current with five member definitions
  present; `validate`, `violations:test` and `conformance:test` all exit 0; and a dispatched council
  member's actual model, read back from the host, matches the mapped tier.
- Phases 1 and 2 are complete and recorded in the Phase Completion Log; commits `b9dc552` and
  `1ddb8e6`.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Resolution and staleness | complete | R1, R8, RI2, RI9 |
| Phase 2 - Hook durability and execution | complete | R2, R7, RI7, RI11, RI12 |
| Phase 3 - Council capability contract | complete | R3, R4, R5, R10, RI8 |
| Phase 4 - Bundle pruning | active | R9 |
| Phase 7 - Council config depth, override, cost history | pending | R3, R4, R5 |
| Phase 5 - Release evidence and delivery honesty | pending | R11, RI10 |
| Phase 6 - Release integration and invariants | pending | R6, RI1, RI3, RI4, RI5, RI6 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `feat/wp-r25-prerelease-hardening` | 4 modified, 3 untracked: `M workflow/artifacts/open-items-archive.yaml`, `M workflow/artifacts/open-items.yaml`, `M workflow/config/pending-setup.yaml`, `M workflow/config/repo-profile.yaml`, `?? workflow/artifacts/briefs/wp-r25-prerelease-hardening-v1.md`, `?? workflow/artifacts/briefs/wp-r25-prerelease-hardening-v2.md`, `?? workflow/artifacts/plans/wp-r25-prerelease-hardening-v1.md` | All seven belong to this chain: the two ledger files carry the OI-112/113/114 filing and the OI-93 rotation, the two config files carry this chain's own pending-setup pass (PS-4/5/6 resolved, PS-7 annotated), and the three artifacts are this chain's brief v1, brief v2 and plan. No unrelated user change is present in the tree. Branch is non-default per `require_non_default_branch_for_changes: true`. |
| At handoff | `feat/wp-r25-prerelease-hardening` | 9 modified, 4 untracked: the five source/test files below, plus the four config/ledger files carried from this chain's own pending-setup pass, plus this chain's four artifacts | Scope confirmed by `check-scope-fence: ok`. No unrelated user change was present before edits and none was introduced. `dist/`, `validators/` and `workflow/schemas/` were also regenerated and are gitignored build output, so they do not appear here. |

## Scope

- In scope for Phase 1 (complete):
  - `bin/agentsmyth.mjs` — one shared staleness predicate; the three entry points that currently
    decide on directory existence alone (`:2915` in `init`, `:562` in `headlessBootstrap`, reached
    from `check` at `:139`); the stamp write in `runPrepare` at `:2324`; and the governed-set
    decision so a hook path that escapes the repository is excluded.
  - `src/workflow/validators/lib.mjs` — the missing-definitions read surface, so an absent
    `agent-behavior.yaml` names the file and the remedy instead of propagating `ENOENT`.
  - `src/workflow/validators/check-lifecycle.mjs` — the module-scope definitions load, which is
    where RI9's flagged error must be caught (added to the plan's Phase 1 Touches during Build).
  - `test/run-init-prepare-interop-tests.mjs` — five new scenarios covering (a) through (e).
  - `test/run-upgrade-path-tests.mjs` — test isolation only, because R1's guard correctly detects a
    shared-home contamination that suite already had (added to the plan's Touches during Build).
  - Already-modified, carried into this phase's commit per the plan's Branch Strategy
    (`stage_only_approved_scope: true`): `workflow/config/pending-setup.yaml`,
    `workflow/config/repo-profile.yaml`, `workflow/artifacts/open-items.yaml`,
    `workflow/artifacts/open-items-archive.yaml`.
  - This chain's own lifecycle artifacts under `workflow/artifacts/`.
- In scope for Phase 2 (active):
  - `bin/agentsmyth.mjs` — `resolveHooksDir()` gains structural husky detection and returns the
    durable parent when it fires; `installPreCommitHook()` writes the gate block FIRST in the target
    file and sets mode 0755; the manifest classification reports a superseded hook path as superseded
    rather than missing; the false "Single caller by design" comment is corrected.
  - `test/run-upgrade-path-tests.mjs` — husky v9 and husky v8 fixtures, plus drift and backup
    assertions after a husky reinstall.
  - `test/run-agents-md-tests.mjs` — the advertised path must equal the written path in every
    fixture shape.
- In scope for Phase 3 (active):
  - `src/workflow/agent-behavior.yaml` — `council.depth` gains an operational definition;
    `council.model_tier` is added as a new optional key.
  - `src/workflow/schemas/agent-behavior.schema.yaml`,
    `src/workflow/schemas/repo-profile.schema.yaml`,
    `src/workflow/schemas/artifact-frontmatter.schema.yaml` — the new optional properties, the
    tunable allowlist prose, and the already-false "two exceptions" sentence.
  - `src/workflow/validators/check-lifecycle.mjs` — R4's pre-dispatch rule.
  - `src/workflow/validators/check-council-record.mjs` — tier fields on the record.
  - `src/workflow/skills/think-council/SKILL.md`, `src/workflow/skills/review-council/SKILL.md` and
    both `references/output-schema.md`, plus
    `src/workflow/skills/lifecycle-review/references/output-schema.md` — depth semantics and the
    resolve-before-dispatch step.
  - `bin/agentsmyth.mjs` — R10's wiring and the member-definition placement, plus the pending-setup
    item that R4 gates on.
  - `src/adapters/claude/council-member.md`, `src/adapters/codex/council-member.md`,
    `src/adapters/copilot/council-member.md`, `src/adapters/cursor/council-member.md`,
    `src/adapters/windsurf/council-member.md` — the five per-tool mappings.
  - The four existing council artifacts, amended in the same commit as the required-field change
    (RI1's declared carve-out).
- Out of scope for Phase 2:
  - Anything under `src/workflow/schemas/`, the council skills, `check-council-record.mjs`, or
    `src/adapters/` — Phase 3 (R3, R4, R5, R10, RI8). `check-lifecycle.mjs` is touched in BOTH
    phases and for unrelated reasons: Phase 1 adds RI9's catch at its module-scope definitions load,
    Phase 3 adds R4's pre-dispatch rule. Phase 1 changes nothing Phase 3 depends on.
  - `expandBundle` pruning is now IN scope (Phase 4, R9).
  - The stray tarball, OI-87 wording, delivery-parity copy — Phase 5 (R11, RI10).
  - `npm run build`, `CHANGELOG.md`, `dist/` — Phase 6, which must run last.

## Changed Files

Planned before the first edit; each line gains its "what changed" as work lands.

- `bin/agentsmyth.mjs` — added `globalInstallState()` and `ensureGlobalInstall()`; routed all three
  entry points through them (`init`, `headlessBootstrap`, and `check` via `headlessBootstrap`);
  added `isInsideRepo()` and applied it to the governed-set decision; inlined the version pattern
  into `isVersionString()` to remove a temporal-dead-zone hazard — IDs: R1, R8, RI2
- `src/workflow/validators/lib.mjs` — `readText()` now throws a flagged, self-describing error when
  the missing file is inside the resolved definitions root, instead of propagating raw `ENOENT`
  — IDs: RI9
- `src/workflow/validators/check-lifecycle.mjs` — the module-scope definitions load catches that
  flag and prints the message without a stack trace — IDs: RI9
- `test/run-init-prepare-interop-tests.mjs` — scenarios K, L, M, N and O; 17 new assertions
  — IDs: R1, R8, RI2, RI9
- `test/run-upgrade-path-tests.mjs` — added `syncHome()` and routed all eight `init` sites through
  it; test isolation only, no assertion changed — IDs: R1
- `bin/agentsmyth.mjs` (Phase 2) — `resolveHooksDir()` relocates a generated dispatch directory to
  its durable parent, detected structurally via `generatedHooksParent()`; `installPreCommitHook()`
  writes the gate block first where a generator dispatches into the file;
  `classifyGoverned()` distinguishes `superseded` from `missing`; `UNGOVERNED_STATES` derives the
  two sites that previously compared against the `missing` literal; the false "single caller by
  design" comment is corrected to name all four callers — IDs: R2, R7, RI7, RI12
- `test/run-upgrade-path-tests.mjs` (Phase 2) — husky v9, husky v8 and superseded-manifest
  scenarios; 16 new assertions, six of them real `git commit` runs — IDs: R2, R7, RI7, RI11
- `src/workflow/agent-behavior.yaml` (Phase 3) — `council.depth` gains an operational definition for
  all three values; `council.model_tier` added; the hard-coded tunable-key count corrected — IDs: R3
- `src/workflow/schemas/agent-behavior.schema.yaml` (Phase 3) — `model_tier` as a new optional
  property; `depth`'s description made operational — IDs: R3
- `src/workflow/schemas/repo-profile.schema.yaml` (Phase 3) — `tuning.council.model_tier` as a new
  optional tunable; the allowlist enumeration extended; the already-false "two exceptions" sentence
  rewritten as an enforcement-versus-capacity rule — IDs: R3
- `src/workflow/schemas/artifact-frontmatter.schema.yaml` (Phase 3) — `model_tier` and
  `model_actual` on the council block, both optional — IDs: R3, R5
- `src/workflow/validators/check-lifecycle.mjs` (Phase 3) — the Think-gate rule that refuses while
  the council tier is unanswered and councils can fire; `--dir` honoured so the rule is reachable by
  a fixture — IDs: R4
- `bin/agentsmyth.mjs` (Phase 3) — the blocking `tuning.council.model_tier` pending-setup item, and
  `check-council-record.mjs` wired into `agentsmyth check` — IDs: R4, R10
- `test/fixtures/lifecycle-violations/je-council-tier-unset/config/pending-setup.yaml` (Phase 3) —
  R4's rejection fixture — IDs: R4, RI5
- `test/run-violation-tests.mjs` (Phase 3) — fixture `je` registered, and the attribution sweep now
  passes each fixture's own `args` — IDs: R4, RI5
- `test/mutation-baseline.json` (Phase 3) — `check-lifecycle.mjs` 22 rules to 23 — IDs: RI5
- `src/adapters/claude/council-member.md`, `src/adapters/codex/council-member.md`,
  `src/adapters/cursor/council-member.md`, `src/adapters/copilot/council-member.md`,
  `src/adapters/windsurf/council-member.md` (Phase 3) — five per-tool member definitions, each
  carrying its own tier mapping and an explicit statement of which axes that tool can honour
  — IDs: R5, RI3
- `src/setup/SKILL.md` (Phase 3) — step 5a.3, placing the rendered member definition at the tool's
  native per-repo agent path once the tier is answered — IDs: R5
- `src/workflow/skills/think-council/SKILL.md`,
  `src/workflow/skills/review-council/SKILL.md` (Phase 3) — a Capability Tier section: resolve before
  fan-out, dispatch by naming the definition, record request and outcome separately — IDs: R3, R5
- `test/run-init-prepare-interop-tests.mjs` (Phase 3) — F5 realigned with its own stated intent and
  F5b added, after R4 correctly began gating a freshly bootstrapped repo — IDs: R4

## Implementation Log

Phase 1 opened 2026-10-03. Artifact written before the first file edit, per `lifecycle-build`'s
scope-before-work rule. Plan artifact read from disk this turn (lines 196-229 and 230-349) rather
than recalled, per the same rule's first clause.

**One predicate, three callers (R1, RI2).** `globalInstallState()` classifies the global install as
`current`, `absent`, `unstamped` or `stale`; `ensureGlobalInstall()` installs when absent and refuses
otherwise. The asymmetry is deliberate and is written into the code comment: auto-installing a
missing tree is additive, but auto-refreshing a tree that other repos on the machine are already
linked to would change their resolved skills and schemas as a side effect of a command run in an
unrelated repo. That is what `prepare` and `upgrade` exist to make explicit.

**A TDZ hazard, found by running it (unplanned, fixed here).** The first implementation called the
existing `isVersionString()`, which closed over a module-level `const VERSION_STRING_RE` declared
hundreds of lines later. `check`'s bootstrap path runs earlier than any previous caller, so it threw
`ReferenceError: Cannot access 'VERSION_STRING_RE' before initialization` — a stack trace naming an
internal regex from a call site that looked ordinary. The file's own history records this hazard
twice before and its documented remedy is to make position irrelevant rather than re-order
declarations, so the pattern is now a literal inside the hoisted function. Not in the plan; it is a
precondition for R1 working at all, and it is logged rather than folded in silently.

**RI9 was implemented twice.** The first version had `readText()` print and `process.exit(1)`, on the
reasoning that a broken install has no per-file remedy to report. `npm run violations:test` then
turned fixture `fv` from a rejection into a `[GAP]`: `check-council-record` deliberately catches an
unreadable risk-category list and gates on it rather than dying, and exiting from a shared read took
that ability away. The second version throws an error carrying `isMissingDefinitions`, and the one
entry point that loads definitions at module scope catches it and prints without a stack. Callers
that want to catch still can. The fixture caught a real design error, which is what it is for.

**A rebuild was required mid-phase.** RI9's fix lives in `src/workflow/validators/`, but the
validator that actually runs in a scratch repo is the copy expanded into the global tree from
`dist/workflow-bundle.md`. Before `npm run build`, the fix was present in source and absent from
every path the tests exercise — golden rule 2, observed rather than recalled. `dist/`, `validators/`
and `workflow/schemas/` are gitignored, so this is not a tracked change; Phase 6 still owns asserting
the rebuild under RI4.

**The test harness was contaminated, not wrong (R1 consequence).** `run-upgrade-path-tests.mjs`
shares one scratch `home` across every scenario, and its version-step scenarios stamp a synthetic
version into it. R1's guard correctly detected that and refused the next scenario's `init`. The
contamination pre-dated the guard; nothing had compared before, so nothing had noticed. `syncHome()`
restores the precondition each scenario already assumed, and no assertion was weakened — the
scenarios that care about a version step still take it explicitly.

**Phase 2: RI11 needed no code change, only proof.** The council warned that a gate written with a
plain `writeFileSync` would lack the executable bit and so would run under husky v9 (which only
sources the file) while silently failing under v8 (which invokes it directly). That hazard does not
exist here: all three write branches already go through `atomicWriteFileSync(..., { mode: 0o755 })`.
So RI11 is satisfied by assertion rather than by change — `HK4` and `HV2` pin the bit, and `HV3`
proves a v8 commit actually runs it.

**Phase 2: the ordering half is what makes R2 real, and the revert proves it.** Reverting ONLY the
write order while keeping the relocation leaves `HK1` green and turns `HK6` and `HK7` red: the gate
sits in exactly the right durable file and still never executes, because `husky init` pre-populates
that file and a host command which exits 0 ends the script under `sh -e` before the gate is reached.
Without this half, OI-113's fix would have satisfied its own stated acceptance criterion — the hook
survives a dependency install — while leaving the repository unprotected. That is why every
assertion that matters here is a real `git commit` rather than a file-presence check.

**Phase 2: `run-agents-md-tests.mjs` was planned and not needed.** The advertised-path assertion it
was to carry is better placed beside the husky fixtures, since that is where the path shapes exist;
`HK5` asserts AGENTS.md advertises the path actually written. The existing `A5` assertion in
`agents-md:test` still holds unchanged and that suite passes. Recorded rather than quietly dropped.

**Phase 3: `depth` had no meaning, and now has one.** It shipped as a repo-tunable key recorded in
artifact frontmatter with no operational definition anywhere and no reader — a knob a repo can set,
an artifact reports, and no behaviour consults. The three values now say what they do: `shallow` runs
the research stage only, `standard` adds the challenge stage over the raw findings, `deep` adds a
per-round `web` spot-check quota. `model_tier` is kept strictly separate as the capability axis,
because how many passes run and what members run on are independent questions.

**Phase 3: R4's rule was invisible to the ratchet, twice over.** First implementation reported through
a locally-named `thinkErrors` array. The mutation audit finds rules by the error-push idiom, so the
rule read as defended while nothing depended on it — the exact failure the ratchet exists to catch,
and noticed only because the audit's rule count had not moved after a rule was added. Fixed by
reporting through the shared array. Then the explanatory comment contained the literal token and was
itself counted as a rule, which would also have produced a phantom mutation site with no possible
defence; the comment is now written without it. Rule count moved 22 to 23 and the baseline matches.

**Phase 3: the attribution sweep was measuring a different run than the one it judged.** It re-ran
each fixture with `--dir` alone, dropping the fixture's own `args` — so a fixture whose rule is only
reachable with an extra flag ran in a different mode, emitted nothing, and was reported as failing
attribution. That reads as "this fixture rejects for two reasons" when the truth is "the sweep never
invoked the rule". Fixed to pass `args`; attribution went 107/108 to 108/108, so the fix also
corrected measurements that predate this chain.

**Phase 3: R10 closed a gap that made R5 worth nothing to a consumer.** The council-record contract
had roughly thirty rules and not one executed in a consumer repo — `agentsmyth check` ran
check-setup-complete plus check-lifecycle or check-commit-coverage, and this validator appeared only
in the repo's own template-validation script. Wiring it in is what makes a recorded tier mean
something outside this repository. Scoped off the `--staged` fast path, and verified silent in a
scratch consumer repo with zero council artifacts, since a new commit-gate rule that fires where it
has nothing to say is worse than the gap it closes.

**Phase 3: R5's placement could not live where the plan put it, and R4 is why.** The plan assigned
the member-definition placement to `init`. R4 makes `tuning.council.model_tier` a BLOCKING unanswered
pending item, so by construction the tier is unresolved at the moment `init` runs — placing a
definition then would write an unsubstituted placeholder into a host-native agent file, which is
invalid frontmatter capable of breaking the user's tool, in order to express a value nobody has
chosen. Placement therefore belongs at tier-resolution time, which is the setup agent's, and the
templates already reach it: `init` copies `src/assets/` into `.agentsmyth/`, and the build syncs each
adapter directory's template into the matching assets directory. The plan treated R4 and R5 as
independent; they interact. Recorded as a plan amendment with the reasoning, not absorbed silently.

**Phase 3: the tier is enforced, and that is measured rather than asserted.** A council member was
dispatched with the `cheap` tier's mapped model from a session running a different, more capable
model, and asked to report what it was. It returned `claude-haiku-4-5-20251001` and `fresh context`.
Two things follow. The model override takes effect, so a named member definition makes the tier a
real parameter rather than a prompt-level hope — which is R5's whole acceptance criterion. And
members are fresh-context agents, not forks, which retires the objection that a fork ignores a model
override: true of forks, and never applicable to councils, because the council contract requires
fresh context for exactly the contamination reason that makes forks unsuitable.

**Phase 3: R4 immediately gated a freshly bootstrapped repo, and a test had to be realigned rather
than relaxed.** Headless bootstrap seeds the tier item, so scenario F's follow-up Think gate now
refuses. F5's assertion matched the literal `ok`, but its stated intent is that check-lifecycle
RESOLVED and RAN from the global tree — a different question from whether it passed. Matching the
outcome of a question the scenario was not asking would have reported a resolution failure for a gate
that resolved correctly and then did its job. F5 now matches either summary line and F5b asserts the
gating reason explicitly.

**Phase 3: what the five adapters can actually honour is recorded per adapter, not averaged.** Claude
Code and Codex take both axes as separate keys; Cursor fuses effort into the model identifier, so one
string carries both; Copilot has the model axis in the agent file but keeps per-member effort in
repository settings, so the effort axis is `unavailable` there unless that separate surface is
written; Windsurf/Devin has no effort field at all, so the two axes collapse into one model choice.
The templates deliberately do not hard-code model identifiers for four of the five — those names churn
independently of this package, and a shipped identifier would be the same staleness trap as the
"two exceptions" sentence this phase just removed.

**Two files beyond the plan's Phase 1 Touches.** `check-lifecycle.mjs` and
`run-upgrade-path-tests.mjs`, both necessary consequences of the above. The plan was amended
explicitly rather than the scope being widened silently, and the amendment records why.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R1 | `init` against a global tree with no `installed-version.txt` | exits non-zero, message names `agentsmyth upgrade` as the remedy |
| R1 | `init` against a global tree whose stamp differs from the CLI | exits non-zero with the same remedy |
| R1 | `init` against a global tree whose stamp matches | exits 0, unchanged from today |
| RI2 | the staleness decision reads the stamp, not a digest | absent, unparseable and differing all classify as stale; a matching stamp does not |
| R8 | `init` then `upgrade` inside a linked git worktree | both exit 0; no manifest entry escapes the repository; gate still live through the common dir |
| RI9 | `check` against a hollowed global tree | prints a message naming the missing file and the remedy; no `ENOENT` stack trace |
| R1, R8, RI9 | revert-and-rerun per RI5 | reverting each guard alone turns its own named assertion red |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `node src/workflow/validators/check-lifecycle.mjs --phase build --slug wp-r25-prerelease-hardening` | Build gate at entry | pass | `plan → ready-for-next-phase ✓`, `checkpoint "plan-review" → approved ✓`, exit 0. Run before any edit. |

| `npm run init-prepare-interop:test` | Phase 1 exit gate | pass | 55/55, including the 17 new assertions in scenarios K-O. |
| `npm run upgrade-path:test` | regression + harness | pass | 138 passed, 0 failed, 1 skipped — the pre-existing platform-conditional `H1-eight-governed` (darwin; waiver FQ-80). |
| `npm run validate` | contract check | pass | exit 0, including `check-scope-fence: ok` against the amended Phase 1 Touches. |
| `npm run violations:test` | rejection fixtures | pass | exit 0. Caught the first RI9 implementation as a `[GAP]`; passes after the redesign. |
| `npm run conformance:test` | shipped invariants | pass | exit 0. Caught `shipped-neutrality` — an internal tracker ID in a `src/` comment — now reworded. |
| `npm run setup-checks:test` | regression | pass | exit 0 |
| `npm run agents-md:test` | regression | pass | exit 0 |
| `npm run commit-coverage:test` | regression | pass | exit 0 |
| `npm run root-resolution:test` | regression | pass | exit 0 |
| `npm run tuning-merge:test` | regression | pass | exit 0 |
| `npm run setup-refs:test` | regression | pass | exit 0 |
| `npm run domain-placeholders:test` | regression | pass | exit 0 |
| `npm run checkpoint-approval:test` | regression | pass | exit 0 |
| `npm run setup-validator-definitions-root:test` | regression | pass | exit 0 |
| `npm run build` | generated output | pass | required mid-phase so the shipped validator carried RI9's fix; re-run after each revert-and-rerun cycle. |
| revert R1's refusal alone | RI5 evidence | pass | `K1-refuses` and `L1-refuses` went red; `M1`, `N2`, `O2` stayed green. |
| revert R8's `isInsideRepo` alone | RI5 evidence | pass | `N2-no-escape`, `N3-upgrade`, `N4-not-unparseable` went red; `N1` stayed green (init exited 0 even when broken — the defect was the manifest, not the exit code); `K1`, `L1`, `O2` stayed green. |
| revert RI9's diagnostic alone | RI5 evidence | pass | `O2`, `O3`, `O4` went red; `O1` stayed green, because the raw crash also exits non-zero — the exit code was never the problem, the message was. |
| `npm run upgrade-path:test` (Phase 2) | Phase 2 exit gate | pass | 154 passed, 0 failed, 1 skipped. 16 new assertions across husky v9, husky v8 and superseded-manifest scenarios. |
| revert the husky relocation alone | RI5 evidence | pass | `HK1`, `HK2`, `HK7`, `HK8`, `HK10` went red; `HK6` stayed GREEN — the gate does run before a reinstall, which is why the defect was invisible; `HV1` stayed green, confirming v8 was never affected. |
| revert the gate-first ordering alone | RI5 evidence | pass | `HK2`, `HK6`, `HK7` went red while `HK1` and `HK3` stayed green: right file, host content preserved, gate never executed. The fix-created defect, reproduced. |
| revert the superseded classification alone | RI5 evidence | pass | `HS1`, `HS2` went red; `HK8`, `HK10`, `HS3` stayed green. |
| full suite set re-run after Phase 2 | regression | pass | thirteen suites all exit 0: validate, violations, conformance, init-prepare-interop, setup-checks, agents-md, commit-coverage, root-resolution, tuning-merge, setup-refs, domain-placeholders, checkpoint-approval, setup-validator-definitions-root. |
| `node src/workflow/validators/check-lifecycle.mjs --phase think --dir <fixture>` | R4 | pass | Refuses with the three-way remedy while the tier item is open and councils can fire. |
| `npm run violations:test` (Phase 3) | R4 / RI5 | pass | 224/224 detected with new fixture `je`; attribution sweep 108/108 after the harness fix. |
| `node bin/agentsmyth.mjs check` in this repo | R10 | pass | `check-council-record: ok` — the contract now runs from `agentsmyth check`. |
| `node bin/agentsmyth.mjs check` in a scratch consumer repo with no council artifacts | R10 | pass | `check-council-record: ok` and it contributes nothing to the exit code; the non-zero exit comes from setup placeholders, as expected. |
| dispatched member with the cheap tier's mapped model, model read back from the host | R5 | pass | Returned `MODEL: claude-haiku-4-5-20251001` and `CONTEXT: fresh context`, from a session running a more capable model. The override took effect, so the tier is enforced rather than advisory; and members are fresh-context agents, which is why the fork model-override caveat never applied to councils. |
| `npm run setup-refs:test`, `npm run setup-checks:test` after step 5a.3 | R5 | pass | both exit 0 |
| full suite set re-run at Phase 3 close | regression | pass | fourteen suites all exit 0: validate, violations, conformance, init-prepare-interop (56/56), upgrade-path (154), setup-checks, setup-refs, agents-md, commit-coverage, tuning-merge, checkpoint-approval, domain-placeholders, root-resolution, setup-validator-definitions-root. `check-scope-fence: ok`. |
| suite set re-run after Phase 3 so far | regression | pass | validate, violations, conformance, init-prepare-interop, upgrade-path, setup-checks, agents-md, commit-coverage, tuning-merge, checkpoint-approval all exit 0. |
| `npm run mutation:audit` | validator ratchet | pass | Run to completion in the background rather than under a foreground timeout, which is what defeated the three earlier attempts. **`0/235 rules undefended`, `mutation-audit: ok`** — and specifically `check-lifecycle.mjs 23 rules, 0 undefended, defended`, which confirms both that the hand-updated baseline was correct and that fixture `je` genuinely defends R4's new rule rather than merely existing beside it. This retires the uncertainty carried through Phases 1 to 3; RI5 no longer rests on an assertion. |
| `npm run validate` + eleven suites after the effort decoupling | regression | pass | all exit 0; `check-scope-fence: ok`. |

## Dispatch Log

none — Phase 1 is single-agent implementation work. The council that informed this chain ran in
Think and is recorded in `workflow/artifacts/briefs/wp-r25-prerelease-hardening-v2.md`.

## Architecture Notes

- role: Senior Engineer
- decision: one shared predicate rather than three edited guards. The plan calls for content-aware
  staleness at three entry points that today each test directory existence independently; the repo's
  own history records this duplication class going wrong before, which is why
  `root-resolution:test` exists for four copies of git-root resolution. A single named function
  consulted by all three sites is the only shape where a later edit cannot desynchronise them.
- constraint: zero runtime dependencies, so the stamp read is `node:fs` only. No digest, no hashing —
  per RI2 the signal is the stamp's absence or difference, which covers every consumer-reachable
  case because published v1.0.1 wrote no stamp at all.
- tradeoff: a matching stamp with rebuilt source is not detected. Accepted and recorded in RI2
  rather than engineered away; it is reachable only in development, where `prepare` is a keystroke.
- downstream: Review should check that the predicate has exactly one definition and three callers,
  and that the worktree exclusion does not also exclude the tracked-`.githooks` case that Phase 2
  depends on being governed. Test owes revert-and-rerun evidence per guard.

## Blockers

**Phase 3 is complete.** R3, R4, R5, R10 and RI8 all have evidence; R5's acceptance was measured by a
real dispatch rather than asserted from config.

One open question belongs to the user and is deliberately not answered here: **this repository has
not declared its own `tuning.council.model_tier`.** It runs councils — this chain's own Think phase
dispatched five members — so it should declare one. The item is not hand-written into
`pending-setup.yaml` because `init` and `upgrade` own seeding it, and the value is not chosen here
because choosing a spend level on the user's behalf is the exact thing this requirement exists to
prevent. Until it is declared, this repo's councils resolve to the shipped default. Raise it at Ship.

**Phase 3 remediation, 2026-10-04: effort was folded into the tier and should not have been.** The
five adapter mappings shipped `cheap`→model+low, `standard`→model+medium, `deep`→model+high, which
made effort a passenger on capability. Two defects followed from one mistake. A perfectly ordinary
request — the standard model thinking much harder — could not be expressed at all. And the richest
supported host accepts five effort levels while a three-value tier can only ever address three, so
its top two were unreachable by construction.

Nothing in R3 or R5 authorised that coupling; it was an implementation choice made while writing the
adapters, so this is remediation of a Build error rather than new scope, and it carries no new
manifest ID. `council.effort` is now its own key on a portable five-level scale — `low`, `standard`,
`high`, `very-high`, `max` — with neutral words rather than any one vendor's enum, for the same
reason `model_tier` names a tier and never a model. Each adapter maps the five onto its own host, and
the two adapters whose hosts cannot express a per-member effort record the axis as `unavailable`
instead of letting the tier stand in for it.

The three axes are now distinct and documented as such in both council skills: `depth` is how many
stages run, `model_tier` is what members run on, `effort` is how hard they think within a stage.

**This repo now declares its own tier and effort**, which closes the question the previous Blockers
entry left open: `model_tier: standard` and `effort: very-high`, answered by the user on 2026-10-04.
Chosen on the only evidence this repo has — its own WP-R25 council, five members at the session
default for roughly 653k subagent tokens — rather than on preference.

Carried forward: `mutation:audit` has still not been run end to end (Phase 6 owns it). The
`check-lifecycle.mjs` baseline was hand-updated from 22 rules to 23 and the live count matches, with
fixture `je` defending the new rule — but the undefended figure is asserted from that fixture's
existence rather than measured, and Phase 6's run is what confirms it.

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Phase 3 - Council capability contract | complete | 2026-10-03 | R3, R4, R5, R10, RI8. Exit gate met: the Think gate refuses an unanswered tier and passes once set (fixture `je`); `check-council-record` runs from `agentsmyth check` and stays silent in a repo with no council artifacts; five member definitions present and synced by the build; fourteen suites exit 0. R5's acceptance measured by dispatching a member on the cheap tier's mapped model and reading `claude-haiku-4-5-20251001` back from the host. Two corrections recorded: R4's rule was initially invisible to the mutation ratchet, and R5's placement had to move from `init` to the setup agent because R4 guarantees the tier is unanswered at `init` time. |
| Phase 2 - Hook durability and execution | complete | 2026-10-03 | R2, R7, RI7, RI11, RI12. Exit gate met: `upgrade-path:test` 154 passed with husky v9, husky v8 and superseded scenarios, six of the new assertions being real `git commit` runs. Each of the three guards verified to turn its own assertions red when reverted alone — including the ordering guard, whose revert leaves the gate in the correct file and still not running. RI11 required no code change (all write branches already set mode 0755) and is satisfied by assertion. `run-agents-md-tests.mjs` was planned and proved unnecessary; its coverage landed beside the husky fixtures instead. |
| Phase 1 - Resolution and staleness | complete | 2026-10-03 | R1, R8, RI2, RI9. Exit gate met: `init-prepare-interop:test` 55/55 with scenarios K-O, and each of the three guards verified to turn its own named assertion red when reverted alone. Two unplanned finds fixed and logged: a TDZ hazard that blocked R1 outright, and a shared-home contamination in the upgrade-path suite that R1's guard exposed. RI9 was redesigned after a rejection fixture proved the first approach removed a validator's ability to gate. `mutation:audit` deferred to Phase 6 with direct evidence that no rule count moved. |
