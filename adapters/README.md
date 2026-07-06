# Adapters

Adapters are optional tool-specific instruction files. They should be copied or linked only when the corresponding tool needs a local instruction entrypoint.

## Rule

Adapters route agents to `workflow/`; they do not define independent workflow behavior.

## Included Paths

| Adapter | Path |
|---|---|
| Claude | `adapters/claude/CLAUDE.md` |
| AGENTS-compatible | `adapters/codex/AGENTS.md` |
| Copilot | `adapters/copilot/copilot-instructions.md` |
| Cursor | `adapters/cursor/rules/index.mdc` |
| Windsurf | `adapters/windsurf/.windsurfrules` |

All five adapters must carry identical mandatory-gate content. Change one, change all. See `setup/SKILL.md` §5a.1 for placement rules.
