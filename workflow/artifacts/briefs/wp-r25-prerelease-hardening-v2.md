---
slug: wp-r25-prerelease-hardening
version: 2
artifact: brief
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
  - user-request
  - workflow/artifacts/briefs/wp-r25-prerelease-hardening-v1.md
  - OI-112
  - OI-113
  - OI-114
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
    reason: "task_class is complex, so `task_class != trivial` satisfies the trigger on its own. Ran — the surface map drove the three-bucket split and is in Architecture Notes."
  - skill: architecture-decision-advisor
    decision: ran
    reason: "touches_contract and new_surface both true. Decision re-taken in v2 after the user overturned the v1 enforceability conclusion; rejected alternatives recorded in Architecture Notes."
  - skill: constraint-conflict-scan
    decision: ran
    reason: "task_class is complex, satisfying `task_class != trivial`. Ran against domain.yaml constraints and repo-profile protected paths — result in Constraints."
---

# WP-R25 Pre-Release Hardening - Brief v2

## Source Links

- `workflow/artifacts/briefs/wp-r25-prerelease-hardening-v1.md` — v1, carrying the council run and the four questions
- `workflow/artifacts/open-items.yaml` — OI-112, OI-113, OI-114 (filed 2026-09-30)
- Notion `1.1.0 — Minor Release Work Plan` — the authoritative scope record
- `docs/release-checklist.md` — dispatch preconditions
- `CLAUDE.md` — golden rules 2, 3, 4, 5, 7

## Problem

Three defects were reported from consumer-repo testing on 2026-09-30, after all eight 1.1.0 packages
had merged and the branch was waiting only on dispatch. A Complex-class Think council found two of
the three correctly identified but incorrectly diagnosed, and surfaced seven further defects — four
reachable by consumers, one created by the fix originally proposed, and one that puts the release's
own rehearsal evidence in doubt.

v1 escalated four decisions to the user. All four were answered on 2026-10-03, and one answer
overturned a conclusion v1 had drawn: that enforcing a council model tier was not achievable inside
a minor release. That conclusion rested on two errors, both now corrected — see Architecture Notes.

**Scope as decided: all ten defects ship in 1.1.0, and the tier is enforced rather than declared.**

## Goals

- `init` refuses to build a repo against definitions it cannot validate against.
- The gate lands where it survives a dependency install **and executes**.
- Council capability is chosen before any spend, enforced at dispatch, and recorded.
- The council record contract actually runs in a consumer repo.
- The release's own rehearsal evidence is re-derived before dispatch.
- All of it inside a minor bump.

## Non-Goals

- Re-measuring council cost across Complex chains (OI-76, stays in 1.2.0).
- Whether Review councils should be reachable below Complex class (OI-111).
- Implementing `doctor`. Several checks this work adds are natural `doctor` subjects; the verb stays a stub.
- Changing fan-out defaults. `per_phase` keeps 3/2; this work adds the capability axis.
- Adding an `effort` key. Per the user's decision, `council.depth` gains the operational definition
  it never had instead of acquiring a synonym.

## User Impact

A consumer upgrading from 1.0.1 today has four silent failure modes: a config the resolved schema
rejects, a gate that reports itself installed while absent, a gate that persists but never runs, and
— in a linked worktree — an `upgrade` that is permanently broken. After this work each fails loudly
and names its remedy, and council spend is a decision the user made rather than a bill they discover.

## Success Metrics

- A `init` against a global tree with no version stamp exits non-zero naming the remedy.
- A husky v9 repo, after `npm install`, shows the gate running in real `git commit` output — not
  merely present on disk.
- A Complex chain with no resolved `model_tier` stops before any research or dispatch, via a
  validator rather than prose.
- A dispatched council member demonstrably runs on the mapped model, read back from the host.
- `agentsmyth check` runs the council-record contract in a consumer repo.
- `npm run validate`, `violations:test`, `conformance:test` pass; `mutation:audit` reports 0
  undefended for every validator rule added.

## Requirements

See Requirement Manifest. Eleven explicit requirements and twelve implicit ones.

## Constraints

From `constraint-conflict-scan` against `workflow/config/domain.yaml` and `repo-profile.yaml`:

