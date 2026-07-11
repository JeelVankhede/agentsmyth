---
slug: power-skills-wave2
version: 1
artifact: review
status: ready-for-next-phase
created: 2026-07-10T19:00:00Z
updated: 2026-07-10T19:00:00Z
manifest_ids:
  - R1
  - R2
  - R3
  - R4
  - R5
  - R6
  - R7
  - R8
  - RI1
  - RI2
  - RI3
  - RI4
  - RI5
  - RI6
upstream:
  - workflow/artifacts/briefs/power-skills-wave2-v1.md
  - workflow/artifacts/plans/power-skills-wave2-v1.md
  - workflow/artifacts/tasks/power-skills-wave2-v1.md
orchestration:
  phase: review
  status: ready-for-next-phase
  next_phase: test
  blockers: []
  user_checkpoint: none
---

# Power Skills — Wave 2 (Phase Gates) - Review

## Findings

### P2 — R8's `npm run setup-checks:test` acceptance criterion cannot currently be verified

- **Path/area:** `package.json`, brief R8, task Phase 5
- **Affected manifest ID:** R8
- **Problem:** The brief's R8 explicitly names `npm run build && npm run validate && npm run violations:test && npm run setup-checks:test` as the acceptance command, requiring all four to exit 0. Independently confirmed `setup-checks:test` does not exist in this branch's `package.json` (`grep -n "setup-checks" package.json` → no match). That script ships on the sibling `feat/audit-validator-fixture-gaps` branch (PR #27), not yet merged into this chain's base (`feat/wp-r4-power-skills-spine`). This is a real, external gap this chain cannot close on its own — Build correctly did not fabricate a passing run, and recorded it as a Waivers entry rather than silently marking R8 covered.
- **Fix recommendation:** No in-chain fix available. Before this chain's own PR merges to `main`, either (a) merge PR #27 first and re-run the full four-command suite, or (b) explicitly accept R8 as partial pending that merge, documented in Ship. Recommend option (a) since PR #27 is independent of Wave 2 and unblocks a clean R8.
- **Independent verification:** reproduced the absence directly (`grep -n "setup-checks" package.json` — no output); confirmed the other three commands (`build`, `validate`, `violations:test`) all exit 0, independently re-run during this Review, not just trusted from the task artifact.

### P3 — Recurring range-shorthand habit found again, 2 more instances — FIXED

**Status: fixed during this Review cycle.** `grep -n "R[0-9]–R[0-9]\|R[0-9]-R[0-9]"` against this chain's own artifacts found 2 more instances beyond the one Build already caught and fixed in Phase 1 (`"R1–R4"` in the plan's own Requirement Coverage table): the Phase 2 heading title (`### Phase 2 — ... (R1–R4, RI2)`) and a Dependency Order ASCII-diagram line (`Phase 2 (R1-R4)`). Neither is scanned by any current validator (headings and diagrams aren't parsed for manifest IDs), so both would have shipped silently. Expanded both to literal per-ID lists; re-ran `check-phase-map.mjs` to confirm the heading edit didn't break phase-block parsing (still `ok`, 5 phases, 14 IDs).

- **Path/area:** `workflow/artifacts/plans/power-skills-wave2-v1.md` — Phase 2 heading, Dependency Order diagram
- **Affected manifest ID:** none directly; process risk, third occurrence of the same habit in two chains
- **Problem:** This is now the third time in two consecutive chains (Wave 1's `Changed Files` brace-expansion, Wave 2's own `Requirement Coverage` table shorthand caught in Phase 1, and now these 2 more in Review) that the same range-shorthand habit has appeared. Build's Phase 1 log already named this a "genuine habit gap, not a one-off" and flagged it for Reflect — Review's finding here reinforces that exact conclusion with a third and fourth data point.
- **Fix recommendation:** already applied (see Status above). Reflect must treat this as a confirmed, recurring pattern, not a one-off risk — worth considering whether a cheap grep-based check (not a strict validator, just a `npm run validate` warning) could catch en-dash/hyphen-joined ID pairs anywhere in an artifact, not just in the specific tables current validators scan.

### P3 — 4 Waivers record real, honest out-of-scope work but still await actual user sign-off

- **Path/area:** `workflow/artifacts/tasks/power-skills-wave2-v1.md` — Waivers table (4 rows)
- **Affected manifest ID:** none directly; process risk
- **Problem:** Build's task artifact honestly discloses all 4 Waivers as "not yet explicitly approved by user" — a correct instinct (echoing the exact process gap Wave 1's own Review caught and had to correct: a finding/waiver marked resolved without real user sign-off). Review independently re-verified the factual content of all 4 and found them accurate (see Verification Reviewed), but accuracy is not the same as authorization — the user has not yet actually seen or approved these 4 items in this chain.
- **Fix recommendation:** Surface all 4 explicitly at the Ship checkpoint for real confirmation, not silently treat Review's re-verification as sufficient sign-off. This finding exists specifically so Ship does not skip that step.

