# GraphQL

## Principles

- **Additive evolution is the whole point.** New fields and types are free to add without
  breaking existing clients — the schema is designed for this. The discipline is never removing or
  retyping a field a client might already query; deprecate with `@deprecated(reason: "...")` and
  leave it resolvable until every known consumer has migrated.
- **Nullability is a real design decision, not a default.** A field marked non-null (`String!`)
  that later needs to become nullable is a breaking change (clients assume it's always present). If
  a field's presence is not guaranteed at read time, it must be nullable from the start.
- **N+1 is a contract-shape problem, not just a performance one.** A schema that nests
  `order { items { product { ... } } }` invites N+1 resolver calls; the contract design should
  anticipate batching (DataLoader-style) at the type-relationship level, not leave it to whoever
  implements the resolver later.
- **Mutations return the changed state, not just an ID.** A client that just mutated data usually
  needs to re-render — returning the full updated object (or the specific changed fields) avoids a
  mandatory follow-up query.

## Common Pitfalls

- Exposing internal database relationship shape 1:1 in the schema (leaky abstraction) — the schema
  should model the domain, not the table structure underneath it.
- Making a list field nullable when the list itself should always resolve to at least `[]` —
  `[Item]` vs `[Item!]!` is a meaningful distinction clients rely on.
- Union/interface types with no clear discriminator field, forcing clients to guess the concrete
  type from field presence.
- Deep, unbounded nesting with no pagination on list fields — a single query can then request
  unbounded data.

## Versioning

- GraphQL schemas are conventionally versionless — evolve additively, deprecate, never remove
  within a stated support window. If a genuinely breaking change is unavoidable (rare), it needs an
  explicit migration plan, not a silent field removal.

## Checklist

- [ ] Every new field's nullability reflects its actual guaranteed presence, not a default choice.
- [ ] No existing field is removed or retyped without a deprecation window already elapsed.
- [ ] List fields that model a relationship anticipate batching, not naive per-item resolution.
- [ ] Mutations return enough of the changed state that a client doesn't need a mandatory follow-up query.
- [ ] Union/interface types have an explicit discriminator clients can branch on.
