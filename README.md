# agentsmyth

Generic AI lifecycle workflow for a targeted repository.

`agentsmyth` gives AI agents a durable engineering workflow for a single repository. It turns requests into lifecycle artifacts, keeps decisions inspectable, and makes verification, release, handoff, and reflection evidence explicit.

The canonical workflow source is `.workflow/`.

## What Is Included

- One-time porting skill in `setup/` — use this to configure a new target repository.
- Lifecycle router and phase contracts in `.workflow/router.md` and `.workflow/lifecycle.md`.
- Phase skills in `.workflow/skills/`.
- Artifact Starter Blocks in each skill's `references/output-schema.md`.
- Config defaults in `.workflow/config/`.
- YAML schema contracts in `.workflow/schemas/`.
- Adoption docs in `docs/`.
- Optional tool adapters in `adapters/`.

`setup/` is a one-time tool for porting. It is not copied to the target repository.

## Lifecycle

```text
brief -> plan -> task -> review -> verify -> ship -> reflect
```

Each Standard or Complex change should leave a readable artifact chain under `.workflow/artifacts/`. The artifacts preserve requirement IDs, blockers, architecture notes, command evidence, skipped-check risk, release status, and follow-up decisions.

## Setup

1. Read `docs/setup-guide.md`.
2. Fill `.workflow/config/*.yaml` for the repository.
3. Use `docs/agent-setup-interview.md` to collect missing repo, verification, source, and release facts.
4. Attach domain-specific policy through `docs/domain-attachment-guide.md`.
5. Use `docs/lifecycle-contract.md` and `docs/artifact-contract.md` as review references.

## Guardrails

- Keep `.workflow/` canonical.
- Do not make a provider, CI system, package manager, deployment process, or external source mandatory unless config or the user requires it.
- Do not claim commands, external updates, releases, PRs, CI, or handoffs without evidence.
- Treat skipped checks and waivers as visible risk.
- Treat validators as contract checks. They support review, but they do not replace code tests, manual QA, release evidence, or human judgment.

## Validation

Run the repository contract checks from the repository root:

```text
node .workflow/validators/check-config.mjs
node .workflow/validators/check-starter-blocks.mjs
node .workflow/validators/check-lifecycle.mjs
node .workflow/validators/check-artifacts.mjs
node .workflow/validators/check-domain-placeholders.mjs
```
