---
slug: wp-r25-prerelease-hardening
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-10-03
updated: 2026-10-03
manifest_ids:
  - R1
  - R2
  - R3
  - R4
  - R5
  - R6
  - R7
  - R8
  - R9
  - R10
  - R11
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
upstream:
  - workflow/artifacts/briefs/wp-r25-prerelease-hardening-v2.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
---

# WP-R25 Pre-Release Hardening - Plan

## Summary

Ten defects, six phases, one branch. Three of the phases are independent and two of those can run in
any order; the ordering that matters is narrow and is driven by one shared function and one shared
schema file.

The sequence is built around three facts. First, `resolveHooksDir()` has four callers, so the hook
group must land as one change rather than per-caller. Second, `repo-profile.schema.yaml` is touched
by both the council group and nothing else, so the council group is self-contained. Third, R9 is the
only destructive requirement in the package, so it is isolated into its own phase with its own
blast-radius gate rather than bundled with work that would obscure a bad deletion.

Phase 7 exists to own the cross-cutting release invariants that have no code of their own. Every
phase carries a binary exit gate expressed as a command outcome or an observable file condition.

## Inputs

- `workflow/artifacts/briefs/wp-r25-prerelease-hardening-v2.md` — approved 2026-10-03, checkpoint
  `brief-review` approved with the user's verbatim words, `orchestration.blockers` empty.
- `workflow/config/repo-profile.yaml` — `mode: single-repository`, `default_branch: main`,
  `require_non_default_branch_for_changes: true`, `definitions_root: ~/.agentsmyth/workflow`,
  `intent` block resolved this session.
- `workflow/config/verification.yaml` — two required commands (`validate`, `violations:test`), both
  scoped to `review` and `ship`; `allow_discovered_commands: true`,
  `prefer_configured_commands: true`, `do_not_invent_commands: true`.
- `workflow/config/source-of-truth.yaml` — `mode: optional`, `default_required: false`,
  `providers: []`, `updates_belong_to_phase: ship`.
- `workflow/config/domain.yaml` — `[provider-neutrality-1]`, `[safety-2]`, `[safety-3]`,
  `[product-2]` all bear on this work.
- `src/workflow/agent-behavior.yaml` — the council and dispatch blocks being amended.
- Brief v2's Findings table (64 findings, one round, two challengers) as the evidence base.

## Requirement Coverage

`coverage-tracer` ledger. One row per active manifest ID, each citing where its acceptance is proven.

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R1 | Phase 1 (owner) | Stale-tree refusal at all three entry points. Citation: `bin/agentsmyth.mjs:2915`, `:562`, `:139`. Covered. |
| R2 | Phase 2 (owner) | Gate survives and executes. Citation: `bin/agentsmyth.mjs:2006`, `:2222`. Covered. |
| R3 | Phase 3 (owner) | `depth` defined, `model_tier` added. Citation: `src/workflow/agent-behavior.yaml:141`. Covered. |
| R4 | Phase 3 (owner) | Pre-dispatch stop via validator. Citation: `src/workflow/validators/check-lifecycle.mjs`. Covered. |
| R5 | Phase 3 (owner) | Tier enforced via per-tool member definitions. Citation: `src/adapters/`, `bin/agentsmyth.mjs:2407`. Covered. |
| R6 | Phase 7 (owner) | All ten in 1.1.0. Citation: `CHANGELOG.md` `[1.1.0]` entry. Covered. |
| R7 | Phase 2 (owner) | No false reconcile item or backed-up husky shim. Citation: `bin/agentsmyth.mjs:1136`. Covered. |
| R8 | Phase 1 (owner) | Worktree manifest entry accepted by its own reader. Citation: `bin/agentsmyth.mjs:1827`. Covered. |
| R9 | Phase 4 (owner) | Bundle pruning, blast radius bounded by the manifest. Citation: `bin/agentsmyth.mjs:778`. Covered. |
| R10 | Phase 3 (owner) | Council contract runs in a consumer repo. Citation: `bin/agentsmyth.mjs:206`. Covered. |
| R11 | Phase 5 (owner) | Rehearsal evidence re-derived, tarball removed. Citation: `workflow/artifacts/open-items.yaml` OI-87. Covered. |
| RI1 | Phase 7 (owner) | Additive, with the one declared carve-out. Citation: `src/workflow/validators/check-council-record.mjs:318`. Covered. |
| RI2 | Phase 1 | Absent-or-differing stamp rule. Citation: `bin/agentsmyth.mjs:2324`. Covered. |
| RI3 | Phase 7 (owner) | Five-adapter content sync. Citation: `scripts/render-adapters.mjs`. Covered. |
| RI4 | Phase 7 (owner) | Rebuild after source change. Citation: `scripts/build-bundle.mjs`. Covered. |
| RI5 | Phase 7 (owner) | Ratchet on validator rules only. Citation: `test/run-mutation-audit.mjs:38`. Covered. |
| RI6 | Phase 7 (owner) | Zero runtime dependencies. Citation: `package.json`. Covered. |
| RI7 | Phase 2 | Tracked-hooks-dir repos unregressed; superseded entries labelled. Citation: `bin/agentsmyth.mjs:1165`. Covered. |
| RI8 | Phase 3 | No prompt added under `bin/`; R4 is a validator. Citation: `src/workflow/router.md`. Covered. |
| RI9 | Phase 1 | Missing definitions produce a diagnosable error. Citation: `src/workflow/validators/lib.mjs`. Covered. |
| RI10 | Phase 5 | Delivery parity stated honestly or fixed. Citation: `bin/agentsmyth.mjs:2363`, `:2384`. Covered. |
| RI11 | Phase 2 | husky v8 executable bit. Citation: `bin/agentsmyth.mjs:2243`. Covered. |
| RI12 | Phase 2 | The false "single caller" comment corrected. Citation: `bin/agentsmyth.mjs:2000`. Covered. |

