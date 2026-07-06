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

## Phase Decision Tree

| Phase | Dispatch allowed | Role | Condition |
|---|---|---|---|
| Think | yes, if explicitly authorized | explorer | Read-only; independent context or requirement-bucket questions only |
| Plan | yes, if explicitly authorized | explorer | Read-only; independent requirement areas or risk buckets only |
| Build | yes, if explicitly authorized | worker | Write access; disjoint file and contract ownership required |
| Review | yes, if explicitly authorized | worker-readonly | Read-only; independent risk categories only |
| Test | never | none | Evidence is state-dependent; dispatch cannot produce reproducible verification |
| Ship | never | none | Release and source state are authoritative and sequential |
| Reflect | never | none | Synthesis and learning capture require full chain visibility |

## Per-Phase Refuse Conditions

**Think / Plan** — refuse when:
- Questions or buckets share a config file, source item, or repo surface
- A candidate question requires the answer to another candidate question
- The parent cannot integrate conflicting context findings

**Build** — refuse when:
- Two candidate workers would touch the same file, import, schema, fixture, migration, or test
- Candidates share a generated-output source or target
- Candidates share a public contract, release, or source-handoff surface
- The parent cannot integrate results without reading and merging both workers' output

**Review** — refuse when:
- Two candidates inspect the same file or risk area
- A candidate is asked to produce a fix recommendation (that switches it to Build scope)
- The parent cannot merge findings without re-reading both workers' full output

**All phases** — refuse when the phase is not in the allow list above, or when the phase is unclear.
