# Output Schema

`follow-up-owner-assigner` writes to `workflow/artifacts/open-items.yaml` (appending) and returns a
result Reflect records inline alongside its own `## Follow-Ups` section.

Return shape:

```text
skill: follow-up-owner-assigner
follow_ups_processed: <count>
new_ledger_entries:
  - id: OI-N
    source: requirement | follow-up
    owner: <name>
    next_action: <description>
overall: pass | fail
```

Rules:

- `overall` is `fail` if any follow-up lacked an owner (Refusal condition — should not reach this
  point) or if the existing ledger was malformed.
- Zero follow-ups and zero deferred/waived requirements is a trivial pass (`follow_ups_processed: 0`).
