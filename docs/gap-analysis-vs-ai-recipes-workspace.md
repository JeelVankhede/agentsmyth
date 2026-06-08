# Gap Analysis: agentsmyth vs ai-recipes-workspace

**Context:** `ai-recipes-workspace` was a multi-child-repo workspace root. `agentsmyth` is a single-repo portable template. Intentional differences (no `repos/` dir, no Notion integration, no multi-repo git boundary) are not treated as gaps here.

---

## GAP 1 (Critical) — No "Setup / Port" Skill

**What source had:** An implied workflow where an agent could port the workspace lifecycle to a new context. The `knowledge-map/` documents recorded what was adapted during porting.

**What agentsmyth has:** `docs/agent-setup-interview.md` — a static Markdown Q&A checklist. No skill, no agent-driven flow, no confirmation that setup is complete.

**Why it matters:** The core goal — point to agentsmyth, ask an AI agent to follow instruction set and port the entire workflow to a target repo, customised to its knowledge base.

**Decision:** Setup skill lives in a top-level `setup/` directory. It is explicitly excluded from the copy-to-target-repo checklist — the skill drives the porting exercise and does not carry over to the target repo. No artifact template needed; tracking is in-prompt/temporary during the setup run.

**What's needed:**
- `setup/SKILL.md` — the setup playbook:
  1. Inspects the target repo (git, package manager, test runner, protected paths).
  2. Asks the interview questions from `docs/agent-setup-interview.md` one section at a time.
  3. Writes answers directly into `.workflow/config/*.yaml`.
  4. Produces `docs/knowledge-map/repo-mental-map.md` confirming what was set up.
  5. Flags unknowns as open items rather than silently skipping them.
- `setup/references/inspection-checklist.md` — what to read before asking questions.
- `setup/references/config-map.md` — maps each interview answer to the exact config key to write.
- `README.md` at repo root — note that `setup/` is a one-time porting tool, not part of the workflow that gets copied.

---

## GAP 2 (Critical) — No Knowledge-Map Template

**What source had:** `docs/knowledge-map/workspace-mental-map.md` — a document describing source-of-truth hierarchy, repo roles, delivery order, verification defaults, and planning rules, filled in per-workspace.

**What agentsmyth has:** Nothing equivalent. `docs/overview.md` describes the template itself, not the target repo.

**Why it matters:** After setup, an agent in a future session must load a single "mental map" and immediately know what the repo is, what the source-of-truth hierarchy is, what verification defaults apply, and where key paths live. Without it, every session re-derives context from configs.

**Decision:** Only `repo-mental-map.md` is needed. No `lifecycle-source-map.md` — the target repo has no obligation to document anything about agentsmyth.

**What's needed:**
- `docs/knowledge-map/repo-mental-map.md` — template with placeholders for: repo purpose, source-of-truth hierarchy, key paths, verification defaults, planning rules, release expectations. Filled in by the setup skill (GAP 1).

---

## GAP 3 — `product` Artifact Template

**Decision:** Dropped. Product context (requirements, goals, constraints) goes directly into the Think prompt and becomes a brief. No extra pre-brief artifact layer.

---

## GAP 4 (Moderate) — `lifecycle-orchestrator` Missing `exemplar.md` and Naming Inconsistency

**What source had:**
- `lifecycle-orchestrator/references/exemplar.md` — shows what a full orchestrated pause/resume cycle looks like.
- `lifecycle-orchestrator/references/output-schema.md` — consistent with every other skill.

**What agentsmyth has:**
- No `exemplar.md` in `lifecycle-orchestrator/references/`.
- `output-contract.md` instead of `output-schema.md` — inconsistent with every other skill (likely introduced by Codex).

**What's needed:**
- Add `.workflow/skills/lifecycle-orchestrator/references/exemplar.md`.
- Rename `output-contract.md` → `output-schema.md` and update all internal references.

---

## GAP 5 (Moderate) — No Explicit Task Class Definitions

