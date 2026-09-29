# Migration descriptors

One descriptor per governed config file per version step. `agentsmyth upgrade` reads these to know
*what* changed between two versions, rather than only that a file's digest no longer matches.

## Why they live here

Under `src/assets/`, not `src/workflow/`. That is not a filing preference — it is the publish
boundary. `package.json`'s `files` field ships `bin/`, `dist/`, `src/assets/` and `validators/`;
`src/workflow/` is **not** published, it is compiled into `dist/workflow-bundle.md` and expanded
into the global install at `~/.agentsmyth/workflow/`.

So placement follows the reader. The agent reads the global install and could find descriptors
there. The **CLI** reads loose files relative to its own package root — which is exactly how it
already reads the canonical config templates in `src/assets/workflow/config/` — and the CLI is what
applies a migration at upgrade time. Descriptors under `src/workflow/` would be invisible to it.

## Layout

```
src/assets/workflow/migrations/<from>-to-<to>/<config-basename>.yaml
```

For example, a change to `workflow/config/repo-profile.yaml` between 1.1.0 and 1.2.0:

```
src/assets/workflow/migrations/1.1.0-to-1.2.0/repo-profile.yaml
```

A version step with no config shape change has no directory. That is the normal case, and the
upgrade path handles it: with no descriptor, machine-owned scalars are still brought current and
nothing is flagged, because nothing changed shape for a user to reconcile.

## Shape

Validated by `migration.schema.yaml`, which registers itself by `$id` — adding a descriptor needs
no registry edit anywhere.

```yaml
version: 1
kind: migration
from: 1.1.0
to: 1.2.0
target: workflow/config/repo-profile.yaml
description: Council sandbox root moved under tuning: so it merges per-entry like every other knob.
changes:
  - op: rename-key
    key: sandbox_root
    to: council_sandbox_root
  - op: ensure-key
    key: dispatch_enabled
    value: "optional"
    after: mode
```

## The three operations, and why there are only three

Operations are **line-anchored**, not tree-structured. The CLI has no YAML parser and deliberately
does not import the validators' one — `bin/agentsmyth.mjs` shells out to validators as separate
processes precisely so it never inherits their module-level exit guards. So the honest unit of
change is the same one `writeDefinitionsRoot()` already operates on: a key at the start of a line.

- **`ensure-key`** adds a key with a default *only when absent*, and never touches it when present.
  The additive case, and the only one safe to apply without asking anyone.
- **`set-machine-owned`** overwrites a value agentsmyth owns outright — a version stamp, a
  definitions-root pointer. Safe because the user was never the author.
- **`rename-key`** rewrites a key name in place and keeps the user's value. This is the operation
  that earns descriptors their place: without it, a renamed key looks like one key the user deleted
  and another they added, and a merge would either drop their value or resurrect a stale one.

Anything that needs to restructure a document rather than adjust keys within it is out of scope.
Those raise a reconcile item instead, and a human decides — which is the correct outcome, not a
gap: a change that cannot be described mechanically should not be applied mechanically.
