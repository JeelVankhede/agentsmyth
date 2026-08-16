---
slug: wp-r21-think-council
version: 1
artifact: brief
status: blocked-for-user
created: 2026-08-15
updated: 2026-08-16
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9]
upstream:
  - user-request
orchestration:
  phase: think
  status: blocked-for-user
  next_phase: plan
  blockers: []
  user_checkpoint: brief-review
skill_trigger_log:
  - skill: repo-alignment-scan
    decision: ran
    reason: ran — the council must land inside an existing dispatch contract (dispatch-subagents, agent-behavior.yaml, phase-caps) and now also restructures lifecycle-think itself, so alignment with shipped rules is the dominant risk
  - skill: architecture-decision-advisor
    decision: ran
    reason: ran — the authorization carve-out, the independence-rule narrowing, and the staged Think pipeline are all changes to shipped invariants, not additive features
  - skill: constraint-conflict-scan
    decision: ran
    reason: ran — found a real conflict between the auto-firing council and WP-R8's tuning.dispatch.enabled kill switch (Q1, resolved), and a second between sandbox trials and the read-only basis of the carve-out (resolved via R11)
---

# WP-R21 Think Council (Research + Challenge Agents) - Brief

## Source Links

- Notion WP-R21 — Think Council (Research + Challenge Agents) (Class Complex, P1, Target 1.1.0)
- Notion 06 — Decision & Risk Log (RK10: validator checks process, not judgment)
- Notion 07 — Versioning Policy (R21/R22 = new skills + optional brief/review frontmatter fields)
- `src/workflow/skills/lifecycle-think/SKILL.md` — the phase being restructured
- `src/workflow/skills/dispatch-subagents/` — SKILL.md, references/{independence-rules, decision-tree-by-phase, phase-caps, output-schema}.md
- `src/workflow/agent-behavior.yaml` — `dispatch:` block (lines 134–139)
- User direction 2026-08-16 — sandbox trials, four evidence classes, iterative rounds, no deferral

## Problem

Think defers to the user whenever a requirement is ambiguous. Every unresolved item becomes a `Q`
blocker carrying no proposed answer, so the user absorbs the full resolution burden even when the
answer is derivable. On Complex requirements this makes Think simultaneously slow (the user is a
serial bottleneck) and shallow (nobody attacked the first plausible framing).

The deeper failure is that Think does not actually *think*. It reads the repo and stops. It does not
research, it does not consult what the model already knows, it does not go and find out, and above
all it does not **try things** — it reasons about what a validator or an API or a config would do
instead of running it and observing. A phase that produces framing without investigation produces
confident framing, which is the most expensive kind to get wrong, because everything downstream
inherits it.

There is a second-order problem that any fix must solve at the same time. An agent given latitude to
"research deeply" drifts: it substitutes its own recollection for evidence, generalizes from one
source, declares a question resolved because it feels resolved, and writes a brief that reads like
investigation but is mostly narrative. The remedy cannot be more instruction — instruction is what
it drifts from. It has to be mechanical.

## Goals

- Think classifies each requirement, decides what *kind* of evidence would actually settle it, and
  fans out agents to go get that evidence — including by running experiments in a sandbox.
- Research output is attacked before it consolidates, with the challenge aimed at sourcing as much
  as at reasoning.
- Think iterates: after a round, it checks what it resolved, checks what remains open, and decides
  whether to run another round or escalate to the user — rather than surfacing everything unresolved
  at the first opportunity.
- Everything that happened is logged back into the brief: rounds, members, evidence classes,
  findings, dispositions, what each round closed, and why the loop stopped.
- The agent cannot drift on its own analogy, because each of the above is mechanically checked, not
  merely instructed.
- None of this changes Trivial or Standard work, and no pre-1.1.0 artifact stops validating.

## Non-Goals

- The Review phase council (WP-R22) — hard-gated on this package landing first.
- Any council output satisfying a phase exit gate by itself. The council produces questions and
  findings, never a verdict.
- Repo write access for any council member. Sandbox writes only (R11).
- Deleting the single-agent Think path in 1.1.0 (R8).
- Making the validator judge whether a finding is *correct*, whether the council found what a human
  would have, or whether a rejection reason is a good one. See RI6 and RK-B.
- Providing web search. agentsmyth cannot; it can only declare the capability, use it when the host
  agent has it, and record its absence when not (R12).

