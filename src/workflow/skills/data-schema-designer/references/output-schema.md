# Output Schema

`data-schema-designer` writes into the invoking phase's Architecture Notes (Plan/Build) or review
notes (Review) — it does not create a separate artifact.

Return shape:

```text
skill: data-schema-designer
route_selected: relational-sql | document-nosql | key-value | graph | migrations | event-schema
recommendation:
  shape: <table/collection/key/graph-node shape described>
  keys_and_indexes: <primary key, foreign keys, indexes and why>
  nullability: <which fields are nullable and why>
  migration_safety: none-needed | additive | destructive-with-mitigation | destructive-unmitigated
  rationale: <why>
raised_question: <Q id, only if migration_safety is destructive-unmitigated>
skill_trigger_log_entry:
  skill: domain.data-schema-designer
  signals: { matched_globs: <bool> }
  decision: ran | skipped
  reason: <why>
```

Rules:

- `migration_safety: destructive-unmitigated` requires a `raised_question` — never silent.
- `route_selected` must match a file signal actually present in the diff, not an assumption.
