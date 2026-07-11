---
slug: wp-r5-repo-shape-taxonomy
version: 1
artifact: ship
status: hold
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
  - artifact: verify
    slug: wp-r5-repo-shape-taxonomy
    version: 1
orchestration:
  phase: ship
  status: in-progress
  next_phase: reflect
  blockers:
    - "Awaiting your explicit ship-review confirmation (user_checkpoint) before this artifact is finalized to ship"
  user_checkpoint: true
---

## Inputs

- Verify artifact: `workflow/artifacts/verify/wp-r5-repo-shape-taxonomy-v1.md` (status: ready-for-next-phase)
- Branch: `feat/wp-r5-repo-shape-taxonomy`, 9 commits ahead of `feat/power-skill-sandbox` (its base)

## Ship Status

Hold, pending your explicit ship-review confirmation. All 5 requirements are built, reviewed, and
tested; every automated check passes; no outstanding technical blocker exists. The `hold` here is
procedural, not a finding — this artifact declares `ship` only after you confirm, not before,
matching this session's established discipline against marking checkpoints approved ahead of
real review.

## Requirement Coverage

| Manifest ID | State | Citation |
|---|---|---|
| R1 | covered | `workflow/artifacts/verify/wp-r5-repo-shape-taxonomy-v1.md` Manifest Coverage — `_resolveRepoRoot()` present; subdirectory-invocation test confirmed |
| R2 | covered | `workflow/artifacts/verify/wp-r5-repo-shape-taxonomy-v1.md` Manifest Coverage — all 3 non-`lib.mjs` call sites resolve consistently |
| R3 | covered | `workflow/artifacts/verify/wp-r5-repo-shape-taxonomy-v1.md` Manifest Coverage — zero remaining duplicated detection outside `lib.mjs` + 2 deliberately-kept usages |
| R4 | covered | `workflow/artifacts/verify/wp-r5-repo-shape-taxonomy-v1.md` Manifest Coverage — 5 hand-written fixtures all validated as expected |
| R5 | covered | `workflow/artifacts/verify/wp-r5-repo-shape-taxonomy-v1.md` Manifest Coverage — `target_repo` + `resolveGitCwd()` present, passthrough confirmed |
| RI1 | covered | `workflow/artifacts/verify/wp-r5-repo-shape-taxonomy-v1.md` Manifest Coverage — backward-compat re-confirmed fresh at test time |
| RI2 | covered | `workflow/artifacts/verify/wp-r5-repo-shape-taxonomy-v1.md` Manifest Coverage — 3 call sites cross-checked |
| RI3 | covered | `workflow/artifacts/verify/wp-r5-repo-shape-taxonomy-v1.md` Manifest Coverage — non-git fallback re-confirmed fresh |
| RI4 | covered | `workflow/artifacts/verify/wp-r5-repo-shape-taxonomy-v1.md` Manifest Coverage — full suite passed at every one of 5 phase boundaries |
| RI5 | covered | `workflow/artifacts/verify/wp-r5-repo-shape-taxonomy-v1.md` Manifest Coverage — `CLAUDE.md` + `repo-mental-map.md` updated, `check-domain-placeholders` confirms currency |

## PR / CI Readiness

- Branch: `feat/wp-r5-repo-shape-taxonomy` (clean, no uncommitted changes)
- `npm run build` → ok
- `npm run validate` → ok (all 19 validators)
- `npm run violations:test` → 20/20 pass
- `npm run setup-checks:test` → 4/4 pass
- No runtime dependency added (zero-dep invariant preserved)
- Pre-commit hook passed on every one of the 9 commits on this branch
- Not yet pushed — branch is stacked on `feat/power-skill-sandbox`, which is itself on PR #29
  (unmerged). This branch should not be opened as its own PR until #29 merges, or it would PR
  against `feat/power-skill-sandbox` rather than `main` — flagging this explicitly rather than
  letting it surprise you at push time.

## Release Readiness

Internal development branch — no package version bump at this stage. Feature addition (repo-shape
root resolution) with a verified backward-compatibility theorem for the only shape this repo
itself exercises (single-repository, no `mode` set). Consumers on the current shipped version are
unaffected until they opt into `mode: monorepo` or `mode: polyrepo-member`.

## Source-of-Truth Status

All docs updated:
- `CLAUDE.md` — new "Repo-root resolution (WP-R5 T5.2)" bullet
- `docs/knowledge-map/repo-mental-map.md` — new "Repo-Root Resolution (WP-R5)" section

## Risk And Rollback

- **Rollback**: `git revert` of the 5 feature commits (`5ce0fec`, `82ef1f9`, `08ed13d`,
  `ecdcee0`, plus the lifecycle-artifact commits) restores prior state completely. No schema
  migrations; `mode`/`packages`/`workspace_root`/`sibling_repos`/`target_repo` are all additive,
  optional fields.
- **Consumer impact**: zero for this repo and every existing consumer (RI1 backward-compat
  theorem verified, not assumed). New behavior only activates when a repo explicitly sets
  `mode: monorepo` or `mode: polyrepo-member`.
- **Known limitation, not a blocker**: no real polyrepo fixture exists anywhere to exercise
  `workspace_root`/`sibling_repos`/`target_repo` end-to-end — verified at the unit/fixture level
  only (see verify artifact's Skipped Checks). First real use is the actual proving ground.
  Recommend flagging this to whoever configures the first real polyrepo-member repo.
  `check-lifecycle.mjs`'s slug auto-detection also has a documented, un-fixed boundary for that
  same untested path (see task artifact's Architecture Notes).

## Blocked Handoff

None — the only open item is the ship-review checkpoint itself, which is procedural, not a
technical blocker.

## Architecture Notes

Same as review artifact: `_resolveRepoRoot()` (general, once-per-process) and `resolveGitCwd()`
(artifact-specific, per-invocation) are correctly separated concerns, not conflated into one
mechanism that would have needed re-computing `repoRoot` per-artifact.

## Exit Gate

- [x] All automated checks pass (`npm run build && npm run validate && npm run violations:test &&
      npm run setup-checks:test`)
- [x] No technical blockers
- [x] Docs updated (RI5 complete)
- [x] Backward-compat confirmed, re-verified fresh at test time
- [ ] Your explicit ship-review confirmation — the one remaining gate

## Next Phase

Reflect, once you confirm ship. Not yet started.
