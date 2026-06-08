# Exemplar

A good Think artifact has this shape:

```markdown
## Requirement Manifest

### Explicit (R)

- **R1** - Add a configurable setup guide for the repository.
  - Acceptance: The guide names required config files and explains how an agent should load them.

### Implicit (RI)

- **RI1** - Keep the workflow scoped to this repository.
  - Acceptance: No instructions require secondary repositories or an external control-plane repository.

### Assumptions (A)

- **A1** - The repository can store workflow artifacts under `.workflow/artifacts/`.

### Open Questions (Q)

- **Q1** - Which source-of-truth provider should be updated during Ship?
```

Use a blocker when a `Q` changes scope, ownership, verification, release behavior, source-of-truth updates, or user intent.
