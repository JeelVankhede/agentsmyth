---
slug: fix-definitions-root-portability
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-07-23
updated: 2026-07-23
manifest_ids: [R1, R2]
upstream:
  - workflow/artifacts/briefs/fix-definitions-root-portability-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
---

# Fix definitions_root Portability (OI-52) - Plan

## Summary

Single-phase fix: change what string `init`/`headlessBootstrap()` write as `definitions_root` from
the expanded `join(homedir(), '.agentsmyth', 'workflow')` to the hardcoded literal
`'~/.agentsmyth/workflow'`, reusing the read-side tilde-expansion already proven for
`workspace_root`. Add a matching automated regression test.

## Inputs

- `workflow/artifacts/briefs/fix-definitions-root-portability-v1.md` (approved)
- `bin/agentsmyth.mjs` — `writeDefinitionsRoot()`, its 2 call sites (`init`, `headlessBootstrap()`)
- `test/run-root-resolution-drift-tests.mjs` — existing `workspace_root` tilde scenario, the
  pattern to mirror

## Requirement Coverage

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R1 | Phase 1 | The write-side fix |
| R2 | Phase 1 | Backward-compat verified in the same phase (no separate work needed — the read side already handles both forms) |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `bin/agentsmyth.mjs` | modify | R1 | The single real call site passes the literal `'~/.agentsmyth/workflow'` string instead of the expanded `globalWorkflowDir` path |
| `test/run-init-prepare-interop-tests.mjs` | modify | R1, R2 | `C4-definitions-root`/`F3-definitions-root` were asserting the bug itself (expanded form) — inverted to assert the portable literal |

## Source-of-Truth Strategy

Single source: `bin/agentsmyth.mjs`.

## Approach

`writeDefinitionsRoot(repoDir, defsRootValue, pkgVersion)` already takes `defsRootValue` as a
parameter — it doesn't need to change at all, since it just writes whatever string it's given.
The fix is entirely at the 2 call sites: instead of passing `globalWorkflowDir` (the expanded
`join(homedir(), '.agentsmyth', 'workflow')`, still needed elsewhere for `existsSync` checks
against the real filesystem path), pass the literal string `'~/.agentsmyth/workflow'` specifically
for the value written into `repo-profile.yaml`. `globalWorkflowDir` itself stays as-is everywhere
else it's used (e.g. checking whether the global install already exists, running `prepare`) —
only the value handed to `writeDefinitionsRoot()` changes.

Read-side compatibility (R2) requires no code change: `resolveValidator()` and `lib.mjs`'s
`_expandTilde` already handle both a `~/`-prefixed string (expand via `homedir()`) and a plain
absolute path (used as-is, since it doesn't match `startsWith('~/')`) — this is inherent to how
the existing conditional already works, not new logic to add.

## Phases

### Phase 1 - Write the portable form

- **Manifest IDs:** R1, R2
- Touches: `bin/agentsmyth.mjs`, `test/run-init-prepare-interop-tests.mjs`
- Work: Change the (single, not two — see note below) `writeDefinitionsRoot()` call site to pass
  the literal `'~/.agentsmyth/workflow'` string. Update regression coverage for the new form.
- Note (added post-hoc, matching actual Build execution): two corrections found during Build,
  not scope creep — (1) there is only **one** real `writeDefinitionsRoot()` call site (inside
  `headlessBootstrap()`; bare `init` calls `headlessBootstrap()` itself rather than calling
  `writeDefinitionsRoot()` separately), simplifying the fix from what this Plan assumed; (2)
  `test/run-root-resolution-drift-tests.mjs` (originally named here) actually tests `repoRoot`
  resolution for the *sibling* `workspace_root` field, not `definitions_root` — the right file to
  update was `test/run-init-prepare-interop-tests.mjs`, whose existing `C4-definitions-root` and
  `F3-definitions-root` checks were asserting the expanded form (the bug itself), not testing the
  fix at all.
- **Exit gate:** Fresh scratch `agentsmyth init` writes `definitions_root: ~/.agentsmyth/workflow`
  verbatim; `agentsmyth check` resolves correctly afterward; a hand-written absolute-path
  `definitions_root` (old form) still resolves correctly; new test scenario passes; full existing
  suite (`npm run validate`, `root-resolution:test`, `init-prepare-interop:test`,
  `setup-validator-definitions-root:test`, `commit-coverage:test`) passes with zero regression.

## Dependency Order

Single phase.

## Branch Strategy

`fix-definitions-root-portability`, branched directly from `origin/main`. PR #45 and PR #46 (which
would otherwise have required stacking, per this session's established pattern) both merged to
`main` before Build started — confirmed via `gh pr view 45`/`46` (`mergedAt` set on both) — so no
stacking is needed; `main` already contains everything either PR touched.

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|
| Windows-specific path-join behavior differs from the `path.win32`/`path.posix` simulation already run this session | Low | Low | Already verified via direct Node module simulation, plus existing, already-passing precedent for the identical pattern (`workspace_root`) | agent | R1 |

## Verification Plan

| Manifest ID | Verification method | Command / Scenario |
|---|---|---|
| R1 | Manual QA + Command | Fresh scratch `init`; new automated root-resolution-drift scenario |
| R2 | Manual QA | Scratch repo with hand-written old-form absolute-path `definitions_root` |

## Architecture Notes

- role: Architect
- decision: No new mechanism — pass a different literal value at 2 call sites, reusing existing read-side logic entirely.
- constraint: Hardcoded literal, never `path.join`-constructed.
- tradeoff: None.
- downstream: None.

## Open Questions

None.

## Checkpoint Approval

- Checkpoint: plan-review
- Status: approved
- User's own words (verbatim, this turn): "Approved, proceed"

## Exit Gate

- [x] Every active R and RI appears in Requirement Coverage, Phases, and Verification Plan.
- [x] User approved or waiver recorded.
