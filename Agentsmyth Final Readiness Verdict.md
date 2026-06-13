# Agentsmyth — Final Readiness Verdict

**Date:** 2026-06-13
**Branch audited:** `main` (post-merge of all quality overhaul passes 1–9)
**Audit method:** Full validator run (all 5), grep-based cross-reference sweep across `.workflow/`, `adapters/`, `docs/`, `README.md`, and `adapters/README.md`. Live validator output used as ground truth.

> **Note on prior verdict document:** `Agentsmyth Readiness Verdict.md` (Pass 3) describes fixes that were planned but not yet committed to `main`. Validator runs in this audit confirm those fixes are still pending. This document supersedes it with the actual current state.

---

## Actual Validator State (Ground Truth)

| Validator | Status | Detail |
|---|---|---|
| `check-config` | ✅ **Pass** | All 6 configs validate against their schemas. |
| `check-artifacts` | ✅ **Pass** | No artifacts exist yet; no violations. |
| `check-domain-placeholders` | ❌ **Fail** | 3 issues: "this repository" in 2 exemplars; "a banned reference-workspace term" in `Agentsmyth Readiness Verdict.md`. |
| `check-template-contracts` | ❌ **Fail** | 7 issues: `.workflow/templates/<kind>/template.md` missing for all 7 lifecycle phases. |
| `check-lifecycle` | ❌ **Crash** | ENOENT on `.workflow/templates/briefs/template.md` — crashes before producing any output. |

**3 of 5 validators are broken on `main`.**

---

## Blocking Issues (Must Fix Before Consumer Onboarding)

### B1 — `.workflow/templates/` directory does not exist; 3 validators broken

The quality overhaul plan was to delete `.workflow/templates/` and replace it with Starter Blocks inside each skill's `references/output-schema.md`. The replacement was done (Starter Blocks exist in all 11 skill output-schema.md files). But the validators were never updated — `check-template-contracts.mjs`, `lib.mjs`, and `check-lifecycle.mjs` all still depend on the deleted directory.

**Affected files:**
- `.workflow/validators/check-template-contracts.mjs` — entire file checks for templates that don't exist; needs to be replaced or repointed at Starter Blocks.
- `.workflow/validators/lib.mjs` — lines 16, 33, 50, 67, 84, 102, 121: `template:` paths under `.workflow/templates/<kind>/template.md`.
- `.workflow/validators/check-lifecycle.mjs` — crashes at runtime due to lib.mjs paths.

**Fix:** Either (a) delete `check-template-contracts.mjs` and update `lib.mjs` template paths to point at the skill `references/output-schema.md` Starter Blocks (consistent with design intent), or (b) create the seven missing template files if templates were meant to be retained.

### B2 — All 5 adapters route agents to a non-existent directory

Every adapter instruction file (the file an agent loads at session start) tells the agent to use `.workflow/templates/` for artifact creation. That directory does not exist. An agent following these instructions would fail immediately.

**Exact occurrences:**
- `adapters/claude/CLAUDE.md:12` — `"write durable artifacts under .workflow/artifacts/ using .workflow/templates/."`
- `adapters/codex/AGENTS.md:12` — same
- `adapters/copilot/copilot-instructions.md:7` — `"create or update artifacts under .workflow/artifacts/ from .workflow/templates/."`
- `adapters/cursor/rules/index.mdc:7` — same as copilot
- `adapters/windsurf/.windsurfrules:7` — same as copilot

**Fix:** Replace the `.workflow/templates/` reference with the actual Starter Block path. Suggested wording: `"create or update artifacts under .workflow/artifacts/ using the Starter Block in the matching skill's references/output-schema.md."`

### B3 — Two exemplar files contain "this repository" (banned by validator)

`check-domain-placeholders.mjs` bans the phrase "this repository" inside `.workflow/` because the framework is designed to be copied into any target repo. Two exemplar files fail this check.

**Exact occurrences (4 lines):**
- `.workflow/skills/lifecycle-ship/references/exemplar.md:35` — `"this repository uses direct merge"`
- `.workflow/skills/lifecycle-ship/references/exemplar.md:43` — `"for this repository"`
- `.workflow/skills/lifecycle-ship/references/exemplar.md:58` — `"for this repository"`
- `.workflow/skills/lifecycle-test/references/exemplar.md:60` — `"no generated output configured for this repository"`

**Fix:** Replace with repo-neutral phrasing. E.g., "this repo's release config specifies direct merge" → "release config specifies direct merge"; "no generated output configured for this repository" → "no generated output configured."

---

## Non-Blocking Issues

### N1 — `README.md` (root) line 14 references `.workflow/templates/`

> `Artifact templates in .workflow/templates/.`

This is the top-level project README. It will mislead any consumer reading the repo root. Should be updated to describe Starter Blocks in skill output-schema files.

### N2 — `.workflow/artifacts/README.md:31` references `.workflow/templates/`

> `Copy from .workflow/templates/<kind>/template.md.`

