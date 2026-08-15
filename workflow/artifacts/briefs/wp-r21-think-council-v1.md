---
slug: wp-r21-think-council
version: 1
artifact: brief
status: blocked-for-user
created: 2026-08-15
updated: 2026-08-15
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, RI1, RI2, RI3, RI4, RI5, RI6]
upstream:
  - user-request
orchestration:
  phase: think
  status: blocked-for-user
  next_phase: plan
  blockers: [Q1, Q2]
  user_checkpoint: brief-review
skill_trigger_log:
  - skill: repo-alignment-scan
    decision: ran
    reason: ran — the council must land inside an existing dispatch contract (dispatch-subagents skill, agent-behavior.yaml, phase-caps), so alignment with shipped rules is the dominant risk
  - skill: architecture-decision-advisor
    decision: ran
    reason: ran — the authorization carve-out and the independence-rule narrowing are both changes to shipped invariants, not additive features
  - skill: constraint-conflict-scan
    decision: ran
    reason: ran — found a real conflict between the auto-firing council and WP-R8's tuning.dispatch.enabled kill switch; raised as Q1
---

# WP-R21 Think Council (Research + Challenge Agents) - Brief

## Source Links

- Notion WP-R21 — Think Council (Research + Challenge Agents) (Class Complex, P1, Target 1.1.0)
- Notion 06 — Decision & Risk Log (RK10 carries the "validator checks process, not judgment" risk)
- Notion 07 — Versioning Policy (R21/R22 = new skills + optional brief/review frontmatter fields)
- `src/workflow/skills/dispatch-subagents/` — SKILL.md, references/{independence-rules, decision-tree-by-phase, phase-caps, output-schema}.md
- `src/workflow/agent-behavior.yaml` — `dispatch:` block (lines 134–139)
- `src/workflow/skills/lifecycle-think/` — the single-agent path being preserved

## Problem

Think defers to the user whenever a requirement is ambiguous. Every unresolved item becomes a `Q`
blocker carrying no proposed answer, so the user absorbs the full resolution burden even when the
answer is derivable from the repo, the config, or a prior artifact. On Complex requirements this
makes Think simultaneously slow (the user is a serial bottleneck) and shallow (nobody attacked the
first plausible framing). The failure is not that Think asks questions — it is that it asks
questions it could have answered, and asks them without a recommendation.

## Goals

- On Complex tasks, resolve from evidence everything that is resolvable from evidence, and surface
  to the user only what genuinely needs human authority — each with a recommendation and its basis.
- Subject research output to an adversarial pass before it consolidates into a brief, so the first
  plausible framing is not the one that ships.
- Make a council run auditable after the fact: who found what, what was done with each finding, and
  under which authorization mode the council fired.
- Land all of this without breaking the existing single-agent path or any pre-1.1.0 artifact.

## Non-Goals

- The Review phase council (WP-R22) — hard-gated on this package landing first.
- Any council output satisfying a phase exit gate by itself. The council produces questions and
  findings, never a verdict.
- Write access for any council member.
- Deleting the single-agent Think path in 1.1.0.
- Making the validator judge whether a finding is *correct*. See RI6 and Risks.

## User Impact

The user's Think experience on Complex work changes from "answer this list of questions I could
have researched" to "confirm or overrule these decisions, here is what I found and what I
recommend." On Trivial and Standard work nothing changes at all. Consumers who want the old
behavior keep it via a config flag rather than a downgrade.

The cost side is honest: a Complex Think now spends more tokens and more wall-clock before it
reaches the user. The trade is deliberate — fewer, better questions in exchange for more work up
front.

## Success Metrics

- On a Complex task run through the council, the count of `Q` IDs reaching the user is lower than
  the same task's single-agent baseline, and every surviving `Q` carries a recommendation.
- Zero pre-1.1.0 briefs fail validation after the schema change (measured: full `npm run validate`
  over `workflow/artifacts/` and `examples/`).
