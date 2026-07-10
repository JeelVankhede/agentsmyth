# Output Schema

`skipped-check-accountant` does not write its own artifact. It returns a result Test records in
its own `Skipped Checks` section (and cites in `Sign-Off`).

Return shape:

```text
skill: skipped-check-accountant
rows_examined: <count>
results:
  - check: <name>
    outcome_claimed: pass | fail | not run | blocked
    evidenced: yes | no
    skipped_entry_complete: yes | no | n/a
    result: pass | fail
overall: pass | fail
```

Rules:

- `overall` is `fail` if any row's `result` is `fail`.
- `n/a` for `skipped_entry_complete` applies only to rows with `evidenced: yes` (no skip entry
  needed).
