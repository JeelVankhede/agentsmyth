# Integration Boundary

## Principles

- **Every external integration needs an explicit trust boundary.** Data crossing from a third-party
  system (API response, webhook payload, imported file) is untrusted input, exactly like user
  input — validate/sanitize it at the boundary, don't let it flow into internal logic assuming it's
  well-formed just because it came from a "trusted" partner.
- **Third-party failure is not optional to handle.** Every external call needs an explicit answer
  to "what do we do when this is down, slow, or returns something unexpected" — degrade gracefully,
  queue and retry, or fail the operation explicitly; never let an unhandled external failure become
  an unhandled internal exception.
- **Anti-corruption layer: translate at the boundary, don't leak the third party's model
  internally.** Map the external system's data shape into this repo's own internal model at the
  integration point — letting a third-party's schema quirks (their naming, their nullability
  choices, their versioning) leak into internal code couples the whole codebase to that vendor's
  design decisions.
- **Webhooks and callbacks need authentication and idempotency, not just an accessible URL.**
  Anyone who discovers the URL can call it unless it's authenticated (signature verification,
  shared secret); and the sender may retry, so the handler must be idempotent.

## Common Pitfalls

- Trusting a webhook payload's contents without verifying its signature/origin — allows a forged
  request to trigger real internal actions.
- No timeout on a third-party API call — a slow or hung external dependency can block the calling
  request/process indefinitely.
- Letting the third party's exact field names and types propagate through internal code and
  database schema, so a vendor's breaking API change becomes a breaking internal change too.
- No retry/backoff strategy for a transient third-party failure, treating every failure as
  permanent (or, the opposite mistake: retrying indefinitely with no backoff, hammering a
  struggling dependency).

## Checklist

- [ ] Data from any external system is validated/sanitized at the integration boundary before use internally.
- [ ] Every external call has an explicit timeout and a stated behavior for failure (degrade, queue-retry, or explicit error).
- [ ] The external system's data shape is translated into an internal model at the boundary, not leaked through.
- [ ] Webhooks/callbacks verify authenticity (signature or shared secret) and are idempotent against retries.
- [ ] Retry strategy for transient failures uses backoff, not immediate unbounded retry.
