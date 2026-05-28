# Validators

Validator scripts provide lightweight contract checks using plain Node.js and repository-local files.

Run from the repository root:

```text
node .workflow/validators/check-config.mjs
node .workflow/validators/check-template-contracts.mjs
node .workflow/validators/check-lifecycle.mjs
node .workflow/validators/check-artifacts.mjs
node .workflow/validators/check-domain-placeholders.mjs
```

## Checks

- `check-config.mjs` checks config files against their matching schema contracts.
- `check-template-contracts.mjs` checks template frontmatter, sections, and placeholder removal.
- `check-lifecycle.mjs` checks lifecycle chain consistency across config, templates, and frontmatter schema enums.
- `check-artifacts.mjs` checks any real artifacts under `.workflow/artifacts/`.
- `check-domain-placeholders.mjs` scans tracked active files for placeholder markers and reference-specific leakage.

These validators are conservative contract checks. They do not replace code tests, manual QA, source-of-truth verification, release evidence, or human review.