No requirement is deferred, waived, or dropped.

## Assumptions Verified

`plan-assumption-verifier` output. One row per `A` ID declared in brief v2.

| Assumption ID | Status | Evidence / Question |
|---|---|---|
| A1 | evidence-backed | Superseded by measurement rather than assumed. Brief v2 Findings, surfaces "Windsurf capability" and "Copilot capability": Windsurf/Devin's frontmatter table declares no effort field at all, and Copilot's per-agent effort lives in `subagents.agents` config rather than agent frontmatter. So at least two of five cannot express per-member effort the way Claude Code does, which is what A1 claimed. Phase 3 therefore ships a per-adapter mapping rather than one uniform shape. |
| A2 | evidence-backed | `council.repo_integrity.before` and `.after` in brief v2 are byte-identical (`9c229de559f736aa5a15a6d9db4375fa5c4597d738c2fb45b05ba44952598bb8`, 2162 files), taken either side of the council run with `node src/workflow/validators/repo-digest.mjs`. The sandbox root resolves to `~/.agentsmyth/sandbox/agentsmyth` per `workflow/config/repo-profile.yaml`, outside every repository. |
| A3 | evidence-backed | Documented for all five hosts in brief v2's Findings (surfaces "Claude capability", "Codex capability", "Cursor capability", "Windsurf capability", plus c1's Copilot correction), and corroborated in-session: `~/.claude/skills/agentsmyth/SKILL.md` is a live native registration, and the council's own members were dispatched as fresh-context agents rather than forks. Held narrowly: documentation establishes the mechanism exists, not that agentsmyth's integration uses it correctly — which is why R5's acceptance requires reading a dispatched member's actual model back from the host in Phase 3, not merely placing the file. |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `bin/agentsmyth.mjs` | modify | R1, R2, R5, R7, R8, R9, R10, RI2, RI7, RI9, RI11, RI12 | The single largest surface. Seven distinct regions; see Phases for which phase owns which. |
| `src/workflow/agent-behavior.yaml` | modify | R3 | `council.depth` description becomes operational; `council.model_tier` added. The "six keys" count comment must be updated or it ships false. |
| `src/workflow/schemas/agent-behavior.schema.yaml` | modify | R3, RI1 | New optional properties. Safe to add to `required` here because schema and data ship in the same bundle. |
| `src/workflow/schemas/repo-profile.schema.yaml` | modify | R3, RI1 | New tunables, the allowlist prose, and the stale "two exceptions" sentence which is already false. |
| `src/workflow/schemas/artifact-frontmatter.schema.yaml` | modify | R3, R5, RI1 | Council block gains `model_tier`, `model_actual`. Optional only. |
| `src/workflow/validators/check-lifecycle.mjs` | modify | R4 | New rule: Complex chain with no resolved `model_tier` fails at `--phase think`. Needs a rejection fixture (RI5). |
| `src/workflow/validators/check-council-record.mjs` | modify | R3, R5, RI1 | Tier fields validated. The literal required-field array at `:318` is the declared non-additive carve-out. |
| `src/workflow/validators/lib.mjs` | modify | RI9 | Missing-definitions read must name the file and remedy instead of throwing ENOENT. |
| `src/adapters/{claude,codex,copilot,cursor,windsurf}/` | add | R5, RI3 | Five council-member definition templates, one per tool, each carrying its own tier mapping. |
| `src/workflow/skills/think-council/SKILL.md` + `references/output-schema.md` | modify | R3, R4 | `depth` semantics; pre-dispatch resolution step. |
| `src/workflow/skills/review-council/SKILL.md` + `references/output-schema.md` | modify | R3, R4 | Same, kept in lockstep. |
| `src/workflow/skills/lifecycle-review/references/output-schema.md` | modify | R3 | Third carrier of the `depth` starter block. |
| `test/run-init-prepare-interop-tests.mjs` | modify | R1, R8, RI2, RI9 | New scenarios; no fixture directory exists, scenarios are built at runtime. Next free letter is K. |
| `test/run-upgrade-path-tests.mjs` | modify | R2, R7, R9, RI7, RI11 | husky v9, husky v8, pruning. Uses `pkgWithDescriptor` for synthetic versions. |
| `test/run-agents-md-tests.mjs` | modify | R2, RI12 | Advertised-path assertions extended to durability. |
| `test/mutation-baseline.json` | modify | RI5 | Only if a validator rule count changes. |
| `workflow/artifacts/briefs/*-v{1,2}.md`, `reviews/wp-r{18,22}-*.md` | modify | RI1 | The four dogfood council artifacts, amended in the same commit as the `:318` change. |
| `CHANGELOG.md` | modify | R6 | `[1.1.0]` entry extended to cover all ten defects. Date stays a placeholder until dispatch. |
| `jeelvankhede-agentsmyth-1.0.1.tgz` | delete | R11 | Untracked, misleadingly named, carries unreleased council content. |
| `workflow/artifacts/open-items.yaml` | modify | R11, RI10 | OI-87's citation of OI-69 corrected; OI-112/113/114 closed at Ship; new items for RI10 if delivery is not fixed. |
| `README.md`, `site/` | modify | RI10 | Only if release copy currently implies automatic five-tool gate installation. |
| `dist/`, `validators/`, `workflow/schemas/` | regenerate | RI4 | Build products. Never hand-edited. |

