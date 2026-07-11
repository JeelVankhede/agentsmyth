---
slug: power-skills-domain-experts
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-07-11T10:00:00Z
updated: 2026-07-11T10:15:00Z
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
  - wpr4-spike-notion-396972bd
  - user-request
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: approved
---

# Power Skills — Wave 3 (Explorers + Domain Experts) - Brief

## Source Links

- Research spike (resolved, dev-ready): Notion WP-R4 spike (page `396972bd-ebbb-81ce-b93a-f78ddd97157d`) §3 Category C/D/E, §4 per-skill cards, §6 knowledge-route map, §8 Wave 3 build-order entry.
- `workflow/artifacts/open-items.yaml` OI-1 — "Design + implement Wave 3 (C1-C3 explorers, D1-D7 domain experts, E1 verification-parallelizer)," carried forward from Wave 2's Reflect.
- User request (this session): "continue" after Wave 2 shipped and its PR was opened — resolved via `AskUserQuestion` into two decisions recorded in Questions For User below (chunking strategy, knowledge-route content depth).

## Problem

Wave 1 (invariant spine) and Wave 2 (phase-gate skills) shipped 11 gate-bound/active power skills, all validator-backed. The resolved WP-R4 spec's remaining scope is qualitatively different: Category C (3 Think-phase explorers) and Category D (7 domain experts) are **passive/scored** — they fire based on a recorded trigger decision, not a hard gate — and most have **no structural validator at all** (C1, C2, D3, D4, D7 are spec-rated "No"; the rest are "Partial," meaning only the *trigger decision* is checked, never the recommendation's substance). E1 is not a new skill, just a wiring addition to the existing `dispatch-subagents` skill.

This brief scopes all of Wave 3 (C1-C3, D1-D7, E1) as one requirement set; Plan owns sequencing and Build sub-phase chunking given the size (11 items, ~39 knowledge-route reference files for D1-D7 alone).

## Goals

- Ship C1 (`repo-alignment-scan`), C2 (`architecture-decision-advisor`), C3 (`constraint-conflict-scan`) as new Think-phase power skills with full anatomy, wired into `lifecycle-think/SKILL.md`.
- Ship D1-D7 (`interface-contract-designer`, `data-schema-designer`, `system-design-advisor`, `ui-ux-designer`, `clean-code-architect`, `quality-gates-validator`, `performance-optimizer`) as new domain-expert power skills, each with substantive per-route knowledge files (not skeletons — user-confirmed this session), wired into every phase their card names.
- Extend `agent-behavior.yaml`'s `skill_scoring.triggers` block with the 10 new predicates (C1-C3 + D1-D7) from the resolved spec §5, so `check-skill-triggers.mjs` (shipped in Wave 1) can audit them.
- Ship the one new validator this wave needs (`check-constraint-conflicts.mjs` for C3) and its fixture.
- Document E1 as a wiring addition to `dispatch-subagents/references/decision-tree-by-phase.md` (a Test-verification-parallelization entry), not a new skill directory — per the spec's explicit "not a new skill" framing.

## Non-Goals

- Wave 4 (`conditional-preservation-check`/B4, and the non-validator playbook write-ups the spec calls out for B4/C1/C2/D3/D4/D7 as review-checklist material) is explicitly out of scope, tracked as a separate future brief in `open-items.yaml` (OI-6).
- No adapter changes (`src/adapters/**`) — same reasoning as Wave 1/2: adapters are generic gate shims, not per-skill enumerations.
- No new runtime dependency (repo invariant, CLAUDE.md rule 4).
- No change to `check-lifecycle.mjs`'s phase-transition gate behavior.
- This chain does not attempt to mechanically verify the *substance* of a No/Partial-validator skill's recommendation (e.g., that a `ui-ux-designer` recommendation is actually good UX advice) — that is inherent to what a judgment-only skill is; confidence comes from the knowledge-route content quality itself and eventual real usage, not a fixture.

## User Impact

Consumer repos gain 10 passive/scored expert skills that surface discipline-specific guidance (interface contracts, data schemas, system architecture, UI/UX, clean code, quality gates, performance) exactly when a diff or complexity signal indicates it's relevant — without requiring the user to manually invoke anything. Every trigger decision (ran or skipped) is logged and auditable via the existing `check-skill-triggers.mjs`, closing the loop Wave 0 opened without a consumer.

## Success Metrics

