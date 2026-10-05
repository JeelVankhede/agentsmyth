---
slug: mandatory-lifecycle-pre-commit-hook
version: 1
artifact: verify
status: done
created: 2026-07-21
updated: 2026-07-21
manifest_ids: [R1, R2, R3, R4, R5, RI1, RI2, RI3, RI4]
upstream:
  - workflow/artifacts/briefs/mandatory-lifecycle-pre-commit-hook-v1.md
  - workflow/artifacts/plans/mandatory-lifecycle-pre-commit-hook-v1.md
  - workflow/artifacts/tasks/mandatory-lifecycle-pre-commit-hook-v1.md
  - workflow/artifacts/reviews/mandatory-lifecycle-pre-commit-hook-v1.md
orchestration:
  phase: test
  status: done
  next_phase: ship
  blockers: []
  user_checkpoint: none
---

# Mandatory Local Lifecycle Pre-Commit Hook - Verification

## Inputs

Task and Review artifacts for this slug; the real global `agentsmyth` CLI (symlinked install, not
just the dev tree); scratch git repos created fresh per scenario in the session scratchpad.

## Automated Checks

| Command | Outcome | Evidence |
|---|---|---|
| `npm run commit-coverage:test` | pass | 7/7 fixture cases (safe-only, trivial-escape, covered-by-real-task, uncovered, draft-only-not-covering, blocked-for-user-only-not-covering) |
| `npm run validate` | pass | Full existing template/example/adapter validation suite, unaffected by this change |
| `npm run violations:test` | pass | 21/21 pre-existing violation fixtures still correctly detected — no regression |
| `node --check bin/agentsmyth.mjs` | pass | Syntax valid after Review's fix |
| `agentsmyth check` (real global CLI) | pass | Confirms the earlier-session validator-resolution fix and this task's `--staged` routing coexist |
| `agentsmyth check --staged` (real global CLI) | pass | New mode works from the real symlinked global install |

## Manifest Coverage

| Manifest ID | How Verified | Evidence | Result | Notes |
|---|---|---|---|---|
| R1 | Manual QA | Fresh scratch repo `agentsmyth init` → `.git/hooks/pre-commit` exists, executable (`755`), no extra step; re-run doesn't duplicate marker (grep count unchanged) | pass | |
| R2 | Command | `npm run commit-coverage:test` 7/7 | pass | |
| R3 | Command (inspection) | `git status --porcelain` / diff for this task's Changed Files — no `.github/workflows/*` entry | pass | |
| R4 | Inspection | Grep of hook template + installer — no new bypass mechanism; `--no-verify` untouched | pass | |
| R5 | Inspection | Grep of validator + hook template for tool names — none found | pass | |
| RI1 | Command (inspection) | `git diff .githooks/pre-commit` — empty | pass | |
| RI2 | Manual QA | Scratch repo with pre-existing custom `pre-commit` (`echo "custom hook ran"`) → content preserved, agentsmyth block appended after it | pass | |
| RI3 | Inspection | Grep — `installPreCommitHook` referenced only in `init` path; zero references in `runPrepare()` | pass | |
| RI4 | Manual QA | Non-git scratch directory → warning printed, `init` still completes (exit 0), `workflow/config/` still scaffolded | pass | |

## Manual QA

- Scenario: fresh `agentsmyth init` in an empty git repo. Environment: scratch dir under session scratchpad, real global `agentsmyth` binary. Steps: `git init -q && agentsmyth init`. Expected: working, executable hook at `.git/hooks/pre-commit` containing the marker block. Observed: exactly that. Outcome: pass. Evidence: `ls -la`/`grep -c` output captured this session.
- Scenario: re-running `init` in the same repo. Expected: no duplicate marker block. Observed: marker count unchanged (2 lines, begin+end) before and after. Outcome: pass.
- Scenario: `init` in a repo with a pre-existing custom `pre-commit` hook. Expected: original content preserved, agentsmyth block appended. Observed: exactly that, full file contents captured this session. Outcome: pass.
- Scenario: `init` in a plain, non-git directory. Expected: non-fatal warning, `init` still completes. Observed: exactly that; `workflow/config/*.yaml` still written. Outcome: pass.
- Scenario (Review fix re-check): `init` in a repo with `core.hooksPath` set to a relative path (`.githooks`, this repo's own real precedent). Expected: hook installs at `<repo>/.githooks/pre-commit`. Observed: exactly that, post-fix. Outcome: pass.

## Generated Output Evidence

Not applicable — no generated-output artifacts are produced or consumed by this work.

## Findings

none — the one finding from Review (P2, absolute-hooksPath handling) was fixed and re-verified during Review itself; nothing new surfaced during Test.

## Skipped Checks

| Check | Why Skipped | Risk | Owner | Blocks Ship | Manifest IDs |
|---|---|---|---|---|---|
| Live test against a real absolute `core.hooksPath` value (vs. reasoning through `isAbsolute()`'s well-defined semantics plus re-verifying the far more common relative case) | Setting up a realistic absolute-hooksPath scratch scenario in this sandbox added little signal beyond what `isAbsolute()`'s documented behavior already guarantees, and the relative case (the one real precedent in this codebase) was re-verified directly | Low — `isAbsolute()` is a standard, well-defined `node:path` built-in; behavior for an absolute path is unambiguous | agent | no | RI4 |
| Live test of a permission-denied / unwritable hooks directory (vs. the non-git-directory case, which exercises the same warn-and-continue code path) | No reliable, reversible way to construct an unwritable directory in this sandboxed environment without risking permission side effects | Low — the same `try/catch`-and-warn code path already covers both "doesn't exist" and "can't create," and was exercised for the non-git case | agent | no | RI4 |

## Architecture Notes

- role: Verifier
- decision: Treated the two skipped checks as acceptable, low-risk, non-blocking gaps rather than fabricating uncertain evidence for scenarios this sandbox can't reliably construct.
- constraint: All verification evidence above reflects commands and manual QA actually run this session, not inferred or assumed outcomes.
- tradeoff: None beyond what's already named in Skipped Checks.
- downstream: None.

## Sign-Off

- Verifier: agent (this session)
- Date: 2026-07-21
- Recommendation: ship
