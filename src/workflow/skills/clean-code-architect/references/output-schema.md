# Output Schema

`clean-code-architect` writes into the invoking phase's Architecture Notes (Build) or review notes
(Review) — it does not create a separate artifact.

Return shape:

```text
skill: clean-code-architect
route_selected: oo | functional | layered | module-boundaries
recommendation:
  layering_coupling_assessment: <does the change respect existing layer/module boundaries>
  naming_consistency: <does naming follow existing repo conventions>
  duplication_notes: <any new duplication introduced, and why it was or wasn't reused/extended instead>
  testability_notes: <can the changed logic be tested in isolation, or does it require heavy setup/mocking that suggests a coupling problem>
  rationale: <why>
raised_question: <Q id, only if a real duplication or boundary violation was found and not fixed directly>
skill_trigger_log_entry:
  skill: domain.clean-code-architect
  signals: { complexity_score: <n> }
  decision: ran | skipped
  reason: <why>
```

Rules:

- `duplication_notes` must explicitly address whether existing logic could have been reused —
  "no duplication found" is only valid after actually checking.
- `route_selected` must match the codebase's actual dominant paradigm, not a language default assumption.
