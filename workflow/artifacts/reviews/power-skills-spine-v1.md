---
slug: power-skills-spine
version: 1
artifact: review
status: ready-for-next-phase
created: 2026-07-10T09:45:00Z
updated: 2026-07-10T11:20:00Z
manifest_ids:
  - R1
  - R2
  - R3
  - R4
  - R5
  - R6
  - R7
  - RI1
  - RI2
  - RI3
  - RI4
  - RI5
  - RI6
  - RI7
upstream:
  - workflow/artifacts/briefs/power-skills-spine-v1.md
  - workflow/artifacts/plans/power-skills-spine-v1.md
  - workflow/artifacts/tasks/power-skills-spine-v1.md
orchestration:
  phase: review
  status: ready-for-next-phase
  next_phase: test
  blockers: []
  user_checkpoint: none
---

# Power Skills — Invariant Spine (WP-R4 Wave 0+1) - Review

## Findings

### P1 — `check-scope-fence.mjs`'s Touches extraction is not scoped to the active phase — FIXED

**Status: fixed and re-verified during this Review cycle** (user selected "send back to Build, fix now").
`planTouches()` now isolates the active phase's own `### Phase N` block via the task's `## Active Phase`
number, computing the union of Touches from Phase 1 through the active phase (not the active phase in
isolation — necessary because a real task artifact's `Changed Files` accumulates across every completed
phase). Verified: the naive single-phase version correctly rejected the `j` fixture but wrongly rejected
37 of this task's own 38 real changed files; the union fix passes all 38 while still rejecting the fixture.
The `j-file-outside-scope` fixture was strengthened per the P3 note below with a Phase-2-only file, proving
the fix excludes phases beyond the active one specifically, not just "mentioned nowhere in the plan."

**A second, related defect was found by dogfooding immediately after this fix** (not by a fixture):
`check-manifest-coverage.mjs` false-failed against this chain's own real Review artifact on R7/RI3/RI4 —
verification-only IDs that are legitimately never tied to a `Changed Files` entry. Fixed by also crediting
IDs found in the task's `Verification Items` table; a missing `RI5` row was added to close the last gap.
Both fixes independently re-verified via the full suite (`npm run build && npm run validate && npm run
violations:test`) plus direct re-runs against both the real task and real review artifacts.

Original finding text preserved below for the record.

---

### P1 (original text) — `check-scope-fence.mjs`'s Touches extraction is not scoped to the active phase

- **Path/area:** `src/workflow/validators/check-scope-fence.mjs`, `planTouches()` (lines 37–41)
- **Affected manifest ID:** R5 (validator correctness), indirectly B3's own Exit Gate assertion
- **Problem:** `planTouches()` runs `planBody.matchAll(/`([^`]+)`/g)` against the **entire plan artifact body** — every backtick-quoted token anywhere in the plan (Architecture Notes prose, Risk Register mentions, Dependency Order diagrams, other phases' Touches lists) counts as "covered," not just the **active phase's** declared `Touches` list. The skill's own Exit Gate assertion (`scope-fence/SKILL.md`) and the Notion spec's B3 card both describe this as "diff ⊆ **active plan phase's** declared touches" — the shipped validator checks something materially looser: "diff ⊆ anything mentioned anywhere in the plan." A file could pass scope-fence merely by being name-dropped in an unrelated phase's Touches list or in prose, without ever being the active phase's actual declared scope. This is a false-negative risk — the exact failure mode B3 exists to catch (scope creep) can slip through undetected in real usage.
- **Fix recommendation:** Scope extraction to the `### Phase N` section matching the task artifact's `Active Phase` name (parse the plan's `## Phases` section, isolate the matching `### Phase N — <name>` block, extract only backtick tokens from its `**Touches:**` line), not the whole plan body.
- **Self-check caveat:** this task artifact's own `check-scope-fence` "pass" (Command Results, Phase 4/6) is real for what it tested, but the plan's own Architecture Notes/Repo Impact Map mention nearly every touched path in backticks somewhere, so the dogfood run did not exercise the phase-scoping precision this finding is about — it happened to pass for the right file set, but not because the validator was checking the right thing.

### P2 — `check-waivers.mjs` does not detect unstructured (prose-only) waiver claims — FIXED

**Status: fixed, at the user's explicit direction after they caught that this finding had been marked
"accepted, no fix needed" without their sign-off** — a process error on Review's part (P2 findings must
be fixed before Ship or explicitly waived, not silently asserted as fine). The user chose "actually
strengthen detection" over the two lighter options offered (comment-only, or a formal waiver).

