---
name: lifecycle-review
description: Staff Reviewer phase that writes durable review findings, requirement coverage, verification review, residual risk, and recommendation.
phase: review
role: Staff Reviewer
---

# Lifecycle: Review

## Purpose

Review Build output against the approved brief, plan, task artifact, current diff, configured repo contracts, generated-output expectations, and verification evidence.

Review is durable in `agentsmyth`: it writes a review artifact instead of relying only on chat. It reviews evidence, not claims, and it remains read-only unless the user explicitly asks to switch into a fix/build pass.

## Role

Act as Staff Reviewer for the lifecycle chain.

- Find correctness, requirement, contract, evidence, generated-output, source-of-truth, and release-readiness issues.
- Verify coverage for every active `R` and `RI`.
- Lead with findings ordered by severity.
- Record residual risk even when no findings are found.
- Recommend `pass`, `pass-with-risk`, or `hold`.

## Artifact Written Or Reviewed

Primary artifact:

```text
workflow/artifacts/reviews/<slug>-v<N>.md
```

Use the Starter Block in `references/output-schema.md` to create a new review artifact.

## Required Upstream Artifacts

Required:

- `workflow/artifacts/briefs/<slug>-v<N>.md`
- `workflow/artifacts/plans/<slug>-v<N>.md`
- `workflow/artifacts/tasks/<slug>-v<N>.md`
- Current diff, changed files, commit range, or explicit review target.

Review may proceed on a blocked Build only when the review target is clear and the artifact records which blockers limit confidence.

## What To Load

**Foundation** (confirm in context; load if not already present):
- Root `AGENTS.md`
- `workflow/router.md`
- `workflow/lifecycle.md`
- `workflow/rules.md`

**Minimum for invocation**:
- This file
- `references/output-schema.md`

**Before starting work**:
- `references/role.md`
- Upstream brief, plan, and task artifacts
- Current repository diff target or changed-file list

**Load when the step requires it**:
- `references/exemplar.md` — before finalizing output, to validate quality
- `references/severity-model.md` — when classifying finding severity
- `references/requirement-coverage.md` — when mapping requirements to evidence
- `references/review-risk-categories.md` — when categorizing findings by risk type
- `references/generated-output-review.md` — when reviewing generated-output changes
- `references/source-of-truth-review.md` — when reviewing source-of-truth handling
- `references/verification-review.md` — when reviewing verification evidence
- `workflow/skills/coverage-tracer/SKILL.md` — when mapping requirements to evidence, to extend the covered/deferred/waived/dropped ledger
- `workflow/skills/evidence-auditor/SKILL.md` — when confirming findings and verification claims cite resolvable evidence
- `workflow/skills/verify-manifest-coverage/SKILL.md` — before finalizing `manifest_ids`, to cross-check declared coverage against actual diff scope

**On demand**:
- `workflow/agent-behavior.yaml` — when evidence policy or waiver rules affect findings
- `workflow/config/repo-profile.yaml` — when protected paths or contract expectations affect findings
- `workflow/config/domain.yaml` — when domain constraints affect findings
- `workflow/config/source-of-truth.yaml` — when requirements or changed files depend on external source authority
- `workflow/config/verification.yaml` — when evaluating the adequacy of verification evidence
- `workflow/config/release.yaml` — when changed surfaces affect PR, CI, deployment, or rollback risk
- Generated-output evidence and source files referenced by the task artifact
- Verification command output or logs referenced by Build
- `workflow/skills/dispatch-subagents/SKILL.md` — only when the user explicitly authorizes independent read-only review workstreams

## Inputs

- Completed or blocked Build task artifact.
- Current diff, changed files, commit range, branch, or PR.
- Active phase manifest IDs and verification rows.
- User-requested review focus, if any.

## Refusal / Stop Conditions

Stop and ask, or return a blocked review artifact, when any of these apply:

- Phase gate check exits non-zero: run `agentsmyth check --phase review --slug <active-slug>` at entry — stop immediately, do not proceed with a caveat.
- Requirement scope cannot be reconstructed from brief, plan, or task artifacts.
- There is no diff, changed-file list, commit range, branch, PR, or task evidence to review.
- The user asks for a pass/merge recommendation without evidence.
- The request asks Review to modify files without explicitly switching to Build/fix mode.
- Required generated-output, source-of-truth, or verification evidence is unavailable and cannot be marked as residual risk.

## Workflow

1. Ground the review in the active manifest IDs, plan phase, task evidence, and diff target.
2. Inspect actual changed files and relevant unchanged context.
3. Review generated-output changes against their configured source or regeneration path.
4. Review source-of-truth handling against configured source policy and task evidence.
5. Review verification evidence: exact commands, manual QA, generated-output checks, skipped checks, and not-run risks.
6. Run a blocking pass for missing requirements, contract mismatch, data loss, security risk, compatibility break, generated-output drift, release risk, and invalid lifecycle state.
7. Run a non-blocking pass for maintainability, docs gaps, unclear evidence, and follow-up-worthy cleanup.
8. Map every active `R` and `RI` to `covered`, `partial`, or `missing`.
9. Write `workflow/artifacts/reviews/<slug>-v<N>.md` with findings first, severity summary, requirement coverage, architecture notes, verification reviewed, residual risk, and recommendation.
10. Set `orchestration.status` to `blocked` when findings require Build changes, otherwise `ready-for-next-phase` with `next_phase: test`.

## Architecture Notes Expectations

The review artifact must include architecture notes when findings or residual risk affect later phases.

Use the frontmatter `architecture_notes` block when the artifact schema supports it, and mirror longer explanation in the review body. At minimum, capture:

- role: `Staff Reviewer`
- decisions about review scope and evidence trust
- constraints from diff shape, missing evidence, generated output, source-of-truth, or release config
- tradeoffs between pass, pass-with-risk, and hold
- assumptions that Test/Ship must verify
- downstream impact on fixes, verification, release gates, or follow-up work

## Exit Gate

- Durable review artifact exists at `workflow/artifacts/reviews/<slug>-v<N>.md`.
- Findings lead the artifact and are ordered by severity.
- Every finding has severity, path or area, affected manifest ID when applicable, problem, and concrete fix recommendation.
- Requirement coverage has one row per active `R` and `RI`.
- Missing or partial coverage appears as a finding or residual risk.
- Verification reviewed names exact evidence inspected and outcomes.
- Residual risk is explicit even when there are no findings.
- Recommendation is `pass`, `pass-with-risk`, or `hold`.
- `orchestration.phase` is `review`, `orchestration.status` is accurate, and `next_phase` is `test` when unblocked.
- `verify-manifest-coverage` confirms declared `manifest_ids` equal observed diff coverage, with any delta explained.
- Every claim tagged as verified in the review passes `evidence-auditor`.

## Determinism Rules

- Review evidence, not claims.
- Do not modify product files unless the user explicitly switches to a fix/build pass.
- Do not claim commands passed unless evidence exists.
- Do not infer generated-output correctness from source edits alone.
- Do not suppress requirement gaps as style feedback.
- Findings must lead the output.
- Use severity values exactly: `P0`, `P1`, `P2`, `P3`.

## Output

Follow `references/output-schema.md`.

The user-facing response must include the review artifact path, top findings, coverage summary, residual risk, recommendation, and whether Test may start.
