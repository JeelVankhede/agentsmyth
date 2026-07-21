---
slug: wp-r12-local-install-fixes
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-07-21
updated: 2026-07-21
manifest_ids: [R4, RI2, RI3, RI4, RI5]
upstream:
  - workflow/artifacts/briefs/wp-r12-local-install-fixes-v1.md
  - workflow/artifacts/plans/wp-r12-local-install-fixes-v1.md
  - workflow/artifacts/tasks/wp-r12-local-install-fixes-v1-p1.md
  - workflow/artifacts/tasks/wp-r12-local-install-fixes-v1-p2.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# WP-R12 — Local Install Fixes - Task (Phase 3: 5-Adapter Global Invocation Command)

## Active Phase

- Phase: Phase 3 - 5-adapter global invocation command
- Manifest IDs: R4, RI2, RI3, RI4, RI5
- Exit gate: a scratch-repo run of `agentsmyth prepare` (isolated `$HOME`) writes all 5 new files with correct paths and content; `git status` in the scratch consumer repo shows zero new repo-level files; re-running `prepare` a second time does not duplicate or corrupt any of the 5 files.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Packaging path fix | complete | R1, RI2 |
| Phase 2 - `check-release-readiness.mjs` fixes | complete | R2, R3, RI1 |
| Phase 3 - 5-adapter global invocation command | complete | R4, RI2, RI3, RI4, RI5 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `wp-r12-local-install-fixes` | Phase 1 + 2 committed (`2466184`, `ae5c47c`) | |
| At handoff | `wp-r12-local-install-fixes` | 5 new `src/adapters/<tool>/invocation-*.md` source files; `bin/agentsmyth.mjs` modified (`runPrepare()` extended); `src/assets/adapters/**` build output refreshed via `npm run build` | |

## Scope

- In scope: 5 new source files under `src/adapters/{claude,codex,cursor,windsurf,copilot}/`; `bin/agentsmyth.mjs`'s `runPrepare()` function (new `writeInvocationCommand()` helper + 5 call sites, plus the new console summary block).
- Out of scope: the existing per-adapter gate mechanisms (unchanged — this is a new, additive capability alongside them); Cursor's existing paste-text gate flow (unrelated to Cursor's separate global-commands mechanism this phase uses); Antigravity (explicitly dropped from this WP).

## Changed Files

- `src/adapters/claude/invocation-skill.md` (new) — Claude Code personal Skill content. — IDs: R4
- `src/adapters/codex/invocation-prompt.md` (new) — Codex custom-prompt content. — IDs: R4
- `src/adapters/cursor/invocation-command.md` (new) — Cursor global-command content. — IDs: R4
- `src/adapters/windsurf/invocation-workflow.md` (new) — Windsurf global-workflow content. — IDs: R4
- `src/adapters/copilot/invocation-prompt.md` (new) — Copilot (VS Code) prompt-file content. — IDs: R4
- `bin/agentsmyth.mjs` — `runPrepare()` extended with `writeInvocationCommand()` (strictly additive — never overwrites an existing file, same rule `placeDeterministicAdapters()` already follows) and 5 call sites, one per adapter, Copilot gated by the existing `process.platform === 'darwin'` condition; new console summary block for installed commands. — IDs: R4, RI2, RI3, RI4, RI5

## Implementation Log

