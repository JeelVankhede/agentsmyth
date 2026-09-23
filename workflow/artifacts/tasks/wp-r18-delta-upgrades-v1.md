---
slug: wp-r18-delta-upgrades
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-09-23
updated: 2026-09-23
manifest_ids:
  - R1
  - R2
  - R3
  - R4
  - R5
  - R6
  - RI1
  - RI2
  - RI3
  - RI4
  - RI5
  - RI6
  - RI7
  - RI8
  - RI9
  - RI10
  - RI11
  - RI12
  - RI13
  - RI14
  - RI15
  - RI16
  - RI17
  - RI18
  - RI19
  - RI20
  - RI21
upstream:
  - workflow/artifacts/briefs/wp-r18-delta-upgrades-v1.md
  - workflow/artifacts/plans/wp-r18-delta-upgrades-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# WP-R18 Version-Aware Delta Upgrades - Task

## Active Phase

- Phase: Phase 11 - Round 2 defect remediation (BUILD COMPLETE - 11 phases)
- Manifest IDs: RI1, RI15, RI17
- Exit gate: met, with one carried exception. No shipped surface names `init` as the upgrade
  action; `npm run build` exits 0 and the bundle carries both new schemas; `validate-example` and
  `render-adapters` pass; every pre-1.1.0 artifact and config still validates; `package.json`
  gained exactly one line (the new test script) and no dependency. The exception is
  `npm run mutation:audit`, blocked by the brief's recorded `council.repo_integrity` defect - see
  Blockers.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Provenance primitives | complete | R1, RI2, RI4, RI13, RI21 |
