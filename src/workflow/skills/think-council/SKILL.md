---
name: think-council
description: Power skill that runs a read-only research council with an adversarial challenge pass, so Think resolves from evidence what it can and escalates only genuine decisions.
---

# Think Council

## Purpose

Resolve what is resolvable from evidence, and escalate only what genuinely needs human authority —
each escalation carrying a recommendation and the evidence it rests on.

Think's failure mode without a council is not that it asks questions; it is that it asks questions it
could have answered, asks them without a recommendation, and never subjects its first plausible
framing to attack. This skill fans out read-only researchers across question buckets, then runs an
adversarial challenge pass over their output before the parent consolidates anything.

This is a power skill, not a lifecycle phase. `lifecycle-think` owns the staged pipeline and the
round loop; this skill owns one round's dispatch, challenge, and consolidation contract.

## Invocation Context

Use this skill when **all** of the following hold:

- the resolved `dispatch.enabled` is not `disabled` — this is checked **first**, and a repo that
  turned delegation off gets no council regardless of any council setting
- the resolved `council.enabled` is `on-for-complex`
- the task class is `complex`
- `lifecycle-think` is at the fan-out stage of a round

Do not invoke for Trivial or Standard work. Those keep the single-agent Think path unchanged, and a
council on a small requirement costs more than the ambiguity it removes.

## Authorization

This skill may fire **without per-conversation user authorization**, which is a named exception to
the standing rule in `dispatch-subagents/SKILL.md`.

The bounding principle: **auto-fire is permitted only for members that cannot mutate the user's
repository, and only where the council's own output is not a verdict.** The second clause is about
the council's output, not the phase's artifact — a council produces findings the parent
consolidates, and the parent owns the verdict.

The conditions in Invocation Context are consequences of that principle, not an arbitrary list. It
self-limits — Build cannot claim this exception, because Build's output *is* repository mutation, so
a non-mutating Build worker produces nothing usable.

`dispatch-subagents/SKILL.md` is the authority for this principle. This paragraph exists so a member
loading only the council charter still sees it; if the two ever diverge, the dispatch contract wins.

Record the authorization mode in the artifact (`carve-out` or `explicit`) so a reader can always tell
an auto-fired council from one the user asked for.

## Member Capability

Two independent fences. Neither is negotiable from inside a run.

**Repo axis — absolute.** No member modifies the repository, under any authorization mode. Members
that need to write do so in the resolved `council.sandbox_root`, never in the repo. Anything outside
the repository is otherwise unconstrained.

**Outward axis — depends on authorization.** A member fired under the carve-out gets read, fetch, and
search only. It must not take outward-facing actions — creating issues, posting comments, writing to
external systems, or any other side-effecting call. A council the user explicitly authorized in
conversation may act outward.

The distinction exists because the carve-out means the council fires unprompted, and an unprompted
agent acting in the user's name is a different risk from one they asked for.

## Roles

| Role | Stage | Capability | Job |
|---|---|---|---|
| researcher | 1 | read-only; sandbox writes permitted | Answer an assigned question bucket using the evidence classes assigned to it |
| challenger | 2 | read-only; sandbox writes permitted | Attack the researchers' output — sourcing first, then reasoning |

Stages are capped independently. Researchers run as one parallel stage, challengers as a second
against their output, so a cap of 3 admits 3 researchers followed by 1–2 challengers — the stages
never run concurrently.

## The Challenge Pass

The challenger receives the **raw research findings, not the parent's consolidation.** The parent's
synthesis is precisely the framing under test; handing it over pre-loads the answer. Fresh context
prevents contamination from the conversation but does nothing about contamination from the
instruction, which is the larger effect.

The challenger is chartered adversarially: its job is to find what is wrong. `rejected-with-reason`
is a **success outcome** for a challenger, not an exception path.

One concrete, recorded duty beyond general critique: **spot-check at least one `web` citation per
round**, filed as its own finding. `web` is the only evidence class with no mechanical floor, so
sampling is the sole mechanism by which a fabricated quote gets caught rather than merely being
wrong.

## Evidence And Dispositions

Follow `dispatch-subagents/references/council-contracts.md`. It is the shared contract — the Review
council consumes the same file, so do not restate it here or let the two drift.

In short: every finding declares an evidence class (`repo` / `trial` / `web` / `recall`) meeting that
class's citation contract, and carries a disposition (`accepted` / `merged` / `rejected-with-reason`
with a non-empty reason).

## Evidence Class Availability

Resolve at run time which classes the host agent can actually supply, and record the result per
class as `used`, `unused`, or `unavailable`.

agentsmyth ships no HTTP client and no sandbox runtime. It specifies `web` and `trial`; it cannot
provide them. Across the five supported tools these capabilities differ, so a council that wanted web
search and had none produces a materially weaker brief — and the artifact must say so rather than
reading identically to one that had it. **A class that was requested during classification but was
unavailable is recorded as `unavailable`, never silently dropped.**

## Refusal / Stop Conditions

Do not run a council when:

- resolved `dispatch.enabled` is `disabled` — log the refusal, run single-agent
- resolved `council.enabled` is `disabled` — log the refusal, run single-agent
- task class is not `complex`
- the parent cannot record the council log in the active artifact
- question buckets are not independent and no dedupe-and-reconcile contract can be declared
- a candidate bucket's question depends on another bucket's answer — a sequencing problem, which no
  reconcile contract resolves

## Determinism Rules

- **Do not nest dispatch.** A council member must not dispatch. This restates
  `dispatch-subagents`' rule deliberately rather than by reference: a member loads this charter, and
  a prohibition it has to follow a reference to find is one it can miss. Dispatch depth is 1, and the
  log records it.
- Caps are per stage and are hard. Never raise a cap in response to needing more capacity — that is
  an escalation to the user, not a dispatch decision.
- Fan-out never grows between rounds. See `lifecycle-think`'s round loop.
- No council output satisfies a phase exit gate on its own. The council produces findings and
  questions, never a verdict.
- The parent owns consolidation, and a member's claim is evidence rather than authority.
- Overlapping read-only members still count against the cap.

## Exit Gate

- Every finding carries a source member, an evidence class, and a disposition.
- Every `rejected-with-reason` carries a non-empty reason.
- Evidence-class availability is recorded for every class the classification requested.
- Conflicting findings on a shared surface are recorded with their resolution, never silently
  resolved.
- At least one `web` spot-check is recorded for any round containing `web` findings.
- The authorization mode, resolved cap, and `cap_source` are recorded.

## Output

Follow `references/output-schema.md`.
