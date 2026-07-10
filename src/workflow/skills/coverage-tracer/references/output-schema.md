# Output Schema

`coverage-tracer` writes into the invoking artifact's own coverage-related section (Plan's
`Requirement Coverage`, Review's `Requirement Coverage`, Ship's `Requirement Coverage`, Reflect's
`Manifest Coverage Retrospective`) — it does not create a separate ledger file.

Return / table shape:

```text
| Manifest ID | State                          | Citation                        |
|---|---|---|
| R1  | covered / deferred / waived / dropped | <file path or section or command output> |
```

Rules:

- One row per active `R`/`RI` ID — no merged rows.
- `dropped` rows must additionally cite the waiver ID that authorized the drop.
- A gap (ID with no row) is reported explicitly, not silently omitted from the table.
