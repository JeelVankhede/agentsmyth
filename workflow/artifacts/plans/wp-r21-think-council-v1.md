---
slug: wp-r21-think-council
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-08-16
updated: 2026-08-17
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9]
upstream:
  - workflow/artifacts/briefs/wp-r21-think-council-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
---

# WP-R21 Think Council - Plan

## Summary

Seven phases, sequenced so that the three surfaces WP-R22 inherits as contract land first and stop
moving. Phase 1 fixes the contracts (independence narrowing, disposition shape, evidence classes),
Phase 2 the config surface they resolve against, Phase 3 the council skill, Phase 4 the restructured
Think pipeline and its round loop, Phase 5 the record and schema, Phase 6 the validator, Phase 7 the
fixtures that prove every rule rejects.

The ordering is deliberate: everything downstream of Phase 1 depends on the disposition and evidence
shapes being settled, and `check-council-record.mjs` (Phase 6) cannot be written before the record it
validates exists (Phase 5). Fixtures come last because each earlier phase carries its own targeted
check; Phase 7 is where the exhaustive per-rule rejection suite is completed.

## Inputs

- `workflow/artifacts/briefs/wp-r21-think-council-v1.md` — approved 2026-08-16, 15 R + 9 RI, no
  blocking questions, risk register hardened across RK-A…RK-J.
- `src/workflow/skills/dispatch-subagents/` — the contract the council inherits.
- `src/workflow/skills/lifecycle-think/` — the phase being restructured.
- `src/workflow/agent-behavior.yaml` — `dispatch:` block, the config the council extends.
- `scripts/validate-template.mjs` — validators are an explicit list, not auto-discovered; RI3 must
  register there.
- `workflow/config/repo-profile.yaml` — the `tuning:` surface `sandbox_root` and the depth dial join.

## Requirement Coverage

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R1 | Phase 4 | Complex-only trigger lives in the restructured pipeline's entry gate |
| R2 | Phase 2 | Both capability axes plus per-stage caps and the council default |
| R3 | Phase 3 | Challenge pass, raw-findings input, web spot-check duty |
| R4 | Phase 1 | Disposition contract — WP-R22 inherits this shape |
| R5 | Phase 4 | Surviving Q recommendations, produced by the loop's escalation path |
| R6 | Phase 5 | Optional fields with safe defaults; pre-1.1.0 briefs unchanged |
| R7 | Phase 2 | Council config and kill-switch precedence |
| R8 | Phase 4 | Preserved single-agent path as a real rollback surface |
| R9 | Phase 4 | Requirement classification, the pipeline's first stage |
| R10 | Phase 1 | Evidence classes and citation tiers — WP-R22 inherits this shape |
| R11 | Phase 2 | `sandbox_root` resolution; repo integrity check lands with it |
| R12 | Phase 3 | Runtime availability resolution, recorded by the council skill |
| R13 | Phase 4 | Tapering round loop, per-item tracking, termination reasons |
| R14 | Phase 5 | Full run logged into the brief |
| R15 | Phase 4 | The staged pipeline itself |
| RI1 | Phase 1 | Independence narrowing across five files — WP-R22 inherits this shape |
| RI2 | Phase 3 | Carve-out as bounding principle; no-nesting restated in the council skill |
| RI3 | Phase 6 | `check-council-record.mjs` plus its summary output |
| RI4 | Phase 5 | Run-mode record, `cap_source`, dispatch depth 1 |
| RI5 | Phase 5 | Schema update, rebuild, adapter sync |
| RI6 | Phase 6 | Non-claims stated in validator README and skill docs |
| RI7 | Phase 2 | `cap_source` visibility and the phase-caps departure note |
| RI8 | Phase 2 | Research-depth dial, resolved like other tuning keys |
| RI9 | Phase 7 | One rejection fixture per mechanical rule |

## Assumptions Verified

