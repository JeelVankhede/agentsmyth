# Output Schema

Use this structure for dispatch decisions:

```markdown
## Dispatch Decision

- Phase:
- User authorization: explicit / missing
- Decision: spawn / do-not-spawn
- Role: explorer / worker / worker-readonly / none
- Cap:
- Candidate items:
- Reason:
- Parent-local work:

## Delegations

| Work Delegated | Role | Ownership | Manifest IDs | Expected Output |
|---|---|---|---|---|
|  |  |  |  |  |

## Spawn Prompt Requirements

- active phase and slug
- exact ownership
- expected output
- not alone in the repo
- preserve unrelated changes
- read-only or write scope
- validation/evidence expectation

## Dispatch Log Patch

<markdown patch for active artifact>

## Merge Plan

- Parent-local task:
- Wait condition:
- Review method:
- Integration target:
- Validation:
- Fallback if subagent fails:

## Refusal Summary

- Reason: <why dispatch was refused — authorization missing / cap zero / independence failed / phase not allowed>
- Local execution path: <how the parent agent will handle the work instead>
- Artifact log needed: yes / no — log only when refusal affects the active artifact's scope or timeline
```

Acceptance criteria:

- explicit authorization state is recorded in every decision
- phase cap is checked against `agent-behavior.yaml` `dispatch.max_parallel_workstreams`
- Build delegations pass the independence checklist in `references/independence-rules.md`
- Review delegations are read-only; any fix recommendation switches the candidate back to Build scope
- Test, Ship, and Reflect do not spawn under any condition
- parent owns merge, validation, and final evidence claims
- every actual dispatch has an artifact log entry
- every material refusal is recorded when it affects scope or timeline
