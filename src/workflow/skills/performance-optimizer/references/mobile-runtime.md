# Mobile Runtime

## Principles

- **Battery and thermal cost are real performance dimensions on mobile, not just speed.** A
  background task that polls frequently, holds a wake lock, or uses the radio (network) more than
  necessary drains battery even if each individual operation is "fast" — evaluate frequency and
  wakefulness cost, not just per-call latency.
- **Memory pressure triggers OS-level consequences mobile developers must design for.** Unlike a
  server with elastic memory, a mobile OS can kill a backgrounded app (or the current app under
  pressure) when memory runs low — high memory usage isn't just slow, it's a correctness risk (data
  loss on kill) if state isn't properly persisted.
- **Network cost on mobile includes both latency and metered-data cost.** A user on a slow or
  metered connection pays for every byte and every round-trip differently than a desktop user on
  broadband — batch requests, compress payloads, and consider offline-first patterns where the
  interaction allows it.
- **Startup time is disproportionately visible to users.** App launch happens far more often than
  any single in-app action — heavy initialization work at startup (even if "only" a few hundred
  milliseconds) is felt on every single app open.

## Common Pitfalls

- Frequent background polling instead of push/event-driven updates, draining battery for
  low-value freshness.
- Large images/assets loaded at full resolution when a smaller size would suffice for the actual
  display context.
- Heavy work performed synchronously at app startup instead of deferred until after the initial
  screen renders.
- No handling for low-memory warnings — the app doesn't release non-essential cached data before
  the OS kills it outright.

## Checklist

- [ ] Background work frequency and wake-lock usage are justified by actual freshness needs, not "just in case."
- [ ] Images/assets are sized appropriately for their actual display context, not loaded at unnecessary full resolution.
- [ ] Heavy initialization work is deferred past the first rendered frame where possible.
- [ ] The app responds to low-memory signals by releasing non-essential cached data.
- [ ] Network requests are batched/compressed with metered-connection users in mind.