- All 10 skills (C1-C3, D1-D7) exist with full anatomy and are cited from the correct phase `SKILL.md` files.
- `agent-behavior.yaml`'s `skill_scoring.triggers` block contains all 10 new predicates from the resolved spec §5, verbatim.
- `npm run build`, `npm run validate`, and `npm run violations:test` all pass, including the new `check-constraint-conflicts.mjs` validator and its fixture.
- Every D1-D7 knowledge-route file contains real, actionable guidance — confirmed by spot-check during Review, not just non-empty-file existence.

## Requirements

See Requirement Manifest below — Plan owns sequencing and Build sub-phase chunking (already resolved via `AskUserQuestion`: one brief, Plan sub-chunks — see Questions For User).

## Constraints

- Zero runtime dependencies — hand-rolled Node ESM only (CLAUDE.md rule 4).
- `additionalProperties: false` on `agent-behavior.schema.yaml`'s root — the `skill_scoring.triggers` map already exists as a typed property (shipped Wave 1); this wave only adds entries to it, no new top-level schema key.
- Reference files are part of the skill contract and must not be collapsed into `SKILL.md` (`src/workflow/skills/README.md` rule) — applies with unusual force here given the knowledge-route file count.
- `require_non_default_branch_for_changes: true` (`repo-profile.yaml`) — work happens on `feat/wp-r4-power-skills-domain-experts`, branched fresh off `origin/main` (not stacked on Wave 2's still-open, unreviewed PR #28 — see Architecture Notes).
- `commands.discovery.do_not_invent_commands: true` — verification commands are the real `npm run build` / `npm run validate` / `npm run violations:test` / `npm run setup-checks:test` scripts already in `package.json`.

## Risks

- **Content-quality risk, not structural risk.** Unlike Wave 1/2, most of this wave's correctness cannot be caught by `npm run validate` — a `ui-ux-designer` route file with mediocre advice will still pass every structural check. Mitigation: Review must read a meaningful sample of route files for substance, not just confirm they exist and are wired (see Architecture Notes downstream_impact).
- **Scope size.** ~39 knowledge-route files + 10 skill directories + up to ~20 phase-file wiring edits is the largest single-wave content footprint in WP-R4 so far. Mitigation: user already confirmed "one brief, sub-chunk in Plan" — Plan must produce a genuinely fine-grained phase breakdown (likely one Build phase per skill or small skill-cluster), not one monolithic phase.
- **Trigger predicate drift.** `check-skill-triggers.mjs` audits that a triggered skill's decision was *recorded*, never that the trigger predicate itself was evaluated correctly (no runtime — confirmed Wave 0 design, unchanged here). A predicate typo would silently never fire and nothing would catch it structurally. Mitigation: Review should manually walk at least 2-3 trigger predicates against `agent-behavior.yaml`'s actual signal definitions to confirm they reference real signal names.

## Open Questions

See Questions For User — both raised in this session were resolved synchronously via `AskUserQuestion` before this brief was finalized.

## Requirement Manifest

### Explicit (R)

- **R1** - Implement C1 `repo-alignment-scan` as a new Think-phase power skill: digests the requirement, explores the actual repo/stack, surfaces misalignment with existing conventions before framing.
  - Acceptance: `src/workflow/skills/repo-alignment-scan/SKILL.md` + non-empty `references/` exist with full anatomy; wired into `lifecycle-think/SKILL.md`'s `## What To Load` + `## Workflow`.

- **R2** - Implement C2 `architecture-decision-advisor` as a new Think-phase power skill: forces a big-picture architecture call on high-complexity requirements, recording the decision + rejected alternatives.
  - Acceptance: `src/workflow/skills/architecture-decision-advisor/SKILL.md` + non-empty `references/` exist; wired into `lifecycle-think/SKILL.md`'s Architecture Notes Expectations + Exit Gate.

- **R3** - Implement C3 `constraint-conflict-scan` as a new Think-phase power skill: cross-checks the request against `domain.yaml` constraints and protected paths.
  - Acceptance: `src/workflow/skills/constraint-conflict-scan/SKILL.md` + non-empty `references/` exist; wired into `lifecycle-think/SKILL.md`'s `## What To Load` + `## Refusal / Stop Conditions`.

- **R4** - Implement `check-constraint-conflicts.mjs` (the one new validator this wave needs, backing C3): confirms a declared conflict references a real constraint ID from `domain.yaml`.
  - Acceptance: registered in `scripts/validate-template.mjs`'s `artifactCommands`; one negative fixture under `test/fixtures/lifecycle-violations/` that `npm run violations:test` rejects.

- **R5** - Implement D1-D7 as 7 new domain-expert power skill directories under `src/workflow/skills/`: `interface-contract-designer`, `data-schema-designer`, `system-design-advisor`, `ui-ux-designer`, `clean-code-architect`, `quality-gates-validator`, `performance-optimizer` — each with full anatomy and substantive per-route knowledge files per the spec's §6 knowledge-route map (rest/graphql/grpc/websocket/cli/sdk-library for D1; relational-sql/document-nosql/key-value/graph/migrations/event-schema for D2; monolith/microservices/event-driven/serverless/integration-boundary for D3; web/mobile-ios/mobile-android/cross-platform-mobile/desktop/tui/accessibility for D4; oo/functional/layered/module-boundaries for D5; unit-coverage/integration/lint-type/security-scan/perf-budget for D6; frontend-runtime/backend-throughput/db-query/mobile-runtime/memory/network for D7).
  - Acceptance: all 7 directories exist with `SKILL.md` + non-empty `references/`; every named route file contains real, actionable domain guidance (principles + a concrete checklist), confirmed by Review spot-check, not just file existence.

- **R6** - Wire each D1-D7 skill into the `## What To Load` section of every phase its card names (D1/D2/D4: Plan, Build, Review; D3: Think, Plan, Review; D5: Build, Review; D6: Plan, Build, Review, Test; D7: Build, Review, Test), and confirm each records its recommendation in that phase's Architecture Notes Expectations or review-notes convention.
  - Acceptance: `grep` for each skill name across the named phase `SKILL.md` files returns a hit in `## What To Load`; each phase's Architecture Notes Expectations section mentions where the domain-expert recommendation gets recorded.

- **R7** - Extend `agent-behavior.yaml`'s existing `skill_scoring.triggers` map with the 10 new predicates (C1-C3 + D1-D7) from the resolved spec §5, verbatim.
  - Acceptance: `grep -A1 "^skill_scoring:" src/workflow/agent-behavior.yaml` shows all 10 new trigger keys; `npm run validate` passes (the `triggers` map is already a typed property, shipped Wave 1 — no schema change needed).

- **R8** - Document E1 `verification-parallelizer` as a wiring addition to `dispatch-subagents/references/decision-tree-by-phase.md` (a Test-verification-parallelization entry reusing existing `dispatch` config + independence rules) — not a new skill directory, per the spec's explicit framing.
  - Acceptance: `dispatch-subagents/references/decision-tree-by-phase.md` gains a Test-phase entry naming the ≤3-worker fan-out and the B6 matrix it merges into.

- **R9** - `npm run build`, `npm run validate`, `npm run violations:test`, and `npm run setup-checks:test` all pass after the full Wave 3 change, with no regression to any existing fixture.
  - Acceptance: all four commands exit 0 with current-turn command output cited as evidence in the Build/Test artifacts.

### Implicit (RI)

- **RI1** - No new runtime dependency is introduced (repo invariant, CLAUDE.md rule 4).
  - Acceptance: `package.json` `dependencies` unchanged; `check-constraint-conflicts.mjs` is hand-rolled Node ESM using only `node:*` builtins and `lib.mjs`.

- **RI2** - New skill reference files (including all ~39 knowledge-route files) are not collapsed into `SKILL.md`.
  - Acceptance: each of the 10 new skill directories has a non-empty `references/` directory; `SKILL.md` cites each reference file by path.

- **RI3** - `npm run build` picks up all 10 new skill directories into `dist/workflow-bundle.md`.
  - Acceptance: after `npm run build`, `dist/workflow-bundle.md` contains FILE-marker blocks for all 10 new skill directories and their full route-file sets.

- **RI4** - No adapter file (`src/adapters/**`) requires a change for this chain.
  - Acceptance: `git diff` for this chain touches no file under `src/adapters/`.

- **RI5** - This repo's own dogfooded lifecycle chain records this Complex work under slug `power-skills-domain-experts` v1, on branch `feat/wp-r4-power-skills-domain-experts` (branched fresh from `origin/main`, not stacked on Wave 2's unreviewed PR #28), honoring `branch_policy.require_non_default_branch_for_changes`.
  - Acceptance: `git branch --show-current` returns `feat/wp-r4-power-skills-domain-experts`; `workflow/artifacts/briefs/power-skills-domain-experts-v1.md` (this file) exists.

- **RI6** - `check-skill-triggers.mjs` (shipped Wave 1) requires no code change to audit the 10 new triggers — it already audits any predicate present in `skill_scoring.triggers` generically, not by a hardcoded skill list. Confirmed by inspection before this brief was written.
  - Acceptance: `check-skill-triggers.mjs`'s source contains no hardcoded skill-name list that would need extending for the 10 new entries.

### Assumptions (A)

- **A1** - `check-skill-triggers.mjs` audits `skill_trigger_log` entries generically against whatever `skill_scoring.triggers` declares, not against a hardcoded skill-name allowlist — confirmed by direct inspection of the shipped Wave 1 source before this brief was written (RI6). If this assumption is wrong, R7's trigger-predicate extension alone would not be sufficient and a validator code change would be needed.

- **A2** - The one new validator this wave needs (`check-constraint-conflicts.mjs`, backing C3) follows the same standalone-file pattern as every other Wave 1/2 validator, per the spec's own "Yes/Partial/No marked individually" naming — not merged into an existing validator file.

### Open Questions (Q)

- **Q1** - Chunking strategy: one brief covering all 11 items with Plan sub-chunking, vs. splitting into 3 separate briefs (3a/3b/3c), vs. scoping this chain to C1-C3+E1 only and deferring D1-D7.
  - Owner: user
  - Blocking: no — resolved 2026-07-11 in this session via `AskUserQuestion`. Decision: one brief, Plan sub-chunks Build phases. See Architecture Notes.

- **Q2** - Knowledge-route content depth for D1-D7's ~39 files: substantive per-route content now, or structured skeletons filled in incrementally later.
  - Owner: user
  - Blocking: no — resolved 2026-07-11 in this session via `AskUserQuestion`. Decision: substantive content now, not skeletons. See Architecture Notes.

## Questions For User

None outstanding — Q1 and Q2 above were both resolved synchronously in this session before this brief was finalized.

## Architecture Notes

- role: Lead Architect
- decisions:
  - Scope this chain to all of Wave 3 (C1-C3, D1-D7, E1) as one brief — user-confirmed via `AskUserQuestion`, matching how Wave 1 and Wave 2 were each scoped as a single brief with Plan owning Build-phase sequencing.
  - Branch `feat/wp-r4-power-skills-domain-experts` off `origin/main` fresh, not off Wave 2's branch — Wave 2's PR #28 is open and unreviewed by a human yet; stacking would mean rebasing this chain if #28 gets review feedback. `origin/main` already has Wave 1 (PR #26) and the audit chain (PR #27) merged, so this chain still builds on real, shipped invariant-spine infrastructure.
  - Knowledge-route files get substantive content, not skeletons — user-confirmed via `AskUserQuestion`. This is the single largest scope driver in this brief (~39 files) and the primary reason Plan must sub-chunk Build aggressively.
  - E1 is documented as a `dispatch-subagents` wiring addition, not a new skill directory — matches the spec's own explicit "not a new skill" framing (§3 Category E, §4 E1 card).
- constraints:
  - `agent-behavior.schema.yaml`'s `skill_scoring.triggers` map is already a typed property (shipped Wave 1) — this wave is purely additive entries, no schema amendment needed (unlike Wave 0/1's own schema work).
  - Adapters confirmed untouched by inspection (RI4).