| Assumption ID | Status | Evidence / Question |
|---|---|---|
| A1 | evidence-backed | `git diff --name-only release/1.1.0...feat/wp-r8-behavior-tuning` lists `src/workflow/agent-behavior.yaml` plus four `dispatch-subagents/` files — the exact surfaces R21 must change. Branch is cut from R8 accordingly. |
| A2 | evidence-backed | `src/workflow/skills/` holds 33 sibling skills all shaped SKILL.md + references/; the council follows that convention rather than embedding in `lifecycle-think`. |
| A3 | evidence-backed | No validator can determine what *was* answerable from evidence; `check-assumptions.mjs` is the closest precedent and checks only presence and shape of rows, never their correctness. |
| A4 | evidence-backed | `dispatch-subagents/SKILL.md` and `references/phase-caps.md` already define caps, logging, and refusal conditions; the council inherits them rather than reimplementing. |
| A5 | evidence-backed | User confirmed 2026-08-16 ("A5: Yes"). Removal must reach the 1.2.0 release checklist at Ship — tracked as a Phase 4 exit-gate item, not left to memory. |
| A6 | evidence-backed | Superseded in the safer direction by R11: sandbox location is now configured (`sandbox_root`, default `~/.agentsmyth/sandbox/`) rather than left to the agent's choice of temp directory. |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `src/workflow/skills/dispatch-subagents/references/independence-rules.md` | modify | RI1 | Read-only overlap permitted under a reconcile contract |
| `src/workflow/skills/dispatch-subagents/references/decision-tree-by-phase.md` | modify | RI1 | Think and Review rows plus per-phase refuse conditions |
| `src/workflow/skills/dispatch-subagents/references/phase-caps.md` | modify | RI1, RI7 | Per-stage capping; council default-3 departure documented |
| `src/workflow/skills/dispatch-subagents/references/output-schema.md` | modify | RI1, R4 | Acceptance criteria; disposition shape |
| `src/workflow/skills/dispatch-subagents/references/council-contracts.md` | create | R4, R10 | Shared disposition + evidence-class contracts; see Plan Amendments |
| `src/workflow/skills/dispatch-subagents/SKILL.md` | modify | RI1, RI2 | Determinism Rules; carve-out as bounding principle |
| `src/workflow/agent-behavior.yaml` | modify | R2, R7, R11, RI8 | `council:` block, `sandbox_root`, depth dial |
| `src/workflow/schemas/agent-behavior.schema.yaml` | modify | R7, RI5 | Schema for the new council block |
| `src/workflow/schemas/repo-profile.schema.yaml` | modify | R2, R11, RI8 | New `tuning:` keys |
| `src/workflow/schemas/artifact-frontmatter.schema.yaml` | modify | R6, R14, RI4, RI5 | Optional council record fields |
| `src/workflow/skills/think-council/` | create | R3, R10, R12, RI2, RI6 | New power skill: SKILL.md + references/ |
| `src/workflow/skills/lifecycle-think/SKILL.md` | modify | R1, R9, R13, R15 | Staged pipeline and round loop |
| `src/workflow/skills/lifecycle-think/references/output-schema.md` | modify | R5, R14, R6 | Starter block gains optional council fields |
| `src/workflow/skills/lifecycle-think/references/single-agent-path.md` | create | R8 | Pre-R21 workflow preserved verbatim as rollback surface |
| `src/workflow/validators/check-council-record.mjs` | create | RI3 | The validator, with summary output |
| `src/workflow/validators/README.md` | modify | RI3, RI6 | Entry plus explicit non-claims |
| `scripts/validate-template.mjs` | modify | RI3 | Validators are an explicit list — must register |
| `test/run-violation-tests.mjs` | modify | RI9 | One rejection fixture per mechanical rule |
| `test/fixtures/lifecycle-violations/council-*/` | create | RI9 | The fixtures themselves |
| `test/run-conformance-tests.mjs` | modify | R15, RI5 | Lock SKILL.md stage list against validator expectations |
| `workflow/config/repo-profile.yaml` | modify | R11, RI8 | This repo's own tuning values for the new keys |

## Source-of-Truth Strategy

