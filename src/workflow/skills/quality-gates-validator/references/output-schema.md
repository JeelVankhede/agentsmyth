# Output Schema

`quality-gates-validator` writes into the invoking phase's review/verify notes — it does not
create a separate artifact.

Return shape:

```text
skill: quality-gates-validator
bars_evaluated:
  - route: unit-coverage | integration | lint-type | security-scan | perf-budget
    applies: <bool — was this bar materially affected by the change>
    evidence: <what was checked and where the result is cited>
    verdict: adequate | inadequate | not-applicable
    reason: <why>
skill_trigger_log_entry:
  skill: domain.quality-gates-validator
  signals: { task_class: <standard|complex> }
  decision: ran | skipped
  reason: <why>
```

Rules:

- `verdict: not-applicable` requires a stated reason the bar genuinely doesn't apply — not a
  default when it's inconvenient to check.
- `verdict: inadequate` must be surfaced as a Review/Test finding or risk, never left as a
  standalone unactioned note.
