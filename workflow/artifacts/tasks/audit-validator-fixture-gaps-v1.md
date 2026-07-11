---
slug: audit-validator-fixture-gaps
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-07-10T13:35:00Z
updated: 2026-07-10T14:30:00Z
manifest_ids:
  - R1
  - R2
  - R3
  - RI1
  - RI2
  - RI3
upstream:
  - workflow/artifacts/briefs/audit-validator-fixture-gaps-v1.md
  - workflow/artifacts/plans/audit-validator-fixture-gaps-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# Audit Validator Fixture Gaps — Task

## Active Phase

- Phase: Phase 2 - Regression fixture + wire into npm run validate (complete — Build finished)
- Manifest IDs: R3, RI1, RI3
- Exit gate: met.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Fix the two confirmed bugs | complete | R1, R2, RI2 |
| Phase 2 - Regression fixture + wire into npm run validate | complete | R3, RI1, RI3 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `feat/audit-validator-fixture-gaps` | clean except this chain's own brief/plan (untracked, in scope) | branched off `feat/wp-r4-power-skills-spine` per user instruction, needs Wave 1 to exist |

## Scope

- In scope: `check-domain-placeholders.mjs`, `check-setup-complete.mjs` fixes; `check-config.mjs` + `check-domain-placeholders.mjs` wiring into `npm run validate`; a targeted regression fixture + test script for the `check-setup-complete.mjs` regex bug.
- Out of scope: a full synthetic consumer-repo tree for `check-setup-complete.mjs`'s other ~13 checks (Non-Goals); `check-artifacts.mjs`/`check-lifecycle.mjs`/Wave 1 validators (already covered by the prior chain).

## Changed Files

- `src/workflow/validators/check-domain-placeholders.mjs` — excluded `workflow/artifacts/**` from all scans (dev-only, never shipped); changed the standalone "Bare" leakage pattern into a paired check requiring "Fare" to co-occur, since "Bare" alone collides with ordinary English ("Bare init") — IDs: R1
- `src/workflow/validators/check-setup-complete.mjs` — added the `m` (multiline) flag; also switched `\s+\S` to `[ \t]+\S` for the `domain.name`/`domain.summary` non-empty checks, since `\s` matches `\n` and let an empty `summary:` field incorrectly "see" the next line's content as its own value (a third, distinct bug found by the R2 fixture, not just the originally-diagnosed missing-flag issue) — IDs: R2
- `test/fixtures/setup-complete/domain-valid.yaml` — new regression fixture, valid case — IDs: R2
- `test/fixtures/setup-complete/domain-empty.yaml` — new regression fixture, empty case — IDs: R2
- `test/run-setup-complete-tests.mjs` — new test script; runs the real validator against both fixtures in isolated temp dirs rather than duplicating its regex logic — IDs: R2, RI3
- `package.json` — added `setup-checks:test` script — IDs: R2
- `scripts/validate-template.mjs` — added `check-config.mjs` and `check-domain-placeholders.mjs` to `artifactCommands` — IDs: R3

## Implementation Log

