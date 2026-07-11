# Event Schema

## Principles

- **Events are an immutable, append-only contract.** Once an event with a given shape has been
  published and consumed, that shape is effectively permanent for anyone who might replay history —
  evolve additively (new optional fields), never retroactively change what an already-published
  event means.
- **Every event needs a schema version and an event-type identifier.** A consumer reading a stream
  spanning months or years will encounter multiple schema versions — without an explicit version
  field, there is no reliable way to know which shape a given event follows.
- **Events describe facts that happened, not current state.** `OrderShipped` (a fact, with the
  shipment details at that moment) is a well-formed event; `OrderStatus: shipped` as a mutable
  "latest state" record is not an event, it's a materialized view — keep the distinction clear in
  naming and schema design.
- **Consumer independence is the point.** A schema change should be evaluated against "can an
  existing consumer that doesn't know about this change keep working correctly," not just against
  the producer's own needs.

## Common Pitfalls

- Removing or retyping a field in an event schema that's already been published — any consumer
  (including one replaying history from the start) will break or misinterpret existing events.
- No event-type/version field, making schema evolution undetectable to consumers.
- Publishing "the current full state" as every event instead of "what changed" — bloats stream
  size and makes replay-from-a-point-in-time semantically confusing (is this event a delta or a
  snapshot?).
- Coupling the event schema 1:1 to an internal database table shape — internal refactors then force
  event-schema breaking changes that have nothing to do with the actual business fact being recorded.

## Migration Safety

- Adding a new optional field to an event schema is safe — old consumers ignore it, new consumers
  can use it once available.
- Adding a new event type is always safe.
- Changing an existing event type's meaning or removing a field requires a new event-type version
  (e.g., `OrderShipped.v2`) published alongside the old one for a transition period, with consumers
  migrated deliberately — never an in-place redefinition of what `OrderShipped` means.

## Checklist

- [ ] Every event has an explicit type and schema-version identifier.
- [ ] No existing, already-published event type has a field removed or retyped in place.
- [ ] The event represents a fact ("X happened"), not a mutable current-state snapshot.
- [ ] A new consumer that doesn't understand a new optional field can still process the event correctly.
- [ ] Breaking changes to an event's meaning ship as a new versioned event type, not an in-place redefinition.
