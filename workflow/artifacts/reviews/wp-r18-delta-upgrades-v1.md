---
slug: wp-r18-delta-upgrades
version: 1
artifact: review
status: ready-for-next-phase
created: 2026-09-24
updated: 2026-09-24
manifest_ids: [R1, R2, R3, R4, R5, R6, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9, RI10, RI11, RI12, RI13, RI14, RI15, RI16, RI17, RI18, RI19, RI20, RI21]
upstream:
  - workflow/artifacts/briefs/wp-r18-delta-upgrades-v1.md
  - workflow/artifacts/plans/wp-r18-delta-upgrades-v1.md
  - workflow/artifacts/tasks/wp-r18-delta-upgrades-v1.md
orchestration:
  phase: review
  status: ready-for-next-phase
  next_phase: test
  blockers: []
  user_checkpoint: review-remediation-scope
council:
  mode: council
  authorization: explicit
  cap_resolved: 10
  cap_source: configured
  depth: deep
  dispatch_depth: 1
  rounds_run: 3
  termination_reason: user-decision-required
  resolution:
    dispatch_enabled: optional
    council_enabled: on-for-complex
    task_class: complex
  repo_integrity:
    before: sha256:65748a3fb4918e475c1944659794ae30ecb148353e4b54ac8783f4d70fb59c6a
    after: sha256:65748a3fb4918e475c1944659794ae30ecb148353e4b54ac8783f4d70fb59c6a
    algorithm: sha256/sorted-relpath+size+content
  evidence_classes:
    repo: used
    trial: used
    web: unused
    recall: unused
---

# WP-R18 Version-Aware Delta Upgrades - Review

## Findings

Fifty-six consolidated findings from seventy-seven council findings across twelve members. Ordered
by severity, then by surface. Every council finding is dispositioned in the Council Log below; the
mapping from each parent finding to its council sources is stated inline.

The two patterns that produced most of the P0s are worth naming before the list, because they are
the same coupling twice:

- **Governance conflated with refreshability.** Excluding the hook from the manifest is correct;
  routing the hook refresh through the manifest is not. Phase 11 separated them for the gate and
  left the same conflation in the reconcile filter (P1-6).
- **Existence conflated with authorship.** Phase 11 fixed this for adapters. `init` still
  re-baselines everything that exists, so a hand-edit becomes agentsmyth's own content (P0-4).

### P0-1 - `written_by_version` is an unvalidated path segment - `bin/agentsmyth.mjs`

**Council sources:** F34 (m13), F64 (c1). **Manifest IDs:** R3, R6, RI7.

**Problem.** `readProvenance` checks `written_by_version` only for truthiness. The schema types it
`string` with `minLength: 1` and no `pattern`. The `upgrade` path then assigns it to `fromVersion`
and `writeBackup` uses it directly as a path segment: `join(backupRoot(repoDir), fromVersion, rel)`.
`join` collapses `../`, so a manifest carrying `written_by_version: ../../../../../../tmp/pwned`
writes the real content of every drifted governed file to an attacker-chosen directory, before any
version comparison runs. m13 reproduced the path arithmetic and the write; c1 reproduced it
independently and added the part that decides severity: the same PR that poisons the field also
controls the governed file's content and its recorded (mismatched) digest, so path *and* payload are
attacker-chosen through one mergeable change to a file whose only defence is a comment telling
readers not to edit it by hand. Neither member needed pre-existing filesystem write access.

**Fix recommendation.** Validate the field at read time against a version grammar, and reject rather
than sanitise - a manifest that does not carry a version string is not a manifest agentsmyth wrote.
Add a `pattern` to `provenance.schema.yaml` for the same field, and assert containment at the
`writeBackup` call site so a future reader cannot reintroduce the hole by relaxing the grammar. The
existing `pv-provenance-path-escape` fixture tests `entries[].path`, which was already safe; it needs
a sibling for the top-level field.

### P0-2 - `atomicWriteFileSync` resolves symlinks with no containment check - `bin/agentsmyth.mjs`

**Council sources:** F35 (m13), F65 (c1). **Manifest IDs:** RI4.

**Problem.** The Phase 11 remediation added `lstatSync` plus `realpathSync` so an atomic rename would
not sever a symlink and orphan its shared target. That was a real bug. The fix added no check that
the resolved target stays inside the repository, so every caller - `applyUpgradeTo`,
`installPreCommitHook`, `writeProvenance`, `appendPendingItems` - becomes an arbitrary-file-overwrite
primitive when a governed path is a symlink. m13 reproduced the write against a victim file outside
its trial repo. c1 attacked the premise that git would even preserve such a symlink, ran a real
`git init`/commit/clone cycle, and confirmed it does - then reproduced the escape.

c1's calibration is recorded and does not change the severity call: the bytes written are
agentsmyth's own deterministic template output, not attacker-chosen content, so the outcome is
corruption or denial of service against a file outside the repo rather than payload injection.
Overwriting an arbitrary path on the runner with agentsmyth's adapter text is still a P0 - the
containment property, not the payload, is what was lost.

**Fix recommendation.** Resolve, then assert the real path is inside the repo root, and fail the
write otherwise. Refusing to write through a symlink at a governed path at all is the stronger
option and costs nothing: agentsmyth wrote every one of these files as a regular file.

### P0-3 - `writeBackup` reads through symlinks into committed backups - `bin/agentsmyth.mjs`

**Council sources:** F36 (m13). **Manifest IDs:** R3, RI7.

**Problem.** The same dereference applies on the read side. `writeBackup` reads a governed path with
`readFileSync` and writes the bytes to `workflow/backups/<version>/<relpath>` - a location the plan
deliberately commits. A governed path that is a symlink to `.env` or to anything matching
`**/*secret*` therefore copies that content into version control, straight past the protected-path
declarations in `workflow/config/repo-profile.yaml` and `[safety-1]`/`[safety-4]` in
`workflow/config/domain.yaml`. Nothing in the governed set checks that a governed path is a regular
file before it is hashed, backed up, or rewritten.

**Fix recommendation.** The same containment assertion as P0-2, applied before the read, plus a
regular-file check. This one is worth a fixture in `test/run-upgrade-path-tests.mjs` because its
consequence - secrets committed - is not visible in any command output.

### P0-4 - re-running `init` re-baselines provenance and erases drift permanently - `bin/agentsmyth.mjs`

**Council sources:** F28 (m12), F67 (c1). **Manifest IDs:** R1, R2, RI14.

**Problem.** `init`'s only re-entry gate is `existsSync` on `.agentsmyth/`, which setup deletes as its
final step. Once it is gone - the documented steady state - re-running `init` leaves config content
alone but calls `recordProvenanceBaseline` unconditionally, hashing whatever is on disk *now*. Any
hand-edit made since setup is adopted as content agentsmyth wrote. The next `upgrade` reads that file
as `pristine` and the edit the whole drift-detection feature exists to protect is gone, with no
backup and no reconcile item, permanently.

m12 reproduced it end to end: a hand-edited `domain.yaml` read as `drifted`, then `pristine` after a
re-`init`, with the edit still on disk and no record that it had ever diverged. c1 called this the
most severe of the seven code claims it was sent to refute - zero attacker, one keystroke, and
re-running `init` is the only update instinct anyone has, because `upgrade` did not exist before this
release. This is also the exact defect Phase 11 fixed for the `upgrade` path by making the
re-baseline targeted; the blanket version was left in `init`.

**Fix recommendation.** Make `init`'s baseline targeted the same way `upgrade`'s is - baseline only
files `init` actually wrote on this run - or detect an existing manifest and route to `upgrade`
instead of re-baselining. A third option, refusing to re-run `init` on a repo that already has
`workflow/provenance.yaml`, is the cheapest and matches the comment already in the file claiming
`init` is inert on a set-up repo.

### P0-5 - backup supersede deletes consumer-owned files under `workflow/backups/` - `bin/agentsmyth.mjs`

**Council sources:** F30 (m12), F68 (c1). **Manifest IDs:** R6, RI7, RI20.

**Problem.** The supersede cleanup that enforces RI20's "at most one backup per governed file"
iterates every top-level entry under `workflow/backups/` with `readdirSync` and deletes any file at
`<entry>/<governed-relpath>`, with no check that agentsmyth created the entry. A consumer who already
uses that directory - a nightly dump, an archival copy - loses any file whose relative path happens
to match a governed artifact's, silently, on their first upgrade. m12 reproduced it: a consumer file
at `workflow/backups/nightly/.cursor/rules/agentsmyth.mdc` was deleted while an unrelated sibling in
the same directory survived, confirming the delete targeted the coincidental relpath rather than an
agentsmyth-owned directory. c1 reproduced the same with a directory named `my-own-archive`.

The comment at that call site describes the delete as "deliberately narrow." The narrowness it
describes - under the backup root, exact relpath match - is precisely what makes it unsafe.

**Fix recommendation.** Constrain the sweep to directory names that match the version grammar
agentsmyth itself writes, and skip anything else. Combined with P0-1's validation, that makes the
set of directories this loop may touch a closed, checkable set rather than "whatever is there."

### P0-6 - backup supersede destroys the backup an open reconcile item names - `bin/agentsmyth.mjs`

**Council sources:** F51 (m16), F70 (c1). **Manifest IDs:** R4, RI20.

**Problem.** The same supersede step deletes a prior version's backup without checking whether that
backup's reconcile item is still `open`. Sequence: edit a governed file, upgrade (item raised,
`backup_path` recorded), edit again before resolving, upgrade. The first backup is gone;
`pending-setup.yaml` still carries the open item pointing at a path that no longer exists.
`src/workflow/router.md`'s step 9 then instructs the agent to read `backup_path` and diff it against
the current file - against nothing - and no validator checks that the path resolves. The user's
original edit is unrecoverable from the working tree, silently. m16 reproduced it twice.

RI20 as written names two deletion triggers - "superseded in place on each upgrade" and "deleted when
its reconcile item resolves" - and never reconciles them. This is the requirement's own unresolved
tension reaching the code. The task artifact's verification note asserts only that exactly one backup
file remained; it never checked that an open item's `backup_path` stayed valid.

c1 found it easier to trigger than reported: `writeProvenance` bumps the top-level
`written_by_version` on *every* upgrade run regardless of what changed, and a `left-for-reconcile`
file stays `drifted` until resolved, so any second `upgrade` against an unresolved item - trivially
reachable via `npx` picking up a newer published version between runs - deletes the backup.

**Fix recommendation.** Make resolution the only deletion trigger for a backup with an open item, and
let supersession skip rather than delete. RI20's acceptance criteria need rewriting alongside the
code: the two triggers must be ordered, not merely both stated.

### P1-1 - `upgrade --baseline` skips the `format_version` hard stop - `bin/agentsmyth.mjs`

**Council sources:** F27 (m12), F66 (c1). **Manifest IDs:** R4, R5, RI6.

**Problem.** The `--baseline` branch returns before `classifyManifest` runs, so it never reaches the
`newer-than-cli` hard stop that bare `upgrade` performs. `recordProvenanceBaseline` then writes
`format_version` and `written_by_version` at the current CLI's values unconditionally. An older CLI
run against a manifest a newer one wrote silently stamps both back down, discarding the newer
manifest's claims with no warning, no backup, no stop. m12 reproduced it at 99 to 1 and at 2 to 1.

`--baseline` is not an obscure recovery flag: `src/setup/SKILL.md` step 5f makes it the mandatory
final action of every agent-driven setup session. A teammate onboarding on a trailing CLI hits this
during ordinary setup. RI5's "format version newer than the CLI - hard stop, never compare" is
therefore met on one of the two entry points.

**Fix recommendation.** Run `classifyManifest` before the baseline branch and hard-stop on
`newer-than-cli` there too. The baseline path legitimately skips classification of *files*; it must
not skip classification of the *manifest*.

### P1-2 - the provenance reader's key-order regex silently drops entries - `bin/agentsmyth.mjs`

**Council sources:** F48 (m15), F69 (c1). **Manifest IDs:** RI5, R6.

**Problem.** `entryRe` requires `path`, `sha256`, `written_by_version` in that exact order and
indentation. `provenance.schema.yaml` places no ordering constraint, so a reordered entry is
schema-valid and the reader drops it. m15 proved the consequence against a real `init`-produced
fixture: reorder one entry's keys, run `upgrade`, and that file is classified `newly-governed` - the
digest comparison skipped entirely, the entry silently re-authored, its `written_by_version`
overwritten, and "Upgrade complete" printed. Any YAML re-serialiser - an IDE key-sort, `yq`, a
formatter - triggers it.

This contradicts the invariant written into `src/workflow/schemas/provenance.schema.yaml`'s own
description: an unparseable manifest is a hard stop, never an absent one, because treating it as
absent adopts the user's edited files as pristine. Here exactly that happens, per entry, silently.

