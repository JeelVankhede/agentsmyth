# agentsmyth council member (Cursor)

Placed at `.cursor/agents/agentsmyth-council-member.md`.

```yaml
---
model: <COUNCIL-MODEL>
---
```

## Tier mapping

Cursor fuses reasoning effort INTO the model identifier rather than exposing a separate field:
options are appended in square brackets as `id=value` pairs, e.g. `<model>[effort=high]`. So this
adapter emits one string carrying both axes, where Claude Code and Codex emit two keys.

Both config keys feed ONE string here, which is the whole peculiarity of this adapter:
`council.model_tier` chooses the identifier and `council.effort` becomes the bracketed option.

| `council.model_tier` | identifier |
|---|---|
| `cheap` | fastest available model |
| `standard` | default model |
| `deep` | most capable available model |

| `council.effort` | bracket |
|---|---|
| `low` | `[effort=low]` |
| `standard` | `[effort=medium]` |
| `high` | `[effort=high]` |
| `very-high` / `max` | the highest effort value this build accepts; record the axis as partially honoured if it offers fewer levels than were asked for |

Composed as `<identifier>[effort=<value>]`. The two axes stay independent in config even though the
host fuses them in its own syntax — fusing them in config too would make a tier imply an effort,
which is exactly the coupling this scale exists to avoid.

Identifiers are resolved by the setup agent against Cursor's current docs rather than hard-coded, for
the same reason as the other adapters: a shipped identifier rots.

## A tier here is a request, not a guarantee

Cursor documents overriding a configured model when a team administrator blocks it, when the plan
does not include it, or when a legacy request-based plan requires a mode the user has not enabled —
in which case subagents run on the platform default regardless of any model configuration. The
council record must therefore carry the tier **requested** separately from the model that actually
ran, and record `unknown` when the host reports nothing. Writing the request into `model_actual`
would be claiming external state without evidence.

## Also reads the Claude and Codex definitions

Cursor reads `.claude/agents/` and `.codex/agents/` for compatibility, so a repo that already has
those may need no Cursor-specific file at all. Prefer not placing a duplicate: two definitions for
one member is a drift surface.

## Member fences

- Do not modify the repository. Sandbox writes go to the resolved `council.sandbox_root`.
- Do not dispatch. Dispatch depth is 1.
- Under the auto-fire carve-out, no outward-facing actions.
