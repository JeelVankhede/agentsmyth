# Repo Mental Map

Fill this in during setup. An AI agent running any lifecycle skill should load this file to orient itself before touching the repository.

---

## What This Repo Does

<!-- One to three sentences. What problem does it solve? What is the primary user or consumer? -->

<DESCRIBE_REPO_PURPOSE>

---

## Source-of-Truth Hierarchy

<!-- Where do requirements and decisions live? List in priority order. -->

1. <!-- e.g., Linear project "PROJNAME" — product requirements -->
2. <!-- e.g., This repo's AGENTS.md and .workflow/ — workflow rules -->
3. <!-- e.g., README.md — public contract -->

---

## Key Paths

<!-- Paths an AI agent must know to navigate this repo without exploring. -->

| Path | What lives here |
|---|---|
| `<path>` | <!-- e.g., src/api/ — HTTP handlers --> |
| `<path>` | <!-- e.g., src/domain/ — business logic, no framework deps --> |
| `<path>` | <!-- e.g., tests/ — unit and integration tests --> |
| `<path>` | <!-- e.g., scripts/ — local dev and CI helper scripts --> |

---

## Protected Paths

<!-- Paths that require special approval, security review, or must not be changed without explicit discussion. -->

- `<path>` — <!-- reason, e.g., auth middleware: security review required -->

---

## Verification Defaults

<!-- What commands confirm the repo is healthy? These are the commands the Test phase will rely on by default. -->

```bash
# build / compile
<COMMAND>

# unit tests
<COMMAND>

# lint / static analysis
<COMMAND>
```

---

## Planning Rules

<!-- Constraints an AI agent must respect when planning changes. -->

- <!-- e.g., Never commit directly to main. All changes go through PRs. -->
- <!-- e.g., Migration files are append-only; never edit an existing migration. -->
- <!-- e.g., Public API contracts in src/api/types.ts must stay backwards-compatible. -->

---

## Known Risks and Non-Goals

<!-- What must an AI agent not do in this repo? What is explicitly out of scope? -->

- <!-- e.g., Do not modify the generated client in generated/. Regenerate it instead. -->
- <!-- e.g., Do not add runtime dependencies without a brief review first. -->
