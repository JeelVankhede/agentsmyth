# Lifecycle

The lifecycle is a gated artifact chain:

```text
brief -> plan -> task -> review -> verify -> ship -> reflect
```

## Phase Table

| Phase | Artifact | Required Upstream | Exit |
|---|---|---|---|
| Think | brief | user request | approved brief or waiver |
| Plan | plan | brief | requirement-mapped phases and verification |
| Build | task | plan | scoped changes and task evidence |
| Review | review | brief, plan, task, diff | findings, coverage, recommendation |
| Test | verify | brief, plan, task, review when available | verification evidence and sign-off |
| Ship | ship | brief, plan, task, verify, review when available | ship, hold, or hold-with-waiver |
| Reflect | reflect | full chain through ship | outcome and learning candidates |

## Build Phase Sub-Versioning

When a Plan splits Build into independent approved phases, task artifacts may use the `-p<P>` suffix:

```text
.workflow/artifacts/tasks/<slug>-v<N>-p<P>.md
```

Use the same `slug` and `version` as the parent plan. Each `-p<P>` artifact covers one independent workstream. The slug without `-p<P>` is the default for single-phase Build work.

## Transitions

- Think sets `next_phase: plan`.
- Plan sets `next_phase: build`.
- Build sets `next_phase: review`.
- Review sets `next_phase: test`.
- Test sets `next_phase: ship`.
- Ship sets `next_phase: reflect` only for `ship` or accepted `hold-with-waiver`.
- Reflect sets `next_phase: done`.

## Artifact Status Values

- `draft`: artifact exists but is not ready.
- `in-progress`: active Build work remains.
- `blocked`: work cannot proceed without fix, evidence, or upstream change.
- `blocked-for-user`: user decision, approval, waiver, or external action is needed.
- `ready-for-next-phase`: phase gate passed.
- `done`: Reflect is complete.

## Resume Rule

When resuming a paused chain, a new conversation, or when local memory may be stale, invoke `restore-context` before continuing any phase. Do not rely on chat memory alone to determine current phase, status, or blockers.

## Universal Exit Rule

A phase can move forward only when its artifact records:

- active manifest IDs
- evidence or explicit waiver
- blockers and owners
- architecture notes when decisions affect later phases
- next phase and user checkpoint state
