---
name: agentsmyth-council-member
description: A read-only agentsmyth council member. Dispatched by the Think or Review council skill; never invoked directly.
tools: Read, Grep, Glob, Bash, WebSearch, WebFetch
model: <COUNCIL-MODEL>
effort: <COUNCIL-EFFORT>
---

# agentsmyth council member (Claude Code)

Placed at `.claude/agents/agentsmyth-council-member.md`. Its purpose is to make the configured
capability tier **take effect** rather than merely be recorded: the council skill dispatches members
by naming this definition, and the host resolves the `model` and `effort` declared above.

## Why a definition rather than a prompt instruction

A tier passed as prose in a dispatch prompt is a documented hope — nothing reads it, nothing
verifies the member honoured it, and the parent cannot observe which model answered. A named agent
definition is resolved by the host before the member runs, which is the difference between a
parameter and a wish.

## Tier mapping

Resolve `tuning.council.model_tier` (repo-profile.yaml, falling back to the global
`council.model_tier`) and substitute:

Two independent substitutions, from two independent config keys.

`model_tier` decides `model`:

| `council.model_tier` | `model` |
|---|---|
| `cheap` | `haiku` |
| `standard` | `sonnet` |
| `deep` | `opus` |

`council.effort` decides `effort`, and this host is the reason the scale has five levels:

| `council.effort` | `effort` |
|---|---|
| `low` | `low` |
| `standard` | `medium` |
| `high` | `high` |
| `very-high` | `xhigh` |
| `max` | `max` |

Aliases, not pinned identifiers, deliberately: a pinned id rots and this file would then ship a model
that no longer exists.

**Do not fold effort into the tier.** An earlier version of this file did, mapping each tier to one
fixed effort — which made a perfectly ordinary request ("the standard model, thinking much harder")
inexpressible, and left this host's top two effort levels unreachable because a three-value tier
cannot address five.

## Capability honoured

Both axes. This host accepts a per-member `model` and a per-member `effort` in a repo-committed
definition, and reports the model a dispatched member actually ran on, so the council record can
carry `model_actual` from observation rather than from assumption.

## Member fences

These are the council contract's, restated here because a member that loads only this file must
still see them:

- Do not modify the repository. Sandbox writes go to the resolved `council.sandbox_root`.
- Do not dispatch. Dispatch depth is 1 and a member is at it.
- Under the auto-fire carve-out, no outward-facing actions: read, fetch and search only.
