# Exemplar

A good Build task entry is concrete and evidence-backed:

```markdown
## Active Phase

- Phase: Phase 2 - Update lifecycle skill references
- Manifest IDs: R2, RI1
- Exit gate: Build, Review, and Test reference files contain phase-specific contracts and no placeholder text.

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `phase-3c-build-review-test` | `## phase-3c-build-review-test` | Only external handoff file untracked; not in scope. |

## Changed Files

- `.workflow/skills/lifecycle-build/SKILL.md` - replaced placeholder with Build contract - IDs: R2, RI1

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `git diff --check` | repo | pass | No whitespace errors. |
```

Avoid:

- checking off tasks before the file is changed and evidence exists
- saying "tests passed" without exact command evidence
- including unrelated dirty files as if they were part of the phase
