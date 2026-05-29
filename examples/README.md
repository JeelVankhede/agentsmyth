# Examples

These examples show how to attach `agentsmyth` to different repository shapes without importing a real product domain.

## Included Examples

| Example | Purpose |
|---|---|
| `minimal-markdown-source/` | Uses a local Markdown file as the source of truth and shows brief/plan artifacts. |
| `node-package/` | Shows example-specific Node package verification config and a verify artifact. |
| `product-app/` | Shows a complete sanitized lifecycle chain from brief through reflect. |

## Rules

- Examples are illustrative, not canonical workflow behavior.
- Providers, commands, package managers, release gates, and source updates are example-specific.
- Do not copy example commands into a target repository unless that repository actually supports them.
- Use `.workflow/config/*.yaml` in the target repository to make any example behavior real.

## Validate

Run:

```text
node scripts/validate-example.mjs
```

The validator checks example placeholders, reference leakage, example config snippets, and example artifact shape.
