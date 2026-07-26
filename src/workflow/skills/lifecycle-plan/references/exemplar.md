# Exemplar

## Good Example

A complete plan artifact. Every phase names manifest IDs, exact file paths, and a verifiable exit gate. The Verification Plan provides inspection targets per ID.

```markdown
---
slug: domain-yaml-loader
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-05-13
updated: 2026-05-13
manifest_ids: [R1, R2, RI1, RI2]
upstream:
  brief: workflow/artifacts/briefs/domain-yaml-loader-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
---

## Summary

Add `domain.yaml` loading to the Think skill's context loading step. Domain constraints will be surfaced in brief Constraints sections with `[domain.yaml]` labels. Graceful degradation required when the file is absent.

## Inputs

- Brief: `workflow/artifacts/briefs/domain-yaml-loader-v1.md`
- Manifest IDs: R1, R2, RI1, RI2
- No active blockers.

## Requirement Coverage

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R1 | Phase 1 | Think SKILL.md On demand block updated |
| R2 | Phase 1 | output-schema.md Constraints section updated |
| RI1 | Phase 1 | Conditional load with explicit absent-file no-op |
| RI2 | Phase 1 | No migration step; change is additive only |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `workflow/skills/lifecycle-think/SKILL.md` | modify | R1, RI1 | Add domain.yaml to On demand block with absent-file condition |
| `workflow/skills/lifecycle-think/references/output-schema.md` | modify | R2 | Add `[domain.yaml]` label requirement to Constraints section |

## Source-of-Truth Strategy

No source-of-truth updates required. `domain.yaml` is a repository config file; no external tracking system is involved.

## Approach

Single-phase change. Both files are in the same skill directory and have no cross-phase dependencies. No new files created. No template changes.

## Phases

### Phase 1 - Update Think loading and output contract

- Manifest IDs: R1, R2, RI1, RI2
- Touches: `workflow/skills/lifecycle-think/SKILL.md`, `workflow/skills/lifecycle-think/references/output-schema.md`
- Why first: Think SKILL.md controls what agents load; output-schema.md defines what appears in Constraints. Both must change together or the label requirement is unenforceable.
- Work:
  - In SKILL.md `On demand` block: add `workflow/config/domain.yaml` — load when domain terminology, constraints, or non-goals may affect scope; skip silently when absent.
  - In output-schema.md Constraints section: add note that constraints sourced from `domain.yaml` must carry `[domain.yaml]` label.
- Exit gate: SKILL.md On demand block includes `domain.yaml` with explicit absent-file condition. Output-schema.md Constraints section names the `[domain.yaml]` label requirement.

## Dependency Order

Phase 1 only. No inter-phase dependencies.

## Branch Strategy

- Branch: `feature/domain-yaml-loader`
- Base: `main`
- Merge strategy: squash after Review and Test pass.

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Agent loads domain.yaml eagerly instead of on demand | low | medium | SKILL.md wording specifies on-demand with absent-file condition |
| Label requirement not enforced automatically | medium | low | Skipped-check entry expected in Test; future validator owns enforcement |

## Verification Plan

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1 | Read SKILL.md On demand block and confirm domain.yaml entry with load condition | Test | Manual grep acceptable; no automated validator yet |
| R2 | Read output-schema.md Constraints section and confirm `[domain.yaml]` label requirement | Test | Manual grep acceptable |
| RI1 | Confirm SKILL.md domain.yaml entry contains explicit "skip when absent" language | Test | Look for conditional phrasing; implicit intent is not sufficient |
| RI2 | Confirm neither changed file contains migration instructions or re-run requirements | Test | Negative check — absence of migration language |

## Architecture Notes

- role: Software Architect
- decision: Single phase is sufficient; both files are in the same skill directory with no cross-phase dependency.
- constraint: output-schema.md Constraints section cannot mandate domain.yaml presence — RI1 requires graceful degradation.
- tradeoff: Manual grep evidence is acceptable here because the change is additive only and the risk is low.
- downstream: Build must not introduce a mandatory domain.yaml presence check.

## Open Questions

none

## Checkpoint Approval

- Checkpoint: plan-review
- Status: approved
- User's own words (verbatim, this turn): "Looks good, go ahead and build it."

## Exit Gate

- [x] All manifest IDs in Requirement Coverage, Phases, and Verification Plan.
- [x] Repo Impact Map names exact file paths and manifest IDs.
- [x] Verification Plan names exact inspection targets per manifest ID.
- [x] User approved; `status` set to `ready-for-next-phase`.
```

## Bad Example

A plan artifact with vague phases, no traceability, and an unusable verification plan.

```markdown
---
slug: domain-yaml-loader
status: approved
---

## Plan

We need to update the Think skill to load domain.yaml. This involves:
- Updating the SKILL.md file
- Possibly updating the output schema

## Phases

### Phase 1 - Updates

- Work: Update relevant files
- Exit gate: Done

## Verification

| ID | Evidence |
|---|---|
| All | Test manually |
```

## Why The Bad Is Bad

- Frontmatter missing `artifact`, `version`, `manifest_ids`, `upstream`, and `orchestration` block. Build cannot confirm it is consuming an approved plan artifact and cannot trace which manifest IDs this plan covers. `status: approved` is also not a valid lifecycle status value.
- "Possibly updating the output schema" hides a scope decision as a conditional — either output-schema.md is in scope or it is not. If Build proceeds without updating it, R2 is never addressed and the gap will not be visible until Review or Test.
- Phase 1 names no manifest IDs, no touched files, no why-first reasoning, and "Done" as its exit gate. Build cannot open a specific file, make a specific change, and know it satisfied a specific requirement.
- Verification Plan compresses all four IDs into "All / Test manually" — a single row with no inspection target. Test cannot produce a per-ID result, cannot confirm whether RI1's absent-file condition was added, and cannot audit R2's label requirement. Every ID will appear as "manual" with no evidence path.
- Nine required sections are missing: Inputs, Requirement Coverage, Repo Impact Map, Source-of-Truth Strategy, Dependency Order, Branch Strategy, Risk Register, Architecture Notes, Open Questions, Exit Gate. Build proceeds without knowing the branch name, the scope boundary, or what files are out of scope.
