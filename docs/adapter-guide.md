# Adapter Guide

Adapters are thin instruction shims for agent tools. They must point agents back to `.workflow/` and must not define a separate lifecycle.

## Adapter Rules

- Keep `.workflow/` canonical.
- Tell the tool to read `.workflow/router.md` first.
- Tell the tool to load `.workflow/config/agent-behavior.yaml`.
- Tell the tool to use lifecycle skills and templates for Standard or Complex work.
- Preserve unrelated user changes.
- Require evidence for commands, source updates, PR/CI, release, deployment, and handoff claims.
- Keep provider-specific behavior optional unless config or the user enables it.

## Included Adapters

| Path | Purpose |
|---|---|
| `adapters/claude/CLAUDE.md` | Claude-compatible instruction shim. |
| `adapters/codex/AGENTS.md` | AGENTS-compatible instruction shim. |
| `adapters/copilot/copilot-instructions.md` | Copilot-compatible instruction shim. |
| `adapters/cursor/rules/index.mdc` | Cursor-compatible rule entry. |
| `adapters/windsurf/.windsurfrules` | Windsurf-compatible rule entry. |

## Updating An Adapter

When adding or changing an adapter:

1. Keep the wording short.
2. Reference `.workflow/` instead of duplicating full policies.
3. Include the lifecycle chain.
4. Include the evidence and waiver rules.
5. Avoid provider or command assumptions.
6. Update `docs/adapter-guide.md` if a new adapter path is added.

Adapters should be boring on purpose: they route the tool to the canonical workflow.
