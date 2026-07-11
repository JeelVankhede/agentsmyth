# Output Schema

`constraint-conflict-scan` writes into the brief's `Open Questions (Q)` section when a conflict is
found (or, for a severe conflict, becomes a Refusal reported directly to the user) — it does not
create a separate artifact.

Return shape:

```text
skill: constraint-conflict-scan
conflicts:
  - constraint_id: <a real id present in domain.yaml, e.g. "safety-2">
    finding: <the specific conflict between the request and this constraint>
    disposition: raised-as-question | refused
    q_id: <Q id, if raised-as-question>
checked: { product: true, safety: true, provider_neutrality: true, protected_paths: true }
skill_trigger_log_entry:
  skill: constraint-conflict-scan
  signals: { task_class: <trivial|standard|complex>, touches_protected: <bool> }
  decision: ran | skipped
  reason: <why>
```

Rules:

- Every `constraint_id` must be a real ID present in `domain.yaml` at the time of the scan —
  `check-constraint-conflicts.mjs` structurally verifies this.
- `checked` must have all 4 keys `true` before reporting zero conflicts — a scan that skipped
  checking `provider_neutrality`, for example, cannot claim "no conflict found."
