---
slug: power-skills-domain-experts
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-07-11T10:30:00Z
updated: 2026-07-11T10:45:00Z
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
  - RI1
  - RI2
  - RI3
  - RI4
  - RI5
  - RI6
upstream:
  - workflow/artifacts/briefs/power-skills-domain-experts-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: approved
---

# Power Skills — Wave 3 (Explorers + Domain Experts) - Plan

## Summary

Ships all of Wave 3: 3 Think-phase explorers (C1-C3), 7 domain-expert skills (D1-D7) with ~39
substantive knowledge-route reference files, the E1 wiring addition to `dispatch-subagents`, one
new validator (`check-constraint-conflicts.mjs` for C3), and the 10 new `skill_scoring.triggers`
entries. Six build phases execute in dependency order, each sized to keep content review
tractable (no phase authors more than ~15-20 new files), matching the brief's own downstream_impact
instruction. Each phase must pass `npm run build && npm run validate && npm run violations:test &&
npm run setup-checks:test` before the next begins.

**Phase gate check passed before writing this plan:**
`node src/workflow/validators/check-lifecycle.mjs --phase plan --slug power-skills-domain-experts` → ok

## Inputs

- Brief: `workflow/artifacts/briefs/power-skills-domain-experts-v1.md` — status `ready-for-next-phase`, user-approved.
- Active manifest IDs: R1-R9, RI1-RI6, A1-A2 (Q1-Q2 resolved, non-blocking).
- Branch: `feat/wp-r4-power-skills-domain-experts`, already created off `origin/main` (working tree clean at Think time).
- Real precedent inspected: `workflow/artifacts/plans/power-skills-wave2-v1.md`'s 5-phase shape and `power-skills-spine-v1.md`'s 6-phase shape — followed here for consistency, adapted for this wave's much larger content footprint.
- `src/workflow/agent-behavior.yaml`'s `skill_scoring.triggers: {}` confirmed empty by inspection — this wave's R7 is purely additive, no conflict with existing entries.
- `src/workflow/validators/check-skill-triggers.mjs` confirmed by direct inspection (brief RI6/A1) to audit generically via `artifact-frontmatter.schema.yaml`'s `skill_trigger_log` schema, with no hardcoded skill-name list — no validator code change needed for the 10 new skills.
- `workflow/config/domain.yaml`'s `constraints` block (product/safety/provider_neutrality, each an array of prose strings, no IDs) confirmed by inspection — C3's `check-constraint-conflicts.mjs` needs a constraint-ID convention that does not exist yet; Phase 1 must decide this (see Architecture Notes).

## Requirement Coverage

