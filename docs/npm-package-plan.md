# agentsmyth npm Package — Shipping Plan

**Date:** 2026-06-14
**Status:** Planning — not started
**Branch:** `feat/npm-package-shipping`

---

## Intent

Ship agentsmyth as an npm package so a consumer can onboard the full lifecycle workflow into any target repository with a single command and a single instruction to their AI agent. No manual file extraction, no zip handling, no file collision risk. The AI agent drives the entire setup and leaves only the final populated workflow behind.

The package ships compiled bundles — not source. Source structure, reference files, validators, and build tooling stay in the private repo and never reach the consumer.

---

## Consumer Experience (target)

```bash
# in their repo — local tarball (shared directly)
npx file:/path/to/jeelvankhede-agentsmyth-0.1.0.tgz init

# once published to a registry
npx @jeelvankhede/agentsmyth@latest init

# then, to their AI agent:
"run the agentsmyth setup"

# agent runs setup, fills configs, copies workflow, cleans up
# their repo now has .workflow/ ready for lifecycle work
```

Nothing else required from the consumer.

---

## Distribution Model

| Dimension | Decision |
|---|---|
| Registry | GitHub Packages (private, auth-gated) to start; npmjs.com public if ever made open |
| Access control | Consumer needs a GitHub token scoped to the org — you issue it per consumer |
| Versioning | Semantic versioning; `@latest` always resolves to the most recent stable |
| Package name | `@jeelvankhede/agentsmyth` (scoped, GitHub Packages) |
| Install modes (local) | `npx file:/path/to/jeelvankhede-agentsmyth-0.1.0.tgz init` |
| Install modes (registry) | `npx @jeelvankhede/agentsmyth init` (one-off) or `npm install --save-dev @jeelvankhede/agentsmyth` (pinned) |

---

## What the Package Contains

Only compiled/static artifacts — no source:

```
package/
├── package.json
├── bin/
│   └── agentsmyth.mjs          ← CLI entry point
├── dist/
│   ├── setup-bundle.md         ← compiled setup skill (all references inlined)
│   └── workflow-bundle.md      ← compiled full workflow (all skills + lifecycle + rules inlined)
└── assets/
    ├── AGENTS.md               ← entry point, points at .agentsmyth/setup-bundle.md
    ├── adapters/               ← all 5 rendered adapter shims
    └── .workflow/
        ├── config/             ← 6 placeholder YAMLs (agent fills these during setup)
        ├── artifacts/          ← empty phase dirs with .gitkeeps
        ├── learnings/          ← empty with README
        └── glossary.md
```

`.npmignore` excludes: `.workflow/` (source), `setup/`, `scripts/`, `docs/`, `examples/`, `adapters/` (source), `src/`.

---

## Isolated Directory Design

`init` writes everything into `.agentsmyth/` — never to the repo root directly.

**Why:** The consumer's repo may already have `AGENTS.md`, an `adapters/` folder, or a partial `.workflow/` setup. Inflating into an isolated directory avoids any collision until the agent has inspected the situation and can make deliberate decisions about each file.

```
their-repo/
└── .agentsmyth/                ← created by `npx agentsmyth init`, gitignored automatically
    ├── setup-bundle.md
    ├── workflow-bundle.md
    ├── assets/
    │   ├── AGENTS.md
    │   ├── adapters/
    │   └── .workflow/
    └── validators/
        ├── check-config.mjs
        ├── check-setup-complete.mjs
        └── lib.mjs
```

`init` also:
- Appends `.agentsmyth/` to `.gitignore` (creates it if missing)
- Prints one line: `Ready. Open your AI agent and say: "run the agentsmyth setup"`
- Does nothing else — all remaining work is the agent's

---

## Setup Flow (5 phases, agent-driven)

### Phase 1 — Inspect

Agent reads the target repo before asking anything. Follows the inspection checklist inlined in `setup-bundle.md`:

- README, package.json / Cargo.toml / go.mod / pyproject.toml
- Top-level directory structure
- CI config, lint, test runner presence
- Git log for branch patterns and commit style
- Existing `.workflow/` state (placeholder vs populated)
- Existing `AGENTS.md`, `adapters/` (collision candidates)
- `.env*`, `secrets/` presence (noted, never read)

Agent produces a brief summary and confirms it with the user before proceeding.

### Phase 2 — Interview

Agent asks in small batches (2–4 questions at a time), in this order:

1. Repo identity: name, purpose, primary user/consumer
2. Source-of-truth: where are requirements tracked? Decisions recorded?
3. Key paths: important directories and what lives in each
4. Protected paths: what must never change without explicit approval
5. Verification: build, test, lint commands
6. Branch and release policy: how does code reach production?
7. Domain: industry, regulated environment, glossary terms
8. Risks and non-goals: what must the agent never do in this repo

Earlier answers pre-fill or skip later questions. Agent never asks what it already knows from inspection.

### Phase 3 — Write Configs

Agent fills all 6 config files inside `.agentsmyth/assets/.workflow/config/`:

| File | Populated from |
|---|---|
| `domain.yaml` | Repo identity + domain interview answers |
| `repo-profile.yaml` | Key paths + branch policy answers |
| `source-of-truth.yaml` | Source-of-truth answers |
| `verification.yaml` | Verification command answers |
| `release.yaml` | Release policy answers |
| `agent-behavior.yaml` | Not touched — shipped as a workflow invariant |

Also writes `docs/knowledge-map/repo-mental-map.md` as a human-readable orientation map.

Rules:
- Replace all `<PLACEHOLDER>` values
- Never invent a value the user did not provide
- Unknown values → `<USER-TODO: reason>` (counts as a pending item, not a failure)
- `<TODO>` left by the agent with no reason → validation failure

### Phase 4 — Verify (hard stop, no waivers)

Agent runs both validators from `.agentsmyth/validators/`:

```bash
node .agentsmyth/validators/check-config.mjs
node .agentsmyth/validators/check-setup-complete.mjs
```

**`check-setup-complete.mjs` checks (all must pass):**

- Zero `<PLACEHOLDER>` strings remain in any config file
- `domain.yaml`: `domain.name` is not empty, not placeholder
- `repo-profile.yaml`: `repository.default_branch` is set; at least one path entry exists
- `verification.yaml`: has at least one `command` entry OR an explicit `no_commands_known: true` field
- `docs/knowledge-map/repo-mental-map.md` exists and has non-placeholder content
- `check-config.mjs` passes (schema validation for all 6 configs)

**Non-negotiable rules baked into the setup bundle:**

```
SETUP VERIFICATION POLICY
- Both validators must exit 0 before Phase 5 begins.
- Waivers are not permitted during setup. There is no waiver field in setup output.
- If a check fails, fix the root cause. Do not re-run and claim pass without fixing.
- <USER-TODO> items are permitted only for values the user explicitly said they do not
  know yet. They do not cause a validator failure but are listed in the setup summary.
- Gate-passing ("good enough", "I'll skip this") is not a valid resolution.
```

This is a deliberate departure from lifecycle waiver policy. Setup is a one-time act; every lifecycle run that follows depends on it being correct.

### Phase 5 — Copy and Cleanup

Agent copies from `.agentsmyth/assets/` into the repo root, handling each collision:

| Target | Collision rule |
|---|---|
| `.workflow/` (does not exist) | Copy directly |
| `.workflow/` (exists, placeholder configs) | Overwrite configs; preserve existing artifacts |
| `.workflow/` (exists, populated configs) | Stop, confirm with user before touching anything |
| `AGENTS.md` (does not exist) | Copy from assets |
| `AGENTS.md` (exists) | Read it; append an agentsmyth section pointing at `.workflow/router.md`; never overwrite |
| `adapters/` (does not exist) | Copy from assets |
| `adapters/<tool>/` (exists) | Copy only missing subdirs; skip what's already there |
| `docs/knowledge-map/` | Create if missing; never overwrite an existing repo-mental-map |

Agent produces a **copy-log** (one line per file, action taken) and shows it to the user before deleting `.agentsmyth/`.

Agent then expands `workflow-bundle.md` into the target repo's `.workflow/skills/`, `.workflow/lifecycle.md`, `.workflow/rules.md`, `.workflow/router.md`, and `.workflow/glossary.md` — reconstructing the full skill tree from the bundle's embedded file markers.

Final step: agent deletes `.agentsmyth/`.

**Consumer's repo after setup:**

```
their-repo/
├── .workflow/
│   ├── config/          ← fully populated (domain attached)
│   ├── skills/          ← full skill tree expanded from bundle
│   ├── artifacts/       ← empty, ready for lifecycle work
│   ├── lifecycle.md
│   ├── router.md
│   ├── rules.md
│   └── glossary.md
├── adapters/            ← agent tool shims
├── AGENTS.md            ← original + agentsmyth section appended (or new if didn't exist)
└── docs/
    └── knowledge-map/
        └── repo-mental-map.md
```