All edits land in `src/` — the shipped source — never in `dist/`, root `validators/`, or
`workflow/schemas/`, which are build products (`.gitignore` lines 2 and 7). `npm run build`
regenerates `dist/workflow-bundle.md` and syncs schemas to the dev workspace. The brief and this plan
are the authority for requirement shape; the Notion WP-R21 page is upstream context and is updated at
Ship, not treated as a live source during Build.

## Approach

Build contracts before consumers, and records before validators.

The three surfaces WP-R22 inherits — RI1's independence narrowing, R4's disposition contract, R10's
evidence classes — are settled first and then treated as frozen. Everything after Phase 1 consumes
them. This is the single most important sequencing decision in the plan: R22's failure mode is a
compromised verdict on a commit-blocking gate, so a late shape change to any of the three propagates
into Review rather than staying local.

Config comes second because the council skill and the pipeline both resolve against it. The council
skill precedes the Think restructuring because Think dispatches it. The record precedes the validator
because you cannot validate a shape that does not exist. Fixtures come last, exhaustively, after each
earlier phase has already carried its own targeted check.

## Phases

### Phase 1 - Contract foundations

- **Manifest IDs:** RI1, R4, R10
- Touches: `src/workflow/skills/dispatch-subagents/references/independence-rules.md`,
  `src/workflow/skills/dispatch-subagents/references/decision-tree-by-phase.md`,
  `src/workflow/skills/dispatch-subagents/references/phase-caps.md`,
  `src/workflow/skills/dispatch-subagents/references/output-schema.md`,
  `src/workflow/skills/dispatch-subagents/references/council-contracts.md`,
  `src/workflow/skills/dispatch-subagents/SKILL.md`
- Work: narrow the independence rule to permit read-only surface overlap under a declared
  dedupe-and-reconcile contract, with conflict recording as its teeth; specify the disposition
  contract (`accepted` / `merged` / `rejected-with-reason`, non-empty reason); specify the four
  evidence classes and their per-class citation tiers, including that `repo` resolves, `trial` needs
  command plus non-empty output, `web` needs URL + date + verbatim quote and may not decide
  repo-shaped questions, and `recall` may never solely support a recommendation.
- **Exit gate:** a grep proves no file still asserts the blanket independence form; all five files
  changed together; disposition and evidence-class shapes are stated once, referenced elsewhere, and
  contain no open placeholders.

### Phase 2 - Config surface

- **Manifest IDs:** R2, R7, R11, RI7, RI8
- Touches: `src/workflow/agent-behavior.yaml`, `src/workflow/schemas/agent-behavior.schema.yaml`,
  `src/workflow/schemas/repo-profile.schema.yaml`, `workflow/config/repo-profile.yaml`,
  `src/workflow/skills/dispatch-subagents/references/phase-caps.md`
- Work: add the `council:` block (`enabled`, `max_rounds` default 4, `depth`, `sandbox_root`);
  implement resolution order `tuning.dispatch.enabled` → `council.enabled` → `task_class`; define
  both capability axes (repo fence absolute, outward axis authorization-dependent); per-stage capping
  so researchers and challengers are separately capped; council default fan-out 3 with `cap_source`
  recorded; `sandbox_root` resolving global-then-repo-local like `definitions_root`; the depth dial
  bounding per-member effort rather than member count.
- **Exit gate:** `check-config` green; a fixture with `dispatch.enabled: disabled` and
  `council.enabled: true` resolves to no-council; an unconfigured repo resolves cap 3 with
  `cap_source: council-default`; `sandbox_root` resolves to a path outside the repo root in all three
  repository modes.

### Phase 3 - Council skill

- **Manifest IDs:** R3, R12, RI2
- Touches: `src/workflow/skills/think-council/` (new), `src/workflow/skills/dispatch-subagents/SKILL.md`
- Work: create the council skill with SKILL.md and references; the challenge pass receiving raw
  research findings rather than the parent's consolidation, chartered adversarially, with the
  per-round `web` spot-check duty; runtime evidence-class availability resolution recording `used` /
  `unused` / `unavailable`; document the carve-out as its bounding principle (*no repo mutation, in
  phases that produce no verdict*) with the conditions as consequences; restate the no-nested-dispatch
  prohibition inside the council skill rather than by reference.
