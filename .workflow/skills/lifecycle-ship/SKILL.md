---
name: lifecycle-ship
description: Senior DevOps phase that gates release readiness, source-of-truth handoff, PR/CI state when configured, rollback, and waivers.
phase: ship
role: Senior DevOps
---

# Lifecycle: Ship

## Purpose

Decide whether the lifecycle chain can move from verified change to release or handoff state.

Ship writes durable release-readiness evidence. It gates source-of-truth handoff, pull request and CI state when configured, release and rollback readiness, and waiver handling. It does not edit product code or claim external updates without evidence.

## Role

Act as Senior DevOps for the lifecycle chain.

- Read release, verification, repo, and source-of-truth config before making a recommendation.
- Classify the outcome as `ship`, `hold`, or `hold-with-waiver`.
- Verify required PR/CI/release/source gates only when configured or requested.
- Record blocked handoff instructions when access, authority, or external state prevents completion.
- Keep Reflect able to reconstruct what shipped, what was deferred, and what still needs human action.

## Artifact Written Or Reviewed

Primary artifact:

```text
.workflow/artifacts/ship/<slug>-v<N>.md
```

Use `.workflow/templates/ship/template.md` when creating or validating the ship artifact. Do not finalize or redesign the template in this phase.

## Required Upstream Artifacts

Required:

- `.workflow/artifacts/briefs/<slug>-v<N>.md`
- `.workflow/artifacts/plans/<slug>-v<N>.md`
- `.workflow/artifacts/tasks/<slug>-v<N>.md`
- `.workflow/artifacts/verify/<slug>-v<N>.md`

Preferred:

- `.workflow/artifacts/reviews/<slug>-v<N>.md`

Ship must hold when Test recommends `hold`, when Review has unresolved blocking findings, or when active requirement coverage is missing without a documented waiver.

## Required Config Files

Always load or inspect:

- `.workflow/config/agent-behavior.yaml`
- `.workflow/config/repo-profile.yaml`
- `.workflow/config/source-of-truth.yaml`
- `.workflow/config/verification.yaml`
- `.workflow/config/release.yaml`

Load `.workflow/config/domain.yaml` when domain constraints affect release, rollback, handoff, or communication.

## Context Loading

Always load:

1. Root `AGENTS.md`.
2. `.workflow/router.md`.
3. `.workflow/lifecycle.md`.
4. `.workflow/rules.md`.
5. This skill file.
6. Upstream brief, plan, task, verify, and review artifacts when present.
7. Release and source-of-truth config.
8. These references:
   - `references/role.md`
   - `references/output-schema.md`
   - `references/exemplar.md`
   - `references/release-gates.md`
   - `references/source-of-truth-handoff.md`
   - `references/waiver-policy.md`
   - `references/rollback-policy.md`
   - `references/pr-ci-policy.md`
   - `references/blocked-handoff-format.md`

Load on demand:

- Existing ship artifact for the active slug/version.
- Repository status, branch, release notes, package metadata, CI configuration, deployment config, docs, or handoff files named by release config or the Plan.
- External source or PR/CI state only through available tools and only when configured or explicitly requested.

## Inputs

- Verify recommendation: `ship`, `hold`, or `hold-with-waiver`.
- Review recommendation: `pass`, `pass-with-risk`, or `hold`.
- Requirement coverage from Review and Test.
- Release expectations from `.workflow/config/release.yaml`.
- Source-of-truth update/handoff expectations from `.workflow/config/source-of-truth.yaml`.
- PR/CI, release, deployment, rollback, or external handoff context when configured or provided.

## Refusal / Stop Conditions

Stop and write a `hold` ship artifact when any of these apply:

- Verify artifact is missing.
- Verify recommendation is `hold` and no user-accepted waiver exists.
- Review has unresolved `P0` or `P1` findings.
- Any active `R` is missing coverage without documented deferral or waiver.
- Required repository status, branch, PR, CI, release, source-of-truth, or rollback evidence cannot be inspected.
- Config requires a source-of-truth update but the target or authority is unknown.
- Required external action cannot be performed and no blocked handoff or waiver is recorded.
- A changed repo is on a disallowed branch for shipping and no user-approved exception exists.
- The user asks Ship to edit implementation files instead of switching back to Build.

## Workflow

1. Create or update `.workflow/artifacts/ship/<slug>-v<N>.md`.
2. Read upstream artifacts and collect active `R`/`RI` coverage, skipped checks, review findings, waivers, blockers, and residual risk.
3. Read release config and identify required gates: PR, CI, release, deployment, docs, package, rollback, source handoff, or none.
4. Inspect repository readiness for configured branch, PR, CI, release, or deployment gates.
5. Verify source-of-truth handoff: updated, not required, blocked with copy-ready handoff, or waived.
6. Map every active `R` and `RI` to shipped, deferred, blocked, or waived.
7. Record rollback trigger, rollback action, owner, and evidence required to execute rollback.
8. Apply waiver policy for any unresolved risk. Use `hold-with-waiver` only when the user explicitly accepts risk, owner, and follow-up action.
9. Set recommendation:
   - `ship` when all required gates have evidence and no active unwaived blocker remains.
   - `hold` when required evidence, access, release gate, or handoff is missing.
   - `hold-with-waiver` when user-accepted residual risk allows Reflect to proceed.
10. Set `orchestration.status` to `blocked-for-user` for `hold`, otherwise `ready-for-next-phase` with `next_phase: reflect`.

## Architecture Notes Expectations

The ship artifact must include architecture notes when release or handoff decisions affect later phases.

Use the frontmatter `architecture_notes` block when the artifact schema supports it, and mirror longer explanation in the ship body. At minimum, capture:

- role: `Senior DevOps`
- decisions about ship, hold, or waiver status
- constraints from release config, verification evidence, PR/CI state, source-of-truth config, or access
- tradeoffs behind accepting, holding, deferring, or waiving risk
- assumptions Reflect must preserve or call out
- downstream impact on release, rollback, source handoff, and follow-ups

## Exit Gate

- Ship artifact exists at `.workflow/artifacts/ship/<slug>-v<N>.md`.
- Recommendation is exactly `ship`, `hold`, or `hold-with-waiver`.
- Requirement coverage lists every active `R` and `RI`.
- `ship` has evidence for every configured required gate and no active unwaived blocked handoff.
- `hold` records blockers, owners, risks, and exact next actions.
- `hold-with-waiver` records explicit user acceptance of residual risk, owner, and follow-up action.
- Source-of-truth status is explicit: updated, not required, blocked, or waived.
- PR/CI/release/deployment status is explicit when configured.
- Rollback trigger and action are explicit.
- `orchestration.phase` is `ship`, `orchestration.status` is accurate, and `next_phase` is `reflect` only for `ship` or accepted `hold-with-waiver`.

## Determinism Rules

- Do not claim PRs, CI, releases, deployments, source updates, or external handoffs happened without tool output, artifact evidence, or user-provided evidence.
- Do not mark a requirement shipped when evidence is only a local change and the configured ship gate requires remote or release state.
- Do not treat copy-ready handoff text as completion without an explicit waiver.
- Do not invent ticket IDs, release versions, PR URLs, CI status, source updates, or deployment state.
- Do not edit implementation files during Ship.
- Use configured release/source rules instead of universal package, provider, or command assumptions.
- Preserve unrelated user changes.

## Output

Follow `references/output-schema.md`.

The user-facing response must include the ship artifact path, recommendation, blockers or waivers, release/source/rollback status, and whether Reflect may start.
