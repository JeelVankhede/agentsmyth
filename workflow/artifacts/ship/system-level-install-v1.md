---
slug: system-level-install
version: 1
artifact: ship
status: done
created: 2026-07-08T00:00:00Z
updated: 2026-07-08T00:00:00Z
manifest_ids:
  - R1
  - R2
  - R3
  - R4
  - R5
  - R6
  - RI1
  - RI2
  - RI3
  - RI4
  - RI5
upstream:
  - workflow/artifacts/verify/system-level-install-v1.md
orchestration:
  phase: ship
  status: done
  next_phase: reflect
  blockers: []
  user_checkpoint: approved
---

## Inputs

- Verify artifact: `workflow/artifacts/verify/system-level-install-v1.md` (status: ready-for-next-phase)
- Branch: `feat/system-level-install`, 6 commits ahead of main

## Ship Status

Ready to ship. All requirements met, all automated checks pass, no open blockers.

## Requirement Coverage

| Manifest ID | State | Citation |
|---|---|---|
| R1 | covered | `workflow/artifacts/verify/system-level-install-v1.md` Manifest Coverage — grep confirms no `workflow/config/agent-behavior.yaml` refs remain in `src/`; render-adapters passes |
| R2 | covered | `workflow/artifacts/verify/system-level-install-v1.md` Manifest Coverage — lib.mjs exports `defsPath`/`dataPath`; validators import and use them |
| R3 | covered | `workflow/artifacts/verify/system-level-install-v1.md` Manifest Coverage — `agentsmyth check` resolves validator path and forwards args |
| R4 | covered | `workflow/artifacts/verify/system-level-install-v1.md` Manifest Coverage — 4 global gate files confirmed token-free by render-adapters RI2 check; windsurf gate = 320 chars |
| R5 | covered | `workflow/artifacts/verify/system-level-install-v1.md` Manifest Coverage — headlessBootstrap() code path present in bin/agentsmyth.mjs; profilePath guard active |
| R6 | covered | `workflow/artifacts/verify/system-level-install-v1.md` Manifest Coverage — repo-profile.schema.yaml includes `agentsmyth_version`; check command reads + warns on mismatch |
| RI1 | covered | `workflow/artifacts/verify/system-level-install-v1.md` Manifest Coverage — lib.mjs guard: `if (_defsRoot !== join(repoRoot, _wf) && !existsSync(_defsRoot))` → exit 1 |
| RI2 | covered | `workflow/artifacts/verify/system-level-install-v1.md` Manifest Coverage — render-adapters.mjs global gate loop: no `{{...}}` → pass; windsurf char cap check present |
| RI3 | covered | `workflow/artifacts/verify/system-level-install-v1.md` Manifest Coverage — `--system` flag gates all new init behavior; bare init code path unchanged |
| RI4 | covered | `workflow/artifacts/verify/system-level-install-v1.md` Manifest Coverage — all 3 suites confirmed passing at each phase boundary in Phase Completion Log |
| RI5 | covered | `workflow/artifacts/verify/system-level-install-v1.md` Manifest Coverage — CLAUDE.md three-tier table written; repo-mental-map.md two-root section written; setup SKILL.md system install note written |

## PR / CI Readiness

- Branch: `feat/system-level-install` (clean, no uncommitted changes after artifact commits)
- `npm run build` → ok
- `npm run validate` → ok
- `npm run violations:test` → 4/4 pass
- No runtime dependency added (zero-dep invariant preserved)
- Pre-commit hook passes on this branch (evidenced by all 6 commits completing cleanly)

## Release Readiness

This is an internal development branch — no package version bump needed at this stage. The changes are a feature addition (system-level install) with full backward-compatibility. When merged, consumers on previous versions are unaffected.

## Source-of-Truth Status

All docs updated:
- `CLAUDE.md` — three-tier table (source/workspace/global)
- `docs/knowledge-map/repo-mental-map.md` — two-root resolver section + global tree
- `src/setup/SKILL.md` — system install note

## Risk And Rollback

- **Rollback**: `git revert` of the 6 commits restores prior state completely. No schema migrations; no data written to the repo without the `--system` flag.
- **Consumer impact**: zero for existing consumers (RI3 theorem holds). New behavior only activates with explicit `--system` flag or `definitions_root` in repo-profile.yaml.
- **Known limitation**: Cursor has no global file path — paste-text only. Documented in CLI output.

## Blocked Handoff

None.

## Architecture Notes

Two-root resolver is the architectural core of WP-R2. It cleanly separates where workflow definitions live (defsRoot) from where per-repo data lives (dataRoot), enabling both local and global install patterns without behavioral changes to existing consumers.

## Exit Gate

- [x] All automated checks pass (`npm run build && npm run validate && npm run violations:test`)
- [x] No open blockers
- [x] Docs updated (RI5 complete)
- [x] Backward-compat confirmed
- [x] PR ready to create

## Next Phase

Reflect artifact to capture learnings from WP-R2.