- **Exit gate:** the skill loads standalone; its charter states the repo fence, the outward axis, and
  no-nesting explicitly; a council run with no web capability is distinguishable from one with it.

### Phase 4 - Think restructuring

- **Manifest IDs:** R1, R5, R8, R9, R13, R15
- Touches: `src/workflow/skills/lifecycle-think/SKILL.md`,
  `src/workflow/skills/lifecycle-think/references/output-schema.md`,
  `src/workflow/skills/lifecycle-think/references/single-agent-path.md` (new)
- Work: restructure the Workflow section into the eight named stages; Complex-only council trigger;
  requirement classification assigning evidence classes per bucket; the tapering round loop with
  non-increasing fan-out, per-item close tracking, taper-coherence, and the four termination reasons;
  surviving `Q` entries carrying recommendations with resolvable non-`recall` evidence references;
  preserve the pre-R21 workflow verbatim as a rollback surface with its own reference file.
- **Exit gate:** SKILL.md names the stages in order with their gates; the Exit Gate section covers
  the new stages; the preserved single-agent path is byte-comparable to the pre-R21 workflow text; a
  survivor item forces `user-decision-required` rather than `max-rounds`; **A5's 1.2.0 removal is
  written into the Ship checklist item, not left to memory.**

### Phase 5 - Record and schema

- **Manifest IDs:** R6, R14, RI4, RI5
- Touches: `src/workflow/schemas/artifact-frontmatter.schema.yaml`,
  `src/workflow/skills/lifecycle-think/references/output-schema.md`, build outputs via `npm run build`
- Work: define the council record — rounds with member counts, evidence classes, findings with class
  and disposition, per-round closed item IDs, open-item deltas, termination reason, authorization
  mode, resolved cap, `cap_source`, dispatch depth; every field optional with a safe default; rebuild
  bundles; re-render adapters and confirm sync.
- **Exit gate:** every existing brief under `workflow/artifacts/briefs/` and `examples/` validates
  with zero edits; a council-mode brief and a single-agent brief are distinguishable by frontmatter
  alone; `npm run build` clean and `render-adapters` reports shims current.

### Phase 6 - Validator

- **Manifest IDs:** RI3, RI6
- Touches: `src/workflow/validators/check-council-record.mjs` (new),
  `src/workflow/validators/README.md`, `scripts/validate-template.mjs`
- Work: implement every mechanical check named across R2–R14; emit the summary line on success
  (rounds, findings, unconfirmed `recall`-only hypotheses, rejections, resolved-vs-shape-checked
  citation ratio); register in the explicit validator list; document the non-claims in blunt form
  with no mitigating qualifiers.
- **Exit gate:** validator passes a well-formed council brief and prints the summary; `npm run
  validate` green; the README entry states all five non-claims verbatim as limitations.

### Phase 7 - Rejection fixtures

