---
slug: wp-r22-review-council
version: 1
artifact: brief
status: draft
created: 2026-08-17
updated: 2026-08-17
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, RI1, RI2, RI3]
upstream:
  - user-request
orchestration:
  phase: think
  status: blocked-for-user
  next_phase: plan
  blockers: [Q1, Q2, Q3]
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
  evidence_classes:
    repo: used
    trial: unused
    web: unused
    recall: unused
skill_trigger_log:
  - skill: repo-alignment-scan
    decision: ran
    reason: ran — R22 consumes contracts frozen by WP-R21, so alignment against what actually shipped is the dominant risk; buckets A and B checked the real files
  - skill: architecture-decision-advisor
    decision: skipped
    reason: skipped — the architecture decisions are inherited from WP-R21 and resolved there; the council surfaced wording defects, not new whole-repo decisions
  - skill: constraint-conflict-scan
    decision: ran
    reason: ran — bucket A was chartered on exactly this, and found the carve-out wording defect plus the unsynchronised decision-tree reference
---

# WP-R22 Review Council (Fresh-Eyes Multi-Agent Review) - Brief

## Source Links

- Notion WP-R22 — Review Council (Class Complex, P1, Target 1.1.0, Depends On WP-R21)
- `workflow/artifacts/briefs/wp-r21-think-council-v1.md`, `workflow/artifacts/reviews/wp-r21-think-council-v1.md`
- `src/workflow/skills/dispatch-subagents/references/council-contracts.md` — the frozen shared contract
- Council run 2026-08-17 — see `## Council Log`

## Status — INCOMPLETE, one bucket unresearched

Requirements R1–R7 and RI1–RI3 are drafted with acceptance criteria. **Bucket C (the
finding-quality write-back mechanism) was never researched** — its member failed twice with a
server-side 529 and is recorded as `failed` in the Members table. R5's acceptance criterion and Q3
therefore rest on nothing, and are marked as such rather than filled in from guesswork.

Not yet written: User Impact, Success Metrics, and the remaining implicit requirements (3 derived
against roughly 8 expected).

## Problem

Review is performed by the same agent that wrote the Plan and the Build, reading its own memory of
the change rather than the change itself. That is the weakest position from which to find a defect,
and it is the phase whose verdict blocks a commit.

This brief's own council run is evidence for the premise. Bucket A found that
`decision-tree-by-phase.md` never mentions the carve-out at all, so a reader following it refuses an
auto-fire that `SKILL.md` permits — a defect that survived three prior passes by the agent that
wrote both files, including a review that explicitly checked whether the five dispatch files were in
sync.

## Goals

- Reviewers see the diff and the manifest, never the Build session transcript.
- Reviewers carry fresh context over disjoint risk categories, so a finding is found rather than recalled.
- The parent consolidates one artifact and owns the verdict; a reviewer's claim is evidence, never authority.
- Inconvenient findings cannot be quietly dropped — every one carries a disposition.
- Review accumulates a finding-quality record, so the council's value is measurable rather than asserted.

## Non-Goals

- Consensus or voting. Agreement never constitutes a pass; the parent decides.
- Any reviewer writing to the review artifact directly.
- The Think phase (WP-R21).
- Forking `council-contracts.md`. R22 consumes it.

## User Impact

Not yet written.

## Success Metrics

Not yet written — depends on Q3, which is unresearched.

## Requirements

Numbered in the Requirement Manifest.

## Constraints

- Gated on WP-R21 landing; R22 consumes three contracts frozen there.
- Additive only for 1.1.0 — new review-artifact fields optional with safe defaults.
- Zero runtime dependencies.
- Constraint list is a sketch; R21's ran to six.

## Risks

- **RK-A (high): the council record for a Review would be silently unvalidated.** F7 — the validator
  hard-filters to `briefs/`, so a Review council's record lands in `reviews/` and every one of its
  checks is skipped. Not "fails" — *skipped*. The most dangerous shape of gap, and the same class as
  R21's own P1-1.
- **RK-B (high): extending the council to Review silently multiplies cost.** F8 —
  `council.default_fan_out` is written phase-agnostically, so every unconfigured repo gets a
  3-member Review council on Complex work the moment R22 ships, without configuring anything.
- **RK-C (medium): a compromised verdict is worse than no council.** Review's output blocks commits;
  confident wrong findings are more dangerous here than in Think.
- **RK-D (medium): fresh context is asserted, not enforceable.** R21 mitigated this for the challenge
  pass by passing raw findings; a reviewer needs *some* framing, so the same trick may not transfer.
- **RK-E (unassessed): the finding-quality baseline.** Bucket C failed. No evidence gathered.

## Open Questions

