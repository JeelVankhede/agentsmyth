---
slug: wp-r21-think-council
version: 1
artifact: reflect
status: ready-for-next-phase
created: 2026-08-18
updated: 2026-08-18
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9]
upstream:
  - workflow/artifacts/briefs/wp-r21-think-council-v1.md
  - workflow/artifacts/plans/wp-r21-think-council-v1.md
  - workflow/artifacts/tasks/wp-r21-think-council-v1.md
  - workflow/artifacts/reviews/wp-r21-think-council-v1.md
  - workflow/artifacts/verify/wp-r21-think-council-v1.md
  - workflow/artifacts/ship/wp-r21-think-council-v1.md
orchestration:
  phase: reflect
  status: done
  next_phase: done
  blockers: []
  user_checkpoint: none
---

# WP-R21 Think Council - Reflect

## Inputs

Full chain: brief → plan → task → review → verify → ship, all six artifacts listed in `upstream`.
Shipped via PR #64 into `release/1.1.0` on 2026-08-18. Branch `feat/wp-r21-think-council`,
16 commits, merged `origin/release/1.1.0` at `a6aa228`.

## Outcome

- **Release status:** PR #64 open against `release/1.1.0`, not merged. 1.1.0 itself is unreleased;
  this package plus WP-R8 constitute its minimum bar, and WP-R8 is already merged.
- **Source-of-truth status:** updated. All edits in `src/`; build products regenerated and
  gitignored. Notion WP-R21 moved to Done with the PR reference and the cost result recorded.
- **Rollback status:** available and real. `council.enabled: disabled` (or `dispatch.enabled:
  disabled`, which outranks it) plus `lifecycle-think/references/single-agent-path.md`, the pre-R21
  workflow preserved verbatim and byte-locked by conformance `r21-single-agent-verbatim`. Not
  exercised; scheduled for removal in 1.2.0 per A5.

## What Worked

**The validator caught its author repeatedly, and that is the result.** `check-council-record`
rejected the first real council record three times — a `repo` class with no citation, and question
references sitting on wrapped continuation lines. `check-scope-fence` caught errors in the plan
*I* wrote, three separate times: abbreviated `Touches` paths, a glob where paths were required, and
undeclared remediation files. `check-commit-coverage` blocked two commits until scope was declared.
`check-evidence-citations` rejected the verify artifact five times for empty table cells. None of
these were caught by reading.

**Stating the exception once and referencing it.** RI1's narrowing lives in `independence-rules.md`
and every other file points at it. The one place I *did* restate a rule — the carve-out, written
into both `dispatch-subagents/SKILL.md` and `think-council/SKILL.md` — is precisely where drift
appeared: the second copy kept superseded wording after the first was fixed.

**Preserving the rollback path as a verbatim copy with a byte-lock.** The tempting design was
"single-agent = the pipeline with dispatch off", which is elegant and useless: a mode of a broken
pipeline is not a rollback. The byte-comparison is what stops "preserved" decaying into
"reconstructed".

**Tapering rounds, which came from the user, not the design.** It changed the cost model from a
bound into economics, and supplied a better anti-drift signal than the no-progress guard it
replaced: shrinking the council *asserts* convergence, so the open-item count must corroborate it.

## What Did Not Work

**A green suite was mistaken for a met requirement.** Mid-Build I marked seven phases complete on
the strength of `validate 0 · conformance 19/19 · violations 44/44`. A self-audit then found six
acceptance criteria shipped as documentation with no enforcement at all — R9 had no schema field,
no section, no check. The suite only ever tested what had been written, never what the plan
required. Calling the gap a "partial gate deferral" compounded it by dressing a hole as a schedule.

**Reading the validator produced a clean bill twice; probing it found two P1s immediately.** Both
were holes where the code *looked* right from every angle except the one that mattered —
`sandbox_root` resolved, stored, and never compared; a survivor rule evadable by deleting one line.

