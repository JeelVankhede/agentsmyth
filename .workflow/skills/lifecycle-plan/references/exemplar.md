# Exemplar

## Good Example

A good Plan phase entry is specific without becoming implementation code:

```markdown
### Phase 1 - Update workflow contract docs

- Manifest IDs: R1, RI1
- Touches: `.workflow/skills/lifecycle-think/SKILL.md`, `.workflow/skills/lifecycle-think/references/output-schema.md`
- Why first: These files define the upstream contract consumed by later phases.
- Work: Replace placeholder instructions with the approved repository contract.
- Exit gate: The Think skill includes role, inputs, stop conditions, workflow, architecture notes, deterministic output, and no domain leakage.
```

A good verification row is evidence-oriented:

```markdown
| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1 | Review changed skill files against Phase 3 contract | Test | No command exists yet; manual evidence required. |
| RI1 | `rg` scan for prohibited domain/control-plane terms | Test | Fails if canonical files contain banned terms. |
```

Do not use vague phase names, empty phases, or verification entries like "test manually" without naming what is inspected.

## Bad Example

```markdown
### Phase 1 - Fixes

- Work: Make the skill files better.
- Exit gate: Done.

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1 | test manually | Test | - |
| RI1 | - | Test | - |
```

## Why The Bad Is Bad

- "Make the skill files better" names no files, no manifest IDs, no reason for ordering — Build cannot derive what to change, which files to open, or whether it is in scope.
- Exit gate "Done" is not verifiable. It collapses to a checkbox; there is no evidence requirement and no way to fail it. Review will accept whatever Build produces.
- "test manually" without an inspection target is not a verification plan — Test cannot produce a result that traceably covers R1. When Test writes the verify artifact, R1 will appear as "manual" with no evidence path.
- Dashed `Notes` cells hide known gaps. Plan authors who know a command does not exist yet should say so; that note is the handoff for Test to record a skipped-check entry with risk and owner instead of inventing a result.