| Manifest ID | Covered by phases | Owning phase |
|---|---|---|
| R1 | Phase 1 | Phase 1 |
| R2 | Phase 1 | Phase 1 |
| R3 | Phase 1 | Phase 1 |
| R4 | Phase 1 | Phase 1 |
| R5 | Phase 2, Phase 3, Phase 4 | Phase 2, Phase 3, Phase 4 |
| R6 | Phase 5 | Phase 5 |
| R7 | Phase 1, Phase 5 | Phase 1, Phase 5 |
| R8 | Phase 1 | Phase 1 |
| R9 | Phase 6 | Phase 6 |
| RI1 | Phase 1 | Phase 1 |
| RI2 | Phase 2, Phase 3, Phase 4 | Phase 2, Phase 3, Phase 4 |
| RI3 | Phase 6 | Phase 6 |
| RI4 | Phase 6 (verified; true throughout) | Phase 6 |
| RI5 | Phase 1 (branch/slug established at Think; reconfirmed at each phase boundary) | Phase 1 |
| RI6 | Phase 1 (confirmed by inspection before this plan was written) | Phase 1 |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `src/workflow/skills/repo-alignment-scan/SKILL.md` + `references/*.md` | new | R1, RI2 | Category C1 skill |
| `src/workflow/skills/architecture-decision-advisor/SKILL.md` + `references/*.md` | new | R2, RI2 | Category C2 skill |
| `src/workflow/skills/constraint-conflict-scan/SKILL.md` + `references/*.md` | new | R3, RI2 | Category C3 skill |
| `src/workflow/skills/lifecycle-think/SKILL.md` | modify | R1, R2, R3 | wire all 3 explorers into What To Load / Workflow / Refusal / Architecture Notes Expectations |
| `src/workflow/validators/check-constraint-conflicts.mjs` | new | R4, RI1 | validates C3's declared conflicts reference real constraint IDs |
| `workflow/config/domain.yaml` | modify | R4 | add stable constraint IDs (e.g. `product-1`, `safety-1`) to the existing prose array so C3/`check-constraint-conflicts.mjs` has something concrete to reference — see Architecture Notes decision |
| `src/workflow/schemas/domain.schema.yaml` | modify | R4 | add optional `id` field to constraint entries (additive, backward-compatible with prose-only entries) |
| `scripts/validate-template.mjs` | modify | R4 | register `check-constraint-conflicts.mjs` in `artifactCommands` |
| `test/fixtures/lifecycle-violations/o1-constraint-conflict-bad-id/` | new | R4, R6 | negative fixture for `check-constraint-conflicts.mjs` |
| `test/run-violation-tests.mjs` | modify | R6 | register the new fixture |
| `src/workflow/agent-behavior.yaml` | modify | R7 | fill `skill_scoring.triggers` with all 10 new predicates from the resolved spec §5 |
| `src/workflow/skills/interface-contract-designer/SKILL.md` + `references/{output-schema,rest,graphql,grpc,websocket,cli,sdk-library}.md` | new | R5, RI2 | Category D1 skill, 6 routes |
| `src/workflow/skills/data-schema-designer/SKILL.md` + `references/{output-schema,relational-sql,document-nosql,key-value,graph,migrations,event-schema}.md` | new | R5, RI2 | Category D2 skill, 6 routes |
| `src/workflow/skills/system-design-advisor/SKILL.md` + `references/{output-schema,monolith,microservices,event-driven,serverless,integration-boundary}.md` | new | R5, RI2 | Category D3 skill, 5 routes |
| `src/workflow/skills/ui-ux-designer/SKILL.md` + `references/{output-schema,web,mobile-ios,mobile-android,cross-platform-mobile,desktop,tui,accessibility}.md` | new | R5, RI2 | Category D4 skill, 7 routes |
| `src/workflow/skills/clean-code-architect/SKILL.md` + `references/{output-schema,oo,functional,layered,module-boundaries}.md` | new | R5, RI2 | Category D5 skill, 4 routes |
| `src/workflow/skills/quality-gates-validator/SKILL.md` + `references/{output-schema,unit-coverage,integration,lint-type,security-scan,perf-budget}.md` | new | R5, RI2 | Category D6 skill, 5 routes |
| `src/workflow/skills/performance-optimizer/SKILL.md` + `references/{output-schema,frontend-runtime,backend-throughput,db-query,mobile-runtime,memory,network}.md` | new | R5, RI2 | Category D7 skill, 6 routes |
| `src/workflow/skills/lifecycle-plan/SKILL.md` | modify | R6 | wire D1, D2, D3, D4, D6 into What To Load |
| `src/workflow/skills/lifecycle-build/SKILL.md` | modify | R6 | wire D1, D2, D4, D5, D6, D7 into What To Load |
| `src/workflow/skills/lifecycle-review/SKILL.md` | modify | R6 | wire D1, D2, D3, D4, D5, D6, D7 into What To Load |
| `src/workflow/skills/lifecycle-test/SKILL.md` | modify | R6 | wire D6, D7 into What To Load |
| `src/workflow/skills/README.md` | modify | R5 | add 10 new rows to the Power Skills table |
| `src/workflow/skills/dispatch-subagents/references/decision-tree-by-phase.md` | modify | R8 | add the E1 Test-verification-parallelization entry |
| `src/workflow/validators/README.md` | modify | R4 | add invocation example for `check-constraint-conflicts.mjs` |

