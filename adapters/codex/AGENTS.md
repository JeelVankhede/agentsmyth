# Codex Adapter

Use `.workflow/` as canonical.

Before doing lifecycle work:

1. Read `.workflow/router.md`.
2. Load `.workflow/config/agent-behavior.yaml`.
3. Use `.workflow/lifecycle.md` to select the current phase.
4. Follow the matching skill in `.workflow/skills/`.

For Standard or Complex work, write durable artifacts under `.workflow/artifacts/` using `.workflow/templates/`.

Preserve unrelated changes. Do not claim command results, source updates, PR/CI, release, deployment, or handoff completion without evidence.
