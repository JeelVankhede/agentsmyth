# Implicit Requirements Library

Implicit requirements become `RI` IDs when they materially affect the work.

Common sources:

- repo profile: protected paths, public contracts, generated output, branch policy, ownership
- domain config: terminology, constraints, regulatory/safety expectations, non-goals
- source-of-truth config: source read, update, handoff, stale-source risk
- verification config: commands, manual QA, generated-output checks, skipped-check policy
- release config: PR/CI gates, deployment, publishing, docs release, rollback
- lifecycle rules: artifact chain, architecture notes, blockers, waiver handling
- compatibility: migration, backwards compatibility, public docs promises, user-facing behavior
- security/safety: secrets, destructive actions, permissions, untrusted inputs

Rules:

- Add an `RI` only when it changes acceptance, sequencing, risk, evidence, or handoff.
- Mark not-applicable items in the summary when a likely category was considered and rejected.
- Every `RI` needs acceptance criteria.
- Do not hardcode a specific provider, package manager, or release process unless config or user instruction requires it.
