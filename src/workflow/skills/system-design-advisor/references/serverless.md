# Serverless

## Principles

- **Functions should be stateless between invocations.** Any state a function needs beyond a
  single invocation belongs in an external store (database, cache) — assuming in-memory state
  survives between calls is a real, common bug, since the runtime can (and will) spin up fresh
  instances, reuse warm ones unpredictably, or run multiple instances concurrently.
- **Cold start is a real design constraint, not just an ops concern.** A function with a heavy
  initialization (large dependency load, connection pool setup) pays that cost disproportionately
  on cold start — for latency-sensitive paths, this affects the design (keep init light, or accept
  and design around the latency variance).
- **Timeouts are a hard ceiling, not a guideline.** Serverless platforms enforce a maximum
  execution duration — any operation that could exceed it needs to be broken into
  smaller steps (queue-based chaining, step functions) rather than assumed to "usually" finish in time.
- **Concurrency limits and downstream connection exhaustion are a real interaction.** A burst of
  concurrent invocations can each open a new connection to a downstream database/service — without
  connection pooling designed for this (or a proxy/pooler in front of the downstream), a traffic
  spike can exhaust the downstream's connection limit even though each individual function is
  simple and fast.

## Common Pitfalls

- Assuming a global variable or file-system write persists across invocations — sometimes true
  (warm reuse) but never guaranteed, and code that depends on it silently breaks on cold start or
  concurrent execution.
- No idempotency for a function triggered by an event source that can redeliver (most queue/event
  triggers are at-least-once).
- Long-running work crammed into a single function invocation instead of broken into
  resumable steps, hitting the platform's timeout under real (not test) data volume.
- No handling for the downstream connection-exhaustion pattern under concurrent invocation spikes.

## Checklist

- [ ] No function assumes in-memory or file-system state persists across invocations.
- [ ] Cold-start cost is considered for latency-sensitive functions (light init, or accepted variance).
- [ ] Any operation with unpredictable duration is designed to fit well within the platform's timeout, or broken into steps.
- [ ] Downstream connections account for concurrent invocation spikes (pooling/proxy or explicit concurrency limits).
- [ ] Functions triggered by at-least-once event sources are idempotent.
