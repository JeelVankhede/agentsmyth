---
name: lifecycle-test
description: Senior QA phase that writes verification evidence per requirement using configured commands, manual QA, generated-output checks, and skipped-check risk.
phase: test
role: Senior QA
---

# Lifecycle: Test

## Purpose

Produce durable verification evidence for every active requirement before Ship.

Test builds a verification matrix from the brief, plan, task artifact, review artifact, and configured verification rules. It runs or records the required checks, treats skipped checks as risk, and writes the verify artifact.

## Role

Act as Senior QA for the lifecycle chain.

- Verify active `R` and `RI` coverage with evidence.
- Run configured commands where available and relevant.
- Record manual QA and generated-output checks when configured.
- Record skipped, blocked, or not-run checks with risk and owner.
- Recommend `ship`, `hold`, or `hold-with-waiver`.

## Artifact Written Or Reviewed

Primary artifact:

```text
workflow/artifacts/verify/<slug>-v<N>.md
```

Use the Starter Block in `references/output-schema.md` to create a new verify artifact.

## Required Upstream Artifacts

Required:

- `workflow/artifacts/briefs/<slug>-v<N>.md`
- `workflow/artifacts/plans/<slug>-v<N>.md`
- `workflow/artifacts/tasks/<slug>-v<N>.md`

Preferred:

- `workflow/artifacts/reviews/<slug>-v<N>.md`

If Review is missing or blocked, Test may proceed only when the artifact records the missing review as risk and the orchestrator/user allows the lifecycle exception.

## What To Load

**Foundation** (confirm in context; load if not already present):
- Root `AGENTS.md`
- `workflow/router.md`
- `workflow/lifecycle.md`
- `workflow/rules.md`

**Minimum for invocation**:
- This file
- `references/output-schema.md`
- `workflow/config/verification.yaml`

**Before starting work**:
- `references/role.md`
- Upstream brief, plan, and task artifacts

**Load when the step requires it**:
- `references/exemplar.md` — before finalizing output, to validate quality
- `references/verification-matrix.md` — when building the manifest coverage table
- `references/command-evidence-policy.md` — before running or recording any command
- `references/manual-qa-policy.md` — when recording manual QA scenarios
- `references/skipped-check-policy.md` — when a check cannot be run
- `references/generated-output-verification.md` — when verifying generated output
- `workflow/skills/waiver-completeness-check/SKILL.md` — when the verify artifact records any waiver, to confirm it carries all 6 required fields
- `workflow/skills/evidence-auditor/SKILL.md` — when confirming every verification claim cites resolvable evidence
- `workflow/skills/skipped-check-accountant/SKILL.md` — before finalizing Sign-Off, to confirm every skipped or unevidenced check has a complete risk entry
- `workflow/skills/verification-matrix-builder/SKILL.md` — when building Manifest Coverage, to confirm every active R/RI has a named verification method
- `workflow/skills/dispatch-subagents/SKILL.md` — only when the user explicitly authorizes it, and only for independently-reproducible verification rows (the `verification-parallelizer`/E1 profile, `references/decision-tree-by-phase.md`); all other Test work stays local
- `workflow/skills/quality-gates-validator/SKILL.md` — when the recorded trigger evaluates true, to judge whether coverage/lint/security/perf bars are adequate, not just present
- `workflow/skills/performance-optimizer/SKILL.md` — when the recorded trigger evaluates true, to confirm a performance recommendation's measurement method actually ran

**On demand**:
- `workflow/agent-behavior.yaml` — when evidence policy or waiver rules affect verification
- `workflow/config/repo-profile.yaml` — when generated output paths or public contracts affect verification scope
- `workflow/config/domain.yaml` — when domain rules affect QA scenarios
- `workflow/config/source-of-truth.yaml` — when verification depends on external source updates or handoff
- `workflow/config/release.yaml` — when verification affects Ship gates, deployment, or PR/CI readiness
- Review artifact — when review findings or residual risk affect verification coverage
- Repository files — when needed to run configured commands or inspect generated output
- Existing verify artifact — when rerunning or extending evidence

## Inputs

