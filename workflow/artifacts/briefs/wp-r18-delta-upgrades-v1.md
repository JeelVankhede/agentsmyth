---
slug: wp-r18-delta-upgrades
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-09-22
updated: 2026-09-22
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
  - user-request
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: brief-review
council:
  mode: council
  authorization: explicit
  cap_resolved: 3
  cap_source: configured
  depth: standard
  dispatch_depth: 1
  rounds_run: 2
  termination_reason: user-decision-required
  resolution:
    dispatch_enabled: optional
    council_enabled: on-for-complex
    task_class: complex
  repo_integrity:
    before: 58fef1dbb8ea285ce090931e1e7944c1c30883a7a41d31d146ffcab4c36a7025
    after: 58fef1dbb8ea285ce090931e1e7944c1c30883a7a41d31d146ffcab4c36a7025
    algorithm: sha256/sorted-relpath+size+content
  evidence_classes:
    repo: used
    trial: used
    web: used
    recall: used
skill_trigger_log:
  - skill: repo-alignment-scan
    decision: ran
    reason: "trigger true — task_class != trivial (complex), new_surface true (a new config file and possibly a new CLI command), complexity_score ~70 >= threshold 40"
  - skill: architecture-decision-advisor
    decision: ran
    reason: "trigger true — complexity_score ~70 >= threshold 60, and new_surface true; the decision forced is which command owns the upgrade"
  - skill: constraint-conflict-scan
    decision: ran
    reason: "trigger true — task_class != trivial; all three domain.yaml constraint arrays and repo-profile paths.protected read this session"
---

# WP-R18 Version-Aware Delta Upgrades - Brief

## Source Links