- `check-council.mjs` rejects each of its seven failure modes in the violations suite.
- The single-agent path still runs green in CI with the council disabled.

## Requirements

Numbered in the Requirement Manifest below. R1–R8 are the Notion WP's stated requirements carried
over verbatim in intent; RI1–RI6 are the implicit work that WP's own "Resolved Before Build"
section already commits to but does not enumerate as requirements.

## Constraints

- **Additive only.** 1.1.0 is a minor. New brief frontmatter fields must be optional with safe
  defaults; no required-schema change. Any required field escalates this to a major bump.
- **Zero runtime dependencies.** `check-council.mjs` is hand-written Node ESM like every other
  validator.
- **Edit source, rebuild.** All changes land in `src/`; `npm run build` regenerates bundles.
- **Adapters stay in sync** if any mandatory-gate content changes across the five tool shims.
- **Caps are hard.** The council cannot raise `dispatch.max_parallel_workstreams` for itself.
- **The council is read-only.** This is what buys the authorization carve-out; it is not negotiable
  without re-opening that decision.

## Risks

- **RK-A (high): the carve-out is a real weakening of a shipped safety rule.** Today the rule is
  "no dispatch without explicit per-conversation authorization." After R21 it becomes "…except when
  four conditions hold." Every such exception is a surface for a future one. Mitigation: the
  carve-out is config-visible (`council.enabled`), recorded per-run in the artifact, and bounded to
  read-only members in two named phases.
- **RK-B (high, carried as RK10 in the Decision Log): the validator checks process, not judgment.**
  `check-council.mjs` can prove the council ran, that findings were attributed, and that
  dispositions were recorded with reasons. It cannot prove a finding was correct, that the council
  found what a human would have, or that a rejection reason was a *good* one. The product claim
  must stay on the first set. Mitigation: state this explicitly in the shipped docs (RI6) rather
  than letting the validator's existence imply the stronger claim.
- **RK-C (medium): cost and latency on Complex Think.** Fan-out plus a challenge pass multiplies
  token spend on exactly the tasks that are already largest. Mitigation: the phase cap bounds
  fan-out; `council.enabled` gives a kill switch.
- **RK-D (medium): the challenge pass degenerates into agreement.** A challenger with the same
  context as the researcher tends to ratify it. Mitigation: the challenge pass must run with fresh
  context, and `rejected-with-reason` must be a first-class outcome rather than an exception path.
- **RK-E (medium): dedupe/reconcile contract becomes a rubber stamp.** RI1 permits read-only
  surface overlap *provided* the parent declares a reconcile contract. If that declaration is
  boilerplate, the narrowing has bought overlap for free. Mitigation: `check-council.mjs` should
  require the contract to be present and non-empty; it cannot require it to be thoughtful.
- **RK-F (low): recursion.** A council member is itself an agent; nested dispatch would fan out
  combinatorially. Existing Determinism Rule "do not nest subagent dispatch" already forbids this
  and must be restated for council members explicitly.

## Open Questions

Q1 and Q2 are blocking — both change what gets built, not merely how. Q3 is non-blocking.

## Requirement Manifest

### Explicit (R)

- **R1** — Council fires on `task_class: complex` only; Trivial and Standard keep the current
  single-agent Think path byte-for-byte unchanged.
  Acceptance: a Standard task run through Think produces no council block and no council dispatch;
  a Complex task produces both. Both assertions locked by fixtures.

- **R2** — Research agents are read-only and capped by the resolved
  `dispatch.max_parallel_workstreams`.
  Acceptance: `check-council.mjs` fails an artifact whose recorded fan-out exceeds the resolved cap;
  no council member is granted write access in its dispatch record.

- **R3** — A challenge pass reviews research output before consolidation, with findings attributed
  to their source member and never folded in anonymously.
  Acceptance: `check-council.mjs` fails any finding lacking a source member; a fixture with an
  unattributed finding is rejected.

