# Phase Caps

Caps are hard maximums. Do not exceed them.

The maximum is set by `dispatch.max_parallel_workstreams`. **Resolve the effective value before
dispatching**: read `workflow/agent-behavior.yaml` for the global value, then check
`workflow/config/repo-profile.yaml` for `tuning.dispatch.max_parallel_workstreams` — if the repo
declares one, that is the value. No phase cap may exceed the resolved value.

`tuning.dispatch.enabled` is resolved the same way and is checked **first**. If it resolves to
`disabled`, do not dispatch in any phase, regardless of explicit user authorization — the repo has
turned delegation off, and authorization does not override that. A repo may not set `required`.

| Phase | Role | Allowed work |
|---|---|---|
| Think | explorer | read-only context exploration |
| Plan | explorer | read-only requirement/risk mapping |
| Build | worker | independent write workstreams |
| Review | worker-readonly | independent risk-category review |
| Test | verifier-readonly (`verification-parallelizer`/E1 only) | independent verification-row fan-out; all other Test work: no dispatch |
| Ship | none | no dispatch |
| Reflect | none | no dispatch |

Phases with `none` role have a cap of 0 — dispatch is never allowed regardless of authorization, agent-behavior.yaml values, or repo tuning. Test's cap is 0 for general Test work and the resolved `dispatch.max_parallel_workstreams` (capped at 3 regardless of config) only for the narrow `verification-parallelizer` profile — see `decision-tree-by-phase.md`'s E1 section.

For all other phases, the cap is the resolved `dispatch.max_parallel_workstreams`. If neither the global config nor repo tuning declares one, default to 1 (no parallelism).

### Council exception to the default-to-1 rule

Council-mode dispatch is the one documented departure. When no `max_parallel_workstreams` is
declared anywhere, a council resolves its cap from `council.default_fan_out` (shipped default 3)
rather than falling back to 1, because a one-member council is not a council.

This departure is stated here rather than left to be discovered because it has a real cost: an
unconfigured consumer gets a multi-member council on every Complex Think without having chosen one.
Two things make it visible rather than silent — the artifact records `cap_source: council-default`
when this branch applies (as opposed to `configured`), and `council.depth` exists so that cost can
be reduced without shrinking the council.

The departure is bounded: it changes the *default*, never the ceiling. A declared
`max_parallel_workstreams` still wins, and `council.default_fan_out` is itself capped by the schema.

**Scope: `council.default_fan_out` is the Think council's, and no other phase's.** It is written
that way deliberately — a phase-agnostic default would mean that the moment a council is extended to
another phase, every unconfigured consumer silently acquires a multi-member council there too,
having chosen nothing. Any package extending councils to a new phase must decide that phase's
default explicitly rather than inheriting this one, under `council.per_phase.<phase>`. **A phase
absent from `per_phase` gets no departure at all** and falls back to default-to-1, so forgetting to
decide fails safe rather than billing silently.

### Review council default

`council.per_phase.review.default_fan_out` is **2**, decided rather than inherited, per the rule
directly above.

Three reasons it is lower than Think's 3. The Think council was measured against a real
single-agent baseline at roughly 6× the invocations for less coverage, and Review runs on every
Complex chain carrying that same bill. Review's output blocks a commit, so a confident wrong finding
is more expensive here than in Think, and a smaller council is easier to hold to account. And the
property Review actually needs — reviewers carrying fresh context over disjoint risk categories — is
delivered by two reviewers as well as by three, given the ten categories in
`lifecycle-review/references/review-risk-categories.md` are assigned disjointly.

The challenge pass is not counted in this number: stages are capped independently (below), and the
challenge pass is where the Think council's distinctive value actually showed — it refuted a
researcher's wrong headline claim, which a single-agent Review has no mechanism for.

### Council stages are capped independently

A council round runs researchers as one parallel stage, then challengers as a second stage against
their output. The cap governs **peak concurrency within a stage**, not the round total — so 3
researchers followed by 2 challengers satisfies a cap of 3, because the two stages never run
concurrently. Challengers review what researchers produced; they cannot start before it exists.

Requested worker counts above the cap must be reduced to the cap or refused. Never increase the cap in response to a user request — raising it requires editing `agent-behavior.yaml` globally or `tuning.dispatch.max_parallel_workstreams` in the repo profile, and either is a config change, not a dispatch decision.

## Overlapping Read-Only Workers Still Count

The Read-Only Overlap Exception (`references/independence-rules.md`) relaxes *which* candidates may
be dispatched together. It does not relax the cap. Two read-only workers sharing a surface are still
two workers, and both count against the resolved `max_parallel_workstreams`.

Cap arithmetic is about concurrency and cost; independence is about mergeable output. They are
separate constraints, and satisfying one has never implied the other.
