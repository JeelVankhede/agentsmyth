# Constraint ID Convention

`domain.yaml`'s `constraints.{product,safety,provider_neutrality}` arrays are plain strings (no
schema change from the original `domain.schema.yaml` shape) — each string carries its own stable ID
as a bracketed prefix:

```yaml
constraints:
  product:
    - "[product-1] Do not introduce domain-specific behavior unless the user request or repo context requires it."
    - "[product-2] Treat compatibility, source authority, verification, and release impact as implicit requirements when material."
  safety:
    - "[safety-1] Do not expose secrets, credentials, private tokens, API keys, or sensitive local paths in lifecycle artifacts."
```

**Why a bracket prefix instead of restructuring into ID-keyed objects:** every existing consumer
repo's `domain.yaml` has plain-string constraint arrays. Changing the array item type to an object
would break every one of them on the next `agentsmyth check`. A bracket-prefixed string is still a
plain string — zero schema change, fully backward-compatible. A consumer repo that never adds
brackets simply has no machine-checkable constraint IDs; its constraints remain human-readable but
`constraint-conflict-scan` cannot cite them by ID (falls back to quoting the constraint text
directly in a `Q`, still valid, just not structurally verified by `check-constraint-conflicts.mjs`).

**ID format:** `<category>-<n>`, where `<category>` is `product`, `safety`, or
`provider-neutrality` (hyphenated, matching the YAML key with underscores replaced) and `<n>` is a
1-indexed sequence number within that category. IDs are never renumbered once assigned — a removed
constraint leaves a gap, it does not shift subsequent IDs down.

**Extraction:** a citation is valid when the exact bracketed token `[<id>]` appears at the start of
some string in `domain.yaml`'s constraint arrays. `check-constraint-conflicts.mjs` extracts every
`[<id>]` present in `domain.yaml` into a set, then confirms every ID an artifact cites (via
`constraint-conflict-scan`'s output, recorded in a brief's `Open Questions` or Refusal text) is a
member of that set.