- **R4** — Every council finding carries a disposition of `accepted`, `merged`, or
  `rejected-with-reason`; a `rejected-with-reason` with an empty reason fails the phase gate.
  Acceptance: four fixtures — one per valid disposition, plus an empty-reason rejection that fails.

- **R5** — Surviving `Q` entries carry a recommended answer plus the evidence it rests on; anything
  answerable from repo, config, or prior-artifact evidence must not reach the user.
  Acceptance: `check-council.mjs` fails a council-mode brief whose `Q` entry has no recommendation.
  The "must not reach the user" half is a *skill instruction*, not a mechanical check — see A3.

- **R6** — New brief frontmatter fields are optional with safe defaults; briefs written before
  1.1.0 continue to validate.
  Acceptance: `npm run validate` passes over all existing `workflow/artifacts/briefs/` and
  `examples/` briefs with no edits to any of them.

- **R7** — `agent-behavior.yaml` gains a config field to disable the council, defaulting to on for
  Complex only.
  Acceptance: setting the field off makes a Complex Think run single-agent and log a refusal with
  reason; the default value is on-for-Complex.

- **R8** — The single-agent Think path stays functional and exercised in CI for one release; not
  deleted in 1.1.0.
  Acceptance: a CI job runs a Complex Think with the council disabled and passes.

### Implicit (RI)

- **RI1** — Narrow the independence rule so read-only workers may overlap on surface when the parent
  declares a dedupe-and-reconcile contract in the active artifact; overlap stays forbidden for any
  write-capable worker and for read-only workers with no declared contract.
  Acceptance: all five asserting files change together — `references/independence-rules.md`,
  `references/decision-tree-by-phase.md` (Think and Review rows plus per-phase refuse conditions),
  `references/phase-caps.md`, `SKILL.md` Determinism Rules, `references/output-schema.md` acceptance
  criteria. A grep proves no file still asserts the blanket form.

- **RI2** — Document the authorization carve-out in `dispatch-subagents/SKILL.md` as a named
  exception with its four conditions, in the same shape as the existing E1 exception.
  Acceptance: SKILL.md's refusal condition "the user did not explicitly authorize delegation" cites
  the carve-out; the four conditions are stated together in one place.

- **RI3** — New `check-council.mjs` validator enforcing the seven checks the WP names, wired into
  `npm run validate` and the violations suite.
  Acceptance: seven fixtures, one per check, each rejected; validator listed in
  `src/workflow/validators/README.md`.

- **RI4** — The artifact records that the council fired (or was refused, with reason) and under
  which authorization mode, so a reader can always distinguish a council run from a single-agent
  run.
  Acceptance: a council-mode brief and a single-agent brief are distinguishable by frontmatter
  alone, with no prose inspection.

- **RI5** — Brief schema updated in `src/workflow/schemas/` and bundles rebuilt so the shipped and
  global-install copies carry the new optional fields.
  Acceptance: `npm run build` run; `npm run validate` and `npm run violations:test` green.

- **RI6** — Shipped docs state plainly what `check-council.mjs` does **not** check: whether a
  finding is correct, whether the council found what a human would have found, and whether a
  rejection reason is a good one.
  Acceptance: the non-claims appear in the validator's own README entry and in the council skill's
  reference docs, as prose, not as an implication.

### Assumptions (A)

- **A1** — WP-R8 lands before or with this package. R21 must modify `agent-behavior.yaml` and four
  `dispatch-subagents/` files that R8 also touches; this branch is cut from
  `feat/wp-r8-behavior-tuning` for exactly that reason. Verified by `git diff --name-only` against
  `release/1.1.0` showing the overlap.
- **A2** — The council is implemented as a new power skill under `src/workflow/skills/`, following
  the existing skill shape (SKILL.md + references/), rather than as logic embedded in
  `lifecycle-think/SKILL.md`. This keeps R8's "single-agent path unchanged" claim literally true.
- **A3** — R5's "anything answerable from evidence must not reach the user" is enforceable only as a
  skill instruction, not as a mechanical validator check — no validator can know what was
  answerable. The mechanical half is "every surviving Q has a recommendation."
