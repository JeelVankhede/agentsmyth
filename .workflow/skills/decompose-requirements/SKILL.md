---
name: decompose-requirements
description: Power skill for creating or backfilling Requirement Manifest entries with stable R, RI, A, and Q IDs.
---

# Decompose Requirements

## Purpose

Create or repair the Requirement Manifest for a lifecycle brief without hiding assumptions, renumbering existing IDs, or turning implementation details into requirements.

This is a power skill, not a lifecycle phase. It supports Think and later repair/backfill work, but the Think phase owns the full brief artifact and approval checkpoint.

## Invocation Context

Use this skill when:

- a new Standard or Complex request needs a Requirement Manifest
- an existing brief lacks `R`, `RI`, `A`, or `Q` structure
- downstream artifacts need manifest IDs backfilled without renumbering
- a user answer resolves or changes manifest questions
- Review/Test/Ship finds missing requirement traceability

Do not invoke it for Trivial work unless the user explicitly requests a manifest.

## Context Loading

Always load:

1. Root `AGENTS.md`.
2. `.workflow/router.md`.
3. `.workflow/lifecycle.md`.
4. `.workflow/rules.md`.
5. This skill file.
6. These references:
   - `references/decision-tree.md`
   - `references/explicit-requirements.md`
   - `references/implicit-requirements-library.md`
   - `references/assumptions-and-questions.md`
   - `references/manifest-format.md`
   - `references/output-schema.md`

Load on demand:

- `.workflow/skills/lifecycle-think/SKILL.md` and Think references when writing into a brief.
- Existing brief artifact at `.workflow/artifacts/briefs/<slug>-v<N>.md`.
- `.workflow/config/domain.yaml`, `.workflow/config/repo-profile.yaml`, `.workflow/config/source-of-truth.yaml`, `.workflow/config/verification.yaml`, and `.workflow/config/release.yaml` when implicit requirements may come from those contracts.
- Target repo files only when repo truth is needed to derive implicit requirements.

## Inputs

- User request and follow-up corrections.
- Slug/version when known.
- Existing brief, if backfilling or revising.
- Existing `R`, `RI`, `A`, and `Q` IDs.
- Config, source-of-truth, verification, release, and target repo context when relevant.

## Refusal / Stop Conditions

Stop or return a proposed manifest instead of editing when:

- no brief path is available and the caller did not ask for a proposed manifest
- existing IDs would need renumbering to satisfy the request
- the request is a material scope change that should create a new version
- a high-impact implicit requirement cannot be classified from available context
- a user asks to hide, merge away, or silently delete existing requirements referenced downstream
- the requested item is code-level implementation detail better owned by Plan or Build

## Workflow

1. Determine mode: create, backfill, merge, update answered questions, or no-op.
2. Preserve all existing IDs and downstream references.
3. Extract explicit user requirements as `R` IDs.
4. Derive implicit requirements as `RI` IDs from repo, domain, source-of-truth, verification, release, compatibility, generated-output, safety, and lifecycle context.
5. Add acceptance criteria to every active `R` and `RI`.
6. Record assumptions as `A` IDs only when proceeding is safe.
7. Record open questions as `Q` IDs when user/source/owner authority is needed.
8. Assign owners to unresolved `Q` IDs when known.
9. Update `Questions For User` and `orchestration.blockers` for unresolved blocking `Q` IDs.
10. Return the manifest patch and summary, or update the brief when the caller explicitly requested an in-place backfill.

## Exit Gate

- Every explicit requirement appears as an `R`.
- Every relevant implicit requirement appears as an `RI` or is intentionally marked not applicable.
- Every active `R` and `RI` has at least one acceptance criterion.
- Existing IDs are preserved.
- Assumptions and questions are explicit.
- Blocking `Q` IDs are mirrored in `Questions For User` and `orchestration.blockers`.
- No separate manifest file is created.

## Determinism Rules

- Use ID classes exactly: `R`, `RI`, `A`, `Q`.
- Append new IDs after the highest existing ID in that class.
- Do not renumber existing IDs.
- Do not hide assumptions in prose.
- Do not invent external links, ticket IDs, releases, PRs, commands, or source updates.
- Do not proceed to Plan with blocking `Q` IDs unless the user accepts a waiver recorded by the caller.

## Output Contract

Follow `references/output-schema.md`.

Return the mode, brief path or proposed target, added/updated/stable IDs, blockers, assumptions needing confirmation, manifest patch, frontmatter blocker patch when needed, and concise summary.

## Output

Same as Output Contract.
