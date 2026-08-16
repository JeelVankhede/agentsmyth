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
- `check-council-record.mjs` rejects every one of its failure modes in the violations suite (RI9).
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
- **Zero runtime dependencies.** `check-council-record.mjs` is hand-written Node ESM like every other
  validator. No HTTP client ships with agentsmyth.
- **Edit source, rebuild.** All changes land in `src/`; `npm run build` regenerates bundles.
- **Caps are hard.** Neither the council nor a round may raise `dispatch.max_parallel_workstreams`.
- **Council members never write to the repo.** Sandbox-only, outside the repo root (R11). This is
  what preserves the authorization carve-out.
- **The workflow is portable across five tools.** Nothing may assume a capability only one agent has.

## Risks

- **RK-A (low — resolved 2026-08-16): the carve-out weakens a shipped safety rule.** The original
  concern was precedent: converting a bright line ("no dispatch without explicit authorization") into
  a four-condition policy invites a fifth condition later. Largely dissolved on inspection. The
  shipped rule protected two things — no surprise writes, no surprise cost. The repo fence (R2, R11)
  removes the first absolutely, and Q1 hands the second to the `dispatch.enabled` kill switch, which
  outranks the council. The principle also self-limits rather than creeping: the dangerous extension
  would be auto-firing Build workers, but Build's output *is* repo mutation, so a non-repo-writing
  Build worker produces nothing usable and the argument cannot be made.
  Residual, and the reason R2 has an outward axis: the repo fence bounds the filesystem, not the
  network. A member with fetch and tool access can act on external systems without touching the
  repo, and under the carve-out it does so unprompted. Resolved by capability tiering — carve-out
  members get read/fetch/search only; outward-facing actions require explicit in-conversation
  authorization. Remaining documentation task: state the carve-out as its bounding principle
  (*no repo mutation, in phases that produce no verdict*) rather than as an enumerated list, so a
  future reader derives the boundary instead of extending a list.
- **RK-B (medium, was high — mitigated 2026-08-16, = RK10 in the Decision Log): the validator checks
  process, not judgment.** `check-council-record.mjs` can prove the council ran, findings were
  attributed, dispositions were recorded with reasons, evidence classes were declared, and rounds
  made progress. It cannot prove a finding was correct, that the research was good, or that a
  rejection reason was sound.
  What makes this a risk rather than a stated limitation is that the gap is invisible at the point
  of use: a green check looks identical whether the research was rigorous or theatrical, and over
  a few releases it becomes shorthand for "the thinking was sound" — at which point people stop
  reading the brief, which is the only thing that would reveal the difference.
  Mitigation is three-layered, because documentation alone does not reach the person trusting a
  green check. (1) The validator is **named** `check-council-record.mjs` — it validates the record,
  and the filename is what people actually see. (2) It **reports texture, not a bare pass** (RI3):
  rounds, findings, unconfirmed `recall`-only hypotheses, rejections. A number that varies gets
  read. (3) RI6 states the non-claims explicitly in the docs, as the backstop rather than the
  primary defense.
- **RK-C (medium, was high — restructured 2026-08-16): cost.** The original shape was a flat council
  repeated up to `max_rounds`: 4 agents × 3 rounds ≈ 12 invocations per Complex Think against
  today's 1, incurred by an unconfigured consumer because Q2 defaults fan-out to 3.
  Restructured by R13's taper, which changes the economics rather than merely bounding them. Typical
  runs are 1–2 rounds (≈4–8 invocations), the expensive breadth is spent once on round 1 where the
  space is still unmapped, and every later round is strictly cheaper than the one before it.
  Worst case is now roughly 10 across 4 rounds rather than 12 across 3, but the *expected* case —
  which is what actually gets billed — drops substantially, and a single-round resolution costs 4.
  Mitigation: the non-increasing invariant (R13), the taper-coherence check that stops a council
  asserting convergence it did not achieve (R13), `max_rounds` as backstop, a research-depth dial
  separate from fan-out (RI8), both kill switches, and `cap_source` visibility (RI7).
  Residual: the multiplier is still unmeasured. Measure on the **first real council run during
  Build**, against the single-agent baseline for the same task — during Build rather than at Review,
  because discovering a bad multiplier after implementation and review means redesigning something
  already built. The taper makes a pre-committed abort threshold less critical than it was, but the
  measurement itself is not optional.
