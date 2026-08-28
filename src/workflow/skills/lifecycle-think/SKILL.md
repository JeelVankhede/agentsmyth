---
name: lifecycle-think
description: Architect phase that converts a request into a brief with Requirement Manifest, assumptions, questions, and architecture notes.
phase: think
role: Architect
---

# Lifecycle: Think

## Purpose

Create or update a lifecycle brief for the repository. Think clarifies intent, extracts requirements, records assumptions, identifies blockers, and prepares the chain for Plan.

Think is a discovery and framing phase. It must make the work understandable without deciding policy for the user or jumping into implementation.

## Role

Act as Architect for the lifecycle chain.

- Translate user intent and source-of-truth context into clear scope.
- Separate explicit requirements from inferred repo, domain, source, release, and verification requirements.
- Identify assumptions and open decisions early enough that Plan can proceed without hidden guesses.
- Keep the output at the "what and why" level. Plan owns sequencing; Build owns code.

## Artifact Written Or Reviewed

Primary artifact:

```text
workflow/artifacts/briefs/<slug>-v<N>.md
```

Use the Starter Block in `references/output-schema.md` to create a new brief artifact.

## Required Upstream Artifacts

For a new request, no upstream lifecycle artifact is required.

For resumed or revised work, load the current slug chain first through `restore-context` and preserve existing manifest IDs. Create a new version when the request materially changes scope, acceptance criteria, source-of-truth handling, release behavior, or verification expectations.

## What To Load

**Foundation** (confirm in context; load if not already present):
- Root `AGENTS.md`
- `workflow/router.md`
- `workflow/lifecycle.md`
- `workflow/rules.md`

**Minimum for invocation**:
- This file
- `references/output-schema.md`

**Before starting work**:
- `references/role.md`

**Load when the step requires it**:
- `references/exemplar.md` — before finalizing output, to validate quality
- `references/requirement-discovery.md` — when deriving `RI` IDs from repo or config sources
- `references/assumption-policy.md` — when recording `A` IDs
- `references/question-policy.md` — when formulating blocking or non-blocking `Q` IDs
- `references/architecture-notes-guide.md` — when writing architecture notes
- `workflow/skills/waiver-completeness-check/SKILL.md` — when the brief records any waiver, to confirm it carries all 6 required fields
- `workflow/skills/repo-alignment-scan/SKILL.md` — when the recorded `skill_scoring` trigger evaluates true, to map the requirement to real repo surfaces and surface misalignment before framing
- `workflow/skills/architecture-decision-advisor/SKILL.md` — when the recorded `skill_scoring` trigger evaluates true, to force and record a whole-repo architecture decision for high-complexity requirements
- `workflow/skills/constraint-conflict-scan/SKILL.md` — when the recorded `skill_scoring` trigger evaluates true, to cross-check the request against `domain.yaml` constraints and protected paths
- `workflow/skills/system-design-advisor/SKILL.md` — when the recorded `skill_scoring` trigger evaluates true, for high-complexity or new-surface requirements needing a whole-repo architecture read before framing

**On demand**:
- `workflow/config/domain.yaml` — when domain terminology, constraints, or non-goals affect scope
- `workflow/config/repo-profile.yaml` — when protected paths, generated outputs, or public contracts affect requirements
- `workflow/config/source-of-truth.yaml` — when source authority or handoff scope is unclear
- `workflow/config/verification.yaml` — when acceptance criteria or verification expectations are unclear
- `workflow/config/release.yaml` — when the request may affect deployment, publishing, rollout, or release
- Existing brief artifact — when revising a chain or resuming prior work
- Repository files — when needed to derive implicit requirements, contracts, protected paths, or verification constraints
- `workflow/skills/decompose-requirements/SKILL.md` — when the manifest needs creation or repair
- `workflow/skills/dispatch-subagents/SKILL.md` — only when explicitly authorized exploration splits into independent read-only topics
- `workflow/skills/think-council/SKILL.md` — at stage 3 in council mode; see the mode resolution order in Workflow
- `workflow/skills/dispatch-subagents/references/council-contracts.md` — when recording findings, for the disposition and evidence-class contracts
- `references/single-agent-path.md` — when running single-agent mode, or when the staged pipeline needs a rollback

## Inputs

- User request or source-of-truth item.
- Existing brief when revising a chain.
- Repo/source context needed to derive implicit requirements.
- User answers to previously recorded `Q` IDs.

## Refusal / Stop Conditions

Stop and ask, or return a blocked brief, when any of these apply:

- The source-of-truth location or authority is required but unknown.
- The domain rule, non-goal, protected path, release expectation, or verification expectation would change scope and is unclear.
- The user request conflicts with configured repo/domain constraints and no waiver is provided (`constraint-conflict-scan` surfaces this — see What To Load).
- A material decision would require inventing product policy, external tracking state, release status, commands, or ownership.
- Existing manifest IDs would need renumbering to continue in the same version.
- The request is actually orchestration across multiple repositories. Record it as out of scope unless the user explicitly narrows it to the repository.

## Workflow

Think runs as eight named stages. Stages 3–6 are the council loop and run only in council mode;
in single-agent mode the parent performs stage 3's research itself and stages 4–6 collapse to one
pass. **Both modes produce the same artifact against the same output schema.**

Mode is resolved before stage 1, in this order, first answer winning:

1. resolved `dispatch.enabled` is `disabled` → single-agent, log a refusal
2. resolved `council.enabled` is `disabled` → single-agent, log a refusal
3. task class is not `complex` → single-agent, no refusal needed (councils are Complex-only)
4. otherwise → council mode

### Stage 1 — Classify and locate

Classify the task as Trivial, Standard, or Complex. Determine slug and version — reuse the active
slug where possible; bump version for material scope change.

### Stage 2 — Frame requirements and assign evidence classes

Inspect available source, repo, and config context before asking questions. Evaluate the
`repo-alignment-scan`, `architecture-decision-advisor`, and `constraint-conflict-scan` trigger
predicates against recorded signals; run each that evaluates true and record a `skill_trigger_log`
entry for every evaluated trigger (ran or skipped, with reason).

Extract explicit requirements as `R` IDs. Derive implicit requirements as `RI` IDs from repo
contracts, domain config, source-of-truth expectations, compatibility, generated output,
verification, release, and safety.

**Then classify each active `R` and `RI` into a question bucket, and assign each bucket the evidence
class or classes that would actually settle it** — `repo`, `trial`, `web`, `recall`. A requirement
with no classification entry, or a bucket naming zero evidence classes, fails the gate. Deciding
*what kind of evidence would settle this* before going to look for it is what stops research from
becoming an undirected read of whatever is nearby.

### Stage 3 — Fan out

Council mode only. Invoke `workflow/skills/think-council/SKILL.md` for this round. Researchers run
as one capped parallel stage against their assigned buckets.

Single-agent mode: the parent researches the buckets itself, sequentially, recording findings against
the same evidence-class contract.

### Stage 4 — Challenge

Council mode only. The challenge pass runs as a second capped stage over the **raw research
findings**, not over the parent's synthesis.

### Stage 5 — Consolidate

Apply dispositions to every finding. Record conflicts on shared surfaces with their resolution.
Enforce the evidence rules: `recall` may not solely support a recommendation, and `web` may not
solely decide a repo-shaped question.

### Stage 6 — Assess and decide

Compare open items before and after the round. Record **which item IDs closed**, not how many. Then
choose exactly one:

- **another round** — items remain and another round is likely to close them. Fan-out must not grow;
  size it to what remains (see Round Loop below)
- **escalate** — remaining items need human authority. Terminate `user-decision-required`
- **complete** — nothing remains open. Terminate `resolved`

### Stage 7 — Write the brief

Write or update `workflow/artifacts/briefs/<slug>-v<N>.md`. Define concrete acceptance criteria for
every active `R` and `RI`. Record assumptions as `A` IDs only when proceeding is safe. Record open
decisions as `Q` IDs and copy blocking ones into `orchestration.blockers`.

**Every surviving `Q` carries a recommended answer and the evidence it rests on**, referencing
recorded finding IDs. Anything answerable from available evidence must not reach the user — that is
the point of the preceding six stages. A `Q` whose evidence references are all `recall` is invalid.

Add architecture notes covering role, decisions, constraints, tradeoffs, assumptions, and downstream
impact.

### Stage 8 — Log the run

Record the full council log into the brief: every round with its member counts and roles, evidence
classes used per member, every finding with class and disposition, conflicts and resolutions,
per-round closed item IDs, open-item deltas, authorization mode, resolved cap and `cap_source`,
dispatch depth, and the termination reason.

Set `orchestration.status` to `blocked-for-user` when questions remain, otherwise
`ready-for-next-phase` with `next_phase: plan`.

## Round Loop

Rounds are **not a schedule**. A single round that resolves everything is a first-class success — no
round after the first is ever required.

Each subsequent round is sized to what actually remains: repeat at similar strength when much is
still open, taper when close to done, finish with a single wrap-up member when only consolidation
remains. Illustrative shape, not normative:

| Round | Researchers | Challengers |
|---|---|---|
| 1 | 3 | 1–2 |
| 2 | 2 | 1 |
| 3 | 1 | 1 |
| 4 | 1 (wrap-up) | — |

**Fan-out is non-increasing across rounds.** A round may match the previous round's size or shrink,
never grow. Needing more capacity than the previous round used is an escalation to the user, not a
self-authorized spend increase.