**Calibration.** c1 recorded this as overstated and I have adopted its narrower mechanism. The
declares-N-but-parsed-M guard is not uniformly blind: c1 reproduced three cases and the guard *does*
fire when the reordering keeps `path` in the first key slot, because the `declared` count anchors on
the `path:` line alone. It misses only when `path` moves off the first slot. The defect is real and
the consequence is what m15 reproduced; the reviewer's general framing that the guard "cannot detect
a reordered entry" is not.

**Fix recommendation.** Parse entries as YAML mappings rather than by ordered regex, or - staying
inside the hand-rolled constraint - key the declared count off a marker independent of the reader's
own ordering assumption, so the two numbers cannot undercount in lockstep. The stronger fix is to
make any entry the reader cannot fully parse a hard stop, which is what the schema already claims.

### P1-3 - the delta suite never verifies merged content - `test/run-upgrade-path-tests.mjs`

**Council sources:** F55 (m17), F71 (c2). **Manifest IDs:** R3, R4.

**Problem.** No assertion in the 51-case suite reads a config file back after a delta merge to
confirm the descriptor's own key and value landed. `S3-delta-applied` greps stdout for the word
`delta-applied`, a label that fires whenever `text !== before` - true for any change.
`S3-user-edit-survives` reads the file back but asserts only the user's own line.
`probe_key`/`probe_two` appear only in the descriptor text the test writes, never in a post-upgrade
read. If `ensure-key` wrote the wrong value, the wrong indent, the wrong location, or appended
garbage, all 51 checks still pass. Both m17 and c2 searched the whole file independently.

This is the suite's central claimed capability - key-level delta application, the mechanism Q1
chose - with zero content verification.

**Fix recommendation.** Assert on the merged file's content: the descriptor's key present, with its
value, at the right nesting, and the file still parsing under the repo's own `parseYaml`. One
assertion per operation is enough to turn the label check into a real one.

### P1-4 - two of three merge operations have no test at all - `test/run-upgrade-path-tests.mjs`

**Council sources:** F56 (m17), F72 (c2). **Manifest IDs:** R3, R4.

**Problem.** `rename-key` and `set-machine-owned` have no exercise anywhere in the repository - not
even the weak stdout-label check P1-3 describes. Every `op:` string planted in `test/` is
`ensure-key`. `rename-key` is the operation whose entire purpose is preserving the user's value
across a key move, which the code's own comments call the reason descriptors exist. It will first
execute for real on a consumer's repo at the first genuine config-shape change.

**Fix recommendation.** A fixture per operation, asserting content per P1-3. These are cheap: the
descriptor format is three lines and the harness already builds fixture repos.

### P1-5 - the B2.4 version-predicate fix has no regression test - `test/run-upgrade-path-tests.mjs`

**Council sources:** F57 (m17), F73 (c2). **Manifest IDs:** R2, R4, RI9.

**Problem.** Every test descriptor is named so its directory `from` equals the repo's recorded
version exactly - `1.0.1-to-1.1.0` against a repo stamped `1.0.1`, `0.9.0-to-1.1.0` against `0.9.0` -
so the old buggy predicate never fires in any fixture. Nothing constructs the case that exposed the
defect: a repo whose version sits strictly between a descriptor's `from` and `to`.

c2 proved this rather than asserting it. It copied the package to its sandbox, reverted the predicate
to its shipped-buggy form, and re-ran the suite: **51 passed, 0 failed**, identical PASS list. The
one defect this council caught in the upgrade logic can be reintroduced with the suite fully green.
Neither range boundary nor `compareVersions`'s numeric-segment ordering has any persisted test; the
1.9.0-versus-1.10.0 case was checked during Phase 6 with temporary descriptors that were deleted.

**Fix recommendation.** A fixture whose repo version sits strictly inside a descriptor's range, plus
both exclusion boundaries and a direct `compareVersions` case. c2's reverted-predicate run is the
acceptance test for the fixture: it must go red.

### P1-6 - a drifted pre-commit hook can never raise a reconcile item - `bin/agentsmyth.mjs`

**Council sources:** F42 (m14). **Manifest IDs:** RI9, RI19, RI20.

**Problem.** Three decisions in three functions have to agree and nothing keeps them in sync.
`applyUpgradeTo` returns `no-change` for any hook path because the hook is handled elsewhere.
`refreshEnforcementSurfaces` reports `gate-refreshed` whenever `installPreCommitHook` returns
non-null, which it does even in its true no-op branch. The `needReconcile` filter matches only
`delta-applied` and `re-rendered`, with a secondary clause that matches `.mdc`/`.md` paths a hook
path never has. So a hook whose marker span genuinely changed is refreshed, its backup is deleted as
a false no-op, and nothing tells the user their edit was overwritten.

This is reachable in this repository, which points `core.hooksPath` at `.githooks/` via
`npm run hooks:install` - the configuration that puts the hook in the governed set in the first
place. It is the third instance of the governance-versus-refreshability coupling that produced two
Build blockers already.

**Fix recommendation.** Make the action vocabulary a single declared set consumed by both the
producers and the reconcile filter, so adding an action string that nothing recognises is a
structural impossibility rather than a review catch. Short of that, add `gate-refreshed` to the
filter and a fixture that drifts the hook under `core.hooksPath`.

### P1-7 - single-quoted descriptor ops are silently dropped - `bin/agentsmyth.mjs`

**Council sources:** F44 (m14). **Manifest IDs:** R5.

**Problem.** `parseDescriptorChanges`'s field regex strips double quotes but not single quotes.
`op: 'rename-key'` - legal YAML, unconstrained by `src/workflow/schemas/migration.schema.yaml`, which
places no pattern on the string - parses as the literal `"'rename-key'"`. `applyChanges` dispatches
with plain `===` against three branches and has no default clause, so the change is dropped with no
error, no warning; the file compares equal to `before` and `applyUpgradeTo` reports `no-change` for a
file that needed a migration. Every fixture uses double quotes, so nothing catches it.

**Fix recommendation.** Two changes, both small. Reject an unrecognised `op` loudly instead of
falling through - a descriptor that names an operation the CLI does not implement is a hard error,
not a no-op. And constrain `op` in the schema to the three-value enum it already documents, so the
regex's quote handling stops being the only thing standing between a legal descriptor and silence.

### P1-8 - RI16's marker-stamp check is close to tautological - `src/workflow/validators/check-setup-complete.mjs`

**Council sources:** F25 (m11). **Manifest IDs:** RI16.

**Problem.** The new check compares `AGENTS.md`'s marker stamp against `repo-profile.yaml`'s
`agentsmyth_version` - but both are written by the same `init`/`upgrade` invocation, via
`writeDefinitionsRoot` and `placeAgentsMd`, and neither is the actually-installed CLI's version. In
normal operation the two cannot diverge, so the check fires only on hand-editing. m11 built a fixture
stamped `1.0.0` on both sides and got `AGENTS.md marker stamp: v1.0.0 (matches installed)`, exit 0 -
the literal string "matches installed" printed when nothing about the installed CLI was consulted.

OI-105 was filed for a repo whose stamps agree with each other but are stale relative to the
installed package. That repo still passes. The ledger item is recorded as fixed.

**Fix recommendation.** Read the installed package's version - the same source the skew warning
already uses - and compare the marker against it, keeping the repo-profile comparison as a second,
separate assertion. Then OI-105 can be closed against a check that can actually fail for its own
reason, and P1-14's blast-radius question is worth re-answering once the rule changes.

### P1-9 - RI5's taxonomy is missing the sixth state the code implements - `bin/agentsmyth.mjs`

**Council sources:** F26 (m11). **Manifest IDs:** R2, RI5.

**Problem.** RI5 enumerates five manifest states and says "never two." The shipped `classifyGoverned`
implements a sixth: `newly-governed`, for a file in the governed set with no manifest entry inside an
otherwise-valid manifest - the state a release that widens the governed set produces. It has distinct
handling, its own output label, no name in the requirement, and no fixture: an exact-string grep for
`newly-governed` in the test suite returns nothing. R2's acceptance, "each of the five states in RI5
produces its specified outcome, each covered by a fixture," is met only against an incomplete
description of what the manifest can be in.

This is not cosmetic. P1-2's silent misclassification lands in exactly this state, and it is the
state with no fixture.

**Fix recommendation.** Name the state in RI5, state its outcome, and fixture it - including the
widening case it exists for, which is the case the next release will produce.

### P1-10 - R5's "validates against its own schema" is unenforced - `src/assets/workflow/migrations/README.md`

**Council sources:** F22 (m11). **Manifest IDs:** R5, RI3.

**Problem.** `migration.schema.yaml` self-registers by `$id`, but nothing ever runs a descriptor
through it. `check-config.mjs` scans `workflow/config/` and never the migrations tree;
`check-lifecycle.mjs` does not look either; `parseDescriptorChanges` is a regex scraper that bypasses
schema validation by construction. A grep for `migration.schema` across every `.mjs` in the repo
returns nothing but the schema file itself. The only artefact asserting the validation exists is
README prose.

R5's acceptance clause is therefore satisfied by a document rather than by a check - and P1-7 is the
concrete defect that clause would have caught.

**Fix recommendation.** Validate every descriptor found under the migrations tree, either in a
validator that `agentsmyth check` invokes or at descriptor-load time in `loadMigrations`. Loading is
the better host: it fails where the descriptor is actually used, and it closes P1-7 in the same
change.

### P1-11 - RI14 has no mechanical enforcement - `src/setup/SKILL.md`

**Council sources:** F23 (m11), F75 (c2). **Manifest IDs:** RI14.

**Problem.** Nothing enforces that step 5f (`agentsmyth upgrade --baseline`) ran after setup filled
the configs. `check-setup-complete.mjs` never mentions provenance. `check-lifecycle.mjs` validates
the manifest's shape - presence, schema, path containment - and explicitly not its content, on the
stated reasoning that only `upgrade` can compare a digest to the file it describes. So a skipped or
failed 5f is invisible until the first real upgrade fires spurious reconcile items across all five
configs, which is RK2 shipping inverted for every fresh 1.1.0 consumer.

**Calibration.** c2 confirmed every citation and added the context that changes how this should be
read: the brief already accepted this as F113 - "RI14 holds only by prose" - as a known carried risk.
This finding does not surface something unknown. It is here because the acceptance was taken before
RI14 became the mitigation for RK2 and the "zero reconcile items" success metric, and was never
re-examined afterwards. The decision to carry it is the user's; re-raising it is this review's job.

**Fix recommendation.** Either enforce it - a check that compares recorded digests against current
content, which only needs the hashing function the CLI already has - or record an explicit waiver
naming RK2 as the accepted exposure. What should not survive to Ship is a load-bearing success
metric resting on a SKILL.md sentence with no gate and no waiver.

### P1-12 - CRLF checkouts permanently exclude the Cursor adapter - `bin/agentsmyth.mjs`

**Council sources:** F32 (m12). **Manifest IDs:** RI7, RI13, RI18.

**Problem.** `matchesAdapterRender` compares the on-disk adapter against a freshly-rendered template
with plain `===` and no newline normalisation - while the governed *config* path applies
`normalizeForHash` for exactly this reason, and `normalization: lf-single-trailing-newline` is
declared in the manifest because the repo ships no `.gitattributes`. On a CRLF working tree
`.cursor/rules/agentsmyth.mdc` never matches its LF render, so it is excluded from the manifest on
every baseline and every upgrade, reclassified `newly-governed` each time, and left untouched with no
reconcile item and no error. m12 ran four consecutive upgrades on a CRLF-normalised repo: the
manifest stayed at 5 of 6 governed files every time, while the CRLF config files correctly read
`pristine` - normalisation working on one path and not the other in the same run.

The consequence is that a future content change to the Cursor adapter can never reach a Windows
consumer through `upgrade`, silently and permanently. RI13's acceptance - same digest under
`core.autocrlf=true` and `false` - holds for configs and not for adapters.

**Fix recommendation.** Route the adapter comparison through `normalizeForHash`, the same function
the config path uses. One call site.

### P1-13 - RI21's polyrepo acceptance is unmet and the comment asserts the opposite - `bin/agentsmyth.mjs`

**Council sources:** F41 (m14). **Manifest IDs:** RI21.

**Problem.** `backupRoot`'s comment claims that resolving through git puts a backup somewhere
`git status` can see it "in all three modes." For `polyrepo-member` - the mode it names - `repoDir`
is `workspace_root`, which RK8 states lives outside every git repo. `resolveGitRoot` runs
`git rev-parse --show-toplevel` there, fails, returns null, and the `?? repoDir` fallback lands the
backup at precisely the untracked location the comment says the logic avoids. RI21's acceptance - a
backup written inside the member repo's working tree and visible to `git status` there - is not met,
and no test exercises the mode: a grep for `polyrepo` in the upgrade suite returns nothing.

**Fix recommendation.** Resolve the backup root through `resolveGitCwd()` and a target repo, which is
the mechanism RI21 actually specifies and which the artifact chain already uses for git-dependent
checks. Then correct the comment, and add the fixture whose absence let the comment and the code
disagree.

### P1-14 - the new hard-fail ships to every repo on the machine - `src/workflow/validators/check-setup-complete.mjs`

