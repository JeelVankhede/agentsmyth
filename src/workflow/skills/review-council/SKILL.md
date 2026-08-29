---
name: review-council
description: Power skill that runs a read-only review council over disjoint risk categories with an adversarial challenge pass, so Review finds defects rather than recalling them.
---

# Review Council

## Purpose

Find what is wrong with a change, from reviewers that never wrote it.

Review's failure mode without a council is not that it is careless; it is that the agent reviewing
the change is the one that planned and built it, reading its memory of the change rather than the
change itself. That is the weakest position from which to find a defect, and it is the phase whose
verdict blocks a commit. This skill fans out read-only reviewers over disjoint risk categories, then
runs an adversarial challenge pass over their findings before the parent consolidates anything.

This is a power skill, not a lifecycle phase. `lifecycle-review` owns the staged pipeline and the
verdict; this skill owns one round's dispatch, challenge, and consolidation contract.

## Invocation Context

Use this skill when **all** of the following hold:

- the resolved `dispatch.enabled` is not `disabled` — checked **first**, and a repo that turned
  delegation off gets no council regardless of any council setting
- the resolved `council.enabled` is `on-for-complex`
- the task class is `complex`
- `lifecycle-review` is at the fan-out stage of a round

Do not invoke for Trivial or Standard work.

## Authorization

This skill may fire **without per-conversation user authorization**, under the same named exception
`think-council` uses. `dispatch-subagents/SKILL.md` is the authority for it.

The bounding principle: **auto-fire is permitted only for members that cannot mutate the user's
repository, and only where the council's own output is not a verdict.**

The second clause is what admits Review at all, and it is worth stating precisely here because the
phase name invites the opposite reading. **Review produces a verdict; a Review council does not.**
Members produce findings; the parent consolidates them and owns `## Recommendation`. A member that
returns a verdict has broken the contract that licenses it to fire unprompted.

Record the authorization mode in the artifact (`carve-out` or `explicit`).

## Member Capability

Two independent fences, inherited unchanged from the Think council. Neither is negotiable from
inside a run.

**Repo axis — absolute.** No member modifies the repository, under any authorization mode. This
matters more here than in Think: a Review council reads the very repository whose changes it is
judging, so a member that writes would be editing the thing under review.

**Members that need scratch space write to the resolved `council.sandbox_root`, and the dispatching
parent must state that path in the member's instructions.** A member told only "do not write to the
repo" will reach for the system temp directory, which is outside the fence but also outside the
configured root — and a `trial` finding from such a member cannot declare a conforming sandbox, so
its evidence class is unusable. This happened on the first real Review council run: every finding
had to be downgraded from `trial` to `repo` because the members' scratch went to `/tmp`. Resolve the
path before dispatch and put it in the charter you hand each member. A run whose before/after repository
digest differs is invalid — see `lifecycle-review/references/output-schema.md` for where that is
recorded.

**Outward axis — depends on authorization.** A member fired under the carve-out gets read, fetch,
and search only: no creating issues, posting comments, or writing to external systems. A council the
user explicitly authorized may act outward.

**Input fence — Review-specific.** A reviewer receives the **diff and the manifest**. It does not
receive the Build session transcript. The transcript carries the author's reasoning, and a reviewer
that reads why a thing was done reviews the intention rather than the artefact — which is the exact
failure this council exists to remove. Each member's declared input is recorded, and an input naming
the Build transcript is invalid.

## Roles

| Role | Stage | Capability | Job |
|---|---|---|---|
| reviewer | 1 | read-only; sandbox writes permitted | Examine the diff against an assigned set of risk categories |
| challenger | 2 | read-only; sandbox writes permitted | Attack the reviewers' findings — sourcing first, then reasoning |

Stages are capped independently. Reviewers run as one parallel stage, challengers as a second
against their output.

## Risk Category Assignment

Reviewer buckets are **risk categories**, not files. The ten categories are already defined in
`lifecycle-review/references/review-risk-categories.md`; this skill assigns from that list rather
than inventing its own.

