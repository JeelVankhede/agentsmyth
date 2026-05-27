# Question Policy

Ask fewer, better questions.

Before asking, inspect the available request, config, source-of-truth, existing artifacts, and target repo context. A question is valid when the answer materially affects:

- scope, non-goals, or acceptance criteria
- source-of-truth selection or update behavior
- domain policy, terminology, or constraints
- release, rollout, handoff, or rollback expectations
- verification commands, evidence, or waiver
- protected paths, public contracts, generated output, compatibility, or safety
- whether the user accepts a lifecycle gate waiver

Question rules:

- Assign every open question a stable `Q` ID.
- Copy blocking `Q` IDs into `orchestration.blockers`.
- Include owner and blocked phase when known.
- Do not ask preference questions that do not affect the lifecycle outcome.
- Do not proceed past Think when a blocking `Q` remains unresolved unless the user records a waiver.
