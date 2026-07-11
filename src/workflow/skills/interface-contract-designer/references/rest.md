# REST

## Principles

- **Resources, not actions.** URLs name nouns (`/orders/{id}`), HTTP methods carry the verb
  (`POST /orders`, `PATCH /orders/{id}`). An endpoint named `/orders/cancel` is a signal the
  resource model needs rethinking, not a shortcut.
- **Status codes carry meaning, not just success/failure.** `201` for created-with-location,
  `202` for accepted-but-async, `409` for conflict, `422` for semantically invalid input distinct
  from `400`'s malformed input. Reusing `200` for everything erases information a client needs.
- **Idempotency is a contract, not an implementation detail.** `PUT`/`DELETE` must be safely
  retryable. `POST` for a non-idempotent create needs an idempotency-key mechanism if retries are
  expected (mobile clients, flaky networks) — state this explicitly, don't leave it implicit.
- **Pagination shape is part of the contract, not an afterthought.** Cursor-based (`?after=<opaque
  cursor>`) survives concurrent inserts/deletes without skipped/duplicated items; offset-based
  (`?offset=N&limit=M`) is simpler but breaks under concurrent writes. Pick deliberately, document
  which one, and never mix both styles across endpoints in the same API.

## Common Pitfalls

- Returning `200` with an error payload instead of a real error status — breaks generic HTTP
  client/proxy/cache behavior that keys off status codes.
- Nesting resources more than 2 levels deep (`/a/{id}/b/{id}/c/{id}/d`) — usually a sign the
  resource model should flatten with a query parameter instead.
- Changing a field's type or removing a field in place — always additive-only for a stable version;
  breaking changes need a new version segment or a documented deprecation window.
- Leaking internal IDs (database auto-increment) as the public resource identifier when the
  resource might need re-keying later — prefer an opaque public ID from day one.

## Versioning

- URL-path versioning (`/v1/orders`) is the most explicit and cache-friendly; header-based
  versioning (`Accept: application/vnd.api+json;version=1`) is less visible but avoids URL churn.
  Either is fine — document which one the repo uses and stay consistent within it.
- Additive changes (new optional field, new endpoint) never require a version bump. Removing or
  retyping a field, or changing required-ness, does.

## Checklist

- [ ] Every endpoint's HTTP method matches its actual semantics (safe/idempotent/neither).
- [ ] Status codes distinguish client error (4xx) from server error (5xx) and from success (2xx)
      variants (created/accepted/no-content).
- [ ] Non-idempotent `POST` endpoints likely to be retried have an idempotency-key story.
- [ ] Pagination style is consistent with the rest of this API's existing endpoints.
- [ ] Any breaking change is versioned or has a stated deprecation window — never silent.
