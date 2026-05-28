# Exemplar

A good verification row is evidence-driven:

```markdown
## Manifest Coverage

| Manifest ID | How Verified | Evidence | Result | Notes |
|---|---|---|---|---|
| R1 | command | `git diff --check` | pass | No whitespace errors in changed files. |
| RI2 | generated-output inspection | `.workflow/templates/verify/template.md` not changed | skip | Not in Phase 3C scope; no generated output configured yet. |
```

A good skipped-check row names risk and owner:

```markdown
## Skipped Checks

| Check | Why Skipped | Risk | Owner | Blocks Ship |
|---|---|---|---|---|
| `node .workflow/validators/check-lifecycle.mjs` | Validator is still a placeholder until Phase 7. | Contract drift may not be machine-checked. | Phase 7 | no |
```

Avoid:

- "looks good" as evidence
- pass results for commands that did not run
- empty manual QA or generated-output sections
