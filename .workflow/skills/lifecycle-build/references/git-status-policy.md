# Git Status Policy

Build records repository status at three moments:

1. before edits
2. before staging or handoff
3. after implementation or blocker

Required command shape:

```bash
git status --short --branch
```

Record:

- current branch
- upstream/ahead/behind state when shown
- modified, added, deleted, renamed, and untracked files
- which files are in scope
- which files are unrelated and must be preserved

Branch rules:

- Follow the Plan branch strategy.
- Do not commit to the default branch unless the Plan records explicit user approval.
- If branch switching would risk unrelated changes, stop and record a blocker.
