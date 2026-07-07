# Exemplar

## Good Example

A complete verify artifact. Automated checks show actual commands and output. Manifest Coverage has one row per ID with reproducible evidence. Skipped checks name risk and owner.

```markdown
---
slug: domain-yaml-loader
version: 1
artifact: verify
status: ready-for-next-phase
created: 2026-05-16
updated: 2026-05-16
manifest_ids: [R1, R2, RI1, RI2]
upstream:
  brief: workflow/artifacts/briefs/domain-yaml-loader-v1.md
  plan: workflow/artifacts/plans/domain-yaml-loader-v1.md
  task: workflow/artifacts/tasks/domain-yaml-loader-v1.md
  review: workflow/artifacts/reviews/domain-yaml-loader-v1.md
orchestration:
  phase: test
  status: ready-for-next-phase
  next_phase: ship
  blockers: []
  user_checkpoint: none
---

## Inputs

- Task artifact: `workflow/artifacts/tasks/domain-yaml-loader-v1.md`
- Review artifact: `workflow/artifacts/reviews/domain-yaml-loader-v1.md`
- Review recommendation: `pass-with-risk` — P2 finding on RI1 (absent-file condition implicit only).
- P2 fix confirmed applied before Test began: SKILL.md On demand entry for `domain.yaml` now reads "skip silently when absent."

## Automated Checks

| Command | Outcome | Evidence |
|---|---|---|
| `git diff --check` | pass | Exit 0; no whitespace errors in changed files. |
| `grep -n "domain.yaml" workflow/skills/lifecycle-think/SKILL.md` | pass | Line 47: `workflow/config/domain.yaml` — entry present in On demand block. |
| `grep -n "skip silently when absent" workflow/skills/lifecycle-think/SKILL.md` | pass | Line 48: explicit absent-file condition confirmed present. |
| `grep -n "\[domain.yaml\]" workflow/skills/lifecycle-think/references/output-schema.md` | pass | Line 23: label requirement present in Constraints section description. |

## Manifest Coverage

| Manifest ID | How Verified | Evidence | Result | Notes |
|---|---|---|---|---|
| R1 | command | `grep` result — SKILL.md line 47 | pass | On demand entry present with load condition. |
| R2 | command | `grep` result — output-schema.md line 23 | pass | `[domain.yaml]` label requirement confirmed. |
| RI1 | command | `grep` result — SKILL.md line 48 | pass | Explicit "skip silently when absent" present; P2 fix confirmed. |
| RI2 | manual inspection | Read both changed files — no migration language found | pass | Negative check; no re-run or migration instructions in either file. |

## Manual QA

Not applicable — changes are skill and schema files with no runtime behavior to exercise interactively.

## Generated Output Evidence

Not applicable — no generated output configured.

## Findings

none

## Skipped Checks

| Check | Why Skipped | Risk | Owner | Blocks Ship |
|---|---|---|---|---|
| `node workflow/validators/check-lifecycle.mjs` | Validator is a placeholder and not yet implemented. | `[domain.yaml]` label requirement in output-schema.md cannot be machine-checked at this time. | Phase 7 (validator implementation) | no |

## Architecture Notes

- role: QA Engineer
- decision: Automated grep used for all file-presence and wording assertions; manual inspection used only for the RI2 negative check (absence of migration language).
- constraint: No automated enforcement of `[domain.yaml]` label at agent runtime — skipped check recorded with Phase 7 owner.

## Sign-Off

- Verifier: Test phase agent
- Date: 2026-05-16
- Recommendation: ship
```

## Bad Example

A verify artifact where every result is asserted without evidence and the skipped check gap is hidden.

```markdown
---
slug: domain-yaml-loader
status: tested
---

## Testing

I verified the changes manually. The SKILL.md has the domain.yaml entry and the output schema was updated. Everything looks correct.

## Results

| Requirement | Result |
|---|---|
| R1 | pass |
| R2 | pass |
| RI1 | pass |
| RI2 | pass |

## Sign-Off

All good. Ready to ship.
```

## Why The Bad Is Bad

- "I verified the changes manually" is the only evidence statement for all four requirements. There is no command, no grep output, no line number, no file path. Ship cannot distinguish this artifact from one written without reading the files at all.
- The results table shows `pass` for all four IDs but has no How Verified or Evidence columns. RI1's pass claim is especially unverifiable: Review raised a P2 finding that the absent-file condition was missing. This artifact shows RI1 as pass with no evidence that the fix was ever applied or checked.
- No Automated Checks section means the `git diff --check` result from the task artifact was never independently confirmed. Review verified it but Test re-verification is not present.
- No Skipped Checks section hides the validator gap. Ship will proceed without knowing `check-lifecycle.mjs` was not run. The risk reaches Ship invisibly and cannot be waived because it was never named.
- "All good. Ready to ship." is not a recommendation value. Ship expects exactly `ship`, `hold`, or `hold-with-waiver`. This sign-off cannot be parsed as a gate result.
- Frontmatter missing `artifact`, `manifest_ids`, `upstream`, and `orchestration` block.
