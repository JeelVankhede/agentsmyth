---
name: follow-up-owner-assigner
description: Power skill that ensures every open follow-up has an owner and next action, and persists it to the durable open-items ledger.
---

# Follow-Up Owner Assigner

## Purpose

Ensure every open follow-up recorded in Reflect has a named owner and a concrete next action — never `TBD` — and persist each one into the durable, cross-run open-items ledger (`workflow/artifacts/open-items.yaml`) so it survives past the current Reflect narrative.

The ledger is **two files**. The live one holds what is still unresolved; `workflow/artifacts/open-items-archive.yaml` holds what has closed. This skill appends to the live file and rotates closed items out of it. It never decides that an item is closed — that stays a human or agent judgement made elsewhere.

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
- `references/ledger-format.md` — the exact shape of both ledger files, the ID conventions, and the rotation rule
- `src/workflow/schemas/open-items.schema.yaml`
- The reflect artifact's `## Follow-Ups` and `## Manifest Coverage Retrospective` sections

## Inputs

- Reflect's `## Follow-Ups` table.
- Reflect's `## Manifest Coverage Retrospective` (for deferred/waived IDs needing a follow-up).
- Existing `workflow/artifacts/open-items.yaml`, if present.
- Existing `workflow/artifacts/open-items-archive.yaml`, if present — needed to pick the next free `OI-N`, which is the highest ever issued across BOTH files, not the highest the live file happens to show.

## Refusal / Stop Conditions

Stop or return an incomplete assignment instead of approving when:

- a follow-up row has no owner, or `owner: TBD`
- a deferred/waived `R`/`RI` has no corresponding follow-up entry anywhere
- either ledger file is malformed (fails its own schema) — do not rewrite a malformed file; report it
- the live ledger holds a `done` item whose `status` you cannot confirm was set by someone else. This
  skill rotates items that are already closed; it never closes one, so an item it cannot attribute a
  closure to is a stop, not a sweep

## Workflow

1. Read every row in Reflect's `## Follow-Ups` table.
2. Read Reflect's `## Manifest Coverage Retrospective` for any `deferred`/`waived` ID; confirm each
   has a matching follow-up.
3. For each follow-up lacking an owner, stop — Reflect must name one before this skill can proceed
   (never assign `TBD` itself).
4. Read the existing `workflow/artifacts/open-items.yaml` and `workflow/artifacts/open-items-archive.yaml`
   if present; validate each against `open-items.schema.yaml` before changing either.
5. Append one live-ledger entry per follow-up: next available `OI-N` ID — the next number after the
   highest issued across both files, never a renumbering of an existing one — plus `source`
   (`requirement` or `follow-up`), `owner`, `next_action`, `status: open`, `first_seen_run` (this
   chain's slug-vN).
6. Write the updated `open-items.yaml`.
7. **Sweep.** After the append, move every item already marked `status: done` out of the live ledger
   and into `open-items-archive.yaml`, creating that file with `kind: open-items-archive` if it does
   not exist. Rotation is a **move**: the item leaves one file and arrives in the other in the same
   operation, so it is present in exactly one of them afterwards. Carry every field across unchanged
   and add `closed_in_run` — the slug-vN that closed it, or the literal `unrecorded` when that is
   genuinely not recoverable. Closure prose sitting in `next_action` belongs in `resolution`; move it
   rather than leaving `next_action` describing work already finished.
8. Write the updated `open-items-archive.yaml`.

The sweep decides **nothing about closure**. It acts only on `status: done` values that were already
there when it started reading. An item this skill would have to close in order to move is an item it
must leave alone and report.

## Exit Gate

- No open follow-up lacks an owner and next action.
- Every follow-up (and every requirement a chain did not ship) is persisted as a live-ledger entry.
- The live ledger holds no `status: done` item after the sweep.
- Every swept item is present in exactly one of the two files, carries `closed_in_run`, and no longer
  describes finished work in `next_action`.
- No item's `status` was changed by this skill.
- Both files still validate against `open-items.schema.yaml` after the append and the sweep.

## Determinism Rules

- Never assign `owner: TBD` on this skill's own authority — that is a Refusal condition, not a
  default to fill in.
- Never renumber existing `OI-N` IDs, and never reuse one. The next free ID is the next number after
  the highest issued across both files. Reading only the live file is how a number gets taken twice:
  rotation keeps that file lean, so the highest number it shows is not the highest ever issued.
- **Never change an item's `status`.** The sweep moves items that are already `done`; deciding that
  something is done is not this skill's authority, in either direction.
- Rewriting both ledger files is what the sweep does, so "never overwrite the ledger" cannot be the
  rule. The rule is narrower and stricter: **every item that leaves the live file must arrive in the
  archive in the same operation**, with every field intact. Losing an item, copying one instead of
  moving it, or dropping a field while moving it are the failures this replaces a blanket prohibition
  with.
- Do not silently skip a malformed existing ledger — report it as a blocker.

## Output

Follow `references/output-schema.md`.

Return: the follow-up → owner/action mapping, the new `open-items.yaml` entries created, and an overall pass/fail for the Exit Gate this skill was invoked from.
