---
title: Uninstall and removal
description: How to fully remove agentsmyth from a repo, including the pre-commit hook and the shared global install.
---

# Uninstall and removal

Nothing agentsmyth writes is hidden, and nothing it writes requires agentsmyth itself to remove. Everything below is a plain file or directory you can delete with your normal tools.

## What `init` wrote to this repo

Everything under `workflow/`, one marked block inside your root `AGENTS.md`, and, for two specific tools, one adapter file:

- `workflow/config/*.yaml` — five files (`domain.yaml`, `repo-profile.yaml`, `source-of-truth.yaml`, `release.yaml`, `verification.yaml`)
- `workflow/artifacts/` — seven empty phase directories, plus whatever lifecycle artifacts you've since written into them
- `workflow/learnings/`
- `AGENTS.md` at the repo root — **not the whole file.** `init` writes one marked block into it and leaves every other byte alone, including an `AGENTS.md` you wrote yourself. It is the only file `init` edits rather than creates, which is why removal gets its own section below.
- Cursor: `.cursor/rules/agentsmyth.mdc`. Non-macOS Copilot: `.github/copilot-instructions.md`. No other tool gets a per-repo adapter file — see [Under the hood](/under-hood) for why.

Delete `workflow/`, the `AGENTS.md` block, and, if present, the adapter file. That's the entire per-repo footprint. There's nothing else to find and nothing hidden in `node_modules` or a cache directory — agentsmyth has no runtime dependency and leaves no daemon or background process.

## Removing the `AGENTS.md` block

`init` writes one version-stamped block into your root `AGENTS.md`, delimited by two marker lines:

```
<!-- agentsmyth:1.1.0 BEGIN -->
...
<!-- agentsmyth:1.1.0 END -->
```

The stamp is the agentsmyth version that wrote the block, so the version in your file is whichever one last ran `init` there.

Delete the lines between the two markers, inclusive, and the file is back to exactly what you had. Everything outside them is yours and was never written by agentsmyth — `init` locates the block by pattern and replaces only what sits between a matched pair, so your own headings, house rules and notes above and below it are untouched by every run. If the block is the entire file, `rm AGENTS.md` is equivalent and just as safe.

## Removing the pre-commit hook

`init` installs a mandatory local git hook, appended between two marker lines:

```
# >>> agentsmyth:mandatory-lifecycle-gate >>>
...
# <<< agentsmyth:mandatory-lifecycle-gate <<<
```

If you had no pre-commit hook before agentsmyth, the whole file is safe to delete: `rm .git/hooks/pre-commit` (or whatever path `git config core.hooksPath` points at, if you'd configured a custom one).

If you already had your own hook, agentsmyth appended its block to the end of it rather than overwriting anything — delete just the lines between the two markers above and your original hook is back exactly as it was.

## Is `~/.agentsmyth/` safe to delete?

Only if no other repo on this machine still links to it. `~/.agentsmyth/workflow/` is a **shared** install — every repo you've run `agentsmyth init` in points at the same global copy via `definitions_root` in its own `repo-profile.yaml`, rather than keeping a local copy of the lifecycle definitions. Deleting it doesn't touch any repo's files directly, but the next `agentsmyth check` in *any* linked repo will fail to resolve a validator until either the global tree is restored or that repo is re-linked.

If agentsmyth is fully uninstalled everywhere, `rm -rf ~/.agentsmyth/` is complete and safe. If you're only removing it from one repo, leave the global install alone.

## What breaks if a repo keeps `workflow/` but the global tree is gone

This is the failure mode worth knowing about *before* it happens, not after: a repo with `definitions_root` set and no repo-local `workflow/validators/`, `workflow/skills/`, or `workflow/router.md` (the normal, intended state for a linked repo) has nowhere left to resolve a validator from if `~/.agentsmyth/workflow/` disappears. Every `agentsmyth check` invocation — including the mandatory pre-commit hook, since it shells out to `agentsmyth check --staged` — starts failing outright, not gracefully degrading. The fix is either restoring `~/.agentsmyth/workflow/` (re-run `agentsmyth prepare`) or accepting that the repo is now effectively broken until you do.