## User Impact

On Complex work the user stops being a research desk. Instead of a list of questions they could have
answered by reading their own repo, they get a short list of genuine authority calls, each with a
recommendation, the evidence class behind it, and a citation they can check. Behind that list is a
recorded trail: what was searched, what was tried, what was rejected and why.

On Trivial and Standard work, nothing changes.

The costs are real and stated rather than buried. A Complex Think now spends materially more tokens
and wall-clock — rounds multiply fan-out, and fan-out already defaults to 3 without configuration
(Q2). Consumers whose agent lacks web search get a weaker council and an artifact that says so.
Consumers who want the old behavior keep it via config, not via downgrade.

## Success Metrics

- On a Complex task run through the council, the count of `Q` IDs reaching the user is lower than the
  same task's single-agent baseline, and every surviving `Q` carries a recommendation with at least
  one non-`recall` evidence reference.
- Zero pre-1.1.0 briefs fail validation after the schema change, with no edits to any of them.
- `check-council.mjs` rejects every one of its failure modes in the violations suite (RI9).
- A council round that resolves nothing cannot be followed by another round without failing the gate.
- The preserved single-agent path runs green in CI with the council disabled.

## Requirements

Numbered in the Requirement Manifest. R1–R8 carry over the Notion WP's stated requirements; R9–R15
come from the 2026-08-16 direction (evidence classes, sandbox trials, iteration, logging, Think
restructuring); RI1–RI9 are the implicit work the WP's "Resolved Before Build" section commits to
without enumerating, plus what the new requirements drag in.

## Constraints

- **Additive only.** 1.1.0 is a minor. Every new brief frontmatter field is optional with a safe
  default; no required-schema change. Any required field escalates this to a major bump.
- **Zero runtime dependencies.** `check-council.mjs` is hand-written Node ESM like every other
  validator. No HTTP client ships with agentsmyth.
- **Edit source, rebuild.** All changes land in `src/`; `npm run build` regenerates bundles.
- **Caps are hard.** Neither the council nor a round may raise `dispatch.max_parallel_workstreams`.
- **Council members never write to the repo.** Sandbox-only, outside the repo root (R11). This is
  what preserves the authorization carve-out.
- **The workflow is portable across five tools.** Nothing may assume a capability only one agent has.

## Risks

- **RK-A (high): the carve-out weakens a shipped safety rule.** Today: "no dispatch without explicit
  per-conversation authorization." After R21: "…except when four conditions hold." Every exception is
  a surface for the next one. Mitigation: config-visible (`council.enabled`), recorded per-run,
  bounded to non-repo-writing members in two named phases, and suppressed outright by the
  `dispatch.enabled` kill switch (Q1).
- **RK-B (high, = RK10 in the Decision Log): the validator checks process, not judgment.**
  `check-council.mjs` can prove the council ran, findings were attributed, dispositions were recorded
  with reasons, evidence classes were declared, and rounds made progress. It cannot prove a finding
  was correct, that the research was good, or that a rejection reason was sound. The product claim
  must stay on the first set. Mitigation: RI6 states the non-claims in shipped docs rather than
  letting the validator's existence imply the stronger claim.
- **RK-C (high, raised by Q2 and compounded by R13): cost.** Rounds × fan-out × evidence classes
  multiply spend on exactly the tasks that are already largest, and Q2's council-specific default of
  3 means an unconfigured consumer incurs it without an explicit choice. Mitigation: `max_rounds`
  bound and no-progress guard (R13), a research-depth dial separate from fan-out (RI8), both kill
  switches, and `cap_source` visibility (RI7). Re-examine at Review with **measured** token counts,
  not estimates.
- **RK-D (high): `recall` masquerading as evidence.** The model's own knowledge feels like fact,
  carries no citation, and cannot be re-checked. This is the single most likely drift vector.
  Mitigation: R10 forbids `recall` from solely supporting any recommendation or resolving any `Q`;
  it may only raise a hypothesis that another class confirms. Mechanically enforced.
- **RK-E (high): fabricated or rotted web citations.** A hallucinated URL is worse than no citation
  because it reads as diligence; a real URL whose content has since changed is nearly as bad.
  Mitigation: R10 requires an inline verbatim quote plus retrieval date, so the artifact carries the
  claim even when the link dies. The validator can check shape and presence, not that the quote was
  really on the page — stated plainly per RK-B.
