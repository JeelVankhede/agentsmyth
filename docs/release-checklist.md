# Release checklist

The release itself is a `workflow_dispatch` on `.github/workflows/release.yml` with a `bump` input
of `patch` / `minor` / `major`. This file is the part the workflow cannot do for you.

Read the whole list before dispatching. Several entries exist because doing the obvious thing
instead was wrong at least once.

---

## Do not pre-bump the version

`release.yml` runs `npm version <bump> --no-git-tag-version` as one of its own steps, then commits,
tags, publishes, and pushes to `main`. **The version in `package.json` must be the version you are
releasing FROM, not the one you are releasing.**

Editing `package.json` to the target version before dispatching double-bumps: a repo already at
`1.1.0` dispatched with `bump: minor` publishes **1.2.0** and tags it, and the version you meant to
ship never exists. Leave `package.json` alone and let the workflow do it.

The same applies to `CHANGELOG.md`, but in the opposite direction: the workflow does **not** write
it, so the entry for the version being released has to be committed *before* the dispatch.

## Before dispatching

- [ ] Every work package targeted at this version is merged into the release branch, and no PR
      against it is still open.
- [ ] `CHANGELOG.md` has an entry for the version about to be released, with a real date.
- [ ] `workflow/artifacts/open-items.yaml` has been triaged against the release: anything whose own
      wording gates this version is either resolved or explicitly accepted. The ledger is two files —
      triage the live one, but check `workflow/artifacts/open-items-archive.yaml` too before concluding
      an `OI-N` cited in a PR or a Notion page no longer exists; closed items move there, they are not
      deleted.
- [ ] `npm audit` re-run and its position re-derived, not copied forward. A waiver written for an
      earlier release describes the dependency tree of that release. Check both `--omit=dev` (what
      consumers actually get) and the full tree, and check `fixAvailable` — "no fix upstream" stops
      being true without anything announcing it.
- [ ] The upgrade path rehearsed against the **previously published tarball**, not a repo edited
      backwards into the old shape. `npm pack @jeelvankhede/agentsmyth@<previous>` into a scratch
      `HOME`, bootstrap a consumer repo with it, install the candidate over the top, and confirm:
      version skew is detected, any new pending-setup item families append without corrupting the
      file, the configs still parse, `prepare` refreshes the global tree, and `check` exits 0 once
      setup is completed.
      Then rehearse `agentsmyth upgrade` on that same repo, which is the only place the delta path
      meets a genuinely older published tarball rather than a synthesised manifest state. Confirm:
      a repo carrying no `workflow/provenance.yaml` adopts its current files as the baseline instead
      of reporting every file as edited; a file you edit by hand before upgrading is copied to
      `workflow/backups/` byte-identically and raises exactly one reconcile item naming that path;
      the pre-commit hook's marked block is refreshed while anything outside it survives; and a
      second `upgrade` immediately afterwards reports nothing edited.
      Then rehearse the sequence that neither this step nor the automated suite used to reach:
      **edit the same file a second time and upgrade again WITHOUT resolving the first reconcile
      item.** Confirm the `backup_path` the still-open item names continues to resolve. Both
      deletion triggers this design names — superseded on upgrade, deleted when the item resolves —
      fire on that file, and when they collided the user's original edit was destroyed while the
      item still pointed at it. A single drift-and-upgrade cycle cannot see it, which is why it
      shipped.
      Finally, run `agentsmyth upgrade --dry-run` against a dirty tree and confirm it writes nothing
      and takes no backup.
- [ ] The release branch is merged into `main`, or you have accepted that `release.yml` will push
      the dispatched ref to `main` itself (`git push origin HEAD:main` is one of its steps).

## Manual verification the automated suites cannot do

> A readable, tickable version of this section is published at
> <https://claude.ai/code/artifact/79171083-58f4-49a8-bf9a-b964a8fd05b8>.
> **This file is canonical.** The page restates this section only — not the upgrade-path rehearsal
> above or the deprecation windows below — and it carries counts that were current at WP-R25's Test
> phase. Edit here; republish there.

Seventeen suites and a mutation ratchet run in CI. They cover everything that can be checked from
inside this repository — which is not the same as everything that matters. The entries below are the
ones no suite here can settle, each with the reason it cannot.

Run them against a **packed tarball** (`npm run pack:local`), not the working tree. Half the point is
to exercise what a consumer receives.

### The capability tier must take effect, not merely be recorded

This is the claim the council feature rests on: a tier is "a parameter rather than a wish". Two
validators now enforce that the member definition exists and that the record names it — and neither
can observe whether the **host** honoured it. That is outside this repository by construction.

- [ ] In a repo with a resolved `tuning.council.model_tier`, start work that classifies Complex so a
      council fires, and confirm the dispatched member actually ran on the mapped model and effort.
      For Claude Code with `standard` / `very-high` that is Sonnet at `xhigh`, per the mapping table
      in `src/adapters/claude/council-member.md`.
