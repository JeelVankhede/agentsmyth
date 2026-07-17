---
slug: src-audit-remediation
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-07-15T12:30:00Z
updated: 2026-07-15T13:20:00Z
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
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
---

# Src Content Audit Remediation — Plan

## Summary

Execution design for the 12 audit-remediation requirements. Work splits into four independent
build workstreams that touch disjoint source trees (setup references, waived-Test contract, adapter
parity, skill-trigger enforcement + consistency), plus a consolidated rebuild/integration phase and
a Test phase that re-runs the full suite. The single non-obvious sequencing decision: build the R8
recurrence-guard validator **first within its phase** so the R1–R3 doc rewrites are themselves
machine-checked as they land, rather than hand-corrected and hoped-correct. No external
source-of-truth or release action is in Build scope.

## Inputs

- Approved brief `workflow/artifacts/briefs/src-audit-remediation-v1.md` (Complex; Q1 resolved →
  strengthen the validator; A1 confirmed with evidence; A2 superseded).
- `workflow/agent-behavior.yaml` (task classes, artifact chain, skill_scoring, dispatch cap = 3).
- `workflow/config/repo-profile.yaml` (branch policy: non-default branch required; zero-dep
  invariant via CLAUDE.md).
- `workflow/config/source-of-truth.yaml` (mode optional, providers []: no external source in scope).
- `workflow/config/release.yaml` (required: false; no release/publish in Build scope).
- Current-turn repo inspection: schema field ground-truth, `check-config` pass, validator contracts
  in `lib.mjs`, `render-adapters.mjs` token list.

