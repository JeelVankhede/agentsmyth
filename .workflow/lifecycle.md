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

## Universal Exit Rule

A phase can move forward only when its artifact records:

- active manifest IDs
- evidence or explicit waiver
- blockers and owners
- architecture notes when decisions affect later phases
- next phase and user checkpoint state