- **`[provider-neutrality-1]`** — no provider mandatory by default. Still decides R3/R5's shape:
  shared config names a tier, never a model id, and each adapter owns its own mapping. **No conflict.**
- **`[safety-2]`** — destructive actions need approval. Bears on R2 and R9: the relocation must not
  clobber a hook the user owns, and bundle pruning deletes files, so it must delete only paths the
  manifest proves agentsmyth wrote.
- **`[safety-3]`** — no claiming external state without evidence. Bears on R5: where a host can
  silently override a declared model, the record carries requested **and** actual.
- **`[product-2]`** — compatibility and release impact are material. Carried as RI1.
- Protected paths are untouched. R9 is the only requirement that deletes anything, and its blast
  radius is bounded by the provenance manifest.

## Risks

- **R9 deletes files.** Bundle pruning is the only destructive requirement here. Scoped wrongly it
  removes a consumer's own content. It must delete only paths the previous manifest records as
  agentsmyth-written and the current bundle no longer declares.
- **R2's fix created a defect once already.** Appending the gate below host content under `sh -e`
  produces a gate that survives and never runs (F64). The fix must write gate-first, and acceptance
  is commit output rather than file presence.
- **R10 changes what runs on every consumer commit.** Wiring the council-record contract into
  `agentsmyth check` adds ~30 rules to the gate. A false positive there blocks commits.
- **R5 depends on five external formats.** Each adapter's member definition is a separate format;
  two of five cannot express per-member effort the same way. Mapping errors are silent.
- **One sub-requirement is genuinely non-additive** (F59): adding a key to
  `check-council-record.mjs`'s literal required-field array breaks the four existing council
  artifacts. Dev-local, fixable in the same commit, but it must be stated not discovered.
- **Scope at the end of a release.** The branch was dispatch-ready and now carries ten defects.

## Open Questions

All four of v1's questions were resolved by the user on 2026-10-03. See Questions For User for each
decision as taken. No question remains open; `orchestration.blockers` is empty.

## Requirement Manifest

### Explicit (R)

- **R1** — `init` must not proceed against a global definitions tree it cannot validate against. (OI-112)
  - Acceptance: given a global tree with no version stamp or a stamp differing from the CLI's, `init`
    refreshes it or exits non-zero naming the remedy, at all three entry points (`init` at
    bin:2915, `headlessBootstrap` at bin:562, and `check` at bin:139). Pinned by revert-and-rerun
    against a named assertion.
- **R2** — The gate must be installed where it both survives a dependency install and executes. (OI-113, folding F64)
  - Acceptance: in a husky v9 repo, after `npm install`, a real `git commit` shows the gate's output;
    the gate is written **before** any host content in the target file; the advertised path equals the
    written path; husky v8 and tracked-`.githooks` repos keep working. Detection is structural
    (`basename === '_'` plus an `h` sibling), never a literal `.husky` match. The fix lives in
    `resolveHooksDir()` so all four callers agree by construction.
