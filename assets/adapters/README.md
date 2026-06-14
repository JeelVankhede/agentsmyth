# Adapters

Adapters are optional tool-specific instruction files. They should be copied or linked only when the corresponding tool needs a local instruction entrypoint.

## Rule

Adapters route agents to `.workflow/`; they do not define independent workflow behavior.

## Included Paths

| Adapter | Path |
|---|---|
| Claude | `adapters/claude/CLAUDE.md` |
| AGENTS-compatible | `adapters/codex/AGENTS.md` |
| Copilot | `adapters/copilot/copilot-instructions.md` |
| Cursor | `adapters/cursor/rules/index.mdc` |
| Windsurf | `adapters/windsurf/.windsurfrules` |

See `docs/adapter-guide.md` before adding or changing adapters.