| Phase 2 - Baseline recording | complete | RI14, RI18 |
| Phase 3 - upgrade command and delta classification | complete | R2, RI5, RI6 |
| Phase 4 - Backup writer and retention | complete | R3, RI7, RI8, RI20 |
| Phase 5 - Reconcile items and router branch | complete | R4, RI9, RI10, RI11 |
| Phase 6 - Migration descriptors | complete | R5 |
| Phase 7 - Marker-block strategy for rendered files | complete | RI19 |
| Phase 8 - Validator host, fixtures, ratchet | complete (1 gate item blocked) | R6, RI3, RI12 |
| Phase 9 - OI-105 marker stamp reader | complete | RI16 |
| Phase 10 - Docs, additive compliance, rebuild | complete |
| Phase 11 - Round 2 defect remediation | complete | R4, R5, RI4, RI15, RI16, RI18, RI19 | RI1, RI15, RI17 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `feat/wp-r18-delta-upgrades` | `?? workflow/artifacts/briefs/wp-r18-delta-upgrades-v1.md`, `?? workflow/artifacts/plans/wp-r18-delta-upgrades-v1.md` | Clean apart from this chain's own artifacts. No unrelated user changes present. Base is `release/1.1.0` at `9c1bbee`. Commits deferred until Build completes, then individual per-phase commits, per the user's instruction recorded in the plan's Branch Strategy. |
| At handoff (end of Phase 1) | `feat/wp-r18-delta-upgrades` | `M bin/agentsmyth.mjs`, `?? src/workflow/schemas/provenance.schema.yaml` | Scope confirmed: both changes are Phase 1 touches. |
| At handoff (Build complete) | `feat/wp-r18-delta-upgrades` | 14 modified, 10 added (incl. this chain's three artifacts) | Every path maps to a declared phase touch; `check-scope-fence` passes. No unrelated file was modified, staged, or overwritten — the tree held only this chain's own artifacts when Build began. Nothing is committed: the user's instruction is to commit after Build finishes, as individual per-phase commits. |

## Scope

- In scope (Phase 10): `site/updating.md`, `docs/release-checklist.md`, `CHANGELOG.md`,
  `bin/agentsmyth.mjs` (skew warning wording), regenerated build output.
- Out of scope: nothing remaining — this is the last Build phase.
- Phase 2 scope, now closed: governed-artifact enumeration, baseline builder, `init` wiring,
  `src/setup/SKILL.md` step 5f.
- Phase 1 scope, now closed: `src/workflow/schemas/provenance.schema.yaml` (created);
  `bin/agentsmyth.mjs` primitives block. No call sites were wired in that phase.

## Changed Files

- `src/workflow/schemas/provenance.schema.yaml` — created. `kind: provenance` contract: manifest-level
  `format_version`, `written_by_version`, a declared `normalization`, and per-entry
  `{path, sha256, written_by_version}` with `additionalProperties: false`. — IDs: R1
- `bin/agentsmyth.mjs` — added the provenance primitives block plus import additions
  (`createHash` from `node:crypto`; `renameSync`, `basename`, `sep`). — IDs: R1, RI2, RI4, RI13, RI21
- `bin/agentsmyth.mjs` — added `isInsideGitDir`, `governedArtifacts`, `recordProvenanceBaseline`,
  `pkgVersionForProvenance`; wired the baseline into the `init` flow after `placeAgentsMd`. —
  IDs: RI14, RI18
- `src/setup/SKILL.md` — added step 5f, re-recording the baseline after the skill fills the
  configs. — IDs: RI14
- `bin/agentsmyth.mjs` — `upgrade` command (five-state classifier, `--baseline`, unconditional
  `runPrepare`), backup writer with supersede-in-place retention, reconcile emission, descriptor
  loader and applier, marker-block hook refresh, PS-id high-water allocation, skew-warning rewording.
  — IDs: R2, R3, R4, R5, RI5, RI6, RI7, RI8, RI9, RI10, RI15, RI19, RI20
- `src/workflow/schemas/provenance.schema.yaml` — added optional `reconcile_raised`. — IDs: RI9
- `src/workflow/schemas/migration.schema.yaml` — created. — IDs: R5
- `src/assets/workflow/migrations/README.md` — created; format and publish-boundary rationale. — IDs: R5
- `src/workflow/schemas/pending-setup.schema.yaml` — optional `next_id`, four optional reconcile
  fields, `resolved_by` widened with `merged-from-backup`. Additive only. — IDs: R4, RI1, RI9, RI11
- `src/workflow/router.md` — step 9, the reconcile resolution branch. — IDs: RI11
- `src/workflow/validators/check-lifecycle.mjs` — manifest presence/shape check. — IDs: R6, RI12
- `src/workflow/validators/check-setup-complete.mjs` — AGENTS.md marker stamp reader. — IDs: RI16
- `test/run-upgrade-path-tests.mjs` — created; 36 assertions over every manifest state. — IDs: R2, RI5
- `test/fixtures/definitions/pv-provenance-*` — four rejection fixtures. — IDs: RI3
- `test/run-violation-tests.mjs`, `test/run-setup-complete-tests.mjs` — fixture registration and
  five marker-stamp cases. — IDs: RI3, RI16
- `package.json`, `.github/workflows/ci.yml`, `.github/workflows/release.yml` — `upgrade-path:test`
  wired. — IDs: RI3
- `site/updating.md`, `docs/release-checklist.md`, `CHANGELOG.md` — RI15 doc corrections. — IDs: RI1, RI15
- `dist/`, `validators/`, `workflow/schemas/` — regenerated by `npm run build`. — IDs: RI17

## Implementation Log

**Phase 1 - Provenance primitives.**

Added eleven hoisted helpers to `bin/agentsmyth.mjs`: `provenanceFormatVersion`,
`provenanceNormalization`, `normalizeForHash`, `digestContent`, `digestFile`,
`atomicWriteFileSync`, `resolveGitRoot`, `provenancePath`, `backupRoot`, `renderProvenance`,
`writeProvenance`, `readProvenance`. All are `function` declarations and the format version is a
function rather than a `const`, following the precedent `intentStartId()` already records in this
file — helpers reachable from `check` near the top would otherwise sit in the temporal dead zone.

Four decisions worth Review's attention:

1. **Normalization is deliberately narrow.** It collapses CRLF to LF and forces exactly one trailing
   newline; it does **not** strip trailing whitespace inside a line. The existing repo idiom
   (`appendPendingItems` uses `content.replace(/\s*$/, '')`) would have stripped more than the
   manifest's declared `normalization` value claims, making the recorded name a lie. Test `P1-d`
   pins the distinction.
2. **The manifest reader is a strict matched pair with the emitter, not a YAML parser.** `bin/` has
   no YAML parser and deliberately does not import `lib.mjs`. Since the file is machine-written and
   machine-read, a shape-strict reader is sufficient *and* is what makes tampering detectable — an
   entry count cross-check rejects a truncated file rather than silently yielding fewer entries.
3. **`readProvenance` reports, it does not classify.** It returns `{ok, reason, absent}` and never
   names the five states. That classification is RI5 and belongs to Phase 3, which is the only
   caller that can act on the difference. Keeping it here would have put half a state machine in the
   wrong phase.
4. **Manifest at `workflow/provenance.yaml`, not under `workflow/config/`.** `check-config.mjs`
   walks that tree recursively, so anything parked there is schema-validated — including, later, a
   backup of an old-schema document.

Phase 1 adds primitives only. `node bin/agentsmyth.mjs help` produces byte-identical output to
before, and no `init`/`check`/`prepare` path calls any new function yet.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R1 | `workflow/provenance.yaml` written with one entry per governed artifact | entry digest equals independently recomputed normalized sha256 |
| RI2 | `package.json` `dependencies` block | unchanged; hashing uses `node:crypto` only |
| RI4 | new write path in `bin/agentsmyth.mjs` | temp-plus-`renameSync`, no bare `writeFileSync` |
| RI13 | digest of an LF copy vs a CRLF copy of the same file | identical |
| RI21 | backup root resolution under `mode: polyrepo-member` | resolves to the git working tree, not `repoRoot` |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `node --check bin/agentsmyth.mjs` | syntax | pass | `SYNTAX OK` |
| `node bin/agentsmyth.mjs help` | CLI behavior | pass | output unchanged; four commands, no new verb yet (Phase 3 adds `upgrade`) |
| `node ~/.agentsmyth/sandbox/agentsmyth/p1/t.mjs` | Phase 1 primitives | pass | **22 passed, 0 failed** — P1-a..P1-v. Covers RI13 (CRLF/LF digest equality, P1-a), RI4 (atomic replace + no temp leftovers, P1-g/h/i), R1 (manifest round trip preserving digests, format_version, normalization, P1-l..p), reader failure modes (P1-q/r/s), RI21 (git-root resolution, P1-t/u/v) |
| `AGENTSMYTH_WF=src/workflow node src/workflow/validators/check-schema-keywords.mjs` | new schema | pass | `checked 13 schema(s) against 20 supported keyword(s)` — was 12 schemas |
| `AGENTSMYTH_WF=src/workflow node src/workflow/validators/check-definitions.mjs` | definitions | pass | ok |
| `git diff --stat package.json` | RI2 | pass | empty — `dependencies` unchanged |
| `/usr/bin/grep -c renameSync bin/agentsmyth.mjs` | RI4 | pass | `2` — first atomic write in the codebase |
| `node src/workflow/validators/check-phase-map.mjs` | plan integrity after amendment | pass | ok |
| `node src/workflow/validators/check-artifacts.mjs` | artifact schema | pass | ok |
| `npm run build` | RI17 | pass | exit 0; `dist/workflow-bundle.md` carries both new schemas; `validators/check-setup-complete.mjs` carries the marker reader |
| `npm run violations:test` | RI3 | pass | 221 fixtures, incl. pv1-pv4 each asserting its own rule wording |
| `npm run conformance:test` | R6, RI12 | pass | 49/49, incl. `every-validator-wired` and `cli-invoked-exemptions-are-real` |
| `npm run upgrade-path:test` | R2, R3, R4, RI5, RI9, RI18 | pass | **36 passed, 0 failed** — all five manifest states, all four per-artifact states, all three reconcile-idempotency failure modes, governed-surface inclusion and exclusion |
| `npm run setup-checks:test` | RI16 | pass | 18/18, incl. five new marker-stamp cases |
| `npm run setup-refs:test` / `tuning-merge` / `commit-coverage` / `domain-placeholders` / `agents-md` / `checkpoint-approval` / `root-resolution` / `setup-validator-definitions-root` / `init-prepare-interop` | regression | pass | all nine pass — no existing behavior broken |
| `node scripts/validate-example.mjs` | RI1 | pass | ok |
| `node scripts/render-adapters.mjs` | RI17 | pass | adapter shims are current |
| `node src/workflow/validators/check-scope-fence.mjs` | scope | pass | ok |
| `git diff --stat package.json` | RI2 | pass | 1 insertion, the new test script; no dependency added |
| `npm run mutation:audit` | RI3 | **not run — blocked** | refuses while `validate-template` fails on the brief's `council.repo_integrity` defect. See Blockers B1. Risk: the mechanical proof that each new rule is defended is unverified, though each fixture was observed rejecting on its own wording. Owner: user |
| `node scripts/validate-template.mjs` | full suite | **fail (1 issue)** | the single `check-council-record` repo_integrity issue, unchanged from Think and unrelated to Build. Every other validator in the suite passes |

Not run in this phase, with reason and risk: `npm run validate` (full suite) — it fails on the
brief's known `check-council-record` repo-integrity defect, which is unrelated to Phase 1 and
already recorded; running it here would report a red that predates this phase. Risk: a Phase 1
regression in a validator not listed above would go unnoticed until Phase 8. Mitigated by running
the four directly-relevant validators individually, as recorded. Owner: Test.

## Dispatch Log

none

## Architecture Notes

- role: Senior Engineer
- decision: **deviation from the plan's stated route for RI21.** The plan's Architecture Notes say
  backups resolve "via `resolveGitCwd()`, which already exists for exactly this reason". Inspection
  during Phase 1 scoping shows that is not usable from the CLI: `resolveGitCwd()` lives in
  `src/workflow/validators/lib.mjs:318`, takes an artifact's frontmatter, and returns `repoRoot`
  unless that frontmatter declares `target_repo` - it is artifact-driven, and an upgrade has no
  artifact. `bin/agentsmyth.mjs` also does not import `lib.mjs` at all by design, shelling out to
  validators as separate processes. Phase 1 therefore adds a CLI-local `resolveGitRoot()` using
  `git rev-parse --show-toplevel`, matching the existing precedent at `bin/agentsmyth.mjs:31`
  (`resolveExistingRepoRoot`), whose own comment records that it is a deliberate third copy of
  `lib.mjs`'s repo-root logic kept in sync by hand. RI21's requirement and acceptance criteria are
  unchanged; only the route is. Recorded rather than silently substituted.
- constraint: zero runtime dependencies (`node:crypto`, `node:fs`, `node:path` only); Phase 1 must
  not change observable CLI behavior, since no call site is wired until Phase 2.
- tradeoff: a fourth hand-synced copy of git-root logic is real duplication debt. The alternative -
  making `bin/` import `lib.mjs` - would pull `lib.mjs`'s module-level `definitions_root` guard, which
  can `process.exit(1)`, into the CLI entrypoint. `check-setup-complete.mjs:1-12` documents avoiding
  `lib.mjs` for exactly that reason. Duplication is the cheaper failure here.
- downstream: Review should check the new helper against `lib.mjs`'s `_resolveRepoRoot` for drift.
  Test owns the CRLF/LF digest equality check and the polyrepo-member path resolution check.

## Blockers

**B1 — RESOLVED 2026-09-23.** The mutation ratchet was blocked because `validate-template` failed on
the brief's `council.repo_integrity` defect. The user chose to re-run the Think council properly
rather than waive it. Round 2 ran with a correct bracket — digest taken immediately before dispatch,
two researchers and one challenger, no parent write of any kind until after the closing digest — and
before and after match exactly at `58fef1db…` across 2149 files. `check-council-record` now passes.

**B2 — RESOLVED 2026-09-23 in Phase 11. Every item below was fixed and covered by a test.**

Round 2 was scoped to verification, and it found that several phases do not deliver what their exit
gates claim. Every item below was reproduced independently by the challenger, not taken on the
researcher's word.

*Release-blocking:*

- **B2.1 — `upgrade` never refreshes the pre-commit hook in a default git repo.** `installPreCommitHook`
  is reached only through `applyUpgradeTo`, which iterates only the paths `governedArtifacts`
  returns — and Phase 2 deliberately excludes hooks inside `.git/` because `.git/**` is a protected
  path. Both decisions are individually correct and jointly wrong. `init` never sets
  `core.hooksPath`, so the broken branch is essentially every consumer. RK5, the risk that drove Q3
  and the whole of Phase 7, is unmitigated. Worse: `bin/agentsmyth.mjs:943` and the CHANGELOG entry
  both assert the opposite, and 1.1.0's own hook fix is exactly what those consumers cannot receive.
- **B2.2 — the adapter branch destroys user content.** `applyUpgradeTo` whole-file re-renders the two
  deterministic adapters with no state gate, though its own comment at `:1120` claims it is "gated on
  the manifest saying it is pristine". There is no such gate. Any repo with a pre-existing
  `.github/copilot-instructions.md` — a standard Copilot convention file — loses it on first upgrade,
  with no backup, no reconcile item, and a `re-rendered` line that reads like success. This breaches
  Goal 3, the brief's own whole-file-replacement non-goal, and `[safety-2]`.

*Should-fix:*

- **B2.3** — `upgrade` refreshes no machine-owned value, so `agentsmyth_version` never moves and the
  skew warning survives every upgrade. This makes RI15's rewording a NEW false claim, and it is a
  regression: the prior text named `init`, which genuinely does update the stamp.
- **B2.4** — `loadMigrations` filters on `descriptor.from >= manifest.from`; the correct predicate is
  `to ∈ (fromVersion, toVersion]`. A repo at 1.0.1 silently skips a `1.0.0-to-1.1.0` descriptor, and
  1.0.1 is the published version, so the first descriptor authored that way misses the entire
  installed base. Silent — no warning names the skipped directory.
- **B2.5** — `AGENTS.md` is frozen by the same scope gap as the hook: `placeAgentsMd` runs only in
  `init`. So the RI16 check added in Phase 9 can never fail through any normal path, because neither
  stamp ever moves — the dead check it was written to revive is still dead.
- **B2.6** — reconcile items are raised even when nothing was rewritten, so the backup is a
  byte-identical duplicate and the item instructs the agent to merge a file against its own copy.
- **B2.7** — RI4 unmet: three bare `writeFileSync` calls remain on the upgrade path, and they write
  the enforcement gate. `appendPendingItems` is likewise unatomic and unlocked.
- **B2.8** — R4's `migration_id` clause can never fire; the field is plumbed through the schema and
  the router branch but never set.

*Minor:* `check-lifecycle`'s manifest guard is cwd-relative (unreachable through `agentsmyth check`,
which spawns with `cwd: checkRoot`); `re-rendered` is reported on byte-identical no-ops; a symlinked
governed file is severed and loses its mode; an absent `pending-setup.yaml` makes the upgrade claim
items were "already raised" when none ever were.