**What source had:**
```
Trivial: typo, comments, one-line local correction. Think and Plan may be skipped.
Standard: one repo or one workflow surface. Run the full lifecycle.
Complex: generated-output contracts, public docs, release behavior, package publishing. Full lifecycle mandatory.
```

**What agentsmyth has:** `agent-behavior.yaml` has `default_mode: standard` but no classification an agent can follow to decide when to skip phases.

**What's needed:**
- Add Trivial/Standard/Complex definitions with explicit skip/require rules to `router.md` or `agent-behavior.yaml`.

---

## GAP 6 (Moderate) — Frontmatter: Remove `ticket`, Move `architecture_notes` to Doc Body

**Decisions:**
- `ticket` field: remove entirely — not useful for this template.
- `architecture_notes`: remove from frontmatter YAML. Keep the `## Architecture Notes` section already present in every template body.

**Scope of change:**
- `.workflow/schemas/artifact-frontmatter.schema.yaml` — remove `architecture_notes` from required + properties.
- All 7 `template.md` files — remove `architecture_notes:` block from frontmatter YAML.
- All 7 `sections/frontmatter.md` files — remove `architecture_notes:` block from YAML example.
- All skill `output-schema.md` files — update to reference the doc-body section, not frontmatter.
- Skill `SKILL.md` files referencing frontmatter `architecture_notes` — update to reference doc body.
- Validators (`check-artifacts.mjs`, `check-template-contracts.mjs`, `check-lifecycle.mjs`) — remove frontmatter role checks; add body-section presence check instead.
- All example artifacts — remove `architecture_notes:` from frontmatter.
- `docs/artifact-contract.md` — update frontmatter spec.

---

## GAP 7 (Minor) — No Source Priority / Context Loading Order in AGENTS.md

**Decision:** Defer to a later pass — minimal touch only in this round.

---

## GAP 8 (Minor) — Build Phase Sub-Versioning (`-p<P>`) Not Documented

**What source had:** Artifact naming allowed `<slug>-v<N>-p<P>.md` for multi-phase Build splits.

**What agentsmyth has:** Only `<slug>-v<N>.md` is documented. No mention of `-p<P>` anywhere.

**What's needed:**
- Add the `-p<P>` naming convention to `lifecycle.md` under the Build row.
- Add a note to the task template `sections/frontmatter.md`.

---

## Summary Table

| # | Gap | Severity | Status | File(s) Affected |
|---|---|---|---|---|
| 1 | No setup/port skill (`setup/` dir, excluded from copy) | Critical | Done | `setup/SKILL.md`, `setup/references/`, `README.md` |
| 2 | No knowledge-map template (repo-mental-map only) | Critical | Done | `docs/knowledge-map/repo-mental-map.md` |
| 3 | No `product` artifact template | ~~Moderate~~ | Dropped | — |
| 4 | `lifecycle-orchestrator` missing exemplar + rename | Moderate | Done | `.workflow/skills/lifecycle-orchestrator/references/` |
| 5 | No task class (Trivial/Standard/Complex) defined | Moderate | Done | `.workflow/router.md`, `.workflow/config/agent-behavior.yaml` |
| 6 | Remove `ticket` + move `architecture_notes` to body | Moderate | Done | Schema, templates, validators, examples |
| 7 | No source priority / lazy-load order in AGENTS.md | Minor | Deferred | `AGENTS.md` |
| 8 | Build sub-versioning (`-p<P>`) not documented | Minor | Done | `.workflow/lifecycle.md`, task frontmatter section |

---

## Not Gaps (Intentional Differences)

- No `repos/` directory — single-repo design is intentional.
- No `workspace-status.mjs` for child repos — not applicable.
- No Notion connector required — opt-in via source-of-truth config.
- No Codex-only constraint — agentsmyth is tool-agnostic by design.
- Richer reference files per skill — agentsmyth has more references than source; this is an improvement, not a gap.
