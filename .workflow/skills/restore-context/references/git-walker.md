# Git Walker

Inspect current target repo state before recommending Build, Review, Test, Ship, or any operation that depends on files.

Default command:

```bash
git status --short --branch
```

Record:

- current branch
- upstream/ahead/behind state
- changed and untracked files
- whether changed files are in lifecycle scope
- unrelated changes that must be preserved
- overlap between dirty files and planned files

Rules:

- Do not infer clean state.
- Do not run destructive git commands.
- If git state cannot be inspected, mark it not checked with reason.
- If unrelated changes overlap planned work, recommend `blocked` until resolved.
