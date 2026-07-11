# gRPC

## Principles

- **Field numbers are the wire contract, not field names.** Once a `.proto` field ships, its
  number must never be reused for a different field, even after removal — reserve retired numbers
  (`reserved 4, 7;`) so a future field never accidentally aliases old wire data.
- **Every new field must be optional (proto3 default) or explicitly have a sane zero-value
  default.** Proto3 has no concept of "required" — a client on an older schema version simply
  won't send new fields, and the server must handle their absence gracefully.
- **Streaming shape is a design decision made once.** Unary, server-streaming, client-streaming,
  and bidi-streaming are different contracts with different backpressure/cancellation semantics —
  changing a method's streaming shape after clients exist is a breaking change, not an
  implementation swap.
- **Errors use `google.rpc.Status` with typed details, not string-only messages.** A client that
  needs to branch on error kind (retryable vs. not, validation vs. auth) needs a structured error
  code, not a message it has to string-match.

## Common Pitfalls

- Reusing a field number after removing the old field — silently corrupts data for any client still
  on the old schema sending that field.
- Putting business logic validation only in server code with no corresponding proto-level
  constraint documentation — a client has no way to know a numeric field has a valid range without
  reading server source.
- Choosing bidi-streaming for something that's really request/response — adds real complexity
  (flow control, ordering) with no benefit if the interaction is actually one-shot.
- Embedding a `oneof` without a clear "which field is set" contract for consumers — always document
  which case each `oneof` variant implies.

## Versioning

- Package versioning (`myapi.v1`, `myapi.v2`) for genuinely breaking changes — proto3's own
  evolution rules (additive fields, reserved retired numbers) handle everything else without a new
  package.

## Checklist

- [ ] No field number is reused after a field was removed — retired numbers are `reserved`.
- [ ] New fields are optional with sane zero-value defaults, not assumed-present.
- [ ] The streaming shape (unary/server/client/bidi) matches the actual interaction pattern, not
      chosen for flexibility "just in case."
- [ ] Errors use structured `google.rpc.Status` codes/details a client can branch on programmatically.
- [ ] Every `oneof` has a documented "which case implies what" contract.
