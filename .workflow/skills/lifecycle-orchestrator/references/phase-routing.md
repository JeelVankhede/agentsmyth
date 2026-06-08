# Phase Routing

## Purpose

Define how the orchestrator selects the next lifecycle skill for the repository.

## Normal Order

```text
Think -> Plan -> Build -> Review -> Test -> Ship -> Reflect
```

## Routing Table

| State | Next action |
|---|---|
| No lifecycle chain exists | Start `lifecycle-think` unless the request is trivial. |
| Brief exists and is approved | Run `lifecycle-plan`. |
| Plan exists and is approved | Run `lifecycle-build`. |
| Build artifact is complete | Run `lifecycle-review`. |
| Review is `pass` or accepted `pass-with-risk` | Run `lifecycle-test`. |
| Verification is `ship` or accepted `hold-with-waiver` | Run `lifecycle-ship`. |
| Ship is `ship` or accepted `hold-with-waiver` | Run `lifecycle-reflect`. |
| Reflect is done | Mark lifecycle complete. |

## Trivial Request Rule

Think and Plan may be skipped only when the request is a narrow mechanical change and the user explicitly accepts the shortened flow.

## Standard Request Rule

Use the full lifecycle by default.

## Complex Request Rule

Full lifecycle is mandatory when requirements, acceptance criteria, verification, release, domain rules, generated output, or public behavior may be affected.

## Explicit Phase Requests

When the user asks for a specific phase:

1. Check required upstream artifacts.
2. Run `restore-context` when a slug or version exists.
3. Proceed only when the phase can be grounded in artifacts, config, or repo evidence.
4. Ask for approval or record a waiver when upstream context is missing.

## Invalid Routing

Do not route directly from Think to Build, Build to Ship, Test to Reflect, or any phase to complete while unresolved blockers remain.

## Boundary

This workflow is scoped to the repository.
