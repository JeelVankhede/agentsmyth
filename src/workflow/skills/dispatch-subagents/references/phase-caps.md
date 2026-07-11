# Phase Caps

Caps are hard maximums. Do not exceed them.

The global maximum is set by `dispatch.max_parallel_workstreams` in `workflow/agent-behavior.yaml`. No phase cap may exceed this value. Read `agent-behavior.yaml` to get the current cap before dispatching.

| Phase | Role | Allowed work |
|---|---|---|
| Think | explorer | read-only context exploration |
| Plan | explorer | read-only requirement/risk mapping |
| Build | worker | independent write workstreams |
| Review | worker-readonly | independent risk-category review |
| Test | verifier-readonly (`verification-parallelizer`/E1 only) | independent verification-row fan-out; all other Test work: no dispatch |
| Ship | none | no dispatch |
| Reflect | none | no dispatch |

Phases with `none` role have a cap of 0 — dispatch is never allowed regardless of authorization or agent-behavior.yaml values. Test's cap is 0 for general Test work and `dispatch.max_parallel_workstreams` (capped at 3 regardless of config) only for the narrow `verification-parallelizer` profile — see `decision-tree-by-phase.md`'s E1 section.

For all other phases, the cap is `dispatch.max_parallel_workstreams` from `agent-behavior.yaml`. If the config is absent, default to 1 (no parallelism).

Requested worker counts above the cap must be reduced to the cap or refused. Never increase the cap in response to a user request — that requires editing `agent-behavior.yaml` and is a config change, not a dispatch decision.
