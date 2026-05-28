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

- Reason:
- Local execution path:
- Artifact log needed: yes / no
```

Acceptance criteria:

- explicit authorization state is recorded
- phase cap is respected
- Build delegations pass independence rules
- Review delegations are read-only unless explicitly switched to Build
- Test, Ship, and Reflect do not spawn
- parent owns merge and validation
- every actual dispatch has an artifact log entry
