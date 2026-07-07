# Assumptions And Questions

Use `A` IDs for safe assumptions and `Q` IDs for material open decisions.

Assumptions are safe when:

- they are reversible
- they do not change scope or acceptance
- they follow config defaults
- they do not affect release/source/verification safety

Questions are required when the answer affects:

- scope, non-goals, or acceptance
- source-of-truth authority or update target
- domain policy
- release, rollback, PR/CI, deployment, or publishing
- verification commands, generated output, or manual QA
- protected paths or public contracts
- user approval for a waiver

Rules:

- Every unresolved `Q` needs an owner when known.
- Blocking `Q` IDs must appear in `orchestration.blockers`.
- Assumptions that later phases must preserve should also be named in architecture notes.
- Do not convert high-impact unknowns into assumptions.
