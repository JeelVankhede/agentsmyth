---
slug: wp-r18-delta-upgrades
version: 1
artifact: plan
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
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
---

# WP-R18 Version-Aware Delta Upgrades - Plan

## Summary

Twelve phases - ten planned, plus Phase 11 (round-2 defect remediation) and Phase 12 (Review
council remediation), both added after the original approval and both dated in their own headings.
Build the provenance primitives first (manifest schema, path resolution, hashing,
atomic write), record a baseline at the two points where agentsmyth actually finishes writing
config, then add the `agentsmyth upgrade` command that classifies drift per key, backs up, and
records reconcile items. Descriptors, the marker-block strategy for rendered files, the validator
host, OI-105, and the doc corrections follow.

The shape changed materially at brief-review. Q1 replaced whole-file backup-and-replace with
key-level delta, so migration descriptors moved from adjunct to mechanism. Q3 widened the governed
surface from five configs to the governed artifact set - six in a default repo, seven when
`core.hooksPath` puts the hook outside `.git/`, eight only on a non-darwin platform that also places
the Copilot adapter (RI18, as restated after round 2; "eight" as a fixed count was wrong). Q5 required real polyrepo handling rather than a
documented limitation. Phases 6, 7 and 1 exist because of those three answers.

## Inputs

- `workflow/artifacts/briefs/wp-r18-delta-upgrades-v1.md` - approved 2026-09-23, `status:
  ready-for-next-phase`, checkpoint `brief-review` approved with the user's verbatim words. Gate
  confirmed: `check-lifecycle --phase plan --slug wp-r18-delta-upgrades` exits 0.
- Requirement Manifest: 6 `R` + 21 `RI` active, 4 `A`, 5 `Q` all resolved.
- `workflow/config/repo-profile.yaml` - branch policy, protected paths, repository mode enum.
- `workflow/config/verification.yaml` - `npm run validate` and `npm run violations:test`, both
  `required: true` for phases `[review, ship]`.
- `workflow/config/release.yaml` - `pull_request.create_policy: user_requested_or_configured`;
  `ci.required: false`, `provider: none`.
- `workflow/config/source-of-truth.yaml` - `mode: optional`, `providers: []`.

## Requirement Coverage

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R1 | P1 | covered - manifest file, schema, entry shape |
| R2 | P3 | covered - per-key classification (Q1) |
| R3 | P4 | covered - backup before any write |
| R4 | P5 | covered - one reconcile item per file per upgrade |
| R5 | P6 | covered - promoted to the mechanism by Q1 |
| R6 | P8 | covered - hosted in check-lifecycle.mjs |
| RI1 | P10 | covered - additive-only, verified against pre-1.1.0 artifacts |
| RI2 | P1 | covered - node:crypto only; precedent at repo-digest.mjs:22 |
| RI3 | P8 | covered - one rejection fixture per new errors.push site |
| RI4 | P1 | covered - first temp+rename in the codebase |
| RI5 | P3 | covered - five-state machine |
| RI6 | P3 | covered - runPrepare unconditional |
| RI7 | P4 | covered - backups outside config/ and artifacts/ |
| RI8 | P4 | covered - explicit filename list, never a sweep |
| RI9 | P5 | covered - marker grammar + completed-reconcile ledger |
| RI10 | P5 | covered - pendingItemsFrom spec gains config |
| RI11 | P5 | covered - router step 9 + resolved_by member |
| RI12 | P8 | covered - CLI_INVOKED wiring |
| RI13 | P1 | covered - normalization before hashing |
| RI14 | P2 | covered - post-setup baseline stamping |
| RI15 | P10 | covered - three shipped surfaces corrected |
| RI16 | P9 | covered - OI-105 marker stamp reader |
| RI17 | P10 | covered - rebuild + adapter sync |
| RI18 | P2 | covered - governed surface enumerated (Q3) |
| RI19 | P7 | covered - marker-block replacement for rendered files |
| RI20 | P4 | covered - retention, agent deletes (Q4) |
| RI21 | P1 | covered - resolveGitCwd for backup paths (Q5) |

**Phase 11 and Phase 12 own IDs a second time, deliberately.** The table above records the phase
that first implemented each ID. Two later phases revisit some of them, and a coverage table that
hides that is worse than one that admits it:

| Manifest ID | Also owned by | Why |
|---|---|---|
| R4, R5 | P11, P12 | descriptor resolution predicate (P11), then op validation and content-verified tests (P12) |
| RI4 | P11, P12 | atomic write gained symlink resolution in P11; P12 added the containment it needed |
| RI15 | P11, P12 | shipped surfaces corrected in P11, completed in P12 - the P11 pass claimed "every" and covered three files |
| RI16 | P11, P12 | marker stamp reader (P11), then made able to fail for its own reason (P12) |
| RI18 | P11, P12 | acceptance restated after round 2 (P11), propagated into this plan (P12) |
| RI19 | P11, P12 | marker-block strategy (P11); P12 made the refresh reach the reconcile filter |
| R1, R2, R3, R6, RI1, RI5, RI7, RI9, RI11, RI13, RI14, RI17, RI20, RI21 | P12 | Review remediation - see Phase 12 |

