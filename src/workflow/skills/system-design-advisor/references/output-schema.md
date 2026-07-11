# Output Schema

`system-design-advisor` writes into the invoking phase's Architecture Notes (Think/Plan) or review
notes (Review) — it does not create a separate artifact.

Return shape:

```text
skill: system-design-advisor
route_selected: monolith | microservices | event-driven | serverless | integration-boundary
recommendation:
  boundaries_affected: <modules/services touched>
  dependency_direction: <which module depends on which, and why that direction>
  failure_modes_considered: <list — at minimum, what happens if the new/changed boundary partially fails>
  rejected_alternatives:
    - approach: <alternative>
      reason_rejected: <why>
  rationale: <why>
raised_question: <Q id, only if a boundary violation or undefined integration contract is unavoidable>
skill_trigger_log_entry:
  skill: domain.system-design-advisor
  signals: { complexity_score: <n>, new_surface: <bool> }
  decision: ran | skipped
  reason: <why>
```

Rules:

- `rejected_alternatives` must have at least one entry — matches `architecture-decision-advisor`'s
  same discipline.
- `route_selected` must match the repo's actual confirmed topology, not the requirement's framing.
