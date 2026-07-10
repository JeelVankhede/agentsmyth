# Output Schema

`plan-assumption-verifier` does not write its own artifact. It writes a `## Assumptions Verified`
table into the plan artifact — a new structural convention (this skill introduces it, matching how
`waiver-completeness-check` introduced the `## Waivers` table when no equivalent structure existed).

Table shape:

```text
## Assumptions Verified

| Assumption ID | Status | Evidence / Question |
|---|---|---|
| A1 | evidence-backed | <specific citation — file, config value, command output> |
| A2 | raised-as-question | Q3 |
```

Rules:

- One row per brief `A` ID.
- `Status` is exactly `evidence-backed` or `raised-as-question`.
- `evidence-backed` rows must cite something specific in the third column, not a restatement of
  the assumption itself.
- `raised-as-question` rows cite the new `Q` ID that supersedes the assumption.
- A plan with zero brief `A` IDs omits this section entirely (nothing to verify).

Return shape (in-session result, mirrored into the table above):

```text
skill: plan-assumption-verifier
assumptions:
  - id: <A ID>
    status: evidence-backed | raised-as-question
    citation: <what was inspected, if evidence-backed>
    new_question_id: <Q ID, if raised-as-question>
overall: pass | fail
```

Rules:

- `overall` is `fail` only if an assumption is left with neither an evidence citation nor a raised
  question — every assumption must land in one of the two valid states.
- A `raised-as-question` result is not itself a failure of this skill — it is the correct outcome
  for an assumption that could not be verified. The skill fails only if an assumption is left in
  neither state.
