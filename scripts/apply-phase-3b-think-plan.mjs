#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const write = (path, body) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${body.trim()}\n`, 'utf8');
};

const skill = (name, description, body) => `---\nname: ${name}\ndescription: ${description}\n---\n\n# ${name}\n\n${body}`;

write('.workflow/skills/lifecycle-think/SKILL.md', skill('lifecycle-think', 'Architect phase that converts a request into a brief with Requirement Manifest, assumptions, questions, and architecture notes.', `## Purpose

Create or update a lifecycle brief for one target repository. Think clarifies intent, extracts requirements, records assumptions, identifies blockers, and prepares the chain for Plan.

## Context Loading

Always load root \`AGENTS.md\`, \`.workflow/router.md\`, \`.workflow/lifecycle.md\`, \`.workflow/rules.md\`, this skill, and these references: \`role.md\`, \`output-schema.md\`, \`requirement-discovery.md\`, \`assumption-policy.md\`, \`question-policy.md\`, and \`architecture-notes-guide.md\`.

Load \`.workflow/config/domain.yaml\`, \`repo-profile.yaml\`, and \`source-of-truth.yaml\` when domain rules, repo contracts, or external source context may affect requirements.

## Inputs

- User request or source-of-truth item.
- Existing brief when revising a chain.
- Repo/source context needed to derive implicit requirements.

## Workflow

1. Classify task as Trivial, Standard, or Complex.
2. Create or preserve a stable slug/version.
3. Extract explicit requirements as R IDs.
4. Derive implicit repo/domain requirements as RI IDs.
5. Record assumptions as A IDs instead of hiding guesses.
6. Record open questions as Q IDs and blockers when answers affect scope, safety, verification, or source-of-truth updates.
7. Add architecture notes covering role, decisions, constraints, tradeoffs, assumptions, and downstream impact.
8. Write \`.workflow/artifacts/briefs/<slug>-v<N>.md\` using \`.workflow/templates/briefs/template.md\`.

## Stop Conditions

Stop when acceptance criteria, source-of-truth, domain constraints, release relevance, verification expectations, or protected paths are unclear.

## Exit Gate

- Goal, scope, and non-goals are concrete.
- Requirement Manifest contains R IDs for Standard/Complex work.
- Every R/RI has testable acceptance criteria.
- Open questions are answered, deferred with owner, or listed as blockers.
- Architecture notes capture decisions and downstream impact.

## Determinism Rules

Do not decide product/domain policy for the user. Do not renumber existing R/RI IDs. Do not continue to Plan with unresolved blocking Q IDs unless the user accepts a waiver.

## Output

A brief artifact path, manifest summary, blockers if any, and whether Plan may start.`));

write('.workflow/skills/lifecycle-plan/SKILL.md', skill('lifecycle-plan', 'Principal Engineer phase that turns an approved brief into a requirement-mapped execution plan for one target repository.', `## Purpose

Convert an approved brief into an implementation plan that maps every R/RI to phases, risks, verification evidence, branch strategy, and source-of-truth handling.

## Context Loading

Always load root \`AGENTS.md\`, orchestrator references, this skill, \`.workflow/config/repo-profile.yaml\`, \`.workflow/config/verification.yaml\`, \`.workflow/config/source-of-truth.yaml\`, and these references: \`role.md\`, \`output-schema.md\`, \`repo-impact-map.md\`, \`dependency-ordering.md\`, \`risk-register.md\`, \`verification-planning.md\`, \`branch-policy.md\`, and \`source-of-truth-planning.md\`.

Load \`release.yaml\` when release, deployment, package publishing, docs publishing, or rollout is possible.

## Inputs

- Approved brief artifact.
- Requirement Manifest R/RI/A/Q IDs.
- Repo/profile/config/source-of-truth context.

## Workflow

1. Verify the brief exists and is approved or explicitly waived.
2. Map every active R/RI to one or more plan phases.
3. Identify affected repo surfaces, public contracts, generated output, protected paths, and documentation/source updates.
4. Define branch and commit strategy for the single target repo.
5. Order phases by dependency and risk.
6. Build a verification plan from \`verification.yaml\`.
7. Record source-of-truth read/update/handoff strategy.
8. Record architecture notes with decisions, constraints, tradeoffs, assumptions, and downstream impact.
9. Write \`.workflow/artifacts/plans/<slug>-v<N>.md\` using \`.workflow/templates/plans/template.md\`.

## Stop Conditions

Stop when any R/RI lacks a phase, acceptance criteria are not verifiable, branch/release/source-of-truth policy is unclear, or required commands are unknown.

## Exit Gate

- Every R/RI is mapped to a phase.
- Every phase has a binary exit gate.
- Dependency order is explicit.
- Risks have mitigation.
- Verification plan covers every R/RI.
- Source-of-truth and release handling are explicit.
- User approved the plan or accepted a waiver.

## Determinism Rules

Do not prescribe code bodies in Plan. Do not invent commands, releases, PRs, or external updates. Keep the plan single-repo.

## Output

A plan artifact path, phase summary, blockers if any, and whether Build may start.`));

