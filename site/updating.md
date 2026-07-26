---
title: Updating
---

# Updating

agentsmyth's most distinctive design choice — a shared global install every repo links to, instead of a local copy per repo — gets exactly one sentence most places on this site. Here's the full picture of what a version bump actually does.

## A new npm version does not refresh `~/.agentsmyth/` automatically

`agentsmyth prepare` only auto-runs on its own when `~/.agentsmyth/workflow/` doesn't exist at all — the very first time you `init` a repo on a given machine. On every subsequent `init` or `check`, if the global tree is already there, agentsmyth assumes it's fine and leaves it alone, even if the installed CLI has since moved to a newer version. Bumping the npm package version does not, by itself, touch anything under `~/.agentsmyth/`.

## Refreshing it is one manual command

```bash
agentsmyth prepare
```

This overwrites the entire global tree — the router, lifecycle, all skills, all validators — with whatever the currently installed CLI ships, and refreshes the global gate file in every supported tool's config. It's always safe to re-run: every file it writes is fully replaced, not merged, so there's no stale content left behind from an older version.

## `definitions_root` doesn't need to change

The value a repo's `repo-profile.yaml` records — `definitions_root: ~/.agentsmyth/workflow` — is the same portable path regardless of which version wrote it or which version is currently installed. Nothing in your repo needs editing across an upgrade. Only the shared global tree itself needs refreshing, and only `agentsmyth prepare` does that.

## The version-skew warning is informational only

`agentsmyth check` compares this repo's stamped `agentsmyth_version` against the installed CLI's version and warns on mismatch — but that warning doesn't self-clear just by running `prepare`. `prepare` refreshes the global tree; it does not rewrite any repo's own `repo-profile.yaml`. The warning will keep appearing until either the repo is re-`init`'d or the stamp is manually updated — it's a nudge to check whether your global definitions are current, not a sign that something is broken or blocked.
