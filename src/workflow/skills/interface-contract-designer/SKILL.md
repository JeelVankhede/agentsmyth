---
name: interface-contract-designer
description: Domain-expert power skill for interface/contract design — endpoint/RPC/CLI surface, request/response schema, versioning, error contracts, pagination, idempotency, backward compatibility.
---

# Interface Contract Designer

## Purpose

Focused expert for interface and contract design: endpoint/RPC/CLI surface shape, request/response schema, versioning strategy, error/status contracts, pagination, idempotency, and backward compatibility. Prevents an interface change from shipping with an unconsidered breaking-change risk or an inconsistent contract shape.

This is a power skill, not a lifecycle phase. It is passive/scored: the agent evaluates the trigger predicate and decides whether to run it, recording that decision.

## Invocation Context

Use this skill when the recorded `skill_scoring` trigger for `domain.interface-contract-designer`
evaluates true: `path~contract_globs OR touches_contract` — i.e. the diff touches a file matching
a contract glob (OpenAPI/proto/route/handler/CLI-arg spec) or `repo-profile.yaml`'s
`paths.public_contracts` is affected.

Do not invoke it for changes with no contract-shaped surface (e.g., internal-only refactors that
touch no request/response boundary).

## What To Load

**Foundation** (confirm in context; load if not already present):
- Root `AGENTS.md`
- `workflow/router.md`
- `workflow/lifecycle.md`
- `workflow/rules.md`

**Minimum for invocation**:
- This file
- `references/output-schema.md`

**Before starting work**:
- The route file matching the touched contract's shape (`references/{rest,graphql,grpc,websocket,cli,sdk-library}.md`) — selected from the diff's file signals, not chosen arbitrarily
- `workflow/config/repo-profile.yaml` — `paths.public_contracts`

## Inputs

- The diff's touched contract files (route handlers, schema/proto/spec files, CLI arg definitions).
- The requirement's stated compatibility expectations, if any.

## Refusal / Stop Conditions

Stop and raise a `Q` instead of silently choosing instead when:

- the change would break an existing contract's request/response shape with no versioning or migration path stated
- the touched contract has no existing precedent in the repo for the chosen route (e.g., first gRPC service in a REST-only repo) and the choice was not already made explicitly by the requirement or an `architecture-decision-advisor` record

## Workflow

1. Confirm the trigger predicate evaluated true (or was explicitly requested); record the
   `skill_trigger_log` entry regardless of outcome.
2. Identify which knowledge route applies from the touched file's shape (not guessed from the requirement's prose).
3. Load that route file and apply its checklist to the actual diff.
4. Record a recommendation: surface shape, versioning approach, and backward-compatibility impact, with rationale.
5. If a breaking change is unavoidable, raise it as a `Q` with the concrete compatibility impact named — never silently ship a breaking change without flagging it.
6. Record the recommendation in the invoking phase's Architecture Notes (Plan/Build) or review notes (Review).

## Exit Gate

- When triggered, a contract recommendation (surface shape, versioning, compatibility impact) with
  rationale and the selected route is recorded.
- Breaking-change risks are raised as `Q` IDs, never silently shipped.
- The `skill_trigger_log` entry is recorded whether the skill ran or was skipped.

## Determinism Rules

- Do not select a route file by guessing from the requirement's wording — select it from the diff's actual touched file shapes.
- Do not approve a breaking change without an explicit versioning or migration note.
- Do not invent a contract convention the repo has no precedent for without raising it as a `Q` first.

## Output

Follow `references/output-schema.md`.

Return: the contract recommendation (route selected, shape, versioning, compatibility impact, rationale), any raised `Q`, and the `skill_trigger_log` entry.
