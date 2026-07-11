# Output Schema

`repo-alignment-scan` does not create a separate artifact. It writes into the brief being drafted:
concrete repo-surface mappings go into the brief's `Problem`/`Requirements` prose, and any
misalignment becomes an `A` or `Q` entry in the Requirement Manifest.

Return shape:

```text
skill: repo-alignment-scan
mapped_surfaces:
  - <real file path or directory>
misalignments:
  - kind: A | Q
    id: <A or Q id>
    finding: <what was found, citing the specific repo location inspected>
skill_trigger_log_entry:
  skill: repo-alignment-scan
  signals: { complexity_score: <n>, new_surface: <bool>, task_class: <trivial|standard|complex> }
  decision: ran | skipped
  reason: <why>
```

Rules:

- `mapped_surfaces` must be real paths confirmed to exist (or, for genuinely new surfaces, the
  nearest existing sibling directory used as the placement precedent) — never invented paths.
- Every `misalignments` entry must cite the specific repo file or config inspected, not a general
  impression.
- The `skill_trigger_log_entry` is always recorded, whether `decision` is `ran` or `skipped`.
