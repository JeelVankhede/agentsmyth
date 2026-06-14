# Agent Router

This repository uses the agentsmyth lifecycle workflow.

## Setup (if `.agentsmyth/` exists)

Read `.agentsmyth/setup-bundle.md` and run the setup skill.
Do not begin lifecycle work until setup is complete and `.agentsmyth/` has been removed.

## Lifecycle Work

When `.agentsmyth/` does not exist, the workflow is ready. Follow this order:

1. Read `.workflow/router.md`.
2. Load `.workflow/config/agent-behavior.yaml`.
3. Select the lifecycle phase from `.workflow/lifecycle.md`.
4. Use the matching skill under `.workflow/skills/`.
5. Write durable artifacts under `.workflow/artifacts/` for Standard or Complex work.

Do not treat adapter files, generated summaries, or chat history as a competing source of workflow truth.

## Source Priority

When sources conflict, resolve in this order:

1. The current user request and any answer the user gives to a blocker.
2. `.workflow/` — canonical workflow rules, lifecycle order, phase contracts, and config.
3. Configured external sources in `.workflow/config/source-of-truth.yaml` — when a provider is configured and the request depends on it.
4. `docs/knowledge-map/repo-mental-map.md` — repo orientation: purpose, key paths, protected paths, verification defaults.
5. The repository code and existing lifecycle artifacts for the active slug.
