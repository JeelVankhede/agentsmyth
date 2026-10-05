# agentsmyth council member (Windsurf / Devin)

Placed at `.devin/agents/agentsmyth-council-member.md`. Note the path: this product is now
documented as Devin, and its subagent profiles live under `.devin/agents/`. The older Cascade
subagents documentation URLs no longer resolve.

```yaml
---
name: agentsmyth-council-member
description: A read-only agentsmyth council member. Dispatched by the Think or Review council skill.
model: <COUNCIL-MODEL>
---
```

## Capability honoured: one axis, because only one exists

This host has **no reasoning-effort field at all** in a subagent profile. The documented frontmatter
is `name`, `description`, `model`, `allowed-tools` and `max-nesting`. Effort is a property of the
model identifier itself — the model family ships in distinct reasoning-effort variants — so on this
adapter the tier's two axes collapse into a single model choice.

That is a real reduction and is recorded as one. Do not emit a separate effort key here and do not
report the effort axis as honoured; record it as `unavailable`.

## Tier mapping

This is the one adapter where the two config keys genuinely cannot stay independent, because the
host offers no separate control: effort is a property of the model identifier itself.

| `council.model_tier` + `council.effort` | identifier |
|---|---|
| combined | the model-family variant whose reasoning-effort level is closest to the requested `effort`, at the capability implied by `model_tier` |

Record the effort axis as `unavailable` rather than honoured. The request was expressed in two
dimensions and satisfied in one, and saying otherwise would overstate what this host accepts.

Identifiers resolved by the setup agent against the current docs rather than hard-coded.

## A tier here is a request, not a guarantee

Administrators can govern which model subagents use — and whether subagents run at all — through a
default-subagent-model setting. So as with Cursor, the council record carries the requested tier
separately from what actually ran, and records `unknown` when the host reports nothing.

## Member fences

- Do not modify the repository. Sandbox writes go to the resolved `council.sandbox_root`.
- Do not dispatch. Dispatch depth is 1. This host also exposes `max-nesting`; leave it at the
  default rather than raising it, since a member that can dispatch breaks the depth-1 guarantee.
- Under the auto-fire carve-out, no outward-facing actions.
