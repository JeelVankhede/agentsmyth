---
slug: wp-r25-prerelease-hardening
version: 1
artifact: brief
status: blocked-for-user
created: 2026-10-03
updated: 2026-10-03
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
upstream:
  - user-request
  - OI-112
  - OI-113
  - OI-114
orchestration:
  phase: think
  status: blocked-for-user
  next_phase: plan
  blockers:
    - Q1
    - Q2
    - Q3
    - Q4
  user_checkpoint: brief-review
council:
  mode: council
  authorization: explicit
  cap_resolved: 3
  cap_source: configured
  depth: standard
  dispatch_depth: 1
  rounds_run: 1
  termination_reason: user-decision-required
  resolution:
    dispatch_enabled: optional
    council_enabled: on-for-complex
    task_class: complex
  repo_integrity:
    before: 9c229de559f736aa5a15a6d9db4375fa5c4597d738c2fb45b05ba44952598bb8
    after: 9c229de559f736aa5a15a6d9db4375fa5c4597d738c2fb45b05ba44952598bb8
    algorithm: sha256/sorted-relpath+size+content
  evidence_classes:
    repo: used
    trial: used
    web: used
    recall: unused
skill_trigger_log:
  - skill: repo-alignment-scan
    decision: ran
    reason: "task_class is complex, so `task_class != trivial` satisfies the trigger on its own. Ran — the surface map is in Architecture Notes and drove the three-bucket split."
  - skill: architecture-decision-advisor
    decision: ran
    reason: "touches_contract and new_surface both true — the change alters repo-profile.schema.yaml, the CLI verb surface and all five adapter gates. Decision and rejected alternatives recorded in Architecture Notes."
  - skill: constraint-conflict-scan
    decision: ran
    reason: "task_class is complex, satisfying `task_class != trivial`. Ran against domain.yaml constraints and repo-profile protected paths — result in Constraints."
---

# WP-R25 Pre-Release Hardening - Brief

## Source Links

- `workflow/artifacts/open-items.yaml` — OI-112, OI-113, OI-114 (filed 2026-09-30)
- Notion `1.1.0 — Minor Release Work Plan` — the authoritative scope record for this release
- `docs/release-checklist.md` — dispatch preconditions
- `CLAUDE.md` — golden rules 2 (rebuild), 3 (adapter sync), 4 (zero deps), 5 (validate), 7 (evidence)

## Problem

Three defects surfaced in consumer-repo testing on 2026-09-30, after all eight 1.1.0 work packages
had merged and the branch was waiting only on dispatch. The council found that two of the three were
correctly identified but incorrectly diagnosed, and surfaced seven further defects — three of them
reachable by consumers, one of them created by the fix originally proposed.

`init` links a repo to whatever global definitions tree is already on the machine and installs one
only when none exists, so a newer CLI can seed config values against an older schema that rejects
them. The gate hook is written to whatever `core.hooksPath` resolves to, which under husky v9 is a
directory husky overwrites on every install. And councils fan out with no model or effort parameter,
so cost is neither chosen nor recorded.

## Goals

- `init` refuses to build a repo against definitions it cannot validate against.
- The gate hook lands somewhere that survives a dependency install **and actually executes**.
- Council cost is chosen deliberately and recorded honestly, including when it cannot be enforced.
- All of it lands in 1.1.0 without escalating the release past a minor bump.

## Non-Goals

- Re-measuring council cost across Complex chains (OI-76, stays in 1.2.0).
- Whether Review councils should be reachable below Complex class (OI-111).
- Implementing `doctor`. The checks this work adds are natural `doctor` subjects; the verb stays a stub.
- Changing fan-out defaults. This work adds the capability axis; `per_phase` keeps 3/2.
- Adding native per-tool agent definition files (`.claude/agents/` and the four equivalents). The
  council established this is a new file-placement class and not an additive change — see F56.

## User Impact

A consumer upgrading from 1.0.1 currently has three ways to end up in a state the package cannot
honestly describe: a config the resolved schema rejects, a gate that reports itself installed while
being absent, and — in a linked worktree — an `upgrade` that is permanently broken. All three are
silent. After this work they fail loudly and name the remedy.

## Success Metrics

- A stale-tree `init` exits non-zero naming the remedy, demonstrated against a global tree with no
  version stamp (the real shape of a published-1.0.1 install).
- A husky v9 repo keeps a gate that both survives `npm install` **and prints its output on commit**,
  demonstrated by a real commit, not by file presence.
- A council record states the requested tier and whether it was honored, unavailable, or unknown.
- `npm run validate`, `violations:test`, `conformance:test` pass; `mutation:audit` reports 0
  undefended for any validator rule added.

## Requirements

See Requirement Manifest.

## Constraints

From `constraint-conflict-scan` against `workflow/config/domain.yaml` and `repo-profile.yaml`:

- **`[provider-neutrality-1]`** — "Do not make any source, ticketing, hosting, CI, package, or
  deployment provider mandatory by default." Decides R5's shape: a per-tool model block would make
  one tool the configured default and leave four wrong-by-default. The portable tier satisfies it.
  **No conflict with the chosen approach.**
- **`[safety-2]`** — destructive actions need approval. Bears on R2: the relocation must not clobber
  a hook the user owns, and must stay marker-bounded.
- **`[safety-3]`** — "Do not claim external state without evidence." Bears on R5 directly: a tier
  that cannot be verified as honored must not be recorded as honored (F56).
- **`[product-2]`** — compatibility and release impact are material, carried as RI1.
- Protected paths (`.git/**`, `.env*`, `**/*secret*`) are untouched.

Hard repo rules: zero runtime dependencies (RI6), rebuild after source change (RI4), five-adapter
sync (RI3), mutation ratchet where it actually applies (RI5).