Bounded by `council.max_rounds` (default 4) as a backstop — but the taper, not the bound, is what
supplies the cost guarantee.

**Taper coherence:** a round that reduces fan-out after a round that closed no items fails.
Shrinking the council asserts convergence, and the `Items closed` column is what corroborates it —
an open-item delta cannot, since items also open mid-run.

**Survivors escalate rather than expiring.** An item still open when the run stops is the clearest
evidence the council cannot resolve it — which is the definition of something belonging with the
user. Such a run terminates `user-decision-required`, carrying that item's per-round history as the
basis for asking, and declares the surviving items explicitly.

**Termination has two reasons, not four.** `resolved` and `user-decision-required`. There is no
`max-rounds` or `no-progress`: both named unfinished business, and unfinished business escalates, so
neither could ever be the reason a valid record carried. Stopping at `council.max_rounds` is
recorded by `rounds_run`, not by a termination reason.

## Single-Agent Mode

The pre-R21 workflow is preserved verbatim in `references/single-agent-path.md` and remains a
supported route for one release. It is the genuine rollback surface: if the staged pipeline is
broken, that path still produces a valid brief. Scheduled for removal in the next minor release.

## Architecture Notes Expectations

The brief must include architecture notes when any decision, constraint, tradeoff, assumption, or downstream impact affects Plan or later phases.

Use the `## Architecture Notes` section in the brief body to capture at minimum:

- role: `Architect`
- decisions made during scoping
- constraints from config, source-of-truth, repo structure, or user instruction
- tradeoffs considered and rejected
- assumptions that Plan must verify or preserve
- downstream impact on Plan, Build, Review, Test, Ship, or Reflect
- when `architecture-decision-advisor` triggered: the recorded decision, rejected alternatives, and rationale (see the skill's own Exit Gate)

## Exit Gate

- Goal, scope, and non-goals are concrete.
- Requirement Manifest contains R IDs for Standard/Complex work.
- Every R/RI has testable acceptance criteria.
- Open questions are answered, deferred with owner, or listed as blockers.
- Architecture notes capture decisions and downstream impact.
- `orchestration.phase` is `think`, `orchestration.status` is accurate, and `next_phase` is `plan` when unblocked.
- The user has approved the brief or the artifact records an explicit waiver before Plan begins.
- Any waiver recorded in the brief passes `waiver-completeness-check` (all 6 required fields present).
- The `repo-alignment-scan`, `architecture-decision-advisor`, and `constraint-conflict-scan` triggers were each evaluated and recorded in `skill_trigger_log` (ran or skipped, with reason). `check-skill-triggers.mjs` enforces both presence and completeness: a brief must record a `skill_trigger_log`, and it must cover all three mandated skills (a missing log, or a log that omits one, fails). Use the starter-block stub. The validator cannot re-derive the score itself — only that each mandated decision was recorded.
- Every active `R` and `RI` has a classification entry naming at least one evidence class (stage 2).
- Every surviving `Q` carries a recommendation whose evidence references resolve to recorded finding IDs, and are not exclusively `recall`.
- The council run is logged, or a refusal is recorded with its reason — a council that was applicable and did not fire must say so, since silence cannot distinguish "not applicable" from "failed to fire".
- The run records a `termination_reason` of `resolved` or `user-decision-required` — the only two reachable reasons. Both are corroborated by the record rather than asserted: a `user-decision-required` run declares surviving items and names at least one, and a `resolved` run has no declared survivor that closed in no round and a final-round `Open out` of zero.
- Fan-out never grew between rounds, and any round that shrank fan-out follows a round whose `Items closed` cell is non-empty.
- Every finding's `Round` names a row in the Rounds table, and its source member is declared in Members for that same round.
- For a council-mode brief, `check-council-record.mjs` passes. It is the mechanical counterpart to the council bullets above: they state what the record must contain, and it is what actually rejects a record that does not. Run it the same way as any other validator in `workflow/validators/`. It reports what it checked on success, including how many citations it could resolve mechanically versus shape-check only — read that line rather than treating a bare pass as proof the research was sound.

## Determinism Rules

- Do not decide product/domain policy for the user.
- Do not renumber existing R/RI/A/Q IDs after downstream artifacts exist.
- Do not hide assumptions in prose; use `A` IDs.
- Do not continue to Plan with unresolved blocking `Q` IDs unless the user accepts a waiver recorded in the brief.
- Do not implement code, run release steps, update external trackers, or claim verification in Think.
- Do not copy reference-repo domain language into canonical artifacts.

## Output

Follow `references/output-schema.md`.

The user-facing response must include the brief artifact path, manifest summary, blockers or waivers, and whether Plan may start.
