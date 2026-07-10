# Output Schema

`scope-fence` does not write its own artifact. It returns a result Build records in the task
artifact's `Scope` or `Changed Files` section, or in `Blockers` when it fails.

Return shape:

```text
skill: scope-fence
plan_phase: <active phase name>
declared_touches: [<file paths from the plan phase>]
actual_changed_files: [<git status output paths>]
out_of_scope: [<files present in actual but not in declared, and not waived>]
overall: pass | fail
```

Rules:

- `overall` is `fail` if `out_of_scope` is non-empty.
- A waived out-of-scope file is listed separately (not in `out_of_scope`) with the waiver ID it
  is covered by.
