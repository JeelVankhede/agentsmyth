# Phase 2 Scaffold Plan

## Purpose

Phase 2 creates the `agentsmyth` repository skeleton only. It establishes the complete file and folder contract for the generic single-repo `.workflow/` system.

## Scope

Create placeholder structure for:

- root project docs
- `.workflow/` canonical workflow folder
- config placeholders
- schema placeholders
- lifecycle skill folders
- skill reference folders
- artifact template folders
- artifact output folders
- learnings folders
- validator placeholders
- adapter placeholders
- example placeholders

## Non-Goals

- Do not rewrite final skill behavior.
- Do not implement validators.
- Do not create final artifact templates.
- Do not add real example domain content.
- Do not add package tooling.
- Do not copy AI Recipes domain content into canonical files.

## Required Top-Level Structure

```text
README.md
AGENTS.md
docs/
.workflow/
adapters/
examples/
scripts/
```

## Required Docs

```text
docs/migration-from-reference-workspace.md
docs/phase-2-scaffold-plan.md
docs/overview.md
docs/setup-guide.md
docs/agent-setup-interview.md
docs/lifecycle-contract.md
docs/domain-attachment-guide.md
docs/artifact-contract.md
docs/source-of-truth-guide.md
docs/adapter-guide.md
```

## Required .workflow Structure

```text
.workflow/README.md
.workflow/router.md
.workflow/lifecycle.md
.workflow/rules.md
.workflow/glossary.md
.workflow/config/
.workflow/schemas/
.workflow/skills/
.workflow/templates/
.workflow/artifacts/
.workflow/learnings/
.workflow/validators/
```

## Required Config Placeholders

```text
.workflow/config/domain.yaml
.workflow/config/repo-profile.yaml
.workflow/config/source-of-truth.yaml
.workflow/config/verification.yaml
.workflow/config/release.yaml
.workflow/config/agent-behavior.yaml
```

## Required Schema Placeholders

```text
.workflow/schemas/domain.schema.yaml
.workflow/schemas/repo-profile.schema.yaml
.workflow/schemas/source-of-truth.schema.yaml
.workflow/schemas/verification.schema.yaml
.workflow/schemas/release.schema.yaml
.workflow/schemas/artifact-frontmatter.schema.yaml
.workflow/schemas/lifecycle-artifact.schema.yaml
```

## Required Skill Skeleton Contract

Every lifecycle and power skill folder must contain:

```text
SKILL.md
references/
```

Required skill folders:

```text
.workflow/skills/lifecycle-orchestrator/
.workflow/skills/lifecycle-think/
.workflow/skills/lifecycle-plan/
.workflow/skills/lifecycle-build/
.workflow/skills/lifecycle-review/
.workflow/skills/lifecycle-test/
.workflow/skills/lifecycle-ship/
.workflow/skills/lifecycle-reflect/
.workflow/skills/decompose-requirements/
.workflow/skills/restore-context/
.workflow/skills/dispatch-subagents/
```

## Required Skill References

### lifecycle-orchestrator

```text
phase-routing.md
pause-resume-rules.md
blocker-policy.md
lifecycle-state-machine.md
output-contract.md
```

### lifecycle-think

```text
role.md
output-schema.md
exemplar.md
requirement-discovery.md
assumption-policy.md
question-policy.md
architecture-notes-guide.md
```

### lifecycle-plan

```text
role.md
output-schema.md
exemplar.md
repo-impact-map.md
dependency-ordering.md
risk-register.md
verification-planning.md
branch-policy.md
source-of-truth-planning.md
```

### lifecycle-build

```text
role.md
output-schema.md
exemplar.md
phase-execution-policy.md
scope-control.md
change-safety.md
git-status-policy.md
unrelated-changes-policy.md
verification-recording.md
```

### lifecycle-review

```text
role.md
output-schema.md
exemplar.md
severity-model.md
requirement-coverage.md
review-risk-categories.md
generated-output-review.md
source-of-truth-review.md
verification-review.md
```

### lifecycle-test

```text
role.md
output-schema.md
exemplar.md
verification-matrix.md
command-evidence-policy.md
manual-qa-policy.md
skipped-check-policy.md
generated-output-verification.md
```

### lifecycle-ship

```text
role.md
output-schema.md
exemplar.md
release-gates.md
source-of-truth-handoff.md
waiver-policy.md
rollback-policy.md
pr-ci-policy.md
blocked-handoff-format.md
```

### lifecycle-reflect

```text
role.md
output-schema.md
exemplar.md
coverage-retrospective.md
learning-capture.md
raw-session-format.md
follow-up-policy.md
```

### decompose-requirements

```text
decision-tree.md
explicit-requirements.md
implicit-requirements-library.md
assumptions-and-questions.md
manifest-format.md
output-schema.md
```

### restore-context

```text
chain-walker.md
artifact-reader.md
git-walker.md
source-of-truth-reader.md
blocker-reader.md
summary-format.md
output-schema.md
```

### dispatch-subagents

```text
decision-tree-by-phase.md
independence-rules.md
phase-caps.md
worker-ownership-format.md
logging-format.md
output-schema.md
```

## Required Template Skeleton Contract

Each artifact template folder must contain:

```text
template.md
sections/frontmatter.md
sections/architecture-notes.md
sections/exit-gate.md
```

Required template folders:

```text
.workflow/templates/briefs/
.workflow/templates/plans/
.workflow/templates/tasks/
.workflow/templates/reviews/
.workflow/templates/verify/
.workflow/templates/ship/
.workflow/templates/reflect/
```

## Required Artifact Output Folders

```text
.workflow/artifacts/briefs/.gitkeep
.workflow/artifacts/plans/.gitkeep
.workflow/artifacts/tasks/.gitkeep
.workflow/artifacts/reviews/.gitkeep
.workflow/artifacts/verify/.gitkeep
.workflow/artifacts/ship/.gitkeep
.workflow/artifacts/reflect/.gitkeep
```

## Required Adapter Folders

```text
adapters/codex/
adapters/claude/
adapters/cursor/
adapters/copilot/
adapters/windsurf/
```

Adapters are placeholders only in Phase 2. They must point to `.workflow/` as canonical in later phases.

## Required Example Folders

```text
examples/minimal-markdown-source/
examples/node-package/
examples/product-app/
```

Examples are placeholders only in Phase 2.

## Placeholder Content Rule

Every placeholder file created in Phase 2 must clearly state:

```text
Placeholder for a later phase. Do not treat this as final workflow behavior.
```

## Acceptance Criteria

- Phase 2 creates structure only.
- No final lifecycle behavior is written.
- No AI Recipes domain content is copied into canonical files.
- Every skill folder exists.
- Every required skill reference placeholder exists.
- Every artifact template folder exists.
- Every artifact output folder exists and contains `.gitkeep`.
- Adapter folders exist as placeholders only.
- Example folders exist as placeholders only.
- Root docs explain that Phase 2 is scaffold-only.

## Next Phase

Phase 3 rewrites lifecycle skills and references using the migration matrix.
