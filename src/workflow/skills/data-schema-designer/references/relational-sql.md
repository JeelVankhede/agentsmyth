# Relational / SQL

## Principles

- **Normalize until it hurts, then denormalize deliberately.** Third normal form is the sane
  default (no derived data, no repeated groups); denormalizing for read performance is a real,
  legitimate decision — but it must be a decision, with a note on which read pattern justified it
  and how the derived data stays consistent (trigger, application code, periodic reconciliation).
- **Every foreign key needs an explicit `ON DELETE`/`ON UPDATE` policy.** `CASCADE`, `RESTRICT`,
  `SET NULL` all have very different failure/data-loss implications — the default (often
  `RESTRICT` or `NO ACTION`) should be a deliberate choice, not whatever the ORM happened to pick.
- **Index for the queries that actually exist, not hypothetical ones.** An index has a real write
  cost (every insert/update/delete maintains it) — adding one "just in case" is not free. A missing
  index on a genuinely slow query is a real, measurable problem worth fixing.
- **Nullability should mean something.** A nullable column should represent "this value is
  genuinely sometimes absent," not "I didn't want to think about a default." A non-null column with
  a sentinel default is often clearer than a nullable one with implicit meaning.

## Common Pitfalls

- Adding a `NOT NULL` column to a large existing table without a default — locks the table for the
  full rewrite on most engines, or fails outright if existing rows would violate it.
- Composite primary keys where the column order doesn't match the most common query pattern —
  the leftmost-prefix rule means index usability depends on order.
- `SELECT *` baked into application code that later breaks when a column is added — always project
  explicit columns in code that's part of a stable contract.
- Storing derived/computed data without a clear invalidation story — it silently goes stale.

## Migration Safety

- Adding a nullable column, or a `NOT NULL` column with a default, is safe online on most modern
  engines (check the specific engine's behavior — some still rewrite).
- Adding `NOT NULL` to an existing nullable column requires a backfill first, then the constraint —
  never both in one migration on a table with live traffic.
- Renaming or dropping a column is a two-step, two-deploy process at minimum: stop reading the old
  name/column in application code first, deploy, confirm, then drop.

## Checklist

- [ ] Every foreign key has an explicit `ON DELETE`/`ON UPDATE` policy, not an unconsidered default.
- [ ] New indexes are justified by an actual query pattern, not speculative.
- [ ] Nullable columns represent genuine optionality, not deferred default-value decisions.
- [ ] Any migration touching a large/live table is checked against the engine's actual lock behavior for that operation.
- [ ] Column rename/drop follows the two-step deploy pattern, not an atomic rename.
