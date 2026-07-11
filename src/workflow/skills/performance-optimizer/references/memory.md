# Memory

## Principles

- **A growth pattern matters more than a snapshot.** A single measurement of memory usage says
  little; whether usage grows unboundedly over the process's lifetime (a leak) versus stabilizes at
  a steady state is the real question — evaluate memory behavior over time/repeated operations, not
  a single point-in-time number.
- **Retained references are the most common leak cause in managed-memory languages.** An object
  that's logically "done" but still reachable via an unintentionally-retained reference (a
  forgotten event listener, a cache with no eviction, a closure capturing more than it needs) won't
  be garbage collected — trace reachability, not just object lifetime intent.
- **Caches need a bound.** An unbounded cache (grows forever, or grows with unbounded input) is a
  memory leak with a friendlier name — every cache needs a size limit, TTL, or other eviction
  policy, decided explicitly.
- **Large allocations have a cost even if short-lived.** Frequently allocating and discarding large
  objects/buffers (in a hot loop, per-request) creates GC pressure even if each one is individually
  reclaimed quickly — consider reuse/pooling for genuinely hot paths.

## Common Pitfalls

- Event listeners or subscriptions registered without a corresponding cleanup/unsubscribe, retaining
  the subscriber (and everything it references) indefinitely.
- An in-memory cache with no eviction policy, growing without bound as new keys are added.
- A closure capturing a large surrounding scope (an entire request object, a large data structure)
  when it only needs one small piece of it.
- Per-request or per-iteration allocation of large objects/buffers on a genuinely hot path, with no
  consideration of pooling or reuse.

## Checklist

- [ ] Memory behavior was evaluated over repeated operations/time, not a single snapshot.
- [ ] Every event listener/subscription this change adds has a corresponding cleanup path.
- [ ] Any new cache has an explicit size/TTL eviction policy.
- [ ] Closures capture only what they need, not the entire surrounding scope by convenience.
- [ ] Hot-path allocations of large objects consider pooling/reuse where allocation frequency is high.