**The same item was deferred three times.** The cost measurement moved Build → Review → Test, each
time with a locally defensible reason ("that's the next phase's work"). Local defensibility is
exactly what made it repeatable. It took the user's intervention to stop, and only then did the
measurement happen — and it was unfavourable, which is likely why deferring felt easy.

**A worthless negative control was nearly reported as evidence.** A probe intended to prove a rule
still rejected bad input returned `ok`; the mutation had silently failed and the two files were
byte-identical. Caught only because the result looked wrong. Every probe afterwards asserts the
mutation applied before drawing a conclusion.

## Surprises

**The single-agent baseline outperformed the council on volume.** 22 findings from one invocation
against the council's 8 from four intended (six attempted, two lost to API 529s) covering two of
three buckets. Not a controlled comparison — different codebase states — but not the direction the
feature's premise predicts either. The council's real contribution was narrower and unmeasurable by
count: its challenger **refuted** a researcher's headline claim, corrected a line number, and
flagged a citation as technically true but misleadingly framed.

**The live council found four defects that three prior review passes had missed**, including
`decision-tree-by-phase.md` never mentioning the carve-out — a file whose sync I had explicitly
checked, with a grep that searched for the wrong strings.

**Two shipped-contract defects surfaced by using the workflow rather than inspecting it.** OI-73
(checkpoint quotes truncated at the first line break) and OI-74 (the gate made incremental Build
commits impossible) both bit this chain directly and had presumably been latent for releases.

## Manifest Coverage Retrospective

| Manifest ID | Outcome | Note |
|---|---|---|
| R1 | delivered | Complex-only trigger; mode re-derivable from recorded resolution inputs |
| R2 | delivered | Two capability axes; outward axis added after the risk walkthrough, not in the original brief |
| R3 | delivered | Challenge pass over raw findings; the raw-findings rule came from RK-F, not the WP |
| R4 | delivered | Disposition contract; frozen for WP-R22 |
| R5 | delivered | Half of it was unenforced until the self-audit |
| R6 | delivered | Additive; every pre-1.1.0 artifact validates unedited |
| R7 | delivered | Kill-switch precedence; became re-derivable only via R-1 remediation |
| R8 | delivered | Verbatim preservation plus byte-lock; removal scheduled for 1.2.0 |
| R9 | delivered | Entirely unimplemented at first "complete"; the clearest single instance of the suite-vs-requirement gap |
| R10 | delivered | Evidence classes; frozen for WP-R22 |
| R11 | delivered | Took three passes — declaration, then the sandbox_root fence, then filesystem-scoped integrity |
| R12 | delivered | Availability recorded as used / unused / unavailable |
| R13 | delivered | Taper came from the user; survivor escalation hardened twice |
| R14 | delivered | Full run logged; the WP-R22 brief carries the first real instance |
| R15 | delivered | Eight stages, locked by conformance |
| RI1 | delivered | Narrowing stated once; the one restatement is where drift appeared |
| RI2 | delivered | Carve-out as bounding principle, reworded after the council challenged it |
| RI3 | delivered | Named for the record, not the council; reports texture |
| RI4 | delivered | Frontmatter-only distinguishability; depth-1 asserted |
| RI5 | delivered | Build clean, adapters current |
| RI6 | delivered | Six non-claims stated without hedging, at user insistence |
| RI7 | delivered | cap_source visibility; departure scoped to Think after the council flagged it |
| RI8 | delivered | Depth dial — an agent-proposed addition the user retained |
| RI9 | delivered | 31 fixtures; the attribution sweep found two passing for the wrong reason |

## Deferred

- **A5** — remove the preserved single-agent Think path in 1.2.0. User-approved 2026-08-16.
- **OI-67** — remove `warn-until-1.2.0` markers, same release.
- **WP-R22** — unblocked by this ship. An incomplete brief carrying a real council log exists at
  `workflow/artifacts/briefs/wp-r22-review-council-v1.md`, deliberately uncommitted at user request.
