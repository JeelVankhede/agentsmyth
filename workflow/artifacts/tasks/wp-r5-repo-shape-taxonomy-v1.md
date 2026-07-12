---
slug: wp-r5-repo-shape-taxonomy
version: 1
artifact: task
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
  - artifact: plan
    slug: wp-r5-repo-shape-taxonomy
    version: 1
orchestration:
  phase: build
  status: complete
  next_phase: review
  blockers: []
  user_checkpoint: false
---

## Active Phase

- Phase: Phase 5 - target_repo + resolveGitCwd() (complete — all 5 plan phases done, ready for review)

## Plan Phases Overview

| Phase | Status | Covers |
|---|---|---|
| Phase 1 — R1: consolidated root resolution in lib.mjs | complete | R1, RI1, RI3, RI4 |
| Phase 2 — R2: apply fix to 3 non-lib.mjs call sites | complete | R2, RI2, RI4 |
| Phase 3 — R3: remove duplicated `_wf`-detection | complete (scope expanded, see below) | R3, RI4 |
| Phase 4 — R4: `repo-profile.yaml` mode + fields | complete | R4, RI4 |
| Phase 5 — R5: `target_repo` + `resolveGitCwd()` | complete | R5, RI4, RI5 |

## Branch / Repo Status

Branch: `feat/wp-r5-repo-shape-taxonomy` (6 commits ahead of `feat/power-skill-sandbox`, its base — not yet merged/pushed)

```
ecdcee0 feat(R5): target_repo field + resolveGitCwd(), RI5 docs (WP-R5 T5.2)
08ed13d feat(R4): repo-profile.yaml mode enum + monorepo/polyrepo fields
82ef1f9 feat(R3): consolidate duplicated root-detection in all 16 validators
5ce0fec feat(R1-R2): consolidated repo-root resolution (WP-R5 T5.2)
c8ce50c chore(lifecycle): add plan for wp-r5-repo-shape-taxonomy
c2f3fe7 chore(lifecycle): add brief for wp-r5-repo-shape-taxonomy
```

## Scope