- **RK-F (medium): the challenge pass degenerates into agreement.** A challenger sharing the
  researcher's context tends to ratify it. Mitigation: R3 requires fresh context and makes
  `rejected-with-reason` a first-class outcome, not an exception path.
- **RK-G (medium): the reconcile contract becomes boilerplate.** RI1 permits read-only surface
  overlap *provided* the parent declares a dedupe/reconcile contract. If that is copy-paste, the
  narrowing bought overlap for free. Mitigation: presence and non-emptiness are checkable;
  thoughtfulness is not.
- **RK-H (medium): the loop never converges, or converges by exhaustion.** An agent that keeps
  finding new questions can round forever; one that stops at `max_rounds` may present a half-answered
  brief as finished. Mitigation: R13's bound plus a required `termination_reason`, with
  `max-rounds` and `no-progress` both surfacing as visible risk rather than silent completion.
- **RK-I (medium): sandbox escape.** A trial member that writes into the repo violates the basis of
  the carve-out. Mitigation: R11 requires a declared sandbox path outside the repo root and a clean
  repo working tree across the council; both are mechanically checkable.
- **RK-J (low): recursion.** Council members are agents; nested dispatch fans out combinatorially.
  The existing "do not nest subagent dispatch" Determinism Rule already forbids it and must be
  restated for council members explicitly.

## Open Questions

No blocking questions remain. Q1, Q2, and Q3 are resolved and recorded below; the brief itself still
requires user approval before Plan may start.

## Requirement Manifest

### Explicit (R)

- **R1** — The council fires on `task_class: complex` only; Trivial and Standard keep the preserved
  single-agent Think path with no behavioral change.
  Acceptance: a Standard task through Think produces no council block and no dispatch; a Complex task
  produces both. Both locked by fixtures.

- **R2** — Research members are read-only with respect to the repo and capped by the resolved
  `dispatch.max_parallel_workstreams`; with no cap configured the council resolves to its own default
  of 3 (Q2).
  Acceptance: `check-council.mjs` fails an artifact whose recorded fan-out exceeds the resolved cap;
  no member records repo write access; with no cap configured the effective cap is 3 and the artifact
  records `cap_source: council-default`.

- **R3** — A challenge pass reviews research output before consolidation, running with fresh context,
  attacking sourcing as well as reasoning, with every finding attributed to its source member and
  never folded in anonymously.
  Acceptance: `check-council.mjs` fails any finding lacking a source member; a fixture with an
  unattributed finding is rejected; the challenger is a dispatched member counted against the cap
  (Q3).

- **R4** — Every finding carries a disposition of `accepted`, `merged`, or `rejected-with-reason`;
  `rejected-with-reason` with an empty reason fails the phase gate.
  Acceptance: four fixtures — one per valid disposition, plus an empty-reason rejection that fails.

- **R5** — Surviving `Q` entries carry a recommended answer plus the evidence it rests on; anything
  answerable from available evidence must not reach the user.
  Acceptance: `check-council.mjs` fails a council-mode brief whose surviving `Q` has no
  recommendation, or whose evidence references do not resolve to recorded finding IDs. The
  "must not reach the user" half is a skill instruction, not a mechanical check — see A3.

- **R6** — New brief frontmatter fields are optional with safe defaults; briefs written before 1.1.0
  continue to validate.
  Acceptance: `npm run validate` passes over all existing `workflow/artifacts/briefs/` and
  `examples/` briefs with no edits to any of them.

- **R7** — `agent-behavior.yaml` gains council configuration, defaulting to on for Complex only.
  `tuning.dispatch.enabled: disabled` takes precedence over `council.enabled` and suppresses the
  council outright (Q1). Resolution order: dispatch kill switch → `council.enabled` → `task_class`.
  Acceptance: council off ⇒ Complex Think runs single-agent and logs a refusal with reason; default
  is on-for-Complex; a fixture with `dispatch.enabled: disabled` and `council.enabled: true` produces
  no council and a logged refusal citing the kill switch.

- **R8** — The pre-R21 single-agent Think path is preserved verbatim as a fallback mode and exercised
  in CI for one release; not deleted in 1.1.0.
  Acceptance: the preserved path is a real rollback surface — if the staged pipeline is broken,
  selecting single-agent mode still produces a valid brief. A CI job runs a Complex Think with the
  council disabled and passes. Removal is scheduled for 1.2.0 (see A5).

