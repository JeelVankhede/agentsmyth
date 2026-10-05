---
slug: wp-r25-prerelease-hardening
version: 1
artifact: reflect
status: done
created: 2026-10-05
updated: 2026-10-05
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
  - workflow/artifacts/plans/wp-r25-prerelease-hardening-v1.md
  - workflow/artifacts/tasks/wp-r25-prerelease-hardening-v1.md
  - workflow/artifacts/reviews/wp-r25-prerelease-hardening-v1.md
  - workflow/artifacts/verify/wp-r25-prerelease-hardening-v1.md
  - workflow/artifacts/ship/wp-r25-prerelease-hardening-v1.md
orchestration:
  phase: reflect
  status: done
  next_phase: done
  blockers: []
  user_checkpoint: none
---

# WP-R25 Pre-Release Hardening - Reflect

## Inputs

Full chain for `wp-r25-prerelease-hardening`: brief v2 (approved), plan v1 (8 phases), task v1
(8 phases complete), review v1 (`hold`, 22 findings), verify v1 (`ship`, 23/23), ship v1 (`ship`,
checkpoint approved 2026-10-05 with the words "Continue to reflect").

Gate at entry: `agentsmyth check --phase reflect --slug wp-r25-prerelease-hardening` → exit 0, with
both the upstream status and the checkpoint confirmed approved.

## Outcome

**Shipped as a chain; not yet released.** All 23 active requirements carry evidence and the ship
recommendation is `ship`. The release itself has not happened and was never this chain's to perform.

| Dimension | Status |
|---|---|
| Requirements | 23 of 23 shipped. None deferred, blocked or waived. |
| Review findings | 22 of 22 fixed with evidence. No waiver used. |
| Waivers recorded | none, in any phase of this chain |
| Release | **not performed.** `workflow_dispatch` on `release.yml`, owner: user |
| Branch | `feat/wp-r25-prerelease-hardening`, local only, 27 unpushed commits, no upstream |
| CI | **has not run on this work.** Every suite figure in the chain comes from one machine |
| Source-of-truth | not required (`providers: []`); a copy-ready Notion handoff is recorded in ship |
| Rollback | defined and not executed — `npm deprecate` plus a patch, explicitly not unpublish |
| Open items closed | OI-112, OI-113, OI-114 → done, rotated to archive |
| Open items remaining | OI-115 (gate delivery parity), pre-existing and by design |
| Finding-quality ledger | 154 proved-real archived; 1 pending row, which is WP-R18's FQ-63 |

The chain began as three consumer-reported observations and ended at 22 self-inflicted findings
fixed before release. That ratio is the outcome worth recording: the Review council found nine times
more than the field reported, and all of it in code written during this chain.

## What Worked

**The gate refused work four times and was right every time.** Twice for a changed file outside the
task's Changed Files, twice for paths outside the plan's Phase 8 Touches. Each refusal was a scope
record I had genuinely not written. The correct response was an explicit plan update, not a waiver,
and the fence accepted it immediately afterward — which is the mechanism behaving as designed rather
than as an obstacle.

**Asserting the WIRING, not the rule, is what closed F1.** The Think gate's rule was correct,
reachable, fixture-covered and mutation-defended while nothing invoked it, and every suite was green
throughout. The durable fix was a conformance case asserting that *every* phase skill invokes its own
gate — verified to fail when the single line is removed. Any defect of that shape is invisible to
rule-level testing by construction.

**Collapsing six findings into one defect family.** F3, F6, F7, F13, F14 and F20 were reported as six
problems and were one mistake with six faces: a string asked a question only the filesystem can
answer. One resolving helper plus one new suite closed all six, and because they are tested together,
a fix to one that leaves the helper wrong fails the others.

**Regression cases built by reverting the fix alone.** Every critical and most highs were verified by
restoring the pre-fix code and watching the named assertion go red. That caught two cases where my
test would have passed either way: X5 could never have caught F20 (its fixture directory is named
`nightly`, which the old shape test already excluded) and X6 could never have caught F5 (it steps the
version between runs, so the second backup never lands on the destination).

**Dogfooding found the defect in this repo.** F22 required a rendered council-member definition once
a tier resolves. agentsmyth had configured `model_tier: standard` and rendered nothing, so its own
Review council members ran on the host default — the finding demonstrated on its author. A consumer
would have hit it first otherwise.

## What Did Not Work

