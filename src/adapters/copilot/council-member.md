# agentsmyth council member (GitHub Copilot)

Placed at `.github/agents/agentsmyth-council-member.md`.

```yaml
---
name: agentsmyth-council-member
description: A read-only agentsmyth council member. Dispatched by the Think or Review council skill.
model: <COUNCIL-MODEL>
---
```

## Capability honoured: the model axis only, in this file

This is the adapter where the tier's two axes land in two different places, and the limitation is
stated rather than papered over.

- **`model`** is a per-agent field in the agent definition above. The tier's capability half is
  expressible here.
- **Reasoning effort is not.** The file-based agent format has no effort field. Per-agent effort
  exists only in repository settings, under `subagents.agents` keyed by agent name, and a
  session-wide `effortLevel` exists at repository scope.

Two consequences the setup agent must weigh rather than guess at:

1. Setting the session-wide `effortLevel` to serve a council would change the effort for the user's
   **whole session**, not just council members. That is a side effect on work the user did not ask
   this package to touch, so it is not done by default. The per-agent `subagents.agents` entry is the
   correct surface when effort matters, and it lives outside this file.
2. Copilot documents that `model` and `effortLevel` overrides apply **only when the working directory
   is trusted**. In an untrusted directory the lever is silently inert, which is another reason the
   council record carries the requested tier separately from what actually ran.

Record the effort axis as `unavailable` for this adapter unless the repository-settings entry was
actually written. An unreported effort is not a satisfied one.

## Tier mapping

| `council.model_tier` | `model` intent |
|---|---|
| `cheap` | fastest available model |
| `standard` | default model |
| `deep` | most capable available model |

`council.effort` has **no destination in this file.** It maps only to the repository-settings surface
described above, and only if that surface is deliberately written. Where it is not, record the effort
axis as `unavailable` — not as satisfied by the tier, which would be reporting a capability this
format does not have.

Identifiers resolved by the setup agent against Copilot's current docs, not hard-coded here.

## Member fences

- Do not modify the repository. Sandbox writes go to the resolved `council.sandbox_root`.
- Do not dispatch. Dispatch depth is 1.
- Under the auto-fire carve-out, no outward-facing actions.