## Severity Summary

| Severity | Count (open) | Count (found this cycle, total) |
|---|---|---|
| P0 | 0 | 0 |
| P1 | 0 | 0 |
| P2 | 1 | 1 (real, external, cannot be fixed in-chain — recorded as residual risk, not held) |
| P3 | 1 | 2 (1 fixed — recurring shorthand habit; 1 process reminder — actioned at Ship checkpoint) |

## Requirement Coverage

| Manifest ID | Evidence | Status | Notes |
|---|---|---|---|
| R1 | `src/workflow/skills/requirement-phase-mapper/SKILL.md` + 2 references; wired into `lifecycle-plan/SKILL.md` (`grep -l` exact match) | covered | independently re-read the full SKILL.md; anatomy matches the established 9-section pattern |
| R2 | `src/workflow/skills/plan-assumption-verifier/SKILL.md` + 2 references; wired into `lifecycle-plan/SKILL.md` | covered | independently re-read the full SKILL.md; introduces the `## Assumptions Verified` convention documented in its own `output-schema.md` |
| R3 | `src/workflow/skills/verification-matrix-builder/SKILL.md` + 2 references; wired into `lifecycle-test/SKILL.md` | covered | independently confirmed 9-section anatomy via `grep "^## "` |
| R4 | `src/workflow/skills/follow-up-owner-assigner/SKILL.md` + 2 references; wired into `lifecycle-reflect/SKILL.md` | covered | independently re-read the full SKILL.md |
| R5 | `open-items.schema.yaml` (modeled on `pending-setup.schema.yaml`); `check-open-items.mjs`; real starter `workflow/artifacts/open-items.yaml` | covered | starter ledger's 5 entries independently cross-checked against the real reflect Follow-Ups table and current session fact — see Verification Reviewed |
| R6 | 5 validators exist, wired into `npm run validate`, individually tested before wiring | covered | independently re-ran `npm run validate` — all 5 print `: ok` |
| R7 | 5 negative fixtures (`q`–`u`), registered in `test/run-violation-tests.mjs` | covered | independently re-ran `npm run violations:test` — 19/19, matches task artifact's claim |
| R8 | `npm run build && npm run validate && npm run violations:test` all pass; `npm run setup-checks:test` does not exist on this branch | **partial** | see P2 finding — 3 of 4 named commands verified; the 4th is a real cross-branch dependency, not an in-chain defect |
| RI1 | `git grep -n "^import" src/workflow/validators/check-{phase-map,assumptions,verify-matrix,followups,open-items}.mjs` | covered | independently re-run — only `node:` and `./lib.mjs` imports |
| RI2 | each of the 4 new skill directories' `references/` is non-empty | covered | independently ran `wc -l` on all 8 reference files — none empty (15–45 lines each) |
| RI3 | `dist/workflow-bundle.md` FILE-marker refs per skill; `workflow/schemas/open-items.schema.yaml` exists post-build | covered | independently re-ran `npm run build` and re-checked — 4/4 refs per skill, schema present |
| RI4 | `git diff --stat HEAD~4 -- src/adapters/` and `git status --short src/adapters/` | covered | both independently confirmed empty |
| RI5 | `git branch --show-current` → `feat/wp-r4-power-skills-explorers`; slug `power-skills-wave2` throughout | covered | confirmed |
| RI6 | `open-items.schema.yaml` structurally comparable to `pending-setup.schema.yaml` (`kind`-based, no `orchestration` block) | covered | independently diffed the two schema files' shape |

## Architecture Notes

