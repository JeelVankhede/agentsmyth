# Output Schema

`release-readiness-gate` does not write its own artifact. It returns a result Ship records in its
own `Ship Status` and `Release Readiness` sections.

Return shape:

```text
skill: release-readiness-gate
inputs:
  verify_signoff: { state: ship | hold | hold-with-waiver, evidence: <citation> }
  review_open_findings: { p0: <count>, p1: <count>, evidence: <citation>, waived: [<finding ids>] }
  coverage_ledger: { gaps: <count>, unwaived_dropped: <count>, evidence: <citation> }
  waivers: [<waiver IDs consumed to clear a failing input>]
recommendation: go | hold | hold-with-waiver
overall: pass | fail
```

Rules:

- `overall` is `fail` only when the skill itself could not complete the aggregation (missing
  input) — a `hold` or `hold-with-waiver` recommendation is a valid, complete `overall: pass`
  result; the recommendation itself is the finding, not a skill failure.
- Every entry in `inputs` must have a non-empty `evidence` citation.
