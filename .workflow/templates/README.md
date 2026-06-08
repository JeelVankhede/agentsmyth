# Workflow Templates

These templates define the durable artifact chain used by the lifecycle skills:

```text
brief -> plan -> task -> review -> verify -> ship -> reflect
```

Each artifact template is fillable Markdown with YAML frontmatter. Agents should copy the relevant `template.md` into `.workflow/artifacts/<kind>/<slug>-v<N>.md`, preserve the section order, and fill every required evidence field.

Rules:

- Keep `.workflow/` as the canonical workflow source.
- Preserve `slug` and `version` across the artifact chain.
- Keep `manifest_ids` aligned with active `R` and `RI` IDs.
- Mirror blocking `Q` IDs and failed gates in `orchestration.blockers`.
- Use the `## Architecture Notes` body section to preserve role decisions, constraints, tradeoffs, assumptions, and downstream impact.
- Do not claim commands, PRs, CI, releases, source updates, or external handoffs without evidence.
- Treat skipped checks and waivers as risk, not success.