---

## Bundle Format

The `workflow-bundle.md` uses file markers so the agent knows what to write where:

```markdown
<!-- FILE: .workflow/lifecycle.md -->
# Lifecycle
...content...
<!-- END FILE -->

<!-- FILE: .workflow/skills/lifecycle-think/SKILL.md -->
# Think Skill
...content...
<!-- END FILE -->
```

Agent reads each `FILE`/`END FILE` block and writes the content to that path. No CLI command needed for expansion — the agent does it directly, which means it can also make small domain-specific adjustments during expansion if needed (a future capability, not Phase 1).

---

## Build Pipeline

### New script: `scripts/build-bundle.mjs`

Reads source in this order and inlines all `references/` files into the skill body:

**For `dist/setup-bundle.md`:**
1. `setup/SKILL.md`
2. `setup/references/inspection-checklist.md` (inlined under Phase 1)
3. `setup/references/config-map.md` (inlined under Phase 3)
4. Verification policy block (Phase 4 — hardcoded, not from a file)
5. Collision rules table (Phase 5 — hardcoded)

**For `dist/workflow-bundle.md`:**
1. `.workflow/router.md`
2. `.workflow/lifecycle.md`
3. `.workflow/rules.md`
4. `.workflow/glossary.md`
5. For each of the 7 lifecycle skills + 4 power skills:
   - `SKILL.md`
   - All `references/*.md` files (inlined into the bundle with `FILE` markers)

### New validator: `.workflow/validators/check-setup-complete.mjs`

Runs during setup Phase 4. Also used as a standalone check to confirm setup was done correctly (can be run by the consumer at any time after setup).

### Release flow (`.github/workflows/release.yml`)

Triggered on `git tag v*`:

1. `node scripts/build-bundle.mjs` → writes `dist/`
2. `node scripts/validate-template.mjs` (includes check-starter-blocks, check-lifecycle)
3. `node scripts/validate-example.mjs`
4. `npm publish --access restricted` → publishes to GitHub Packages

---

## Work Breakdown

| # | Item | Depends on |
|---|---|---|
| 1 | `check-setup-complete.mjs` | Nothing — defines "done" for setup |
| 2 | `scripts/build-bundle.mjs` | Bundle format decision (FILE markers) |
| 3 | Phase 4 + 5 content added to `setup/SKILL.md` | `check-setup-complete.mjs` |
| 4 | `bin/agentsmyth.mjs` (CLI `init` command) | Bundle format, assets structure |
| 5 | `assets/` directory — static files for package | Existing adapters, config YAMLs |
| 6 | `package.json` + `.npmignore` | `bin/`, `dist/`, `assets/` structure |
| 7 | `.github/workflows/release.yml` | All of the above |
| 8 | Update `docs/setup-guide.md` | Final package UX confirmed |
| 9 | Smoke test: `npx . init` in a temp repo, agent runs setup | Everything above |

---

## Open Questions

| # | Question | Default if not answered |
|---|---|---|
| OQ1 | Should `check-setup-complete.mjs` be copied into `.agentsmyth/validators/` at init time, or embedded in the bundle and written to a temp path by the agent? | Copy at init time — simpler, no agent involvement needed to run it |
| OQ2 | Should `workflow-bundle.md` expansion happen file-by-file (agent writes each FILE block) or should the CLI have an `expand` command? | Agent writes each block — consistent with "agent drives all setup" decision |
| OQ3 | Does `agent-behavior.yaml` ship as-is in `assets/` or is it compiled into the bundle? | Ships as-is in `assets/` — it's a workflow invariant, not authored during setup |
| OQ4 | Should the package name be `@jeelvankhede/agentsmyth` (user-scoped) or an org scope for cleaner branding? | `@jeelvankhede/agentsmyth` for now; re-scope when/if an org is created |

---

## Out of Scope for This Plan

- Public npmjs.com publishing (private GitHub Packages only for now)
- Remote skill server / API-gated skill loading (Option A — future if monetizing)
- Multi-agent dispatch during setup (setup is always single-agent, single-session)
- Upgrade path (`agentsmyth update`) — not needed until v2 exists
