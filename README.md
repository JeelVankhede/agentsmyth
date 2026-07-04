# agentsmyth

Generic AI lifecycle workflow for a targeted repository.

`agentsmyth` gives AI agents a durable engineering workflow for a single repository. It turns requests into lifecycle artifacts, keeps decisions inspectable, and makes verification, release, handoff, and reflection evidence explicit.

The canonical workflow source is `.workflow/`. Consumer repos receive it as `workflow/` after setup.

## What Is Included

- One-time porting skill in `setup/` — use this to configure a new target repository.
- Lifecycle router and phase contracts in `.workflow/router.md` and `.workflow/lifecycle.md`.
- Phase skills in `.workflow/skills/`.
- Artifact Starter Blocks in each skill's `references/output-schema.md`.
- Config defaults in `.workflow/config/`.
- YAML schema contracts in `.workflow/schemas/`.
- Optional tool adapters in `adapters/` — one per supported AI tool.

`setup/` is a one-time tool for porting. It is not copied to the target repository.

## Lifecycle

```text
brief -> plan -> task -> review -> verify -> ship -> reflect
```

Each Standard or Complex change leaves a readable artifact chain under `workflow/artifacts/`. The artifacts preserve requirement IDs, blockers, architecture notes, command evidence, skipped-check risk, release status, and follow-up decisions.

## Using This Package (Local / Pre-Release)

The package is not yet published to npm. Share it as a local tarball.

### Step 1 — Build and pack

From this repo root:

```bash
npm run pack:local
# Produces: jeelvankhede-agentsmyth-0.1.0.tgz (or similar)
```

Share the `.tgz` file with the person setting up a new repo.

### Step 2 — Install in the target repo

The recipient runs this in their repo root, replacing the path with wherever they saved the tarball:

```bash
npm install --save-dev /path/to/jeelvankhede-agentsmyth-0.1.0.tgz
```

Or if they copy the tarball into their repo root:

```bash
npm install --save-dev file:./jeelvankhede-agentsmyth-0.1.0.tgz
```

### Step 3 — Initialise

```bash
npx agentsmyth init
```

This creates `.agentsmyth/` in the target repo root containing the setup bundle, workflow bundle, validators, and static assets. `.agentsmyth/` is added to `.gitignore` automatically.

### Step 4 — Run the setup skill

Open your AI agent in the target repo and say:

```
run the agentsmyth setup
```

The agent reads `.agentsmyth/setup-bundle.md`, inspects the repo, interviews you, writes `workflow/config/*.yaml`, places the adapter at your tool's native path, expands the full workflow tree under `workflow/`, and removes `.agentsmyth/` when done.

### What ends up in the target repo

```
workflow/
  config/          ← agent fills these during setup
  router.md
  lifecycle.md
  rules.md
  glossary.md
  skills/          ← full phase skill tree
  validators/      ← post-setup health checks
  schemas/
  artifacts/       ← lifecycle artifact chain lives here
  learnings/
.claude/CLAUDE.md  ← or AGENTS.md / .cursor/rules/ etc. depending on your tool
docs/knowledge-map/repo-mental-map.md
```

### Post-setup validation

After setup, verify the installation from the target repo root:

```bash
node workflow/validators/check-setup-complete.mjs
node workflow/validators/check-config.mjs
node workflow/validators/check-pending-setup.mjs   # optional: shows open items
```

## Development (this repo)

Build bundles and run all checks:

```bash
npm run build       # rebuild dist/ bundles and assets/
npm run validate    # validate-template + validate-example + render-adapters
```

Run individual dev validators:

```bash
node .workflow/validators/check-starter-blocks.mjs
node .workflow/validators/check-lifecycle.mjs
node .workflow/validators/check-artifacts.mjs
node .workflow/validators/check-domain-placeholders.mjs
```

## Guardrails

- Keep `.workflow/` canonical in this dev repo. Consumer repos get the compiled output.
- Do not make a provider, CI system, package manager, deployment process, or external source mandatory unless config or the user requires it.
- Do not claim commands, external updates, releases, PRs, CI, or handoffs without evidence.
- Treat skipped checks and waivers as visible risk.
- Treat validators as contract checks. They support review, but they do not replace code tests, manual QA, release evidence, or human judgment.
