# Exemplar

## Good Example

A complete reflect artifact. Outcome cites evidence paths. The coverage retrospective has one row per ID. Learning candidates are agent-actionable. Every follow-up has a named owner and a suggested artifact title.

```markdown
---
slug: domain-yaml-loader
version: 1
artifact: reflect
status: done
created: 2026-05-18
updated: 2026-05-18
manifest_ids: [R1, R2, RI1, RI2]
upstream:
  brief: .workflow/artifacts/briefs/domain-yaml-loader-v1.md
  plan: .workflow/artifacts/plans/domain-yaml-loader-v1.md
  task: .workflow/artifacts/tasks/domain-yaml-loader-v1.md
  review: .workflow/artifacts/reviews/domain-yaml-loader-v1.md
  verify: .workflow/artifacts/verify/domain-yaml-loader-v1.md
  ship: .workflow/artifacts/ship/domain-yaml-loader-v1.md
orchestration:
  phase: reflect
  status: done
  next_phase: done
  blockers: []
  user_checkpoint: none
---

## Inputs

- Ship recommendation: `ship`, `.workflow/artifacts/ship/domain-yaml-loader-v1.md`
- All upstream artifacts present and complete.

## Outcome

- Released: change merged to `main`; documentation-only.
- Source-of-truth: not applicable — no external tracking configured.
- Rollback: not triggered.
- All four manifest IDs shipped without waiver.

## What Worked

- Single-phase plan kept coordination cost low — two files, all IDs addressed in one phase, no inter-phase dependency.
- Review caught the RI1 absent-file condition gap before Test signed off — P2 finding was raised, fixed, and re-verified by grep before Ship was written.
- Verification Plan in the plan artifact named exact grep targets per ID; Test could produce reproducible evidence for every requirement without re-reading the plan for guidance.

## What Did Not Work

- The validator check (`check-lifecycle.mjs`) was skipped in Test because it does not yet exist. The `[domain.yaml]` label requirement in output-schema.md cannot be machine-enforced today — this gap will recur for every brief that uses domain constraints until Phase 7 validator work is completed.

## Surprises

- Release config had no PR gate configured. Ship correctly marked PR readiness as not applicable rather than blocking on a missing PR URL. This prevented an unnecessary hold.

## Manifest Coverage Retrospective

| Manifest ID | Outcome | Evidence path | Notes |
|---|---|---|---|
| R1 | shipped | `.workflow/artifacts/verify/domain-yaml-loader-v1.md` — Manifest Coverage R1 row | Confirmed by grep at SKILL.md line 47. |
| R2 | shipped | `.workflow/artifacts/verify/domain-yaml-loader-v1.md` — Manifest Coverage R2 row | Confirmed by grep at output-schema.md line 23. |
| RI1 | shipped | `.workflow/artifacts/verify/domain-yaml-loader-v1.md` — Manifest Coverage RI1 row | P2 fix applied and confirmed by grep at SKILL.md line 48. |
| RI2 | shipped | `.workflow/artifacts/verify/domain-yaml-loader-v1.md` — Manifest Coverage RI2 row | Negative check confirmed; no migration language found. |

## Deferred

- Q1 (Should Plan also load `domain.yaml`?) remains open. Non-blocking. Owner: user. Suggested follow-up: `domain-yaml-plan-loading` brief.

## Source-of-Truth Outcome

Not applicable — no external tracking configured in `.workflow/config/source-of-truth.yaml`.

## Learning Candidates

- **Candidate learning**: When an RI covers a graceful degradation condition, Review should check for explicit conditional language in the changed file rather than accepting that the intent is implied — source: `.workflow/artifacts/reviews/domain-yaml-loader-v1.md` P2 finding — propose-only.
- **Candidate learning**: Verification Plans that name exact commands and line numbers allow Test to produce reproducible grep evidence per ID instead of relying on manual reading — source: `.workflow/artifacts/plans/domain-yaml-loader-v1.md` Verification Plan — propose-only.

## Follow-Ups

| Action | Owner | Suggested Artifact Or Ticket | Status |
|---|---|---|---|
| Implement `check-lifecycle.mjs` validator for label requirements | workflow owner | `phase-7-validators` brief | open |
| Confirm with user whether Plan should also load `domain.yaml` (Q1) | user | `domain-yaml-plan-loading` brief | open |

## Raw Session Entry

See `.workflow/learnings/sessions/2026-05-18-domain-yaml-loader.md`.

## Architecture Notes

- role: Project Manager
- decision: Both learning candidates tagged propose-only; neither promoted to curated without a separate curation request.
- constraint: Q1 is deferred, not closed — it must appear in follow-ups with user as owner.
- downstream: Phase 7 validator work should reference the skipped-check entry in the verify artifact.

## Exit Gate

- [x] Both artifacts written: reflect and raw learning session.
- [x] Manifest Coverage Retrospective has one row per active ID with evidence paths.
- [x] Learning candidates tagged `propose-only`.
- [x] Follow-ups have named owner and suggested artifact title.
- [x] `orchestration.status: done`, `next_phase: done`.
```

## Bad Example

A reflect artifact that summarizes without evidence, proposes vague learnings, and claims external outcomes that no upstream artifact supports.

```markdown
---
slug: domain-yaml-loader
status: complete
---

## Summary

The domain-yaml-loader feature was completed successfully. All requirements were met and the process went smoothly.

## Learnings

- Make sure to test things properly next time.
- Documentation changes are simpler than code changes.

## Follow-Ups

- Look into validators (TBD)
- Check if Plan should load domain.yaml (TBD)

## Outcome

Everything shipped fine. The PR merged without issues.
```

## Why The Bad Is Bad

- "All requirements were met" is an assertion without a coverage retrospective — R1, R2, RI1, RI2 do not appear individually with outcome, evidence path, or notes. A future restore-context invocation reading this artifact cannot determine which IDs shipped and which were deferred.
- "Make sure to test things properly next time" is not agent-actionable — it names no phase, no artifact section, no behavior to change. An agent reading this learning cannot apply it to any future lifecycle run.
- "Documentation changes are simpler than code changes" is a general observation with no process consequence. It does not identify what made this change simpler or what a future agent should do differently.
- Follow-ups with "TBD" owner are never claimed — they accumulate as permanent unresolved noise across every reflect artifact. Every follow-up must have a named owner and a suggested artifact title before Reflect closes.
- "The PR merged without issues" claims an external outcome that appears nowhere in the upstream artifacts — the Ship artifact marks PR/CI as not applicable because no PR gate was configured. This is fabricated state. A future restore-context invocation will find a reflect artifact that claims a PR merged but a Ship artifact that explicitly says no PR was required — the chain is internally inconsistent and unresolvable.
- Frontmatter missing `artifact`, `version`, `manifest_ids`, `upstream`, and `orchestration` block — `next_phase: done` is absent, so the lifecycle chain appears still open rather than closed.