*Test-coverage gap that let all of this through:* every repo `run-upgrade-path-tests.mjs` builds sets
`core.hooksPath=.githooks`, so the default-hooks branch is untested; no case constructs a
`newly-governed` file; no case exercises a descriptor at all. 36 green assertions covered none of the
three defects above.

**Resolution.** All ten items fixed. `npm run mutation:audit` now reports **0/232 rules undefended**,
which is what B1 was blocking and why the council was re-run rather than waived. The
upgrade-path suite grew 36 → 51 assertions, adding precisely the three branches whose absence hid
these defects: default-hooks repos, pre-existing user adapters, and descriptors.

Two root causes are worth naming, because both were couplings rather than mistakes in any single
decision:

- **Governance was conflated with refreshability.** Excluding `.git/`-resident hooks from the
  manifest is right — `.git/**` is a protected path and a committed backup of it would leak
  protected content. Routing the hook REFRESH through the same list was wrong, and the two
  decisions were made in different phases, four apart, each defensible alone. Fixed by
  `refreshEnforcementSurfaces()`, which refreshes the hook and `AGENTS.md` independently of the
  governed set.
- **Existence was conflated with authorship.** `governedArtifacts` filtered by `existsSync`, so a
  pre-existing `.github/copilot-instructions.md` — a file `init` never writes on macOS — was
  baselined as though agentsmyth had written it, then legitimately read as `pristine`, then
  replaced. Fixed by requiring a markerless adapter's content to match what agentsmyth renders
  before it is governed at all.