**Council sources:** F53 (m16). **Manifest IDs:** RI16.

**Problem.** The AGENTS.md marker-stamp rule is a hard fail, and it ships through the shared
`~/.agentsmyth/validators/` tree. `upgrade` refreshes that tree unconditionally, first, in any repo.
So the first time anyone runs `upgrade` anywhere on a machine, every other already-set-up repo on
that machine inherits a new hard-fail check on its next `agentsmyth check` - which the mandatory
pre-commit hook runs on every commit. Those repos never opted in and never ran anything.

m16 was careful about the common case: `placeAgentsMd` and `writeDefinitionsRoot` write both stamps
together at `init`, so old repos' stamps should already agree. Nothing in this change verifies that
held across every 1.0.x install, and the release checklist's rehearsal covers one freshly-bootstrapped
repo, never the multi-repo blast radius a new hard-fail creates.

**Fix recommendation.** Ship the rule as a warning for one release and promote it after, or scope the
hard fail to repos whose `agentsmyth_version` is at or above the release that introduced it. Either
way the rehearsal step needs a second repo that never ran `upgrade`. Note the interaction with P1-8:
the rule this concerns cannot currently fail for its intended reason, so fixing P1-8 widens this
blast radius rather than narrowing it. Sequence them together.

### P1-15 - the council integrity bracket covers one round of two - `workflow/artifacts/briefs/wp-r18-delta-upgrades-v1.md`

**Council sources:** F9 (m2), F76 (c2). **Manifest IDs:** none - chain-level.

**Problem.** The brief's machine-read `council.repo_integrity` pair brackets round 2 only, over a
2149-file tree. The `### Repo Integrity` section three hundred lines below documents a different,
mismatched pair over a 2124-file tree and states in plain text that the digests do not match. Nothing
says the recorded pair covers one round of two. `check-council-record` reads only the frontmatter
field, so it reports `ok` for a run whose five-member research round - three of them with sandbox and
command execution, producing F1 through F78 - has no matching bracket at all. The brief's own
instruction to re-take the bracket correctly rather than adjust the recorded values was satisfied for
round 2 and left unsatisfied for round 1. This is mine, not the implementation's.

**Calibration.** c2 ran the validator read-only, confirmed `ok`, and found the finding *understated*:
a third contradictory record exists that m2 did not cite. The brief's Exit Gate checkbox is still
unchecked, asserting that `check-council-record` does NOT pass. The same document therefore carries
three mutually contradictory statements about one check - frontmatter says match, prose says
mismatch, exit gate says fail - with nothing reconciling them. c2's wider scope is adopted.

**Fix recommendation.** State in the brief which round the recorded pair brackets and that round 1's
bracket was taken wrongly and is documented rather than repaired, then reconcile the Exit Gate
checkbox with the frontmatter. Do not adjust the recorded digests. The honest record is that one
round of two is bracketed; a validator that cannot see the difference is a separate finding for
Reflect, not a reason to write a pair that reads as complete.

### P1-16 - `resolved_by: merged-from-backup` is not downgrade-safe - `src/workflow/schemas/pending-setup.schema.yaml`

**Council sources:** F47 (m15). **Manifest IDs:** RI1, RI11.

**Problem.** A `pending-setup.yaml` written after this change - exactly the shape `raiseReconcileItems`
and `src/workflow/router.md`'s step 9 produce - is rejected by the pre-1.1.0 schema. m15 ran the
repo's own `parseYaml` and `validateSchema` against both: zero errors under the current schema,
exactly one under the old - the `resolved_by` enum. RI1 claims additive-only compliance, and the
brief's evidence for it (F35) cites `check-pending-setup.mjs`, which never checks that enum at all.
The claim is wrong about the file it names.

Practical severity is capped: `check-config.mjs` is the only validator enforcing this schema and it is
never invoked from a consumer's `agentsmyth check`. But the schema is the project's stated contract
surface, and the compliance claim is what is false.

**Fix recommendation.** Either correct RI1's scope to exclude enum widening and say why that is safe
here, or re-cite the evidence against a validator that actually reads `resolved_by`. The code needs no
change; the claim does.

### P1-17 - the containment check is not on the code path that writes - `src/workflow/validators/check-lifecycle.mjs`

**Council sources:** F37 (m13). **Manifest IDs:** R6, RI12.

**Problem.** The path-containment check added in this change lives in `check-lifecycle.mjs`, which
fires only under `agentsmyth check`. The `upgrade` command block never invokes it - m13 swept the
whole block and found zero references. And when it does run it validates `entries[].path` only, never
`written_by_version`, so it would not have caught P0-1 even if it were wired in. The safety net the
design points to does not sit on the path that performs the writes.

**Fix recommendation.** Validate the manifest at read time inside `readProvenance`, which every write
path goes through, and keep the `check-lifecycle` copy as the reporting surface. That places the
guarantee where the writes are rather than where the reports are.

### P2 findings

Real, owned, and not ship-blocking on their own. Grouped rather than written out, because each is a
single clear defect with a single clear fix.

- **P2-1** - `bin/agentsmyth.mjs`, worktree false negative. F31 (m12). RI7, R1. In a linked git
  worktree `.git` is a file, hook-dir creation throws `ENOTDIR`, the error is caught and the hook
  install is skipped - and `placeAgentsMd` then writes that the gate is not installed. That is false:
  the hook is live through the shared common dir and does enforce commits there. m12 confirmed
  `git rev-parse --git-path hooks` resolves correctly from the same worktree. **Fix:** resolve the
  hooks directory with `git rev-parse --git-path hooks` rather than by assuming `.git` is a directory.
- **P2-2** - `site/updating.md`, day-one skew survives the first upgrade. F33 (m12). R3. On the
  no-manifest path - the state of the entire currently-published installed base - the first `upgrade`
  adopts a baseline and returns without refreshing the version stamp, the AGENTS.md marker, or the
  hook, so `agentsmyth check` keeps printing the skew warning that names `upgrade` as the cure. A
  second run converges. **Fix:** refresh the enforcement surfaces on the adopt path too.
- **P2-3** - `bin/agentsmyth.mjs`, one-time `next_id` collision. F29 (m12). RI9, RI20. For any
  pre-1.1.0 `pending-setup.yaml` that ever had an item resolved and pruned, the first post-upgrade
  allocation computes from `max(present ids) + 1` and re-issues an id that belonged to a different,
  resolved item. Self-healing after one write, but it breaks the never-reused identity guarantee once
  per repo. m12 reproduced it. **Fix:** seed `next_id` from the manifest-recorded high-water mark when
  the field is first introduced, or accept it in writing.
- **P2-4** - `bin/agentsmyth.mjs`, no dry run and no dirty-tree check. F54 (m16). R4. `upgrade` has no
  preview mode and does not look at `git status` before writing. Backups cover `drifted` files only by
  design, so a `pristine` file - the majority case - has no safety net if the regex descriptor patcher
  mis-applies. Rollback depends entirely on the consumer having committed first, which agentsmyth
  never checks or mentions. **Fix:** a `--dry-run` flag and a warning on a dirty tree.
- **P2-5** - `docs/release-checklist.md`, neither gate exercises the sequence that triggers P0-6.
  F52 (m16). RI20. The manual rehearsal covers one drift cycle plus an idempotent re-run; the I1-I4
  block gets closest but asserts id and count invariants, never that the first cycle's `backup_path`
  still resolves. Both gates report green on the defect. **Fix:** assert `backup_path` resolves for
  every open item, in the suite and in the checklist.
- **P2-6** - `workflow/artifacts/plans/wp-r18-delta-upgrades-v1.md`, RI18's restatement never reached
  the plan. F16 (m2). RI18. The acceptance was rewritten to six/seven/eight by platform, and the
  restatement landed in the brief and one exit gate only. The plan's Summary still says eight, Phase
  2's Work bullet still says eight, and the **Verification Plan row still reads "expected: 8 entries"**
  three lines from an exit gate saying six. A Verify pass executing that row would assert a count the
  brief has already declared wrong. **Fix:** propagate the restatement into all three plan sites.
- **P2-7** - `workflow/artifacts/tasks/wp-r18-delta-upgrades-v1.md`, Active Phase is Phase 11 by title
  only. F14 (m2). RI1, RI15, RI17. Its Manifest IDs and its entire exit-gate paragraph are Phase 10's;
  Scope still reads "In scope (Phase 10)". Phase 11's real exit gate is asserted nowhere. **Fix:**
  rewrite the block for the phase it names.
- **P2-8** - `workflow/artifacts/tasks/wp-r18-delta-upgrades-v1.md`, the evidence surface is stale.
  F15 (m2), F61 (m17, merged into F15), F62 (m17), F77 (c2). R2, R3, R4, RI3. Blocker state is recorded
  in two mutually exclusive versions: three locations still say `mutation:audit` was not run and
  blocked and `validate-template` failed, while Blockers declares both resolved. The Command Results
  table - the surface Review consumes - has no row for the passing `mutation:audit` or the
  post-remediation `validate-template`, and its `upgrade-path:test` row says 36 assertions where m17's
  live run returned 51. Phase 11, the phase that fixed both release blockers, has no row in the Phase
  Completion Log while Phases 1 through 10 each do. **Fix:** re-take the Command Results table from live
  runs and add the Phase 11 row.
- **P2-9** - `workflow/artifacts/briefs/wp-r18-delta-upgrades-v1.md`, three self-contradictions.
  F10, F11, F12 (m2). The frontmatter says `ready-for-next-phase` with an unchecked exit-gate box
  asserting a validator does not pass when it does (F10); the prose states "No second round was run"
  directly beneath a round-2 row with `rounds_run: 2` (F11); and `termination_reason:
  user-decision-required` stands with surviving items I8 through I12 that the same artifact records as
  resolved by the user, while round 2's Open in is 2 rather than the 5 round 1 left open (F12). **Fix:**
  re-close the brief against its own round-2 state.
- **P2-10** - `workflow/artifacts/briefs/wp-r18-delta-upgrades-v1.md`, a verification pass logged as a
  Think round. F13 (m2). `lifecycle-think/SKILL.md` states plainly: do not claim verification in Think.
  Round 2's charter is checking whether the shipped implementation satisfies the brief, and its findings
  are trials against built code. Meanwhile the Build task's Dispatch Log reads `none` for a window in
  which three members ran. **Fix:** record the pass as what it was - a post-Build verification round -
  and populate the Dispatch Log. This one is a process finding for Reflect as much as a state fix.
- **P2-11** - `workflow/artifacts/plans/wp-r18-delta-upgrades-v1.md`, Phase 11 has no coverage rows.
  F17 (m2). R4, R5, RI4, RI15, RI16, RI18, RI19. Phase 11 was appended after Build closed and re-owns
  seven IDs, none of which appear in Requirement Coverage - while the Exit Gate still claims all 27 map
  to exactly one owning phase, "verified by `requirement-phase-mapper`'s bijection rule."
  `check-phase-map.mjs` has no bijection rule and says so in its own comment. The Checkpoint Approval
  quote scopes the user's approval to "the ten-phase breakdown"; the artifact holds eleven and the
  approval was never re-taken. **Fix:** add the P11 rows, correct the exit-gate claim to what the
  validator actually checks, and annotate the approval's scope.
- **P2-12** - `workflow/artifacts/tasks/wp-r18-delta-upgrades-v1.md`, architecture notes never revisited.
  F18 (m2). The chain's two largest structural decisions - separating governance from refreshability via
  `refreshEnforcementSurfaces`, and gating adapter governance on authorship rather than existence -
  appear only inside the Blockers narrative, which a reader skips once the blockers read RESOLVED. They
  are exactly the decisions a future maintainer must not re-break. **Fix:** promote both into
  Architecture Notes.
- **P2-13** - `docs/knowledge-map/repo-mental-map.md`, `CLAUDE.md`, `README.md` - the repo's own sources
  do not know the command exists. F4, F5 (m1). RI15. `repo-mental-map.md` is priority 4 in `AGENTS.md`'s
  source order, above the repository code, and still enumerates the CLI as two install commands with
  zero occurrences of `upgrade`; its version-skew section still says skew has no remedy beyond
  `prepare`. `CLAUDE.md` says the same in so many words. `README.md` - the npm package page, shipped
  unconditionally - never mentions `upgrade` and omits `workflow/provenance.yaml` from its "what init
  does" list, which is the file `site/updating.md` tells consumers they must commit. **Fix:** this
  chain's doc pass, extended to all three.
- **P2-14** - `site/troubleshooting.md` and three sibling pages contradict the page the doc commit
  rewrote. F6 (m1). RI15. The commit titled "correct every shipped surface that named init as the
  upgrade action" touched three files. `site/troubleshooting.md` still says version skew means running
  `prepare`, while the new `site/updating.md` says `prepare` does not clear it and `upgrade` does -
  opposite advice in one published site, with troubleshooting linking to updating. `site/install.md`,
  `site/under-hood.md`, and `site/uninstall.md` all enumerate the per-repo footprint without
  `workflow/provenance.yaml` or `workflow/backups/`, and uninstall asserts that is the entire footprint.
  **Fix:** finish the pass the commit message claimed.
