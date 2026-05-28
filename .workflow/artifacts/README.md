# Artifacts

Lifecycle artifacts are written here during real work.

## Directories

```text
briefs/
plans/
tasks/
reviews/
verify/
ship/
reflect/
```

Use filenames in this shape:

```text
<slug>-v<N>.md
```

Example:

```text
.workflow/artifacts/plans/add-search-v1.md
```

## Rules

- Copy from `.workflow/templates/<kind>/template.md`.
- Preserve `slug` and `version` across the chain.
- Keep `manifest_ids` aligned with active `R` and `RI` IDs.
- Link upstream artifacts in frontmatter.
- Mirror unresolved blockers in `orchestration.blockers`.
- Cite exact evidence for commands, source updates, releases, and handoffs.

Artifacts may be absent in a fresh repository. Missing artifacts are state evidence for restore-context, not a problem by themselves.