**I reported Phase 8 complete while two findings were open.** F8 and F13 both had two-obligation Fix
lines and I had landed one obligation each. The error was checking my memory of what I did instead of
each Fix line's own clauses, and it was caught because the user asked "are you sure" — not by any
step in the process. Re-auditing at CLAUSE level then found four MORE clauses never tested: each of
F11's three axes individually, F10's `standard` branch, F9's "unreadable" as distinct from absent,
and F12's array shape. All passed, but none had been verified when I claimed completion.

**A correct manual test existed and the defect shipped anyway.** `docs/release-checklist.md` has
described F5's double-edit rehearsal since 1.0.1. The code did not hold it. A checklist entry nothing
executes is not coverage, and this is the second time this repo has learned that — F1 is the same
lesson with a conformance case instead of a human.

**I created a known hazard twice in one phase.** `mutation:audit` mutates validator source in place.
I ran it concurrently with my own edits to those files, then did it again. Both results were
discarded rather than cited, which was right, but the cost was two ~20-minute runs and a real risk of
clobbering a fix. Nothing in the tool prevents it.

**Three probes failed on first run and all three were the probe's fault.** The instructive one:
`F21.2` asserted gate-before-host on the append path, where the gate being last is deliberate. I had
encoded the husky-specific invariant as a universal one — the same over-generalisation the code
itself avoids.

**Two of my own comments asserted properties the code lacked.** F14's prune comment claimed a
containment the code did not implement, and my Phase 4 comment claimed the ledger protected a
mid-prune crash when the write order made that false. A safety argument in a comment stops the next
reader from checking.

**Four claims in my own artifacts were wrong before I verified them.** "26 historical ship artifacts"
(33), an RI6 command I named but had not run, and twice telling the user `package.json` at 1.0.1 was
outstanding work when the release checklist's own first section says pre-bumping is the error.

## Surprises

**The global `model_tier: standard` default I shipped in Phase 3 would have made R4 vacuous.** F8
asked for a value-keyed gate; keying on the value exposed that a global default resolves a tier for
every repo that never answered. The feature and its own gate cancelled out, and no finding named it —
it surfaced only while fixing a different one.

**F4's guard became unreachable by its sibling fix.** Once F5 relocates a colliding backup, the noop
sweep can never encounter a protected path: reaching it requires this run's file to byte-match a
backup taken before an earlier rewrite of the same file, and if those match then that earlier run
changed nothing and raised no item. The precondition contradicts itself. The guard stays as a
backstop with the reasoning recorded beside it, because the next reader will look for its test.

**F9's proposed fix would never have fired.** The review asked for a catch on an unreadable
pending-setup file. The hand-rolled parser tolerates the malformed YAML I tested, so the catch had
nothing to catch; the value-based redesign fixes it structurally instead. A review can be right about
the defect and wrong about the remedy.

**154 finding-quality rows have settled `proved-real` with zero `noise`.** Across the entire history
of this ledger, no council finding has ever been judged as not holding up. Either the councils are
extraordinarily accurate, or `noise` is a verdict nobody reaches for — and the second is more likely
than the first.

## Manifest Coverage Retrospective

One row per active ID, traced brief → ship.

