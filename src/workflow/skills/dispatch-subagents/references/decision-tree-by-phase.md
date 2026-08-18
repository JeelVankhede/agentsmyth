# Decision Tree By Phase

## What Counts As Explicit Authorization

Authorization is explicit only when the user's message in the current conversation contains one of:

- a direct instruction to use subagents, delegate, or run work in parallel
- a named agent type or count ("spawn two workers", "use parallel agents")
- a confirmed yes to an agent's question asking whether delegation is allowed

Authorization is **not** implicit from:

- the task being large or complex
- a prior conversation where delegation was mentioned
- a plan that describes parallel phases
- the agent deciding parallelism would be faster

If explicit authorization is absent, do not dispatch. Continue locally.

**Exception — council auto-fire.** A council may fire without explicit per-conversation
authorization under a named exception whose bounding principle, conditions, and capability limits
are stated in `SKILL.md`. **This file deliberately does not restate them** — restatement across
files is precisely how this reference and `SKILL.md` drifted apart in the first place, so the
pointer is the whole of the content here. Check `SKILL.md` before concluding that an auto-fire is
refused.

Read the phase rows below with that exception in mind: their "yes, if explicitly authorized" is the
rule for ordinary dispatch, not a denial of the carve-out.

## Phase Decision Tree

| Phase | Dispatch allowed | Role | Condition |
|---|---|---|---|
| Think | yes, if explicitly authorized | explorer | Read-only; independent context or requirement-bucket questions, **or overlapping surfaces under the Read-Only Overlap Exception** |
| Plan | yes, if explicitly authorized | explorer | Read-only; independent requirement areas or risk buckets only |
| Build | yes, if explicitly authorized | worker | Write access; disjoint file and contract ownership required — the Read-Only Overlap Exception never applies |
| Review | yes, if explicitly authorized | worker-readonly | Read-only; independent risk categories, **or overlapping surfaces under the Read-Only Overlap Exception** |
| Test | yes, if explicitly authorized, and only via the `verification-parallelizer` (E1) profile below | verifier-readonly | Fan out only independently-reproducible `verification-matrix-builder` (B6) rows; general Test work stays `never` — evidence is otherwise state-dependent and dispatch cannot produce reproducible verification |
| Ship | never | none | Release and source state are authoritative and sequential |
| Reflect | never | none | Synthesis and learning capture require full chain visibility |

## Per-Phase Refuse Conditions

**Think / Plan** — refuse when:
- Questions or buckets share a config file, source item, or repo surface **and the parent has not
  declared a dedupe-and-reconcile contract** (see the Read-Only Overlap Exception in
  `references/independence-rules.md`). Explorers are read-only, so a declared contract permits the
  overlap; an undeclared one still refuses.
- A candidate question requires the answer to another candidate question — a sequencing dependency,
  which no reconcile contract resolves
- The parent cannot integrate conflicting context findings, or cannot commit to surfacing a conflict
  between two workers on a shared surface rather than silently resolving it

**Build** — refuse when:
- Two candidate workers would touch the same file, import, schema, fixture, migration, or test.
  The Read-Only Overlap Exception does not apply in Build under any circumstance: Build's workers
  write, and the exception exists only because a read-only worker cannot create a write conflict
- Candidates share a generated-output source or target
- Candidates share a public contract, release, or source-handoff surface
- The parent cannot integrate results without reading and merging both workers' output

**Review** — refuse when:
- Two candidates inspect the same file or risk area **and the parent has not declared a
  dedupe-and-reconcile contract**. Review candidates are read-only, so a declared contract permits
  the overlap; an undeclared one still refuses. Two candidates given the *same risk category* are
  refused regardless — the exception covers shared surfaces, not duplicated charters.
- A candidate is asked to produce a fix recommendation (that switches it to Build scope)
- The parent cannot merge findings without re-reading both workers' full output, or cannot commit to
  surfacing a conflict between two workers on a shared surface rather than silently resolving it

**Test (`verification-parallelizer`, E1 only)** — refuse when:
- A candidate verification row's evidence depends on another row's outcome or on shared, mutable
  repo state (e.g., two rows both run a command that writes to the same file)
- Fan-out would exceed the resolved `max_parallel_workstreams` (global `agent-behavior.yaml`, overridden by `tuning.dispatch.max_parallel_workstreams` in the repo profile when present)
- A candidate row requires manual QA, generated-output regeneration, or any interactive step —
  those stay sequential in the parent's own execution
- The parent cannot merge results into one `verification-matrix-builder` (B6) matrix without
  re-running or re-verifying each worker's claimed evidence itself

**All phases** — refuse when the phase is not in the allow list above, or when the phase is unclear.

## E1 — `verification-parallelizer` Profile (Test)

Not a new skill — a documented invocation profile of this skill for Test's `verification-matrix-builder`
(B6) rows specifically. Reuses this file's existing `dispatch` config and independence rules; adds no
new mechanism.

- **When to use:** Test has 2 or more verification rows whose evidence-gathering commands are
  independently reproducible (no shared file writes, no ordering dependency) and explicit dispatch
  authorization is present.
- **Fan-out:** up to the resolved `max_parallel_workstreams` (capped at 3 here regardless of config) sub-agents, each assigned disjoint verification
  rows — never the same manifest ID to more than one worker.
- **Role:** `verifier-readonly` — each worker runs its assigned command(s) and reports exact
  outcome + evidence; workers do not write product files or edit the verify artifact themselves.
- **Merge:** the parent (Test) merges every worker's reported outcome into one
  `verification-matrix-builder` (B6) matrix, following the same evidence-citation rules as
  non-dispatched Test work — a worker's claim is not exempt from `evidence-auditor`.
- **Log:** the dispatch log records this as a Test-phase dispatch, same shape as Build/Review dispatch logs, so `evidence-auditor` and manual review can trace which rows were worker-verified.