## Risks

- **A fix that makes the gate survive but not run.** F64 demonstrated this: appending the gate to
  `.husky/pre-commit` places it after host content under `sh -e`, and `husky init` always
  pre-populates that file — so the common case is a gate that persists and never executes. This is
  the single highest risk in the package because it would satisfy OI-113's stated acceptance
  criterion while leaving the repo unprotected.
- **Recording a tier as enforced when nothing enforces it.** The repo has already shipped this shape
  once and named it: "the config key, the schema, the documentation and the resolver all exist,
  which makes the requirement look enforced from every angle except the one that matters"
  (`workflow/artifacts/tasks/wp-r22-review-council-v1.md`).
- **`check-council-record.mjs` never runs in a consumer repo** (F63). Anything OI-114 adds there is
  enforced in this repo's dev suite only.
- **The release's additive constraint.** One sub-requirement is genuinely non-additive (F59).
- **Scope at the end of a release.** The branch was dispatch-ready; it now waits on three fixes plus
  whatever of the seven new findings is folded in.

## Open Questions

Four survive and all four need user authority. See Questions For User.

## Requirement Manifest

### Explicit (R)

- **R1** — `init` must not proceed against a global definitions tree it cannot validate against. (OI-112)
  - Acceptance: given a global tree with no version stamp, or a stamp differing from the CLI's,
    `init` either refreshes it or exits non-zero naming the remedy; it never writes a config whose
    values the resolved schema would reject. Verified by reverting the guard and watching a named
    assertion go red (RI5's applicable discipline).
- **R2** — The gate must be installed where it both survives a dependency install and executes. (OI-113)
  - Acceptance: in a husky v9 repo, after `npm install`, a real `git commit` shows the gate running;
    the advertised path equals the written path; a husky v8 repo and a tracked-`.githooks` repo both
    keep working. Demonstrated by commit output, not file presence.
- **R3** — Council dispatch carries an explicit capability parameter, resolved from config and
  recorded on the run record. (OI-114)
  - Acceptance: a council-mode artifact records the resolved capability value alongside
    `cap_resolved`/`cap_source`. **Blocked on Q2** — whether the effort axis is a new `effort` key
    or the existing `council.depth` given an operational definition.
- **R4** — When the capability parameter is unresolved at council invocation, behaviour is defined
  and recorded, and no path deadlocks a non-interactive run.
  - Acceptance: **blocked on Q1** — the two candidate behaviours have opposite CI semantics.
- **R5** — Shared config names a portable tier, never a tool-specific model identifier; the record
  states whether the tier was honored.
  - Acceptance: `repo-profile.yaml` accepts a tier enum and rejects a literal model id; the council
    record carries `honored | unavailable | unknown`. **Partially blocked on Q3.**
- **R6** — OI-112, OI-113 and OI-114 ship in 1.1.0. (User decision, 2026-10-03.) **Closed.**
  - Acceptance: the `[1.1.0]` CHANGELOG entry covers all three; no dispatch before they land.

### Implicit (RI)

- **RI1** — Additive only: new optional keys with safe defaults, no required-field change, or 1.1.0
  escalates to 2.0.0. **Closed with one declared carve-out** (F59).
  - Acceptance: every pre-1.1.0 artifact and config validates unchanged, except the four dogfood
    council artifacts amended in the same commit if Q2 adds a required field.
- **RI2** — Staleness detection must not rest on version-string equality alone. **Closed, and the
  original conclusion was overturned**: published v1.0.1 never wrote `installed-version.txt` at all,
  so every consumer-reachable stale tree has *no* stamp, and "absent ⇒ stale" covers it. The
  version string then suffices; the residual blind spot is dev-only.
  - Acceptance: the guard treats an absent or unparseable stamp as stale, and the brief records the
    dev-only false negative explicitly rather than paying a digest's cost to close it.
- **RI3** — All five adapters carry the same gate content. **Closed, and found false in delivery**
  (F49): Copilot installs on darwin only; Cursor gets no gate file at all.
  - Acceptance: release copy does not claim automatic five-tool gate delivery.
- **RI4** — Rebuild after any `src/` change. Acceptance: `npm run build` run; `dist/` reflects `src/`.
- **RI5** — The mutation ratchet applies to **validator rules only**. `bin/agentsmyth.mjs` is never
  a mutation target and citing the audit for it is, in the repo's own words, "a category error".
  **Corrected from the original filing.**
  - Acceptance: any validator rule added reports 0 undefended; CLI-side fixes are pinned by
    revert-and-rerun against a named assertion.
- **RI6** — Zero runtime dependencies. Acceptance: `dependencies` stays empty.
- **RI7** — The relocation must not regress a tracked-hooks-dir repo, nor leave a false "missing"
  report for a superseded manifest entry (F55).
  - Acceptance: a `.githooks` repo keeps its manifest entry; a repo whose manifest records
    `<dir>/_/pre-commit` sees it reported as superseded, never as "recorded but no longer on disk".
- **RI8** — A blocking ask belongs to the agent, not the CLI. **Closed, with the mechanism
  overturned**: the blocked-artifact pattern fires at the *downstream* phase gate, which is after a
  Think council has already billed (F58). Nothing in the current validator set reaches the dispatch
  decision point.
  - Acceptance: whatever Q1 selects is checked at the moment it claims to control, or is recorded as
    prose-only.

### Assumptions (A)

- **A1** — Superseded by evidence. The per-tool capability spread was measured, not assumed; see the
  Findings table. The surviving uncertainty is narrower and is Q3.
- **A2** — `~/.agentsmyth/sandbox/agentsmyth` lies outside every repository, so council sandbox
  writes cannot mutate this repo by construction. **Corroborated**: `repo_integrity.before` and
  `.after` are byte-identical across the run.

### Open Questions (Q)

- **Q1** — Does "never start without an answer" mean block the Think phase, or refuse the council and
  fall back to single-agent? Owner: user. Blocking: yes.
- **Q2** — Add a new `effort` key, or give the existing `council.depth` the operational definition it
  never got? Owner: user. Blocking: yes.
- **Q3** — Ship the tier as declared-plus-availability-record, or not at all until it can be
  enforced? Owner: user. Blocking: yes.
- **Q4** — Which of the seven newly found defects fold into WP-R25, and which are filed for later?
  Owner: user. Blocking: yes.

## Questions For User

**Q1 — blocking semantics.** (bucket R4; rests on F58, F41, F40, F42)
*Recommendation: refuse the council and run single-agent with a recorded refusal; do not block the
phase.* The blocked-artifact mechanism fires at the downstream phase gate, so it stops the chain
*after* a Think council has already fanned out and billed — it cannot deliver the cost control it
appears to (F58). The repo also already decided this exact question for the sibling cost knob: the
fan-out item's own comment calls it "the one config value that bills the user on every Complex
chain" and ships it non-blocking with "leave unset to inherit both" (F41). And "unset" today
means "the model the user launched" — a choice already made — so a mandatory prompt would stop a
Complex chain to ask a question whose most common answer restores the status quo.

**Q2 — `effort` versus `depth`.** (bucket R3; rests on F28, F57, F26, F27)
*Recommendation: define `depth`, do not add `effort`.* `council.depth: shallow|standard|deep`
already exists, is already repo-tunable, and is already recorded in artifact frontmatter — and both
schemas describe it verbatim as "per-member research effort", which is the proposed key's meaning.
What it lacks is semantics: nothing says what a member does differently at `shallow` versus `deep`.
Councils never shipped in v1.0.1, so installed-base exposure is **zero** and the only carriers are
four dogfood artifacts here — a free pre-release window to define it rather than duplicate it. Keep
`model_tier` as the genuinely new axis, since capability is not what `depth` expresses.

**Q3 — what to claim about the tier.** (bucket R5; rests on F56, F47, F48, F36, F37)
*Recommendation: ship a declared tier plus a per-run availability record.* The two challengers
disagreed here and both were right about different things — see Conflicts. A tier can be *declared*
portably and cheaply; it cannot be *enforced* on council members in 1.1.0, because agentsmyth
dispatches no native per-tool agent definitions, and on the reference implementation a
context-inheriting fork ignores a model override by design. The repo already has the honest pattern
for exactly this: `web` and `trial` evidence classes are specified and recorded as
`used`/`unused`/`unavailable` precisely because the package cannot supply them.

**Q4 — scope of the seven new findings.** (bucket R1 and R2; rests on F5, F18, F22, F61, F62, F63, F64)
*Recommendation: fold in three, file four.* Fold **F64** (the gate that survives but does not
run — it is a defect in R2's own fix and R2 is unsafe without it), **F22** (the false reconcile
loop, fixed by the same path change), and **F5** (the empty-tree accept, closed for free by
R1's "absent ⇒ stale"). File **F18** (linked-worktree `upgrade` permanently broken),
**F62** (the global tree never prunes), **F63** (`check-council-record` unreachable from
`agentsmyth check`), and **F61** (the stray tarball, below).

**One of those four is release-gating on its own.** `jeelvankhede-agentsmyth-1.0.1.tgz` sits
untracked in the repo root and its bundle carries council content, which never shipped in v1.0.1 —
so it is an unreleased-1.1.0 build wearing the 1.0.1 version string. OI-87 cites OI-69 as having
"rehearsed the upgrade against the real published tarball". If that rehearsal used this file it
tested 1.1.0 → 1.1.0 and could not have reproduced OI-112. **That evidence should be re-checked
before it is cited in the dispatch decision**, independently of everything else here.

## Council Log

### Requirement Classification

Written at stage 2, before any dispatch.

| Manifest ID | Question bucket | Evidence classes |
|---|---|---|
| R1 | A — can `init` proceed against content-divergent global definitions, and what detects it? | repo, trial |
| RI2 | A — can a version string distinguish pre-bump content from genuine old content? | repo, trial |
| RI5 | A — what does the mutation ratchet require for a newly added error? | repo, trial |
| R2 | B — what path is written vs advertised per `hooksPath` config, and does husky destroy it? | repo, trial, web |
| RI7 | B — does relocating the hook regress a tracked-hooks-dir repo? | repo, trial |
| R3 | C — where must the capability parameter be added to resolve and validate? | repo |
| R4 | C — where can a blocking ask live without deadlocking a headless run? | repo |
| RI8 | C — does the CLI prompt anywhere today, and what forbids it? | repo |
| R5 | C — can each of the five tools honor a model/effort tier at all? | web, repo |
| RI3 | C — what keeps the five adapters in sync, mechanically? | repo |
| RI1 | C — what exactly must hold for historical artifacts and configs to keep validating? | repo, trial |
| R6 | C — which surfaces record release scope for 1.1.0? | repo |
| RI4 | parent — rebuild obligation, settled by repo rule, no research needed | repo |
| RI6 | parent — zero-dependency obligation, settled by repo rule, no research needed | repo |

### Members

| Member | Role | Round | Capabilities | Sandbox |
|---|---|---|---|---|
| m1 | researcher | 1 | read + fetch + search; repo-axis fence instruction-enforced (see note) | ~/.agentsmyth/sandbox/agentsmyth/m1/ |
| m2 | researcher | 1 | read + fetch + search; repo-axis fence instruction-enforced | ~/.agentsmyth/sandbox/agentsmyth/m2/ |
| m3 | researcher | 1 | read + fetch + search; repo-axis fence instruction-enforced | ~/.agentsmyth/sandbox/agentsmyth/m3/ |
| c1 | challenger | 1 | read + fetch + search; sourcing attack, web spot-check duty | ~/.agentsmyth/sandbox/agentsmyth/c1/ |
| c2 | challenger | 1 | read + fetch + search; reasoning attack | ~/.agentsmyth/sandbox/agentsmyth/c2/ |

**Capability note, recorded rather than glossed.** The repo-axis fence ("no member modifies the
repository") was enforced by instruction in each member's charter, not by the host's agent type. A
read-only agent type exists on this host and would have fenced edits and nesting structurally; it
was not used because its stated purpose is locating code rather than auditing behaviour. The fence
is therefore corroborated after the fact by `council.repo_integrity`, not guaranteed before it.
m1 additionally disclosed that one early trial ran with `cwd` set to this repository; it exited
non-zero before any write path and created nothing. That is a fence violation in intent which only
the CLI's own refusal prevented from becoming a write, and it is the concrete argument for using a
structurally-fenced agent type next time.

**`repo_integrity` provenance.** `before` was taken shortly after dispatch, corroborated by
`git status --porcelain --untracked-files=all` at the same moment showing exactly the four files
this chain had already modified and zero untracked additions. `after` was taken with this brief
moved outside the repository, since the digest covers `workflow/artifacts/` and the parent's own
stage-7 write would otherwise register as a change. Both values are byte-identical over 2162 files.

### Rounds

| Round | Researchers | Challengers | Open in | Open out | Items closed | Sizing rationale |
|---|---|---|---|---|---|---|
| 1 | 3 | 2 | 14 | 3 | R1, R2, R6, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8 | Cap 3 from the configured `dispatch.max_parallel_workstreams`; three independent buckets matched the three findings. Two challengers because the round produced web findings across five external products, and the sourcing duty is separable from the reasoning attack. |

No round 2. Every surviving item needs user authority rather than more evidence, which the contract
defines as escalation rather than another round.

### Findings

Counts: m1 24, m2 22, m3 32, c1 17 spot-checks + 10 defects, c2 6 challenges + 5 defects. The table
records the consolidated set that informed this brief; the remainder were corroborating detail and
are merged into the rows below.

| Finding | Member | Role | Round | Surface | Evidence class | Citation | Disposition | Reason / merged into |
|---|---|---|---|---|---|---|---|---|
| F1 | m1 | researcher | 1 | init prepare guard | repo | bin/agentsmyth.mjs:2915 | accepted | Existence-only guard confirmed; fix point is the predicate. |
| F2 | m1 | researcher | 1 | init prepare guard | repo | bin/agentsmyth.mjs:562 | accepted | Second copy of the same guard; a fix at one site is incomplete. |
| F3 | m1 | researcher | 1 | init prepare guard | repo | bin/agentsmyth.mjs:139 | accepted | `check` is a third entry point via headlessBootstrap. |
| F4 | m1 | researcher | 1 | init prepare guard | repo | bin/agentsmyth.mjs:251 | accepted | Only `prepare` and `upgrade` refresh unconditionally. Confirms the parent's premise verbatim. |
| F5 | m1 | researcher | 1 | empty global tree | trial | sandbox ~/.agentsmyth/sandbox/agentsmyth/m1/; command: `node run.mjs emptyrepo emptyhome init`; output: "--- EXIT: 0 ---" with the global tree still empty, then agentsmyth check output: "Error: ENOENT: no such file or directory, open '.../emptyhome/.agentsmyth/workflow/agent-behavior.yaml'" | accepted | New defect. Guard cannot distinguish "installed" from "a directory exists". Closed for free by "absent ⇒ stale". |
| F6 | m1 | researcher | 1 | version-string signal | trial | sandbox ~/.agentsmyth/sandbox/agentsmyth/m1/fakehome; command: `node -e comparing package.json version against installed-version.txt and digesting both schemas`; output: "CLI package.json version : 1.0.1", "global installed-version  : 1.0.1", "version-string comparison : EQUAL -> no skew detected", "digest stale schema (1.0.1): 3ba9103afb6952fe", "digest CLI schema  (HEAD) : 3ff6675d6095b86f" | accepted | Version equality is blind at identical stamps. Superseded in consequence by F54. |
| F7 | m1 | researcher | 1 | release bundle ordering | repo | .github/workflows/release.yml | accepted | Bundle is built before the version bump, so no build-embedded version can be correct. |
| F8 | m1 | researcher | 1 | OI-112 reproduction | trial | sandbox ~/.agentsmyth/sandbox/agentsmyth/m1/stalerepo; command: `node .agentsmyth/validators/check-config.mjs after init seeded PS-9..PS-12 and intent.repo_character was written where PS-9 directs`; output: "check-config: failed with 1 issue(s)", "- workflow/config/repo-profile.yaml.intent is not allowed", "--- EXIT: 1 ---" | accepted | The regression test R1 needs; runs offline in under a second. |
| F9 | m1 | researcher | 1 | schema delta | repo | src/workflow/schemas/repo-profile.schema.yaml:229 | accepted | Root `additionalProperties: false` is what turns a mixed install from degraded into rejected. |
| F10 | m1 | researcher | 1 | skew warning | repo | bin/agentsmyth.mjs:152 | accepted | Warns, never blocks — and never fires on the OI-112 path, since it compares the repo stamp against the CLI, not the global tree. |
| F11 | m1 | researcher | 1 | skew warning | repo | bin/agentsmyth.mjs:184 | accepted | The warning's remediation seeds the very items a stale schema rejects, making a mixed install worse. |
| F12 | m1 | researcher | 1 | validator reach | repo | bin/agentsmyth.mjs:206 | accepted | `agentsmyth check` never runs check-config, which is why the `extensions:` workaround persisted unchallenged. |
| F13 | m1 | researcher | 1 | mutation ratchet scope | repo | test/run-mutation-audit.mjs:38 | accepted | Corrects RI5 as originally filed. Verified verbatim by parent and by c1-S12. |
| F14 | m1 | researcher | 1 | test placement | repo | test/run-init-prepare-interop-tests.mjs | accepted | New scenario belongs here; no fixture directory exists to create. |
| F15 | m2 | researcher | 1 | resolveHooksDir | repo | bin/agentsmyth.mjs:2006 | accepted | Single point of resolution; honors core.hooksPath with no durability notion. |
| F16 | m2 | researcher | 1 | advertised path | repo | bin/agentsmyth.mjs:2000 | accepted | Written and advertised agree by construction. **Refutes OI-113's framing** — the defect is durability, not disagreement. |
| F17 | m2 | researcher | 1 | husky v9 install | trial | sandbox ~/.agentsmyth/sandbox/agentsmyth/m2/trial2/repo; command: `HOME=scratch node bin/agentsmyth.mjs init in a husky v9 repo`; output: "init exit=0", ".husky/_/pre-commit" carrying the agentsmyth marker block after husky's shim, advertised line "A pre-commit hook at `.husky/_/pre-commit` rejects any commit", manifest "- path: .husky/_/pre-commit" | accepted | All three surfaces name the gitignored, regenerated file. |
| F18 | m2 | researcher | 1 | linked worktree | trial | sandbox ~/.agentsmyth/sandbox/agentsmyth/m2/trial3/wt; command: `HOME=scratch node bin/agentsmyth.mjs upgrade in a linked worktree after init`; output: "agentsmyth: workflow/provenance.yaml exists but could not be read.", "entry 6 names path \"../main/.git/hooks/pre-commit\", which escapes the repository", "upgrade exit=1" | accepted | New defect, separable. `upgrade` permanently broken with no user error. Q4. |
| F19 | m2 | researcher | 1 | husky regeneration | web | https://raw.githubusercontent.com/typicode/husky/main/index.js retrieved 2026-10-03 — "l.forEach(h => w(_(h), `#!/usr/bin/env sh\\n. \"$(dirname \"$0\")/h\"`, { mode: 0o755 }))" | accepted | Mechanism is unconditional overwrite, not delete. Spot-checked by c1-S1. |
| F20 | m2 | researcher | 1 | husky dispatcher | web | https://raw.githubusercontent.com/typicode/husky/main/husky retrieved 2026-10-03 — "[ ! -f \"$s\" ] && exit 0" and "sh -e \"$s\" \"$@\"" | accepted | husky does execute `.husky/pre-commit`, so the proposed target runs. Spot-checked by c1-S2. |
| F21 | m2 | researcher | 1 | husky v8 | web | https://raw.githubusercontent.com/typicode/husky/v8.0.3/src/index.ts retrieved 2026-10-03 — "const { error } = git(['config', 'core.hooksPath', dir])" | accepted | Bug is v9-specific; v8 already resolves to the durable file. Spot-checked by c1-S3. |
| F22 | m2 | researcher | 1 | false reconcile loop | trial | sandbox ~/.agentsmyth/sandbox/agentsmyth/m2/trial2/repo; command: `HOME=scratch node bin/agentsmyth.mjs upgrade after re-running husky install`; output: "drifted         .husky/_/pre-commit  (edited since agentsmyth wrote it)", "6 unchanged, 1 edited, 0 missing", "Added 1 reconcile item(s)", and the recorded field "reconcile.1.0.1..husky/_/pre-commit" | accepted | New defect; fixed by the same path change. Also exposes a double-dot field name. Q4. |
| F23 | m2 | researcher | 1 | fix placement | repo | bin/agentsmyth.mjs:1491 | accepted | Load-bearing: three other sites re-derive the path, so the fix must live in resolveHooksDir. Verified independently by parent. |
| F24 | m2 | researcher | 1 | clobber risk | repo | bin/agentsmyth.mjs:2243 | accepted | Marker-block logic appends and then rewrites only its own span, so no user hook is clobbered. |
| F25 | m2 | researcher | 1 | test coverage | repo | test/run-agents-md-tests.mjs | accepted | No husky fixture and no worktree fixture exist; new coverage required. |
| F26 | m3 | researcher | 1 | council config surface | repo | src/workflow/agent-behavior.yaml:141 | accepted | No model or effort key anywhere; the "six keys" count at :186 is prose nothing derives. |
| F27 | m3 | researcher | 1 | tunable allowlist | repo | src/workflow/schemas/repo-profile.schema.yaml:244 | accepted | Single canonical enumeration, so one schema edit suffices. |
| F28 | m3 | researcher | 1 | depth/effort collision | repo | src/workflow/schemas/repo-profile.schema.yaml:288 | accepted | `depth` already claims "per-member research effort". Basis for Q2. Refined by F57. |
| F29 | m3 | researcher | 1 | stricter-or-unchanged | repo | src/workflow/schemas/repo-profile.schema.yaml:250 | accepted | The "two exceptions" sentence is already false; three capacity keys can already raise cost. |
| F30 | m3 | researcher | 1 | external precedent | web | https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference retrieved 2026-10-03 — "effortLevel string Replaced—repository takes precedence" | accepted | Independent product classifies model/effort as replaceable capacity. Spot-checked by c1-S8. |
| F31 | m3 | researcher | 1 | validator required set | repo | src/workflow/validators/check-council-record.mjs:318 | accepted | Literal six-key array; adding a seventh breaks all existing council artifacts. Blast radius confirmed by c1-S15. |
| F32 | m3 | researcher | 1 | deferral mechanism | repo | src/workflow/validators/lib.mjs:808 | accepted | `x_enforcement` cannot reach `additionalProperties: false` or `required`. Strengthened by c1-D10. |
| F33 | m3 | researcher | 1 | Claude capability | web | https://code.claude.com/docs/en/sub-agents retrieved 2026-10-03 — "effort No Effort level when this subagent is active. Overrides the session effort level." | accepted | Model and effort are separate per-subagent fields. Spot-checked by c1-S4. |
| F34 | m3 | researcher | 1 | Codex capability | web | https://learn.chatgpt.com/docs/agent-configuration/subagents retrieved 2026-10-03 — "A custom agent file that sets only model preserves this previously resolved effort." | accepted | Mapping must always emit both axes. Spot-checked by c1-S5. |
| F35 | m3 | researcher | 1 | Cursor capability | web | https://cursor.com/docs/subagents retrieved 2026-10-03 — "claude-opus-5[effort=high] Sets reasoning effort to high." | accepted | Effort fuses into the model string, so the adapter owns the split. Spot-checked by c1-S6. |
| F36 | m3 | researcher | 1 | tier is a request | web | https://cursor.com/docs/subagents retrieved 2026-10-03 — "Cursor also overrides a configured model when your team admin blocks it, your plan doesn't include it" | accepted | A declared tier can be silently replaced, so it must not be recorded as what ran. Basis for Q3. |
| F37 | m3 | researcher | 1 | Windsurf capability | web | https://docs.devin.ai/cli/subagents retrieved 2026-10-03 — quote: "There is no way to name a model for a subagent in a prompt — the run_subagent tool takes a profile, not a model." Frontmatter table lists name, description, model, allowed-tools, max-nesting; grep for effort and reasoning both return zero | accepted | No effort axis; tier collapses to one model id. Spot-checked by c1-S7. |
| F38 | m3 | researcher | 1 | skill nativeness | repo | bin/agentsmyth.mjs:2407 | rejected-with-reason | Cited correctly but the conclusion "inert in all five tools" is false — the path is Claude's native Personal skill directory. Refuted by F47; see Conflicts. |
| F39 | m3 | researcher | 1 | blocked-artifact pattern | repo | src/workflow/rules.md | merged | Mechanism correct, moment wrong. Merged into F58. |
| F40 | m3 | researcher | 1 | pending-setup is non-blocking | repo | src/workflow/schemas/pending-setup.schema.yaml | accepted | Non-blocking is a contract of the family, not a default. |
| F41 | m3 | researcher | 1 | prior cost decision | repo | bin/agentsmyth.mjs:306 | accepted | The sibling cost knob was deliberately shipped non-blocking with inherit defaults. Basis for Q1. |
| F42 | m3 | researcher | 1 | refusal enum | repo | src/workflow/schemas/artifact-frontmatter.schema.yaml | accepted | A seventh refusal value is the additive alternative to blocking. Enum widening never rejects existing data. |
| F43 | c1 | challenger | 1 | husky regeneration | web | https://raw.githubusercontent.com/typicode/husky/main/index.js retrieved 2026-10-03 — quote: "w(_('.gitignore'), '*')" and quote: "f.rmSync(_('husky.sh'), { force: true })" — w is writeFileSync and the only rmSync targets husky.sh, so hook files are overwritten rather than deleted | accepted | Mandatory web spot-check. CONFIRMED. |
| F44 | c1 | challenger | 1 | Windsurf docs | web | https://docs.devin.ai/cli/subagents retrieved 2026-10-03 — quote: "Pin a model in a custom subagent profile." Both docs.windsurf.com Cascade subagents URLs 308 cross-domain into a 404 on the same date, so this resolved page is the only citable source | accepted | Mandatory web spot-check. CONFIRMED, with the correction that the 404 is the effective response, not the first hop. |
| F45 | c1 | challenger | 1 | guard duplication | repo | bin/agentsmyth.mjs:562 | accepted | DRIFTED: guards are expression-identical but not byte-identical (indentation differs), so an exact-line detector would miss the pair. |
| F46 | c1 | challenger | 1 | skill nativeness | repo | bin/agentsmyth.mjs:2407 | accepted | REFUTED F38's conclusion. See Conflicts. |
| F47 | c1 | challenger | 1 | skill nativeness | repo | bin/agentsmyth.mjs:2407 | accepted | `~/.claude/skills/agentsmyth/SKILL.md` is a native Personal skill, loaded in this very session. Verified independently by parent. |
| F48 | c1 | challenger | 1 | skill frontmatter hazard | web | https://code.claude.com/docs/en/skills.md retrieved 2026-10-03 — "model No Model to use when this skill is active. The override applies for the rest of the current turn" | accepted | Setting model/effort there would silently override the user's session — an installer changing user settings. Shapes Q3. |
| F49 | c1 | challenger | 1 | adapter delivery parity | repo | bin/agentsmyth.mjs:2363 | accepted | Copilot is darwin-gated; Cursor gets no gate file. Golden rule 3 holds for content, not delivery. Verified independently by parent. |
| F50 | c1 | challenger | 1 | Copilot capability | web | https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference retrieved 2026-10-03 — "subagents.agents object Per-agent model configuration, keyed by agent name" with optional effortLevel | accepted | Corrects the parent's matrix: Copilot does have per-agent effort, in config rather than frontmatter, plus a modelPolicy lock. |
| F51 | c1 | challenger | 1 | citation durability | web | https://code.claude.com/docs/en/sub-agents retrieved 2026-10-03 — quote: "Model to use: `sonnet`, `opus`, `haiku`, `fable`, a full model ID" — reached only after docs.claude.com/en/docs/claude-code/sub-agents redirected cross-domain; three of eight cited URLs rotted this way on the same date | accepted | Record resolved URLs with retrieval dates, or the next reader marks them unverifiable. Applied in this table. |
| F52 | c1 | challenger | 1 | husky v8 exec bit | web | https://raw.githubusercontent.com/typicode/husky/v8.0.3/src/index.ts retrieved 2026-10-03 — quote: "const { error } = git(['config', 'core.hooksPath', dir])" with hook files written at mode 0o0755, so under v8 the file is invoked as the hook and needs the executable bit | accepted | Under v8 the file is invoked as the hook and needs the exec bit; under v9 it is only sourced. A gate written without chmod runs on v9 and silently fails on v8. |
| F53 | c1 | challenger | 1 | deferral mechanism | repo | src/workflow/validators/check-schema-keywords.mjs | accepted | `x_enforcement` misplacement is a hard validator error, so the restriction is double-guarded, not incidental. Strengthens F32. |
| F54 | c2 | challenger | 1 | version-string signal | repo | bin/agentsmyth.mjs:2324 | accepted | REFUTED the digest proposal. Published v1.0.1 never wrote the stamp, so "absent ⇒ stale" is mandatory and then sufficient. Verified independently by parent. |
| F55 | c2 | challenger | 1 | fix placement | repo | bin/agentsmyth.mjs:1136 | accepted | WEAKENED: placement upheld but for a different reason — governance receives hookPath as a parameter, so the fix propagates automatically. Literal `.husky` match refuted; detect structurally. |
| F56 | c2 | challenger | 1 | tier enforceability | repo | src/workflow/skills/think-council/SKILL.md | accepted | REFUTED the honorable-tier claim. No native agent definitions are shipped; a context-inheriting fork ignores a model override. Basis for Q3. |
| F57 | c2 | challenger | 1 | depth/effort collision | repo | src/workflow/schemas/agent-behavior.schema.yaml | accepted | WEAKENED "decorative" but strengthened the inference. Councils absent from v1.0.1, so exposure is zero — a free rename window. Verified independently by parent. |
| F58 | c2 | challenger | 1 | blocking moment | repo | src/workflow/validators/check-lifecycle.mjs | accepted | WEAKENED P5 decisively: the gate fires at the downstream phase, after the council has billed. Basis for Q1. |
| F59 | c2 | challenger | 1 | additivity | repo | src/workflow/validators/check-council-record.mjs:318 | accepted | WEAKENED P6: only one sub-requirement is non-additive, and that validator never runs in a consumer repo, so the break is dev-local. |
| F60 | c2 | challenger | 1 | stale comment | repo | bin/agentsmyth.mjs:2000 | accepted | "Single caller by design" is false four ways and is the comment an implementer reads first. |
| F61 | c2 | challenger | 1 | stray tarball | trial | repo root jeelvankhede-agentsmyth-1.0.1.tgz; command: `tar -xzOf jeelvankhede-agentsmyth-1.0.1.tgz package/dist/workflow-bundle.md then grep -c think-council`; output: "11" against "0" for git show v1.0.1 of agent-behavior.yaml | accepted | An unreleased-1.1.0 build wearing the 1.0.1 string. Puts OI-69's rehearsal evidence in doubt. Verified independently by parent. Q4. |
| F62 | c2 | challenger | 1 | global tree pruning | trial | sandbox ~/.agentsmyth/sandbox/agentsmyth/c2/; command: `comm -23 of the 255 files in ~/.agentsmyth/workflow/ against the bundle's 250 FILE: manifest entries`; output: "validators/hooks/pre-commit", which exists nowhere under src/workflow/validators/ | accepted | `expandBundle` never prunes, so retired files live forever. A second staleness channel no version stamp detects. Q4. |
| F63 | c2 | challenger | 1 | validator reach | repo | scripts/validate-template.mjs:47 | accepted | The whole council-record contract never executes in a consumer repo. Verified independently by parent. Q4. |
| F64 | c2 | challenger | 1 | fix-created defect | trial | sandbox ~/.agentsmyth/sandbox/agentsmyth/c2/huskytest; command: `git commit with the gate block appended below a host command in .husky/pre-commit, executed by husky under sh -e`; output: "husky - pre-commit script failed (code 1)" with "GATE RAN" never printed | accepted | The proposed fix produces a gate that survives and does not run. Highest-severity finding in the round. Q4, folded in. |

### Reconcile Contract

Declared before dispatch. The three buckets were cut to be independent; overlap was expected at two
seams.

1. **`bin/agentsmyth.mjs` is read by all three researchers.** m1 owns the `init`/`prepare` linkage
   and the version stamp, m2 owns hook resolution and AGENTS.md advertisement, m3 owns council
   parameter resolution. A finding outside its owner's seam is admissible but merges INTO the
   owner's finding, with the owner's citation primary.
2. **The additive constraint (RI1) touches every bucket.** m3 owns it; RI1 observations from m1 or m2
   merge into m3's, since one consolidated statement beats three partial ones.

Disagreement on a shared surface is NOT collapsed — it is recorded in Conflicts with both citations
and the parent's resolution, because two members reading the same file differently is a signal about
the file rather than noise to average. Duplicate findings with identical claims and citations
collapse to the earliest member number, recorded `merged` with the target named.

The challenge stage was added to this contract at dispatch: challengers receive raw research
findings, never the parent's synthesis, and a challenger finding that refutes a researcher finding
is recorded against both rather than replacing it.

### Conflicts

| Surface | Findings | Resolution |
|---|---|---|
| skill nativeness | F38, F46, F47, F48, F56 | **Both challengers are right about different questions, and the researcher's citation was right while its conclusion was wrong.** `~/.claude/skills/agentsmyth/SKILL.md` *is* a native Personal skill and its frontmatter *is* live — c1 proved it, and the parent confirmed it by having loaded that skill in this session. But it is the single global *invocation entrypoint*, whose scope is the session, not a per-council-member definition; and c1-D2 shows setting model/effort there would override the user's whole session. c2 is independently right that `subagent_type` and `.claude/agents` appear nowhere in `src/`, so no member-scoped definition exists to carry a tier. Resolution: the tier is **declarable but not enforceable on a council member in 1.1.0**. F38 is recorded `rejected-with-reason` for its conclusion; F47, F46 and F56 are all accepted. This drives Q3. |
| version-string signal | F6, F54 | Both accepted; they answer different questions. Version equality *is* blind at identical stamps, which m1 proved by trial. But published v1.0.1 never wrote a stamp at all, so every consumer-reachable stale tree is caught by "absent ⇒ stale" — after which the version string suffices. The blind spot is real and dev-only. RI2's acceptance criterion now records it explicitly rather than paying a digest's cost to close it. |
| husky v8 | F21, F52 | Both accepted. v8 resolves to the durable path, so the *location* is already correct there — but v8 invokes that file as the hook rather than sourcing it, so it additionally requires mode 0755. "v8 works by accident" is true of the path and false of the permissions. R2's acceptance criterion covers both versions for this reason. |

### Termination

- Reason: `user-decision-required`.
- Surviving items and their round history:
  - R3 — open in round 1, not closed. Round 1 established where the parameter must be added and
    that `council.depth` already claims the effort semantics (F28, F57). What remains is a naming
    and compatibility decision with a free pre-release window, which is the user's to make. → Q2.
  - R4 — open in round 1, not closed. Round 1 established that the proposed blocking mechanism
    fires after the spend it was meant to prevent (F58) and that the repo already decided the
    sibling case the other way (F41). What remains is what the user meant by "never start". → Q1.
  - R5 — open in round 1, partially closed. The per-tool capability matrix was settled by
    evidence; what remains is whether to ship a tier that can be declared but not enforced. → Q3.

## Architecture Notes

- role: Architect
- **decision (architecture-decision-advisor, triggered on `touches_contract` and `new_surface`):**
  the capability control is expressed as a portable tier in shared config, with per-tool translation
  owned by the adapter layer — **and recorded with an availability status rather than as an enforced
  parameter**, because the council established it cannot be enforced on a council member in 1.1.0.
  - **rejected: per-tool model block.** Conflicts with `[provider-neutrality-1]` by making one tool
    the configured default and four wrong-by-default; five values per repo on a maintenance
    treadmill a new supported tool silently breaks.
  - **rejected: effort-only, no capability axis.** Does not address the reported problem.
  - **rejected: native per-tool agent definitions.** Would make the tier genuinely enforceable, but
    it is a new file-placement class across five tools, is not additive, and on the reference
    implementation a context-inheriting fork ignores a model override anyway (F56).
  - **rationale:** the package's existing invariant is that shared config is tool-agnostic and
    adapters own tool-specific translation. The availability-status pattern is also already shipped,
    for `web` and `trial` evidence classes, for exactly this reason: agentsmyth specifies what it
    cannot supply and says so in the record rather than implying uniform support.
- **constraint:** additive-only is load-bearing for the bump size, with one declared carve-out
  (F59); zero runtime dependencies rules out a prompt library; five-adapter sync makes any gate
  change a five-file change — though delivery parity is already false (F49).
- **tradeoff:** a tier indirection is less precise than naming a model, and a repo wanting to pin one
  must use `extensions:`. Accepted — the alternative breaks provider neutrality.
- **tradeoff:** the version-string guard keeps a dev-only blind spot rather than paying for a digest
  that brings CRLF and accumulation hazards (F54, F62). Recorded in RI2 rather than hidden.
- **assumption Plan must verify:** none outstanding. A1 was superseded by measurement.
- **downstream:** Plan owns sequencing and should split R1/R2 (release-gating defect fixes, both
  CLI-side, pinned by revert-and-rerun) from R3/R5 (a new contract surface with validator and schema
  edits, pinned by the mutation ratchet). Build touches `bin/agentsmyth.mjs`,
  `src/workflow/schemas/{repo-profile,agent-behavior,artifact-frontmatter}.schema.yaml`,
  `src/workflow/agent-behavior.yaml`, both council skills, `check-council-record.mjs`, and — for R2's
  husky detection — no adapter file at all, since the advertised path is generated. Review inherits a
  strict `api_contracts` and `constraints_safety` posture from the intent map resolved this session.
  Test must include a real husky v9 repo that **commits** after a dependency reinstall (file presence
  is not sufficient — F64), a husky v8 permissions case (F52), and a no-stamp global tree
  (F54). Ship must not dispatch 1.1.0 before R1, R2 and whatever Q4 selects have landed, and must
  re-check OI-69's rehearsal evidence first (F61).

## Checkpoint Approval

- Checkpoint: brief-review
- Status: pending — the user has not responded to this brief's own content. Four blocking questions
  are open; Plan must not start until they are answered.

## Exit Gate

- [x] Every active R and RI has acceptance criteria.
- [x] Blocking Q IDs appear in orchestration.blockers.
- [ ] User approved or waiver recorded.
