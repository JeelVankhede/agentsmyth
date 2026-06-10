# Exemplar

## Good Example

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

## Bad Example

```markdown
## Active Phase

- Phase: Phase 2 - Update lifecycle skill references
- Exit gate: ✅ Complete.

## Changed Files

- `.workflow/skills/lifecycle-build/SKILL.md` - updated ✅
- `.workflow/skills/lifecycle-review/SKILL.md` - updated ✅

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| tests | all | pass | all tests passed |
```

## Why The Bad Is Bad

- Exit gate marked ✅ before evidence appears in the artifact — Review cannot distinguish completed from abandoned work because the artifact itself claims done regardless of what changed.
- Changed file entries say "updated" without describing what was replaced or which manifest IDs they cover — traceability from requirement to file change is broken; Review and Test cannot audit coverage.
- "all tests passed" is not a command. It does not name a runner, a path, or a result format. The outcome may be invented, recalled from a prior run, or from an unrelated branch. It cannot be reproduced.
- No Branch / Repo Status entry means dirty state at the time of editing was not recorded — unrelated modified or untracked files that could conflict with the phase are invisible to Review.
