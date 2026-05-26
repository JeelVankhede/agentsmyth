# Migration From Reference Workspace

## Source

- Reference repository: `JeelVankhede/ai-recipes-workspace`
- Target repository: `JeelVankhede/agentsmyth`
- Target install folder: `.workflow/`

## Target Product Definition

`agentsmyth` is a generic, single-repo AI lifecycle workflow template. It extracts the lifecycle orchestration contract from the reference workspace and rewrites it into a neutral `.workflow/` system that any target repo can configure through YAML, markdown templates, skill playbooks, validators, and optional adapter wrappers.

## Scope

Phase 1 is an extraction and migration matrix only.

This phase does not scaffold `.workflow/`, rewrite skills, add validators, or create adapters. It classifies known markdown/control surfaces from the reference repo and defines how each should move into `agentsmyth`.

## Non-Goals

- No workspace-based workflow.
- No `repos/` child repo model.
- No Codex-only behavior.
- No AI Recipes domain vocabulary in canonical workflow files.
- No Notion-only source-of-truth assumption.
- No package-release assumption.
- No implementation scaffolding before this matrix is reviewed.

## Inventory Method

The GitHub connector was used to inspect known lifecycle files and known paths from the reference repository.

Current limitation: the connector did not expose a full private repository tree/archive, so this matrix must be completed from a local clone before implementation using:

```bash
find . -name "*.md" -not -path "./.git/*" | sort
```

This file is the Phase 1 core lifecycle extraction matrix, not the final exhaustive inventory.

## Core Concepts Preserved

- Seven-phase lifecycle: Think, Plan, Build, Review, Test, Ship, Reflect.
- One skill/playbook per lifecycle phase.
- One orchestrator entrypoint.
- Requirement Manifest with `R`, `RI`, `A`, and `Q` IDs.
- YAML frontmatter on lifecycle artifacts.
- Pause/resume orchestration state.
- Exit gates per phase.
- Deterministic output schemas.
- Artifact templates.
- Restore-context behavior.
- Subagent dispatch policy.
- Raw and curated learnings.
- Validator-driven lifecycle checks.
- Architecture/role notes in generated artifacts.

## Concepts Removed Or Generalized

- Workspace root as the control plane.
- Multi-repo `repos/` child repository model.
- AI Recipes product/domain vocabulary.
- Codex-only execution language.
- Notion as a required source of truth.
- Hardcoded frontend/backend/engineering repo roles.
- Hardcoded npm/package checks.
- Hardcoded package release flow.
- Parent/child Git boundary.

## File Classification Matrix

