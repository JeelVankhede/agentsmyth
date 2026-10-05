# Ledger Format

The open-items ledger is **two files**, both described by `open-items.schema.yaml` and distinguished
by `kind`:

| File | `kind` | Holds |
|---|---|---|
| `workflow/artifacts/open-items.yaml` | `open-items` | `open`, `blocked`, `deferred` — everything still unresolved |
| `workflow/artifacts/open-items-archive.yaml` | `open-items-archive` | `done` — items that have closed and been rotated out |

`deferred` stays in the live file. It means unresolved, not closed.

```yaml
version: 1
kind: open-items
items:
  - id: OI-1
    source: follow-up
    owner: user
    next_action: "Design + implement the deferred caching layer for the reporting service"
    status: open
    first_seen_run: reporting-cache-v1
  - id: OI-2
    source: requirement
    owner: user
    next_action: "Add minLength: 1 to domain.schema.yaml's summary field"
    status: open
    first_seen_run: schema-hardening-v1
    manifest_ids: []
```

```yaml
version: 1
kind: open-items-archive
items:
  - id: OI-3
    source: follow-up
    owner: user
    next_action: "Add a regression fixture for the empty-config path"
    status: done
    first_seen_run: config-hardening-v1
    resolution: "Fixture added and wired into the violations suite; it caught a second bug on first run."
    closed_in_run: config-hardening-v2
```

Rules:

- `id` format is `OI-N`, sequential, never renumbered and never reused — same convention as
  `pending-setup.yaml`'s `PS-N`.
- **The next free `OI-N` is the next number after the highest issued across BOTH files.** Reading only
  the live file is how a number gets taken twice: rotation keeps that file lean, so the highest number
  it shows is not the highest ever issued.
- `source: requirement` entries should carry `manifest_ids` naming the affected `R`/`RI`;
  `source: follow-up` entries may omit it.
- `first_seen_run` is the lifecycle chain's `slug-vN` whose Reflect phase created the entry — not the
  current run, if this entry is being carried forward from an earlier one.
- `next_action` means the pending action and nothing else. Closure prose belongs in `resolution`.
- `closed_in_run` is the `slug-vN` that closed the item. The literal `unrecorded` is valid only for an
  item closed before the field existed and whose closing chain is genuinely not recoverable — never
  for a new closure.
- Neither `resolution` nor `closed_in_run` is required. An item closed before they existed may honestly
  have neither, and failing such an item would not recover the reasoning it never captured.

## Rotation

This skill **appends** to the live file and **rotates** closed items out of it. Rotation is a move: an
item leaves the live file and arrives in the archive in the same operation, so it is present in exactly
one of the two afterwards.

The split exists for **context**, not disk. The live file is re-read at every Reflect exit gate, and
before rotation existed the closed items it carried were the large majority of that read.

Two consequences worth stating, because both are easy to get wrong:

- **Any figure counted from this ledger spans both files.** How many follow-ups a repo has ever filed,
  and whether a given `OI-N` is free, are questions about the pair. A count taken from the lean live
  file describes the current cycle while still looking like a total.
- **The archive is never read for work.** Nothing scans it looking for something to finish, which is
  why an unresolved item must never be written there — it would sit forever while reading as accounted
  for. Validating the file is not reading it for work.

Status transitions are **not** this skill's authority. It moves items whose `status` is already `done`;
it never sets that value, in either direction.