No ID is `deferred`, `waived`, or `dropped`.

## Assumptions Verified

| Assumption ID | Status | Evidence / Question |
|---|---|---|
| A1 | evidence-backed | `workflow/artifacts/briefs/wp-r18-delta-upgrades-v1.md` exists at that slug; `git branch --show-current` returns `feat/wp-r18-delta-upgrades`. Both inspected this session. |
| A2 | evidence-backed | `src/workflow/validators/check-commit-coverage.mjs:17` lists `workflow/` in `SAFE_PREFIXES`; `bin/agentsmyth.mjs:1378` writes only the literal `.agentsmyth` into `.gitignore`, so nothing under `workflow/` is ignored. |
| A3 | evidence-backed | `src/workflow/validators/repo-digest.mjs:22,53,61,70` already imports `createHash` from `node:crypto` and uses `createHash('sha256')...digest('hex')` - the exact algorithm and encoding A3 assumes - so precedent exists and this is stronger than the brief recorded. The brief called it the first `node:crypto` import, which is **wrong**; see the correction note below. |
| A4 | evidence-backed | `src/workflow/validators/check-setup-complete.mjs:214-215` errors on any surviving `.agentsmyth/`, and `bin/agentsmyth.mjs:229` ORs that into the exit code. Nothing this plan writes goes there. |

**Council-record correction (A3).** During round 1 the council twice ran
`grep -rn "node:crypto\|createHash" bin/ src/ scripts/ test/` and twice got zero matches, the second
time presented as an independent re-derivation of the first. Both were false negatives.

*Corrected 2026-09-23 by round 2 (F83):* this note previously said the brief's findings F33 and F63
"report" that grep. They do not — F33 cites a `getHashes()` trial and F63 cites
`test/mutation-baseline.json`, and the string `grep` appears nowhere in the brief. The false command
lived in the council transcript, not in the artifact, so the correction as first written attacked
wording that was never there. That is the same error the round 1 sourcing challenger made against
F21, made here in the opposite direction, by the parent.
`src/workflow/validators/repo-digest.mjs` contains three deliberate NUL bytes - they are field
separators in the digest line, `` `${rel}\0${size}\0${content}` `` at line 65, and are stripped for
display at line 77 - which makes `grep` classify the file as binary and silently skip it. Run
binary-safe (`grep -a`), the matches appear. The same re-run confirms `renameSync` genuinely has
zero matches, so RI4's "first atomic write in the codebase" stands unchanged. Two independent
members ran the same flawed command and agreed, which is exactly the failure mode a challenge pass
is supposed to catch and did not.

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `bin/agentsmyth.mjs` | modify | R1, R2, R3, R4, RI4, RI5, RI6, RI9, RI10, RI13, RI19, RI20, RI21 | The single largest surface. New `upgrade` command, manifest read/write, atomic helpers, backup writer, reconcile emitter, marker-block refresh. |
| `src/workflow/schemas/provenance.schema.yaml` | create | R1, R6 | New `kind: provenance` contract; auto-registers by `$id` via `lib.mjs:884-893`. |
| `src/workflow/schemas/migration.schema.yaml` | create | R5 | New `kind: migration` contract, same idiom. |
| `src/assets/workflow/migrations/` | create | R5 | Published tree the CLI reads at upgrade time; `src/workflow/` is not published. |
| `src/workflow/schemas/pending-setup.schema.yaml` | modify | R4, RI1, RI11 | Declare new optional properties; widen `resolved_by` enum. Additive only. |
| `src/workflow/router.md` | modify | RI11 | Step 9 reconcile branch. |
| `src/workflow/validators/check-lifecycle.mjs` | modify | R6, RI12 | Hosts the manifest presence/shape check. |
| `src/workflow/validators/check-setup-complete.mjs` | modify | RI16 | OI-105 marker stamp reader. |
| `src/setup/SKILL.md` | modify | RI14 | Post-setup baseline stamping step. |
| `test/fixtures/lifecycle-violations/` | create | RI3 | One rejection fixture per new `errors.push` site. |
| `test/run-violation-tests.mjs` | modify | RI3 | One registration line per fixture, asserting that rule's own wording. |
| `test/run-upgrade-path-tests.mjs` | create | R2, RI5 | Five-state fixture suite. |
| `test/run-conformance-tests.mjs` | modify | RI12 | `CLI_INVOKED` registration. |
| `package.json` | modify | RI3, RI12 | `upgrade-path:test` script. Runtime `dependencies` unchanged. |
| `.github/workflows/ci.yml`, `release.yml` | modify | RI3 | Wire the new test script. |
| `site/updating.md` | modify | RI15 | Two sections falsified (lines 22-24 and 28). |
| `docs/release-checklist.md` | modify | RI15 | The "install over the top" rehearsal gains manifest/backup/reconcile assertions. |
| `CHANGELOG.md` | modify | RI1 | 1.1.0 entry. |
| `dist/`, root `validators/`, `src/assets/adapters/` | regenerate | RI17 | Build products. Never hand-edited. |

