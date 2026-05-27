# Exemplar

A good Plan phase entry is specific without becoming implementation code:

```markdown
### Phase 1 - Update workflow contract docs

- Manifest IDs: R1, RI1
- Touches: `.workflow/skills/lifecycle-think/SKILL.md`, `.workflow/skills/lifecycle-think/references/output-schema.md`
- Why first: These files define the upstream contract consumed by later phases.
- Work: Replace placeholder instructions with the approved generic single-repo contract.
- Exit gate: The Think skill includes role, inputs, stop conditions, workflow, architecture notes, deterministic output, and no domain leakage.
```

A good verification row is evidence-oriented:

```markdown
| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1 | Review changed skill files against Phase 3 contract | Test | No command exists yet; manual evidence required. |
| RI1 | `rg` scan for prohibited domain/control-plane terms | Test | Fails if canonical files contain banned terms. |
```

Do not use vague phase names, empty phases, or verification entries like "test manually" without naming what is inspected.
