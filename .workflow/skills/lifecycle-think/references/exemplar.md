# Exemplar

## Good Example

A good Think artifact has this shape:

```markdown
## Requirement Manifest

### Explicit (R)

- **R1** - Add a configurable setup guide for the repository.
  - Acceptance: The guide names required config files and explains how an agent should load them.

### Implicit (RI)

- **RI1** - Keep the workflow scoped to the repository.
  - Acceptance: No instructions require secondary repositories or an external control-plane repository.

### Assumptions (A)

- **A1** - The repository can store workflow artifacts under `.workflow/artifacts/`.

### Open Questions (Q)

- **Q1** - Which source-of-truth provider should be updated during Ship?
  - Owner: user
  - Blocking: yes — affects scope of Ship instructions
```

Use a blocker when a `Q` changes scope, ownership, verification, release behavior, source-of-truth updates, or user intent.

## Bad Example

```markdown
## Requirement Manifest

### Explicit (R)

- **R1** - Add a setup guide.

### Assumptions (A)

- **A1** - The source-of-truth provider is GitHub.
- **A2** - No release config is needed.
- **A3** - The repository owner will handle workflow file placement.
```

## Why The Bad Is Bad

- `R1` has no acceptance criteria — Plan, Build, Review, and Test have no shared definition of done. Each phase will interpret it differently and produce evidence that cannot be cross-checked.
- `A1` and `A2` are not safe assumptions — they answer questions about user authority (which provider, whether release config applies). These belong as `Q` IDs with `owner: user` and a blocking flag. Recording them as `A` bypasses the user checkpoint and bakes unverified intent into the approved brief.
- No `RI` IDs means implicit constraints were skipped entirely — scope boundary, path conflicts, generated-output behavior, and verification expectations were not derived. These will appear as surprises during Build or Review when it is expensive to reopen the brief.
- No `Q` IDs means no blocker is set and `orchestration.blockers` remains empty — the brief will be approved with unresolved authority decisions embedded as silent assumptions.