- **RK-D (medium, was high — hardened 2026-08-16): `recall` masquerading as evidence.** The model's
  own knowledge feels like fact, carries no citation, and cannot be re-checked. It is also the
  cheapest class to produce, so it is where an agent under pressure to converge drifts.
  The first mitigation — "`recall` may never solely support a recommendation" — had a hole the
  original brief did not admit: **the agent self-declares the class**, so the rule is routed around
  by labelling a recollection as `repo` with a plausible-looking path. A constraint the constrained
  party can opt out of by relabelling is not a constraint.
  Hardened by R10's resolution tier: `repo` citations must resolve (path exists, line range in
  bounds) and `trial` findings must carry their command and non-empty observed output. That makes
  the most attractive relabelling target mechanically expensive using pure filesystem checks and no
  judgment.
  Residual, stated rather than papered over: a determined agent can still cite a real file that did
  not inform its finding, and `web` remains shape-checked only (RK-E). Resolution raises the cost of
  fabrication; it does not eliminate it.
- **RK-E (high — two distinct failures, one solved, one permanently residual): fabricated or rotted
  web citations.**
  *Rot is solved.* R10's URL + retrieval date + inline verbatim quote means the artifact carries the
  claim even after the page moves or changes, so a dead link no longer empties the evidence.
  *Fabrication is not, and will not be.* An invented quote is indistinguishable from a real one to
  any check that cannot fetch the page, and agentsmyth ships no HTTP client, so it structurally
  cannot fetch. `web` is the weakest class in the system and the only one with no mechanical floor.
  Two mitigations raise the cost without closing it. R10 **scopes what `web` may decide**: it can
  solely support a recommendation only on genuinely external facts, never on repo-shaped questions
  where `repo` is available and resolves. R3 gives the challenger a **recorded duty to spot-check at
  least one `web` citation per round**, so fabrication risks being caught rather than merely being
  wrong.
  Residual after both, stated and not softened: a fabricated quote on a genuinely external fact that
  the challenger did not happen to sample will pass every check this system has. It is recorded as a
  non-claim in RI6 alongside the others.
- **RK-F (medium — hardened 2026-08-16): the challenge pass degenerates into agreement.** A
  challenger sharing the researcher's framing ratifies it, yielding the cost of an adversarial pass
  and the value of a rubber stamp — arguably worse than no challenge, since the artifact then
  records that findings "survived challenge."
  "Fresh context" alone was too weak to carry this. Subagents inherit framing from the **dispatch
  prompt**, not only from conversation history: a parent that says "verify these findings about X"
  has set the anchor before the challenger reads anything. R3 now requires the challenger to receive
  the **raw research findings rather than the parent's consolidation** — the synthesis is the thing
  under test — plus an explicitly adversarial charter in which `rejected-with-reason` is a success
  outcome.
  Detection is free but deliberately soft: zero rejections across all rounds is either a clean run or
  a rubber stamp, and the artifact cannot distinguish them. The count surfaces in the RI3 summary
  line as a reported signal rather than a gate, because failing on it would simply train the agent to
  manufacture a token rejection.
- **RK-G (medium — re-scoped 2026-08-16): silent conflict resolution.** Originally framed as
  "the reconcile contract becomes boilerplate," which was the weaker framing: boilerplate overlap
  mostly wastes tokens — two members read the same file, consolidation dedupes, you paid twice for
  one answer. Annoying, not dangerous.
  The failure that actually matters is narrower and worse. Two members reach **conflicting**
  conclusions about the same surface and the parent silently picks one. That is a wrong answer
  carrying a complete audit trail, and it destroys the single most valuable signal the council
  produced — the disagreement itself — at exactly the moment it should have been surfaced.
  Mitigation: RI1 now requires the conflict and its resolution to be recorded explicitly, which is
  mechanically detectable since findings carry their surface and disposition. Residual unchanged:
  presence of a reconcile note is checkable, its quality is not.
