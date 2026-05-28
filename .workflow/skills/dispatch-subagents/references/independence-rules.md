# Independence Rules

Work is independent only when one worker's output cannot invalidate another worker's assumptions.

Build work is not independent when candidates share:

- files or directories
- imports, exports, schemas, configs, fixtures, migrations, or tests
- generated-output source or generated target
- public contract or docs promise
- release, source handoff, or package surface
- branch, git state, or command state

Review work can be independent by risk category when it is read-only.

Think/Plan exploration can be independent by source area, requirement bucket, or risk category.

When unsure, do not dispatch. Sequence locally.