- Notion work package: WP-R18 - Version-Aware Delta Upgrades & Conflict Resolution
  (https://app.notion.com/p/3ab972bdebbb81b7bd4ef20bd97377a3) - approach confirmed 2026-08-09,
  scoped into 1.1.0 by the user 2026-09-17.
- Notion research spike: WP-R18 - Research Spike (version-aware delta upgrades)
  (https://app.notion.com/p/3e2972bdebbb81deb077f79d7aff619c) - written 2026-09-21, this chain's
  direct upstream. The 1.1.0 work plan names this spike as the box gating Build.
- Notion release plan: 1.1.0 - Minor Release Work Plan
  (https://app.notion.com/p/3ab972bdebbb81ef88b7f3cf7e500d79) - "WP-R18 is the only outstanding
  package and the release cannot dispatch until it lands."
- Ledger: `workflow/artifacts/open-items.yaml` OI-105 (filed against WP-R18).

## Problem

agentsmyth scaffolds config files into a consumer repo at `init` and then never meaningfully touches
them again. The five template-scaffolded YAMLs are each guarded by `if (existsSync(dest)) continue;`
(`bin/agentsmyth.mjs:527`), so a second `init` skips every one. The single exception is
`repo-profile.yaml`, which `writeDefinitionsRoot()` rewrites unconditionally at `:731-762` - but only
two machine-owned fields, `agentsmyth_version` and `definitions_root`. No code path in the CLI
overwrites consumer config content.

This was verified rather than reasoned: a second `init` run over a fully set-up repo - configs filled
in, an adapter hand-edited, `AGENTS.md` wrapped in user prose - produced an empty `git status
--porcelain` and an empty `git diff --stat`. `init` is named as the upgrade action by the shipped
skew warning at `:160-163`, and it is structurally incapable of performing one. There is no upgrade
path; there is only a version stamp that moves.

The result is that a consumer's config silently drifts further from the current template with every
release, and nothing can tell a file the user deliberately edited from a file that is simply stale.
Without that distinction there are only two available behaviors, and both are wrong: overwrite
everything (destroying user edits) or overwrite nothing (the status quo, which is why this package
exists).

## Goals

1. Distinguish a pristine scaffolded file from a user-edited one, mechanically, at upgrade time.
2. Bring machine-owned values current without ceremony, at key level rather than by replacing files.
3. Preserve user edits when a file has drifted, with a recovery path the user can actually find.
4. Make what changed between versions expressible, so the CLI knows the shape of a change rather
   than only that something changed.
5. Leave every file on disk schema-valid at every moment, so no validator needs a
   tolerate-mid-upgrade mode.

## Non-Goals

- Three-way merge, or any attempt to combine the user's edits with the new canonical content
  automatically.
- **Whole-file replacement of any scaffolded file.** Ruled out by Q1: three of five templates carry
  unfilled `<PLACEHOLDER>` tokens that `check-setup-complete` counts as errors, and three of five are
  written with environment-dependent inference substitutions, so no version-stable canonical form
  exists to replace them with.
- In-file conflict markers or placeholder syntax. Explicitly rejected on the work-package page:
  agents read these files, and a file carrying marker syntax is either acted on twice or halts the
  agent.
- Upgrading vendored definitions content (skills, router, lifecycle, schemas, validators). That tree
  lives in the global install and is already a straight overwrite via `expandBundle()`.
- Any change to the lifecycle artifact contracts, the seven phases, or the gate.
- Retroactively reconstructing provenance for files edited before the manifest existed. A repo with
  no manifest adopts its current on-disk state as the baseline.

## User Impact

Two audiences, and the second is the one that makes this urgent.

**Existing consumers** (every published version to date - 0.1.0 through 1.0.1) have no manifest. On
first upgrade they must not be told every file drifted. They adopt-on-first-run: current disk state
becomes the baseline, nothing is backed up, nothing is flagged.

**Consumers from 1.1.0 onward** get a real upgrade: pristine files refresh silently, edited files are
preserved and flagged once, and the flag arrives through the pending-item pass their agent already
runs at the start of every session - not as a wall of terminal output they will scroll past.

## Success Metrics

- A consumer with no manifest upgrades and receives zero reconcile items.
- A consumer whose config is untouched upgrades and receives zero reconcile items, with every
  machine-owned value now current and every user-set value unchanged.
- A consumer who edited exactly one config file receives exactly one reconcile item, and the backup
  it names exists at the path it names.
- `npm run validate`, `npm run violations:test`, `npm run conformance:test`, and
  `npm run mutation:audit` all pass, with the mutation baseline still at zero undefended rules.

## Requirements

Written in full in the Requirement Manifest below.

## Constraints

- **Additive only.** The 1.1.0 work plan binds this package: a new machine-managed file plus optional
  fields is a minor bump; a migration descriptor that changes a required field in an existing schema
  escalates the release to 2.0.0. Pre-1.1.0 artifacts and configs must continue to validate unchanged.
- **Zero runtime dependencies.** `CLAUDE.md` rule 4. `node:crypto` and `node:fs` are builtins and are
  in scope; nothing may be added to `dependencies`.
- **Source, not generated output.** Edits land in `src/`; `dist/`, root `validators/`,
  `src/assets/adapters/`, and `workflow/schemas/` are build products (`CLAUDE.md` rule 1), and any
  `src/workflow/`, `src/setup/`, or `src/adapters/` change requires `npm run build` (rule 2).
- **Mutation ratchet at zero.** `test/mutation-baseline.json` records `undefended: 0` for all 30
  validators. Every new validator error needs its own rejection fixture in the same change.
- **[safety-2]** (`domain.yaml`): no destructive action without explicit user approval. An upgrade
  that overwrites consumer config in place is destructive by nature; backup-before-overwrite is the
  mitigation, which is what makes the backup location load-bearing rather than cosmetic.
- **[safety-1] / [safety-4]** (`domain.yaml`): no secrets or sensitive material in artifacts. A
  backup directory is a new place consumer file content gets copied to, so it must honor
  `repo-profile.yaml`'s `paths.protected` globs.
- **Dogfood.** This repo runs its own lifecycle; the chain lives under `workflow/artifacts/`.

## Risks

- **RK1 - the confirmed approach may have no valid target.** The work-package page confirms
  backup-and-replace-with-canonical. A council trial installed the five canonical templates and ran
  `check-setup-complete.mjs`: exit 1, eight unfilled `<PLACEHOLDER>` tokens across three files. Three
  of five are additionally written with environment-dependent inference substitutions at
  `bin/agentsmyth.mjs:529-567`, so no version-stable canonical form exists for them. If this holds,
  the mechanism must be re-framed (Q1) and Goal 2 restated.
- **RK2 - the feature could ship its own failure inverted.** A baseline recorded at `init` hashes
  placeholder templates; the agent then fills every config during setup Phase 3
  (`src/setup/SKILL.md:133-152`), and nothing re-baselines. A 1.1.0-native repo would reach its first
  upgrade with all five configs reading as user-edited. Mitigated by RI14.
- **RK3 - a silent-loss path exists if manifest states are collapsed.** Treating "unparseable" as
  "absent" makes the repo adopt edited files as pristine, and the next upgrade overwrites them with
  no backup. This is the only path in the design that loses user edits without a trace. Mitigated by
  RI5.
- **RK4 - backups accumulate forever under version control.** `workflow/` is committed and
  unconditionally safe to the pre-commit gate (`check-commit-coverage.mjs:17`), so every upgrade adds
  a permanent copy of every drifted config to git history with no owner and no cap. Q4.
- **RK5 - the enforcement gate cannot be upgraded.** `installPreCommitHook` returns early on marker
  presence (`bin/agentsmyth.mjs:1088-1089`), and the source says so deliberately. A delta-upgrade
  feature whose scope excludes the hook ships an enforcement mechanism frozen at first-install
  version. Q3.
- **RK6 - stale definitions root.** Both `runPrepare` call sites are `if (!existsSync(...))`
  (`bin/agentsmyth.mjs:486-487, 1318-1319`), so an exists-but-stale global tree is never refreshed.
  Mitigated by RI6.
- **RK7 - Windows line endings invalidate every hash.** No `.gitattributes` exists anywhere in the
  repo, so nothing declares normalization; a checkout under `core.autocrlf=true` changes every byte.
  Mitigated by RI13.
- **RK8 - polyrepo-member has no committed `workflow/`.** In that mode `workflow/` lives outside every
  git repo, so manifest and backups are not committed, not reviewable, and invisible to
  `check-commit-coverage`. Q5.

## Open Questions

Five, of which three block Plan. Full text with recommendations in **Questions For User**.

## Requirement Manifest

### Explicit (R)

- **R1** - A provenance manifest recording, per scaffolded config file, a digest of the content
  agentsmyth last wrote, plus the version that wrote it and a manifest-level format version.
  *Acceptance:* after `init` in a fresh repo the manifest exists, carries one entry per governed
  file, and each entry's digest matches the file on disk.
- **R2** - Delta classification at upgrade time across the full manifest state machine, not a
  two-way pristine/edited split, applied **per key** rather than per file (Q1).
  *Acceptance:* each of the five states in RI5 produces its specified outcome, each covered by a
  fixture.
- **R3** - User edits are preserved before any overwrite, at a location that is committed,
  recoverable, and outside every recursive validator sweep.
  *Acceptance:* a drifted file is copied to its backup path and the backup's content is
  byte-identical to the pre-upgrade file; `npm run validate` still exits 0 with backups present.
- **R4** - Exactly one reconcile pending item per drifted file per upgrade, naming the backup path
  and the applicable migration descriptor.
  *Acceptance:* a one-file drift produces exactly one item; a two-file drift produces exactly two;
  the same file drifting at a later version produces a further item rather than being silently
  skipped.
- **R5** - Versioned migration descriptors expressing old shape to new shape, in this repo's
  existing machine-readable-contract idiom. Load-bearing after Q1: the descriptors are what carry
  the key-level deltas, so they are no longer an adjunct to the mechanism, they are the mechanism.
  *Acceptance:* a descriptor validates against its own schema with no registry edit, and the
  upgrade path resolves the applicable descriptor for a given version pair.
- **R6** - The manifest's presence and shape are validated by a validator that actually runs in a
  consumer repo.
  *Acceptance:* the hosting validator is invoked by `agentsmyth check` by name, and
  `npm run conformance:test` passes including `every-validator-wired` and
  `cli-invoked-exemptions-are-real`.

### Implicit (RI)

- **RI1** - Additive only. New optional fields and new files; no required-field change to any
  existing schema, and no `additionalProperties: false` added to `pending-setup.schema.yaml`.
  *Acceptance:* every pre-1.1.0 artifact and config in this repo still validates; `npm run validate`
  exits 0.
- **RI2** - No runtime dependency. `node:crypto` and `node:fs` only.
  *Acceptance:* `package.json` `dependencies` is unchanged.
- **RI3** - Every new validator error carries its own rejection fixture in the same change.
  *Acceptance:* `npm run mutation:audit` reports `undefended: 0` for every validator touched, and
  `npm run violations:test` passes with each new fixture asserting its own rule's wording.
- **RI4** - Atomic write. Same-directory temp plus `renameSync` for both the canonical file and the
  manifest. This is the first atomic write in the codebase.
  *Acceptance:* no `writeFileSync` remains on the upgrade path for a governed file; a killed process
  mid-upgrade leaves every file on disk parseable.
- **RI5** - The manifest state machine has five states, never two: **absent** (adopt current disk
  state, no backup, no item); **present and valid** (compare); **present and unparseable** (hard
  stop, named recovery path, never adopt); **format version newer than the CLI** (hard stop, never
  compare); **entry for a file that no longer exists** (degrade to adopt for that entry only).
  *Acceptance:* one fixture per state, each asserting its own outcome.
- **RI6** - The upgrade path runs the global definitions install unconditionally before reading any
  schema, rather than only when the global tree is absent.
  *Acceptance:* an upgrade against an exists-but-stale `~/.agentsmyth/workflow` refreshes it and then
  succeeds.
- **RI7** - Backups live under `workflow/` but never under `workflow/config/` or
  `workflow/artifacts/`, both of which are walked recursively by validators.
  *Acceptance:* with backups present, `check-config`, `check-artifacts`, and `check-lifecycle` all
  pass; a backup of an old-schema config does not produce a schema failure.
- **RI8** - Backups name the governed files explicitly rather than sweeping a directory.
  *Acceptance:* a file in `workflow/config/` that agentsmyth does not own (for example this repo's
  `artifact-baseline.yaml`) is never copied to a backup.
- **RI9** - The reconcile item's idempotency marker encodes file **and** version, and completion is
  recorded somewhere that survives pruning the item.
  *Acceptance:* the same file drifting at two successive versions yields two items; pruning a
  resolved item does not resurrect it; no `PS-N` id is re-issued after its holder is pruned.
- **RI10** - `pendingItemsFrom`'s spec shape gains `config` and the reconcile fields, so an item can
  truthfully name the config it targets.
  *Acceptance:* a reconcile item for `verification.yaml` carries `config: verification.yaml`.
- **RI11** - The router gains a reconcile resolution branch, and `resolved_by` gains a member
  meaning the backup was merged.
  *Acceptance:* `src/workflow/router.md` describes how an agent resolves a reconcile item;
  `check-pending-setup.mjs` accepts the new `resolved_by` value.
- **RI12** - The manifest check is hosted by a validator that is both CLI-invoked and capable of
  schema validation.
  *Acceptance:* the host imports `lib.mjs`, is named in `agentsmyth check`, and is listed in the
  conformance suite's `CLI_INVOKED`.
- **RI13** - Content normalization is declared and applied before hashing, with an explicit
  trailing-newline rule.
  *Acceptance:* the same file checked out under `core.autocrlf=true` and `false` produces the same
  digest.
- **RI14** - A baseline stamping step runs after the agent finishes filling configs, not only at
  `init`.
  *Acceptance:* a repo taken through `init` then the full setup skill has a manifest whose entries
  match the filled configs, and its first upgrade produces zero reconcile items.
- **RI15** - Every shipped surface naming `init` as the upgrade action is corrected.
  *Acceptance:* `site/updating.md:22-24` and `:28`, `docs/release-checklist.md:38-43`, and the skew
  warning at `bin/agentsmyth.mjs:160-163` all describe the real upgrade path.
- **RI16** - OI-105: `check-setup-complete.mjs`'s adapter-presence check reads the
  `agentsmyth:<version>` marker stamp in `AGENTS.md` and matches it against the installed version.
  *Acceptance:* the check can fail again in a repo `init` has touched, with its own rejection
  fixture per RI3.
- **RI18** - Governed surface is the five configs, the pre-commit hook, and the two deterministic
  adapters (`.cursor/rules/agentsmyth.mdc`, non-darwin `.github/copilot-instructions.md`) (Q3).
  `AGENTS.md` is excluded: it carries in-band provenance via its versioned marker, and a second
  mechanism that can disagree with the first is a defect, not coverage.
  *Acceptance (restated after round 2):* every governed artifact that exists on this platform has an
  entry — six in a default repo, seven when `core.hooksPath` puts the hook outside `.git/`, eight
  only on a non-darwin platform that also places the Copilot adapter. "Eight" as a fixed count was
  wrong. `AGENTS.md` has no entry, and neither does a file agentsmyth did not write. A stale
  pre-commit hook and a stale `AGENTS.md` block are both brought current by an upgrade regardless of
  whether they are in the manifest.
- **RI19** - The hook and the two adapters are rendered markdown with no keys to merge, so they use
  marker-block replacement rather than key-level delta - the strategy `placeAgentsMd` already uses.
  *Acceptance:* content outside the marker block survives an upgrade byte-for-byte; content inside is
  replaced.
- **RI20** - Backup retention: at most one backup per governed file, superseded in place on each
  upgrade, deleted when its reconcile item resolves. The agent deletes, consistent with the agent
  owning reconciliation (Q4).
  *Acceptance:* two successive upgrades of the same drifted file leave exactly one backup; resolving
  the reconcile item removes it.
- **RI21** - `polyrepo-member` is handled rather than deferred: backups and manifest resolve relative
  to the git working tree via `resolveGitCwd()`, not to `repoRoot`, so they land inside a real git
  repo in all three repository modes (Q5).
  *Acceptance:* in `mode: polyrepo-member`, a backup is written inside the member repo's working tree
  and is visible to `git status` there.
- **RI17** - Generated output is rebuilt and adapters stay in sync.
  *Acceptance:* `npm run build` run after any `src/workflow/`, `src/setup/`, or `src/adapters/`
  change; `npm run validate` passes including `render-adapters`.

### Assumptions (A)

- **A1** - Slug `wp-r18-delta-upgrades`, version 1. Reversible; no downstream artifact exists yet.
- **A2** - Backups are committed, not gitignored. Follows from the evidence that a gitignored backup
  is unrecoverable after `git clean -xdf` and invisible to review; reversible if Q4 decides
  otherwise.
- **A3** - `sha256`, hex-encoded, from `node:crypto`. Available on the declared engine floor
  (`>=20.0.0`) with no dependency.
- **A4** - `.agentsmyth/` remains exclusively the setup scaffold sentinel. Nothing this package adds
  is written there.

### Open Questions (Q)

All five resolved by the user on 2026-09-23, in a question-by-question walkthrough.

- **Q1** - Mechanism. *Owner:* user. *Blocking:* yes. **RESOLVED: key-level delta.** Whole-file
  replace is now a declared non-goal. Reshapes R2, R5, Goal 2, Success Metric 2.
- **Q2** - Command surface. *Owner:* user. *Blocking:* yes. **RESOLVED: a new `agentsmyth upgrade`
  command.** Confirms the architecture decision recorded below and RI6, RI15.
- **Q3** - Manifest scope. *Owner:* user. *Blocking:* yes. **RESOLVED: all three - five configs, the
  pre-commit hook, and the two deterministic adapters.** Broader than the recommendation, which was
  configs plus hook. `AGENTS.md` stays excluded. Adds RI18 and RI19.
- **Q4** - Backup retention. *Owner:* user. *Blocking:* no. **RESOLVED: most-recent-only, deleted on
  reconcile resolution, agent owns the deletion.** Adds RI20.
- **Q5** - polyrepo-member. *Owner:* user. *Blocking:* no. **RESOLVED: handle it properly via
  `resolveGitCwd()`,** against the recommendation to defer. Adds RI21.

Assumptions A1-A4 were each confirmed by the user in the same walkthrough.

## Questions For User

**Q1 - mechanism. Blocking.** The work-package page records backup-and-replace-with-canonical as
confirmed. The council refuted its precondition: no config is safely whole-file replaceable. Three
of five templates carry hard `<PLACEHOLDER>` tokens that `check-setup-complete` counts as errors
(F70, trial: exit 1, eight tokens), and three of five are written with environment-dependent
inference substitutions (F70, F21 - `bin/agentsmyth.mjs:529-567`), so no version-stable canonical
form exists for them.
*Recommendation:* re-frame to **key-level delta** - add keys the newer schema introduces, update
machine-owned scalars, leave user values alone. `writeDefinitionsRoot()` already does exactly this at
field level (F2), and it is what migration descriptors are for (F45). Whole-file replace becomes
a declared non-goal.
*Evidence:* F70, F21, F2, F45, F64. This changes an approach your page records as confirmed,
so it is yours to make, not mine.

**Q2 - command surface. Blocking.** There is no upgrade command today, and `init` cannot perform an
upgrade: a second `init` over a fully set-up repo produced an empty `git status --porcelain` and an
empty `git diff --stat` (F8, F50, both trials).
*Recommendation:* a new `agentsmyth upgrade`. Note the two reasons that survived challenge are not
the ones first offered: it can call `runPrepare` unconditionally without changing `init`'s contract
for fresh installs (F69), and it avoids the `.agentsmyth/` re-scaffold that makes `agentsmyth check`
exit 1 until an agent deletes it (F6, F9, F49). The surface-vs-semantics cost framing was
challenged as loaded and is withdrawn (F74, F60). The one real cost of a fifth verb is
discoverability, which the skew warning must absorb (RI15).
*Evidence:* F69, F6, F9, F49, F8, F50, F16, F74.

**Q3 - manifest scope. Blocking.** The mandatory pre-commit enforcement gate is frozen at
first-install version forever: `installPreCommitHook` returns early on marker presence, and
`bin/agentsmyth.mjs:934-936` states the contrast with `placeAgentsMd` explicitly. The same applies to
`.cursor/rules/agentsmyth.mdc` and non-darwin `copilot-instructions.md`.
*Recommendation:* govern the five configs **and** the pre-commit hook; leave the deterministic
adapters out with a stated reason. A delta-upgrade feature that cannot upgrade the enforcement gate
is the wrong shape, and the gate is the product's central claim. `AGENTS.md` needs no manifest
entry: it already carries in-band provenance via its versioned marker (F3), and covering it twice
is the trap.
*Evidence:* F73, F3, F1, F64.

**Q4 - backup retention. Non-blocking.** There is zero backup or retention precedent in the repo, and
`workflow/` is committed, so backups accumulate in git history with no owner and no cap (F75).
*Recommendation:* keep only the most recent backup per governed file, and delete it when the
corresponding reconcile item resolves - which makes the agent the deleter, consistent with the agent
owning reconciliation (F43). Plan can proceed on this and revisit.
*Evidence:* F75, F38, F43, F15.

**Q5 - polyrepo-member. Non-blocking.** In `mode: polyrepo-member` the shared `workflow/` lives
outside every git repo, so manifest and backups there are not committed, not reviewable, and
invisible to `check-commit-coverage` (F77). Every "committed and reviewable" argument for
`workflow/` holds only for `single-repository` and `monorepo`.
*Recommendation:* declare polyrepo-member out of scope for backup **durability** in 1.1.0, with the
reason stated in the docs, rather than silently shipping a guarantee that does not hold there. OI-18
already records that no real polyrepo-member use case exists to build against.
*Evidence:* F77, F15, OI-18.

## Council Log

### Requirement Classification

Rows for R1-RI17 were written at stage 2, before dispatch. The four `post-council` rows were
added after the user resolved Q3, Q4 and Q5 on 2026-09-23 - they are requirements that arose
from decisions, not from research, and are labelled so no reader mistakes them for dispatched
buckets.

| Manifest ID | Question bucket | Evidence classes |
|---|---|---|
| R1 | B - manifest format and hashing scope | repo, trial |
| R2 | B - delta classification against manifest state | repo, trial |
| R3 | A and C jointly - backup location and naming | repo, trial |
| R4 | C - reconcile surface | repo, trial |
| R5 | C - migration descriptors | repo, trial |
| R6 | B - validator surface | repo, trial |
| RI1 | parent-held - additive-only compliance | repo, trial |
| RI2 | B - zero-dependency hashing | repo, trial |
| RI3 | B - mutation ratchet cost | repo |
| RI4 | B - atomicity | repo, trial, web |
| RI5 | B - manifest state machine | repo |
| RI6 | A - write point and command surface | repo |
| RI7 | A and C jointly - backup location and naming | repo, trial |
| RI8 | A and C jointly - backup location and naming | repo, trial |
| RI9 | C - reconcile idempotency | trial, repo |
| RI10 | C - reconcile item rendering | trial, repo |
| RI11 | C - router reconcile branch | repo |
| RI12 | B - validator surface | repo |
| RI13 | B - hashing normalization | trial, repo |
| RI14 | parent-held - baseline timing | repo |
| RI15 | A - shipped surfaces naming init | repo |
| RI16 | parent-held - OI-105 marker stamp reader | repo |
| RI17 | parent-held - generated output and adapter sync | repo |
| RI18 | post-council - user decision on Q3, scope | repo |
| RI19 | post-council - follows Q3; rendered-markdown strategy | repo |
| RI20 | post-council - user decision on Q4, retention | repo |
| RI21 | post-council - user decision on Q5, polyrepo mode | repo |

Evidence-class availability at run time: `repo` **used**, `trial` **used**, `web` **used**,
`recall` **used** (raised one hypothesis, F31; corroborated in part by F72, never sole support).

### Members

| Member | Role | Round | Capabilities | Sandbox |
|---|---|---|---|---|
| M1-A | researcher | 1 | read-only repo; command execution; sandbox writes | ~/.agentsmyth/sandbox/agentsmyth/bucketA |
| M2-B | researcher | 1 | read-only repo; command execution; web fetch; sandbox writes | ~/.agentsmyth/sandbox/agentsmyth/bucketB |
| M3-C | researcher | 1 | read-only repo; command execution; sandbox writes | ~/.agentsmyth/sandbox/agentsmyth/mc |
| M4-X | challenger (sourcing) | 1 | read-only repo; command execution; web fetch; sandbox writes | ~/.agentsmyth/sandbox/agentsmyth/m4x |
| M5-Y | challenger (reasoning) | 1 | read-only repo; command execution; sandbox writes | ~/.agentsmyth/sandbox/agentsmyth/m5y |
| M6-V1 | researcher | 2 | read-only repo; command execution; sandbox writes | ~/.agentsmyth/sandbox/agentsmyth/r2v1 |
| M7-V2 | researcher | 2 | read-only repo; command execution; sandbox writes | ~/.agentsmyth/sandbox/agentsmyth/r2v2 |
| M8-C2 | challenger | 2 | read-only repo; command execution; sandbox writes | ~/.agentsmyth/sandbox/agentsmyth/r2c |

### Rounds

| Round | Researchers | Challengers | Open in | Open out | Items closed | Sizing rationale |
|---|---|---|---|---|---|---|
| 1 | 3 | 2 | 8 | 5 | I1, I2, I3, I4, I5, I6, I7, I13 | Cap 3 per stage, from `council.per_phase.think.default_fan_out`. Challengers split by lane (sourcing, reasoning) rather than duplicated, because the round carried both citation-heavy and inference-heavy claims. |
| 2 | 2 | 1 | 2 | 0 | V1, V2 | Tapered from 3+2 to 2+1: round 1 closed eight items, so the taper is corroborated rather than asserted. Run AFTER Build completed, at the user's direction, to replace round 1's broken integrity bracket with a correct one. Scope is verification, not new research — V1 re-checks round 1's repo-shaped claims against the changed tree, V2 checks whether the shipped implementation satisfies what the brief and plan promised. |

Round 2 items: V1 are round 1's repo-shaped claims still accurate against the post-Build tree ·
V2 does the shipped implementation satisfy the brief and plan. Both closed.

Round 1 items: I1 write point · I2 atomicity · I3 upgrade-path test matrix · I4 reconcile surface ·
I5 descriptor format · I6 backup location · I7 manifest format, location, validator host ·
I8 command surface · I9 core mechanism viability (**opened** by F70) · I10 manifest scope
(**opened** by F73) · I11 backup retention (**opened** by F75) · I12 polyrepo-member
(**opened** by F77) · I13 baseline timing (**opened** by F71, closed in-round as RI14).

No second round was run. The five survivors are authority questions, not evidence questions - each
asks what the user wants, not what the repo does - so another round could not close them. Per the
round loop, survivors escalate rather than expiring.

### Findings

Citations abbreviated; `bin` = `bin/agentsmyth.mjs`, `cfg` = `src/workflow/validators/check-config.mjs`.

| Finding | Member | Role | Round | Surface | Evidence class | Citation | Disposition | Reason / merged into |
|---|---|---|---|---|---|---|---|---|
| F1 | M1-A | researcher | 1 | CLI write classification | repo | bin/agentsmyth.mjs:334-389 | accepted | Verified by F65 |
| F2 | M1-A | researcher | 1 | writeDefinitionsRoot | repo | bin/agentsmyth.mjs:732-763 | accepted | Field-level rewrite is the precedent Q1's recommendation rests on |
| F3 | M1-A | researcher | 1 | placeAgentsMd marker | repo | bin/agentsmyth.mjs:993-1044 | accepted | Grounds Q3's AGENTS.md carve-out |
| F4 | M1-A | researcher | 1 | init guard ordering | repo | bin/agentsmyth.mjs:1304-1310 | accepted | Strengthened by F48 |
| F5 | M1-A | researcher | 1 | .gitignore coverage | trial | ~/.agentsmyth/sandbox/agentsmyth/bucketA; `git check-ignore -v .agentsmyth/backups/1.0.0/workflow/config/domain.yaml` -> output `.gitignore:1:.agentsmyth` | accepted | Reproduced by F65 |
| F6 | M1-A | researcher | 1 | check-setup-complete | repo | src/workflow/validators/check-setup-complete.mjs:214-215 | accepted | Confirmed by execution, F49; range corrected from 212-216 |
| F7 | M1-A | researcher | 1 | .agentsmyth/backups viability | trial | ~/.agentsmyth/sandbox/agentsmyth/bucketA; `node bin/agentsmyth.mjs init` -> output `Error: .agentsmyth/ already exists in this directory.`, EXIT=1 | accepted | Reproduced by F48, which also found the refusal precedes prepare |
| F8 | M1-A | researcher | 1 | re-init on a set-up repo | trial | ~/.agentsmyth/sandbox/agentsmyth/bucketA; `git status --porcelain && git diff --stat` -> output empty, EXIT=0 | accepted | Narrowed by F50: "safe" hides the .agentsmyth/ re-scaffold |
| F9 | M1-A | researcher | 1 | init-as-upgrade cost | trial | ~/.agentsmyth/sandbox/agentsmyth/bucketA; `node bin/agentsmyth.mjs check` -> output issue count 3 then 4 | accepted | Partial-outage claim reproduced by F49 |
| F10 | M1-A | researcher | 1 | skew warning text | repo | bin/agentsmyth.mjs:160-163 | accepted | Weight reduced by F74: the new CLI prints its own text |
| F11 | M1-A | researcher | 1 | release rehearsal | repo | docs/release-checklist.md:38-43 | accepted | Feeds RI15 |
| F12 | M1-A | researcher | 1 | site/updating.md | repo | site/updating.md:22-24 | accepted | Extended by F62: a second section at line 28 |
| F13 | M1-A | researcher | 1 | runPrepare scope | repo | bin/agentsmyth.mjs:1102-1250 | accepted | Confirms H-A3 |
| F14 | M1-A | researcher | 1 | manifest placement vs check-config | repo | src/workflow/validators/check-config.mjs:45-58 | merged | Into F66 - cancels against F23 |
| F15 | M1-A | researcher | 1 | commit-gate safety of workflow/ | repo | src/workflow/validators/check-commit-coverage.mjs:17 | accepted | Scoped by F68 and F77 |
| F16 | M1-A | researcher | 1 | cost of a fifth command | repo | bin/agentsmyth.mjs:51-60 | accepted | Corrected by F65: 12 test scripts, not 13 |
| F17 | M1-A | researcher | 1 | cost of extending init | repo | `README.md`:162-164 | merged | Into F74 - framing withdrawn, conclusion survives on other grounds |
| F18 | M1-A | researcher | 1 | init/upgrade shared seam | repo | bin/agentsmyth.mjs:482-687 | accepted | The write point, independent of Q2 |
| F19 | M2-B | researcher | 1 | config dir census | repo | src/assets/workflow/config | accepted | Refutes H-B1; upheld by F61 after a hard search for a creator |
| F20 | M2-B | researcher | 1 | pending-setup.yaml exclusion | repo | bin/agentsmyth.mjs:166-183 | accepted | Grounds RI8 |
| F21 | M2-B | researcher | 1 | repo-profile written twice | repo | bin/agentsmyth.mjs:731-762 | accepted | Mechanism independently verified; see Conflicts for the framing dispute |
| F22 | M2-B | researcher | 1 | .json invisible to check-config | trial | ~/.agentsmyth/sandbox/agentsmyth/bucketB; `node src/workflow/validators/check-config.mjs --dir <probe>` -> output `check-config: ok`, EXIT=0, JSON unmentioned | accepted | Reproduced by F51 |
| F23 | M2-B | researcher | 1 | .yaml costs zero new rules | trial | ~/.agentsmyth/sandbox/agentsmyth/bucketB; `node src/workflow/validators/check-config.mjs --dir <probe>` -> output `provenance.yaml has no matching schema`, EXIT=1 | merged | Into F66; narrowed by F52 - "free" is conditional on the schema shipping and prepare having run |
| F24 | M2-B | researcher | 1 | check-config never runs in a consumer | repo | bin/agentsmyth.mjs:204-228 | accepted | Load-bearing. Strengthened by F57; remedy corrected by F67 |
| F25 | M2-B | researcher | 1 | mutation ratchet cost | repo | test/mutation-baseline.json:16-19 | accepted | Re-derived exactly by F63 |
| F26 | M2-B | researcher | 1 | every-validator-wired | repo | test/run-conformance-tests.mjs:391-423 | accepted | Grounds RI12 |
| F27 | M2-B | researcher | 1 | no atomic write precedent | repo | bin/agentsmyth.mjs:1-1398 | accepted | Re-derived by F63: 20 writeFileSync, zero renameSync |
| F28 | M2-B | researcher | 1 | POSIX rename atomicity | web | https://man7.org/linux/man-pages/man2/rename.2.html retrieved 2026-09-22, "If newpath already exists, it will be atomically replaced, so that there is no point at which another process attempting to access newpath will find it missing." | accepted | Spot-checked verbatim by F55 - quote exact, word and punctuation |
| F29 | M2-B | researcher | 1 | rename is not durability | web | https://man7.org/linux/man-pages/man2/fsync.2.html retrieved 2026-09-22, "Calling fsync() does not necessarily ensure that the entry in the directory containing the file has also reached disk." | accepted | Spot-checked verbatim by F56; trailing Windows sentence split out as F30 |
| F30 | M2-B | researcher | 1 | Windows directory fds | recall | none (rode inside F29) | rejected-with-reason | Uncited recall presented inside a web finding. recall may not solely support a claim, and the man7 citation does not cover it (F56) |
| F31 | M2-B | researcher | 1 | write ordering mechanism | recall | none | merged | Into F72. recall may raise but not resolve; F72 corroborated the writing-version half and could not corroborate the other |
| F32 | M2-B | researcher | 1 | corrupt manifest is the loss path | repo | workflow/artifacts/briefs/wp-r18-delta-upgrades-v1.md | accepted | Extended by F78 to a fifth state |
| F33 | M2-B | researcher | 1 | hash algorithm and normalization | trial | ~/.agentsmyth/sandbox/agentsmyth/bucketB; `node -e "require('crypto').getHashes()"` -> output `blake2b512,sha256,sha256WithRSAEncryption` | accepted | Grounds A3 and RI13; re-derived by F63 |
| F34 | M3-C | researcher | 1 | pending-setup item shape | repo | src/workflow/schemas/pending-setup.schema.yaml:19-49 | accepted | Grounds RI1's no-additionalProperties clause |
| F35 | M3-C | researcher | 1 | additive compliance | trial | ~/.agentsmyth/sandbox/agentsmyth/mc/fx2; `node src/workflow/validators/check-pending-setup.mjs --dir <fx2>` -> output `1 open, 0 resolved, 0 waived`, EXIT=0 | accepted | Proves the extension is 1.1.0-safe |
| F36 | M3-C | researcher | 1 | family marker drops second file | trial | ~/.agentsmyth/sandbox/agentsmyth/mc; `node trial.mjs` -> output `S1 upgrade A: 1` / `S1 upgrade B: 0` | accepted | Reproduced by F54 |
| F37 | M3-C | researcher | 1 | per-file marker drops second upgrade | trial | ~/.agentsmyth/sandbox/agentsmyth/mc; `node trial.mjs` -> output `S3 v1.1.0: 1` / `S3 v1.2.0: 0` | accepted | Reproduced by F54. Grounds RI9 |
| F38 | M3-C | researcher | 1 | pruning resurrects and re-issues ids | trial | ~/.agentsmyth/sandbox/agentsmyth/mc; `node trial.mjs` -> output `S4 re-append returns: 1` / `S4 ids now: PS-1,PS-2` | accepted | Reproduced and strengthened by F53, which reached a real historical collision |
| F39 | M3-C | researcher | 1 | pendingItemsFrom hardcodes config | trial | ~/.agentsmyth/sandbox/agentsmyth/mc; `node trial.mjs` -> output `config: repo-profile.yaml` paired with a verification.yaml field | accepted | Grounds RI10 |
| F40 | M3-C | researcher | 1 | upgrade hook in the wrong place | repo | bin/agentsmyth.mjs:147-186 | merged | Into F59. Call-site claim accepted; closing sentence refuted - see Conflicts |
| F41 | M3-C | researcher | 1 | destructive-write policy | repo | src/workflow/agent-behavior.yaml:114-119 | accepted | Narrowed by F76: the live tension is safety-2, not safety-1/safety-4 |
| F42 | M3-C | researcher | 1 | TTY prompt cost | repo | test/run-init-prepare-interop-tests.mjs:9-16 | accepted | Quoted scope note verified verbatim by F65 |
| F43 | M3-C | researcher | 1 | agent prompts, CLI records | repo | src/workflow/router.md:5-38 | accepted | Settled by WP-R8 precedent |
| F44 | M3-C | researcher | 1 | router needs a reconcile branch | repo | src/workflow/router.md:14-26 | accepted | Grounds RI11 |
| F45 | M3-C | researcher | 1 | descriptor format idiom | repo | src/workflow/validators/lib.mjs:884-893 | accepted | Grounds R5 |
| F46 | M3-C | researcher | 1 | publish boundary for descriptors | repo | `package.json`:9-14 | accepted | Placement follows the reader |
| F47 | M3-C | researcher | 1 | two-channel notification | repo | bin/agentsmyth.mjs:174-176 | accepted | Settled precedent |
| F48 | M4-X | challenger | 1 | F7 reproduction | trial | ~/.agentsmyth/sandbox/agentsmyth/m4x; `node bin/agentsmyth.mjs init` -> output `Error: .agentsmyth/ already exists`, EXIT=1 | accepted | Upheld and strengthened |
| F49 | M4-X | challenger | 1 | F6 reproduction | trial | ~/.agentsmyth/sandbox/agentsmyth/m4x; `node src/workflow/validators/check-setup-complete.mjs` -> output EXIT=0 then EXIT=1 isolated | accepted | Upheld; exit code traced through bin/agentsmyth.mjs:229 |
| F50 | M4-X | challenger | 1 | F8 overclaim | trial | ~/.agentsmyth/sandbox/agentsmyth/m4x; `git status --porcelain` -> output empty, but scenario E `node bin/agentsmyth.mjs check` -> EXIT=1 | accepted | F8 narrowed accordingly |
| F51 | M4-X | challenger | 1 | F22/F23 reproduction | trial | ~/.agentsmyth/sandbox/agentsmyth/m4x/b45b; `node src/workflow/validators/check-config.mjs --dir <probe>` -> output EXIT=0 for .json, EXIT=1 for .yaml | accepted | Both reproduced exactly |
| F52 | M4-X | challenger | 1 | F23 overclaim | trial | ~/.agentsmyth/sandbox/agentsmyth/m4x/b45b; `node src/workflow/validators/check-config.mjs --dir <probe>` -> output EXIT=1 today | accepted | Free validation is conditional; read with F14 |
| F53 | M4-X | challenger | 1 | F38 reproduction | trial | ~/.agentsmyth/sandbox/agentsmyth/m4x/c5; `node trial.mjs` -> output `collides with historical PS-2: true` | accepted | Strengthened: ids are re-issued, not renumbered |
| F54 | M4-X | challenger | 1 | F36/F37/F39 reproduction | trial | ~/.agentsmyth/sandbox/agentsmyth/m4x/c5; `node trial.mjs` -> output matches all three stated results | accepted | Silent-drop path confirmed at bin/agentsmyth.mjs:337 |
| F55 | M4-X | challenger | 1 | web spot-check, rename(2) | web | https://man7.org/linux/man-pages/man2/rename.2.html fetched 2026-09-22 HTTP 200, "If newpath already exists, it will be atomically replaced, so that there is no point at which another process attempting to access newpath will find it missing." | accepted | Quote verbatim. Satisfies the round's mandatory web spot-check |
| F56 | M4-X | challenger | 1 | web spot-check, fsync(2) | web | https://man7.org/linux/man-pages/man2/fsync.2.html fetched 2026-09-22 HTTP 200, "Calling fsync() does not necessarily ensure that the entry in the directory containing the file has also reached disk." | accepted | Quote verbatim; sampled both rather than one. Isolated F30 |
| F57 | M4-X | challenger | 1 | F24 correction | repo | `README.md`:212-217 | accepted | F24's conclusion strengthened: the documented manual fallback is itself broken in a linked repo |
| F58 | M4-X | challenger | 1 | F21 framing | repo | workflow/artifacts/briefs/wp-r18-delta-upgrades-v1.md | rejected-with-reason | Artifact of the parent editing the cited artifact between stages - see Conflicts |
| F59 | M4-X | challenger | 1 | F40 closing sentence | trial | ~/.agentsmyth/sandbox/agentsmyth/m4x; `git status --porcelain` -> output `M workflow/config/repo-profile.yaml` | accepted | Refutes F40's zero-code-paths claim |
| F60 | M4-X | challenger | 1 | F17 point 3 | repo | `README.md`:162-164 | accepted | Idempotence promise is hook-scoped only |
| F61 | M4-X | challenger | 1 | F19 creator search | repo | scripts/validate-template.mjs:35 | accepted | No creator exists; six-file census confirmed by execution |
| F62 | M4-X | challenger | 1 | second falsified doc section | repo | site/updating.md:28 | accepted | Added to RI15 |
| F63 | M4-X | challenger | 1 | mechanical counts | repo | test/mutation-baseline.json:16-19 | accepted | Every count re-derives |
| F64 | M4-X | challenger | 1 | citation sweep | repo | src/workflow/validators/check-commit-coverage.mjs:17 | accepted | 14 findings re-checked; all resolve, three cosmetic line drifts noted |
| F65 | M4-X | challenger | 1 | F16 count | repo | `package.json` | accepted | 12 test scripts, not 13 |
| F66 | M5-Y | challenger | 1 | F23/F14/F24 collision | repo | bin/agentsmyth.mjs:191-229 | accepted | Resolves by cancellation - a dormant validator delivers neither benefit nor harm |
| F67 | M5-Y | challenger | 1 | F24 remedy unaffordable | repo | src/workflow/validators/check-setup-complete.mjs:1-12 | accepted | Host must be check-lifecycle.mjs. Grounds RI12 |
| F68 | M5-Y | challenger | 1 | check-config globs recursively | trial | ~/.agentsmyth/sandbox/agentsmyth/m5y/probe; `node src/workflow/validators/check-config.mjs --dir <probe>` -> output `backups/1.0.0/domain.yaml has no matching schema`, EXIT=1 | accepted | Grounds RI7 |
| F69 | M5-Y | challenger | 1 | prepare never refreshes a stale tree | repo | bin/agentsmyth.mjs:1318-1319 | accepted | Grounds RI6 and the surviving half of Q2 |
| F70 | M5-Y | challenger | 1 | templates are not installable | trial | ~/.agentsmyth/sandbox/agentsmyth/m5y/setupprobe; `node src/workflow/validators/check-setup-complete.mjs` -> output `failed with 3 issue(s)`, 8 placeholders, EXIT=1 | accepted | The round's headline. Opens I9, drives Q1 |
| F71 | M5-Y | challenger | 1 | baseline recorded before setup fills | repo | src/setup/SKILL.md:133-152 | accepted | Opens I13, closed in-round as RI14 |
| F72 | M5-Y | challenger | 1 | F31 partial corroboration | repo | bin/agentsmyth.mjs:924-951 | accepted | Half corroborated, half explicitly uncorroborated and deferred to Plan |
| F73 | M5-Y | challenger | 1 | pre-commit gate frozen forever | repo | bin/agentsmyth.mjs:1088-1089 | accepted | Opens I10, drives Q3 |
| F74 | M5-Y | challenger | 1 | F17 framing loaded | repo | bin/agentsmyth.mjs:139-186 | accepted | Conclusion survives on F69 and F6; framing withdrawn |
| F75 | M5-Y | challenger | 1 | no retention rule or owner | repo | src/workflow/validators/check-commit-coverage.mjs:17 | accepted | Opens I11, drives Q4 |
| F76 | M5-Y | challenger | 1 | safety constraint scoping | repo | workflow/config/domain.yaml:16-21 | accepted | Narrows F41 and corrects the parent's earlier safety-1/safety-4 reading |
| F77 | M5-Y | challenger | 1 | polyrepo-member has no committed workflow/ | repo | src/workflow/validators/check-setup-complete.mjs:15-33 | accepted | Opens I12, drives Q5 |
| F78 | M5-Y | challenger | 1 | fifth manifest state | repo | workflow/artifacts/briefs/wp-r18-delta-upgrades-v1.md | accepted | Newer-than-CLI manifest. Grounds RI5 |
| F79 | M6-V1 | researcher | 2 | F24 still accurate | repo | bin/agentsmyth.mjs:195 | accepted | Still true — check still hardcodes its validator list and `upgrade` adds none |
| F80 | M6-V1 | researcher | 2 | F24 count wrong | trial | `git show HEAD:bin/agentsmyth.mjs` scanned for validator filenames -> output 192, 196, 204 | accepted | Three filenames were hardcoded, not two; conclusion unaffected, wording corrected |
| F81 | M6-V1 | researcher | 2 | F27 closed by Build | repo | bin/agentsmyth.mjs:859-870 | accepted | atomicWriteFileSync is the codebase's first temp+rename. Residual: hook writes still bare — see F101 |
| F82 | M6-V1 | researcher | 2 | F33 was never true | repo | src/workflow/validators/repo-digest.mjs:22 | accepted | createHash imported all along; NUL bytes make grep skip the file, exactly as the plan diagnosed |
| F83 | M6-V1 | researcher | 2 | the plan's correction is misaimed | repo | workflow/artifacts/plans/wp-r18-delta-upgrades-v1.md:118-123 | accepted | The brief contains neither the grep nor the 'first import' wording — the false grep lived in the transcript, not the artifact. Parent error; plan corrected |
| F84 | M6-V1 | researcher | 2 | F73 closed by Build | repo | bin/agentsmyth.mjs:1694-1721 | accepted | Early return removed; only the marked span is rewritten |
| F85 | M6-V1 | researcher | 2 | F69 closed by Build | repo | bin/agentsmyth.mjs:1975-1977 | accepted | upgrade calls runPrepare unconditionally and first; the two guarded call sites are deliberately preserved |
| F86 | M6-V1 | researcher | 2 | F70 still true | trial | `grep -aoch '<PLACEHOLDER>' src/assets/workflow/config/*.yaml` -> output 2, 0, 4, 2, 0 (8 total) | accepted | Build designed around it rather than contradicting it |
| F87 | M6-V1 | researcher | 2 | F19 still true | repo | bin/agentsmyth.mjs:557 | accepted | Consumer config dir still six files; the manifest was deliberately placed outside it |
| F88 | M6-V1 | researcher | 2 | F38 closed by Build | trial | ~/.agentsmyth/sandbox/agentsmyth/r2v1/alloc.mjs; `node alloc.mjs` -> output old 2 / new 10 | accepted | next_id high-water mark replaces max(present)+1. Residual: one allocation window per legacy file |
| F89 | M6-V1 | researcher | 2 | brief line citations now stale | repo | workflow/artifacts/briefs/wp-r18-delta-upgrades-v1.md | accepted | bin grew 1398 -> ~2400 lines; round 1 citations resolve against git show HEAD, not the working tree |
| F90 | M7-V2 | researcher | 2 | Success Metric 1 holds | trial | ~/.agentsmyth/sandbox/agentsmyth/r2v2/repoB; `node bin/agentsmyth.mjs upgrade` -> output adopted the current state of 7 governed file(s) | accepted | Adopt-on-first-run works and never uses drift language |
| F91 | M7-V2 | researcher | 2 | Success Metric 2 fails | trial | ~/.agentsmyth/sandbox/agentsmyth/r2v2/repoB; `grep agentsmyth_version workflow/config/repo-profile.yaml` -> output agentsmyth_version: 0.9.0 | accepted | No machine-owned value is ever refreshed — upgrade never calls writeDefinitionsRoot |
| F92 | M7-V2 | researcher | 2 | reconcile item raised on a no-op | trial | ~/.agentsmyth/sandbox/agentsmyth/r2v2/repoA; `diff` backup vs live -> output Files are identical | accepted | An item is raised even when nothing was rewritten, so the backup is a byte-identical duplicate |
| F93 | M7-V2 | researcher | 2 | upgrade-path suite passes | trial | `npm run upgrade-path:test` -> output 36 passed, 0 failed | accepted | Suite green, but see F120 for what it does not cover |
| F94 | M7-V2 | researcher | 2 | adapter branch has no state gate | trial | ~/.agentsmyth/sandbox/agentsmyth/r2v2/repoA; `node bin/agentsmyth.mjs upgrade` -> output re-rendered .github/copilot-instructions.md | accepted | Release-blocking. Confirmed and worsened by F115 |
| F95 | M7-V2 | researcher | 2 | non-goals honoured | repo | bin/agentsmyth.mjs:1090-1113 | accepted | No automated merge, no marker syntax |
| F96 | M7-V2 | researcher | 2 | RI4 unmet — hook writes bare | repo | bin/agentsmyth.mjs:1690 | accepted | Three bare writeFileSync remain, and they write the enforcement gate |
| F97 | M7-V2 | researcher | 2 | pending-setup written non-atomically | repo | bin/agentsmyth.mjs:413 | accepted | Outside RI4's literal wording but the same class of risk |
| F98 | M7-V2 | researcher | 2 | RI8 and RI7 satisfied | trial | ~/.agentsmyth/sandbox/agentsmyth/r2v2/my répo dir; `find workflow/backups -type f` -> output only 1.0.1/workflow/config/domain.yaml | accepted | No sweep on either enumerate or supersede side |
| F99 | M7-V2 | researcher | 2 | manifest-last ordering holds | repo | bin/agentsmyth.mjs:2134 | accepted | Intermediate write carries pre-upgrade digests, so a crash still fails safe |
| F100 | M7-V2 | researcher | 2 | RI18 eight-artifact gate false | trial | ~/.agentsmyth/sandbox/agentsmyth/r2v2/defhook; `node bin/agentsmyth.mjs init` -> output manifest has 6 entries | accepted | Eight is unreachable on any platform+config combination |
| F101 | M7-V2 | researcher | 2 | gate still frozen in a default repo | trial | ~/.agentsmyth/sandbox/agentsmyth/r2v2/defhook; `grep -c STALE-1.0.0-GATE-BODY .git/hooks/pre-commit` -> output 1 | accepted | Release-blocking. Independently reproduced as F114 |
| F102 | M7-V2 | researcher | 2 | skew warning now carries a NEW false claim | trial | ~/.agentsmyth/sandbox/agentsmyth/r2v2/repoB; `node bin/agentsmyth.mjs check` -> output full skew block reprints verbatim | accepted | RI15 replaced working advice with a no-op command |
| F103 | M7-V2 | researcher | 2 | RI16 compares the wrong thing | repo | src/workflow/validators/check-setup-complete.mjs:262 | accepted | Compared against repo-profile's stamp, then reports it as 'installed' |
| F104 | M7-V2 | researcher | 2 | reconcile item never names a descriptor | repo | bin/agentsmyth.mjs:1196-1208 | accepted | R4's migration_id clause can never fire; the router branch that reads it is unreachable |
| F105 | M7-V2 | researcher | 2 | migration.schema.yaml has no reader | repo | src/assets/workflow/migrations/README.md | accepted | R5's acceptance clause is unenforceable; a malformed descriptor reaches a regex scraper |
| F106 | M7-V2 | researcher | 2 | loadMigrations filter is wrong | trial | ~/.agentsmyth/sandbox/agentsmyth/r2v2/pkg; `node pkg/bin/agentsmyth.mjs upgrade` -> output only 1.0.1-to-1.1.0 applied | accepted | Independently reproduced as F117 |
| F107 | M7-V2 | researcher | 2 | symlinked governed file is severed | trial | ~/.agentsmyth/sandbox/agentsmyth/r2v2/repoC; `ls -l` -> output regular file, mode 755 -> 644 | accepted | rename over a symlink orphans the shared target and drops the mode |
| F108 | M7-V2 | researcher | 2 | absent pending-setup fails silently | trial | ~/.agentsmyth/sandbox/agentsmyth/r2v2/nopending; `node bin/agentsmyth.mjs upgrade` -> output No new reconcile items — each of these was already raised | accepted | The message is flatly untrue and the false state repeats every run |
| F109 | M7-V2 | researcher | 2 | check-lifecycle check is cwd-relative | trial | ~/.agentsmyth/sandbox/agentsmyth/r2v2/repoA; `node check-lifecycle.mjs` from a subdir -> output check-lifecycle: ok | accepted | Real in code; severity reduced by F118 |
| F110 | M7-V2 | researcher | 2 | concurrent upgrades lose a write | trial | ~/.agentsmyth/sandbox/agentsmyth/r2v2/repoA; `node bin/agentsmyth.mjs upgrade` x2 concurrently -> output both report success, PS-4 absent | accepted | Unlocked read-modify-write on pending-setup.yaml |
| F111 | M7-V2 | researcher | 2 | edge cases clean | trial | ~/.agentsmyth/sandbox/agentsmyth/r2v2/nogit; `node bin/agentsmyth.mjs upgrade` -> output exit 0, 6 governed | accepted | no-git, unicode paths, CRLF and empty files all behave |
| F112 | M7-V2 | researcher | 2 | three shipped statements now stale | repo | bin/agentsmyth.mjs:1541 | accepted | Including one in a published schema contract |
| F113 | M7-V2 | researcher | 2 | RI14 holds only by prose | trial | ~/.agentsmyth/sandbox/agentsmyth/r2v2/ri14; `node bin/agentsmyth.mjs upgrade --baseline` -> output recorded provenance baseline for 7 governed file(s) | accepted | Nothing mechanically enforces that setup step 5f ran |
| F114 | M8-C2 | challenger | 2 | blocker A confirmed, severity understated | trial | ~/.agentsmyth/sandbox/agentsmyth/r2c/t1b.mjs; `node t1b.mjs` -> output hook CHANGED: false / STALE placeholder STILL PRESENT: true | accepted | init never sets core.hooksPath, so the broken branch is essentially every consumer — and 1.1.0's own hook fix is what they cannot receive |
| F115 | M8-C2 | challenger | 2 | blocker B confirmed and worse | trial | ~/.agentsmyth/sandbox/agentsmyth/r2c/t2.mjs; `node t2.mjs` -> output user file PRESERVED: false / backups dir exists: false | accepted | Needs no contrived state: any repo with a pre-existing .github/copilot-instructions.md loses it on first upgrade |
| F116 | M8-C2 | challenger | 2 | defect C confirmed, and it is a regression | trial | ~/.agentsmyth/sandbox/agentsmyth/r2c/t3.mjs; `node t3.mjs` -> output version skew detected — repo-profile.yaml was written by v1.0.0 | accepted | This package DELETED correct advice and replaced it with a command that cannot work |
| F117 | M8-C2 | challenger | 2 | defect D confirmed, skip is silent | trial | ~/.agentsmyth/sandbox/agentsmyth/r2c/t4.mjs; `node t4.mjs` -> output no delta-applied line, no warning, exit 0 | accepted | 1.0.1 is the published version, so the first descriptor written as 1.0.0-to-1.1.0 misses the whole installed base |
| F118 | M8-C2 | challenger | 2 | defect E overstated | trial | ~/.agentsmyth/sandbox/agentsmyth/r2c/t3-skew; `node bin/agentsmyth.mjs check` from a subdir -> output failed with 1 issue(s) | accepted | agentsmyth check spawns with cwd: checkRoot, so the shipped path is unaffected — minor, not blocking |
| F119 | M8-C2 | challenger | 2 | AGENTS.md frozen by the same gap | repo | bin/agentsmyth.mjs:2209 | accepted | placeAgentsMd runs only in init, so the new stamp check can never fail through any normal path — the dead check it revived is still dead |
| F120 | M8-C2 | challenger | 2 | re-rendered reported on a no-op | repo | bin/agentsmyth.mjs:1136-1143 | accepted | The one human-readable summary of an upgrade overstates what it did |

### Reconcile Contract

Declared at bucket design, before dispatch. Buckets A, B and C all produce findings on the shared
surface `bin/agentsmyth.mjs`, so overlap was expected rather than accidental.

**Dedupe rule.** A finding is owned by the bucket whose question it answers, regardless of which file
it cites. Where two members make claims about the same function, the parent keeps the finding from
the owning bucket and records the other as `merged` naming that target. Identical claims from
different buckets collapse to the earlier finding ID.

**Disagreement rule.** Where two findings about the same code assert incompatible things, neither is
silently dropped. Both are recorded, the conflict goes in the Conflicts table with the evidence that
decided it, and the parent states which was adopted. A conflict the parent cannot decide from
evidence escalates as a `Q` rather than being resolved by preference.

Challengers were exempt from bucket ownership by charter - their job is to cross the boundaries the
researchers were fenced into.

### Conflicts

| Surface | Findings | Resolution |
|---|---|---|
| `bin/agentsmyth.mjs:568-576` and this brief's Problem statement | F21 vs F58 | **F21 adopted; F58 rejected.** F21 was correct when written: the brief then read "every config write in the CLI is guarded by `if (existsSync(dest)) continue;`". The parent patched that sentence after F21 landed and before the challengers dispatched, so F58 read the corrected text and concluded F21 had invented the quote. The fault is the parent's, not either member's. Recorded as a process defect below. |
| `bin/agentsmyth.mjs` - does any path overwrite an existing consumer config | F40 vs F59, and F40 vs F21 | **F59 adopted.** F40's closing sentence ("zero code paths overwrite an existing consumer config") is refuted by trial: a re-`init` produced `M workflow/config/repo-profile.yaml`. The accurate statement keeps the word F40 dropped - no path overwrites consumer **content**; machine-owned fields are overwritten today. F21 and F40 assert opposites about the same line and the parent has adopted only F21's. |
| Manifest format and location | F23 vs F14, arbitrated by F24/F66 | **Both merged into F66.** F23's benefit and F14's risk are the same dormant mechanism, and it never runs in a consumer. The format decision is made on repo idiom instead, and neither finding may be cited as a reason. |
| Which validator hosts the manifest check | F24 vs F67 | **F67 adopted.** `check-setup-complete.mjs` deliberately imports nothing from `lib.mjs`, so it cannot schema-validate. `check-lifecycle.mjs` is the only validator both CLI-invoked and lib.mjs-capable. |
| Write ordering | F31 (recall) vs F72 | **Deferred to Plan.** F72 corroborated the "record the writing version" half from repo evidence and stated plainly that it could not corroborate the "record the target-version canonical hash" half. Under this council's contract `recall` may not resolve, so it is carried as a hypothesis, not a requirement. |

### Repo Integrity

| | |
|---|---|
| Algorithm | `sha256/sorted-relpath+size+content` (`validators/repo-digest.mjs`) |
| Before | `220c19812be6c9e48595588eaefa748f476253c8d6b31f2376c54a906b2798c3` (2124 files) |
| After | `0fc29d2c23841d071d10fc352856983fbe79e268dc91b76b05989bda18694cf1` (2125 files) |

**The digests do not match, and the reason is the parent, not a member.** Two process defects, both
the parent's:

1. The before-digest was taken roughly three minutes **after** dispatch rather than immediately
   before, so it does not bracket the opening of the run.
2. The parent wrote this brief *during* the council, which is the entire delta: file count 2124 ->
   2125, and an mtime sweep (`find . -type f -mmin -90`, excluding `.git` and `node_modules`)
   returns exactly one path - `workflow/artifacts/briefs/wp-r18-delta-upgrades-v1.md`. `git status
   --porcelain` shows that same single untracked file and nothing else.

No member write is evidenced, but the mechanical assertion `check-council-record.mjs` wants - before
equals after - is unavailable for this run, and the corroboration above is weaker than the digest it
replaces. The correct procedure is: digest, dispatch, consolidate, digest, *then* write the artifact.

**Recorded outcome:** `check-council-record.mjs` fails on this artifact with exactly one issue, the
before/after mismatch above, and `npm run validate` fails with it. Every other rule in that validator
passes - 78 findings, all citations resolved or shape-checked to contract. The failure is left
standing rather than engineered around: the digests are the real measurements, and a run whose
integrity bracket was taken wrongly should say so. Whoever picks this up should re-take the bracket
correctly rather than adjust the recorded values.

### Termination

- **Reason:** `user-decision-required`
- **Surviving items and their round history:** I8, I9, I10, I11, I12
  - **I8 - command surface.** Entered round 1 open. Researched by M1-A (F16, F17, F18),
    challenged by M5-Y (F74) and M4-X (F60). A recommendation exists with evidence; the choice is
    the user's.
  - **I9 - core mechanism viability.** **Opened** in round 1 by F70. Contradicts an approach the
    work-package page records as confirmed, so no amount of further research settles it.
  - **I10 - manifest scope.** **Opened** in round 1 by F73. A scope question about what the product
    guarantees.
  - **I11 - backup retention.** **Opened** in round 1 by F75. Non-blocking; recommendation
    available.
  - **I12 - polyrepo-member durability.** **Opened** in round 1 by F77. Non-blocking;
    recommendation available.

## Architecture Notes

- **role:** Architect
- **decision (architecture-decision-advisor, triggered at complexity_score ~70 >= 60):** the upgrade
  is owned by a **new `agentsmyth upgrade` command**, with the manifest write point inside
  `headlessBootstrap()` - the one function `init` and `check` already share, where canonical content
  is already in hand as a string.
  - *Rejected alternative 1 - extend `init`.* Steelmanned by F74: no new verb to discover, existing
    CI and README invocations upgrade for free. Rejected because `init`'s first act is a hard refusal
    when `.agentsmyth/` exists (`bin/agentsmyth.mjs:1306-1310`), so an interrupted upgrade cannot be retried, and
    because `init` re-scaffolds `.agentsmyth/` on every run, which makes `agentsmyth check` exit 1
    until an agent deletes it (F6, F9, F49). Decisively: a separate verb can call `runPrepare`
    unconditionally, which RI6 requires, without changing `init`'s contract for fresh installs
    (F69).
  - *Rejected alternative 2 - `agentsmyth prepare`.* Structurally disqualified: every path it writes
    is rooted at `homedir()` and it writes zero repo-level files by design (F13).
  - *Rationale:* repo-consistency and bounded blast radius. The `doctor` stub already occupies a
    reserved command slot, the command surface is a flat if-chain with no registry, and the interop
    harness already spawns arbitrary argv (F16). The cost is discoverability, which RI15 absorbs.
  - *Subject to Q2.* This is the advisor's recorded decision, not a commitment over the user's.
- **constraint:** additive-only for 1.1.0, or the release escalates to 2.0.0; zero runtime
  dependencies; the mutation ratchet at zero; `[safety-2]`'s destructive-action rule, which
  backup-before-overwrite mitigates but does not by itself satisfy (F41, narrowed by F76).
- **tradeoff:** whole-file replacement was the confirmed approach and is simpler to implement and to
  test. It is rejected in the recommendation only because the templates it would install are not
  installable content (F70). Key-level delta costs a descriptor format and a merge story, and buys
  a mechanism whose preconditions actually hold.
- **assumptions Plan must preserve:** A2 (backups committed, not gitignored) and A3 (sha256 hex) are
  both reversible but load-bearing for RI7 and RI13.
- **downstream:** *Plan* must settle the write-ordering hypothesis F31/F72 left open, and pick the
  descriptor format concretely. *Build* inherits RI3 - every new validator error needs its fixture in
  the same change. *Test* inherits RI5's five-state matrix as its fixture set, and cannot use
  installed-old-version fixtures because the harness only ever runs the working tree (F11 is the
  one place a real published tarball is exercised). *Ship* inherits RI15's doc corrections across
  three shipped surfaces. *Reflect* should record the two council process defects logged under Repo
  Integrity.

## Checkpoint Approval

- Checkpoint: brief-review
- Status: approved
- User's own words (verbatim, this turn): "Brief is approved, continue to plan"
- Approved: 2026-09-23, following a question-by-question walkthrough the user asked for and then
  corrected the format of - the first pass presented all nine items in one block, and the user
  required them presented individually. Each of A1-A4 and Q1-Q5 was then put to the user separately
  and answered separately: A1 keep, A2 committed, A3 sha256, A4 accept, Q1 key-level delta, Q2 new
  `upgrade` command, Q3 all three governed surfaces, Q4 most-recent-only plus delete-on-resolve, Q5
  handle properly via `resolveGitCwd()`. Two answers went against the recommendation in this brief
  (Q3 broader, Q5 handled rather than deferred); both are recorded as the user's, not the agent's.

## Exit Gate

- [x] Every active R and RI has acceptance criteria.
- [x] Blocking Q IDs appear in orchestration.blockers - all cleared, every Q resolved by the user.
- [x] User approved or waiver recorded - approved 2026-09-23, verbatim words in `## Checkpoint Approval`.
- [x] `skill_trigger_log` records all three mandated skills with decision and reason.
- [x] Every active R and RI has a Requirement Classification entry naming at least one evidence class.
- [ ] `check-council-record.mjs` passes - it does NOT. One rule fails: `council.repo_integrity`
  before and after differ, because the parent wrote this artifact inside the integrity bracket and
  took the before-digest after dispatch. Documented under `### Repo Integrity`, left standing rather
  than adjusted. No member write is evidenced. Carried into Plan as a known, recorded defect.