- **Q1 — reword the carve-out's verdict clause.** Bucket A claimed `SKILL.md`'s principle
  contradicts its own condition list (principle excludes verdict phases; condition admits Review).
  The challenger **refuted the diagnosis while confirming the defect**: `think-council/references/output-schema.md:89`
  scopes "no verdict" to the *council's output*, not the phase's artifact, so this is ambiguous
  wording rather than a design conflict. Recommendation: reword to "in phases where the council's
  own output is not a verdict" — a two-word fix, not a decision to widen a principle. Owner: workflow owner. Blocking: yes, because it determines whether R22 needs explicit
  authorization.

- **Q2 — do R21's two open P1s block R22's Build?** R22 extends the same validator, and F7 shows the
  brief-scoping gap is the same class as R21's P1-1. Recommendation: fix both before R22's Build;
  they need not block R22's Plan. Owner: user. Blocking: yes.

- **Q3 — how does the finding-quality baseline get written back?** **Unresearched.** The member
  assigned to it failed twice. No recommendation is offered, because none has been earned. Owner:
  workflow owner. Blocking: yes.

## Requirement Manifest

### Explicit (R)

- **R1** — Reviewers are read-only; a fix recommendation switches the candidate back to Build scope.
  Acceptance: a reviewer finding carrying a fix recommendation fails the gate. Note F6 — this rule
  already exists at `decision-tree-by-phase.md:58` as a dispatch refusal condition; R22 makes the
  validator enforce it rather than leaving it to skill text.
- **R2** — Reviewers receive the diff and the manifest, never the Build transcript.
  Acceptance: the artifact records each reviewer's input; a recorded input containing the Build
  transcript fails.
- **R3** — The parent owns consolidation, verdict, and evidence.
  Acceptance: no reviewer output appears as a verdict; consolidation cites every reviewer.
- **R4** — Every reviewer finding carries a disposition with a non-empty reason when rejected.
  Acceptance: inherited from `council-contracts.md` unchanged; fixtures confirm the Review path
  enforces the same contract.
- **R5** — Finding-quality baseline: each finding records whether it proved real, was waived, or was
  noise.
  Acceptance: **cannot be written — Q3 unresearched.**
- **R6** — New review-artifact fields optional with safe defaults; pre-1.1.0 reviews still validate.
  Acceptance: `npm run validate` passes over every existing review with zero edits.
- **R7** — A config field disables the council; the single-agent Review path stays functional and
  CI-exercised for one release.
  Acceptance: mirrors R21's R8 — preserved verbatim, byte-locked by conformance, removed in 1.2.0.

### Implicit (RI)

- **RI1** — Extend `check-council-record.mjs` to review artifacts. F7: line 129 hard-filters to
  `briefs/`; F2: `totals.briefs` and the summary line mislabel; F4: `Questions For User` has a
  `?? ''` fallback that makes R5's checks silently vacuous on a review.
  Acceptance: the validator handles both artifact types; no check is silently skipped or vacuous.
- **RI2** — Add the Review-only assertion that a reviewer finding may not carry a fix
  recommendation, scoped to council-log findings only (F6).
  Acceptance: a fixture with a fix-carrying council finding is rejected, attributable to this rule.
- **RI3** — Preserve the pre-R22 single-agent Review path verbatim with a byte-comparison lock.
  Acceptance: preserved text byte-identical; lock fails on drift.

Not yet derived: risk-category assignment rules, reviewer-input representation, review frontmatter
schema, config surface, adapter sync, the fixture set.

### Assumptions (A)

- **A1** — WP-R21's three frozen contracts are stable. Verified: R21's review found no finding
  implicating any of them.
- **A2** — `check-council-record.mjs` is the right host rather than a second validator. Supported by
  F7 (one-line filter) but not settled; RI1's scope depends on it.

### Open Questions (Q)

See Open Questions. Q1, Q2, Q3 all blocking, all mirrored in `orchestration.blockers`.

## Questions For User

- **Q1** (rests on F1, F5) — reword the carve-out's verdict clause to scope it to the council's own output; the challenger refuted the contradiction diagnosis but confirmed the wording defect.
- **Q2** (rests on F7) — fix R21's two open P1s before R22's Build, since R22 extends the same validator.
- **Q3** (rests on no finding — bucket C never ran) — write-back mechanism for the finding-quality baseline. Unresearched; no recommendation offered, because none has been earned.

## Council Log

### Requirement Classification

| Manifest ID | Question bucket | Evidence classes |
|---|---|---|
| R1 | reviewer capability and the fix-recommendation rule | repo |
| R2 | reviewer input representation | repo |
| R3 | parent consolidation and verdict ownership | repo |
| R4 | disposition contract reuse | repo |
| R5 | finding-quality write-back | repo |
| R6 | additive schema compatibility | repo |
| R7 | single-agent Review preservation | repo |
| RI1 | validator extension to review artifacts | repo |
| RI2 | Review-only fix-recommendation assertion | repo |
| RI3 | verbatim preservation and byte lock | repo |

