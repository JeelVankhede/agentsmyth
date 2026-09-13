---
slug: wp-r23-agents-md-fallback
version: 1
artifact: review
status: ready-for-next-phase
created: 2026-09-13
updated: 2026-09-13
manifest_ids: [R1, R2, R3, R4, R5, R6, RI1, RI2, RI3, RI4, RI5, RI6, RI7]
upstream:
  - workflow/artifacts/briefs/wp-r23-agents-md-fallback-v1.md
  - workflow/artifacts/plans/wp-r23-agents-md-fallback-v1.md
  - workflow/artifacts/tasks/wp-r23-agents-md-fallback-v1.md
orchestration:
  phase: review
  status: ready-for-next-phase
  next_phase: test
  blockers: []
  user_checkpoint: none
council:
  mode: single-agent
  resolution:
    dispatch_enabled: optional
    council_enabled: on-for-complex
    task_class: standard
---

# WP-R23 — Generic AGENTS.md Adapter Fallback - Review

## Findings

### F1 — P1 — RESOLVED 2026-09-13 — `src/assets/AGENTS.md` — the block no longer tells a fresh repo to run setup

**Manifest IDs:** R5 (and a brief-level gap, see below)

**Problem.** The old block's step 1 read: *"Check for `.agentsmyth/` — if it exists, read
`.agentsmyth/setup-bundle.md` and run the setup skill. Do not proceed to step 2 until setup is
complete and `.agentsmyth/` is removed."* The rewrite deletes it and nothing replaces it.

This matters **more** after this change, not less, because the file's placement moved. Previously the
block was written by the setup skill at Step 5a — that is, *after* setup finished and `.agentsmyth/`
was already gone, so its step 1 could never fire. It was dead text. Now `init` writes the block
*before* setup runs, so the file exists precisely during the window when `.agentsmyth/` is present —
the first moment that instruction would actually do something — and it is missing.

Consequence for the exact audience this work exists to serve. An agent with no first-class adapter
opens a freshly-initialised repo and reads the only file written for it. It is told to start at
`workflow/router.md`, falls back to `definitions_root`, and reaches the global install — so it will
begin lifecycle work. It is never told to run setup. `.agentsmyth/` is never removed, and
`check-setup-complete.mjs` treats that as an error (`'.agentsmyth/ still exists — agent must delete
it as the final step of Phase 5'`), so the repo sits permanently in a state its own validator reports
as incomplete.

