---
slug: init-prepare-interop
version: 1
artifact: review
status: blocked
created: 2026-07-17
updated: 2026-07-17
manifest_ids: [R1, R2, R3, R4, R5, R7, RI1, RI2, RI3, RI4, RI5]
upstream:
  - workflow/artifacts/briefs/init-prepare-interop-v1.md
  - workflow/artifacts/plans/init-prepare-interop-v1.md
  - workflow/artifacts/tasks/init-prepare-interop-v1.md
orchestration:
  phase: review
  status: ready-for-next-phase
  next_phase: test
  blockers: []
  user_checkpoint: none
---

# WP-R7 — System-Install ↔ Per-Repo Init Interoperability - Review

## Findings

Both findings below were fixed in a Build fix pass (Task Phase 9, 2026-07-17), authorized by
the user, and re-verified in this same review pass. Kept as full entries rather than deleted,
per this repo's evidence-over-claims convention — see each finding's **Fix verification**
line for what was actually checked.

### P1-01 (fixed) — Once linked, no per-repo adapter gate can find `workflow/router.md`, because it's never expanded locally

- **Path/area:** `src/adapters/claude/CLAUDE.md`, `src/adapters/codex/AGENTS.md`,
  `src/adapters/copilot/copilot-instructions.md`, `src/adapters/cursor/rules/index.mdc`,
  `src/adapters/windsurf/.windsurfrules`, `src/assets/AGENTS.md` — none of these were touched
  by this diff, and that's the defect.
- **Manifest IDs:** R2, R5 (and the RI2/RI5 acceptance criteria that assume the linked model
  actually works end-to-end)
- **Problem:** Every one of the 5 per-repo adapter gate templates, plus the root `AGENTS.md`
  template, hardcodes the instruction "read `workflow/router.md`" / "load
  `workflow/agent-behavior.yaml`" as a bare, repo-relative path — confirmed by reading all
  six files directly (none contain `definitions_root` or any conditional logic). This diff's
  Phase 2 change to `src/setup/SKILL.md`'s Step 5b makes that exact file **never get
  expanded locally** once `definitions_root` is set (the new default outcome of `init`,
  per R2). The two-root resolver (`defsPath()` in `src/workflow/validators/lib.mjs`) only
  reroutes *validator* file lookups — it has no bearing on how the AI agent itself, reading
  its own per-repo gate file, decides which path to open. So after a consumer runs the new
  `init` and completes setup: their `.claude/CLAUDE.md` (or `AGENTS.md`, or the Cursor/
  Windsurf/Copilot equivalent) tells the agent to read `workflow/router.md` — a file that
  was deliberately never created. The agent either can't find the lifecycle gate at all, or
  has to guess. This defeats the actual point of R2 (a working linked repo) for the primary
  consumer of this whole product: an AI coding agent, not the Node validators.
  I wrote the same unexamined claim into this diff's own documentation twice —
  `docs/knowledge-map/repo-mental-map.md`'s new WP-R7 subsection ("Validators and the agent
  resolve skills and schemas from that global location") and `src/setup/SKILL.md`'s rewritten
  Global Install Note (identical wording) — both assert the agent resolves definitions via
  `defsRoot`, which is not something that exists for the agent's own file-reading process.
  The *old* wording in `src/setup/SKILL.md` (before this diff) was actually more accurate —
  it said only "validators resolve skills and schemas from the global location," correctly
  scoped. This diff's rewrite widened that claim to include "the agent" without building
  anything to make it true.
- **Fix recommendation:** the per-repo gate templates and root `AGENTS.md` need to be able to
  find the lifecycle definitions regardless of link state — e.g., a conditional instruction
  ("read `workflow/router.md` if present; otherwise read `definitions_root` from
  `workflow/config/repo-profile.yaml` and read `<that path>/router.md` instead"), applied to
  all 5 adapter templates plus `src/assets/AGENTS.md`, with `token-map.md` and the render
  step in `src/setup/SKILL.md` updated to match if a build-time token is used instead of a
  runtime-conditional instruction. Whatever the chosen mechanism, it needs the same manual
  end-to-end verification this repo's own Risk Register already calls for (Test phase, real
  agent session) — since no Node script can prove an AI agent successfully followed a gate
  instruction, only that files exist on disk.