## Requirement Coverage

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R1 (config-map sync) | Phase 1 | Owning phase P1; checked by R8's validator. |
| R2 (token-map sync) | Phase 1 | Owning phase P1. |
| R3 (SKILL.md examples) | Phase 1 | Owning phase P1. |
| R4 (waived-Test path) | Phase 2 | Owning phase P2; includes the AGENTS.md step-3 waiver sentence (same contract change originally noted under RI3 — folded here to avoid two phases editing the same file region). |
| R5 (adapter parity) | Phase 3 | Owning phase P3; asset regen happens in P5. |
| R6 (strengthen check-skill-triggers) | Phase 4 | Owning phase P4. |
| R7 (lifecycle.md Test-upstream) | Phase 4 | Owning phase P4. |
| R8 (schema-driven setup-ref check) | Phase 1 | Owning phase P1; built before R1–R3 land. |
| R9 (starter-block upstream shape) | Phase 4 | Owning phase P4; fixes all 7 starter blocks + reconciles `think` empty-upstream vs schema. |
| R10 (check-waivers over-fire) | Phase 4 | Owning phase P4; framing-artifact exemption + verify-matrix enum-token handling. |
| R11 (`-p<P>` suffix honored) | Phase 4 | Owning phase P4; `check-artifacts` + `check-lifecycle` accept the documented suffix. |
| R12 (contract-conformance guard) | Phase 4 | Owning phase P4; strengthened `check-starter-blocks.mjs` + fixtures — the systemic recurrence guard for the whole class (frontmatter dimension). |
| R13 (plan starter-block phase body format) | Phase 4 | Owning phase P4; bold `**Manifest IDs:**`/`**Exit gate:**` to match `check-phase-map`. |
| RI1 (rebuild bundles) | Phase 5 | Owning phase P5 (consolidated rebuild after all src edits). |
| RI2 (no suite regression) | Phase 5 | Full suite green run in P5 (moved into a phase block so check-phase-map covers it). |
| RI3 (low-sev consistency) | Phase 4 | Owning phase P4; scope = role-label align + `manifest_ids` A/Q note + date-time tracked-as-follow-up. AGENTS.md waiver sub-item delivered by P2/R4 (explained multiple-map). |
| RI4 (zero new dep) | Phase 5 | Owning phase P5 gate (package.json `dependencies` unchanged). |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `src/setup/references/config-map.md` | rewrite | R1 | Fields → real `source-of-truth`/`verification`/`release` schema shape. |
| `src/setup/references/token-map.md` | rewrite | R2 | `{{REPO_NAME}}`, `{{VERIFICATION_CMDS}}` (`commands[].command`), `{{CONSTRAINTS}}` sources. |
| `src/setup/SKILL.md` | edit | R3 | Pending-setup examples → `commands[].command`, `providers[].location`. |
| `src/workflow/validators/check-setup-refs.mjs` | new | R8 | Schema-driven field-existence check for the two ref docs. |
| `test/fixtures/setup-refs/*` + `test/run-*` (or inline) | new | R8 | Seeded-wrong-field regression case. |
| `package.json` (`validate` script) | edit | R8, R6 | Wire both new checks — **shared file between P1 and P4** (see Risks). |
| `src/workflow/skills/lifecycle-test/SKILL.md` + `references/` | edit | R4 | Waived-Test writes a verify artifact with `waived` matrix rows. |
| `src/workflow/skills/lifecycle-ship/SKILL.md` + `references/` | edit | R4 | Accept a waived-Test verify artifact via existing waiver path. |
| `src/workflow/router.md` | edit | R4 | Clarify waived-Test → Ship path. |
| `src/assets/AGENTS.md` | edit | R4 (RI3 sub-item) | Step 3 notes Test-skip requires a waiver. |
| worked example under `examples/**` | new/edit | R4 | Standard chain that waives Test, for R4 acceptance. |
| `src/adapters/cursor/rules/index.mdc` | edit | R5 | Add mandatory-gate assertion line. |
| `src/adapters/windsurf/.windsurfrules` | edit | R5 | Add mandatory-gate assertion line. |
| `src/workflow/validators/check-skill-triggers.mjs` | edit | R6 | Fail on missing/incomplete log for phase-mandated triggers. |
| `src/workflow/agent-behavior.yaml` (skill_scoring comment) | edit | R6 | Narrow the claim to match enforced behavior. |
| `src/workflow/skills/lifecycle-think/SKILL.md` (Exit Gate) | edit | R6 | Wording matches validator. |
| `src/workflow/skills/lifecycle-*/references/output-schema.md` | edit | R6, RI3 | Add `skill_trigger_log` stub (Think); align `role:` label. |
| `test/fixtures/skill-triggers/*` | new | R6 | Log-missing + log-complete Think fixtures. |
| `src/workflow/lifecycle.md` | edit | R7 | Test-upstream wording matches the hard gate. |
| `src/workflow/skills/lifecycle-{think,plan,build,review,test,ship,reflect}/references/output-schema.md` | edit | R9 | `upstream:` → array-of-strings in all 7 (think gets a real 1-item upstream or schema relaxed). |
| `src/workflow/validators/check-starter-blocks.mjs` | edit | R9, R12 | Validate each starter block's frontmatter against `artifact-frontmatter.schema.yaml` (the conformance guard). |
| `src/workflow/validators/check-waivers.mjs` | edit | R10 | Exempt brief/plan from the unstructured scan; treat verify-matrix `waiver`/`waived` enum tokens as non-claims. |
| `src/workflow/validators/check-artifacts.mjs` | edit | R11 | Filename regex accepts `-v<N>-p<P>.md`. |
| `src/workflow/validators/check-lifecycle.mjs` | edit | R11 | Slug detection accepts the `-p<P>` suffix. |
| `test/fixtures/starter-blocks/*`, `test/fixtures/waivers/*`, `test/run-conformance-tests.mjs` | new | R12, R10, R11 | Seeded broken starter block, real-waiver-claim fixture, `-p<P>` filename fixture. |
| `src/workflow/lifecycle.md` (`-p<P>` doc) | confirm | R11 | Doc stays; validators now honor it. |
| `dist/**`, root `validators/**`, `src/assets/adapters/**`, `workflow/schemas/**` | regen | RI1 | Build products — regenerated by `npm run build`, never hand-edited. |