**Protected paths:** none touched. `repo-profile.yaml` `paths.protected` is `.git/**`, `.env*`,
`**/*secret*`; no planned touch matches.

## Source-of-Truth Strategy

`source-of-truth.yaml` declares `mode: optional` with `providers: []`, so no provider is configured
and no external update is required for this chain. The Notion work-package and release pages are the
user's own records and were read as context, not as a configured provider. Status: **not required**.

Two Notion pages will be materially stale once this ships - the WP-R18 page still records
whole-file backup-and-replace and `.agentsmyth/backups/`, both superseded by Q1 and A4. That is a
user-owned handoff at Ship, not a blocker here, and is recorded as RK9.

## Approach

**Key-level delta, not file replacement (Q1).** An upgrade never writes a template over a consumer
file. It reads the manifest, computes the current digest per governed artifact, and for a drifted
file consults the applicable migration descriptor to apply key-level changes - add keys the newer
schema introduces, update machine-owned scalars, leave user-set values alone. This is the operation
`writeDefinitionsRoot()` already performs at field level.

**Two write classes, because Q3 widened the surface.** The five config YAMLs are structured data and
take key-level delta. The pre-commit hook and the two deterministic adapters are rendered markdown
with no keys to merge, so they take marker-block replacement - the strategy `placeAgentsMd()`
already uses. RI19 owns that split.

**Manifest location.** `workflow/provenance.yaml`, deliberately **not** under `workflow/config/`:
`check-config.mjs` walks that directory recursively via `listFiles`, so anything there is
schema-validated, and a backup or an old-version entry would fail the first time a schema tightens.
`check-lifecycle.mjs`'s stray-artifact guard only matches `*-v<N>.md`, so a `.yaml` at the
`workflow/` root is invisible to it.

**The definitions-root ordering hazard is closed by RI6, not avoided.** A YAML manifest needs
`provenance.schema.yaml` from the definitions root, which only `agentsmyth prepare` refreshes - and
both existing `runPrepare` call sites fire only when the global tree is *absent*, never when it is
stale. `upgrade` calls `runPrepare` unconditionally as its first act, so the schema is current
before anything reads it.

**Backups resolve to the git working tree (Q5).** `resolveGitCwd()` already exists for exactly this
reason. Backups land at `<gitRoot>/workflow/backups/<from-version>/<relpath>`, so they are committed
and reviewable in all three repository modes rather than only two.

## Phases

### Phase 1 - Provenance primitives

- **Manifest IDs:** R1, RI2, RI4, RI13, RI21
- Touches: `bin/agentsmyth.mjs`, `src/workflow/schemas/provenance.schema.yaml`
- Work: `kind: provenance` schema with a manifest-level `format_version`; per-entry `path`,
  `sha256`, `written_by_version`. Content normalization (CRLF to LF, single trailing newline)
  applied before hashing. Atomic write helper: same-directory temp plus `renameSync`. Path
  resolution for manifest and backups via `resolveGitCwd()`.
- **Exit gate:** *(amended 2026-09-23 during Build - see note below)* the primitives are correct in
  isolation. A CRLF and an LF copy of the same content digest identically; trailing blank lines and
  a missing trailing newline do not change a digest, while trailing whitespace inside a line does;
  a manifest round-trips through write and read with digests, `format_version` and `normalization`
  preserved; a truncated or wrong-`kind` manifest is rejected with a reason rather than reported as
  absent; `atomicWriteFileSync` replaces in place and leaves no temp file; `backupRoot` resolves
  through the git working tree; `grep -a renameSync bin/agentsmyth.mjs` returns at least one match.
  Observable CLI behavior is unchanged, since no call site is wired in this phase.

  **Amendment note.** As originally written this gate required `agentsmyth init` to write the
  manifest. That is not reachable in Phase 1: writing a manifest requires knowing which artifacts are
  governed, and that enumeration is RI18, owned by Phase 2. The two gates were circular. The
  requirement (R1) and its acceptance criteria are unchanged - what moved is which phase proves the
  `init` wiring, which is now Phase 2's gate where RI18 actually lives. Recorded rather than
  silently substituted, per the Build determinism rule against unrecorded scope change.

### Phase 2 - Baseline recording

- **Manifest IDs:** RI14, RI18
- Touches: `bin/agentsmyth.mjs` (`headlessBootstrap`), `src/setup/SKILL.md`
- Work: enumerate the governed artifacts - six, seven or eight by platform (five configs, pre-commit hook, two deterministic
  adapters; `AGENTS.md` excluded). Record the baseline at `init` **after** `writeDefinitionsRoot()`,
  and again after the setup skill finishes filling configs - the second is what RK2 requires.
