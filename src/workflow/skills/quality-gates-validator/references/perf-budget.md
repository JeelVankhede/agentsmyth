# Performance Budget

## Principles

- **A budget is a number tied to a specific, measured scenario, not a vague goal.** "Fast enough"
  isn't a budget — "P95 API latency stays under 200ms for this endpoint" or "bundle size for this
  page stays under 250KB gzipped" is. Adequacy review requires the budget to actually be stated in
  measurable terms before judging whether the change respects it.
- **Regression detection needs a before/after comparison, not just an absolute check.** A change
  that keeps a metric under its ceiling but doubles it is a real regression even if nominally still
  "within budget" — flag a large relative regression even when the absolute number still passes.
- **Budgets should be enforced close to where they're spent.** A bundle-size budget checked at
  build time, a query-cost budget checked against actual query plans, a latency budget checked
  against real (or realistically loaded) traffic — each budget's evidence should come from
  measuring the actual thing it constrains, not a proxy.
- **Not every change needs a performance budget check — but claim that deliberately.** A change
  with no plausible performance impact (documentation, test-only) genuinely doesn't need this bar;
  a change touching a hot path always does, even if "it's probably fine."

## What "Adequate" Means Here

- The relevant budget (latency, bundle size, query cost, memory, or whatever applies) is stated in
  measurable terms, not vague.
- This diff's actual measured impact on that budget is cited — a before/after comparison, not just
  a single post-change number with no baseline.
- Any real regression (even if still nominally within budget) is called out explicitly, not hidden
  by only checking the ceiling.

## Checklist

- [ ] The applicable performance budget is stated in specific, measurable terms.
- [ ] This diff's actual before/after impact on the budget is measured and cited, not assumed.
- [ ] Relative regressions are flagged even when the absolute number still passes the ceiling.
- [ ] The measurement method matches what the budget actually constrains (real query plan, real bundle output, real latency under load), not a loose proxy.
