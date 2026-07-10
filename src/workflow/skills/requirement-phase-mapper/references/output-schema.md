# Output Schema

`requirement-phase-mapper` does not write its own artifact. It returns a result the invoking Plan
phase records inline, typically alongside its own `## Phases` section.

Return shape:

```text
skill: requirement-phase-mapper
mapping:
  - id: <R or RI ID>
    phase: <Phase N, or "none" if orphaned>
    result: pass | fail
    note: <required if fail, or if cross-cutting>
overall: pass | fail
```

Rules:

- `overall` is `fail` only if some active ID is a true orphan (uncovered by any phase, directly or
  via a hyphenated sub-label).
- An ID cited by multiple phases is always `pass` — not itself a failure condition.