- **P2-15** - `workflow/artifacts/plans/wp-r18-delta-upgrades-v1.md`, the Notion handoff is statused out
  of its own obligation. F1, F2, F3 (m1). The Source-of-Truth Strategy declares `not required` - the one
  value in `source-of-truth.yaml`'s `status_values` carrying no obligation to produce the eight-field
  copy-ready handoff - and the next paragraph describes exactly the blocked condition those fields exist
  for. What survives as the handoff is risk row RK9, carrying three of eight required fields and no
  copy-ready text: no provider or source type, no page ID or URL, no section named, nothing pasteable,
  and `-` for affected manifest IDs. It names one page where the prose claims two and the brief cites
  three - the research spike, which the brief calls this chain's direct upstream, is never mentioned
  again. **Fix:** re-status to `blocked` and write the eight fields, at Ship.
- **P2-16** - `bin/agentsmyth.mjs`, `--baseline` has no durable documentation. F50 (m15). `agentsmyth
  help` lists no flags; `site/updating.md` documents the classification in detail and never mentions the
  flag. Its only documentation is `src/setup/SKILL.md`, which is copied into `.agentsmyth/` and deleted
  when setup completes. A user who later needs to re-baseline deliberately has nothing to read. **Fix:**
  one line in help and one paragraph in `site/updating.md`.
- **P2-17** - `src/adapters/claude/global-gate.md` and two siblings omit the new per-repo surface.
  F49 (m15). This change adds `workflow/provenance.yaml` and `workflow/backups/` to every set-up repo,
  and three of five adapters' global-gate files still enumerate per-repo data as the three pre-existing
  directories. None were touched in the 38-file diff. m15 confirmed the gap is live rather than
  source-only: `~/.claude/CLAUDE.md` on this machine carries the identical stale line, installed by a
  prior `prepare`. `CLAUDE.md` rule 3 requires the five adapters stay in sync. **Fix:** update all five
  and rebuild.
- **P2-18** - `test/run-mutation-audit.mjs`, the ratchet cannot reach the code this change added.
  F59 (m17), F74 (c2). RI3. "0/232 rules undefended" establishes that every `errors.push(` statement
  under `src/workflow/validators/` is depended on by one of the 12 listed suites.
  `run-upgrade-path-tests.mjs` is not in that list, and `bin/agentsmyth.mjs` - where the entire upgrade
  command lives - is not a mutation target at all. The number says nothing about this feature's logic,
  nothing about conditional or boundary mutants, and nothing about the schema files' own constraints.
  `mutation:audit` is also absent from `.github/workflows/ci.yml`. **Calibration:** c2 blunted the
  misleading-metric half - the task artifact's own prose already scopes "0/232" to blocker B1 rather
  than to the upgrade fixes, so the artifact does not itself conflate them, though a reader citing the
  number alone would be wrong. The scoping facts all check out. **Fix:** state the scope wherever the
  number is cited, and decide separately whether `bin/` belongs in the ratchet.
- **P2-19** - `test/run-upgrade-path-tests.mjs`, E2 covers one of two adapter types. F58 (m17). RI9.
  The existence-versus-authorship fix generalises correctly across one function and two governed
  markerless adapter types, but E2 exercises only the copilot path. The Cursor `.mdc` branch of
  `adapterSourceFor` - a different template and a different path - has no coverage of the defect class
  it was written for, so a bug specific to that render-and-compare path would pass the suite silently.
  This is where P1-12 lives. **Fix:** an E2 sibling for `.mdc`.
- **P2-20** - `test/run-upgrade-path-tests.mjs`, RI18's eight-entry branch has no fixture. F24 (m11).
  RI18. The restated six/seven/eight acceptance is an honest correction and the conditional logic
  genuinely supports all three counts, but the eight branch - a non-darwin platform with a tracked hook
  and the Copilot adapter present - is asserted by code reading alone. The suite's pattern everywhere
  else is one fixture per branch. **Fix:** a fixture that forces the platform predicate, or an explicit
  record that the branch is unexercised on the development platform. It survives this council open;
  see Termination.
- **P2-21** - `test/run-root-resolution-drift-tests.mjs` was not extended to the copy this change added.
  F45 (m14). `resolveGitRoot` is documented in its own comment as a fourth hand-synced copy of git-root
  resolution logic. The harness built specifically to catch the first three diverging spawns exactly
  three and does not know about the fourth. The one mechanism that would catch "someone changed one
  half" does not cover the newest half. **Fix:** add it to the harness.
- **P2-22** - `test/run-violation-tests.mjs`, the new fixtures are outside the attribution sweep.
  F60 (m17). RI3. m17 inspected pv1 through pv4 and found them well built - each pins a message a
  plausible neutering of its own code path would not reproduce, verified in both directions. But the
  single-error-per-fixture sweep is filtered to `check-council-record` and `check-finding-quality`, so a
  pv fixture that began rejecting for two reasons would not be caught the way a council fixture is. No
  live double-rejection found. **Fix:** widen the filter, or record the narrowing.
- **P2-23** - `bin/agentsmyth.mjs`, overwrite-then-reconcile against `[safety-2]`. F38 (m13). `upgrade`
  rewrites every drifted governed file after backing it up, with no interactive confirmation; the only
  approval is a reconcile item an agent may offer to resolve in a later session.
  `workflow/config/domain.yaml`'s `[safety-2]` requires explicit approval before destructive actions.
  The code's comments state the no-prompt design deliberately, citing non-TTY failure and the
  zero-dependency constraint. This is a live policy question the change answers implicitly. **Fix:**
  answer it explicitly - either a waiver naming `[safety-2]`, or a confirmation on a TTY with the
  current behaviour as the non-TTY fallback.
- **P2-24** - `bin/agentsmyth.mjs`, the hook is written into a declared protected path. F39 (m13). Both
  `init` and `upgrade` write `.git/hooks/pre-commit` by default, which `workflow/config/repo-profile.yaml`
  declares off-limits as repository metadata. The carve-out is hardcoded inside `governedArtifacts` via
  `isInsideGitDir` and never consults the protected-paths config at write time. An agent trusting
  `paths.protected` as a description of what the CLI will touch would be wrong. **Fix:** reconcile the
  declaration with the behaviour in one place - either an explicit exception in the config or a
  write-time consult.
- **P2-25** - `bin/agentsmyth.mjs`, poisoned paths reach agent-facing text unescaped. F40 (m13).
  `pendingItemsFrom` escapes only `"` in `question` and `hint`, and applies no escaping at all to
  `backup_path`, `migration_id`, `upgrade_from`, or `upgrade_to`, which are interpolated as raw
  unquoted YAML scalars. Under P0-1's poisoned `written_by_version` the traversal-laden path is echoed
  into instruction text an agent later reads and acts on. **Fix:** escape all interpolated fields;
  P0-1's validation removes the interesting input but not the class.

### P3 findings

- **P3-1** - `bin/agentsmyth.mjs`. F43 (m14). `applyUpgradeTo` reimplements `isDeterministicAdapter`'s
  condition inline instead of calling the helper, which is called correctly at two other sites. A third
  adapter type added to the helper would not be recognised by the upgrade-strategy dispatch. **Fix:**
  call the helper.
- **P3-2** - `bin/agentsmyth.mjs`. F46 (m14). The file has a proven fix for its TDZ hazard - convert the
  risky value into a hoisted function, done three times - but for the larger set of consts the fix chosen
  was positional: physically moving the upgrade block below them. Nothing stops a future reorganisation
  from moving it back, which the file's own comment says has already happened twice. There is no lint
  config and no lint script in the repo. **Fix:** convert the remaining consts, or add the guard.
- **P3-3** - `test/fixtures/definitions/pv-provenance-bad-shape/schemas/provenance.schema.yaml` and three
  siblings. F63 (m18). The four new fixtures mirror `agent-behavior.yaml` and
  `artifact-frontmatter.schema.yaml` byte for byte but carry a stale `provenance.schema.yaml` whose
  `entries` description still gives the pre-Phase-11 account of hook and AGENTS.md exclusion. m18
  confirmed by `cmp` that no test assertion reads that text, so no outcome depends on it. **Fix:**
  re-snapshot the four fixtures.
- **P3-4** - `workflow/artifacts/tasks/wp-r18-delta-upgrades-v1.md`. F19 (m2). The handoff row records
  14 modified and 10 added; the branch carries 15 and 23. The same row asserts `check-scope-fence`
  passes, which cannot corroborate it - that validator reads the task's own Changed Files section and
  never consults git. File-level coverage does hold. **Fix:** re-take the counts.
- **P3-5** - `workflow/artifacts/plans/wp-r18-delta-upgrades-v1.md`. F20 (m2). Residual ten-phase
  wording in the Summary, the Dependency Order chain, and Architecture Notes; and the task's Plan Phases
  Overview table is malformed - Phase 10's row is missing its Manifest IDs cell and Phase 11's carries
  four cells in a three-column table, the stray cell being Phase 10's ID list left behind by the retitle
  in P2-7. **Fix:** repair both.
- **P3-6** - `workflow/artifacts/tasks/wp-r18-delta-upgrades-v1.md`. F21 (m2). All three artifacts landed
  in one commit at the head of the branch, before every implementation commit, so the chain has no
  revision history: the Phase 1/2 gate swap, the RI18 restatement, the round-2 council log, and the
  addition of Phase 11 are indistinguishable from original text. m2 records this as following the user's
  own commit-deferral instruction rather than unauthorised, and I agree - the consequence is the finding,
  not the act. **Fix:** nothing here; a note for Reflect about what commit deferral costs.
- **P3-7** - `workflow/artifacts/open-items.yaml`. F7 (m1). RI16. OI-105 reads `status: open` with an
  imperative next action while its fix has shipped in this change, and the task artifact already asserts
  in past tense that the ledger item is closed. Rotation is a Reflect duty, so open at Review is
  on-process - but the plan's downstream handoff lists three things for Reflect to add and nothing to
  close. **Fix:** hand the closure forward. Note P1-8 first: the fix as shipped does not do what OI-105
  asked, so the closure should follow the P1-8 remediation rather than precede it.
- **P3-8** - `docs/overview.md`. F8 (m1). Still documents the workflow tree with the dotted path shape
  the repo abandoned. Pre-existing, not introduced by this change, and `CLAUDE.md` scopes `docs/` to
  living orientation. **Fix:** a separate follow-up; raised here for the ledger.

## Severity Summary

`Found` is what this review caught. `Open` is what is still outstanding after the remediation
recorded below — the count `check-release-readiness.mjs` reads. The two columns differ on purpose:
remediating a finding must not make the review look like it found nothing.

| Severity | Open | Found | IDs | Status |
|---|---|---|---|---|
| P0 | 0 | 6 | P0-1, P0-2, P0-3, P0-4, P0-5, P0-6 | all remediated in Build Phase 12; each pinned by a test that fails when that fix alone is reverted |
| P1 | 0 | 17 | P1-1 through P1-17 | all remediated in Build Phase 12 |
| P2 | 4 | 25 | open: P2-15, P2-20. remediated: the other 23 | P2-15 is Ship's (the Notion handoff, three council findings); P2-20 needs a platform no member had |
| P3 | 1 | 8 | open: P3-7. remediated: the other 7 | P3-7 is Reflect's, and must follow P1-8 rather than precede it |

## Remediation (Build Phase 12, 2026-09-24)

The chain returned to Build on this review's `hold`. The user's direction was to fix every severity,
not only the blockers. What follows is what actually happened, including what did not.

**Evidence discipline, first, because it is what the review's sharpest finding was about.** P1-5
existed because a challenger proved the 51-assertion suite stayed fully green when the one
upgrade-logic defect this chain had already caught was reverted. Fixing that finding by adding a
test would have been worth nothing unless the test could fail. So every P0 and P1 code fix was
verified by reverting **that fix alone** in a throwaway package copy and confirming a named
assertion turns red. Nine of nine do:

| Fix | Assertion that fails when it is reverted |
|---|---|
| P0-1 `written_by_version` validation | X1-refuses, X1-explains |
| P0-2 write-side containment | X2-victim-intact, X2-surfaced |
| P0-3 read-side containment | X3-refused |
| P0-4 `init` re-baseline guard | X4-manifest-untouched, X4-says-so, X4-drift-survives |
| P0-5 backup-sweep version grammar | X5-consumer-file-survives |
| P0-6 open-item backup protection | X6-backup-survives |
| P1-1 `--baseline` manifest guard | Y2-refuses, Y2-not-downgraded |
| P1-7 unrecognised descriptor op | W6-refuses, W6-names-the-op |
| P1-12 adapter newline normalisation | Y4-governed-under-crlf, Y4-not-newly-governed |

And the original: reverting the version predicate to its shipped-buggy form now fails
`W4-descriptor-applied`. That is the acceptance test for P1-5, and it is the one measurement in this
whole remediation I would not have believed without running it.