The instructions for creating a new artifact point at a non-existent path. Should point at the Starter Block in the relevant skill's `references/output-schema.md`.

### N3 — `docs/` planning files (not archived) reference `.workflow/templates/`

The following docs are living in `docs/` (not `docs/archive/`) and contain stale templates references:
- `docs/artifact-contract.md:17`
- `docs/overview.md:21`

`docs/migration-from-reference-workspace.md`, `docs/phase-2-scaffold-plan.md`, and `docs/phase-3-skill-contracts-plan.md` also reference templates extensively but are historical planning docs — these should be moved to `docs/archive/`.

### N4 — `Agentsmyth Readiness Verdict.md` (root) contains "a banned reference-workspace term"

This triggers `check-domain-placeholders`. The file can be deleted or moved once this final verdict document is accepted.

### N5 — Adapter README files use "this repository" (acceptable context)

Four adapter READMEs (`adapters/claude/README.md`, `adapters/codex/README.md`, etc.) say `"Use X when this repository needs..."`. These live under `adapters/` not `.workflow/`, so the validator does not flag them. This is borderline — they are installation guides, not agent-loaded files — so no change required.

### N6 — Public-release hygiene gaps

| Missing | Impact |
|---|---|
| `LICENSE` | Required for public GitHub repo |
| `.github/workflows/` | No CI to run validators on PR |
| `CONTRIBUTING.md` | No contributor guide |
| `CHANGELOG.md` | No release history |

These do not affect internal adoption but are required before a public launch.

---

## What Is Solid

- **Config + schema layer:** All 6 configs validate. All 8 schemas have configured consumers. The `agent-behavior.yaml` lifecycle chain (think→plan→build→review→test→ship→reflect) is consistent across config, schema, and lifecycle.md.
- **Lifecycle design:** Phase ordering, routing (router.md), glossary, rules, and artifact chain are coherent and self-consistent.
- **Skill coverage:** All 7 lifecycle phases + 4 non-lifecycle skills (`setup`, `dispatch-subagents`, `decompose-requirements`, `restore-context`, `lifecycle-orchestrator`) have complete SKILL.md files with consistent structure.
- **Starter Blocks:** All 11 skill `references/output-schema.md` files contain Starter Block sections. The design intent of the templates-to-Starter-Blocks migration is complete — only the validator and adapter wiring is stale.
- **Adapter presence:** All 5 adapters (Claude, Codex/AGENTS, Copilot, Cursor, Windsurf) have directories and the correct instruction file format. The routing logic in each file is consistent.
- **Learnings + artifacts directories:** Both exist with READMEs. No orphaned files.

---

## Readiness Score

| Dimension | Score | Notes |
|---|---|---|
| Lifecycle design | 9/10 | Sound. No issues. |
| Skill contracts | 9/10 | Sound. Starter Blocks complete. |
| Config + schema | 9/10 | All pass. |
| Adapters (wiring) | 4/10 | All 5 point at non-existent templates directory (B2). |
| Validators | 3/10 | 3 of 5 broken (B1, B3). |
| Docs + READMEs | 5/10 | Root README and artifacts README stale (N1, N2, N3). |
| Public-release hygiene | 2/10 | No LICENSE, CI, or CHANGELOG (N6). |
| **Overall (consumer onboarding)** | **5/10** | Core design is ready; integration wiring is not. |

---

## Recommended Fix Sequence

**Before consumer onboarding (blockers — 1–2 hours of work):**

1. **Fix adapters (B2):** Replace `.workflow/templates/` reference with Starter Block wording in all 5 adapter instruction files.
2. **Fix validators (B1):** Update `lib.mjs` to remove `template:` paths (or redirect to skill output-schema); replace or delete `check-template-contracts.mjs`; verify `check-lifecycle.mjs` runs cleanly.
3. **Fix exemplars (B3):** Replace 4 "this repository" occurrences in lifecycle-ship and lifecycle-test exemplars.
4. **Fix docs (N1, N2):** Update root `README.md` and `.workflow/artifacts/README.md` template references.
5. **Archive planning docs (N3):** Move `docs/migration-from-reference-workspace.md`, `docs/phase-2-scaffold-plan.md`, `docs/phase-3-skill-contracts-plan.md` to `docs/archive/`.
6. **Delete stale verdict (N4):** Delete `Agentsmyth Readiness Verdict.md` from repo root (superseded by this document).

**After fixes, expected validator state:** all 5 validators pass, score rises to ~8.5/10.

**Before public launch (non-blocking now):**
- Add `LICENSE`, `.github/workflows/` CI, `CHANGELOG.md` (N6).

---

## Summary

The agentsmyth framework design is complete and coherent. The Starter Block migration (replacing `.workflow/templates/` with per-skill output-schema Starter Blocks) was architecturally completed but the wiring — adapters, validators, and READMEs — was not updated to match. Fixing the 6 items above (B1–B3 + N1–N3) is ~1–2 hours of targeted text edits and will bring the project to a ship-ready state for consumer onboarding.
