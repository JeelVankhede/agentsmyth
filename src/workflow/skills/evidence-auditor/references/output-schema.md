# Output Schema

`evidence-auditor` does not write its own artifact. It returns a result the invoking phase
records inline, typically alongside its own findings or Verification/Sign-Off sections.

Return shape:

```text
skill: evidence-auditor
artifact: <path audited>
claims_audited: <count>
results:
  - claim: <one-line paraphrase of the claim>
    result: pass | fail
    citation: <what was cited, or "none">
    note: <why it failed, if it failed>
overall: pass | fail
```

Rules:

- `overall` is `fail` if any individual claim result is `fail`.
- An artifact with zero verified-fact claims (e.g. a pure planning artifact) returns
  `claims_audited: 0`, `overall: pass`.
