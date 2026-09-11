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
      wording gates this version is either resolved or explicitly accepted.
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
- [ ] The release branch is merged into `main`, or you have accepted that `release.yml` will push
      the dispatched ref to `main` itself (`git push origin HEAD:main` is one of its steps).

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