Each reviewer's categories are **disjoint**. Two reviewers sharing a category duplicate the same
reading and leave another category unread — the cost of overlap here is a gap somewhere else, not
merely wasted tokens. The assignment is recorded, so coverage is auditable rather than asserted.

Files are not partitioned. Two reviewers may legitimately read the same file through different
categories — a schema change is `contract` to one reviewer and `compatibility` to another — and that
overlap is the design working. Only the categories are exclusive.

## The Challenge Pass

The challenger receives the **raw reviewer findings, not the parent's consolidation**, for the same
reason it does in Think: the parent's synthesis is the framing under test.

The challenger is chartered adversarially. `rejected-with-reason` is a **success outcome** for a
challenger, and it matters more here than in Think — a Review council's findings block a commit, so
a confident wrong finding costs the user real work. Attacking a finding is not obstruction; it is
the mechanism by which the council is worth its cost.

Where a round contains `web` findings, the challenger spot-checks at least one, filed as its own
finding — `web` has no mechanical floor, so sampling is the only way a fabricated quote is caught.

## Findings Carry No Fix

A reviewer finding states **what is wrong and where**. It does not carry a fix recommendation.

Proposing a fix converts the candidate to Build scope, which `decision-tree-by-phase.md` already
names as a dispatch refusal condition. A read-only member that proposes an edit has produced work
nobody can apply without re-reviewing it, from an agent chartered not to write.

This binds **council-log findings only**. The parent's consolidated `## Findings` entries in the
review artifact still carry fix recommendations, exactly as `lifecycle-review`'s output schema
requires — the parent is not a reviewer, and consolidating is where a fix belongs.

## Members That Fail

A member that dies, times out, or never runs is recorded as `failed`, and its unread categories are
recorded as a skipped check carrying the fields `verification.yaml` requires. A council that lost a
member and says nothing reports the same coverage as one that did not, which is the more dangerous
of the two because it reads as complete.

## Evidence And Dispositions

Follow `dispatch-subagents/references/council-contracts.md`. It is the shared contract — the Think
council consumes the same file, so do not restate it here or let the two drift.

## Evidence Class Availability

Resolve at run time which classes the host agent can actually supply, and record the result per
class as `used`, `unused`, or `unavailable`. A class requested during assignment but unavailable is
recorded as `unavailable`, never silently dropped.

## Refusal / Stop Conditions

Do not run a council when:

- resolved `dispatch.enabled` is `disabled` — log the refusal, run single-agent
- resolved `council.enabled` is `disabled` — log the refusal, run single-agent
- task class is not `complex`
- the parent cannot record the council log in the active artifact
- the diff is unavailable, or is not readable without the Build transcript
- risk categories cannot be assigned disjointly across the resolved cap

## Determinism Rules

- **Do not nest dispatch.** A council member must not dispatch. Restated deliberately rather than by
  reference: a member loads this charter, and a prohibition it has to follow a reference to find is
  one it can miss. Dispatch depth is 1, and the log records it.
- Caps are per stage and are hard. Needing more capacity is an escalation, not a dispatch decision.
- No council output satisfies a phase exit gate on its own, and no member returns a verdict,
  severity ruling, or ship/hold judgment.
- The parent owns consolidation, and a member's claim is evidence rather than authority.
- Overlapping read-only members still count against the cap.
- A member never edits the repository, including the artifact it is reviewing.

## Exit Gate

- Every finding carries a source member, a risk category, an evidence class, and a disposition.
- Every `rejected-with-reason` carries a non-empty reason.
- No council-log finding carries a fix recommendation.
- Reviewer risk categories are disjoint, and the assignment is recorded.
- Every member's declared input is recorded, and none names the Build transcript.
- A failed member is recorded as `failed` with its unread categories logged as a skipped check.
- Evidence-class availability is recorded for every class the assignment requested.
- Conflicting findings on a shared surface are recorded with their resolution.
- At least one `web` spot-check is recorded for any round containing `web` findings.
- The authorization mode, resolved cap, `cap_source`, and repository digest are recorded.

## Output

Follow `references/output-schema.md`.
