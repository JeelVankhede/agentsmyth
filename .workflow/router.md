# Router

Use this router before doing lifecycle work.

## Inputs To Inspect

- User request.
- Existing slug/version or artifact path, if provided.
- `.workflow/config/agent-behavior.yaml`.
- Existing artifacts under `.workflow/artifacts/**`.
- Current git branch and dirty state.
- Source, verification, release, or domain config when relevant.

## Routing

| Situation | Action |
|---|---|
| New Standard or Complex request | Start Think. |
| User asks for a plan after a brief | Restore the brief, then run Plan if the Think gate passed. |
| User asks to continue | Run `restore-context`, then continue the current blocked or next phase. |
| User asks for implementation | Require an approved Plan or explicit waiver. |
| User asks for review | Use Review and write a review artifact. |
| User asks for verification | Use Test and write a verify artifact. |
| User asks to ship or hand off | Use Ship. |
| Work completed or merged | Use Reflect if Ship allows it. |
| Small read-only answer | Answer directly when no durable lifecycle state is needed. |

## Pause Conditions

Pause or write a blocked artifact when:

- required upstream artifact is missing
- an unresolved blocker changes scope or risk
- source access is required but unavailable
- verification evidence is unknown or blocked
- external write, release, or destructive action needs approval
- branch or dirty state conflicts with policy

Never continue a lifecycle chain from chat memory alone.
