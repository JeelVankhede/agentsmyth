# Output Schema

`performance-optimizer` writes into the invoking phase's Architecture Notes (Build) or review/
verify notes — it does not create a separate artifact.

Return shape:

```text
skill: performance-optimizer
routes_selected:
  - frontend-runtime | backend-throughput | db-query | mobile-runtime | memory | network
recommendation:
  cost_analysis: <what the change costs — algorithmic complexity, allocation, query count, network round-trips>
  proposed_optimization: <if any — what would reduce the cost, or "none needed">
  measurement_method: <how to confirm the actual cost/improvement — profiler, query plan, bundle analyzer, load test>
  rationale: <why>
raised_finding: <finding/Q id, only if a real regression exists with no mitigation>
skill_trigger_log_entry:
  skill: domain.performance-optimizer
  signals: { matched_globs: <bool>, complexity_score: <n> }
  decision: ran | skipped
  reason: <why>
```

Rules:

- `measurement_method` is required whenever `proposed_optimization` is not "none needed" — a
  recommended optimization with no way to confirm it worked is not actionable.
- `routes_selected` must match the diff's actual touched code's performance surface, not a guess
  from the requirement's wording.
