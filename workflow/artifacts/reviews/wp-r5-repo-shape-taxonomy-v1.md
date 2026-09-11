---
slug: wp-r5-repo-shape-taxonomy
version: 1
artifact: review
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
  - workflow/artifacts/tasks/wp-r5-repo-shape-taxonomy-v1.md
orchestration:
  phase: review
  status: done
  next_phase: test
  blockers: []
  user_checkpoint: none
---

## Findings

**R1 — consolidated root resolution**: `_resolveRepoRoot()`'s order (`workspace_root` →
`git rev-parse --show-toplevel` → `process.cwd()`) matches the confirmed spike model exactly.
Backward-compat verified directly, not assumed: `repoRoot` for this repo's actual state
(no `mode` set) resolves identically before and after. Subdirectory-invocation fix confirmed by
running from `src/workflow/skills/` and observing resolution to the repo root, not the
subdirectory — this is the concrete bug the phase set out to fix, and it's demonstrably fixed.

**R2 — the 3 non-lib.mjs call sites**: Correctly differentiated rather than uniformly patched.
`check-pending-setup.mjs` already imported from `lib.mjs`, trivial fix. `check-setup-complete.mjs`
could not safely import `lib.mjs` — its module-level `definitions_root` guard calls
`process.exit(1)`, which would have been a real, silent behavior change during setup verification
(the one moment a hard exit is least acceptable). Duplicating the resolver there instead was the
correct call, not a shortcut. `bin/agentsmyth.mjs`'s `init` target-directory selection was
correctly left untouched — a materially different question ("where do I install" vs. "where does
an existing install live") that the brief's R2 wording didn't originally distinguish; catching
this distinction during implementation was necessary, not optional.

**R3 — scope expansion, and a real bug caught before commit**: Plan scoped this to 2 files; an
exhaustive grep found 15 more. Expansion was confirmed with the user before proceeding rather than
silently absorbed — correct process. More significant: the first implementation of this fix (on
`check-assumptions.mjs`/`check-artifacts.mjs`, using `dataPath()`+`relPath()`) broke a
`file !== \`${artifactsDir}/README.md\`` string comparison, since `dataPath()` returns an absolute
path while `listFiles()` always returns repo-relative paths. This was caught by re-reading the
downstream usage before committing, not by a test failure — worth naming plainly, since it means
the eventual `wf`-export design (simpler, and correct) was arrived at by finding a bug in the
first attempt, not by getting it right immediately. The final design is verified: 20/20 violation
fixtures still pass, each exercising a different one of the 16 modified validators' real logic.

**R4 — schema changes**: The decision to leave `workspace_root` schema-unenforced (not
conditionally required under `polyrepo-member`) was grounded in actually reading
`lib.mjs`'s `validateSchema` rather than assumed — confirmed no `if`/`then` support exists.
5 hand-written fixtures (3 valid modes, 2 negative cases) all behaved exactly as intended. The
`check-domain-placeholders.mjs` false positive ("workspace root" colliding with an unrelated
old-repo-name leakage ban) was diagnosed correctly — rewording the schema description rather than
touching the leakage-prevention validator was the right scope boundary.

**R5 — target_repo + resolveGitCwd()**: Passthrough behavior verified directly against this
repo's real (non-polyrepo) state in two cases (no `target_repo`; `target_repo` set but wrong
mode) — both correctly resolve to `repoRoot` unchanged. The decision to leave
`check-lifecycle.mjs`'s slug auto-detection un-parameterized is correctly reasoned and clearly
documented in place (a genuine chicken-and-egg: no frontmatter exists yet at that point to read
`target_repo` from) rather than forcing an unused parameter for the sake of appearing complete.