- **Exit gate:** *(amended 2026-09-23, receiving the `init` wiring from Phase 1)* in a scratch repo
  `agentsmyth init` writes `workflow/provenance.yaml` carrying one entry per governed artifact
  that exists on this platform - six in a default repo, `AGENTS.md` absent - and every entry digest equals an independently recomputed
  normalized sha256 of the file on disk. Then a repo taken through `init` **and** the setup skill's
  config-filling has a manifest whose every entry matches the filled file, and a simulated upgrade
  immediately afterwards produces zero reconcile items.

### Phase 3 - `agentsmyth upgrade` and delta classification

- **Manifest IDs:** R2, RI5, RI6
- Touches: `bin/agentsmyth.mjs`
- Work: new top-level command; `runPrepare` unconditionally first; five-state machine - absent
  (adopt), valid (compare per key), unparseable (hard stop), format_version newer than CLI (hard
  stop), entry for a missing file (adopt that entry only).
- **Exit gate:** `agentsmyth help` lists `upgrade`; each of the five states produces its specified
  outcome in a fixture; an upgrade against an exists-but-stale `~/.agentsmyth/workflow` refreshes it
  before reading any schema.

### Phase 4 - Backup writer and retention

- **Manifest IDs:** R3, RI7, RI8, RI20
- Touches: `bin/agentsmyth.mjs`
- Work: back up before any write, to `<gitRoot>/workflow/backups/<from-version>/<relpath>`, from an
  explicit filename list. At most one backup per governed file, superseded in place.
- **Exit gate:** a drifted file's backup is byte-identical to its pre-upgrade content;
  `npm run validate` exits 0 with backups present; two successive upgrades of the same drifted file
  leave exactly one backup.

### Phase 5 - Reconcile items and the router branch

- **Manifest IDs:** R4, RI9, RI10, RI11
- Touches: `bin/agentsmyth.mjs`, `src/workflow/schemas/pending-setup.schema.yaml`,
  `src/workflow/router.md`
- Work: marker grammar encoding file **and** version; a completed-reconcile ledger that survives
  item pruning; `pendingItemsFrom` spec gains `config` and the reconcile fields; router step 9;
  `resolved_by` gains a merged-from-backup member.
- **Exit gate:** one item per drifted file per upgrade; the same file drifting at two successive
  versions yields two items; pruning a resolved item does not resurrect it; no `PS-N` id is
  re-issued after its holder is pruned.

### Phase 6 - Migration descriptors

- **Manifest IDs:** R5
- Touches: `src/workflow/schemas/migration.schema.yaml`, `src/assets/workflow/migrations/`
- Work: `version: 1` / `kind: migration` documents under
  `src/assets/workflow/migrations/<from>-to-<to>/<config>.yaml`, published because the CLI reads
  them. Loader resolves the applicable descriptor chain for a version pair.
- **Exit gate:** a descriptor validates against its schema with no registry edit; the loader returns
  the correct descriptor set for a two-step version gap; a version pair with no descriptor upgrades
  machine-owned scalars only and records no reconcile item.

### Phase 7 - Marker-block strategy for rendered files

- **Manifest IDs:** RI19
- Touches: `bin/agentsmyth.mjs` (`installPreCommitHook`, `placeDeterministicAdapters`)
- Work: replace inside markers, preserve outside, for the pre-commit hook and the two deterministic
  adapters. Removes the early-return-on-marker that freezes the gate at first-install version.
- **Exit gate:** a hook installed at an older version is brought current by an upgrade; user content
  outside the marker block survives byte-for-byte; a user's own pre-existing hook body is preserved.

### Phase 8 - Validator host, fixtures, ratchet

- **Manifest IDs:** R6, RI3, RI12
- Touches: `src/workflow/validators/check-lifecycle.mjs`, `bin/agentsmyth.mjs`,
  `test/run-conformance-tests.mjs`, `test/run-violation-tests.mjs`, fixtures, `package.json`, CI
- Work: manifest presence/shape check in `check-lifecycle.mjs` - the only validator both CLI-invoked
  and `lib.mjs`-capable. One rejection fixture per new `errors.push` site. New `upgrade-path:test`.
- **Exit gate:** `npm run conformance:test` passes including `every-validator-wired` and
  `cli-invoked-exemptions-are-real`; `npm run mutation:audit` reports `undefended: 0` for every
  validator touched; `npm run violations:test` passes.

### Phase 9 - OI-105 marker stamp reader

- **Manifest IDs:** RI16
- Touches: `src/workflow/validators/check-setup-complete.mjs`, fixtures
- Work: change the adapter-presence check from "AGENTS.md exists" to "AGENTS.md carries a
  well-formed marker pair whose version stamp matches the installed version". First reader of a
  version stamp in the codebase.
- **Exit gate:** the check fails in a repo whose `AGENTS.md` carries a stale stamp and passes when
  current; its rejection fixture exists; `npm run mutation:audit` still reports `undefended: 0`.

### Phase 10 - Docs, additive compliance, rebuild

- **Manifest IDs:** RI1, RI15, RI17
- Touches: `site/updating.md`, `docs/release-checklist.md`, `bin/agentsmyth.mjs` (skew warning),
  `CHANGELOG.md`, build outputs
