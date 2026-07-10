# Ledger States

Four valid states for a manifest ID in the coverage ledger. Every active `R`/`RI` must be in
exactly one of these at any point in the chain.

- **`covered`** — the requirement is implemented (or, in Think/Plan, concretely planned) and has
  a citation proving it: a changed file, a command output, a review finding, or an artifact
  section.
- **`deferred`** — explicitly pushed out of the current chain to a later phase within the same
  work, or to a follow-up work package. Must name where it is deferred to and an owner.
- **`waived`** — the requirement will not be met in this chain, and a waiver exists (checked via
  `waiver-completeness-check`) covering exactly this ID.
- **`dropped`** — removed from scope entirely. This state is only valid alongside a waiver; a
  `dropped` row with no waiver is a Refusal condition for this skill, not a valid ledger entry.

An ID with no row in the ledger is not a fifth state — it is a gap, and must be reported as one.
