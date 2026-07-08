# Router

Use this router before doing lifecycle work.

## Pending Setup Resolution

Run this check at the start of every session — takes under 30 seconds and never blocks
the task.

1. If `workflow/config/pending-setup.yaml` does not exist: skip this section entirely.
2. Load the file. Filter `items` where `status: open`.
3. If no open items: skip this section.
4. **Inspect-based resolution** — for each open item, read the `hint` field and inspect
   the repo:
   - `package.json` scripts → resolves test/build/lint command questions
   - `.github/workflows/*.yml` → resolves CI, deploy target, environment questions
   - `Makefile` → resolves task command questions
   - `README.md`, `CONTRIBUTING.md` → resolves documentation path questions
   - If the answer is determinable: update the target config field with the found value,
     set `resolved_by: inspect`, `status: resolved`, record the value in `resolution`.
5. **User prompt** — for items still open after inspection: surface them as a single
   batched block before proceeding with the task. One question per item.
   If the user answers: apply the value to the config, set `resolved_by: user`,
   `status: resolved`, record in `resolution`. Update `pending-setup.yaml`.
6. `waived` items: never surface. Never block on them.
7. Items still open after steps 4–5: proceed with the task. Note them in the session
   summary. Do not hard-stop.

## Inputs To Inspect

- User request.
- Existing slug/version or artifact path, if provided.
- `workflow/agent-behavior.yaml`.
- Existing artifacts under `workflow/artifacts/**`.
- Current git branch and dirty state.
- Source, verification, release, or domain config when relevant.

## Task Classes

Classify every request before routing. Full definitions and skip rules are in `workflow/agent-behavior.yaml`.

| Class | Signals | Lifecycle |
|---|---|---|
| Trivial | Single-location change, no architectural impact, no callers affected | Handle inline — no artifact required. |
| Standard | Multi-file or cross-function change within a defined scope | Think → Plan → Build → Review → Ship → Reflect. Test skippable with waiver. |
| Complex | Cross-cutting, new architectural pattern, or parallel workstreams | All phases required. No phase skippable without waiver. |

When classification is unclear, default to Standard.

## Routing

| Situation | Action |
|---|---|
| New Trivial request | Handle inline. No lifecycle phases. |
| New Standard or Complex request | Start Think. |
| User asks for a plan after a brief | Restore the brief, then run Plan if the Think gate passed. |
| User asks to continue | Run `restore-context`, then continue the current blocked or next phase. |
| User asks for implementation | Require an approved Plan or explicit waiver. |
| User asks for review | Use Review and write a review artifact. |
| User asks for verification | Use Test and write a verify artifact. |
| User asks to ship or hand off | Use Ship. |
| Work completed or merged | Use Reflect if Ship allows it. |
| Small read-only answer | Answer directly when no durable lifecycle state is needed. |

## Pre-Action Gate

Before any Build-, Review-, Test-, or Ship-owned file write, the agent must:

1. **State phase and cite artifact path.** Name the current phase and the exact backing artifact path (e.g. `workflow/artifacts/plans/foo-v1.md`). Do not proceed without this.
2. **Stop if the upstream is not ready.** If no artifact exists for the active slug, or the upstream artifact's `orchestration.status` is not `ready-for-next-phase`, stop and report the missing path. No proceeding with a caveat, no inference from earlier in the conversation.
3. **Reject chat-only waivers.** If a waiver was stated in conversation but is not written into the artifact's `waivers` block with all required fields (`waived_gate_or_requirement_id`, `reason`, `residual_risk`, `owner`, `follow_up_action`, `approval_evidence`), the waiver does not exist. Do not act on it.

Run the phase gate validator when workflow validators are available:

```bash
node workflow/validators/check-lifecycle.mjs --phase <current-phase> --slug <active-slug>
```

A non-zero exit is an unconditional stop — not a warning.

## Pause Conditions

Pause or write a blocked artifact when:

- required upstream artifact is missing
- an unresolved blocker changes scope or risk
- source access is required but unavailable
- verification evidence is unknown or blocked
- external write, release, or destructive action needs approval
- branch or dirty state conflicts with policy

Never continue a lifecycle chain from chat memory alone.