Checked and ruled out as mitigations: the global gates do not carry the trigger either
(`src/adapters/claude/global-gate.md` says only "If `workflow/config/` is absent, run `agentsmyth
check`"), and `init`'s stdout tells the *human* to say "run the agentsmyth setup" — not the agent
reading the file.

**Fix recommendation.** Add the setup trigger back as one sentence, conditional on `.agentsmyth/`
existing. The block is 19 lines against R5's ≤ 25, so there is room without touching that gate.

**Note for Reflect, not for Build.** No `R` or `RI` in the brief ever required setup detection — R5
enumerated four concerns and setup was not among them. Build bounded the block exactly as specified
and still produced this gap, so the omission originates in the brief, not in the implementation.

### F2 — P2 — RESOLVED 2026-09-13 — `src/assets/AGENTS.md` — the hook path is wrong for every consumer

**Manifest IDs:** R4

**Problem.** The block states the hook is at `.githooks/pre-commit`. That path is correct only in
*this* repository, which sets `core.hooksPath=.githooks`. `installPreCommitHook()` resolves the
target as `git config core.hooksPath` when set, otherwise `<repo>/.git/hooks`
(`bin/agentsmyth.mjs`, the `hooksPath` assignment) — so a consumer repo with no `core.hooksPath`
gets the hook at `.git/hooks/pre-commit`.

Verified rather than reasoned: `init` was run in a fresh scratch git repo. The hook landed at
`.git/hooks/pre-commit`; `.githooks/pre-commit` did not exist; and the generated `AGENTS.md` named
`.githooks/pre-commit`. Every consumer therefore receives a block pointing at a file that is not
there.

R4's acceptance was "rendered block contains the hook's path and states that it refuses commits which
skip phases". The block contains *a* path and it is the wrong one, so R4 is met literally and failed
in substance.

**Fix recommendation.** Two options. Either drop the absolute path and describe the hook by what it
is ("a pre-commit hook installed by `agentsmyth init`"), which is true everywhere; or resolve the
real path at write time and pass it through the existing `{{TOKEN}}` mechanism, since
`placeAgentsMd()` already routes the asset through `renderAdapterTemplate()`. The first is smaller
and has no failure mode; the second is more informative. Naming a path at all is only worth doing if
it is the right one.

## Severity Summary

| Severity | Open | Found | IDs | Status |
|---|---|---|---|---|
| P0 | 0 | 0 | — | — |
| P1 | 0 | 1 | F1 | resolved in the Build fix pass |
| P2 | 0 | 1 | F2 | resolved in the Build fix pass |
| P3 | 0 | 0 | — | — |

## Requirement Coverage

| Manifest ID | Evidence | Status | Notes |
|---|---|---|---|
| R1 | `agents-md:test` A1–A4, real `init` in scratch repos | covered | File created, one pair, stamped, hook named — the path itself was F2 and is now resolved. |
| R2 | `agents-md:test` B1–B2, C1–C4 | covered | Idempotent and cross-version replace both proven. Mutation check confirms the suite fails when the tempered pattern is reverted. |
| R3 | `agents-md:test` D1, E1–E4 | covered | Byte preservation proven, including the orphan case that was genuinely broken mid-Build. |
| R4 | Scratch-repo `init`; block path checked against a real file; A4–A5, A7 | covered | F2 resolved: path now resolved per repo via `resolveHooksDir()` and a `{{HOOK_PATH}}` token, verified to name a file that exists. |
| R5 | `wc -l` = 23 against a ≤ 25 gate; A7 | covered | F1 resolved: setup trigger restored as a precondition, still inside the size bound. |
| R6 | Placement present in `bin/agentsmyth.mjs`, absent from `src/setup/SKILL.md` | covered | Both halves verified. |
| RI1 | `src/setup/SKILL.md` diff; `grep` for agent-driven writes | covered | Single writer established; Codex row collapsed. Residual risk below. |
| RI2 | Marker pair documented beside the global-gate table | covered | HTML-comment form retained, consistent with the claude/copilot gates. |
| RI3 | `npm run build`; second build byte-identical | covered | Deterministic. Real guarantee is `release.yml:51`, as the task log records. |
| RI4 | 13 release suites green; `mutation-baseline.json` unmoved | covered | Includes the conformance rule that caught the unwired suite. |
| RI5 | Scratch-repo trial with hand-authored content above and below | covered | Trial, not inspection, as `verification.yaml` requires. |
| RI6 | Skipped check recorded with all six required fields | **partial** | Example coverage deliberately not closed; owner user, `blocks_ship: no`. Correct call — see Residual Risk. |
| RI7 | CHANGELOG 1.1.0 entry; `package.json` version unchanged | covered | Date correctly left for dispatch. |

## Architecture Notes

- role: Staff Reviewer
- **decision** (original review, superseded by the fix pass — recommendation is now `pass`): `hold` rather than `pass-with-risk`. Both findings are in the same file,
  both are small, and both ship *wrong instructions* rather than merely incomplete ones — a block that
  names a nonexistent hook path and omits the one step a fresh repo must take is worse than no block,
  because it will be trusted. Neither is a design flaw; the architecture underneath them is sound.
- **constraint**: Review is read-only. Both fixes are Build's to make.
- **downstream**: Test should re-run `agents-md:test` after the fixes and add an assertion that the
  block's hook path resolves to a file that actually exists in the scratch repo — the current A4 check
  asserts the *string* is present, which is exactly why F2 survived Build with a green gate.

## Verification Reviewed

| Item | Outcome | Notes |
|---|---|---|
| `npm run validate` | pass | Exit 0 at review time. |
| `npm run violations:test` | pass | Exit 0. |
| `npm run conformance:test` | pass | Exit 0 — after the Phase 4 amendment wired the new suite into both workflows. |
| `npm run agents-md:test` | pass | 17/17. |
| Full 13-suite release list | pass | All green at Build handoff. |
| `check-scope-fence` | pass | Against the amended plan. |
| Mutation check on the new suite | pass | Reverting the tempered pattern fails E1/E2/E4 and leaves A–D green; restored copy byte-identical. Confirms the suite is load-bearing. |
| `test/mutation-baseline.json` | unchanged | No validator rule added, so the ratchet must not move — it did not. |
| A4 hook-path assertion | **inadequate** | Asserts the literal string is present, not that it resolves. This is the gap F2 slipped through. |

## Residual Risk

1. **`check-setup-complete`'s adapter check is now trivially satisfied.** `init` always writes
   `AGENTS.md`, and `AGENTS.md` is one of five entries in that validator's `adapterPaths`, so
   "at least one tool-native adapter present" can no longer fail. Accepted by the user via Q2 and
   recorded in the plan's Approach; every repair considered was worse. Owner: user. Does not block ship.
2. **RI6 — no example-repo coverage.** Deliberate, and the right call: `check-domain-placeholders`
   excludes `^examples/` and `validate-example.mjs` has no `AGENTS.md` handling, so a fixture would
   have produced the appearance of coverage with none behind it. Partially offset by
   `agents-md:test`, which exercises real scratch repos. Owner: user. Does not block ship.
3. **The version stamp is written but never read.** Nothing in the codebase parses a version out of a
   marker today; the stamp is provision for WP-R18. Its correctness in the direction that matters —
   a future release reading the stamp and migrating from it — is therefore untested, and will stay
   that way until something consumes it. Not actionable now; worth carrying to WP-R18.
4. **Plan amendment during Build.** Two workflow files were added to an approved plan's Phase 4
   touches. Recorded with a dated amendment block and surfaced to the user rather than absorbed. The
   underlying cause is worth noting: every per-phase gate was green while a registered suite ran
   nowhere, and only the full release list caught it.

## Fix Pass Verification (2026-09-13)

Both findings were returned to Build at the user's instruction and closed. Re-reviewed against the
resulting diff, not against the fix description:

| Finding | Fix | Evidence |
|---|---|---|
| F1 | Setup trigger restored as a precondition; block 19 → 23 lines | A7 asserts it in the written block; R5's ≤ 25 gate still met |
| F2 | `resolveHooksDir()` extracted and shared by the writer and the advertiser; `{{HOOK_PATH}}` token | Scratch repo: block names `.git/hooks/pre-commit`, file exists there |

The structural cause of F2 was duplication — two places independently deciding where the hook lives.
The fix removes the duplication rather than correcting one copy, so the two cannot drift again. That
is the right shape of fix and is why this re-review does not carry F2 forward as residual risk.

The assertion that allowed F2 through a green gate was replaced rather than supplemented: A4's
hardcoded string comparison became A4/A5 (a path is named, and it resolves), plus A6 guarding a
failure mode the fix itself introduced — an unrendered `{{TOKEN}}` reaching a consumer's file. Both
fixes were mutation-proven: reverting the token fails A5 at 19/20, restoring returns 20/20 with the
asset byte-identical.

Residual risks 1–4 below are unchanged by the fix pass and remain as recorded.

## Recommendation

pass
