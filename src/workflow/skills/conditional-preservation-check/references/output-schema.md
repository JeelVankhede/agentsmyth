# Output Schema

`conditional-preservation-check` writes into Build's task artifact — either the Implementation Log
(if it ran clean) or a Blockers/finding entry (if it found a dropped branch) — it does not create a
separate artifact.

Return shape:

```text
skill: conditional-preservation-check
operations_checked:
  - kind: fold | merge | rename-with-restructure
    files: [<pre-refactor file(s)>]
findings:
  - pre_refactor_condition: <the exact branch/guard clause, cited by file + line>
    post_refactor_status: preserved | dropped-justified | dropped-unjustified
    justification: <required when dropped-justified, the explicit reason cited from the diff/task>
overall: pass | fail
```

Rules:

- `overall` is `fail` only when at least one finding has `post_refactor_status:
  dropped-unjustified` — a justified drop is not itself a failure.
- Every `dropped-justified` finding requires a real `justification` citation — an empty or generic
  justification ("seemed unnecessary") does not satisfy this.