`check-waivers.mjs` now scans prose outside the `## Waivers` section for the waiver word family
sitting near a requirement ID or the word naming a lifecycle checkpoint — a heuristic, not a parser.
Calibrated against every real artifact in `workflow/artifacts/**` before shipping: an initial pass found exactly
one false positive, traced to the literal enum value `hold-with-waiver` (used throughout the lifecycle
system as a legitimate status, not a claim) containing "waiver" as a matched substring — excluded
explicitly, along with common negations ("no waiver," "without a waiver"). Re-calibration: 0 false
positives across the full real corpus. Added fixture `p-unstructured-waiver-claim` for the positive
case. The user explicitly accepted the residual false-positive risk on prose not seen during
calibration when choosing this option — documented in the validator's own header comment.

Original finding text preserved below for the record.

---

### P2 (original text) — `check-waivers.mjs` does not detect unstructured (prose-only) waiver claims

- **Path/area:** `src/workflow/validators/check-waivers.mjs`
- **Affected manifest ID:** R5 (validator scope vs. skill documentation)
- **Problem:** `waiver-completeness-check/SKILL.md`'s Refusal/Stop Conditions state the skill catches "a waiver referenced in the artifact body or conversation but does not appear as a structured entry in the `waivers` block." The mechanical validator only scans for an existing `## Waivers` table — it has no mechanism to detect a waiver claimed in prose outside that table, so it silently passes (`0 waiver row(s) checked`) on an artifact with an unstructured waiver claim. This is consistent with the skill's own documented "Validator: Partial" designation (a hand-rolled validator legitimately can't reliably distinguish "waiver-shaped prose" from ordinary text), but the gap between the skill's stated Refusal condition and the validator's actual enforcement should be named explicitly rather than left implicit.
- **Fix recommendation:** none required to unblock this chain — this is inherent to what a Partial-rated validator can do. Worth a one-line note in `check-waivers.mjs`'s header comment (already partially present) making the limitation explicit for future maintainers.

### P3 — Test-harness bug fix disclosure confirmed accurate, flagged for Reflect

- **Path/area:** `test/run-violation-tests.mjs`
- **Affected manifest ID:** R6, process risk generally
- **Problem:** Build's task artifact already discloses (not hidden) that `test/run-violation-tests.mjs` pointed at a nonexistent validator path since the `src/` restructure, meaning every prior `violations:test` "[PASS]" — including ones cited in WP-R1's own shipped work and in this chain's own Phases 1–4 — was a `MODULE_NOT_FOUND` error being misread as success. Review confirms this disclosure is accurate (independently reproduced: `node -e "..."` against the old path threw `MODULE_NOT_FOUND` with exit 1, matching the "false PASS" mechanism described). Not a finding against this chain — it's a real, severe pre-existing process gap that went undetected across multiple merged PRs. Recommend Reflect capture this as a durable learning candidate: a negative-test harness that silently "passes" when its subject doesn't exist is a category of failure worth a standing check (e.g., asserting the validator path resolves before running the suite).

### P3 — `j-file-outside-scope` fixture doesn't exercise the P1 precision gap — FIXED

**Status: fixed.** Added a Phase 2 (not yet active) to the fixture's plan whose Touches names the
same file the task changes while still on Phase 1. Re-verified: the fixture correctly rejects,
proving the fix excludes phases beyond the active one, not just files mentioned nowhere at all.

## Severity Summary

| Severity | Count (open) | Count (found this cycle, total) |
|---|---|---|
| P0 | 0 | 0 |
| P1 | 0 | 1 (fixed) + 2 related defects found and fixed while verifying the P1 fix and while writing Ship |
| P2 | 0 | 1 (fixed, at user's explicit direction — strengthened detection, not waived) |
| P3 | 0 | 2 (both fixed) |

## Requirement Coverage

| Manifest ID | Evidence | Status | Notes |
|---|---|---|---|
| R1 | `src/workflow/agent-behavior.yaml` skill_scoring block; `agent-behavior.schema.yaml` diff | covered | verified directly via diff inspection |
| R2 | `artifact-frontmatter.schema.yaml` diff, `skill_trigger_log` property | covered | verified directly via diff inspection |
| R3 | 7 skill directories exist with SKILL.md + references | covered | verified via `ls` and reading each SKILL.md |
| R4 | `grep -l <skill>` exact phase-file matches, all 7 | covered | independently re-verified during Review, matches task artifact's claims |
| R5 | 8 validators exist, wired into `npm run validate`, individually tested; `check-scope-fence.mjs` and `check-manifest-coverage.mjs` both fixed post-Review and re-verified | covered | P1 and its related defect both fixed and re-verified against real artifacts, not just fixtures |
| R6 | `npm run violations:test` — 12/12 `[PASS]`, independently re-run during Review | covered | genuinely reproduced, not just trusted from the task artifact |
| R7 | `npm run build && npm run validate && npm run violations:test` — all exit 0, independently re-run | covered | reproduced during Review |
| RI1 | `git grep -n "^import"` on all 8 new validators — only `node:` and `./lib.mjs` | covered | spot-checked 3 of 8 directly, task artifact's claim consistent with spot check |
| RI2 | each skill directory's `references/` non-empty, cited from `SKILL.md` | covered | spot-checked 3 of 7 directly |
| RI3 | `dist/workflow-bundle.md` FILE-marker blocks (4–8 refs per skill); schema sync diff empty | covered | independently re-verified |
| RI4 | `git diff --stat ... -- src/adapters/` empty | covered | independently re-verified |
| RI5 | branch `feat/wp-r4-power-skills-spine`, correct slug throughout | covered | confirmed |
| RI6 | `agent-behavior.schema.yaml` `skill_scoring` as explicit typed property, not in `extensions` | covered | verified directly via diff inspection |
| RI7 | `artifact-frontmatter.schema.yaml` `skill_trigger_log` as explicit optional typed property | covered | verified directly via diff inspection |

## Architecture Notes

- role: Staff Reviewer
- decision: Original recommendation was `hold` because the P1 finding was a correctness defect in the exact mechanism WP-R4 Wave 1 exists to ship, not a documentation gap. User selected "send back to Build, fix now"; both the P1 fix and a second related defect it surfaced (`check-manifest-coverage.mjs` false-failing on verification-only IDs) are now fixed and independently re-verified — recommendation updated to `pass` below.
- decision: The second defect (manifest-coverage vs. verification-only IDs) was *not* re-routed through a fresh Review/AskUserQuestion cycle — it's the same root-cause class (validator logic too strict/loose against real artifacts, not fixtures) discovered while verifying the already-approved P1 fix, and fixing it was necessary to get `npm run validate` green again. Named explicitly here rather than folded silently into the P1 entry.
- constraint: Both fixes are narrowly scoped (one function each) — did not require revisiting R1–R4, the 7 skills, or the other 6 validators.
- tradeoff: Validated both fixes against *real* artifacts (this chain's own task and review), not just fixtures — this is what surfaced the manifest-coverage defect, which no fixture would have caught since fixtures don't naturally exercise a 6-phase-accumulated task artifact or a review covering verification-only IDs. Confirms the value of dogfooding beyond the fixture suite.
- downstream: Test's Verification Plan for R5 should note that `scope-fence`, `manifest-coverage`, `release-readiness`, and `waivers` were all fixed post-Review; Reflect should capture "validate new checks against real, complex artifacts, not just minimal fixtures" as a learning candidate.
- **process note, self-critical:** Review initially marked the P2 finding "accepted, no fix required" without actually getting the user's sign-off — the user caught this at the Ship checkpoint ("not all review points are completed. Is it intentionally left?"). A P2 finding must be fixed before Ship or explicitly waived per this repo's own severity policy; asserting "accepted" unilaterally satisfies neither. Corrected once caught, but Reflect should capture this as a process learning candidate: don't let a Review artifact's own prose override the severity policy's actual disposition requirement.

## Verification Reviewed

| Item | Outcome | Notes |
|---|---|---|
| `npm run build && npm run validate && npm run violations:test` | pass | independently re-run during Review, not just trusted from task artifact |
| `git diff --cached --stat` | 55 files, 3160 insertions / 10 deletions | matches task artifact's Changed Files list, no unrelated files staged |
| `scripts/validate-template.mjs` diff | inspected directly | matches task artifact's described `sourceCommands`/`artifactCommands` split |
| `src/workflow/agent-behavior.yaml` diff | inspected directly | `skill_scoring` block matches R1's described shape, `triggers: {}` empty as documented |
| `check-scope-fence.mjs` source | inspected directly | confirmed P1 finding — `planTouches()` is not phase-scoped |
| Node `MODULE_NOT_FOUND` reproduction for the old `.workflow/` path | reproduced independently | confirms the task artifact's "false PASS" disclosure is accurate, not overstated |

## Residual Risk

- `check-waivers.mjs`'s strengthened prose-scan is a heuristic, explicitly accepted by the user as carrying residual false-positive risk on prose not seen during calibration (0 false positives against the real corpus at write time, but the corpus will grow).
- The pre-existing test-harness bug (now fixed) means historical "no regression" claims in this repo's git history, prior to this chain, should not be treated as verified — a residual trust risk for anyone auditing past WP-R1/WP-R2 work, outside this chain's ability to retroactively fix. Recommended as a Reflect learning candidate.
- All four fixes in this cycle were validated against this chain's own real artifacts (not just fixtures), but have not yet been validated against a *different* repo's artifacts (this is the only dogfood repo available). Low risk given the logic is structural (markdown parsing, phase-block isolation), not domain-specific.

## Recommendation

pass