- tradeoffs:
  - Choosing substantive route-file content (Q2) over skeletons trades a much larger authoring scope for actually-useful skills on day one, rather than a second wave of "fill in the skeletons" work later that might never happen (the exact failure mode `open-items.yaml`'s existence is meant to prevent).
  - Branching fresh from `origin/main` (rather than stacking on Wave 2) trades losing Wave 2's not-yet-merged content in this branch's working tree for avoiding a rebase dependency on an unreviewed PR.
- assumptions: A1, A2 (see Requirement Manifest) — Plan must preserve A1's "generic audit, no hardcoded skill list" premise; if Build discovers `check-skill-triggers.mjs` actually needs a code change, that's a Plan-level surprise worth flagging immediately, not silently working around.
- downstream_impact:
  - Plan must produce a Repo Impact Map + Build-phase breakdown fine-grained enough that no single phase authors more than 2-3 skills' worth of route files — given the size, likely one phase per skill or small skill-cluster (e.g., D1+D2, D3+D4, D5+D6+D7, C1+C2+C3+E1).
  - Review must budget real time to read a meaningful sample of route-file content for substance (Risks) — not just confirm structural wiring, since this wave's correctness is mostly not validator-checkable.
  - Reflect must record Wave 4 (B4 + non-validator playbook checklists for B4/C1/C2/D3/D4/D7) as the final remaining tracked follow-up once this chain ships.

## Exit Gate

- [x] Every active R and RI has acceptance criteria.
- [x] No blocking Q IDs — Q1 and Q2 are both resolved and non-blocking; `orchestration.blockers` is empty.
- [x] User approved this brief document ("continue", 2026-07-11). `status` set to `ready-for-next-phase`, `user_checkpoint: approved`.