| Source path | Classification | Target path | Action | Knowledge to preserve | Domain/workspace assumptions to strip | Notes |
|---|---|---|---|---|---|---|
| `README.md` | workspace-specific / overview | `README.md` | Rewrite | Purpose and layout clarity | Workspace control surface, `repos/`, child repo clone commands | Use as inspiration only; `agentsmyth` README explains single-repo template usage. |
| `AGENTS.md` | workflow-core | `AGENTS.md`, `.workflow/router.md`, `.workflow/rules.md` | Rewrite | Router, lifecycle phases, task classes, artifact contract, manifest IDs, pause/resume, power skills, validation rules | Codex-only, workspace root, repo roles, `docs/` artifact root, Notion mandate, multi-repo Git boundary | Highest-value source file. |
| `.agents/README.md` | workflow-core | `.workflow/README.md`, `.workflow/skills/README.md` | Rewrite | Entrypoint, skill list, playbook grouping, learnings model | Product repos under `repos/`, Codex-only wording | Keep concise. |
| `.agents/learnings.md` | learning-core | `.workflow/learnings/curated.md` | Review/rewrite if neutral | Durable process learnings | AI Recipes-specific learnings | Only migrate neutral, repeatedly useful rules. |
| `.agents/learnings/sessions/*.md` | historical-artifact | none by default | Do not migrate | Optional evidence for learning design | Project-specific history | Keep source-only unless a session contains a generic pattern worth rewriting. |
| `docs/knowledge-map/workspace-mental-map.md` | workflow-core + domain-specific | `docs/lifecycle-contract.md`, `.workflow/lifecycle.md`, `.workflow/rules.md` | Rewrite | Source priority, lazy loading, delivery order, verification defaults, planning rules, release expectations, reflection expectations | Workspace root, three repo roles, AI Recipes product delivery order, hardcoded commands | Convert into generic single-repo mental model. |
| `docs/knowledge-map/ai-recipes-lifecycle-source-map.md` | migration-reference | `docs/migration-from-reference-workspace.md` | Rewrite | Kept/changed/dropped concepts, provenance of lifecycle extraction | AI Recipes-specific adaptation details except as historical notes | Conceptual base for this migration file. |
| `docs/product/*.md` | domain-specific | `examples/*` or none | Do not migrate to core | Possible source-of-truth example shape | AI Recipes product details | Only sanitized examples if needed. |
| `docs/briefs/template.md` | artifact-template | `.workflow/templates/briefs/template.md` | Rewrite | Brief frontmatter, source links, problem/goals/non-goals, requirements, risks, questions, Requirement Manifest, exit gate, architect notes | `docs/product`, Notion/GitHub defaults as required, old artifact path | Add `architecture_notes` contract. |
| `docs/briefs/*-v*.md` | historical-artifact | none by default | Do not migrate | Real artifact examples | AI Recipes history | May be sanitized into examples later. |
| `docs/plans/template.md` | artifact-template | `.workflow/templates/plans/template.md` | Rewrite | Summary, inputs, approach, phases, dependency order, risk register, verification plan, open questions, exit gate | Fixed multi-repo impact map, repo-specific branch table, AI Recipes release/tracking assumptions | Replace with single-repo impact map and configurable source-of-truth strategy. |
| `docs/plans/*-v*.md` | historical-artifact | none by default | Do not migrate | Real plan examples | AI Recipes implementation history | Optional sanitized examples only. |
| `docs/tasks/template.md` | artifact-template | `.workflow/templates/tasks/template.md` | Rewrite | Branch/status evidence, changed files, verification, dispatch log, phase completion log | Engineering/frontend/backend sections, `repos/<repo>` paths | Replace repo sections with generic target repo sections. |
| `docs/tasks/*-v*.md` | historical-artifact | none by default | Do not migrate | Real task artifact examples | AI Recipes implementation history | Optional sanitized examples only. |
| `docs/verify/template.md` | artifact-template | `.workflow/templates/verify/template.md` | Rewrite | Inputs, automated checks, manifest coverage, manual QA, findings, skipped checks, sign-off | Workspace validator path, npm/check:dist defaults | Pull commands from `.workflow/config/verification.yaml`. |
| `docs/verify/*-v*.md` | historical-artifact | none by default | Do not migrate | Verification examples | AI Recipes historical evidence | Keep out of core. |
| `docs/verify/evidence/**` | evidence-only / adapter-reference | `examples/*` or `adapters/*` selectively | Inspect later | Adapter output examples, generated instruction patterns | Concrete generated product output | Do not treat as canonical. |
| `docs/ship/template.md` | artifact-template | `.workflow/templates/ship/template.md` | Rewrite | Ship/hold/hold-with-waiver, requirement coverage, PR readiness, release checks, tracking, rollback, blocked handoff, exit gate | Engineering repo versioning, CLI release checks, Notion-specific table, frontend/backend package assumptions | Generalize around `.workflow/config/release.yaml` and source-of-truth config. |
| `docs/ship/*-v*.md` | historical-artifact | none by default | Do not migrate | Ship artifact examples | AI Recipes release history | Optional sanitized example later. |
| `docs/reflect/template.md` | artifact-template | `.workflow/templates/reflect/template.md` | Rewrite | Outcome, what worked/did not work, surprises, manifest retrospective, deferred items, learning candidates, follow-ups, raw session entry, exit gate | Notion/tracking-specific language | Keep learning candidate discipline. |
| `docs/reflect/*-v*.md` | historical-artifact | none by default | Do not migrate | Reflection examples | Project history | Optional sanitized example later. |
| `.agents/skills/lifecycle-orchestrator/SKILL.md` | skill-playbook | `.workflow/skills/lifecycle-orchestrator/SKILL.md` | Rewrite | Start/resume, phase order, stop conditions, continue conditions, output contract | Codex-only, AI Recipes, `.agents/`, `docs/`, product repo wording | Orchestrator owns routing only, not a phase artifact. |
| `.agents/skills/lifecycle-think/SKILL.md` | skill-playbook | `.workflow/skills/lifecycle-think/SKILL.md` | Rewrite | Architect role, task classification, slug/version, context inspection, Requirement Manifest, assumptions/questions, exit gate | AI Recipes language, product repo references, Notion specificity | Must load `.workflow/config/*.yaml`. |
| `.agents/skills/lifecycle-plan/SKILL.md` | skill-playbook | `.workflow/skills/lifecycle-plan/SKILL.md` | Rewrite | Principal Engineer role, phase decomposition, dependency order, branch/tracking strategy, risk register, verification plan, exit gate | Multi-repo matrix, AI Recipes repo names, Notion mandate | Single target repo only. |
| `.agents/skills/lifecycle-build/SKILL.md` | skill-playbook | `.workflow/skills/lifecycle-build/SKILL.md` | Rewrite | One plan phase at a time, git status before edits, branch safety, task artifact, scoped implementation, command evidence | Child repo `git -C`, workspace-specific paths | Use target repo root directly. |
| `.agents/skills/lifecycle-review/SKILL.md` | skill-playbook | `.workflow/skills/lifecycle-review/SKILL.md` | Rewrite + strengthen | Severity findings, requirement coverage, risk categories, verification reviewed, residual risk, recommendation | No-file-by-default behavior, AI Recipes risk surfaces | Review must write `.workflow/artifacts/reviews/<slug>-v<N>.md`. |
| `.agents/skills/lifecycle-test/SKILL.md` | skill-playbook | `.workflow/skills/lifecycle-test/SKILL.md` | Rewrite | Coverage matrix, configured checks, generated output verification, skipped checks as risk, sign-off | Hardcoded workspace and npm checks | Pull command list from verification config. |
| `.agents/skills/lifecycle-ship/SKILL.md` | skill-playbook | `.workflow/skills/lifecycle-ship/SKILL.md` | Rewrite | Release gates, ship/hold/waiver, PR/CI readiness, rollback, source-of-truth handoff, blocked handoff | Engineering/Fare/Bare/CLI/Notion specifics | Generic source-of-truth and release config only. |
| `.agents/skills/lifecycle-reflect/SKILL.md` | skill-playbook | `.workflow/skills/lifecycle-reflect/SKILL.md` | Rewrite | Outcome retrospective, coverage retrospective, learning candidates, follow-ups, raw session | AI Recipes release/tracking specifics | Keep systemic, non-blame retrospective. |
| `.agents/skills/decompose-requirements/SKILL.md` | power-skill | `.workflow/skills/decompose-requirements/SKILL.md` | Rewrite | R/RI/A/Q IDs, acceptance criteria, no renumbering, manifest backfill, blockers | AI Recipes brief language | Reference generic domain config for implicit requirements. |
| `.agents/skills/restore-context/SKILL.md` | power-skill | `.workflow/skills/restore-context/SKILL.md` | Rewrite | Resolve slug/version, walk artifact chain, parse orchestration state, check coverage, inspect git, recommend next action | Parent/child repo status, workspace path | Single target repo status only. |
| `.agents/skills/dispatch-subagents/SKILL.md` | power-skill | `.workflow/skills/dispatch-subagents/SKILL.md` | Rewrite | Explicit authorization, phase caps, independence rules, dispatch logging, parent owns merge | Codex-specific terms where unnecessary | Keep generic agent/delegation language. |
| `scripts/check-lifecycle.mjs` | validator | `.workflow/validators/check-lifecycle.mjs` | Rewrite | Lifecycle artifact validation concept | Workspace artifact paths, AI Recipes assumptions | Add `.workflow/artifacts` awareness. |
| `scripts/workspace-status.mjs` | workspace-specific script | none | Remove | None for v1 | Parent/child repo status | Not applicable to single repo. |