**Planned scope (5 files) vs. actual (22 files)** — the delta is entirely Phase 3's exhaustive
grep finding the same duplicated pattern in 14 more files than the plan's 2-file estimate
(itself inherited from the spike's non-exhaustive sample audit). Confirmed with the user before
expanding — see Risk And Rollback for the full reasoning; this is not silent scope creep.

- `src/workflow/validators/lib.mjs` — `_resolveRepoRoot()`, `_readWorkspaceRoot()`, exported
  `wf`, parameterized `trackedFiles(gitCwd)`, new `resolveGitCwd(frontmatter)`
- `src/workflow/validators/check-setup-complete.mjs` — duplicated minimal resolver (can't safely
  import `lib.mjs` — its module-level guard can `process.exit(1)`)
- `src/workflow/validators/check-pending-setup.mjs` — now imports `repoRoot` from `lib.mjs`
- `bin/agentsmyth.mjs` — `resolveExistingRepoRoot()` for the `check` subcommand path only;
  `init`'s target-directory selection deliberately untouched
- `src/workflow/validators/check-assumptions.mjs`, `check-artifacts.mjs`,
  `check-coverage-ledger.mjs`, `check-verify-matrix.mjs`, `check-waivers.mjs`,
  `check-phase-map.mjs`, `check-open-items.mjs`, `check-skill-triggers.mjs`,
  `check-evidence-citations.mjs`, `check-constraint-conflicts.mjs`, `check-followups.mjs`,
  `check-skipped-accounting.mjs`, `check-release-readiness.mjs`, `check-scope-fence.mjs`,
  `check-manifest-coverage.mjs`, `check-lifecycle.mjs` — all now import `wf` from `lib.mjs`
  instead of re-deriving it locally
- `src/workflow/schemas/repo-profile.schema.yaml` — `mode` enum, `packages[]`, `workspace_root`,
  `sibling_repos[]`
- `src/workflow/schemas/artifact-frontmatter.schema.yaml` — `target_repo`
- `CLAUDE.md`, `docs/knowledge-map/repo-mental-map.md` — RI5 doc updates

## Changed Files

- `src/workflow/validators/lib.mjs` — `_resolveRepoRoot()`, `_readWorkspaceRoot()`, exported `wf`, parameterized `trackedFiles(gitCwd)`, new `resolveGitCwd(frontmatter)` — IDs: R1, R3, R5, RI1, RI3
- `src/workflow/validators/check-setup-complete.mjs` — duplicated minimal resolver — IDs: R2, RI2
- `src/workflow/validators/check-pending-setup.mjs` — imports `repoRoot` from `lib.mjs` — IDs: R2, RI2
- `bin/agentsmyth.mjs` — `resolveExistingRepoRoot()` for the `check` subcommand path — IDs: R2, RI2
- `src/workflow/validators/check-assumptions.mjs`, `check-artifacts.mjs`, `check-coverage-ledger.mjs`, `check-verify-matrix.mjs`, `check-waivers.mjs`, `check-phase-map.mjs`, `check-open-items.mjs`, `check-skill-triggers.mjs`, `check-evidence-citations.mjs`, `check-constraint-conflicts.mjs`, `check-followups.mjs`, `check-skipped-accounting.mjs`, `check-release-readiness.mjs`, `check-scope-fence.mjs`, `check-manifest-coverage.mjs`, `check-lifecycle.mjs` (16 files) — import `wf` instead of re-deriving it locally — IDs: R3
- `src/workflow/schemas/repo-profile.schema.yaml` — `mode` enum, `packages[]`, `workspace_root`, `sibling_repos[]` — IDs: R4
- `src/workflow/schemas/artifact-frontmatter.schema.yaml` — `target_repo` field — IDs: R5
- `CLAUDE.md`, `docs/knowledge-map/repo-mental-map.md` — RI5 doc updates — IDs: RI5

Build re-run after every phase (`npm run build`) to keep `dist/`/`workflow/schemas/` in sync — no
separate changed file, evidenced in Verification Items (RI4) instead.

## Implementation Log

- Phase 1 (R1): Added `_resolveRepoRoot()` to `lib.mjs` — `workspace_root` (polyrepo-member) →
  `git rev-parse --show-toplevel` → `process.cwd()` fallback. Verified: this repo's own
  resolution is byte-identical to before (no `mode` set); a validator invoked from
  `src/workflow/skills/` resolves to the repo root, not the subdirectory (confirmed manually);
  a non-git temp directory falls back to `process.cwd()` without throwing.
- Phase 2 (R2): `check-pending-setup.mjs` already imported from `lib.mjs` — trivial fix, now
  imports `repoRoot` too. `check-setup-complete.mjs` cannot safely import `lib.mjs` (its
  module-level `definitions_root` guard can `process.exit(1)`, unacceptable during setup
  verification itself) — duplicated the minimal resolver with a comment explaining why.
  `bin/agentsmyth.mjs`'s `check` subcommand gets `resolveExistingRepoRoot()` (third duplicate,
  documented); `init`'s own target-directory selection (`cwd`) is deliberately untouched — a
  different semantic (where to install, not where an existing install lives).
- Phase 3 (R3): Plan scoped this to 2 files. An exhaustive grep found the identical pattern in
  15 total files (all validators using `${wf}/artifacts` as a default). Confirmed scope
  expansion with the user before proceeding. Redesigned the fix mid-implementation: exporting
  `wf` directly from `lib.mjs` (the bare directory-name string) is simpler and safer than the
  `dataPath()`/`relPath()` approach first tried on `check-assumptions.mjs`/`check-artifacts.mjs`
  — that approach broke a `file !== \`${artifactsDir}/README.md\`` string comparison (`file` is
  always repo-relative from `listFiles()`, `dataPath()` is absolute), caught before commit and
  reverted to the `wf`-export pattern used consistently across all 16 files.
  `check-constraint-conflicts.mjs` and `check-lifecycle.mjs` each keep one additional real
  `existsSync`/`join`/`repoRoot` usage beyond the removed detection block (a real
  domain.yaml-existence check, and a deliberately-separate consumer-path-format check
  respectively) — only the duplicated detection itself was removed.
