---
slug: wp-r12-local-install-fixes
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-07-21
updated: 2026-07-21
manifest_ids: [R1, RI2]
upstream:
  - workflow/artifacts/briefs/wp-r12-local-install-fixes-v1.md
  - workflow/artifacts/plans/wp-r12-local-install-fixes-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: none
---

# WP-R12 — Local Install Fixes - Task (Phase 1: Packaging Path Fix)

## Active Phase

- Phase: Phase 1 - Packaging path fix
- Manifest IDs: R1, RI2
- Exit gate: zero remaining `'src', 'adapters'` references in `bin/agentsmyth.mjs`; the scratch packed-install test passes with real command output cited.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Packaging path fix | complete | R1, RI2 |
| Phase 2 - `check-release-readiness.mjs` fixes | pending | R2, R3, RI1 |
| Phase 3 - 5-adapter global invocation command | pending | R4, RI2, RI3, RI4, RI5 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `wp-r12-local-install-fixes` (created off `origin/main`) | clean, tracking `origin/main` | Branch created after correcting an earlier mistake this session — the fix was first made directly on the unrelated `feat/wp-r11-docs-site` branch, caught, stashed, and reapplied here. |
| At handoff | `wp-r12-local-install-fixes` | `bin/agentsmyth.mjs` staged (6-line diff); `site/`, `workflow/artifacts/ship/wp-r11-docs-site-v1.md`, `workflow/artifacts/verify/wp-r11-docs-site-v1.md` untracked | The 3 untracked paths are leftover WP-R11 working-tree files from the shared single working directory (this repo has one worktree, not one per branch) — already correctly committed on `feat/wp-r11-docs-site`, not part of this WP, not staged or touched here. |

## Scope

- In scope: `bin/agentsmyth.mjs` — the 6 `readFileSync(join(pkgRootDir, 'src', 'adapters', ...))` call sites in `placeDeterministicAdapters()` and `runPrepare()`.
- Out of scope: `src/workflow/validators/check-release-readiness.mjs` (Phase 2), any new adapter-invocation file writes (Phase 3), `package.json`/`src/assets/adapters/` (already correct — build script already mirrors `src/adapters/` → `src/assets/adapters/`, confirmed via `find` before making any change).

## Changed Files

- `bin/agentsmyth.mjs` — 6 call sites changed from `join(pkgRootDir, 'src', 'adapters', ...)` to `join(pkgRootDir, 'src', 'assets', 'adapters', ...)`: `placeDeterministicAdapters()`'s cursor read (was line 448) and copilot read (was line 456); `runPrepare()`'s claude (490), codex (500), windsurf (510), and copilot (522, macOS-only) global-gate reads. — IDs: R1

## Implementation Log

