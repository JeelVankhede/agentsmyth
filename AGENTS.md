# agentsmyth Agent Router

Use `.workflow/` as the canonical workflow source.

When working in the repository:

1. Read `.workflow/router.md` first.
2. Load `.workflow/config/agent-behavior.yaml`.
3. Select the lifecycle phase from `.workflow/lifecycle.md`.
4. Use the matching skill under `.workflow/skills/`.
5. Write durable artifacts under `.workflow/artifacts/` for Standard or Complex work.

Do not treat adapter files, generated summaries, or chat history as a competing source of workflow truth.

## Source Priority

When sources conflict, resolve in this order. A higher source overrides a lower one.

1. The current user request and any answer the user gives to a blocker.
2. `.workflow/` — canonical workflow rules, lifecycle order, phase contracts, and config.
3. Configured external sources in `.workflow/config/source-of-truth.yaml` — requirements and decisions, when a provider is configured and the request depends on it.
4. `docs/knowledge-map/repo-mental-map.md` — repo orientation: purpose, key paths, protected paths, verification defaults, planning rules.
5. The repository code and existing lifecycle artifacts for the active slug.

Never let adapter files, generated output, or chat memory override any of the above. When a higher source is silent, fall to the next; do not invent state.

## Context Loading Order

Load the minimum needed for the current phase. Do not bulk-load every file.

Always load before lifecycle work:

1. This file (`AGENTS.md`).
2. `.workflow/router.md`.
3. `.workflow/config/agent-behavior.yaml`.

Load on demand:

- `docs/knowledge-map/repo-mental-map.md` when orienting in a fresh session or when paths, verification defaults, or planning rules matter.
- `.workflow/lifecycle.md` and the relevant `.workflow/skills/<phase>/SKILL.md` when entering a phase.
- `.workflow/config/*.yaml` (domain, repo-profile, source-of-truth, verification, release) only when that phase's decisions depend on it.
- `.workflow/skills/restore-context/SKILL.md` before resuming an existing slug, recovering after interruption, or processing a user answer to a blocker.
- Existing artifacts under `.workflow/artifacts/` only for the active slug and version.
- Repository code only when the phase requires implementation, review, verification, or source inspection.