- **R9** — Think classifies every active `R` and `RI` into question buckets and assigns each bucket
  the evidence class(es) that would actually settle it, before any dispatch.
  Acceptance: `check-council.mjs` fails a council-mode brief where any active `R`/`RI` has no
  classification entry, or any classification entry names zero evidence classes.

- **R10** — Four evidence classes — `repo`, `trial`, `web`, `recall` — each with its own citation
  contract:
  - `repo`: file path, and where applicable line range or command output.
  - `trial`: the sandbox path, what was run, and the observed result.
  - `web`: URL, retrieval date, **and an inline verbatim quote** of the claim being relied on.
  - `recall`: marked as model knowledge, carrying no citation.

  `recall` may never solely support a recommendation or resolve a `Q`; it may only raise a hypothesis
  that a finding of another class confirms.
  Acceptance: per-class citation shape is enforced; a `web` finding without a quote or retrieval date
  fails; a recommendation whose only evidence references are `recall` fails; a `recall` hypothesis
  corroborated by a `repo` or `trial` finding passes.

- **R11** — Trials run in a sandbox only. A trial member declares its sandbox path before running,
  the path must lie outside the repo root, and the repo working tree must be unmodified across the
  council's execution.
  Acceptance: a trial finding without a declared sandbox path fails; a declared path inside the repo
  root fails; a fixture recording repo working-tree modification during a council run fails.

- **R12** — Evidence-class availability is resolved at run time and logged. A class that was wanted
  but unavailable in the host agent is recorded as `unavailable`, never silently skipped.
  Acceptance: a council-mode brief records, per class, whether it was `used`, `unused`, or
  `unavailable`; a brief whose classification requested `web` but whose log omits any `web` status
  fails. A brief produced without web access is distinguishable from one produced with it by
  frontmatter alone.

- **R13** — Think iterates. After consolidation it assesses remaining open items and either runs
  another round, escalates to the user, or completes. The loop is bounded by `council.max_rounds`
  and guarded against no-progress rounds. Every run records a `termination_reason` of exactly
  `resolved`, `user-decision-required`, `max-rounds`, or `no-progress`.
  Acceptance: a round records `open_items_in` and `open_items_out`; a subsequent round after a round
  where `open_items_out >= open_items_in` fails the no-progress guard; exceeding `max_rounds` fails;
  `termination_reason: user-decision-required` requires a non-empty Questions For User section;
  `termination_reason: resolved` requires zero blocking `Q` IDs; `max-rounds` and `no-progress` must
  surface as recorded risk rather than silent completion.

- **R14** — The full council run is logged back into the brief: every round, its members and their
  roles, the evidence classes used per member, every finding with class and disposition, the
  open-item delta per round, and the termination reason.
  Acceptance: a reader can reconstruct what happened from the artifact alone, with no session
  transcript; `check-council.mjs` fails a brief whose recorded rounds, findings, or dispositions are
  structurally incomplete.

- **R15** — `lifecycle-think` is restructured into an explicit staged pipeline: classify → assign
  evidence classes → fan out → challenge → consolidate → assess open items → (loop or escalate) →
  log. Council mode and single-agent mode are both modes of the documented pipeline, with single-
  agent additionally preserved verbatim per R8.
  Acceptance: `SKILL.md`'s Workflow section names the stages in order with their gates; the Exit Gate
  covers the new stages; `references/output-schema.md` starter block carries the new optional
  frontmatter; a conformance check locks the SKILL.md stage list against the validator's expectations
  so the doc and `check-council.mjs` cannot drift apart (the R12/R13/R16/R19 drift class).

### Implicit (RI)

- **RI1** — Narrow the independence rule so read-only workers may overlap on surface when the parent
  declares a dedupe-and-reconcile contract in the active artifact; overlap stays forbidden for any
  repo-write-capable worker and for read-only workers with no declared contract.
  Acceptance: all five asserting files change together — `references/independence-rules.md`,
  `references/decision-tree-by-phase.md` (Think and Review rows plus per-phase refuse conditions),
  `references/phase-caps.md`, `SKILL.md` Determinism Rules, `references/output-schema.md` acceptance
  criteria. A grep proves no file still asserts the blanket form.