**Phase 1 (complete):**
- Confirmed both bugs by direct reproduction before touching code: `check-domain-placeholders.mjs` genuinely failed with 4 issues against real repo state (`node -e` regex reproduction confirmed the missing-`m`-flag hypothesis for `check-setup-complete.mjs` independently, before editing).
- Fixed `check-domain-placeholders.mjs`: added `workflow/artifacts/**` to `excluded`; restructured the "Bare" pattern into `pairedLeakagePattern` requiring co-occurrence with "Fare" — verified the real "fare/bare" pairing (e.g. "the Fare/Bare starter kits") still triggers, via a standalone `node -e` reproduction, and that "Fare" alone doesn't collide anywhere in the real corpus (`grep -rn "\bFare\b"` — zero hits).
- Fixed `check-setup-complete.mjs`: added the `m` flag to both `domain.name`/`domain.summary` regexes.
- Re-ran both directly (not via `npm run validate` yet, per Plan's ordering): `check-domain-placeholders.mjs` now exits 0; `check-setup-complete.mjs` still exits 1 (RI2 preserved) but with 15→13 issues — the 2 false positives gone, all 13 remaining errors are genuine (missing workflow-tree expansion, correct for a dev repo).
- **Wave 1 dogfooding note:** ran `waiver-completeness-check`'s mechanical backing (`check-waivers.mjs`) and `coverage-tracer`'s backing (`check-coverage-ledger.mjs`) against this task artifact as it was being written, same as during the prior chain — see Command Results.

**Phase 2 (complete):**
- Built two minimal fixtures (`domain-valid.yaml`, `domain-empty.yaml`) and a dedicated test script
  that runs the **real** `check-setup-complete.mjs` against each in an isolated temp directory
  (rather than duplicating its regex logic, which would drift from the real behavior over time).
- **Third real bug found by this fixture, immediately on first run:** the `empty-summary` assertion
  failed — `check-setup-complete.mjs`'s `\s+\S` pattern for "has content after the colon" matches
  across line boundaries (`\s` includes `\n`), so a genuinely empty `summary:` field was seen as
  "non-empty" by matching into the *next* line's text. `name:` accidentally avoided this via a
  second fallback regex (`/^  name:\s*$/m`) that `summary:` never had — an asymmetry, not a
  deliberate design choice. Fixed by switching both checks to `[ \t]+\S` (line-scoped), which also
  let the redundant fallback condition be dropped entirely — simpler and more correct than the
  original.
- Confirmed RI2: `check-setup-complete.mjs` still exits 1 against this dev repo, 13 genuine issues
  unchanged, only the 2 targeted false positives gone.
- Wired `check-config.mjs` and `check-domain-placeholders.mjs` into `scripts/validate-template.mjs`'s
  `artifactCommands` array — both check real state directly, no env override needed.
- Full suite re-run: `npm run build && npm run validate && npm run violations:test && npm run
  setup-checks:test` — all exit 0, 14/14 Wave-1 fixtures still pass (no regression), 4/4 new
  setup-complete regression checks pass.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R1 | `node src/workflow/validators/check-domain-placeholders.mjs` | exits 0 |
| R2 | `node src/workflow/validators/check-setup-complete.mjs` domain.name/summary lines | absent from error list |
| RI2 | `node src/workflow/validators/check-setup-complete.mjs` overall exit code | still non-zero, 13 (not 15) issues |
| R3 | `npm run validate` output | `check-config` + `check-domain-placeholders` execute and pass |
| RI1 | `git diff --stat scripts/build-bundle.mjs` | empty |
| RI3 | `grep -n "^import" test/run-setup-complete-tests.mjs` | only `node:` imports |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `node src/workflow/validators/check-domain-placeholders.mjs` (before fix) | Phase 1 | fail (4 issues) | reproduced the bug before fixing |
| `node -e "..."` regex reproduction | Phase 1 | confirmed | isolated the missing-`m`-flag bug independently of the full validator |
| `node src/workflow/validators/check-domain-placeholders.mjs` (after fix) | Phase 1 exit gate | pass | exit 0 |
| `node src/workflow/validators/check-setup-complete.mjs` (after fix) | Phase 1 exit gate | pass (RI2 sense) | still exits 1, 13 genuine issues, domain.name/summary gone |
| `node -e "..."` paired-pattern reproduction | Phase 1 | pass | confirms "Fare"+"Bare" co-occurrence still triggers |
| `node test/run-setup-complete-tests.mjs` (first run, before line-scoping fix) | Phase 2 | 3/4, `empty-summary` failed | surfaced the third bug immediately |
| `node -e "..."` cross-line-match reproduction | Phase 2 | confirmed | isolated the `\s` vs `[ \t]` root cause before editing |
| `node test/run-setup-complete-tests.mjs` (after fix) | Phase 2 exit gate | pass | 4/4 |
| `npm run build && npm run validate && npm run violations:test && npm run setup-checks:test` | Phase 2 gate | pass | all exit 0, no regression |
| `npm run validate` (Test-phase final pass) | Test | **fail** | `check-scope-fence` caught real Plan-vs-Build drift (`domain-empty.yaml` untouched in Plan) |
| `AGENTSMYTH_HOME=src/workflow node src/workflow/validators/check-scope-fence.mjs` (after Plan amendment) | Test | pass | re-verified clean |
| `npm run build && npm run validate && npm run violations:test && npm run setup-checks:test` | Test, final | pass | all exit 0 |

## Dispatch Log

none — single-agent sequential execution, Standard-class task.

## Architecture Notes

- role: Senior Engineer
- decision: Fixed the "Bare" false-positive by requiring co-occurrence with "Fare" (the real leak
  signal) rather than deleting the pattern outright — preserves detection power for genuine leakage
  while removing the ordinary-English collision.
- constraint: `check-setup-complete.mjs`'s dev-repo failure preserved exactly as before except for
  the 2 targeted lines (RI2) — did not touch any of the other ~13 checks.
- downstream: Review must confirm the Wave 1 dogfooding this session is genuine (validators actually
  run against real artifacts, not just mentioned) — this chain's whole purpose is being that real-task
  checkpoint.
- **decision (real-task checkpoint evidence):** this chain is itself the resolved WP-R4 spec's §8
  real-task checkpoint. Result: Wave 1 skills worked correctly throughout (`check-waivers`,
  `check-coverage-ledger` both passed cleanly against real new artifacts, no false positives or
  negatives observed). More importantly, the *practice* of writing fixtures before wiring a
  validator into automation — the same discipline Wave 1 itself used — caught a third real bug
  (the summary line-crossing regex) on the very first test run, immediately. This is the checkpoint
  succeeding: not "Wave 1 had zero problems," but "the discipline Wave 1 established caught a real
  defect before it shipped."
- **decision (strongest single piece of checkpoint evidence):** during final Test-phase verification,
  `check-scope-fence.mjs` — the exact validator whose precision bug the prior chain fixed — caught
  this chain's own real scope drift: `test/fixtures/setup-complete/domain-empty.yaml` was created
  during Build but never added to the Plan's declared Touches. This was not a contrived test; it was
  Wave 1 catching an actual, unplanned file addition in a live session, exactly the failure mode B3
  exists to prevent. Fixed by amending the Plan (legitimate small addition — a fail-case fixture is
  inherent to R2's own acceptance criteria, not scope creep) rather than silently proceeding or
  waiving it away. `check-scope-fence` re-verified clean after the amendment.

## Blockers

none

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Phase 1 - Fix the two confirmed bugs | complete | 2026-07-10T13:40:00Z | both bugs fixed and independently re-verified before moving to Phase 2 |
| Phase 2 - Regression fixture + wire into npm run validate | complete | 2026-07-10T14:10:00Z | found and fixed a third bug via the fixture itself; full suite + new test all green |
