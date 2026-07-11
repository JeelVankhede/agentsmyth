# Functional

## Principles

- **Push side effects to the edges; keep the core pure.** Business logic expressed as pure
  functions (same input always produces same output, no mutation, no I/O) is trivially testable and
  composable — I/O, mutation, and other side effects belong at the boundary (handlers, entry
  points), calling into pure functions for the actual logic.
- **Prefer immutable data structures.** Passing data that can't be mutated in place eliminates a
  whole class of aliasing bugs (two references to the same object, one mutates, the other is
  surprised) — copy-on-write or persistent data structures over in-place mutation.
- **Composition is the primary reuse mechanism, not inheritance.** Small, single-purpose functions
  combined via composition (pipe, chain, higher-order functions) build complex behavior from simple
  parts — favor this over building a large function that does many things sequentially.
- **Explicit error handling over exceptions for expected failure cases.** A result/either type (or
  the language's equivalent) that forces the caller to handle both success and failure paths is
  more honest about a function's real contract than an exception that's easy to forget to catch.

## Common Pitfalls

- Hidden mutation inside a function that looks pure from its signature (mutating an argument,
  writing to a closure-captured variable) — breaks the referential-transparency assumption callers
  rely on.
- Deeply nested function composition with no intermediate naming, making the data flow hard to
  trace — extract named intermediate steps even in a functional pipeline.
- Using exceptions for expected, common failure cases (validation failure, not-found) instead of an
  explicit result type — makes the failure path invisible in the function's signature.
- Overusing point-free/tacit style to the point where the resulting code is hard to read, trading
  brevity for real comprehension cost.

## Checklist

- [ ] Business logic is expressed as pure functions; side effects are pushed to clearly identified boundary code.
- [ ] Data structures passed through the core logic are immutable or treated as such.
- [ ] Expected failure cases use an explicit result/either type, not exceptions, where the language/ecosystem supports it idiomatically.
- [ ] Function composition chains have named intermediate steps where the data flow isn't immediately obvious.
