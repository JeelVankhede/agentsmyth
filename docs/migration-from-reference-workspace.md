# Migration From Reference Workspace

## Source

- Reference repository: `JeelVankhede/ai-recipes-workspace`
- Target repository: `JeelVankhede/agentsmyth`
- Target install folder: `.workflow/`
- Phase: 1 - extraction matrix only

## Target Product Definition

`agentsmyth` is a generic, single-repo AI lifecycle workflow template. It extracts the lifecycle orchestration contract from the reference workspace and rewrites it into a neutral `.workflow/` system that any target repo can configure through YAML, markdown templates, skill playbooks, validators, and optional adapter wrappers.

## Scope

Phase 1 classifies known markdown/control surfaces from the reference repo and defines how each should move into `agentsmyth`.

This phase does not scaffold `.workflow/`, rewrite skills, add validators, or create adapters.

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

| Source path | Classification | Target path | Action | Knowledge to preserve | Assumptions to strip | Notes |
|---|---|---|---|---|---|---|
| `README.md` | workspace-specific / overview | `README.md` | Rewrite | Purpose and layout clarity | Workspace control surface, `repos/`, child repo clone commands | Use as inspiration only. |
| `AGENTS.md` | workflow-core | `AGENTS.md`, `.workflow/router.md`, `.workflow/rules.md` | Rewrite | Router, lifecycle phases, task classes, artifact contract, manifest IDs, pause/resume, power skills, validation rules | Codex-only, workspace root, repo roles, `docs/` artifact root, Notion mandate, multi-repo Git boundary | Highest-value source file. |
| `.agents/README.md` | workflow-core | `.workflow/README.md`, `.workflow/skills/README.md` | Rewrite | Entrypoint, skill list, playbook grouping, learnings model | Product repos under `repos/`, Codex-only wording | Keep concise. |
| `.agents/learnings.md` | learning-core | `.workflow/learnings/curated.md` | Review/rewrite if neutral | Durable process learnings | AI Recipes-specific learnings | Only migrate neutral, repeatedly useful rules. |
| `.agents/learnings/sessions/*.md` | historical-artifact | none by default | Do not migrate | Optional evidence for learning design | Project-specific history | Keep source-only unless a generic pattern is worth rewriting. |
| `docs/knowledge-map/workspace-mental-map.md` | workflow-core + domain-specific | `docs/lifecycle-contract.md`, `.workflow/lifecycle.md`, `.workflow/rules.md` | Rewrite | Source priority, lazy loading, delivery order, verification defaults, planning rules, release expectations, reflection expectations | Workspace root, three repo roles, AI Recipes product delivery order, hardcoded commands | Convert into generic single-repo mental model. |
| `docs/knowledge-map/ai-recipes-lifecycle-source-map.md` | migration-reference | `docs/migration-from-reference-workspace.md` | Rewrite | Kept/changed/dropped concepts, provenance of lifecycle extraction | AI Recipes-specific adaptation details except as historical notes | Conceptual base for this matrix. |
| `docs/product/*.md` | domain-specific | `examples/*` or none | Do not migrate to core | Possible source-of-truth example shape | AI Recipes product details | Only sanitized examples if needed. |
| `docs/briefs/template.md` | artifact-template | `.workflow/templates/briefs/template.md` | Rewrite | Brief frontmatter, source links, problem/goals/non-goals, requirements, risks, questions, Requirement Manifest, exit gate, architect notes | `docs/product`, Notion/GitHub defaults as required, old artifact path | Add `architecture_notes`. |
| `docs/briefs/*-v*.md` | historical-artifact | none by default | Do not migrate | Real artifact examples | AI Recipes history | Optional sanitized examples only. |
| `docs/plans/template.md` | artifact-template | `.workflow/templates/plans/template.md` | Rewrite | Summary, inputs, approach, phases, dependency order, risk register, verification plan, open questions, exit gate | Fixed multi-repo impact map, repo-specific branch table, AI Recipes release/tracking assumptions | Replace with single-repo impact map and configurable source-of-truth strategy. |
| `docs/plans/*-v*.md` | historical-artifact | none by default | Do not migrate | Real plan examples | AI Recipes implementation history | Optional sanitized examples only. |
| `docs/tasks/template.md` | artifact-template | `.workflow/templates/tasks/template.md` | Rewrite | Branch/status evidence, changed files, verification, dispatch log, phase completion log | Engineering/frontend/backend sections, `repos/<repo>` paths | Replace repo sections with generic target repo sections. |
| `docs/tasks/*-v*.md` | historical-artifact | none by default | Do not migrate | Real task artifact examples | AI Recipes implementation history | Optional sanitized examples only. |
| `docs/verify/template.md` | artifact-template | `.workflow/templates/verify/template.md` | Rewrite | Inputs, automated checks, manifest coverage, manual QA, findings, skipped checks, sign-off | Workspace validator path, npm/check:dist defaults | Pull commands from `.workflow/config/verification.yaml`. |
| `docs/verify/*-v*.md` | historical-artifact | none by default | Do not migrate | Verification examples | AI Recipes historical evidence | Keep out of core. |
| `docs/verify/evidence/**` | evidence-only / adapter-reference | `examples/*` or `adapters/*` selectively | Inspect later | Adapter output examples, generated instruction patterns | Concrete generated product output | Do not treat as canonical. |
| `docs/ship/template.md` | artifact-template | `.workflow/templates/ship/template.md` | Rewrite | Ship/hold/hold-with-waiver, requirement coverage, PR readiness, release checks, tracking, rollback, blocked handoff, exit gate | Engineering repo versioning, CLI release checks, Notion-specific table, frontend/backend package assumptions | Generalize around release and source-of-truth config. |
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

