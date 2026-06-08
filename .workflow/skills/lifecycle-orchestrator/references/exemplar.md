# Orchestrator Exemplar

## Paused State (good)

The orchestrator started Think for a new request, wrote the brief, found an open question about protected paths, and stopped.

```
Phase: think
Artifact: .workflow/artifacts/briefs/add-auth-tokens-v1.md
Status: blocked-for-user

Blocked on Q1 — Which paths under src/auth/ are protected and cannot be changed without security review?

Next phase after resolution: plan
```

Why this is good: one concrete question, artifact path given, next action is unambiguous.

## Paused State (bad)

```
I've started the lifecycle for your auth token change. There are several things I need to know: what is the tech stack, who owns the auth module, what tests exist, is there a CI pipeline, do you have a staging environment, and what rollback plan do you want? Also I'm not sure if this is standard or complex scope.
```

Why this is bad: multiple speculative questions in one message, no artifact path, no slug, no blocked phase stated, brief was not written first.

---

## Advanced State (good)

Think gate passed after user answered Q1. Plan completed and Build is next.

```
Phase advanced: think → plan
Brief: .workflow/artifacts/briefs/add-auth-tokens-v1.md (ready-for-next-phase)
Plan: .workflow/artifacts/plans/add-auth-tokens-v1.md (ready-for-next-phase)

Manifest: R1, R2, RI1, RI2
Risks: src/auth/middleware.ts is protected — PR requires security review (recorded in plan).

Next: Build — confirm to start or request a change.
```

Why this is good: phase transitions are explicit, artifact paths given, risks visible, one clear next action.

---

## Complete State (good)

Full chain completed through Reflect.

```
Completed: add-auth-tokens-v1
Final phase: reflect
Chain:
  .workflow/artifacts/briefs/add-auth-tokens-v1.md
  .workflow/artifacts/plans/add-auth-tokens-v1.md
  .workflow/artifacts/tasks/add-auth-tokens-v1.md
  .workflow/artifacts/reviews/add-auth-tokens-v1.md
  .workflow/artifacts/verify/add-auth-tokens-v1.md
  .workflow/artifacts/ship/add-auth-tokens-v1.md
  .workflow/artifacts/reflect/add-auth-tokens-v1.md

Raw session: .workflow/learnings/sessions/2026-06-08-add-auth-tokens.md

Follow-ups: none
Learning candidates: propose-only — see reflect artifact.
```

---

## Resume After User Answer (good)

User answered Q1. Orchestrator ran restore-context, cleared the blocker, and continued.

1. Ran `restore-context` → confirmed brief exists at v1, Q1 was the only blocker.
2. Updated brief: Q1 answered, blocker cleared, status set to `ready-for-next-phase`.
3. Continued to Plan.

Not acceptable: continuing from chat memory alone without running `restore-context` and updating the artifact.
