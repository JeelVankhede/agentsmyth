---
slug: fix-check-config-defs-root
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-07-22
updated: 2026-07-22
manifest_ids: [R1]
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
    reason: task_class=trivial-in-spirit (single file, no architectural impact, no callers affected) — the only reason this went through Think/Plan at all is the new mandatory pre-commit hook's mechanical line-count threshold (16 > 15), not real complexity; skipped the scan since the bug and fix were already fully reproduced and root-caused before this brief was written.
  - skill: architecture-decision-advisor
    decision: skipped
    reason: no new architectural surface — reuses lib.mjs's existing defsPath/dataPath two-root resolver exactly as designed elsewhere.
  - skill: constraint-conflict-scan
    decision: skipped
    reason: single validator source file edit, no domain/protected-path implications.
---

# Fix check-config.mjs's hardcoded workflow/ root - Brief

## Source Links

- User's own live testing this session: reported `~/.agentsmyth/workflow/validators/check-config.mjs` (the standalone global install copy) hardcodes `workflowRoot = 'workflow'` instead of using `defsPath`/`dataPath`.
- Reproduced directly: a fresh `agentsmyth init` in a scratch repo (the default, `definitions_root`-linked flow) followed by `node ~/.agentsmyth/workflow/validators/check-config.mjs` produces 6 false "no matching schema" failures on a perfectly healthy install.
- `src/workflow/validators/check-config.mjs` — the actual source of the bug (not just the deployed copy); `src/workflow/validators/lib.mjs`'s `defsPath`/`dataPath` — the already-existing, correctly-designed two-root resolver this file should have used.
- `src/workflow/validators/check-setup-complete.mjs` — a sibling validator that already handles this exact defs/data split correctly (`definitionsRootIsSet()` branch), confirming this is a real, avoidable divergence, not an inherent limitation.

## Problem

`check-config.mjs` hardcodes a single `workflowRoot = 'workflow'` for both config files (which are always repo-local, `dataPath`) and schema files (which live on the definitions side, `defsPath`, for any repo linked to a global install — the *default* `agentsmyth init` flow). It also declares `const repoRoot = process.cwd()` and never uses it — dead code masking that the file never actually consulted the two-root resolver at all. The result: for every normal consumer repo (definitions_root set), `workflow/schemas/` never exists locally, so every schema lookup fails, producing 6 false errors on a perfectly healthy install — directly contradicting README's own "Post-setup validation" instructions, which tell users to run exactly this command.

## Goals

- `check-config.mjs` resolves schemas from `defsPath('schemas')` and config from `dataPath('config')`, matching every other two-root-aware validator in this codebase.
- Running it against a real, freshly-`init`'d, `definitions_root`-linked consumer repo produces zero false failures.
- No regression to this repo's own dogfood usage (`AGENTSMYTH_HOME=src/workflow` override, as `scripts/validate-template.mjs` already uses).

## Non-Goals

- Auditing every other validator for the same class of bug beyond the one sibling (`check-domain-placeholders.mjs`) already spot-checked and confirmed clean, and `check-setup-complete.mjs` already confirmed correct by design.
- Any change to `lib.mjs`'s resolver itself — it's already correct; this fix only makes `check-config.mjs` use it.

## User Impact

Anyone who runs `node workflow/validators/check-config.mjs` (or the global-install copy directly) after a normal `agentsmyth init` now gets an accurate, passing result instead of 6 false failures that could easily be mistaken for a broken install.

## Success Metrics

- Reproduction scenario (fresh `init`, `definitions_root`-linked scratch repo, run `check-config.mjs` from the global install) passes with zero errors after the fix.
- `npm run validate`, `npm run violations:test`, `npm run commit-coverage:test`, `npm run setup-checks:test` all still pass.

## Requirements

See Requirement Manifest below.

## Constraints

- CLAUDE.md golden rule 4 (no runtime dependencies) — uses only already-exported `lib.mjs` functions.
- Edit source only (`src/workflow/validators/check-config.mjs`); `validators/check-config.mjs` (root) and `~/.agentsmyth/workflow/validators/check-config.mjs` are build products, refreshed via `npm run build` + `agentsmyth prepare`, not edited directly.

## Risks

- Low — single-file, mechanical fix reusing an already-proven resolver pattern used elsewhere in the same codebase.

## Open Questions

None.

## Requirement Manifest

### Explicit (R)

- **R1**: `check-config.mjs` resolves schemas via `defsPath('schemas')` and config via `dataPath('config')` instead of a hardcoded `workflow/` root, with no false failures against a real `definitions_root`-linked consumer repo.
  Acceptance: fresh scratch-repo reproduction (documented above) passes with zero errors after the fix; `npm run validate` (which exercises this file with `AGENTSMYTH_HOME=src/workflow`) still passes.

### Implicit (RI)

none

### Assumptions (A)

none

### Open Questions (Q)

none

## Questions For User

none

## Architecture Notes

- role: Architect
- decision: Reuse `defsPath`/`dataPath` exactly as `check-setup-complete.mjs` and others already do — no new mechanism.
- constraint: None beyond existing golden rules.
- tradeoff: None.
- downstream: None — purely additive correctness fix to one validator.

## Checkpoint Approval

- Checkpoint: brief-review
- Status: approved
- User's own words (verbatim, this turn): "yes"

## Exit Gate

- [x] Every active R and RI has acceptance criteria.
- [x] Blocking Q IDs appear in orchestration.blockers.
- [x] User approved or waiver recorded.
