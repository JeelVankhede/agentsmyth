# WebSocket

## Principles

- **Every message needs a discriminator field.** A WebSocket connection multiplexes many logical
  message types over one stream — each message needs a `type` (or equivalent) field a client can
  switch on before parsing the rest of the payload; there is no HTTP status code or route to lean on.
- **Connection lifecycle is part of the contract.** What happens on connect (auth handshake?
  initial state snapshot?), what happens on reconnect (does the client need to replay a cursor, or
  does the server resend full state?), and what the close codes mean are all contract decisions,
  not implementation details left to whoever writes the handler.
- **Ordering and delivery guarantees must be stated, not assumed.** Does the server guarantee
  in-order delivery per-client? At-most-once or at-least-once? A client that assumes ordering the
  contract doesn't actually guarantee will have subtle, hard-to-reproduce bugs.
- **Backpressure is a real design question.** If the server can produce messages faster than a
  slow client can consume them, what happens — buffer, drop, disconnect? This must be decided, not
  discovered in production.

## Common Pitfalls

- No heartbeat/ping-pong mechanism, so a half-open connection (network dropped but TCP hasn't
  noticed) silently stops delivering messages with neither side aware.
- Sending full state on every update instead of deltas, for a high-frequency stream — fine at low
  volume, a real scaling problem once frequency or payload size grows.
- No versioning story for the message schema itself — a client on an old message-schema version
  has no way to detect a field it doesn't understand.
- Auth checked only at connection time, never re-validated for a long-lived connection whose
  underlying permissions might change mid-session.

## Reconnection & Delivery

- State explicitly: does reconnect resume from a cursor/sequence number (client says "I last saw
  message N"), or does the server just resend a fresh full snapshot? Cursor-based resume needs the
  server to buffer recent history; full-snapshot resume is simpler but more bandwidth on reconnect
  storms.

## Checklist

- [ ] Every message type has a discriminator field a client can switch on before full parsing.
- [ ] Connect/reconnect/close semantics are explicitly documented, not left implicit.
- [ ] Ordering and delivery guarantees (or lack thereof) are stated, not assumed by convention.
- [ ] A heartbeat/liveness mechanism exists to detect half-open connections.
- [ ] Backpressure behavior for a slow consumer is a deliberate choice (buffer/drop/disconnect), not undefined.