## Source-of-Truth Strategy

`source-of-truth.yaml` is `mode: optional` with no providers configured, and the work is internal
repo documentation/contract/validator changes. **No external source read or update is required.**
No blocked handoff, no waiver needed on source-of-truth grounds. The brief itself
(`briefs/src-audit-remediation-v1.md`) and this plan are the requirement authority for the chain.

## Approach

Four disjoint build workstreams + one integration phase. Within Phase 1, build the R8 validator and
its fixture *before* rewriting R1–R3, so the corrected docs are validated on landing (mitigates the
"hand-fix introduces a new wrong field" risk). Phases 1–4 touch non-overlapping source trees except
for the `package.json` `validate` line (P1 and P4 both append a validator) — coordinate that one
line at merge, or sequence P4's `package.json` edit after P1. Phase 5 does the single authoritative
`npm run build` after all source edits and confirms zero-dep. Test re-runs the full suite. Release
(npm publish) is explicitly deferred to Ship and out of Build scope.

## Phases

### Phase 1 - Setup-reference accuracy (recurrence-guard-first)

- **Manifest IDs:** R8, R1, R2, R3
- Touches: `src/workflow/validators/`, `src/setup/`, `src/workflow/schemas/`,
  `scripts/`, `package.json`, `test/`
- Work: (1) Write `check-setup-refs.mjs` — parse the field tokens out of `config-map.md`/`token-map.md`
  and assert each exists in the corresponding `src/workflow/schemas/*.schema.yaml`, driven off the
  schema files (not a hard-coded field list). (2) Add a fixture with a seeded wrong field proving the
  check fails. (3) Rewrite `config-map.md`, `token-map.md`, and the `SKILL.md` pending-setup examples
  to the confirmed real schema shapes until the check passes. (4) Wire the check into `npm run validate`.
- **Exit gate:** `node src/workflow/validators/check-setup-refs.mjs` exits 0 on the corrected docs and
  non-zero on the seeded-wrong-field fixture; `npm run validate` runs it; a grep confirms none of
  `resolution_order|required_before_ship|evidence_policy|targets|\.run|\.read_url` remain in the two
  ref docs or the SKILL.md examples.

### Phase 2 - Waived-Test contract

- **Manifest IDs:** R4
- Touches: `src/workflow/skills/`, `src/workflow/router.md`, `src/assets/`,
  `examples/`
- Work: Document that a waived Test phase still writes a `verify` artifact whose verification-matrix
  rows are recorded as `waived` (not `pass`), carrying the 6-field waiver; make `lifecycle-ship`
  accept that artifact through the existing waiver path; clarify the path in `router.md`; add the
  "skipping Test requires a waiver" sentence to `AGENTS.md` step 3; add a worked Standard example
  that exercises the path.
- **Exit gate:** the worked example's waived verify artifact passes
  `node src/workflow/validators/check-lifecycle.mjs --phase ship --slug <example>` and
  `release-readiness-gate` aggregates it to a valid recommendation with the waiver visible as
  residual risk (rows are `waived`, none fabricated as `pass`).

### Phase 3 - Adapter parity

