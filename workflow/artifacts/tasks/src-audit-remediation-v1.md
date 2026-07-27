---
slug: src-audit-remediation
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-07-15T13:50:00Z
updated: 2026-07-15T13:50:00Z
manifest_ids:
  - R1
  - R2
  - R3
  - R4
  - R5
  - R6
  - R7
  - R8
  - R9
  - R10
  - R11
  - R12
  - R13
  - RI1
  - RI2
  - RI3
  - RI4
upstream:
  - workflow/artifacts/briefs/src-audit-remediation-v1.md
  - workflow/artifacts/plans/src-audit-remediation-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# Src Audit Remediation — Task (all Build phases)

Single-file task record for the whole Build (the `-p<P>` split was dropped — see R11 below; and the
validators reject that suffix until R11 lands, which this chain both proves and fixes).

## Active Phase

- Phase: Phase 5 - Rebuild, integrate & verify (complete — all 5 Build phases done)
- Manifest IDs: RI1, RI2, RI4
- Exit gate: `npm run build` clean, adapters byte-identical, zero deps, full suite green.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Setup-reference accuracy | complete | R1, R2, R3, R8 |
| Phase 2 - Waived-Test contract | complete | R4 |
| Phase 3 - Adapter parity | complete | R5 |
| Phase 4 - Enforcement, conformance + consistency | complete | R6, R7, R9, R10, R11, R12, R13, RI3 |
| Phase 5 - Rebuild, integrate & verify | complete | RI1, RI2, RI4 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `fix/src-audit-remediation` | clean except this chain's brief/plan (untracked) | No unrelated user changes to preserve. |
| At handoff | `fix/src-audit-remediation` | source edits + regenerated build products + chain artifacts | `npm run validate` + all 5 test suites green; nothing committed. |

## Scope

- In scope: all 13 R + 4 RI from the plan, across the five build phases.
- Out of scope: committing/pushing (Ship-owned); the `format: date-time` enforcement (RI3 tracked as
  Reflect follow-up, not implemented — see Non-Goals).

## Changed Files

- `src/workflow/validators/check-setup-refs.mjs` — new schema-driven setup-ref guard — IDs: R8
- `src/setup/references/config-map.md` — fields rewritten to real schema shapes — IDs: R1
- `src/setup/references/token-map.md` — token field sources corrected — IDs: R2
- `src/setup/SKILL.md` — pending-setup example field paths corrected — IDs: R3
- `src/workflow/schemas/pending-setup.schema.yaml` — `field` description example corrected — IDs: R3
- `scripts/validate-template.mjs` — wired `check-setup-refs` — IDs: R8
- `package.json` — added `setup-refs:test` + `conformance:test` scripts — IDs: R8, R12
- `test/fixtures/setup-refs/` — seeded-wrong-field fixture — IDs: R8
- `test/run-setup-refs-tests.mjs` — R8 regression test — IDs: R8
- `src/workflow/skills/lifecycle-test/SKILL.md` — Test-skip contract section — IDs: R4
- `src/workflow/skills/lifecycle-ship/SKILL.md` — accept a skipped-Test verify via the exemption path — IDs: R4
- `src/workflow/router.md` — Standard/Test-skip clarification — IDs: R4
- `src/assets/AGENTS.md` — step-3 Test-skip note — IDs: R4
- `src/adapters/cursor/rules/index.mdc` — mandatory-gate line — IDs: R5
- `src/adapters/windsurf/.windsurfrules` — mandatory-gate line — IDs: R5
- `src/workflow/validators/check-skill-triggers.mjs` — completeness for mandated-phase skills — IDs: R6
- `src/workflow/agent-behavior.yaml` — narrowed skill_scoring comment — IDs: R6
- `src/workflow/skills/lifecycle-think/SKILL.md` — Exit Gate wording matches enforcement — IDs: R6
- `src/workflow/lifecycle.md` — Test upstream row matches hard gate — IDs: R7
- `src/workflow/skills/lifecycle-think/references/output-schema.md` — upstream array + role + manifest_ids note + skill_trigger_log stub — IDs: R9, R6, RI3
- `src/workflow/skills/lifecycle-plan/references/output-schema.md` — upstream array + bold phase labels — IDs: R9, R13
- `src/workflow/skills/lifecycle-build/references/output-schema.md` — upstream array — IDs: R9
- `src/workflow/skills/lifecycle-review/references/output-schema.md` — upstream array — IDs: R9
- `src/workflow/skills/lifecycle-test/references/output-schema.md` — upstream array — IDs: R9
- `src/workflow/skills/lifecycle-ship/references/output-schema.md` — upstream array — IDs: R9
- `src/workflow/skills/lifecycle-reflect/references/output-schema.md` — upstream array — IDs: R9
- `src/workflow/validators/check-waivers.mjs` — framing-artifact exemption + skip table rows — IDs: R10
- `src/workflow/validators/check-artifacts.mjs` — accept `-p<P>` filename — IDs: R11
- `src/workflow/validators/check-lifecycle.mjs` — accept `-p<P>` in slug detection — IDs: R11
- `src/workflow/validators/check-starter-blocks.mjs` — conformance guard (frontmatter validation) — IDs: R12
- `test/run-conformance-tests.mjs` — conformance tests for the four Phase-4 finds — IDs: R12, R10, R11, R4
- `test/fixtures/conformance/` — conformance + skipped-Test fixtures — IDs: R12, R10, R11, R4
- `test/fixtures/lifecycle-violations/` — realigned the P2 fixture to a task artifact (see Architecture Notes) — IDs: R10
- `workflow/artifacts/` — backfilled `skill_trigger_log` into the 8 pre-feature briefs (R6 review-fix presence enforcement) — IDs: R6
- Regenerated build products (`dist/`, root `validators/`, `src/assets/adapters/`, `workflow/schemas/`) via `npm run build` — IDs: RI1