- **RK-H (medium — hardened 2026-08-16): the loop converges by exhaustion.** An agent that keeps
  finding new questions can round forever; one that stops at `max_rounds` may present a half-answered
  brief as finished.
  The subtler and likelier failure is **gaming by count**, and it requires no bad behaviour at all —
  only an agent doing the tractable work first, which is usually correct. A round closes three easy
  items, `open_items_out` drops, the taper reads as coherent, and the single hard question that
  actually blocks the work survives untouched round after round until the loop expires. The brief
  then looks thoroughly researched and has not answered the thing that mattered.
  Mitigation: R13 tracks **which item IDs closed** each round rather than how many, so a survivor's
  history is legible instead of hidden inside a shrinking number. And the signal is turned into the
  feature — an item that survives every round escalates as `user-decision-required` carrying its
  per-round history, rather than expiring as `max-rounds`. The council's demonstrated inability to
  close an item becomes the argument for putting it in front of the user.
  Residual: an agent that keeps *generating* new items can still avoid termination until the bound,
  though the per-ID history now makes that pattern visible in the artifact.
- **RK-I (low, was medium — restructured 2026-08-16): sandbox escape.** A trial member that writes
  into the repo violates the basis of the carve-out.
  The original mitigation contained a concrete defect, not a theoretical one: `git status` clean does
  **not** catch writes to gitignored paths. In this repo `dist/` and `workflow/schemas/` are
  gitignored build outputs, and `dist/workflow-bundle.md` is what consumers install — so a member
  could mutate shipped bundle content while the check reported green. A safety check that succeeds
  exactly where the damage is invisible is worse than none.
  Restructured on two axes. **Confinement** moved from per-run assertion to configuration: R11's
  `sandbox_root` (default `~/.agentsmyth/sandbox/`, resolved like `definitions_root`) puts scratch
  outside every repo by construction, with per-member subpaths so concurrent trials cannot collide.
  **Integrity** is now asserted filesystem-scoped over the repo root including gitignored outputs,
  never by `git status` alone.
  Residual, stated rather than engineered around: a member can still write outside both the repo and
  the configured sandbox — home directory, a sibling repo, a global config. agentsmyth is a workflow
  contract, not a sandbox runtime; it can require the declaration and verify what it observes, but it
  cannot confine a process it does not spawn. Recorded as a non-claim in RI6.
- **RK-J (low — closed 2026-08-16): recursion.** Council members are agents; nested dispatch fans out
  combinatorially — 3 researchers each spawning 3 gives 9 at depth 2, and R13's taper becomes
  meaningless. This was never a gap in the rules: the existing "do not nest subagent dispatch"
  Determinism Rule forbids it flatly.
  Mitigation: RI2 restates the prohibition **in the council skill itself** rather than relying on
  inheritance from `dispatch-subagents`, and RI4 asserts **dispatch depth 1** in the log so a
  violation is a recorded fact rather than an inference from an unexpected bill. With R13's
  non-increasing fan-out and R2's per-stage caps, the cost model is fully bounded.
  Residual: nothing beyond "an agent that ignores an explicit determinism rule," which is the trust
  floor every other rule in the system already sits on.

## Open Questions

No blocking questions remain. Q1, Q2, and Q3 are resolved and recorded below; the brief itself still
requires user approval before Plan may start.

## Requirement Manifest

### Explicit (R)

- **R1** — The council fires on `task_class: complex` only; Trivial and Standard keep the preserved
  single-agent Think path with no behavioral change.
  Acceptance: a Standard task through Think produces no council block and no dispatch; a Complex task
  produces both. Both locked by fixtures.

- **R2** — Council member capability is fenced on two independent axes.

  *Repo axis (absolute):* no member may modify the repository under any authorization mode. Writes
  go to a declared sandbox outside the repo root (R11). Anything outside the repo is otherwise
  unconstrained.

  *Outward axis (authorization-dependent):* a member fired under the carve-out — i.e. without
  per-conversation user authorization — gets read, fetch, and search capability only, and may not
  take outward-facing actions (creating issues, posting comments, writing to external systems, or
  any other side-effecting call). A council the user explicitly authorizes in-conversation may act
  outward. The distinction exists because the carve-out means the council fires unprompted, and an
  unprompted agent acting in the user's name is a different risk from one they asked for.

  Fan-out is capped by the resolved `dispatch.max_parallel_workstreams`; with no cap configured the
  council resolves to its own default of 3 (Q2). The cap governs **peak concurrent workstreams
  within a stage**, not the round total: researchers run as one parallel stage, then challengers run
  as a second parallel stage against their output. Each stage is capped independently, so a round of
  3 researchers followed by 2 challengers never exceeds a cap of 3 (Q3, corrected).

  Acceptance: `check-council-record.mjs` fails an artifact whose recorded per-stage fan-out exceeds
  the resolved cap; no member records repo write access under any mode; a member recorded with
  `authorization: carve-out` and any outward-action capability fails; with no cap configured the
  effective cap is 3 and the artifact records `cap_source: council-default`.