Fixture letter `o1` is used instead of continuing the Wave 1 `a`-`p` sequence, since `o` and `p` are
already taken by Wave 1's post-review additions and this branch does not yet have Wave 2's `q`-`u`
(Wave 2 is unmerged on this branch's base — see Branch Strategy). Build must re-check the live
fixture-letter sequence against whichever branch state exists at Phase 5 time and adjust if Wave 2
has merged into `main` by then.

## Source-of-Truth Strategy

No external source-of-truth update required — self-contained repository files (schemas, skills,
validators, fixtures, docs). `workflow/config/source-of-truth.yaml` confirms `mode: optional`,
`default_required: false`.

## Assumptions Verified

| Assumption ID | Status | Evidence / Question |
|---|---|---|
| A1 | evidence-backed | Directly inspected `src/workflow/validators/check-skill-triggers.mjs` (Think, before this plan) — confirmed it validates `skill_trigger_log` generically against `artifact-frontmatter.schema.yaml`'s schema shape, with no hardcoded skill-name list anywhere in the source. R7's trigger-predicate extension is sufficient; no validator code change needed. |
| A2 | raised-as-question | Not yet verified — whether `check-constraint-conflicts.mjs` should follow the exact standalone-file pattern depends on Phase 1's constraint-ID design decision (see Architecture Notes), which did not exist as a settled convention before this plan. Converted to Q3 below rather than assumed silently. |

## Approach

Phase 1 sets up the smaller, foundational, non-route-file work first: C1-C3 (3 skills, no route
files), C3's validator + constraint-ID convention + fixture, E1's wiring note, and R7's trigger-map
fill-in. This phase is deliberately front-loaded because it resolves the one genuinely open design
question (constraint-ID convention) before any dependent work begins, and because C1-C3 wiring into
`lifecycle-think/SKILL.md` is small enough to fully verify in one phase.

Phases 2-4 author the 7 domain-expert skills in content-sized pairs/triples (not by category
letter) so no single phase authors more than ~20 new files:
- Phase 2: D1 (6 routes) + D2 (6 routes) — the two most similar in shape (both are "contract/shape
  design" disciplines), reviewable as a pair.
- Phase 3: D3 (5 routes) + D4 (7 routes) — architecture + UX, the two broadest-scope disciplines.
- Phase 4: D5 (4 routes) + D6 (5 routes) + D7 (6 routes) — code quality + testing + performance,
  grouped last since they most benefit from the earlier route files existing as a style reference.

Phase 5 wires all 7 D-skills into their phase files (single pass across all 7, since the wiring
work itself is small per-skill and benefits from doing it once with the full picture rather than
incrementally after each of Phases 2-4) and registers the fixture from Phase 1.

Phase 6 is closure: full-suite verification across all four gate commands, bundle/schema-sync
confirmation, adapter-isolation confirmation, and RI3-RI5 re-verification.

**Enforcement pattern (mirrors Wave 1/2):** after every phase, run:
```
npm run build && npm run validate && npm run violations:test && npm run setup-checks:test
```
All four must exit 0 before the next phase begins.

## Phases

### Phase 1 — Explorers, C3's validator, E1 wiring, trigger-map fill-in (R1, R2, R3, R4, R7, R8, RI1, RI5, RI6)

**Manifest IDs:** R1, R2, R3, R4, R7, R8, RI1, RI5, RI6

**Touches:**
- `src/workflow/skills/repo-alignment-scan/`
- `src/workflow/skills/architecture-decision-advisor/`
- `src/workflow/skills/constraint-conflict-scan/`
- `src/workflow/skills/lifecycle-think/SKILL.md`
- `src/workflow/validators/check-constraint-conflicts.mjs`
- `src/workflow/validators/README.md`
- `workflow/config/domain.yaml`
- `src/workflow/schemas/domain.schema.yaml`
- `scripts/validate-template.mjs`
- `test/fixtures/lifecycle-violations/o1-constraint-conflict-bad-id/`
- `test/run-violation-tests.mjs`
- `src/workflow/agent-behavior.yaml`
- `src/workflow/skills/dispatch-subagents/references/decision-tree-by-phase.md`

**Work:**
1. Decide and implement the constraint-ID convention: add a stable `id` field (e.g. `product-1`,
   `safety-1`, `provider-neutrality-1`) to each existing prose entry in `domain.yaml`'s
   `constraints` block, as an additive optional schema property (existing prose-only consumer repos
   stay valid — `id` is optional, not required).
2. Author C1 `repo-alignment-scan`, C2 `architecture-decision-advisor`, C3
   `constraint-conflict-scan` with full anatomy; wire all 3 into `lifecycle-think/SKILL.md`.
3. Implement `check-constraint-conflicts.mjs`: confirms a declared conflict in Think's output
   references a real constraint ID present in `domain.yaml`.
4. Author fixture `o1-constraint-conflict-bad-id` (a Think-adjacent artifact declaring a conflict
   against a nonexistent constraint ID); register in `test/run-violation-tests.mjs`; verify
   individually before wiring.
5. Fill `agent-behavior.yaml`'s `skill_scoring.triggers` with all 10 new predicates (C1-C3 + D1-D7)
   from the resolved spec §5, verbatim.
6. Add the E1 entry to `dispatch-subagents/references/decision-tree-by-phase.md`.
7. Confirm branch/slug (RI5).

**Exit gate:**
- All 3 C-skills exist with full anatomy, wired into `lifecycle-think/SKILL.md`.
- `check-constraint-conflicts.mjs` individually verified against real repo state; fixture verified rejected.
- `agent-behavior.yaml`'s `skill_scoring.triggers` contains all 10 new keys (C1-C3 present now; D1-D7 present now even though their skills don't exist until Phases 2-4 — the map is data, not code, so forward-declaring is safe and avoids a second edit to the same file later).
- `npm run build && npm run validate && npm run violations:test && npm run setup-checks:test` all exit 0.

### Phase 2 — D1 + D2 (R5, RI2)

**Manifest IDs:** R5, RI2

**Touches:**
- `src/workflow/skills/interface-contract-designer/`
- `src/workflow/skills/data-schema-designer/`
- `src/workflow/skills/README.md`

**Work:**
1. Author D1 `interface-contract-designer` with full anatomy and 6 substantive route files (rest,
   graphql, grpc, websocket, cli, sdk-library) — each with real design principles, common pitfalls,
   and a concrete checklist, per the user's confirmed content-depth decision.
2. Author D2 `data-schema-designer` with full anatomy and 6 substantive route files
   (relational-sql, document-nosql, key-value, graph, migrations, event-schema).
3. Add both to `src/workflow/skills/README.md`'s Power Skills table.

**Exit gate:**
- Both skill directories exist with `SKILL.md` + non-empty `references/`; every route file has real
  guidance (principles + checklist), not a stub.
- `npm run build && npm run validate && npm run violations:test && npm run setup-checks:test` all exit 0.

### Phase 3 — D3 + D4 (R5, RI2)

**Manifest IDs:** R5, RI2

**Touches:**
- `src/workflow/skills/system-design-advisor/`
- `src/workflow/skills/ui-ux-designer/`
- `src/workflow/skills/README.md`

**Work:**
1. Author D3 `system-design-advisor` with full anatomy and 5 substantive route files (monolith,
   microservices, event-driven, serverless, integration-boundary).
2. Author D4 `ui-ux-designer` with full anatomy and 7 substantive route files (web, mobile-ios,
   mobile-android, cross-platform-mobile, desktop, tui, accessibility).
3. Add both to `src/workflow/skills/README.md`'s Power Skills table.

**Exit gate:**
- Both skill directories exist with `SKILL.md` + non-empty `references/`; every route file has real guidance.
- `npm run build && npm run validate && npm run violations:test && npm run setup-checks:test` all exit 0.

### Phase 4 — D5 + D6 + D7 (R5, RI2)

**Manifest IDs:** R5, RI2

**Touches:**
- `src/workflow/skills/clean-code-architect/`
- `src/workflow/skills/quality-gates-validator/`
- `src/workflow/skills/performance-optimizer/`
- `src/workflow/skills/README.md`

**Work:**
1. Author D5 `clean-code-architect` with full anatomy and 4 substantive route files (oo, functional,
   layered, module-boundaries).
2. Author D6 `quality-gates-validator` with full anatomy and 5 substantive route files
   (unit-coverage, integration, lint-type, security-scan, perf-budget).
3. Author D7 `performance-optimizer` with full anatomy and 6 substantive route files
   (frontend-runtime, backend-throughput, db-query, mobile-runtime, memory, network).
4. Add all 3 to `src/workflow/skills/README.md`'s Power Skills table.

**Exit gate:**
- All 3 skill directories exist with `SKILL.md` + non-empty `references/`; every route file has real guidance.
- `npm run build && npm run validate && npm run violations:test && npm run setup-checks:test` all exit 0.

### Phase 5 — Wire D1-D7 into phase files (R6)

**Manifest IDs:** R6

**Touches:**
- `src/workflow/skills/lifecycle-plan/SKILL.md`
- `src/workflow/skills/lifecycle-build/SKILL.md`
- `src/workflow/skills/lifecycle-review/SKILL.md`
- `src/workflow/skills/lifecycle-test/SKILL.md`

**Work:**
1. Wire D1, D2, D3, D4, D6 into `lifecycle-plan/SKILL.md`'s What To Load.
2. Wire D1, D2, D4, D5, D6, D7 into `lifecycle-build/SKILL.md`'s What To Load.
3. Wire D1, D2, D3, D4, D5, D6, D7 into `lifecycle-review/SKILL.md`'s What To Load.
4. Wire D6, D7 into `lifecycle-test/SKILL.md`'s What To Load.
5. Confirm each phase's Architecture Notes Expectations section states where the domain-expert
   recommendation gets recorded (Architecture Notes for Plan/Build, review notes for Review).
6. Verify via exact `grep -l` match — no over-wiring, no under-wiring.

**Exit gate:**
- `grep -l <skill> src/workflow/skills/lifecycle-{plan,build,review,test}/SKILL.md` per skill matches exactly the phase list in the Repo Impact Map row above.
- `npm run build && npm run validate && npm run violations:test && npm run setup-checks:test` all exit 0.

### Phase 6 — Closure (R9, RI3, RI4)

**Manifest IDs:** R9, RI3, RI4

**Touches:** none (verification only).

**Work:**
1. Confirm `dist/workflow-bundle.md` contains FILE-marker blocks for all 10 new skill directories
   and their full route-file sets.
2. Confirm zero adapter diffs.
3. Full suite: `npm run build && npm run validate && npm run violations:test && npm run setup-checks:test`.

**Exit gate:**
- All confirmations pass; full suite exits 0.

## Dependency Order

```
Phase 1 (R1-R4, R7, R8)   ← constraint-ID convention + trigger-map are prerequisites for
  │                          nothing downstream content-wise, but Phase 1's trigger-map fill-in
  │                          forward-declares D1-D7's predicates so Phases 2-4 don't need to
  │                          touch agent-behavior.yaml again
Phase 2 (D1, D2)
  │
Phase 3 (D3, D4)
  │
Phase 4 (D5, D6, D7)
  │
Phase 5 (R6)              ← depends on Phases 2-4 for all 7 skill names existing
  │
Phase 6 (R9, RI3, RI4)    ← depends on everything above
```

Phases 2, 3, and 4 touch disjoint file sets (different skill directories) and have no content
dependency on each other — a future chain could parallelize them via `dispatch-subagents` under
independent file ownership, but this plan executes them sequentially for reviewability, matching
Wave 1/2's precedent.

## Branch Strategy

`feat/wp-r4-power-skills-domain-experts`, branched fresh off `origin/main` (not off Wave 2's
still-open, unreviewed PR #28) — resolved in Think (brief Architecture Notes). `origin/main` already
has Wave 1 (PR #26) and the audit chain (PR #27) merged, so this chain builds on real, shipped
invariant-spine infrastructure without depending on Wave 2's unmerged content.

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Route-file content quality cannot be caught by any validator (Category D is mostly No/Partial) | High | Medium | Review must read a meaningful sample (not all 39) for substance; Reflect should propose a lightweight rubric if this recurs across future domain-expert work |
| Scope size causes phase-boundary fatigue (39+ files across 3 content-heavy phases) | Medium | Medium | Fixed phase sizing (2-3 skills per phase, ~15-20 files) per the brief's own instruction; each phase gates independently |
| Constraint-ID convention (Phase 1) is a genuinely new design decision, not a resolved spec detail | Medium | Low | Additive-only schema change (optional `id` field); does not break existing prose-only consumer repos |
| Fixture-letter collision if Wave 2 merges into `main` before Phase 5 | Low | Low | Build must re-check live fixture-letter state at Phase 5 time (noted in Repo Impact Map) |

## Verification Plan

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1 | `ls src/workflow/skills/repo-alignment-scan/SKILL.md`; `grep -l repo-alignment-scan lifecycle-think/SKILL.md` | Test | |
| R2 | `ls src/workflow/skills/architecture-decision-advisor/SKILL.md`; `grep -l` in lifecycle-think | Test | |
| R3 | `ls src/workflow/skills/constraint-conflict-scan/SKILL.md`; `grep -l` in lifecycle-think | Test | |
| R4 | `node src/workflow/validators/check-constraint-conflicts.mjs` against real state + fixture | Test | |
| R5 | `ls src/workflow/skills/{interface-contract-designer,data-schema-designer,system-design-advisor,ui-ux-designer,clean-code-architect,quality-gates-validator,performance-optimizer}/SKILL.md` — all 7 exist | Test | |
| R6 | `grep -l <skill> src/workflow/skills/lifecycle-{plan,build,review,test}/SKILL.md` per skill, exact match | Test | |
| R7 | `grep -A15 "^  triggers:" src/workflow/agent-behavior.yaml` shows all 10 new keys | Test | |
| R8 | `grep -n "verification-parallelizer\|Test-verification" dispatch-subagents/references/decision-tree-by-phase.md` | Test | |
| R9 | `npm run build && npm run validate && npm run violations:test && npm run setup-checks:test` | Test | |
| RI1 | `git grep -n "^import" src/workflow/validators/check-constraint-conflicts.mjs` — only `node:`/`./lib.mjs` | Test | |
| RI2 | manual inspection — each of 10 skill directories has non-empty `references/`, cited from `SKILL.md` | Test | spot-check majority, not all 39 route files individually |
| RI3 | `grep -c "skills/<name>/" dist/workflow-bundle.md` per skill | Test | |
| RI4 | `git diff --stat origin/main...HEAD -- src/adapters/` — empty | Test | |
| RI5 | `git branch --show-current` → `feat/wp-r4-power-skills-domain-experts` | Test | |
| RI6 | `git grep -n "hardcoded\|skill ===" src/workflow/validators/check-skill-triggers.mjs` — no hardcoded skill list found | Test | already confirmed in Think/Plan, re-confirmed at Test |

## Architecture Notes

- role: Lead Architect
- decision: Constraint-ID convention (Phase 1) adds an optional `id` field to `domain.yaml`'s
  existing prose constraint arrays, rather than restructuring the whole block into ID-keyed objects
  — additive, backward-compatible with every existing consumer repo's `domain.yaml`, and the
  smallest change that gives C3/`check-constraint-conflicts.mjs` something concrete to check.
- decision: Domain-expert Build phases (2-4) are grouped by content size and disciplinary
  similarity, not by the spec's D1-D7 letter order — keeps each phase's review burden roughly equal
  (~12-15 route files) rather than mirroring an arbitrary numbering.
- decision: Phase 1 forward-declares all 10 `skill_scoring.triggers` entries (including D1-D7's,
  before those skills exist) — the triggers map is inert data with no runtime, so declaring a
  predicate for a skill that doesn't exist yet in Phase 1 is harmless and avoids re-touching
  `agent-behavior.yaml` three more times across Phases 2-4.
- constraint: `agent-behavior.schema.yaml`'s `skill_scoring.triggers` is already a typed
  `{string: string}` map (shipped Wave 1, confirmed by inspection) — R7 needs zero schema change.
- constraint: `check-skill-triggers.mjs` needs zero code change (A1/RI6, confirmed by direct
  inspection) — it audits `skill_trigger_log` entries generically.
- tradeoff: Choosing substantive route-file content over skeletons (brief Q2) means Phases 2-4 are
  this plan's largest single cost — accepted deliberately per the user's explicit decision, not a
  silent scope expansion.
- assumptions: A1 (evidence-backed, see Assumptions Verified), A2 (converted to Q3, resolved in
  Phase 1's Work item 1 — the constraint-ID design itself).
- downstream_impact:
  - Review must budget real time reading a meaningful sample of route-file content per Build phase
    (2-4), not just confirming structural wiring — this wave's correctness is mostly not
    validator-checkable (Risk Register).
  - Ship must confirm the constraint-ID convention (Phase 1) doesn't break `check-config.mjs`'s
    existing schema validation of `domain.yaml` in any example/consumer fixture.
  - Reflect must record Wave 4 (B4 + non-validator playbook checklists) as the final remaining
    tracked Wave 0-4 follow-up.

## Open Questions

- **Q3** - Constraint-ID convention for `domain.yaml` — resolved in Phase 1 as an additive optional
  `id` field on existing prose entries (see Architecture Notes). Not blocking; recorded here because
  it converts brief Assumption A2 from "assumed" to "designed and verified" per this plan.

## Exit Gate

- [x] Every phase has manifest IDs, Touches, Work, and a binary Exit gate.
- [x] Every active R and RI is covered by exactly one or more phases (Requirement Coverage table).
- [x] `check-phase-map`-equivalent inspection passed manually (this branch does not yet have Wave 2's `check-phase-map.mjs`, since Wave 2 is unmerged here — re-verify with the real validator once Wave 2 merges into this chain's eventual base).
- [x] User approved this plan document ("proceed", 2026-07-11). `status` set to `ready-for-next-phase`, `user_checkpoint: approved`.
