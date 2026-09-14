# Output Schema

`follow-up-owner-assigner` appends to `workflow/artifacts/open-items.yaml`, rotates closed items into
`workflow/artifacts/open-items-archive.yaml`, and returns a result Reflect records inline alongside its
own `## Follow-Ups` section.

Return shape:

```text
skill: follow-up-owner-assigner
follow_ups_processed: <count>
new_ledger_entries:
  - id: OI-N
    source: requirement | follow-up
    owner: <name>
    next_action: <description>
items_swept: <count>
swept_ids:
  - OI-N
overall: pass | fail
```

Rules:

- `overall` is `fail` if any follow-up lacked an owner (Refusal condition — should not reach this
  point), if either ledger file was malformed, or if a swept item did not arrive in the archive with
  every field intact.
- Zero follow-ups and zero unshipped requirements is a trivial pass (`follow_ups_processed: 0`).
- `items_swept: 0` is equally a pass — a run with nothing already closed has nothing to rotate. Report
  it rather than omitting it, so "swept nothing" stays distinguishable from "did not sweep".
- `swept_ids` is the list actually moved. Reflect cites it, so an item claimed as swept and not present
  in the archive is a detectable inconsistency rather than a matter of trust.