- **R3** — A challenge pass reviews research output before consolidation, attacking sourcing as well
  as reasoning, with every finding attributed to its source member and never folded in anonymously.
  **The challenger receives the raw research findings, not the parent's consolidation.** The
  parent's synthesis is precisely the framing under test, so passing it along pre-loads the answer;
  fresh context prevents contamination from the conversation but does nothing about contamination
  from the instruction. The challenger is chartered adversarially: its job is to find what is wrong,
  and `rejected-with-reason` is a success outcome for a challenger rather than an exception path.
  The challenger carries one concrete, recorded duty beyond general critique: **spot-check at least
  one `web` citation per round**, filed as its own finding. `web` is the only class with no
  mechanical floor (RK-E), so sampling it is the sole mechanism by which a fabricated quote can be
  caught rather than merely being wrong.
  Acceptance: `check-council-record.mjs` fails any finding lacking a source member; a fixture with an
  unattributed finding is rejected; a round containing one or more `web` findings but no recorded
  challenger spot-check fails; the challenger's recorded input references the research findings and
  not the parent consolidation; the challenger is a dispatched member forming its own capped stage
  (Q3, corrected).
  **Zero rejections across all rounds is reported, not failed.** A clean run is legitimate, and a
  hard gate on rejection count would teach the agent to manufacture a token rejection — a worse
  outcome than the disease. The count surfaces in the RI3 summary line so the pattern becomes
  visible across runs.

- **R4** — Every finding carries a disposition of `accepted`, `merged`, or `rejected-with-reason`;
  `rejected-with-reason` with an empty reason fails the phase gate.
  Acceptance: four fixtures — one per valid disposition, plus an empty-reason rejection that fails.

- **R5** — Surviving `Q` entries carry a recommended answer plus the evidence it rests on; anything
  answerable from available evidence must not reach the user.
  Acceptance: `check-council-record.mjs` fails a council-mode brief whose surviving `Q` has no
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
  Acceptance: `check-council-record.mjs` fails a council-mode brief where any active `R`/`RI` has no
  classification entry, or any classification entry names zero evidence classes.

- **R10** — Four evidence classes — `repo`, `trial`, `web`, `recall` — each with its own citation
  contract, checked at the strongest level the class permits:

  | Class | Citation contract | Enforcement |
  |---|---|---|
  | `repo` | file path, plus line range or command output where applicable | **resolved** — path must exist, line range must be within bounds |
  | `trial` | sandbox path, the command run, and the observed output | **shape + non-empty output** — presence auditable, result not verifiable |
  | `web` | URL, retrieval date, and an inline verbatim quote of the claim relied on | **shape only** — the quote cannot be checked against the page |
  | `recall` | explicitly marked as model knowledge, no citation | **cannot solely support** any recommendation or `Q` resolution |

  Resolution enforcement on `repo` exists to close a specific hole: **the agent self-declares the
  class**, so a rule constraining `recall` is routed around by labelling a recollection as `repo`
  with a plausible path. `recall` is the cheapest class to produce — no search, no file read, no
  sandbox — and therefore what an agent drifts toward under pressure to converge. Requiring `repo`
  citations to resolve makes the most attractive relabelling target mechanically expensive.
  `recall` may still raise a hypothesis, provided a finding of another class confirms it.

  **`web` is scoped by question type.** A `web` citation may solely support a recommendation only for
  genuinely *external* facts — API semantics, specification behaviour, upstream defaults, third-party
  version support. For any *repo-shaped* question, `web` may corroborate but may not decide: the repo
  is present and `repo` citations resolve mechanically, so the unverifiable class is confined to the
  questions where it is the only option available.

  Acceptance: a `repo` citation naming a nonexistent path, or a line range past end-of-file, fails;
  a `trial` finding missing its command or recording empty output fails; a `web` finding without a
  quote or retrieval date fails; a recommendation on a question classified repo-shaped (R9) whose
  only evidence references are `web` fails; a recommendation whose only evidence references are
  `recall` fails; a `recall` hypothesis corroborated by a `repo` or `trial` finding passes. Stated
  non-claim: a `repo` citation pointing at a real file that did not actually inform the finding still
  passes — resolution raises the cost of fabrication, it does not eliminate it.