- **Manifest IDs:** R5
- Touches: `src/adapters/`
- Work: Add the mandatory-gate assertion ("Never skip this gate. Never mark a phase complete without
  evidence.") to both, matching claude/codex/copilot. Asset regeneration is deferred to Phase 5.
- **Exit gate:** both source adapters contain the mandatory-gate assertion (grep); no other adapter
  content changed. (Byte-parity of `src/assets/adapters/` is verified in Phase 5 after rebuild.)

### Phase 4 - Enforcement, contract-conformance + consistency

- **Manifest IDs:** R6, R7, R9, R10, R11, R12, R13, RI3
- Touches: `src/workflow/validators/`, `src/workflow/skills/`, `test/`,
  `package.json`, `src/workflow/agent-behavior.yaml`, `src/workflow/lifecycle.md`,
  `workflow/artifacts/` (R6 review-fix: backfill `skill_trigger_log` into the pre-feature brief corpus)
- Work: (R6) Strengthen `check-skill-triggers.mjs` to fail when an artifact whose phase mandates
  trigger evaluation is missing a `skill_trigger_log` or omits a phase-mandated skill, driven off a
  static phase→required-skills map; **do not** attempt to evaluate the skill_scoring predicate.
  Narrow the `agent-behavior.yaml` comment + `lifecycle-think` Exit Gate wording to match. Add a
  `skill_trigger_log` stub to the Think starter block. (R7) Align `lifecycle.md`'s Test-upstream
  wording with the hard gate (review required). (RI3) Align `role:` label between the Think starter
  block and `lifecycle-think`; add a one-line "A/Q IDs never go in `manifest_ids`" note where
  authors see it; record `format: date-time` non-enforcement as a Reflect follow-up candidate.
  (R9) Fix `upstream:` in all 7 starter blocks (six map→array; `think` gets a real 1-item upstream
  or the schema's `upstream.minItems` is relaxed for briefs). (R12) Strengthen
  `check-starter-blocks.mjs` to parse each starter block's frontmatter and validate it against
  `artifact-frontmatter.schema.yaml` — the conformance guard; add a `run-conformance-tests.mjs`
  covering a seeded broken block and the `-p<P>` filename form. (R10) In `check-waivers.mjs`, exempt
  brief/plan from the unstructured-waiver scan and treat verify-matrix `waiver`/`waived` enum tokens
  as non-claims (extend the `hold-with-waiver` exemption); add a fixture proving a real prose waiver
  claim is still caught. (R11) Make `check-artifacts.mjs` (filename regex) and `check-lifecycle.mjs`
  (slug detection) accept `-v<N>-p<P>.md`.
- **Exit gate:** `check-skill-triggers.mjs` behaves per R6 fixtures; `lifecycle.md` == `check-lifecycle`
  `UPSTREAM` for Test; `role:` label aligned; `manifest_ids` note present. **Conformance guard
  (R12):** an artifact copied verbatim from any of the 7 starter blocks passes `check-artifacts`;
  `check-starter-blocks.mjs` fails on a seeded broken block. **R10:** `check-waivers` passes this
  chain's brief/plan and a verbatim verify artifact, still fails a seeded genuine prose claim.
  **R11:** a `-p<P>` task passes `check-artifacts` and `check-lifecycle --phase review` resolves it.
  All wired into `npm run validate`, which is green.

### Phase 5 - Rebuild, integrate & verify

- **Manifest IDs:** RI1, RI2, RI4
- Touches: build products only (`dist/`, root `validators/`, `src/assets/`, `workflow/schemas/`) via
  `npm run build`; `package.json` inspection (no edit); runs the full test/validator suite.
- Work: Run `npm run build` once after all source edits; confirm `src/assets/adapters/` is
  byte-identical to `src/adapters/` (R5 parity) and bundles regenerated; confirm `package.json`
  `dependencies` unchanged and new validators import only `node:*`/`lib.mjs`; run the full suite
  (`validate` + `violations`/`setup-checks`/`setup-refs`/`conformance`/`root-resolution`) green (RI2).
- **Exit gate:** `npm run build` completes; `git status` shows build products regenerated (not
  hand-edited); `diff -rq src/adapters src/assets/adapters` reports identical; `package.json`
  `dependencies` unchanged; `npm run validate` and all test suites pass (RI2).

## Dependency Order

1. **Parallel:** Phase 1, Phase 2, Phase 3, Phase 4 — disjoint source trees. Only shared file is the
   `package.json` `validate` line (P1 + P4): coordinate at merge or land P4's `package.json` edit
   after P1's. Within Phase 1, R8 validator + fixture precede the R1–R3 rewrites.
2. **Phase 5** (rebuild & integrate) after Phases 1–4 complete — it consumes all source edits and
   regenerates `src/assets/adapters/` (delivering R5's asset parity).
3. **Test** (RI2, full suite) after Phase 5.
4. Dispatch cap is 3 parallel workstreams (`agent-behavior.yaml`); with 4 independent build phases,
   run at most 3 concurrently or sequence — parallelism is optional, not required.

## Branch Strategy

Continue on the existing non-default branch `fix/src-audit-remediation` (satisfies
`branch_policy.require_non_default_branch_for_changes: true`; no default-branch exception needed).
Build phases use `-p<P>` task artifacts: `workflow/artifacts/tasks/src-audit-remediation-v1-p1.md`
… `-p5.md`, sharing slug `src-audit-remediation` and version 1. Commit only when the user asks; the
primary agent is merge owner for the `package.json` coordination point. No push to `main`.

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|
| R4 wording weakens the Test gate (waiver fabricates a pass) | Med | High | Reuse the 6-field waiver schema + `waiver-completeness-check`; matrix rows are `waived`, never `pass`; waiver stays visible as residual risk. | Build/Review | R4 |
| R8 check brittle if it hard-codes field lists | Med | Med | Drive field existence off the schema files themselves (two-root resolver), so it tracks schema changes. | Build | R8 |
| R1–R3 hand-rewrite introduces a new wrong field | Med | Med | Build R8 + fixture first within Phase 1; corrected docs must pass the check before phase exit. | Build | R1, R2, R3, R8 |
| P1 and P4 both edit `package.json` `validate` → merge conflict | High | Low | Single merge owner (primary agent); or sequence P4's package.json edit after P1. | Primary agent | R6, R8 |
| Rebuild forgotten → stale `dist/`/assets shipped | Med | High | RI1 owning Phase 5 gate; `git status` shows regenerated build products. | Build | RI1 |
| R6 over-scoped into a score evaluator (impossible) | Low | Med | Plan pins R6 to log presence/completeness for phase-mandated triggers only; predicate/score boundary stays honor-system. | Build/Review | R6 |

## Verification Plan

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1 | `check-setup-refs` passes on `config-map.md`; wrong-field grep empty | Phase 1 | |
| R2 | `check-setup-refs` passes on `token-map.md`; `render-adapters` still renders 8 tokens (`npm run validate`) | Phase 1 | |
| R3 | `check-setup-refs`/grep: every SKILL.md example dot-path exists in a schema | Phase 1 | |
| R4 | Worked example verify artifact passes `check-lifecycle --phase ship`; `release-readiness-gate` recommendation valid; rows `waived` | Phase 2 | Manual QA on the worked chain. |
| R5 | All 5 source adapters carry the gate line (grep) | Phase 3 | Parity byte-check in Phase 5. |
| R6 | `check-skill-triggers` non-zero on log-missing fixture, 0 on complete; `npm run validate` runs it | Phase 4 | |
| R7 | `lifecycle.md` Test-upstream wording == `check-lifecycle` `UPSTREAM` map (diff/inspection) | Phase 4 | |
| R8 | `npm run validate` runs `check-setup-refs`; fails on seeded wrong field, passes on corrected docs | Phase 1 | |
| R9 | All 7 starter blocks' `upstream:` schema-conforms; artifact copied from any block passes `check-artifacts` | Phase 4 | Enforced by R12. |
| R10 | `check-waivers` passes chain brief/plan + verbatim verify artifact; still fails a seeded genuine prose claim | Phase 4 | Fixture proves P2 detection preserved. |
| R11 | `-p<P>` task passes `check-artifacts`; `check-lifecycle --phase review` resolves its slug | Phase 4 | Fixture. |
| R12 | `check-starter-blocks` (strengthened) + `run-conformance-tests` fail on seeded broken block, pass on corrected; run in `npm run validate` | Phase 4 | The recurrence guard (frontmatter). |
| R13 | Plan starter block uses bold `**Manifest IDs:**`/`**Exit gate:**`; a plan authored from it (this chain's own) passes `check-phase-map` | Phase 4 | Body-format instance. |
| RI1 | `npm run build`; `git status` shows `dist/`/`validators/`/`assets/`/`schemas/` regenerated | Phase 5 | |
| RI2 | `npm run validate` + `violations:test` (20/20) + `setup-checks:test` + `root-resolution:test` all pass | Test | Full suite. |
| RI3 | `role:` label diff resolved; `manifest_ids` A/Q note present; date-time in Reflect follow-up | Phase 4 | |
| RI4 | `package.json` `dependencies` unchanged; new validators import only `node:*`/`lib.mjs` | Phase 5 | |

## Architecture Notes

- role: Principal Engineer
- decisions:
  - Four disjoint build workstreams (setup-refs / waived-Test / adapter parity / enforcement) so
    Build can parallelize within the cap-3 dispatch budget; a single Phase 5 does the authoritative
    rebuild so no phase ships stale bundles.
  - **R8-first within Phase 1:** the recurrence-guard validator and its fixture are built before the
    R1–R3 doc rewrites, so the corrected docs are machine-checked on landing — directly mitigating
    the "hand-fix introduces a new wrong field" risk the brief flagged.
  - **Fold the AGENTS.md waiver sentence into R4/Phase 2** rather than leaving it in RI3/Phase 4,
    because it edits the same file region as the R4 waived-Test contract; RI3's remaining scope is
    the truly independent low-sev items. This is the one explained multiple-map (RI3 → P2 sub-item +
    P4 owning).
  - **Asset regeneration lives only in Phase 5**, so Phase 3 edits `src/adapters/` and Phase 5
    regenerates `src/assets/adapters/` — removing a P3/P5 write conflict on the build product.
- constraints: zero runtime deps; edit-source-then-`npm run build`; five-adapter parity;
  schemas are the fixed source of truth (brief A1, confirmed); provider-neutrality/safety unviolated.
- tradeoffs: parallelism is optional given the `package.json` shared-line coordination — a fully
  sequential Build is safe and simpler; the plan supports either. R6 strengthening is deliberately
  scoped to the mechanically-checkable boundary, accepting that score-correctness stays honor-system.
- downstream: Build writes `-p1..p5` task artifacts and must rebuild (RI1). Review focuses on the R4
  gate-safety (no fabricated pass) and R8 non-brittleness. Test exercises the waived-Test worked
  example and the seeded-wrong-field case, then the full suite (RI2). Ship handles any npm publish
  (out of Build scope). Reflect records the `format: date-time` follow-up and whether the invariant
  skills reduced drift on this chain.

## Open Questions

- None. The `upstream:` starter-block drift surfaced during Plan is now **folded in as R9** (user
  approved) — Plan inspection found it affects six of seven starter blocks
  (plan/build/review/test/ship/reflect), not just the plan block, and that
  `check-starter-blocks.mjs` never validated starter-block frontmatter against the schema (why it
  went uncaught). R9 fixes the six blocks and adds that validation as a recurrence guard. Owned by
  Phase 4.

## Exit Gate

- [x] Every active R and RI mapped to a phase (Requirement Coverage) with one owning completion phase.
- [x] Every phase has a binary, observable exit gate.
- [x] Dependency order explicit (parallel P1–P4, then P5, then Test; `package.json` coordination named).
- [x] Risks have mitigations and owners.
- [x] Verification plan covers every R/RI with named evidence (command / manual QA / inspection), no
      "test it" placeholders.
- [x] Source-of-truth (none required) and release (deferred to Ship) handling explicit.
- [x] Branch strategy explicit and non-default (`fix/src-audit-remediation`).
- [x] Brief A IDs resolved: A1 evidence-backed (confirmed), A2 superseded — no unverified assumption
      carried into Build.
- [ ] User approves the plan (plan-review checkpoint) before Build begins.
