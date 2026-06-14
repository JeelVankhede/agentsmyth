---
name: setup
description: One-time porting skill. Run this skill once, pointed at a new target repository, to interview the user and populate the lifecycle workflow configs for that repo.
---

# Setup Skill

## Purpose

This skill sets up a new target repository to use the agentsmyth lifecycle workflow. It is a one-time operation: inspect the target repo, interview the user, then write the config files that make every other lifecycle skill work correctly.

This skill lives in `setup/` and is **not** copied to the target repository.

## Context Loading

Load only:

1. This file.
2. `setup/references/inspection-checklist.md`
3. `setup/references/config-map.md`

Do not load any `.workflow/` skill files. Those belong to the target repo after setup is complete.

## When To Run

Run this skill when:

- A new repository is being set up for the first time.
- The user says "set up this repo" or "port the workflow to this repo."
- The `.workflow/config/` files contain only placeholder values from the template.

Do not run this skill on a repo that already has a populated `docs/knowledge-map/repo-mental-map.md` and non-placeholder config files — inspect first and confirm with the user.

## Inputs

- The target repository root path or current working directory.
- User answers to interview questions.

## Workflow

### Phase 1 — Inspect

Before asking any questions, read the target repo to form a starting picture. Follow `setup/references/inspection-checklist.md`.

Concisely summarise what you found and confirm with the user before moving on. Do not assume; flag gaps.

### Phase 2 — Interview

Ask the user questions in small batches (2–4 at a time). Do not ask all questions at once. Use the answers from each batch to inform the next batch — earlier answers may make later questions irrelevant.

Use `setup/references/config-map.md` to know which interview answers populate which config fields.

Interview topic order:

1. Repo identity: name, primary purpose, primary user/consumer.
2. Source-of-truth: where are requirements tracked? Where are decisions recorded?
3. Key paths: what are the most important directories and what lives in each?
4. Protected paths: what must never be changed without explicit approval?
5. Verification: what commands confirm the repo is healthy? (build, test, lint)
6. Branch and release policy: how does code reach production? Any release gating?
7. Domain: industry, regulated environment, key glossary terms.
8. Risks and non-goals: what must the AI agent never do in this repo?
9. Agent tool: which AI agent tool will be used in this repo day-to-day?
   Options: Claude Code, Codex (AGENTS.md), Copilot, Cursor, Windsurf, Other.
   Record the answer — it determines where the adapter gets placed in Phase 5.

### Phase 3 — Write Configs

Using the interview answers and the mapping in `setup/references/config-map.md`, write or update these files in the target repo:

| File | What it controls |
|---|---|
| `.workflow/config/domain.yaml` | Domain name, summary, glossary, constraints |
| `.workflow/config/repo-profile.yaml` | Repo structure, branch policy, key paths |
| `.workflow/config/source-of-truth.yaml` | Requirement and decision tracking locations |
| `.workflow/config/verification.yaml` | Verification commands, evidence requirements |
| `.workflow/config/release.yaml` | Release process, deployment, rollback policy |
| `docs/knowledge-map/repo-mental-map.md` | Human-readable orientation map |

Replace all `<PLACEHOLDER>` values. Do not invent values the user did not provide — leave a clearly marked `<TODO: describe X>` instead.

Note: `.workflow/config/agent-behavior.yaml` is shipped as a workflow invariant (it encodes lifecycle task classes, artifact chain, evidence policy, and waiver schema) and is **not** written or edited by setup. A consumer should rarely need to modify it.

### Phase 4 — Verify

Run both validators before touching anything else. Both must exit cleanly. There are no waivers during setup.

```bash
node .agentsmyth/validators/check-setup-complete.mjs
node .agentsmyth/validators/check-config.mjs
```

**If either validator fails:**
- Read the error output carefully.
- Fix the root cause in the config file(s).
- Re-run the validator.
- Do not proceed to Phase 5 until both pass.
- Do not re-run and claim pass without actually fixing what failed.
- `<USER-TODO>` items are warnings, not failures — they are values the user explicitly said they do not know yet. Do not invent values to clear them.

**Waivers are not permitted during setup.** There is no waiver field in setup output. Every check must pass before Phase 5 begins.

### Phase 5 — Copy and Cleanup

