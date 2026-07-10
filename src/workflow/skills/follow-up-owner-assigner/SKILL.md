---
name: follow-up-owner-assigner
description: Power skill that ensures every open follow-up has an owner and next action, and persists it to the durable open-items ledger.
---

# Follow-Up Owner Assigner

## Purpose

Ensure every open follow-up recorded in Reflect has a named owner and a concrete next action — never `TBD` — and persist each one into the durable, cross-run open-items ledger (`workflow/artifacts/open-items.yaml`) so it survives past the current Reflect narrative.

This is a power skill, not a lifecycle phase. It is gate-bound: it runs at every Reflect Exit Gate.

## Invocation Context

Use this skill when:

- Reflect is finalizing its `## Follow-Ups` section
- Reflect's Manifest Coverage Retrospective marks any `R`/`RI` as `deferred` or `waived` (these
  also need a follow-up entry, per `follow-up-policy.md`'s existing rule)

Do not invoke it when Reflect has zero follow-ups and zero deferred/waived requirements — nothing
to assign or persist.

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
- `references/ledger-format.md` — the exact `open-items.yaml` shape and ID conventions
- `src/workflow/schemas/open-items.schema.yaml`
- The reflect artifact's `## Follow-Ups` and `## Manifest Coverage Retrospective` sections

## Inputs

- Reflect's `## Follow-Ups` table.
- Reflect's `## Manifest Coverage Retrospective` (for deferred/waived IDs needing a follow-up).
- Existing `workflow/artifacts/open-items.yaml`, if present (append, do not overwrite).

## Refusal / Stop Conditions

Stop or return an incomplete assignment instead of approving when:

- a follow-up row has no owner, or `owner: TBD`
- a deferred/waived `R`/`RI` has no corresponding follow-up entry anywhere
- the existing `open-items.yaml` is malformed (fails its own schema) — do not silently overwrite a
  malformed file; report it

## Workflow

1. Read every row in Reflect's `## Follow-Ups` table.
2. Read Reflect's `## Manifest Coverage Retrospective` for any `deferred`/`waived` ID; confirm each
   has a matching follow-up.
3. For each follow-up lacking an owner, stop — Reflect must name one before this skill can proceed
   (never assign `TBD` itself).
4. Read the existing `workflow/artifacts/open-items.yaml` if present; validate it against
   `open-items.schema.yaml` before appending.
5. Append one `open-items.yaml` entry per follow-up: next available `OI-N` ID (never renumber
   existing ones), `source` (`requirement` or `follow-up`), `owner`, `next_action`, `status: open`,
   `first_seen_run` (this chain's slug-vN).
6. Write the updated `open-items.yaml`.

## Exit Gate

- No open follow-up lacks an owner and next action.
- Every follow-up (and every deferred/waived requirement) is persisted as an `open-items.yaml`
  entry.
- `open-items.yaml` still validates against its schema after the append.

## Determinism Rules

- Never assign `owner: TBD` on this skill's own authority — that is a Refusal condition, not a
  default to fill in.
- Never renumber existing `OI-N` IDs.
- Never overwrite `open-items.yaml` wholesale — always append to existing entries.
- Do not silently skip a malformed existing ledger — report it as a blocker.

## Output

Follow `references/output-schema.md`.

Return: the follow-up → owner/action mapping, the new `open-items.yaml` entries created, and an overall pass/fail for the Exit Gate this skill was invoked from.
