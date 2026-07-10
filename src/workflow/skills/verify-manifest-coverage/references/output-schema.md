# Output Schema

`verify-manifest-coverage` does not write its own artifact. It returns a result Review records in
its own `Requirement Coverage` section.

Return shape:

```text
skill: verify-manifest-coverage
task_derived_coverage: [<manifest IDs actually touched per task artifact Changed Files>]
review_declared_coverage: [<manifest IDs declared in review frontmatter>]
deltas:
  - id: <manifest ID>
    direction: declared-not-touched | touched-not-declared
    explanation: <required if the delta is legitimate, otherwise "unexplained">
overall: pass | fail
```

Rules:

- `overall` is `fail` if any delta has no explanation.
- Zero deltas is a trivial pass.