| Manifest ID | Brief asked | Shipped | Evidence | Notes |
|---|---|---|---|---|
| R1 | can `init` proceed against divergent global definitions | yes | `init-prepare-interop:test` 56/56, scenarios K–O | Stamp-based; rebuilt source at an unchanged version remains invisible, recorded not closed |
| R2 | what path is written vs advertised per `hooksPath` | yes | `upgrade-path:test` husky v9/v8/tracked blocks, six real commits | |
| R3 | where the capability parameter resolves and validates | yes | `tuning-merge:test` 18/18, nine rejection fixtures | Extended mid-chain by the user to depth/effort/per-phase |
| R4 | where a blocking ask can live without deadlocking headless | yes | `checkpoint-approval:test` 13/13, both remedies proven | Nearly vacated by my own Phase 3 default; see Surprises |
| R5 | can each of five tools honor a model/effort tier | partly | 5/5 templates install; definition required and recorded | **Host honouring unverified** — unobservable from here |
| R6 | which surfaces record release scope for 1.1.0 | yes | CHANGELOG dated and extended at Ship | Review's one unread surface; it understated rather than overstated |
| R7 | does the hook change remove the false drift report | yes | `upgrade-path:test` superseded-vs-missing cases | |
| R8 | does linked-worktree init produce a readable manifest | yes | `init-prepare-interop:test` worktree scenario | |
| R9 | which paths may safely be pruned | yes | `path-containment:test` 21/21 | Six Review findings landed here |
| R10 | what wiring the council contract into `check` adds | yes | `commit-coverage:test` 8/8 incl. the `--staged` leg | F18 found the wiring half-done |
| R11 | what OI-69's rehearsal actually tested | yes | re-derived against the published 1.0.1 | |
| RI1 | what keeps historical artifacts validating | yes | `validate` over 33 ship artifacts, 4 examples | Carve-out unused — no required field was added anywhere |
| RI2 | can a version string distinguish pre-bump content | yes | scenarios K–O | |
| RI3 | what keeps five adapters in sync mechanically | yes | `render-adapters: adapter shims are current` | |
| RI4 | rebuild obligation | yes | `npm run build` leaves no diff in generated paths | |
| RI5 | what the mutation ratchet requires of a new rule | yes | `violations:test` 239/239, attribution 123/123 | Twelve rules added, each with its own fixture |
| RI6 | zero-dependency obligation | yes | `dependencies: {}`, `npm ls --omit=dev` empty | |
| RI7 | does relocating the hook regress tracked-hooks repos | yes | X5, X5b, X6, X7, X8, HM1–HM5 | F5 and F20 landed here |
| RI8 | does the CLI prompt anywhere today | yes | records and never prompts | |
| RI9 | where the missing-definitions read throws | yes | fixture `fv` | Redesigned after the first approach removed a validator's ability to gate |
| RI10 | which adapter gates install, on which platforms | yes | `agents-md:test` 33/33, 4 gate files in the trial | OI-115 open by design |
| RI11 | does husky v8 need the executable bit | yes | HM1 and HM5 | Satisfied by assertion in Phase 2, made a real branch by F21 |
| RI12 | how many callers does resolveHooksDir have | yes | four, exercised by the husky blocks | |

22 fully shipped, 1 partial (R5). R5's mechanical half is complete and enforced from both sides; its
behavioural half is unobservable from this repository and is the first entry in the manual checklist.

## Deferred