- Work: correct all three shipped surfaces that name `init` as the upgrade action; skew warning must
  name `upgrade` since it is the only discovery channel; rebuild bundles; confirm adapter sync.
- **Exit gate:** no shipped surface names `init` as the upgrade action; `npm run build` then
  `npm run validate` exits 0; every pre-1.1.0 artifact and config still validates; `dependencies` in
  `package.json` is byte-identical to its pre-chain value.

### Phase 11 - Round 2 defect remediation

Added 2026-09-23. Not part of the original ten. Round 2 of the Think council — re-run at the user's
direction to replace round 1's broken integrity bracket — was scoped to verification and found that
several phases do not deliver what their exit gates claim. Two defects are release-blocking and one
is a regression this package introduced. The work is remediation of phases already marked complete,
so it re-enters their files rather than adding new surface.

- **Manifest IDs:** R4, R5, RI4, RI15, RI16, RI18, RI19
- Touches: `bin/agentsmyth.mjs`, `src/workflow/validators/check-lifecycle.mjs`,
  `src/workflow/validators/check-setup-complete.mjs`, `src/workflow/schemas/provenance.schema.yaml`,
  `src/assets/workflow/migrations/README.md`, `site/updating.md`, `CHANGELOG.md`,
  `test/run-upgrade-path-tests.mjs`, `test/fixtures/definitions/pv-provenance-*`,
  `test/run-violation-tests.mjs`, `test/run-setup-complete-tests.mjs`, `package.json`,
  `.github/workflows/ci.yml`, `.github/workflows/release.yml`, `docs/release-checklist.md`,
  `src/setup/SKILL.md`, `src/workflow/router.md`, `src/workflow/schemas/pending-setup.schema.yaml`,
  `src/workflow/schemas/migration.schema.yaml`, `dist/`, `validators/`, `workflow/schemas/`
- Work: refresh the pre-commit hook and `AGENTS.md` independently of the governed set; gate the
  adapter re-render on pristine state and back up anything else; refresh machine-owned scalars so the
  skew warning's new advice becomes true; correct the descriptor version predicate and warn on a
  descriptor that matches nothing; route the remaining hook and pending-setup writes through
  `atomicWriteFileSync`; raise a reconcile item only when a file actually changed; thread
  `migration_id` into the item; correct the stale shipped comments and the RI18 eight-artifact
  wording; add the three missing test branches.
- **Exit gate:** in a DEFAULT git repo (no `core.hooksPath`), an upgrade refreshes a staled hook
  block while preserving content outside it; a pre-existing `.github/copilot-instructions.md` is
  backed up and flagged rather than overwritten; `agentsmyth check` prints no skew warning after an
  upgrade; a descriptor directory whose `to` lands inside the upgrade span is applied and one that
  matches nothing warns; `npm run upgrade-path:test` covers the default-hooks, newly-governed and
  descriptor branches; `npm run mutation:audit` reports `undefended: 0`.

### Phase 12 - Review council remediation

Added 2026-09-24. Not part of the original ten, and not part of Phase 11 either. The Review council
(12 members, 3 rounds, 77 findings) returned `hold` with six P0 findings, every one of them a path
to irrecoverable data loss or a write outside the repository, and four of them reachable with no
attacker and no unusual sequence. The user directed that all severities be fixed rather than only
the blockers.

- **Manifest IDs:** R1, R2, R3, R4, R5, R6, RI1, RI3, RI4, RI5, RI7, RI9, RI11, RI13, RI14, RI15,
  RI16, RI17, RI18, RI19, RI20, RI21
