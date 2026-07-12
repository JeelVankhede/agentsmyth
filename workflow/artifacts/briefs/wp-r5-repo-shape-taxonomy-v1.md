---
slug: wp-r5-repo-shape-taxonomy
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-07-12T00:00:00Z
updated: 2026-07-12T00:00:00Z
manifest_ids:
  - R1
  - R2
  - R3
  - R4
  - R5
  - RI1
  - RI2
  - RI3
  - RI4
  - RI5
upstream:
  - wpr5-spike-notion-39a972bd
  - user-request
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: brief-review
---

# WP-R5 T5.2 — Repo-Shape Root Resolution — Brief

## Source Links

- Research spike: Notion WP-R5 spike (39a972bd) — model, root-detection mechanism, and both schema
  changes fully confirmed (2026-07-12) after two corrected revisions
- Classification: **Complex** — touches the core path resolver used by every validator, two schema
  files, and the `init` CLI entrypoint; per this repo's own `classification_signals` (schema/API
  contract change affecting multiple callers, work touching authentication-adjacent trust boundary
  of "which repo am I operating in")

## Problem

`repoRoot` — the single value every validator uses to find `workflow/` and to `cd` for git
commands — is `process.cwd()` in four independent places (`lib.mjs`, two validators that duplicate
its detection logic locally, `check-setup-complete.mjs`, `check-pending-setup.mjs`, and
`bin/agentsmyth.mjs`'s own `cwd`). This is silently wrong whenever the agent isn't invoked from
exactly the intended root:

- **Monorepo:** invoking a validator from inside a package subdirectory resolves to that package,
  not the one shared `workflow/` at the git top-level.
- **Polyrepo:** the shared `workflow/` lives at a workspace root that isn't itself a git
  repository — `git rev-parse --show-toplevel` from inside a member repo can't reach it at all.

`repo-profile.schema.yaml`'s `repository.mode` is a fixed `const: single-repository`, so there is
no way to declare either shape today, and `artifact-frontmatter.schema.yaml` has no way for a task
to say which repo (in a polyrepo family) it actually targets — meaning even with correct root
detection, git-dependent validators (`trackedFiles()`, `check-lifecycle.mjs`'s staged-file slug
detection) have no way to know which repo's git state to inspect for a given artifact.

## Goals

- One shared `workflow/` resolves correctly regardless of repo shape: git top-level for
  single-repo/monorepo, a `workspace_root` pointer for polyrepo.
- `repo-profile.yaml` can declare `mode: monorepo` or `mode: polyrepo-member` with the fields each
  needs, without changing single-repo behavior at all.
- Git-dependent validators (`trackedFiles()`, `check-lifecycle.mjs`'s slug auto-detection) resolve
  their git `cwd` correctly for a polyrepo-member task via a new `target_repo` artifact field.
- Zero behavior change for existing single-repo consumers with no `mode` set (backward-compat
  theorem, same discipline as WP-R2's two-root resolver).
- `npm run build`, `npm run validate`, and `npm run violations:test` pass throughout.

## Non-Goals

- Monorepo/polyrepo **live dogfooding** in this repo (agentsmyth itself is single-repo) — this
  ships the mechanism, not a monorepo example. A future example dir is a separate follow-up.
- Package-scoped artifact subtrees or cross-package slug namespacing — explicitly rejected in the
  spike (§2.5); every shape uses one flat `workflow/artifacts/` tree.
- Auto-discovery of `packages`/`sibling_repos` from `package.json` workspaces, `turbo.json`, etc. —
  the spike left this open (§3 "open, deliberately not resolved") and it's not required for T5.2's
  scope; `packages`/`sibling_repos` are user-declared, not auto-detected, in this pass.
- Windows path handling beyond what already exists — out of scope, matching WP-R2's precedent (A3).

## Decisions Locked (from WP-R5 spike, confirmed 2026-07-12)

| Decision | Choice |
|---|---|
| Placement model | One shared `workflow/` per project family — never package/repo-scoped subtrees |
| Single-repo/monorepo root detection | `git rev-parse --show-toplevel`, not `process.cwd()` |
| Polyrepo root detection | `workspace_root` pointer field in `repo-profile.yaml`, not git-based (workspace root isn't a git repo) |
| T5.3 (slug namespacing) | Resolved by design — not needed, one flat tree in every shape |
| `repo-profile.yaml` schema | `mode` enum (`single-repository`\|`monorepo`\|`polyrepo-member`) + `packages[].{name,path,package_manager}` + `workspace_root` + `sibling_repos[].{name,path,url}` |
| `artifact-frontmatter.schema.yaml` schema | New optional `target_repo` field, meaningful only under `mode: polyrepo-member` |
| Git-cwd resolution | `trackedFiles()` and `check-lifecycle.mjs`'s staged-diff call become parameterized (take a resolved git-cwd) instead of reading a fixed module constant |

## Requirement Manifest

### Explicit (R)

- **R1** — Consolidate root detection into one shared helper in `src/workflow/validators/lib.mjs`,
  replacing the bare `process.cwd()` `repoRoot` constant. New resolution order: (1) if
  `repo-profile.yaml`'s `mode` is `polyrepo-member` and `workspace_root` is set, resolve to the
  expanded `workspace_root` path; (2) else run `git rev-parse --show-toplevel`; (3) if that fails
  (not in a git repo — fresh-init case), fall back to `process.cwd()` (today's behavior, unchanged).
  Export this as `repoRoot` (keep the existing name so all 16 current importers need no call-site
  change) computed via the new resolution order instead of the bare constant.
  - Acceptance: with no `repo-profile.yaml` present (fresh-init) or `mode: single-repository`,
    `repoRoot` resolves identically to today in every case exercised by the existing test suite
    (backward-compat theorem, same discipline as WP-R2's R2). Invoking a validator from a
    subdirectory of a git repo now resolves to the git top-level, not the subdirectory.

- **R2** — Apply the same resolution fix to the three call sites that don't go through `lib.mjs`'s
  `repoRoot`: `check-setup-complete.mjs` and `check-pending-setup.mjs` (each currently define their
  own separate `repoRoot = process.cwd()`) and `bin/agentsmyth.mjs` (`const cwd = process.cwd()`).
  Extract the resolution logic from R1 into a form importable by these three (they may not always
  have `lib.mjs`'s full dependency surface available — check import feasibility per file; if a
  file cannot import `lib.mjs`, duplicate the minimal resolution logic with a comment cross-
  referencing `lib.mjs` as the source of truth, same pattern already used for the `_wf` detection
  duplication found in R3).
  - Acceptance: all three files use the same root-resolution algorithm as `lib.mjs`; `agentsmyth
    init` run from a monorepo package subdirectory installs `workflow/` at the git top-level, not
    the subdirectory.

- **R3** — Consolidate `check-assumptions.mjs` and `check-artifacts.mjs`'s duplicated `_wf`-
  detection logic (found during the spike's call-site audit, pre-existing and unrelated to
  monorepo/polyrepo but caught in the same pass) to use `lib.mjs`'s `dataPath()` instead of
  locally re-deriving the workflow directory.
  - Acceptance: `grep -n "existsSync(join(repoRoot, 'workflow'))"` returns zero matches outside
    `lib.mjs` itself.

- **R4** — `repo-profile.schema.yaml` changes: expand `repository.mode` from `const:
  single-repository` to `enum: [single-repository, monorepo, polyrepo-member]`. Add optional
  `repository.packages` (array of `{name: string, path: string, package_manager?: string}`,
  meaningful under `mode: monorepo`). Add optional `repository.workspace_root` (string, required
  when `mode: polyrepo-member`) and `repository.sibling_repos` (array of `{name: string, path:
  string, url?: string}`, meaningful under `mode: polyrepo-member`).
  - Acceptance: schema validates all three `mode` values; a `mode: single-repository` profile with
    no new fields validates identically to today (no new required fields for that mode); a `mode:
    polyrepo-member` profile with no `workspace_root` fails validation (required for that mode).

- **R5** — `artifact-frontmatter.schema.yaml` gains an optional `target_repo` field (string,
  matches a `sibling_repos[].name` or is omitted for self). Parameterize `lib.mjs`'s
  `trackedFiles()` to accept an optional `gitCwd` argument (defaults to `repoRoot` when omitted,
  preserving existing zero-argument call sites for single-repo/monorepo). Parameterize
  `check-lifecycle.mjs`'s staged-file `git diff --cached` call the same way. Add a resolver
  function (`resolveGitCwd(artifactFrontmatter)`) that returns `repoRoot` unless the active
  `repo-profile.yaml` is `mode: polyrepo-member` and the artifact's `target_repo` is set, in which
  case it returns `workspace_root` joined with the matching `sibling_repos[].path`.
  - Acceptance: existing single-repo/monorepo call sites (no `target_repo`, no `polyrepo-member`
    mode) behave identically to today; a `check-scope-fence.mjs`-style consumer given a
    polyrepo-member artifact with `target_repo: billing-service` resolves git operations against
    `<workspace_root>/billing-service`, not `workspace_root` itself.

### Implicit (RI)

- **RI1** — Backward-compat theorem. A repo with no `mode` field set, or `mode:
  single-repository` explicitly, must produce byte-identical path resolution to pre-T5.2 behavior
  in every case. This is the same discipline WP-R2's two-root resolver used and must not regress.
  - Acceptance: `npm run validate` and `npm run violations:test` pass unchanged on this repo
    (single-repo, no `mode` set) throughout every requirement.

- **RI2** — The 4 (now effectively R1+R2's consolidated) call sites must never disagree about the
  resolved root within a single invocation chain — `agentsmyth init` and the validators it
  subsequently triggers must agree on where `workflow/` lives.
  - Acceptance: a manual dry run (documented in the task artifact) invoking `init` then a validator
    from the same subdirectory produces the same resolved root for both.

- **RI3** — Fresh-init fallback preserved. When `git rev-parse --show-toplevel` fails (no `.git`
  yet, e.g. before `git init`), resolution falls back to `process.cwd()` exactly as today — this
  must not regress the documented "fresh init" flow from WP-R2 (R5, headless bootstrap).
  - Acceptance: running `agentsmyth init` in a directory with no git repository still completes
    successfully, matching pre-T5.2 behavior.

- **RI4** — Continuous validator integrity. Each requirement passes the full `npm run build && npm
  run validate && npm run violations:test` suite before the next requirement begins.
  - Acceptance: no intermediate state breaks the validator chain; documented per-requirement in the
    task artifact's Phase Completion Log.

- **RI5** — Documentation currency. `CLAUDE.md`'s three-world table and
  `docs/knowledge-map/repo-mental-map.md` must reflect the new `mode` values and root-resolution
  algorithm by the time R5 ships — future agents load these cold and must not derive a stale
  single-root mental model.
  - Acceptance: `check-domain-placeholders` passes; no agent-facing file describes `repoRoot` as a
    bare `process.cwd()` constant after this ships.

### Assumptions (A)

- **A1** — `git` is available on PATH wherever agentsmyth runs. Already assumed by existing code
  (`trackedFiles()`, `check-lifecycle.mjs` already shell out to `git`); this work does not add a
  new dependency, only a new invocation (`git rev-parse --show-toplevel`).

- **A2** — `workspace_root` uses the same `~`-expansion convention `lib.mjs` already applies to
  `definitions_root`/`AGENTSMYTH_HOME` (the existing `_expandTilde` helper). No new expansion logic
  needed — reuse it.

- **A3** — No existing consumer repo currently sets `repository.mode` to anything other than
  `single-repository` (the field was a `const` until R4), so widening it to an `enum` is
  non-breaking for every existing install.

### Questions (Q)

All questions were resolved in the WP-R5 research spike before this brief was opened, across two
rounds of correction (see spike page history for the full back-and-forth).

- **Q1 \[resolved\]** — Package-scoped artifact subtrees vs. one shared flat tree per project
  family. → **One shared flat tree**, no package/repo scoping, in every shape.

- **Q2 \[resolved\]** — Polyrepo: per-member independent installs vs. one shared install at a
  workspace root. → **One shared install at a workspace root** containing the members as children.

- **Q3 \[resolved\]** — Polyrepo root-detection mechanism: pointer field vs. invocation-convention-
  only. → **Pointer field** (`workspace_root`) — convention-only was considered and rejected as too
  fragile against an agent naturally `cd`ing into a member repo mid-task.

- **Q4 \[resolved\]** — Does `repo-profile.yaml` need a schema change at all, given the placement
  mechanism doesn't change per-package. → **Yes** — `mode` enum + `packages`/`workspace_root`/
  `sibling_repos`, for describing the real shape even though placement stays uniform.

- **Q5 \[resolved\]** — Does resolving git-cwd for polyrepo need a second schema file
  (`artifact-frontmatter.schema.yaml`), or can `repo-profile.yaml` alone carry enough information?
  → **Second schema file required** — a `target_repo` field on the artifact itself, since
  `repo-profile.yaml` is static per-install but which member repo a *task* targets varies per
  artifact.

## Architecture Notes

**R1 is the load-bearing change** — every other requirement depends on the consolidated root-
resolution helper existing first. R2/R3 apply the same fix to call sites that don't route through
`lib.mjs`. R4/R5 (schema changes) can technically be written in parallel with R1–R3, but R5's
`resolveGitCwd()` needs R4's `target_repo`/`sibling_repos` fields to exist first, so implementation
order is R1 → R2 → R3 → R4 → R5.

**This mirrors WP-R2's two-root resolver precedent directly**: `workspace_root` is structurally the
same idea as `definitions_root` (a config value naming an external location, with a documented
precedence/fallback order), applied to the data root instead of the definitions root. No new
architectural pattern is being introduced — this is the second application of a pattern WP-R2
already proved out.

**Recommended implementation order:** R1 → R2 → R3 → R4 → R5.

## Exit Gate

- R1 through R5 each have acceptance criteria; no requirement is implementation detail.
- RI1 through RI5 each have acceptance criteria; RI1 (backward-compat) and RI5 (doc currency) are
  the two most consequential given this touches every validator's path resolution.
- A1 through A3 are explicit; all are safe to proceed on (none block the brief).
- Q1 through Q5 are all resolved in the Notion spike; zero open questions; `orchestration.blockers`
  is empty.
- Classification confirmed Complex (schema/API contract change affecting every validator call
  site, touching a trust boundary — which repo a given task's git operations target).
- Spike deliverable (Notion 39a972bd, fully resolved 2026-07-12) is complete and referenced.
