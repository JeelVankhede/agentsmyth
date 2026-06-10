# Exemplar

## Good Example

A good finding is concrete:

```markdown
## Findings

- P1 `.workflow/skills/lifecycle-review/SKILL.md` [R3] - Review does not write a durable review artifact, so downstream Test and Ship cannot inspect review evidence.
  - Fix: Require `.workflow/artifacts/reviews/<slug>-v<N>.md` and add it to the exit gate.
```

A good coverage row ties requirements to evidence:

```markdown
| Manifest ID | Evidence | Status | Notes |
|---|---|---|---|
| R3 | `.workflow/skills/lifecycle-review/SKILL.md` and `references/output-schema.md` | covered | Durable review artifact is required. |
| RI2 | `git diff --check` not run | partial | Evidence gap recorded as residual risk. |
```

When there are no findings, say:

```markdown
## Findings

none
```

Still include coverage, verification reviewed, residual risk, and recommendation.

## Bad Example

```markdown
## Findings

- P1 `.workflow/skills/lifecycle-review/SKILL.md` - This file needs improvement.

## Requirement Coverage

| Manifest ID | Evidence | Status | Notes |
|---|---|---|---|
| R3 | reviewed | covered | Looks good. |
| RI2 | - | covered | - |
```

## Why The Bad Is Bad

- "Needs improvement" names no specific problem, no contract violated, no fix action, and no manifest ID — Build cannot action this finding and it will be re-opened or silently closed as "addressed."
- Coverage row for R3 uses "reviewed" as evidence and "Looks good" as justification — Review is claiming coverage without citing what was inspected. Test cannot audit the claim and will inherit a gap it cannot trace.
- `RI2` marked `covered` with no evidence and no notes means an implicit requirement was passed through silently. If RI2 covers generated output, a source handoff surface, or a verification expectation, the gap reaches Ship undetected.
- Dashed evidence cells are not the same as `partial` status — they hide a known gap instead of naming it. Residual risk recorded as `partial` with a note is actionable; a dash is invisible to downstream phases.
