# Git Status Policy

Build records repository status at three moments:

1. before edits — establishes the baseline; unrelated dirty files must be noted here
2. before staging or handoff — confirms only in-scope files are modified
3. after implementation completes or when a blocker is encountered

Every Branch / Repo Status table in the task artifact must include at minimum a row for moment 1 (before edits) and a row for the final moment (handoff or blocker). Intermediate moments are added as rows when the status changes materially mid-phase.

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
