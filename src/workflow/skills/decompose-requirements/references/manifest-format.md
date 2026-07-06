# Manifest Format

Use this exact section shape inside brief artifacts:

```markdown
## Requirement Manifest

### Explicit (R)

- **R1** - <one-line requirement>
  - Acceptance: <observable proof>

### Implicit (RI)

- **RI1** - <context-derived requirement>
  - Acceptance: <observable proof>

### Assumptions (A)

- **A1** - <assumption>

### Open Questions (Q)

- **Q1** - <question> - owner: <owner>
```

Rules:

- `R` and `RI` entries require acceptance bullets.
- `A` entries do not require acceptance bullets.
- `Q` entries require owner when known.
- Keep IDs sequential inside each class.
- Append new IDs after the highest existing ID.
- Do not create a separate manifest file.
