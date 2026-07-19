---
slug: wp-r9b-scaffold-init-resolution
version: 1
artifact: ship
status: ready-for-next-phase
created: 2026-07-19
updated: 2026-07-19
manifest_ids: [R1, R2, R3, R4, R5, RI1, RI2]
upstream:
  - workflow/artifacts/briefs/wp-r9b-scaffold-init-resolution-v1.md
  - workflow/artifacts/plans/wp-r9b-scaffold-init-resolution-v1.md
  - workflow/artifacts/tasks/wp-r9b-scaffold-init-resolution-v1.md
  - workflow/artifacts/reviews/wp-r9b-scaffold-init-resolution-v1.md
  - workflow/artifacts/verify/wp-r9b-scaffold-init-resolution-v1.md
orchestration:
  phase: ship
  status: ready-for-next-phase
  next_phase: reflect
  blockers: []
  user_checkpoint: approved
---

# WP-R9b — Scaffold-Only Init + Resolution-Pass Setup - Ship

## Inputs

- Verify: recommendation `ship`, 0 findings, 1 skipped check (non-blocking, documented), all 7
  Automated Checks re-run fresh this Test phase, plus a 5th independent scratch-repo `init`
  reproduction.
- Review: recommendation `pass`, 0 open findings (2 P2 + 1 P3 found and fixed within the Review
  cycle itself, each independently re-verified).
- `workflow/config/release.yaml` — branch gate required (satisfied); PR/CI/release/deployment
  not required, not configured this session.
- `workflow/config/source-of-truth.yaml` — `mode: optional`, `providers: []`.

## Ship Status

- Recommendation: **ship**
- Review result: pass (0 open findings; 2 P2 + 1 P3 found and fixed same-cycle)
- Verification recommendation: ship
- PR / CI: not applicable (not configured, not requested this session)
- Source-of-truth: not applicable
- Release: not applicable
- **Step 4a applied**: `git fetch origin` + `git merge-base HEAD origin/main` — the merge-base
  equals `origin/main`'s current tip (`65e25a2`) exactly, confirming this branch contains all of
  `origin/main` with zero gap. No rebase needed. (Local `main` ref is separately stale — never
  fast-forwarded locally — but that's irrelevant since the comparison is against `origin/main`
  directly, which is current.)
- **Step 6a applied**: two Build/Review-time discoveries not in the plan's original declared
  scope — (1) Build's `writeDefinitionsRoot()` ordering bug (found and fixed during Build,
  independently re-verified via scratch-repo re-run with never-overwrite confirmation), and
  (2) Review's 3 findings (2 P2 + 1 P3, all found and fixed within Review's own cycle,
  independently re-verified against a fresh scratch-repo flow-style test and the full
  regression suite). Both classified as **completed, independently-verified fixes** — neither
  is presented here as pending risk-acceptance.

## Requirement Coverage