Two of these tests were **wrong when first written** and passed for the wrong reason. X2 never
reached a write, because with no descriptor in play the upgrade reports `no-change` and never
rewrites the file — so it passed whether the fence existed or not. X3 asserted "no backup directory
contains the secret", which is vacuously true when the refusal means no backup directory is created
at all. Both were found by the revert probe rather than by inspection, which is the argument for the
probe. The two fences also masked each other: either one alone keeps the victim intact, so each test
had to be built so only its own fence is in play.

**The suite grew 51 → 107.** The additions are not spread evenly, deliberately: W1 reads a merged
config back and asserts the descriptor's key, value, placement and non-duplication (the suite's
central claimed capability previously had zero content verification); W2/W3 exercise `rename-key`
and `set-machine-owned`, which had no test of any kind; W4/W5 pin the version predicate and both its
exclusion boundaries; X1–X6 are one per P0; Y1–Y6 cover the reordered manifest entry, the
`--baseline` guard, hook reconciliation, CRLF adapters, `--dry-run`, and the `.mdc` authorship
branch that E2 had left uncovered.

**Three couplings were fixed as couplings, not as instances**, because the review's own finding was
that each had already recurred. The action vocabulary is now one declared set (`REWRITE_ACTIONS`)
read by both the refresh producers and the reconcile filter. The manifest reader's
self-consistency guard no longer shares the reader's own ordering assumption, so the two counts can
actually disagree. And authorship-versus-existence is now stated as a principle in the task's
Architecture Notes rather than living twice in a Blockers narrative.

**Two fixes changed severity rather than behaviour, and both are judgement calls worth naming.**
P1-8 made the `AGENTS.md` marker check read the genuinely-installed version — and shipped that
comparison as a **warning**, not an error, because P1-14 showed the rule reaches every repo on a
machine through the shared validator tree that `upgrade` refreshes unconditionally. Being behind is
a true and ordinary state. P1-16 did not change code at all: RI1's "additive only" claim was simply
wrong about one enum, and the fix was to correct the claim and record the narrower, true reason the
widening is safe.

**Found while fixing, not by the council.** The scoped package name meant the new installed-version
read matched nothing and silently returned null on the real package — a check that cannot fail, one
level below the check that could not fail. Caught by writing the test before trusting the code.

**Two policy questions were answered rather than left implicit**, which is what P2-23 and P2-24
actually asked for. `[safety-2]` requires explicit approval before a destructive action, and
`upgrade` rewrites files: the answer is that the approval IS the user invoking the command, that
`--dry-run` now lets them see the scope before granting it, and that the router explicitly forbids
an agent running `upgrade` unprompted — the CLI never prompts by design, so asking is the agent's
job, not its. The `.git/**` protected-path declaration now states its one CLI exception in the
shipped template itself: the gate has to sit where git looks, and the protection that matters still
holds, because a hook under `.git/` is never hashed into the manifest or copied into the committed
backup tree. Both were tensions between a declaration and a behaviour with nothing reconciling them;
both now have the reconciliation written where the declaration lives.

### What was deliberately not done

- **P2-15 — the Notion handoff.** Ship owns it by this review's own routing. The plan must be
  re-statused from `not required` to `blocked` and carry the eight required fields. Doing it here
  would be out of phase. Three council findings (F1, F2, F3) stay `pending` in the ledger.
- **P2-20 — RI18's eight-entry branch.** Needs a non-darwin platform. No council member had one and
  neither does this remediation; what changed is that the plan's Verification Plan no longer asserts
  a fixed count of 8 against it. It remains the council's surviving item.
- **P3-7 — the OI-105 ledger closure.** Reflect owns rotation, and this one must follow P1-8 rather
  than precede it: the fix as originally shipped did not do what OI-105 asked, so closing the item
  against it would have recorded a repair that had not happened.
- **P3-6 — one-commit artifact history.** There is no fix; it follows the user's own commit-deferral
  instruction. Recorded for Reflect as a note on what deferral costs an artifact chain.
- **Refreshing this machine's global gate files.** P2-17 updated the three adapter sources and the
  build output. Propagating them to `~/.claude/CLAUDE.md` and its siblings needs `agentsmyth
  prepare`, which writes outside the repository. That is the user's call, not this phase's.

### Ledger note

72 of 77 council findings closed `proved-real` and rotated to
`workflow/artifacts/finding-quality-archive.yaml`; 5 stay pending with their owning phase named
inline. `closed_in_phase: review` is the closest true value for the 72, not an exact one — the fixes
landed in Build Phase 12, and the enum has no member for a return to Build. Recorded in both ledger
files rather than papered over, and filed for Reflect alongside the `cap_source` gap in Residual
Risk.

## Council Log

### Requirement Classification

| Manifest ID | Question bucket | Evidence classes |
|---|---|---|
| R1 | does the manifest exist and match disk after init | repo, trial |
| R2 | does classification cover the real state machine | repo, trial |
| R3 | is a user edit preserved byte-for-byte before overwrite | repo, trial |
| R4 | is there exactly one reconcile item per drifted file per upgrade | repo, trial |
| R5 | do descriptors validate and resolve for a version pair | repo, trial |
| R6 | does a consumer-invoked validator check the manifest | repo, trial |
| RI1 | is every schema change additive and downgrade-safe | repo, trial |
| RI2 | did the change add any runtime dependency | repo |
| RI3 | does every new validator error carry its own fixture | repo, trial |
| RI4 | is the write atomic and crash-safe | repo, trial |
| RI5 | are all manifest states named and fixtured | repo, trial |
| RI6 | does upgrade refresh the global tree before reading a schema | repo, trial |
| RI7 | do backups avoid every recursive validator sweep | repo, trial |
| RI8 | are governed files named rather than swept | repo, trial |
| RI9 | does the idempotency marker survive a prune | repo, trial |
| RI10 | can a reconcile item name the config it targets | repo, trial |
| RI11 | does the router describe reconcile resolution | repo |
| RI12 | is the manifest check hosted where it actually runs | repo, trial |
| RI13 | is normalization declared and applied before hashing | repo, trial |
| RI14 | is the post-setup baseline step enforced | repo |
| RI15 | is every shipped surface naming init corrected | repo, trial |
| RI16 | can the AGENTS.md marker check fail for its own reason | repo, trial |
| RI17 | are generated output and adapters current | repo, trial |
| RI18 | does every governed artifact on this platform have an entry | repo, trial |
| RI19 | does content outside a marker block survive an upgrade | repo |
| RI20 | is exactly one backup retained and deleted at the right time | repo, trial |
| RI21 | does a polyrepo-member backup land inside a git working tree | repo, trial |

### Risk Category Assignment

| Member | Round | Risk categories | Rationale |
|---|---|---|---|
| m1 | 1 | source-of-truth | The change adds a command, a manifest file, and a backup tree; four internal sources and three external Notion pages describe the world before it |
| m2 | 1 | lifecycle | An eleven-phase chain whose eleventh phase was appended after Build closed, and a council record with a re-taken integrity bracket |
| m3 | 1 | requirement | 27 acceptance criteria, six of them restated mid-chain |
| m4 | 1 | compatibility | The first command that writes over a consumer's own edits, across three repository modes and two line-ending regimes |
| m5 | 1 | security | Untrusted manifest content drives file writes and a committed backup tree |
| m6 | 1 | maintainability | 1096 new lines in a 2500-line file, with a hand-rolled parser and a fourth copy of git-root logic |
| m7 | 1 | contract | Two new schemas, one widened enum, and an additive-only claim |
| m8 | 1 | release | 1.1.0 is unreleased and this is the last work package in it |
| m9 | 1 | verification | A 51-assertion suite and a mutation ratchet, both new to this feature |
| m10 | 1 | generated-output | dist bundles, root validators, the dev schema sync, and four new fixture trees |
| m11 | 2 | requirement | Round-1 member lost to a provider session limit; category re-dispatched unchanged |
| m12 | 2 | compatibility | Round-1 member lost to a provider session limit; category re-dispatched unchanged |
| m13 | 2 | security | Round-1 member lost to a provider session limit; category re-dispatched unchanged |
| m14 | 2 | maintainability | Round-1 member lost to a provider session limit; category re-dispatched unchanged |
| m15 | 2 | contract | Round-1 member lost to a provider session limit; category re-dispatched unchanged |
| m16 | 2 | release | Round-1 member lost to a provider session limit; category re-dispatched unchanged |
| m17 | 2 | verification | Round-1 member lost to a provider session limit; category re-dispatched unchanged |
| m18 | 2 | generated-output | Round-1 member lost to a provider session limit; category re-dispatched unchanged |

### Members

| Member | Role | Round | Capabilities | Input | Status | Sandbox |
|---|---|---|---|---|---|---|
| m1 | reviewer | 1 | read, fetch, search, execute | diff+manifest | ran | ~/.agentsmyth/sandbox/agentsmyth/review/sot |
| m2 | reviewer | 1 | read, fetch, search, execute | diff+manifest | ran | ~/.agentsmyth/sandbox/agentsmyth/review/life |
| m3 | reviewer | 1 | read, fetch, search, execute | diff+manifest | failed | |
| m4 | reviewer | 1 | read, fetch, search, execute | diff+manifest | failed | |
| m5 | reviewer | 1 | read, fetch, search, execute | diff+manifest | failed | |
| m6 | reviewer | 1 | read, fetch, search, execute | diff+manifest | failed | |
| m7 | reviewer | 1 | read, fetch, search, execute | diff+manifest | failed | |
| m8 | reviewer | 1 | read, fetch, search, execute | diff+manifest | failed | |
| m9 | reviewer | 1 | read, fetch, search, execute | diff+manifest | failed | |
| m10 | reviewer | 1 | read, fetch, search, execute | diff+manifest | failed | |
| m11 | reviewer | 2 | read, fetch, search, execute | diff+manifest | ran | ~/.agentsmyth/sandbox/agentsmyth/review/req |
| m12 | reviewer | 2 | read, fetch, search, execute | diff+manifest | ran | ~/.agentsmyth/sandbox/agentsmyth/review/compat |
| m13 | reviewer | 2 | read, fetch, search, execute | diff+manifest | ran | ~/.agentsmyth/sandbox/agentsmyth/review/sec |
| m14 | reviewer | 2 | read, fetch, search, execute | diff+manifest | ran | ~/.agentsmyth/sandbox/agentsmyth/review/maint |
| m15 | reviewer | 2 | read, fetch, search, execute | diff+manifest | ran | ~/.agentsmyth/sandbox/agentsmyth/review/con |
| m16 | reviewer | 2 | read, fetch, search, execute | diff+manifest | ran | ~/.agentsmyth/sandbox/agentsmyth/review/rel |
| m17 | reviewer | 2 | read, fetch, search, execute | diff+manifest | ran | ~/.agentsmyth/sandbox/agentsmyth/review/verif |
| m18 | reviewer | 2 | read, fetch, search, execute | diff+manifest | ran | ~/.agentsmyth/sandbox/agentsmyth/review/gen |
| c1 | challenger | 3 | read, fetch, search, execute | diff+manifest | ran | ~/.agentsmyth/sandbox/agentsmyth/review/chal-code |
| c2 | challenger | 3 | read, fetch, search, execute | diff+manifest | ran | ~/.agentsmyth/sandbox/agentsmyth/review/chal-evid |

### Rounds

| Round | Reviewers | Challengers | Open in | Open out | Items closed | Sizing rationale |
|---|---|---|---|---|---|---|
| 1 | 10 | 0 | 27 | 26 | RI15 | Ten risk categories partitioned one-to-one across ten reviewers, the fan-out the user raised the cap for; eight members died on a provider session limit before producing anything |
| 2 | 8 | 0 | 26 | 1 | R1, R2, R3, R4, R5, R6, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9, RI10, RI11, RI12, RI13, RI14, RI16, RI17, RI19, RI20, RI21 | Exactly the eight categories round 1 lost, re-dispatched on a different model so no category went unread; no category was reassigned, so the round is a recovery rather than a taper |
| 3 | 0 | 2 | 1 | 1 | — | Ten criticals across six categories were about to drive major rework, so the pass is adversarial rather than additive: one challenger against the seven code claims, one against the seven evidence claims, both charged to refute. Two is the minimum that keeps the two claim families independent |

### Findings

