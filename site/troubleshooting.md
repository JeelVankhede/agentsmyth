---
title: Troubleshooting
description: "Fixes for common agentsmyth problems: a stuck validator, an unresponsive agent, a rejected commit, version skew."
---

# Troubleshooting

Four situations that come up in practice, and what's actually happening in each.

## A validator fails and won't clear

`check-setup-complete` and `check-config` refuse waivers by design — see [Validators](/validators). There's no bypass flag and no way to mark an item resolved without actually resolving it. Read the exact error text; it names the specific field or file that's wrong, not just "setup incomplete." Fix the root cause it names and re-run. If a value is genuinely unknown rather than wrong, leave it as `<USER-TODO>` — that's a warning, not a failure, and setup will still finish around it.

## The agent doesn't pick up `.agentsmyth/setup-bundle.md`

After `init`, the CLI prints: `Next step: open your AI agent and say: "run the agentsmyth setup"`. That freeform phrase relies on the agent's own judgment to notice `.agentsmyth/` sitting in the repo root — it doesn't always land. Every supported tool also gets an explicit, typed command from `agentsmyth prepare`: `/agentsmyth` in Claude Code, Cursor, Windsurf, and Copilot (VS Code), or `/prompts:agentsmyth` in Codex. Type it instead of the freeform sentence — it's a fixed command the tool resolves directly, not natural language the agent has to interpret and choose to act on. If neither works, point the agent at the file directly: "read `.agentsmyth/setup-bundle.md` and follow it."

## The hook is rejecting a legitimate commit

The mandatory pre-commit hook checks that staged files are covered by a real lifecycle task artifact, and that any staged lifecycle artifact's entering phase gate is actually satisfied. If it's rejecting something you're confident is fine — a genuinely out-of-band commit, an emergency fix, anything the lifecycle gate wasn't built to anticipate — the only bypass is `git commit --no-verify`. There's no config flag or waiver file; that's deliberate, so a bypass is always visible in the commit itself rather than silently configured away.

## Version skew between `~/.agentsmyth/` and the installed package

`agentsmyth check` compares the `agentsmyth_version` stamped in this repo's `repo-profile.yaml` against the currently installed CLI's own version, and warns if they differ. This is purely informational — it does not block `check`, and it does not mean anything is currently broken. It means the global definitions tree at `~/.agentsmyth/workflow/` may be older than what the CLI itself ships. Run `agentsmyth prepare` to refresh it. See [Updating](/updating) for the full picture of what does and doesn't happen automatically across a version bump.
