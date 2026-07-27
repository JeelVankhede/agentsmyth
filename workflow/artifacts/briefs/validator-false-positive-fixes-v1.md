---
slug: validator-false-positive-fixes
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-07-27
updated: 2026-07-27
manifest_ids: [R1, R2, R3, RI1]
upstream:
  - user-request
  - workflow/artifacts/open-items.yaml (OI-29, OI-37, OI-38)
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: brief-review
skill_trigger_log:
  - skill: repo-alignment-scan
    decision: ran
    reason: "task_class != trivial (standard). Inspected src/workflow/validators/ and test/run-conformance-tests.mjs — this exact 'validator false-positive fix + conformance regression check' pattern already exists (R10-R13 in that file, one of which is literally check-waivers suppressing a different false-positive class). No competing convention found; the three fixes map cleanly onto it."
  - skill: architecture-decision-advisor
    decision: skipped
    reason: "complexity_score ~33 (files_touched ~5 * 3 = 15, capped; ri_count 1 * 4 = 4; task_class standard = 6; no protected/contract/new-surface hits) — below the 60 threshold, and touches_contract/new_surface are both false. No architectural decision needed, only regex/template fixes to existing code."
  - skill: constraint-conflict-scan
    decision: ran
    reason: "Checked all three domain.yaml constraint arrays (product, safety, provider_neutrality) and repo-profile.yaml's paths.protected — no conflict. product-2 (compatibility/verification impact) is material and noted as an implicit requirement (RI1) since these validators run in every consumer repo's CI, not just this one."
---

# Validator false-positive fixes (OI-29, OI-37, OI-38) - Brief

## Source Links

- `workflow/artifacts/open-items.yaml` — OI-29, OI-37, OI-38 (all `status: open`)
- `src/workflow/validators/check-waivers.mjs` — unstructured-waiver-mention negation regex
- `src/workflow/validators/check-scope-fence.mjs` — `phaseTouches()` boundary regex
- `src/workflow/skills/lifecycle-test/references/output-schema.md` — Skipped Checks Starter Block table
- `src/workflow/validators/check-skipped-accounting.mjs` — the actual (correct) 6-field requirement, sourced from `workflow/config/verification.yaml`'s `skipped_checks.required_fields`

## Problem

Three shared validators — run in every consumer repo that adopts agentsmyth, not just this one — have real false-positive/documentation-mismatch bugs found during recent dogfooding, each already logged as an open item:

- **OI-29**: `check-waivers.mjs`'s unstructured-claim scan has misfired on descriptive prose three times across three chains, most recently on "rather than record a waiver" in a task artifact's scope note — this one caused a genuine GitHub Actions CI failure on PR #41, not just a local false positive. The existing negation regex handles "no/without/not ... waiver" but has no "rather than ... waiver" case.
- **OI-37**: `check-scope-fence.mjs`'s `phaseTouches()` regex expects a phase-boundary label (`Work:`, `Exit gate:`, `Why first:`) preceded only by whitespace. This repo's own plan convention prefixes those labels with a `- ` bullet dash, which the regex's `\s*` does not match — for a plan's *last* declared phase specifically, the lookahead fails entirely and the `Touches` capture runs unbounded to end-of-document, sweeping in unrelated backtick-quoted paths as false covering-directory matches. Found and manually worked around (not fixed) at least twice in `wp-r11-docs-site-v1`.
- **OI-38**: The `lifecycle-test` Starter Block's "Skipped Checks" table template shows 5 columns (`Check | Why Skipped | Risk | Owner | Blocks Ship`), but `check-skipped-accounting.mjs` actually requires 6 — it reads `required_fields` from `verification.yaml`, which already lists `manifest_ids` as the 6th field. A verify artifact authored straight from the template fails validation on the first attempt. Already hit and fixed inline (ad hoc, per-artifact) in `wp-r11-docs-site-v1`'s own verify artifact; the shared template was never corrected.

## Goals

