# Output Schema

`architecture-decision-advisor` writes directly into the invoking phase's `## Architecture Notes` /
`## Architecture Notes Expectations` section — it does not create a separate artifact.

Return shape:

```text
skill: architecture-decision-advisor
decision:
  question: <the architecture question actually raised>
  chosen: <the approach selected>
  rejected:
    - approach: <alternative considered>
      reason_rejected: <why>
  rationale: <why the chosen approach, in repo-consistency/maintainability/tradeoff terms>
raised_question: <Q id, only if no repo-consistent choice existed>
skill_trigger_log_entry:
  skill: architecture-decision-advisor
  signals: { complexity_score: <n>, touches_contract: <bool>, new_surface: <bool> }
  decision: ran | skipped
  reason: <why>
```

Rules:

- `rejected` must have at least one entry when `decision.chosen` is populated — a decision with no
  named alternative was not actually a decision.
- `raised_question` and `decision.chosen` are mutually exclusive — either the skill recorded a
  choice, or it raised a `Q`, never both.
