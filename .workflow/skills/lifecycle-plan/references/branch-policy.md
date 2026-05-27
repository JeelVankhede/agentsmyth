# Branch Policy

Plan must define how Build should handle branches and local state.

Default policy:

- Use a non-default branch for planned changes.
- Preserve unrelated user changes.
- Record dirty working-tree state before Build.
- Stage only files that belong to the approved scope.
- Do not commit to the default branch unless the user explicitly approves that exception.

The plan should name:

- base branch
- intended working branch
- whether branch creation is needed
- whether commits are expected before PR creation
- PR expectation, if release config or user request requires it
- what to do if unrelated local changes overlap planned files

If branch policy is unclear or conflicts with repo config, block Plan for user approval.