### Members

| Member | Role | Round | Capabilities | Sandbox |
|---|---|---|---|---|
| m1 | researcher | 1 | read, fetch, search | |
| m2 | researcher | 1 | read, fetch, search | |
| m3 | researcher | 1 | read, fetch, search — FAILED (API 529, twice; bucket C unresearched) | |
| c1 | challenger | 1 | read, fetch, search | |

### Rounds

| Round | Researchers | Challengers | Open in | Open out | Items closed | Sizing rationale |
|---|---|---|---|---|---|---|
| 1 | 3 | 1 | 3 | 3 | | — |

### Findings

| Finding | Member | Role | Round | Surface | Evidence class | Citation | Disposition | Reason / merged into |
|---|---|---|---|---|---|---|---|---|
| F1 | m1 | researcher | 1 | dispatch-subagents/SKILL.md | repo | `src/workflow/skills/dispatch-subagents/SKILL.md` L24-25 — principle "in phases that produce no verdict" | accepted | |
| F2 | m1 | researcher | 1 | dispatch-subagents/SKILL.md | repo | `src/workflow/skills/dispatch-subagents/SKILL.md` L31 — condition "the phase is Think or Review" | rejected-with-reason | Challenger refuted the contradiction reading; "no verdict" scopes to council output, not phase artifact. Wording defect stands, diagnosis does not |
| F3 | m1 | researcher | 1 | decision-tree-by-phase.md | repo | `src/workflow/skills/dispatch-subagents/references/decision-tree-by-phase.md` L18 — "If explicit authorization is absent, do not dispatch." No council mention in file | accepted | |
| F4 | m2 | researcher | 1 | check-council-record.mjs | repo | `src/workflow/validators/check-council-record.mjs` L385 — `namedSection(parsed.body, 'Questions For User') ?? ''` makes R5 checks vacuous on reviews | accepted | |
| F5 | c1 | challenger | 1 | dispatch-subagents/SKILL.md | repo | `src/workflow/skills/think-council/references/output-schema.md` L89 — "No verdict, recommendation-as-decision, or exit-gate claim appears in the result." | accepted | |
| F6 | c1 | challenger | 1 | decision-tree-by-phase.md | repo | `src/workflow/skills/dispatch-subagents/references/decision-tree-by-phase.md` L58 — "A candidate is asked to produce a fix recommendation (that switches it to Build scope)" | accepted | Refutes the claimed R22/review-schema contradiction |
| F7 | c1 | challenger | 1 | check-council-record.mjs | repo | `src/workflow/validators/check-council-record.mjs` L129 — `if (file.split('/').slice(-2, -1)[0] !== 'briefs') continue;` | accepted | |
| F8 | c1 | challenger | 1 | phase-caps.md | repo | `src/workflow/skills/dispatch-subagents/references/phase-caps.md` L30-32 — council default_fan_out written phase-agnostically | accepted | |

### Reconcile Contract

Buckets A and B were assigned disjoint surfaces, so overlap was not planned. It arose anyway: the
challenger inspected `dispatch-subagents/SKILL.md`, which bucket A already owned. Duplicates on a
shared surface collapse into the researcher's finding, which holds the original citation.
Disagreements are never collapsed — each is recorded in Conflicts below with its resolution and the
basis for it, which is what happened to F2.

### Conflicts

| Surface | Findings | Resolution |
|---|---|---|
| dispatch-subagents/SKILL.md | F2, F5 | Challenger's reading adopted. F2 claimed principle and conditions contradict; F5 shows "no verdict" is scoped to the council's own output (`think-council/references/output-schema.md` L89), making this a wording ambiguity rather than a design conflict. F2 rejected, defect retained as Q1 |

### Termination

- Reason: user-decision-required
- Surviving items and their round history: Q1 open in round 1, closed in none; Q2 open in round 1, closed in none; Q3 open in round 1, closed in none — bucket C never researched

## Architecture Notes

- role: Architect
- decision: Consume `council-contracts.md` rather than fork it.
- constraint: Additive-only for 1.1.0; gated on R21 landing.
- tradeoff: Not yet worked; no equivalent of R21's risk walkthrough has happened.
- downstream: F7 and F8 both mean R22 inherits R21 defects rather than clean contracts — validator
  scope and fan-out default are phase-agnostic in the wrong direction.

## Exit Gate

- [ ] Every active R and RI has acceptance criteria. **Not met** — R5 blocked on unresearched Q3.
- [x] Blocking Q IDs appear in orchestration.blockers.
- [ ] User approved or waiver recorded. **Not met** — not presented for approval.
