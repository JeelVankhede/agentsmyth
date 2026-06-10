# Exemplar

## Good Example

A complete task artifact. Branch status is recorded before and after. Changed files are annotated with manifest IDs. Command results include actual output.

```markdown
---
slug: domain-yaml-loader
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-05-14
updated: 2026-05-14
manifest_ids: [R1, R2, RI1, RI2]
upstream:
  brief: .workflow/artifacts/briefs/domain-yaml-loader-v1.md
  plan: .workflow/artifacts/plans/domain-yaml-loader-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

## Active Phase

- Phase: Phase 1 - Update Think loading and output contract
- Manifest IDs: R1, R2, RI1, RI2
- Exit gate: SKILL.md On demand block includes `domain.yaml` with explicit absent-file condition; output-schema.md Constraints section names the `[domain.yaml]` label requirement.

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `feature/domain-yaml-loader` | Clean — no uncommitted changes | Confirmed with `git status` before first edit. |
| At handoff | `feature/domain-yaml-loader` | 2 files modified | Only in-scope files changed; no untracked files added. |

## Scope

- In scope: `.workflow/skills/lifecycle-think/SKILL.md`, `.workflow/skills/lifecycle-think/references/output-schema.md`
- Out of scope: All other skill files, templates, config files, examples, validators.

## Changed Files

- `.workflow/skills/lifecycle-think/SKILL.md` — added `domain.yaml` entry to On demand block with explicit "skip silently when absent" condition — IDs: R1, RI1
- `.workflow/skills/lifecycle-think/references/output-schema.md` — added `[domain.yaml]` label requirement to Constraints section description — IDs: R2

## Implementation Log

- SKILL.md On demand block: added `.workflow/config/domain.yaml` — load when domain terminology, constraints, or non-goals may affect scope; skip silently when absent.
- output-schema.md Constraints section: added note that every constraint sourced from `domain.yaml` must carry the `[domain.yaml]` label.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R1 | SKILL.md On demand block — `domain.yaml` entry present | Entry with load condition |
| R2 | output-schema.md Constraints section — `[domain.yaml]` label requirement stated | Requirement present |
| RI1 | SKILL.md `domain.yaml` entry — explicit "skip silently when absent" language | Conditional phrase present; not implied |
| RI2 | Neither changed file — migration instructions or re-run requirements | Absent; negative check |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `git status` | repo | `feature/domain-yaml-loader` — 2 modified | Only in-scope files. |
| `git diff --check` | repo | Exit 0 | No whitespace errors. |

## Dispatch Log

No dispatch performed. Phase 1 handled locally; two-file change is below delegation threshold.

## Architecture Notes

- role: Senior Engineer
- decision: Added `domain.yaml` to On demand block rather than Before starting work because domain constraints are optional — not every Think invocation requires them.
- constraint: Label requirement in output-schema.md uses descriptive prose; enforcement is at agent read time, not validator time.
- tradeoff: On demand placement minimizes token usage for repositories without domain.yaml; agents must remember to check it when writing Constraints.

## Blockers

none

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Phase 1 - Update Think loading and output contract | complete | 2026-05-14 | Both files changed; verification items populated. |
```

## Bad Example

A task artifact that claims completion without linking changes to requirements or providing reproducible evidence.

```markdown
---
slug: domain-yaml-loader
status: complete
---

## Changes Made

- Updated SKILL.md ✅
- Updated output-schema.md ✅

## Testing

All checks passed. The changes look good and work as expected.

## Status

Done. Ready for review.
```

## Why The Bad Is Bad

- "Updated SKILL.md ✅" describes no change — Review cannot determine whether the On demand entry was added, whether the absent-file condition is present, or whether any of R1, R2, RI1, RI2 was addressed. Without a description, Review must re-read both files from scratch with no guidance.
- No manifest IDs linked to changed files — even if Review reads the files, it cannot trace which ID was satisfied by which change. If RI1 is missing its absent-file condition, there is nothing in the task artifact to flag that it was ever in scope.
- "All checks passed" is not a command — it names no runner, no path, no output format, no exit code. The result may be invented, recalled from a prior run, or from a different branch. It cannot be reproduced by Review or independently verified by Test.
- Pre-checked ✅ entries require no evidence — if Build was interrupted after writing the task artifact but before making the change, the artifact still shows complete. Review has no way to distinguish interrupted from finished work.
- No Branch / Repo Status means Review cannot see whether unrelated dirty files were present at handoff, whether the branch matches the plan, or whether uncommitted state exists.
- Eight required sections are missing: Active Phase, Branch/Repo Status, Scope, Implementation Log, Verification Items, Dispatch Log, Architecture Notes, Blockers, Phase Completion Log. The artifact provides no handoff state for Review.
