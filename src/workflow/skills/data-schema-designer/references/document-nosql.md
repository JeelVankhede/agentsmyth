# Document / NoSQL

## Principles

- **Model for the access pattern, not the entity relationship diagram.** A document store rewards
  embedding data that's always read together and referencing data that's read independently or
  updated at different rates — the "correct" shape depends on how the data is actually queried, not
  on normalized-entity purity.
- **Embedding has a size and update-frequency ceiling.** Embed a one-to-few, rarely-updated,
  always-read-together relationship. Reference a one-to-many-that-grows-unbounded or
  frequently-updated-independently relationship — an embedded array that grows without bound is a
  document-size problem waiting to happen.
- **Schema-less does not mean schema-free.** Even without an enforced schema, the application has
  an implicit one — document it (a JSON Schema, a type definition, or equivalent) so "what shape do
  documents actually have" isn't tribal knowledge.
- **Eventual consistency (if the store offers tunable consistency) is a per-operation decision.**
  A read that must reflect the latest write (e.g., read-your-own-write after a user action) needs
  strong consistency explicitly requested; a read that can tolerate staleness (an analytics
  dashboard) can use eventual consistency for better availability/latency.

## Common Pitfalls

- Unbounded array growth inside a single document (e.g., appending every event to one user
  document forever) — eventually hits the store's document-size limit and degrades read/write
  performance well before that.
- No versioning field on documents whose shape is expected to evolve — makes it impossible to
  distinguish "old shape, needs migration" from "new shape, field genuinely absent" at read time.
- Duplicating data across documents for read convenience with no reconciliation story when the
  source of truth changes — the duplicates silently go stale.
- Relying on multi-document transactions as a default pattern when the store's transaction support
  is limited/expensive — design the access pattern to need them rarely, not routinely.

## Migration Safety

- Additive field changes are safe — old documents simply lack the new field; application code must
  handle its absence.
- Changing a field's type in place is not directly enforceable — requires either a versioned-shape
  read path (handle both old and new type) or a backfill migration that rewrites every existing
  document, which at scale needs batching and can't safely lock the whole collection.

## Checklist

- [ ] Embedding vs. referencing was chosen based on actual read/write access patterns, not by default.
- [ ] Any array field that could grow unbounded has a stated bound or is referenced instead of embedded.
- [ ] Documents carry a version/shape indicator if the shape is expected to evolve.
- [ ] Consistency requirements (strong vs. eventual) are stated per operation where the store offers a choice.
- [ ] Type changes to existing fields have a stated dual-read or batched-backfill migration path.