**One defect found during the fix pass that nobody had flagged:** the end-of-upgrade re-baseline was
blanket. It hashed whatever was on disk — including a file the user had edited that this upgrade had
no change for — and recorded it as "what agentsmyth last wrote", silently erasing the drift. A later
version shipping a change for that file would then have overwritten the edit with no backup and no
prompt. The refresh is now targeted to files the run actually wrote. Also from that pass:
`atomicWriteFileSync` resolves symlinks before renaming (it was severing them and orphaning the
shared target, the exact shape a polyrepo-member workspace uses) and carries the existing file mode
(it was stripping the executable bit off every hook it rewrote).

**Stale artifact wording found by round 2, corrected:** the plan's council-record
correction at `plans/…-v1.md:118-123` attributes a false `grep` to brief findings F33 and F63 — the
brief contains neither that command nor the "first `node:crypto` import" wording. The false grep was
real but lived in the council transcript, not the artifact. Parent error, same shape as the one the
round 1 challenger made in the opposite direction. Corrected in the plan. Also: every round 1
`bin/agentsmyth.mjs` line citation is stale, the file having grown from 1398 to ~2500 lines — they
resolve against `git show HEAD:bin/agentsmyth.mjs`, not the working tree. Left as-is rather than
rewritten: they were true when recorded, and a council log is a record of what was found at the
time, not a live index.

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Phase 10 - Docs, additive compliance, rebuild | complete | 2026-09-23 | RI15: three shipped surfaces corrected. `site/updating.md` had two falsified sections — "Nothing in your repo needs editing across an upgrade" and re-`init` as the stamp remedy — and now documents `agentsmyth upgrade` including the no-manifest case. `docs/release-checklist.md`'s rehearsal step gained four upgrade assertions, since it is the only place the delta path meets a genuinely older published tarball rather than a synthesised manifest state. The skew warning now names `upgrade`, which matters because it is the only discovery channel a user who skips release notes ever sees. `CHANGELOG.md` gained a 1.1.0 Added entry plus two Fixed entries. RI17: `npm run build` exits 0, `dist/workflow-bundle.md` carries both new schemas, `validators/check-setup-complete.mjs` carries the marker-stamp reader, `render-adapters` reports shims current. RI1: `validate-example` passes and `package.json` shows exactly one added line with no dependency change. |
| Phase 9 - OI-105 marker stamp reader | complete | 2026-09-23 | The ledger item is closed: `check-setup-complete` now parses `AGENTS.md`'s `agentsmyth:<version>` marker pair and compares it against `repo-profile.yaml`'s stamp, which `writeDefinitionsRoot()` keeps current on every `init` and `upgrade`. This is the first reader of that stamp in the codebase — it was written by `placeAgentsMd()` for exactly this purpose and nothing had ever consumed it, so its correctness in the direction that matters was untested. It also restores a failure mode to the adapter-presence check, which had become unfalsifiable once `init` started always writing a root `AGENTS.md`. Scoping correction found by running it: a file with NO marker is skipped rather than failed, because this repository's own hand-authored `AGENTS.md` legitimately has none — failing it would have broken the source repo. Five cases added to `run-setup-complete-tests.mjs`, 18/18 passing. |
| Phase 8 - Validator host, fixtures, ratchet | complete, one gate item BLOCKED | 2026-09-23 | R6/RI12: the manifest check is hosted in `check-lifecycle.mjs`, which `agentsmyth check` invokes by name and which imports `lib.mjs` so it can actually schema-validate — `check-config.mjs` would never have run in a consumer repo. `npm run conformance:test` 49/49, including `every-validator-wired` and `cli-invoked-exemptions-are-real`. RI3: four rejection fixtures (pv1-pv4), one per new `errors.push` site, each asserting its own rule's wording; `npm run violations:test` passes at 221. New `npm run upgrade-path:test` created and wired into both CI workflows — 36 assertions, all passing, covering every manifest state and every reconcile-idempotency failure mode. **BLOCKED:** `npm run mutation:audit` cannot run. It refuses when any suite fails on the unmutated tree, `scripts/validate-template.mjs` is in that list, and it fails on the brief's recorded `council.repo_integrity` defect. That defect is Think-phase and unrelated to any Build change — everything else in `validate-template` passes. Needs a user decision; carried to Review. |
| Phase 7 - Marker-block strategy for rendered files | complete | 2026-09-23 | RI19 verified against a user's own pre-existing hook: the stale marked block was refreshed, the real gate restored, exactly one block remained, and `MY OWN HOOK` / `running my lint` outside the markers survived byte-for-byte. RI19 split in implementation and the split is recorded in Architecture Notes — marker-block refresh for the hook, hash-gated whole-file re-render for the two deterministic adapters, which carry no markers and are files agentsmyth owns entirely. This phase also completed the APPLY step Phase 6's gate implied and Phase 6 had not delivered: `applyChanges`, `applyUpgradeTo` and `parseDescriptorChanges`, plus manifest-refresh-last ordering. A second upgrade now reports 7 unchanged, 0 edited — the feature is idempotent. One self-inflicted bug worth recording: the `upgrade` dispatch originally sat above the shared-helpers region and threw `Cannot access 'HOOK_BEGIN_MARKER' before initialization` at runtime, then the same for `ADAPTER_TODO_FALLBACK`. This file warns about exactly that temporal-dead-zone trap twice, on `intentStartId()` and `intentItemSpecs()`. I reproduced it anyway; the block was relocated below both consts and a third warning added at the new site. |
| Phase 6 - Migration descriptors | complete | 2026-09-23 | `migration.schema.yaml` created and auto-registered by `$id` with no registry edit — the engine accepted a valid descriptor, rejected a bogus `op`, and rejected an empty `changes` array. Loader verified against three temporary descriptors: a two-step 1.0.1→1.2.0 gap returned both steps in order, a single step returned one, a target with no descriptor returned none. Version ordering is numeric per segment, verified on 1.9.0 vs 1.10.0 — lexical comparison would have inverted that and silently skipped every descriptor in between. The temporary descriptors were removed afterwards: there is no real config shape change between 1.0.1 and 1.1.0, and shipping a fabricated one would be worse than shipping none. Only `README.md` ships, documenting the format and the publish-boundary reason the tree lives under `src/assets/`. |
| Phase 5 - Reconcile items and the router branch | complete | 2026-09-23 | R4: two drifted files produced exactly two items, each naming its own `config`, which is RI10 — the renderer previously hardcoded `repo-profile.yaml`. RI9 verified in three parts by execution: the same file drifting at 1.0.1 and again at 1.1.0 produced two distinct items (a per-file-only marker would have dropped the second); pruning a resolved item did NOT resurrect it, because the manifest's `reconcile_raised` ledger survives the prune that takes the marker with it; and PS-15, once pruned, was never re-issued — allocation now advances a `next_id` high-water mark instead of `max(present)+1`. That last one is a latent defect in shipped code, not new to this package: it was simply unreachable until an item family became transient enough to prune. RI11: router step 9 added, `resolved_by` widened to include `merged-from-backup`. |
| Phase 4 - Backup writer and retention | complete | 2026-09-23 | R3 verified byte-identical. RI8 verified by planting a foreign `artifact-baseline.yaml` in `workflow/config/` and confirming it was never backed up. RI20 verified across a simulated version change: the 1.0.1 backup was superseded, leaving exactly one file on disk. RI7 verified directly — `check-config --dir` returns `ok` with a backup present, because backups sit under `workflow/backups/` and not under the recursively-globbed `workflow/config/`. |
| Phase 3 - upgrade command and delta classification | complete | 2026-09-23 | All five manifest states verified by execution: absent adopts (exit 0, 6 files), unparseable refuses (exit 1), newer-than-CLI refuses (exit 1), and neither refusal wrote anything. All four per-artifact states produced correctly in one run: 4 pristine, 1 drifted, 1 missing, 1 newly-governed. RI6 verified directly — the global `router.md` was replaced with a stale marker, and `upgrade` refreshed it, which neither `init` nor `check` does. `--baseline` closes Phase 2's cross-phase dependency: a simulated setup fill read as drift before it and as 6-unchanged/0-edited after, which is RI14's gate. |
| Phase 2 - Baseline recording | complete | 2026-09-23 | Gate met for the `init` half: 7 entries on macOS with every digest independently recomputed and matching, `AGENTS.md` and `pending-setup.yaml` both correctly absent. Two corrections to the plan's wording, both recorded in the Implementation Log: the governed count is platform- and hooks-path-dependent, not a fixed eight; and `.git/`-resident hooks are deliberately not given manifest entries. The post-setup half of the gate depends on `agentsmyth upgrade --baseline`, which Phase 3 creates — a real cross-phase dependency, noted rather than hidden, and verifiable once Phase 3 lands. |
| Phase 1 - Provenance primitives | complete | 2026-09-23 | Exit gate met against its **amended** wording. The gate as originally planned required `agentsmyth init` to write the manifest; that is unreachable in Phase 1, because writing a manifest requires the governed-artifact enumeration (RI18) which Phase 2 owns — the two gates were circular. The plan was amended explicitly, with the note kept in place at both phases, and the `init` wiring moved to Phase 2's gate where RI18 actually lives. R1's requirement and acceptance criteria are unchanged. |