- **Manifest IDs:** RI9
- Touches: `test/run-violation-tests.mjs`,
  `test/fixtures/lifecycle-violations/ca-unattributed-finding`,
  `test/fixtures/lifecycle-violations/cb-empty-rejection-reason`,
  `test/fixtures/lifecycle-violations/cc-fanout-growth`,
  `test/fixtures/lifecycle-violations/cd-incoherent-taper`,
  `test/fixtures/lifecycle-violations/ce-resolved-with-survivor`,
  `test/fixtures/lifecycle-violations/cf-repo-citation-unresolvable`,
  `test/fixtures/lifecycle-violations/cg-web-citation-incomplete`,
  `test/fixtures/lifecycle-violations/ch-missing-conflicts-entry`,
  `test/fixtures/lifecycle-violations/ci-web-no-spotcheck`,
  `test/fixtures/lifecycle-violations/cj-recall-only-recommendation`,
  `test/fixtures/lifecycle-violations/ck-dispatch-depth-not-one`,
  `test/fixtures/lifecycle-violations/cl-refused-without-reason`,
  `test/fixtures/lifecycle-violations/cm-stage-cap-exceeded`,
  `test/fixtures/lifecycle-violations/cn-log-without-council-block`,
  `test/fixtures/lifecycle-violations/co-missing-conflicts-section`,
  `test/fixtures/lifecycle-violations/cp-missing-classification`,
  `test/fixtures/lifecycle-violations/cq-classification-no-class`,
  `test/fixtures/lifecycle-violations/cr-carveout-outward-capability`,
  `test/fixtures/lifecycle-violations/cs-sandbox-inside-repo`,
  `test/fixtures/lifecycle-violations/ct-shared-sandbox-path`,
  `test/fixtures/lifecycle-violations/cu-q-without-recommendation`,
  `test/fixtures/lifecycle-violations/cv-q-unresolvable-reference`,
  `test/fixtures/lifecycle-violations/cw-trial-without-sandbox`,
  `test/fixtures/lifecycle-violations/cx-finding-unknown-member`,
  `test/fixtures/lifecycle-violations/cy-sandbox-outside-root`,
  `test/fixtures/lifecycle-violations/cz-escalation-no-survivor-line`,
  `test/fixtures/lifecycle-violations/da-no-questions-section`,
  `test/fixtures/lifecycle-violations/db-resolution-mismatch`,
  `test/fixtures/lifecycle-violations/dc-refusal-reason-wrong`,
  `test/fixtures/lifecycle-violations/dd-sandbox-without-integrity`,
  `test/fixtures/lifecycle-violations/de-integrity-mismatch`,
  `test/fixtures/conformance/council-wellformed`,
  `src/workflow/validators/check-trigger-predicates.mjs`,
  `src/workflow/validators/check-coverage-ledger.mjs`,
  `src/workflow/validators/check-scope-fence.mjs`,
  `test/fixtures/conformance/coverage-ledger-prose-drop/`,
  `test/fixtures/lifecycle-violations/df-missing-reconcile-contract/`,
  `test/fixtures/lifecycle-violations/dg-council-without-resolution/`,
  `test/fixtures/lifecycle-violations/dh-round2-web-no-spotcheck/`,
  `test/fixtures/lifecycle-violations/di-termination-not-in-enum`,
  `test/fixtures/lifecycle-violations/dj-finding-round-not-declared`,
  `test/fixtures/lifecycle-violations/dk-finding-without-round`,
  `test/fixtures/lifecycle-violations/dl-vacuous-reconcile-contract`,
  `src/workflow/validators/README.md`,
  `src/workflow/schemas/artifact-frontmatter.schema.yaml`,
  `src/workflow/schemas/agent-behavior.schema.yaml`,
  `.github/workflows/ci.yml`,
  `src/workflow/skills/lifecycle-think/SKILL.md`,
  `src/workflow/skills/lifecycle-think/references/output-schema.md`,
  `src/workflow/validators/check-council-record.mjs`,
  `workflow/artifacts/briefs/wp-r22-review-council-v1.md`,
  `CLAUDE.md`,
  `workflow/artifacts/plans/site-docs-remediation-tier2-3-v1.md`,
  `src/workflow/validators/repo-digest.mjs`,
  `src/workflow/validators/check-lifecycle.mjs`,
  `src/assets/hooks/pre-commit`,
  `.githooks/pre-commit`,
  `test/run-conformance-tests.mjs`
- Work: one fixture per mechanical rule, each rejected by `check-council-record.mjs` specifically
  rather than incidentally by another validator; a conformance check locking the SKILL.md stage list
  against the validator's expectations, closing the R12/R13/R16/R19 doc-drift class for this feature.
- **Exit gate:** `npm run violations:test` count increases by the number of new rules and passes;
  each fixture's rejection is attributed to `check-council-record.mjs`; `npm run conformance:test`
  green.

## Dependency Order

Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7.

Strictly sequential. Phases 2 and 3 could nominally overlap, but both touch `dispatch-subagents` and
`phase-caps.md`, so they are not independent under the very rule Phase 1 is narrowing — sequencing
them is the honest reading of our own contract.

## Branch Strategy