Protected paths (`.git/**`, `.env*`, `**/*secret*`) are untouched. R9 is the only requirement that
deletes anything, and it deletes only inside `~/.agentsmyth/`, never inside a repository.

## Source-of-Truth Strategy

`source_of_truth.mode` is `optional` with `default_required: false` and `providers: []`, so no
external provider read or update is required for this chain, and no handoff is owed.

Two records are nonetheless affected, and both are Ship-owned per
`update_policy.updates_belong_to_phase: ship`:

- **The Notion `1.1.0 — Minor Release Work Plan` page.** External write, so
  `require_user_request_or_config_for_external_write` applies — it needs the user's request at Ship,
  not an inference now. Status at Plan: `not required`.
- **`workflow/artifacts/open-items.yaml`.** Repo-local. OI-112, OI-113 and OI-114 close at Ship with
  resolutions and `closed_in_run: wp-r25-prerelease-hardening-v1`; OI-87's citation of OI-69 is
  corrected under R11; any residual from RI10 is filed as a new item. Status at Plan: `not required`,
  becomes `updated` at Ship.

`require_exact_source_reference_in_artifacts` is satisfied throughout by citing file paths and line
numbers rather than describing locations.

## Approach

**One change inside one function, not four at the call sites.** The hook group's entire correctness
rests on `resolveHooksDir()` being the only place that decides where the gate lives. Three other
sites re-derive `resolveHooksDir(root) + '/pre-commit'`, and governance receives the written path as
a parameter, so a fix placed in the resolver propagates to all of them by construction while a fix
placed in `installPreCommitHook()` desynchronises them. This is why Phase 2 is one phase and not
five.

**Detect husky structurally, never by name.** husky's directory is a parameter, so a literal
`.husky` match misses `husky('githooks')`. The version-stable invariants are: the resolved
directory's basename is `_`, it contains an `h` dispatcher, and its `.gitignore` is `*`. Under husky
v8 the resolver already returns the durable parent, so the new branch must not fire there.

**Write the gate first, not last.** The gate must be the first thing in the target file, because
husky executes it under `sh -e` and `husky init` pre-populates `.husky/pre-commit` — so appending
puts the gate behind host content that can fail or exit 0 before reaching it. Existing host content
moves below the gate block, inside the marker discipline that already exists.

**Absence is the signal, not inequality.** Published v1.0.1 never wrote `installed-version.txt`, so
every consumer-reachable stale tree has no stamp at all. "Absent or unparseable or differing ⇒
stale" covers them, and needs no digest, no build-script change, and no new hashing. The residual
blind spot — same version string, rebuilt source, no `prepare` — is dev-only and is recorded rather
than closed.

**Enforce the tier by dispatching named members.** Shared config carries a tier; each adapter owns a
member definition carrying its own mapped model and effort; members are dispatched as fresh-context
agents naming that definition. This is why the tier is enforceable and not merely declarative, and
why R5's gate is a model read back from the host rather than a file existing on disk.

**Isolate the one destructive requirement.** R9 deletes. It gets its own phase so that a bad
deletion cannot hide inside a passing phase that also did five other things, and its exit gate
asserts survival of a consumer-authored file as well as removal of a retired one.

## Phases

### Phase 1 - Resolution and staleness