const refs = {
  '.workflow/skills/lifecycle-think/references/role.md': '# Role\n\nThink acts as Architect. It clarifies intent, separates explicit requirements from inferred repo/domain requirements, records assumptions, and blocks when user authority is needed. It does not implement code or decide product policy.',
  '.workflow/skills/lifecycle-think/references/output-schema.md': '# Output Schema\n\nThink writes `.workflow/artifacts/briefs/<slug>-v<N>.md` with source links, problem, goals, non-goals, requirements, constraints, risks, Requirement Manifest, questions for user, architecture notes, and exit gate.',
  '.workflow/skills/lifecycle-think/references/exemplar.md': '# Exemplar\n\nUse a concise brief where each R/RI has acceptance criteria. Questions are listed as Q IDs and copied into `orchestration.blockers` when blocking.',
  '.workflow/skills/lifecycle-think/references/requirement-discovery.md': '# Requirement Discovery\n\nR IDs come from explicit user asks. RI IDs come from repo contracts, domain config, source-of-truth constraints, compatibility, generated output, verification, release, and safety requirements. A IDs are assumptions. Q IDs are unresolved decisions.',
  '.workflow/skills/lifecycle-think/references/assumption-policy.md': '# Assumption Policy\n\nUse assumptions only when work can proceed safely. If an assumption changes scope, source-of-truth, release behavior, verification, protected paths, or user intent, create a Q blocker instead.',
  '.workflow/skills/lifecycle-think/references/question-policy.md': '# Question Policy\n\nAsk only questions that materially change scope, safety, verification, release, source-of-truth, or implementation direction. Assign each open question a Q ID and blocker status.',
  '.workflow/skills/lifecycle-think/references/architecture-notes-guide.md': '# Architecture Notes Guide\n\nArchitecture notes must include role, decisions, constraints, tradeoffs, assumptions, and downstream impact. Keep them actionable for Plan.',
  '.workflow/skills/lifecycle-plan/references/role.md': '# Role\n\nPlan acts as Principal Engineer. It turns the brief into sequenced implementation phases, risk controls, verification strategy, source-of-truth handling, and branch policy.',
  '.workflow/skills/lifecycle-plan/references/output-schema.md': '# Output Schema\n\nPlan writes `.workflow/artifacts/plans/<slug>-v<N>.md` with summary, inputs, requirement coverage, repo impact map, source-of-truth strategy, approach, phases, dependency order, branch strategy, risk register, verification plan, architecture notes, questions, and exit gate.',
  '.workflow/skills/lifecycle-plan/references/exemplar.md': '# Exemplar\n\nA good plan maps each R/RI to a phase and verification method, keeps code-level details out, and names blockers instead of guessing.',
  '.workflow/skills/lifecycle-plan/references/repo-impact-map.md': '# Repo Impact Map\n\nSingle-repo impact map should identify paths/surfaces, change type, manifest IDs, public contracts, generated output, protected paths, and dependencies.',
  '.workflow/skills/lifecycle-plan/references/dependency-ordering.md': '# Dependency Ordering\n\nOrder by source-of-truth alignment, contracts, implementation, generated output, tests, docs, release/handoff. Do risky or contract-setting work before dependent edits.',
  '.workflow/skills/lifecycle-plan/references/risk-register.md': '# Risk Register\n\nRecord risk, likelihood, impact, mitigation, owner, and affected R/RI. Risks without mitigation should block approval or require waiver.',
  '.workflow/skills/lifecycle-plan/references/verification-planning.md': '# Verification Planning\n\nEvery R/RI needs evidence: command, manual QA, review, generated-output check, source-of-truth check, or explicit waiver. Use `.workflow/config/verification.yaml`.',
  '.workflow/skills/lifecycle-plan/references/branch-policy.md': '# Branch Policy\n\nUse a non-default branch for planned changes unless the user explicitly approves otherwise. Preserve unrelated changes and record dirty state before Build.',
  '.workflow/skills/lifecycle-plan/references/source-of-truth-planning.md': '# Source Of Truth Planning\n\nRead `.workflow/config/source-of-truth.yaml`. If source updates are required but unavailable, plan a blocked handoff or approval checkpoint.'
};

for (const [path, body] of Object.entries(refs)) write(path, body);

console.log('Phase 3B Think/Plan skill contracts generated.');
console.log('Review, then commit generated files as one local commit.');
