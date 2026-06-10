# Exemplar

## Good Example

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

## Bad Example

```markdown
## Manifest Coverage

| Manifest ID | How Verified | Evidence | Result | Notes |
|---|---|---|---|---|
| R1 | manual | looks good | pass | - |
| RI2 | command | `git diff --check` | pass | - |

## Skipped Checks

none
```

## Why The Bad Is Bad

- "Looks good" is an opinion, not evidence — it names no file, no output, no inspection path. It cannot be reproduced by a future restore-context invocation or audited by Ship.
- `pass` for `RI2` via `git diff --check` without confirmation the command ran is an invented result — if the command was recalled from memory or assumed from context, the result is fabricated. Pass claims must include actual output excerpt or a reproduction path.
- "none" in Skipped Checks when checks were skipped hides risk from Ship's waiver decisions. Every check that did not run must appear in the table with a reason, a risk level, and an owner. "none" transfers unrecorded risk to Ship where it cannot be waived because it was never named.