- Root cause confirmed before any edit: `package.json`'s `files` field is `["bin/", "dist/", "src/assets/", "validators/"]` — `src/adapters/` is not published. `scripts/build-bundle.mjs` already copies `src/adapters/**` → `src/assets/adapters/**` at build time (`walkFiles('src/adapters')` loop, unconditional, confirmed by reading the script) — `src/assets/` **is** published. Verified via `find src/adapters -type f` vs `find src/assets/adapters -type f`: both listings contain the exact same 15 relative paths.
- Applied the 6-site swap via individual `Edit` calls (not a blanket find/replace) so each site could be confirmed against its own surrounding code before changing it.
- Verified via `grep -n "'src', 'adapters'" bin/agentsmyth.mjs` → no matches after the edit.
- Ran `npm run build` first to guarantee `src/assets/adapters/` reflected current source before packing (build-bundle.mjs's own copy step), then reproduced the user's exact real-world scenario end-to-end:
  1. `npm pack --pack-destination <scratchpad>` — produced a real tarball respecting `files`. Confirmed via `tar -tzf ... | grep -c "^package/src/adapters/"` → `0`, and `| grep "src/assets/adapters"` → all 15 files present. This is the exact gap that caused the user's crash, reproduced mechanically, not just reasoned about.
  2. Created a scratch consumer repo (`npm init -y`), installed the tarball with `npm install --install-links <tarball>` (forces a real copy, not a symlink — matches what a real `npm install <package>` from a registry/tarball does, as opposed to `npm link`/local-path installs which symlink and would never have reproduced this bug).
  3. Confirmed the exact ENOENT path from the user's original report is genuinely absent in the installed copy (`node_modules/@jeelvankhede/agentsmyth/src/adapters/cursor/rules/index.mdc` → `No such file or directory`) while the fixed target path exists (`src/assets/adapters/cursor/rules/index.mdc` → present).
  4. Ran `agentsmyth prepare` against the packed install with `HOME` overridden to an isolated scratch directory (never touched the real machine's `~/.claude`, `~/.codex`, `~/.agentsmyth`, etc.) — completed cleanly, installed all 4 global gates (Claude, Codex, Windsurf, Copilot-on-darwin), printed the Cursor paste-text.
  5. Ran `agentsmyth init` against the same packed install/isolated `$HOME` — the exact command that crashed for the user — completed cleanly, no ENOENT.
  6. Spot-checked real written content, not just exit codes: `.cursor/rules/agentsmyth.mdc` exists with correct frontmatter; the isolated `$HOME`'s `~/.claude/CLAUDE.md` contains the real `agentsmyth global gate BEGIN` section with real content, not a stub.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R1 | `grep -n "'src', 'adapters'" bin/agentsmyth.mjs` | no matches |
| R1 | Real `npm pack` tarball contents | `src/adapters/` — 0 files; `src/assets/adapters/` — 15 files |
| R1 | `agentsmyth prepare` against packed install, isolated `$HOME` | completes, 4 gates installed, real content confirmed |
| R1 | `agentsmyth init` against packed install, isolated `$HOME` | completes, zero ENOENT, `.cursor/rules/agentsmyth.mdc` written with real content |
| RI2 | `git diff package.json` | empty |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `npm run build` | R1 | pass | Confirmed `src/assets/adapters/` current before packing. |
| `grep -n "'src', 'adapters'" bin/agentsmyth.mjs` | R1 | pass (no matches) | All 6 sites fixed. |
| `npm pack --pack-destination <scratchpad>` | R1 | pass | Real tarball, 33 total files, 226.1 kB. |
| `tar -tzf <tarball> \| grep -c "^package/src/adapters/"` | R1 | pass | `0` — confirms the exact publish gap. |
| `npm install --install-links <tarball>` (scratch consumer repo) | R1 | pass | Real copy install, not a symlink. |
| `ls node_modules/@jeelvankhede/agentsmyth/src/adapters/cursor/rules/index.mdc` (scratch) | R1 | pass (correctly absent) | Reproduces the user's exact reported ENOENT path. |
| `HOME=<scratch> node .../agentsmyth.mjs prepare` | R1 | pass | 4 global gates installed; Cursor paste-text printed. |
| `HOME=<scratch> node .../agentsmyth.mjs init` | R1 | pass | Zero ENOENT — the exact command that crashed for the user. |
| `git diff package.json` | RI2 | pass (empty) | No dependency change. |

## Dispatch Log

none

## Architecture Notes

- role: Senior Engineer
- decision: Fixed via a pure path swap at the 6 existing call sites rather than introducing a new resolution helper (e.g. a shared `resolveAdapterPath()` function) — the correct target (`src/assets/adapters/`) already exists and is already build-synced; adding an abstraction for 6 call sites that all need the exact same one-segment change would be over-engineering for this scope.
- decision: Verified against a real `npm pack` + `--install-links` scratch install rather than only asserting the fix "should" work — this is the same class of bug (source-tree-only testing missing a publish-boundary defect) that caused the original bug to ship undetected in the first place; re-verifying with the same blind-spot-prone method (dev-tree testing) would not have actually confirmed the fix.
- constraint: `--install-links` was used deliberately over a bare local-path `npm install ../agentsmyth`, which by default creates a symlink and would not have reproduced the bug (a symlinked install exposes the full source tree regardless of `files`).
- downstream: Phase 3 (5-adapter invocation command) will add more `readFileSync(join(pkgRootDir, ...))`-style reads to `runPrepare()` — those new templates must be authored under `src/adapters/<tool>/` (build-synced to `src/assets/adapters/<tool>/` automatically) and read from `src/assets/adapters/`, never `src/adapters/`, to avoid reintroducing this exact bug class for the new files.

## Blockers

none

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Phase 1 - Packaging path fix | complete | 2026-07-21 | All 6 sites fixed; verified against a real packed install with an isolated `$HOME`, reproducing and then resolving the user's exact reported crash. |
