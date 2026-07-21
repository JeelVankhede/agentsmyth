---
slug: wp-r12-local-install-fixes
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-07-21
updated: 2026-07-21
manifest_ids: [R5]
upstream:
  - workflow/artifacts/briefs/wp-r12-local-install-fixes-v1.md
  - workflow/artifacts/plans/wp-r12-local-install-fixes-v1.md
  - workflow/artifacts/tasks/wp-r12-local-install-fixes-v1-p1.md
  - workflow/artifacts/tasks/wp-r12-local-install-fixes-v1-p2.md
  - workflow/artifacts/tasks/wp-r12-local-install-fixes-v1-p3.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# WP-R12 — Local Install Fixes - Task (Phase 4: Checkpoint-Approval Hard Gate)

## Active Phase

- Phase: Phase 4 - Checkpoint-approval hard gate
- Manifest IDs: R5
- Exit gate: `node test/run-checkpoint-approval-tests.mjs` reports 3/3 correct; running the new gate against this WP's own unapproved Plan fails with a specific, correct error; full `npm run validate` and `npm run violations:test` show zero regressions.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Packaging path fix | complete | R1, RI2 |
| Phase 2 - `check-release-readiness.mjs` fixes | complete | R2, R3, RI1 |
| Phase 3 - 5-adapter global invocation command | complete | R4, RI2, RI3, RI4, RI5 |
| Phase 4 - Checkpoint-approval hard gate | complete | R5 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `wp-r12-local-install-fixes` | Phases 1-3 committed (`2466184`, `ae5c47c`, `b71af49`) | |
| At handoff | `wp-r12-local-install-fixes` | `check-lifecycle.mjs`, `rules.md`, 3 output-schema.md files, `package.json`, `ci.yml` modified; 3 fixture dirs + 1 test runner new; brief + plan amended in place (R5 added, Plan's own frontmatter corrected to `blocked-for-user` — see Architecture Notes) | |

## Scope

- In scope: `src/workflow/validators/check-lifecycle.mjs`'s `--phase` gate mode only (not its static contract-check code path); `workflow/rules.md`'s `## Approval` section; the 3 phase skills whose `user_checkpoint` is non-`none` by convention (Think, Plan, Ship); new test fixtures/runner; `package.json`/`ci.yml` wiring; this WP's own Brief/Plan (amended honestly, not retroactively fabricated).
- Out of scope: Review/Test/Build's own `user_checkpoint` (both are `none` by convention — no checkpoint applies, correctly unaffected); any change to the artifact-frontmatter JSON schema (the new section lives in the body, matching this repo's Waivers/Skipped-Checks precedent, not a new frontmatter field).

## Changed Files

- `src/workflow/validators/check-lifecycle.mjs` — new `checkpointApprovalSection()` (body-section parser), `requireCheckpointApproval()` (hard-blocking check), `PLACEHOLDER_EVIDENCE` regex; wired into the existing `--phase` per-artifact loop, right after the existing status-readiness check. — IDs: R5
- `src/workflow/rules.md` — `## Approval` section gains 2 new bullets stating the mechanical enforcement explicitly and forbidding agent self-authorship of evidence. — IDs: R5
- `src/workflow/skills/lifecycle-think/references/output-schema.md` — new required `## Checkpoint Approval` section (body-sections list + Starter Block), explanatory paragraph. — IDs: R5
- `src/workflow/skills/lifecycle-plan/references/output-schema.md` — same. — IDs: R5
- `src/workflow/skills/lifecycle-ship/references/output-schema.md` — same. — IDs: R5
- `test/fixtures/checkpoint-approval/missing/artifacts/briefs/checkpoint-test-v1.md` (new) — negative fixture: declares `user_checkpoint` but has no Checkpoint Approval section. — IDs: R5
- `test/fixtures/checkpoint-approval/mismatched/artifacts/briefs/checkpoint-test-v1.md` (new) — negative fixture: Checkpoint Approval section names a different checkpoint than frontmatter declares. — IDs: R5
- `test/fixtures/checkpoint-approval/valid/artifacts/briefs/checkpoint-test-v1.md` (new) — positive fixture: valid, matching, approved, evidenced section. — IDs: R5
- `test/run-checkpoint-approval-tests.mjs` (new) — standalone test runner (3 cases), using `AGENTSMYTH_WF` per-case override since `check-lifecycle.mjs --phase` mode has no `--dir` flag. — IDs: R5
- `package.json` — new `checkpoint-approval:test` script. — IDs: R5
- `.github/workflows/ci.yml` — new CI step running it. — IDs: R5
- `workflow/artifacts/briefs/wp-r12-local-install-fixes-v1.md` — R5 added to `manifest_ids` and Requirement Manifest; new Problem paragraph documenting the real violation; new Goals bullet; new Checkpoint Approval section citing the user's real, verbatim authorization for R5 specifically. — IDs: R5
- `workflow/artifacts/plans/wp-r12-local-install-fixes-v1.md` — R5 added to `manifest_ids`, Requirement Coverage, Repo Impact Map, new Phase 4, Risk Register, Verification Plan; **frontmatter `status` and `orchestration.status` corrected from `ready-for-next-phase` to `blocked-for-user`, `orchestration.blockers` set to `[plan-review-pending]`**, and an honest (not-approved) `## Checkpoint Approval` section added — see Architecture Notes for why this correction was made rather than left as-is. — IDs: R5

