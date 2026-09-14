# Adapters

Adapters are optional tool-specific instruction files. They should be copied or linked only when the corresponding tool needs a local instruction entrypoint.

## Rule

Adapters route agents to `workflow/`; they do not define independent workflow behavior.

## Included Paths

| Adapter | Path | Placed where |
|---|---|---|
| Claude | `adapters/claude/CLAUDE.md` | `.claude/CLAUDE.md` |
| AGENTS-compatible | `adapters/codex/AGENTS.md` | **nowhere — bundle-only, see below** |
| Copilot | `adapters/copilot/copilot-instructions.md` | `.github/copilot-instructions.md` |
| Cursor | `adapters/cursor/rules/index.mdc` | `.cursor/rules/agentsmyth.mdc` |
| Windsurf | `adapters/windsurf/.windsurfrules` | `.windsurfrules` (root) |

## The AGENTS-compatible shim is bundle-only

`adapters/codex/AGENTS.md` ships in the bundle and is held to the same gate content as the other four, but **no step places it**. `agentsmyth init` owns the repository's root `AGENTS.md` directly: it writes one marked block there, rendered from `src/assets/AGENTS.md`, and Codex — along with every other tool that has no first-class adapter — reads that block natively. `setup/SKILL.md` §5a.1 accordingly lists Codex as "none — nothing to place".

Do not add a placement for this file. Doing so would put two writers on the same path — the duplication that moving the root block into `init` was meant to remove. If the root block needs to change, change `src/assets/AGENTS.md`.

All five adapters must carry identical mandatory-gate content — the bundle-only one included, since `scripts/render-adapters.mjs` checks it alongside the other four and a shim allowed to drift is worse than one that was deleted. Change one, change all. See `setup/SKILL.md` §5a.1 for placement rules.