- **Fix verification:** all 6 templates (`src/adapters/{claude,codex,copilot,cursor,windsurf}/...`,
  `src/assets/AGENTS.md`) now carry the runtime-conditional fallback (`grep -c
  definitions_root` on each returns ≥ 2, re-checked this pass). The overreaching doc claim in
  `docs/knowledge-map/repo-mental-map.md` and `src/setup/SKILL.md` ("the agent resolves...")
  is now accurate, since the gate itself carries the resolution instruction. **Residual, not
  fully closed:** no script in this repo can prove an AI agent actually follows the new
  conditional instruction correctly in a live session — that remains Test-phase manual QA
  scope (already flagged in the Plan's Risk Register, now doubly relevant). Downgrading this
  from a blocking finding to fixed-with-residual-risk, not fully closed.

### P3-01 (fixed) — `runPrepare()`'s return value is dead

- **Path/area:** `bin/agentsmyth.mjs`
- **Manifest IDs:** none (code quality, not a requirement)
- **Problem:** `runPrepare()` returns `{ globalDir, version }`, documented in its own comment
  as useful for future callers — but neither call site (bare `init`'s auto-link block,
  `headlessBootstrap()`) uses the return value. Both independently recompute
  `join(homedir(), '.agentsmyth', 'workflow')` and re-read `package.json`'s version. Not a
  bug (both computations are equivalent and will always agree), just duplicated work and an
  unused return value that implies a contract nothing honors.
- **Fix recommendation:** either have both call sites destructure and use `runPrepare()`'s
  return value, or drop the return value and the comment claiming it's useful. Non-blocking —
  fine to fold into whatever Build pass addresses P1-01, or leave as a follow-up.
- **Fix verification:** user chose to scope this out after hearing the counter-argument
  (neither call site can rely on the return value exclusively, since the "global install
  already present" branch never calls `runPrepare()` and always needs its own independent
  computation — wiring the return value through would add an `if`/`else` split for a trivial
  saving). `runPrepare()`'s `return` statement and the comment claiming future callers would
  use it were removed instead. `node --check bin/agentsmyth.mjs` confirms no syntax break;
  the full test matrix re-run confirms no behavioral regression.

## Severity Summary

Reflects current open findings, post-fix. Both findings originally found this pass (1 P1,
1 P3) were fixed and re-verified this same session — see each finding's "(fixed)" heading
and its Fix verification line above for what was actually checked.

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |

## Requirement Coverage

| Manifest ID | Evidence | Status | Notes |
|---|---|---|---|
| R1 | `bin/agentsmyth.mjs` `prepare` command + `--system` removal; task Command Results scenarios A/B (4 checks + 3 checks, all pass) | covered | Verified independently by re-reading the diff and re-running `test/run-init-prepare-interop-tests.mjs` |
| R2 | `bin/agentsmyth.mjs` bare-`init` auto-link block; task Command Results scenario C/D/E; test scenarios C/D/E (14 checks, all pass); Phase 9's adapter-template fix + `grep -c definitions_root` re-check | covered | P1-01 fixed — the CLI mechanism was already solid; the adapter gates now carry the fallback instruction closing the gap. Residual: agent-following-instruction can't be script-verified (see P1-01's Fix verification) |
| R3 | `bin/agentsmyth.mjs` `headlessBootstrap()` changes; task Command Results scenarios F/G; test scenarios F/G (7 checks, all pass) | covered | Narrower in scope than R2 — doesn't touch adapter gate files itself, so P1-01 never directly implicated R3's own acceptance criteria |
| R4 | `bin/agentsmyth.mjs:88-98` skew-check block (unchanged, confirmed by direct read); `docs/knowledge-map/repo-mental-map.md`'s new "Version skew" note | covered | A3 (plain warning suffices) confirmed correct by direct inspection |
| R5 | `docs/knowledge-map/repo-mental-map.md` invariant note; `workflow/artifacts/{briefs,plans}/system-level-install-v1.md` RI3 annotations (verbatim preservation confirmed via `grep -ic superseded`); Phase 9's fix makes the invariant statement accurate | covered | P1-01 fixed — the invariant claim about agent-side resolution is now true, not just asserted |
| R7 | `bin/agentsmyth.mjs` `auditStaleDefinitions`/`confirmDeletion`; task Phase 3 log (pty-verified decline/accept); test scenario H (5 checks, pass) | covered | The non-TTY fail-closed property was verified to hold even with `y` piped — stronger than originally planned |
| RI1 | `npm run build`, `npm run validate`, `npm run violations:test`, plus all 4 pre-existing suites and the new suite — all re-run fresh this session both before and after the Phase 9 fix, all pass | covered | Re-ran independently rather than trusting the task artifact's claims alone |
| RI2 | `grep -rn "\-\-system"` repo-wide sweep (task Command Results, Phase 5) confirms zero stale `--system` text remains in source; Phase 9 makes the adapters substantively consistent with the shipped mechanism, not just textually clean | covered | Both the literal (no stale text) and substantive (adapters actually work with the new model) acceptance criteria are now met |
| RI3 | `git diff package.json` shows only a `scripts` addition, no `dependencies`/`devDependencies` change; `node:readline/promises` is a Node core module | covered | |
| RI4 | `git diff src/workflow/schemas/repo-profile.schema.yaml` — no changes in this diff | covered | |
| RI5 | Same evidence as R7 | covered | |

R6 is Ship-owned per the Plan's Phase 8 and this repo's own `rules.md` — not evaluable at
Review; no Build evidence expected for it at this phase.

## Architecture Notes

- role: Staff Reviewer
- decision: Reviewed the full diff directly (not just the task artifact's self-report),
  including re-reading all 5 per-repo adapter templates and `src/assets/AGENTS.md` even
  though none of them appear in `git diff --stat` — the absence of an expected touch is
  itself often the finding, and `verify-manifest-coverage`-style comparison against Changed
  Files alone would never have surfaced P1-01.
- constraint: Re-ran `npm run build`, `npm run validate`, `npm run violations:test`, and
  `npm run init-prepare-interop:test` myself this session rather than trusting the task
  artifact's recorded outcomes — all reproduced cleanly, so RI1's evidence stands independent
  of Build's own claims.
- tradeoff: Considered treating P1-01 as P2 (since the CLI mechanism itself is correct and
  well-tested, and this repo's own dogfooding doesn't hit the bug — this repo's own
  `.claude/CLAUDE.md` already predates WP-R7 and was not regenerated) — rejected: P1-01
  breaks the actual value proposition for any *new* consumer adopting this feature as shipped,
  which is squarely within R2's stated acceptance criteria ("agent resolves skills/schemas
  from the global tree" is asserted in this diff's own docs, not delivered), not a
  speculative edge case.
- assumptions: Test must not treat "validators resolve cleanly" as sufficient evidence that
  R2 works — that was already the trap this review fell into by reading Build's own framing
  first. A real fix requires exercising an actual AI agent session against a freshly-linked
  repo's gate file, not just filesystem/CLI assertions.
- downstream: The user authorized a fix pass for both findings (2026-07-17), choosing the
  runtime-conditional instruction over a build-time token for P1-01, and choosing to scope
  out P3-01's return-value wiring after hearing the counter-argument. Both landed as Task
  Phase 9, added to the Plan as a small amendment (not a Think/Plan revision, since R2/R5's
  acceptance criteria didn't change — only how they're actually satisfied). Re-reviewed in
  this same pass rather than deferring to a separate review cycle.
- decision (re-review): Recommendation changed from `hold` to `pass-with-risk` rather than a
  clean `pass` — the one residual risk (no script can prove an AI agent actually follows the
  new conditional gate instruction) is real and belongs to Test, not something Review can
  wave away just because the text is well-formed and everything else re-validates clean.

## Verification Reviewed

| Item | Outcome | Notes |
|---|---|---|
| `npm run build` | pass (reproduced) | Re-ran this session; `validators/lib.mjs` (generated) confirmed to contain the `prepare` message |
| `npm run validate` | pass (reproduced, after 2 more Review-time fixes) | `check-manifest-coverage` (the `verify-manifest-coverage` skill) found two real traceability gaps this review's own `manifest_ids` selection surfaced: (1) the task's Changed Files section had no entry at all for Phase 3's actual code (`STALE_DEFINITION_NAMES`/`confirmDeletion`/`auditStaleDefinitions`), so `RI5` had zero citation anywhere in the task artifact despite being genuinely resolved by that code — added a Changed Files entry and a Verification Items row; (2) a Plan-amendment bullet's prose ("so R6 has an explicit phase-map entry") tripped the validator's naive `\bR6\b` scan as a false coverage claim — reworded to avoid the bare token. Both are task-artifact bookkeeping fixes, not code changes; re-ran `npm run validate` clean afterward |
| `npm run violations:test` | pass (reproduced) | 20/20, re-ran this session |
| `npm run setup-checks:test`, `setup-refs:test`, `conformance:test`, `root-resolution:test` | pass (reproduced) | 4/4, 5/5, 9/9, 16/16, re-ran this session |
| `npm run init-prepare-interop:test` | pass (reproduced) | 32/32, re-ran this session; confirmed `$HOME/.agentsmyth` still does not exist afterward |
| Task artifact's pty-based migration-prompt verification (Phase 3) | not independently reproduced | The pty harness was a throwaway `/tmp` script, not committed — I did not re-run it. Accepted the task artifact's recorded transcript as sufficient given the non-TTY fail-closed behavior (the safety-critical property) IS independently reproduced via the shipped automated test (scenario H) |
| Direct diff read of all 9 changed source/doc files plus the 6 un-touched adapter/AGENTS.md templates | complete | This is what surfaced P1-01 — not caught by any automated check in this repo, since nothing here validates cross-file consistency between "what Step 5b expands" and "what the adapter gates assume exists" |
| `grep -c definitions_root` on all 6 adapter/AGENTS.md templates (post-fix) | pass (reproduced) | Each returns ≥ 2, confirming the fallback instruction landed everywhere P1-01 named |
| `node --check bin/agentsmyth.mjs` (post-P3-01-fix) | pass (reproduced) | Confirms the dead-code removal didn't break syntax |
| `npm run build && npm run validate && npm run violations:test` (re-run after Phase 9) | pass (reproduced) | Clean; also re-ran the full existing test matrix + `init-prepare-interop:test` (32/32) — no regressions from the fix pass |

## Residual Risk

- **P1-01's underlying gap is fixed, but the fix itself carries one residual risk**: no
  script in this repo can prove an AI agent actually follows the new conditional gate
  instruction ("read X, or if absent read `definitions_root`'s Y") correctly in a live
  session. This is the same class of unprovable-by-script risk every other gate instruction
  already carries — not new — but it's the first time it's load-bearing for whether the
  entire linked-repo model works at all. Owner: Test, via a real agent session against a
  freshly-linked repo, not just filesystem assertions.
- This repo's own `.claude/CLAUDE.md` predates WP-R7 and is not regenerated by this work, so
  this repo's own dogfooding still does not exercise the fixed path — Test should not treat
  "this repo works" as evidence; it needs a fresh consumer-repo-style fixture.
- Concurrent `agentsmyth init`/`agentsmyth prepare` invocations on the same machine (e.g. two
  terminals initializing two repos at the same moment, both racing to install
  `~/.agentsmyth/`) have no locking — low likelihood, low impact (worst case: one process's
  `expandBundle`/`installGateSection` writes interleave with another's; both are idempotent
  overwrites of the same target content, not divergent content, so the result should still be
  internally consistent even if wasteful). Not blocking; worth a Build-time comment if
  revisited, not a finding on its own.
- The Plan's own already-documented residual risks stand: direct Notion writes at Ship could
  go stale if pages changed since Think (mitigated by re-fetch-before-edit, not yet
  exercised since Ship hasn't run); the migration prompt's accept/decline branches have no
  committed automated coverage (mitigated by the non-TTY fail-closed branch being covered,
  plus a documented manual-QA requirement for Test).

## Recommendation

pass-with-risk

Both findings fixed and re-verified this session. The one remaining residual risk (no script
can prove an AI agent follows the new gate instruction correctly) is real, load-bearing, and
explicitly Test's responsibility to close via a real agent session — not a reason to hold at
Review, since everything mechanically verifiable now passes and the fix is the correct,
targeted one for the root cause found.
