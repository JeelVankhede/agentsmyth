# Exemplar

A good learning candidate is durable and agent-actionable:

```markdown
- **Candidate learning**: When a release gate is configured but unavailable, Ship should record copy-ready blocked handoff instead of calling the requirement shipped - source: `.workflow/artifacts/ship/example-v1.md` - propose-only.
```

A good follow-up is owned and actionable:

```markdown
| Action | Owner | Suggested Artifact Or Ticket | Status |
|---|---|---|---|
| Add a validator for ship artifact recommendations. | workflow owner | `phase-7-validators` task | open |
```

A good surprise includes evidence:

```markdown
## Surprises

- Release config did not define PR requirements, so Ship correctly marked PR readiness as not applicable instead of inventing a provider-specific gate.
```

Avoid vague entries such as "process was good" or "write better docs" without evidence and next action.
