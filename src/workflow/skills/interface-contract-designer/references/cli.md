# CLI

## Principles

- **Flags and positional args are a public contract, same as an HTTP endpoint.** Renaming a flag,
  changing a positional argument's meaning, or changing the default value of an existing flag
  breaks every script and CI pipeline invoking it — treat these exactly as breaking API changes.
- **Exit codes carry meaning.** `0` for success, non-zero for failure, and ideally distinct
  non-zero codes for distinct failure classes (usage error vs. runtime error vs. partial success) —
  a script chaining commands relies on this, not just on stderr text.
- **Output format is part of the contract when the command is meant to be scripted.** A
  human-readable default is fine, but a command intended for scripting needs a stable
  machine-readable mode (`--json`, `--porcelain`) whose shape doesn't change between patch releases.
- **Subcommand structure should mirror the resource/action model consistently**, the same
  discipline as REST's "resources not actions" — `tool resource verb` (`tool user create`) is more
  extensible than a flat, growing list of top-level commands.

## Common Pitfalls

- Changing a flag's default value in a patch release — silently changes behavior for every existing
  script that relied on the old default without passing the flag explicitly.
- Writing progress/status output to stdout instead of stderr — corrupts piped output for any script
  doing `tool cmd | jq .` or similar.
- No `--version` or no stable way to detect the tool's version programmatically, making it
  impossible for a script to guard against a breaking upgrade.
- Interactive prompts with no non-interactive escape hatch (`--yes`, `--no-input`) — breaks any
  automated/CI invocation.

## Backward Compatibility

- New optional flags are always safe to add. Renaming, removing, or changing a flag's default,
  meaning, or required-ness is a breaking change — needs a deprecation cycle (old flag still works,
  emits a warning, removed in a documented later version) rather than an in-place swap.

## Checklist

- [ ] No existing flag's name, default value, or meaning changes without a deprecation cycle.
- [ ] Exit codes distinguish success from at least "usage error" and "runtime failure."
- [ ] Machine-readable output (if offered) goes to stdout; human progress/logging goes to stderr.
- [ ] Any interactive step has a non-interactive flag for CI/scripted use.
- [ ] Subcommand naming follows the existing resource/verb convention already used elsewhere in this CLI.
