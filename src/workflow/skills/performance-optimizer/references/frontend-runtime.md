# Frontend Runtime

## Principles

- **Re-render cost is the dominant frontend performance concern in component-based UIs.** A
  component re-rendering more often than necessary (unstable props/dependencies, missing
  memoization where the framework requires it) compounds across a deep component tree — profile
  actual re-render frequency, don't guess.
- **Bundle size is a load-time cost paid by every user.** Every new dependency and every
  non-code-split large module adds to what must download and parse before the app is interactive —
  weigh a new dependency's bundle-size cost against its value, and prefer code-splitting/lazy-loading
  for anything not needed on initial render.
- **The main thread is a single shared resource.** Heavy synchronous computation on the main thread
  (large data transforms, complex layout calculations) blocks user interaction and rendering —
  consider whether it can move off the main thread (web worker) or be broken into
  interruptible chunks.
- **Perceived performance is not the same as raw metric performance.** A skeleton/optimistic UI
  that appears instantly (even while real data loads) often matters more to user-perceived speed
  than shaving milliseconds off an already-fast backend response.

## Common Pitfalls

- Creating new object/array/function references on every render passed as props, defeating a
  child component's memoization even though the memoization code is present.
- A single large dependency imported for one small feature, when a lighter alternative or a
  narrower import would suffice.
- Synchronous heavy computation directly in a render/event-handler path with no chunking or
  worker offload.
- No loading/skeleton state, so the perceived wait feels longer than the actual data-fetch time.

## Checklist

- [ ] Re-render frequency for the changed component tree was checked (profiler or framework
      devtools), not assumed to be fine.
- [ ] New dependencies' bundle-size cost is weighed against their value; code-splitting is used for anything not needed on initial render.
- [ ] Heavy synchronous computation is chunked or offloaded rather than blocking the main thread in one pass.
- [ ] A loading/skeleton state exists for any data fetch that isn't near-instant.