- **RI2** — Document the authorization carve-out in `dispatch-subagents/SKILL.md` as a named
  exception with its conditions, in the same shape as the existing E1 exception, including that
  sandbox-only writes do not forfeit read-only status for carve-out purposes.
  Acceptance: SKILL.md's refusal condition "the user did not explicitly authorize delegation" cites
  the carve-out; the conditions are stated together in one place.

- **RI3** — New `check-council.mjs` enforcing every mechanical check named across R2–R14, wired into
  `npm run validate` and the violations suite.
  Acceptance: validator listed in `src/workflow/validators/README.md` with its checks and its
  explicit non-claims; passes on a well-formed council brief; fails each seeded violation (RI9).

- **RI4** — The artifact records that the council fired or was refused (with reason), under which
  authorization mode, with which resolved cap and `cap_source`.
  Acceptance: council-mode and single-agent briefs are distinguishable by frontmatter alone, with no
  prose inspection.

- **RI5** — Brief schema updated in `src/workflow/schemas/`, bundles rebuilt, adapters re-rendered
  and confirmed in sync if any gate content changed.
  Acceptance: `npm run build`, `npm run validate`, `npm run violations:test`,
  `npm run conformance:test` all green; `render-adapters` reports shims current.

- **RI6** — Shipped docs state plainly what `check-council.mjs` does **not** check: whether a finding
  is correct, whether the council found what a human would have found, whether a rejection reason is
  a good one, and whether a `web` quote was genuinely present at the cited URL.
  Acceptance: the non-claims appear in the validator's README entry and in the council skill's
  reference docs, as prose, not as an implication.

- **RI7** — Make the council-specific default fan-out of 3 (Q2) visible rather than silent, since an
  unconfigured consumer now incurs multiplied cost without having chosen it.
  Acceptance: `phase-caps.md` documents the council's departure from the global default-to-1 rule and
  why; the artifact records `cap_source: council-default` vs `configured`; the council skill's docs
  name the token-cost implication in prose.

- **RI8** — A research-depth dial (`shallow` / `standard` / `deep`) in `agent-behavior.yaml`,
  separate from fan-out, so cost can be reduced without shrinking the council.
  Acceptance: depth is resolvable global-then-repo-local like other tuning keys; it bounds per-member
  research effort, not member count; the resolved value is recorded in the artifact.

- **RI9** — A violations fixture per mechanical check, so every rule R2–R14 states is proven to
  actually reject.
  Acceptance: `npm run violations:test` count increases by the number of new checks and all pass;
  each fixture is rejected by `check-council.mjs` specifically, not incidentally by another validator.

### Assumptions (A)

- **A1** — WP-R8 lands before or with this package. R21 modifies `agent-behavior.yaml` and four
  `dispatch-subagents/` files that R8 also touches; this branch is cut from
  `feat/wp-r8-behavior-tuning` for exactly that reason. Verified by `git diff --name-only` against
  `release/1.1.0` showing the overlap.
- **A2** — Council mechanics live in a new power skill under `src/workflow/skills/`, while
  `lifecycle-think` owns the staged pipeline and the round loop that invokes it. Splitting this way
  keeps the council reusable for WP-R22 rather than entangling it with Think's own orchestration.
- **A3** — R5's "anything answerable must not reach the user" is enforceable only as a skill
  instruction — no validator can know what was answerable. The mechanical half is "every surviving Q
  has a recommendation backed by resolvable, non-`recall` evidence references."
- **A4** — Council members are dispatched through the existing `dispatch-subagents` contract rather
  than a parallel mechanism, so caps, logging, and refusal conditions are inherited rather than
  reimplemented.
- **A5** — R8's preserved single-agent path is removed in 1.2.0. This must be added to the 1.2.0
  release checklist at Ship, alongside the existing `x_enforcement: warn-until-1.2.0` marker cleanup
  (OI-67), or it becomes permanent dead weight.
- **A6** — Sandbox trials use the agent's own scratchpad or a temporary directory outside the repo.
  agentsmyth does not ship a sandbox runtime; it specifies the constraint and checks compliance.

### Open Questions (Q)

- **Q1 — RESOLVED 2026-08-15 (user decision): kill switch wins.** `tuning.dispatch.enabled:
  disabled` suppresses the council outright; it logs a refusal and Think runs single-agent.
  Resolution order: dispatch kill switch → `council.enabled` → `task_class: complex`. Folded into R7.
  Accepted cost, per the user's own selection: a repo that disabled dispatch for write-safety also
  loses a read-only feature it might have wanted.

