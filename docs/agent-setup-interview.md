# Agent Setup Interview

Use these questions to configure a target repository before relying on the lifecycle. Record unknown answers in config comments, a setup artifact, or a follow-up task.

## Repository

- What is the default branch?
- Which branch naming convention should agents use?
- Which paths are protected, generated, or owned by specific people?
- Which files define public contracts, schemas, APIs, user-facing docs, or release behavior?
- Which package managers, build tools, or test runners are actually present?

## Domain

- What domain terminology must be preserved?
- Which terms are discouraged or ambiguous?
- Are there safety, privacy, compliance, compatibility, or migration constraints?
- Which assumptions should agents never make without user confirmation?

## Source Authority

- Is there an external source of truth for requirements, docs, release notes, or tasks?
- What provider or source type is used?
- Can agents read it directly?
- Can agents update it directly, or must they write handoff text?
- Which fields or sections are authoritative?
- Does stale source state block Ship?

## Verification

- Which commands are required before Ship?
- Which commands are useful but optional?
- Which manual QA scenarios are expected?
- Which generated outputs must be regenerated or inspected?
- What should happen when network, dependency, sandbox, or tool access blocks a check?

## Release

- Is a PR required?
- Is CI required, and which checks matter?
- Is deployment, publishing, package output, or docs release in scope?
- Who owns release approval?
- What rollback action is realistic?
- Which gates can be waived, and who can approve the waiver?

## Agent Behavior

- Should agents create branches automatically?
- Should agents commit local changes or stop after edits?
- Are external writes allowed only after user approval?
- How many parallel workstreams are acceptable?
- Which evidence must appear in final responses?

## Completion Criteria

Setup is ready when:

- `.workflow/config/*.yaml` reflects the answers above.
- Unknowns that affect work are represented as blockers.
- Provider-specific behavior is enabled only where real.
- Verification and release gates have concrete evidence expectations.