Work continues on `feat/wp-r21-think-council`, cut from `feat/wp-r8-behavior-tuning` because R8 owns
`agent-behavior.yaml` and the four `dispatch-subagents/` files this package must change (A1). PR
targets `feat/wp-r8-behavior-tuning`, retargeting to `release/1.1.0` automatically once R8's PR #62
merges — the same stacking pattern as WP-R19's PR #63. No commits to `main` or `release/1.1.0`
directly.

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|
| Phase 1 contracts shift after Phase 3 consumes them, propagating into WP-R22 | medium | high | Freeze after Phase 1; any change reopens the phase rather than patching downstream | agent | RI1, R4, R10 |
| Cost multiplier lands far above estimate | medium | high | Measure on first real council run during Build, not at Review (RK-C) | agent | R13, RI8 |
| Schema change breaks a pre-1.1.0 brief | low | high | Phase 5 exit gate validates every existing brief with zero edits | agent | R6, RI5 |
| Preserved single-agent path drifts from the real pre-R21 text | medium | medium | Byte-comparison against the pre-R21 workflow in the Phase 4 exit gate | agent | R8 |
| A5's 1.2.0 removal never reaches the release checklist | medium | medium | Written as a Phase 4 exit-gate item, not left to Ship to remember | user | R8 |
| `check-council-record.mjs` grows large enough to need its own tests | medium | low | Phase 7 fixtures are the tests; validator stays declarative | agent | RI3, RI9 |

## Verification Plan

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1 | Standard-task fixture produces no council; Complex produces one | Test | Both directions |
| R2 | Per-stage cap fixture; carve-out member with outward capability rejected | Test | Both axes |
| R3 | Unattributed finding rejected; `web` round without spot-check rejected | Test | |
| R4 | Four disposition fixtures including empty-reason rejection | Test | |
| R5 | Surviving `Q` without recommendation rejected | Test | |
| R6 | `npm run validate` over all existing briefs, zero edits | Test | Regression bar |
| R7 | Kill-switch precedence fixture resolves to no-council | Test | |
| R8 | Byte-comparison of preserved path; CI job with council disabled | Test | |
| R9 | Active `R`/`RI` without classification entry rejected | Test | |
| R10 | Nonexistent `repo` path rejected; `web`-only on repo-shaped question rejected | Test | |
| R11 | Path outside `sandbox_root` rejected; `dist/` mutation fixture rejected | Test | Filesystem-scoped |
| R12 | Brief requesting `web` without a recorded status rejected | Test | |
| R13 | Fan-out growth rejected; incoherent taper rejected; survivor forces escalation | Test | Three checks |
| R14 | Structurally incomplete round record rejected | Test | |
| R15 | Conformance check locks SKILL.md stage list to validator expectations | Test | Anti-drift |
| RI1 | Grep proves no blanket form remains; conflicting dispositions without reconcile note rejected | Test | |
| RI2 | Carve-out stated as principle; council skill carries its own no-nesting rule | Review | Doc read |
| RI3 | Validator green on well-formed brief and prints summary | Test | |
| RI4 | Frontmatter-only distinguishability; depth > 1 rejected | Test | |
| RI5 | `npm run build` clean; `render-adapters` current | Test | |
| RI6 | All five non-claims present verbatim in README | Review | Doc read |
| RI7 | `cap_source: council-default` recorded when unconfigured | Test | |
| RI8 | Depth resolves global-then-repo-local; recorded in artifact | Test | |
| RI9 | `violations:test` count increases; each rejection attributed correctly | Test | |

## Architecture Notes

- role: Principal Engineer
- decision: Sequence contracts first and freeze them. RI1, R4, and R10 are the surfaces WP-R22
  inherits; a late shape change there propagates into a commit-blocking gate rather than staying
  local. Everything else in this plan is downstream of that choice.
- decision: Keep the preserved single-agent path as its own reference file with a byte-comparison
  gate, rather than as a mode of the new pipeline. A mode of a broken pipeline is not a rollback,
  and without the byte comparison the "preserved" path silently drifts into a reconstruction.
