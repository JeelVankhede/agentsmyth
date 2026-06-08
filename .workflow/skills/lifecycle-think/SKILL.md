---
name: lifecycle-think
description: Architect phase that converts a request into a brief with Requirement Manifest, assumptions, questions, and architecture notes.
phase: think
role: Architect
---

# Lifecycle: Think

## Purpose

Create or update a lifecycle brief for this repository. Think clarifies intent, extracts requirements, records assumptions, identifies blockers, and prepares the chain for Plan.

Think is a discovery and framing phase. It must make the work understandable without deciding policy for the user or jumping into implementation.

## Role

Act as Architect for the lifecycle chain.

- Translate user intent and source-of-truth context into clear scope.
- Separate explicit requirements from inferred repo, domain, source, release, and verification requirements.
- Identify assumptions and open decisions early enough that Plan can proceed without hidden guesses.
- Keep the output at the "what and why" level. Plan owns sequencing; Build owns code.

## Artifact Written Or Reviewed

Primary artifact:

```text
.workflow/artifacts/briefs/<slug>-v<N>.md
```

Use `.workflow/templates/briefs/template.md` when creating or validating the brief. Do not finalize or redesign the template in this phase.

## Required Upstream Artifacts

For a new request, no upstream lifecycle artifact is required.

For resumed or revised work, load the current slug chain first through `restore-context` and preserve existing manifest IDs. Create a new version when the request materially changes scope, acceptance criteria, source-of-truth handling, release behavior, or verification expectations.

## Required Config Files

Always consider:

- `.workflow/config/agent-behavior.yaml`
- `.workflow/config/domain.yaml`
- `.workflow/config/repo-profile.yaml`
- `.workflow/config/source-of-truth.yaml`

Load `.workflow/config/verification.yaml` when acceptance criteria or expected evidence are unclear. Load `.workflow/config/release.yaml` when the request might affect deployment, publishing, rollout, external handoff, or release notes.

## Context Loading

Always load:

1. Root `AGENTS.md`.
2. `.workflow/router.md`.
3. `.workflow/lifecycle.md`.
4. `.workflow/rules.md`.
5. This skill file.
6. These references:
   - `references/role.md`
   - `references/output-schema.md`
   - `references/exemplar.md`
   - `references/requirement-discovery.md`
   - `references/assumption-policy.md`
   - `references/question-policy.md`
   - `references/architecture-notes-guide.md`

Load on demand:

- Existing artifacts for the active slug/version.
- Source-of-truth items configured in `source-of-truth.yaml` or explicitly supplied by the user.
- Repository files only when needed to derive implicit requirements, protected paths, existing contracts, generated outputs, or verification constraints.
- `.workflow/skills/decompose-requirements/SKILL.md` when the manifest needs creation or repair.
- `.workflow/skills/dispatch-subagents/SKILL.md` only when explicitly authorized exploration can be split into independent read-only topics.

## Inputs

- User request or source-of-truth item.
- Existing brief when revising a chain.
- Repo/source context needed to derive implicit requirements.
- User answers to previously recorded `Q` IDs.

## Refusal / Stop Conditions

Stop and ask, or return a blocked brief, when any of these apply:

- The source-of-truth location or authority is required but unknown.
- The domain rule, non-goal, protected path, release expectation, or verification expectation would change scope and is unclear.
- The user request conflicts with configured repo/domain constraints and no waiver is provided.
- A material decision would require inventing product policy, external tracking state, release status, commands, or ownership.
- Existing manifest IDs would need renumbering to continue in the same version.
- The request is actually orchestration across multiple repositories. Record it as out of scope unless the user explicitly narrows it to this repository.

## Workflow

1. Classify task as Trivial, Standard, or Complex.
2. Determine slug and version. Reuse the active slug where possible; bump version for material scope change.
3. Inspect available source, repo, and config context before asking questions.
4. Extract explicit requirements as `R` IDs.
5. Derive implicit requirements as `RI` IDs from repo contracts, domain config, source-of-truth expectations, compatibility, generated output, verification, release, and safety.
6. Record assumptions as `A` IDs only when proceeding is safe.
7. Record open decisions as `Q` IDs. Copy blocking `Q` IDs into `orchestration.blockers`.
8. Define concrete acceptance criteria for every active `R` and `RI`.
9. Add architecture notes covering role, decisions, constraints, tradeoffs, assumptions, and downstream impact.
10. Write or update `.workflow/artifacts/briefs/<slug>-v<N>.md`.
11. Set `orchestration.status` to `blocked-for-user` when questions remain, otherwise `ready-for-next-phase` with `next_phase: plan`.

## Architecture Notes Expectations

The brief must include architecture notes when any decision, constraint, tradeoff, assumption, or downstream impact affects Plan or later phases.

Use the frontmatter `architecture_notes` block when the artifact schema supports it, and mirror any longer explanation in the brief body. At minimum, capture:

- role: `Architect`
- decisions made during scoping
- constraints from config, source-of-truth, repo structure, or user instruction
- tradeoffs considered and rejected
- assumptions that Plan must verify or preserve
- downstream impact on Plan, Build, Review, Test, Ship, or Reflect

## Exit Gate

- Goal, scope, and non-goals are concrete.
- Requirement Manifest contains R IDs for Standard/Complex work.
- Every R/RI has testable acceptance criteria.
- Open questions are answered, deferred with owner, or listed as blockers.
- Architecture notes capture decisions and downstream impact.
- `orchestration.phase` is `think`, `orchestration.status` is accurate, and `next_phase` is `plan` when unblocked.
- The user has approved the brief or the artifact records an explicit waiver before Plan begins.

## Determinism Rules

- Do not decide product/domain policy for the user.
- Do not renumber existing R/RI/A/Q IDs after downstream artifacts exist.
- Do not hide assumptions in prose; use `A` IDs.
- Do not continue to Plan with unresolved blocking `Q` IDs unless the user accepts a waiver recorded in the brief.
- Do not implement code, run release steps, update external trackers, or claim verification in Think.
- Do not copy reference-repo domain language into canonical artifacts.

## Output

Follow `references/output-schema.md`.

The user-facing response must include the brief artifact path, manifest summary, blockers or waivers, and whether Plan may start.