## Skill Reference Matrix

Every lifecycle phase must include reference files. Some source reference files exist in the current repo; others should be created in `agentsmyth` because the generic version needs stricter reusable contracts.

| Skill | Reference file | Action | Purpose |
|---|---|---|---|
| `lifecycle-orchestrator` | `phase-routing.md` | Create/rewrite | Defines lifecycle routing. |
| `lifecycle-orchestrator` | `pause-resume-rules.md` | Create/rewrite | Defines blocker, checkpoint, resume behavior. |
| `lifecycle-orchestrator` | `blocker-policy.md` | Create | Defines when to stop instead of guessing. |
| `lifecycle-orchestrator` | `lifecycle-state-machine.md` | Create | Defines allowed phase/status transitions. |
| `lifecycle-orchestrator` | `output-contract.md` | Create/rewrite | Defines paused vs advanced response contract. |
| `lifecycle-think` | `role.md` | Rewrite | Architect role behavior. |
| `lifecycle-think` | `output-schema.md` | Rewrite | Exact brief output structure. |
| `lifecycle-think` | `exemplar.md` | Rewrite/sanitize | Good generic brief example. |
| `lifecycle-think` | `requirement-discovery.md` | Create/rewrite | How to discover R/RI/A/Q. |
| `lifecycle-think` | `assumption-policy.md` | Create | How assumptions are recorded and confirmed. |
| `lifecycle-think` | `question-policy.md` | Create | How user questions become blockers. |
| `lifecycle-think` | `architecture-notes-guide.md` | Create | How Architect Notes are written. |
| `lifecycle-plan` | `role.md` | Rewrite | Principal Engineer role behavior. |
| `lifecycle-plan` | `output-schema.md` | Rewrite | Exact plan structure. |
| `lifecycle-plan` | `exemplar.md` | Rewrite/sanitize | Good generic plan example. |
| `lifecycle-plan` | `repo-impact-map.md` | Rewrite | Single-repo impact mapping. |
| `lifecycle-plan` | `dependency-ordering.md` | Rewrite | Sequencing guidance. |
| `lifecycle-plan` | `risk-register.md` | Rewrite | Risk table standards. |
| `lifecycle-plan` | `verification-planning.md` | Rewrite | Mapping R/RI to checks/evidence. |
| `lifecycle-plan` | `branch-policy.md` | Rewrite | Single-repo branch/commit rules. |
| `lifecycle-plan` | `source-of-truth-planning.md` | Create | How plans handle markdown/Notion/GitHub/Jira/etc. |
| `lifecycle-build` | `role.md` | Rewrite | Senior Engineer role behavior. |
| `lifecycle-build` | `output-schema.md` | Rewrite | Exact task artifact structure. |
| `lifecycle-build` | `exemplar.md` | Rewrite/sanitize | Good generic task example. |
| `lifecycle-build` | `phase-execution-policy.md` | Create/rewrite | One phase at a time rules. |
| `lifecycle-build` | `scope-control.md` | Rewrite | No silent scope expansion. |
| `lifecycle-build` | `change-safety.md` | Rewrite | How to preserve unrelated changes. |
| `lifecycle-build` | `git-status-policy.md` | Rewrite | Required git status checks. |
| `lifecycle-build` | `unrelated-changes-policy.md` | Rewrite | What to do with dirty files. |
| `lifecycle-build` | `verification-recording.md` | Rewrite | How commands/results are recorded. |
| `lifecycle-review` | `role.md` | Rewrite | Staff Reviewer role behavior. |
| `lifecycle-review` | `output-schema.md` | Rewrite | Exact review artifact structure. |
| `lifecycle-review` | `exemplar.md` | Rewrite/sanitize | Good generic review example. |
| `lifecycle-review` | `severity-model.md` | Rewrite | P0/P1/P2/P3 definitions. |
| `lifecycle-review` | `requirement-coverage.md` | Rewrite | Coverage status rules. |
| `lifecycle-review` | `review-risk-categories.md` | Rewrite | Generic risk categories. |
| `lifecycle-review` | `generated-output-review.md` | Create | Optional generated output contract review. |
| `lifecycle-review` | `source-of-truth-review.md` | Create | Ensure changes align with configured truth source. |
| `lifecycle-review` | `verification-review.md` | Create | Review check evidence, not claims. |
| `lifecycle-test` | `role.md` | Rewrite | Senior QA role behavior. |
| `lifecycle-test` | `output-schema.md` | Rewrite | Exact verify artifact structure. |
| `lifecycle-test` | `exemplar.md` | Rewrite/sanitize | Good generic verify example. |
| `lifecycle-test` | `verification-matrix.md` | Rewrite | R/RI coverage matrix rules. |
| `lifecycle-test` | `command-evidence-policy.md` | Rewrite | Commands must have exact output/status. |
| `lifecycle-test` | `manual-qa-policy.md` | Rewrite | Manual QA evidence format. |
| `lifecycle-test` | `skipped-check-policy.md` | Rewrite | Skipped checks are risk, not pass. |
| `lifecycle-test` | `generated-output-verification.md` | Create | Optional generated output verification. |
| `lifecycle-ship` | `role.md` | Rewrite | Senior DevOps/release role behavior. |
| `lifecycle-ship` | `output-schema.md` | Rewrite | Exact ship artifact structure. |
| `lifecycle-ship` | `exemplar.md` | Rewrite/sanitize | Good generic ship example. |
| `lifecycle-ship` | `release-gates.md` | Rewrite | Generic ship gates from release config. |
| `lifecycle-ship` | `source-of-truth-handoff.md` | Rewrite | Markdown/Notion/GitHub/Jira/etc. handoff. |
| `lifecycle-ship` | `waiver-policy.md` | Rewrite | `hold-with-waiver` requirements. |
| `lifecycle-ship` | `rollback-policy.md` | Rewrite | Rollback format. |
| `lifecycle-ship` | `pr-ci-policy.md` | Rewrite | Optional PR/CI readiness, not mandatory. |
| `lifecycle-ship` | `blocked-handoff-format.md` | Rewrite | Copy-ready blocked handoff structure. |
| `lifecycle-reflect` | `role.md` | Rewrite | Project Manager/retro role behavior. |
| `lifecycle-reflect` | `output-schema.md` | Rewrite | Exact reflect artifact structure. |
| `lifecycle-reflect` | `exemplar.md` | Rewrite/sanitize | Good generic reflect example. |
| `lifecycle-reflect` | `coverage-retrospective.md` | Rewrite | Retrospective per R/RI. |
| `lifecycle-reflect` | `learning-capture.md` | Rewrite | Candidate learning rules. |
| `lifecycle-reflect` | `raw-session-format.md` | Rewrite | Raw session format. |
| `lifecycle-reflect` | `follow-up-policy.md` | Rewrite | Follow-up owner/artifact/ticket format. |
| `decompose-requirements` | `decision-tree.md` | Rewrite | Decide explicit vs implicit vs assumption vs question. |
| `decompose-requirements` | `explicit-requirements.md` | Create | Parse user-stated requirements. |
| `decompose-requirements` | `implicit-requirements-library.md` | Rewrite | Generic repo/domain implicit requirements. |
| `decompose-requirements` | `assumptions-and-questions.md` | Create | How to avoid hallucinating decisions. |
| `decompose-requirements` | `manifest-format.md` | Rewrite | R/RI/A/Q formatting. |
| `decompose-requirements` | `output-schema.md` | Rewrite | Power-skill output contract. |
| `restore-context` | `chain-walker.md` | Rewrite | Artifact chain walking rules. |
| `restore-context` | `artifact-reader.md` | Create | Artifact parsing rules. |
| `restore-context` | `git-walker.md` | Rewrite | Single-repo git status rules. |
| `restore-context` | `source-of-truth-reader.md` | Create | Read configured source-of-truth references. |
| `restore-context` | `blocker-reader.md` | Create | Parse unresolved blockers. |
| `restore-context` | `summary-format.md` | Rewrite | Resume summary format. |
| `restore-context` | `output-schema.md` | Rewrite | Restore output contract. |
| `dispatch-subagents` | `decision-tree-by-phase.md` | Rewrite | When dispatch is allowed. |
| `dispatch-subagents` | `independence-rules.md` | Rewrite | Disjoint work rules. |
| `dispatch-subagents` | `phase-caps.md` | Rewrite | Generic phase caps. |
| `dispatch-subagents` | `worker-ownership-format.md` | Create | Worker prompt ownership contract. |
| `dispatch-subagents` | `logging-format.md` | Rewrite | Dispatch log table. |
| `dispatch-subagents` | `output-schema.md` | Rewrite | Dispatch output contract. |

