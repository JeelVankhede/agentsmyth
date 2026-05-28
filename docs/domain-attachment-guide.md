# Domain Attachment Guide

Use this guide to attach domain-specific knowledge without changing the generic lifecycle.

## Where Domain Knowledge Lives

Put durable domain policy in `.workflow/config/domain.yaml`:

- domain name and summary
- glossary
- preferred and discouraged terms
- product constraints
- safety constraints
- provider-neutrality constraints
- implicit requirement sources

Use docs only when humans need explanation. Use config when agents must apply a rule.

## What To Add

Add domain details when they affect:

- requirement acceptance
- planning sequence
- implementation constraints
- review risk
- verification evidence
- release or rollback handling
- source-of-truth handoff
- user-facing terminology

## What Not To Add

Do not add:

- reference-project names or legacy product language
- provider requirements that are not real for the target repository
- hardcoded commands that belong in verification config
- release rules that belong in release config
- personal preference that does not affect acceptance or risk

## Implicit Requirements

Domain constraints can create `RI` IDs when they materially affect the work.

Examples:

- A compatibility rule requires a migration-safe rollout.
- A term must remain consistent in user-facing docs.
- A safety constraint requires extra review or manual QA.
- A source authority must be read before changing derived content.

If a domain rule does not affect acceptance, evidence, risk, or handoff, do not turn it into an `RI`.

## Review Checklist

- Domain rules are in config, not hidden in chat.
- Terms are generic unless the target repository requires them.
- Safety constraints are actionable.
- Source, release, and verification rules remain in their own config files.
- Unknown domain facts become questions or blockers.
