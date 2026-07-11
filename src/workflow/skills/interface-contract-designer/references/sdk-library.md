# SDK / Library

## Principles

- **Public API surface is everything exported, not everything written.** A function/class is only
  part of the contract if it's actually exported/public — keep internal helpers genuinely private
  (unexported, or a documented `internal`/`_private` naming convention) so refactoring them never
  counts as a breaking change.
- **Semantic versioning is a promise, not a suggestion.** A public function's signature change
  (new required parameter, removed parameter, changed return type) is a major-version-only change.
  A new optional parameter or new exported function is minor. A bug fix with no API surface change
  is patch.
- **Error types are part of the contract.** A caller that needs to catch and branch on a specific
  failure mode needs a typed/named error (not a generic exception with a string message it has to
  match) — changing an error's type or removing one a caller might catch is a breaking change.
- **Async/sync surface is a real design decision.** Offering both a sync and async version of the
  same operation is a maintenance burden that must be deliberate, not accidental duplication from
  incremental feature requests.

## Common Pitfalls

- Changing a function's parameter order (even with the same types) — silently breaks any positional-argument caller without a type error, in dynamically-typed languages especially.
- Widening an input type in a way that changes behavior for existing callers (e.g., a function that
  used to require a specific enum now accepts any string) — technically additive in some type
  systems but a real behavior contract change.
- Re-exporting a third-party type directly, so the third party's own breaking change becomes an
  unversioned breaking change in this library too.
- Mutating an argument passed by reference when callers reasonably expect immutability — an
  invisible contract violation with no type-level signal.

## Deprecation

- Mark deprecated exports with the language/tooling's actual deprecation mechanism (not just a
  comment) so callers get a real, visible signal (linter warning, IDE strikethrough) before removal
  in the next major version.

## Checklist

- [ ] Only genuinely-intended-public symbols are exported; internal helpers are not accidentally public.
- [ ] Any signature change to an existing public function is scoped to the correct semver bump.
- [ ] Errors a caller might reasonably catch are typed/named, not generic.
- [ ] No third-party type is re-exported without a note that its stability is inherited, not owned.
- [ ] Mutation of by-reference arguments is intentional and documented, not incidental.