- **R11** — Trials run in a **configured** sandbox only, and the repo is never written.

  *Sandbox location is declared in config, not chosen per run.* A `sandbox_root` key resolves
  global-then-repo-local using the same two-root pattern already shipped for `definitions_root`:
  `workflow/config/repo-profile.yaml` → `AGENTSMYTH_HOME`-relative default → fallback. The default
  is `~/.agentsmyth/sandbox/`, alongside the existing global install, so "outside the repo" holds
  **by construction** rather than by per-run assertion. It stays configurable rather than hardcoded
  because agentsmyth ships to five tools and some sandboxed hosts will not permit writes to an
  arbitrary home path.

  *Members get disjoint subpaths.* Trials write under
  `<sandbox_root>/<slug>/<round>/<member>/`, so concurrent members cannot collide. This is the same
  write-disjointness principle RI1 preserves for repo surfaces, applied to scratch space: RI1 relaxes
  *read* overlap, never write overlap.

  *The sandbox is disposable; the record is durable.* R10 already requires each `trial` finding to
  carry its command and observed output into the artifact, so the evidence survives independently of
  the directory and the sandbox can be cleared freely.

  *Repo integrity is checked separately and filesystem-scoped.* A configured sandbox says where
  writes belong; it does not prove none landed in the repo. That assertion must not rely on
  `git status`, which reports clean for gitignored paths — in this repo `dist/` and
  `workflow/schemas/` are both gitignored build outputs, and `dist/workflow-bundle.md` is what
  consumers actually install. A check that passes green precisely where the damage is invisible is
  worse than no check.

  Acceptance: a trial finding without a declared sandbox path fails; a declared path outside the
  resolved `sandbox_root` fails; two members sharing a sandbox subpath in the same round fails; repo
  integrity is asserted by content/hash over the repo root **including gitignored build outputs**,
  not by `git status` alone, and a fixture mutating `dist/` during a council run fails.

- **R12** — Evidence-class availability is resolved at run time and logged. A class that was wanted
  but unavailable in the host agent is recorded as `unavailable`, never silently skipped.
  Acceptance: a council-mode brief records, per class, whether it was `used`, `unused`, or
  `unavailable`; a brief whose classification requested `web` but whose log omits any `web` status
  fails. A brief produced without web access is distinguishable from one produced with it by
  frontmatter alone.

