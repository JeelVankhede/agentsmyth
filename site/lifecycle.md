---
title: The lifecycle
---

# The lifecycle

Every request that enters an agentsmyth repo walks the same road. Seven phases, in order, with a gate between each one. A phase does not open until the phase before it has left an artifact proving it finished.

```text
Think → Plan → Build → Review → Test → Ship → Reflect
 brief    plan   task    review   verify  ship    reflect
```

## The router decides first

Before any phase runs, `workflow/router.md` classifies the request. Not everything deserves seven gates.

- **Trivial** changes skip the loop entirely. A typo does not need a plan.
- **Standard** changes run the full loop by default.
- **Complex** changes make the full loop mandatory — no shortcuts.

The router also handles resumption. If an artifact chain already exists for the work, it restores context from it instead of starting cold.

## The seven phases

| Phase | The agent's job | Artifact |
|---|---|---|
| Think | Capture requirements, classify scope and complexity | `brief` |
| Plan | Architecture decisions, implementation plan, verification criteria | `plan` |
| Build | Implement against the plan, tracked as it goes | `task` |
| Review | Check the code against the plan's manifest and requirements | `review` |
| Test | Run the verification commands, record the evidence | `verify` |
| Ship | Work the release checklist, sign off risk, record deploy evidence | `ship` |
| Reflect | Capture learnings and open follow-ups after the dust settles | `reflect` |

## The gates are real

The router will not let the agent jump the track. Each transition has a condition:

- Plan runs only when the brief is approved.
- Build runs only when the plan is approved.
- Review runs only when the build artifact is complete.
- Test runs only when review is a pass, or an explicitly accepted pass-with-risk.
- Ship runs only when verification says ship, or a waiver was accepted with the risk visible.
- Reflect runs only after Ship.

A blocker anywhere stops forward motion until it is resolved or explicitly waived. Waivers do not make risk disappear. They make it visible and signed.

Here is the gate refusing, concretely. An agent finishes Build and calls Review done. The plan's manifest lists R3, but no changed file in the task artifact cites R3. The coverage check fails the transition. Review does not pass, the gap gets named in writing, and nothing merges on a requirement nobody implemented.

## Why the artifact matters more than the phase

The phase is a verb; it happens and it is gone. The artifact is the noun that stays. That is the design center: the phases are how the work gets done, but the artifacts are how the work gets remembered.
