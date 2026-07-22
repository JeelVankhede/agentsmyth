---
slug: fix-check-config-defs-root
version: 1
artifact: verify
status: complete
created: 2026-07-22
updated: 2026-07-22
manifest_ids: [R1]
upstream:
  - workflow/artifacts/briefs/fix-check-config-defs-root-v1.md
  - workflow/artifacts/plans/fix-check-config-defs-root-v1.md
  - workflow/artifacts/tasks/fix-check-config-defs-root-v1.md
  - workflow/artifacts/reviews/fix-check-config-defs-root-v1.md
orchestration:
  phase: test
  status: complete
  next_phase: ship
  blockers: []
  user_checkpoint: none
---

# Fix check-config.mjs's hardcoded workflow/ root - Verification

## Inputs

Task and Review artifacts for this slug; a real scratch git repo under the session scratchpad;
the real global `agentsmyth` binary and `~/.agentsmyth/workflow/validators/check-config.mjs`
(refreshed via `agentsmyth prepare`).

## Automated Checks

| Command | Outcome | Evidence |
|---|---|---|
| `node src/workflow/validators/check-config.mjs` (plain) | pass | Resolves against this repo's local `workflow/schemas/` |
| `AGENTSMYTH_HOME=src/workflow node src/workflow/validators/check-config.mjs` | pass | Matches `scripts/validate-template.mjs`'s own dogfood invocation |
| `npm run validate` | pass | Full existing suite, no regression |
| `npm run violations:test` | pass | 21/21 |
| `npm run commit-coverage:test` | pass | 7/7 |
| `npm run setup-checks:test` | pass | 4/4 |

## Manifest Coverage

| Manifest ID | How Verified | Evidence | Result | Notes |
|---|---|---|---|---|
| R1 | Manual QA + Command | Fresh scratch `agentsmyth init` (default, `definitions_root`-linked flow), `check-config.mjs` run via the real global install before and after the fix | pass | 6 errors before, 0 after |

## Manual QA

- Scenario: fresh `agentsmyth init` in an empty scratch repo, then `node ~/.agentsmyth/workflow/validators/check-config.mjs` run against it. Environment: session scratchpad, real global `agentsmyth` binary, real `~/.agentsmyth/workflow/` (refreshed via `agentsmyth prepare` after the fix). Steps: `git init -q && agentsmyth init`, then run the validator. Expected (pre-fix): false failures, since `workflow/schemas/` never exists locally for a `definitions_root`-linked repo. Expected (post-fix): zero errors, schemas resolved from `~/.agentsmyth/workflow/schemas/`. Observed: exactly that in both cases — 6 errors pre-fix, 0 post-fix, full output captured this session. Outcome: pass.

## Generated Output Evidence

Not applicable.

## Findings

none

## Skipped Checks

None.

## Architecture Notes

- role: Verifier
- decision: Treated the manual scratch-repo reproduction as sufficient evidence given the mechanical, low-risk nature of the fix and the direct before/after comparison available.
- constraint: All evidence reflects commands actually run this session.
- tradeoff: None.
- downstream: None.

## Sign-Off

- Verifier: agent (this session)
- Date: 2026-07-22
- Recommendation: ship