## Implementation Log

- Confirmed the real mechanism `agentsmyth check` actually uses for phase gating: `check-lifecycle.mjs`'s `--phase` mode (not the file's separate static contract-check code path, and not `npm run validate`, which never calls `--phase` mode at all). This is the exact code path invoked every time this session ran `agentsmyth check --phase <X> --slug <Y>` — confirmed by reading the file, not assumed.
- Designed the evidence format as a body section (`## Checkpoint Approval` — Checkpoint / Status / verbatim quote), matching this repo's own established pattern for other evidence-bearing sections (`## Waivers`, `## Skipped Checks`) rather than a terse frontmatter string, since a real user quote can be long and a body section is more auditable.
- Explicitly designed around the user's own stated constraint — "this doesn't mean AI agent can now start flipping statuses too" — by keeping the check narrow: it verifies *form* (section exists, names the matching checkpoint, is marked `approved`, carries non-empty non-placeholder text) but does not and structurally cannot verify that the quoted text is authentic, since the same agent authors the artifact file the validator reads. This limitation is stated explicitly in the validator's own code comments, in `workflow/rules.md`, and in this WP's Plan Risk Register — not glossed over as a complete fix.
- The real defense against agent self-authorship is procedural, not purely mechanical: `workflow/rules.md` now states as a hard rule (same weight as the waiver rules already there) that the agent must never author this evidence itself. The mechanical check's actual job is narrower and more achievable: catch the common failure mode (a checkpoint silently skipped, no evidence at all) as a hard, blocking, impossible-to-rationalize-around failure — which is exactly what happened in this WP before this fix existed.
- **Dogfooded immediately, not just fixture-tested**: ran `agentsmyth check --phase build --slug wp-r12-local-install-fixes` against this WP's own real Plan artifact (Phases 1-3, already built and committed) before writing any fixture. It correctly failed: "declares user_checkpoint 'plan-review' but has no '## Checkpoint Approval' section." This is the real violation the user identified, caught by the real code, against the real artifact — not a synthetic proof.
- Built the 3-fixture regression suite (`missing`, `mismatched`, `valid`) afterward, using `AGENTSMYTH_WF` per-case env override since the generic `run-violation-tests.mjs` harness only supports `--dir`, which `check-lifecycle.mjs --phase` mode doesn't accept (it resolves paths via `${wf}/artifacts/...`, not a `--dir` flag).
- **Did not fabricate retroactive approval for WP-R12's own Plan.** Once the gate correctly identified that Phases 1-3 shipped without real `plan-review`, the honest options were: (a) silently write a plausible-sounding approval quote to make the gate pass, which is exactly the "agent flipping statuses" the user explicitly ruled out, or (b) leave the Plan's frontmatter and Checkpoint Approval section reflecting the true, unresolved state, and surface it to the user directly. Chose (b): corrected the Plan's `status`/`orchestration.status` from `ready-for-next-phase` to `blocked-for-user`, added `blockers: [plan-review-pending]`, and wrote a Checkpoint Approval section that states plainly no real approval exists yet for this Plan. The `build` gate now correctly, honestly fails when re-run.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R5 | `agentsmyth check --phase build --slug wp-r12-local-install-fixes` against this WP's own real (unapproved) Plan | fails with a specific, correct error naming the missing/unapproved checkpoint |
| R5 | `node test/run-checkpoint-approval-tests.mjs` | 3/3 correct (missing → reject, mismatched → reject, valid → pass) |
| R5 | `npm run validate` | zero new failures |
| R5 | `npm run violations:test` | 21/21, unaffected (checkpoint-approval logic only touches `--phase` mode, a separate code path from the static contract check `npm run validate` exercises) |
| R5 | `agentsmyth check --phase review --slug wp-r12-local-install-fixes` (Task artifacts, `user_checkpoint: none`) | unaffected, still passes — confirms no false positives on phases that don't declare a real checkpoint |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `node bin/agentsmyth.mjs check --phase build --slug wp-r12-local-install-fixes` (before fixture-writing, against the real, then-unmodified Plan) | R5 | fail (as intended) | Real dogfooded proof: caught this WP's own real violation, not just a synthetic case. |
| `node test/run-checkpoint-approval-tests.mjs` | R5 | pass | 3/3. |
| `npm run validate` | R5 | pass | Zero new failures. |
| `npm run violations:test` | R5 | pass | 21/21, unaffected. |
| `node bin/agentsmyth.mjs check --phase build --slug wp-r12-local-install-fixes` (after correcting the Plan's frontmatter to `blocked-for-user`) | R5 | fail (correctly, honestly) | Confirms the Plan's own gate now accurately reflects that real `plan-review` has not happened — not silently papered over. |
| `node bin/agentsmyth.mjs check --phase review --slug wp-r12-local-install-fixes` | R5 | pass, unaffected | Task artifacts' `user_checkpoint: none` correctly triggers no checkpoint requirement. |

## Dispatch Log

none

## Architecture Notes

- role: Senior Engineer
- decision: Chose a body section over a frontmatter field for the evidence, matching this repo's own `## Waivers`/`## Skipped Checks` precedent — a verbatim user quote can be long, multi-line, and needs to be read/audited by a human, which body prose serves better than a YAML string field.
- decision: Implemented inside `check-lifecycle.mjs`'s existing `--phase` gate function rather than as a separate standalone validator file. A standalone file (like `check-release-readiness.mjs`) would only run as part of `npm run validate`, which is a softer, non-blocking-by-default check a user could ignore or skip — the user explicitly wants this to be a **hard failure** blocking phase progression, which only the `--phase` gate mode (what `agentsmyth check` and the pre-commit hook actually invoke) can enforce.
- constraint: This check cannot and does not claim to cryptographically verify that quoted evidence is authentic — stated explicitly in three places (code comments, `workflow/rules.md`, this WP's own Plan Risk Register) rather than oversold. The real, non-mechanical defense is the explicit rule forbidding agent self-authorship, now given the same rule-weight as this repo's existing waiver-authenticity rules.
- constraint: Retroactively applying this gate to WP-R12's own Plan revealed that Phases 1-3 were built without real `plan-review` — this was not hidden, worked around, or silently "fixed" by writing plausible approval text. The Plan's frontmatter was corrected to honestly reflect `blocked-for-user`, and real, current approval is being requested from the user directly (see the task-level response, not this artifact) rather than assumed.
- downstream: Reflect should capture this as a genuine example of "dogfooding catching your own mistake in real time" — the checkpoint-approval mechanism, built specifically because of a real violation, immediately and correctly flagged that exact same violation's own artifact before any fixture was even written. That's stronger evidence the mechanism works than any synthetic test could provide.

## Blockers

none

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Phase 1 - Packaging path fix | complete | 2026-07-21 | See `-p1` task artifact. |
| Phase 2 - `check-release-readiness.mjs` fixes | complete | 2026-07-21 | See `-p2` task artifact. |
| Phase 3 - 5-adapter global invocation command | complete | 2026-07-21 | See `-p3` task artifact. |
| Phase 4 - Checkpoint-approval hard gate | complete | 2026-07-21 | Built, tested, and immediately dogfooded against this WP's own real Plan violation. This WP's Plan itself now honestly shows `blocked-for-user` pending real review — Build cannot itself resolve that; it is a user-only action. |
