# Output Schema

`verification-matrix-builder` does not write its own artifact. It writes directly into Test's own
`## Manifest Coverage` section.

Return / table shape:

```text
| Manifest ID | How Verified | Evidence | Result | Notes |
|---|---|---|---|---|
| R1  | command / manual / generated-output / review / waiver | <specific evidence> | pass / fail / skip / waived | |
```

Rules:

- Every active `R`/`RI` has exactly one row (or more, if verified by multiple methods — each an
  additional row).
- `How Verified` must name a real method type, never left blank or generic.
- A `pass` result requires a non-empty `Evidence` cell.