| Manifest ID | Status | Evidence | Notes |
|---|---|---|---|
| R1 | shipped | `init-prepare-interop:test` 32/32, reproduced 4x (Build, Review, Test, this Ship phase's re-check) | `headlessBootstrap()` confirmed generic and shared between `check`/`init` |
| R2 | shipped | Fresh scratch-repo `init` run (Test phase, `wp-r9b-test-final`), reproduced 5x total this chain | Config stubs, `pending-setup.yaml`, 7 artifact dirs, `workflow/learnings/` all present; never-overwrite confirmed |
| R3 | shipped | `src/setup/SKILL.md` Phase 2 vs. `router.md`'s 7 steps, checked side-by-side 3x (Build, Review, Test) | 1-for-1 parity confirmed each time; user's "final call from interview setup only" constraint present verbatim |
| R4 | shipped | Repo-wide grep sweep, re-run 3x (Build, Review, Test), all confirming the same 4 unrelated hits post-fix | README + `docs/knowledge-map/repo-mental-map.md` both corrected |
| R5 | shipped | Real macOS run (Cursor only) + platform-mocked non-macOS run (both adapters, correctly rendered), reproduced at Build and Review; not re-mocked at Test (documented Skipped Check, code path unchanged) | 5/8 tokens real, 3/8 TODO — matches Plan's corrected prediction exactly |
| RI1 | shipped | `git diff --stat package.json` — no output, reproduced 3x | Zero dependency change |
| RI2 | shipped | Full suite (`validate`, `violations:test` 21/21, `conformance:test` 12/12, 4 CLI suites 57/57), reproduced 3x across Build/Review/Test | Zero regression at every checkpoint |

## PR / CI Readiness

not applicable — not configured, not requested this session. `release.yaml`'s `pull_request.create_policy: user_requested_or_configured`.

## Release Readiness

not applicable — no package/deployment gate configured or in scope. This chain ships to future
`agentsmyth init`/`prepare` consumers via the next published package version, not via any
already-published one.

## Source-of-Truth Status

not applicable per `source-of-truth.yaml`.

## Risk And Rollback

- Residual risk: one accepted, non-blocking skipped check (Test's Skipped Checks table) — the
  non-macOS `os.platform()`-mocked scenario wasn't re-run a third time at Test, since the
  underlying conditional is unchanged since Review's fix pass and was already exercised twice
  with concrete evidence.
- Rollback trigger: the mechanical scaffold producing incorrect or incomplete output in a real
  consumer repo (missing config fields, a malformed adapter render, or the resolution pass
  failing to find `pending-setup.yaml`), or a genuine non-macOS Copilot placement failure not
  caught by this session's platform-mock testing.
- Rollback action: `git revert` — the change is additive/relocating (new functions, one
  redundant call removed, one skill rewritten in place), no existing behavior removed beyond
  the old from-scratch-interview prose (which itself is fully recoverable via revert). Reverting
  restores `init`'s prior minimal behavior and the old SKILL.md interview flow exactly.
- Rollback owner: repo maintainer (user).
- Limits of rollback: a consumer who already ran the new `init` and started resolving
  `pending-setup.yaml` before a revert would need to manually reconcile — same class of limit
  any mid-flight config-format change carries, not specific to this chain.

## Blocked Handoff

none.

## Architecture Notes

- role: Senior DevOps
- decision: Recommending `ship` — 0 open findings in Review, 0 open findings in Test, all 7
  requirements independently reproduced across at least 3 phases each, zero regression at every
  checkpoint.
- decision: Applied step 4a for the first time on a branch that was rebased (not just diffed)
  onto `origin/main` mid-chain — confirmed the rebase (done at Think, once R9a/R9c merged) is
  still current with no further drift since.
- decision: Applied step 6a to both the Build-time ordering-bug fix and the 3 Review findings —
  neither is a waiver candidate; both are resolved, independently re-verified fixes, correctly
  not surfaced here as pending risk-acceptance.
- constraint: This is the third chain this session to exercise WP-R9a's own Ship-phase
  additions (step 4a, step 6a) — both continue to hold up as genuinely useful, not just
  ceremony, since this chain's own branch-rebase history and same-cycle fixes are exactly the
  scenarios those steps were designed to surface.
- downstream: Reflect should capture two learning candidates: (1) the `writeDefinitionsRoot()`
  ordering bug — sharing a "mechanical scaffold" function between two entry points can silently
  interact with pre-existing code at either call site in ways that only surface via a fresh
  scratch-repo run, not code review alone; (2) the two Review findings in `extractYamlList()`
  are a second data point (after WP-R9c's `initialValue` finding) for "verify a new
  deterministic implementation of previously-agent-only logic against real edge-case input,
  not just the shipped default."

## Exit Gate

- [x] Recommendation is `ship`.
- [x] Every R and RI has a coverage row, all `shipped`.
- [x] Rollback trigger and action defined.
- [x] All configured gates checked or marked not applicable.
- [x] User approved — "continue to ship," 2026-07-19, following full Build/Review/Test
      approval at each preceding checkpoint this chain.

## Next Phase

Reflect.