- **Manifest IDs:** R1, R8, RI2, RI9
- Touches: `bin/agentsmyth.mjs` (the guards at `:2915` and `:562`, the `check` bootstrap entry at
  `:139`, the stamp write at `:2324`, the worktree manifest path via `governedArtifacts`),
  `src/workflow/validators/lib.mjs` (RI9's error surface),
  `src/workflow/validators/check-lifecycle.mjs`,
  `test/run-init-prepare-interop-tests.mjs`,
  `test/run-upgrade-path-tests.mjs`
- **Two touches added during Build, 2026-10-03, recorded here rather than taken silently.**
  `check-lifecycle.mjs` is needed because RI9's error must be caught where definitions are loaded at
  module scope, and `lib.mjs` cannot simply exit instead: one validator deliberately catches an
  unreadable definitions file and gates on it, and a fixture proves it. `run-upgrade-path-tests.mjs`
  is test isolation only — that suite shares one scratch home across scenarios and its version-step
  scenarios stamp a synthetic version into it, which R1's new guard correctly detects. Neither adds
  a requirement; both are the same requirements needing one more file than planning anticipated.
- Work: make the prepare decision content-aware rather than existence-only, at a single shared
  predicate used by all three entry points rather than duplicated per site. Treat an absent,
  unparseable, or differing `installed-version.txt` as stale. Stop with a message naming
  `agentsmyth upgrade` as the remedy. Exclude a hook path that escapes the repository from the
  governed set so a linked-worktree `init` cannot write a manifest its own reader rejects. Replace
  the raw `ENOENT` propagation with an error naming the missing file and the remedy.
- **Exit gate:** `npm run init-prepare-interop:test` exits 0 with new scenarios asserting: (a) `init`
  against a global tree with no stamp exits non-zero and names the remedy; (b) `init` against a
  differing stamp exits non-zero; (c) `init` against a matching stamp still exits 0; (d) `init` then
  `upgrade` in a linked worktree both exit 0; (e) `check` against a hollowed global tree prints a
  message naming the missing file and does not print a stack trace. Each of (a), (b), (d) and (e)
  turns red when its own guard alone is reverted.

### Phase 2 - Hook durability and execution

- **Manifest IDs:** R2, R7, RI7, RI11, RI12
- Touches: `bin/agentsmyth.mjs` (`resolveHooksDir` at `:2006`, `installPreCommitHook` at `:2222`,
  `governedArtifacts` at `:1136`, the stale comment at `:2000`),
  `test/run-upgrade-path-tests.mjs`, `test/run-agents-md-tests.mjs`
- Work: add structural husky detection inside `resolveHooksDir()` and return the durable parent when
  it fires. Write the gate block first in the target file, moving any existing host content below it.
  Set mode 0755 on the written file. Classify a manifest entry at the superseded `<dir>/_/pre-commit`
  path as superseded rather than missing, so no false "recorded but no longer on disk" line is
  printed and no reconcile item is raised. Correct the "Single caller by design" comment to name the
  four real callers.
- **Exit gate:** `npm run upgrade-path:test` and `npm run agents-md:test` both exit 0 with new
  assertions: (a) in a husky v9 fixture, after re-running husky's installer, `git commit` output
  contains the gate's own output; (b) the gate block is the first content in `.husky/pre-commit`;
  (c) the written file's mode is 0755 and a husky v8 fixture's commit runs the gate; (d) a
  `core.hooksPath=.githooks` fixture behaves exactly as before the change; (e) `upgrade` after a
  husky reinstall reports zero drifted files, creates nothing under `workflow/backups/`, and adds no
  reconcile item; (f) the advertised path in `AGENTS.md` equals the written path in every fixture.

### Phase 3 - Council capability contract

- **Manifest IDs:** R3, R4, R5, R10, RI8
- Touches: `src/workflow/agent-behavior.yaml`,
  `src/workflow/schemas/agent-behavior.schema.yaml`,
  `src/workflow/schemas/repo-profile.schema.yaml`,
  `src/workflow/schemas/artifact-frontmatter.schema.yaml`,
  `src/workflow/validators/check-lifecycle.mjs`,
  `src/workflow/validators/check-council-record.mjs`,
  `src/workflow/skills/think-council/`, `src/workflow/skills/review-council/`,
  `src/workflow/skills/lifecycle-review/references/output-schema.md`,
  `bin/agentsmyth.mjs`,
  `src/adapters/claude/council-member.md`, `src/adapters/codex/council-member.md`,
  `src/adapters/copilot/council-member.md`, `src/adapters/cursor/council-member.md`,
  `src/adapters/windsurf/council-member.md`,
  `test/run-violation-tests.mjs`, `test/fixtures/lifecycle-violations/`,
  `test/mutation-baseline.json`,
  `src/setup/SKILL.md`,
  `workflow/artifacts/`
- **Touches rewritten during Build, 2026-10-03, for clerical reasons rather than scope ones.** The
  approved text named "the three schemas", "both council skills" and two bare validator filenames.
  The scope fence matches exact paths and directory prefixes, so prose and bare filenames cannot
  resolve — the plan validator warns about precisely this class. Nothing here is a new target; every
  entry is the full path of something the phase already declared, plus the test surfaces R4's new
  validator rule requires under RI5 (a rejection fixture and the ratchet baseline).
- **`src/setup/SKILL.md` added during Build, and this one is a design correction rather than a
  clerical one.** The plan put the member-definition placement in `bin/agentsmyth.mjs` at `init`.
  That cannot work, and R4 is the reason: R4 makes `tuning.council.model_tier` a BLOCKING unanswered
  pending item, so by construction the tier is unresolved at the moment `init` runs. Placing the
  definition then would write `model: <COUNCIL-MODEL>` into a host-native agent file — invalid
  frontmatter that could break the user's tool, to express a value nobody has chosen yet. Placement
  therefore belongs at tier-resolution time, which is the setup agent's, and the templates already
  reach it: `init` copies `src/assets/` into `.agentsmyth/`, and the build syncs
  each adapter directory's council-member template into the matching assets directory. The two requirements interact;
  the plan treated them as independent.
- Work: give `depth` an operational definition in the shipped invariant and in all three starter
  blocks. Add `model_tier` as a new optional key, globally and as a repo tunable, and rewrite the
  stale "two exceptions" sentence as a rule rather than an enumeration. Add a `check-lifecycle`
  rule that fails a Complex chain whose resolved config carries no `model_tier`, with its own
  rejection fixture. Place a per-tool council-member definition at `init` carrying each adapter's
  mapped model and effort, and amend both council skills to dispatch members by naming that
  definition as fresh-context agents. Record `model_tier` requested and `model_actual` where the
  host reports it. Wire `check-council-record.mjs` into `agentsmyth check`. Amend the four existing
  council artifacts in this same commit, since the `:318` array change breaks them.
- **Exit gate:** all of: `check-lifecycle --phase think` exits non-zero for a Complex chain with no
  resolved `model_tier` and exits 0 once one is set; `check-council-record` rejects a council record
  that omits `model_tier` when the config declares one and accepts one that carries it;
  `agentsmyth check` invokes `check-council-record` in a scratch consumer repo, and a repo with no
  council artifacts still exits 0; `npm run render-adapters` reports shims current with five
  member definitions present; `npm run validate`, `npm run violations:test`,
  `npm run conformance:test` all exit 0; `npm run mutation:audit` reports 0 undefended; and a
  dispatched council member's actual model, read back from the host, matches the mapped tier.

### Phase 4 - Bundle pruning

- **Manifest IDs:** R9
- Touches: `bin/agentsmyth.mjs` (`expandBundle` at `:778`), `test/run-upgrade-path-tests.mjs`
- Work: make bundle expansion prune. Delete only paths that the previous manifest records as
  agentsmyth-written and that the current bundle no longer declares. Never delete a path the
  manifest does not account for, never descend into `validators/` copies, and never touch OS cruft.
- **Exit gate:** `npm run upgrade-path:test` exits 0 with new assertions: (a) a file present in an
  older bundle and absent from the current one is gone from the global tree after `prepare`; (b) a
  file the manifest does not record is still present after `prepare`; (c) `validators/hooks/` and a
  planted `.DS_Store` both survive; (d) a `prepare` run twice in a row produces an identical tree
  digest.

### Phase 5 - Release evidence and delivery honesty

- **Manifest IDs:** R11, RI10
- Touches: `jeelvankhede-agentsmyth-1.0.1.tgz` (delete), `workflow/artifacts/open-items.yaml`,
  and `README.md` / `site/` only if their current wording overstates delivery
- Work: remove the stray tarball. Determine what OI-69's rehearsal actually ran against and either
  re-run it against a genuinely published 1.0.1 artifact or correct OI-87's citation to state what
  was tested. Audit release and docs copy for claims of automatic five-tool gate installation and
  either fix delivery or correct the wording; file a new open item for whichever is not done here.
- **Exit gate:** no `*.tgz` in the working tree; `grep` for the OI-69 citation in
  `workflow/artifacts/open-items.yaml` returns wording that names the artifact actually tested; and
  no file under `README.md` or `site/` asserts that all five tool gates install automatically unless
  `bin/agentsmyth.mjs` has been changed to make that true on every platform.

### Phase 7 - Release integration and invariants

- **Manifest IDs:** R6, RI1, RI3, RI4, RI5, RI6
- Touches: `CHANGELOG.md`, `dist/`, `validators/`, `workflow/schemas/` (regenerated), `package.json`
  (read only)
- Work: rebuild so the bundles reflect source. Extend the `[1.1.0]` CHANGELOG entry to cover all ten
  defects, leaving the date as the placeholder the checklist requires until dispatch. Confirm the
  additive carve-out is the only one. Confirm no runtime dependency was added.
- **Exit gate:** `npm run build` then `git status` shows `dist/` regenerated; `npm run validate`,
  `npm run violations:test`, `npm run conformance:test`, `npm run setup-checks:test`,
  `npm run init-prepare-interop:test`, `npm run upgrade-path:test` all exit 0;
  `npm run mutation:audit` reports 0 undefended; `node -e` on `package.json` shows
  `dependencies` empty; `CHANGELOG.md` `[1.1.0]` names all ten defects; and no artifact other than
  the four council ones named in RI1 was edited to make validation pass.

### Phase 6 - Council configuration depth, override, and cost history

- **Manifest IDs:** R3, R4, R5
- **Added by explicit plan update, 2026-10-04, and the route matters.** The Build contract permits
  either returning to Think/Plan OR an explicit plan update for new requirements. A new brief version
  was written first and then reverted: because the phase gate resolves the LATEST brief for a slug, an
  unapproved v3 blocked Phases 4, 5 and 6 — work already approved under v2 and unrelated to anything
  here. Halting approved work to request approval for work the user had just authorised is a cost with
  no benefit, so this is the plan-update route instead.
- **Scope extension declared rather than disguised.** R3 and R5 were written as "define depth, add
  model_tier" and "the tier is enforced". The user extended both on 2026-10-04 after using what Phase
  3 shipped: configuration must be per-phase, a single run must be able to depart from it, and the
  cost of a fan-out must be visible before it happens. The first two are plainly within R3 and R5 —
  a capability contract that cannot be set per phase or departed from is not finished. Cost history
  is the honest stretch: it is the user-facing half of the same contract, since a tier cannot be
  chosen responsibly without knowing what it costs, but the brief did not anticipate it and this note
  says so rather than letting the manifest imply otherwise.
- Touches: `src/workflow/agent-behavior.yaml`,
  `src/workflow/schemas/agent-behavior.schema.yaml`,
  `src/workflow/schemas/repo-profile.schema.yaml`,
  `src/workflow/schemas/artifact-frontmatter.schema.yaml`,
  `src/workflow/validators/check-council-record.mjs`,
  `src/workflow/skills/think-council/SKILL.md`, `src/workflow/skills/review-council/SKILL.md`,
  `test/run-violation-tests.mjs`, `test/fixtures/lifecycle-violations/`,
  `test/run-tuning-merge-tests.mjs`, `test/mutation-baseline.json`, `workflow/artifacts/`
- Work, and **the merge depth goes first**. The council found that council config resolves through a
  flat top-level spread while `per_phase` is map-valued, so adding keys inside `per_phase` entries
  without deepening that merge reproduces exactly the failure `src/workflow/validators/lib.mjs`
  documents at lines 98-106: a repo naming one key silently loses its siblings, with nothing
  erroring. Replace the spread with a per-entry merge reaching one level in, and prove it with a
  fixture, BEFORE adding `model_tier` and `effort` to `per_phase`. Then the per-run override, with a
  mandatory reason and a validator rule that rejects a reasonless one. Then per-member token counts
  on the council record and a pre-dispatch estimate derived from the mean of this repo's recorded
  councils, with an explicit no-history path that projects nothing — never a figure computed from
  fan-out and rounds, which would be a fabrication `[safety-3]` forbids.
- **Exit gate:** all of: a fixture proves a per-phase override of one key leaves that phase's sibling
  keys and every other phase at their global values; a fixture proves an override with no reason is
  rejected; a council record carrying per-member token counts validates, and one carrying
  `unavailable` validates too; a repo with no council history yields an estimate that states it has
  none and contains no projected number; `grep` finds no code path multiplying fan-out by rounds to
  produce a cost; `npm run validate`, `violations:test`, `conformance:test`, `tuning-merge:test` and
  `mutation:audit` all pass with 0 undefended.

### Phase 8 - Review remediation

- **Manifest IDs:** R3, R4, R5, R9, R10, RI7
- Added by explicit plan update, 2026-10-04, after the Review council returned `hold` with 22
  findings. Remediation precedes Test; a finding is settled at Test, not discovered there.
- Touches: `bin/agentsmyth.mjs`,
  `src/workflow/validators/check-lifecycle.mjs`,
  `src/workflow/validators/check-council-record.mjs`,
  `src/workflow/validators/check-setup-complete.mjs`,
  `src/workflow/skills/lifecycle-think/SKILL.md`,
  `src/workflow/skills/think-council/SKILL.md`, `src/workflow/skills/review-council/SKILL.md`,
  `src/workflow/schemas/artifact-frontmatter.schema.yaml`,
  `src/setup/SKILL.md`,
  `test/run-conformance-tests.mjs`, `test/run-violation-tests.mjs`,
  `test/run-upgrade-path-tests.mjs`, `test/run-init-prepare-interop-tests.mjs`,
  `test/fixtures/lifecycle-violations/`, `test/fixtures/conformance/`,
  `test/mutation-baseline.json`, `workflow/artifacts/`
- Touches, extended 2026-10-04 as remediation reached findings whose fixes land outside the paths
  listed above. Recorded as a plan update rather than waived per-file, because each is genuinely in
  scope for a finding the review raised — the original list was written before the fixes were
  designed, not around them: `scripts/build-bundle.mjs` (F19 — the council-member templates have to
  enter the bundle for `prepare` to install them), `test/run-path-containment-tests.mjs` (F6, F7,
  F13, F14 — a new suite, since none of the four is a validator rule and the negative suite only
  asserts validator exits), `test/run-checkpoint-approval-tests.mjs` (F17 — the two surviving gate
  remedies need positive controls), `test/run-commit-coverage-tests.mjs` (F18 — the `--staged` leg
  is what regressed), `.github/workflows/ci.yml` and `.github/workflows/release.yml` (F6/F7/F13/F14
  — a suite that runs in no workflow is not coverage, which is itself a finding this repo has
  already had once), `package.json` (the script entry the two workflows invoke),
  `src/workflow/validators/check-setup-complete.mjs` and
  `.claude/agents/agentsmyth-council-member.md` (F22 — the tier had no mechanical expression on
  either side, and this repo turned out not to have the file it was requiring of consumers), and
  `test/run-finding-closure-probes.mjs` (added after "all findings resolved" was asserted and found
  wrong in two places — it probes each finding's own symptom rather than the existence of a test),
  and `docs/release-checklist.md` (the manual verification this chain proved is needed — the host
  honouring a tier, the other four tools, Windows, a real husky repo, a genuinely stale global),
  and at Ship `CHANGELOG.md` plus the two open-items ledger files (release copy and item closure,
  which `source-of-truth.yaml` assigns to the ship phase), and at Reflect
  `workflow/artifacts/reflect/`, `workflow/learnings/sessions/` and the open-items ledger again
  (the phase's own two artifacts plus six follow-ups)
- Work, in severity order. The four criticals first: wire the Think gate to a shipped surface and
  assert that wiring in conformance (F1); make the tier precondition cover every phase that can
  dispatch a council, derived from the resolved per-phase map rather than a phase literal (F2);
  refuse to prune when an expansion declared nothing, write the ledger before the deletions, and
  stamp only after a successful expansion (F3); consult the open-backup set at both deletion sites
  from one shared derivation (F4). Then the eight highs, the seven mediums and the three lows as
  enumerated in the review. Every new validator rule carries its own rejection fixture per RI5.
- **Exit gate:** every one of the 22 findings is either fixed with evidence, or carries a waiver with
  all six required fields; `finding-quality.yaml` has no `pending` row left for this run that is not
  waiver-covered; the four criticals each have a regression case that fails when the fix alone is
  reverted; `validate`, `violations:test`, `conformance:test`, `init-prepare-interop:test`,
  `upgrade-path:test`, `tuning-merge:test` and `mutation:audit` all pass with 0 undefended.

## Dependency Order

1. **Phase 1** and **Phase 2** are independent of each other and of everything else. Both are
   CLI-side resolution fixes. Either may go first.
2. **Phase 4** is independent of 1, 2 and 3. It touches `expandBundle`, which no other phase
   touches.
3. **Phase 5** is independent of all code phases. Its only coupling is that RI10's decision —
   fix delivery or correct the wording — must be made before Phase 7 writes the CHANGELOG, because
   the entry should not claim what RI10 declined to deliver.
4. **Phase 3** must come after **Phase 1** only in the weak sense that both edit
   `bin/agentsmyth.mjs`; there is no logical dependency, but sequencing them avoids a merge conflict
   in one file. If they are worked in parallel, Phase 1's regions (`:139`, `:562`, `:2324`, `:2915`)
   and Phase 3's regions (`:206`, `:2407`) do not overlap.
5. **Phase 6 comes after Phase 3 and before Phase 7.** After Phase 3 because it extends the contract
   Phase 3 established; before Phase 7 because Phase 7 rebuilds and asserts the whole suite, and a
   phase landing after it leaves a stale `dist/` and a CHANGELOG that under-describes the release.
   Within Phase 6 the merge-depth fix strictly precedes the per-phase keys: building them first would
   mean shipping a documented defect and then removing it.
6. **Phase 7 must be last, and its number says so.** The council-configuration phase was first
   written as Phase 7 and sequenced before Phase 6, which reads fine in prose and breaks the scope
   fence: that check bounds a task artifact's changed files by the UNION of phases up to the ACTIVE
   number, so a lower-numbered active phase excludes a higher-numbered one that already ran. The two
   were renumbered so execution order and numbering agree. A plan that needs a sentence to explain
   why its phases run out of order is a plan whose numbers are wrong. It rebuilds and asserts the whole suite, so every other phase's source
   edits must already be in place. Running it earlier produces a stale `dist/` and a CHANGELOG that
   under-describes the package.

Critical path: Phase 3 is the long pole — five adapter formats, three schemas, two validators and a
host read-back. Phases 1, 2, 4 and 5 can all complete while it is in progress.

## Branch Strategy

- Work continues on `feat/wp-r25-prerelease-hardening`, already created from `release/1.1.0` and
  currently carrying four modified config/ledger files and the three new artifacts.
- `require_non_default_branch_for_changes: true` is satisfied: `main` is the default branch and is
  not targeted. `default_branch_commit_requires_user_approval: true` is not reached.
- One commit per phase, each naming its manifest IDs, so a phase can be reverted independently —
  which matters because RI5's discipline for CLI-side work is revert-and-rerun against a named
  assertion.
- Merge target is `release/1.1.0`, consistent with every other package in this release. `main`
  receives one merge at the end of the release, not per package.
- `stage_only_approved_scope: true`: the four config/ledger files already modified are part of this
  chain's own pending-setup pass and ledger filing, and are staged with Phase 1 rather than left
  dangling.
- No push and no PR without the user's request.

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|
| R9's pruning deletes a consumer's own file | medium | critical — irrecoverable data loss outside version control | Delete only paths the previous manifest records as agentsmyth-written AND the current bundle no longer declares; exit gate asserts an unrecorded file survives; isolated in its own phase so a failure is attributable | workflow owner | R9 |
| The gate is written but still does not execute | medium | critical — the package's core safety claim is false while reporting true | Exit gate is real `git commit` output containing the gate's own output, in both husky v9 and v8 fixtures; file presence is explicitly not accepted as evidence | workflow owner | R2, RI11 |
| R10 adds a false-positive rule to the consumer commit gate | medium | high — blocks commits in repos that did nothing wrong | Exit gate requires a repo with zero council artifacts to exit 0; the new wiring runs the existing validator unchanged rather than adding rules | workflow owner | R10 |
| Structural husky detection misfires on a non-husky repo whose hooks dir is named `_` | low | high — gate relocated in a repo that never asked for it | Require all three invariants together (basename `_`, an `h` dispatcher sibling, `.gitignore` of `*`), not just the basename; `.githooks` fixture asserts no behaviour change | workflow owner | R2, RI7 |
| A tier maps to a model the host silently overrides | medium | medium — the record claims a model that did not run | Record requested and actual separately; `model_actual` is only written when the host reports it, and its absence is recorded rather than inferred | workflow owner | R5 |
| The `:318` carve-out breaks validation and is discovered rather than declared | low | medium — a red suite mid-package | The four artifacts are amended in the same commit as the array change; RI1's exit gate asserts no fifth artifact was edited | workflow owner | RI1 |
| Phase 3's five adapter formats drift from each other | medium | medium — four tools wrong by default, the exact failure `[provider-neutrality-1]` guards | `render-adapters` reports shims current as part of Phase 3's gate; the tier vocabulary lives in shared config and only the mapping is per-tool | workflow owner | R5, RI3 |
| Phase 1 and Phase 3 conflict in `bin/agentsmyth.mjs` | medium | low — merge friction, no correctness impact | Regions are disjoint and enumerated in Dependency Order; sequence them if worked by one agent | workflow owner | R1, R3 |
| OI-69's rehearsal cannot be reconstructed | medium | medium — the release ships citing evidence nobody can confirm | R11 accepts either re-running the rehearsal or correcting the citation to state what was actually tested; it does not require recovering history | user | R11 |

Every risk has a mitigation. None requires a waiver.

## Verification Plan

Configured commands first (`prefer_configured_commands: true`), then discovered suites
(`allow_discovered_commands: true`). Working directory is the repo root for every command
(`record_working_directory: true`).

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1 | command — `npm run init-prepare-interop:test` | Phase 1 | New scenarios (a)(b)(c); plus revert-and-rerun per RI5. |
| R8 | command — `npm run init-prepare-interop:test` | Phase 1 | Scenario (d): worktree `init` then `upgrade` both exit 0. |
| RI2 | command — `npm run init-prepare-interop:test` | Phase 1 | No-stamp tree is the published-1.0.1 shape. |
| RI9 | command — `npm run init-prepare-interop:test` | Phase 1 | Scenario (e): message, not stack trace. |
| R2 | manual — husky v9 fixture, real `git commit` after dependency reinstall | Phase 2 | `manual_qa` fields recorded in the verify artifact; commands cannot prove execution-under-husky alone. |
| RI11 | manual — husky v8 fixture, real `git commit` | Phase 2 | Executable-bit path; same fixture discipline. |
| R7 | command — `npm run upgrade-path:test` | Phase 2 | Zero drift, no backup, no reconcile item. |
| RI7 | command — `npm run upgrade-path:test` | Phase 2 | `.githooks` fixture unchanged; superseded entry labelled. |
| RI12 | review — comment reads four callers | Phase 2 | Inspection; no command can assert comment accuracy. |
| R3 | command — `npm run validate` | Phase 3 | Schema and starter-block changes. |
| R4 | command — `node src/workflow/validators/check-lifecycle.mjs --phase think` on a fixture with and without `model_tier` | Phase 3 | Plus a rejection fixture per RI5. |
| R5 | manual — dispatch a member and read its actual model back from the host | Phase 3 | The only evidence that distinguishes enforced from declared. |
| R10 | command — `agentsmyth check` in a scratch consumer repo, with and without council artifacts | Phase 3 | Both outcomes asserted. |
| RI8 | review — no prompt call added under `bin/` | Phase 3 | `grep` for stdin reads in the diff. |
| R9 | command — `npm run upgrade-path:test` | Phase 4 | Four assertions including survival of an unrecorded file. |
| R11 | review — working tree has no `*.tgz`; OI-87 wording names what was tested | Phase 5 | Inspection plus a ledger edit. |
| RI10 | review — release and docs copy audited against actual delivery | Phase 5 | Either fixed or corrected; a new open item if deferred. |
| R6 | review — `CHANGELOG.md` `[1.1.0]` names all ten defects | Phase 7 | Date stays placeholder until dispatch. |
| RI1 | command — `npm run validate` with only the four named artifacts edited | Phase 7 | The declared carve-out, asserted as bounded. |
| RI3 | command — `npm run render-adapters` | Phase 7 | Shims current. |
| RI4 | generated-output — `npm run build` then `git status` on `dist/` | Phase 7 | `require_source_mapping: true`; source-only inspection is explicitly not enough. |
| RI5 | command — `npm run mutation:audit` | Phase 7 | 0 undefended for validator rules; CLI fixes pinned by revert-and-rerun, recorded per fix. |
| RI6 | command — `node -e` reading `package.json` dependencies | Phase 7 | Empty. |

Configured required commands `npm run validate` and `npm run violations:test` run at Review and
Ship per `verification.yaml`, in addition to their per-phase appearances above.

No requirement relies on a skipped check. If any check is skipped at Test, it must carry the
`skipped_checks` fields — `check`, `why_skipped`, `risk`, `owner`, `blocks_ship`, `manifest_ids`.

## Architecture Notes

- role: Principal Engineer
- **decision — one resolver, not four call sites.** The hook group lands as a single change inside
  `resolveHooksDir()` because governance and advertisement both derive from its return value. This
  is the difference between a fix and a desynchronisation, and it is why Phase 2 is indivisible.
- **decision — absence as the staleness signal.** No digest, no build-script change, no new hashing.
  Published v1.0.1 wrote no stamp, so absence is both the common case and the sufficient one. The
  dev-only blind spot is accepted and recorded rather than engineered away.
- **decision — the destructive requirement is isolated.** R9 is alone in Phase 4 so that a wrong
  deletion is attributable to one commit and revertible without touching anything else.
- **decision — enforcement is proven by read-back.** R5's exit gate is a model read from the host,
  not a config file on disk, because the whole point of the user's Q3 decision was to reject a tier
  that looks enforced from every angle except the one that matters.
- **constraint:** `[safety-2]` bounds R9's deletions and R2's writes; `[safety-3]` forces the
  requested/actual split in R5; `[provider-neutrality-1]` keeps model ids out of shared config;
  zero dependencies makes R4 a validator rather than a prompt; the additive rule permits exactly one
  declared carve-out.
- **tradeoff:** Phase 3 is large and could have been split per surface. Kept whole because its
  schema, validator and skill changes are mutually dependent — a schema accepting `model_tier` with
  no validator reading it, or a skill resolving it with no schema permitting it, are both worse
  intermediate states than one bigger phase.
- **tradeoff:** Phase 7 owns six requirements with no code of their own. The alternative was leaving
  them unowned, which the requirement-phase-mapper rule forbids and which would let the rebuild
  obligation go unasserted.
- **assumptions Build must preserve:** A3 holds narrowly — documentation establishes the mechanism,
  not that this integration uses it correctly. Build must not treat placing the five member
  definitions as satisfying R5.
- **downstream:** Build executes six phases, one commit each, naming manifest IDs. Review inherits
  strict `api_contracts` and `constraints_safety` from the intent map, and should concentrate on
  R9's blast radius, R2's execution proof and R10's false-positive surface — the three places where
  a passing suite would not establish safety. Test owes two manual QA records (R2, RI11), one host
  read-back (R5), and revert-and-rerun evidence for every CLI-side fix. Ship owes the ledger
  closures, the Notion update on the user's request, and must not dispatch 1.1.0 before all ten land.
  Reflect should capture the `check-trigger-predicates` tension found during this chain's own
  pending-setup pass, which is unrelated to the package but was discovered by it.

## Open Questions

None. All four of brief v2's questions were resolved by the user on 2026-10-03, and no new question
arose in planning. `orchestration.blockers` is empty.

## Checkpoint Approval

- Checkpoint: plan-review
- Status: approved
- User's own words (verbatim, this turn): "Continue to build"
- Context: given in direct response to this plan's presentation — the six phases, their binary exit
  gates, the dependency order, and the three flagged risks (R9's deletions, R10's consumer-gate
  surface, structural husky detection).

## Exit Gate

- [x] Every active R and RI mapped to a phase, with exactly one owning phase each.
- [x] Every phase has a binary exit gate.
- [x] Verification plan covers every R and RI.
- [x] Dependency order is explicit.
- [x] Risks have mitigations; none requires a waiver.
- [x] Source-of-truth and release handling are explicit.
- [x] Branch strategy is explicit and does not target the default branch.
- [x] User approved or waiver recorded.
