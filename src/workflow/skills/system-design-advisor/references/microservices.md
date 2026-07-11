# Microservices

## Principles

- **A service boundary should follow a business capability, not a technical layer.** "Order
  service," "inventory service" (capability-aligned) age better than "database service," "cache
  service" (layer-aligned) — the latter tends to require synchronized deploys across services for
  almost any real change, defeating the purpose of splitting them.
- **Every cross-service call is a new failure mode.** A function call either works or throws; a
  network call to another service can also time out, partially succeed, or return stale data from a
  retry — every cross-service integration point needs an explicit timeout, retry, and
  failure-handling story, not an assumption it "just works."
- **Data ownership is exclusive per service.** Exactly one service owns a given piece of data and
  is the only writer; other services get it via that service's API or an event it publishes — never
  two services writing to the same underlying store.
- **Synchronous chains multiply latency and failure probability.** Service A calling B calling C
  synchronously means A's request latency is the sum of all three, and A's availability is the
  product of all three's availability — prefer async (events, queues) for anything that doesn't
  need an immediate response.

## Common Pitfalls

- A "distributed monolith" — services split by team/deploy convenience but still sharing a database
  or requiring synchronized deploys, getting microservices' operational cost with none of the
  independence benefit.
- No circuit breaker or timeout on cross-service calls — one slow/down dependency cascades into
  cascading failure across every caller.
- Chatty inter-service communication (many small calls to assemble one response) instead of a
  purpose-built aggregation endpoint or precomputed view.
- Shared client libraries that couple services to each other's internal types/versions, defeating
  independent deployability.

## Failure Modes To Consider

- What happens when the dependency is slow (not down, just slow)? A caller with no timeout will
  hold resources indefinitely.
- What happens when the dependency returns a partial/degraded response? Does the caller have a
  sensible fallback, or does it propagate the failure?
- What happens on a duplicate/retried request (network flake causes the caller to retry)? Is the
  operation idempotent?

## Checklist

- [ ] The service boundary follows a business capability, not a technical layer.
- [ ] Every new cross-service call has an explicit timeout and a stated retry/failure-handling policy.
- [ ] Exactly one service owns any given piece of data as its authoritative writer.
- [ ] Synchronous call chains are as shallow as possible; deeper flows use async where the response isn't immediately needed.
- [ ] Idempotency is considered for any operation a retry could duplicate.
