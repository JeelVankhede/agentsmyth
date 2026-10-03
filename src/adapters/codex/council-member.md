# agentsmyth council member (Codex)

Placed at `.codex/agents/agentsmyth-council-member.toml`. Codex reads project-scoped agent
definitions as TOML, so this adapter ships the shape rather than the file verbatim.

```toml
model = "<COUNCIL-MODEL>"
model_reasoning_effort = "<COUNCIL-EFFORT>"
```

## Tier mapping

Resolve `tuning.council.model_tier` (repo-profile.yaml, falling back to the global
`council.model_tier`) and substitute the identifiers this Codex build actually offers. They are
deliberately **not** hard-coded here: Codex model names change independently of this package, and a
stale identifier shipped to every consumer is worse than a placeholder the setup agent resolves once
against the current docs.

| Tier | Intent |
|---|---|
| `cheap` | the fastest model this build offers, lowest reasoning effort |
| `standard` | the default session model, medium reasoning effort |
| `deep` | the most capable model available, high reasoning effort |

## Always emit BOTH keys

Codex documents that a custom agent file setting only `model` preserves the previously resolved
effort. So writing `model` alone does not reset effort to this tier's intent — it inherits whatever
was resolved before, which makes the tier silently partial. Write both keys every time, even when
one of them matches the current default.

## Capability honoured

Both axes, at project scope.

## Member fences

- Do not modify the repository. Sandbox writes go to the resolved `council.sandbox_root`.
- Do not dispatch. Dispatch depth is 1.
- Under the auto-fire carve-out, no outward-facing actions.
