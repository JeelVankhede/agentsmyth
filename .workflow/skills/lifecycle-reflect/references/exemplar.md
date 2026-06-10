# Exemplar

## Good Example

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

## Bad Example

```markdown
- **Candidate learning**: The process went well and the agent did a good job - propose-only.

| Action | Owner | Suggested Artifact Or Ticket | Status |
|---|---|---|---|
| Improve documentation | TBD | - | open |

## Surprises

- The PR merged without issues.
```

## Why The Bad Is Bad

- "Process went well" is not agent-actionable — it names no behavior to change, no artifact section to update, no constraint to preserve in future runs. A future agent reading this learning gains nothing and cannot apply it.
- "TBD" owner with no suggested artifact means the follow-up will never be claimed. Open follow-ups without owners accumulate across every reflect artifact and become permanent noise. Every follow-up must have a named owner and a concrete artifact or ticket title before Reflect closes.
- "The PR merged without issues" claims an external outcome (PR merge) that is not in the Ship artifact's evidence. This is invented state. A future restore-context invocation will find a reflect artifact that claims a PR merged, but the Ship artifact will show no PR URL and no merge evidence — the chain will be internally inconsistent and unresolvable.
