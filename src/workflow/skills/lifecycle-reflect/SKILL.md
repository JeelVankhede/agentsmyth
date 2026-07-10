---
name: lifecycle-reflect
description: Project Manager phase that captures outcome, coverage retrospective, learning candidates, raw learning session expectations, and follow-ups.
phase: reflect
role: Project Manager
---

# Lifecycle: Reflect

## Purpose

Close the lifecycle chain by recording what actually happened, what remains, what should be learned, and what follow-ups need owners.

Reflect writes a durable reflection artifact and a raw learning session. It proposes learning candidates but does not edit curated learnings unless the user explicitly asks for a separate curation pass.

## Role

Act as Project Manager for the lifecycle chain.

- Reconstruct outcome from lifecycle artifacts and evidence.
- Compare original requirements to Build, Review, Test, and Ship outcomes.
- Record concrete process successes, failures, surprises, deferred work, and follow-ups.
- Write raw learning session expectations.
- Keep learning candidates tagged `propose-only`.

## Artifact Written Or Reviewed

Primary artifacts:

```text
workflow/artifacts/reflect/<slug>-v<N>.md
workflow/learnings/sessions/<YYYY-MM-DD>-<slug>.md
```

Use the Starter Block in `references/output-schema.md` to create a new reflect artifact.

## Required Upstream Artifacts

Required:

- `workflow/artifacts/briefs/<slug>-v<N>.md`
- `workflow/artifacts/plans/<slug>-v<N>.md`
- `workflow/artifacts/tasks/<slug>-v<N>.md`
- `workflow/artifacts/verify/<slug>-v<N>.md`
- `workflow/artifacts/ship/<slug>-v<N>.md`

Preferred:

- `workflow/artifacts/reviews/<slug>-v<N>.md`

Reflect may proceed when Ship is `ship` or user-accepted `hold-with-waiver`. If Ship is `hold`, Reflect must stop unless the user explicitly asks for a blocked retrospective.

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
- Full upstream lifecycle chain for the active slug (brief through ship)

**Load when the step requires it**:
- `references/exemplar.md` — before finalizing output, to validate quality
- `references/coverage-retrospective.md` — when building the manifest coverage retrospective
- `references/learning-capture.md` — when proposing learning candidates
- `references/raw-session-format.md` — when writing the raw learning session
- `references/follow-up-policy.md` — when identifying and structuring follow-up actions
- `workflow/skills/coverage-tracer/SKILL.md` — when building the Manifest Coverage Retrospective
- `workflow/skills/evidence-auditor/SKILL.md` — when confirming outcome claims cite resolvable evidence
- `workflow/skills/follow-up-owner-assigner/SKILL.md` — before finalizing Follow-Ups, to confirm every entry has an owner and is persisted to the open-items ledger

**On demand**:
- `workflow/agent-behavior.yaml` — when waiver rules or evidence policy affect the retrospective
- `workflow/config/repo-profile.yaml` — when release or source handling affects outcome
- `workflow/config/source-of-truth.yaml` — when source-of-truth outcome needs explicit status
- `workflow/config/verification.yaml` — when verification evidence or skip risk affects learning candidates
- `workflow/config/release.yaml` — when release or rollback outcome is part of the retrospective
- `workflow/config/domain.yaml` — when domain constraints affect learning candidates or follow-ups
- External PR, CI, release, deployment, or user feedback evidence — when referenced by the Ship artifact
- Existing raw learning session — only to avoid filename collision; do not rewrite prior session history
- Curated learnings — only when the user explicitly requests a curation pass

## Inputs

- Ship artifact with recommendation `ship` or accepted `hold-with-waiver`.
- Requirement Manifest IDs from the brief.
- Build completion log, Review findings, Test evidence, Ship gates, waivers, blocked handoffs, and follow-up items.
- User feedback, release outcome, or external evidence when provided.

## Refusal / Stop Conditions

Stop and ask, or return a blocked reflection, when any of these apply:

- Phase gate check exits non-zero: run `agentsmyth check --phase reflect --slug <active-slug>` at entry — stop immediately, do not proceed with a caveat.
- Ship artifact is missing.
- Ship recommendation is `hold` without user instruction to perform a blocked retrospective.
- Brief, Plan, Task, or Verify artifacts are missing and coverage cannot be reconstructed.
- Requirement coverage cannot be traced from brief through Ship.
- The user asks to edit curated learnings without explicitly requesting a curation pass.
- The reflection would require claiming external outcome, release, PR, CI, or source update without evidence.

## Workflow

1. Read the full lifecycle chain and identify active `R`, `RI`, `A`, and `Q` IDs.
2. Build the coverage retrospective for every active `R` and `RI`.
3. Capture outcome from evidence: shipped/deferred/blocked status, release/source/rollback state, and waiver state.
4. Record what worked using specific artifacts, commands, gates, decisions, or handoff patterns.
5. Record what did not work using specific friction, missing evidence, unclear source, weak phase split, blocker, or repeated manual step.
6. Record surprises, or state `none` with a reason.
7. Propose at most three durable learning candidates, each tagged `propose-only`.
8. Record follow-ups with owner, suggested artifact or ticket title, status, and whether they should start a new brief.
9. Write `workflow/artifacts/reflect/<slug>-v<N>.md`.
10. Write `workflow/learnings/sessions/<YYYY-MM-DD>-<slug>.md` as an append-only raw session.
11. Set `orchestration.status` to `done`, `next_phase: done`, and `user_checkpoint: none` when complete.

## Architecture Notes Expectations

The reflect artifact must include architecture notes when lifecycle outcomes reveal durable process, architecture, release, verification, or handoff lessons.

Use the frontmatter `architecture_notes` block when the artifact schema supports it, and mirror longer explanation in the reflect body. At minimum, capture:

- role: `Project Manager`
- decisions about what to learn, defer, or follow up
- constraints from missing evidence, waivers, release/source handoff, or review/test gaps
- tradeoffs in proposed learning candidates
- assumptions that future lifecycle runs should verify
- downstream impact on future skills, templates, config, validators, or docs

## Exit Gate

- Reflect artifact exists at `workflow/artifacts/reflect/<slug>-v<N>.md`.
- Raw learning session exists at `workflow/learnings/sessions/<YYYY-MM-DD>-<slug>.md`.
- Manifest Coverage Retrospective has one row per active `R` and `RI`.
- Outcome explicitly records release/source/rollback status or marks each not applicable.
- Learning candidates are tagged `propose-only`.
- Follow-ups have owner and suggested artifact or ticket title.
- No curated learning file is edited unless the user explicitly requested curation.
- No unsupported external outcome claims appear.
- `orchestration.phase` is `reflect`, `status` is `done`, and `next_phase` is `done` when complete.
- Manifest Coverage Retrospective is built via `coverage-tracer` with a row and citation per active R/RI.
- Outcome claims tagged as verified pass `evidence-auditor`.
- `follow-up-owner-assigner` confirms no follow-up lacks an owner, and every follow-up plus every deferred/waived R/RI is persisted to `workflow/artifacts/open-items.yaml`.

## Determinism Rules

- Reflect is evidence-based, not celebratory.
- Do not assign personal blame; critique artifacts, process, assumptions, checks, handoff, and configuration.
- Do not promote raw learning candidates into curated learnings without a separate user request.
- Do not rewrite prior raw sessions.
- Do not invent PR, release, deployment, source, or user-feedback outcomes.
- Keep candidate learnings concise, durable, and agent-actionable.

## Output

Follow `references/output-schema.md`.

The user-facing response must include the reflect artifact path, raw learning session path, candidate learnings, follow-ups, and whether curation is recommended.
