# Graph

## Principles

- **Model edges for the traversal, not just the relationship.** A graph schema's value is in
  efficient traversal — decide edge direction and whether a relationship needs to be traversable
  both ways (requiring either bidirectional edges or a query engine that handles reverse traversal
  efficiently) based on actual query patterns, not just "these two things are related."
- **Properties belong on the node or edge that owns their lifecycle.** A property that changes
  independently of the relationship itself (e.g., "when this friendship started" vs. "this user's
  name") belongs on the edge vs. the node respectively — putting relationship-lifecycle data on the
  wrong element makes it hard to query or update correctly.
- **Dense nodes (supernodes) are a real scaling hazard.** A node with millions of edges (a
  "celebrity" user followed by everyone) can make traversals through it disproportionately
  expensive — worth flagging explicitly when the data model could produce one, not just for graphs
  that already have this problem.
- **Graph schemas benefit from explicit edge-type naming**, same discipline as REST's resource
  naming — a generic `RELATED_TO` edge type loses information a specific `FOLLOWS`/`PURCHASED`/
  `AUTHORED` edge type preserves for both queries and future readers.

## Common Pitfalls

- No cardinality constraint stated for a relationship that should be 1:1 or 1:many — without an
  application-level or database-level constraint, nothing prevents an accidental many:many.
- Storing what's really tabular, unrelated data as graph nodes just because the store is a graph
  database — not every entity benefits from graph modeling; some data is genuinely simpler as a
  plain record.
- Ignoring supernode risk in the data model when the domain clearly implies one (social-graph
  "following," any many-to-one hub pattern).
- Traversal queries with no depth bound — an unbounded traversal on a cyclic or dense graph can be
  effectively unbounded work.

## Migration Safety

- Adding a new node or edge type is additive and safe.
- Renaming an edge type or changing its direction requires a migration that rewrites every existing
  edge of that type — at scale, this needs batching, same as a large table rewrite.
- Changing cardinality (1:1 to 1:many) requires deciding what happens to existing data that
  violates the new constraint before enforcing it.

## Checklist

- [ ] Edge direction and bidirectionality were chosen based on actual traversal needs, not assumed.
- [ ] Properties are placed on the node or edge whose lifecycle they actually track.
- [ ] Any relationship pattern that could produce a supernode is explicitly flagged.
- [ ] Cardinality constraints (1:1, 1:many, many:many) are stated, not left implicit.
- [ ] Traversal queries in the change have an explicit depth bound.
