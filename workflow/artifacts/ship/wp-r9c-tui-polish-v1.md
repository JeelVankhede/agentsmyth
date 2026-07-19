---
slug: wp-r9c-tui-polish
version: 1
artifact: ship
status: ready-for-next-phase
created: 2026-07-19
updated: 2026-07-19
manifest_ids: [R1, R2, R3, RI1, RI2, RI3]
upstream:
  - workflow/artifacts/briefs/wp-r9c-tui-polish-v1.md
  - workflow/artifacts/plans/wp-r9c-tui-polish-v1.md
  - workflow/artifacts/tasks/wp-r9c-tui-polish-v1.md
  - workflow/artifacts/reviews/wp-r9c-tui-polish-v1.md
  - workflow/artifacts/verify/wp-r9c-tui-polish-v1.md
orchestration:
  phase: ship
  status: ready-for-next-phase
  next_phase: reflect
  blockers: []
  user_checkpoint: approved
---

# WP-R9c — Node TUI Polish (clack + esbuild) - Ship

## Inputs

- Verify: recommendation `ship`, 0 findings, 1 skipped check (non-blocking, documented), all 9
  Automated Checks re-run fresh this Ship phase (applying step 4a below).
- Review: recommendation `pass`, 0 open findings (1 P1 found and fixed within the Review
  cycle itself — the `@clack/prompts` `initialValue` default-flip).
- `workflow/config/release.yaml` — no release gate configured; branch gate required, satisfied.
- `workflow/config/source-of-truth.yaml` — `mode: optional`, `providers: []`.

## Ship Status

- Recommendation: **ship**
- Review result: pass (0 open findings; 1 P1 found and fixed same-cycle)
- Verification recommendation: ship
- PR / CI: not applicable (not configured, not requested this session)
- Source-of-truth: not applicable
- Release: not applicable
- **Step 4a applied** (third time this session): fetched `origin/main`, compared against
  local branch's base — local `main` is byte-identical to `origin/main` (both at `c6b9b7f`),
  no divergence to surface.
- **Step 6a applied**: the one Review finding (the `initialValue` default-flip) was a
  completed, independently-verified fix within the same Build/Review cycle, not a genuinely
  open risk — correctly not presented here as a pending waiver.

## Requirement Coverage

| Manifest ID | Status | Evidence | Notes |
|---|---|---|---|
| R1 | shipped | `initialValue: false` confirmed present in the actual shipped `bin/prompts.mjs`, reproduced 3x (Build, Review, Test) | The P1 fix ships, not just the source-level intent |
| R2 | shipped | `bin/prompts.mjs` genuinely bundled (zero external imports), reproduced 3x | |
| R3 | shipped | Non-TTY branch provably unchanged (diff-based proof), reproduced 3x | |
| RI1 | shipped | `git diff package.json` — `devDependencies` only, reproduced 3x | First dependency (dev-only) this repo has ever taken on |
| RI2 | shipped | Jargon grep across `bin/`, `dist/`, `src/cli/`, reproduced 3x | 2 pre-confirmed benign matches only |
| RI3 | shipped | Full suite + 4 CLI-specific suites, reproduced 3x across Build/Review/Test | Zero regression |

## PR / CI Readiness

not applicable — not configured, not requested this session.

## Release Readiness

not applicable — no package/deployment gate configured or in scope. This chain ships to
future `agentsmyth init`/`prepare` consumers via the next published package version, not via
any already-published one.

## Source-of-Truth Status

not applicable per `source-of-truth.yaml`.

## Risk And Rollback

- Residual risk: one accepted, non-blocking skipped check (Verify's Skipped Checks table) —
  the real interactive TTY path couldn't be exercised in this sandboxed environment. Mitigated
  by verifying everything that *is* testable without a real terminal (branch logic via
  `isCancel()`, the safe-default fix present in the shipped bundle, the non-TTY path provably
  unchanged). The first real interactive session in a real terminal is the genuine first
  end-to-end exercise of this path.
- Rollback trigger: the new clack-based prompt behaving unexpectedly in a real terminal (visual
  glitch, an interaction pattern the sandboxed verification couldn't catch), or the
  `initialValue: false` fix somehow not taking effect in a real session.
- Rollback action: `git revert` — the change is additive/substitutive (new files, one function
  body swapped, one import line swapped), no existing behavior removed beyond the readline
  mechanism itself. Reverting restores the exact prior `[y/N]` readline prompt.
- Rollback owner: repo maintainer (user).
- Limits of rollback: none identified beyond the residual risk already named above.

## Blocked Handoff

none.

## Architecture Notes

- role: Senior DevOps
- decision: Recommending `ship` — 0 open findings, the one real finding (P1) was fixed within
  the same Review cycle and independently re-verified twice more (Test, this Ship phase). The
  one skipped check is low-risk and explicitly documented, not silently absorbed.
- decision: Applied this chain's own step 6a for the first time this session — explicitly
  confirmed the fixed P1 finding is a resolved scope note, not a waiver candidate, before
  writing this Ship Status section. A real, if small, exercise of the rule this same
  work-package family (R9a) added.
- decision: Nothing on this branch is committed yet. User approved proceeding to Reflect
  ("2") without approving a commit in the same reply — treated as two independent decisions,
  not a bundled yes/yes.
- constraint: This branch's own history includes `feat/wp-r9a-adapter-gate-dedup`'s commits —
  named explicitly in the Plan's Branch Strategy, repeated here for visibility: a PR opened
  from this branch would show both chains combined until R9a merges first.
- downstream: Reflect should capture the `initialValue` finding as a durable lesson — a third-
  party library's runtime default behavior isn't always visible from its type signature alone,
  and this repo just took on its first dependency (even dev-only) this session.

## Exit Gate

- [x] Recommendation is `ship`.
- [x] Every R and RI has a coverage row, all `shipped`.
- [x] Rollback trigger and action defined.
- [x] All configured gates checked or marked not applicable.
- [x] User approved proceeding to Reflect — "2," 2026-07-19. Commit/push/PR remain
      separately unrequested.

## Next Phase

Reflect.
