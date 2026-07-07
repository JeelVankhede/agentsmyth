# Assumption Policy

An assumption is acceptable only when it is explicit, low risk, and reversible.

Use `A` IDs for assumptions such as:

- naming a draft slug before user approval
- treating an unspecified wording change as documentation-only when repo context confirms it
- using configured default artifact paths
- preserving existing branch policy from repo config

Use `Q` IDs instead of assumptions when the answer could change:

- user intent, non-goals, or acceptance criteria
- source-of-truth authority or update target
- release, deployment, publishing, or rollback behavior
- verification commands or required evidence
- protected paths, public contracts, generated output, or compatibility obligations
- whether work should proceed despite a failed gate

Every assumption must be visible in the manifest and, when important to later phases, repeated in architecture notes.