- role: Staff Reviewer
- decision: Recommendation is `pass-with-risk`, not `hold` — the one P2 finding (R8's missing 4th command) is a genuine external cross-branch dependency this chain cannot resolve on its own, not a defect Build introduced or could have avoided. Holding Build for a script that lives on a different, already-completed sibling branch would block this chain on someone else's merge order rather than on this chain's own correctness.
- decision: Independently re-verified all 4 Waivers' factual claims (schema/code inspection, real `git log`/`git branch` state) rather than trusting the task artifact's self-report — all 4 held up. This mirrors the discipline established across this session (Wave 1's Review independently reproduced claims rather than trusting Build's narrative, which is what caught the original P1/P2 findings there).
- decision: The `open-items.yaml` starter ledger's 2 "done" statuses (OI-3, OI-4) were scrutinized specifically for overclaiming, since their underlying PRs (#26, #27) are confirmed opened but not yet merged (`git log --all --oneline | grep "Merge pull request"` tops out at #25). Concluded "done" is accurate because each item's stated `next_action` text is about deciding-and-opening (OI-3) or performing the audit itself (OI-4), not about the PR merging — a defensible, non-overclaiming read, but noted here explicitly since a future reader of the ledger could reasonably misread "done" as "fully closed including merge."
- constraint: This chain's own dogfooding record (3 real bugs in `check-phase-map.mjs`, 1 real bug in `lib.mjs`'s YAML parser) is unusually strong evidence of the "test against real artifacts, not just fixtures" discipline actually working — every one of those 4 bugs would have shipped silently if only the fixtures in Phase 4 had been written first and trusted alone (confirmed: all 5 Phase 4 fixtures passed on their first draft, meaning none of them would have caught what the real-artifact dogfooding in Phase 3 found).
- downstream: Test/Ship must explicitly surface all 4 Waivers to the user for real sign-off (P3 finding) — do not let Review's independent re-verification substitute for actual user approval. Reflect should capture the R8/cross-branch-dependency situation as a learning candidate: a brief's acceptance criteria can reference a command that does not yet exist on the working branch when work is split across sibling branches — worth naming as a real risk of the current per-work-package branching strategy.

## Verification Reviewed

| Item | Outcome | Notes |
|---|---|---|
| `npm run build && npm run validate && npm run violations:test` | pass | independently re-run during Review; 19/19 violations, all `check-*` lines print `ok` |
| `grep -n "setup-checks" package.json` | no match | independently confirms the P2 finding — script genuinely absent from this branch |
| `git diff --stat feat/wp-r4-power-skills-spine...HEAD` | 32 files, 1245 insertions, 0 deletions | matches the 4 Build-phase commits' combined scope; no unexpected files |
| `open-items.yaml` 5-entry cross-check against `reflect/power-skills-spine-v1.md`'s real Follow-Ups table | all 5 `next_action` texts match verbatim | no fabricated content; only `status` fields were updated from the reflect snapshot |
| `git log --all --oneline \| grep "Merge pull request"` | tops out at #25 | confirms PR #26/#27 (spine, audit chain) are opened but not yet merged — informs the OI-3/OI-4 "done" scrutiny above |
| `ls src/workflow/validators/ \| grep -c check-{waivers,...}` (Waiver 1's A1 claim) | 8 files | independently confirms `power-skills-spine-v1.md`'s retroactive Assumptions-Verified A1 row |
| `grep -c "^### Phase" workflow/artifacts/plans/power-skills-spine-v1.md` + no `-p[0-9]` matches (Waiver 1's A2 claim) | 6 phases, 0 sub-phase matches | independently confirms the A2 row |
| `grep -n '"bin"' package.json`, `grep -c "homedir()" bin/agentsmyth.mjs` (Waiver 1's system-level-install A1/A3 claims) | bin entry present; 6 `homedir()` call sites | independently confirms 2 of the 6 rows; spot-check, not exhaustive |
| `wc -l` on all 8 new reference files | 15–45 lines each, none empty | independently confirms RI2 |

## Residual Risk

- R8 is `partial`, not `covered` — genuinely blocked on PR #27 merging into this chain's base branch. Recommend merging PR #27 before this chain's own PR, then re-running the full 4-command suite as a fast final check (not a new Review cycle).
- All 4 Waivers are factually accurate per independent re-verification but have not yet received actual user sign-off in this chain — carried forward explicitly to the Ship checkpoint (P3 finding), not resolved here.
- `check-waivers.mjs`'s prose-scan heuristic (a pre-existing Wave 1 residual risk, not introduced here) still applies to this chain's own artifacts; re-confirmed 0 false positives against the current real corpus including this chain's own 4 new Waiver rows.
- The `open-items.yaml` "done" semantics (action-completed vs. PR-merged) are correct but implicit — worth a one-line clarifying note in `open-items.schema.yaml`'s `status` field description in a future pass; not blocking for this chain.

## Recommendation

pass-with-risk