## Artifact Template Matrix

| Artifact | Target template | Target artifact output | Required sections |
|---|---|---|---|
| Brief | `.workflow/templates/briefs/template.md` | `.workflow/artifacts/briefs/<slug>-v<N>.md` | Frontmatter, Source Links, Problem, Goals, Non-Goals, User Impact, Success Metrics, Requirements, Constraints, Risks, Open Questions, Requirement Manifest, Questions For User, Architecture Notes, Exit Gate |
| Plan | `.workflow/templates/plans/template.md` | `.workflow/artifacts/plans/<slug>-v<N>.md` | Frontmatter, Summary, Inputs, Requirement Coverage, Repo Impact Map, Source-of-Truth Strategy, Approach, Phases, Dependency Order, Risk Register, Verification Plan, Architecture Notes, Open Questions, Exit Gate |
| Tasks | `.workflow/templates/tasks/template.md` | `.workflow/artifacts/tasks/<slug>-v<N>.md` | Frontmatter, Active Phase, Branch/Repo Status, Scope, Changed Files, Implementation Log, Verification Items, Command Results, Dispatch Log, Architecture Notes, Blockers, Phase Completion Log |
| Review | `.workflow/templates/reviews/template.md` | `.workflow/artifacts/reviews/<slug>-v<N>.md` | Frontmatter, Findings, Severity Summary, Requirement Coverage, Architecture Notes, Verification Reviewed, Residual Risk, Recommendation |
| Verify | `.workflow/templates/verify/template.md` | `.workflow/artifacts/verify/<slug>-v<N>.md` | Frontmatter, Inputs, Automated Checks, Manifest Coverage, Manual QA, Generated Output Evidence, Findings, Skipped Checks, Architecture Notes, Sign-Off |
| Ship | `.workflow/templates/ship/template.md` | `.workflow/artifacts/ship/<slug>-v<N>.md` | Frontmatter, Inputs, Ship Status, Requirement Coverage, PR/CI Readiness, Release Readiness, Source-of-Truth Status, Risk And Rollback, Blocked Handoff, Architecture Notes, Exit Gate, Next Phase |
| Reflect | `.workflow/templates/reflect/template.md` | `.workflow/artifacts/reflect/<slug>-v<N>.md` | Frontmatter, Inputs, Outcome, What Worked, What Did Not Work, Surprises, Manifest Coverage Retrospective, Deferred, Source-of-Truth Outcome, Learning Candidates, Follow-Ups, Raw Session Entry, Architecture Notes, Exit Gate |

## Domain Leakage Rules

Canonical `agentsmyth` files must not contain these terms except in `docs/migration-from-reference-workspace.md` or sanitized examples:

```text
AI Recipes
ai-recipes-workspace
engineering-research-repo
frontend-ai-starter-recipes
backend-ai-starter-recipes
Fare
Bare
workspace root
repos/
Codex-only
Notion required
npm run check:dist as default
```

## Follow-Up Inventory Needed Before Phase 2

Run this locally against `ai-recipes-workspace` before scaffolding:

```bash
find . -name "*.md" -not -path "./.git/*" | sort > /tmp/ai-recipes-workspace-md-files.txt
```

Then update this matrix with any missed files, especially:

```text
- all .agents/skills/**/references/*.md
- all docs/**/template.md
- all docs/knowledge-map/*.md
- all .agents/learnings/**/*.md
- all adapter evidence docs under docs/verify/evidence/**
- root docs not found through connector search
```

## Phase 1 Status

```text
Status: completed as core lifecycle extraction draft
Blocked from commit: JeelVankhede/agentsmyth does not exist yet
Next required action: create JeelVankhede/agentsmyth, then commit this as docs/migration-from-reference-workspace.md
```
