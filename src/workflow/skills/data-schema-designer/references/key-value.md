# Key-Value

## Principles

- **The key structure is the query language.** A key-value store has no secondary indexes by
  default (or very limited ones) — every access pattern must be reachable by constructing the right
  key. Design the key naming/hierarchy (`user:{id}:profile`, `session:{token}`) around exactly the
  lookups the application needs, before writing any code against it.
- **TTL is a design decision, not an afterthought.** Sessions, caches, rate-limit counters — decide
  and state the expiry policy explicitly; a key with no TTL that should have had one is a slow
  memory/storage leak, not a bug that announces itself.
- **Value size and structure matter even without a schema.** Storing a large, monolithic blob under
  one key when only a small part of it changes frequently means every update rewrites the whole
  value — consider splitting into multiple keys if update patterns are skewed.
- **Atomic operations (increment, compare-and-swap) exist for a reason.** A read-modify-write cycle
  done as two separate operations from application code is a race condition; use the store's atomic
  primitive when the operation fits one (counters, locks, conditional writes).

## Common Pitfalls

- Key naming with no consistent convention across the codebase — makes it impossible to reason
  about what keys exist, and risks accidental collisions between unrelated features.
- Using the store as a queue or list via naive read-then-write patterns instead of the store's
  native list/queue primitives (if offered) — reintroduces race conditions the primitive would have
  prevented.
- No key expiry on ephemeral data (sessions, one-time tokens, rate-limit windows) — accumulates
  forever.
- Storing a large fan-out of related data as one giant value instead of related keys with a
  documented naming pattern — forces reading/writing the whole blob for a small logical change.

## Migration Safety

- Renaming a key pattern requires a dual-write or lazy-migration period (write both old and new key
  shapes, or migrate on read) — there is no in-place "rename" operation across a whole key space.
- Changing a value's internal structure needs application code that can read both old and new
  shapes during the transition, exactly like a schema version field in a document store.

## Checklist

- [ ] Key naming follows a stated, consistent convention across this codebase.
- [ ] Every ephemeral key (session, token, rate-limit) has an explicit TTL.
- [ ] Read-modify-write sequences that could race use the store's atomic primitive instead.
- [ ] Large, infrequently-fully-read values are split if update patterns are skewed to a small part.
- [ ] Key-pattern renames have a stated dual-write or lazy-migration transition plan.