### Review-fix pass (all review points closed, no deferrals)

Recap of validators already listed above with their full paths — referenced here by basename
only for readability; corrected 2026-07-27 to cite the same full paths (found while fixing
OI-37's scope-fence boundary bug, which had been masking this bare-name mismatch).

- `src/workflow/validators/check-lifecycle.mjs` — phase gate now requires ALL same-version `-p<P>` parts ready (P2/R11); locked by `conformance:test` r11-aggregate.
- `src/workflow/validators/check-waivers.mjs` — table rows carrying an explicit action claim ("waived <X>") are now scanned, enum/compound cells still skipped (P3/R10); locked by r10-table.
- `src/workflow/validators/check-skill-triggers.mjs` — presence now required for Think artifacts; 8 briefs backfilled so no regression (P3/R6).
- `test/run-setup-refs-tests.mjs` — token→field semantic pin (P3/R8); locked by token-semantics.
- `test/run-conformance-tests.mjs` + fixtures (`table-claim/`, `multipart/`) — new r13-format, r11-aggregate, r10-table assertions guarding the body-format and gate contracts (P3/R12-R13).

## Implementation Log

Executed Phases 1→5 sequentially (sidestepping the P1/P4 `package.json` coordination). Each new or
strengthened validator was run against its target BEFORE the fix to confirm it caught the defect
(R8: 24 issues detected pre-fix; R12: seeded broken block rejected; R10: real prose claim still
flagged), then after to confirm clean — fixture-first throughout. Discoveries during Build (R10
broadened to the verify starter block, R11, R13, and the `check-waivers`/violation-fixture
realignment) were folded into the brief/plan on the current chain per user direction, not deferred.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R1–R3, R8 | `npm run setup-refs:test` | 4/4 pass |
| R4, R10, R11, R12 | `npm run conformance:test` | 6/6 pass |
| R5 | `diff -rq src/adapters src/assets/adapters` | identical |
| R6 | incomplete Think log fixture | rejected with mandated-skill message |
| R7, R9, R13 | `npm run validate` (check-lifecycle/phase-map/starter-blocks) | ok |
| RI1 | `npm run build` then `git status` build products | regenerated |
| RI2 | `npm run validate` + all 5 test suites | all pass |
| RI4 | `package.json` dependencies | `{}` |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `npm run validate` | RI2 | ok | all validators + example + adapter render pass |
| `npm run violations:test` | RI2 | 20/20 | P2 fixture realigned to a task artifact |
| `npm run setup-refs:test` | R1/R2/R3/R8 | 4/4 | — |
| `npm run conformance:test` | R4/R10/R11/R12 | 6/6 | — |
| `npm run setup-checks:test` | RI2 | 4/4 | — |
| `npm run root-resolution:test` | RI2 | 16/16 | — |
| `npm run build` | RI1 | ok | adapters identical; deps `{}` |

## Dispatch Log

none

## Architecture Notes

- role: Senior Engineer
- decision: Sequential Build (P1→P5) to avoid the `package.json` merge point; every guard was proven
  to catch its defect before the fix landed.
- decision: R10 scoped to gate-executing artifacts — briefs/plans/reflect are exempt from the
  unstructured-claim scan (framing/retrospective; no `## Waivers` section by contract), table rows
  skipped (enum/reference cells), prose claims in task/verify/ship/review still caught. The P2
  violation fixture was realigned from a plan to a task to match this contract.
- decision: R6 enforces completeness-when-present (not presence-required) so the pre-feature brief
  corpus is not retroactively failed (RI2); new briefs are steered by the starter-block stub.
- constraint: zero deps; edit-source-then-rebuild; schemas are the fixed source of truth.
- downstream: Review should scrutinize the R10 contract change (does exempting briefs/plans lose any
  legitimate detection? — the realigned fixture argues no) and the R12 guard's frontmatter-only
  boundary (body-format conformance beyond R13 is a named residual gap). Test/Ship: nothing committed.

## Blockers

none

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Phase 1 - Setup-reference accuracy | complete | 2026-07-15 | R1/R2/R3/R8; guard wired into validate. |
| Phase 2 - Waived-Test contract | complete | 2026-07-15 | R4; contract in test/ship/router/AGENTS + fixture. |
| Phase 3 - Adapter parity | complete | 2026-07-15 | R5; cursor + windsurf gate lines. |
| Phase 4 - Enforcement, conformance + consistency | complete | 2026-07-15 | R6/R7/R9/R10/R11/R12/R13/RI3. |
| Phase 5 - Rebuild, integrate & verify | complete | 2026-07-15 | RI1/RI2/RI4; full suite green. |
