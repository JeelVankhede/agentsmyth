# Exemplar

## Good Example

A complete brief artifact. Every required section is present and the Requirement Manifest has stable IDs with acceptance criteria.

```markdown
---
slug: domain-yaml-loader
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-05-12
updated: 2026-05-12
manifest_ids: [R1, R2, RI1, RI2]
upstream: []
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: brief-review
---

## Source Links

- User request: "Agents should read domain.yaml at the start of Think and surface constraints in the brief."

## Problem

Agents have no mechanism to load domain-specific constraints before writing a brief. Scope boundaries, terminology restrictions, and non-goal decisions must be written manually or inferred, causing briefs to drift from repository intent.

## Goals

- Agents load `workflow/config/domain.yaml` when present before finalizing the brief.
- Domain constraints appear explicitly in the brief Constraints section, labeled with their source.

## Non-Goals

- Agents do not validate the schema of `domain.yaml` — content is trusted as human-authored.
- Changes do not affect Plan, Build, or downstream phases in this brief.

## User Impact

Briefs produced in repositories with a populated `domain.yaml` will automatically include domain constraints, reducing out-of-scope plan items.

## Success Metrics

- Every brief in a repository with `domain.yaml` contains at least one `[domain.yaml]`-labeled constraint.
- Briefs written without `domain.yaml` are structurally identical with no error or empty-section warning.

## Requirements

- R1: Agents read `workflow/config/domain.yaml` before writing the brief Constraints section when the file exists.
- R2: Domain constraints appear verbatim in Constraints, labeled `[domain.yaml]`.

## Constraints

- `[domain.yaml]` label required on every domain-sourced constraint so downstream phases can distinguish them from requirement-derived constraints.
- Absent `domain.yaml` must not produce an error or empty section warning.

## Risks

- Domain config may be stale or misconfigured. Agents record it as input evidence, not authoritative truth.

## Open Questions

- Q1: Should agents also load `domain.yaml` during Plan?
  - Owner: user
  - Blocking: no — Think can proceed; Plan loading can be added in a follow-up brief.

## Requirement Manifest

### Explicit (R)

- **R1** - Agents read `workflow/config/domain.yaml` before writing the brief Constraints section when the file exists.
  - Acceptance: A brief produced against a populated `domain.yaml` contains at least one `[domain.yaml]`-labeled constraint.

- **R2** - Domain constraints appear verbatim in Constraints with a `[domain.yaml]` label.
  - Acceptance: Every constraint sourced from `domain.yaml` carries the label; none are paraphrased without attribution.

### Implicit (RI)

- **RI1** - Agents must not error or produce structural gaps when `domain.yaml` is absent.
  - Acceptance: A brief produced without `domain.yaml` passes schema validation and contains no warning about missing domain config.

- **RI2** - Existing briefs produced before `domain.yaml` existed are not retroactively invalidated.
  - Acceptance: No migration step or re-run is required for existing artifacts.

### Assumptions (A)

- **A1** - `domain.yaml` is human-authored YAML and does not require schema validation by the agent.

### Open Questions (Q)

- **Q1** - Should agents load `domain.yaml` during Plan as well as Think?
  - Owner: user
  - Blocking: no

## Questions For User

- Q1: Should `domain.yaml` constraints also be applied during Plan? If yes, Plan loading will be scoped in a follow-up brief.

## Architecture Notes

- role: Lead Architect
- decision: Load `domain.yaml` only during Think in this brief; Plan-phase loading deferred to Q1 answer.
- constraint: `domain.yaml` is optional — all Think behavior must degrade gracefully when absent.
- tradeoff: Verbatim copy preserves domain intent but prevents agents from paraphrasing or merging domain constraints with requirement-derived constraints.
- downstream: Plan must not rewrite or remove `[domain.yaml]`-labeled constraints from the brief it reads.

## Checkpoint Approval

- Checkpoint: brief-review
- Status: approved
- User's own words (verbatim, this turn): "Yes, this brief looks right — go ahead with Plan."

## Exit Gate

- [x] Requirement Manifest has R1, R2, RI1, RI2 with acceptance criteria.
- [x] No blocking Q IDs — Q1 is non-blocking; `orchestration.blockers` is empty.
- [x] User approved; `status` set to `ready-for-next-phase`.
```

## Bad Example

A brief artifact that looks complete at a glance but is structurally broken.

```markdown
---
slug: domain-yaml-loader
status: done
---

## Requirements

Agents should read domain.yaml and use the domain constraints in the brief. The file might not always exist so make sure it handles that case. Also don't break existing briefs.

## Questions

- Should Plan also read domain.yaml?

## Notes

Keep the constraints clearly labeled. This is a Standard request. The agent needs to be careful not to break things.
```

## Why The Bad Is Bad

- Frontmatter has only `slug` and `status` — missing `artifact`, `version`, `manifest_ids`, `upstream`, and the entire `orchestration` block. Plan uses `artifact` to confirm it is consuming a brief. `orchestration.next_phase` is how Plan knows the artifact is approved and ready. Without these keys the chain cannot be walked and restore-context cannot reconstruct lifecycle state.
- "Agents should read domain.yaml and use the domain constraints" compresses R1 and R2 into one unstructured sentence. Each downstream phase will interpret it differently. Test has no acceptance criterion to verify against and cannot produce a pass or fail result.
- "The file might not always exist so make sure it handles that case" is RI1 written as a conversational note — it has no ID, no acceptance criterion, and no tracing path. Build will not know to add an absent-file condition and Review will not know to check for one.
- No Requirement Manifest section means no stable IDs exist. Plan cannot write `Manifest IDs: R1, R2` in its phases, Build cannot annotate changed files with IDs, and Review cannot produce a per-ID coverage table.
- The Questions section has no owner, no blocking flag, and no `orchestration.blockers` entry — the question is invisible to any phase that checks for blockers before proceeding.
- Eight required sections are entirely absent: Problem, Goals, Non-Goals, User Impact, Success Metrics, Constraints, Risks, Architecture Notes, Exit Gate. The artifact fails schema validation and Plan cannot determine scope boundaries or non-goals before writing phases.