- **A4** — Council members are dispatched via the existing `dispatch-subagents` contract rather than
  a parallel mechanism, so caps, logging, and refusal conditions are inherited rather than
  reimplemented.

### Open Questions (Q)

- **Q1** — When a repo sets `tuning.dispatch.enabled: disabled` (shipped in WP-R8) but
  `council.enabled` is on, does the council fire?
  These two currently contradict each other. `dispatch-subagents/SKILL.md` states that a `disabled`
  resolution means "do not dispatch in any phase **even with explicit user authorization** — a repo
  that has turned delegation off has made a standing decision that a per-session authorization does
  not reverse." An auto-firing council is weaker authorization than an explicit user instruction, so
  by that rule it must not fire. But the WP's carve-out lists only `council.enabled` among its four
  conditions and never mentions `dispatch.enabled`. Recommendation: **`dispatch.enabled: disabled`
  wins and suppresses the council**, logging a refusal — a kill switch that a new feature can route
  around is not a kill switch. Needs your decision because it changes R7's config semantics.
  Owner: user. Blocking: yes.

- **Q2** — What is the council's effective fan-out when no cap is configured?
  `phase-caps.md` says that if neither global config nor repo tuning declares
  `max_parallel_workstreams`, the default is 1 — no parallelism. A "council" of one researcher plus
  one challenger is not obviously the intended product, but silently defaulting the council higher
  would violate "never increase the cap in response to a request." Recommendation: **keep the
  documented default of 1 and state plainly that a repo wanting a real council must configure a
  cap**, rather than special-casing the council. This repo already sets 3, so this affects fresh
  consumers only.
  Owner: user. Blocking: yes.

- **Q3** — Should the challenge pass be a distinct dispatched member, or a second turn by the parent
  with deliberately fresh context?
  A dispatched challenger costs another worker against the cap; a parent-run challenge is cheaper
  but shares the parent's context, which is exactly the degradation RK-D describes. Recommendation:
  dispatched member, counted against the cap. Non-blocking — Plan can settle this once Q2 fixes the
  cap semantics.
  Owner: workflow owner. Blocking: no.

## Questions For User

Two decisions are needed before Plan can start. Both are genuine authority calls, not research
gaps — I have a recommendation for each and the basis for it.

1. **Q1 — kill-switch precedence.** If a repo has turned dispatch off entirely, may the council
   still fire? I recommend no: `dispatch.enabled: disabled` suppresses the council and logs a
   refusal. The alternative makes WP-R8's kill switch routable-around by any later feature.

2. **Q2 — default fan-out.** With no configured cap the documented default is 1, which makes a
   default-install "council" degenerate. I recommend keeping 1 and documenting that a real council
   requires configuring a cap, rather than carving out a council-specific default.

## Architecture Notes

- role: Architect
- decision: Implement the council as a new power skill dispatched through the existing
  `dispatch-subagents` contract, rather than as logic inside `lifecycle-think`. Inherits caps,
  logging, and refusal conditions instead of reimplementing them, and keeps R8's "single-agent path
  unchanged" claim literally verifiable.
- constraint: Additive-only for 1.1.0 — every new brief frontmatter field optional with a safe
  default, or the release escalates to a major bump. Zero new runtime dependencies.
- tradeoff: The authorization carve-out genuinely weakens a shipped safety rule in exchange for a
  council that fires without ceremony. Bought back with three bounds: read-only members, two named
  phases, and config visibility. Accepted deliberately, recorded rather than implied.
- downstream: WP-R22 (Review Council) is hard-gated on this package. RI1's independence narrowing
  and RI3's disposition contract are the two surfaces R22 inherits directly — getting either shape
  wrong here propagates.

## Exit Gate

- [x] Every active R and RI has acceptance criteria.
- [x] Blocking Q IDs appear in orchestration.blockers.
- [ ] User approved or waiver recorded.