- Completed or blocked Build task artifact with evidence.
- Review artifact or documented review waiver/risk.
- Plan verification rows for every active `R` and `RI`.
- Configured commands, manual QA expectations, generated-output checks, and waiver policy.
- User answers resolving Test blockers.

## Refusal / Stop Conditions

Stop and ask, or return a blocked verify artifact, when any of these apply:

- Phase gate check exits non-zero: run `agentsmyth check --phase test --slug <active-slug>` at entry — stop immediately, do not proceed with a caveat.
- Brief, plan, or task artifact is missing.
- No completed or explicitly blocked Build phase exists to verify.
- The plan verification rows are empty, vague, or not mapped to active manifest IDs.
- Required repo access, command access, manual QA environment, generated-output path, or network access is blocked and no waiver owner exists.
- A check fails and the user has not asked to switch back to Build/fix mode or accept a waiver.
- Verification would require inventing commands, results, source updates, releases, or external state.

## Workflow

1. Build the verification matrix from active `R` and `RI` IDs in the plan/task scope.
2. Map each manifest ID to configured commands, manual QA, generated-output checks, source-of-truth checks, review evidence, or explicit waiver.
3. Run configured commands that are available, relevant, and safe in the repository.
4. Record exact command, repo/area, outcome, and notes for every command run.
5. Record not-run commands with reason, risk, owner, and whether Ship is blocked.
6. Verify generated output against configured source, regeneration command, snapshot, or expected path when applicable.
7. Record manual QA with environment, steps, expected result, observed result, outcome, and evidence.
8. Incorporate review findings and residual risk into verification coverage.
9. Write `workflow/artifacts/verify/<slug>-v<N>.md`.
10. Set recommendation to `ship`, `hold`, or `hold-with-waiver`.
11. Set `orchestration.status` to `blocked` when failed or missing evidence blocks Ship, otherwise `ready-for-next-phase` with `next_phase: ship`.

## Architecture Notes Expectations

The verify artifact must include architecture notes when evidence choices affect Ship or future maintenance.

Use the frontmatter `architecture_notes` block when the artifact schema supports it, and mirror longer explanation in the verify body. At minimum, capture:

- role: `Senior QA`
- decisions about evidence type and coverage
- constraints from verification config, environment, tooling, generated output, source-of-truth, or release config
- tradeoffs behind skipped or manual checks
- assumptions Ship must preserve or waive
- downstream impact on release readiness, rollback, source-of-truth handoff, or follow-up work

## Exit Gate

- Verify artifact exists at `workflow/artifacts/verify/<slug>-v<N>.md`.
- Every active `R` and `RI` has pass, fail, or skip evidence.
- Automated checks record every command run or intentionally not run with outcome and notes.
- Generated-output evidence includes concrete command or file-path evidence when applicable.
- Manual QA includes environment, steps, expected, observed, outcome, and evidence when used.
- Failed or skipped checks are fixed, rerun, or recorded as hold/waiver with owner and risk.
- Sign-off includes verifier, date, and recommendation.
- `orchestration.phase` is `test`, `orchestration.status` is accurate, and `next_phase` is `ship` when unblocked.
- `skipped-check-accountant` confirms every check is run-with-evidence or has a complete risk entry with owner.
- Every claim tagged as verified in the verify artifact passes `evidence-auditor`; any waiver present passes `waiver-completeness-check`.
- `verification-matrix-builder` confirms no active R/RI has a method-less or evidence-less Manifest Coverage row.

## Determinism Rules

- Do not claim a command passed unless it actually ran or exact existing evidence is cited.
- Do not claim generated-output correctness from source inspection alone.
- Do not edit product files during Test unless the user explicitly switches back to Build/fix mode.
- Do not treat skipped checks as success.
- Do not invent commands, results, external source updates, release status, or CI state.
- Use exact paths for evidence and generated files.
- Verification recommendations are limited to `ship`, `hold`, or `hold-with-waiver`.

## Output

Follow `references/output-schema.md`.

The user-facing response must include the verify artifact path, command/manual/generated-output evidence summary, skipped-check risks, findings, sign-off recommendation, and whether Ship may start.
