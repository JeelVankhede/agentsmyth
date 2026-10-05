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

Two independent substitutions. `council.model_tier` decides the model; `council.effort` decides the
reasoning effort. They are not folded together — a tier does not imply an effort.

| `council.model_tier` | `model` intent |
|---|---|
| `cheap` | the fastest model this build offers |
| `standard` | the default session model |
| `deep` | the most capable model available |

| `council.effort` | `model_reasoning_effort` |
|---|---|
| `low` / `standard` / `high` | map to this build's corresponding reasoning-effort values |
| `very-high` / `max` | map to the highest values this build offers; if it has fewer than five, map down and record the axis as partially honoured rather than claiming the level requested |

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
