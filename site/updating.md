---
title: Updating
description: What does and doesn't happen automatically when agentsmyth ships a new version.
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

The value a repo's `repo-profile.yaml` records — `definitions_root: ~/.agentsmyth/workflow` — is the same portable path regardless of which version wrote it or which version is currently installed. That pointer never needs editing across an upgrade.

Other things in your repo may. See below.

## Bringing a repo itself current

```bash
agentsmyth upgrade
```

`prepare` refreshes the shared global tree. It writes nothing inside your repository — that is the whole point of the split. So the files agentsmyth scaffolded into your repo at `init` (the five `workflow/config/*.yaml`, the pre-commit hook, the tool adapters) stay exactly as they were written, however many releases ago that was.

`upgrade` is what brings those current. It runs `prepare` first — unconditionally, because reading a new config shape against an old definitions tree is the exact skew this is meant to fix — then, for each file it scaffolded:

- **Unchanged since agentsmyth wrote it** — brought current silently. Nothing to ask you about.
- **Edited by you** — your version is copied to `workflow/backups/` first, the parts agentsmyth owns are brought current in place, and a single item is added to `workflow/config/pending-setup.yaml` naming the backup. Your agent will offer to merge it at the start of your next session. Nothing prompts you in the terminal, so this works the same in CI as it does locally.
- **Deleted by you** — left deleted. A deliberate removal is not undone.

It knows which is which because `init` records a digest of every file it writes, in `workflow/provenance.yaml`. Commit that file: without it there is no record of what agentsmyth wrote, and every file reads as edited.

If you're upgrading a repo set up before this existed, there's no manifest to read. `upgrade` handles that case explicitly — it adopts your current files as the baseline, backs nothing up, and flags nothing, because with no record of what agentsmyth last wrote, your files are the only truth available. The upgrade after that one will be a real delta.

## The version-skew warning

`agentsmyth check` compares this repo's stamped `agentsmyth_version` against the installed CLI's version and warns on mismatch. Running `prepare` does not clear it — `prepare` refreshes the global tree and does not rewrite any repo's own `repo-profile.yaml`.

`agentsmyth upgrade` clears it, because bringing the repo current is exactly what it does.
