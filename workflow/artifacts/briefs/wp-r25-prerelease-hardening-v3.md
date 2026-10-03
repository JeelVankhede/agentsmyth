---
slug: wp-r25-prerelease-hardening
version: 3
artifact: brief
status: blocked-for-user
created: 2026-10-03
updated: 2026-10-04
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
  - R12
  - R13
  - R14
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
upstream:
  - user-request
  - workflow/artifacts/briefs/wp-r25-prerelease-hardening-v2.md
  - OI-112
  - OI-113
  - OI-114
orchestration:
  phase: think
  status: blocked-for-user
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

# WP-R25 Pre-Release Hardening - Brief v3

## Source Links

- `workflow/artifacts/briefs/wp-r25-prerelease-hardening-v2.md` — v2, approved 2026-10-03, carrying
  the council run and the four questions it escalated
- `workflow/artifacts/plans/wp-r25-prerelease-hardening-v1.md` — the approved plan, Phases 1-6
- `workflow/artifacts/tasks/wp-r25-prerelease-hardening-v1.md` — Build record, Phases 1-3 complete
- `workflow/artifacts/open-items.yaml` — OI-112, OI-113, OI-114

## Problem

v2's scope is delivered through Phase 3 and three more phases remain. v3 exists because using the
thing Phase 3 shipped surfaced that it was shaped wrong in one way and incomplete in two others.

The way it was shaped wrong is already fixed and carries no new requirement: the five adapter
mappings folded reasoning effort into the capability tier, so asking for more thinking meant also
asking for a different model, and the top two effort levels of the richest supported host were
unreachable by construction. Nothing in R3 or R5 asked for that coupling; it was a Build error and is
recorded as remediation.

What remains are three genuine additions, all raised by the user after seeing the result:

1. The resolved values are a repo-level default with no way to depart from them for one chain, so a
   chain that genuinely needs more thinking has to edit committed config to get it.
2. Nothing tells a user what a fan-out will cost before it happens. The council record does not carry
   token counts, so a repo accumulates no basis for ever answering that question.
3. Tier and effort are global-only, while fan-out is per phase. The asymmetry matters because
   **Review's output blocks a commit and Think's does not**, so Review is where capability is worth
   paying for and Think is where it is most often wasted.

## Goals

- A chain may depart from the configured defaults, and cannot do so silently.
- A user can see what a fan-out is likely to cost, from this repo's own history rather than a formula.
- Tier and effort are configurable per phase, without reintroducing a merge defect this repo has
  already shipped once and documented.

## Non-Goals

- Predicting cost from a model of fan-out and rounds. Any such figure is invented, and
  `[safety-3]` forbids claiming external state without evidence. Cost is reported from recorded
  history or not at all.
- Cross-repo or aggregate cost history. The estimate is this repo's own runs; borrowing another
  repo's numbers would describe different work.
- Asking the user to confirm an override every time. A gate whose most common answer restores the
  status quo trains bypass, which the council established while rejecting a mandatory prompt.
- Re-opening the three axes settled in v2 and the Phase 3 remediation.

## User Impact

Today a Complex chain spends what the repo config says and reports it afterwards. After this work the
spend is visible beforehand in terms of what this repo has actually paid, departures from the default
are possible and permanently attributable, and the phase whose verdict blocks commits can be funded
differently from the phase whose verdict does not.

## Success Metrics

- A council record carries per-member token counts, and a second run in the same repo produces an
  estimate derived from the first.
- A repo with no council history states that it has none and projects nothing.
- A per-phase override of one key leaves every sibling key and every other phase untouched,
  demonstrated by a fixture rather than by inspection.
- An override with no stated reason is rejected by a validator, not by review.

## Requirements

Every active requirement is restated in full below rather than referenced from v2. A brief that
points at its predecessor is not self-contained: a reader cannot resolve the manifest from the
artifact in front of them, and neither can the validator that checks downstream artifacts against it
— which is how this was caught. R6's "all of this ships in 1.1.0" now covers R12 to R14 as well, per
the user's decision of 2026-10-04.

## Constraints

