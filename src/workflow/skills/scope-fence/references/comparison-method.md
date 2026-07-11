# Comparison Method

How to compare `git status --short` output against a plan phase's `Touches` list.

1. Parse `git status --short` — each line's last field is a path (handle rename lines, which show
   `old -> new`; both sides count, but only `new` should appear in `Touches` since the pre-rename
   file no longer exists).
2. Normalize both the `git status` paths and the plan phase's `Touches` paths to repo-root-relative
   form before comparing — do not compare absolute paths against relative ones.
3. A `Touches` entry naming a directory (e.g. `src/workflow/skills/scope-fence/`) covers any file
   under that directory — do not require every individual new file inside a newly-created
   directory to be listed separately, as long as the directory itself is declared.
4. A `Touches` entry naming an exact file only covers that file.
5. Files outside any declared entry, exact or directory-prefixed, are out-of-scope.

Do not use fuzzy or "looks related" matching — the comparison is a literal path/prefix match
against the declared list.