- **R13** — Think iterates with a **tapering, dynamically-sized** round loop. After consolidation it
  assesses what remains open and either runs another round, escalates to the user, or completes.

  *Rounds are not a schedule.* A single round that resolves everything is a first-class success, not
  a degenerate run — no round after the first is ever required. Each subsequent round is sized to
  what actually remains: repeat at similar strength when much is still open, taper when close to
  done, and finish with a single wrap-up agent when only consolidation remains. Illustrative, not
  normative:

  | Round | Researchers | Challengers |
  |---|---|---|
  | 1 | 3 | 1–2 |
  | 2 | 2 | 1 |
  | 3 | 1 | 1 |
  | 4 | 1 (wrap-up) | — |

  *The invariant that makes it cheap:* **fan-out is non-increasing across rounds.** A round may match
  the previous round's size or shrink, never grow. If the agent judges that more capacity is needed
  than the previous round used, that is an escalation to the user, not a self-authorized spend
  increase — consistent with the shipped rule that caps are never raised in response to a request.

  Every run records a `termination_reason` of exactly `resolved`, `user-decision-required`,
  `max-rounds`, or `no-progress`. `council.max_rounds` remains as a cheap backstop (proposed default
  4, matching the table), but the taper — not the bound — is what supplies the cost guarantee.

  *Progress is tracked per item, not by count.* Each round records **which specific item IDs it
  closed**, not merely how many remained. Counting alone is gameable by the path of least
  resistance: a round closes three easy items, the total drops, the taper looks coherent, and the one
  hard question that actually blocks the work survives untouched into the next round and the next.
  Per-ID tracking makes that history legible instead of hiding it inside a shrinking number.

  *A survivor escalates rather than expiring.* An item that enters every round and closes in none is
  the clearest available evidence that the council cannot resolve it — which is the definition of
  something that belongs with the user. Such a run terminates `user-decision-required`, carrying the
  item's per-round history as the basis for asking, not `max-rounds`.

  Acceptance: each round records its researcher and challenger counts, `open_items_in`,
  `open_items_out`, **the item IDs closed**, and — for every round after the first — a recorded
  justification naming what remained open and why this size was chosen. A round whose fan-out
  exceeds the previous round's fails. A round that *reduced* fan-out while `open_items_out >=
  open_items_in` fails as incoherent taper: shrinking the council asserts convergence, so the
  open-item count must corroborate it. Exceeding `max_rounds` fails. **A run terminating
  `max-rounds` while any item survived every round without closing fails — it must terminate
  `user-decision-required` instead.** `user-decision-required` requires a non-empty Questions For
  User section, and every surviving item's round history must appear with it; `resolved` requires
  zero blocking `Q` IDs; `max-rounds` and `no-progress` must surface as recorded risk rather than
  silent completion. A single-round run terminating `resolved` passes with no penalty.

- **R14** — The full council run is logged back into the brief: every round, its members and their
  roles, the evidence classes used per member, every finding with class and disposition, the
  open-item delta per round, and the termination reason.
  Acceptance: a reader can reconstruct what happened from the artifact alone, with no session
  transcript; `check-council-record.mjs` fails a brief whose recorded rounds, findings, or dispositions are
  structurally incomplete.

- **R15** — `lifecycle-think` is restructured into an explicit staged pipeline: classify → assign
  evidence classes → fan out → challenge → consolidate → assess open items → (loop or escalate) →
  log. Council mode and single-agent mode are both modes of the documented pipeline, with single-
  agent additionally preserved verbatim per R8.
  Acceptance: `SKILL.md`'s Workflow section names the stages in order with their gates; the Exit Gate
  covers the new stages; `references/output-schema.md` starter block carries the new optional
  frontmatter; a conformance check locks the SKILL.md stage list against the validator's expectations
  so the doc and `check-council-record.mjs` cannot drift apart (the R12/R13/R16/R19 drift class).

### Implicit (RI)

- **RI1** — Narrow the independence rule so read-only workers may overlap on surface when the parent
  declares a dedupe-and-reconcile contract in the active artifact; overlap stays forbidden for any
  repo-write-capable worker and for read-only workers with no declared contract.
  **The contract's teeth are conflict recording, not its own presence.** When two findings on the
  same surface reach conflicting conclusions, the conflict and its resolution must be recorded
  explicitly. A parent that silently picks one produces a wrong answer with a complete audit trail —
  every finding attributed, every disposition recorded, validator green — while discarding the most
  valuable signal the council generated. This also makes overlap worth its cost rather than merely
  tolerable: overlapping members who agree corroborate, and overlapping members who disagree have
  found the interesting thing.
  Acceptance: all five asserting files change together — `references/independence-rules.md`,
  `references/decision-tree-by-phase.md` (Think and Review rows plus per-phase refuse conditions),
  `references/phase-caps.md`, `SKILL.md` Determinism Rules, `references/output-schema.md` acceptance
  criteria. A grep proves no file still asserts the blanket form. Findings carry the surface they
  inspected; conflicting dispositions on a shared surface with no recorded reconcile note fail.

- **RI2** — Document the authorization carve-out in `dispatch-subagents/SKILL.md` as a named
  exception with its conditions, in the same shape as the existing E1 exception, including that
  sandbox-only writes do not forfeit read-only status for carve-out purposes. State it as its
  **bounding principle** — *no repo mutation, in phases that produce no verdict* — with the
  conditions as consequences, so a future reader derives the boundary rather than extending a list
  (RK-A).
  **Restate the no-nesting prohibition in the council skill itself**, rather than relying on
  inheritance from `dispatch-subagents`: a member loading the council charter must see it there, not
  have to follow a reference to find it.
  Acceptance: SKILL.md's refusal condition "the user did not explicitly authorize delegation" cites
  the carve-out; the conditions are stated together in one place as derivations of the principle; the
  council skill carries its own explicit no-nested-dispatch rule.

- **RI3** — New `check-council-record.mjs` enforcing every mechanical check named across R2–R14,
  wired into `npm run validate` and the violations suite. **Named for what it validates — the
  record, not the council** — so the filename itself carries the narrow claim rather than implying
  the broad one (RK-B).
  It emits a **summary line on success, not a bare pass**: rounds run, findings recorded,
  `recall`-only hypotheses left unconfirmed, rejections issued across all rounds, and **how many
  citations were mechanically resolved versus shape-checked only**. A varying number invites
  reading; a green check invites skipping. The rejection count doubles as the rubber-stamp signal
  for RK-F, and the resolved-vs-shape-checked ratio tells a reader at a glance how much of the brief
  rests on classes the validator cannot verify (RK-D, RK-E) — both at zero extra cost.
  Acceptance: validator listed in `src/workflow/validators/README.md` with its checks and its
  explicit non-claims; passes on a well-formed council brief and prints the summary; fails each
  seeded violation (RI9); a fixture asserts the summary reports the correct counts, so the texture
  cannot silently regress to a bare pass.

- **RI4** — The artifact records that the council fired or was refused (with reason), under which
  authorization mode, with which resolved cap and `cap_source`, and at **dispatch depth 1**.
  Asserting depth in the log makes a nesting violation a recorded fact in the artifact rather than
  something inferred from a suspiciously large token bill. Combined with R13's non-increasing
  fan-out and R2's per-stage caps, this closes the cost model: total council spend per run becomes
  calculable rather than hopeful.
  Acceptance: council-mode and single-agent briefs are distinguishable by frontmatter alone, with no
  prose inspection; a recorded dispatch depth greater than 1 fails.

- **RI5** — Brief schema updated in `src/workflow/schemas/`, bundles rebuilt, adapters re-rendered
  and confirmed in sync if any gate content changed.
  Acceptance: `npm run build`, `npm run validate`, `npm run violations:test`,
  `npm run conformance:test` all green; `render-adapters` reports shims current.

- **RI6** — Shipped docs state plainly what `check-council-record.mjs` does **not** check. Stated
  directly and never softened — each of these is a real hole, and hedged phrasing would leave a
  reader trusting more than the validator delivers:
  - whether a finding is correct;
  - whether the council found what a human would have found;
  - whether a rejection reason is a good one;
  - whether a `web` quote was genuinely present at the cited URL — **a fabricated quote on an
    external fact that the challenger did not sample passes every check in this system**;
  - whether a resolving `repo` citation actually informed the finding it is attached to;
  - whether a member wrote outside both the repo and its configured sandbox — **agentsmyth is a
    workflow contract, not a sandbox runtime, and cannot confine a process it does not spawn**.

  Acceptance: the non-claims appear in the validator's README entry and in the council skill's
  reference docs, as prose, not as an implication; each is stated as a plain limitation without
  mitigating qualifiers.

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
  each fixture is rejected by `check-council-record.mjs` specifically, not incidentally by another validator.

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

- **Q3 — RESOLVED 2026-08-16, then CORRECTED same day: the challenge pass is a dispatched member,
  capped as its own stage.** A parent-run challenge shares the parent's context, which is exactly the
  degradation RK-F describes, so the challenger is dispatched. The original resolution said
  "counted against the cap," which was arithmetically wrong: 3 researchers + 1 challenger is 4
  against a cap of 3, and round 1 wants 1–2 challengers. The cap is
  `max_parallel_workstreams` — it governs peak concurrency, and challengers do not run concurrently
  with researchers, they review their output. Corrected to per-stage capping: researchers are one
  parallel stage, challengers a second, each independently capped. Folded into R2 and R3.

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