- Fix all three false-positive/mismatch bugs at their real root cause (the regex or template), not by patching individual artifacts.
- Add a regression check for each so the specific bug class can't silently reappear.
- Touch nothing else — no unrelated cleanup, no broadening scope beyond what each OI describes.

## Non-Goals

- OI-29's broader open question ("does Implementation Log/Changed Files prose describing waiver-related work need its own narrower exemption?") — that's a design question about scope, not a mechanical fix; this brief implements only the concrete, already-specified fix (broaden the negation regex to cover "rather than").
- Any change to `check-skipped-accounting.mjs`'s logic itself — it's already correct (reads the real 6-field contract from config); only the documentation template is stale.
- Any change to `verification.yaml`'s `skipped_checks.required_fields` — that's the source of truth, not the bug.

## User Impact

Consumers running `agentsmyth check`/`npm run validate` in their own repos stop hitting these three false positives:
1. A legitimate scope note mentioning "rather than ... a waiver" no longer fails CI.
2. A plan's last phase's `Touches:` list is scoped correctly instead of silently absorbing unrelated paths (which weakens `check-scope-fence`'s entire purpose — catching real scope creep).
3. Authoring a new verify artifact from the documented Starter Block produces a passing Skipped Checks table on the first try, not a validator error the author has to reverse-engineer against `check-skipped-accounting.mjs`'s source.

## Success Metrics

- All three original false-positive/mismatch scenarios reproduce as failures on `main` today and pass clean after the fix (each as its own fixture/check).
- `npm run validate` and `npm run conformance:test` (or wherever the new checks land) stay green.
- No existing violation fixture (`p-unstructured-waiver-claim`, `j-file-outside-scope`, `l-skipped-check-no-risk`) starts passing when it should still fail — i.e., the real-violation-detection side of each check is unchanged.

## Requirements

### R1 — `check-waivers.mjs` exempts "rather than ... waiver" prose

`unstructuredWaiverMentions()`'s negation regex (currently `/\bno\b.{0,15}\bwaiv|\bwithout\b.{0,10}\bwaiv|\bnot\b.{0,10}\bwaiv|waiver-completeness-check|check-waivers/i`) gains a `\brather than\b.{0,20}\bwaiv` alternative, so a line like "rather than record a waiver" is treated as a negation, not a claim.

**Acceptance:**
- A new conformance fixture reproducing "rather than record a waiver" (or equivalent real phrasing) in a task/verify/ship/review artifact's prose passes `check-waivers.mjs` clean.
- The existing genuine-claim fixture (`test/fixtures/conformance/waivers-dir` / `p-unstructured-waiver-claim`) is still flagged — no regression to real-violation detection.

### R2 — `check-scope-fence.mjs`'s phase-boundary regex recognizes a bullet-dash prefix

`phaseTouches()`'s lookahead (currently `/Touches:\*{0,2}\s*([\s\S]*?)(?=\n\s*\*{0,2}(?:Work|Exit gate|Why first)\*{0,2}:|\n### |$)/i`) is broadened to also match an optional `- ` bullet dash directly before the bold marker, so the last phase's `Touches:` capture stops at the next boundary label instead of running to end-of-document.

**Acceptance:**
- A new conformance fixture with a plan whose last phase uses `- **Work:**` / `- **Exit gate:**` (this repo's actual convention) proves the `Touches:` capture is correctly bounded, not unbounded-to-EOF.
- The existing scope-fence violation fixture (`j-file-outside-scope`) still fails as expected.

### R3 — `lifecycle-test`'s Skipped Checks Starter Block gains the 6th column

`references/output-schema.md`'s Skipped Checks table (line 107-108) and its one-line prose description (line 47) are updated to show all 6 fields `check-skipped-accounting.mjs` actually requires: `Check | Why Skipped | Risk | Owner | Blocks Ship | Manifest IDs`.

**Acceptance:**
- `output-schema.md`'s table header shows 6 columns; the prose bullet names all 6 fields.
- `npm run validate` (specifically `check-starter-blocks`, if it validates this table's shape) still passes.
- `grep -rn "Check | Why Skipped | Risk | Owner | Blocks Ship |$"` (i.e. the stale 5-column header with no trailing Manifest IDs) returns zero hits anywhere in `src/workflow/`.

## Constraints

- Fix only the specific regex/template named in each OI — do not refactor `check-waivers.mjs`, `check-scope-fence.mjs`, or the `lifecycle-test` skill beyond the named line(s).
- These are shared validators shipped to every consumer repo (`product-2`, compatibility/verification impact) — a fixture-only regression is not sufficient confidence; each fix must also be manually re-verified against the real historical false-positive text where it's known (OI-29/37/38 all cite the exact prose/case that tripped them).

## Risks

- **R2 is the highest-risk of the three** — broadening a boundary regex touching scope-fence enforcement (the actual anti-scope-creep gate) risks either not fixing the bullet-dash case fully or accidentally widening what the regex accepts as a boundary, letting some real scope-creep slip through unflagged. Mitigate by testing both the false-positive fixture and the existing real-violation fixture in the same pass.
- **R1 and R3 are low-risk** — R1 only adds an alternative to an existing negation regex (strictly narrows what gets flagged); R3 is a documentation-template edit with no runtime effect on the validator itself.

## Open Questions

None — all three fixes are scoped precisely enough from the OI entries and direct source reads that no user decision is needed before Plan.

## Requirement Manifest

### Explicit (R)

- **R1** — `check-waivers.mjs` exempts "rather than ... waiver" prose from the unstructured-claim scan.
  - Acceptance: new fixture with "rather than ... waiver" phrasing passes clean; existing genuine-claim fixture still fails.
- **R2** — `check-scope-fence.mjs`'s phase-boundary regex recognizes a `- ` bullet-dash-prefixed label.
  - Acceptance: new fixture with bullet-dash-prefixed last-phase boundary proves `Touches:` is correctly bounded; existing scope-fence violation fixture still fails.
- **R3** — `lifecycle-test`'s Skipped Checks Starter Block shows all 6 required columns.
  - Acceptance: table + prose updated to 6 columns; `npm run validate` passes; no stale 5-column header remains anywhere in `src/workflow/`.

### Implicit (RI)

- **RI1** — Each of R1-R3 gets its own regression check added to `test/run-conformance-tests.mjs` (or an equivalent existing suite), following the file's existing `check(id, desc, cond)` convention, so the specific bug class is CI-enforced against recurrence, not just fixed once.
  - Acceptance: three new checks (one per R) appear in the conformance suite and pass; `npm run conformance:test` stays green.

### Assumptions (A)

- **A1** — "Rather than" is the only missing negation construction worth adding for R1; no other real false-positive phrasing pattern is being folded in speculatively. (Basis: OI-29 names this exact construction as the fix; broader exemption logic is explicitly out of scope per Non-Goals.)

### Open Questions (Q)

None.

## Questions For User

None — ready for brief review as scoped above.

## Architecture Notes

- role: Architect
- decision: Treat all three as one Standard-class chain (single brief/plan/build/review/ship) rather than three separate chains, since they're small, independently-scoped, low-coupling fixes discovered together in the same audit and share the same "shared validator, consumer-facing" risk profile.
- constraint: No change to `verification.yaml`'s `required_fields` contract (R3) or to `check-skipped-accounting.mjs`'s logic (R3) — only the stale template.
- tradeoff: Bundling three fixes in one chain is faster than three separate brief→plan→...→reflect chains, at the cost of a slightly less granular audit trail per fix. Given the low coupling and shared discovery context, judged worth it.
- downstream: `test/run-conformance-tests.mjs` gains three new checks; no consumer-repo-facing contract changes (R1/R2 only affect what a validator flags, not what's required of a consumer's artifacts; R3 only affects documentation).

## Checkpoint Approval

- Checkpoint: brief-review
- Status: approved
- User's own words (verbatim, this turn): "Looks good"

## Exit Gate

- [x] Every active R and RI has acceptance criteria.
- [x] Blocking Q IDs appear in orchestration.blockers. (none — no blocking Qs)
- [x] User approved or waiver recorded.
