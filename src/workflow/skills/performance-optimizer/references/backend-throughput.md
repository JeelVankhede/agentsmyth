# Backend Throughput

## Principles

- **Throughput is bounded by the slowest serial dependency in the request path.** A fast handler
  that makes one slow synchronous downstream call is still slow — profile the full request path,
  not just the code you wrote, to find the actual bottleneck.
- **Connection and thread/worker pool sizing is a real throughput constraint.** A handler that's
  individually fast can still cap overall throughput if it holds a scarce pooled resource
  (database connection, worker thread) longer than necessary — minimize hold time, don't just
  minimize per-request latency.
- **Batching amortizes fixed per-call overhead.** N sequential calls to do N small things (N
  database round-trips, N API calls) usually costs far more than 1 batched call doing the same N
  things — look for an N+1-shaped pattern whenever a loop makes a downstream call.
- **Caching trades staleness for throughput — that trade must be explicit.** A cache with no
  stated invalidation strategy or acceptable-staleness window is a correctness risk disguised as a
  performance win; state both the throughput gain and the staleness tolerance together.

## Common Pitfalls

- An N+1 query/call pattern inside a loop, each iteration making a separate downstream round-trip
  instead of one batched request.
- Holding a database connection or pooled resource for the duration of unrelated slow work
  (external API call, heavy computation) instead of releasing it as soon as the data is fetched.
- Synchronous blocking calls on a request path that could be parallelized (multiple independent
  downstream calls made serially instead of concurrently).
- A cache added with no invalidation strategy, silently serving stale data indefinitely.

## Checklist

- [ ] The full request path (including downstream calls) was considered, not just the new code in isolation.
- [ ] No new N+1-shaped pattern (loop making per-iteration downstream calls) without a stated reason batching isn't feasible.
- [ ] Pooled resources (connections, worker threads) are held only as long as actually needed.
- [ ] Independent downstream calls on the same request path are made concurrently, not serially, where safe to do so.
- [ ] Any new cache has an explicit invalidation strategy and stated staleness tolerance.