| Finding | Member | Role | Round | Risk category | Surface | Evidence class | Citation | Disposition | Reason / merged into |
|---|---|---|---|---|---|---|---|---|---|
| F1 | m1 | reviewer | 1 | source-of-truth | plan Source-of-Truth Strategy | repo | `workflow/artifacts/plans/wp-r18-delta-upgrades-v1.md` — status `not required` beside a paragraph describing the blocked condition, against `workflow/config/source-of-truth.yaml` | accepted | |
| F2 | m1 | reviewer | 1 | source-of-truth | plan RK9 Notion handoff row | repo | `workflow/artifacts/plans/wp-r18-delta-upgrades-v1.md` — RK9 carries three of the eight fields `workflow/config/source-of-truth.yaml` requires and no copy-ready text | accepted | |
| F3 | m1 | reviewer | 1 | source-of-truth | plan Notion staleness count | repo | `workflow/artifacts/plans/wp-r18-delta-upgrades-v1.md` names two pages and itemises one where `workflow/artifacts/briefs/wp-r18-delta-upgrades-v1.md` cites three | accepted | |
| F4 | m1 | reviewer | 1 | source-of-truth | repo-mental-map CLI enumeration | repo | `docs/knowledge-map/repo-mental-map.md` enumerates the CLI as two install commands with no occurrence of upgrade, and `CLAUDE.md` says the same | accepted | |
| F5 | m1 | reviewer | 1 | source-of-truth | README consumer surface | trial | `grep -c upgrade README.md` → `0`, and the what-init-does list in `README.md` omits the provenance manifest | accepted | |
| F6 | m1 | reviewer | 1 | source-of-truth | published site consistency | repo | `site/troubleshooting.md` still routes version skew to prepare while `site/updating.md` says prepare does not clear it; `site/install.md`, `site/under-hood.md` and `site/uninstall.md` omit the new footprint | accepted | |
| F7 | m1 | reviewer | 1 | source-of-truth | OI-105 ledger state | repo | `workflow/artifacts/open-items.yaml` — OI-105 reads status open while `workflow/artifacts/tasks/wp-r18-delta-upgrades-v1.md` asserts in past tense that it is closed | accepted | |
| F8 | m1 | reviewer | 1 | source-of-truth | overview workflow tree | repo | `docs/overview.md` documents the dotted workflow path shape the repo abandoned | accepted | Pre-existing; not attributable to this change, raised for the ledger |
| F9 | m2 | reviewer | 1 | lifecycle | brief council integrity bracket | trial | `node src/workflow/validators/check-council-record.mjs` → `check-council-record: ok` over a brief whose frontmatter pair and prose section describe different trees | accepted | Widened by F76: a third contradictory record exists in the same artifact |
| F10 | m2 | reviewer | 1 | lifecycle | brief exit gate versus frontmatter | trial | `node src/workflow/validators/check-lifecycle.mjs --phase review --slug wp-r18-delta-upgrades` → `ok`, against an unchecked exit-gate box in `workflow/artifacts/briefs/wp-r18-delta-upgrades-v1.md` asserting the council validator does not pass | accepted | |
| F11 | m2 | reviewer | 1 | lifecycle | brief rounds narrative | repo | `workflow/artifacts/briefs/wp-r18-delta-upgrades-v1.md` states no second round was run directly beneath a round-2 table row | accepted | |
| F12 | m2 | reviewer | 1 | lifecycle | brief termination block | repo | `workflow/artifacts/briefs/wp-r18-delta-upgrades-v1.md` declares survivors I8 to I12 the same artifact records as resolved, and round 2 opens with 2 rather than the 5 left open | accepted | |
| F13 | m2 | reviewer | 1 | lifecycle | Think determinism rule | repo | `src/workflow/skills/lifecycle-think/SKILL.md` forbids claiming verification in Think; round 2's charter is checking the shipped implementation | accepted | |
| F14 | m2 | reviewer | 1 | lifecycle | task Active Phase block | repo | `workflow/artifacts/tasks/wp-r18-delta-upgrades-v1.md` titles the block Phase 11 while its IDs, exit gate and scope are Phase 10's | accepted | |
| F15 | m2 | reviewer | 1 | lifecycle | task Command Results table | trial | `npm run upgrade-path:test` → `upgrade-path: 51 passed, 0 failed` against a table row recording 36, with no row for the passing mutation audit in `workflow/artifacts/tasks/wp-r18-delta-upgrades-v1.md` | accepted | Absorbs F61 |
| F16 | m2 | reviewer | 1 | lifecycle | plan Verification Plan RI18 row | repo | `workflow/artifacts/plans/wp-r18-delta-upgrades-v1.md` still reads expected 8 entries three lines from an exit gate saying six | accepted | |
| F17 | m2 | reviewer | 1 | lifecycle | plan phase map and approval scope | repo | `workflow/artifacts/plans/wp-r18-delta-upgrades-v1.md` credits `src/workflow/validators/check-phase-map.mjs` with a bijection rule its own comment disclaims, and no P11 coverage row exists | accepted | |
| F18 | m2 | reviewer | 1 | lifecycle | task Architecture Notes | repo | `workflow/artifacts/tasks/wp-r18-delta-upgrades-v1.md` records Phase 1 only; Phase 11's two structural recouplings appear solely inside the Blockers narrative | accepted | |
| F19 | m2 | reviewer | 1 | lifecycle | task handoff file counts | trial | `git diff --name-status release/1.1.0..HEAD` → 23 added and 15 modified against a row recording 10 and 14, corroborated by a validator that reads the task rather than git | accepted | |
| F20 | m2 | reviewer | 1 | lifecycle | plan phase-count residue | repo | `workflow/artifacts/plans/wp-r18-delta-upgrades-v1.md` opens Ten phases, and the task's Plan Phases Overview table has a missing cell and a stray fourth cell | accepted | |
| F21 | m2 | reviewer | 1 | lifecycle | artifact commit history | trial | `git log --format=%h --date=iso release/1.1.0..HEAD` → all seven commits inside 63 seconds with the artifact commit first | accepted | Follows the user's recorded commit-deferral instruction; the consequence is the finding, not the act |
| F22 | m11 | reviewer | 2 | requirement | R5 descriptor schema clause | repo | `src/assets/workflow/migrations/README.md` is the only artefact asserting descriptor validation; `src/workflow/validators/check-config.mjs` never scans the migrations tree | accepted | |
| F23 | m11 | reviewer | 2 | requirement | RI14 enforcement | repo | `src/setup/SKILL.md` step 5f is prose-only and `src/workflow/validators/check-lifecycle.mjs` validates manifest shape, never content | accepted | Restates a risk the brief already accepted as F113; re-raised because the acceptance predates RI14 becoming RK2's mitigation |
| F24 | m11 | reviewer | 2 | requirement | RI18 eight-entry branch | repo | `test/run-upgrade-path-tests.mjs` carries no fixture forcing the non-darwin plus tracked-hook plus Copilot combination | accepted | |
| F25 | m11 | reviewer | 2 | requirement | RI16 marker-stamp comparison | trial | `node src/workflow/validators/check-setup-complete.mjs` against a fixture stamped 1.0.0 on both sides → `AGENTS.md marker stamp: v1.0.0 (matches installed)`, exit 0 | accepted | |
| F26 | m11 | reviewer | 2 | requirement | RI5 state taxonomy | repo | `bin/agentsmyth.mjs` implements a sixth state newly-governed that RI5 does not name and no fixture covers | accepted | |
| F27 | m12 | reviewer | 2 | compatibility | upgrade --baseline format-version guard | trial | sandbox runs at format_version 99 and 2 → both rewritten to 1 with written_by_version clobbered, against `bin/agentsmyth.mjs` | accepted | Confirmed by F66 | 
| F28 | m12 | reviewer | 2 | compatibility | init provenance re-baseline | trial | hand-edited `workflow/config/domain.yaml` read drifted, then `agentsmyth init` re-run → the same file reports pristine with the edit still present | accepted | Confirmed by F67 and called the most severe of the seven code claims |
| F29 | m12 | reviewer | 2 | compatibility | pending-setup id allocation | trial | a file with PS-1 to PS-12 and PS-12 pruned → the next allocation re-issued PS-12, against `bin/agentsmyth.mjs` | accepted | |
| F30 | m12 | reviewer | 2 | compatibility | backup supersede directory sweep | trial | a consumer file under `workflow/backups/nightly/` → deleted by an unrelated governed file's backup write, while its sibling survived | accepted | Confirmed by F68 |
| F31 | m12 | reviewer | 2 | compatibility | worktree hook resolution | trial | `agentsmyth upgrade` in a linked worktree → ENOTDIR and an AGENTS.md claiming the gate is not installed, while `git rev-parse --git-path hooks` resolves correctly | accepted | |
| F32 | m12 | reviewer | 2 | compatibility | adapter render comparison | trial | four consecutive upgrades on a CRLF tree → `.cursor/rules/agentsmyth.mdc` newly-governed every run, manifest stuck at 5 of 6, against `bin/agentsmyth.mjs` | accepted | |
| F33 | m12 | reviewer | 2 | compatibility | day-one skew convergence | trial | `agentsmyth check` after the first upgrade → the skew warning still naming upgrade as the cure, against `site/updating.md` | accepted | |
| F34 | m13 | reviewer | 2 | security | writeBackup path segment | trial | the writeBackup path arithmetic run in a sandbox with a traversal written_by_version → `still under repoDir?: false` and the write landed outside, against `src/workflow/schemas/provenance.schema.yaml` | accepted | Confirmed by F64 |
| F35 | m13 | reviewer | 2 | security | atomicWriteFileSync symlink resolution | trial | the verbatim function body called against a symlinked governed path → the external victim file's content replaced, against `bin/agentsmyth.mjs` | accepted | Confirmed by F65, which recalibrated the payload half |
| F36 | m13 | reviewer | 2 | security | writeBackup read side | repo | `bin/agentsmyth.mjs` reads a governed path with readFileSync and writes into a committed backup tree, against the protected patterns in `workflow/config/repo-profile.yaml` | accepted | |
| F37 | m13 | reviewer | 2 | security | containment check placement | repo | `src/workflow/validators/check-lifecycle.mjs` holds the containment check and the upgrade command block in `bin/agentsmyth.mjs` never invokes it | accepted | |
| F38 | m13 | reviewer | 2 | security | overwrite without approval | repo | `bin/agentsmyth.mjs` rewrites every drifted governed file with no confirmation, against the explicit-approval clause in `workflow/config/domain.yaml` | accepted | |
| F39 | m13 | reviewer | 2 | security | hook write into a protected path | repo | `bin/agentsmyth.mjs` writes the hook under the path `workflow/config/repo-profile.yaml` declares protected, carved out by hardcoded logic rather than by consulting the config | accepted | |
| F40 | m13 | reviewer | 2 | security | pending-setup field escaping | repo | `bin/agentsmyth.mjs` escapes only the double quote in question and hint and applies none to backup_path, migration_id, upgrade_from or upgrade_to | accepted | |
| F41 | m14 | reviewer | 2 | maintainability | backupRoot polyrepo claim | repo | `bin/agentsmyth.mjs` comments that a backup lands where git status can see it in all three modes, while the polyrepo workspace root lies outside every git repo | accepted | |
| F42 | m14 | reviewer | 2 | maintainability | reconcile action vocabulary | repo | `bin/agentsmyth.mjs` reports gate-refreshed from one function and filters on delta-applied or re-rendered in another, so a drifted hook lands in noop and its backup is removed | accepted | |
| F43 | m14 | reviewer | 2 | maintainability | adapter predicate duplication | repo | `bin/agentsmyth.mjs` writes the isDeterministicAdapter condition twice, once as the named helper and once inline | accepted | |
| F44 | m14 | reviewer | 2 | maintainability | descriptor quote handling | repo | `bin/agentsmyth.mjs` strips the double quote and not the single, and `src/workflow/schemas/migration.schema.yaml` places no pattern on op | accepted | |
| F45 | m14 | reviewer | 2 | maintainability | git-root drift harness coverage | repo | `test/run-root-resolution-drift-tests.mjs` spawns three copies and the change added a documented fourth | accepted | |
| F46 | m14 | reviewer | 2 | maintainability | TDZ hazard remedy | repo | `bin/agentsmyth.mjs` fixes the hazard positionally for the larger const set while using the hoisted-function remedy elsewhere, with no lint config in the repo | accepted | |
| F47 | m15 | reviewer | 2 | contract | resolved_by enum downgrade safety | trial | the repo's own parseYaml and validateSchema run against both schema versions → 0 errors current, exactly one against pre-1.1.0, on `src/workflow/schemas/pending-setup.schema.yaml` | accepted | |
| F48 | m15 | reviewer | 2 | contract | provenance entry reader ordering | trial | a key-reordered entry in a real init-produced fixture, then `node bin/agentsmyth.mjs upgrade` → the file classified newly-governed and the entry silently re-authored | accepted | Narrowed by F69: the declared-versus-parsed guard does fire when path stays in the first key slot |
| F49 | m15 | reviewer | 2 | contract | adapter global-gate per-repo data | repo | `src/adapters/claude/global-gate.md`, `src/adapters/codex/global-gate.md` and `src/adapters/copilot/global-gate.md` enumerate three per-repo directories and none of the two this change adds | accepted | |
| F50 | m15 | reviewer | 2 | contract | --baseline discoverability | repo | `bin/agentsmyth.mjs` help lists no flags, `site/updating.md` never names the flag, and `src/setup/SKILL.md` is deleted after setup | accepted | |
| F51 | m16 | reviewer | 2 | release | backup supersede versus open item | trial | drift, upgrade, drift again, upgrade → the first backup deleted while `pending-setup.yaml` still carries the open item naming it, against `src/workflow/router.md` step 9 | accepted | Confirmed by F70, which found it easier to trigger than reported |
| F52 | m16 | reviewer | 2 | release | double-drift coverage | repo | `docs/release-checklist.md` rehearses one drift cycle and `test/run-upgrade-path-tests.mjs` asserts id and count invariants, never that an open item's backup path still resolves | accepted | |
| F53 | m16 | reviewer | 2 | release | shared validator blast radius | repo | `src/workflow/validators/check-setup-complete.mjs` ships a new hard fail through the shared tree that `bin/agentsmyth.mjs` refreshes unconditionally from any repo | accepted | |
| F54 | m16 | reviewer | 2 | release | rollback surface | repo | `bin/agentsmyth.mjs` has no dry-run flag and no working-tree check, and backups cover drifted files only | accepted | |
| F55 | m17 | reviewer | 2 | verification | delta content assertions | trial | `npm run upgrade-path:test` → 51 passed with no assertion reading a config back after a merge, against `test/run-upgrade-path-tests.mjs` | accepted | Confirmed by F71 |
| F56 | m17 | reviewer | 2 | verification | untested merge operations | repo | `test/run-upgrade-path-tests.mjs` plants only ensure-key; rename-key and set-machine-owned appear nowhere under test | accepted | Confirmed by F72 |
| F57 | m17 | reviewer | 2 | verification | B2.4 regression coverage | repo | `test/run-upgrade-path-tests.mjs` names every descriptor so its from equals the repo's recorded version exactly, so the old predicate never fires | accepted | Proven by F73 |
| F58 | m17 | reviewer | 2 | verification | adapter authorship fixture spread | repo | `test/run-upgrade-path-tests.mjs` E2 exercises the copilot path only, leaving the mdc branch of the same fix uncovered | accepted | |
| F59 | m17 | reviewer | 2 | verification | mutation ratchet scope | repo | `test/run-mutation-audit.mjs` targets validators only and its SUITES list omits the upgrade suite, so `bin/agentsmyth.mjs` is never a mutation target | accepted | Narrowed by F74 |
| F60 | m17 | reviewer | 2 | verification | attribution sweep filter | repo | `test/run-violation-tests.mjs` filters the single-error sweep to two validators, excluding the four new provenance fixtures | accepted | |
| F61 | m17 | reviewer | 2 | verification | task Command Results table | trial | `npm run upgrade-path:test` → `upgrade-path: 51 passed, 0 failed` against the 36 recorded in `workflow/artifacts/tasks/wp-r18-delta-upgrades-v1.md` | merged | Merged into F15 |
| F62 | m17 | reviewer | 2 | verification | Phase Completion Log | repo | `workflow/artifacts/tasks/wp-r18-delta-upgrades-v1.md` has a row for every phase from 1 to 10 and none for Phase 11 | accepted | |
| F63 | m18 | reviewer | 2 | generated-output | provenance fixture snapshots | trial | `cmp` across all four pv-provenance fixtures → identical except the entries description in `test/fixtures/definitions/pv-provenance-bad-shape/schemas/provenance.schema.yaml`, which predates the Phase 11 account | accepted | Every other generated surface checked clean, including the bundle blocks and the mutation baseline |
| F64 | c1 | challenger | 3 | security | writeBackup path segment | trial | traversal written_by_version reproduced against the copied function body → dest outside the backup root, with `src/workflow/validators/check-lifecycle.mjs` confirmed to guard entry.path only | accepted | Confirms F34 and raises it: path and payload are both attacker-controlled through one mergeable PR |
| F65 | c1 | challenger | 3 | security | atomicWriteFileSync symlink resolution | trial | `git init` then commit and clone → the checked-in symlink preserved as a real OS symlink on checkout, then the verbatim `atomicWriteFileSync` body run against it landed on the external target | accepted | Confirms F35 and recalibrates it: the bytes written are agentsmyth's own output, so the loss is containment rather than payload control |
| F66 | c1 | challenger | 3 | compatibility | upgrade --baseline format-version guard | repo | `bin/agentsmyth.mjs` — the baseline branch returns before the classify step that carries the newer-than-cli stop | accepted | Confirms F27 |
| F67 | c1 | challenger | 3 | compatibility | init provenance re-baseline | repo | `bin/agentsmyth.mjs` — init's only re-entry gate tests the setup scaffold directory that setup deletes, and the baseline call is unconditional | accepted | Confirms F28 and calls it the most severe of the seven: zero attacker, one keystroke |
| F68 | c1 | challenger | 3 | compatibility | backup supersede directory sweep | trial | `workflow/backups/my-own-archive/workflow/config/domain.yaml` created by hand, then `writeBackup` called for an unrelated drifted file → the consumer's file deleted | accepted | Confirms F30 |
| F69 | c1 | challenger | 3 | contract | provenance entry reader ordering | trial | three reorderings run through the reader → the guard fires when path stays first and misses only when path moves off the first slot, against `bin/agentsmyth.mjs` | accepted | Refutes the general framing of F48 while confirming its mechanism and consequence |
| F70 | c1 | challenger | 3 | release | backup supersede versus open item | trial | two sequential backup writes for one file at different versions → the first deleted outright, against `bin/agentsmyth.mjs` | accepted | Confirms F51 and widens the trigger: the manifest's version stamp is bumped on every run, so any second upgrade suffices |
| F71 | c2 | challenger | 3 | verification | delta content assertions | repo | `test/run-upgrade-path-tests.mjs` — the only content-reading assertion checks the user's own line, and the delta-applied label fires on any byte change | accepted | Confirms F55 |
| F72 | c2 | challenger | 3 | verification | untested merge operations | repo | `test/run-upgrade-path-tests.mjs` — every op string planted under test is ensure-key; the other two appear only in `src/assets/workflow/migrations/README.md` and the implementation | accepted | Confirms F56 |
| F73 | c2 | challenger | 3 | verification | B2.4 regression coverage | trial | the package copied to a sandbox with the predicate reverted to its shipped-buggy form, then the suite re-run → `51 passed, 0 failed`, identical PASS list | accepted | Proves F57 empirically rather than by inspection |
| F74 | c2 | challenger | 3 | verification | mutation ratchet scope | repo | `test/run-mutation-audit.mjs` — every scoping fact confirmed, against a task artifact whose own prose already attributes the figure to blocker B1 | accepted | Confirms the scope half of F59 and blunts its misleading-metric half |
| F75 | c2 | challenger | 3 | requirement | RI14 enforcement | repo | `src/workflow/validators/check-lifecycle.mjs` states presence and shape only, and no validator names the baseline step | accepted | Confirms F23 and places it: the brief already accepted this as F113, so it restates a carried risk rather than surfacing a new one |
| F76 | c2 | challenger | 3 | lifecycle | brief council integrity bracket | trial | `node src/workflow/validators/check-council-record.mjs` run read-only → `check-council-record: ok`, over an artifact carrying three mutually contradictory records of that check | accepted | Confirms F9 and finds it understated: the unchecked exit-gate box is a third contradiction m2 did not cite |
| F77 | c2 | challenger | 3 | lifecycle | task Command Results table | repo | `workflow/artifacts/tasks/wp-r18-delta-upgrades-v1.md` — both stale-evidence claims confirmed on direct citation | accepted | Confirms F15 and F62 |

