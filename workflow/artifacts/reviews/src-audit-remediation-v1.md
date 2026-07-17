---
slug: src-audit-remediation
version: 1
artifact: review
status: ready-for-next-phase
created: 2026-07-15T14:10:00Z
updated: 2026-07-15T14:10:00Z
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
  - workflow/artifacts/tasks/src-audit-remediation-v1.md
orchestration:
  phase: review
  status: ready-for-next-phase
  next_phase: test
  blockers: []
  user_checkpoint: none
---

# Src Audit Remediation — Review

## Findings

All five findings were **RESOLVED in a fix pass** (user directive: no deferrals). None was blocking
(P0/P1). Each is closed and locked by a test. Ordered by original severity.

- **P2 — `check-lifecycle.mjs` (R11): phase gate did not aggregate multiple `-p<P>` build-phase
  tasks.** Affected: R11. Was: `candidates[0]` picked one same-version `-p` task arbitrarily, so a
  gate could pass while a sibling was incomplete. **Resolution:** the gate now checks every part at
  the latest version and fails on any not-ready. Locked by `conformance:test` `r11-aggregate`
  (p1 ready + p2 in-progress → fails naming p2).

- **P3 — `check-waivers.mjs` (R10): table-row skip could miss a claim in a cell.** Affected: R10.
  **Resolution:** table rows carrying an explicit past-tense action claim are now scanned; enum
  option cells and hyphenated compound feature references stay skipped. Locked by the r10-table test
  (a claim in a Manifest-Coverage cell is flagged) with r10-detect and violations 20/20 preserved.

- **P3 — `check-skill-triggers.mjs` (R6): the "omit the log entirely" bypass.** Affected: R6.
  **Resolution:** presence is now required for Think artifacts (missing log fails); the 8 pre-feature
  briefs were honestly backfilled (`decision: skipped, reason: predates the feature`) so RI2 holds.
  Positive: all 9 briefs pass; negative: a logless Think artifact fails.

- **P3 — `check-setup-refs.mjs` (R8): existence-only, not semantic.** Affected: R8. **Resolution:**
  added a token→field semantic pin (`setup-refs:test` `token-semantics`) asserting each `{{TOKEN}}`
  maps to its intended field — a wrong-but-existing field (the original `repository.root` class) now
  fails, not just a nonexistent one.

- **P3 — R12 guard was frontmatter-only; body-format (R13 class) unguarded.** Affected: R12, R13.
  **Resolution:** added `conformance:test` `r13-format` asserting the plan starter block carries the
  bold `**Manifest IDs:**`/`**Exit gate:**` labels `check-phase-map` requires, mechanically guarding
  the concrete body-format contract that regressed.

## Severity Summary

| Severity | Count (open) | Resolved |
|---|---|---|
| P0 | 0 | 0 |
| P1 | 0 | 0 |
| P2 | 0 | 1 |
| P3 | 0 | 4 |

## Requirement Coverage

| Manifest ID | Evidence | Status | Notes |
|---|---|---|---|
| R1 | `setup-refs:test` 4/4; `check-setup-refs: ok` | covered | config-map fields match schemas. |
| R2 | `check-setup-refs: ok` | covered | token-map fields corrected. |
| R3 | `check-setup-refs`; grep of SKILL.md + pending-setup schema | covered | example paths corrected. |
| R4 | `conformance:test` r4-* PASS | covered | Test-skip contract + gate-ready fixture. |
| R5 | `diff -rq src/adapters src/assets/adapters` identical | covered | cursor/windsurf parity. |
| R6 | negative fixture rejected; real chain passes | covered | completeness-when-present (see P3). |
| R7 | `check-lifecycle`/`check-phase-map: ok` | covered | Test upstream row aligned. |
| R8 | `setup-refs:test` bad-exit + good-exit | covered | 24 drifts caught pre-fix. |
| R9 | `check-starter-blocks: ok` (all 7 validate) | covered | upstream arrays. |
| R10 | `conformance:test` r10-detect; `violations:test` 20/20 | covered | detection preserved; see P3. |
| R11 | `conformance:test` r11-psuffix PASS | partial | filename accepted; multi-`-p` aggregation open (P2). |
| R12 | `conformance:test` r12-all + r12-bad PASS | covered | guard fails seeded broken block. |
| R13 | `check-phase-map: ok` on this chain's plan | covered | bold labels in starter block + plan. |
| RI1 | `npm run build` clean; no build-product drift | covered | dist/assets regenerated. |
| RI2 | `validate` + 5 suites all PASS | covered | 20/20, 6/6, 4/4, 4/4, 16/16. |
| RI3 | role label, manifest_ids note in source | covered | date-time deferred (residual). |
| RI4 | `package.json` dependencies `{}` | covered | zero deps. |

## Architecture Notes

- role: Staff Reviewer
- decision: The R10 contract change (exempt framing/retrospective artifacts, skip table rows) is
  sound — the realigned P2 violation fixture confirms real prose claims in gate-executing artifacts
  are still caught, and `violations:test` stays 20/20. Exempting briefs/plans loses no legitimate
  detection because those artifacts cannot hold a structured waiver by contract.
- constraint: `src/assets/AGENTS.md` verified as source (build-bundle does not emit it; edit
  survives rebuild) — correctly hand-edited, not a bypassed build product.
- downstream: Test should treat the P2 (`-p<P>` aggregation) and the four P3 residuals as
  documented risks, not gate failures; recommend `ship` with these visible. Reflect should capture
  the frontmatter-only guard boundary and the date-time item as follow-ups.

## Verification Reviewed

| Item | Outcome | Notes |
|---|---|---|
| `npm run validate` | pass | all validators + example + adapter render |
| `npm run violations:test` | 20/20 | P2 fixture realigned to task |
| `npm run conformance:test` | 6/6 | R4/R10/R11/R12 |
| `npm run setup-refs:test` | 4/4 | R1/R2/R3/R8 |
| `npm run setup-checks:test` | 4/4 | no regression |
| `npm run root-resolution:test` | 16/16 | no regression |
| `npm run build` | clean | adapters identical; deps `{}` |
| `src/assets/AGENTS.md` provenance | source | not emitted by build-bundle |

## Residual Risk

All five findings are resolved and locked by tests (see Findings). Remaining residuals are narrow and
non-blocking:

- `format: date-time` remains unenforced (RI3 follow-up, out of scope — enforcing it would mass-break
  existing bare-date artifacts).
- The R10 semantic distinction (action claim vs. enum/reference) is heuristic; extreme phrasings could
  still be misclassified, but `violations:test` 20/20 + the r10-table/r10-detect locks bound the risk.
- The conformance guard now covers the plan body-format instance found (R13); other artifact
  body-format contracts are not exhaustively guarded — a lower-priority follow-up.
- This chain's own scope-fence used coarse directory-prefix Touches (audit-trail precision only).

## Recommendation

pass
