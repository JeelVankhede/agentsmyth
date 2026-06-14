# Agentsmyth Workflow Gate (MANDATORY)

Before any implementation work — no exceptions:

1. **Check for `.agentsmyth/`** — if it exists, read `.agentsmyth/setup-bundle.md` and run the setup skill. Do not proceed to step 2 until setup is complete and `.agentsmyth/` is removed.

2. **Read `.workflow/router.md`** — this is the canonical entry point for all lifecycle work.

3. **Load `.workflow/config/agent-behavior.yaml`** — classify the request:
   - `trivial` → handle inline, no artifact required
   - `standard` → full lifecycle required: think → plan → build → review → ship → reflect
   - `complex` → all phases required including test; no phases may be skipped

4. **Route using `.workflow/lifecycle.md`** — select the current phase. If resuming, use the `restore-context` skill first. Never resume from chat memory alone.

5. **Write a brief artifact before any implementation** — for Standard or Complex work, create `.workflow/artifacts/briefs/<slug>-v1.md` using the Starter Block in `.workflow/skills/lifecycle-think/references/output-schema.md`. Do not write code before the brief is complete and the user has approved it.

6. **Gate every phase transition on artifact status** — do not proceed to the next phase unless the current artifact has `status: ready-for-next-phase`. Missing artifacts or wrong status are blockers, not warnings.

7. **Require evidence for every claim** — command results, test output, and source references must appear in the artifact. Do not claim a check passed without showing output.

**Bypass is not permitted.** If you cannot follow a phase (missing info, blocker, uncertainty), pause and surface the blocker. Do not skip ahead or work inline on Standard/Complex tasks.

Preserve unrelated changes. Never stage changes outside approved scope.
