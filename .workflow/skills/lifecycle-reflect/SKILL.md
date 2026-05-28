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
.workflow/artifacts/reflect/<slug>-v<N>.md
.workflow/learnings/sessions/<YYYY-MM-DD>-<slug>.md
```

Use `.workflow/templates/reflect/template.md` when creating or validating the reflect artifact. Do not finalize or redesign the template in this phase.

## Required Upstream Artifacts

Required:

- `.workflow/artifacts/briefs/<slug>-v<N>.md`
- `.workflow/artifacts/plans/<slug>-v<N>.md`
- `.workflow/artifacts/tasks/<slug>-v<N>.md`
- `.workflow/artifacts/verify/<slug>-v<N>.md`
- `.workflow/artifacts/ship/<slug>-v<N>.md`

Preferred:

- `.workflow/artifacts/reviews/<slug>-v<N>.md`

Reflect may proceed when Ship is `ship` or user-accepted `hold-with-waiver`. If Ship is `hold`, Reflect must stop unless the user explicitly asks for a blocked retrospective.

## Required Config Files

Always load or inspect:

- `.workflow/config/agent-behavior.yaml`
- `.workflow/config/repo-profile.yaml`
- `.workflow/config/source-of-truth.yaml`
- `.workflow/config/verification.yaml`
- `.workflow/config/release.yaml`

Load `.workflow/config/domain.yaml` when domain constraints affect learning candidates or follow-ups.

## Context Loading

Always load:

1. Root `AGENTS.md`.
2. `.workflow/router.md`.
3. `.workflow/lifecycle.md`.
4. `.workflow/rules.md`.
5. This skill file.
6. Full upstream lifecycle chain for the slug.
7. These references:
   - `references/role.md`
   - `references/output-schema.md`
   - `references/exemplar.md`
   - `references/coverage-retrospective.md`
   - `references/learning-capture.md`
   - `references/raw-session-format.md`
   - `references/follow-up-policy.md`

Load on demand:

- External PR, CI, release, deployment, source-of-truth, or user feedback evidence referenced by Ship.
- Existing raw learning session only to avoid filename collision; do not rewrite prior session history.
- Curated learnings only when the user explicitly asks for curation.

## Inputs

- Ship artifact with recommendation `ship` or accepted `hold-with-waiver`.
- Requirement Manifest IDs from the brief.
- Build completion log, Review findings, Test evidence, Ship gates, waivers, blocked handoffs, and follow-up items.
- User feedback, release outcome, or external evidence when provided.

## Refusal / Stop Conditions

Stop and ask, or return a blocked reflection, when any of these apply:

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
9. Write `.workflow/artifacts/reflect/<slug>-v<N>.md`.
10. Write `.workflow/learnings/sessions/<YYYY-MM-DD>-<slug>.md` as an append-only raw session.
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

- Reflect artifact exists at `.workflow/artifacts/reflect/<slug>-v<N>.md`.
- Raw learning session exists at `.workflow/learnings/sessions/<YYYY-MM-DD>-<slug>.md`.
- Manifest Coverage Retrospective has one row per active `R` and `RI`.
- Outcome explicitly records release/source/rollback status or marks each not applicable.
- Learning candidates are tagged `propose-only`.
- Follow-ups have owner and suggested artifact or ticket title.
- No curated learning file is edited unless the user explicitly requested curation.
- No unsupported external outcome claims appear.
- `orchestration.phase` is `reflect`, `status` is `done`, and `next_phase` is `done` when complete.

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
