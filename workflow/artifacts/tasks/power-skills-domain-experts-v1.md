---
slug: power-skills-domain-experts
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-07-11T11:00:00Z
updated: 2026-07-11T13:30:00Z
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
  - workflow/artifacts/plans/power-skills-domain-experts-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# Power Skills — Wave 3 (Explorers + Domain Experts) - Task

## Active Phase

- Phase: Phase 6 - Closure (complete — all 6 Build phases done)
- Manifest IDs: R9, RI3, RI4
- Exit gate: all confirmations pass; full suite exits 0.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Explorers, C3's validator, E1 wiring, trigger-map fill-in | complete | R1, R2, R3, R4, R7, R8, RI1, RI5, RI6 |
| Phase 2 - D1 + D2 | complete | R5, RI2 |
| Phase 3 - D3 + D4 | complete | R5, RI2 |
| Phase 4 - D5 + D6 + D7 | complete | R5, RI2 |
| Phase 5 - Wire D1-D7 into phase files | complete | R6 |
| Phase 6 - Closure | complete | R9, RI3, RI4 |
| Phase 6 - Closure | pending | R9, RI3, RI4 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `feat/wp-r4-power-skills-domain-experts` | clean except this chain's own brief/plan (untracked, in scope) | branched off `origin/main` at the time `origin/main`'s tip was `2578c10` (PR #27 merged, PR #28 not yet). |
| After Build (all 6 phases) | `feat/wp-r4-power-skills-domain-experts` | 5 commits ahead of the base merge point (`bd5f139` explorers/E1/triggers, `d488cc2` D1+D2, `ca9f06b` D3+D4, `9d4f69c` D5+D6+D7, `d369c3e` wiring); lifecycle artifacts (brief/plan/task) intentionally left uncommitted, to bundle at Ship per the established precedent | full suite green at every phase boundary |
| During Phase 1 | same | — | **Discovered mid-Phase-1**: `origin/main` advanced to `c389f68` (PR #28, Wave 2, merged) while this chain was in progress — this branch's `HEAD` already includes full Wave 2 content (all 5 Wave 2 validators, `check-phase-map` etc. all present and passing). This resolves the Plan's own flagged risk ("fixture-letter collision if Wave 2 merges before Phase 5") favorably — no collision occurred, Wave 2's fixture letters (`q`-`u`) were already in place before this chain added `o1`. |

## Scope

- In scope: C1-C3, D1-D7, E1 wiring, `check-constraint-conflicts.mjs`, `agent-behavior.yaml` trigger-map fill-in, `domain.yaml` constraint-ID convention.
- Out of scope: Wave 4 (B4 + non-validator playbook checklists), tracked in `open-items.yaml` (OI-6).

## Changed Files

- `workflow/config/domain.yaml` — added bracket-prefix constraint IDs (`[product-1]`, `[safety-1]`, etc.) to existing prose entries — **implementation-detail refinement from the Plan**: Plan proposed restructuring constraint arrays into ID-keyed objects requiring a `domain.schema.yaml` change; Build found a simpler, fully backward-compatible design (bracket prefix inside the existing plain-string items, zero schema change) during Phase 1's own work — IDs: R4
- `src/workflow/skills/repo-alignment-scan/SKILL.md` + `references/{output-schema,scan-method}.md` — new skill (C1) — IDs: R1, RI2
- `src/workflow/skills/architecture-decision-advisor/SKILL.md` + `references/{output-schema,decision-framing}.md` — new skill (C2) — IDs: R2, RI2
- `src/workflow/skills/constraint-conflict-scan/SKILL.md` + `references/{output-schema,constraint-id-convention}.md` — new skill (C3) — IDs: R3, RI2
- `src/workflow/skills/lifecycle-think/SKILL.md` — wired all 3 C-skills into What To Load, Workflow, Refusal, Architecture Notes Expectations, Exit Gate — IDs: R1, R2, R3
- `src/workflow/skills/README.md` — added 3 new Power Skills rows — IDs: R1, R2, R3
- `src/workflow/validators/check-constraint-conflicts.mjs` — new validator (C3) — IDs: R4, RI1
- `scripts/validate-template.mjs` — registered `check-constraint-conflicts.mjs` — IDs: R4
- `src/workflow/validators/README.md` — added invocation example + Checks row — IDs: R4
- `test/fixtures/lifecycle-violations/o1-constraint-conflict-bad-id/briefs/constraint-conflict-bad-id-v1.md` — new fixture — IDs: R4
- `test/run-violation-tests.mjs` — registered fixture `o1` — IDs: R4
- `src/workflow/skills/dispatch-subagents/references/decision-tree-by-phase.md` — added the E1 `verification-parallelizer` profile section; narrowed Test's blanket "never" dispatch row to an explicit exception — IDs: R8
- `src/workflow/skills/dispatch-subagents/references/phase-caps.md` — updated Test's row to match the narrowed exception — IDs: R8
- `src/workflow/skills/dispatch-subagents/SKILL.md` — updated the Determinism Rule referencing "state-dependent Test... work" to name the E1 exception — IDs: R8
- `src/workflow/skills/lifecycle-test/SKILL.md` — added `dispatch-subagents` to Load-when-required, scoped to the E1 profile — IDs: R8
- `src/workflow/agent-behavior.yaml` — filled `skill_scoring.triggers` with all 10 new predicates (C1-C3 + D1-D7), verbatim from the resolved spec §5 — IDs: R7
- `src/workflow/skills/interface-contract-designer/SKILL.md` + `references/{output-schema,rest,graphql,grpc,websocket,cli,sdk-library}.md` — new skill (D1), 6 routes — IDs: R5, RI2
- `src/workflow/skills/data-schema-designer/SKILL.md` + `references/{output-schema,relational-sql,document-nosql,key-value,graph,migrations,event-schema}.md` — new skill (D2), 6 routes — IDs: R5, RI2
- `src/workflow/skills/README.md` — added D1, D2, D3, D4 rows — IDs: R5
- `src/workflow/skills/system-design-advisor/SKILL.md` + `references/{output-schema,monolith,microservices,event-driven,serverless,integration-boundary}.md` — new skill (D3), 5 routes — IDs: R5, RI2
- `src/workflow/skills/ui-ux-designer/SKILL.md` + `references/{output-schema,web,mobile-ios,mobile-android,cross-platform-mobile,desktop,tui,accessibility}.md` — new skill (D4), 7 routes — IDs: R5, RI2
- `src/workflow/skills/clean-code-architect/SKILL.md` + `references/{output-schema,oo,functional,layered,module-boundaries}.md` — new skill (D5), 4 routes — IDs: R5, RI2
- `src/workflow/skills/quality-gates-validator/SKILL.md` + `references/{output-schema,unit-coverage,integration,lint-type,security-scan,perf-budget}.md` — new skill (D6), 5 routes — IDs: R5, RI2
- `src/workflow/skills/performance-optimizer/SKILL.md` + `references/{output-schema,frontend-runtime,backend-throughput,db-query,mobile-runtime,memory,network}.md` — new skill (D7), 6 routes — IDs: R5, RI2
- `src/workflow/skills/README.md` — added D5, D6, D7 rows — IDs: R5
- `src/workflow/skills/lifecycle-plan/SKILL.md` — wired D1, D2, D3, D4, D6 — IDs: R6
- `src/workflow/skills/lifecycle-build/SKILL.md` — wired D1, D2, D4, D5, D6, D7 — IDs: R6
- `src/workflow/skills/lifecycle-review/SKILL.md` — wired D1, D2, D3, D4, D5, D6, D7 — IDs: R6
- `src/workflow/skills/lifecycle-test/SKILL.md` — wired D6, D7 — IDs: R6
- `src/workflow/skills/lifecycle-think/SKILL.md` — **out-of-plan-scope fix, found during Phase 5's own verification**: wired D3 (`system-design-advisor`) into Think, resolved and independently re-verified — see Waivers section notes

## Waivers

none. **Revised at Ship**: this section originally carried 2 rows framing real mid-Build discoveries
(E1's 4-file Test-dispatch fix; D3's missing `lifecycle-think` wiring) as waivers requiring
risk-acceptance sign-off. At the Ship checkpoint the user pushed back: *"Don't force waiver on
obvious fixes, it'll increase iterations later for fixes."* Correct — neither item is actually
residual risk being accepted; both are completed, fully-verified fixes (independently re-confirmed
by Review, Test, and a fresh full regression at Ship). Reclassified as Changed Files scope notes
below, not waivers. This mirrors the identical correction already made once this WP-R4 initiative
(Wave 2's R8), now confirmed as a repeating pattern worth a Reflect learning candidate: a
scope-fence violation from a real Build-time discovery, once fully fixed and independently
re-verified, is a disclosure, not a risk to waive.

- `src/workflow/skills/dispatch-subagents/references/phase-caps.md`, `src/workflow/skills/dispatch-subagents/SKILL.md`, `src/workflow/skills/lifecycle-test/SKILL.md` — out-of-Plan-Touches (Phase 1 only declared `decision-tree-by-phase.md`), fixed and complete: E1 required a consistent Test-dispatch exception across all 3 files stating the old blanket rule, plus wiring into `lifecycle-test/SKILL.md`. Independently re-verified 3× (Review, Test, Ship regression) — all 4 files state the identical narrow exception.
- `src/workflow/skills/lifecycle-think/SKILL.md` — out-of-Plan-Touches (Phase 5 only declared `lifecycle-{plan,build,review,test}`), fixed and complete: D3's spec card names Think as one of 3 primary phases; the Plan's own Repo Impact Map omitted it. Independently re-verified 3× — `grep -l system-design-advisor` returns exactly Think, Plan, Review.

## Implementation Log

**Phase 1 (complete):**
- Designed and implemented the constraint-ID convention as a bracket prefix inside existing plain
  strings (`"[product-1] ..."`), refining the Plan's own tentative "optional `id` field" design
  after finding it would require a `domain.schema.yaml` structural change the bracket-prefix
  approach avoids entirely — zero schema change, fully backward-compatible with every existing
  consumer repo's `domain.yaml`. Documented the full rationale in
  `constraint-conflict-scan/references/constraint-id-convention.md`.
- Authored C1, C2, C3 with full anatomy; wired all 3 into `lifecycle-think/SKILL.md` across 5
  distinct sections (What To Load, Workflow, Refusal, Architecture Notes Expectations, Exit Gate).
- Implemented `check-constraint-conflicts.mjs`; dogfooded immediately against real repo state (0
  citations in any existing brief, correctly reported as `ok`) before writing the fixture.
- Authored fixture `o1-constraint-conflict-bad-id`; verified rejected on first draft.
- **Real design gap found while wiring E1**: `dispatch-subagents/references/decision-tree-by-phase.md`'s
  existing Test row was a blanket "never" ("Evidence is state-dependent; dispatch cannot produce
  reproducible verification") — directly contradicting E1's spec ("fan independent verification
  rows across ≤3 sub-agents"). Resolved by narrowing the blanket rule to an explicit exception (the
  `verification-parallelizer` profile: only independently-reproducible B6 rows, capped at 3,
  verifier-readonly role) rather than either silently overriding the safety rule or leaving E1
  unimplementable. Propagated the same narrowing to `phase-caps.md`, `dispatch-subagents/SKILL.md`'s
  Determinism Rules, and `lifecycle-test/SKILL.md`'s What To Load.
- Filled `agent-behavior.yaml`'s `skill_scoring.triggers` with all 10 predicates verbatim from the
  resolved spec §5, including the `path~<category>_globs` shorthand used by 4 of the D-skill
  predicates — documented in a new code comment that this shorthand has no formal `signals` block
  entry and is not mechanically evaluated (no runtime, consistent with the whole `skill_scoring`
  design), the same as every other trigger predicate.
- **Mid-phase discovery**: `origin/main` advanced past this branch's original base while Phase 1
  was in progress — PR #28 (Wave 2) merged. Confirmed via `npm run build && npm run validate`
  that this branch's `HEAD` already includes full Wave 2 content; no action needed, no rebase
  required (this branch was created from a point that happened to already be at, or very near,
  Wave 2's own tip). Recorded in Branch/Repo Status above.
- `npm run build && npm run validate && npm run violations:test && npm run setup-checks:test` all
  exit 0. 20/20 violations detected (19 pre-existing + 1 new).

**Phase 2 (complete):**
- Authored D1 `interface-contract-designer` (6 routes: rest, graphql, grpc, websocket, cli,
  sdk-library) and D2 `data-schema-designer` (6 routes: relational-sql, document-nosql, key-value,
  graph, migrations, event-schema), each with substantive per-route content (principles, common
  pitfalls, versioning/migration-safety guidance, checklist) per the user's confirmed content-depth
  decision — not skeletons.
- Added both to `src/workflow/skills/README.md`.
- `npm run build && npm run validate && npm run violations:test && npm run setup-checks:test` all
  exit 0, clean on first run — no structural issues, since Category D validator coverage is thin
  (Partial via `check-skill-triggers` only) and this phase's content is not itself
  validator-checkable (matches the Plan's own Risk Register entry).

**Phase 3 (complete):**
- Authored D3 `system-design-advisor` (5 routes: monolith, microservices, event-driven,
  serverless, integration-boundary) and D4 `ui-ux-designer` (7 routes: web, mobile-ios,
  mobile-android, cross-platform-mobile, desktop, tui, accessibility), each with substantive
  content. D4's `accessibility.md` is explicitly documented as cross-cutting — loaded alongside
  every platform route, not selected independently, matching the skill's own What To Load design.
- Added both to `src/workflow/skills/README.md`.
- `npm run build && npm run validate && npm run violations:test && npm run setup-checks:test` all
  exit 0, clean on first run.

**Phase 4 (complete):**
- Authored D5 `clean-code-architect` (4 routes: oo, functional, layered, module-boundaries), D6
  `quality-gates-validator` (5 routes: unit-coverage, integration, lint-type, security-scan,
  perf-budget), and D7 `performance-optimizer` (6 routes: frontend-runtime, backend-throughput,
  db-query, mobile-runtime, memory, network), each with substantive content. This completes all
  39 knowledge-route files across D1-D7.
- Added all 3 to `src/workflow/skills/README.md`.
- `npm run build && npm run validate && npm run violations:test && npm run setup-checks:test` all
  exit 0, clean on first run — all 4 content-authoring phases (Phase 1's C-skills + Phases 2-4's
  D-skills) completed with zero structural validator issues, consistent with the Plan's own Risk
  Register expectation that this wave's correctness is mostly not validator-checkable.

**Phase 5 (complete):**
- Wired D1, D2, D3, D4, D6 into `lifecycle-plan`; D1, D2, D4, D5, D6, D7 into `lifecycle-build`;
  D1-D7 (all 7) into `lifecycle-review`; D6, D7 into `lifecycle-test` — per the Plan's declared mapping.
- **Real gap found during this phase's own `grep -l` verification**: D3 (`system-design-advisor`)
  was correctly wired into Plan and Review, but the Plan's own Repo Impact Map never included a
  `lifecycle-think` row, even though D3's spec card explicitly names Think as one of its 3 primary
  phases. Fixed by wiring D3 into `lifecycle-think/SKILL.md` too; recorded as a scope-fence waiver
  since the file wasn't in Phase 5's declared Touches. This is the exact discipline the
  `grep -l` verification step exists to catch — found before Ship, not after.
- Independently re-verified all 7 skills' final wiring via `grep -l` per skill: every one now
  matches its spec card's declared phase list exactly (D1/D2/D4: Plan+Build+Review; D3:
  Think+Plan+Review; D5: Build+Review; D6: Plan+Build+Review+Test; D7: Build+Review+Test).
- `npm run build && npm run validate && npm run violations:test && npm run setup-checks:test` all exit 0.

**Phase 6 (complete):**
- Confirmed `dist/workflow-bundle.md` contains FILE-marker references for all 10 new skill
  directories (`grep -c "skills/<name>/"` per skill: 4/4 for each C-skill, 8-12 per D-skill
  depending on route-file count — all present, none zero).
- Confirmed zero adapter diffs (`git diff --stat origin/main...HEAD -- src/adapters/` and
  `git status --short src/adapters/` both empty).
- Ran the full suite: `npm run build && npm run validate && npm run violations:test && npm run
  setup-checks:test` all exit 0. 20/20 violations detected, 4/4 setup-checks.
- Build is complete: all 6 phases done, full suite green, 2 Waivers recorded (E1/Test-dispatch
  4-file fix; D3/Think wiring gap), both flagged for user confirmation at Review/Ship.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R1, R2, R3 | `grep -l <skill> lifecycle-think/SKILL.md` per skill | all 3 present |
| R4 | `node src/workflow/validators/check-constraint-conflicts.mjs` | `ok`, 8 real IDs found |
| R7 | `grep -A11 "^  triggers:" src/workflow/agent-behavior.yaml` | all 10 new keys present |
| R8 | `grep -n "verification-parallelizer" src/workflow/skills/dispatch-subagents/references/decision-tree-by-phase.md` | E1 section present |
| RI5 | `git branch --show-current` | `feat/wp-r4-power-skills-domain-experts` |
| R5, RI2 | `ls src/workflow/skills/{interface-contract-designer,data-schema-designer,system-design-advisor,ui-ux-designer,clean-code-architect,quality-gates-validator,performance-optimizer}/SKILL.md` | all 7 exist |
| R6 | `grep -l <skill> src/workflow/skills/lifecycle-{think,plan,build,review,test}/SKILL.md` per skill | exact match to spec card phase list, all 7 |
| R9, RI3, RI4 | `npm run build && npm run validate && npm run violations:test && npm run setup-checks:test`; `dist/workflow-bundle.md` FILE-markers; `git diff --stat origin/main...HEAD -- src/adapters/` | all pass, 0 adapter diff |
| RI6 | `git grep -n "hardcoded\|skill ===" src/workflow/validators/check-skill-triggers.mjs` | no hardcoded skill list found — confirmed by inspection only, no code change needed |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `node src/workflow/validators/check-constraint-conflicts.mjs` (standalone, real state) | Phase 1 | pass | 0 citations, 8 real IDs, correct on first run |
| `node src/workflow/validators/check-constraint-conflicts.mjs --dir .../o1-constraint-conflict-bad-id` | Phase 1 | pass | correctly rejected on first fixture draft |
| `npm run build && npm run validate && npm run violations:test && npm run setup-checks:test` | Phase 1 gate | pass | all 4 exit 0; 20/20 violations detected |
| `grep -l <skill> lifecycle-*/SKILL.md` per D-skill (first pass) | Phase 5 | **fail then pass** | D3 missing from lifecycle-think; fixed, re-verified all 7 exact |
| `grep -c "skills/<name>/" dist/workflow-bundle.md` per new skill | Phase 6 | pass | all 10 skills present, 4-12 refs each |
| `git diff --stat origin/main...HEAD -- src/adapters/` | Phase 6 | pass | empty, RI4 confirmed |
| `npm run build && npm run validate && npm run violations:test && npm run setup-checks:test` | Phase 6 gate | pass | all 4 exit 0 |

## Dispatch Log

none — single-agent sequential execution.

## Architecture Notes

- role: Senior Engineer
- decision: Constraint-ID convention refined during Build from the Plan's tentative design (optional
  schema `id` field) to a bracket-prefix-in-string convention — a Build-authority implementation
  detail per the Plan's own Q3/A2 framing, not a scope change. Satisfies the same acceptance
  criteria (R4) with a smaller, fully backward-compatible footprint.
- decision: E1's Test-dispatch exception was designed narrowly (verification-row fan-out only,
  capped at 3, verifier-readonly) specifically to preserve the existing safety rationale
  ("Evidence is state-dependent") for all other Test work — not a general loosening of the
  Test-phase dispatch restriction.
- downstream: Review must confirm the `domain.yaml` design refinement doesn't break
  `check-config.mjs`'s schema validation for any example/consumer domain.yaml (none of which use
  the bracket convention, and none are required to).

## Blockers

none

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Phase 1 - Explorers, C3's validator, E1 wiring, trigger-map fill-in | complete | 2026-07-11T11:00:00Z | 1 real design gap found and resolved (E1/Test-dispatch contradiction); constraint-ID convention refined from Plan's tentative design |
| Phase 2 - D1 + D2 | complete | 2026-07-11T11:30:00Z | clean, no structural issues; 12 substantive route files authored |
| Phase 3 - D3 + D4 | complete | 2026-07-11T12:00:00Z | clean, no structural issues; 12 substantive route files authored |
| Phase 4 - D5 + D6 + D7 | complete | 2026-07-11T12:30:00Z | clean, no structural issues; 15 substantive route files authored; all 39 D1-D7 routes now complete |
| Phase 5 - Wire D1-D7 into phase files | complete | 2026-07-11T13:00:00Z | 1 real gap found and fixed (D3 missing from lifecycle-think, a Plan gap); all 7 skills' wiring independently re-verified against their spec cards |
| Phase 6 - Closure | complete | 2026-07-11T13:30:00Z | bundle/adapter checks clean; full suite green |