- **R3** — `council.depth` gains an operational definition, and `council.model_tier` is added as the
  capability axis. No `effort` key. (OI-114, per the user's Q2 decision)
  - Acceptance: the three starter blocks and both council skills state what a member does differently
    at `shallow`/`standard`/`deep`; `model_tier` accepts `cheap|standard|deep` and rejects a literal
    model id; both resolve through the documented global-then-repo order.
- **R4** — An unresolved `model_tier` on a Complex chain stops the chain **before** Think stage 1 and
  before any fan-out, enforced mechanically. (per the user's Q1 decision)
  - Acceptance: `check-lifecycle --phase think` fails a Complex chain whose resolved config carries
    no `model_tier`, with a message naming the remedy; the failure occurs before any member is
    dispatched and before research begins; a non-interactive run fails with that stated reason rather
    than hanging. The rule carries its own rejection fixture per RI5.
- **R5** — The tier is **enforced**, not merely declared. (per the user's Q3 decision)
  - Acceptance: `init` places a per-tool council-member definition carrying the mapped model and
    effort for each of the five adapters; council members are dispatched as **fresh-context** agents
    naming that definition, so the host honors the mapping; the record carries the requested tier and
    the actual model where the host reports it. Demonstrated by reading a dispatched member's model
    back from the host, not by the config's presence.
- **R6** — All of this ships in 1.1.0. (User decision, 2026-10-03, reaffirmed under challenge.)
  - Acceptance: the `[1.1.0]` CHANGELOG entry covers all ten defects; no dispatch before they land.
- **R7** — A husky repo must not produce a false reconcile item or back up husky's own generated shim. (folding F22)
  - Acceptance: after a dependency reinstall, `upgrade` reports no drift for the gate file; no
    husky-generated content appears under `workflow/backups/`; the `reconcile.<version>.<path>` field
    name no longer double-dots.
- **R8** — `init` inside a linked worktree must not write a provenance entry its own reader rejects. (folding F18)
  - Acceptance: after `init` in a linked worktree, `upgrade` exits 0; no manifest entry escapes the
    repository; the gate remains live through the common dir.
- **R9** — `expandBundle` prunes files the current bundle no longer declares. (folding F62)
  - Acceptance: a file removed from the bundle between versions is absent from the global tree after
    `prepare`; only paths the manifest proves agentsmyth wrote are deleted; OS cruft and
    `validators/` copies are not candidates for deletion.
- **R10** — The council-record contract runs in a consumer repo. (folding F63)
  - Acceptance: `agentsmyth check` invokes `check-council-record.mjs`; a consumer repo with a
    malformed council record fails the gate; a repo with no council artifacts is unaffected.
- **R11** — The release's rehearsal evidence is re-derived, and the stray tarball removed. (folding F60)
  - Acceptance: `jeelvankhede-agentsmyth-1.0.1.tgz` is gone from the working tree; OI-69's rehearsal
    is re-run against a genuinely published 1.0.1 artifact, or OI-87's citation of it is corrected to
    say what was actually tested.

### Implicit (RI)

- **RI1** — Additive only, with one declared carve-out (F59). Acceptance: every pre-1.1.0 artifact and
  config validates unchanged, except the four dogfood council artifacts amended in the same commit.
- **RI2** — Staleness detection rests on "absent or differing stamp ⇒ stale", not on version equality
  alone. Published v1.0.1 never wrote a stamp, so absence covers every consumer-reachable case; the
  residual blind spot is dev-only and is recorded rather than closed.
- **RI3** — Five-adapter content sync holds. Acceptance: `render-adapters` reports shims current.
- **RI4** — Rebuild after any `src/` change. Acceptance: `npm run build` run; `dist/` reflects `src/`.
- **RI5** — The mutation ratchet applies to **validator rules only**; `bin/agentsmyth.mjs` is never a
  mutation target. Acceptance: every validator rule added reports 0 undefended; CLI-side fixes are
  pinned by revert-and-rerun against a named assertion.
- **RI6** — Zero runtime dependencies. Acceptance: `dependencies` stays empty.
- **RI7** — No regression for tracked-hooks-dir repos, and a superseded manifest entry is reported as
  superseded rather than as "recorded but no longer on disk".
- **RI8** — The ask belongs to the agent, not the CLI; no prompt is added under `bin/`. R4 satisfies
  this by failing a validator rather than prompting.
- **RI9** — Missing definitions must produce a diagnosable error, not an unhandled `ENOENT` stack
  trace from `lib.mjs`. Acceptance: `check` against a hollowed global tree names the missing file and
  the remedy.
- **RI10** — Adapter **delivery** parity is false today: Copilot installs on darwin only, Cursor gets
  no gate file at all. Acceptance: either delivery is fixed, or release copy and docs stop implying
  automatic five-tool gate installation. Not a silent carry-forward.
- **RI11** — husky v8 invokes the durable hook file directly and requires mode 0755; v9 only sources
  it. Acceptance: the written file carries the executable bit, and a v8 fixture proves it runs.
- **RI12** — The "Single caller by design" comment at bin:2000 is false four ways and is the first
  thing an implementer of R2 reads. Acceptance: corrected in the same change.

### Assumptions (A)

- **A1** — Superseded in v1 by measurement; the per-tool capability spread is recorded as findings.
- **A2** — `~/.agentsmyth/sandbox/agentsmyth` lies outside every repository. Corroborated: the
  council's before and after repo digests are byte-identical over 2162 files.
- **A3** — A host that resolves a named agent definition will honor the model and effort it declares
  for a fresh-context member. Grounded in F34 and in the Claude Code agent registry; Plan must verify
  per adapter, and R5's acceptance requires reading the model back rather than trusting the config.

### Open Questions (Q)

- **Q1** — Resolved 2026-10-03. Blocking semantics: stop before Think and before fan-out. → R4.
- **Q2** — Resolved 2026-10-03. Define `depth`, add `model_tier`, no `effort` key. → R3.
- **Q3** — Resolved 2026-10-03. Enforce the tier in 1.1.0; deferral rejected. → R5.
- **Q4** — Resolved 2026-10-03. All seven additional defects fold in. → R7, R8, R9, R10, R11, RI9, RI10.

## Questions For User

All four questions below were put to the user in v1 and answered on 2026-10-03. They are retained as
the record of what was asked, what was recommended, and what was decided — including the one case
where the decision went against the recommendation and was right to.

**Q1 — blocking semantics. RESOLVED: stop before Think runs and before fan-out.**
Recommendation had been to refuse the council and fall back to single-agent, resting on F58, F41,
F39 and F42. The user chose a stricter position. It is implementable and mechanical:
`check-lifecycle --phase think` is reached before Think stage 1, which is before any research or
dispatch — so the stated goal of preventing spend is actually met. v1's claim that nothing in the
validator set reaches the dispatch decision point was wrong; it was true only of the mechanism v1 had
proposed. Carried as R4.

**Q2 — `effort` versus `depth`. RESOLVED: define `depth`, add only `model_tier`.**
Matches the recommendation, resting on F28, F57, F26 and F27. `council.depth` already existed, was
already repo-tunable, and both schemas described it verbatim as per-member research effort; councils
never shipped in v1.0.1, so installed-base exposure is zero and only four dogfood artifacts carry it.
Carried as R3.

**Q3 — what to claim about the tier. RESOLVED: enforce it in 1.1.0. Deferral rejected.**
Recommendation had been a declared tier plus an availability record, resting on F56, F47 and F48.
**The user overruled it and was correct.** The recommendation rested on two errors: treating a new
file placement as a semver escalation when the release constraint is about schema compatibility, and
treating the fork model-override caveat as binding when councils require fresh context by contract
and therefore do not dispatch forks. Carried as R5, with enforcement demonstrated by reading the
model back rather than by config presence.

**Q4 — scope. RESOLVED: all seven additional defects fold in.**
Recommendation had been to fold three and file four, resting on F5, F18, F22, F60, F62, F63 and F64.
The user chose all seven. Note that Q3's answer makes F63 load-bearing rather than optional: without
the council-record contract running in a consumer repo, an enforced tier would still be recorded
unenforceably. Carried as R7 through R11, RI9 and RI10.

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
| R7 | B — does the hook path change eliminate the false drift report and the backed-up shim? | repo, trial |
| R8 | B — does a linked-worktree init produce a manifest its own reader accepts? | repo, trial |
| R9 | A — which paths may safely be pruned, and what proves agentsmyth wrote them? | repo, trial |
| R10 | C — what does wiring the council contract into `check` add to the consumer gate? | repo, trial |
| R11 | A — what did OI-69's rehearsal actually test, and against which artifact? | repo, trial |
| RI9 | A — where does the missing-definitions read throw, and what would name the remedy? | repo, trial |
| RI10 | C — which adapter gates actually install, on which platforms? | repo |
| RI11 | B — does husky v8 require the executable bit on the durable hook file? | repo, web |
| RI12 | B — how many callers does resolveHooksDir actually have? | repo |
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

**Superseded by v2 on three points.** The round's evidence stands; three of the parent's
*conclusions* from it did not survive the user's challenge of 2026-10-03, and are corrected in v2's
Architecture Notes: (1) that shipping native per-tool member definitions is non-additive — it is a
larger change but not a schema change, so it does not escalate the bump; (2) that a fork ignoring a
model override blocks tier enforcement — councils require fresh context by contract, so members are
not forks and the override applies; (3) that nothing in the validator set reaches the dispatch
decision point — `check-lifecycle --phase think` does, which is what makes R4 mechanical.


## Architecture Notes

- role: Architect
- **decision, re-taken in v2 (architecture-decision-advisor, `touches_contract` + `new_surface`):**
  council capability is a portable two-value vocabulary in shared config — `model_tier`
  (`cheap|standard|deep`) plus the existing `depth` given a real definition — translated per adapter
  into a **native council-member definition** that the host resolves at dispatch. Members run as
  fresh-context agents naming that definition, which is what makes the mapping take effect.
- **v1's conclusion was wrong and is corrected here.** v1 concluded the tier could be declared but
  not enforced inside 1.1.0. Two errors:
  - *Additivity.* v1 treated "a new file-placement class" as non-additive. The release constraint is
    "new optional fields with safe defaults, no required-schema change" — a schema statement. New
    files are not a schema change, and `init` already places tool-native per-repo files at
    `.cursor/rules/agentsmyth.mdc` and `.github/copilot-instructions.md`, so this is the same shape
    as work the CLI already does. Larger, not escalating.
  - *Forks.* v1 took the fork model-override caveat as binding. The council contract requires fresh
    context for members, so members are not forks and the override applies. The caveat was true and
    irrelevant.
- **rejected: per-tool model ids in shared config.** Conflicts with `[provider-neutrality-1]`.
- **rejected: adding an `effort` key.** Duplicates `depth`'s stated meaning.
- **rejected: declared-tier-plus-availability-record.** This was v1's recommendation. It is the
  honest shape *if* enforcement is impossible; enforcement is possible, so recording a tier nobody
  honors would ship exactly the fake-enforcement shape this repo has already named once.
- **constraint:** additive-only with one declared carve-out; zero dependencies rules out a prompt
  library, which is why R4 is a validator rather than a prompt; five-adapter sync makes R5 a
  five-format change; `[safety-2]` bounds R9's deletions to manifest-proven paths.
- **tradeoff:** a tier is one level less precise than naming a model, and a repo wanting to pin one
  uses `extensions:`. Accepted for provider neutrality.
- **tradeoff:** R10 adds ~30 rules to the consumer commit gate. Accepted because Q3's answer makes an
  unenforced record pointless, but it raises the cost of a false positive and Test must cover a repo
  with no council artifacts.
- **assumption Plan must verify:** A3, per adapter.
- **downstream:** Plan should sequence in three groups — (1) R1, RI2, RI9 and R8, all CLI-side
  resolution fixes pinned by revert-and-rerun; (2) R2, R7, RI7, RI11, RI12, the hook group, all
  flowing from one change inside `resolveHooksDir()`; (3) R3, R4, R5, R10, the council contract group,
  which carries the schema edits, the new validator rules and the five member-definition formats.
  R9 and R11 are independent and can run in parallel with any group. Build touches
  `bin/agentsmyth.mjs`, `src/workflow/agent-behavior.yaml`, three schemas, both council skills,
  three starter blocks, `check-lifecycle.mjs`, `check-council-record.mjs`, and five new adapter
  member-definition templates. Review inherits strict `api_contracts` and `constraints_safety` from
  the intent map resolved this session. Test must include: a husky v9 repo that **commits** after a
  dependency reinstall; a husky v8 permissions case; a no-stamp global tree; a linked worktree
  `init`-then-`upgrade`; a bundle-pruning case proving a consumer's own file survives; and a
  dispatched member whose actual model is read back from the host. Ship must not dispatch 1.1.0
  before all ten land, and must re-derive OI-69's evidence first (R11).

## Checkpoint Approval

- Checkpoint: brief-review
- Status: approved
- User's own words (verbatim, this turn): "Brief is approved, continue to plan"
- Context: all four of v1's blocking questions were answered 2026-10-03 (Q1 stop before fan-out,
  Q2 define `depth` and add `model_tier`, Q3 enforce the tier in 1.1.0, Q4 fold in all seven
  additional defects), and this approval covers v2's scope as written above.

## Exit Gate

- [x] Every active R and RI has acceptance criteria.
- [x] Blocking Q IDs appear in orchestration.blockers (none remain; all four resolved).
- [x] User approved or waiver recorded.
