# Output Schema

`waiver-completeness-check` does not write its own artifact. It returns a result the invoking
phase records inline (typically in the phase artifact's Exit Gate section or a waivers-review note).

Return shape:

```text
skill: waiver-completeness-check
artifact: <path checked>
waivers_checked: <count>
results:
  - waiver_id: <waived_gate_or_requirement_id or "unstructured">
    result: pass | fail
    missing_fields: [<field names, empty if pass>]
    note: <one line — e.g. "prose-only claim, no structured entry">
overall: pass | fail
```

Rules:

- `overall` is `fail` if any individual waiver result is `fail`.
- An artifact with zero waivers returns `waivers_checked: 0`, `overall: pass` (trivial pass — nothing to check).
- The invoking phase cites this result directly; it does not paraphrase or drop failed waiver IDs.
