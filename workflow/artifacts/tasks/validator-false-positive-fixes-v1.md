---
slug: validator-false-positive-fixes
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-07-27
updated: 2026-07-27
manifest_ids: [R1, R2, R3, RI1]
upstream:
  - workflow/artifacts/briefs/validator-false-positive-fixes-v1.md
  - workflow/artifacts/plans/validator-false-positive-fixes-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# Validator false-positive fixes (OI-29, OI-37, OI-38) - Task

## Active Phase

- Phase: Phase 3 (of 3)
- Manifest IDs: R2, RI1
- Exit gate: new bullet-boundary fixture proves `Touches:` is bounded; existing `j-file-outside-scope` fixture still fails; new conformance check passes.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Fix check-waivers.mjs "rather than" false positive | complete | R1, RI1 |
| Phase 2 - Fix lifecycle-test's stale Skipped Checks template | complete | R3, RI1 |
| Phase 3 - Fix check-scope-fence.mjs bullet-dash boundary miss | complete | R2, RI1 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `fix/validator-false-positives` (created from `main`, PR #54 already merged) | Clean — `git status --short --branch` showed no uncommitted changes. | No unrelated dirty state present at Build start. |
| At handoff | `fix/validator-false-positives` | 10 files modified, 4 new files/directories untracked (2 fixture dirs, this task's own brief + plan) — all match declared scope below. | Nothing outside scope staged. |

## Scope

- In scope: `src/workflow/validators/check-waivers.mjs`, `src/workflow/validators/check-scope-fence.mjs`, `src/workflow/skills/lifecycle-test/references/{output-schema.md,exemplar.md}`, `test/run-conformance-tests.mjs`, two new fixture directories under `test/fixtures/conformance/`.
- Out of scope, but touched anyway (see Architecture Notes for why): 5 historical plan/task artifacts, corrected to keep `npm run validate` green after R2's fix started correctly enforcing scope it had never enforced before.

## Changed Files

- `src/workflow/validators/check-waivers.mjs` — negation regex gains a `\brather than\b.{0,20}\bwaiv` alternative; updated the file-header comment to match — IDs: R1
- `test/fixtures/conformance/waiver-rather-than/tasks/rather-than-v1.md` — new fixture reproducing the real historical false positive, not a real waiver claim itself (re-derived from commit `f99c388`'s parent, confirmed word-for-word against `git show f99c388~1:workflow/artifacts/tasks/wp-r11-docs-site-v1-p1.md`) — IDs: R1, RI1
- `src/workflow/skills/lifecycle-test/references/output-schema.md` — Skipped Checks table header and prose bullet both updated to 6 columns (added `Manifest IDs`) — IDs: R3
- `src/workflow/skills/lifecycle-test/references/exemplar.md` — same 6-column fix applied to its own Skipped Checks example row (added `R2` as the Manifest IDs value) — a second stale-header instance found by the Plan's own repo-wide grep exit gate, not anticipated in the Repo Impact Map — IDs: R3
- `src/workflow/validators/check-scope-fence.mjs` — `phaseTouches()`'s boundary lookahead now tolerates an optional `- ` bullet-dash before the Work/Exit gate/Why first label; expanded the file comment to explain the failure mode and cite OI-37 — IDs: R2
- `test/fixtures/conformance/scope-fence-bullet-boundary/{plans,tasks}/bullet-boundary-v1.md` — new fixture pair reproducing the bug: a plan whose only phase uses `- Touches:`/`- Work:`/`- **Exit gate:**` (this repo's real convention), with the Exit gate prose citing an unrelated path that a task then also lists as Changed — confirmed this passed silently before the fix — IDs: R2, RI1
- `test/run-conformance-tests.mjs` — three new checks: `r14-rather-than` (R1), `r16-skipped-checks-columns` (R3), `r15-scope-fence-bullet` (R2) — IDs: R1, R2, R3, RI1
- `workflow/artifacts/plans/lifecycle-process-hardening-v1.md` — Phase 1 and Phase 7 Touches each gained the plan's and brief's own paths, which those phases genuinely modified in place but never declared — IDs: R2 (retroactive correction, not part of this chain's own requirements)
- `workflow/artifacts/plans/init-prepare-interop-v1.md` — Phase 5 Touches gained the plan's own path, which its task artifact already documented as a self-amendment "for traceability" but never added to Touches — IDs: R2 (retroactive correction)
- `workflow/artifacts/plans/wp-r11-docs-site-v1.md` — Phase 1 and Phase 2 Touches each replaced an ellipsis/mid-string-wildcard shorthand ("`site/index.md` … `site/in-action.md`", "all 12 `site/*.md` files") with a directory-level `site/` token `check-scope-fence.mjs`'s glob matcher actually recognizes — IDs: R2 (retroactive correction)
- `workflow/artifacts/plans/wp-r9b-scaffold-init-resolution-v1.md` — Phase 5 Touches gained an explicit path for the one doc file its own free-text "any other doc file the grep sweep surfaces" clause found — IDs: R2 (retroactive correction)
- `workflow/artifacts/tasks/src-audit-remediation-v1.md` — corrected three bare validator filenames in its own "Review-fix pass" recap subsection to the same full paths already declared earlier in the same Changed Files section — a task-side formatting fix, not a plan Touches gap — IDs: R2 (retroactive correction)

## Implementation Log

**Phase 1 (R1).** Traced the real historical false positive via `git log --all -S"rather than record" --oneline`, which found commit `f99c388` ("reword p1 task note to clear check-waivers false positive"). Its own commit message confirms the exact gap: the negation regex catches "no/without/not ... waiver" but not "rather than record a waiver". Reconstructed the original flagged text via `git show f99c388~1:...` and reproduced the false positive against current `main` before touching any code — first attempt at a fixture failed to reproduce it because the prose was soft-wrapped across two physical lines in the source file (this validator scans line-by-line, so the R-id and the word "waiver" ended up on separate lines); rewriting the fixture as one unwrapped line reproduced the bug cleanly. Fixed the regex, confirmed the new fixture passes and the existing `waivers-dir`/`table-claim` genuine-claim fixtures still fail.

**Phase 2 (R3).** Updated the Skipped Checks table header and prose bullet in `output-schema.md`. The plan's own exit gate ("grep confirms zero remaining hits for the stale 5-column header anywhere in `src/workflow/`") found a second instance in `exemplar.md` not listed in the Plan's Repo Impact Map — fixed it too, adding `R2` as a plausible Manifest IDs value for that row's already-existing example (cross-checked against the exemplar's own Manifest Coverage table, which lists R2 as the requirement this skipped check's risk note directly restates). `npm run validate` failed after this phase for an unrelated reason: my own Plan artifact was missing the `## Assumptions Verified` section `check-assumptions.mjs` requires whenever an upstream brief declares an assumption (A1) — added it, citing the same `git log`/`git show` evidence from Phase 1, and validate went green.

**Phase 3 (R2) — the one with real scope growth.** Reproduced the bug first: a plan whose only phase uses this repo's real `- Touches:`/`- Work:`/`- **Exit gate:**` convention, with the Exit gate prose citing a path a task then also claims as Changed. Confirmed under current `main` this silently passes (a false negative — the scope-fence gate's actual job). Fixed the lookahead to tolerate an optional `- ` before the boundary label; confirmed the fixture now correctly fails, and the existing `j-file-outside-scope` violation fixture still fails as before.

Running the fixed validator against the real `workflow/artifacts/` tree (not just fixtures — the Plan's own Verification Plan called for this) surfaced 28 previously-hidden violations across 5 historical, already-shipped task artifacts. Paused here and reported this to the user rather than deciding unilaterally, since it was real scope growth beyond the Plan's Repo Impact Map. User directed: correct the plans' Touches lists to accurately declare what they actually touched, rather than waiving the findings or descoping R2. Investigated each of the 5 individually rather than applying one mechanical pattern:

- Two cases (`lifecycle-process-hardening-v1`, `init-prepare-interop-v1`) were tasks modifying their own upstream plan/brief file in place — a real, recurring pattern in this repo's own history that Touches declarations never accounted for. Added the self-referencing paths to the actual phases that made those edits.
- One case (`src-audit-remediation-v1`) was not a plan gap at all: the flagged paths (bare validator filenames) were pure duplicates of paths already correctly declared with full backtick paths earlier in the same task's Changed Files section, re-mentioned by basename in a later "Review-fix pass" recap subsection. Fixed the task's recap bullets to use the same full paths instead of adding phantom Touches to the plan — the honest fix lived on the task side, not the plan side.
- Two cases (`wp-r11-docs-site-v1` Phases 1 and 2) used a Touches shorthand `check-scope-fence.mjs` was never able to parse mechanically: an ellipsis between the first and last of 12 stub files, and a mid-string wildcard (`site/*.md`, which the glob matcher doesn't recognize — it only supports a trailing `*` or `/`). Replaced both with a directory-level `site/` token, which the existing `isCovered()` logic already supports and accurately reflects the real intent (all of `site/`).
- One case (`wp-r9b-scaffold-init-resolution-v1`) had a deliberately open-ended Touches clause ("any other doc file the grep sweep surfaces") that was honest about not knowing the exact file in advance, but produces no backtick token for the validator to match once the sweep found one. Added the specific path the sweep actually found, keeping the original clause for future sweeps.

Re-ran `check-scope-fence.mjs --dir workflow/artifacts` after each correction; confirmed the full real tree is clean (down from 28 issues to 0) before considering Phase 3 done.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R1 | `node src/workflow/validators/check-waivers.mjs --dir test/fixtures/conformance/waiver-rather-than` | exit 0 |
| R1 | `node src/workflow/validators/check-waivers.mjs --dir test/fixtures/conformance/waivers-dir` (and `table-claim`) | still exit 1 (genuine claim still caught) |
| R3 | `grep -rn "Check \| Why Skipped \| Risk \| Owner \| Blocks Ship \|$" src/workflow/` | zero hits |
| R2 | `node src/workflow/validators/check-scope-fence.mjs --dir test/fixtures/conformance/scope-fence-bullet-boundary` | exit 1, citing `scripts/unrelated-check.mjs` |
| R2 | `node src/workflow/validators/check-scope-fence.mjs --dir test/fixtures/lifecycle-violations/j-file-outside-scope` | still exit 1 (real violation still caught) |
| R2 | `node src/workflow/validators/check-scope-fence.mjs --dir workflow/artifacts` | exit 0 (full real tree clean) |
| RI1 | `npm run conformance:test` | 15/15 passed, including 3 new checks |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `AGENTSMYTH_HOME=src/workflow node src/workflow/validators/check-waivers.mjs --dir test/fixtures/conformance/waiver-rather-than` | R1 | pass (exit 0) | Confirmed both pre-fix failure and post-fix pass this session. |
| `node src/workflow/validators/check-scope-fence.mjs --dir test/fixtures/conformance/scope-fence-bullet-boundary` | R2 | pass (exit 1, correct error) | Confirmed both pre-fix silent-pass and post-fix correct failure this session. |
| `node src/workflow/validators/check-scope-fence.mjs --dir workflow/artifacts` | R2 | pass (exit 0) | 28 issues at first fixed run, 1 after 4 corrections, 0 after the 5th. |
| `grep -rn "Check \| Why Skipped \| Risk \| Owner \| Blocks Ship \|$" src/workflow/` | R3 | pass (zero hits, exit 1) | |
| `npm run validate` | R1, R2, R3, RI1 | pass | Full suite, current turn. |
| `npm run violations:test` | RI1 | pass (21/21) | No regression to real-violation fixtures. |
| `npm run conformance:test` | RI1 | pass (15/15) | Includes the 3 new checks for this chain. |

## Waivers

| Waived Gate/Requirement | Reason | Residual Risk | Owner | Follow-up Action | Approval Evidence |
|---|---|---|---|---|---|
| scope-fence (Plan Touches list, Phase 2) — `src/workflow/skills/lifecycle-test/references/exemplar.md` | The Plan's Repo Impact Map only named `output-schema.md` for R3, but the Plan's own exit gate ("grep confirms zero remaining hits for the stale 5-column header anywhere in `src/workflow/`") found a second real instance in `exemplar.md`, not anticipated at Plan time. | Low — single-line table-header + one cell edit, matching the exact fix already applied to `output-schema.md`; `npm run validate` re-ran clean after. | Senior Engineer (this chain) | None — fix is complete. | Not a new decision — directly required by the Plan's own already-approved exit gate wording, not a separate scope call. |
| scope-fence (Plan Touches list, Phase 3) — `workflow/artifacts/plans/lifecycle-process-hardening-v1.md`, `workflow/artifacts/plans/init-prepare-interop-v1.md`, `workflow/artifacts/plans/wp-r11-docs-site-v1.md`, `workflow/artifacts/plans/wp-r9b-scaffold-init-resolution-v1.md`, `workflow/artifacts/tasks/src-audit-remediation-v1.md` | Fixing R2's real bug (Phase 3) surfaced 28 previously-hidden scope-fence violations across 5 historical, already-shipped artifacts — real scope growth beyond this Plan's Repo Impact Map, found mid-Build. Paused and asked the user rather than deciding unilaterally; see this task's own Implementation Log for the full investigation of each of the 5 cases. | Low — each correction is independently justified per file (see Changed Files/Implementation Log): two are self-referencing plan/brief edits the task artifacts already documented as having happened, one is a task-side basename-duplication fix (no plan change), two are Touches-shorthand corrections (ellipsis/mid-string-wildcard → a directory-level token the existing glob matcher already supports). `check-scope-fence.mjs --dir workflow/artifacts` confirmed clean (0 issues) after all 5. | Senior Engineer (this chain) | None — fix is complete; Review should independently check each of the 5 per-file justifications, not just the aggregate "validate is green" outcome. | User directed this resolution explicitly via AskUserQuestion mid-Build: "Correct the plans' Touches lists" — chosen over waiving the 28 findings or descoping R2 entirely. |

## Dispatch Log

none

## Architecture Notes

- role: Senior Engineer
- decision: When Phase 3's fix surfaced 28 pre-existing violations in historical artifacts, stopped and asked the user rather than unilaterally choosing a resolution — this materially changed the chain's scope beyond the Plan's Repo Impact Map (5 files/directories became 10+), which is exactly the kind of mid-Build scope change `workflow/router.md`'s Pause Conditions calls for surfacing, not absorbing silently.
- decision: Investigated each of the 5 historical cases individually rather than applying one mechanical rule — they had 3 different real root causes (self-referencing plan edits, a task-side basename duplication, and two different unparseable Touches shorthands), and forcing one pattern onto all 5 would have produced at least one dishonest "fix."
- constraint: No change to `check-skipped-accounting.mjs`'s logic or `verification.yaml`'s `required_fields` (R3) — confirmed by inspection, only the stale template moved.
- tradeoff: Retroactively editing 5 already-shipped historical artifacts is unusual for this repo (historical artifacts are normally treated as a frozen record), but the alternative — leaving `npm run validate` red, or waiving 28 real findings without explanation — was worse. Every edit is annotated in-place with "added retroactively 2026-07-27" and the reason, so a future reader can tell these weren't part of the original chains.
- downstream: Review should specifically check whether the 5 retroactive corrections are each independently defensible (not just "validate is green again") — this task's Implementation Log and Changed Files list the reasoning per file for exactly that purpose.

## Blockers

none

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Phase 1 - check-waivers.mjs "rather than" fix | complete | 2026-07-27 | R1, RI1 — 13/13 conformance checks passing after this phase. |
| Phase 2 - lifecycle-test Skipped Checks template | complete | 2026-07-27 | R3, RI1 — found and fixed a second stale-header instance (exemplar.md) beyond the Plan's Repo Impact Map; also fixed this task's own Plan artifact missing an Assumptions Verified section. |
| Phase 3 - check-scope-fence.mjs bullet-dash fix | complete | 2026-07-27 | R2, RI1 — real scope growth (5 historical artifacts), resolved per explicit user direction after a mid-Build pause. Full real `workflow/artifacts/` tree confirmed clean. |