- **Cost re-evaluation** — the `on-for-complex` default rests on one unfavourable measurement from a
  single uncontrolled comparison. Worth revisiting with more runs before 1.2.0.

## Source-of-Truth Outcome

Updated, no handoff required. Notion WP-R21 is Done with PR #64, shipped date, and the cost result
recorded in its notes so the next reader sees the measurement rather than only the feature.

## Learning Candidates

All `propose-only`. No curated learning file was edited.

1. **propose-only** — A green suite proves what was *written*, not what was *required*. Phase
   completion should be judged against the plan's acceptance criteria one at a time, not against a
   passing test run. Evidence: six criteria shipped as prose while every suite was green.
2. **propose-only** — A validator's own correctness is not establishable by its author reading it.
   Both P1s came from probing after two clean reads. Probe, don't re-read.
3. **propose-only** — "That's the next phase's work" is the shape a repeated deferral takes, because
   each instance is locally defensible. Evidence: the cost measurement deferred three times across
   three phases.
4. **propose-only** — A negative control must assert its mutation applied. A silently-failed
   mutation produces a passing probe that proves nothing and reads as evidence.
5. **propose-only** — A rejection fixture should emit exactly one error. Two fixtures here rejected
   partly for an unrelated reason and would have kept passing if the rule they targeted regressed.
6. **propose-only** — State a rule once and reference it. The single restatement in this chain is
   the single place drift occurred, twice.
7. **propose-only** — Dogfooding surfaces contract defects inspection does not. OI-73, OI-74 and
   OI-75 were all found by the workflow being used, not audited.

## Follow-Ups

| Item | Owner | Suggested artifact / ticket title |
|---|---|---|
| OI-75 — `check-coverage-ledger` reads prose "dropped" as a drop claim | workflow owner | "fix(validators): scope coverage-ledger drop detection to the status token" |
| Re-measure council cost across several runs before 1.2.0 | user | "spike: council cost across N Complex chains" |
| 1.2.0 checklist — A5 removal + OI-67 markers | workflow owner | "chore(release): 1.2.0 deprecation sweep" |
| WP-R22 Review Council, now unblocked | user | "WP-R22 — Review Council (brief exists, incomplete)" |
| Consider a plan-phase check that Touches paths are real repo-relative paths | workflow owner | "feat(validators): validate plan Touches paths resolve" |

## Raw Session Entry

`workflow/learnings/sessions/2026-08-18-wp-r21-think-council.md`

## Architecture Notes

- role: Reflector
- decision: Record the unfavourable cost measurement in the reflect artifact, the ship artifact, the
  PR body and the Notion page rather than in one place. A result that argues against the feature is
  the one most likely to be quietly dropped, and it now takes four deletions to lose it.
- observation: The chain's most valuable output is not the council. It is the evidence that this
  repo's own gates caught its author roughly a dozen times — scope fence three times, commit
  coverage twice, evidence citations five times, the council validator three times. That is the
  argument for the gate discipline, made at the expense of the agent operating it.
- tradeoff: The council ships default-on with a measured cost disadvantage, accepted by the user on
  a single uncontrolled comparison. Defensible, and explicitly flagged for re-measurement.
- downstream: WP-R22 inherits three frozen contracts, none touched by any finding. It also inherits
  two known limits: the validator is brief-scoped, and `default_fan_out` is now scoped to Think so
  R22 must choose its own default rather than inheriting one.

## Exit Gate

- [x] Outcome states release, source-of-truth, and rollback status.
- [x] Manifest Coverage Retrospective has one row per active R and RI.
- [x] Every learning candidate tagged `propose-only`.
- [x] Follow-ups carry owner and suggested artifact title.
- [x] Raw session written, append-only, Curator Marks empty.
- [x] No curated learning file edited.
