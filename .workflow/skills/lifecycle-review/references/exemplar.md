# Exemplar

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