Everything in v2's Constraints still binds. Three bear directly on the new work:

- **`[safety-3]`** decides R13's shape outright. An estimate computed from fan-out and rounds is a
  fabrication; an estimate computed from recorded runs is evidence. The first is forbidden.
- **`[provider-neutrality-1]`** governs R13's token counts as it governed the tier: not every host
  reports per-member usage, so an adapter that cannot supply it records `unavailable` rather than
  zero, and zero must never be averaged in as though it were a measurement.
- **The additive rule** still holds. Every key R12 to R14 add is optional with the resolved global as
  its fallback.

## Risks

- **R14 walks into a defect this repo has already shipped and documented.** `check-council-record`
  resolves council config with a flat top-level spread, and `per_phase` is map-valued. Adding
  `model_tier` and `effort` inside `per_phase` entries without deepening that merge reproduces
  exactly the failure `lib.mjs` describes: a repo naming one key silently loses its siblings, and the
  loss is invisible because nothing errors. This is the single highest risk in v3 and is why RI13
  exists as a prerequisite rather than a cleanup.
- **R13 can easily become the fabrication it exists to avoid.** The pressure to show a number when
  there is no history is the whole hazard. A first run must say so.
- **R12 is a cost surface.** An override that is easy to set and easy to forget is a spend with no
  owner, which is why the reason is mandatory rather than encouraged.
- **Scope again.** This release was dispatch-ready four fixes ago. v3 adds three more.

## Open Questions

None blocking. Three design choices are deliberately left to Plan rather than decided here, because
they are sequencing and placement questions rather than scope ones: how many past runs the estimate
averages and where that number is configured; whether the estimate surfaces at the Think gate or at
council invocation; and whether per-adapter token availability is declared in the adapter file
alongside the effort-axis declaration that already lives there.

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

- **R12** — A chain may depart from the resolved council configuration for that run, and the
  departure is recorded with its reason.
  - Acceptance: a run may raise `depth`, `model_tier` or `effort` above the resolved value; the
    council record carries the resolved configured value AND the override AND a non-empty reason;
    `check-council-record` rejects an override whose reason is absent or empty, with its own
    rejection fixture; a run that does not override records no override, since absence must not read
    as a departure.
- **R13** — Council cost is reported from this repo's recorded history, before the fan-out happens.
  - Acceptance: every council record carries per-member token counts, or `unavailable` for a host
    that does not report them; an estimate surfaced before dispatch states the mean per-member cost
    over the last N recorded councils in this repo and the projection for the current fan-out; a repo
    with no recorded council states that and projects nothing; no code path computes a cost from
    fan-out and rounds alone. A host reporting nothing contributes `unavailable`, never zero.
- **R14** — `model_tier` and `effort` are configurable per phase, alongside `default_fan_out`.
  - Acceptance: `council.per_phase.<phase>` accepts `model_tier` and `effort`; a repo naming one key
    of one phase changes that key only, leaving that phase's other keys and every other phase at
    their resolved global values; a fixture proves a partial per-phase map does not drop siblings;
    Review and Think can carry different tiers simultaneously.

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

- **RI13** — The council configuration resolver must merge per entry, one level into `per_phase`,
  before R14 adds anything there.
  - Acceptance: the resolver no longer uses a flat top-level spread for map-valued council keys; a
    rejection fixture proves a partial per-phase override preserves sibling keys; the fix lands
    BEFORE or WITH R14, never after. Citations: `src/workflow/validators/lib.mjs:98-106` for the
    documented failure mode, `src/workflow/validators/check-council-record.mjs:27` for the flat
    spread that currently resolves council config.

### Assumptions (A)

A1-A3 as in v2. New:

- **A4** — The host reports per-member token usage to the parent for at least the reference
  implementation, so R13 has a real source on at least one adapter. Plan must verify this per adapter
  rather than assume it uniformly; where it does not hold, the adapter declares token availability
  `unavailable` beside its effort-axis declaration, and R13's estimate is simply unavailable there
  rather than fabricated.

### Open Questions (Q)

