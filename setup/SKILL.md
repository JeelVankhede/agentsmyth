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

### Phase 4 — Confirm

Show the user a summary of what was written. List any `<TODO>` placeholders that still need their input. Ask the user to review one config file at a time if they want to verify.

## Stop Conditions

Stop and ask when:

- A required piece of information is not available from inspection or prior answers.
- The user's answer contradicts an earlier answer or what was found in the repo.
- A config file already has non-placeholder values (do not overwrite without confirmation).

## Output

No lifecycle artifact is created. Report to the user:

- What was inspected (brief bullet list).
- What was written (file list with one-line summary of changes).
- What is still pending (any `<TODO>` items that need follow-up).
