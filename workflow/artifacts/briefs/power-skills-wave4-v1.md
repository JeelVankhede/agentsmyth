---
slug: power-skills-wave4
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-07-11T17:00:00Z
updated: 2026-07-11T17:10:00Z
manifest_ids:
  - R1
  - R2
  - RI1
  - RI2
  - RI3
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: approved
---

# Power Skills — Wave 4 (Conditional Preservation Check) - Brief

## Source Links

- Research spike (resolved, dev-ready): Notion WP-R4 spike (page `396972bd-ebbb-81ce-b93a-f78ddd97157d`) §3 Category B (B4 card), §4 B4 spec card, §8 Wave 4 build-order entry.
- `workflow/artifacts/open-items.yaml` OI-6 — "Design + implement Wave 4 (B4, remaining playbooks)."

## Problem

The resolved WP-R4 spec's §7 lists B4 (`conditional-preservation-check`) alongside C1, C2, D3, D4,
D7 as "non-validator skills — ship prompt-only playbooks... their trigger decision is still
audited by `check-skill-triggers`." C1, C2, D3, D4, D7 already shipped as complete skills with full
anatomy in Wave 3 (their "playbook" nature was about lacking a structural validator, not about
being a lesser deliverable — they already have the same full anatomy as every other skill). **B4
is the one skill from the original 22-skill catalog never yet built.** This brief scopes it alone.

## Goals

- Ship B4 `conditional-preservation-check` as a new Build-phase power skill with full anatomy,
  matching every other skill already shipped across Waves 1-3.
- Wire it into `lifecycle-build/SKILL.md`'s `## Workflow`, invoked when a refactor touches control
  flow (fold/merge/rename operations), per the spec's own wiring description.
- No new validator — the spec explicitly rates B4 "No (semantic)," same as C2/D3/D4/D7's judgment-only design.

## Non-Goals

- No new validator or fixture — matches the spec's explicit "No" validator rating for B4.
- No change to any already-shipped Wave 1-3 skill.

## User Impact

Build gains a semantic check for a real, easy-to-miss failure mode: silently dropping a conditional
branch or guard clause during a fold/merge/rename refactor — currently nothing in the lifecycle
prompts an agent to check for this specifically.

## Success Metrics

- `conditional-preservation-check/SKILL.md` exists with full anatomy, wired into `lifecycle-build/SKILL.md`.
- `npm run build && npm run validate && npm run violations:test` all pass, no regression.

## Requirements

## Constraints

- Zero runtime dependencies (CLAUDE.md rule 4) — not directly relevant here (no new validator), but confirmed no dependency is added.
- Reference files are part of the skill contract, not collapsed into `SKILL.md`.
- `require_non_default_branch_for_changes: true` — work happens on `feat/wp-r4-power-skills-wave4`, branched fresh off `origin/main`.

## Risks

- **Low blast radius.** Single skill, one phase-file wiring point, no validator, no schema change. Smallest WP-R4 chain so far.

## Requirement Manifest

### Explicit (R)

- **R1** - Implement B4 `conditional-preservation-check` as a new power skill: on fold/merge/rename
  operations, detect silently dropped conditional branches or guard clauses; full anatomy matching
  every other shipped skill.
  - Acceptance: `src/workflow/skills/conditional-preservation-check/SKILL.md` + non-empty `references/` exist; Exit Gate states the concrete detectable failure named in the spec's B4 card.

- **R2** - Wire B4 into `lifecycle-build/SKILL.md`'s `## Workflow`, invoked when a refactor touches control flow, per the spec's wiring description ("Build `## Workflow`, invoked when a refactor touches control flow").
  - Acceptance: `grep -l conditional-preservation-check src/workflow/skills/lifecycle-build/SKILL.md` returns a hit.

### Implicit (RI)

- **RI1** - No new runtime dependency (repo invariant).
  - Acceptance: `package.json` `dependencies` unchanged.
- **RI2** - Reference files not collapsed into `SKILL.md`.
  - Acceptance: `references/` directory non-empty, cited from `SKILL.md`.
- **RI3** - `npm run build` picks up the new skill directory into `dist/workflow-bundle.md`.
  - Acceptance: FILE-marker blocks present for the new skill after build.

### Assumptions (A)

- **A1** - B4's "No (semantic)" validator rating (spec §3/§4) means this chain ships no validator or fixture — confirmed by direct inspection of the spec's own validator column before this brief was written, consistent with C2/D3/D4/D7's identical rating already honored the same way in Wave 3.

### Open Questions (Q)

none.

## Questions For User

none.

## Architecture Notes

- role: Lead Architect
- decisions:
  - Scope this chain to B4 alone — C1, C2, D3, D4, D7 (the rest of the spec's "non-validator
    skills" list) already shipped with full anatomy in Wave 3; re-reading the spec confirmed their
    "playbook" framing was about validator absence, not a separate, lesser deliverable still owed.
  - Branch fresh off `origin/main` (now at Wave 3's tip) — smallest possible base, no stacking.
- constraints: none beyond the standard zero-dependency and reference-file rules.
- assumptions: A1 — B4 ships with no validator, matching precedent.
- downstream_impact: this closes the entire resolved WP-R4 22-skill catalog (4 pre-existing +
  7 Wave 1 + 4 Wave 2 + 10 Wave 3 + this 1 = 22 total, plus E1/E2 as documented extensions rather
  than skills). Reflect should record this as the final WP-R4 chain.

## Exit Gate

- [x] Every active R and RI has acceptance criteria.
- [x] No blocking Q IDs.
- [x] User approved ("Proceed", 2026-07-11). `status` set to `ready-for-next-phase`, `user_checkpoint: approved`.