- constraint: Validators are an explicit list in `scripts/validate-template.mjs`, not auto-discovered
  — RI3 is not complete until registered there. Zero new runtime dependencies; `check-council-record`
  is hand-written Node ESM.
- tradeoff: Seven sequential phases with no parallelism is slower than overlapping 2 and 3. Chosen
  because both touch `dispatch-subagents` and `phase-caps.md`, so they are not independent under the
  very rule Phase 1 narrows — overlapping them would mean exempting ourselves from our own contract
  in the package that writes it.
- downstream: WP-R22 starts from Phase 1's three frozen contracts. Ship must carry A5's 1.2.0 removal
  onto the release checklist alongside OI-67's `warn-until-1.2.0` markers, or the preserved path
  becomes permanent dead weight.

## Plan Amendments

Amendments made after user approval are recorded here rather than applied silently. Neither changes
the approved sequencing, the Phase 1 contract freeze, or any manifest ID's phase assignment.

**A1 (2026-08-17, clerical).** Phase 1's `Touches` abbreviated four paths to `references/<file>.md`
and `SKILL.md`. `check-scope-fence` matches literally, so the abbreviated entries did not match the
task artifact's Changed Files. Expanded to full repo-relative paths, matching what the Repo Impact
Map already listed. No scope change.

**A2 (2026-08-17, substantive but scope-neutral).** `council-contracts.md` was added to Phase 1's
`Touches` and to the Repo Impact Map. The map originally assigned R10 to
`src/workflow/skills/think-council/`, created in Phase 3. Building Phase 1 made clear that WP-R22's
Review council must inherit both R4 and R10, and inheriting them from a *Think-specific* skill
couples the two councils in the wrong direction — defeating Phase 1's stated purpose of landing and
freezing exactly the surfaces R22 inherits. The contracts moved to the shared dispatch contract,
which both councils already load. No requirement changed; only the file that houses it. Rationale
also recorded in the task artifact's Implementation Log.

**A3 (2026-08-17, clerical).** Phase 7's `Touches` used a glob, `test/fixtures/lifecycle-violations/council-*/`.
`check-scope-fence` matches exact paths or directory prefixes, not globs, and the fixtures were
named for the rule each one violates (`ca-unattributed-finding`, `cb-empty-rejection-reason`, …)
rather than with a `council-` prefix. Expanded to the fifteen real directories plus
`test/fixtures/conformance/council-wellformed`, which holds the positive control. No scope change —
same fixtures, named as built.

**A4 (2026-08-17, corrective — not clerical).** A self-audit after the Phase 7 commit found six
acceptance criteria that had been written into shipped documentation but never made mechanical:
R9's classification requirement had no schema field, section, or check at all; R11's sandbox rules
were entirely unimplemented because the validator never read a Members table; R2's outward-capability
rule, R13's `max_rounds` bound, and half of R5's surviving-`Q` rule were likewise absent. The Phase 7
commit had described this as a "partial gate deferral", which mischaracterised a gap as a schedule.

Cause, recorded because it is the more useful artifact than the fix: phase completion was judged by
the suite being green, and the suite only ever tested what had been written — never what the plan
required. A green run proved the fixtures rejected; it proved nothing about criteria with no fixture.

Corrected by adding `### Requirement Classification` and `### Members` to the Think output schema, a
resolved-config loader for `max_rounds` and `sandbox_root` in `check-council-record.mjs`, the nine
missing checks, and nine rejection fixtures. Phase 7's `Touches` extended accordingly. No requirement
changed; the requirements are now enforced rather than merely documented.

**A5 (2026-08-18, corrective — review remediation scope).** Closing the review's five findings and
four residual risks required files Phase 7 had not declared. Added to its `Touches`: the seven new
rejection fixtures (`cy`–`de`), `validators/repo-digest.mjs` (new — the filesystem-scoped digest
that closes R-2, since `git status` is blind to `dist/`), `validators/check-lifecycle.mjs` (OI-73,
the checkpoint quote extractor), and both copies of the pre-commit hook (OI-74, which had been
forcing `--no-verify` on every incremental Build commit).