### Reconcile Contract

Ten reviewers held disjoint risk CATEGORIES, not disjoint files, so two reviewers reaching the same
surface from different categories was expected rather than accidental — the task artifact's Command
Results table is a `lifecycle` object to m2 and a `verification` object to m17, and both are right.
Duplicates collapse into the earliest finding ID, which keeps the citation that resolves; the
collapsed row is recorded `merged` with its target rather than deleted, so the second reviewer's
independent arrival at the same defect stays visible. Disagreements are never collapsed. Where a
challenger contradicted a reviewer, both rows survive, the challenger's row carries the refutation,
and the parent's consolidated finding states which reading it adopted and why — so a reader can see
the claim that was withdrawn, not just the one that stood. Near-duplicates that share a requirement
but not a defect are kept separate: F16 and F24 both concern RI18, one as propagation drift and one
as missing coverage, and collapsing them would have lost a fix.

### Conflicts

| Surface | Findings | Resolution |
|---|---|---|
| provenance entry reader ordering | F48, F69 | Challenger's reading adopted in part. The mechanism and the reproduced consequence stand; the general claim that the self-consistency guard cannot detect a reordered entry does not — it fires whenever `path` keeps the first key slot. P1-2 states the narrower mechanism |
| atomicWriteFileSync symlink resolution | F35, F65 | Challenger's calibration adopted, severity call retained. The bytes written are agentsmyth's own template output, so this is corruption and denial of service outside the repo rather than payload injection — but the containment property is what was lost, and that is a P0 regardless of what fills the file |
| mutation ratchet scope | F59, F74 | Challenger's reading adopted. Every scoping fact holds, and the implied misleading-metric risk does not: the task artifact's own prose already ties the figure to blocker B1 rather than to the upgrade fixes. P2-18 keeps the observation and drops the framing |
| RI14 enforcement | F23, F75 | Challenger's placement adopted. The gap is real and unchanged, but the brief already accepted it as F113. P1-11 re-raises it as a decision to re-take rather than as a new discovery, because the acceptance predates RI14 becoming RK2's mitigation |
| brief council integrity bracket | F9, F76 | Challenger's wider scope adopted. A third contradictory record exists — the unchecked exit-gate box — that the reviewer did not cite, so the artifact carries three statements about one check rather than two |
| backup supersede versus open item | F51, F70 | Challenger's widening adopted. The trigger is not a version change: the manifest's top-level stamp is rewritten on every run, so any second upgrade against an unresolved item destroys the backup |
| init provenance re-baseline | F28, F67 | Challenger's severity raised over the reviewer's. Both reproduced it; the challenger's point that it needs no attacker and no unusual sequence is why P0-4 sits above the two symlink findings in remediation order |

### Skipped Checks

| Check | Why skipped | Risk | Owner | Blocks ship | Manifest IDs |
|---|---|---|---|---|---|
| requirement, compatibility, security, maintainability, contract, release, verification, generated-output | Round 1 members m3, m4, m5, m6, m7, m8, m9, m10 all died on a provider session limit before producing any output. Nothing was read and nothing was reported by any of them. The eight categories were re-dispatched unchanged in round 2 on a different model and all eight completed, so no category went unread across the run — this row records the loss rather than a surviving gap | None surviving. The residual risk is that round 2 ran on a different model than round 1, so the two completed round-1 categories and the eight round-2 categories were not judged by identical reviewers | parent (this run) | no | R1, R2, R3, R4, R5, R6, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9, RI10, RI11, RI12, RI13, RI14, RI16, RI17, RI19, RI20, RI21 |
| compatibility | RI18's eight-entry branch needs a non-darwin platform with a tracked hook and the Copilot adapter present. Every member ran on darwin, so the branch was assessed by code reading only. m11 reported this as F24; it is recorded here as well because the check itself could not be executed, not merely because a fixture is missing | A platform this release supports has a governed-surface count nobody exercised, and the acceptance for it was restated mid-chain | Build, then Verify | no | RI18 |
| compatibility | RI13's Windows half was reproduced by normalising a repo to CRLF on darwin rather than on a native Windows checkout under core.autocrlf. m12's F32 is a genuine trial, but the platform it models was not the platform it ran on | A CRLF-specific behaviour that only manifests through git's own checkout filter would not have been caught | Build, then Verify | no | RI13, RI18 |

### Termination

- Reason: user-decision-required
- Surviving items and their round history: RI18 open in round 1, open in round 2, open in round 3 —
  its restated eight-entry branch requires a non-darwin platform no member could run on, so the
  requirement was assessed by code reading in round 2 and never closed by trial. The recommendation
  itself is the second escalation: six P0 findings send this chain back to Build, and the scope of
  that remediation is the user's call rather than this review's.

## Requirement Coverage