- Designed one shared instructional-content core (bootstrap-if-`workflow/config/`-absent via `agentsmyth check`, then load `~/.agentsmyth/workflow/router.md` + `agent-behavior.yaml`, then follow the router-determined phase skill) reusing the exact wording already established in the existing passive gate files (`src/adapters/*/global-gate.md`), reordered to put the bootstrap step first since this is an explicit "start now" action rather than a passive "when you notice this" instruction (RI4).
- Adapted the shared content into 5 tool-specific formats, each based on this session's own researched real mechanism (cited in the brief's Source Links):
  - Claude Code: `name`/`description` YAML frontmatter (SKILL.md convention) — directory name `agentsmyth` under `~/.claude/skills/` becomes the `/agentsmyth` command.
  - Codex: `description` YAML frontmatter (custom-prompt convention) — filename `agentsmyth.md` under `~/.codex/prompts/` becomes `/prompts:agentsmyth` (Codex's own namespaced invocation, not a bare `/agentsmyth`).
  - Cursor: no frontmatter — the whole file content becomes the prompt per Cursor's own documented convention.
  - Windsurf: `description` frontmatter + heading + steps, per Windsurf's own workflow file convention.
  - Copilot: `mode: agent` + `description` frontmatter, per VS Code's prompt-file convention; written to the same directory the existing Copilot gate (`agentsmyth.instructions.md`) already uses, with a `.prompt.md` extension distinguishing it.
- Implemented `writeInvocationCommand()` reading from `src/assets/adapters/` (not `src/adapters/`) — directly applying Phase 1's own lesson, so this new code never reintroduces the exact packaging bug Phase 1 just fixed.
- Ran `npm run build` before any testing to sync the 5 new source files into `src/assets/adapters/`; confirmed via the build script's own `copied ...` log lines that all 5 landed correctly.
- Verified end-to-end against the dev tree (not a packed install — Phase 1 already established the packed-install verification pattern; this phase reuses an isolated `$HOME` but runs directly against source, since the 5 new files are genuinely new content, not a path-resolution bug, so a packed-install re-test would only re-prove Phase 1's already-proven point) with a fresh isolated `$HOME` and a real scratch consumer repo:
  1. `HOME=<scratch> node bin/agentsmyth.mjs prepare` — all 5 "Global invocation commands installed" lines printed.
  2. Read back all 5 written files directly — content matches source exactly for each (spot-checked byte-for-byte via `diff` against the `src/assets/adapters/` source after the fact).
  3. Ran `prepare` a second time — exit 0, and the Claude Code file's content is byte-identical to source after the second run (`diff` clean), confirming the "never overwrite" guard didn't corrupt anything and the write is idempotent.
  4. `cd`'d into the scratch consumer repo itself (not the dev repo) and ran `prepare` from there with the same isolated `$HOME` — `ls`/`git status` in that repo afterward shows only the pre-existing `.git/` directory, zero new repo-level files (RI3).
- `git diff package.json` — empty, confirmed no dependency added (RI2).
- Full `npm run validate` and `npm run violations:test` (21/21) — both clean, no regression from Phase 1/2's work (RI1, carried forward as a standing check).

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R4 | `HOME=<scratch> node bin/agentsmyth.mjs prepare`, all 5 files | each exists at its documented path with correct format/frontmatter/content |
| RI2 | `git diff package.json` | empty |
| RI3 | `cd <scratch-consumer-repo> && HOME=<scratch> node .../agentsmyth.mjs prepare`, then `git status`/`ls` in that repo | zero new repo-level files |
| RI4 | Shared instructional content, all 5 files | present (adapted per format) in every file, confirmed by direct read |
| RI5 | This task artifact / upcoming Ship artifact | Codex deprecation risk named explicitly (see Architecture Notes and brief Risks) |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `npm run build` | R4 | pass | All 5 new source files copied into `src/assets/adapters/`. |
| `node -c bin/agentsmyth.mjs` | R4 | pass | Syntax check. |
| `HOME=<scratch> node bin/agentsmyth.mjs prepare` (1st run) | R4 | pass | 5/5 invocation commands installed, printed in summary. |
| Direct read + `diff` against source, all 5 files | R4, RI4 | pass | Content matches source exactly; shared instructional core present in all 5. |
| `HOME=<scratch> node bin/agentsmyth.mjs prepare` (2nd run) | R4 | pass | Exit 0; `diff` against source still clean — idempotent, no duplication/corruption. |
| `cd <scratch-consumer-repo> && HOME=<scratch> node .../agentsmyth.mjs prepare`, then `git status`/`ls` | RI3 | pass | Zero new repo-level files; only pre-existing `.git/` present. |
| `git diff package.json` | RI2 | pass (empty) | No dependency change. |
| `npm run validate` (full suite) | RI1 | pass | Zero new failures. |
| `npm run violations:test` | RI1 | pass | 21/21. |

## Dispatch Log

none

## Architecture Notes

- role: Senior Engineer
- decision: `writeInvocationCommand()` was added as a small local helper inside `runPrepare()` rather than a shared top-level function, matching this file's existing style of keeping single-purpose helpers close to their one caller (e.g. `renderAdapterTemplate()`).
- decision: Codex's invocation is `/prompts:agentsmyth`, not a bare `/agentsmyth` — this is Codex's own real namespacing convention for custom prompts (confirmed via research, not a design choice this WP made), and the console summary states it explicitly rather than implying uniformity across all 5 tools that doesn't actually exist.
- constraint: Per RI5 and the brief's own Risks section, Codex's custom-prompts mechanism is documented by OpenAI as deprecated in favor of a "skills" concept. This is not fixed or worked around here — building against the currently-working mechanism is the only actionable choice today; the risk is carried forward to Ship with an owner and follow-up, not silently absorbed.
- constraint: A4's limitation (no live-tool verification available in this environment) applies fully to this phase — everything verified above is file placement, content correctness, and idempotency; none of it confirms the `/agentsmyth` command actually appears or fires correctly inside a real running instance of Cursor, Windsurf, VS Code+Copilot, or Codex CLI. Test/Ship must carry this disclosure forward, not narrow it away.
- downstream: If Antigravity support is ever built (explicitly out of scope this WP), this phase's `writeInvocationCommand()` helper and its "strictly additive, read from `src/assets/adapters/`" pattern should be reused directly rather than re-derived.

## Blockers

none

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Phase 1 - Packaging path fix | complete | 2026-07-21 | See `-p1` task artifact. |
| Phase 2 - `check-release-readiness.mjs` fixes | complete | 2026-07-21 | See `-p2` task artifact. |
| Phase 3 - 5-adapter global invocation command | complete | 2026-07-21 | All 5 adapters verified for file placement, content, and idempotency; live in-tool invocation explicitly disclosed as not verifiable in this environment (A4). |
