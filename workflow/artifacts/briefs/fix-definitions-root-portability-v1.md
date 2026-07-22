---
slug: fix-definitions-root-portability
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-07-23
updated: 2026-07-23
manifest_ids: [R1, R2]
upstream:
  - user-request
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: brief-review
skill_trigger_log:
  - skill: repo-alignment-scan
    decision: skipped
    reason: "task_class=trivial-in-spirit — single, well-isolated write-side fix in an already-known function (writeDefinitionsRoot()'s callers), root-caused and cross-platform-verified in the immediately preceding conversation turns, not re-derived here."
  - skill: architecture-decision-advisor
    decision: skipped
    reason: "no new architecture — reuses the exact existing tilde-expansion convention already implemented and tested for the sibling workspace_root field."
  - skill: constraint-conflict-scan
    decision: skipped
    reason: "single CLI file change, no domain/protected-path implications."
---

# Fix definitions_root Portability (OI-52) - Brief

## Source Links

- `workflow/artifacts/open-items.yaml` **OI-52** — the original finding, recorded 2026-07-22, describing exactly this bug.
- This session's own live verification (prior turns, not a separate artifact): confirmed via `path.win32.join`/`path.posix.join` simulation that a hardcoded, forward-slash literal `~/.agentsmyth/workflow` string resolves correctly on Windows, Linux, and macOS when read through the existing `startsWith('~/') + join(homedir(), slice(2))` pattern.
- `test/run-root-resolution-drift-tests.mjs`'s `root-drift-polyrepo-tilde-` scenario — this exact tilde-expansion idiom is already implemented, already tested, and already passing for the sibling `workspace_root` field (`repository.workspace_root: ~/...`), including a dedicated regression test written after a real prior bug (`process.env.HOME` vs `homedir()` mismatch, already fixed there).
- `bin/agentsmyth.mjs`'s `writeDefinitionsRoot()`, `headlessBootstrap()`, and bare `init`'s linking step — the 2 real call sites that currently compute and pass the fully-expanded `globalWorkflowDir = join(homedir(), '.agentsmyth', 'workflow')` as the value written into `definitions_root`.

## Problem

`agentsmyth init` (and `headlessBootstrap()`'s equivalent linking step) computes the global definitions directory via `join(homedir(), '.agentsmyth', 'workflow')` — a fully machine-expanded absolute path (e.g. `/Users/jeelvankhede/.agentsmyth/workflow`) — and writes that literal, expanded value into the consumer repo's committed `repo-profile.yaml` as `definitions_root`. Any other contributor, or any CI runner, whose home directory differs from whoever ran `init` gets `global definitions root not found`, because the committed value points at one specific machine, not a portable convention. This was reproduced live on this repo's own `main`/PR #45 dogfooding (fixed there only by removing `definitions_root` entirely from *this* repo's own config, which does not fix the general bug for real consumer repos).

The read side of this is already correct and already proven: `lib.mjs`'s `_expandTilde`, and two call sites in `bin/agentsmyth.mjs`, already expand a `~/`-prefixed string to `homedir()` at resolution time — and this exact idiom is already used, tested, and passing for the sibling `workspace_root` field. The write side simply never produces that portable form for `definitions_root`.

## Goals

- `agentsmyth init`/`headlessBootstrap()` write the literal, portable string `~/.agentsmyth/workflow` into `definitions_root` — never a machine-expanded absolute path.
- This resolves correctly on macOS, Linux, and Windows, verified via `path.win32`/`path.posix` simulation (already done this session) and, ideally, a real automated test mirroring the existing `workspace_root` tilde regression test.
- No change to runtime resolution behavior for a repo whose `repo-profile.yaml` already has an absolute (non-tilde) `definitions_root` value from before this fix — both forms must keep working, since existing consumer repos already have the old, expanded form committed.

## Non-Goals

- Migrating already-`init`'d consumer repos' existing absolute-path `definitions_root` values — a separate decision (noted in OI-52 itself) about whether/how to retrofit already-shipped repos, not part of writing the fix correctly going forward.
- Any change to the read-side tilde-expansion logic itself — it's already correct; this is a write-side-only fix.
- N/A — PR #45 and PR #46 both merged to `main` before this chain started (confirmed via `gh pr view`), so this branches directly from `origin/main`, no stacking needed.

## User Impact

Every future `agentsmyth init` writes a `definitions_root` that works for every contributor and every CI runner on any OS, not just the machine that happened to run `init` first.

## Success Metrics

- A fresh `agentsmyth init` writes `definitions_root: ~/.agentsmyth/workflow` (literal, tilde-prefixed) into `repo-profile.yaml`.
- `agentsmyth check` (and every validator that reads `definitions_root`) resolves this correctly on the current machine.
- A repo-profile.yaml with the *old*, already-expanded absolute-path form still resolves correctly (backward compatibility, no regression for existing consumer repos).
- Full existing regression suite passes, including the pre-existing `root-resolution:test` tilde scenarios.

## Requirements

See Requirement Manifest below.

## Constraints

- CLAUDE.md golden rule 4 (zero runtime dependencies).
- The portable string must be a hardcoded literal (`'~/.agentsmyth/workflow'`), never constructed via `path.join('~', ...)`, which would silently produce a backslash-joined value on Windows and break the existing `startsWith('~/')` check.

## Risks

- Low — this is a narrower, more targeted version of a pattern already implemented and tested elsewhere in this exact codebase (`workspace_root`).

## Open Questions

None.

## Requirement Manifest

### Explicit (R)

- R1: `writeDefinitionsRoot()`'s callers (`init`, `headlessBootstrap()`) write the literal `~/.agentsmyth/workflow` string, not an expanded absolute path, whenever the global install lives at the user's actual home directory (the default case).
  Acceptance: fresh `agentsmyth init` in a scratch repo produces `definitions_root: ~/.agentsmyth/workflow` verbatim in `repo-profile.yaml`; `agentsmyth check` resolves it correctly afterward.
- R2: Backward compatibility — a `repo-profile.yaml` with the old, pre-fix expanded absolute-path form continues to resolve correctly (no regression for already-`init`'d repos).
  Acceptance: a scratch repo with a hand-written absolute-path `definitions_root` (no `~/` prefix) still resolves correctly via `agentsmyth check`.

### Implicit (RI)

none

### Assumptions (A)

none

### Open Questions (Q)

none

## Questions For User

None.

## Architecture Notes

- role: Architect
- decision: Reuse the exact tilde convention already proven for `workspace_root` — no new mechanism.
- constraint: Hardcoded literal string on write, never `path.join`-constructed.
- tradeoff: None.
- downstream: Migrating already-shipped consumer repos' absolute-path values remains a separate, deferred decision (OI-52's own non-goal), not solved by this fix.

## Checkpoint Approval

- Checkpoint: brief-review
- Status: approved
- User's own words (verbatim, this turn): "Approved, proceed"

## Exit Gate

- [x] Every active R and RI has acceptance criteria.
- [x] Blocking Q IDs appear in orchestration.blockers.
- [x] User approved or waiver recorded.
