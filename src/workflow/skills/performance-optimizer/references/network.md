# Network

## Principles

- **Round-trip count usually matters more than per-request payload size.** Latency (especially on
  mobile or cross-region) is often dominated by the number of round-trips, not the bytes
  transferred — batching N small requests into 1 typically beats optimizing the payload size of N
  separate requests.
- **Compression is close to free and should be the default for anything non-trivial.** Text-based
  payloads (JSON, HTML) compress well; enabling compression is usually a near-zero-cost win — the
  interesting design question is what's left after that, not whether to compress at all.
- **Retries need backoff and a cap, or they turn a transient blip into a self-inflicted overload.**
  A naive immediate-retry-on-failure pattern, multiplied across many concurrent clients, can turn a
  brief hiccup into a thundering-herd overload of the very dependency that was struggling.
- **Caching (HTTP cache headers, CDN, application-level) trades freshness for round-trip
  elimination — entirely avoiding a network call is the fastest network call.** Evaluate what can
  be cached and for how long before optimizing the calls that remain.

## Common Pitfalls

- Multiple sequential small requests that could be combined into one batched request or one request
  with better-designed response shape.
- No compression enabled for text-based API responses.
- Naive retry logic with no backoff or cap, risking a thundering-herd effect on a struggling dependency.
- No cache headers (or application-level caching) for genuinely cacheable, slow-changing data —
  paying the round-trip cost on every request unnecessarily.

## Checklist

- [ ] Round-trip count for this change's network interactions was considered, not just individual payload size.
- [ ] Text-based responses use compression.
- [ ] Retry logic (if any) has backoff and a maximum retry cap.
- [ ] Genuinely cacheable data has appropriate cache headers or application-level caching, not re-fetched every time.
