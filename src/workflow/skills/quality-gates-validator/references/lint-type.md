# Lint / Type

## Principles

- **A passing lint/type check with suppressions doesn't count as adequate on its own.** Count
  `// eslint-disable`, `# type: ignore`, `@ts-expect-error`, or equivalent suppressions introduced
  by this diff — each one is a deliberate hole in the check's coverage and needs its own
  justification, not just "the overall command exited 0."
- **Type coverage matters more at boundaries than internals.** A function's public signature
  (parameters, return type) being well-typed matters more for catching real bugs than every
  internal local variable — prioritize adequacy review at module/function boundaries.
- **`any`/untyped escape hatches are a real signal, not just a style nit.** New usages of `any` (or
  the language's equivalent untyped escape hatch) in this diff represent a place the type checker
  has been told to stop helping — worth confirming each one is genuinely necessary, not a shortcut
  taken under time pressure.
- **Lint rule suppressions accumulate risk over time even when individually justified.** A suppression
  that was reasonable when added can become stale as the surrounding code changes — flag new
  suppressions distinctly from pre-existing ones so they get fresh scrutiny.

## What "Adequate" Means Here

- The lint/type command actually ran against the changed files (not skipped/excluded by config) and passed.
- Every new suppression comment introduced by this diff has an inline justification, and the
  justification is actually plausible given the surrounding code.
- New `any`/untyped usages are each confirmed necessary, not a convenience shortcut.

## Checklist

- [ ] Lint/type check ran against the actual changed files, not excluded by a glob/ignore config.
- [ ] Every new suppression in this diff has a stated, plausible justification.
- [ ] New untyped/`any` escape hatches are each confirmed necessary.
- [ ] Public function/module boundaries touched by this diff are fully typed, even if some internals are looser.