OI-73 and OI-74 are not WP-R21 manifest IDs. They are shipped-contract defects this chain surfaced
and the user directed be fixed here rather than deferred. Recorded as in-scope by this amendment
rather than smuggled in under an existing ID, so the manifest keeps meaning what it says.

**A6 (2026-08-19, corrective — PR #64 review).** PR review found internal tracker IDs (`WP-R#`,
`OI-#`, `Review F#`) in shipped `src/` files. `src/workflow/` is copied verbatim into consumer repos
and into `~/.agentsmyth`, so a consumer reading their own installed config, schema, skill or
validator was being shown this repo's Notion ticket IDs — files that read as internal notes rather
than as a product. 47 references across 19 files, accumulated over several packages; this chain
introduced roughly a third of them.

All were removed, keeping the *reasoning* and dropping only the reference. The one exception is
`follow-up-owner-assigner/references/ledger-format.md`, where `OI-1`/`OI-2` are sample data
illustrating the ledger's own ID format rather than references to this repo's tracker.

Added to Phase 7's `Touches`: `check-trigger-predicates.mjs` (five references) and
`test/run-conformance-tests.mjs` (the new guard). The guard — conformance check
`shipped-neutrality` — is the substantive part: a one-time cleanup would simply re-accumulate,
since nothing had ever looked.

**A7 (2026-08-21, corrective — open items fixed rather than filed).** The PR review made clear that
filing an open item is not a fix. Five were closed with working code rather than carried:

- **OI-72** — NUL sentinels in `check-trigger-predicates.mjs` replaced with printable ones. This was
  the root of a class: the NUL bytes made `grep` treat the file as binary, so a repo-wide text sweep
  silently reported it clean. It had already produced two false-clean audits, including this
  package's own neutrality sweep. **OI-78** closes with it.
- **OI-75** — `check-coverage-ledger` now reads a drop as a *status token* at the start of a cell,
  not as any occurrence of the word in prose.
- **OI-77** — `check-scope-fence` validates plan `Touches` entries directly, scoped to in-flight
  chains so completed records are not retroactively failed.
- **OI-70** — CLAUDE.md's stale "all 4 fixtures" corrected to 60, plus the missing conformance line.

Adopting the OI-77 check found one real defect immediately: `site-docs-remediation-tier2-3` Phase 6
declared `site/*.md`, an interior glob the fence never expands, so that phase's scope was silently
empty. Repaired to `site/`, a prefix the fence does understand.

**A8 (2026-08-24, corrective — external PR review).** A fresh external review of PR #64 raised
thirteen findings. Eleven are fixed in this pass with fixtures; two are recorded as open items
because acting on them unilaterally would change a shipped CLI contract (OI-80) or a gate predating
this package (OI-79). Dispositions for all thirteen are tabulated in the review artifact.

The two structural changes worth noting here: the Findings table gained a `Round` column, so the
per-round spot-check rule is derivable from the table itself rather than inferred from Members; and
validator config resolution is now scoped by `--dir`, so a fixture no longer reads the host repo's
profile and produce a machine-dependent verdict.

## Open Questions

None blocking. Two settled at Build by evidence rather than by decision: the exact cost multiplier
(RK-C, measured on the first real council run) and whether `check-council-record.mjs` stays
declarative enough to need no tests of its own beyond Phase 7's fixtures.

## Checkpoint Approval

- Checkpoint: plan-review
- Status: approved
- Date: 2026-08-17
- User's own words (verbatim, this turn): "Plan is approved"
- Scope of approval: the seven-phase sequencing, the Phase 1 contract freeze that WP-R22 inherits,
  the deliberate non-overlap of Phases 2 and 3, all 24 manifest IDs' phase assignments, the
  verification plan, and the two agent-added exit gates (Phase 4's byte-comparison of the preserved
  single-agent path, and A5's 1.2.0 removal written as a gate item rather than left to Ship).

## Exit Gate

- [x] Every active R and RI mapped to a phase.
- [x] Every phase has a binary exit gate.
- [x] Verification plan covers every R and RI.
- [x] User approved or waiver recorded.