Expand the workflow into the repo root, handle collisions, then remove the isolated directory.

#### Step 5a — Copy static assets

For each item in `.agentsmyth/assets/`, apply the collision rule:

| Target path | Rule |
|---|---|
| `.workflow/config/` (no existing populated configs) | Copy placeholder YAMLs — agent already filled them in Phase 3, so this is a no-op (configs were written directly to `.workflow/config/`) |
| `AGENTS.md` does not exist | Copy `.agentsmyth/assets/AGENTS.md` to repo root |
| `AGENTS.md` exists | Read the existing file. Append the agentsmyth section from `.agentsmyth/assets/AGENTS.md` under a `## agentsmyth Workflow` heading. Never overwrite. |
| `adapters/` does not exist | Copy `.agentsmyth/assets/adapters/` to repo root |
| `adapters/<tool>/` exists | Copy only missing subdirs. Skip what is already there. |
| `docs/knowledge-map/` does not exist | Create it and write `repo-mental-map.md` (already written in Phase 3) |
| `docs/knowledge-map/repo-mental-map.md` exists | Confirm with user before overwriting |

#### Step 5a.1 — Place adapter at tool-native path

Based on the agent tool recorded in Phase 2 interview question 9, place the adapter at the path the tool reads automatically:

| Agent tool | Source adapter | Target path in repo | Notes |
|---|---|---|---|
| Claude Code | `adapters/claude/CLAUDE.md` | `.claude/CLAUDE.md` | Create `.claude/` if missing. If `.claude/CLAUDE.md` exists, append agentsmyth gate under a `## agentsmyth` heading. |
| Codex | `adapters/codex/AGENTS.md` | `AGENTS.md` (root) | Handled by Step 5a above — AGENTS.md placement already covers this. |
| Copilot | `adapters/copilot/copilot-instructions.md` | `.github/copilot-instructions.md` | Create `.github/` if missing. Append if file exists. |
| Cursor | `adapters/cursor/rules/index.mdc` | `.cursor/rules/agentsmyth.mdc` | Create `.cursor/rules/` if missing. |
| Windsurf | `adapters/windsurf/.windsurfrules` | `.windsurfrules` (root) | Append if file exists. |
| Other / Unknown | `adapters/claude/CLAUDE.md` | Ask user where their agent reads instructions from, then place it there. |

This step is what enforces the workflow gate. Without the adapter at the tool-native path, the agent will not load the mandatory gate instructions on session start.

#### Step 5b — Expand workflow bundle

Read `.agentsmyth/workflow-bundle.md`. For each `<!-- FILE: <path> -->` block, write the content to that path relative to the repo root. Create parent directories as needed.

Do not expand files under `.workflow/config/` — those were already written by the agent in Phase 3.

After expansion, the following must exist in the repo:

- `.workflow/router.md`
- `.workflow/lifecycle.md`
- `.workflow/rules.md`
- `.workflow/glossary.md`
- `.workflow/skills/` (full skill tree)
- `.workflow/validators/` (all validator scripts)
- `.workflow/schemas/` (all schema files)
- `.workflow/artifacts/` (empty phase dirs)
- `.workflow/learnings/` (README and sessions dir)

#### Step 5c — Produce copy-log

Before removing `.agentsmyth/`, output a one-line summary for each file written or skipped:

```
copied   .workflow/router.md
copied   .workflow/lifecycle.md
...
skipped  AGENTS.md (exists — appended agentsmyth section instead)
```

Show the log to the user and wait for acknowledgement before proceeding.

#### Step 5d — Remove isolated directory

Delete `.agentsmyth/` in its entirety. This is the final step.

```bash
rm -rf .agentsmyth
```

## Stop Conditions

Stop and ask when:

- A required piece of information is not available from inspection or prior answers.
- The user's answer contradicts an earlier answer or what was found in the repo.
- A config file already has non-placeholder values (do not overwrite without confirmation).
- A validator fails and the fix is not clear from the error output.

## Output

No lifecycle artifact is created. Report to the user:

- What was inspected (brief bullet list).
- What was written (file list with one-line summary of changes).
- What is still pending (any `<USER-TODO>` items that need follow-up).
- Confirmation that `.agentsmyth/` was removed.