- Phase 4 (R4): `mode` const → enum; added `packages[]` (monorepo), `workspace_root` +
  `sibling_repos[]` (polyrepo-member). Confirmed via reading `lib.mjs`'s `validateSchema` that
  this repo's hand-rolled schema engine has no `if`/`then` support before committing to any
  design — `workspace_root` is documented as intentionally not schema-enforced as required,
  rather than faking conditional validation. Hit and fixed a real false positive:
  `check-domain-placeholders.mjs` bans the literal phrase "workspace root" (old-repo-name
  leakage prevention, unrelated to this schema) — reworded the one colliding description.
- Phase 5 (R5): Added `target_repo` to `artifact-frontmatter.schema.yaml`; parameterized
  `trackedFiles(gitCwd = repoRoot)`; added `resolveGitCwd(frontmatter)`. Verified directly
  against this repo's actual state: no `target_repo` → `repoRoot`; `target_repo` set but mode
  not `polyrepo-member` → still `repoRoot` (pure passthrough). Left `check-lifecycle.mjs`'s
  staged-file slug auto-detection un-parameterized, with the reason documented in place — it
  runs before any artifact frontmatter exists to read `target_repo` from. RI5: updated
  `CLAUDE.md`'s three-world table and `repo-mental-map.md` with a new "Repo-Root Resolution
  (WP-R5)" section.

## Verification Items

- [x] `npm run build`, `npm run validate`, `npm run violations:test` all pass after every one of
      the 5 phases, with zero intermediate breakage (RI4)
- [x] `npm run setup-checks:test` — 4/4 after Phases 2 and 5 (touches `check-setup-complete.mjs`) (RI2)
- [x] Manual: subdirectory invocation resolves to git top-level, not the subdirectory (R1)
- [x] Manual: non-git temp directory falls back to `process.cwd()` without throwing (RI3)
- [x] Manual: 5 hand-written `repo-profile.yaml` fixtures (3 valid modes + 2 negative cases) all
      validate as expected (R4)
- [x] Manual: `resolveGitCwd()` passthrough confirmed against this repo's real (non-polyrepo)
      state, both with and without `target_repo` set (R5)

## Command Results

```
npm run build    → build-bundle: ok (after every phase, 5/5)
npm run validate → all validators ok, including check-domain-placeholders (after every phase, 5/5)
npm run violations:test → 20/20 violations detected (after every phase, 5/5)
npm run setup-checks:test → 4/4 setup-complete regex checks passed (Phases 2, 5)
node --check <every modified .mjs file> → all OK (22 files)
```

## Dispatch Log

No subagents dispatched. All changes written in the main session.

## Architecture Notes

- `_resolveRepoRoot()` mirrors WP-R2's `definitions_root` pattern structurally — a config value
  naming an external location, with a documented fallback order — applied to the data root
  instead of the definitions root. No new architectural pattern introduced.
- The `wf` export (Phase 3) is a bare directory-name string ("workflow" or "src/workflow"), not a
  full path — safe to interpolate into relative strings like `${wf}/artifacts` without the
  absolute/relative mismatch that `dataPath()` would have introduced at those 14+ call sites.
- `resolveGitCwd()` is deliberately conservative: any ambiguity (profile unreadable, mode not
  `polyrepo-member`, `target_repo` not found in `sibling_repos`) falls back to `repoRoot` with at
  most a console warning, never a thrown error — matching `evidence_policy`'s preference for
  graceful degradation over hard failure in this class of check.
- Two real design gaps were found and deliberately left open rather than guessed: (1) how a
  polyrepo-member's very first `init --system` would specify `workspace_root` before any
  `repo-profile.yaml` exists to read it from (out of scope for T5.2, which covers *detecting* an
  existing root, not *choosing* a new one); (2) `check-lifecycle.mjs`'s slug auto-detection has
  no frontmatter yet to resolve `target_repo` from at the point it runs. Both are documented
  in-place, not silently patched.

## Blockers

None.

## Phase Completion Log

- Phase 1 complete: commit `5ce0fec` (bundled with Phase 2), full suite green, RI1/RI3 manually verified.
- Phase 2 complete: commit `5ce0fec`, full suite green including `setup-checks:test`.
- Phase 3 complete: commit `82ef1f9`, scope expansion confirmed with user before proceeding, 20/20 violations still pass.
- Phase 4 complete: commit `08ed13d`, 5 hand-written fixtures verified, one false-positive found and fixed.
- Phase 5 complete: commit `ecdcee0`, passthrough behavior verified against this repo's real state, RI5 docs updated.