- **Q2 — RESOLVED 2026-08-15 (user decision): council-specific default fan-out of 3.** When no cap is
  configured the council resolves to 3 rather than the global default of 1. Folded into R2.
  **Decided against the recommendation**, and the tradeoff is recorded rather than smoothed over: a
  fresh consumer gets up to 4 members on every Complex Think having configured nothing, and "never
  increase the cap in response to a request" is weakened in spirit. RI7 makes the default visible at
  the point it costs money; RI8 adds a depth dial so cost is reducible without shrinking the council.
  RK-C carries it forward to Review for measurement.

- **Q3 — RESOLVED 2026-08-16: the challenge pass is a dispatched member counted against the cap.**
  A parent-run challenge shares the parent's context, which is exactly the degradation RK-F
  describes. Folded into R3. Cost is bounded by the same cap as research members.

## Questions For User

No blocking questions remain. All three are resolved and folded into requirements:

| ID | Decision | Matched recommendation | Folded into |
|---|---|---|---|
| Q1 | Kill switch wins — `dispatch.enabled: disabled` suppresses the council | yes | R7 |
| Q2 | Council-specific default fan-out of 3 when no cap configured | no | R2, RI7, RI8 |
| Q3 | Challenge pass is a dispatched member, counted against the cap | yes | R3 |

**Still outstanding: approval of this brief as a whole.** `user_checkpoint: brief-review` remains
unsatisfied and `## Checkpoint Approval` is deliberately absent — per `workflow/rules.md`'s Approval
section, that section may only be written from the user's own verbatim approval of this artifact's
content, never authored on their behalf.

Worth your attention before approving, because these are the judgment calls I made rather than ones
you specified:

1. **A5** schedules removal of the preserved single-agent path in 1.2.0. If you would rather keep it
   permanently, R8's acceptance changes.
2. **RI8** (depth dial) is my addition, not yours. Rounds multiply the cost you already accepted in
   Q2, and fan-out is the wrong knob to reduce it with. Drop it if you consider it scope creep.
3. **R13's** `max_rounds` default value is unset in this brief — I'd propose 3, settled at Plan.

## Architecture Notes

- role: Architect
- decision: Restructure `lifecycle-think` into an explicit staged pipeline (classify → assign
  evidence classes → fan out → challenge → consolidate → assess → loop or escalate → log), with the
  council's mechanics factored into a separate power skill that WP-R22 can reuse. Both council and
  single-agent are modes of the same documented pipeline; the pre-R21 path is additionally preserved
  verbatim as a genuine rollback surface rather than being reconstructed as "the pipeline with
  dispatch off," because a mode of a broken pipeline is not a rollback.
- decision: Make evidence class a first-class, per-finding field rather than prose. It is what turns
  the disposition contract from bookkeeping into something gradable, and it is the only structural
  defense against `recall` masquerading as research (RK-D).
- constraint: Additive-only for 1.1.0 — every new frontmatter field optional with a safe default.
  Zero new runtime dependencies; agentsmyth ships no HTTP client and no sandbox runtime, so R10's
  `web` class and R11's trials are *specified and checked*, never *provided*.
- tradeoff: The carve-out genuinely weakens a shipped safety rule, and sandbox trials stretch
  "read-only" to mean "read-only with respect to the user's repo." Bought back with: no repo writes,
  declared sandbox paths, a clean-working-tree check, two named phases, config visibility, and the
  `dispatch.enabled` kill switch outranking everything. Accepted deliberately and recorded rather
  than implied.
- tradeoff: The anti-drift mechanics are structural, not semantic. They can prove the loop ran,
  progressed, cited, and terminated for a stated reason. They cannot prove the thinking was good.
  This ceiling is stated in the docs (RI6) instead of being papered over — an honest narrow claim
  beats a broad one the validator cannot support.
- downstream: WP-R22 (Review Council) is hard-gated on this package and inherits three surfaces
  directly — RI1's independence narrowing, R4's disposition contract, and R10's evidence classes.
  Getting any of those shapes wrong propagates into Review, where the failure mode is a compromised
  verdict on a commit-blocking gate. Plan should sequence those three first and treat them as
  contract, not implementation detail.

## Exit Gate

- [x] Every active R and RI has acceptance criteria.
- [x] Blocking Q IDs appear in orchestration.blockers (none remain).
- [ ] User approved or waiver recorded.