Q1-Q4 resolved in v2. No new blocking questions; the three Plan-owned design choices are listed under
Open Questions above.

## Questions For User

All of v2's questions remain resolved as recorded there. v3 raises no new blocking question: the user
originated R12, R13 and R14 and chose to fold all three into 1.1.0 on 2026-10-04, including the
per-phase addition after it was offered as optional. No finding references accompany these three
requirements because no council finding produced them — they came from using what Phase 3 shipped.

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
| R12 | parent — user-originated after Phase 3; the only open sub-question is where a reasonless override is rejected | repo |
| R13 | parent — user-originated; what makes it answerable is whether the host reports per-member usage, which A4 settles by observation | repo, trial |
| R14 | parent — user-originated; the research question it depends on was already answered by this round's finding on the config resolver | repo |
| RI13 | A — does the council config resolver merge deeply enough to carry a map-valued key? | repo, trial |
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

**v3 note on provenance.** R12, R13 and R14 are NOT council findings. They were raised by the user on
2026-10-04 after reading what Phase 3 shipped, and they carry no finding references because no
finding produced them — stated explicitly rather than left to look like an omission. The council's
work does bear on them in one decisive place: the shallow-merge hazard that constrains R14 is a
finding from this run, and it is why R14 arrives with a prerequisite attached rather than as a
straightforward schema addition.


## Architecture Notes

- role: Architect
- **decision — cost is reported, never predicted.** R13's estimate is the mean of recorded per-member
  costs in this repo, projected onto the current fan-out. The alternative, computing a figure from
  fan-out times rounds times some assumed per-member cost, was rejected outright: it produces a
  confident number with no evidence behind it, which `[safety-3]` forbids and which this repo's whole
  posture is against. A first council in a repo therefore has nothing to say, and says that.
- **decision — the override is permitted, not prompted.** R12 lets a chain depart from config and
  requires a reason. It does not ask the user to confirm each time, because the council established
  that a gate whose most common answer restores the status quo trains bypass. The enforcement is
  retrospective and mechanical: no reason, no valid record.
- **decision — RI13 is a prerequisite, not a cleanup.** R14 cannot be built on the current resolver.
  The flat spread would silently drop sibling keys inside `per_phase`, reproducing a failure this
  repo has already shipped once in a different block and documented at length. Sequencing RI13 after
  R14 would mean shipping the defect and then removing it.
- **constraint:** additive only, so every new key is optional with the resolved global as fallback;
  zero runtime dependencies; and per-adapter honesty — an unavailable token count or effort axis is
  recorded as unavailable, never as a zero or as satisfied by a neighbouring axis.
- **tradeoff:** the estimate is only as good as the history, and early runs in a repo will be noisy.
  Accepted: a noisy number labelled as the mean of two runs is honest, and a precise-looking number
  with no runs behind it is not.
- **tradeoff:** per-phase configuration multiplies the resolution surface. Accepted because the
  asymmetry it serves is real — a Review verdict blocks a commit and a Think verdict does not.
- **assumption Plan must verify:** A4, per adapter.
- **downstream:** Plan owns one new phase and must sequence RI13 ahead of R14 within it. Build touches
  `src/workflow/agent-behavior.yaml`, the three schemas, `check-council-record.mjs`, both council
  skills, the five adapter member definitions, and the violations fixtures. Review should concentrate
  on RI13's merge depth and on whether any code path can produce a cost figure without history behind
  it. Test owes a partial-per-phase fixture proving siblings survive, a no-history case, and an
  override-without-reason rejection. Ship inherits R6 unchanged: nothing dispatches until all of it
  lands.

## Checkpoint Approval

- Checkpoint: brief-review
- Status: pending — the user originated R12, R13 and R14 and chose to fold all three into 1.1.0, but
  has not yet seen this brief's own content. Approving the additions is not the same as approving the
  acceptance criteria written for them, and Plan must not start until they have.

## Exit Gate

- [x] Every active R and RI has acceptance criteria.
- [x] Blocking Q IDs appear in orchestration.blockers (none remain).
- [ ] User approved or waiver recorded.