| Manifest ID | Evidence | Status | Notes |
|---|---|---|---|
| R1 | F28, F32, F67 | partial | Holds for a fresh `init`. Re-running `init` re-baselines against disk rather than against what agentsmyth wrote (P0-4), and on a CRLF tree one governed file never enters the manifest at all (P1-12) |
| R2 | F26, F48, F69 | partial | The classification runs, but the state machine has a sixth state the requirement does not name (P1-9) and a schema-valid manifest entry can be routed into it silently (P1-2) |
| R3 | F30, F36, F51, F68, F70 | partial | The copy is byte-identical and `npm run validate` passes with backups present. The backup is then destroyed by an ordinary second upgrade (P0-6) or by a name collision with a consumer's own directory (P0-5), and a symlinked governed path puts foreign content into it (P0-3) |
| R4 | F42, F51 | partial | One item per drifted config per upgrade holds. A drifted pre-commit hook produces none, ever (P1-6) |
| R5 | F22, F44 | partial | Descriptor resolution for a version pair works. The acceptance clause that a descriptor validates against its own schema is enforced by nothing (P1-10), and a legal single-quoted descriptor is silently dropped (P1-7) |
| R6 | F37, m18's conformance sweep | covered | `check-lifecycle.mjs` hosts the check, is named in `agentsmyth check`, and the conformance suite passes including the wiring checks. Recorded covered as written — that the check does not also sit on the write path is P1-17, a gap in the design rather than in this requirement |
| RI1 | F47 | partial | Every pre-1.1.0 artifact and config still validates and `npm run validate` exits 0. The `resolved_by` enum widening is not downgrade-safe, and the brief's evidence for the additive claim cites a validator that never reads that field (P1-16) |
| RI2 | m18's package inspection | covered | `dependencies` unchanged; `node:crypto` and `node:fs` only |
| RI3 | F59, F60, F63, F74 | partial | Each new validator error carries a fixture and the audit reports zero undefended for both touched validators. The ratchet cannot reach `bin/agentsmyth.mjs` where the feature lives (P2-18), the new fixtures sit outside the single-error sweep (P2-22), and four fixture snapshots drifted (P3-3) |
| RI4 | F35, F36, F65 | partial | The write is atomic and a killed process leaves parseable files. The symlink resolution added to make it safe removed containment (P0-2, P0-3) |
| RI5 | F26, F48, F69 | partial | One fixture per named state exists. The taxonomy is incomplete by one state, and the requirement's own hard-stop invariant is violated per entry by P1-2 |
| RI6 | F53 | covered | `upgrade` runs the global install unconditionally before reading any schema. That this propagates a new hard fail to unrelated repos on the same machine is P1-14, a consequence rather than a coverage gap |
| RI7 | F30 | covered | Backups live under `workflow/` and outside both recursive sweeps; `check-config`, `check-artifacts` and `check-lifecycle` all pass with backups present. The supersede sweep's blast radius is P0-5 |
| RI8 | m12 and m16 fixture runs | covered | Governed files are named explicitly; no directory sweep copies a file agentsmyth does not own |
| RI9 | F29, F42 | partial | The marker encodes file and version and survives a prune. A pre-1.1.0 file re-issues one id on first contact (P2-3), and a hook drift never reaches the marker at all (P1-6) |
| RI10 | m15 schema run | covered | A reconcile item carries the config it targets |
| RI11 | F47, F51 | partial | `src/workflow/router.md` describes resolution and `check-pending-setup.mjs` accepts the new value. The value is not downgrade-safe (P1-16) and step 9 can be pointed at a backup that no longer exists (P0-6) |
| RI12 | m18's conformance sweep | covered | The host imports `lib.mjs`, is named in `agentsmyth check`, and appears in the conformance suite's CLI-invoked list |
| RI13 | F32 | partial | Declared in the manifest and applied on the config path. Not applied on the adapter path, so a CRLF checkout diverges there (P1-12). Reproduced by normalising a repo on darwin rather than on a native Windows checkout — see Skipped Checks |
| RI14 | F23, F75 | missing | Enforced by `src/setup/SKILL.md` prose alone. No validator compares a recorded digest to current content, and no waiver records the gap. The brief accepted this as F113 before RI14 became RK2's mitigation (P1-11) |
| RI15 | F4, F5, F6 | partial | Three files corrected. `site/troubleshooting.md` now contradicts the page the same commit rewrote, three more site pages omit the new footprint, and `README.md`, `CLAUDE.md` and `docs/knowledge-map/repo-mental-map.md` do not know the command exists (P2-13, P2-14) |
| RI16 | F25 | missing | The check compares two stamps written by the same invocation and never reads the installed CLI's version, so it reports "matches installed" in exactly the skew scenario OI-105 was filed for (P1-8) |
| RI17 | F49, F63 | partial | m18 verified `dist/workflow-bundle.md`, `dist/setup-bundle.md`, root `validators/`, the dev schema sync and `src/assets/adapters/` all current against source. Three adapters' global-gate content never learned about the two new per-repo artifacts (P2-17) and four fixture snapshots are stale (P3-3) |
| RI18 | F24, F32 | partial | Six and seven verified by fixture. The eight-entry branch requires a platform no member could run on and was assessed by code reading only — the one item this council could not close (P2-20) |
| RI19 | m16 marker-block runs | partial | Content outside the marker block survives byte-for-byte and content inside is replaced. The hook's replacement reports an action the reconcile filter does not recognise, so the user is never told (P1-6) |
| RI20 | F30, F51, F68, F70 | missing | The requirement names two deletion triggers and never orders them; both are implemented and they collide. An open item's backup is destroyed by an ordinary second upgrade (P0-6), and the sweep that enforces the retention rule deletes files agentsmyth never wrote (P0-5) |
| RI21 | F41 | missing | In `polyrepo-member` the workspace root lies outside every git repo, `resolveGitRoot` fails, and the fallback lands the backup at exactly the untracked location the code's own comment claims it avoids. No test covers the mode (P1-13) |

## Architecture Notes

- role: Staff Reviewer
- decision: Recommend `hold` and return to Build rather than `pass-with-risk` with follow-ups. Six
  findings are irrecoverable data loss or writes outside the repository, and four of the six are
  reachable with no attacker and no unusual sequence — re-running `init`, upgrading twice, owning a
  `workflow/backups/` directory. A feature whose entire purpose is protecting the user's edits cannot
  ship while its own retention and baseline paths destroy them.
- constraint: The remediation must not be taken as a licence to redesign. Every P0 has a local fix,
  and the two that look structural — P0-4 and P0-6 — are both cases of an existing correct mechanism
  not being applied at a second call site. `upgrade` already does the targeted re-baseline P0-4
  needs; RI20 already names resolution as a deletion trigger P0-6 must order first.
- constraint: Two findings are couplings, not bugs, and will regrow if fixed pointwise. P1-6's action
  vocabulary is split across three functions with nothing holding them in agreement — the third
  instance of that exact shape in this chain. P1-2's self-consistency guard shares its regex with the
  reader it is supposed to audit, so both undercount together. Fix the coupling in each, or expect a
  fourth and a third instance.
- downstream: Build takes the six P0s and the seventeen P1s. Ship takes P2-15's Notion handoff, which
  must be re-statused from `not required` to `blocked` and given the eight fields before
  `lifecycle-ship` gates on it. Reflect takes P2-10's phase-boundary finding, P3-6's note on what
  commit deferral costs an artifact chain, and P3-7's ledger closure — but P3-7 only after P1-8,
  because OI-105's fix as shipped does not do what OI-105 asked.
- downstream: P1-15 is mine and is a process finding as much as an artifact one. The brief's recorded
  integrity pair brackets one round of two. Do not adjust the recorded digests to make the record
  read complete; state what the pair covers and leave round 1's failed bracket documented. That the
  validator reports `ok` over a record carrying three contradictory statements about its own result
  is a validator gap for Reflect to file, not a reason to write a better-looking pair.

## Verification Reviewed

| Item | Outcome | Notes |
|---|---|---|
| `node validators/repo-digest.mjs` before and after the council | pass | Both `65748a3fb4918e475c1944659794ae30ecb148353e4b54ac8783f4d70fb59c6a` over 2149 files, tree clean. Re-derived again immediately before writing this artifact and still matching, so nothing changed between the bracket closing and the record being written. No member wrote to the repository |
| `npm run upgrade-path:test` | pass, and the pass is not worth what the task artifact claims | 51 passed, 0 failed — run independently by m17 and by c2. The task's Command Results row records 36 (P2-8). The suite verifies file existence, labels and metadata well, and never verifies merged content (P1-3), never exercises two of three merge operations (P1-4), and cannot fail on the one regression it was extended for (P1-5) |
| The reverted-predicate trial | the suite stayed green, which is the finding | c2 copied the package to its sandbox, restored the B2.4 predicate to its shipped-buggy form, and re-ran: 51 passed, 0 failed, identical PASS list. This is the strongest single piece of evidence in the review — it converts P1-5 from an inspection claim into a demonstrated absence of protection |
| `node src/workflow/validators/check-council-record.mjs` | passes, over a record it cannot judge | Run read-only by m2 and again by c2: `ok`. The brief it passes carries three mutually contradictory statements about that very result (P1-15). A green validator here is evidence about the record's shape, not about the run |
| `node src/workflow/validators/check-lifecycle.mjs --phase review --slug wp-r18-delta-upgrades` | pass | Run by m2. Passes against a brief whose unchecked exit-gate box asserts the opposite (P2-9) |
| `node test/run-mutation-audit.mjs --only check-lifecycle.mjs` and `--only check-setup-complete.mjs` | pass | m18 re-ran both rather than trusting the baseline: 20 rules and 13 rules, zero undefended each, matching `test/mutation-baseline.json` exactly. The figure is real; its scope is P2-18 |
| dist bundle currency | pass | m18 extracted all 252 FILE blocks from `dist/workflow-bundle.md` and `cmp`'d each against `src/workflow/`: zero diffs, file lists identical, both new schemas present. `dist/setup-bundle.md`, root `validators/` and the dev `workflow/schemas/` sync all `cmp`-identical to source |
| `npm pack --dry-run --json` | pass | m18 confirmed the migrations README ships under the existing `src/assets/` entry without invoking a build |
| `npm run build`, `npm run validate`, `npm run violations:test`, `npm run conformance:test` | not re-run in this phase | Every member was read-only by fence, and these write to the working tree. The Build phase's recorded runs stand as the evidence; m18 verified their outputs are current by comparison rather than by rebuilding, which is the stronger check for the question "is dist stale" and no check at all for "does the suite still pass". Re-run them as part of the Build remediation |

## Residual Risk

- **RI18's eight-entry branch is unexercised and stays that way on this hardware.** Every member ran
  on darwin. The branch is implemented and read as correct, and one of the three counts in a
  mid-chain-restated acceptance rests on nobody having run it. Carried as the council's one surviving
  item.
- **RI13's Windows half was modelled, not run.** m12's CRLF trial normalised a repo on darwin. A
  behaviour that only appears through git's own checkout filter under `core.autocrlf` would not have
  surfaced. P1-12 is real either way — it reproduced four times — but the boundary of what was tested
  should not be mistaken for the boundary of what breaks.
- **Round 1 and round 2 ran on different models.** Eight of ten categories were reviewed by the
  round-2 model after the round-1 members died on a provider session limit. Coverage is complete;
  comparability across the ten categories is not. A defect whose detection depends on the reviewer
  rather than on the category could sit in `source-of-truth` or `lifecycle` and not in the other
  eight, or the reverse.
- **The consolidation is mine and the chain is mine.** Seventeen of the seventy-seven council
  findings are about artifacts I wrote, including the integrity bracket in P1-15. The challenge pass
  covered the code and evidence claims; it did not audit my consolidation of the artifact-state
  findings. A reader checking this review's own honesty should start at P1-15 and P2-8.
- **`cap_source: configured` is the closest true value, not an exact one.** The user raised the cap
  for this work package in session — "default fan-out might be 2 but you are allowed as many as you
  want for this wp" — which is neither a declared `max_parallel_workstreams` nor the council falling
  back to its own default. The enum in `src/workflow/schemas/artifact-frontmatter.schema.yaml` has
  two members and this run is a third case. `configured` is recorded because the cap was set
  deliberately rather than defaulted, and the Rounds sizing rationale states where it came from. The
  enum gap is a follow-up for Reflect; it is not a council finding, because no member raised it — I
  hit it writing this record.
- **The P0 count understates the remediation.** Six P0s and seventeen P1s is the headline, but three
  of them — P0-4, P1-6 and P1-2 — are second instances of couplings this chain already fixed once.
  The risk is not that the fixes are hard; it is that a pointwise fix leaves the coupling and a
  fourth instance arrives in the next release.

## Checkpoint Approval

- Checkpoint: review-remediation-scope
- Status: approved
- User's own words (verbatim, this turn): "Fix them all"
- Approved: 2026-09-24, answering a binary question this review put to the user after the council
  closed: all six P0 findings plus the seventeen P1s, or the P0s only with the P1s carried. The
  answer selected the wider scope, which is what Build Phase 12 executed and what the Remediation
  section above records. Nothing beyond that scope was inferred from it: the three findings routed
  to Ship, Test and Reflect stayed where the council put them, and `agentsmyth prepare` - which
  writes outside the repository - was not run on the strength of this answer.
- What this approval is NOT. It is scope authorisation, not a sign-off that the remediation
  succeeded. The user has not been shown the finished Phase 12 work at a checkpoint, and this
  artifact does not claim they have. Whether the fixes hold is Test's question, and Test answers it
  with evidence rather than with this quote.

## Recommendation

hold

*Standing as written.* This recommendation was the state of the work when the council closed, and
the remediation recorded above does not retroactively make it a `pass` — a review that rewrites its
own verdict once the findings are fixed leaves no record that they were ever there. What the
remediation changes is the `Open` column of the Severity Summary, which is what the ship gate reads.
Test is the phase that decides whether the fixes hold.