**Minor findings (no blockers)**:
- Three independent copies of root-resolution logic now exist (`lib.mjs`, `check-setup-
  complete.mjs`, `bin/agentsmyth.mjs`'s `check` path) instead of one. Each is commented with a
  cross-reference to `lib.mjs` as source of truth, but a future change to the resolution order
  must be applied in all three by hand — no test catches drift between them. Named as residual
  risk below, not fixed here (would require restructuring how `check-setup-complete.mjs` and
  `bin/agentsmyth.mjs` are shipped/invoked, out of scope for T5.2).
- `sibling_repos[].path` and `packages[].path` are declared but nothing validates they actually
  exist on disk — a `repo-profile.yaml` naming a nonexistent sibling path would pass schema
  validation and only fail later, opaquely, when a git-dependent check tries to `cd` there.

## Severity Summary

| Severity | Count |
|---|---|
| Critical | 0 |
| Major | 0 |
| Minor (fixed before commit) | 1 — the `dataPath()`/`relPath()` string-comparison bug in R3's first attempt |
| Minor (not fixed, named as residual risk) | 2 — see above |
| Informational | 0 |

## Requirement Coverage

| ID | Requirement | Covered |
|---|---|---|
| R1 | Consolidated root resolution | yes — commit `5ce0fec` |
| R2 | 3 non-lib.mjs call sites | yes — commit `5ce0fec` |
| R3 | Duplicated `_wf`-detection removed (17 files) | yes — commit `82ef1f9` |
| R4 | `repo-profile.yaml` mode + fields | yes — commit `08ed13d` |
| R5 | `target_repo` + `resolveGitCwd()` | yes — commit `ecdcee0` |
| RI1 | Backward-compat theorem | yes — verified against this repo's actual state, Phase 1 |
| RI2 | 4 call sites agree | yes — manual cross-check, Phase 2 |
| RI3 | Fresh-init fallback preserved | yes — verified in a non-git temp directory |
| RI4 | Full suite passes every phase | yes — `npm run build/validate/violations:test` green after all 5 phases |
| RI5 | Doc currency | yes — `CLAUDE.md`, `repo-mental-map.md` updated with the new resolution order |

## Architecture Notes

The split between `_resolveRepoRoot()` (Phase 1, the general mechanism) and `resolveGitCwd()`
(Phase 5, artifact-specific override) is the right shape: the former answers "where does this
install's `workflow/` live," a question answerable once per process; the latter answers "which
git checkout should THIS specific check run against," a question that can vary per artifact
within a single process run. Conflating them would have made `repoRoot` itself need to be
re-computed per-artifact, a much larger and riskier change than what actually shipped.

## Verification Reviewed

All suites confirmed passing at every phase boundary (5/5), not just at the end:
- `npm run build` → `build-bundle: ok`, every phase
- `npm run validate` → all validators `ok` including `check-domain-placeholders`, every phase
- `npm run violations:test` → 20/20 detected, every phase
- `npm run setup-checks:test` → 4/4, Phases 2 and 5 (the phases touching `check-setup-complete.mjs`)

## Residual Risk

- **No real monorepo/polyrepo fixture exists in this repo.** Every polyrepo-specific code path
  (`workspace_root` resolution, `sibling_repos` lookup, `target_repo` matching) is verified via
  hand-written fixtures and direct function calls against this repo's own single-repo state, not
  a true end-to-end run against an actual multi-repo scenario. This was named explicitly in the
  plan's own Architecture Notes as an accepted limit, not discovered as a surprise here — but it
  remains the single largest gap between "this code is correct by inspection and unit-level
  verification" and "this code has been proven correct in the field."
- Three independent copies of root-resolution logic (see Minor findings) can drift out of sync on
  a future change with no automated check to catch it.
- `sibling_repos[]`/`packages[]` path fields are unvalidated against the filesystem.
- Init-time `workspace_root` specification (how a polyrepo-member's very first `init --system`
  would set this field before any `repo-profile.yaml` exists) remains an open design question,
  named in the task artifact, not resolved in this pass.

## Recommendation

Approve. Proceed to test phase.