- Touches: `bin/agentsmyth.mjs`, `src/workflow/validators/check-lifecycle.mjs`,
  `src/workflow/validators/check-setup-complete.mjs`, `src/workflow/schemas/migration.schema.yaml`,
  `test/run-upgrade-path-tests.mjs`, `test/run-setup-complete-tests.mjs`,
  `test/run-root-resolution-drift-tests.mjs`, `test/run-violation-tests.mjs`,
  `test/run-mutation-audit.mjs`, `test/fixtures/definitions/`, `README.md`,
  `CLAUDE.md`, `docs/knowledge-map/repo-mental-map.md`, `docs/overview.md`,
  `docs/release-checklist.md`, `site/updating.md`, `site/troubleshooting.md`, `site/install.md`,
  `site/under-hood.md`, `site/uninstall.md`, `src/adapters/claude/global-gate.md`,
  `src/adapters/codex/global-gate.md`, `src/adapters/copilot/global-gate.md`,
  `workflow/artifacts/` (this chain's own brief, plan and task), `dist/`, `validators/`
- Work, grouped by what actually broke rather than by finding number:
  - **Containment.** Validate `written_by_version` as a version string at manifest-read time, since
    it becomes a path segment; fence `atomicWriteFileSync` so a symlink is followed only inside a
    boundary the caller declares; fence `writeBackup`'s read the same way so a symlinked governed
    path cannot copy a secret into a committed backup.
  - **Authorship versus existence, second instance.** Stop `init` re-baselining a manifest that
    already exists - the same defect Phase 11 fixed for the upgrade path and left in `init`.
  - **Retention.** Bound the backup-supersede sweep to directory names that parse as versions, and
    never delete a backup an open reconcile item still names.
  - **Couplings.** One declared action vocabulary consumed by both the refresh producers and the
    reconcile filter, so a drifted hook can raise an item; order-independent manifest entry parsing
    with a self-consistency guard that no longer shares the reader's own assumption; normalise
    before comparing an adapter to its render.
  - **Enforcement that was prose.** Validate a descriptor against its schema at load; reject an
    unrecognised op instead of dropping it; compare recorded digests against disk in
    `check-lifecycle`; read the real installed version in the `AGENTS.md` marker check, as a
    warning rather than a hard fail because that rule ships to every repo on the machine.
  - **Tests that could not fail.** Content assertions after a delta merge; fixtures for the two
    untested merge operations; a regression case whose repo version sits strictly inside a
    descriptor span; one regression test per P0.
  - **Records.** Reconcile the brief's three contradictory accounts of its own integrity bracket;
    propagate the RI18 restatement; correct the false bijection claim; re-take the task's command
    evidence; finish the doc pass a Phase 10 commit claimed was complete.
- **Exit gate:** every P0 and P1 fix is pinned by a test that FAILS when that fix alone is reverted,
  verified by revert-and-rerun rather than asserted; `npm run upgrade-path:test`,
  `npm run violations:test`, `npm run conformance:test`, `npm run setup-checks:test` and
  `npm run root-resolution:test` all pass; `npm run build` then `npm run validate` exits 0;
  `npm run mutation:audit` reports no baseline regression; no shipped surface contradicts another on
  what clears version skew; `package.json` `dependencies` unchanged.

## Dependency Order

P1 → P2 → P3 → P4 → P5, then P6 and P7 in parallel (both depend on P3, neither on the other), then
P8, then P9, then P10.

- P1 first: everything reads or writes the manifest.
- P2 before P3: classification is meaningless without a baseline, and RK2 says a baseline recorded
  at the wrong moment ships the failure inverted.
- P4 before P5: a reconcile item names a backup path, so the backup must exist first.
- P6 and P7 both need P3's classification but are independent of each other - P6 is structured data,
  P7 is rendered markdown.
- P8 after the behavior it validates; P9 is independent but sequenced late because it shares the
  mutation ratchet with P8 and the two should not race the baseline.
- P10 last among the original ten: docs describe shipped behavior, and `npm run build` must run
  after the final `src/` change.
- P11 after P10, because it remediates all of them and re-runs the same build.

## Branch Strategy

- Base branch: `release/1.1.0`. Per the user's standing release decision, all 1.1.0 work merges
  there and `main` takes one merge at the end.
- Working branch: `feat/wp-r18-delta-upgrades`, already created from `release/1.1.0` at `9c1bbee`.
- Branch creation: done.
- Commits: **deferred until Build completes**, then made as individual per-phase commits (user
  instruction, 2026-09-23). Nothing is committed during Build; the chain is then committed as a
  sequence of commits rather than one squashed change.
- Default-branch commits: none. `branch_policy.require_non_default_branch_for_changes: true` is
  satisfied.
- PR: `release.yaml` sets `create_policy: user_requested_or_configured`, so a PR is opened at Ship
  only on the user's explicit say-so.
- Overlapping local changes: working tree is clean apart from this chain's own artifacts. If
  unrelated changes appear, `dirty_state_policy: record-and-preserve` applies - record and stage only
  approved scope.

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|
| RK1 Key-level delta needs a merge story per config shape; a partially-applied delta could leave a schema-invalid file | medium | high | RI4 atomic write - the file is replaced whole or not at all, even though the computation is per key | P1, P3 | R2, RI4 |
| RK2 Baseline recorded before the agent fills configs makes a native repo flag all files as drifted | medium | high | RI14 post-setup stamping; P2 exit gate asserts zero reconcile items on a simulated first upgrade | P2 | RI14 |
| RK3 Unparseable manifest treated as absent silently adopts edited files, losing edits on the next upgrade | low | high | RI5 makes it a distinct hard-stop state with a named recovery path; fixture required | P3 | RI5 |
| RK4 Backups accumulate under version control | low | medium | RI20 one-per-file, deleted on reconcile resolution | P4 | RI20 |
| RK5 Enforcement gate frozen at first-install version | high | high | RI19 marker-block refresh removes the early return | P7 | RI19 |
| RK6 Stale definitions root makes the manifest schema unresolvable | medium | high | RI6 `runPrepare` unconditionally first | P3 | RI6 |
| RK7 Windows CRLF invalidates every digest | medium | high | RI13 normalize before hashing; P1 exit gate asserts CRLF and LF agree | P1 | RI13 |
| RK8 Marker-block replacement on a user's own pre-existing hook could clobber their content | low | high | P7 exit gate asserts content outside markers survives byte-for-byte, including a user's own hook body | P7 | RI19 |
| RK9 Notion WP-R18 page still records the superseded approach and backup location | high | low | Ship-phase handoff to the user; no configured provider so no automated update | Ship | - |
| RK10 `grep -r` silently skips `repo-digest.mjs`, which already produced one false council finding | medium | low | Recorded here; use `grep -a` when surveying the validator tree. Candidate open item at Reflect | Review | - |

No risk is unmitigated.

## Verification Plan

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1 | command - `node bin/agentsmyth.mjs init` in a scratch repo, then recompute digests independently | Test | expected: every entry matches |
| R2 | command - `npm run upgrade-path:test` | Test | expected: all five state fixtures pass |
| R3 | manual QA - drift a config, upgrade, diff backup against pre-upgrade content | Test | expected: byte-identical |
| R4 | command - `npm run upgrade-path:test` reconcile cases | Test | expected: exactly one item per drifted file |
| R5 | command - `npm run validate` (descriptor validates via schema registry) | Review | expected: exit 0 |
| R6 | command - `npm run conformance:test` | Review | expected: `every-validator-wired` passes |
| RI1 | command - `npm run validate` on the full pre-1.1.0 artifact set | Review | expected: exit 0, no required-field change |
| RI2 | inspection - `git diff package.json` dependencies block | Review | expected: unchanged |
| RI3 | command - `npm run mutation:audit` and `npm run violations:test` | Review | expected: `undefended: 0`, all fixtures rejected |
| RI4 | inspection - the upgrade write path uses temp+rename only | Review | expected: no bare `writeFileSync` on that path |
| RI5 | command - `npm run upgrade-path:test` | Test | expected: five distinct outcomes |
| RI6 | manual QA - upgrade against a stale `~/.agentsmyth/workflow` in a scratch HOME | Test | expected: global tree refreshed first |
| RI7 | command - `npm run validate` with backups present | Review | expected: exit 0 |
| RI8 | manual QA - place a foreign file in `workflow/config/`, upgrade | Test | expected: not backed up |
| RI9 | command - `npm run upgrade-path:test` marker cases | Test | expected: no resurrection, no id re-issue |
| RI10 | inspection - emitted reconcile item names its true target config | Review | expected: `config: verification.yaml` |
| RI11 | command - `npm run validate` (`check-pending-setup` accepts the new `resolved_by`) | Review | expected: exit 0 |
| RI12 | command - `npm run conformance:test` | Review | expected: `cli-invoked-exemptions-are-real` passes |
| RI13 | command - digest a CRLF and an LF copy of the same file | Test | expected: identical |
| RI14 | manual QA - init, run setup config-filling, simulate upgrade | Test | expected: zero reconcile items |
| RI15 | inspection - grep shipped surfaces for `init` as upgrade action | Review | expected: zero hits |
| RI16 | command - `npm run setup-checks:test` plus the new rejection fixture | Test | expected: stale stamp fails |
| RI17 | command - `npm run build && npm run validate` | Ship | expected: exit 0, adapters in sync |
| RI18 | manual QA - confirm every governed artifact PRESENT ON THIS PLATFORM has a manifest entry, `AGENTS.md` does not | Test | expected: 6 in a default repo, 7 when `core.hooksPath` is set (this repo's fixtures), 8 only on non-darwin with the Copilot adapter placed. Assert against the platform under test, never against a fixed 8 - the eight-branch is unexercised on darwin and is recorded as a skipped check in the Review |
| RI19 | manual QA - stale hook plus user content outside markers, upgrade | Test | expected: refreshed inside, preserved outside |
| RI20 | manual QA - two upgrades of one drifted file, then resolve the item | Test | expected: one backup, then none |
| RI21 | manual QA - `mode: polyrepo-member` scratch workspace, upgrade | Test | expected: backup inside the member repo's working tree, visible to `git status` |

`workflow/config/verification.yaml` configures `npm run validate` and `npm run violations:test` as
`required: true` for `[review, ship]`; both appear above. No command is invented - every one is an
existing `package.json` script except `upgrade-path:test`, which P8 creates.

## Architecture Notes

- **role:** Principal Engineer
- **decision - manifest at `workflow/provenance.yaml`, YAML, outside `workflow/config/`.** YAML for
  repo idiom (`version:` + `kind:` + matching `<kind>.schema.yaml`, auto-registered by `$id`).
  Outside `config/` because `check-config.mjs` walks that tree recursively and would schema-validate
  both the manifest and any backup placed nearby. *Rejected:* `workflow/config/provenance.json` as
  the WP page specifies - JSON is invisible to every existing validator loop and would need a
  bespoke parse path plus 2-4 new ratchet-bearing fixtures, buying nothing the YAML form does not
  already get free.
- **decision - the manifest check lives in `check-lifecycle.mjs`.** It is the only validator that is
  both invoked by `agentsmyth check` by name and capable of schema validation.
  *Rejected:* `check-config.mjs`, which never runs in a consumer repo; and
  `check-setup-complete.mjs`, which is CLI-invoked but deliberately imports nothing from `lib.mjs`,
  so a check hosted there could only do existence-and-regex.
- **decision - backups resolve via `resolveGitCwd()`, the manifest does not.** The manifest sits
  beside the config set it describes, so one config set has exactly one manifest. Backups follow the
  git working tree so they are committed and recoverable. In `polyrepo-member` this means the
  manifest is exactly as durable as the config it describes - untracked, because that config is
  untracked - while backups gain durability they would not otherwise have. Raised as Q6 for
  confirmation rather than assumed.
- **constraint:** additive-only or 1.1.0 escalates to 2.0.0; zero runtime dependencies; mutation
  ratchet at zero; `[safety-2]` destructive-action rule, mitigated by backup-before-write plus a
  recorded reconcile item.
- **tradeoff:** Q3's widened surface costs a second write strategy (RI19) that key-level delta alone
  would not have needed. Accepted because a delta-upgrade feature that cannot upgrade the
  enforcement gate is the wrong shape, and the gate is the product's central claim.
- **assumptions Build must preserve:** A2 backups committed - do not add anything under `workflow/`
  to `.gitignore`. A3 sha256/hex - `repo-digest.mjs` is the precedent to match, not a new convention.
- **downstream:** *Build* owns twelve phases (ten approved, two appended as disclosed remediation)
  and must not fold Ship work (PR, CHANGELOG date, release)
  into P10. *Review* inherits RK10 - survey the validator tree with `grep -a`. *Test* inherits the
  five-state matrix and cannot use installed-old-version fixtures; the only place a real published
  tarball is exercised is the release checklist rehearsal. *Ship* inherits RK9's Notion handoff and
  RI17's rebuild. *Reflect* should record the two council process defects from the brief plus RK10.

## Open Questions

- **Q6** - Manifest location in `mode: polyrepo-member`. *Owner:* user. *Blocking:* no.
  **RESOLVED 2026-09-23: manifest beside the config set.** One manifest per config set at
  `workspace_root/workflow/provenance.yaml`, untracked in that mode because the config it describes
  is untracked. Backups still resolve to the git working tree via `resolveGitCwd()` per RI21, so they
  gain durability the manifest does not. Confirms the decision already recorded in Architecture
  Notes; Phase 1 proceeds unchanged.

  *Original question, for the record:* should the manifest sit beside the shared config set at
  `workspace_root/workflow/provenance.yaml` (one manifest per config set, untracked because the
  config is untracked), or inside each member repo's git tree alongside the backups (tracked, but N
  members hold N manifests of one shared config set and can diverge)? *Owner:* user.
  *Blocking:* no - P1 proceeds on the first, which is the recorded decision above, and switching is a
  path change confined to Phase 1.

## Checkpoint Approval

- Checkpoint: plan-review
- Status: approved
- User's own words (verbatim, this turn): "Plan approved, start Build"
- Approved: 2026-09-23, in response to this plan's own content - the ten-phase breakdown, the three
  recorded design decisions (manifest location, validator host, `runPrepare` ordering), the A3
  council-record correction, and Q6. The user first answered "proceed", which this repo's own gate
  rejected: `check-lifecycle.mjs:102` requires an evidence quote of at least 10 characters and that
  one is 7. The quote was NOT padded to clear the threshold - the user was asked for a fuller line
  and gave the one recorded above. In the same message the user resolved Q6 and set the commit
  policy.

**Scope of that approval, annotated 2026-09-24.** The plan the user approved had ten phases. It now
has twelve. Phase 11 was appended after Build closed, at the user's direction, to fix defects a
verification round found; Phase 12 was appended after the Review council returned `hold`, and the
user's instruction for it — "Fix them all" — is a separate, later authorisation covering that scope
and no more. Neither was re-put to the plan-review checkpoint, and this note exists so a reader is
not told that one verbatim quote from 2026-09-23 approved work that did not exist until the 24th.
Both appended phases are dated in their own headings and state their provenance; neither changes an
acceptance criterion the user approved.

## Exit Gate

- [x] Every active R and RI is mapped to at least one owning phase - 27 IDs, none orphaned, which
      is what `check-phase-map.mjs` actually verifies. Its own comment states that multi-phase
      appearance is deliberately NOT flagged and that only a true orphan is an error.
      *Corrected at Review (2026-09-24).* This box previously read "mapped to exactly one owning
      phase ... verified by `requirement-phase-mapper`'s bijection rule". That was false twice:
      seven IDs map to two phases each since Phase 11 was appended, and the validator has no
      bijection rule to verify it with. A checked box citing a verification that does not exist is
      worse than an unchecked one. The second owners are now enumerated under Requirement Coverage.
- [x] Every phase has a binary exit gate.
- [x] Verification plan covers every R and RI.
- [x] Dependency order explicit.
- [x] Risks have mitigation - RK1-RK10, none unmitigated.
- [x] Source-of-truth handling explicit - not required, no provider configured.
- [x] Branch strategy explicit, non-default branch.
- [x] Every brief `A` ID evidence-backed with a citation gathered this session.
- [x] User approved or waiver recorded - approved 2026-09-23, verbatim words in `## Checkpoint Approval`.