- [ ] Confirm the council record's `model_actual` reflects what the host reported, not what was
      requested. A tier is a REQUEST — some hosts substitute by plan or admin policy, and the whole
      reason the record carries both fields is that the two can differ.

If the host silently ignores the definition, every mechanical check still passes and the feature is
decorative. There is no way to learn that from here.

### The other four tools

- [ ] Run a council member on at least one non-Claude host before claiming five-tool support.
      `prepare` installs all five templates and `check-setup-complete` requires one to be rendered;
      nothing has ever executed a member on Codex, Copilot, Cursor or Windsurf.
- [ ] Confirm the two hosts whose templates declare `effort: unavailable` genuinely have no
      per-member effort control. That claim came from reading their docs, and a doc can be stale or
      the product can gain the control without this package noticing.

### Windows

- [ ] Run `prepare`, `init`, `upgrade` and a `git commit` on Windows.

`isSafeRelPath` rejects `\`-separated traversal and is unit-tested under `node:path/win32`
semantics, which observes the predicate's behaviour but not the end-to-end filesystem consequence.
The payload path is `workflow/provenance.yaml`, a committed file, so the traversal is reachable
through an ordinary pull request — the inference is load-bearing and still an inference.

### A real generator-managed hooks repo

- [ ] `husky init` in a scratch repo, then `agentsmyth init`, then `git commit`, and confirm the gate
      runs — not that the hook file exists. A hook that survives installation and never executes is
      the failure this guards, and it is strictly worse than a missing hook because the path
      advertised in `AGENTS.md` is literally correct.
- [ ] Reinstall dependencies so husky regenerates `.husky/_/`, then commit again. The gate must still
      run.
- [ ] `chmod 0700` a hook before `init` and confirm the mode survives. An unconditional `0o755`
      widened a deliberately private hook for one release.

The suites transcribe husky's dispatcher from its installer. That is close, and it is not husky.

### A genuinely stale global install

The upgrade rehearsal above covers version skew. This covers the other half — a global definitions
tree whose SCHEMAS predate the keys a newer CLI writes.

- [ ] Install the previously published version globally, then run the candidate's `init` in a fresh
      repo. Confirm the stale tree is detected and refreshed rather than linked to.
- [ ] Before refreshing, run `agentsmyth check` against a repo whose config uses a key the old schema
      does not declare. It must report that the DEFINITIONS are stale and name `agentsmyth upgrade`
      — not report the valid config as "not allowed", which is a fault the user cannot fix by editing
      config and which reads as though they can.

This is the shape of the first real consumer bug report this feature produced, and it is reachable
only in a mixed install.

### Why this section exists

`docs/release-checklist.md` has described the double-edit upgrade rehearsal — *"edit the same file a
second time and upgrade again WITHOUT resolving the first reconcile item"* — since 1.0.1 shipped.
A Review council then found that the code did not hold it: the supersede loop skipped the
destination directory before the protection test, so the second edit overwrote the first edit's only
surviving copy while the run printed "Your edits were preserved before anything was touched".

So a correct manual step was written down and the defect shipped anyway. Two things follow, and both
are the point of this section:

1. **A checklist entry is not coverage until something executes it.** That scenario is now
   `X7` in `test/run-upgrade-path-tests.mjs` and fails against the pre-fix CLI. Promote these entries
   into suites whenever it becomes possible, and delete them from here when you do.
2. **The entries that CANNOT be promoted are the ones to actually run.** Everything above is here
   because automation from inside this repo cannot reach it — a different host, a different OS, a
   different tool, a real generator. Those are exactly the entries a reader is most tempted to skip
   because they take a machine and ten minutes.

## Deprecation windows

`x_enforcement: warn-until-<version>` marks a schema declaration that is validated but whose
failures are reported as warnings instead of blocking. The window is matched by **string prefix and
has no expiry mechanism** — nothing fails when the named version ships with its markers still in
place, so a deferred violation stays permanently unenforced unless someone removes the marker by
hand.

**Whenever you release a version, grep for markers naming it and delete those marker lines:**

```sh
grep -rn "x_enforcement: warn-until-<version-being-released>" src/
```

Deleting the line turns enforcement on with no code change. Then run `npm run validate` and the
suites: anything that was being deferred now fails, and that is the point — fix it or make the
deferral explicit again against a later version.

Known windows currently open:

| Marker | Declarations | Notes |
|---|---|---|
| `warn-until-1.2.0` | 6 — one in `verification.schema.yaml` (`commands[].env`, consumer-authored), five in `agent-behavior.schema.yaml` | Opened when the schema engine began enforcing `required` independently of `properties`, which newly enforced eight previously decorative declarations. Remove when 1.2.0 ships. |

## After the run

- [ ] The published version on npm matches the tag and the CHANGELOG entry.
- [ ] `main` carries the version-bump commit the workflow pushed.
- [ ] Roadmap/tracker rows for the shipped work packages are moved to Done with their PR links.