| Skill | Required references |
|---|---|
| `lifecycle-orchestrator` | `phase-routing.md`, `pause-resume-rules.md`, `blocker-policy.md`, `lifecycle-state-machine.md`, `output-contract.md` |
| `lifecycle-think` | `role.md`, `output-schema.md`, `exemplar.md`, `requirement-discovery.md`, `assumption-policy.md`, `question-policy.md`, `architecture-notes-guide.md` |
| `lifecycle-plan` | `role.md`, `output-schema.md`, `exemplar.md`, `repo-impact-map.md`, `dependency-ordering.md`, `risk-register.md`, `verification-planning.md`, `branch-policy.md`, `source-of-truth-planning.md` |
| `lifecycle-build` | `role.md`, `output-schema.md`, `exemplar.md`, `phase-execution-policy.md`, `scope-control.md`, `change-safety.md`, `git-status-policy.md`, `unrelated-changes-policy.md`, `verification-recording.md` |
| `lifecycle-review` | `role.md`, `output-schema.md`, `exemplar.md`, `severity-model.md`, `requirement-coverage.md`, `review-risk-categories.md`, `generated-output-review.md`, `source-of-truth-review.md`, `verification-review.md` |
| `lifecycle-test` | `role.md`, `output-schema.md`, `exemplar.md`, `verification-matrix.md`, `command-evidence-policy.md`, `manual-qa-policy.md`, `skipped-check-policy.md`, `generated-output-verification.md` |
| `lifecycle-ship` | `role.md`, `output-schema.md`, `exemplar.md`, `release-gates.md`, `source-of-truth-handoff.md`, `waiver-policy.md`, `rollback-policy.md`, `pr-ci-policy.md`, `blocked-handoff-format.md` |
| `lifecycle-reflect` | `role.md`, `output-schema.md`, `exemplar.md`, `coverage-retrospective.md`, `learning-capture.md`, `raw-session-format.md`, `follow-up-policy.md` |
| `decompose-requirements` | `decision-tree.md`, `explicit-requirements.md`, `implicit-requirements-library.md`, `assumptions-and-questions.md`, `manifest-format.md`, `output-schema.md` |
| `restore-context` | `chain-walker.md`, `artifact-reader.md`, `git-walker.md`, `source-of-truth-reader.md`, `blocker-reader.md`, `summary-format.md`, `output-schema.md` |
| `dispatch-subagents` | `decision-tree-by-phase.md`, `independence-rules.md`, `phase-caps.md`, `worker-ownership-format.md`, `logging-format.md`, `output-schema.md` |

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
Committed to: JeelVankhede/agentsmyth
Path: docs/migration-from-reference-workspace.md
Commit: 60abf0f58b9d2fac00963f2804d8ecbe4c8e86e9
Next required action: complete local exhaustive markdown inventory before Phase 2 scaffolding
```
