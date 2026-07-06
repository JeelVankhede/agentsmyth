# Exemplar

## Good Example

A complete review artifact. Each finding names severity, path, manifest ID, problem, and fix. Requirement Coverage has one row per ID with specific evidence. Verification evidence from the task artifact is explicitly inspected.

```markdown
---
slug: domain-yaml-loader
version: 1
artifact: review
status: ready-for-next-phase
created: 2026-05-15
updated: 2026-05-15
manifest_ids: [R1, R2, RI1, RI2]
upstream:
  brief: workflow/artifacts/briefs/domain-yaml-loader-v1.md
  plan: workflow/artifacts/plans/domain-yaml-loader-v1.md
  task: workflow/artifacts/tasks/domain-yaml-loader-v1.md
orchestration:
  phase: review
  status: ready-for-next-phase
  next_phase: test
  blockers: []
  user_checkpoint: none
---

## Findings

- P2 `workflow/skills/lifecycle-think/SKILL.md` [RI1] — The On demand entry for `domain.yaml` says "load when domain terminology affects scope" but does not explicitly state "skip when absent." An agent could interpret this as a soft requirement and attempt to load a non-existent file.
  - Fix: Add "skip silently when absent" to the `domain.yaml` On demand entry in SKILL.md.

## Severity Summary

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 1 |
| P3 | 0 |

## Requirement Coverage

| Manifest ID | Evidence | Status | Notes |
|---|---|---|---|
| R1 | `workflow/skills/lifecycle-think/SKILL.md` On demand block — `domain.yaml` entry present at line 47 | covered | Entry confirmed by reading the file. |
| R2 | `workflow/skills/lifecycle-think/references/output-schema.md` Constraints section — `[domain.yaml]` label requirement at line 23 | covered | Label requirement stated explicitly. |
| RI1 | `workflow/skills/lifecycle-think/SKILL.md` — absent-file condition is implicit, not explicit | partial | P2 finding raised; explicit "skip when absent" language needed before Test signs off. |
| RI2 | Neither changed file contains migration language | covered | Read both files; no re-run or migration instructions found. |

## Architecture Notes

- role: Senior Reviewer
- decision: RI1 coverage is partial due to implicit-only absent-file handling; P2 raised rather than passing risk to Test.
- constraint: The fix is a one-line addition to SKILL.md; it does not require a plan revision.
- downstream: Test must verify the explicit "skip when absent" language is present after the fix is applied.

## Verification Reviewed

| Item | Outcome | Notes |
|---|---|---|
| `git diff --check` (task artifact Command Results) | pass | Confirmed in task artifact; exit 0 recorded. |
| `git status` (task artifact Command Results) | 2 modified files only | Scope respected; no unrelated files modified. |

## Residual Risk

- RI1 partial: agent behavior when `domain.yaml` is absent depends on implicit interpretation of the current wording. Low probability of breakage given typical agent caution, but explicit language removes the ambiguity entirely.

## Recommendation

pass-with-risk — one P2 finding. Test may proceed after the absent-file condition is made explicit in SKILL.md.
```

## Bad Example

A review artifact that asserts coverage without evidence and raises findings too vague to action.

```markdown
---
slug: domain-yaml-loader
status: reviewed
---

## Review Notes

I looked at the changes and they seem fine. The SKILL.md was updated and the output schema looks good. A few minor things could be improved but nothing blocking.

## Coverage

All requirements covered.

## Recommendation

Pass.
```

## Why The Bad Is Bad

- "A few minor things could be improved but nothing blocking" is not a finding — it has no severity level, no file path, no manifest ID, no problem statement, and no fix recommendation. Build cannot action it. If RI1's absent-file condition is missing, this artifact hides that gap entirely.
- "All requirements covered" with no table means R1, R2, RI1, RI2 are collapsed into a single assertion. There are no evidence citations, no coverage status per ID, and no way for Test or Ship to audit which IDs were actually reviewed and which were assumed.
- "The output schema looks good" is an opinion without inspection detail — it does not name what was read, what line was checked, or what a correct result looks like. Test cannot build on this.
- No Severity Summary means there is no structured record of finding counts. Restore-context and downstream phases cannot determine whether the review was clean or had unresolved findings.
- No Verification Reviewed section means Review never inspected the command results from the task artifact — Review's coverage claim is not grounded in any execution evidence from Build.
- `status: reviewed` is not a valid orchestration status. Ship checks for specific status values to determine whether a review artifact is usable. "Recommendation: Pass" with a capital P is also non-standard — the valid value is lowercase `pass`.
- Frontmatter missing `artifact`, `manifest_ids`, `upstream`, and `orchestration` block.