| Item | Why deferred | Owner |
|---|---|---|
| Host honouring of the council-member definition (R5's behavioural half) | Unobservable from this repository by construction. Requires dispatching a real member and reading back which model answered. | user |
| Council execution on Codex, Copilot, Cursor, Windsurf | Templates install and are required; no member has ever run on a non-Claude host. | user |
| Windows end-to-end | No Windows host available to this chain. F7 is proven under `node:path/win32` semantics. | workflow owner |
| CI on this work | Branch is local with 27 unpushed commits. | user |
| `agentsmyth doctor` | Verb and help entry exist; no implementation. Gained a second customer this chain. | workflow owner |
| OI-115 gate delivery parity | Pre-existing, by design. | workflow owner |

## Source-of-Truth Outcome

**not required** — `source_of_truth.mode: optional`, `providers: []`. No external write was
performed, and none is claimed. A copy-ready Notion handoff is recorded in the ship artifact with
owner `user`; it is a recommended handoff, not a blocked one, so nothing in the chain is waiting on
it.

## Learning Candidates

Three, all `propose-only`. No curated learning file was edited.

**LC-1 — Assert the wiring, not the rule. (`propose-only`)**
A validator rule can be correct, reachable, fixture-covered and mutation-defended while nothing
invokes it, and every suite stays green. F1 and F18 were both that shape in one chain. When a phase
or surface gains a mechanical gate, add a check that the gate is INVOKED by the surface that claims
it — the rule's own tests cannot see this class, and neither can a mutation ratchet, because both
operate on a rule that is never reached.

**LC-2 — Verify a Fix line clause by clause, not finding by finding. (`propose-only`)**
Remediation of a review finding should be checked against each separable obligation in its Fix line.
Two findings here carried two obligations and had one landed each, and a finding-level check passed
both. Decomposing afterward found four further clauses never tested. The unit of verification should
match the unit the finding was written in.

**LC-3 — A checklist entry is not coverage until something executes it. (`propose-only`)**
`docs/release-checklist.md` described F5's exact rehearsal before 1.0.1 shipped and the defect
shipped anyway. Manual entries that CAN be automated should be promoted into suites and deleted from
the checklist; the ones that cannot — a different host, OS, or tool — are the entries that actually
need running, and are the ones a reader skips because they cost a machine and ten minutes.

## Follow-Ups

Each has an owner and a suggested artifact title. Those not already in the ledger are appended to
`workflow/artifacts/open-items.yaml` in this phase.

| Follow-up | Owner | Suggested artifact / ticket | New brief? | Status |
|---|---|---|---|---|
| Implement `agentsmyth doctor`: diagnose stale/absent/unstamped global installs and explain a `check-config` failure caused by old schemas rather than bad config | workflow owner | "WP: implement agentsmyth doctor" | yes | appended as OI-116 |
| Guard `mutation:audit` against concurrent work — refuse on a dirty tree, or take a lock | workflow owner | "WP: make the mutation ratchet safe to run alongside edits" | no | appended as OI-117 |
| Decide whether clause-level Fix-line verification belongs in the Review or Test contract rather than one chain's memory | workflow owner | "WP: clause-level finding closure in the lifecycle contract" | yes | appended as OI-118 |
| Investigate why 154 finding-quality rows have settled `proved-real` with zero `noise` — whether the councils are that accurate or `noise` is unreachable in practice | workflow owner | "WP: is `noise` a reachable finding-quality outcome?" | yes | appended as OI-119 |
| `ci.provider: none` in `release.yaml` while `.github/workflows/ci.yml` runs on every push — the config understates the real CI | workflow owner | "fix: release.yaml ci.provider understates actual CI" | no | appended as OI-120 |
| Two enum gaps carried from WP-R18: `cap_source` has no value for a cap the user raised in session; `closed_in_phase` has no member for work returning to Build | workflow owner | "fix: two lifecycle enum gaps" | no | appended as OI-121 |
| Host honouring of the council-member definition, the four non-Claude hosts, and Windows | user | `docs/release-checklist.md` manual section | no | recorded in the checklist, not the ledger — they are release-time checks, not backlog |
| OI-115 gate delivery parity | workflow owner | existing | no | remains open |
| FQ-63 (WP-R18 F7) ledger closure | workflow owner | existing | no | still pending; not this chain's to settle |

## Raw Session Entry

`workflow/learnings/sessions/2026-10-05-wp-r25-prerelease-hardening.md`

## Architecture Notes

- role: Project Manager
- decision: three learning candidates, all `propose-only`, no curation pass. Curation was not
  requested and the skill forbids it without an explicit ask.
- decision: the host-honouring, multi-tool and Windows gaps go in `docs/release-checklist.md` rather
  than the open-items ledger. They are not backlog — they are checks that must run at each release,
  and a ledger item would be "closed" once and then never re-run.
- constraint: no release, PR, push or CI evidence exists, because none was authorized. Every outcome
  claim in this chain is repo-local and says so.
- constraint: R5 is recorded as PARTIAL rather than shipped. Its mechanical half is enforced from
  both sides; whether a host honours the definition is unobservable here, and marking it shipped
  would make the artifact claim more than the evidence supports.
- tradeoff: LC-1 and LC-2 both propose new mechanical checks on a project whose central complaint
  this chain was that mechanisms exist without invocation. If either is adopted, the adoption must
  include the thing that invokes it — or it becomes an instance of what it warns about.
- assumption future runs should verify: that the CHANGELOG date 2026-10-05 matches the actual
  dispatch date; that `package.json` was left at 1.0.1 for `release.yml` to bump.
- downstream: six follow-ups appended to the ledger, two of which (doctor, clause-level closure)
  warrant their own briefs. The manual checklist section is now the durable home for what automation
  from inside this repo cannot reach.

## Exit Gate

- Reflect artifact exists at `workflow/artifacts/reflect/wp-r25-prerelease-hardening-v1.md`. ✓
- Raw learning session exists at
  `workflow/learnings/sessions/2026-10-05-wp-r25-prerelease-hardening.md`. ✓
- Manifest Coverage Retrospective has one row per active `R` and `RI` — 23 rows, each with a
  citation. ✓
- Outcome records release, source and rollback status explicitly: release not performed, source not
  required, rollback defined and not executed. ✓
- Learning candidates are tagged `propose-only`. ✓
- Follow-ups have owners and suggested titles; six are appended to the live ledger. ✓
- No curated learning file edited. ✓
- No unsupported external outcome claim appears — no PR, CI, release or registry state is asserted. ✓
- `orchestration.phase` is `reflect`, `status` is `done`, `next_phase` is `done`. ✓
- Finding-quality: this chain's 22 rows were settled at Phase 8 and rotated; the one pending row is
  WP-R18's FQ-63, which this chain did not act on and does not guess at. ✓
